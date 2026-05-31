import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { nodeRoute, searchNodes } from "@/graph";
import type { GraphData } from "@/graph";
import { NodeLink } from "./NodeLink";

interface SearchBarProps {
  graph: GraphData;
  limit?: number;
}

export function SearchBar({ graph, limit = 12 }: SearchBarProps) {
  const [query, setQuery] = useState("");
  const navigate = useNavigate();

  const results = useMemo(
    () => searchNodes(graph, query).slice(0, limit),
    [graph, limit, query],
  );

  return (
    <section className="panel">
      <h2>Search</h2>
      <input
        type="search"
        placeholder="Search nodes..."
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        onKeyDown={(event) => {
          if (event.key === "Enter" && results[0]) {
            navigate(nodeRoute(results[0]));
          }
        }}
      />
      <ul className="results">
        {results.map((node) => (
          <li key={node.id}>
            <NodeLink node={node} className="result-link" />
            <span className="node-id">{node.id}</span>
          </li>
        ))}
      </ul>
      {query && !results.length ? (
        <p className="empty-state">No nodes match your search.</p>
      ) : null}
    </section>
  );
}
