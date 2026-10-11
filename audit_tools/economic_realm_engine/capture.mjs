// One-time capture of published presentation/storage contracts; never rewrites banks.
import fs from 'node:fs';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {games, declaration, fn, value, baselineCommit} from './source.mjs';
const profiles = {};
for (const game of games) {
  const base = `play/economic-realm/${game}`;
  const s = execFileSync('git', ['show', `${baselineCommit}:${base}/index.html`], {encoding:'utf8', maxBuffer:8e6}).replace(/\r\n/g,'\n');
  const bank = s.match(/<script src="([^"?]+student.js)[^"]*"/)[1];
  const key = value(s, 'REALM_MISSION_KEY');
  const artifacts = value(s, 'artifacts');
  const bossImages = [...s.matchAll(/bossImage = "([^"]+)"/g)].map(m=>m[1]).filter(Boolean);
  const bossNames = [...s.match(/let bTitle = ([\s\S]*?);/)[1].matchAll(/"([^"]+)"/g)].map(m=>m[1]);
  const constants = [...s.matchAll(/^const (REALM_\w+|SAVE_KEY|SOUND_PREF_KEY|TELEMETRY_PREFIX|SCORE_ATTACK_STORAGE_PREFIX) =/gm)].map(m=>declaration(s,m[1]));
  const resourceStart = s.indexOf('const INSTRUCTIONAL_RESOURCE_TYPE_LABELS');
  const resourceEnd = s.indexOf('function getMasteryReportData',resourceStart);
  const resourceSource = resourceStart < 0 ? '' : s.slice(resourceStart,resourceEnd);
  const labelMatch = s.match(/^const (\w+_OBJECTIVE_LABELS) =/m);
  profiles[game] = {
    title:s.match(/<title>([^<]+)<\/title>/)[1], key, bank,
    bankSha256:crypto.createHash('sha256').update(fs.readFileSync(`${base}/${bank}`)).digest('hex'),
    constants, artifacts, bossImages, bossNames,
    guideName:s.match(/id="wizardName">([^<]+)/)[1],
    guideImage:s.match(/<img src="([^"]+)" id="wizardImage"/)[1],
    objectiveLabels:value(s,'objectiveLabels'),
    objectiveLabelSource:labelMatch ? declaration(s,labelMatch[1]) : '',
    areaFunction:fn(s,'getAreaName'),
    wizardFeedback:value(s,'wizardFeedback'),wizardLines:value(s,'wizardLines'),
    soundSource:s.slice(s.indexOf('const bgMusic ='),s.indexOf('function goFullscreen')),
    realmFunctions:['getMissionAchievementPrefix','syncRealmAttemptState','recordTimedTrialAchievementStats'].map(n=>fn(s,n)),
    resourceSource,
    roomKey:s.match(/let room = localStorage.getItem\("([^"]+)"/)[1],
    artifactKeys:[...s.matchAll(/if\(saveData.artifacts\?\.vault\w+\) localStorage.setItem\("([^"]+)"/g)].map(m=>m[1]),
    legacyArtifactFields:[...s.matchAll(/if\(saveData.artifacts\?\.(vault\w+)\) localStorage.setItem\(/g)].map(m=>m[1]),
    highScoreFunction:fn(s,'updateHighScores'),
    pseudonymFunction:fn(s,'generatePseudonymFromSeed'),
    streakFunction:fn(s,'handleStreakVisuals'),
    resourceCSS:resourceStart<0?'':s.slice(s.lastIndexOf('/*',s.indexOf('INSTRUCTIONAL RESOURCE RECOMMENDATIONS')),s.indexOf('</style>')),
    modeKey:s.match(/localStorage.setItem\("([^"]+CurrentMode)"/)[1],
  };
}
fs.writeFileSync('audit_tools/economic_realm_engine/profiles.json',JSON.stringify(profiles,null,2)+'\n');
console.log(Object.fromEntries(Object.entries(profiles).map(([g,p])=>[g,{title:p.title,bossNames:p.bossNames,artifactKeys:p.artifactKeys,resources:!!p.resourceSource}])));
