import { importKnownTechnologies } from "@schema/personal";

const personalModules = import.meta.glob("../../data/personal/technologies.yaml", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

const PERSONAL_YAML_PATH = "../../data/personal/technologies.yaml";

export function loadPersonalTechnologiesFromDisk(
  validTechnologyIds: ReadonlySet<string>,
): Set<string> {
  const raw = personalModules[PERSONAL_YAML_PATH];
  if (!raw) {
    return new Set();
  }

  const { knownIds } = importKnownTechnologies(raw, validTechnologyIds);
  return new Set(knownIds);
}
