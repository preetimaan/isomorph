import { useEffect, useState, type ReactNode } from "react";
import { loadGraph, validateGraphData } from "@/graph";
import { GraphContext } from "./graphContext";

export function GraphProvider({ children }: { children: ReactNode }) {
  const [value, setValue] = useState(() => {
    const graph = loadGraph();
    return { graph, validation: validateGraphData(graph) };
  });

  useEffect(() => {
    // Recompute if React Fast Refresh remounts this provider.
    const graph = loadGraph();
    setValue({ graph, validation: validateGraphData(graph) });
  }, []);

  useEffect(() => {
    // Dev-only: hot reload graph when data/loader changes.
    if (!import.meta.hot) {
      return;
    }

    const reload = () => {
      const graph = loadGraph();
      setValue({ graph, validation: validateGraphData(graph) });
    };

    // `loadGraph` depends on `import.meta.glob('../../data/**/*.yaml?raw')`.
    // When YAML files change, Vite should trigger an update that re-runs this accept.
    import.meta.hot.accept(["@/graph/loadGraph", "@/graph"], reload);
  }, []);

  return (
    <GraphContext.Provider value={value}>{children}</GraphContext.Provider>
  );
}
