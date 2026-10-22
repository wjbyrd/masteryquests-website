import fs from 'node:fs';import path from 'node:path';
import {root,out,pw,walk,serve,isolated,scan,start,save} from './support.mjs';
const phase=process.argv[2]||'baseline';
const base=process.argv.includes('--source')?root:path.join(root,'dist');
const routes=walk(path.join(root,'dist')).filter(f=>f.endsWith('.html')).map(f=>'/'+path.relative(path.join(root,'dist'),f).replaceAll('\\','/'));
const {server,origin}=await serve(base),browser=await pw.chromium.launch({channel:'msedge',headless:true});
const results=[];
try{for(const route of routes){
 const {page,context,blocked}=await isolated(browser,origin);const errors=[],assets=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400)assets.push({url:r.url().replace(origin,''),status:r.status()});});
 const entry={route};try{await page.goto(origin+route);await page.waitForTimeout(100);entry.title=await page.title();entry.scan=await scan(page);entry.width=await page.evaluate(()=>({viewport:innerWidth,content:document.documentElement.scrollWidth}));
 if(await page.evaluate(()=>typeof startSelectedMode==='function')){
  entry.modes=await page.locator('[data-mode]').evaluateAll(es=>es.filter(e=>getComputedStyle(e).display!=='none').map(e=>e.dataset.mode));
  if(!route.includes('template')){await start(page);entry.question=await scan(page);}
 }
 if(['/games/econnections/index.html','/play/economic-realm/market-gate/index.html','/build/faculty-build-composer/index.html'].includes(route))await page.screenshot({path:path.join(out,phase+'-'+route.split('/').at(-2)+'.png'),fullPage:true});
 }catch(e){entry.error=e.message;}entry.errors=errors;entry.assets=assets;entry.blocked=blocked;results.push(entry);await context.close();save(phase+'-scan.json',{browser:browser.version(),base,results});console.log(route,entry.error?'ERROR':entry.scan?.violations?.map(v=>v.id).join(',')||'clear');
}}finally{await browser.close();server.close();}
