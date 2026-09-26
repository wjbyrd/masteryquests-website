import fs from 'node:fs';
import {loadComposerLibrary,collectComposerQuestions,auditQuestionRecords} from '../../audit_tools/question_quality_auditor.mjs';
const file='validation_artifacts/question_quality/general_economics_exception_closure_expectations.json';
const fixture=JSON.parse(fs.readFileSync(file));const ids=new Set([...fixture.verifiedQuestionIds,...fixture.closureChanges.map(x=>x.id)]);const library=loadComposerLibrary();const assets=new Map();for(const a of library.assetInventory)for(const k of [a.runtimePath,a.sourceAssetPath,a.sourceUrl,a.filename])if(k)assets.set(String(k).replaceAll('\\','/'),a);
const result=auditQuestionRecords(collectComposerQuestions(library).filter(e=>ids.has(e.id)),{assetMap:assets,composerRoot:'build/faculty-build-composer'});
fixture.qualityFindings=result.findings.map(({questionId,rule,severity,wording})=>({questionId,rule,severity,wording}));fs.writeFileSync(file,JSON.stringify(fixture,null,2)+'\n');console.log(JSON.stringify({counts:result.counts,closureFindings:fixture.qualityFindings.filter(f=>fixture.closureChanges.some(c=>c.id===f.questionId))}));
