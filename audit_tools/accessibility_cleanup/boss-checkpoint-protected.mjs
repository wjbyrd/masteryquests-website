import fs from 'node:fs';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {parse} from '../../tmp/accessibility_cleanup/node_modules/acorn/dist/acorn.mjs';
const git=args=>execFileSync('git',['-c','core.safecrlf=false',...args],{encoding:'utf8',maxBuffer:40e6});
const baseline=process.env.MQ_BOSS_BASELINE || 'a4b247fd';
const changed=git(['diff',baseline,'--name-only']).trim().split(/\r?\n/);
const names=['questionBanks','microSkillRepairPools','microSkillBridgePools','skillRepairSeedPools','repairQuestions','bridgeQuestions','FACULTY_COMPOSITION_CONFIG','TIMING','RAPID_GUESS_CONFIG','FACULTY_MODE_REQUIREMENTS','TELEMETRY_COLUMNS','questionAssetMetadata','MANUAL_QUESTION_PACKAGE','answer','loadQuestion','pickQuestion','shuffleOptions','buildBossQuestionSet','getWeakestBossObjective','isQuestionAnswerCorrect','recordCheckpointAttempt','finalizeCheckpointOutcome','advanceCheckpointAttempt','recordAdaptiveAttempt','getModeCapabilities','getDifficultyForMode','modeAllowsImmediateCorrectnessFeedback','applyScoreAttackForAnswer','settleRiskRewardAnswer','applyFadingFortuneFade','buildMasteryReport','saveGameState','loadSavedGame','getExamRoomState','recordExamResponse','sendGameData','earnArtifact'];
function index(html){const map=new Map();for(const match of html.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)){const code=match[1];for(const node of parse(code,{ecmaVersion:'latest'}).body){if(node.type==='FunctionDeclaration')map.set(node.id.name,code.slice(node.start,node.end));if(node.type==='VariableDeclaration')for(const d of node.declarations)if(d.id.name)map.set(d.id.name,code.slice(d.start,d.end));}}return map;}
const hash=s=>createHash('sha256').update(s).digest('hex'),results=[];
for(const file of changed.filter(f=>f.endsWith('.html') && !f.startsWith('validation_artifacts/') && !f.startsWith('tmp/'))){
 const before=index(git(['show',baseline+':'+file]).replaceAll('\r\n','\n')),after=index(fs.readFileSync(file,'utf8').replaceAll('\r\n','\n')),checks=[];
 for(const name of names)if(before.has(name)){
  let current=after.get(name);
  // The only permitted answer-path change is the Standard first-miss routing exit.
  if(name==='answer')current=current.replace('\n     if(gameMode === "standard"){\n        failStandardCheckpoint();\n        return;\n     }','').replace('if (!(gameMode === "standard" && isBossRoom) && gameMode !== "legendary"','if (gameMode !== "legendary"');
  checks.push({name,unchanged:before.get(name)===current,before:hash(before.get(name)),after:hash(current)});
 }
 results.push({file,checks});
}
const bankChanges=changed.filter(f=>!f.startsWith('validation_artifacts/') && /question.*\.(js|json)$|composer-core\.js$/.test(f));
const failed=results.flatMap(r=>r.checks.filter(c=>!c.unchanged).map(c=>({file:r.file,...c})));
fs.writeFileSync('validation_artifacts/boss_checkpoint_regression/protected.json',JSON.stringify({baseline:git(['rev-parse',baseline]).trim(),bankChanges,results,failed},null,2)+'\n');
assert.deepEqual(failed,[]);assert.deepEqual(bankChanges,[]);
console.log(`PASS: ${results.reduce((n,r)=>n+r.checks.length,0)} protected definitions across ${results.length} game/template files; only the explicit Standard boss routing insertion is excluded.`);
