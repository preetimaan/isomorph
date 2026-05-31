import { loadGraphFromDisk } from "./loadGraphFromDisk.js";
import { validateGraphData } from "../schema/graph.js";

function main(): void {
  const graph = loadGraphFromDisk();
  const result = validateGraphData(graph);

  console.log("Isomorph graph validation\n");
  console.log(`Nodes: ${result.stats.nodes}`);
  console.log(`Edges: ${result.stats.edges}`);
  console.log(
    `  responsibilities: ${result.stats.byType.responsibility}`,
  );
  console.log(`  technologies: ${result.stats.byType.technology}`);
  console.log(`  ecosystems: ${result.stats.byType.ecosystem}`);
  console.log("\nTechnologies per responsibility:");

  for (const [responsibilityId, count] of Object.entries(
    result.stats.technologiesPerResponsibility,
  )) {
    console.log(`  ${responsibilityId}: ${count}`);
  }

  if (!result.ok) {
    console.error(`\nValidation failed (${result.issues.length} issues):\n`);
    for (const issue of result.issues) {
      console.error(`  [${issue.path}] ${issue.message}`);
    }
    process.exit(1);
  }

  console.log("\nValidation passed.");
}

main();
