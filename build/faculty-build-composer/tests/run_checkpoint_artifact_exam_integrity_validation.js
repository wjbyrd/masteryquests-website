'use strict';

const assert = require('assert');
const fs = require('fs');
const path = require('path');
const vm = require('vm');
const core = require('../composer-core.js');
const themes = require('../data/official_theme_library.js');

const ROOT = path.resolve(__dirname, '..');
const TEMPLATE = path.join(ROOT, 'template', 'mastery-quests-faculty-template-composer-ready.html');
const source = fs.readFileSync(TEMPLATE, 'utf8');
let checks = 0;

function check(condition, message){ assert.ok(condition, message); checks++; }
function has(pattern, message){ check(pattern.test(source), message); }

function functionSource(name){
  const start = source.indexOf(`function ${name}(`);
  assert.ok(start >= 0, `${name} is missing`);
  const open = source.indexOf('{', start);
  let depth = 0;
  for(let index = open; index < source.length; index++){
    if(source[index] === '{') depth++;
    if(source[index] === '}' && --depth === 0) return source.slice(start, index + 1);
  }
  throw new Error(`${name} could not be extracted`);
}

function run(){
  const scripts = [...source.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/gi)];
  scripts.forEach((match,index) => new vm.Script(match[1], {filename:`checkpoint-artifact-exam-${index + 1}.js`}));
  check(scripts.length > 0, 'Template scripts did not parse');

  const outcomeContext = {checkpointAttemptState:null, Math, Number};
  vm.createContext(outcomeContext);
  vm.runInContext(functionSource('getCheckpointOutcome'), outcomeContext);
  check(outcomeContext.getCheckpointOutcome({total:3,correct:3}) === 'secured', '3/3 is not secured');
  check(outcomeContext.getCheckpointOutcome({total:3,correct:2}) === 'cleared', '2/3 is not cleared');
  check(outcomeContext.getCheckpointOutcome({total:3,correct:1}) === 'not-secured', '1/3 is not mastery-not-secured');
  check(outcomeContext.getCheckpointOutcome({total:3,correct:0}) === 'not-secured', '0/3 is not mastery-not-secured');
  check(outcomeContext.getCheckpointOutcome({total:2,correct:2}) !== 'secured', 'Incomplete checkpoint can be secured');

  [
    [/checkpointAttemptState = \{key,room:Number\(room\),objective,label,total:0,correct:0,incorrect:0\}/,'Checkpoint outcome state is not initialized from the adaptive encounter'],
    [/if\(isBossRoom\) recordCheckpointAttempt\(isCorrect\)/,'Boss correctness is not internally recorded'],
    [/const label = humanizeBossObjective/,'Checkpoint outcome does not normalize its concept label'],
    [/event:"checkpoint_outcome"/,'Checkpoint outcome telemetry is missing'],
    [/CHECKPOINT \$\{ordinal\} SECURED/,'Secured outcome copy is missing'],
    [/CHECKPOINT \$\{ordinal\} CLEARED/,'Cleared outcome copy is missing'],
    [/title:"MASTERY NOT YET SECURED"/,'Weak outcome copy is missing'],
    [/You proved your command of/,'Mastery proof summary is missing'],
    [/still deserves attention/,'Mixed-performance summary is missing'],
    [/exposed a weakness in/,'Weakness summary is missing'],
    [/lastCheckpointOutcome.*saveData|lastCheckpointOutcome,/s,'Checkpoint outcome is not saved'],
    [/lastCheckpointOutcome = saveData\.lastCheckpointOutcome/,'Checkpoint outcome is not restored'],
    [/if\(bossRoom !== 30\) room\+\+/,'Checkpoint progression changed'],
    [/nextAction:bossRoom === 30/,'End-of-run routing changed'],
    [/humanizeBossObjective[\s\S]*\^LO/,'Raw LO labels are not filtered'],

    [/DEFAULT_MODE_CAPABILITIES/,'Central mode capability defaults are missing'],
    [/exam:Object\.freeze\(\{immediateCorrectnessFeedback:false,artifactPowersEnabled:false\}\)/,'Exam capabilities are incorrect'],
    [/quiz:Object\.freeze\(\{immediateCorrectnessFeedback:true,artifactPowersEnabled:false\}\)/,'Quiz artifact capability is incorrect'],
    [/standard:Object\.freeze\(\{immediateCorrectnessFeedback:true,artifactPowersEnabled:true\}\)/,'Standard artifact capability is incorrect'],
    [/modeAllowsImmediateCorrectnessFeedback/,'Immediate-feedback capability helper is missing'],
    [/modeAllowsArtifactPowers/,'Artifact capability helper is missing'],
    [/display\.hidden = !modeAllowsImmediateCorrectnessFeedback\(\)/,'Streak visibility is not capability-gated'],
    [/if\(!modeAllowsImmediateCorrectnessFeedback\(\)\)[\s\S]*display\.hidden = true/,'Streak renderer can leak during Exam'],
    [/recordExamDraftAnswer\(choice, isCorrect, responseTime\);\s*return;/,'Ordinary Exam drafts enter immediate scoring'],
    [/Response saved\. You may revise it/,'Exam revision-safe response copy is missing'],
    [/exam-answered\{background:linear-gradient\(180deg,rgba\(52,56,112/,'Answered Exam rooms still use correctness-like green styling'],
    [/aria-label`,\$\{isBoss \? "Checkpoint" : "Question"\} \$\{i\}, \$\{stateLabel\}`|setAttribute\("aria-label",`\$\{isBoss/s,'Exam room state labels are missing'],
    [/showImmediateFeedback && rapidGuess\.triggered/,'Correctness-derived rapid-guess presentation is not gated'],
    [/if\(showImmediateFeedback && isBossRoom\)/,'Boss correctness sound is not gated'],
    [/if\(showImmediateFeedback\) wizardSpeak\(getWizardFeedback\("correct"\)\)/,'Positive Guide reaction is not gated'],
    [/if\(showImmediateFeedback\) wizardSpeak\(getWizardFeedback\("wrong"\)\)/,'Negative Guide reaction is not gated'],
    [/if\(showImmediateFeedback\) triggerBossShake\(\)/,'Boss damage animation is not gated'],
    [/CHECKPOINT QUESTION \$\{4 - bossHealth\} OF 3/,'Neutral Exam checkpoint progress is missing'],
    [/showImmediateFeedback \? bossLine : "Response recorded\."/,'Wrong boss response is not neutral in Exam'],
    [/showImmediateFeedback[\s\S]*HIT! Boss Health/,'Normal boss HIT feedback was not preserved behind the capability'],
    [/completeCheckpointEncounter\(\)[\s\S]*showKnowledgeRoom\(room\)/,'Aggregate checkpoint reveal no longer follows completion'],
    [/examInitialSelectedIndex[\s\S]*examFinalSelectedIndex[\s\S]*examRevisionCount/,'Exam revision telemetry was damaged'],
    [/correct:isCorrect \? 1 : 0/,'Internal Exam correctness telemetry is missing'],

    [/ARTIFACT_INVENTORY_KEYS/,'Usable artifact inventory keys are missing'],
    [/ARTIFACT_STORAGE_KEYS/,'Permanent artifact discovery keys are missing'],
    [/setArtifactInventoryCount\(key, before \+ 1\)/,'Artifacts cannot be re-earned'],
    [/localStorage\.setItem\(ARTIFACT_STORAGE_KEYS\[key\], "true"\)/,'Earning does not preserve permanent discovery'],
    [/setArtifactInventoryCount\(key, before - 1\)/,'Successful activation does not consume inventory'],
    [/artifactInventoryBefore:before,artifactInventoryAfter:before - 1/,'Consumption telemetry is missing'],
    [/if\(blockReason\) return explainArtifactActivation/,'Invalid answer elimination can consume inventory'],
    [/Promise\.all\(currentQuestion\.options\.map[\s\S]*isQuestionAnswerCorrect/,'Elimination does not use the real answer verifier'],
    [/correctness\.map\(\(correct,index\) => correct \? -1 : index\)/,'Elimination can select the correct answer'],
    [/const removedIndexes = incorrect\.slice\(0, requested\)/,'Elimination count is not exact'],
    [/compass:[\s\S]*removeCount:1/,'Artifact I is not one-distractor elimination'],
    [/lens:[\s\S]*removeCount:2/,'Artifact II is not two-distractor elimination'],
    [/scales:[\s\S]*skipCount:2/,'Artifact III is not two-room skip'],
    [/artifact-eliminated/,'Eliminated choices are not removed from presentation'],
    [/currentQuestionAssistance = \{questionId:/,'Question-scoped assistance state is missing'],
    [/artifactAssistedCorrect/,'Final assisted correctness telemetry is missing'],
    [/isBossRoomForMode\(room\)\) return "checkpoint"/,'Checkpoint artifact exclusion is missing'],
    [/\["repair","bridge","retest"\]\.includes\(adaptiveMode\)/,'Repair/bridge/retest artifact exclusion is missing'],
    [/isEvidenceCriticalArtifactQuestion/,'Evidence-critical artifact exclusion is missing'],
    [/\[9,19,29\]\.includes\(Number\(roomNumber\)\)/,'Checkpoint-prerequisite skip exclusion is missing'],
    [/event:"artifact_room_skipped"/,'Room-skip telemetry is missing'],
    [/artifactSkipState\.remaining--/,'Skip credits are not consumed one eligible room at a time'],
    [/room\+\+;[\s\S]*scheduleForCurrentRun\(loadQuestion,0\)/,'Eligible skip does not continue through normal routing'],
    [/currentQuestion = null;[\s\S]*currentQuestionAssistance = null/,'Skipped rooms can fabricate response evidence'],
    [/pending\.armedRunID !== runID/,'Artifact III is not limited to a future run'],
    [/ARTIFACT_PENDING_SKIP_KEY/,'Future-run skip persistence is missing'],
    [/already-armed/,'Duplicate future skip activation is not rejected'],
    [/class="artifact-mechanic">Eliminate 1 wrong answer/,'Artifact I mechanic is not visible'],
    [/class="artifact-mechanic">Eliminate 2 wrong answers/,'Artifact II mechanic is not visible'],
    [/class="artifact-mechanic">Skip 2 normal rooms next run/,'Artifact III mechanic is not visible'],
    [/activateArtifactPower\('compass'\)/,'Artifact I is not player-activated'],
    [/activateArtifactPower\('lens'\)/,'Artifact II is not player-activated'],
    [/activateArtifactPower\('scales'\)/,'Artifact III is not player-activated'],

    [/function applyCharacterPresentationMode/,'Character container mode helper is missing'],
    [/slot\?\.source === "custom" \? "custom-image"/,'Faculty custom image framing is not metadata/source-aware'],
    [/slot\?\.presentationMode === "transparent-character"/,'Transparent character composition mode is missing'],
    [/applyCharacterPresentationMode\(introImage, guide\)/,'Guide Intro does not apply character presentation metadata'],
    [/applyCharacterPresentationMode\(image, visual\)/,'Boss reveal does not apply character presentation metadata']
  ].forEach(([pattern,message]) => has(pattern,message));

  const standard = core.resolveThemeSelection({presetId:'default',overrides:{},customOverrides:{}}, themes, {});
  check(standard.slots.boss1.asset.id === 'default-boss-1', 'Default Boss 1 does not resolve');
  check(standard.slots.boss2.asset.id === 'default-boss-2', 'Default Boss 2 does not resolve');
  check(standard.slots.boss3.asset.id === 'default-boss-3', 'Default Boss 3 does not resolve');
  check(standard.slots.guideImage.source === 'preset' && standard.slots.guideImage.asset.id === 'default-guide', 'Default Guide does not resolve as a first-class preset asset');
  check(themes.slots.guideImage.expectedDefaultAsset.endsWith('default-guide.webp'), 'Default Guide replacement path is undocumented');
  check(['default-guide','default-boss-1','default-boss-2','default-boss-3'].every(id => themes.assets.find(asset => asset.id === id)?.presentationMode === 'transparent-character'), 'Default character art is not registered for direct composition');
  const themed = core.resolveThemeSelection({presetId:'arcane-archive',overrides:{},customOverrides:{}}, themes, {});
  check(themed.slots.boss1.asset.id === 'arcane-boss-1', 'Theme boss does not override default boss');
  check(themed.slots.guideImage.asset.presentationMode === 'transparent-character' && themed.slots.boss1.asset.presentationMode === 'transparent-character', 'Verified transparent theme characters are not marked for direct composition');
  const runtime = core.createRuntimeThemeConfig(standard, {}, ['standard','exam','quiz']);
  check(runtime.slots.guideImage.presentationMode === 'transparent-character' && runtime.slots.boss1.presentationMode === 'transparent-character', 'Character presentation metadata is not emitted at runtime');

  console.log(`Checkpoint outcomes + artifact powers + Exam integrity validation passed (${checks} checks).`);
}

run();
