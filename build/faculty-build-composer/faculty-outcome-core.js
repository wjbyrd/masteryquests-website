(function(root,factory){
  const api=factory(typeof module==='object'&&module.exports ? require('./data/faculty-outcomes.js') : root.MQFacultyOutcomePolicy);
  if(typeof module==='object'&&module.exports)module.exports=api;else root.MQFacultyOutcomes=api;
})(typeof globalThis!=='undefined'?globalThis:this,function(policy){
'use strict';
if(!policy) throw new Error('Faculty learning-outcome policy is unavailable.');
const unique=ids=>[...new Set(ids)].sort();
const same=(a,b)=>JSON.stringify(unique(a))===JSON.stringify(unique(b));
function describe(id){return policy.concepts[id] || {outcomes:[],presets:{brief:[],standard:[],full:[]},warnings:['Curricular coverage is not available for this concept.']};}
function skills(id,ids){return unique(describe(id).outcomes.filter(g=>ids.includes(g.id)).flatMap(g=>g.skillIds));}
function recognize(id,ids,preferred){
 const presets=describe(id).presets;
 if(presets[preferred] && same(ids,presets[preferred]))return preferred;
 return ['full','standard','brief'].find(name=>same(ids,presets[name])) || 'custom';
}
function selectPreset(id,preset){
 if(!['brief','standard','full'].includes(preset))throw new Error('Unknown outcome preset: '+preset);
 return {preset,outcomeIds:unique(describe(id).presets[preset])};
}
function normalize(id,source){
 const value=source || {depth:'full'};
 if(value.depth==='exclude')return {depth:'exclude'};
 if(Array.isArray(value.legacySkillIds))return {preset:'custom',outcomeIds:[],legacySkillIds:unique(value.legacySkillIds)};
 if(Array.isArray(value.outcomeIds)){
  const outcomeIds=unique(value.outcomeIds);
  return {preset:recognize(id,outcomeIds,value.preset),outcomeIds};
 }
 if(Array.isArray(value.skillIds)){
  const requested=unique(value.skillIds),record=describe(id);
  const outcomeIds=record.outcomes.filter(g=>g.skillIds.some(s=>requested.includes(s))).map(g=>g.id);
  // A broad outcome may contain more skills than an old manual slice. Preserve
  // the exact old slice rather than silently selecting additional curriculum.
  const wouldIncludeUnmapped=outcomeIds.length===record.outcomes.length && record.unmappedQuestionIds?.length;
  if(same(skills(id,outcomeIds),requested) && !wouldIncludeUnmapped)return {preset:recognize(id,outcomeIds),outcomeIds:unique(outcomeIds)};
  return {preset:'custom',outcomeIds:[],legacySkillIds:requested};
 }
 return selectPreset(id,value.depth || value.preset || 'full');
}
function compile(id,source){
 const selection=normalize(id,source);
 if(selection.depth==='exclude')return selection;
 if(selection.legacySkillIds)return {depth:'full',skillIds:selection.legacySkillIds};
 // All outcomes represent the full published module, including untagged legacy
 // records. Partial outcomes always use the existing all-skills eligibility rule.
 if(selection.outcomeIds.length && same(selection.outcomeIds,describe(id).presets.full))return {depth:'full'};
 return {depth:'full',skillIds:skills(id,selection.outcomeIds)};
}
function validate(id,value,canonicalSkills){
 const errors=[],record=describe(id);
 if(!value || typeof value!=='object' || Array.isArray(value))return ['Invalid content scope for '+id];
 const excluded=value.depth==='exclude';
 if('outcomeIds' in value || 'preset' in value || 'legacySkillIds' in value){
  if(!['brief','standard','full','custom'].includes(value.preset))errors.push('Invalid outcome preset for '+id);
  if(!Array.isArray(value.outcomeIds))errors.push('outcomeIds must be an array for '+id);
  else {
   if(unique(value.outcomeIds).length!==value.outcomeIds.length)errors.push('Duplicate outcome IDs for '+id);
   if(!value.outcomeIds.length && !Array.isArray(value.legacySkillIds))errors.push('Choose at least one learning outcome or deselect '+id);
   for(const outcome of value.outcomeIds)if(!record.outcomes.some(g=>g.id===outcome))errors.push('Unknown learning outcome for '+id+': '+outcome);
  }
  if('skillIds' in value || 'depth' in value)errors.push('Outcome selections cannot also contain depth or skillIds for '+id);
  if('legacySkillIds' in value && value.outcomeIds?.length)errors.push('Legacy coverage and outcome coverage cannot be combined for '+id);
 } else if(!['exclude','brief','standard','full'].includes(value.depth))errors.push('Invalid coverage depth for '+id);
 const manual=value.legacySkillIds ?? value.skillIds;
 if(manual!=null){
  if(!Array.isArray(manual))errors.push('skillIds must be an array for '+id);
  else {
   if(!manual.length&&!excluded)errors.push('Choose at least one subskill or exclude '+id);
   for(const skill of manual)if(!canonicalSkills.includes(skill))errors.push('Unknown subskill for '+id+': '+skill);
  }
 }
 return errors;
}
return {policy,describe,skills,recognize,selectPreset,normalize,compile,validate};
});
