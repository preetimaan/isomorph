import Fuse from "fuse.js";
import type { GraphData, GraphNode } from "@/graph";

export function createFuzzyNodeSearch(graph: GraphData) {
  const fuse = new Fuse(graph.nodes, {
    keys: [
      { name: "name", weight: 0.5 },
      { name: "id", weight: 0.3 },
      { name: "description", weight: 0.15 },
      { name: "tags", weight: 0.05 },
    ],
    threshold: 0.4,
    ignoreLocation: true,
  });

  return (query: string, limit = 12): GraphNode[] => {
    const trimmed = query.trim();
    if (!trimmed) {
      return graph.nodes.slice(0, limit);
    }

    return fuse.search(trimmed, { limit }).map((result) => result.item);
  };
}
