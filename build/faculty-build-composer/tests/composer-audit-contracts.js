'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const repoRoot = path.resolve(__dirname, '../../..');
const read = relative => JSON.parse(fs.readFileSync(path.join(repoRoot, 'validation_artifacts', relative), 'utf8'));
const assessmentAudits = [
  'foundations_assessment_audit_2026_09_06',
  'demand_supply_elasticity_assessment_audit_2026_09_06',
  'market_policy_welfare_assessment_audit_2026_09_07'
];
const historicalQuestions = new Map();
for (const file of ['supply_demand_equilibrium_quality_fixes.json', 'foundations_audit_remediation.json', 'graph_assessment_integrity_remediation.json', 'question_rewrite_master_execution_ledger.json']) {
  const ledger = read('question_quality/' + file);
  for (const change of ledger.changes || ledger.entries) historicalQuestions.set(String(change.id || change.questionId), change.after);
}
const revisions = assessmentAudits.flatMap(dir => read(dir + '/changes.json'));

// Completed assessment passes edit the live canonical bank while preserving
// provenance. Replay only recorded after-fields over the earlier full snapshot.
// Validate each recorded before-state too, so an unrelated edit cannot be blessed.
function applyAssessmentRevisions(historical) {
  if (!historical) return undefined;
  const expected = structuredClone(historical);
  const id = String(expected.canonicalId || expected.id);
  for (const change of revisions.filter(row => String(row.id) === id)) {
    for (const [field, value] of Object.entries(change.before)) {
      assert.deepEqual(expected[field], value, `Assessment before-state ${id}.${field}`);
    }
    Object.assign(expected, change.after);
  }
  return expected;
}
const historicalQuestion = id => historicalQuestions.get(String(id));
function provenanceSnapshot(id, current) {
  const firstRevision = revisions.find(row => String(row.id) === String(id));
  return {...current, ...firstRevision?.before, ...historicalQuestion(id), id: String(id)};
}
const currentAuditedQuestion = (id, fallback) => {
  const historical = historicalQuestion(id);
  const firstRevision = revisions.find(row => String(row.id) === String(id));
  if (!historical && !firstRevision && !fallback) return undefined;
  return applyAssessmentRevisions({...fallback, ...firstRevision?.before, ...historical, id: String(id)});
};

function assertAuditedFindings(result, auditName, entries) {
  const audit = read(auditName + '/quality-after.json');
  const dispositionFile = read(auditName + '/quality-dispositions.json');
  const dispositions = Array.isArray(dispositionFile) ? dispositionFile : dispositionFile.dispositions.filter(row => row.presentAfter);
  const selected = new Set(entries.map(entry => String(entry.id)));
  const expected = audit.findings.filter(finding => selected.has(String(finding.questionId)));
  const signature = finding => JSON.stringify([String(finding.questionId || finding.id), finding.rule, finding.severity]);
  assert.equal(result.counts.errors, 0, 'Deterministic question quality defect');
  assert.deepEqual(result.findings.map(signature).sort(), expected.map(signature).sort(), `Unreviewed quality findings: ${auditName}`);
  for (const finding of result.findings) {
    const disposition = dispositions.find(row => signature(row) === signature(finding));
    assert(disposition && (disposition.note || disposition.disposition), `Missing quality disposition: ${signature(finding)}`);
    const recorded = expected.find(row => signature(row) === signature(finding));
    assert.equal(finding.wording, recorded.wording, `Reviewed finding wording changed: ${signature(finding)}`);
  }
}
module.exports = {historicalQuestion, provenanceSnapshot, currentAuditedQuestion, applyAssessmentRevisions, assertAuditedFindings};
