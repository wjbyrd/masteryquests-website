import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {subscriptions} from '../../server/subscriptions/worker.mjs';
const require=createRequire(import.meta.url),{chromium}=require('playwright');
const root=process.cwd(),dist=path.join(root,'dist'),output=path.join(root,'tmp/october-update');fs.mkdirSync(output,{recursive:true});
let mode='disabled',providerCalls=0;
const ready={SUBSCRIPTIONS_ENABLED:'true',BREVO_API_KEY:'synthetic-fixture',BREVO_LIST_ID:'9',BREVO_DOI_TEMPLATE_ID:'12',SUBSCRIPTION_IP_LIMIT:{limit:async()=>({success:true})},SUBSCRIPTION_EMAIL_LIMIT:{limit:async()=>({success:true})},SUBSCRIPTION_GLOBAL_LIMIT:{limit:async()=>({success:true})}};
const server=http.createServer(async(req,res)=>{
  try{
    const url=new URL(req.url,'http://127.0.0.1');
    if(url.pathname==='/api/subscriptions'){
      const chunks=[];for await(const c of req)chunks.push(c);
      const headers={...req.headers,origin:'https://masteryquests.org','cf-connecting-ip':'192.0.2.1'};
      const r=await subscriptions(new Request('https://masteryquests.org/api/subscriptions',{method:req.method,headers,...(req.method==='POST'?{body:Buffer.concat(chunks)}:{})}),mode==='disabled'?{}:ready,async()=>{providerCalls++;return new Response('',{status:mode==='error'?503:providerCalls%2===1?404:201})});
      res.writeHead(r.status,Object.fromEntries(r.headers));res.end(await r.text());return;
    }
    const rel=decodeURIComponent(url.pathname).replace(/^\/+/,''),file=path.resolve(dist,rel,rel.endsWith('/')||!rel?'index.html':'');
    if(!file.startsWith(dist+path.sep)||!fs.existsSync(file)||!fs.statSync(file).isFile()){res.writeHead(404);res.end();return}
    const types={'.html':'text/html','.css':'text/css','.js':'text/javascript','.png':'image/png','.svg':'image/svg+xml','.pdf':'application/pdf','.webp':'image/webp'};
    res.writeHead(200,{'content-type':types[path.extname(file)]||'application/octet-stream'});fs.createReadStream(file).pipe(res);
  }catch(e){res.writeHead(500);res.end('Test server error')}
});
await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
const origin='http://127.0.0.1:'+server.address().port,browser=await chromium.launch({headless:true,channel:'msedge'});
try{
 const page=await browser.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
 const paths=['/how-to/','/how-to/pedagogy/','/how-to/question-banks/','/about/updates/','/about/subscribe/','/about/subscribe/confirmation/'];
 let layouts=0;
 for(const width of [320,390,768,1440])for(const route of paths){
  await page.setViewportSize({width,height:1000});await page.goto(origin+route);
  assert.equal(await page.locator('h1').count(),1,route);
  assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1),route+' overflow '+width);
  if(width===390||width===1440)await page.screenshot({path:path.join(output,route.replaceAll('/','_')+width+'.png'),fullPage:true});layouts++;
 }
 await page.goto(origin+'/how-to/pedagogy/');await page.keyboard.press('Tab');assert.equal(await page.evaluate(()=>document.activeElement.className),'skip-link');await page.keyboard.press('Enter');assert.equal(await page.evaluate(()=>document.activeElement.id),'main-content');
 await page.setViewportSize({width:390,height:844});await page.locator('.menu-toggle').focus();await page.keyboard.press('Enter');assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'true');await page.keyboard.press('Escape');assert.equal(await page.locator('.menu-toggle').getAttribute('aria-expanded'),'false');
 await page.goto(origin+'/how-to/question-banks/');
 await page.locator('#faculty-name').fill('Test Instructor');await page.locator('#institution').fill('Example College');await page.locator('#faculty-email').fill('faculty@example.edu');await page.getByRole('button',{name:'Prepare email request'}).click();assert(await page.locator('#request-ready').isHidden());
 await page.locator('[name=collection][value="Microeconomics"]').check();await page.locator('#intended-use').fill('Review & course design');await page.getByRole('button',{name:'Prepare email request'}).click();
 assert((await page.locator('#request-status').innerText()).includes('Nothing has been sent'));
 const mail=await page.locator('#request-email').getAttribute('href');assert(mail.startsWith('mailto:wjbyrd@troy.edu?'));assert(decodeURIComponent(mail).includes('Review & course design'));
 await page.locator('#intended-use').fill('Changed');assert(await page.locator('#request-ready').isHidden());
 await page.goto(origin+'/about/subscribe/');await page.waitForFunction(()=>document.querySelector('#subscription-status').textContent.includes('not available'));assert(await page.locator('#subscriber-email').isDisabled());
 mode='ready';providerCalls=0;await page.reload();await page.waitForFunction(()=>!document.querySelector('#subscription-fields').disabled);await page.locator('#subscriber-email').fill('faculty@example.edu');await page.getByRole('button',{name:'Send confirmation email'}).click();assert.equal(providerCalls,0);
 await page.locator('[name=consent]').check();await page.getByRole('button',{name:'Send confirmation email'}).click();await page.waitForFunction(()=>document.querySelector('#subscription-status').textContent.includes('Request processed'));assert.equal(providerCalls,2);
 mode='error';await page.locator('#subscriber-email').fill('faculty@example.edu');await page.locator('[name=consent]').check();await page.getByRole('button',{name:'Send confirmation email'}).click();await page.waitForFunction(()=>document.querySelector('#subscription-status').dataset.error==='true');assert((await page.locator('#subscription-status').innerText()).includes('unavailable'));
 const nojs=await browser.newContext({javaScriptEnabled:false}),fallback=await nojs.newPage();await fallback.goto(origin+'/how-to/question-banks/');assert.equal(await fallback.getByRole('link',{name:'wjbyrd@troy.edu',exact:true}).count(),1);assert(await fallback.locator('#bank-request-form').isHidden());await fallback.goto(origin+'/about/subscribe/');assert((await fallback.locator('noscript').innerText()).includes('requires JavaScript'));await nojs.close();
 assert.deepEqual(errors,[]);
 const report={layouts,desktopMobileTablet:true,keyboardNavigation:true,manualRequestDraft:true,noJavaScriptFallback:true,subscriptionDisabledState:true,mockedProviderAcceptance:true,mockedProviderFailure:true,affirmativeConsent:true,pageErrors:errors,realEmailDeliveryTested:false};fs.writeFileSync(path.join(output,'browser-results.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report));
}finally{await browser.close();server.close()}
