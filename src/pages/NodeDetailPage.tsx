import { Link } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { NodeMeta } from "@/components/NodeMeta";
import { RelationshipSections } from "@/components/RelationshipSection";
import { useGraph } from "@/context/useGraph";
import { getNode, getRelatedEdges, type NodeType } from "@/graph";
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

      <RelationshipSections edges={edges} />
    </Layout>
  );
}
