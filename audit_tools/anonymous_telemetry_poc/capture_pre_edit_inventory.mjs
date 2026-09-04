import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const repo = path.resolve(process.argv[2] || ".");
const phase = "phaseAnonymousTelemetryPOC-v1";
const outputDir = path.join(repo, "validation_artifacts", "anonymous_telemetry_poc");
const managerial = path.join(repo, "play", "managerial-intelligence-directorate");
const relativeFiles = [
  "index.html",
  "games/index.html",
  "games/managerial-intelligence-directorate/index.html",
  "wrangler.jsonc",
  "play/managerial-intelligence-directorate/index.html",
  "play/managerial-intelligence-directorate/agency-protocol/index.html",
  "play/managerial-intelligence-directorate/agency-protocol/agency_protocol_question_bank_student.js",
  "play/managerial-intelligence-directorate/cost-directive/index.html",
  "play/managerial-intelligence-directorate/cost-directive/cost_directive_question_bank_student.js",
  "play/managerial-intelligence-directorate/market-signal/index.html",
  "play/managerial-intelligence-directorate/market-signal/market_signal_question_bank_student.js",
  "play/managerial-intelligence-directorate/strategy-desk/index.html",
  "play/managerial-intelligence-directorate/strategy-desk/strategy_desk_question_bank_student.js"
];
const sha256 = file => crypto.createHash("sha256").update(fs.readFileSync(file)).digest("hex");
const protectedFiles = Object.fromEntries(relativeFiles.map(relative => [relative, sha256(path.join(repo, ...relative.split("/")))]));
let gitStatus = "";
try {
  gitStatus = execFileSync("git", ["-c", `safe.directory=${repo.replaceAll("\\", "/")}`, "-C", repo, "status", "--short"], { encoding: "utf8" }).trim();
} catch (error) { gitStatus = `unavailable: ${error.message}`; }

const childGames = fs.readdirSync(managerial, { withFileTypes: true })
  .filter(entry => entry.isDirectory() && fs.existsSync(path.join(managerial, entry.name, "index.html")))
  .map(entry => entry.name).sort();
const extractConst = (source, name) => source.match(new RegExp(`const\\s+${name}\\s*=\\s*["']([^"']+)["']`))?.[1] || "not explicitly declared";
const gameBuilds = Object.fromEntries(childGames.map(gameId => {
  const source = fs.readFileSync(path.join(managerial, gameId, "index.html"), "utf8");
  const columnsBody = source.match(/const\s+TELEMETRY_COLUMNS\s*=\s*\[([\s\S]*?)\];/)?.[1] || "";
  return [gameId, {
    gameVersion: extractConst(source, "GAME_VERSION"),
    telemetryVersion: extractConst(source, "TELEMETRY_VERSION"),
    telemetryCsvColumns: [...columnsBody.matchAll(/["']([^"']+)["']/g)].map(match => match[1]),
    saveKey: extractConst(source, "SAVE_KEY"),
    runIdKey: extractConst(source, "RUN_ID_KEY")
  }];
}));
const inventory = {
  phase,
  capturedAt: new Date().toISOString(),
  capturedBeforeProtectedSourceEdits: true,
  canonicalRepository: repo,
  authoritativeManagerialBuild: "play/managerial-intelligence-directorate/",
  authoritativeChildGames: childGames,
  auditFindings: {
    deployment: "Static Cloudflare Assets configuration in root wrangler.jsonc; no pre-existing server worker, D1 binding, or API directory found.",
    telemetry: "Each child game keeps browser-local telemetry and exposes sendGameData, CSV export, save/resume, adaptive state, boss state, and Mastery Report state.",
    gameBuilds,
    engineTemplate: "Current protected Managerial engine; Cost Directive, Market Signal, and Strategy Desk identify local telemetry v5-engine2, while Agency Protocol identifies v4-hashed-bank. Exact gameVersion/telemetryVersion constants are recorded per child above.",
    masteryReport: "Existing reports aggregate attempts, correct answers, accuracy, tags, objectives, skills, difficulty/evidence where available, timing, streak, mode results, and instructional review recommendations.",
    adaptiveBehavior: "Incorrect/careless responses can route through targeted repair, bridge, and retest stages using concept/objective/skill weakness and exposure history; limited-run modes retain their existing sampling rules.",
    checkpoints: "Campaign-capable modes use checkpoint/boss rooms 10, 20, and 30 with targeted boss pools; modes that intentionally suppress bosses remain unchanged.",
    saveResume: "Each child uses mode-specific browser-local save keys containing room, run token, mode, mastery/adaptive state, rapid-guess state, boss state, artifacts, and mode-specific scoring state.",
    existingServerMechanisms: "No Pages Functions, Worker main, D1, KV, R2, or application API endpoint was present in the live repository.",
    existingPrivateConvention: "No established private/unpublished game-build convention or server telemetry prototype was found.",
    modes: {
      agencyProtocol: ["standard", "timed", "exam", "quiz", "unlimited", "legendary", "score", "fadingFortune", "riskReward"],
      otherGames: ["standard", "timed", "exam", "quiz", "unlimited", "legendary", "score", "trialGraph", "fadingFortune", "riskReward"]
    },
    architectureDecision: "Generate five private HTML entrypoints, reuse authoritative media and question banks through base URLs, isolate private local storage, use one shared fail-open telemetry client, and deploy a separate Cloudflare Worker+D1 backend so public deployment behavior is unchanged.",
    privatePath: "/play/managerial-directorate-telemetry-poc/",
    serverPath: "server/anonymous-telemetry-poc/"
  },
  protectedFiles,
  gitStatusAtInitialAudit: "clean",
  gitStatusAtInventoryWrite: gitStatus
};
fs.mkdirSync(outputDir, { recursive: true });
fs.writeFileSync(path.join(outputDir, "pre_edit_inventory.json"), JSON.stringify(inventory, null, 2) + "\n");
console.log(JSON.stringify({ phase, output: path.join(outputDir, "pre_edit_inventory.json"), protectedFileCount: relativeFiles.length }, null, 2));
