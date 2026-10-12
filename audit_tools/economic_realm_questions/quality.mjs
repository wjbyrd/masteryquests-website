import fs from 'node:fs';
import {games,readBank,bankRows,readLibrary,canonicalRows,uniqueCanonical} from './library.mjs';
import {auditQuestionRecords} from '../question_quality_auditor.mjs';
const plan=JSON.parse(fs.readFileSync('audit_tools/economic_realm_questions/selection.json'));
const library=readLibrary(),ids=new Set(Object.values(plan.games).flatMap(g=>[...g.mapped,...g.added]).map(r=>String(r.canonicalId)));
const entries=uniqueCanonical(canonicalRows(library)).filter(r=>ids.has(String(r.q.id))).map(r=>({id:r.q.id,conceptId:r.concept,pools:new Set([{repairQuestions:'repair',repairSeedQuestions:'repairSeed',bridgeQuestions:'bridge'}[r.pool]||r.pool]),question:r.q}));
const assetMap=new Map();
for(const a of library.assetInventory)for(const k of [a.runtimePath,a.sourceAssetPath,a.sourceUrl,a.filename])if(k)assetMap.set(k,a);
const result=auditQuestionRecords(entries,{assetMap});
const out='validation_artifacts/economic_realm_questions';fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(`${out}/canonical-quality.json`,JSON.stringify(result,null,2)+'\n');
console.log(JSON.stringify({questions:entries.length,counts:result.counts,rules:result.findings.reduce((a,r)=>(a[`${r.severity}:${r.rule}`]=(a[`${r.severity}:${r.rule}`]||0)+1,a),{})}));
for(const game of games){
 const byId=new Map();
 for(const row of bankRows(readBank(game))){
  const q=row.q,id=String(q.canonicalId||q.id),pool=row.group==='questionBanks'?row.pool:row.group==='microSkillBridgePools'?'bridge':'repair';
  // Legacy support difficulty strings encode role, not cognitive difficulty.
  // Match the Composer runtime validator's optional-difficulty contract.
  const view=pool==='repair'||pool==='bridge'?{...q,canonicalDifficulty:q.canonicalDifficulty||'unknown'}:q;
  if(!byId.has(id))byId.set(id,{id,conceptId:q.primaryConceptId||plan.games[game].mapped.find(m=>m.id===q.id)?.concept,pools:new Set(),question:view});
  byId.get(id).pools.add(pool);
 }
 const actual=auditQuestionRecords([...byId.values()],{assetMap});
 fs.writeFileSync(`${out}/${game}-quality.json`,JSON.stringify(actual,null,2)+'\n');
 console.log(JSON.stringify({game,counts:actual.counts,rules:actual.findings.reduce((a,r)=>(a[`${r.severity}:${r.rule}`]=(a[`${r.severity}:${r.rule}`]||0)+1,a),{})}));
}
