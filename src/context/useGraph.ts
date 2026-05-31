import { useContext } from "react";
import { GraphContext } from "./graphContext";

export function useGraph() {
  const context = useContext(GraphContext);
  if (!context) {
    throw new Error("useGraph must be used within GraphProvider");
  }
  return context;
}
