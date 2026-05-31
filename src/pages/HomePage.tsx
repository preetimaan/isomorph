import { Layout } from "@/components/Layout";
import { NodeLink } from "@/components/NodeLink";
import { RelationshipGuide } from "@/components/RelationshipGuide";
import { SearchBar } from "@/components/SearchBar";
import { useGraph } from "@/context/useGraph";
import { getNodesByType } from "@/graph";

export function HomePage() {
  const { graph, validation } = useGraph();
  const responsibilities = getNodesByType(graph, "responsibility");
  const technologies = getNodesByType(graph, "technology");
  const ecosystems = getNodesByType(graph, "ecosystem");

  return (
    <Layout>
      <SearchBar graph={graph} />

      <section className="panel">
        <h2>Graph status</h2>
        <ul className="stats">
          <li>{validation.stats.nodes} nodes</li>
          <li>{validation.stats.edges} edges</li>
          <li>{validation.stats.byType.responsibility} responsibilities</li>
          <li>{validation.stats.byType.technology} technologies</li>
          <li>{validation.stats.byType.ecosystem} ecosystems</li>
        </ul>
        <p className={validation.ok ? "ok" : "error"}>
          {validation.ok ? "Validation passed" : "Validation failed"}
        </p>
      </section>

      <BrowseSection title="Responsibilities" nodes={responsibilities} />
      <BrowseSection title="Technologies" nodes={technologies} />
      <BrowseSection title="Ecosystems" nodes={ecosystems} />

      <RelationshipGuide compact />
    </Layout>
  );
}

function BrowseSection({
  title,
  nodes,
}: {
  title: string;
  nodes: ReturnType<typeof getNodesByType>;
}) {
  return (
    <section className="panel">
      <h2>{title}</h2>
      <ul className="browse-list">
        {nodes.map((node) => (
          <li key={node.id}>
            <NodeLink node={node} />
            {node.description ? (
              <p className="browse-description">{node.description}</p>
            ) : null}
          </li>
        ))}
      </ul>
    </section>
  );
}
