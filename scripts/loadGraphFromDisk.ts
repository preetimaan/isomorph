import { readFileSync, readdirSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { parse as parseYaml } from "yaml";
import {
  BaseNodeSchema,
  GraphData,
  GraphDataSchema,
  RelationshipsFileSchema,
} from "../schema/graph.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const dataRoot = path.resolve(__dirname, "../data");

function readYamlFile<T>(filePath: string): T {
  const raw = readFileSync(filePath, "utf8");
  return parseYaml(raw) as T;
}

function loadNodesFromDirectory(directory: string) {
  const absoluteDirectory = path.join(dataRoot, directory);
  const files = readdirSync(absoluteDirectory).filter((file) =>
    file.endsWith(".yaml"),
  );

  return files.map((file) => {
    const parsed = readYamlFile<unknown>(
      path.join(absoluteDirectory, file),
    );
    return BaseNodeSchema.parse(parsed);
  });
}

export function loadGraphFromDisk(): GraphData {
  const nodes = [
    ...loadNodesFromDirectory("responsibilities"),
    ...loadNodesFromDirectory("technologies"),
    ...loadNodesFromDirectory("ecosystems"),
  ];

  const relationshipsFile = readYamlFile<unknown>(
    path.join(dataRoot, "relationships.yaml"),
  );
  const { relationships } = RelationshipsFileSchema.parse(relationshipsFile);

  return GraphDataSchema.parse({ nodes, edges: relationships });
}
