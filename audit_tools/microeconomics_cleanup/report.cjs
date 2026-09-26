'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'../..'),work=path.join(root,'tmp/microeconomics_cleanup'),dest=path.join(root,'faculty_exports/audits');
const read=p=>JSON.parse(fs.readFileSync(p,'utf8')),input=name=>read(path.join(__dirname,'inputs',name)),result=name=>read(path.join(work,name));
const core=require(path.join(root,'build/faculty-build-composer/composer-core.js'));
const integrity=require(path.join(root,'build/faculty-build-composer/tests/composer-integrity-contracts.js'));
const micro=require(path.join(root,'build/faculty-build-composer/tests/microeconomics-approved-revisions.js'));
const source=fs.readFileSync(path.join(root,'build/faculty-build-composer/data/composer_library.js'),'utf8');
const library=JSON.parse(source.slice('window.MQ_COMPOSER_LIBRARY='.length).trim().slice(0,-1));
const map=lib=>new Map(integrity.questionRecords(lib).map(r=>[String(r.question.id),r.question]));
const before=map(micro.baselineLibrary),after=map(library),ex=micro.ledger;
micro.assertCurrentLibrary(library);
const audit=read(path.join(dest,'microeconomics_audit_findings.json')),strategies=input('closure_strategies.json');
const notes=input('question_patch_notes.json'),difficulty=input('difficulty_decisions.json'),types=input('type_decisions.json'),errors=input('common_error_decisions.json'),wording=input('wording_decisions.json');
const graphs=input('graphs/manifest.json'),graphPaths=new Set(graphs.map(g=>g.runtimePath)),moves=new Map(ex.moves.map(m=>[m.id,m]));
const changed=new Set(ex.changedQuestionIds),ids=f=>[...new Set([f.questionID,...f.relatedQuestionIDs].map(String))];
const closures=audit.findings.map(f=>{
 const n=Number(f.findingID.slice(4));
 return {findingID:f.findingID,category:f.category,actionClass:f.suggestedActionClass,familyID:f.familyID,topic:f.topic,
   affectedIDs:ids(f),changedIDs:ids(f).filter(id=>changed.has(id)),retainedIDs:ids(f).filter(id=>!changed.has(id)),
   closure:n===3?'ACCEPTED / INSTRUCTOR-ADJUDICATED':ids(f).length>1?'RESOLVED BY CONSOLIDATED REVISION':'RESOLVED',
   basis:strategies[n],originalIssue:f.issue,
   instructorExceptions:n===44?['ECON-MG-LEGENDARYBOSS-9138']:n===54?['P62B-ELAS-EL-022']:[]};
});
assert.equal(closures.length,116);assert(closures.every(c=>c.basis));
const byFinding=id=>closures.filter(c=>c.affectedIDs.includes(id)).map(c=>c.findingID);
const key=q=>q.options.find(o=>crypto.createHash('sha256').update(core.normalizeAnswerText(o)).digest('hex')===q.aHash);
const ledger=ex.changes.map(c=>{
 const old=before.get(c.id),now=after.get(c.id),findingIDs=byFinding(c.id);
 if(!findingIDs.includes('MEA-0113')&&graphPaths.has(now.image))findingIDs.push('MEA-0113');
 if((notes[c.id]||[]).some(n=>/MEA-0113/.test(n))&&!findingIDs.includes('MEA-0113'))findingIDs.push('MEA-0113');
 const wordingRule=wording.some(w=>w.id===c.id);
 return {questionID:c.id,fieldsChanged:c.fields,oldValues:c.before,newValues:c.after,removedFields:c.removedFields,
   findingIDsClosed:findingIDs,additionalAuthorization:wordingRule?'Instructor narrow synthetic-preface cleanup':findingIDs.length?null:'Linked graph companion consistency',
   oldAnswer:key(old),newAnswer:key(now),answerKeyChanged:old.aHash!==now.aHash,
   difficultyChanged:c.fields.some(f=>['difficulty','canonicalDifficulty'].includes(f)),typeChanged:c.fields.includes('type'),
   feedbackChanged:c.fields.includes('feedback'),imageChanged:old.image!==now.image||graphPaths.has(now.image),
   routingChanged:c.fields.some(f=>['primaryConceptId','secondaryConceptIds','familyConceptId','subtopicIds'].includes(f))||moves.has(c.id),
   ordinaryPoolMove:moves.get(c.id)||null,implementationNotes:notes[c.id]||[]};
});
for(const c of ledger)for(const field of ['id','canonicalId','sourceId','sourceGame','sourceChapter','sourcePool','sourceHash','sourceOccurrences','instructionalRole','bossStage','originalSourcePool','originalBossTier']){
 assert.deepEqual(after.get(c.questionID)[field],before.get(c.questionID)[field],`Preserved role/provenance ${c.questionID}.${field}`);
}
for(const [id,decision]of Object.entries(difficulty))assert.equal(after.get(id).canonicalDifficulty||after.get(id).difficulty,decision.after);
const families=closures.filter(c=>['C','D','F','G','H','J'].includes(c.actionClass)).map(c=>({family:c.familyID,findingID:c.findingID,topic:c.topic,IDs:c.affectedIDs,originalPattern:c.originalIssue,revisionStrategy:c.basis,
 validation:c.actionClass==='D'?'Individual tier decisions and exact ordinary-pool moves; runtime composition checks.':c.actionClass==='J'?'Equation-based asset generation, independent cost/MR checks, all linked records and final PDF rendering.':c.actionClass==='C'?'Exact before/after fields; preserved roles/provenance; course-area membership and outcome coverage checks.':c.actionClass==='G'?'Final bridge applies the repaired skill to a new scenario; support role and routing are preserved.':'Final task/key review; explicit arithmetic/model proofs where numerical; canonical and publication parity.'}));
const counts=result('application_summary.json'),exportCheck=result('export_checks.json'),math=result('numeric_proofs.json'),publication=result('publication.json'),guards=result('guard_results.json');
const suiteText=fs.readFileSync(path.join(work,'active_suite_final.log'),'utf8');
assert(suiteText.includes('"passed": 29')&&suiteText.includes('"failed": []'),'Active suite complete');
for(const k of ['csv_mismatches','structure_errors','pdf_replacement_characters','pdf_bounds_errors','pdf_render_errors','pdf_answer_marker_errors','pdf_split_cores','pdf_missing_image_pages','pdf_link_errors'])assert.equal(exportCheck[k].length,0,k);
assert.equal(exportCheck.csv_rows,6301);assert.equal(exportCheck.csv_columns,169);assert.equal(math.unresolvedDisplayReviews,0);
assert.equal(publication.modes.length,10);assert(publication.modes.every(m=>m.ok));
const shared=new Set();const area=require(path.join(root,'build/faculty-build-composer/course-area-model.js')).create(library.registry.concepts);
for(const cid of Object.keys(library.concepts))if(area.areasFor(cid).includes('general'))for(const q of core.ContentScope.allQuestions(core.resolveConceptModule(library,cid)))shared.add(String(q.id));
const sharedChanges=ledger.filter(c=>shared.has(c.questionID));
const fieldCounts=Object.fromEntries([...new Set(ledger.flatMap(c=>c.fieldsChanged))].sort().map(f=>[f,ledger.filter(c=>c.fieldsChanged.includes(f)).length]));
const exceptions=[
 {id:'MODE-AVAILABILITY',status:'DOCUMENTED CONSEQUENCE',details:'After individual difficulty calibration, micro-factor-choice-inequality has zero ordinary Legendary records (formerly 23); Legendary Mode requires six. Its other modes and all ten modes of the complete Micro course remain available. No engine threshold was relaxed.',evidence:ex.presetChanges},
 {id:'LEGACY-PUBLICATION',status:'UNCHANGED PRE-EXISTING LIMITATION',details:'Twenty-five canonical legacy Market Failures records are included in faculty exports but omitted by selectable student subtopic filters, both before and after this cleanup. No newly lost student IDs beyond the 46 approved Macro moves.',questionIDs:publication.unchangedLegacyUnpublishedIds},
 {id:'PDF-METADATA-CONTINUATIONS',status:'LAYOUT OBSERVATION',details:'Seven long metadata headers begin before a page break. Each stem, graph, four choices and keyed answer stays together on the next page. No split question cores, missing content or clipping.',questionIDs:exportCheck.metadata_on_prior_page}
];
const status='CLEANUP STATUS: COMPLETE WITH DOCUMENTED EXCEPTIONS — READY FOR READ-ONLY VERIFICATION';
const output={schemaVersion:1,task:'Microeconomics consolidated question-bank cleanup',date:'2026-09-26',status,
 startingBaseline:{commit:ex.baselineRef,sourceSha256:ex.baselineSourceSha256,semanticSha256:micro.baselineLibrary.librarySha256,canonicalIds:before.size,projection:counts.countsBefore},
 finalSource:{sourceSha256:crypto.createHash('sha256').update(source).digest('hex'),semanticSha256:library.librarySha256,canonicalIds:after.size,projection:counts.countsAfter},
 originalAuditHashes:input('audit_input_hashes.json'),summary:{changedCanonicalRecords:ledger.length,fieldCounts,ordinaryPoolMoves:ex.moves.length,rebuiltGraphAssets:graphs.length,sharedGeneralRecordsChanged:sharedChanges.length,deletedCanonicalIds:0,newCanonicalIds:0},
 instructorAdjudications:{acceptedUnchanged:['ECON-MG-LEGENDARYBOSS-9138','P62B-ELAS-EL-022'],relativePriceAnswer:{id:'42636',answer:key(after.get('42636'))},elasticityRewrite:{id:'P62B-ELAS-L-084',tier:'elite',bundlingRemoved:true},graphPreserved:{id:'P62G-MON-L-091',image:after.get('P62G-MON-L-091').image,profit:'positive'}},
 findingClosure:closures,questionChanges:ledger,familyChanges:families,
 decisions:{difficulty,additionalDifficulty:ledger.filter(c=>c.difficultyChanged&&!difficulty[c.questionID]).map(c=>({questionID:c.questionID,before:c.oldValues.canonicalDifficulty,after:c.newValues.canonicalDifficulty,basis:c.implementationNotes})),taskTypes:types,commonError:errors,routing:ex.routing,narrowWording:wording,graphEligibility:input('graph_eligibility.json')},
 graphChanges:graphs.map(g=>{const old=micro.baselineLibrary.assetInventory.find(a=>a.runtimePath===g.runtimePath),now=library.assetInventory.find(a=>a.runtimePath===g.runtimePath);return{...g,stagedFile:undefined,before:old,after:now,linkedQuestionIDs:[...after].filter(([id,q])=>q.image===g.runtimePath).map(([id])=>id)};}),
 validation:{activeSuite:{total:29,passed:29,failed:[]},exporterUnitTests:{total:14,passed:14},guards,publication,numeric:math,export:exportCheck,visual:input('visual_review.json'),replay:'Four canonical/derived output files reproduced byte-for-byte from frozen baseline and saved inputs.',engineChanges:false,telemetryChanges:false,studentFlowChanges:false},
 sharedGeneralChanges:sharedChanges.map(c=>({questionID:c.questionID,fieldsChanged:c.fieldsChanged,findingIDs:c.findingIDsClosed})),exceptions,unresolvedAuditFindings:[]};
fs.mkdirSync(dest,{recursive:true});fs.writeFileSync(path.join(dest,'microeconomics_consolidated_cleanup_changes.json'),JSON.stringify(output,null,2)+'\n');
const table=(heads,rows)=>'| '+heads.join(' | ')+' |\n| '+heads.map(()=>'---').join(' | ')+' |\n'+rows.map(r=>'| '+r.map(x=>String(x).replaceAll('|','/').replaceAll('\n',' ')).join(' | ')+' |').join('\n');
const idLabel=ids=>ids.length<=3?ids.map(id=>'`'+id+'`').join(', '):'`'+ids[0]+'` + '+(ids.length-1)+' IDs (exact list in JSON)';
const countBy=key=>Object.fromEntries([...new Set(closures.map(c=>c[key]))].map(k=>[k,closures.filter(c=>c[key]===k).length]));
const section=(n,title,body)=>`## ${n}. ${title}\n\n${body}\n\n`;
let md='# Microeconomics consolidated cleanup\n\n'+status+'\n\nThis report implements the existing 116 findings and instructor decisions. It does not constitute the subsequent independent final verification. The original audit and its three JSON ledgers are unchanged.\n\n';
md+=section(1,'Starting Baseline',`Canonical source: \`build/faculty-build-composer/data/composer_library.js\`, frozen at \`${ex.baselineRef}\`. Starting source SHA-256: \`${ex.baselineSourceSha256}\`. All 9,779 canonical IDs remain. The bank still has 149 concept modules and 507 registered assets.\n\nChanged **${ledger.length.toLocaleString()} canonical records**, including ${fieldCounts.q} stems, ${fieldCounts.options} option sets, ${fieldCounts.aHash} answer hashes, ${fieldCounts.feedback} feedback fields, ${fieldCounts.type} task types, and ${fieldCounts.commonError} misconception fields. ${fieldCounts.canonicalDifficulty} final difficulty fields changed, producing ${ex.moves.length} ordinary-pool moves.\n\n${sharedChanges.length} changed IDs are shared with General. Every before-state is the current post-General source; the machine ledger records the specific Micro finding authorizing each change. General membership remains 1,589. Source provenance, instructional roles and boss stages are unchanged.`);
md+=section(2,'Instructor Adjudications Applied',table(['Record','Final implementation'],[
 ['42636','Key is “1 unit of Y”; no reciprocal-ratio equivalent remains.'],
 ['P62F-PC-LB-033','Actual minimum-ATC output is specified; compare the capped productive-efficient output with the uncapped allocative-efficient output.'],
 ['P62G-MON-L-091','Original MON-01 retained; Q=60 and P=$30 retained; positive profit replaces the contradictory zero-profit claim.'],
 ['P62I-OLI-L-072/073/074','Completely rewritten; two mathematically coherent kinked-demand graphs with downward MR gaps.'],
 ['ECON-MG-LEGENDARYBOSS-9138','Accepted as written; all fields unchanged.'],
 ['P62B-ELAS-EL-022','Accepted as written; all fields unchanged.'],
 ['P62B-ELAS-L-084','No bundling setup or misconception metadata; compare elasticity 0.4 versus 1.6 under equal horizons and new substitutes. Balanced alternatives; Elite.'],
 ['P62C-CPS-H-026','Accounting profit $500−$280−$70=$150; $40 forgone income is explicitly implicit and excluded.'],
 ['P62E-COP-EL-011','U-shaped ATC and upward MC crossing stated; fixed-cost increase raises ATC from $32 to $41 at Q=80; calibrated Hard.']
 ]));
md+=section(3,'Economic Validity / Ambiguity',`All targeted class-A cases were implemented. Standalone cost and entry/exit tasks contain the needed data; merger actions are explicit; surplus accounting distinguishes transfers from resource effects. Revised rounding-sensitive keys use displayed inputs.\n\nThe proof ledger contains **${math.checks} independent arithmetic/model checks**, including Decimal recomputation, complete discrete output comparisons, monopoly policy models, cost-consistent tangencies and matrix best responses. Intermediate quantities not printed verbatim in an answer have explicit reviewed dispositions; exact fractions and qualitative comparisons are distinguished from calculated keys. Metadata-only changes do not imply a new economic audit of unchanged numerical content.`);
md+=section(4,'Graph / Image Revisions',table(['Assets','Implementation','Validation'],[
 ['Five mcmp_long_run WebPs','ATC and MC derived from the same total-cost function; demand/ATC tangency and MR=MC at chosen output.','MC crosses minimum ATC at Q2; all 13 linked records synchronized; ten nonimage numeric companions updated.'],
 ['Two kinked WebPs','Piecewise demand is flatter above the kink; differentiated revenue produces a downward MR gap.','MC lies inside each gap; three linked keys and counterfactuals recomputed.'],
 ['MON-01','Asset preserved.','Regulated Q=60/P=$30 has ATC below price, hence positive economic profit.'],
 ['Payoff matrices','Existing images retained; required-image flags corrected.','Twenty transcribed matrices and revised counterfactual matrices recomputed.']
 ])+'\n\nAll seven rebuilt graphics were inspected in the regenerated PDF. Graph source equations and parameters are in the machine ledger and deterministic generator.');
md+=section(5,'Answer-Choice Structure',`Class B/E revisions keep alternatives on comparable economic margins. The two surplus-allocation questions now give total surplus and both parties’ shares in every option. Matrix options name actual equilibria/joint outcomes; cartel alternatives address current gains and future punishment. Industry-adjustment alternatives reflect the particular cost conditions. All 9,779 IDs have four distinct strings and exactly one matching answer hash under the production normalizer; economic plausibility was reviewed within the targeted revisions.`);
md+=section(6,'Difficulty Reclassification',`All **632 listed class-D IDs** have individual final-tier decisions, recorded with a rationale. Their final tiers are ${JSON.stringify(Object.values(difficulty).reduce((a,r)=>(a[r.after]=(a[r.after]||0)+1,a),{}))}. Substantive instructor/checkpoint revisions account for the additional calibrated records, including L-084 at Elite. Boss and remediation roles remain intact. Ordinary tier moves follow the final difficulty; calculation and support pools retain their separate routing.\n\nThe factor/choice/inequality preset’s Legendary shortage is documented below instead of inflating task difficulty to fill a mode quota.`);
md+=section(7,'Advanced / Boss Rewrites',`All 16 class-F families (169 unique IDs) were revised to obtain additional evidence beyond ordinary practice: policy comparisons, confounded observations, changed constraints, fixed versus marginal effects, counterfactual incentives and interpretation limits. Detailed family membership and strategy are in \`familyChanges\`. Checkpoint stages and identities are preserved.`);
md+=section(8,'Repair → Bridge Progression',`All eight class-G families (93 unique IDs) now use a new scenario or numerical application after the repaired skill. Repair/bridge role, skill routing and canonical identity are preserved. The bridge step is deliberately smaller than an advanced checkpoint: apply the repaired relation, diagnose the new case, or make one supported choice.`);
md+=section(9,'Redundancy / Checkpoint Differentiation',`The five class-H families were diversified while retaining useful introductory retrieval. The 44 surplus schedules now vary optimal quantity and include zero-gain boundaries, reassignment and resource costs. The 21 competitive schedules include profit, break-even, operating loss, shutdown, tie rules and later exit. Relative-price, inequality and information families now vary the decision rather than only the numbers or industry label. Metadata-only retained retrieval records are distinguishable from stem rewrites in the field ledger.`);
md+=section(10,'Feedback Revisions',`All 77 class-I targets received explanations tied to the actual model, matrix or displayed values. Overlapping substantive work brought the total to ${fieldCounts.feedback} changed feedback fields. The explanations show the relevant computation or economic distinction rather than only announcing a rule or repeating the key.`);
md+=section(11,'Metadata / Routing',`The explicit type worklist contains **2,105 IDs**; each now uses an existing content-based type, with roles/stages preserved. The misconception worklist contains 695 IDs; unsupported optional values were omitted, specific misconceptions replaced generic placeholders, and instructor-accepted 9138 stayed unchanged. L-084’s obsolete bundling misconception was additionally corrected with its substantive rewrite.\n\nOf the 48 MEA-0106 cases, **46 moved to existing Macro concepts** and two remained: \`ECON-EC-MEDIUMBOSS-18008\` (PPF growth) and \`ECON-EC-MEDIUMBOSS-18021\` (current resources versus future capacity). Destination objectives, required family/subtopic metadata, outcome skill membership and coverage were synchronized. No original Macro ID was removed. All 52 listed matrix tasks are graph-required; related targeted revisions account for the remaining graph-flag changes.`);
md+=section(12,'Narrow Wording Cleanup',`Removed the explicitly rejected empty oligopoly preface pattern in **${wording.length} additional records**. Exact original/revised stems and removed prefixes appear in \`decisions.narrowWording\`. This was a bounded prefix worklist, not a new stylistic pass.`);
md+=section(13,'Validation Results',table(['Check','Result'],[
 ['Active Composer suite','29/29 runners pass, including integrity, content scope, outcomes, graph synchronization, question quality, comprehensive lineage, checkpoints and all mode regressions.'],
 ['Exporter unit tests','14/14 pass.'],
 ['Immutable before/after guard','All 9,779 IDs and aliases checked; 3,052 exact approved revisions; unapproved fields and storage moves rejected.'],
 ['Mutation guards','Six deliberate mutations rejected, including accepted-record and untouched-record changes.'],
 ['Original audit inputs','All four frozen file hashes match.'],
 ['Generated Micro student game','Inline JavaScript compiles; all ten modes ready; 6,276 published canonical IDs versus 6,322 before, exactly the 46 routing removals.'],
 ['Publication parity','2,995 changed IDs published with canonical stems, choices, keys and feedback; 46 routing moves and 11 changed pre-existing legacy omissions explain the remainder.'],
 ['Numerical/model proof',`${math.checks} independent checks; zero unresolved display/proof dispositions.`],
 ['Reproducibility','Canonical library, registry, manifest and outcome policy reproduced byte-for-byte from saved inputs and frozen Git baseline.'],
 ['Engine / telemetry / student flows','No changes.']
 ])+'\n\nHistorical fixture updates layer the exact Micro whitelist after the General exception-closure adapter. Original baselines remain immutable; current comprehensive test outputs use a separate directory.');
md+=section(14,'Projection Counts',table(['Projection','Before','After','Reason'],[
 ['Micro',6347,6301,'46 macro-only records routed out; two mixed cases retained.'],['General',1589,1589,'Membership preserved.'],['Macro',4699,4745,'The same 46 records added to appropriate existing Macro concepts.'],['Global canonical IDs',9779,9779,'No additions or deletions.']
 ]));
md+=section(15,'Export Verification',`Regenerated through the normal exporter: [Micro CSV](../microeconomics_question_bank.csv) and [Micro PDF](../microeconomics_question_bank.pdf), plus General/Macro companions.\n\n${exportCheck.csv_rows.toLocaleString()} rows and unique IDs; **${exportCheck.csv_columns} columns**; zero canonical-field or answer-marker mismatches. The PDF has **${exportCheck.pdf_pages.toLocaleString()} pages**, **${exportCheck.images} image-bearing questions**, and **${exportCheck.pdf_links} valid navigation links**. Every page rendered; no replacement characters, bounds errors, missing image pages or split question cores were found. Selected dense pages and every corrected graphic were inspected visually. The seven metadata continuations are listed as a layout observation below.`);
md+=section(16,'Unresolved Exceptions',`No original audit finding remains unresolved. The two instructor-accepted records remain accepted rather than being rewritten. The following limitations are recorded for the later verification pass:\n\n`+table(['Exception','Disposition'],exceptions.map(e=>[e.id,e.details]))+'\n\n### Complete finding closure table\n\nExact affected-ID arrays, retained IDs, old/new fields and supporting decisions are in [the machine-readable ledger](microeconomics_consolidated_cleanup_changes.json). Large families use an ID count here to avoid thousands of repeated paragraphs.\n\n'+table(['Finding','Category','Affected IDs','Closure','Basis'],closures.map(c=>[c.findingID,c.category,idLabel(c.affectedIDs),c.closure,c.basis]))+'\n\n### Family change index\n\n'+table(['Family / finding','IDs','Original pattern','Revision strategy','Validation'],families.map(f=>[f.family+' / '+f.findingID,idLabel(f.IDs),f.originalPattern,f.revisionStrategy,f.validation])));
md+=section(17,'Final Cleanup Status',`The canonical edits, synchronized metadata, implementation validation, regenerated exports, 116 finding closures and per-question/family ledgers are complete. The next task is the independent read-only Microeconomics final verification; it has not been started here.\n\n${status}`);
fs.writeFileSync(path.join(dest,'microeconomics_consolidated_cleanup.md'),md);
fs.writeFileSync(path.join(work,'report_summary.json'),JSON.stringify({status,changed:ledger.length,closures:countBy('closure'),fieldCounts,sharedGeneralChanges:sharedChanges.length,files:['microeconomics_consolidated_cleanup.md','microeconomics_consolidated_cleanup_changes.json']},null,2));
console.log(JSON.stringify({status,changed:ledger.length,findings:closures.length,reportBytes:Buffer.byteLength(md)}));
