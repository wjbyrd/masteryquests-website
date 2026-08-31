import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..", "..", "..");
const recordPath = path.join(repoRoot, "validation_artifacts", "question_quality", "supply_demand_equilibrium_quality_fixes.json");
const record = JSON.parse(fs.readFileSync(recordPath, "utf8"));
const expectedById = new Map(record.changes.map(change => [String(change.id), change]));
const auditRemediationPath = path.join(repoRoot, "validation_artifacts", "question_quality", "supply_demand_equilibrium_audit_remediation.json");
const auditRemediation = JSON.parse(fs.readFileSync(auditRemediationPath, "utf8"));
const auditExpectedById = new Map(auditRemediation.changes.map(change => [String(change.id), change]));
const foundationsRemediationPath = path.join(repoRoot, "validation_artifacts", "question_quality", "foundations_audit_remediation.json");
const foundationsRemediation = JSON.parse(fs.readFileSync(foundationsRemediationPath, "utf8"));
const foundationsExpectedById = new Map(foundationsRemediation.changes.map(change => [String(change.id), change]));
const graphIntegrityRemediationPath = path.join(repoRoot, "validation_artifacts", "question_quality", "graph_assessment_integrity_remediation.json");
const graphIntegrityRemediation = JSON.parse(fs.readFileSync(graphIntegrityRemediationPath, "utf8"));
const graphIntegrityExpectedById = new Map(graphIntegrityRemediation.changes.map(change => [String(change.id), change]));
const ALLOWED_RECORD_KEYS = new Set(["q", "feedback", "sourceHash", "sourceCurationPhase", "sourceOccurrences"]);

function stable(value) {
  if (Array.isArray(value)) return `[${value.map(stable).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stable(value[key])}`).join(",")}}`;
  return JSON.stringify(value);
}

function immutableRecord(question) {
  return Object.fromEntries(Object.entries(question || {}).filter(([key]) => !ALLOWED_RECORD_KEYS.has(key)));
}

function immutableOccurrences(question) {
  return (question?.sourceOccurrences || []).map(occurrence => Object.fromEntries(
    Object.entries(occurrence).filter(([key]) => !["sourceHash", "sourceCurationPhase"].includes(key))
  ));
}

export const QUESTION_QUALITY_CURATION_PHASE = record.phase;
export const FOUNDATIONS_QUESTION_QUALITY_CURATION_PHASE = foundationsRemediation.phase;
export const GRAPH_ASSESSMENT_INTEGRITY_CURATION_PHASE = graphIntegrityRemediation.phase;
export const AUTHORIZED_QUESTION_QUALITY_IDS = Object.freeze([...new Set([...expectedById.keys(), ...auditExpectedById.keys(), ...foundationsExpectedById.keys(), ...graphIntegrityExpectedById.keys()])]);
export const AUTHORIZED_MARKET_GATE_AUTHOR_PATH = "play/economic-realm/market-gate/authoring/market_gate_phase2a_author.mjs";

export function isAuthorizedQuestionQualityCuration(id, before, after) {
  const graphIntegrityExpected = graphIntegrityExpectedById.get(String(id));
  if (graphIntegrityExpected) {
    return Boolean(before && after) && stable(before) === stable(graphIntegrityExpected.before) && stable(after) === stable(graphIntegrityExpected.after);
  }
  const foundationsExpected = foundationsExpectedById.get(String(id));
  if (foundationsExpected) {
    return Boolean(before && after) && stable(before) === stable(foundationsExpected.before) && stable(after) === stable(foundationsExpected.after);
  }
  const auditExpected = auditExpectedById.get(String(id));
  if (auditExpected) {
    return Boolean(before && after) && stable(before) === stable(auditExpected.before) && stable(after) === stable(auditExpected.after);
  }
  const expected = expectedById.get(String(id));
  if (!expected || !before || !after) return false;
  if (before.q !== expected.before.q || before.feedback !== expected.before.feedback || before.sourceHash !== expected.before.sourceHash) return false;
  if (after.q !== expected.after.q || after.feedback !== expected.after.feedback || after.sourceHash !== expected.after.sourceHash) return false;
  if (after.sourceCurationPhase !== record.phase) return false;
  if (stable(immutableRecord(before)) !== stable(immutableRecord(after))) return false;
  if (stable(immutableOccurrences(before)) !== stable(immutableOccurrences(after))) return false;
  return (after.sourceOccurrences || []).every(occurrence => occurrence.sourceHash === after.sourceHash && occurrence.sourceCurationPhase === record.phase);
}
