import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {games,templatePath,fn,baselineCommit} from './source.mjs';
const template=fs.readFileSync(templatePath,'utf8').replace(/\r\n/g,'\n');
const profiles=JSON.parse(fs.readFileSync('audit_tools/economic_realm_engine/profiles.json','utf8'));
const hash=bytes=>crypto.createHash('sha256').update(bytes).digest('hex');
const format=s=>s.replace(/^[ \t]+/gm,indent=>indent.replace(/\t/g,'    ')).replace(/[ \t]+$/gm,'');
const functions=['answer','loadQuestion','displayQuestion','planRemediation','remediationTransitionAllowed','advanceCheckpointAttempt','recordCheckpointAttempt','commitExamSection','navigateExamRoom','recordExamDraftAnswer','selectExamQuestion','buildBossQuestionSet','getMasteryReportData','createQuestionVisibilityTimingState','getQuestionBehaviorData','downloadTelemetryCsv','scheduleForCurrentRun','saveGameState','getArtifactInventoryCount','activateArtifact','buildQuizDeck','buildTrialGraphDeck','buildFadingFortuneDeck','buildRiskRewardDeck'];
// Protect complete functions, rather than accepting the presence of feature labels.
const names=functions.filter(name=>new RegExp(`^function ${name}\\(|^async function ${name}\\(`,'m').test(template));
const results=[];
for(const game of games){
 const base=`play/economic-realm/${game}`,p=profiles[game],source=fs.readFileSync(`${base}/index.html`,'utf8').replace(/\r\n/g,'\n');
 for(const name of names)assert.equal(format(fn(source,name)),format(fn(template,name)),`${game}: ${name} differs from Composer`);
 // The question refresh has its own canonical-content/asset checks. Continue
 // protecting every original presentation/resource file against the old freeze.
 const files=execFileSync('git',['ls-tree','-r','--name-only',baselineCommit,base],{encoding:'utf8'}).trim().split(/\r?\n/).filter(f=>f!==`${base}/index.html`&&f!==`${base}/${p.bank}`);
 for(const file of files){const before=execFileSync('git',['show',`${baselineCommit}:${file}`],{maxBuffer:32e6});const normalize=b=>/\.(?:js|mjs|html|css|json|txt|md|srt)$/i.test(file)?b.toString('utf8').replace(/\r\n/g,'\n'):b;assert.equal(hash(normalize(fs.readFileSync(file))),hash(normalize(before)),`Protected file changed: ${file}`);}
 assert(source.includes('allowAnonymousDataCollection": false'));
 assert(!/anonymous-telemetry|anonymousTelemetrySource|MQ_INGEST_ACTIVATION/.test(source));
 results.push({game,composerFunctions:names.length,protectedFiles:files.length,bankSha256:hash(fs.readFileSync(`${base}/${p.bank}`))});
}
execFileSync(process.execPath,['audit_tools/economic_realm_questions/sync.mjs','--check'],{stdio:'pipe'});
execFileSync(process.execPath,['audit_tools/economic_realm_engine/sync.mjs','--check'],{stdio:'pipe'});
fs.mkdirSync('validation_artifacts/economic_realm_engine',{recursive:true});
fs.writeFileSync('validation_artifacts/economic_realm_engine/source-results.json',JSON.stringify({templateSha256:hash(template),functions:names,results},null,2)+'\n');
console.log(JSON.stringify({passed:true,functionsPerGame:names.length,protectedFiles:results.reduce((n,r)=>n+r.protectedFiles,0)}));
