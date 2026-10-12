import fs from 'node:fs';
import assert from 'node:assert/strict';
import {games,readLibrary,readBank,bankRows,canonicalRows,uniqueCanonical,normalize} from './library.mjs';
import overrides from './overrides.mjs';
import {retained} from './retained.mjs';
import {fullConcepts,existingSkillOnlyConcepts,limits,excludedExpansionText} from './scope.mjs';
const audit=JSON.parse(fs.readFileSync('audit_tools/economic_realm_questions/id-audit.json'));
const library=readLibrary(),canonical=uniqueCanonical(canonicalRows(library)),byId=new Map(canonical.map(r=>[String(r.q.id),r]));
const ordinary=['easy','medium','hard','elite','legendary'];
export function destination(r){
 if(r.pool==='legendaryBoss')return 'legendaryBoss';
 if(r.pool==='boss')return r.q.checkpointPool||r.q.originalBossTier||({opening:'easyBoss',middle:'mediumBoss',final:'finalBoss'})[r.q.challengeStage]||({easy:'easyBoss',medium:'mediumBoss',hard:'finalBoss'})[r.q.canonicalDifficulty];
 return ordinary.includes(r.q.canonicalDifficulty)?r.q.canonicalDifficulty:ordinary.includes(r.pool)?r.pool:null;
}
const fingerprint=q=>normalize(q.q).replace(/[\d,.]+/g,'#');
const plan={baselineCommit:audit.baselineCommit,librarySha256:library.librarySha256,limits,games:{}};
for(const game of games){
 const old=bankRows(readBank(game,audit.baselineCommit)),mapped=[],used=new Set(),stems=new Set(),skills=new Map();
 for(const row of old){
  const retainedConcept=retained[game]?.[row.q.id];
  if(retainedConcept){
   mapped.push({id:row.q.id,oldGroup:row.group,group:row.group,oldPool:row.pool,pool:row.pool,index:row.index,concept:retainedConcept,retained:true,reason:'Reviewed phase-2 supplement has no corresponding Composer source record; preserve its assessed coverage.'});
   stems.add(fingerprint(row.q));
   if(!skills.has(retainedConcept))skills.set(retainedConcept,new Set());
   skills.get(retainedConcept).add(row.q.primarySkill);
   continue;
  }
  const direct=audit.games[game].mapping.find(m=>m.group===row.group&&m.pool===row.pool&&m.index===row.index);
  const override=overrides[game]?.[row.q.id];
  const id=override?.[0]||direct?.canonicalId,r=byId.get(String(id));
  assert(r,`${game}: unresolved ${row.q.id}`);
  const reclassifiedBridge=row.group==='questionBanks'&&!/Boss$/.test(row.pool)&&!destination(r)&&r.role==='bridgeQuestions';
  mapped.push({id:row.q.id,oldGroup:row.group,group:reclassifiedBridge?'microSkillBridgePools':row.group,oldPool:row.pool,index:row.index,canonicalId:r.q.id,concept:r.concept,
   pool:reclassifiedBridge?r.q.repairSkill:row.group==='questionBanks'?(/Boss$/.test(row.pool)?row.pool:destination(r)):row.pool,
   reason:override?.[1]||'Source-game/source-ID provenance match'});
  used.add(String(r.q.id));stems.add(fingerprint(r.q));
  if(!skills.has(r.concept))skills.set(r.concept,new Set());
  [row.q.primarySkill,r.q.primarySkill].filter(Boolean).forEach(s=>skills.get(r.concept).add(s));
 }
 assert(mapped.every(m=>m.pool),`${game}: unknown difficulty`);
 const concepts=new Set(mapped.map(m=>m.concept));
 const full=new Set(fullConcepts[game]);
 for(const c of full)assert(concepts.has(c),`${game}: expansion has no baseline evidence: ${c}`);
 const eligible=r=>concepts.has(r.concept)
  &&(full.has(r.concept)||(existingSkillOnlyConcepts.includes(r.concept)&&skills.get(r.concept).has(r.q.primarySkill)))
  &&[...(r.q.secondaryConceptIds||[]),...(r.q.requiredConceptIds||[])].every(c=>concepts.has(c))
  &&!excludedExpansionText.test(r.q.q+' '+r.q.options.join(' '))
  &&!used.has(String(r.q.id))&&!stems.has(fingerprint(r.q));
 const added=[],buckets=new Map(),coveredSkills=new Map();
 // Prefer new assessed skills within each explicitly allowed concept, then
 // distinct scenarios. Fixed ordering and limits make selection reproducible.
 const candidates=canonical.filter(eligible).sort((a,b)=>Number(a.role!=='main')-Number(b.role!=='main')||Number(skills.get(a.concept).has(a.q.primarySkill))-Number(skills.get(b.concept).has(b.q.primarySkill))||String(a.q.id).localeCompare(String(b.q.id)));
 for(const r of candidates){
  if(!eligible(r))continue;
  let group,pool,limit;
  if(r.role==='main'){
   group='questionBanks';pool=destination(r);if(!pool)continue;
   limit=/Boss$/.test(pool)?limits.checkpointPerConceptStage:limits.ordinaryPerConceptDifficulty;
  }else{
   group=r.role==='bridgeQuestions'?'microSkillBridgePools':r.role==='repairSeedQuestions'?'skillRepairSeedPools':'microSkillRepairPools';
   // Support additions must address a skill actually assessed by this game,
   // including new in-scope ordinary/checkpoint questions selected above.
   const routes=new Set([...old.filter(x=>x.group===group).map(x=>x.pool),
    ...[...mapped,...added].filter(x=>x.group==='questionBanks'&&!x.retained).flatMap(x=>{const q=byId.get(String(x.canonicalId)).q;return [q.repairSkill,q.primarySkill];})]);
   pool=[r.q.repairSkill,r.q.primarySkill].find(s=>routes.has(s));
   if(!pool)continue;limit=limits.supportPerCoveredRoute;
  }
  const key=`${group}:${r.concept}:${pool}`,count=buckets.get(key)||0;
  if(count>=limit)continue;
  const skillKey=`${key}:${r.q.primarySkill}`;
  if(coveredSkills.has(skillKey)&&r.role==='main'&&candidates.some(other=>other!==r&&eligible(other)&&other.concept===r.concept&&destination(other)===pool&&!coveredSkills.has(`${key}:${other.q.primarySkill}`)))continue;
  added.push({id:`ERQ-${r.q.id}`,group,pool,canonicalId:r.q.id,concept:r.concept,reason:full.has(r.concept)?'Additional validated practice within an established concept':'Additional practice of an existing introductory skill'});
  used.add(String(r.q.id));stems.add(fingerprint(r.q));buckets.set(key,count+1);coveredSkills.set(skillKey,true);
 }
 plan.games[game]={concepts:[...concepts].sort(),mapped,added};
 console.log(JSON.stringify({game,updated:mapped.length,added:added.length,byGroup:added.reduce((a,r)=>(a[r.group]=(a[r.group]||0)+1,a),{}),byConcept:added.reduce((a,r)=>(a[r.concept]=(a[r.concept]||0)+1,a),{})}));
}
fs.writeFileSync('audit_tools/economic_realm_questions/selection.json',JSON.stringify(plan,null,2)+'\n');
