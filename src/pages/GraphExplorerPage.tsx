import { useMemo } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { GraphCanvas } from "@/components/GraphCanvas";
import { useGraph } from "@/context/useGraph";
import {
  getEcosystemSubgraph,
  getNode,
  getNodesByType,
  getResponsibilitySubgraph,
} from "@/graph";

export function GraphExplorerPage() {
  const { graph } = useGraph();
  const [searchParams, setSearchParams] = useSearchParams();

  const ecosystemId = searchParams.get("ecosystem") ?? "";
  const responsibilityId = searchParams.get("responsibility") ?? "";

  const ecosystems = getNodesByType(graph, "ecosystem");
  const responsibilities = getNodesByType(graph, "responsibility");

  const scope = useMemo(() => {
    if (ecosystemId && responsibilityId) {
      return null;
    }

    if (ecosystemId) {
      const ecosystem = getNode(graph, ecosystemId);
      if (!ecosystem || ecosystem.type !== "ecosystem") {
        return null;
      }
      return {
        kind: "ecosystem" as const,
        node: ecosystem,
        subgraph: getEcosystemSubgraph(graph, ecosystemId),
      };
    }

    if (responsibilityId) {
      const responsibility = getNode(graph, responsibilityId);
      if (!responsibility || responsibility.type !== "responsibility") {
        return null;
      }
      return {
        kind: "responsibility" as const,
        node: responsibility,
        subgraph: getResponsibilitySubgraph(graph, responsibilityId),
      };
    }

    return null;
  }, [ecosystemId, graph, responsibilityId]);

  function setEcosystemScope(id: string) {
    if (!id) {
      setSearchParams({});
      return;
    }
    setSearchParams({ ecosystem: id });
  }

  function setResponsibilityScope(id: string) {
    if (!id) {
      setSearchParams({});
      return;
    }
    setSearchParams({ responsibility: id });
  }

  return (
    <Layout>
      <section className="panel">
        <h2>Scoped graph</h2>
        <p className="browse-description">
          Explore one ecosystem or responsibility at a time. Pick a scope below or
          follow links from the{" "}
          <Link to="/" className="text-link">
            matrix
          </Link>
          .
        </p>

        <div className="scope-picker">
          <label className="matrix-select">
            <span className="filter-label">Ecosystem</span>
            <select
              value={ecosystemId}
              onChange={(event) => setEcosystemScope(event.target.value)}
            >
              <option value="">Select ecosystem…</option>
              {ecosystems.map((ecosystem) => (
                <option key={ecosystem.id} value={ecosystem.id}>
                  {ecosystem.name}
                </option>
              ))}
            </select>
          </label>

          <span className="scope-picker-divider">or</span>

          <label className="matrix-select">
            <span className="filter-label">Responsibility</span>
            <select
              value={responsibilityId}
              onChange={(event) => setResponsibilityScope(event.target.value)}
            >
              <option value="">Select responsibility…</option>
              {responsibilities.map((responsibility) => (
                <option key={responsibility.id} value={responsibility.id}>
                  {responsibility.name}
                </option>
              ))}
            </select>
          </label>
        </div>

        {ecosystemId && responsibilityId ? (
          <p className="error">
            Only one scope applies. Clear one selector to continue.
          </p>
        ) : null}

        {scope ? (
          <ul className="stats">
            <li>{scope.kind}: {scope.node.name}</li>
            <li>{scope.subgraph.nodes.length} nodes</li>
            <li>{scope.subgraph.edges.length} edges</li>
          </ul>
        ) : (
          <p className="empty-state">Select an ecosystem or responsibility to view the graph.</p>
        )}
      </section>

      {scope ? (
        <section className="panel graph-panel">
          <GraphCanvas subgraph={scope.subgraph} height={520} />
        </section>
      ) : null}
    </Layout>
  );
}
