import { createContext } from "react";

export interface KnownTechnologiesContextValue {
  knownIds: ReadonlySet<string>;
  isKnown: (technologyId: string) => boolean;
}

export const KnownTechnologiesContext =
  createContext<KnownTechnologiesContextValue | null>(null);
