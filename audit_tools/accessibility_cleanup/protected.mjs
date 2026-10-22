import fs from 'node:fs';import crypto from 'node:crypto';import {execFileSync} from 'node:child_process';import {parse} from '../../tmp/accessibility_cleanup/node_modules/acorn/dist/acorn.mjs';
const git=args=>execFileSync('git',['-c','core.safecrlf=false',...args],{encoding:'utf8',maxBuffer:50e6});
const files=git(['diff','--name-only']).trim().split('\n').filter(f=>f.endsWith('.html')&&fs.readFileSync(f,'utf8').includes('function startSelectedMode('));
const hash=s=>crypto.createHash('sha256').update(s.replaceAll('\r\n','\n')).digest('hex');
function index(source){
 const entries=new Map();
 for(const m of source.matchAll(/<script(?:\s[^>]*)?>([\s\S]*?)<\/script>/g)){
  const code=m[1];if(!code.trim())continue;
  for(const node of parse(code,{ecmaVersion:'latest',sourceType:'script'}).body){
   if(node.type==='FunctionDeclaration')entries.set(node.id.name,code.slice(node.start,node.end));
   if(node.type==='VariableDeclaration')for(const d of node.declarations)if(d.id.name)entries.set(d.id.name,code.slice(d.start,d.end));
  }
 }
 return entries;
}
const constants=['questionBanks','microSkillRepairPools','microSkillBridgePools','skillRepairSeedPools','FACULTY_COMPOSITION_CONFIG','TIMING','RAPID_GUESS_CONFIG','FACULTY_MODE_REQUIREMENTS','TELEMETRY_COLUMNS','questionAssetMetadata'];
const functions=['answer','loadQuestion','pickQuestion','shuffleOptions','recordAdaptiveAttempt','getModeCapabilities','modeAllowsImmediateCorrectnessFeedback','applyScoreAttackForAnswer','settleRiskRewardAnswer','applyFadingFortuneFade','buildMasteryReport','saveGameState','getExamRoomState','recordExamResponse','sendGameData'];
const results=[];
for(const file of files){const before=git(['show','HEAD:'+file]),after=fs.readFileSync(file,'utf8'),checks=[],aIndex=index(before),bIndex=index(after);
 for(const [kind,names] of [['constant',constants],['function',functions]])for(const name of names){
  if(!before.includes((kind==='constant'?'const ':'function ')+name))continue;
  try{const a=hash(aIndex.get(name)),b=hash(bIndex.get(name));checks.push({kind,name,unchanged:a===b,before:a,after:b});}catch(e){checks.push({kind,name,error:e.message});}
 }
 results.push({file,checks});
}
const changed=git(['diff','--name-only']).trim().split('\n');
const bankChanges=changed.filter(f=>/question.*\.(js|json)$|(?:composer_library|engine|model|storage)\.js$/.test(f));
const out=process.env.MQ_A11Y_OUT || 'validation_artifacts/accessibility_cleanup';
fs.mkdirSync(out,{recursive:true});
fs.writeFileSync(out+'/protected.json',JSON.stringify({baseline:git(['rev-parse','HEAD']).trim(),bankChanges,results},null,2));
const failures=results.flatMap(r=>r.checks.filter(c=>!c.unchanged).map(c=>({file:r.file,...c})));
console.log(JSON.stringify({files:files.length,checks:results.reduce((n,r)=>n+r.checks.length,0),failures,bankChanges},null,2));
if(failures.length||bankChanges.length)process.exitCode=1;
