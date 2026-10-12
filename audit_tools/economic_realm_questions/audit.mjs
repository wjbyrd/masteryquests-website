import fs from 'node:fs';
import {games,readLibrary,readBank,bankRows,canonicalRows,uniqueCanonical,normalizeGame,contentFields,answerHash} from './library.mjs';
export const baselineCommit='f98cbdf5e0c4d60d0c0adb8cadbe7006a695b600';
const library=readLibrary(),canonical=uniqueCanonical(canonicalRows(library));
const report={baselineCommit,librarySha256:library.librarySha256,games:{}};
for(const game of games){
 const rows=bankRows(readBank(game,baselineCommit)),mapping=[],concepts={},unmatched=[],ambiguous=[];
 for(const row of rows){
  let candidates=canonical.filter(r=>[...(r.q.sourceOccurrences||[]),r.q].some(o=>normalizeGame(o.sourceGame)===game&&String(o.sourceId)===String(row.q.id)));
  // Numeric IDs are local to a bank. A bare numeric canonical-ID match can
  // belong to an entirely unrelated topic (e.g. National Ledger 42000).
  if(!candidates.length&&!/^\d+$/.test(String(row.q.id)))candidates=canonical.filter(r=>String(r.q.id)===String(row.q.id));
  if(candidates.length>1){const exact=candidates.filter(r=>(r.q.sourceOccurrences||[]).some(o=>normalizeGame(o.sourceGame)===game&&String(o.sourceId)===String(row.q.id)&&o.sourcePool===row.pool));if(exact.length)candidates=exact;}
  if(candidates.length!==1){(candidates.length?ambiguous:unmatched).push({...row,candidates:candidates.map(r=>({id:r.q.id,concept:r.concept,q:r.q.q}))});continue;}
  const match=candidates[0];concepts[match.concept]=(concepts[match.concept]||0)+1;
  const differences=contentFields.filter(k=>JSON.stringify(k==='aHash'?answerHash(row.q):row.q[k])!==JSON.stringify(k==='aHash'?answerHash(match.q):match.q[k]));
  mapping.push({group:row.group,pool:row.pool,index:row.index,id:row.q.id,canonicalId:match.q.id,concept:match.concept,canonicalPool:match.pool,differences});
 }
 report.games[game]={rows:rows.length,uniqueIds:new Set(rows.map(r=>String(r.q.id))).size,matched:mapping.length,unmatched,ambiguous,concepts,mapping};
 console.log(JSON.stringify({game,rows:rows.length,matched:mapping.length,unmatched:unmatched.length,ambiguous:ambiguous.length,concepts}));
}
fs.writeFileSync('audit_tools/economic_realm_questions/id-audit.json',JSON.stringify(report,null,2)+'\n');
