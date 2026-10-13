import fs from 'node:fs';import vm from 'node:vm';import assert from 'node:assert/strict';import {execFileSync} from 'node:child_process';import {createRequire} from 'node:module';
import {fn,value,templatePath} from '../economic_realm_engine/source.mjs';
const require=createRequire(import.meta.url),a=require('../../tools/answer-analysis/analysis.js');
const files=execFileSync('git',['ls-files','--','play/**/*.html','downloads/resources/mastery-quests-faculty-template.html','downloads/resources/mastery-quests-faculty-starter.html'],{encoding:'utf8'}).trim().split('\n');let builds=0,labelsChecked=0;
for(const file of [...files.filter(f=>f.endsWith('/index.html')||f.startsWith('downloads/resources/')),templatePath]){
 const source=fs.readFileSync(file,'utf8');if(!source.includes('function formatMasteryLabel('))continue;
 const maps={};for(const name of ['TEMPLATE_OBJECTIVE_LABELS','objectiveLabels','LABYRINTH_OF_CHOICE_OBJECTIVE_LABELS']){try{maps[name]=value(source,name);}catch{}}
 const sandbox=vm.createContext(maps);vm.runInContext(fn(source,'titleCase')+'\n'+fn(source,'formatMasteryLabel'),sandbox);
 for(const map of Object.values(maps))for(const [key,label] of Object.entries(map)){
   if(!label)continue;const shown=sandbox.formatMasteryLabel(key);assert(!/\bLO\s*\d/i.test(shown),file+': '+shown);assert(shown.trim());labelsChecked++;
 }
 assert.equal(sandbox.formatMasteryLabel('LO99.99'),'Learning objective description unavailable',file);
 assert.equal(sandbox.formatMasteryLabel('LO99.99_tax_incidence'),'Tax Incidence',file);
 // A known game-specific label must take priority over the empty Composer map.
 if(file.includes('market-gate/'))assert.equal(sandbox.formatMasteryLabel('LO4.3'),maps.objectiveLabels['LO4.3']);
 if(source.includes('function getInstructionalObjectiveTitle(')){
  Object.assign(sandbox,{normalizeLearningObjectiveId:id=>String(id).replace('LO',''),getInstructionalResourceConfig:()=>({}),getObjectiveResourceMapping:()=>({title:'LO 4.3 — Supply and supply shifts'})});
  vm.runInContext(fn(source,'getInstructionalObjectiveTitle'),sandbox);assert(!/\bLO\s*\d/i.test(sandbox.getInstructionalObjectiveTitle('LO4.3')),file);
 }
 builds++;
}
for(const [group,expected] of [
 [{objective:'LO4.3',labels:['Supply and supply shifts']},'Supply and supply shifts'],
 [{objective:'LO4.3',labels:['LO 4.3 — Supply and supply shifts']},'Supply and supply shifts'],
 [{objective:'LO4.3',labels:[]},'Learning objective description unavailable'],
 [{objective:'LO1',labels:['Supply']},'Supply'],
 [{objective:'LO1.1_tax_incidence',labels:[]},'tax incidence']
])assert.equal(a.objectiveLabel(group),expected);
const {releaseRows}=await import('../answer_analysis/release-fixtures.mjs');const report=a.analyze(releaseRows()),text=a.feedbackSummary(report,{fileCount:6,grouping:'objectives'});assert(!/\bLO\s*\d/.test(text));assert(text.includes('Tax incidence: 8%'));assert.equal(report.objectives.find(x=>x.objective==='LO3').count,24,'Display cleanup must retain grouping IDs');
console.log(`PASS: description-only labels in ${builds} maintained game/template builds, ${labelsChecked} mapped labels, resource titles, analyzer fallbacks and unchanged objective grouping.`);
