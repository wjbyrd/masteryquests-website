import fs from 'node:fs';
import path from 'node:path';
import {createHash} from 'node:crypto';
import {createRequire} from 'node:module';
import {execFileSync} from 'node:child_process';
import {fn,templatePath} from '../economic_realm_engine/source.mjs';
const require=createRequire(import.meta.url),baseline='5e1d5644';
const out='validation_artifacts/boss_checkpoint_regression';fs.mkdirSync(out,{recursive:true});
const hash=x=>createHash('sha256').update(x).digest('hex');
const git=(...args)=>execFileSync('git',args,{encoding:'utf8',maxBuffer:30e6});
const funcs=['getCheckpointOutcome','recordCheckpointAttempt','advanceCheckpointAttempt','completeCheckpointEncounter','showKnowledgeRoom','buildBossQuestionSet','isQuestionAnswerCorrect','recordAdaptiveAttempt','applyScoreAttackForAnswer','buildMasteryReport'];
const files=git('ls-files','play','downloads/resources').trim().split(/\r?\n/).filter(f=>f.endsWith('.html') && fs.readFileSync(f,'utf8').includes('function startSelectedMode('));files.push(templatePath);
const result={baseline,head:git('rev-parse','HEAD').trim(),retrievedAt:new Date().toISOString(),files:[]};
for(const file of files){
 const current=fs.readFileSync(file,'utf8').replaceAll('\r\n','\n'),old=git('show',baseline+':'+file).replaceAll('\r\n','\n');
 const functions={};for(const name of funcs)if(current.includes('function '+name+'(')){const before=fn(old,name),after=fn(current,name);functions[name]={unchanged:before===after,before:hash(before),after:hash(after)};}
 result.files.push({file,engine:current.includes('function completeCheckpointEncounter(')?'three-response assessment':'legacy correct-hit boss',functions});
}
result.production={url:'https://masteryquests.org/play/economic-realm/market-gate/',files:[],functions:{}};
for(const [saved,local]of [['production-market-gate.html','index.html'],['production-market_gate_questions_student.js','market_gate_questions_student.js'],['production-instructional_resources.js','instructional_resources.js']]){
 const body=fs.readFileSync(path.join(out,saved),'utf8').replaceAll('\r\n','\n'),localFile='play/economic-realm/market-gate/'+local;
 result.production.files.push({saved,sha256:hash(body),matchesCurrent:body===fs.readFileSync(localFile,'utf8').replaceAll('\r\n','\n'),matchesBaseline:body===git('show',baseline+':'+localFile).replaceAll('\r\n','\n')});
 if(local==='index.html')for(const name of funcs)if(body.includes('function '+name+'('))result.production.functions[name]={matchesBaseline:fn(body,name)===fn(git('show',baseline+':'+localFile).replaceAll('\r\n','\n'),name),matchesCurrent:fn(body,name)===fn(fs.readFileSync(localFile,'utf8').replaceAll('\r\n','\n'),name)};
}
fs.writeFileSync(out+'/'+(process.env.MQ_BOSS_SOURCE_REPORT || 'source-current.json'),JSON.stringify(result,null,2)+'\n');
// Fresh portable export from the current authoritative template and real library.
const core=require('../../build/faculty-build-composer/composer-core.js');
const helpers=require('../../build/faculty-build-composer/tests/composer-test-helpers.js');
const library=helpers.loadComposerLibrary(),template=helpers.loadCanonicalTemplate();
const recipe={title:'Checkpoint Regression Fixture',slug:'checkpoint-regression',selectedConceptIds:['demand'],supportedModes:['standard'],seed:'checkpoint-regression'};
const composition=core.compose(library,recipe);
helpers.attachConceptReviewRuntime(core,composition,library,recipe.selectedConceptIds);
composition.embeddedQuestionAssets=Object.fromEntries((composition.assets || []).map(asset=>[asset.runtimePath,'data:image/webp;base64,'+fs.readFileSync(path.join('build/faculty-build-composer/data',asset.runtimePath)).toString('base64')]));
const config=await core.createConfig(recipe,library,await core.sha256Hex(template));
const metadata=helpers.createMetadata(core,composition,config,library);
const html=core.buildHtml(template,composition,config,metadata);
fs.mkdirSync('tmp/boss-checkpoint-regression',{recursive:true});fs.writeFileSync('tmp/boss-checkpoint-regression/faculty.html',html);
console.log(JSON.stringify({files:result.files.length,production:result.production},null,2));
