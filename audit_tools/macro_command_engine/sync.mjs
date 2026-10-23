import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {games, templatePath, declaration, fn, value} from './source.mjs';
import {activeProfile} from './active-profile.mjs';
import {alignMacroPresentation} from './alignment.mjs';
import {buildGraphMetadata} from './graph-metadata.mjs';
import {applyApprovedQuestionCorrections} from './question-corrections.mjs';
const require=createRequire(import.meta.url);
const core=require('../../build/faculty-build-composer/composer-core.js');
const profiles=JSON.parse(fs.readFileSync('audit_tools/macro_command_engine/profiles.json','utf8'));
const template=fs.readFileSync(templatePath,'utf8').replace(/\r\n/g,'\n');
const check=process.argv.includes('--check');
const js=v=>JSON.stringify(v,null,2).replace(/<\/script/gi,'<\\/script');
const results=[];
for(const game of games){
  const p=activeProfile(game,profiles),base=`play/macro-command-system/${game}`;
  let bankSource=p.inlineBank?[p.inlineBank,...Object.values(p.inlineAuxiliary)].join('\n'):fs.readFileSync(`${base}/${p.bank}`,'utf8');
  const correctedBank=applyApprovedQuestionCorrections(game,bankSource);
  if(check)assert.equal(bankSource,correctedBank,`${game}: approved question corrections need synchronization`);
  else if(correctedBank!==bankSource)fs.writeFileSync(`${base}/${p.bank}`,correctedBank);
  bankSource=correctedBank;
  const context=vm.createContext({});
  vm.runInContext(bankSource,context);
  const banks=vm.runInContext('questionBanks',context);
  const ordinary=['easy','medium','hard','elite','legendary'].flatMap(k=>banks[k]||[]);
  const graph=ordinary.filter(q=>q.graphRequired===true&&q.image&&q.imageAlt);
  const eligible=ordinary.filter(q=>q.options?.length===4);
  const modes=['standard','timed','exam','quiz','unlimited',...(banks.legendary?.length&&banks.legendaryBoss?.length?['legendary']:[]),'score',...(graph.length>=10?['trialGraph']:[]),'fadingFortune','riskReward'];
  const slots={};
  const slot=(id,src,name)=>{assert(fs.existsSync(`${base}/${src}`),`${game}: missing ${src}`);slots[id]={src,displayName:name||'',alt:name||'',source:'published',presentationMode:'custom-image'};};
  slot('startBackground','start screen image.webp');
  slot('gameplayBackground',['question_background_image.webp','question_background_img.webp','question background image.webp'].find(f=>fs.existsSync(`${base}/${f}`)));
  slot('guideImage',p.guideImage,p.guideName);
  for(let i=0;i<3;i++){
    slot(`boss${i+1}`,p.bossImages[i],p.bossNames[i]);
    slot(`hallway${i+1}`,`hallway${i+1}.webp`);
    const artifact=Object.values(p.artifacts)[i];slot(`artifact${i+1}`,artifact.img,artifact.title);
  }
  const modeImages={standard:'mode_standard.webp',timed:'mode_timed.webp',exam:'mode_exam.webp',quiz:'quiz-mode.webp',unlimited:'unlimited-mode.webp',legendary:'mode_legendary.webp',score:'scoreattack.webp',trialGraph:'trial-by-graph.webp',fadingFortune:'fading-fortune.webp',riskReward:'risk-and-reward.webp'};
  for(const [m,image] of Object.entries(modeImages))if(fs.existsSync(`${base}/${image}`))slot('mode'+m[0].toUpperCase()+m.slice(1),image);
  const config={...value(template,'FACULTY_COMPOSITION_CONFIG'),compositionId:game,slug:game,title:p.title,saveKeyNamespace:p.saveNamespace||p.key,supportedModes:modes,guide:{displayName:p.guideName,introLines:[`Welcome to ${p.title}. I’ll guide you through the challenges ahead.`, 'If you are ready, follow me.']},visualTheme:{slots},allowAnonymousDataCollection:false};
  let html=template.replace(declaration(template,'FACULTY_COMPOSITION_CONFIG'),`const FACULTY_COMPOSITION_CONFIG = ${js(config)};`);
  // Published question scripts remain the sole question source. Supplemental maps
  // in those scripts execute unchanged, including their direct-skill backfills.
  const allQuestions=[...Object.values(banks).flat(),...['microSkillRepairPools','microSkillBridgePools','skillRepairSeedPools'].flatMap(k=>vm.runInContext(`typeof ${k}==='undefined'?[]:Object.values(${k}).flat()`,context))];
  const metadata=buildGraphMetadata(game,allQuestions,base);
  const imagePaths=[...new Set(allQuestions.map(q=>q.image).filter(Boolean))];
  const missingImages=imagePaths.filter(image=>!fs.existsSync(`${base}/${image}`));
  assert.deepEqual(missingImages,[],`${game}: missing question images`);
  let region=(p.inlineBank?p.inlineBank+'\n':'')+`const objectiveLabels = ${js(p.objectiveLabels)};\nconst embeddedQuestionAssets = ${js(Object.fromEntries(imagePaths.map(p=>[p,p])))};\nconst questionAssetMetadata = ${js(metadata)};\nconst trialGraphQuestionIds = ${js(graph.map(q=>q.id))};\nconst fadingFortuneQuestionIds = ${js(eligible.map(q=>q.id))};\nconst riskRewardQuestionIds = ${js(eligible.map(q=>q.id))};\nconst composerQuestionValidator = ${core.validateFacultyQuestionRecord.toString()};\n// Legacy banks encode checkpoint stage in difficulty; normalize only the validation view.\nconst facultyQuestionValidator = (q,pool,assets) => composerQuestionValidator(q && /Boss$/.test(q.difficulty || '') ? {...q,difficulty:({easyBoss:'easy',mediumBoss:'medium',finalBoss:'hard',legendaryBoss:'legendary'})[q.difficulty]} : q,pool,assets);\n`;
  for(const [name,fallback] of Object.entries({repairQuestions:[],bridgeQuestions:[],microSkillRepairPools:{},microSkillBridgePools:{},skillRepairSeedPools:{}})){
    if(!new RegExp(`(?:const|let|var) ${name}\\s*=`).test(bankSource))region+=`const ${name} = ${js(fallback)};\n`;
  }
  if(p.inlineBank){
    region+='\nlet easyConceptPools;\n'+Object.values(p.inlineAuxiliary).join('\n')+'\n';
    // Reuse the exact original repair/bridge records, with their original grouping.
    region=region.replace('const microSkillRepairPools = {};','').replace('const microSkillBridgePools = {};','');
    region+='const microSkillRepairPools = easyConceptPools;\nconst microSkillBridgePools = mediumConceptPools;\n';
  }
  region=region.replace('/Boss$/.test(q.difficulty','/boss$/i.test(q.difficulty').replace("{easyBoss:'easy',mediumBoss:'medium',finalBoss:'hard',legendaryBoss:'legendary'})[q.difficulty]","{easyboss:'easy',mediumboss:'medium',finalboss:'hard',legendaryboss:'legendary'})[q.difficulty.toLowerCase()]");
  region=region.replace(/const facultyQuestionValidator = [^\n]+/,`// Frozen records can predate skill/difficulty metadata. Adapt only the validator view.
const facultyQuestionValidator = (q,pool,assets) => {
    if(!q) return composerQuestionValidator(q,pool,assets);
    const stages={easyboss:'easy',mediumboss:'medium',finalboss:'hard',legendaryboss:'legendary'};
    const difficulty=q.difficulty || stages[String(pool).toLowerCase()] || pool;
    return composerQuestionValidator({...q,difficulty:stages[String(difficulty).toLowerCase()] || difficulty,
        primarySkill:q.primarySkill || q.skillId || q.tag,
        repairSkill:q.repairSkill || q.repairSkillId || q.primarySkill || q.skillId || q.tag
    },pool,assets);
};`);
  const start=html.indexOf('const questionBanks ='),end=html.indexOf('// END FACULTY QUESTION BANKS',start);
  html=html.slice(0,start)+region+'\n// =====================================================\n'+html.slice(end);
  // Keep established browser keys so active saves, achievements and CSV history survive.
  for(const source of p.constants){const name=source.match(/^const (\w+)/)[1];if(name==='SOUND_PREF_KEY')continue;html=html.replace(declaration(html,name),source);}
  for(const [name,v] of Object.entries({ROOM_KEY:p.roomKey,CURRENT_MODE_KEY:p.modeKey,PLAYER_KEY:'gauntletUser',RUN_ID_KEY:'gauntletRunID',ARTIFACT_STORAGE_KEYS:Object.fromEntries(['compass','lens','scales'].map((k,i)=>[k,p.artifactKeys[i]])),GAME_VERSION:`${game}-composer-engine-2026.10.11`}))html=html.replace(declaration(html,name),`const ${name} = ${js(v)};`);
  for(const source of p.realmFunctions){const name=source.match(/^function (\w+)/)[1];html=html.replace(fn(html,name),source);}
  if(game==='national-engine')for(const name of ['syncRealmAttemptState','recordTimedTrialAchievementStats']){
    const source=profiles['mint-ash-gold'].realmFunctions.find(s=>s.startsWith('function '+name+'('));
    html=html.replace(fn(html,name),source);
  }
  html=html.replace(fn(html,'getAreaName'),p.areaFunction);
  html=html.replace(fn(html,'updateHighScores'),p.highScoreFunction);
  html=html.replace(fn(html,'validateAndStorePlayerName'),p.pseudonymFunction+`\nfunction validateAndStorePlayerName(){return true;}`);
  html=html.replace(/<input id="playerNameInput"[^>]*>/,'<input id="playerNameInput" type="hidden" value="Local player">');
  html=html.replace('localStorage.setItem(PLAYER_KEY, username);',`if(!hasSavedRun) username = generatePseudonymFromSeed(runID);\nlocalStorage.setItem(PLAYER_KEY, username);`);
  const streak=p.streakFunction.replace('function handleStreakVisuals() {',`function handleStreakVisuals() {
    const display=document.getElementById('streakDisplay');
    if(!display)return;
    display.hidden=!modeAllowsImmediateCorrectnessFeedback();
    if(display.hidden){display.innerText='';return;}
    if(!streak){display.innerText='';return;}`)
    .replace('sfxMilestone.play();','safePlay(sfxMilestone);');
  html=html.replace(fn(html,'handleStreakVisuals'),streak);
  for(const name of ['wizardFeedback','wizardLines'])html=html.replace(declaration(html,name),`const ${name} = ${js(p[name])};`);
  // Restore each game's existing audio implementation before config initialization.
  for(const name of ['bgMusic','bossMusic','finalBossMusic','sfxMilestone','sfxVictory','sfxBossHit','sfxCorrect','sfxWrong','hallwayImages','soundEnabled']){
    html=html.replace(declaration(html,name),declaration(p.soundSource,name));
  }
  html=html.replace('function updateSoundToggle()',declaration(p.soundSource,'SOUND_PREF_KEY')+'\nfunction updateSoundToggle()');
  const audioFunctions=game==='national-engine'?profiles['mint-ash-gold'].soundSource:p.soundSource;
  for(const name of ['updateSoundToggle','setAllGameAudioMuted','toggleGameSound','restoreSoundSetting','pauseAllGameMusic','safePlay','resumeCurrentMusic'])html=html.replace(fn(html,name),fn(audioFunctions,name));
  html=html.replace('const bgMusic =',`function createSilentAudio(){return {muted:false,volume:0,currentTime:0,pause(){},play(){return Promise.resolve();}};}
let gameSfxUnlocked=false;
${fn(audioFunctions,'unlockGameSfx')}
${fn(audioFunctions,'safePlaySfx')}
document.addEventListener('pointerdown',unlockGameSfx,{capture:true});
document.addEventListener('keydown',unlockGameSfx,{capture:true});
const bgMusic =`);
  html=html.replace('const bossMusic =',"bgMusic.loop=true; bgMusic.volume=0.05;\nconst bossMusic =");
  html=html.replace('const sfxMilestone =',"bossMusic.loop=true; bossMusic.volume=0.1; finalBossMusic.loop=true; finalBossMusic.volume=0.12;\nconst sfxMilestone =");
  if(p.resourceSource){
    html=html.replace('async function showMasteryReportScreen(options = {}){',p.objectiveLabelSource+'\n'+p.resourceSource+'\nasync function showMasteryReportScreen(options = {}){');
    const reviewStart=html.indexOf('    let conceptReviewResult = {kind:"NONE"'),reviewEnd=html.indexOf('    const scoreCard =',reviewStart);
    assert(reviewStart>0&&reviewEnd>reviewStart);
    html=html.slice(0,reviewStart)+'    latestConceptReviewTitles = [];\n    const conceptReviewSection = renderInstructionalResourceSection(report);\n'+html.slice(reviewEnd);
  }else{
    // No review routing was published for this bank; content curation is a later pass.
    const reviewStart=html.indexOf('    let conceptReviewResult = {kind:"NONE"'),reviewEnd=html.indexOf('    const scoreCard =',reviewStart);
    html=html.slice(0,reviewStart)+'    latestConceptReviewTitles = [];\n    const conceptReviewSection = "";\n'+html.slice(reviewEnd);
  }
  // Translate legacy artifact property names without discarding the original save.
  if(p.inlineBank){
    html=html.replace('const STORAGE_PREFIX =',`// Import the old National Engine layout once; preserve its original save for recovery.
(function migrateNationalEngineSave(){
    const oldKey='NationalEngine:standard:save:phase1.5';
    const newKey='nationalEngineComposerSave_v1_standard', marker='nationalEngineComposerSave_v1_legacyImported';
    if(localStorage.getItem(marker)) return;
    if(localStorage.getItem(newKey)){localStorage.setItem(marker,'true');return;}
    try{
        const raw=localStorage.getItem(oldKey);
        const saved=raw ? JSON.parse(raw) : null;
        const oldRoom=Number(localStorage.getItem('gauntletRoom') || 1);
        if(!saved && !(oldRoom>1 && oldRoom<=30)) return;
        const migrated=saved ? {...saved,gameMode:'standard',phase15:{
            currentQuestion:saved.currentQuestion,questionUI:saved.questionUI,
            remediationState:saved.remediationState,bossPool:saved.bossPool,
            detourActive:saved.detourActive,detourReturnRoom:saved.detourReturnRoom,
            bossSummaryRoom:saved.bossSummaryRoom
        }} : {room:oldRoom,gameMode:'standard',runPhase:'transition',
            runID:localStorage.getItem('gauntletRunID') || '',username:localStorage.getItem('gauntletUser') || ''};
        localStorage.setItem(newKey,JSON.stringify(migrated));
        localStorage.setItem(marker,'true');
    }catch(error){console.warn('National Engine legacy save could not be imported.',error);}
})();
const STORAGE_PREFIX =`);
  }
  const legacyArtifactFields=Object.fromEntries(p.legacyArtifactFields.map((key,i)=>[key,p.artifactKeys[i]]));
  const migration=`\n(function preserveLegacyArtifacts(){
 const saveKey=${js(value(p.constants.join('\n'),'SAVE_KEY')+'_standard')};
 try{const saved=JSON.parse(localStorage.getItem(saveKey)||'null');
 if(!saved?.artifacts || saved.artifacts.inventory || saved.macroArtifactsMigrated)return;
 const legacy=${js(legacyArtifactFields)},original=saved.artifacts;
 Object.entries(legacy).forEach(([key,storageKey])=>{if(original[key]===true)localStorage.setItem(storageKey,'true');});
 // Some old games used vaultCompass/vaultLens for different artifact positions.
 // Translate before Composer reads these fields, avoiding accidental unlocks.
 saved.legacyArtifacts=original;
 saved.artifacts=Object.fromEntries(Object.keys(legacy).map((key,i)=>[['vaultCompass','vaultLens','vaultScales'][i],original[key]===true]));
 saved.macroArtifactsMigrated=true;
 localStorage.setItem(saveKey,JSON.stringify(saved));
 }catch(_){}
})();\n`;
  html=html.replace('const STORAGE_PREFIX =',migration+'const STORAGE_PREFIX =');
  html=html.replace('checkpointAttemptState = saveData.checkpointAttemptState || null;',`checkpointAttemptState = saveData.checkpointAttemptState || null;
        // Older saves counted successful hits, so retain those completed hits when resuming.
        if(!checkpointAttemptState && gameMode === 'standard' && [10,20,30].includes(room) && bossHealth < 3){
            checkpointAttemptState = {key:getBossEncounterKey(),room,total:3-bossHealth,correct:3-bossHealth,incorrect:0};
        }`);
  html=html.replace('</style>',`${p.resourceCSS || ''}\n#gameMenuOptions #soundToggle { display:block !important; position:static; width:100%; margin:0; }\n</style>`);
  const lastScript=html.lastIndexOf('</script>');
  html=html.slice(0,lastScript)+`\nconst realmSoundButton=document.getElementById('soundToggle');\nrealmSoundButton.className='game-menu-option';\ndocument.getElementById('gameMenuOptions').appendChild(realmSoundButton);\n`+html.slice(lastScript);
  html=html.replace(' <script>',`${fs.existsSync(`${base}/instructional_resources.js`)?'<script src="instructional_resources.js"></script>\n':''}${p.bank?'<script src="'+p.bank+'"></script>':''}\n <script>`);
  html=html.replace('<title>Mastery Quest</title>',`<title>${p.title}</title>`);
  html=html.replace('<!-- =====================================================',`<!-- Generated by audit_tools/macro_command_engine/sync.mjs from the current Composer engine.\nPublished banks and captured Macro Command presentation/storage contracts are retained. -->\n<!-- =====================================================`);
  html=html.replace(/^[ \t]+/gm,indent=>indent.replace(/\t/g,'    ')).replace(/[ \t]+$/gm,'');
  if(p.inlineBank)html=html.replace(declaration(html,'questionBanks'),p.inlineBank);
  if(p.inlineBank){
    for(const [name,original] of Object.entries(p.inlineAuxiliary)){
      const current=declaration(html.replace(/^easyConceptPools =/m,'const easyConceptPools ='),name);
      html=html.replace(name==='easyConceptPools'?current.replace(/^const /,''):current,original);
    }
  }
  // Profile/resource fragments may use CRLF on Windows; normalize the complete output.
  html=alignMacroPresentation(html,game).replace(/\r\n/g,'\n');
  for(const m of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g))new vm.Script(m[1]);
  if(check)assert.equal(fs.readFileSync(`${base}/index.html`,'utf8').replace(/\r\n/g,'\n'),html,`${game} engine drift`);
  else if(fs.readFileSync(`${base}/index.html`,'utf8')!==html){
    const temporary=`${base}/index.html.sync-tmp`;fs.writeFileSync(temporary,html);fs.renameSync(temporary,`${base}/index.html`);
  }
  results.push({game,modes,graphCandidates:graph.length,ordinary:ordinary.length,missingImages});
}
console.log(JSON.stringify(results,null,2));
