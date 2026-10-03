import fs from 'node:fs';
import path from 'node:path';
import {auditQuestionRecords,collectComposerQuestions,loadComposerLibrary} from '../../audit_tools/question_quality_auditor.mjs';
const root=process.cwd(),croot=path.join(root,'build/faculty-build-composer');
const lib=loadComposerLibrary(path.join(croot,'data/composer_library.js'));
const ledger=JSON.parse(fs.readFileSync('audit_tools/general_economics_wording_graph_cleanup_20261003/expectations.json'));
const ids=new Set(ledger.authorizedIds),assets=new Map();
for(const a of lib.assetInventory||[])for(const k of [a.runtimePath,a.sourceAssetPath,a.sourceUrl,a.filename])if(k)assets.set(String(k).replaceAll('\\','/'),a);
const groups={markets:['demand','supply','market-equilibrium'],foundations:['scarcity-and-tradeoffs','opportunity-cost','production-possibilities-frontier','marginal-analysis','incentives','models-and-assumptions']};
const result={};
for(const [name,concepts]of Object.entries(groups)){
 let entries=collectComposerQuestions(lib,{concepts});
 result[name]=auditQuestionRecords(entries,{assetMap:assets,composerRoot:croot}).findings.filter(f=>ids.has(String(f.questionId)));
 if(name==='markets')result.graphMarkets=auditQuestionRecords(entries.filter(e=>e.question.image||e.question.asset||e.question.graphRequired||/graph/i.test(e.question.type||'')),{assetMap:assets,composerRoot:croot}).findings.filter(f=>ids.has(String(f.questionId)));
}
fs.writeFileSync('tmp/general_economics_wording_graph_cleanup_20261003/quality_snapshot.json',JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify(result,null,2));
