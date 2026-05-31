import { Link } from "react-router-dom";
import { nodeRoute } from "@/graph";
import type { GraphNode } from "@/graph";

interface NodeLinkProps {
  node: GraphNode;
  className?: string;
}

export function NodeLink({ node, className }: NodeLinkProps) {
  return (
    <Link to={nodeRoute(node)} className={className ?? "node-link"}>
      <span className="node-type">{node.type}</span>
      <span>{node.name}</span>
    </Link>
  );
}
