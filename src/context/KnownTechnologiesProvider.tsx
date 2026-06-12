import { useEffect, useMemo, useState, type ReactNode } from "react";
import { getNodesByType } from "@/graph";
import { useGraph } from "./useGraph";
import {
  KnownTechnologiesContext,
  type KnownTechnologiesContextValue,
} from "./knownTechnologiesContext";
import { loadPersonalTechnologiesFromDisk } from "@/personal/loadPersonalTechnologies";

export function KnownTechnologiesProvider({ children }: { children: ReactNode }) {
  const { graph } = useGraph();
  const validTechnologyIds = useMemo(
    () => new Set(getNodesByType(graph, "technology").map((node) => node.id)),
    [graph],
  );
  const [knownIds, setKnownIds] = useState(() =>
    loadPersonalTechnologiesFromDisk(validTechnologyIds),
  );

  useEffect(() => {
    setKnownIds(loadPersonalTechnologiesFromDisk(validTechnologyIds));
  }, [validTechnologyIds]);

  useEffect(() => {
    if (!import.meta.hot) {
      return;
    }

    const reload = () => {
      setKnownIds(loadPersonalTechnologiesFromDisk(validTechnologyIds));
    };

    import.meta.hot.accept(["@/personal/loadPersonalTechnologies"], reload);
  }, [validTechnologyIds]);

  const value = useMemo<KnownTechnologiesContextValue>(
    () => ({
      knownIds,
      isKnown: (technologyId: string) => knownIds.has(technologyId),
    }),
    [knownIds],
  );

  return (
    <KnownTechnologiesContext.Provider value={value}>
      {children}
    </KnownTechnologiesContext.Provider>
  );
}
