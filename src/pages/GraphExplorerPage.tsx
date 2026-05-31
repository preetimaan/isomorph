import { useMemo, useState } from "react";
import { Layout } from "@/components/Layout";
import { GraphCanvas } from "@/components/GraphCanvas";
import { useGraph } from "@/context/useGraph";
import { getFilteredSubgraph, type NodeType, type RelationshipType } from "@/graph";

const NODE_TYPE_OPTIONS: NodeType[] = [
  "responsibility",
  "technology",
  "ecosystem",
];

const EDGE_TYPE_OPTIONS: RelationshipType[] = [
  "fulfills",
  "alternative_to",
  "commonly_paired",
  "belongs_to",
  "depends_on",
];

export function GraphExplorerPage() {
  const { graph } = useGraph();
  const [selectedNodeTypes, setSelectedNodeTypes] = useState<NodeType[]>([
    ...NODE_TYPE_OPTIONS,
  ]);
  const [selectedEdgeTypes, setSelectedEdgeTypes] = useState<RelationshipType[]>([
    ...EDGE_TYPE_OPTIONS,
  ]);

  const subgraph = useMemo(
    () =>
      getFilteredSubgraph(graph, {
        nodeTypes: selectedNodeTypes,
        edgeTypes: selectedEdgeTypes,
      }),
    [graph, selectedEdgeTypes, selectedNodeTypes],
  );

  function toggleNodeType(type: NodeType) {
    setSelectedNodeTypes((current) =>
      current.includes(type)
        ? current.filter((item) => item !== type)
        : [...current, type],
    );
  }

  function toggleEdgeType(type: RelationshipType) {
    setSelectedEdgeTypes((current) =>
      current.includes(type)
        ? current.filter((item) => item !== type)
        : [...current, type],
    );
  }

  return (
    <Layout>
      <section className="panel">
        <h2>Graph explorer</h2>
        <p className="browse-description">
          Click a node to open its detail page. Filter by node and relationship
          types.
        </p>

        <div className="filter-group">
          <h3>Node types</h3>
          <div className="filter-options">
            {NODE_TYPE_OPTIONS.map((type) => (
              <label key={type} className="filter-chip">
                <input
                  type="checkbox"
                  checked={selectedNodeTypes.includes(type)}
                  onChange={() => toggleNodeType(type)}
                />
                {type}
              </label>
            ))}
          </div>
        </div>

        <div className="filter-group">
          <h3>Relationship types</h3>
          <div className="filter-options">
            {EDGE_TYPE_OPTIONS.map((type) => (
              <label key={type} className="filter-chip">
                <input
                  type="checkbox"
                  checked={selectedEdgeTypes.includes(type)}
                  onChange={() => toggleEdgeType(type)}
                />
                {type.replaceAll("_", " ")}
              </label>
            ))}
          </div>
        </div>

        <ul className="stats">
          <li>{subgraph.nodes.length} nodes</li>
          <li>{subgraph.edges.length} edges</li>
        </ul>
        {selectedEdgeTypes.length === 0 ? (
          <p className="empty-state">
            No relationship types selected — edges are hidden.
          </p>
        ) : null}
        {selectedNodeTypes.length === 0 ? (
          <p className="empty-state">No node types selected.</p>
        ) : null}
      </section>

      <section className="panel graph-panel">
        <GraphCanvas subgraph={subgraph} height={520} />
      </section>
    </Layout>
  );
}
