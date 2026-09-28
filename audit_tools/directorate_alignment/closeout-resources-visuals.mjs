import {fs,path,chromium,out,server,origin,games} from './closeout-support.mjs';
const results=[];const browser=await chromium.launch({channel:'msedge',headless:true});
try{for(const game of games){
 const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));await page.route('**/*',r=>new URL(r.request().url()).origin===origin?r.continue():r.fulfill({status:204,body:''}));
 await page.goto(`${origin}/play/managerial-intelligence-directorate/${game}/`);
 const resources=await page.evaluate(()=>{
  const c=getInstructionalResourceConfig(),qs=[...Object.values(questionBanks).flat(),...Object.values(microSkillRepairPools).flat(),...Object.values(microSkillBridgePools).flat()];
  const objectives=[...new Set(qs.map(q=>q.objective))].map(id=>({id,mapping:getObjectiveResourceMapping(c,id),recommendations:getRecommendedResources([id])}));
  const refs=Object.entries(c.objectives).flatMap(([lo,v])=>(v.resourceIds||[]).map(id=>({lo,id,valid:!!resolveInstructionalResourceById(c,id)})));
  const fallback=Object.keys(c.chapters).map(ch=>({chapter:ch,resources:getRecommendedResources([`LO${ch}.999`])}));
  const malformed=['javascript:alert(1)','http://example.com/x','file:///private.docx','C:\\private.docx','data:text/html,test'].map(url=>({url,rejected:!isSafeInstructionalResourceUrl(url)}));
  const bad={chapters:{a:{resources:[{id:'bad',title:'Bad',url:'javascript:alert(1)'}]}}};
  const all=Object.values(c.chapters).flatMap(ch=>ch.resources||[]);
  const recommendations=getRecommendedResources(objectives.map(x=>x.id));
  return {objectives,refs,fallback,malformed,missingSafe:resolveInstructionalResourceById(c,'missing-resource-id')===null,malformedSafe:resolveInstructionalResourceById(bad,'bad')===null,recommendations,all,trial:isFacultyModeSupported('trialGraph')?getTrialGraphCandidates().map(q=>({id:q.id,required:q.graphRequired,image:q.image})):null};
 });
 if(resources.objectives.some(x=>x.id!=='INTEGRATION'&&!x.recommendations.length)||resources.refs.some(x=>!x.valid)||resources.fallback.some(x=>!x.resources.length)||resources.malformed.some(x=>!x.rejected)||!resources.missingSafe||!resources.malformedSafe||resources.recommendations.length>3)throw Error('Resource mapping regression '+game);
 const localResources=[];for(const r of resources.all.filter(x=>!/^https:\/\//.test(x.url))){const response=await page.request.get(new URL(r.url,page.url()).href);localResources.push({id:r.id,url:r.url,status:response.status()});if(!response.ok())throw Error('Resource missing');}
 const visuals=[];
 if(['market-signal','strategy-desk'].includes(game))for(const viewport of [{width:1365,height:1000},{width:390,height:844}]){
  await page.setViewportSize(viewport);const assets=game==='market-signal'?['market_curves_independent.svg','long_run_competition.png','demand_supply.png']:['gametreeone.webp','gametreetwo.webp','gametreethree.webp','investment_hidden_information.svg'];
  for(const asset of assets){
   await page.evaluate(asset=>{const q=Object.values(questionBanks).flat().find(q=>q.image===asset);renderQuestionMedia(q);let e=document.getElementById('questionImageBox');while(e){if(getComputedStyle(e).display==='none')e.style.display='block';e=e.parentElement;}document.getElementById('startScreen').style.display='none';document.getElementById('question').innerHTML=q.q;},asset);
   await page.locator('#questionImageBox img').evaluate(img=>img.decode());
   await page.locator('#questionImageBox img').focus();await page.keyboard.press('Enter');
   if(await page.locator('#graphLightbox').getAttribute('aria-hidden')!=='false')throw Error('Keyboard enlargement failed');
   await page.locator('#graphLightboxImg').evaluate(img=>img.decode());
   const visual=await page.evaluate(()=>{const img=document.getElementById('graphLightboxImg'),box=document.getElementById('graphLightbox'),close=box.querySelector('button');return {alt:img.alt,description:document.getElementById('graphLightboxDescription').textContent,natural:[img.naturalWidth,img.naturalHeight],rendered:[img.getBoundingClientRect().width,img.getBoundingClientRect().height],scrollWidth:box.scrollWidth,clientWidth:box.clientWidth,close:close?{label:close.getAttribute('aria-label')||close.textContent,width:close.getBoundingClientRect().width,height:close.getBoundingClientRect().height}:null};});
   if(!visual.description||!visual.natural[0])throw Error('Missing accessible visual');
   await page.screenshot({path:path.join(out,`${game}-${viewport.width}-${asset}.png`)});
   if(viewport.width<500){await page.locator('#graphLightbox').evaluate(e=>{e.scrollLeft=e.scrollWidth;});visual.scrolled=await page.locator('#graphLightbox').evaluate(e=>e.scrollLeft);}
   await page.keyboard.press('Escape');if(await page.locator('#graphLightbox').getAttribute('aria-hidden')!=='true')throw Error('Cannot close enlargement');
   visuals.push({asset,viewport,...visual,keyboardOpenClose:true});
  }
 }
 if(errors.length)throw Error(JSON.stringify(errors));results.push({game,resources,localResources,visuals,errors});fs.writeFileSync(path.join(out,'resources-visuals.json'),JSON.stringify(results,null,2));console.log(JSON.stringify({game,objectives:resources.objectives.length,localResources:localResources.length,visuals:visuals.length,errors}));await page.close();
}}finally{await browser.close();await new Promise(r=>server.close(r));}
