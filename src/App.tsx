import { useMemo, useState } from "react";
import {
  getAlternatives,
  getTechnologiesForResponsibility,
  loadGraph,
  searchNodes,
  validateGraphData,
} from "./graph";

function App() {
  const graph = useMemo(() => loadGraph(), []);
  const validation = useMemo(() => validateGraphData(graph), [graph]);
  const [query, setQuery] = useState("");

  const results = useMemo(
    () => searchNodes(graph, query).slice(0, 12),
    [graph, query],
  );

  const validationTech = getTechnologiesForResponsibility(
    graph,
    "validation",
  );
  const pydanticAlternatives = getAlternatives(graph, "pydantic");

  return (
    <div className="app">
      <header className="header">
        <p className="eyebrow">Concept-first skill transfer</p>
        <h1>Isomorph</h1>
        <p className="subtitle">Map tools to responsibilities, not syntax.</p>
      </header>

      <section className="panel">
        <h2>Graph status</h2>
        <ul className="stats">
          <li>{validation.stats.nodes} nodes</li>
          <li>{validation.stats.edges} edges</li>
          <li>
            {validation.stats.byType.responsibility} responsibilities
          </li>
          <li>{validation.stats.byType.technology} technologies</li>
          <li>{validation.stats.byType.ecosystem} ecosystems</li>
        </ul>
        <p className={validation.ok ? "ok" : "error"}>
          {validation.ok ? "Validation passed" : "Validation failed"}
        </p>
      </section>

      <section className="panel">
        <h2>Search</h2>
        <input
          type="search"
          placeholder="Search nodes..."
          value={query}
          onChange={(event) => setQuery(event.target.value)}
        />
        <ul className="results">
          {results.map((node) => (
            <li key={node.id}>
              <span className="node-type">{node.type}</span>
              <strong>{node.name}</strong>
              <span className="node-id">{node.id}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="panel">
        <h2>Validation cluster preview</h2>
        <h3>fulfills → validation</h3>
        <ul>
          {validationTech.map((tech) => (
            <li key={tech.id}>{tech.name}</li>
          ))}
        </ul>
        <h3>alternative_to → pydantic</h3>
        <ul>
          {pydanticAlternatives.map((tech) => (
            <li key={tech.id}>{tech.name}</li>
          ))}
        </ul>
      </section>
    </div>
  );
}

export default App;
