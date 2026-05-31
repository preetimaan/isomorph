import { z } from "zod";

export const NodeTypeSchema = z.enum([
  "responsibility",
  "technology",
  "ecosystem",
]);

export const MaturitySchema = z.enum(["learning", "comfortable", "expert"]);

export const BaseNodeSchema = z.object({
  id: z
    .string()
    .regex(/^[a-z0-9-]+$/, "id must be a lowercase slug"),
  type: NodeTypeSchema,
  name: z.string().min(1),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  maturity: MaturitySchema.optional(),
  notes: z.string().optional(),
  sources: z.array(z.string().url()).optional(),
});

export const RelationshipTypeSchema = z.enum([
  "fulfills",
  "alternative_to",
  "commonly_paired",
  "belongs_to",
  "depends_on",
  "replaces",
]);

export const EdgeSchema = z.object({
  from: z.string(),
  to: z.string(),
  type: RelationshipTypeSchema,
  weight: z.number().min(0).max(1).optional(),
  notes: z.string().optional(),
});

export const RelationshipsFileSchema = z.object({
  relationships: z.array(EdgeSchema),
});

export const GraphDataSchema = z.object({
  nodes: z.array(BaseNodeSchema),
  edges: z.array(EdgeSchema),
});

export type NodeType = z.infer<typeof NodeTypeSchema>;
export type Maturity = z.infer<typeof MaturitySchema>;
export type GraphNode = z.infer<typeof BaseNodeSchema>;
export type RelationshipType = z.infer<typeof RelationshipTypeSchema>;
export type GraphEdge = z.infer<typeof EdgeSchema>;
export type GraphData = z.infer<typeof GraphDataSchema>;

const SYMMETRIC_EDGE_TYPES: RelationshipType[] = ["alternative_to"];
const TECHNOLOGY_TO_RESPONSIBILITY: RelationshipType[] = ["fulfills"];
const TECHNOLOGY_TO_ECOSYSTEM: RelationshipType[] = ["belongs_to"];
const TECHNOLOGY_TO_TECHNOLOGY: RelationshipType[] = [
  "alternative_to",
  "commonly_paired",
  "depends_on",
  "replaces",
];

export interface GraphValidationIssue {
  path: string;
  message: string;
}

export interface GraphValidationResult {
  ok: boolean;
  issues: GraphValidationIssue[];
  stats: {
    nodes: number;
    edges: number;
    byType: Record<NodeType, number>;
    technologiesPerResponsibility: Record<string, number>;
  };
}

function nodeTypeById(nodes: GraphNode[]): Map<string, NodeType> {
  return new Map(nodes.map((node) => [node.id, node.type]));
}

function addIssue(
  issues: GraphValidationIssue[],
  path: string,
  message: string,
): void {
  issues.push({ path, message });
}

export function validateGraphData(data: GraphData): GraphValidationResult {
  const issues: GraphValidationIssue[] = [];
  const nodeTypes = nodeTypeById(data.nodes);
  const nodeIds = new Set(data.nodes.map((node) => node.id));

  const idCounts = new Map<string, number>();
  for (const node of data.nodes) {
    idCounts.set(node.id, (idCounts.get(node.id) ?? 0) + 1);
    if (node.id.includes("_")) {
      addIssue(
        issues,
        `nodes/${node.id}`,
        "id should use hyphens, not underscores",
      );
    }
    if (node.id !== node.id.toLowerCase()) {
      addIssue(issues, `nodes/${node.id}`, "id must be lowercase");
    }
  }

  for (const [id, count] of idCounts) {
    if (count > 1) {
      addIssue(issues, `nodes/${id}`, `duplicate node id (${count} occurrences)`);
    }
  }

  for (const edge of data.edges) {
    const edgePath = `relationships/${edge.from}->${edge.to}:${edge.type}`;

    if (!nodeIds.has(edge.from)) {
      addIssue(issues, edgePath, `unknown from node: ${edge.from}`);
    }
    if (!nodeIds.has(edge.to)) {
      addIssue(issues, edgePath, `unknown to node: ${edge.to}`);
    }

    const fromType = nodeTypes.get(edge.from);
    const toType = nodeTypes.get(edge.to);

    if (fromType && toType) {
      validateEdgeSemantics(edge, fromType, toType, edgePath, issues);
    }

    if (
      edge.type === "alternative_to" &&
      edge.from.localeCompare(edge.to) >= 0
    ) {
      addIssue(
        issues,
        edgePath,
        "alternative_to edges must be stored once with from < to (alphabetically)",
      );
    }
  }

  const byType: Record<NodeType, number> = {
    responsibility: 0,
    technology: 0,
    ecosystem: 0,
  };

  for (const node of data.nodes) {
    byType[node.type] += 1;
  }

  const technologiesPerResponsibility: Record<string, number> = {};
  for (const edge of data.edges) {
    if (edge.type !== "fulfills") {
      continue;
    }
    technologiesPerResponsibility[edge.to] =
      (technologiesPerResponsibility[edge.to] ?? 0) + 1;
  }

  return {
    ok: issues.length === 0,
    issues,
    stats: {
      nodes: data.nodes.length,
      edges: data.edges.length,
      byType,
      technologiesPerResponsibility,
    },
  };
}

function validateEdgeSemantics(
  edge: GraphEdge,
  fromType: NodeType,
  toType: NodeType,
  edgePath: string,
  issues: GraphValidationIssue[],
): void {
  switch (edge.type) {
    case "fulfills":
      if (fromType !== "technology" || toType !== "responsibility") {
        addIssue(
          issues,
          edgePath,
          "fulfills must connect technology -> responsibility",
        );
      }
      break;
    case "belongs_to":
      if (fromType !== "technology" || toType !== "ecosystem") {
        addIssue(
          issues,
          edgePath,
          "belongs_to must connect technology -> ecosystem",
        );
      }
      break;
    case "alternative_to":
    case "commonly_paired":
    case "depends_on":
    case "replaces":
      if (fromType !== "technology" || toType !== "technology") {
        addIssue(
          issues,
          edgePath,
          `${edge.type} must connect technology -> technology`,
        );
      }
      break;
    default:
      break;
  }

  if (
    fromType === "responsibility" &&
    !TECHNOLOGY_TO_RESPONSIBILITY.includes(edge.type) &&
    edge.type !== "fulfills"
  ) {
    addIssue(
      issues,
      edgePath,
      "responsibilities cannot be edge sources except as fulfills targets",
    );
  }

  if (
    toType === "ecosystem" &&
    !TECHNOLOGY_TO_ECOSYSTEM.includes(edge.type)
  ) {
    addIssue(
      issues,
      edgePath,
      "ecosystems can only be targets of belongs_to edges",
    );
  }

  if (
    fromType === "technology" &&
    toType === "technology" &&
    !TECHNOLOGY_TO_TECHNOLOGY.includes(edge.type)
  ) {
    addIssue(
      issues,
      edgePath,
      `invalid technology -> technology edge type: ${edge.type}`,
    );
  }

  if (SYMMETRIC_EDGE_TYPES.includes(edge.type) && edge.from === edge.to) {
    addIssue(issues, edgePath, `${edge.type} cannot be a self-loop`);
  }
}

export function getAlternatives(
  graph: GraphData,
  technologyId: string,
): GraphNode[] {
  const alternativeIds = new Set<string>();

  for (const edge of graph.edges) {
    if (edge.type !== "alternative_to") {
      continue;
    }
    if (edge.from === technologyId) {
      alternativeIds.add(edge.to);
    }
    if (edge.to === technologyId) {
      alternativeIds.add(edge.from);
    }
  }

  return graph.nodes.filter(
    (node) => node.type === "technology" && alternativeIds.has(node.id),
  );
}

export function getTechnologiesForResponsibility(
  graph: GraphData,
  responsibilityId: string,
): GraphNode[] {
  const technologyIds = graph.edges
    .filter(
      (edge) =>
        edge.type === "fulfills" && edge.to === responsibilityId,
    )
    .map((edge) => edge.from);

  return graph.nodes.filter(
    (node) => node.type === "technology" && technologyIds.includes(node.id),
  );
}

export function getNode(graph: GraphData, id: string): GraphNode | undefined {
  return graph.nodes.find((node) => node.id === id);
}

export function searchNodes(graph: GraphData, query: string): GraphNode[] {
  const normalized = query.trim().toLowerCase();
  if (!normalized) {
    return graph.nodes;
  }

  return graph.nodes.filter((node) => {
    const haystack = [
      node.id,
      node.name,
      node.description ?? "",
      ...(node.tags ?? []),
    ]
      .join(" ")
      .toLowerCase();

    return haystack.includes(normalized);
  });
}

export function nodeRoute(node: Pick<GraphNode, "type" | "id">): string {
  return `/${node.type}/${node.id}`;
}

export interface RelatedEdge {
  edge: GraphEdge;
  relatedNode: GraphNode;
  direction: "outgoing" | "incoming";
}

export function getRelatedEdges(
  graph: GraphData,
  nodeId: string,
): RelatedEdge[] {
  const related: RelatedEdge[] = [];

  for (const edge of graph.edges) {
    if (edge.from === nodeId) {
      const relatedNode = getNode(graph, edge.to);
      if (relatedNode) {
        related.push({ edge, relatedNode, direction: "outgoing" });
      }
    }

    if (edge.to === nodeId && edge.from !== nodeId) {
      const relatedNode = getNode(graph, edge.from);
      if (relatedNode) {
        related.push({ edge, relatedNode, direction: "incoming" });
      }
    }
  }

  return related;
}

export function getNodesByType(
  graph: GraphData,
  type: NodeType,
): GraphNode[] {
  return graph.nodes
    .filter((node) => node.type === type)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getTechnologiesForEcosystem(
  graph: GraphData,
  ecosystemId: string,
): GraphNode[] {
  const technologyIds = graph.edges
    .filter(
      (edge) => edge.type === "belongs_to" && edge.to === ecosystemId,
    )
    .map((edge) => edge.from);

  return graph.nodes
    .filter(
      (node) => node.type === "technology" && technologyIds.includes(node.id),
    )
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getResponsibilitiesForTechnology(
  graph: GraphData,
  technologyId: string,
): GraphNode[] {
  const responsibilityIds = graph.edges
    .filter(
      (edge) => edge.type === "fulfills" && edge.from === technologyId,
    )
    .map((edge) => edge.to);

  return graph.nodes
    .filter(
      (node) =>
        node.type === "responsibility" &&
        responsibilityIds.includes(node.id),
    )
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function getEcosystemsForTechnology(
  graph: GraphData,
  technologyId: string,
): GraphNode[] {
  const ecosystemIds = graph.edges
    .filter(
      (edge) => edge.type === "belongs_to" && edge.from === technologyId,
    )
    .map((edge) => edge.to);

  return graph.nodes
    .filter(
      (node) => node.type === "ecosystem" && ecosystemIds.includes(node.id),
    )
    .sort((a, b) => a.name.localeCompare(b.name));
}

export interface GraphSubgraph {
  nodes: GraphNode[];
  edges: GraphEdge[];
}

export interface TechnologyComparison {
  left: GraphNode;
  right: GraphNode;
  sharedResponsibilities: GraphNode[];
  leftOnlyResponsibilities: GraphNode[];
  rightOnlyResponsibilities: GraphNode[];
  areAlternatives: boolean;
}

export interface MigrationPath {
  direction: "replaces" | "replaced_by";
  nodes: GraphNode[];
}

function getFulfilledResponsibilityIds(
  graph: GraphData,
  technologyId: string,
): Set<string> {
  return new Set(
    graph.edges
      .filter(
        (edge) => edge.type === "fulfills" && edge.from === technologyId,
      )
      .map((edge) => edge.to),
  );
}

function nodesByIds(graph: GraphData, ids: Iterable<string>): GraphNode[] {
  const idSet = ids instanceof Set ? ids : new Set(ids);
  return graph.nodes.filter((node) => idSet.has(node.id));
}

export function compareTechnologies(
  graph: GraphData,
  leftId: string,
  rightId: string,
): TechnologyComparison | null {
  const left = getNode(graph, leftId);
  const right = getNode(graph, rightId);

  if (!left || !right || left.type !== "technology" || right.type !== "technology") {
    return null;
  }

  const leftResponsibilities = getFulfilledResponsibilityIds(graph, leftId);
  const rightResponsibilities = getFulfilledResponsibilityIds(graph, rightId);

  const sharedIds = [...leftResponsibilities].filter((id) =>
    rightResponsibilities.has(id),
  );
  const leftOnlyIds = [...leftResponsibilities].filter(
    (id) => !rightResponsibilities.has(id),
  );
  const rightOnlyIds = [...rightResponsibilities].filter(
    (id) => !leftResponsibilities.has(id),
  );

  const areAlternatives = graph.edges.some(
    (edge) =>
      edge.type === "alternative_to" &&
      ((edge.from === leftId && edge.to === rightId) ||
        (edge.from === rightId && edge.to === leftId)),
  );

  return {
    left,
    right,
    sharedResponsibilities: nodesByIds(graph, sharedIds).sort((a, b) =>
      a.name.localeCompare(b.name),
    ),
    leftOnlyResponsibilities: nodesByIds(graph, leftOnlyIds).sort((a, b) =>
      a.name.localeCompare(b.name),
    ),
    rightOnlyResponsibilities: nodesByIds(graph, rightOnlyIds).sort((a, b) =>
      a.name.localeCompare(b.name),
    ),
    areAlternatives,
  };
}

export function getEcosystemSubgraph(
  graph: GraphData,
  ecosystemId: string,
): GraphSubgraph {
  const technologies = getTechnologiesForEcosystem(graph, ecosystemId);
  const nodeIds = new Set<string>([ecosystemId, ...technologies.map((t) => t.id)]);

  for (const edge of graph.edges) {
    if (edge.type === "fulfills" && nodeIds.has(edge.from)) {
      nodeIds.add(edge.to);
    }
    if (edge.type === "belongs_to" && edge.to === ecosystemId) {
      nodeIds.add(edge.from);
    }
  }

  const nodes = graph.nodes.filter((node) => nodeIds.has(node.id));
  const edges = graph.edges.filter(
    (edge) => nodeIds.has(edge.from) && nodeIds.has(edge.to),
  );

  return { nodes, edges };
}

export function getFilteredSubgraph(
  graph: GraphData,
  options: {
    nodeTypes: NodeType[];
    edgeTypes: RelationshipType[];
  },
): GraphSubgraph {
  const { nodeTypes, edgeTypes } = options;

  if (nodeTypes.length === 0) {
    return { nodes: [], edges: [] };
  }

  const nodes = graph.nodes.filter((node) => nodeTypes.includes(node.type));
  const nodeIds = new Set(nodes.map((node) => node.id));

  const edges =
    edgeTypes.length === 0
      ? []
      : graph.edges.filter(
          (edge) =>
            edgeTypes.includes(edge.type) &&
            nodeIds.has(edge.from) &&
            nodeIds.has(edge.to),
        );

  return { nodes, edges };
}

function followReplacementChain(
  graph: GraphData,
  startId: string,
  direction: "replaces" | "replaced_by",
): GraphNode[] {
  const chain: GraphNode[] = [];
  const start = getNode(graph, startId);
  if (!start || start.type !== "technology") {
    return chain;
  }

  chain.push(start);
  const visited = new Set<string>([startId]);
  let currentId: string | undefined = startId;

  while (currentId) {
    const activeId = currentId;
    const nextEdge = graph.edges.find((edge) => {
      if (edge.type !== "replaces") {
        return false;
      }
      if (direction === "replaces") {
        return edge.from === activeId;
      }
      return edge.to === activeId;
    });

    if (!nextEdge) {
      break;
    }

    const nextId =
      direction === "replaces" ? nextEdge.to : nextEdge.from;
    if (visited.has(nextId)) {
      break;
    }

    const nextNode = getNode(graph, nextId);
    if (!nextNode) {
      break;
    }

    chain.push(nextNode);
    visited.add(nextId);
    currentId = nextId;
  }

  return chain;
}

export function getMigrationPaths(
  graph: GraphData,
  technologyId: string,
): MigrationPath[] {
  const replaces = followReplacementChain(graph, technologyId, "replaces");
  const replacedBy = followReplacementChain(graph, technologyId, "replaced_by");

  const paths: MigrationPath[] = [];

  if (replaces.length > 1) {
    paths.push({ direction: "replaces", nodes: replaces });
  }
  if (replacedBy.length > 1) {
    paths.push({ direction: "replaced_by", nodes: replacedBy });
  }

  return paths;
}

export function getAlternativeEdgeNotes(
  graph: GraphData,
  leftId: string,
  rightId: string,
): string | undefined {
  const edge = graph.edges.find(
    (item) =>
      item.type === "alternative_to" &&
      ((item.from === leftId && item.to === rightId) ||
        (item.from === rightId && item.to === leftId)),
  );

  return edge?.notes;
}
