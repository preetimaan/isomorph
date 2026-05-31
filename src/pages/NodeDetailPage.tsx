import { Link } from "react-router-dom";
import { AlternativesPanel } from "@/components/AlternativesPanel";
import { GraphCanvas } from "@/components/GraphCanvas";
import { Layout } from "@/components/Layout";
import { NodeMeta } from "@/components/NodeMeta";
import { NodeListSection, RelationshipSections } from "@/components/RelationshipSection";
import { useGraph } from "@/context/useGraph";
import {
  getEcosystemSubgraph,
  getEcosystemsForTechnology,
  getNode,
  getRelatedEdges,
  getResponsibilitiesForTechnology,
  type NodeType,
} from "@/graph";
import { NotFoundPage } from "./NotFoundPage";

interface NodeDetailPageProps {
  nodeType: NodeType;
  id: string;
}

export function NodeDetailPage({ nodeType, id }: NodeDetailPageProps) {
  const { graph } = useGraph();
  const node = getNode(graph, id);

  if (!node || node.type !== nodeType) {
    return <NotFoundPage />;
  }

  const edges = getRelatedEdges(graph, id);
  const ecosystemSubgraph =
    node.type === "ecosystem" ? getEcosystemSubgraph(graph, id) : null;
  const fulfills =
    node.type === "technology"
      ? getResponsibilitiesForTechnology(graph, id)
      : [];
  const belongsTo =
    node.type === "technology"
      ? getEcosystemsForTechnology(graph, id)
      : [];
  const relationshipEdges =
    node.type === "technology"
      ? edges.filter(
          (item) =>
            !["fulfills", "belongs_to", "alternative_to"].includes(
              item.edge.type,
            ),
        )
      : edges;
  const showRelationshipsSection =
    node.type === "technology" ? relationshipEdges.length > 0 : true;

  return (
    <Layout>
      <nav className="breadcrumb">
        <Link to="/" className="text-link">
          Home
        </Link>
        <span aria-hidden="true">/</span>
        <span>{node.type}</span>
        <span aria-hidden="true">/</span>
        <span>{node.name}</span>
      </nav>

      <section className="panel">
        <NodeMeta node={node} />
      </section>

      {node.type === "technology" ? (
        <>
          <section className="panel">
            <h2>Where it fits</h2>
            <div className="compare-columns">
              <div className="compare-column">
                <div className="stack-section">
                  <NodeListSection title="Belongs to" nodes={belongsTo} />
                </div>
              </div>
              <div className="compare-column">
                <div className="stack-section">
                  <NodeListSection title="Fulfills" nodes={fulfills} />
                </div>
              </div>
            </div>
          </section>
          <AlternativesPanel technologyId={node.id} />
        </>
      ) : null}

      {ecosystemSubgraph ? (
        <section className="panel graph-panel">
          <div className="section-header">
            <div>
              <h2>Ecosystem map</h2>
              <p className="browse-description">
                Technologies, responsibilities, and relationships in this
                ecosystem.
              </p>
            </div>
            <Link to="/graph" className="text-link">
              View full graph
            </Link>
          </div>
          <GraphCanvas subgraph={ecosystemSubgraph} height={460} />
        </section>
      ) : null}

      {showRelationshipsSection ? (
        <RelationshipSections edges={relationshipEdges} />
      ) : null}
    </Layout>
  );
}
