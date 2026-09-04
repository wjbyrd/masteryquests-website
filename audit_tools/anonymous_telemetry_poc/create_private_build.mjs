import fs from "node:fs";
import path from "node:path";

const repo = path.resolve(process.argv[2] || ".");
const sourceRoot = path.join(repo, "play", "managerial-intelligence-directorate");
const targetRoot = path.join(repo, "play", "managerial-directorate-telemetry-poc");
const games = ["agency-protocol", "cost-directive", "market-signal", "strategy-desk"];
const marker = "phaseAnonymousTelemetryPOC-v1";

if (!fs.existsSync(path.join(sourceRoot, "index.html"))) {
  throw new Error(`Authoritative Managerial source not found: ${sourceRoot}`);
}

fs.mkdirSync(targetRoot, { recursive: true });

function transform(source, gameId, sourceBase) {
  if (source.includes(marker)) throw new Error(`Refusing to clone an already instrumented source: ${gameId}`);
  const headInjection = `<meta name="robots" content="noindex,nofollow,noarchive"><meta name="anonymous-telemetry-phase" content="${marker}"><meta name="anonymous-telemetry-endpoint" content="/api/anonymous-telemetry-poc/v1/events"><base href="${sourceBase}"><script src="/play/managerial-directorate-telemetry-poc/telemetry-storage-isolation.js"></script>`;
  const bodyInjection = `<script src="/play/managerial-directorate-telemetry-poc/telemetry-client.js" data-game-id="${gameId}"></script>`;
  let output = source.replace(/<head(\s[^>]*)?>/i, match => `${match}${headInjection}`);
  output = output.replace(/<\/body>/i, `${bodyInjection}</body>`);
  output = output.replace(/href=(['"])\.\.\/index\.html\1/gi, `href="/play/managerial-directorate-telemetry-poc/"`);
  output = output.replace(/(?:window\.)?location\.href\s*=\s*(['"])\.\.\/index\.html\1/gi, `location.href="/play/managerial-directorate-telemetry-poc/"`);
  if (gameId === "managerial-hub") {
    for (const slug of games) {
      output = output.replace(new RegExp(`file:\\s*(["'])${slug}/\\1`, "g"), `file: "/play/managerial-directorate-telemetry-poc/${slug}/" + window.location.search`);
    }
    output = output.replace(/<p>When you enter an operation,[\s\S]*?<\/p>/i, "<p>This private research build records anonymous gameplay events only; no school email is requested or transmitted.</p>");
    output = output.replace(/<p>Use your school email[\s\S]*?<\/p>/i, "<p>This private research build records anonymous gameplay events only; no school email is requested or transmitted.</p>");
    output = output.replace(/\n\s*function restoreSavedEmail\(\)\{[\s\S]*?\n\s*\}\n\s*\}\n\n\s*function showHelpButton/, "\n\n  function showHelpButton");
    output = output.replace(/\n\s*restoreSavedEmail\(\);/g, "");
  }
  return output;
}

const entries = [
  { gameId: "managerial-hub", source: path.join(sourceRoot, "index.html"), target: path.join(targetRoot, "index.html"), base: "/play/managerial-intelligence-directorate/" },
  ...games.map(gameId => ({
    gameId,
    source: path.join(sourceRoot, gameId, "index.html"),
    target: path.join(targetRoot, gameId, "index.html"),
    base: `/play/managerial-intelligence-directorate/${gameId}/`
  }))
];

for (const entry of entries) {
  const source = fs.readFileSync(entry.source, "utf8");
  const output = transform(source, entry.gameId, entry.base);
  fs.mkdirSync(path.dirname(entry.target), { recursive: true });
  fs.writeFileSync(entry.target, output, "utf8");
}

console.log(JSON.stringify({ phase: marker, sourceRoot, targetRoot, generated: entries.map(entry => path.relative(repo, entry.target)) }, null, 2));
