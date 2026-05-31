import { useGraph } from "@/context/useGraph";
import { getMigrationPaths } from "@/graph";
import { NodeLink } from "./NodeLink";

interface MigrationPathsPanelProps {
  technologyId: string;
}

export function MigrationPathsPanel({
  technologyId,
}: MigrationPathsPanelProps) {
  const { graph } = useGraph();
  const paths = getMigrationPaths(graph, technologyId);

  if (!paths.length) {
    return null;
  }

  return (
    <section className="panel">
      <h2>Migration paths</h2>
      {paths.map((path) => (
        <div key={path.direction} className="migration-path">
          <h3>
            {path.direction === "replaces"
              ? "Replaces chain"
              : "Replaced by chain"}
          </h3>
          <ol className="migration-chain">
            {path.nodes.map((node) => (
              <li key={node.id}>
                <NodeLink node={node} />
              </li>
            ))}
          </ol>
        </div>
      ))}
    </section>
  );
}
