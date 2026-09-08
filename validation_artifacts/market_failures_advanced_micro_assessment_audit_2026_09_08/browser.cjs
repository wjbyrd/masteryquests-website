const fs=require('fs'),path=require('path'),http=require('http');
const {chromium}=require('C:/Users/Jennings/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const root=path.resolve('.failures-work/generated');
 const server=http.createServer((req,res)=>{const p=path.resolve(root,'.'+decodeURIComponent(req.url.split('?')[0]==='/'?'/index.html':req.url.split('?')[0]));if(!p.startsWith(root+path.sep)){res.writeHead(403);return res.end();}if(!fs.existsSync(p)){res.writeHead(404);return res.end();}res.setHeader('Content-Type',p.endsWith('.html')?'text/html; charset=utf-8':'image/webp');res.end(fs.readFileSync(p));});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({channel:'msedge',headless:true});
 const page=await browser.newPage({viewport:{width:1280,height:900}});const errors=[];page.on('pageerror',e=>errors.push(e.message));
 await page.route('**/*',route=>route.request().url().startsWith('http://127.0.0.1:')||route.request().url().startsWith('data:')?route.continue():route.abort());
 await page.goto('http://127.0.0.1:'+server.address().port+'/',{waitUntil:'load'});
 const result=await page.evaluate(()=>({title:document.title,buttons:[...document.querySelectorAll('button')].slice(0,20).map(b=>({id:b.id,text:b.textContent.trim()})),banks:typeof questionBanks,media:typeof renderQuestionMedia,body:document.body.innerText.slice(0,300)}));
 console.log(JSON.stringify(result));
 await page.getByPlaceholder('Enter a name or initials').fill('Audit');
 await page.getByRole('button',{name:'START GAME',exact:true}).click();
 await page.locator('[data-mode=legendary]').click();
 if(await page.locator('#guideIntroProceed').isVisible())await page.locator('#guideIntroProceed').click();
 await page.locator('#question').waitFor({state:'visible'});
 const changes=JSON.parse(fs.readFileSync('.failures-work/changes.json','utf8'));
 const verified=await page.evaluate(changes=>{const records=[...Object.values(questionBanks).filter(Array.isArray).flat(),...repairQuestions,...bridgeQuestions,...Object.values(skillRepairSeedPools).flat()];return changes.map(c=>{const q=records.find(q=>String(q.id)===c.id);return {id:c.id,present:!!q,contentMatches:!!q&&Object.entries(c.after).every(([k,v])=>JSON.stringify(q[k])===JSON.stringify(v))};});},changes);
 if(verified.some(v=>!v.contentMatches))throw Error('Generated content mismatch '+JSON.stringify(verified.filter(v=>!v.contentMatches)));
 const graphChecks=[];
 const graphIds=await page.evaluate(()=>[...new Set(Object.values(questionBanks).filter(Array.isArray).flat().filter(q=>q.image).map(q=>String(q.id)))]);
 for(const id of graphIds){
  const check=await page.evaluate(async id=>{const q=Object.values(questionBanks).filter(Array.isArray).flat().find(q=>String(q.id)===id);renderQuestionMedia(q);document.getElementById('question').textContent=q.q;const imgs=[...document.querySelectorAll('#questionImageBox img')];await Promise.all(imgs.map(i=>i.decode().catch(()=>{})));imgs[0]?.click(); const zoom=document.getElementById('graphLightboxImg'); await zoom.decode().catch(()=>{}); const zoomOK=document.getElementById('graphLightbox').classList.contains('active')&&zoom.naturalWidth>0; closeGraphLightbox(); return {id,zoomOK,description:document.getElementById('questionGraphDescription')?.textContent,source:imgs.map(i=>i.src.slice(0,180)),questionImage:q.image,embeddedImages:imgs.length,loaded:imgs.every(i=>i.naturalWidth>0),text:document.getElementById('question').textContent===q.q};},id);graphChecks.push(check);
 }
 if(graphChecks.some(c=>!c.loaded||!c.embeddedImages||!c.text||!c.zoomOK||!c.description))throw Error('Graph browser render failed '+JSON.stringify(graphChecks));
 await page.evaluate(()=>{currentQuestion=structuredClone(Object.values(questionBanks).filter(Array.isArray).flat().find(q=>String(q.id)==='42100'));document.getElementById('question').textContent=currentQuestion.q;displayQuestion();});
 await page.waitForFunction(()=>document.getElementById('question').textContent===currentQuestion.q);
 await page.locator('#questionImageBox img').first().scrollIntoViewIfNeeded();
 const visibleExample=await page.locator('#question').isVisible();if(!visibleExample)throw Error('Question not visible');
 if(await page.locator('#dailyDetailsClose').isVisible())await page.locator('#dailyDetailsClose').click();
 await page.screenshot({path:'.failures-work/browser-smoke.png',fullPage:true});
 const report={engine:'Microsoft Edge / Playwright',visibleLegendaryQuestion:true,exampleId:'42100',pageErrors:errors,revisedRecordsVerified:verified.length,allRevisedRecordsPresent:true,graphChecks,externalRequestsBlocked:true,scope:'Generated HTML loads; all revised payloads match; all ordinary/checkpoint graph questions decode and their click-to-enlarge image opens. This is a content smoke test, not an all-mode playthrough.'};
 if(errors.length)throw Error(JSON.stringify(errors));fs.writeFileSync('.failures-work/browser-validation.json',JSON.stringify(report,null,2)+'\n');console.log(JSON.stringify({...report,graphChecks:graphChecks.length}));
 await browser.close();await new Promise(r=>server.close(r));
})().catch(e=>{console.error(e);process.exit(1)});
