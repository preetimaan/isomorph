import { parse as parseYaml } from "yaml";
import { z } from "zod";

export const PersonalTechnologiesFileSchema = z.object({
  known: z.array(z.string()).default([]),
});

export type PersonalTechnologiesFile = z.infer<
  typeof PersonalTechnologiesFileSchema
>;

export interface PersonalImportResult {
  knownIds: string[];
  warnings: string[];
}

export function parsePersonalTechnologiesYaml(
  raw: string,
): PersonalTechnologiesFile {
  const parsed = parseYaml(raw);
  return PersonalTechnologiesFileSchema.parse(parsed ?? {});
}

export function importKnownTechnologies(
  raw: string,
  validTechnologyIds: ReadonlySet<string>,
): PersonalImportResult {
  const { known } = parsePersonalTechnologiesYaml(raw);
  const knownIds: string[] = [];
  const warnings: string[] = [];

  for (const id of known) {
    if (validTechnologyIds.has(id)) {
      if (!knownIds.includes(id)) {
        knownIds.push(id);
      }
      continue;
    }

    warnings.push(`Skipped unknown technology id: ${id}`);
  }

  return { knownIds, warnings };
}
