'use strict';
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const approved = require('./general-economics-approved-revisions.js');
const micro = require('./macro-standard-revisions.js');
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
const bankReview = read('question_bank_audit_20260919/revisions.json');
const editorialIds = new Set(micro.editorialLedger.authorizedIds);
const editorialQuality = JSON.parse(fs.readFileSync(path.join(repoRoot,
  'audit_tools/general_economics_wording_graph_cleanup_20261003/quality_dispositions.json'), 'utf8').replace(/^\uFEFF/, '')).findings;
assert(editorialQuality.every(f => editorialIds.has(String(f.questionId)) && f.note), 'Scoped editorial quality dispositions');
const constructIds = new Set(micro.constructLedger.authorizedIds);
const constructQuality = JSON.parse(fs.readFileSync(path.join(repoRoot,
  'audit_tools/general_economics_graph_construct_closure_20261003/quality_dispositions.json'), 'utf8').replace(/^\uFEFF/, '')).findings;
assert(constructQuality.every(f => constructIds.has(String(f.questionId)) && f.note), 'Scoped construct-closure quality dispositions');
const studentWordingQuality = JSON.parse(fs.readFileSync(path.join(repoRoot,
  'audit_tools/microeconomics_student_wording_cleanup_20261004/quality_dispositions.json'), 'utf8')).findings;
const studentWordingQualityIds = new Set(['40020', 'PG1-SUP-L-003']);
assert.deepEqual(studentWordingQuality.map(f => String(f.questionId)).sort(), [...studentWordingQualityIds].sort());
assert(studentWordingQuality.every(f => micro.microStudentWordingLedger.authorizedIds.includes(String(f.questionId)) &&
  f.rule === 'possible-difficulty-overstatement' && f.severity === 'REVIEW' && f.note), 'Exact wording-only lexical dispositions');

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
  const latest=bankReview.find(row=>row.id===id);
  if(latest){
    // The comprehensive runner binds these full before/after records to the
    // recorded Git baseline and checks all untouched fields independently.
    for(const field of new Set([...Object.keys(latest.before),...Object.keys(latest.after)])){
      if(JSON.stringify(latest.before[field])===JSON.stringify(latest.after[field]))continue;
      if(field==='image' && latest.after[field]===null)delete expected[field];
      else expected[field]=latest.after[field];
    }
  }
  return micro.applyApprovedRevisions(approved.applyApprovedRevisions(expected));
}
const historicalQuestion = id => historicalQuestions.get(String(id));
function provenanceSnapshot(id, current) {
  const firstRevision = revisions.find(row => String(row.id) === String(id));
  return {...approved.beforeApprovedRevisions(id, micro.beforeApprovedRevisions(id, current)), ...firstRevision?.before, ...historicalQuestion(id), id: String(id)};
}
const currentAuditedQuestion = (id, fallback) => {
  const historical = historicalQuestion(id);
  const firstRevision = revisions.find(row => String(row.id) === String(id));
  if (!historical && !firstRevision && !fallback) return undefined;
  return applyAssessmentRevisions({...approved.beforeApprovedRevisions(id, micro.beforeApprovedRevisions(id, fallback)), ...firstRevision?.before, ...historical, id: String(id)});
};

function assertAuditedFindings(result, auditName, entries) {
  const audit = read(auditName + '/quality-after.json');
  const dispositionFile = read(auditName + '/quality-dispositions.json');
  const dispositions = Array.isArray(dispositionFile) ? dispositionFile : dispositionFile.dispositions.filter(row => row.presentAfter);
  const selected = new Set(entries.map(entry => String(entry.id)));
  const revisedIds=new Set(bankReview.map(c=>c.id));
  const latestAudit=read('question_bank_audit_20260919/quality-after.json');
  const earlierExpected = [...audit.findings.filter(finding => selected.has(String(finding.questionId))&&!revisedIds.has(String(finding.questionId))),...latestAudit.findings.filter(finding=>selected.has(String(finding.questionId))&&revisedIds.has(String(finding.questionId)))];
  const priorExpected = [...earlierExpected.filter(finding => !approved.approvedIds.has(String(finding.questionId))),
    ...approved.ledger.qualityFindings.filter(finding => selected.has(String(finding.questionId)))];
  const editorialExpected = [...priorExpected.filter(f => !editorialIds.has(String(f.questionId))),
    ...editorialQuality.filter(f => selected.has(String(f.questionId)))];
  const constructExpected = [...editorialExpected.filter(f => !constructIds.has(String(f.questionId))),
    ...constructQuality.filter(f => selected.has(String(f.questionId)))];
  const expected = [...constructExpected.filter(f => !studentWordingQualityIds.has(String(f.questionId))),
    ...studentWordingQuality.filter(f => selected.has(String(f.questionId)))];
  const signature = finding => JSON.stringify([String(finding.questionId || finding.id), finding.rule, finding.severity]);
  assert.equal(result.counts.errors, 0, 'Deterministic question quality defect');
  assert.deepEqual(result.findings.map(signature).sort(), expected.map(signature).sort(), `Unreviewed quality findings: ${auditName}`);
  for (const finding of result.findings) {
    const disposition = studentWordingQualityIds.has(String(finding.questionId))
      ? studentWordingQuality.find(row => signature(row) === signature(finding))
      : constructIds.has(String(finding.questionId))
      ? constructQuality.find(row => signature(row) === signature(finding))
      : editorialIds.has(String(finding.questionId))
      ? editorialQuality.find(row => signature(row) === signature(finding))
      : approved.approvedIds.has(String(finding.questionId))
      ? {note: 'Exact current state recorded by final verification and targeted exception closure.'}
      : dispositions.find(row => signature(row) === signature(finding)) || (revisedIds.has(String(finding.questionId)) ? {note:bankReview.find(c=>c.id===String(finding.questionId)).reasons.join(' ')} : null);
    assert(disposition && (disposition.note || disposition.disposition), `Missing quality disposition: ${signature(finding)}`);
    const recorded = expected.find(row => signature(row) === signature(finding));
    assert.equal(finding.wording, recorded.wording, `Reviewed finding wording changed: ${signature(finding)}`);
  }
}
module.exports = {historicalQuestion, provenanceSnapshot, currentAuditedQuestion, applyAssessmentRevisions, assertAuditedFindings};
