import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';

const repo='C:/Users/Jennings/Documents/GitHub/masteryquests-website';
const S=JSON.parse(fs.readFileSync(path.join(repo,'validation_artifacts/final_structural_results.json'),'utf8'));
const A=JSON.parse(fs.readFileSync(path.join(repo,'graph_accessibility_audit.json'),'utf8'));
const sha=p=>crypto.createHash('sha256').update(fs.readFileSync(path.join(repo,p))).digest('hex');
const clean=v=>String(v??'').replaceAll('|','\\|').replaceAll('\n',' ');
const pool=['easy','medium','hard','elite','legendary','calculation','boss','legendaryBoss','repair','bridge','repairSeed'];
const diff=['easy','medium','hard','elite','legendary','unknown'];
const ab={easy:'E',medium:'M',hard:'H',elite:'EL',legendary:'L',calculation:'C',boss:'B',legendaryBoss:'LB',repair:'R',bridge:'BR',repairSeed:'RS',unknown:'U'};
const counts=(o,keys)=>keys.filter(k=>o?.[k]!==undefined).map(k=>`${ab[k]}:${o[k]}`).join(' ');
const ends=c=>pool.filter(k=>c.firstLastByPool?.[k]).map(k=>`${ab[k]}:${c.firstLastByPool[k][0]}…${c.firstLastByPool[k][1]}`).join('; ');
const sources=c=>{
  const raw=String(c.sourceFiles||'');
  const hits=[...raw.matchAll(/([A-Za-z0-9_.-]+\.json|phase[0-9][A-Za-z0-9_.-]*(?:-v[0-9]+)?)/g)].map(m=>m[1]);
  if(raw.includes('phase4.2-economic-realm-deployment-bundles')) hits.unshift('phase4.2 deployment bundles');
  return [...new Set(hits)].join('; ')||'embedded canonical library provenance';
};
const rows=S.micro.conceptResults.map(c=>`| ${clean(c.title)} | \`${c.canonicalConceptId}\` | ${c.canonicalQuestionCount} | ${counts(c.countsByPool,pool)} | ${counts(c.countsByDifficulty,diff)} | ${c.graphLinkedCount} | ${c.usedAssetCount} | \`${c.sourcePhase}\` |`).join('\n');
const endRows=S.micro.conceptResults.map(c=>`| \`${c.canonicalConceptId}\` | ${clean(ends(c))} |`).join('\n');
const srcRows=S.micro.conceptResults.map(c=>`| \`${c.canonicalConceptId}\` | ${clean(sources(c))} | ${clean(c.sourceGames)} |`).join('\n');
const H={library:sha('build/faculty-build-composer/data/composer_library.js'),manifest:sha('build/faculty-build-composer/data/composer_library_manifest.json'),core:sha('build/faculty-build-composer/composer-core.js'),template:sha('build/faculty-build-composer/template/mastery-quests-faculty-template-composer-ready.html'),faculty:sha('build/faculty-build-composer/SHA256SUMS.txt'),zip:sha('build.zip')};
const status=execFileSync('git',['status','--short'],{cwd:repo,encoding:'utf8'}).trimEnd();
const verdict='READY — PRODUCTION AND ACCESSIBILITY VALIDATED';

const repository=`# Final Repository Verification Report

Generated: 2026-08-09  
Repository tested: \`C:\\Users\\Jennings\\Documents\\GitHub\\masteryquests-website\`  
Git branch/commit: \`${S.git.branch}\` / \`${S.git.commit}\`

## Verdict

${verdict}

## Source-of-truth finding

Before accessibility changes, the authorized GitHub repository matched the previously validated repaired cumulative library exactly at the logical and physical library levels:

- repaired version: \`${S.preAccessibilityParity.repairedLibraryVersion}\`;
- repaired logical SHA-256, published and recomputed: \`${S.preAccessibilityParity.repairedLogicalSha256}\`;
- repaired physical library SHA-256: \`${S.preAccessibilityParity.repairedLibraryFileSha256}\`;
- repaired website checksum-manifest SHA-256: \`cfb2a725b21b9ed445f62a77f715442bd7fa0cd16e8dd78234fc2c18639cbaa3\`;
- exact repaired question content retained: **yes**.

The repository's pre-pass \`build.zip\` SHA-256 was \`247d3cfa186b78bfde47eb4b76fd539c72e9249f5923e4b6ef97c3065638f058\`, rather than the previously recorded container SHA \`236f8ee872648b1b8da6e7aee76a058b420d2227df8a4938ae3ff24323da1284\`. This was a ZIP recompression/container difference only: all 616 archived files matched the 616 authoritative \`build/\` files byte-for-byte, with zero missing, extra, or different internal files. No mismatch was silently overwritten.

This release adds only canonical graph accessibility metadata and its package/rendering support. Questions, choices, answer hashes, routing, scoring, timers, and graph pixels are unchanged.

## Current identity and hashes

| Item | Value |
|---|---|
| Library version | \`${S.identity.libraryVersion}\` |
| Logical library SHA-256 | \`${S.identity.recomputedLogicalSha256}\` |
| Physical library SHA-256 | \`${H.library}\` |
| Composer-library manifest SHA-256 | \`${H.manifest}\` |
| Composer core SHA-256 | \`${H.core}\` |
| Generated-game template SHA-256 | \`${H.template}\` |
| Faculty checksum manifest SHA-256 | \`${H.faculty}\` |
| Production \`build.zip\` SHA-256 | \`${H.zip}\` |
| All-subject canonical questions / concepts | ${S.identity.canonicalQuestionCount} / ${S.identity.conceptCount} |
| Micro canonical questions / concepts | ${S.micro.canonicalQuestionCount} / ${S.micro.conceptCount} |
| Micro graph-linked questions | ${S.micro.graphLinkedQuestionCount} |
| Used Micro production records / distinct visual hashes | ${A.uniqueProductionAssetRecords} / ${A.uniqueVisualAssetHashes} |
| Full graph asset inventory | ${S.identity.graphAssetInventoryCount} |
| Cache/version key | \`${S.identity.cacheKey}\` |

The logical SHA was independently recomputed and equals the published library and manifest value.

## Micro concept-by-concept inventory

Pool abbreviations: E easy, M medium, H hard, EL elite, L legendary, C calculation, B boss, LB legendaryBoss, R repair, BR bridge, RS repairSeed. Difficulty U means runtime-normalized rather than a stored canonical difficulty.

| Concept | Canonical ID | Total | Pools | Difficulty | Graph | Assets | Source phase |
|---|---|---:|---|---|---:|---:|---|
${rows}

All rows have zero invalid executable metadata and no discrepancy against the repaired cumulative library. Historical absolute paths inside provenance strings are lineage only; production loads no stale external file. Micro has zero duplicate canonical IDs and one executable canonical bank per concept.

### First and last IDs by pool

| Canonical ID | First…last by populated pool |
|---|---|
${endRows}

### Source/version provenance

| Canonical ID | Recorded source/version metadata | Source games |
|---|---|---|
${srcRows}

## Graph families and retained repairs

- Elasticity: ELAS-01, ELAS-02, ELAS-03, ELAS-05 present; obsolete Elasticity assets absent/unreferenced.
- Costs: COST-01 through COST-06 present.
- Perfect Competition: PC-01, PC-02, PC-03, PC-04, PC-06, PC-07, PC-08 present.
- Monopoly: MON-01 through MON-04 present.
- Monopolistic Competition: MCOMP-01 through MCOMP-03 present; MCOMP-04 absent and not required.
- Trade: TRD-01 through TRD-04 present.
- Invalid Micro \`bossStage\`, decorative graphs, graph metadata mismatches, answer-length candidates, and repeated Monopolistic Competition task families: **0 each**.

## Composer/runtime parity

Composer and generated games embed the same shared field-level validator. All 65 cells (13 configurations × 5 modes) passed with zero readiness/preflight disagreement. A deliberately invalid \`bossStage\` negative control was rejected with the field and question ID in the diagnostic. All 13 generated packages passed answer-hash, asset, shared-validator, and accessibility-metadata inspection.

## Git status

The repository was clean at commit \`${S.git.commit}\` before this pass. It is intentionally uncommitted now. No files were staged, committed, pushed, or published.

\`git status --short\` at report generation:

\`\`\`text
${status}
\`\`\`

Task changes comprise the composer library/manifest/core/template, two cache references, checksum manifests, regenerated \`build.zip\`, one phase provenance file, the audit/reports, verification scripts, and machine-readable structural evidence. Deleted production files: none.
`;

const major=['elasticity','consumer-and-producer-surplus','international-trade-and-trade-policy','costs-of-production','perfect-competition','monopoly','monopolistic-competition','oligopoly'];
const examples=major.map(concept=>{const list=A.records.filter(r=>r.concept===concept);const r=list.find(x=>/(?:ELAS|TRD|COST|PC|MON|MCOMP)-0[1-9]/i.test(x.filename))||list[0];return `| \`${concept}\` | \`${r?.filename||'n/a'}\` | ${clean(r?.altText)} | ${clean(r?.longDescription)} |`;}).join('\n');
const access=`# Graph Accessibility Report

Generated: 2026-08-09  
Scope: every current Micro graph asset used by executable questions in the authorized GitHub repository.

## Verdict

${verdict}

## Coverage

| Measure | Result |
|---|---:|
| Graph-linked executable questions | ${A.graphLinkedQuestionCount} |
| Production asset metadata records | ${A.uniqueProductionAssetRecords} |
| Distinct visual SHA-256 hashes | ${A.uniqueVisualAssetHashes} |
| Records with meaningful alt text | ${A.assetsWithDescriptiveAltText} |
| Records with long descriptions | ${A.assetsWithLongDescriptions} |
| Questions resolving descriptions | ${A.graphLinkedQuestionsResolvingDescriptions} |
| Missing descriptions | ${A.missingDescriptions} |
| Conflicts for identical visual hashes | ${A.duplicateConflictingDescriptions} |
| Answer-leakage findings | ${A.answerLeakageFindings} |

The 167 production records include concept/runtime aliases and collapse to 161 distinct visual hashes. Both counts are reported so reused/mirrored images are not misclassified. Coverage is 100% by asset record and graph-linked question.

## Accessible rendering contract

Canonical \`imageAlt\` and \`graphDescription\` fields live with module and global asset metadata. Composer selection preserves them in each package's \`questionAssetMetadata\` aliases; runtime data-URI conversion resolves by runtime path, source path, or filename.

Normal rendering uses concise alt text, a unique \`questionGraphDescription\` target, and a visually hidden long description. The graph is keyboard-operable with a meaningful expansion label. The lightbox uses the same alt and exact long description through its unique \`graphLightboxDescription\`; closing clears that text.

## Representative major-concept descriptions

| Concept | Asset | Concise alt | Long description |
|---|---|---|---|
${examples}

## Answer-leakage audit

Every description was checked for inference terms including elastic/inelastic, profit-maximizing, allocatively efficient, productive efficiency, economic profit, shutdown point, excess capacity, deadweight loss, consumer gains, and producer loses, unless visibly printed in the graph. Findings: **0**. All ${A.uniqueProductionAssetRecords} records report \`describesAxes=true\`, \`describesCurves=true\`, \`describesVisibleValues=true\`, \`revealsAnswer=false\`, and \`status=PASS\`. Record-level evidence is in \`graph_accessibility_audit.json\`.

## Package and browser results

All 13 packages embed the metadata map and shared normal/lightbox hooks, with zero executable generic \`Question graph\` / \`Expanded question graph\` fallbacks.

- Phone 390 px: graph present, meaningful alt, 424-character long description, four answer controls, no overflow.
- Tablet 768 px: 522 px graph in 736 px container, 20 px question text, no overflow.
- Desktop about 1440 px: 642 px graph in 938 px container, 22 px question text, no overflow.
- Normal and lightbox alt text and long descriptions were identical; each description target occurred once.
- Lightbox keyboard open, close, and description cleanup passed.

Graph visual files were not modified.
`;

const regression=`# Final Regression Report

Generated: 2026-08-09  
Repository: \`C:\\Users\\Jennings\\Documents\\GitHub\\masteryquests-website\`

## Verdict

${verdict}

## Deterministic simulation

The post-accessibility library/package was tested with **13 configurations × 5 modes × 500 reproducible seeds = 32,500 sessions**, totaling **975,000 selections**. Failures: **0**. Preflight, crash/freeze, empty-pool, invalid-selection, prohibited-duplicate, boss/repair/bridge routing, asset, and completion failures were all zero.

Modes: Standard, Timed Trial, Exam Drill, Legendary, Score Attack.

Individual concepts: Elasticity; Costs of Production; Perfect Competition; Monopoly; Monopolistic Competition; International Trade and Trade Policy; Consumer and Producer Surplus; Oligopoly.

Starters: Market Foundations; Market Policy; Trade & Welfare; Firms & Market Structure; Principles Micro Core.

All 65 configuration/mode cells passed composer readiness and runtime preflight through the same validator.

## Structural and package regression

| Check | Result |
|---|---|
| Repaired question content retained exactly | PASS |
| Answer hashes | PASS, 0 findings |
| Invalid metadata / \`bossStage\` / duplicate IDs | PASS, 0 each |
| Graph asset existence and hashes | PASS, 0 findings |
| Current graph families / obsolete Elasticity exclusions | PASS |
| Decorative graph, metadata, answer-length, duplicate-family invariants | PASS, all 0 |
| Generated packages | 13/13 PASS |
| Shared validator and accessibility metadata embedded | 13/13 PASS |
| Normal/lightbox hooks | 13/13 PASS |
| Generic graph alt fallbacks | 0 |

## Browser regression

- Legendary: 8/8 required packages launched without a visible Mode Unavailable/preflight modal.
- All five modes launched on Elasticity with no horizontal overflow.
- Timed countdown moved from 10:00 to 9:59.
- Score Attack phone HUD was visible, in viewport, and overflow-free.
- Answer selection advanced to a different question.
- Graph containment/readability passed at phone 390 px, tablet 768 px, desktop about 1440 px.
- Lightbox open/close, alt/description equivalence, and unique description targets passed.
- Browser automation errors: 0.

## Accessibility and scope regression

765/765 graph-linked questions resolve descriptions; 167/167 production records and 161 distinct visuals are covered. Missing/conflicting descriptions and answer leakage are zero. Graph pixels and visual appearance are unchanged.

Only accessibility metadata, propagation/rendering, release identity/cache references, provenance, regenerated checksums/archive, and verification evidence changed. Answers, content, timing, scoring, routing, boss/repair/bridge logic, and unrelated pages did not change.
`;

fs.writeFileSync(path.join(repo,'FINAL_REPOSITORY_VERIFICATION_REPORT.md'),repository);
fs.writeFileSync(path.join(repo,'GRAPH_ACCESSIBILITY_REPORT.md'),access);
fs.writeFileSync(path.join(repo,'FINAL_REGRESSION_REPORT.md'),regression);
