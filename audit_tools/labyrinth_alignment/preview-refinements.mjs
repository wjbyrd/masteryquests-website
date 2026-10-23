// Preview refinements: real published graphs, UI and approved-baseline comparisons.
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createHash} from 'node:crypto';
import {fn} from '../economic_realm_engine/source.mjs';
process.env.MQ_A11Y_OUT='tmp/accessibility_cleanup/labyrinth-refinements';
const {pw,serve,isolated,start,scan}=await import('../accessibility_cleanup/support.mjs');
const out=path.resolve(process.env.MQ_A11Y_OUT),base='8567ab7a';
const dir='play/micro-domains/labyrinth-of-choice',htmlFile=dir+'/index.html',bankFile=dir+'/labyrinth_of_choice_question_bank_student.js';
const oldText=file=>execFileSync('git',['show',`${base}:${file}`],{encoding:'utf8',maxBuffer:5e6}).replace(/\r\n/g,'\n');
const html=fs.readFileSync(htmlFile,'utf8').replace(/\r\n/g,'\n'),oldHTML=oldText(htmlFile),bankText=fs.readFileSync(bankFile,'utf8'),oldBankText=oldText(bankFile);
function bank(source){const c={};vm.createContext(c);vm.runInContext(source+'\nthis.result={bank:questionBank,metadata:typeof questionAssetMetadata===\'undefined\'?{}:questionAssetMetadata};',c);return JSON.parse(JSON.stringify(c.result));}
const current=bank(bankText),previous=bank(oldBankText);
function withoutAlt(value){if(Array.isArray(value))return value.map(withoutAlt);if(value&&typeof value==='object')return Object.fromEntries(Object.entries(value).filter(([k])=>k!=='imageAlt').map(([k,v])=>[k,withoutAlt(v)]));return value;}
assert.deepEqual(withoutAlt(current.bank),withoutAlt(previous.bank),'All non-alt bank data, keys, wording, objectives and difficulty are protected');
const graphQuestions=[];
function walk(value,location='questionBank'){if(!value||typeof value!=='object')return;if(value.image)graphQuestions.push({...value,location});for(const[k,v]of Object.entries(value))if(v&&typeof v==='object')walk(v,location+'.'+k);}
walk(current.bank);
const images=[...new Set(graphQuestions.map(q=>q.image))].sort();
assert.equal(images.length,21);assert.equal(graphQuestions.length,90);assert.deepEqual(Object.keys(current.metadata).sort(),images);
const inventory=images.map(image=>{
 const bytes=fs.readFileSync(dir+'/'+image),original=execFileSync('git',['show',`${base}:${dir}/${image}`],{maxBuffer:5e6});assert(bytes.equals(original),'Artwork changed: '+image);
 const refs=graphQuestions.filter(q=>q.image===image);assert(refs.every(q=>q.imageAlt===current.metadata[image].imageAlt));
 return {image,sha256:createHash('sha256').update(bytes).digest('hex'),references:refs.map(q=>({id:q.id,path:q.location,question:q.q})),before:'Alt text present; extended description missing',change:'Concise visual alt standardized; extended description added from inspected artwork',...current.metadata[image]};
});
fs.writeFileSync(path.join(out,'graph-inventory.json'),JSON.stringify(inventory,null,2));
// Presentation-only HTML boundary: shared helpers and original gameplay stay byte-identical.
const marker='<!-- Labyrinth-only presentation.';
const registryPattern=/(\/\* RELEASE REGISTRY \*\/ )(\{[^\n]+\})(\);)/;
const oldRegistry=JSON.parse(oldHTML.match(registryPattern)[2]),registry=JSON.parse(html.match(registryPattern)[2]);
for(const alias of ['labyrinth-of-choice','labyrinth-choice'])registry.games[alias].engineRevision=oldRegistry.games[alias].engineRevision;
assert.deepEqual(registry,oldRegistry);
assert.equal(html.slice(0,html.indexOf(marker)).replace(registryPattern,oldHTML.match(registryPattern)[0]),oldHTML.slice(0,oldHTML.indexOf(marker)));
const script=(source,id)=>source.match(new RegExp('<script id="'+id+'">([\\s\\S]*?)<\\/script>'))[1];
assert.equal(script(html,'labyrinth-interface'),script(oldHTML,'labyrinth-interface'),'Menu handlers unchanged');
const assessment=script(html,'labyrinth-exam'),oldAssessment=script(oldHTML,'labyrinth-exam');
assert.equal(assessment.replace(fn(assessment,'renderNavigation'),''),oldAssessment.replace(fn(oldAssessment,'renderNavigation'),''),'Only navigation presentation may change in Exam');
assert.equal(fs.readFileSync('wrangler.jsonc','utf8').replace(/\r\n/g,'\n'),oldText('wrangler.jsonc'));
for(const match of html.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi))if(!/\bsrc\s*=|application\/ld\+json|application\/json/i.test(match[1]))new vm.Script(match[2]);
execFileSync(process.execPath,['audit_tools/labyrinth_alignment/update-fingerprint.mjs','--check'],{stdio:'inherit'});
const {server,origin}=await serve(),browser=await pw.chromium.launch({channel:'msedge',headless:true}),results=[];
async function open(old=false,width=390,clock=false){
 const x=await isolated(browser,origin,{viewport:{width,height:900},reducedMotion:'reduce',acceptDownloads:true});x.errors=[];x.page.on('pageerror',e=>x.errors.push(e.message));
 await x.page.addInitScript(()=>{let n=16427;Math.random=()=>((n=(n*1664525+1013904223)>>>0)/4294967296);});
 if(clock){await x.page.clock.install({time:new Date('2026-10-23T16:00:00Z')});await x.page.clock.pauseAt(new Date('2026-10-23T16:00:01Z'));}
 if(old){await x.page.route('**/'+htmlFile,r=>r.fulfill({contentType:'text/html',body:oldHTML}));await x.page.route('**/'+bankFile,r=>r.fulfill({contentType:'text/javascript',body:oldBankText}));}
 await x.page.goto(origin+'/'+htmlFile,{timeout:30000});return x;
}
async function check(name,action){if(process.argv[2]&&!name.includes(process.argv[2]))return;try{results.push({name,status:'PASS',details:await action()});}catch(e){results.push({name,status:'FAIL',error:e.stack});}console.log(name,results.at(-1).status);fs.writeFileSync(path.join(out,process.argv[2]?'focused-results.json':'results.json'),JSON.stringify(results,null,2));}
async function shot(p,name){await p.screenshot({path:path.join(out,name+'.png'),fullPage:true});}
async function answer(p,correct){await p.clock.runFor(6500);const i=await p.evaluate(async want=>{for(let i=0;i<currentQuestion.options.length;i++)if(await isQuestionAnswerCorrect(currentQuestion,i)===want)return i;throw Error('Answer unavailable');},correct);await p.locator('#answers button').nth(i).focus();await p.keyboard.press('Enter');await p.waitForTimeout(30);await p.clock.runFor(2000);await p.waitForTimeout(30);}
async function state(p){return p.evaluate(()=>({room,q:currentQuestion?.id,options:currentQuestion?.options,attempts:totalAttempts,correct:correctAnswers,streak,maxStreak,bossHealth,bossCheckpoint,adaptiveMode,conceptMemory,masteryState,remediation:remediationState,columns:TELEMETRY_COLUMNS,report:getMasteryReportData(),events:readLocalTelemetry(runID).map(r=>({event:r.event,room:r.room,q:r.questionID,correct:r.correct,selected:r.selectedIndex,canonical:r.canonicalSelectedIndex,response:r.responseTimeMs,attempt:r.attempt,streak:r.streak,objective:r.objective,tag:r.tag,type:r.type})),vault:Object.fromEntries(Object.entries(ARTIFACT_STORAGE_KEYS).map(([k,v])=>[k,localStorage.getItem(v)]))}));}
try{
 for(const width of [1440,820,390,320])await check('menu appearance and keyboard '+width,async()=>{
  const variants=[];for(const old of [true,false]){const x=await open(old,width);try{const p=x.page;await start(p,'unlimited');await p.locator('#returnMenuBtn').focus();await p.keyboard.press('Enter');await p.waitForTimeout(50);
   await shot(p,(old?'before':'after')+'-menu-'+width);
   const metrics=await p.locator('#soundToggle,#labyrinthFullscreen,#mqMotionControl,#gameModalConfirm,#gameModalCancel').evaluateAll(nodes=>nodes.map(e=>{const s=getComputedStyle(e),r=e.getBoundingClientRect();return {id:e.id,width:r.width,height:r.height,top:r.top,bottom:r.bottom,font:s.font,padding:s.padding,margin:s.margin,border:s.border,bg:s.backgroundImage,shadow:s.boxShadow};}));
   if(!old){for(const m of metrics.slice(1))for(const key of ['width','font','padding','margin','border','bg','shadow'])assert.equal(m[key],metrics[0][key],m.id+' '+key);for(let i=1;i<metrics.length;i++)assert(Math.abs(metrics[i].top-metrics[i-1].bottom-10)<1,'Uniform 10px button gap');assert.equal(await p.locator('.fullscreenBtn').count(),0);assert.equal(await p.locator('#mqUtilityStatus').isVisible(),false);
    for(const key of ['Tab','Tab','Shift+Tab','Tab','Tab','Tab','Tab','Tab']){await p.keyboard.press(key);assert(await p.locator('#gameModal').evaluate(e=>e.contains(document.activeElement)));}
    await p.locator('#soundToggle').focus();await p.keyboard.press(' ');assert.equal(await p.evaluate(()=>soundEnabled),false);await p.locator('#mqMotionControl').focus();await p.keyboard.press('Enter');assert.equal(await p.evaluate(()=>localStorage.getItem('mq:accessibility:decorative-motion')),'playing');
    await p.keyboard.press('Escape');assert.equal(await p.evaluate(()=>document.activeElement.id),'returnMenuBtn');await p.locator('#returnMenuBtn').click();await p.locator('#gameModalCancel').focus();await p.keyboard.press('Enter');assert.equal(await p.locator('#gameModal').isVisible(),false);assert.equal(await p.evaluate(()=>document.activeElement.id),'returnMenuBtn');
    await p.locator('#returnMenuBtn').click();const accessibility=await scan(p);assert.deepEqual(accessibility.violations,[]);await p.keyboard.press('Escape');await p.reload();assert.equal(await p.evaluate(()=>soundEnabled),false);assert.equal(await p.evaluate(()=>document.documentElement.classList.contains('mq-motion-paused')),false);
   }variants.push({old,metrics,errors:x.errors});assert.deepEqual(x.errors,[]);
  }finally{await x.context.close();}}return variants;
 });
 for(const width of [1280,390])await check('every graph normal enlarged and keyboard '+width,async()=>{
  const x=await open(false,width);try{const p=x.page;await start(p,'trialGraph');const cdp=await x.context.newCDPSession(p);const evidence=[];const captured=new Set();
   for(const q of graphQuestions){const expected=current.metadata[q.image];
    await p.evaluate(id=>{const q=Object.values(questionBanks).flat().find(q=>q.id===id);if(!q)throw Error('Missing real bank question '+id);currentQuestion=shuffleOptions(q);document.getElementById('question').textContent=q.q;renderQuestionGraph(currentQuestion);displayQuestion();window.MQAccessibility?.sync();},q.id);
    const image=p.locator('#questionImageBox img');await image.evaluate(e=>e.decode());assert.equal(await image.getAttribute('alt'),expected.imageAlt);
    assert.equal(await p.locator('#questionGraphDescription').textContent(),expected.graphDescription);
    assert(await p.locator('#questionImageBox').evaluate(e=>e.querySelector('img').compareDocumentPosition(e.querySelector('details'))&Node.DOCUMENT_POSITION_FOLLOWING));
    await p.locator('#questionImageBox summary').focus();await p.keyboard.press('Enter');assert(await p.locator('#questionGraphDescription').isVisible());
    const ax=(await cdp.send('Accessibility.getFullAXTree')).nodes.find(n=>n.role?.value==='button'&&n.name?.value==='Enlarge graph: '+expected.imageAlt);
    assert.equal(ax?.description?.value,expected.graphDescription,'Browser accessibility description');
    if(!captured.has(q.image))await shot(p,'graph-normal-'+width+'-'+q.image.replace('.png',''));
    await image.focus();await p.keyboard.press('Enter');await p.locator('#graphLightboxImg').evaluate(e=>e.decode());assert(await p.locator('#graphLightbox').isVisible());assert.equal(await p.locator('#graphLightboxImg').getAttribute('alt'),expected.imageAlt);assert.equal(await p.locator('#graphLightboxDescription').textContent(),expected.graphDescription);
    if(!await p.locator('#graphLightbox details').evaluate(e=>e.open)){await p.locator('#graphLightbox summary').focus();await p.keyboard.press(' ');}
    assert(await p.locator('#graphLightboxDescription').isVisible());
    const expanded=(await cdp.send('Accessibility.getFullAXTree')).nodes.find(n=>n.role?.value==='image'&&n.name?.value===expected.imageAlt);assert.equal(expanded?.description?.value,expected.graphDescription);
    await p.locator('#graphLightbox summary').focus();await p.keyboard.press('Tab');assert.equal(await p.evaluate(()=>document.activeElement.id),'graphLightboxClose');await p.keyboard.press('Shift+Tab');assert.equal(await p.evaluate(()=>document.activeElement.tagName),'SUMMARY');
    const bounds=await p.locator('#graphLightbox').evaluate(e=>{e.scrollTop=0;const image=e.querySelector('img').getBoundingClientRect();const firstVisible=image.top>=e.getBoundingClientRect().top;e.scrollTop=e.scrollHeight;const text=e.querySelector('details').getBoundingClientRect();return {firstVisible,lastVisible:text.bottom<=e.getBoundingClientRect().bottom+1,horizontal:e.scrollWidth<=e.clientWidth+1};});
    assert(bounds.firstVisible&&bounds.lastVisible&&bounds.horizontal,'Whole graph and description must be reachable without horizontal overflow: '+q.image+' '+JSON.stringify(bounds));
    if(!captured.has(q.image)){await shot(p,'graph-expanded-'+width+'-'+q.image.replace('.png',''));captured.add(q.image);}
    await p.keyboard.press('Escape');assert(await image.evaluate(e=>e===document.activeElement));assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth));
    evidence.push({id:q.id,image:q.image,descriptionReadInBothViews:true});
   }
   const accessibility=await scan(p);assert.deepEqual(accessibility.violations,[]);assert.deepEqual(x.errors,[]);return {evidence,accessibility};
  }finally{await x.context.close();}
 });
 await check('full Exam protected state equals approved baseline',async()=>{
  const runs=[];for(const old of [true,false]){const x=await open(old,390,true);try{const p=x.page;await start(p,'exam');const trace=[await state(p)];await answer(p,false);await answer(p,true);const first=await p.evaluate(()=>currentQuestion.options);await p.locator('#examNext').focus();await p.keyboard.press(' ');await p.locator('#examPrevious').focus();await p.keyboard.press('Enter');assert.deepEqual(await p.evaluate(()=>currentQuestion.options),first);assert.equal(await p.evaluate(()=>totalAttempts),0);assert(await p.locator('#examCommit').isDisabled());assert.equal(await p.evaluate(()=>selectExamCheckpoint(10)),false);
   if(!old){assert.equal(await p.locator('#labyrinthExamNavigation p').count(),0);assert.equal(await p.locator('#labyrinthExamNavigation').evaluate(e=>getComputedStyle(e).borderTopWidth),'0px');assert.equal(await p.locator('#examCommit').getAttribute('aria-describedby'),'examSectionStatus');assert((await p.locator('#examSectionStatus').textContent()).includes('1 of 9'));assert(!(await p.locator('#labyrinthExamNavigation').innerText()).includes('Revise any response'));const disabled=await p.locator('#examCommit').evaluate(e=>({disabled:e.disabled,border:getComputedStyle(e).borderStyle}));assert(disabled.disabled&&disabled.border==='dashed');}
   await shot(p,(old?'before':'after')+'-exam-navigation');trace.push(await state(p));
   for(const startRoom of [1,11,21]){for(let n=startRoom;n<startRoom+9;n++){await p.locator(`[data-exam-room="${n}"]`).click();await answer(p,n%2===1);trace.push(await state(p));}await p.locator('#examCommit').focus();await p.keyboard.press('Enter');assert.equal(await p.evaluate(()=>selectExamCheckpoint(room)),false);trace.push(await state(p));for(const correct of startRoom===1?[false,true,false]:startRoom===11?[true,false,true]:[true,true,true]){await answer(p,correct);trace.push(await state(p));}await p.locator('#continueBtn').focus();await p.keyboard.press('Enter');trace.push(await state(p));}
   assert.equal(await p.evaluate(()=>totalAttempts),36);await p.getByRole('button',{name:'View Mastery Report',exact:true}).click();trace.push(await state(p));assert.deepEqual(x.errors,[]);runs.push(trace);
  }finally{await x.context.close();}}assert.deepEqual(runs[1],runs[0]);return {statesCompared:runs[0].length,final:runs[1].at(-1)};
 });
}finally{await browser.close();server.close();}
if(results.some(r=>r.status==='FAIL'))process.exitCode=1;
