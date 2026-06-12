import { useContext } from "react";
import { KnownTechnologiesContext } from "./knownTechnologiesContext";

export function useKnownTechnologies() {
  const value = useContext(KnownTechnologiesContext);
  if (!value) {
    throw new Error("useKnownTechnologies must be used within KnownTechnologiesProvider");
  }
  return value;
}
