const fs=require('fs');
const path=require('path');
const vm=require('vm');
const root=path.resolve(__dirname,'..');
const core=require('../composer-core.js');
const template=fs.readFileSync(path.join(root,'template','mastery-quests-faculty-template-composer-ready.html'),'utf8');

function extractFunction(src,name){
  const start=src.indexOf(`function ${name}(`); if(start<0) throw new Error(`missing ${name}`);
  const ps=src.indexOf('(',start); let pd=0, pe=-1;
  for(let i=ps;i<src.length;i++){ if(src[i]==='(')pd++; else if(src[i]===')'&&--pd===0){pe=i;break;} }
  const bs=src.indexOf('{',pe); let d=0;
  for(let i=bs;i<src.length;i++){ if(src[i]==='{')d++; else if(src[i]==='}'&&--d===0)return src.slice(start,i+1); }
  throw new Error(`unterminated ${name}`);
}

const issues=[];
if(core.COMPOSER_VERSION!=='4.5s.2m') issues.push(`version ${core.COMPOSER_VERSION}`);
if(!template.includes('<div id="question"></div>')) issues.push('question container is not block-safe');
if(template.includes('<p id="question"></p>')) issues.push('legacy paragraph question container remains');
if(!/function startGame\(shouldResume = false\)[\s\S]{0,420}restoreGameplayShell\(true\)/.test(template)) issues.push('new runs do not force pristine shell restoration');
if(!/latestResultsScreenHTML = "";/.test(extractFunction(template,'returnToModeSelectFromRun'))) issues.push('mode return does not clear cached results');

const restoreFn=extractFunction(template,'restoreGameplayShell');
const requiredMatch=template.match(/const REQUIRED_GAMEPLAY_IDS = \[([\s\S]*?)\];/);
if(!requiredMatch) throw new Error('required IDs missing');
const required=[...requiredMatch[1].matchAll(/"([^"]+)"/g)].map(m=>m[1]);
const nodes={};
for(const id of required) nodes[id]={id,style:{},classList:{remove(){}}};
const gameBox={id:'gameBox',innerHTML:'STALE RESULTS',style:{removeProperty(){}},classList:{remove(){}}};
const gameShell={id:'gameShell',style:{removeProperty(){}},classList:{remove(){}}};
nodes.gameBox=gameBox; nodes.gameShell=gameShell;
const ctx={
  document:{getElementById(id){return nodes[id]||null;}},
  GAME_BOX_TEMPLATE_HTML:'PRISTINE GAMEPLAY SHELL',
  REQUIRED_GAMEPLAY_IDS:required,
  latestResultsScreenHTML:'UNLIMITED RESULTS CACHE',
  closeGraphLightbox(){}, console
};
vm.createContext(ctx);
vm.runInContext(restoreFn+'\nrestoreGameplayShell(true);',ctx);
if(gameBox.innerHTML!=='PRISTINE GAMEPLAY SHELL') issues.push('forced restore did not replace stale shell');
if(ctx.latestResultsScreenHTML!=='') issues.push('forced restore did not clear cached results');

const result={
  phase:'mastery-report-2.0-state-leak-hotfix',
  ok:issues.length===0,
  composerVersion:core.COMPOSER_VERSION,
  checks:{
    blockSafeQuestionContainer:template.includes('<div id="question"></div>'),
    forcedPristineShellOnStart:/restoreGameplayShell\(true\)/.test(template),
    cacheClearedOnModeReturn:/latestResultsScreenHTML = "";/.test(extractFunction(template,'returnToModeSelectFromRun')),
    forcedRestoreSimulation:{gameBoxHTML:gameBox.innerHTML,cache:ctx.latestResultsScreenHTML}
  },
  issues
};
fs.writeFileSync(path.join(root,'mastery_report_state_leak_hotfix_results.json'),JSON.stringify(result,null,2));
console.log(JSON.stringify(result,null,2));
if(!result.ok)process.exit(1);
