import { createContext } from "react";
import type { GraphData, GraphValidationResult } from "@/graph";

export interface GraphContextValue {
  graph: GraphData;
  validation: GraphValidationResult;
}

export const GraphContext = createContext<GraphContextValue | null>(null);
