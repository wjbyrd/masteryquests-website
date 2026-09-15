import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
const require=createRequire(import.meta.url);
const {chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const root=process.cwd();
const server=http.createServer((req,res)=>{
  let file=path.resolve(root,'.'+decodeURIComponent(req.url.split('?')[0]));
  if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  if(fs.existsSync(file)&&fs.statSync(file).isDirectory())file=path.join(file,'index.html');
  if(!fs.existsSync(file)){res.writeHead(404).end();return;}
  res.setHeader('Content-Type',({'.html':'text/html','.js':'application/javascript','.css':'text/css','.png':'image/png','.svg':'image/svg+xml','.webp':'image/webp'})[path.extname(file)]||'application/octet-stream');
  res.end(fs.readFileSync(file));
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({channel:'msedge',headless:true});
const results=[];
try{
  const context=await browser.newContext();
  await context.route('**/*',route=>route.request().url().startsWith(origin+'/')?route.continue():route.abort());
  const page=await context.newPage();
  for(const width of [390,1440])for(const route of ['/privacy/','/how-to/composer/','/how-to/responsible-telemetry-use/','/build/','/how-to/telemetry-data-dictionary/']){
    await page.setViewportSize({width,height:900});
    await page.goto(origin+route);
    const selector=route.includes('dictionary')?'#capability-control-plane':'#portable-telemetry';
    const section=page.locator(selector);await section.scrollIntoViewIfNeeded();
    assert.equal(await section.count(),1);
    const layout=await section.evaluate(el=>({width:el.getBoundingClientRect().width,insideMain:!!el.closest('main'),text:el.textContent,overflow:document.documentElement.scrollWidth>innerWidth+1}));
    assert(layout.insideMain&&!layout.overflow);
    assert(layout.width>=300&&layout.width<=1440);
    assert(layout.text.includes('365-day')&&layout.text.includes('National Engine'));
    results.push({route,viewportWidth:width,sectionWidth:layout.width,insideMain:layout.insideMain,horizontalOverflow:layout.overflow,status:'PASS'});
  }
  fs.writeFileSync('validation_artifacts/portable_telemetry_production_rollout/browser.json',JSON.stringify({status:'PASS',browser:browser.version(),localOnly:true,externalNetworkBlocked:true,results},null,2)+'\n');
  console.log('PASS: 10 local page/viewport layout checks; external network blocked.');
}finally{await browser.close();server.close();}
