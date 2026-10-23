import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {createRequire} from 'node:module';
import {parseCSV,validateCSV} from '../telemetry_contract/validate.mjs';
import {start} from '../labyrinth_alignment/test-start.mjs';
process.env.MQ_A11Y_OUT='tmp/unified-rpg-telemetry/browser';
const {pw,serve,isolated}=await import('../accessibility_cleanup/support.mjs');
const schema=JSON.parse(fs.readFileSync('audit_tools/unified_rpg_telemetry/schema.json','utf8'));
const audit=JSON.parse(fs.readFileSync('audit_tools/unified_rpg_telemetry/baseline.json','utf8'));
const require=createRequire(import.meta.url),analysis=require('../../tools/answer-analysis/analysis.js');
const out=path.resolve(process.env.MQ_A11Y_OUT);fs.mkdirSync(out,{recursive:true});
const composer=audit.games.find(g=>g.collection==='faculty-composer');
const core=require('../../build/faculty-build-composer/composer-core.js');
const helpers=require('../../build/faculty-build-composer/tests/composer-test-helpers.js');
const recipe={schemaVersion:core.RECIPE_SCHEMA_VERSION,title:'Telemetry QA',slug:'telemetry-qa',supportedModes:composer.modes,selectedConceptIds:['perfect-competition','aggregate-demand'],checkpointFocus:{checkpointOne:null,checkpointTwo:null,finalCheckpoint:null}};
const library=helpers.loadComposerLibrary(),composition=core.compose(library,recipe);
composition.embeddedQuestionAssets=Object.fromEntries(composition.assets.map(a=>[a.runtimePath,'data:image/webp;base64,'+fs.readFileSync('build/faculty-build-composer/data/'+a.runtimePath).toString('base64')]));
const built=await helpers.buildFacultyGame(core,recipe,{library,composition});
composer.file='tmp/unified-rpg-telemetry/browser/composer.html';fs.writeFileSync(composer.file,built.html);
const {server,origin}=await serve(),browser=await pw.chromium.launch({channel:'msedge',headless:true}),results=[];
const filter=process.argv[2];
try{for(const game of audit.games){if(filter&&!game.game.includes(filter))continue;
 for(const mode of game.modes){let x;const label=game.game.replace(/[^a-z0-9]+/gi,'-')+'-'+mode;
  try{x=await isolated(browser,origin,{acceptDownloads:true,viewport:{width:mode==='quiz'?390:1440,height:900}});
   const errors=[];x.page.on('pageerror',e=>errors.push(e.message));
   await x.page.addInitScript(()=>{let n=198401;Math.random=()=>((n=(n*1664525+1013904223)>>>0)/4294967296);});
   await x.page.clock.install({time:new Date('2026-10-23T16:00:00Z')});await x.page.clock.pauseAt(new Date('2026-10-23T16:00:01Z'));
   await x.page.goto(origin+'/'+game.file);await start(x.page,mode);await x.page.clock.runFor(6500);
   const selection=await x.page.evaluate(async()=>{for(let i=0;i<currentQuestion.options.length;i++)if(await isQuestionAnswerCorrect(currentQuestion,i))return i;throw Error('No correct option');});
   const before=await x.page.evaluate(()=>({attempts:totalAttempts,records:readLocalTelemetry(runID).length,run:runID}));
   await x.page.locator('#answers button').nth(selection).click();await x.page.waitForTimeout(60);
   if(mode==='exam'){
    // A draft is not an accepted answer. End via the existing report handler.
    assert.equal(await x.page.evaluate(()=>totalAttempts),before.attempts);
    await x.page.evaluate(()=>handlePracticeModeComplete({endedByStudent:true}));
   }
   const raw=await x.page.evaluate(()=>readLocalTelemetry(runID));
   const download=x.page.waitForEvent('download');await x.page.evaluate(()=>downloadTelemetryCsv());
   const file=path.join(out,label+'.csv');await(await download).saveAs(file);
   const text=fs.readFileSync(file,'utf8'),table=parseCSV(text);assert.deepEqual(table.shift(),schema.columns);
   const rows=table.map(r=>Object.fromEntries(schema.columns.map((k,i)=>[k,r[i]])));
   assert(rows.every(r=>r.csvSchemaVersion===schema.version));assert(rows.every(r=>r.collectionID===game.collection));
   const row=rows.findLast(r=>r.event===(mode==='exam'?'exam_answer_initial':'question'));
   assert(row,label+': response missing');
   if(mode!=='exam'){assert.equal(row.correct,'1');assert.equal(row.selectedIndex,String(selection));assert(Number(row.responseTimeMs)>0);}
   else{assert.equal(row.correct,'');assert.equal(JSON.parse(row.answerSnapshotJSON).correctOptionIndices,null);}
   if(mode==='riskReward'){assert(Number(row.riskRewardWagerAmount)>0);assert.equal(row.riskRewardWagerPercent,'10');assert.equal(row.riskRewardAllIn,'0');}
   else assert.equal(row.riskRewardWagerAmount,'');
   if(game.collection==='micro-domains'){assert.equal(row.activeResponseTimeMs,'');assert.equal(JSON.parse(row.fieldAvailabilityJSON).activeResponseTimeMs,'not-measured');}
   else assert(Number(row.activeResponseTimeMs)>0,label+': tracker must report actual visible interval');
   assert.equal((await x.page.evaluate(()=>readLocalTelemetry(runID))).length,raw.length,'Download must not emit observations');
   const report=analysis.analyze(analysis.parseCSV(text));assert.equal(report.stats.accepted,mode==='exam'?0:1);assert.equal(report.stats.duplicates,0);
   const validation=validateCSV(text);assert.equal(validation.status,'PASS',JSON.stringify(validation.issues));
   if(mode==='quiz'||mode==='standard')await x.page.screenshot({path:path.join(out,label+'.png'),fullPage:true});
   assert.deepEqual(errors,[]);results.push({game:game.game,mode,status:'PASS',file:path.relative(process.cwd(),file),rows:rows.length,accepted:report.stats.accepted});
  }catch(e){if(x)fs.writeFileSync(path.join(out,label+'-failure.txt'),await x.page.locator('body').innerText().catch(()=>''));results.push({game:game.game,mode,status:'FAIL',detail:e.stack});}
  finally{await x?.context.close();fs.writeFileSync(path.join(out,'results'+(filter?'-'+filter:'')+'.json'),JSON.stringify(results,null,2));}
  console.log(label+': '+results.at(-1).status+(results.at(-1).status==='FAIL'?' '+results.at(-1).detail.split('\n')[0]:''));
 }
}}finally{await browser.close();await new Promise(r=>server.close(r));}
if(results.some(r=>r.status==='FAIL'))process.exitCode=1;
