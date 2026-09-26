import fs from 'node:fs/promises';
import path from 'node:path';
import crypto from 'node:crypto';

const root = process.cwd();
const temp = path.join(root, 'tmp/microeconomics_audit');
const out = path.join(root, 'faculty_exports/audits');
const read = async name => JSON.parse(await fs.readFile(path.join(temp, name), 'utf8'));
const write = async (name, value) => fs.writeFile(path.join(out, name), JSON.stringify(value, null, 2) + '\n');
const sha = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const records = await read('projection.json');
const findings = await read('findings_draft.json');
const exports = await read('export_checks.json');
const shared = new Set(await read('shared_general_ids.json'));
const initial = await read('initial_hashes.json');
const numeric = await read('numeric_checks.json');
const matrices = await read('matrix_checks.json');
const images = await read('images.json');
const repetitions = await read('repetition_families.json');
const candidates = await read('automated_candidates.json');
const values = Object.values(records);
const countBy = (items, key) => items.reduce((a, v) => { const k = key(v); a[k] = (a[k] || 0) + 1; return a; }, {});
const idsOf = f => [f.questionID, ...f.relatedQuestionIDs];
const union = fs0 => [...new Set(fs0.flatMap(idsOf))];
const confirmed = findings.filter(f => !f.instructorReviewRequired);
const instructor = findings.filter(f => f.instructorReviewRequired);
const affected = union(findings);
const instructorIDs = union(instructor);
const sourcePath = 'build/faculty-build-composer/data/composer_library.js';
const sourceHash = sha(await fs.readFile(path.join(root, sourcePath)));
const source = {
  path: sourcePath,
  sha256: sourceHash,
  semanticLibrarySha256: 'b8a14754a2d33de0fa65e57f1bd375ed9650f39eb3b80f16302528222d805e9b',
  baselineCommit: '6a29b2f',
  projectionFiles: ['build/faculty-build-composer/course-area-model.js', 'build/faculty-build-composer/composer-core.js'],
  exportFiles: ['faculty_exports/microeconomics_question_bank.csv', 'faculty_exports/microeconomics_question_bank.pdf']
};
for (const f of findings) {
  f.status = f.instructorReviewRequired ? 'INSTRUCTOR REVIEW - NOT A CONFIRMED ERROR' : 'CONFIRMED FINDING';
  f.pdfPage = exports.question_pages[f.questionID];
  for (const q of f.affectedQuestions) q.pdfPage = exports.question_pages[q.questionID];
}
const classes = {
  A: 'Economic validity / ambiguity', B: 'Answer-choice structure', C: 'Metadata / routing',
  D: 'Difficulty - reclassify', E: 'Difficulty - strengthen distractors',
  F: 'Difficulty - rewrite advanced/boss', G: 'Repair → bridge',
  H: 'Redundancy / checkpoint', I: 'Feedback', J: 'Graph / image',
  K: 'Maintenance / helper data', L: 'Instructor review'
};
const summary = {
  totalQuestionsReviewed: values.length,
  totalFindings: findings.length,
  findingsBySeverity: Object.fromEntries(['Critical', 'Major', 'Moderate', 'Minor'].map(s => [s, findings.filter(f => f.severity === s).length])),
  confirmedFindings: confirmed.length,
  confirmedFindingsBySeverity: Object.fromEntries(['Critical', 'Major', 'Moderate', 'Minor'].map(s => [s, confirmed.filter(f => f.severity === s).length])),
  uniqueAffectedQuestions: affected.length,
  uniqueQuestionsWithConfirmedFindings: union(confirmed).length,
  questionsWithNoIdentifiedIssue: values.length - affected.length,
  percentageWithNoIdentifiedIssue: Number(((values.length - affected.length) / values.length * 100).toFixed(2)),
  instructorReviewFindings: instructor.length,
  questionsRequiringInstructorInterpretation: instructorIDs.length,
  instructorReviewQuestionIDs: instructorIDs,
  instructorReviewOnlyQuestions: instructorIDs.filter(id => !union(confirmed).includes(id)).length,
  findingsByActionClass: Object.fromEntries(Object.keys(classes).map(c => [c, findings.filter(f => f.suggestedActionClass === c).length])),
  uniqueAffectedQuestionsByActionClass: Object.fromEntries(Object.keys(classes).map(c => [c, union(findings.filter(f => f.suggestedActionClass === c)).length])),
  uniqueAffectedQuestionsBySeverity: Object.fromEntries(['Critical', 'Major', 'Moderate', 'Minor'].map(s => [s, union(findings.filter(f => f.severity === s)).length]))
};

const preservation = { baselineFilesChecked: Object.keys(initial).length, changedFiles: [], missingFiles: [] };
for (const [relative, expected] of Object.entries(initial)) {
  try {
    const actual = sha(await fs.readFile(path.join(root, relative)));
    if (actual !== expected) preservation.changedFiles.push({ path: relative, expected, actual });
  } catch (e) {
    if (e.code === 'ENOENT') preservation.missingFiles.push(relative); else throw e;
  }
}
preservation.status = preservation.changedFiles.length || preservation.missingFiles.length ? 'FAIL' : 'PASS';
if (preservation.status !== 'PASS') throw new Error('Read-only preservation check failed');

const method = {
  date: '2026-09-26',
  scope: 'Complete current Composer Microeconomics projection; no independent harvesting from polished games.',
  reviewBasis: [
    'Whole-projection identity, answer resolution, metadata, source-pool, asset and export checks on all 6,347 records.',
    'Manual economic and assessment review by concept and generated family, emphasizing advanced/boss, repair/bridge, structural cues and flagged numerical cases; not a claim of a new line-by-line proof of every option on every record.',
    'All 233 distinct image paths visually inspected; questions sharing an asset assessed together. Asset existence and registered checksums checked programmatically.',
    'Previously adjudicated shared General content retained. The current whole-library file hash equals the General exception-closure final hash. New shared findings concern residual role-as-type metadata, not reversals of instructor-approved content or difficulty.',
    'Historical firms/costs/market-structure evidence checked for exact current content equivalence: 2,427 of 2,601 prior records match on stem/options/answer hash/feedback/image/alt/description. This supports review, and does not replace the new documented findings.',
    'Automated warning/review candidates are screening signals, not confirmed defect counts. Only findings with documented economic, instructional or metadata evidence were promoted.'
  ],
  limitation: 'No identified issue means none identified by this combination of whole-bank checks, family review, visual inspection and preserved prior adjudication. It is not a guarantee that every unflagged item is flawless.',
  generalCalibration: 'Easy recognition; Medium direct application; Hard linked conditional reasoning; Elite integrated evidence; Legendary synthesis/counterfactuals/opposing forces. Preserve advanced stems with weak distractors and preserve checkpoint roles when rewriting.',
  nonMutatingValidation: 'Canonical integrity and export readers only. Historical test runners that rewrite artifacts or exports were not executed; this report does not claim a fresh full-suite run.'
};

const index = new Map();
for (const f of findings) for (const id of idsOf(f)) {
  if (!index.has(id)) index.set(id, []);
  index.get(id).push(f.findingID);
}
const concepts = countBy(values, r => r.q.primaryConceptId || r.stored_pools[0].split('/')[1]);
const graphReviews = images.map(im => ({
  ...im,
  visualReview: { inspected: true, surface: 'All 39 contact sheets, with focused full-resolution checks where an inconsistency was suspected.', sourcePathResolved: true, sourceChecksumVerified: true },
  graphValidityFindings: findings.filter(f => f.suggestedActionClass === 'J' && idsOf(f).some(id => im.ids.includes(id))).map(f => f.findingID),
  graphRoutingFindings: findings.filter(f => f.findingID === 'MEA-0112' && idsOf(f).some(id => im.ids.includes(id))).map(f => f.findingID)
}));
const coverage = values.map(r => ({
  questionID: String(r.q.id), primaryConceptId: r.q.primaryConceptId,
  currentDifficulty: r.q.difficulty, canonicalDifficulty: r.q.canonicalDifficulty,
  currentType: r.q.type, instructionalRole: r.q.instructionalRole,
  sourcePool: r.pools, storedSourcePool: r.stored_pools,
  pdfPage: exports.question_pages[String(r.q.id)],
  reviewBasis: { wholeProjectionChecks: true, conceptFamilyReview: true, individualFreshProofreadAsserted: false, sharedGeneralPriorAdjudication: shared.has(String(r.q.id)), imageAssetVisuallyInspected: r.q.image ? true : null },
  disposition: index.has(String(r.q.id)) ? 'FINDING OR INSTRUCTOR REVIEW' : 'NO IDENTIFIED ISSUE',
  findingIDs: index.get(String(r.q.id)) || []
}));
const bridgeContexts = findings.filter(f => f.suggestedActionClass === 'G').flatMap(f => idsOf(f).map(id => {
  const q = records[id].q;
  return { findingID: f.findingID, bridgeQuestionID: id, repairSkill: q.repairSkill, primarySkill: q.primarySkill,
    sameConceptSameRepairSkillQuestionIDs: values.filter(r => r.q.primaryConceptId === q.primaryConceptId && /^repair/i.test(r.q.instructionalRole) && r.q.repairSkill === q.repairSkill).map(r => String(r.q.id)) };
}));

const result = { schemaVersion: 1, audit: 'Microeconomics comprehensive read-only audit', date: method.date, source, method, summary, findings };
await fs.mkdir(out, { recursive: true });
await write('microeconomics_audit_findings.json', result);
await write('microeconomics_audit_coverage.json', { source, method, countsByPrimaryConcept: concepts, questions: coverage });
const exportEvidence = { ...exports };
delete exportEvidence.ids;
delete exportEvidence.all_source_occurrences;
delete exportEvidence.question_pages;
await write('microeconomics_audit_evidence.json', {
  source, method, preservation, numericalChecks: numeric, payoffMatrixChecks: matrices,
  graphReviews, redundancyFamilies: repetitions, bridgeRepairContexts: bridgeContexts,
  bridgeContextCaution: 'These are same-concept, exact-repairSkill matches for implementation navigation; this is not a runtime-selected pairing trace. Where several repairs match, preserve the actual Composer remediation route.',
  automatedScreeningCounts: candidates.counts,
  exportFidelity: { status: 'PASS', ...exportEvidence, visuallyInspectedPDFPages: await read('pdf_visual_pages.json') }
});
await fs.writeFile(path.join(temp, 'graph_review.json'), JSON.stringify(graphReviews, null, 2));
await fs.writeFile(path.join(temp, 'graph_visual_progress.json'), JSON.stringify({ inspectedAssets: images.length, contactSheetsInspected: 39, complete: true }, null, 2));
await fs.writeFile(path.join(temp, 'review_notes.json'), JSON.stringify(method, null, 2));

const esc = x => String(x ?? '').replace(/\|/g, '\\|').replace(/\r?\n/g, ' ');
const table = (headers, rows) => '| ' + headers.join(' | ') + ' |\n| ' + headers.map(() => '---').join(' | ') + ' |\n' + rows.map(row => '| ' + row.map(esc).join(' | ') + ' |').join('\n');
const tableFor = fs0 => table(['Finding', 'Severity', 'Affected questions', 'Issue family', 'Action'], fs0.map(f => [f.findingID, f.severity, idsOf(f).length, f.issue, f.recommendation]));
const group = c => findings.filter(f => f.suggestedActionClass === c);
const canonicalDifficulties = countBy(values, r => r.q.canonicalDifficulty || 'unknown');
const roleType = findings.filter(f => f.issue === 'Assessment role or difficulty is stored as the task type.');
const genericError = findings.filter(f => f.issue === 'commonError supplies a generic label rather than the tested misconception.');
const sharedMetadataCount = affected.filter(id => shared.has(id)).length;
const critical = findings.filter(f => f.severity === 'Critical');
const sections = [];
sections.push(`# Microeconomics comprehensive question-bank audit\n\nDate: ${method.date}. Read-only audit of the current canonical Composer projection. Source baseline: ${source.baselineCommit}.\n\n## 1. Executive Summary\n\nThe current Microeconomics projection contains **6,347 unique questions**. It is structurally valid and its faculty exports faithfully reproduce the source, but the source bank needs a consolidated cleanup. The audit records **${findings.length} grouped findings affecting ${affected.length.toLocaleString('en-US')} unique questions**. Four findings are Critical. The largest affected-ID counts come from task-type and misconception metadata; the highest-priority content defects concern semantic key uniqueness, productive efficiency and graph/key consistency.\n\n${table(['Measure', 'Count'], [
  ['Total Micro questions reviewed', values.length], ['Critical findings', summary.findingsBySeverity.Critical], ['Major findings', summary.findingsBySeverity.Major], ['Moderate findings', summary.findingsBySeverity.Moderate], ['Minor findings', 0], ['Total findings', findings.length], ['Unique affected questions', affected.length], ['Questions with no identified issue', summary.questionsWithNoIdentifiedIssue], ['Percentage with no identified issue', summary.percentageWithNoIdentifiedIssue + '%'], ['Questions requiring instructor interpretation', instructorIDs.length]
])}\n\nThe total includes **112 confirmed findings** (4 Critical, 34 Major, 74 Moderate) and **4 provisional Moderate instructor-review cases** covering five questions. Those four cases are not confirmed errors. Confirmed findings affect 3,053 unique questions; three additional questions are instructor-review-only, and two instructor-review questions also have a separate confirmed finding. Family and severity counts overlap at the question level. “No identified issue” is a review outcome, not a certification of perfection.\n\n**No canonical content, metadata, routing, images, tests, game logic or exports were changed.** SHA-256 comparison of ${preservation.baselineFilesChecked.toLocaleString('en-US')} pre-existing build/export files found no changed or missing files. No cleanup or export regeneration was performed.\n\nThe detailed [JSON worklist](microeconomics_audit_findings.json), [per-question coverage ledger](microeconomics_audit_coverage.json), and [evidence ledger](microeconomics_audit_evidence.json) accompany this report.`);

sections.push(`## 2. Scope and Method\n\nThe authority is \`${sourcePath}\`, interpreted through the current course-area model, Composer core and normal faculty-export projection. Historical sourceGame/sourceFile fields are provenance; no questions were harvested anew from Economic Realm, Macro Command, Micro Domains or Managerial games. IDs are strings and are deduplicated across stored and derived views. Current metadata, not the tier text embedded in a historical ID, controls classification.\n\nThe projection has 30 primary concepts, 1,267 questions shared with General Economics and 5,080 other Micro-projected questions. Records outside this projection were excluded. Forty-eight macro-only integrated-analysis tasks are currently routed into the Micro projection; they remain in the audited denominator and are explicitly flagged for routing review in MEA-0106. They were not silently excluded to make the bank look cleaner.\n\n${method.reviewBasis.map(s => '- ' + s).join('\n')}\n\nThe work combines whole-bank checks with manual family review. It does **not** claim 6,347 independent fresh proofs of every stem, distractor and feedback sentence. Fresh review emphasized advanced and checkpoint families, remediation transfer, all distinct graphics and concrete validity candidates; existing source-matched evidence supports ordinary practice and already adjudicated General content. The coverage ledger distinguishes automated coverage, family review, shared prior adjudication and asset inspection.\n\nGeneral calibration came from the existing metadata, difficulty, repair/bridge, checkpoint, final-verification and exception-closure reports. Instructor-approved content and difficulty choices are retained. Residual role-as-type metadata on ${sharedMetadataCount} shared IDs is a new metadata finding under this audit's explicit scope; it does not reopen those content decisions or assert that the prior targeted cleanup failed its authorized scope.\n\nThe detector produced 1,853 warnings and 1,335 review signals, with zero construction errors. These are overlapping candidates, **not** 3,188 confirmed problems. Examples rejected as false positives include underscore-normalized graph-label matches, accessible numerical graph descriptions, legitimate repeated explanations and historical taxonomy aliases.\n\n${table(['Primary concept', 'Current unique questions'], Object.entries(concepts).sort().map(([k, n]) => [k, n]))}\n\nCanonical file SHA-256: \`${sourceHash}\`. Semantic library SHA-256: \`${source.semanticLibrarySha256}\`.`);

sections.push(`## 3. Bank Integrity\n\nCanonical integrity checks passed: 149 concepts, 9,779 canonical IDs, 9,800 stored occurrences and 507 registered assets in the entire library. The Micro projection contains 6,347 distinct IDs with nonempty stems, four choices, a mechanically resolvable keyed answer, feedback and required classification fields. No duplicate/conflicting projected ID, missing image file, registered asset checksum mismatch or schema/build-breaking defect was found. Semantic multiple-correct-answer defects can still occur despite unique answer hashes (MEA-0004).\n\n${table(['Canonical difficulty', 'Micro questions'], Object.entries(canonicalDifficulties).map(([k, v]) => [k, v]))}\n\nThe 630 \`unknown\` canonical-difficulty records are support-role records handled by the current runtime, not 630 invalid ordinary questions. Calculation-pool membership is also distinct from cognitive difficulty: 232 calculation-role records normalize to Hard without creating a schema error; only documented low-demand items are proposed for reclassification. Legitimate aliases were retained.\n\nNo fresh full-suite result is claimed: historical runners that rewrite fixtures, validation artifacts or exports were not run during this read-only audit. Non-mutating integrity, projection, asset, arithmetic and export checks supply the evidence here.`);

sections.push(`## 4. Economic Validity\n\nThe following are demonstrated source defects, distinct from the instructor conventions in section 12. Critical findings first:\n\n${tableFor(critical)}\n\nOther economic validity and ambiguity findings:\n\n${tableFor(group('A').filter(f => f.severity !== 'Critical'))}\n\nStandalone delivery matters: a baseline cost row or demand equation in a neighboring PDF question does not supply missing data to a randomized Composer item. The cost-change and entry/exit families must become self-contained. Welfare transfers must be distinguished from net consumer-surplus change.\n\nNumerical evidence includes 211 explicit recalculations: linear-demand MR=MC, quadratic costs/profit, discrete global profit, HHI/CR4, repeated-game present value, midpoint elasticity, displayed profit and welfare triangles. Of these, 201 match and 10 expose displayed-precision inconsistencies (five profit and five DWL cases, MEA-0111/0116). Separate documented cost-rounding cases are MEA-0069/0070. These precision issues do not change which distant distractor is intended; they are Moderate consistency defects, not inflated to Critical.\n\nAll 20 distinct payoff matrices were visually checked and their pure-strategy best responses, Nash equilibria and joint-payoff maxima recomputed; these support 66 current image-linked questions. The recomputed matrix solutions agree. Sequential-game trees were inspected for backward-induction consistency. This is evidence for those families, not an assertion that all possible game-theory interpretations were exhaustively proved.`);

sections.push(`## 5. Answer-Choice / Structural Cue Findings\n\nOne structural-completeness finding and five advanced-distractor families are confirmed. The issue is answerability from structure or implausible alternatives, not length alone. In particular, the competitive adjustment family repeatedly contrasts a nuanced adjustment chain with no-entry/exit, permanent-profit or firm-price-setting claims.\n\n${tableFor([...group('B'), ...group('E')])}\n\nAction E explicitly preserves the underlying advanced task and tier while replacing distractors. MEA-0110 should give every option the same requested total-surplus and distribution components. Generic “can differ” game-theory options should become concrete payoff-derived alternatives. Do not apply blanket longest-answer trimming.`);

sections.push(`## 6. Difficulty Alignment\n\nApply the instructor-calibrated cognitive standard: Easy recognition; Medium direct application or one calculation; Hard rule selection and linked conditional reasoning; Elite integrated evidence and transfer; Legendary synthesis, counterfactuals or opposing forces. Graph presence, arithmetic volume and terminology do not independently earn a higher tier.\n\n${tableFor(group('D'))}\n\nThe 16 action-F families in section 8 retain checkpoint roles and require a stronger task. The five action-E families preserve advanced stems and repair distractors. These paths must not be collapsed into a bulk downgrade. Retained richer examples include P62G-MON-L-063/066/096, P62H-MCMP-L-095 and P62F-PC-L-056/065. The reclassification recommendations identify the appropriate cognitive band; when a family spans recognition and application, select the final tier per listed item using its actual task.`);

sections.push(`## 7. Repair → Bridge Progression\n\nRepair should isolate a misconception; bridge should apply the same skill in one new context, representation, calculation or distinction. Eight families covering ${union(group('G')).length} bridge IDs fail that transfer criterion. The recommended change is one meaningful application step, not a broad difficulty increase.\n\n${tableFor(group('G'))}\n\nThe evidence ledger includes same-concept exact-repairSkill matches for each listed bridge so an implementer can navigate back to its repair family. Those links are contextual matches, not an assertion that the runtime always selects that one repair. Preserve the current remediation route and confirm the repaired sequence after rewriting. The already approved P62D-ITP-BR-012 application is not flagged for content repetition; its residual task-type metadata is included separately in action C.`);

sections.push(`## 8. Redundancy / Checkpoint Families\n\nRepeated concepts and retrieval practice are legitimate. The confirmed redundancy concerns are unchanged operations across tiers, predictable directions and checkpoints that add no mastery evidence. The supporting family ledger preserves the exact repeated stems, IDs, keys and tiers for the consumer-choice, inequality and information/behavioral groups.\n\n${tableFor(group('H'))}\n\nCheckpoint strengthening families:\n\n${tableFor(group('F'))}\n\nKeep useful ordinary practice. Vary efficient quantities, equality boundaries, profit signs and representations; use boss versions for reverse inference, changed constraints, diagnosis or policy comparisons. In particular, avoid retaining “three trades” throughout the welfare family and losses throughout the discrete competitive-firm schedules. Do not delete entire template families merely because their mathematical structure repeats.`);

sections.push(`## 9. Metadata / Routing\n\n${table(['Issue family', 'Findings', 'Unique affected questions', 'Action'], [
  ['Assessment role/difficulty stored as task type', roleType.length, union(roleType).length, 'Use a content-based type; preserve role, pool and intended tier.'],
  ['Generic commonError rather than a misconception', genericError.length, union(genericError).length, 'Use an existing specific misconception or omit an optional field where no defensible label exists.'],
  ['Macro-only integrated-analysis routing', 1, 48, 'Classify at record level; retain genuinely mixed Micro tasks.'],
  ['Required payoff-matrix image lacks graphRequired eligibility', 1, 52, 'Set required-image eligibility for the listed matrix-dependent records.']
])}\n\nMEA-0106 concerns the projection source, not export corruption: current integrated-analysis membership includes GDP, CPI, unemployment and AD-AS tasks that do not require Micro reasoning. MEA-0112 is concrete mode eligibility: Composer's graph-trial filtering uses graphRequired, while these numerical matrix tasks need their image. Merely attaching an optional illustration was not treated as a defect.\n\nTopic/tag, objective, primary/secondary/repair skills, misconception, role, stage, source pool, image reference and helper fields were screened against task families and current contracts. No additional confirmed missing-objective or unrelated-skill defect was established. Broad objective aliases and accepted instructional vocabulary are not taxonomy-redesign opportunities. The complete 36-family metadata worklist, exact values and ID membership are in section 14 and JSON.`);

sections.push(`## 10. Feedback Quality\n\nNonempty feedback is not always explanatory. Seven families covering ${union(group('I')).length} unique questions need item-specific reasoning:\n\n${tableFor(group('I'))}\n\nReplace instructions such as “Find mutual best responses” with the actual responses and why their intersection is stable; explain the merger cross-term rather than only saying “Use 2ab.” A formula that genuinely explains a direct formula question was not automatically flagged. Feedback corrections for invalid source keys and graphs belong with their corresponding A/J fixes to prevent contradictory explanations.`);

sections.push(`## 11. Graph / Image Review\n\nAll **233 distinct image paths** used by **1,197 image-bearing questions** were visually inspected across 39 contact sheets, with focused full-resolution review of suspected contradictions. There are 228 distinct file checksums; identical image bytes used under more than one path were not treated as a defect. Every path resolves and matches its registered checksum. The per-asset evidence ledger lists all linked question IDs.\n\n${tableFor(group('J'))}\n\nThe monopoly regulation graph visibly places ATC below the regulated price, contradicting zero-profit feedback. The two kinked-demand diagrams have the wrong local curve/MR geometry for the keyed rigidity explanation. Five long-run monopolistic-competition diagrams do not make MC pass through the displayed minimum ATC; their 13 linked questions require coordinated asset/data review. Correct cost geometry first, then recheck any chosen quantity, excess capacity, markup and welfare references.\n\nShared graph reuse is allowed. Extra graph-required routing is limited to the 52 actually matrix-dependent records in MEA-0112. A graph depiction that is explicitly overridden by a counterfactual stem was not treated as a key contradiction. Numeric alternative text that gives the same information as the image was not treated as answer leakage.`);

sections.push(`## 12. Instructor-Review Cases\n\nThese four cases, covering five IDs, are **not confirmed errors**. Their Moderate labels are provisional worklist priorities, not claims of demonstrated invalidity.\n\n${table(['Finding', 'Questions', 'Interpretive issue', 'Instructor decision needed'], instructor.map(f => [f.findingID, idsOf(f).join(', '), f.issue + ' ' + f.evidence, f.recommendation]))}\n\nResolve the intended model or course convention before modifying these cases. Do not silently convert a defensible conventional reading into a Critical key error.`);

sections.push(`## 13. Aggregate Statistics\n\n${table(['Severity', 'All findings', 'Confirmed findings', 'Unique affected questions (overlapping)'], ['Critical', 'Major', 'Moderate', 'Minor'].map(s => [s, summary.findingsBySeverity[s], summary.confirmedFindingsBySeverity[s], summary.uniqueAffectedQuestionsBySeverity[s]]))}\n\n${table(['Implementation class', 'Findings', 'Unique affected questions (overlapping)'], Object.entries(classes).map(([c, label]) => [c + '. ' + label, summary.findingsByActionClass[c], summary.uniqueAffectedQuestionsByActionClass[c]]))}\n\nThe union is 3,056 affected IDs, not the sum of table rows. The complement is 3,291 IDs (51.85%) with no identified issue. Four instructor-review findings are included in the overall 116, and separated from the 112 confirmed findings. A question can need a graph repair, metadata change and difficulty decision simultaneously.\n\nNo standalone maintenance/helper-data finding was confirmed. The 61 Micro-projected tradeMath records are shared with the already closed General work; no new stale Micro-only helper defect was established. This is a zero finding count for class K, not a proposal to remove helper fields.`);

let work = `## 14. Implementation Worklist\n\nThis is a proposed single consolidated cleanup, **not authorization executed by this audit**. Resolve instructor conventions first; repair economic premises/keys and image geometry before finalizing choices; then apply difficulty/checkpoint/bridge changes; finish metadata and feedback using the revised task. If an ID has several findings, edit it coherently once and close every applicable finding. Preserve IDs and legitimate practice.\n\nAfter an authorized cleanup, refresh answer hashes and necessary registered source/asset metadata through established repository workflows, regenerate the normal exports, and perform read-only verification. Do not edit generated CSV/PDF content directly.\n\nEvery affected ID is listed below and in machine-readable \`affectedQuestions\`. For a family, top-level topic/difficulty/type/sourcePool/pdfPage describe its representative \`questionID\`; each member's own values and PDF start page are retained in \`affectedQuestions\`. \`relatedQuestionIDs\` lists the remaining affected members, not extra unaffected exemplars mentioned in the prose.\n`;
for (const [c, label] of Object.entries(classes)) {
  work += `\n### ${c}. ${label}\n\n`;
  if (!group(c).length) { work += 'No confirmed finding requiring this action.\n'; continue; }
  for (const f of group(c)) {
    work += `#### ${f.findingID}: ${f.issue}\n\n**${f.severity}**; ${idsOf(f).length} affected question(s); instructor judgment required: **${f.instructorReviewRequired ? 'Yes - not a confirmed error' : 'No'}**. Family: \`${f.familyID}\`. Representative PDF start page: ${f.pdfPage}.\n\nEvidence: ${f.evidence}\n\nRecommended action: ${f.recommendation}\n\nAffected IDs: ${idsOf(f).map(id => '\`' + id + '\`').join(', ')}.\n`;
  }
}
sections.push(work);

sections.push(`## 15. Export Fidelity\n\n**PASS.** The current CSV and PDF faithfully reproduce the current canonical Micro projection. They also faithfully reproduce source defects documented above; source validity and export fidelity are separate results. No export was regenerated.\n\n${table(['Check', 'Result'], [
  ['Canonical projection / CSV rows / CSV unique IDs', '6,347 / 6,347 / 6,347'],
  ['CSV fields checked against canonical-derived rows', '169 columns; zero mismatches'],
  ['PDF pages / unique question headers', '4,355 / 6,347'],
  ['Existing exporter PDF content verification', 'PASS: stems, choices, answers, feedback, hints and ID ordering'],
  ['Answer-key markers', 'Zero mismatches'],
  ['Page rendering', 'All 4,355 pages rendered at check scale; zero render failures'],
  ['Content boundary checks', 'Zero out-of-bounds text, replacement-character defects or split question cores'],
  ['Image-bearing question delivery', '1,197; zero missing image pages'],
  ['Navigation', '146 links and 146 outline entries; zero invalid destinations'],
  ['Visual layout inspection', '23 representative and boundary pages; no missing/clipped core content identified'],
  ['Preservation', preservation.baselineFilesChecked + ' pre-existing build/export files unchanged']
])}\n\nNine records have metadata/header material on the preceding page: ${exports.metadata_on_prior_page.map(id => '\`' + id + '\`').join(', ')}. Their stems, choices and keys remain together, and boundary samples were visually checked. This was not promoted into an export defect.\n\nThe JSON worklist includes each affected member's one-based PDF start page. Coverage and evidence ledgers bind results to the source hash above; if the bank changes, re-project and re-resolve those references before implementing the worklist. The reports, support ledgers and temporary analysis are the only files written for this audit.`);

await fs.writeFile(path.join(out, 'microeconomics_audit.md'), sections.join('\n\n') + '\n');
await fs.writeFile(path.join(temp, 'preservation_final.json'), JSON.stringify(preservation, null, 2));
console.log(JSON.stringify({ summary, preservation, reportBytes: (await fs.stat(path.join(out, 'microeconomics_audit.md'))).size }, null, 2));
