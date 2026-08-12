const fs=require('fs');
const path=require('path');
const vm=require('vm');
const root=path.resolve(__dirname,'..');
const core=require('../composer-core.js');
const raw=fs.readFileSync(path.join(root,'data','composer_library.js'),'utf8');
const library=JSON.parse(raw.replace(/^\s*window\.MQ_COMPOSER_LIBRARY\s*=\s*/,'').replace(/;\s*$/,''));
const template=fs.readFileSync(path.join(root,'template','mastery-quests-faculty-template-composer-ready.html'),'utf8');

function extractFunction(src,name){
  const start=src.indexOf(`function ${name}(`);
  if(start<0) throw new Error(`missing ${name}`);
  const brace=src.indexOf('{',start);
  let depth=0;
  for(let i=brace;i<src.length;i++){
    if(src[i]==='{') depth++;
    else if(src[i]==='}'){
      depth--;
      if(depth===0) return src.slice(start,i+1);
    }
  }
  throw new Error(`unterminated ${name}`);
}

const isSupportedFn=extractFunction(template,'isFacultyModeSupported');
const applyFn=extractFunction(template,'applyFacultyCompositionConfig');

function simulate(config){
  const modes=['standard','timed','exam','quiz','unlimited','legendary','score','trialGraph','fadingFortune','riskReward'];
  const cards=modes.map(mode=>({
    dataset:{mode},hidden:false,disabled:false,tabIndex:0,attrs:{},
    classList:{values:new Set(),toggle(cls,on){if(on)this.values.add(cls);else this.values.delete(cls);}},
    setAttribute(k,v){this.attrs[k]=String(v);}
  }));
  const els={
    facultyGameTitle:{textContent:''}, facultyTopTitle:{textContent:''}, facultyModeSubtitle:{textContent:''}
  };
  const modeGrid={dataset:{}};
  const document={
    title:'',
    getElementById(id){return els[id]||null;},
    querySelector(sel){if(sel==='.mode-grid')return modeGrid;return null;},
    querySelectorAll(sel){if(sel==='.mode-card[data-mode]')return cards;return [];}
  };
  const context={FACULTY_COMPOSITION_CONFIG:config,document,String,Array};
  vm.createContext(context);
  vm.runInContext(`${isSupportedFn}\n${applyFn}\napplyFacultyCompositionConfig();`,context);
  return {cards,modeGrid,subtitle:els.facultyModeSubtitle.textContent};
}

async function buildCase(name,supportedModes){
  const recipe={schemaVersion:'1.2.0',title:`Mode Test ${name}`,slug:`mode-test-${name}`,supportedModes,selectedConceptIds:[supportedModes.includes('trialGraph') ? 'perfect-competition' : 'oligopoly'],checkpointFocus:{checkpointOne:null,checkpointTwo:null,finalCheckpoint:null}};
  const composition=core.compose(library,recipe);
  if(composition.errors.length) throw new Error(`${name}: ${composition.errors.join(' | ')}`);
  const config=await core.createConfig(recipe,library,await core.sha256Hex(template));
  const metadata={schemaVersion:core.RECIPE_SCHEMA_VERSION,composerVersion:core.COMPOSER_VERSION,title:config.title,slug:config.slug,selectedConceptIds:config.selectedConceptIds,checkpointFocus:config.checkpointFocus,bossCoverage:composition.bossCoverage,supportedModes:config.supportedModes,saveKeyNamespace:config.saveKeyNamespace,compositionFingerprint:config.compositionFingerprint,libraryVersion:library.libraryVersion,librarySha256:library.librarySha256,templateSha256:config.templateSha256};
  const html=core.buildHtml(template,composition,config,metadata);
  const out=path.join(__dirname,`${name}.html`);
  fs.writeFileSync(out,html);
  const match=html.match(/const FACULTY_COMPOSITION_CONFIG = (\{[\s\S]*?\n\});/);
  if(!match) throw new Error(`${name}: config not injected`);
  const injected=JSON.parse(match[1]);
  const sim=simulate(injected);
  const visible=sim.cards.filter(c=>!c.hidden && !c.disabled).map(c=>c.dataset.mode);
  const hidden=sim.cards.filter(c=>c.hidden && c.disabled && c.tabIndex===-1 && c.classList.values.has('faculty-mode-disabled')).map(c=>c.dataset.mode);
  return {
    name,
    requested:supportedModes,
    injected:injected.supportedModes,
    visible,
    hidden,
    enabledCount:sim.modeGrid.dataset.enabledCount,
    subtitle:sim.subtitle,
    validation:composition.validation.modes.map(m=>({mode:m.mode,ok:m.ok})),
    htmlBytes:Buffer.byteLength(html)
  };
}

(async()=>{
  const cssGuard=template.includes('.mode-card[hidden],') && template.includes('display:none !important;');
  const showReapply=/function showModeSelect\(\)\{[\s\S]{0,260}applyFacultyCompositionConfig\(\);/.test(template);
  const returnReapply=/function returnToModeSelectFromRun\(\)\{[\s\S]{0,1800}applyFacultyCompositionConfig\(\);/.test(template);
  const cases=[
    await buildCase('unlimited-only',['unlimited']),
    await buildCase('timed-only',['timed']),
    await buildCase('timed-exam',['timed','exam']),
    await buildCase('all-seven',['standard','timed','exam','quiz','unlimited','legendary','score']),
    await buildCase('all-eight',['standard','timed','exam','quiz','unlimited','legendary','score','trialGraph']),
    await buildCase('all-nine',['standard','timed','exam','quiz','unlimited','legendary','score','trialGraph','fadingFortune']),
    await buildCase('all-ten',[...core.MODE_ORDER])
  ];
  const issues=[];
  if(core.COMPOSER_VERSION!=='4.5s.2m') issues.push(`composer version ${core.COMPOSER_VERSION}`);
  if(!cssGuard) issues.push('missing hard hidden CSS guard');
  if(!showReapply) issues.push('showModeSelect does not reapply config');
  if(!returnReapply) issues.push('returnToModeSelectFromRun does not reapply config');
  for(const c of cases){
    if(JSON.stringify(c.requested)!==JSON.stringify(c.injected)) issues.push(`${c.name}: injected modes mismatch`);
    if(JSON.stringify(c.requested)!==JSON.stringify(c.visible)) issues.push(`${c.name}: visible modes ${c.visible.join(',')}`);
    if(Number(c.enabledCount)!==c.requested.length) issues.push(`${c.name}: enabled count ${c.enabledCount}`);
    if(c.hidden.length!==10-c.requested.length) issues.push(`${c.name}: hidden count ${c.hidden.length}`);
    if(c.validation.some(v=>!v.ok)) issues.push(`${c.name}: selected mode preflight failed`);
  }
  const result={phase:'mode-availability-fix-v6-ten-mode-aware',ok:issues.length===0,composerVersion:core.COMPOSER_VERSION,canonicalQuestionCount:library.canonicalQuestionCount,cssGuard,showReapply,returnReapply,cases,issues};
  fs.writeFileSync(path.join(root,'mode_availability_fix_validation_results.json'),JSON.stringify(result,null,2));
  console.log(JSON.stringify(result,null,2));
  if(!result.ok) process.exit(1);
})();
