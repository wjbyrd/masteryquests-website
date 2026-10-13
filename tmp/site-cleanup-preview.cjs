const fs=require('fs'),path=require('path'),http=require('http'),assert=require('assert/strict');
const {chromium}=require('playwright');
(async()=>{
 const root=process.cwd();
 const server=http.createServer((req,res)=>{const pathname=new URL(req.url,'http://localhost').pathname;const file=path.join(root,pathname,pathname.endsWith('/')?'index.html':'');try{res.setHeader('Content-Type',file.endsWith('.css')?'text/css':file.endsWith('.js')?'text/javascript':file.endsWith('.png')?'image/png':'text/html');res.end(fs.readFileSync(file));}catch{res.writeHead(404);res.end();}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));
 const browser=await chromium.launch({channel:'msedge',headless:true});
 try{const page=await browser.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
 for(const width of [390,1440])for(const route of ['/how-to/','/how-to/canvas/','/privacy/']){
 await page.setViewportSize({width,height:950});await page.goto('http://127.0.0.1:'+server.address().port+route);
 assert(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth+1));
 if(width===390)await page.locator('.menu-toggle').click();
 assert(await page.locator('.nav-subscribe').evaluate(el=>{const a=getComputedStyle(el),b=getComputedStyle(el.parentElement.querySelector('a'));return a.backgroundColor===b.backgroundColor&&a.padding===b.padding&&a.color===b.color}));
 if(width===390)await page.locator('.menu-toggle').click();
 if(route==='/privacy/'){
 assert.deepEqual(await page.locator('.privacy-toc a').evaluateAll(links=>links.slice(-3).map(a=>a.hash)),['#portable-telemetry','#faculty-communications','#contact']);
 assert.deepEqual(await page.locator('.privacy-content > section').evaluateAll(sections=>sections.slice(-3).map(s=>s.id)),['portable-telemetry','faculty-communications','contact']);
 await page.locator('#portable-telemetry').scrollIntoViewIfNeeded();
 } else if(route==='/how-to/') {assert.equal(await page.locator('#faculty-guides .adaptive-rule-grid').count(),1);await page.locator('#faculty-guides').scrollIntoViewIfNeeded();}
 await page.screenshot({path:'tmp/cleanup'+route.replaceAll('/','_')+width+'.png'});
 }
 assert.deepEqual(errors,[]);console.log('Passed: 6 desktop/mobile layouts, matching menu styling, privacy order and containment, continuous faculty grid; no overflow or JavaScript errors.');
 }finally{await browser.close();server.close();}
})().catch(e=>{console.error(e);process.exit(1)});
