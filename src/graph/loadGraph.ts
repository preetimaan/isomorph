import { parse as parseYaml } from "yaml";
import {
  BaseNodeSchema,
  GraphData,
  GraphDataSchema,
  RelationshipsFileSchema,
} from "@schema/graph";

const nodeModules = import.meta.glob("../../data/**/*.yaml", {
  eager: true,
  query: "?raw",
  import: "default",
}) as Record<string, string>;

function loadNodesFromGlob(subdirectory: string) {
  const prefix = `../../data/${subdirectory}/`;

  return Object.entries(nodeModules)
    .filter(([filePath]) => filePath.startsWith(prefix))
    .map(([, raw]) => BaseNodeSchema.parse(parseYaml(raw)));
}

export function loadGraphFromDisk(): GraphData {
  const relationshipsRaw = nodeModules["../../data/relationships.yaml"];
  if (!relationshipsRaw) {
    throw new Error("Missing data/relationships.yaml");
  }

  const nodes = [
    ...loadNodesFromGlob("responsibilities"),
    ...loadNodesFromGlob("technologies"),
    ...loadNodesFromGlob("ecosystems"),
  ];

  const { relationships } = RelationshipsFileSchema.parse(
    parseYaml(relationshipsRaw),
  );

  return GraphDataSchema.parse({ nodes, edges: relationships });
}

export { loadGraphFromDisk as loadGraph };
