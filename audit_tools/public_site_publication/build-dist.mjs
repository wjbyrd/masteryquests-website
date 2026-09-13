import fs from "node:fs";
import path from "node:path";

const root = path.resolve(process.argv[2] || ".");
const dist = path.join(root, "dist");

function requireExists(rel) {
  const source = path.join(root, rel);
  if (!fs.existsSync(source)) {
    throw new Error(`Required publication source missing: ${rel}`);
  }
  return source;
}

function copyFile(rel) {
  const source = requireExists(rel);
  const destination = path.join(dist, rel);
  fs.mkdirSync(path.dirname(destination), { recursive: true });
  fs.copyFileSync(source, destination);
}

function copyTree(rel, filter = () => true) {
  const sourceRoot = requireExists(rel);

  for (const entry of fs.readdirSync(sourceRoot, { withFileTypes: true })) {
    const childRel = path.join(rel, entry.name);
    if (!filter(childRel, entry)) continue;

    if (entry.isDirectory()) {
      copyTree(childRel, filter);
    } else if (entry.isFile()) {
      copyFile(childRel);
    }
  }
}

fs.rmSync(dist, { recursive: true, force: true });
fs.mkdirSync(dist, { recursive: true });

const wholePublicTrees = [
  "about",
  "assets",
  "concept-reviews",
  "downloads",
  "evidence",
  "games",
  "how-to",
  "play",
  "privacy",
  "resources",
  "tools"
];

function publicTreeFilter(rel, entry) {
  const normalized = rel.replaceAll("\\", "/");
  const segments = normalized.split("/");

  // Historical manual-authoring resources are retained in source, not offered to faculty.
  if ([
    "downloads/resources/mastery-quests-faculty-template-old.html",
    "downloads/resources/using-external-javascript-question-pools.docx",
    "downloads/resources/javascript-question-pool-code.txt",
    "downloads/resources/RESOURCE-CLEANUP.txt"
  ].includes(normalized)) return false;

  // Development/source material that may live beneath otherwise-public trees.
  if (segments.includes("authoring")) return false;
  if (segments.includes("tests")) return false;

  // These source/report formats are never runtime assets inside public site trees.
  if (entry.isFile() && /\.(?:md|mjs|py|ps1)$/i.test(entry.name)) return false;

  return true;
}

for (const rel of wholePublicTrees) {
  copyTree(rel, publicTreeFilter);
}

for (const rel of [
  "index.html",
  "build/index.html"
]) {
  copyFile(rel);
}

const composerRoot = "build/faculty-build-composer";

for (const name of [
  "index.html",
  "composer.css",
  "composer.js",
  "composer-core.js",
  "concept-review-runtime.js",
  "course-area-model.js",
  "custom-asset-core.js",
  "faculty-outcome-core.js",
  "anonymous-telemetry-source.js"
]) {
  copyFile(path.join(composerRoot, name));
}

copyFile(
  path.join(
    composerRoot,
    "template",
    "mastery-quests-faculty-template-composer-ready.html"
  )
);

for (const name of [
  "composer_library.js",
  "faculty-outcomes.js",
  "official_theme_library.js"
]) {
  copyFile(path.join(composerRoot, "data", name));
}

copyTree(
  path.join(composerRoot, "data", "default-theme-assets")
);

copyTree(
  path.join(composerRoot, "data", "question-assets"),
  (rel, entry) => {
    const relative = path.relative(
      path.join(composerRoot, "data", "question-assets"),
      rel
    );
    const first = relative.split(path.sep)[0];
    return !first.startsWith("_incoming");
  }
);

const reviewDir = path.join(
  composerRoot,
  "data",
  "concept-reviews"
);

copyFile(path.join(reviewDir, "manifest.json"));

const sourceReviewDir = requireExists(reviewDir);
for (const name of fs.readdirSync(sourceReviewDir)) {
  if (
    /^(?:GEN-ECON|MICRO|MACRO)-\d{2}\.pdf$/i.test(name)
  ) {
    copyFile(path.join(reviewDir, name));
  }
}

const files = [];
function walk(dir) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full);
    else files.push(path.relative(dist, full).replaceAll("\\", "/"));
  }
}
walk(dist);

const forbidden = files.filter(file =>
  file.startsWith("audit_tools/") ||
  file.startsWith("server/") ||
  file.startsWith("validation_artifacts/") ||
  file.startsWith("legacy/") ||
  file.startsWith("previews/") ||
  file.startsWith("tmp/") ||
  file.includes("/authoring/") ||
  file.includes("/tests/") ||
  /\.(?:md|mjs|py|ps1)$/i.test(file) ||
  /(?:telemetry-export|telemetry-latest|operational-smoke)/i.test(file)
);

if (forbidden.length) {
  throw new Error(
    `Forbidden publication files detected:\n${forbidden.join("\n")}`
  );
}

const incoming = files.filter(file =>
  file.includes("/question-assets/_incoming")
);

if (incoming.length) {
  throw new Error(
    `Incoming question assets leaked into dist:\n${incoming.join("\n")}`
  );
}

const reviewPdfs = files.filter(file =>
  /^build\/faculty-build-composer\/data\/concept-reviews\/(?:GEN-ECON|MICRO|MACRO)-\d{2}\.pdf$/i.test(file)
);

if (reviewPdfs.length !== 151) {
  throw new Error(
    `Expected 151 Composer Concept Review PDFs; found ${reviewPdfs.length}`
  );
}

console.log(JSON.stringify({
  ok: true,
  dist,
  fileCount: files.length,
  composerConceptReviewPdfCount: reviewPdfs.length,
  forbiddenFileCount: forbidden.length,
  incomingQuestionAssetCount: incoming.length
}, null, 2));
