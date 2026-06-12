import { Link } from "react-router-dom";
import { useKnownTechnologies } from "@/context/useKnownTechnologies";
import { nodeRoute } from "@/graph";
import type { GraphNode } from "@/graph";

interface NodeLinkProps {
  node: GraphNode;
  className?: string;
  known?: boolean;
}

function linkClassName(
  node: GraphNode,
  className: string | undefined,
  known: boolean | undefined,
): string {
  const classes = [className ?? "node-link"];

  if (node.type === "technology" && known !== undefined) {
    classes.push(known ? "node-link--technology-known" : "node-link--technology-unknown");
  }

  return classes.join(" ");
}

export function NodeLink({ node, className, known }: NodeLinkProps) {
  const { isKnown } = useKnownTechnologies();
  const resolvedKnown =
    known ?? (node.type === "technology" ? isKnown(node.id) : undefined);

  return (
    <Link
      to={nodeRoute(node)}
      className={linkClassName(node, className, resolvedKnown)}
    >
      <span className={`node-type node-type-${node.type}`}>{node.type}</span>
      <span>{node.name}</span>
      {node.type === "technology" && resolvedKnown ? (
        <span className="known-marker" aria-label="Known technology" title="Known" />
      ) : null}
    </Link>
  );
}
