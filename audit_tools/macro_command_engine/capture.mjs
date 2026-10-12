// One-time capture, pinned before the engine-only change. Never changes questions.
import fs from 'node:fs';
import crypto from 'node:crypto';
import vm from 'node:vm';
import {execFileSync} from 'node:child_process';
import {games,declaration,fn,value,baselineCommit,templatePath} from './source.mjs';
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
const profiles={},template=fs.readFileSync(templatePath,'utf8').replace(/\r\n/g,'\n');
const has=(s,n)=>new RegExp(`^(?:const|let|var) ${n}\\s*=`,'m').test(s);
for(const game of games){
 const base=`play/macro-command-system/${game}`;
 const s=execFileSync('git',['show',`${baselineCommit}:${base}/index.html`],{encoding:'utf8',maxBuffer:8e6}).replace(/\r\n/g,'\n');
 const national=game==='national-engine',bank=s.match(/<script src="([^"?]+student.js)/)?.[1]||null;
 const bankSource=bank?fs.readFileSync(`${base}/${bank}`,'utf8'):declaration(s,'questionBanks');
 const inlineAuxiliary=national?{
   easyConceptPools:declaration(s.replace(/^easyConceptPools =/m,'const easyConceptPools ='),'easyConceptPools').replace(/^const /,''),
   mediumConceptPools:declaration(s,'mediumConceptPools')
 }:null;
 const c=vm.createContext({});vm.runInContext(bankSource,c);
 const banks=vm.runInContext('questionBanks',c),key=national?'engine':value(s,'REALM_MISSION_KEY');
 const artifactKeys=national?['vaultIndex','vaultValve','vaultSeal']:[...s.matchAll(/if\(saveData.artifacts\?\.vault\w+\) localStorage.setItem\("([^"]+)"/g)].map(m=>m[1]);
 const visual=src=>fs.existsSync(`${base}/${src}`)?src:src.replace(/\.png$/i,'.webp');
 const artifacts=value(s,'artifacts');for(const a of Object.values(artifacts))a.img=visual(a.img);
 const constants=national?[
  'const SAVE_KEY = "nationalEngineComposerSave_v1";',
  ...Object.entries({MISSION:key,STARTED:'macroHub_engine_started',COMPLETE:'macroHub_engine_complete',STATUS:'macroHub_engine_status',ROOM:'macroHub_engine_room'}).map(([k,v])=>`const REALM_${k}_KEY = ${JSON.stringify(v)};`)
 ]:[...s.matchAll(/^const (REALM_\w+|MACRO_\w+|SAVE_KEY|SOUND_PREF_KEY|TELEMETRY_PREFIX|SCORE_ATTACK_STORAGE_PREFIX) =/gm)].map(m=>declaration(s,m[1]).replace(/^const MACRO_/,'const REALM_'));
 if(national)for(const [k,v] of Object.entries({TOTAL_CORRECT:'totalCorrectAnswers',BEST_STREAK:'bestStreak',EXAM_COMPLETE:'examDrillCompleted',TRIAL_BY_CLOCK:'trialByClock_complete',PERFECT_CALIBRATION:'perfectCalibration_complete',RETURN_AND_REBUILD:'returnAndRebuild_complete'}))constants.push(`const REALM_${k}_KEY = "macroHub_${v}";`);
 const p=profiles[game]={title:s.match(/<title>([^<]+)<\/title>/)[1],key,bank,inlineBank:national?bankSource:null,inlineAuxiliary,
  bankSha256:hash(bankSource),bankSemanticHash:hash(JSON.stringify(banks)),constants,artifacts,artifactKeys,
  legacyArtifactFields:national?['index','valve','seal']:artifactKeys,
  bossImages:[...s.matchAll(/bossImage = "([^"]+)"/g)].map(m=>visual(m[1])),
  bossNames:[...s.match(/let bTitle = ([\s\S]*?);/)[1].matchAll(/"([^"]+)"/g)].map(m=>m[1].trim()),
  guideName:s.match(/id="wizardName">([^<]+)/)[1],guideImage:visual(s.match(/<img src="([^"]+)" id="wizardImage"/)[1]),
  objectiveLabels:has(s,'objectiveLabels')?value(s,'objectiveLabels'):{},
  areaFunction:fn(s,'getAreaName'),wizardFeedback:value(s,'wizardFeedback'),wizardLines:value(s,'wizardLines'),
  soundSource:s.slice(s.indexOf('const bgMusic ='),s.indexOf('function goFullscreen')).replace(/hallway(\d)\.png/g,'hallway$1.webp'),
  realmFunctions:national?[fn(template,'getMissionAchievementPrefix').replace('`${STORAGE_PREFIX}:achievement`','`macroHub_${REALM_MISSION_KEY}`')]:['getMissionAchievementPrefix','syncRealmAttemptState','recordTimedTrialAchievementStats'].map(n=>fn(s,n).replaceAll('MACRO_','REALM_')),
  resourceSource:national?'': 'let latestReviewMaterialsHTML = "";\n'+['getRecommendedReviewResources','renderRecommendedReview','showReviewMaterialsScreen','restoreMasteryReportFromMaterials'].map(n=>fn(s,n)).join('\n')+'\nfunction renderInstructionalResourceSection(report){return renderRecommendedReview(report);}\n',
  resourceCSS:'',objectiveLabelSource:'',
  roomKey:s.match(/let room = localStorage.getItem\(["']([^"']+)["']/)[1],
  modeKey:national?'nationalEngineCurrentMode':s.match(/localStorage.setItem\("([^"]+CurrentMode)"/)[1],
  highScoreFunction:fn(s.slice(s.lastIndexOf('function updateHighScores(')),'updateHighScores'),
  pseudonymFunction:fn(national?execFileSync('git',['show',`${baselineCommit}:play/macro-command-system/command-nexus/index.html`],{encoding:'utf8',maxBuffer:8e6}):s,'generatePseudonymFromSeed'),
  streakFunction:fn(s,'handleStreakVisuals').replace(/streak(\w+)\.png/g,'streak$1.webp'),
  counts:Object.fromEntries(Object.entries(banks).map(([k,v])=>[k,v.length])),
  originalVersion:s.match(/const (?:NATIONAL_)?GAME_VERSION = "([^"]+)"/)?.[1],
  protectedFiles:{}
 };
 if(national){
  p.realmFunctions=['function getMissionAchievementPrefix(){return `macroHub_${REALM_MISSION_KEY}`;}'];
  p.soundSource+='\nconst SOUND_PREF_KEY = "nationalEngineSoundEnabled";\nlet soundEnabled = false;\n'+['updateSoundToggle','setAllGameAudioMuted','toggleGameSound','restoreSoundSetting','pauseAllGameMusic','safePlay','resumeCurrentMusic'].map(n=>fn(template,n)).join('\n');
 }
 const files=execFileSync('git',['ls-tree','-r','--name-only',baselineCommit,base],{encoding:'utf8'}).trim().split(/\r?\n/).filter(f=>f!==`${base}/index.html`);
 for(const file of files){const b=fs.readFileSync(file);p.protectedFiles[file]=hash(/\.(?:js|mjs|html|css|json|txt|md|srt)$/i.test(file)?b.toString('utf8').replace(/\r\n/g,'\n'):b);}
 console.log(JSON.stringify({game,bank:bank||'unchanged inline bank',counts:p.counts,artifactKeys,resources:!!p.resourceSource}));
}
fs.writeFileSync('audit_tools/macro_command_engine/profiles.json',JSON.stringify(profiles,null,2)+'\n');

