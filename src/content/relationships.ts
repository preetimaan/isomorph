import type { RelationshipType } from "@/graph";

export interface RelationshipDefinition {
  type: RelationshipType;
  direction: "directed" | "symmetric";
  summary: string;
  example: string;
  contrast?: string;
}

export const RELATIONSHIP_DEFINITIONS: RelationshipDefinition[] = [
  {
    type: "fulfills",
    direction: "directed",
    summary: "A technology implements a stable system responsibility.",
    example: "pydantic → validation",
  },
  {
    type: "alternative_to",
    direction: "symmetric",
    summary:
      "Two technologies solve the same responsibility and can be swapped. Meaning goes both ways even though data is stored once.",
    example: "pydantic ↔ zod",
    contrast:
      "Use for interchangeable tools at the same layer. Not a migration — either choice is valid today.",
  },
  {
    type: "commonly_paired",
    direction: "directed",
    summary: "Two technologies often appear together in a stack.",
    example: "pydantic → fastapi (as a framework pairing, when both are technologies)",
  },
  {
    type: "belongs_to",
    direction: "directed",
    summary: "A technology is commonly associated with an ecosystem.",
    example: "pydantic → fastapi ecosystem",
  },
  {
    type: "depends_on",
    direction: "directed",
    summary: "One technology requires or builds on another.",
    example: "library → runtime",
  },
];

export const SYMMETRIC_RELATIONSHIP_TYPES: RelationshipType[] = [
  "alternative_to",
];
