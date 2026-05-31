import { useMemo, type ReactNode } from "react";
import { loadGraph, validateGraphData } from "@/graph";
import { GraphContext } from "./graphContext";

export function GraphProvider({ children }: { children: ReactNode }) {
  const value = useMemo(() => {
    const graph = loadGraph();
    const validation = validateGraphData(graph);
    return { graph, validation };
  }, []);

  return (
    <GraphContext.Provider value={value}>{children}</GraphContext.Provider>
  );
}
