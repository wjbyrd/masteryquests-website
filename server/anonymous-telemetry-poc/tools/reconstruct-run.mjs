import fs from "node:fs";
import { reconstructRun } from "../telemetry-core.mjs";

const inputPath = process.argv[2];
if (!inputPath) {
  console.error("Usage: node tools/reconstruct-run.mjs <run-events.json>");
  process.exit(2);
}
const parsed = JSON.parse(fs.readFileSync(inputPath, "utf8"));
const events = Array.isArray(parsed) ? parsed : parsed.events || parsed.scenarios?.[0]?.events;
if (!Array.isArray(events)) throw new Error("Input must be an event array, an object containing events[], or a synthetic scenario artifact");
console.log(JSON.stringify(reconstructRun(events), null, 2));
