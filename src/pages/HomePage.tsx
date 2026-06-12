import { useMemo, useState } from "react";
import { Layout } from "@/components/Layout";
import { NodeLink } from "@/components/NodeLink";
import { RelationshipGuide } from "@/components/RelationshipGuide";
import { SearchBar } from "@/components/SearchBar";
import { useGraph } from "@/context/useGraph";
import { useKnownTechnologies } from "@/context/useKnownTechnologies";
import { getNodesByType, type GraphNode } from "@/graph";

type KnownFilter = "all" | "known" | "unknown";

export function HomePage() {
  const { graph, validation } = useGraph();
  const { isKnown } = useKnownTechnologies();
  const [knownFilter, setKnownFilter] = useState<KnownFilter>("all");
  const responsibilities = getNodesByType(graph, "responsibility");
  const technologies = getNodesByType(graph, "technology");
  const ecosystems = getNodesByType(graph, "ecosystem");

  const filteredTechnologies = useMemo(() => {
    return technologies.filter((technology) => {
      if (knownFilter === "known") {
        return isKnown(technology.id);
      }
      if (knownFilter === "unknown") {
        return !isKnown(technology.id);
      }
      return true;
    });
  }, [isKnown, knownFilter, technologies]);

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
      <TechnologyBrowseSection
        nodes={filteredTechnologies}
        knownFilter={knownFilter}
        onKnownFilterChange={setKnownFilter}
      />
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
  nodes: GraphNode[];
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

function TechnologyBrowseSection({
  nodes,
  knownFilter,
  onKnownFilterChange,
}: {
  nodes: GraphNode[];
  knownFilter: KnownFilter;
  onKnownFilterChange: (filter: KnownFilter) => void;
}) {
  return (
    <section className="panel">
      <div className="section-header">
        <h2>Technologies</h2>
        <div className="filter-row" role="group" aria-label="Filter technologies by known status">
          {(
            [
              ["all", "All"],
              ["known", "Known"],
              ["unknown", "Unknown"],
            ] as const
          ).map(([value, label]) => (
            <button
              key={value}
              type="button"
              className={`filter-chip ${knownFilter === value ? "filter-chip-active" : ""}`}
              aria-pressed={knownFilter === value}
              onClick={() => onKnownFilterChange(value)}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <p className="browse-description">
        Known status comes from{" "}
        <code>data/personal/technologies.yaml</code>.
      </p>
      {nodes.length ? (
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
      ) : (
        <p className="empty-state">No technologies match this filter.</p>
      )}
    </section>
  );
}
