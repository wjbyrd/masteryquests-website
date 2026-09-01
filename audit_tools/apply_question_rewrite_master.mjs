#!/usr/bin/env node

import crypto from "node:crypto";
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath, pathToFileURL } from "node:url";

async function loadSpreadsheetRuntime() {
  try {
    return await import("@oai/artifact-tool");
  } catch (error) {
    const fallback = path.join(os.homedir(), ".cache", "codex-runtimes", "codex-primary-runtime", "dependencies", "node", "node_modules", "@oai", "artifact-tool", "dist", "artifact_tool.mjs");
    if (!fs.existsSync(fallback)) throw error;
    return import(pathToFileURL(fallback).href);
  }
}

const { FileBlob, SpreadsheetFile } = await loadSpreadsheetRuntime();

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const COMPOSER = path.join(ROOT, "build", "faculty-build-composer");
const WORKBOOK_PATH = path.join(ROOT, "audit_tools", "question_rewrite_master.xlsx");
const LIBRARY_PATH = path.join(COMPOSER, "data", "composer_library.js");
const REGISTRY_PATH = path.join(COMPOSER, "data", "composer_registry.json");
const MANIFEST_PATH = path.join(COMPOSER, "data", "composer_library_manifest.json");
const REVIEW_MANIFEST_PATH = path.join(COMPOSER, "data", "concept-reviews", "manifest.json");
const ARTIFACT_DIR = path.join(ROOT, "validation_artifacts", "question_quality");
const AUTHORIZED_ROWS_PATH = path.join(ARTIFACT_DIR, "question_rewrite_master_authorized_rows.json");
const LEDGER_PATH = path.join(ARTIFACT_DIR, "question_rewrite_master_execution_ledger.json");
const VERIFICATION_PATH = path.join(ARTIFACT_DIR, "question_rewrite_master_verification.json");
const PHASE = "phaseQH7-principles-micro-human-read-curation-v1";
const GENERATED_AT = "2026-08-31T23:30:00.000Z";
const EXPECTED_AUTHORIZED = 1915;

const EVIDENCE_RESTORATIONS = new Map([
  ["P62I-OLI-EL-011", { image: "question-assets/oligopoly/tree_1.webp" }],
  ["P62I-OLI-EL-012", { image: "question-assets/oligopoly/tree_2.webp" }],
  ["P62I-OLI-EL-013", { image: "question-assets/oligopoly/tree_3.webp" }],
  ["P62I-OLI-EL-014", { image: "question-assets/oligopoly/tree_4.webp", replaceOption: ["Enter, then Accommodate — alternative 2", "Enter, then Fight"] }],
  ["P62I-OLI-EL-015", { image: "question-assets/oligopoly/tree_5.webp" }],
  ["P62I-OLI-EL-016", { image: "question-assets/oligopoly/tree_6.webp" }],
  ["P62I-OLI-C-013", { image: "question-assets/oligopoly/matrix_pd_1.webp" }],
  ["P62I-OLI-C-014", { image: "question-assets/oligopoly/matrix_coord_1.webp" }],
  ["P62I-OLI-C-015", { image: "question-assets/oligopoly/matrix_no_dom_1.webp" }],
  ["P62I-OLI-C-016", { image: "question-assets/oligopoly/matrix_asym_1.webp" }],
  ["P62I-OLI-C-017", { image: "question-assets/oligopoly/matrix_pd_2.webp" }],
  ["P62I-OLI-C-018", { image: "question-assets/oligopoly/matrix_ad_1.webp" }],
  ["P62I-OLI-C-019", { image: "question-assets/oligopoly/matrix_multi_ne_1.webp" }],
  ["P62I-OLI-C-020", { image: "question-assets/oligopoly/matrix_no_pure_1.webp" }],
  ["P62I-OLI-C-021", { image: "question-assets/oligopoly/matrix_price_1.webp" }],
  ["P62I-OLI-C-022", { image: "question-assets/oligopoly/matrix_coord_2.webp" }],
  ["P62I-OLI-C-029", { image: "question-assets/oligopoly/cartel_1.webp" }],
]);

const TRUNCATED_STEM_OVERRIDES = new Map([
  ["P62B-ELAS-R-002", "A learner reports an elasticity in kilograms per dollar. Which statement best corrects the error?"],
  ["P62B-ELAS-R-009", "A learner reports demand elasticity as negative and classifies the good as inferior. Which statement best corrects the error?"],
  ["P62B-ELAS-R-017", "A learner says the side that sends the tax payment to the government bears the entire tax burden. Which statement best corrects the error?"],
  ["PMS-ELAS-R-030", "A learner says supply elasticity does not matter when the price received for an export rises. Which statement best corrects the error?"],
]);

const sha256 = (value) => crypto.createHash("sha256").update(value).digest("hex");
const answerHash = (value) => sha256(String(value ?? "").normalize("NFKC").trim().replace(/\s+/g, " ").toLowerCase());
const snapshot = (value) => JSON.parse(JSON.stringify(value));
function stable(value) {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.keys(value).sort().map((key) => `${JSON.stringify(key)}:${stable(value[key])}`).join(",")}}`;
  return JSON.stringify(value);
}
function parseLibrary(source, filename = LIBRARY_PATH) {
  const context = { window: {} };
  vm.runInNewContext(source, context, { filename });
  return context.window.MQ_COMPOSER_LIBRARY;
}
function loadLibrary() { return parseLibrary(fs.readFileSync(LIBRARY_PATH, "utf8")); }
function questionId(question) { return String(question.canonicalId ?? question.id); }
function questionEntries(library) {
  const entries = [];
  for (const [conceptId, module] of Object.entries(library.concepts ?? {})) {
    for (const [pool, questions] of Object.entries(module.questions ?? {})) for (const question of questions ?? []) entries.push({ conceptId, pool, question });
    for (const key of ["repairQuestions", "repairSeedQuestions", "bridgeQuestions"]) for (const question of module[key] ?? []) entries.push({ conceptId, pool: key, question });
  }
  return entries;
}
function sourceHash(question) {
  const payload = Object.fromEntries(["id", "q", "options", "image", "primarySkill", "primaryConceptId", "difficulty", "objective"].map((key) => [key, question[key] ?? null]));
  return sha256(stable(payload));
}
function correctIndex(question) {
  const expected = String(question.aHash ?? "").replace(/^sha256:/, "");
  const matches = (question.options ?? []).map((option, index) => answerHash(option) === expected ? index : -1).filter((index) => index >= 0);
  if (matches.length !== 1) throw new Error(`${questionId(question)} answer hash resolves to ${matches.length} options.`);
  return matches[0];
}
function quotedStrings(text) {
  return [...String(text ?? "").matchAll(/“([^”]*)”|"([^"]*)"/g)].map((match) => match[1] ?? match[2]);
}
function quotedAfter(text, marker) {
  const match = marker.exec(text);
  if (!match) return null;
  return quotedStrings(text.slice(match.index + match[0].length))[0] ?? null;
}
function normalizedScope(row) { return String(row["Change Scope"] ?? "").trim().toLowerCase(); }

function currentWordingMatches(row, question) {
  const wording = String(row["Current Wording"] ?? "").trim();
  if (!wording) return false;
  if (String(question.q ?? "").trim() === wording) return true;
  if (normalizedScope(row) === "first answer choice only" && String(question.options?.[0] ?? "").trim() === wording) return true;
  if (wording.endsWith("...")) return String(question.q ?? "").startsWith(wording.slice(0, -3).trimEnd());
  return false;
}

async function authorizedRows() {
  const workbook = await SpreadsheetFile.importXlsx(await FileBlob.load(WORKBOOK_PATH));
  const sheet = workbook.worksheets.getItem("Proposed Changes");
  const values = sheet.getUsedRange(true).values;
  const headers = values[0].map((value) => String(value ?? "").trim());
  const rows = values.slice(1).map((cells, index) => ({
    workbookRow: index + 2,
    ...Object.fromEntries(headers.map((header, column) => [header, cells[column] ?? null])),
  })).filter((row) => String(row.Status ?? "").trim() === "Proposed");
  if (rows.length !== EXPECTED_AUTHORIZED) throw new Error(`Expected ${EXPECTED_AUTHORIZED} authorized rows; found ${rows.length}.`);
  const ids = rows.map((row) => String(row["Question ID"] ?? "").trim());
  if (ids.some((id) => !id)) throw new Error("Authorized workbook rows contain blank Question IDs.");
  const duplicates = ids.filter((id, index) => ids.indexOf(id) !== index);
  if (duplicates.length) throw new Error(`Duplicate workbook Question IDs: ${[...new Set(duplicates)].join(", ")}`);
  return rows;
}

function expectedStem(row, question) {
  const id = String(row["Question ID"]);
  const scope = normalizedScope(row);
  if (!scope.includes("stem")) return null;
  const rewrite = String(row["Suggested Rewrite"] ?? "").trim();
  if (TRUNCATED_STEM_OVERRIDES.has(id)) return TRUNCATED_STEM_OVERRIDES.get(id);
  if (rewrite.includes("...")) {
    if (/Which statement best corrects the error\?\s*$/.test(String(question.q))) return question.q;
    const completed = String(question.q).replace(/What is the repair\?\s*$/, "Which statement best corrects the error?");
    if (completed === question.q) throw new Error(`${id} has a truncated stem instruction that cannot be completed safely.`);
    return completed;
  }
  const directive = quotedAfter(rewrite, /Rewrite the stem as:?\s*/i)
    ?? quotedAfter(rewrite, /then use (?:the|a self-contained) stem(?: such as)?:?\s*/i)
    ?? quotedAfter(rewrite, /then use the stem:?\s*/i);
  if (directive) return directive;
  if (/^Keep the stem\b/i.test(rewrite)) return null;
  const replaceIndex = rewrite.search(/\s+(?:Also\s+)?Replace\b/i);
  if (replaceIndex > 0) return rewrite.slice(0, replaceIndex).trim();
  if (["stem", "stem only", "stem prefix only"].includes(scope)) return rewrite;
  throw new Error(`${id} stem instruction could not be parsed: ${rewrite}`);
}

function expectedFeedback(row) {
  const scope = normalizedScope(row);
  if (!scope.includes("feedback")) return null;
  const rewrite = String(row["Suggested Rewrite"] ?? "");
  const value = quotedAfter(rewrite, /Rewrite the feedback as:?\s*/i);
  if (!value) throw new Error(`${row["Question ID"]} feedback instruction could not be parsed.`);
  return value;
}

function contaminationScore(option, row) {
  const text = String(option);
  const reasonQuotes = quotedStrings(row["Why It Reads Poorly"]);
  let score = 0;
  for (const quote of reasonQuotes) {
    const comparable = quote.replace(/[.!?;:]+$/, "");
    if (comparable.length >= 5 && text === comparable) score += 1000 + comparable.length;
    else if (comparable.length >= 5 && text.includes(comparable)) score += 500 + comparable.length;
  }
  const residue = [
    /under an incorrect/i, /while ignoring/i, /even when the unit of analysis/i,
    /because organization size alone/i, /because any government action/i,
    /because one vocabulary label/i, /without distinguishing/i, /while assuming every resource/i,
    /because mentioning two concepts/i, /without tracing the combined/i,
    /while treating a policy prediction/i, /without checking how the component/i,
    /after the output decision is made/i, /for the market described in the scenario/i,
    /using the information provided in the stem/i, /within the standard .* framework/i,
    /after applying the relevant .* definition/i, /under the assumptions stated in the question/i,
    /for the participants described in the market/i, /in the displayed market/i,
    /alternative \d+/i, /bridge \d+/i, /next textbook link/i,
  ];
  for (const pattern of residue) if (pattern.test(text)) score += 100;
  return score;
}

function locateAffectedIndices(question, row, count, includeCorrect = false) {
  const correct = correctIndex(question);
  const candidates = question.options.map((option, index) => ({ index, option, score: contaminationScore(option, row) }))
    .filter((candidate) => includeCorrect || candidate.index !== correct)
    .sort((a, b) => b.score - a.score || b.option.length - a.option.length || a.index - b.index);
  const selected = candidates.filter((candidate) => candidate.score > 0).slice(0, count);
  if (selected.length !== count) throw new Error(`${row["Question ID"]} could not uniquely locate ${count} affected option(s).`);
  return selected.map((candidate) => candidate.index).sort((a, b) => a - b);
}

function replaceOptionAtSamePosition(question, oldValue, newValue, row) {
  const oldMatches = question.options.map((option, index) => option === oldValue ? index : -1).filter((index) => index >= 0);
  if (oldMatches.length === 1) {
    question.options[oldMatches[0]] = newValue;
    return true;
  }
  if (question.options.includes(newValue)) return false;
  throw new Error(`${row["Question ID"]} expected option not found: ${oldValue}`);
}

function applyOptionInstructions(row, question) {
  const scope = normalizedScope(row);
  if (!/option|distractor/.test(scope)) return false;
  const rewrite = String(row["Suggested Rewrite"] ?? "");
  const answerPosition = correctIndex(question);
  const original = [...question.options];
  let handled = false;

  const fullMarker = /(?:Rewrite|Replace) (?:the )?(?:all )?options(?: in their current order)? (?:as|with):\s*/i.exec(rewrite);
  if (fullMarker) {
    const segment = rewrite.slice(fullMarker.index + fullMarker[0].length).split(/Rewrite the feedback as/i)[0];
    const options = quotedStrings(segment);
    if (options.length !== question.options.length) throw new Error(`${row["Question ID"]} full option list has ${options.length} entries; expected ${question.options.length}.`);
    question.options = options;
    handled = true;
  }

  if (!handled) {
    const pairs = [];
    for (const match of rewrite.matchAll(/[“"]([^”"]+)[”"]\s*→\s*[“"]([^”"]+)[”"]/g)) pairs.push([match[1], match[2]]);
    for (const match of rewrite.matchAll(/Replace(?: the)?(?: affected)?(?: duplicate)?(?: option| answer choice| distractor)?\s*[“"]([^”"]+)[”"]\s+with:?\s*[“"]([^”"]+)[”"]/gi)) pairs.push([match[1], match[2]]);
    if (pairs.length) {
      for (const [oldValue, newValue] of pairs) replaceOptionAtSamePosition(question, oldValue, newValue, row);
      handled = true;
    }
  }

  if (!handled && /(?:Replace|Rewrite) (?:the )?(?:keyed|correct) option/i.test(rewrite)) {
    const newValue = quotedAfter(rewrite, /(?:Replace|Rewrite) (?:the )?(?:keyed|correct) option(?: with| as):?\s*/i);
    if (!newValue) throw new Error(`${row["Question ID"]} keyed option replacement is missing its value.`);
    question.options[answerPosition] = newValue;
    handled = true;
  }

  if (!handled && scope === "correct option only" && !/^Keep the stem/i.test(rewrite)) {
    question.options[answerPosition] = rewrite;
    handled = true;
  }

  if (!handled && scope === "first answer choice only") {
    question.options[0] = rewrite;
    handled = true;
  }

  if (!handled) {
    const listMarker = /Replace (?:the )?(three|two|those two|other|affected|two affected) (distractors|options)(?: in their current positions)? with:?\s*/i.exec(rewrite);
    if (listMarker) {
      const segment = rewrite.slice(listMarker.index + listMarker[0].length).split(/Rewrite the feedback as/i)[0];
      const replacements = quotedStrings(segment);
      if (!replacements.length) throw new Error(`${row["Question ID"]} option-list replacement has no values.`);
      const isDistractor = listMarker[2].toLowerCase() === "distractors" || listMarker[1].toLowerCase() === "other";
      let indices;
      const nonCorrect = question.options.map((_, index) => index).filter((index) => index !== answerPosition);
      if (isDistractor && replacements.length === nonCorrect.length) indices = nonCorrect;
      else if (replacements.every((replacement) => question.options.includes(replacement))) indices = [];
      else indices = locateAffectedIndices(question, row, replacements.length, !isDistractor);
      for (let index = 0; index < indices.length; index += 1) question.options[indices[index]] = replacements[index];
      handled = true;
    }
  }

  if (!handled && /Replace (?:the )?affected (?:answer choice|option|distractor)|Replace that distractor|replace the malformed distractor/i.test(rewrite)) {
    const marker = /Replace (?:the )?(?:affected (?:answer choice|option|distractor)|that distractor|malformed distractor)(?: with)?:?\s*/i.exec(rewrite);
    const segment = rewrite.slice(marker.index + marker[0].length).split(/Rewrite the feedback as/i)[0];
    const replacements = quotedStrings(segment);
    if (!replacements.length) throw new Error(`${row["Question ID"]} affected-option replacement has no value.`);
    if (!replacements.every((replacement) => question.options.includes(replacement))) {
      const indices = locateAffectedIndices(question, row, replacements.length, /answer choice|option/.test(marker[0]) && !/distractor/.test(marker[0]));
      for (let index = 0; index < indices.length; index += 1) question.options[indices[index]] = replacements[index];
    }
    handled = true;
  }

  if (!handled && /Replace that distractor/i.test(rewrite)) {
    const newValue = quotedAfter(rewrite, /Replace that distractor with:?\s*/i);
    if (!newValue) throw new Error(`${row["Question ID"]} distractor replacement is missing its value.`);
    if (!question.options.includes(newValue)) question.options[locateAffectedIndices(question, row, 1, false)[0]] = newValue;
    handled = true;
  }

  if (!handled) throw new Error(`${row["Question ID"]} option instruction could not be parsed: ${rewrite}`);
  question.aHash = answerHash(question.options[answerPosition]);
  if (correctIndex(question) !== answerPosition) throw new Error(`${row["Question ID"]} answer-key position changed.`);
  return stable(original) !== stable(question.options);
}

function applyAuthorizedRow(row, entry, registeredAssets) {
  const question = entry.question;
  const before = snapshot(question);
  const beforeAnswerPosition = correctIndex(question);
  const changedFields = [];
  const stem = expectedStem(row, question);
  if (stem != null && question.q !== stem) { question.q = stem; changedFields.push("q"); }
  const feedback = expectedFeedback(row);
  if (feedback != null && question.feedback !== feedback) { question.feedback = feedback; changedFields.push("feedback"); }
  const evidence = EVIDENCE_RESTORATIONS.get(String(row["Question ID"]));
  if (!(evidence?.replaceOption) && applyOptionInstructions(row, question)) changedFields.push("options", "aHash");
  if (evidence) {
    if (!registeredAssets.has(evidence.image)) throw new Error(`${row["Question ID"]} restored asset is not registered: ${evidence.image}`);
    if (question.image !== evidence.image) { question.image = evidence.image; changedFields.push("image"); }
    if (evidence.replaceOption && replaceOptionAtSamePosition(question, evidence.replaceOption[0], evidence.replaceOption[1], row)) changedFields.push("options", "aHash");
    question.aHash = answerHash(question.options[beforeAnswerPosition]);
  }

  if (correctIndex(question) !== beforeAnswerPosition) throw new Error(`${row["Question ID"]} answer-key index changed from ${beforeAnswerPosition}.`);
  const contentChanged = changedFields.length > 0;
  question.sourceCurationPhase = PHASE;
  question.sourceHash = sourceHash(question);
  for (const occurrence of question.sourceOccurrences ?? []) {
    occurrence.sourceHash = question.sourceHash;
    occurrence.sourceCurationPhase = PHASE;
  }
  return {
    contentChanged,
    changedFields: [...new Set(changedFields)].sort(),
    beforeAnswerPosition,
    before,
    after: snapshot(question),
  };
}

function updateLibraryMetadata(library) {
  library.libraryVersion = String(library.libraryVersion).includes(PHASE) ? library.libraryVersion : `${library.libraryVersion}-${PHASE}`;
  library.sourceCurationPhase = PHASE;
  library.sourceGeneratedAt = GENERATED_AT;
  library.generatedAt = GENERATED_AT;
  Object.assign(library.registry, {
    generatedAt: GENERATED_AT,
    curationPhase: PHASE,
    curationSummary: "Approved Principles Micro human-read curation from question_rewrite_master.xlsx.",
    libraryVersion: library.libraryVersion,
    canonicalQuestionCount: library.canonicalQuestionCount,
  });
  delete library.librarySha256;
  delete library.registry.librarySha256;
  library.librarySha256 = sha256(stable(library));
  library.registry.librarySha256 = library.librarySha256;
}

async function render() {
  const rows = await authorizedRows();
  const library = loadLibrary();
  const entries = questionEntries(library);
  const byId = new Map();
  for (const entry of entries) {
    const id = questionId(entry.question);
    if (!byId.has(id)) byId.set(id, []);
    byId.get(id).push(entry);
  }
  const registeredAssets = new Set((library.assetInventory ?? []).map((asset) => asset.runtimePath));
  const previousLedger = fs.existsSync(LEDGER_PATH) ? JSON.parse(fs.readFileSync(LEDGER_PATH, "utf8")) : null;
  const previousById = new Map((previousLedger?.entries ?? []).map((entry) => [String(entry.questionId), entry]));
  const ledgerEntries = [];
  const failures = [];

  for (const row of rows) {
    const id = String(row["Question ID"]);
    const matches = byId.get(id) ?? [];
    if (matches.length !== 1) {
      failures.push({ questionId: id, result: "BLOCKED", reason: `Resolved to ${matches.length} canonical records.` });
      continue;
    }
    const entry = matches[0];
    try {
      const prior = previousById.get(id);
      const workbookBaseline = prior?.before ?? entry.question;
      if (!currentWordingMatches(row, workbookBaseline)) throw new Error(`${id} workbook Current Wording does not match its immutable source state.`);
      const result = applyAuthorizedRow(row, entry, registeredAssets);
      ledgerEntries.push({
        workbookRow: row.workbookRow,
        questionId: id,
        questionSet: row["Question Set"],
        concept: row.Concept,
        canonicalConceptId: entry.conceptId,
        sourceFile: "build/faculty-build-composer/data/composer_library.js",
        sourcePool: entry.pool,
        requestedScope: row["Change Scope"],
        result: prior?.result ?? (result.contentChanged ? "APPLIED" : "ALREADY MATCHED"),
        changedFields: prior?.changedFields ?? result.changedFields,
        answerKeyIndex: result.beforeAnswerPosition,
        note: EVIDENCE_RESTORATIONS.has(id) ? `Restored authoritative registered asset ${entry.question.image}.` : "Approved workbook end state verified.",
        before: prior?.before ?? result.before,
        after: result.after,
      });
    } catch (error) {
      failures.push({ questionId: id, workbookRow: row.workbookRow, result: "BLOCKED", reason: error.message });
    }
  }

  if (failures.length) return { status: "BLOCKED", failures, authorized: rows.length, resolved: ledgerEntries.length };
  updateLibraryMetadata(library);
  const manifest = {
    assetCount: library.assetInventory.length,
    assets: library.assetInventory,
    conceptCount: library.conceptCount,
    canonicalQuestionCount: library.canonicalQuestionCount,
    libraryVersion: library.libraryVersion,
    librarySha256: library.librarySha256,
    generatedAt: GENERATED_AT,
  };
  const reviewManifest = JSON.parse(fs.readFileSync(REVIEW_MANIFEST_PATH, "utf8"));
  reviewManifest.generatedAt = GENERATED_AT;
  reviewManifest.composerLibraryVersion = library.libraryVersion;
  const counts = {
    authorized: rows.length,
    applied: ledgerEntries.filter((entry) => entry.result === "APPLIED").length,
    alreadyMatched: ledgerEntries.filter((entry) => entry.result === "ALREADY MATCHED").length,
    blocked: 0,
    failedVerification: 0,
  };
  const ledger = {
    phase: PHASE,
    generatedAt: GENERATED_AT,
    libraryVersion: library.libraryVersion,
    librarySha256: library.librarySha256,
    workbookPath: "audit_tools/question_rewrite_master.xlsx",
    worksheet: "Proposed Changes",
    counts,
    specialEvidenceRestorations: [...EVIDENCE_RESTORATIONS].map(([questionId, restoration]) => ({ questionId, ...restoration })),
    entries: ledgerEntries,
  };
  const verification = {
    phase: PHASE,
    verifiedAt: GENERATED_AT,
    counts,
    resolvedTotal: ledgerEntries.length,
    expectedTotal: EXPECTED_AUTHORIZED,
    answerKeyPositionsPreserved: ledgerEntries.every((entry) => correctIndex(byId.get(entry.questionId)[0].question) === entry.answerKeyIndex),
    registeredEvidenceAssetsVerified: [...EVIDENCE_RESTORATIONS.values()].every((restoration) => registeredAssets.has(restoration.image)),
    blocked: [],
    failedVerification: [],
  };
  const authorizedRowsArtifact = {
    workbookPath: "audit_tools/question_rewrite_master.xlsx",
    worksheet: "Proposed Changes",
    authorized: rows.length,
    rows,
  };
  const outputs = [
    [LIBRARY_PATH, `window.MQ_COMPOSER_LIBRARY=${JSON.stringify(library)};\n`],
    [REGISTRY_PATH, `${JSON.stringify(library.registry, null, 2)}\n`],
    [MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`],
    [REVIEW_MANIFEST_PATH, `${JSON.stringify(reviewManifest, null, 2)}\n`],
    [AUTHORIZED_ROWS_PATH, `${JSON.stringify(authorizedRowsArtifact, null, 2)}\n`],
    [LEDGER_PATH, `${JSON.stringify(ledger, null, 2)}\n`],
    [VERIFICATION_PATH, `${JSON.stringify(verification, null, 2)}\n`],
  ];
  const staleOutputs = outputs.filter(([file, contents]) => !fs.existsSync(file) || fs.readFileSync(file, "utf8") !== contents).map(([file]) => path.relative(ROOT, file).replaceAll("\\", "/"));
  return { status: "READY", counts, librarySha256: library.librarySha256, outputs, staleOutputs };
}

const generated = await render();
if (generated.status === "BLOCKED") {
  console.error(JSON.stringify(generated, null, 2));
  process.exit(1);
}
if (process.argv.includes("--write")) {
  for (const [file, contents] of generated.outputs) {
    fs.mkdirSync(path.dirname(file), { recursive: true });
    if (!fs.existsSync(file) || fs.readFileSync(file, "utf8") !== contents) fs.writeFileSync(file, contents, "utf8");
  }
  console.log(JSON.stringify({ status: "WROTE", counts: generated.counts, staleOutputsBeforeWrite: generated.staleOutputs, librarySha256: generated.librarySha256 }, null, 2));
} else {
  console.log(JSON.stringify({ status: "DRY_RUN", counts: generated.counts, staleOutputs: generated.staleOutputs, librarySha256: generated.librarySha256 }, null, 2));
}
