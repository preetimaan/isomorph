import { SYMMETRIC_RELATIONSHIP_TYPES } from "@/content/relationships";
import type { GraphNode, RelatedEdge, RelationshipType } from "@/graph";
import { NodeLink } from "./NodeLink";

const RELATIONSHIP_LABELS: Record<
  RelationshipType,
  { outgoing: string; incoming: string }
> = {
  fulfills: {
    outgoing: "Fulfills",
    incoming: "Implemented by",
  },
  alternative_to: {
    outgoing: "Alternatives",
    incoming: "Alternatives",
  },
  commonly_paired: {
    outgoing: "Commonly paired with",
    incoming: "Commonly paired with",
  },
  belongs_to: {
    outgoing: "Belongs to",
    incoming: "Includes",
  },
  depends_on: {
    outgoing: "Depends on",
    incoming: "Depended on by",
  },
  replaces: {
    outgoing: "Replaces",
    incoming: "Replaced by",
  },
};

function groupEdges(edges: RelatedEdge[]) {
  const outgoing = edges.filter((edge) => edge.direction === "outgoing");
  const incoming = edges.filter((edge) => edge.direction === "incoming");
  return { outgoing, incoming };
}

function EdgeList({
  label,
  edges,
}: {
  label: string;
  edges: RelatedEdge[];
}) {
  if (!edges.length) {
    return null;
  }

  return (
    <div className="relationship-group">
      <h3>{label}</h3>
      <ul className="relationship-list">
        {edges.map(({ edge, relatedNode }) => (
          <li key={`${edge.type}-${edge.from}-${edge.to}-${relatedNode.id}`}>
            <NodeLink node={relatedNode} />
            {edge.notes ? <p className="edge-note">{edge.notes}</p> : null}
          </li>
        ))}
      </ul>
    </div>
  );
}

export function RelationshipSections({
  edges,
}: {
  edges: RelatedEdge[];
}) {
  const relationshipOrder: RelationshipType[] = [
    "fulfills",
    "belongs_to",
    "alternative_to",
    "commonly_paired",
    "depends_on",
    "replaces",
  ];

  const byType = new Map<RelationshipType, RelatedEdge[]>();

  for (const edge of edges) {
    const existing = byType.get(edge.edge.type) ?? [];
    existing.push(edge);
    byType.set(edge.edge.type, existing);
  }

  const sections = relationshipOrder
    .filter((type) => byType.has(type))
    .map((type) => {
      const typeEdges = byType.get(type);
      if (!typeEdges) {
        return null;
      }

      const labels = RELATIONSHIP_LABELS[type];
      const isSymmetric = SYMMETRIC_RELATIONSHIP_TYPES.includes(type);

      if (isSymmetric) {
        return (
          <section key={type} className="panel">
            <h2>{type.replaceAll("_", " ")}</h2>
            <p className="edge-note">
              Bidirectional — stored once in data, but applies both ways.
            </p>
            <EdgeList label={labels.outgoing} edges={typeEdges} />
          </section>
        );
      }

      const { outgoing, incoming } = groupEdges(typeEdges);

      return (
        <section key={type} className="panel">
          <h2>{type.replaceAll("_", " ")}</h2>
          <EdgeList label={labels.outgoing} edges={outgoing} />
          <EdgeList label={labels.incoming} edges={incoming} />
        </section>
      );
    })
    .filter((section): section is JSX.Element => section !== null);

  if (!sections.length) {
    return (
      <section className="panel">
        <p className="empty-state">No relationships recorded yet.</p>
      </section>
    );
  }

  return <>{sections}</>;
}

export function NodeListSection({
  title,
  nodes,
}: {
  title: string;
  nodes: GraphNode[];
}) {
  if (!nodes.length) {
    return (
      <section className="panel">
        <h2>{title}</h2>
        <p className="empty-state">Nothing recorded yet.</p>
      </section>
    );
  }

  return (
    <section className="panel">
      <h2>{title}</h2>
      <ul className="relationship-list">
        {nodes.map((node) => (
          <li key={node.id}>
            <NodeLink node={node} />
          </li>
        ))}
      </ul>
    </section>
  );
}
