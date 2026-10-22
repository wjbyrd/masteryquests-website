import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {createRequire} from 'node:module';
export const root=process.cwd(), out=path.resolve(process.env.MQ_A11Y_OUT || 'validation_artifacts/accessibility_cleanup');
fs.mkdirSync(out,{recursive:true});
const require=createRequire(import.meta.url);
export const pw=require(process.env.PLAYWRIGHT_MODULE || path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright'));
export const axePath=path.resolve(process.env.AXE_PATH || 'tmp/accessibility_cleanup/node_modules/axe-core/axe.min.js');
export function walk(dir){return fs.readdirSync(dir,{withFileTypes:true}).flatMap(e=>e.isDirectory()?walk(path.join(dir,e.name)):[path.join(dir,e.name)]);}
export async function serve(base=root){
 const server=http.createServer((req,res)=>{try{
  if(req.url==='/__audit/axe.js'){res.setHeader('Content-Type','text/javascript');fs.createReadStream(axePath).pipe(res);return;}
  let file=path.resolve(base,'.'+decodeURIComponent(new URL(req.url,'http://localhost').pathname));
  if(!file.startsWith(base+path.sep)&&file!==base){res.writeHead(403).end();return;}
  if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');
  res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png','.mp4':'video/mp4','.mp3':'audio/mpeg'})[path.extname(file)]||'application/octet-stream');
  fs.createReadStream(file).pipe(res);
 }catch{res.writeHead(404).end();}});
 await new Promise(r=>server.listen(0,'127.0.0.1',r));return {server,origin:`http://127.0.0.1:${server.address().port}`};
}
export async function isolated(browser,origin,options={}){
 const context=await browser.newContext({viewport:{width:1280,height:900},...options});
 const blocked=[];await context.route('**/*',r=>{const u=new URL(r.request().url());if(u.origin===origin||['data:','blob:'].includes(u.protocol))return r.continue();blocked.push(r.request().url());return r.abort();});
 const page=await context.newPage();page.setDefaultTimeout(7000);return {page,context,blocked};
}
export async function scan(page){
 if(!fs.existsSync(axePath))return {notPerformed:'axe-core unavailable'};
 await page.addScriptTag({url:new URL('/__audit/axe.js',page.url()).href});
 return page.evaluate(async()=>{const r=await axe.run(document,{runOnly:{type:'tag',values:['wcag2a','wcag2aa','wcag21aa','wcag22aa','best-practice']}});return {violations:r.violations.map(v=>({id:v.id,impact:v.impact,help:v.help,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary,html:n.html,checks:n.any.map(c=>({id:c.id,data:c.data}))}))})),incomplete:r.incomplete.map(v=>({id:v.id,count:v.nodes.length})),passes:r.passes.length};});
}
export async function start(page,mode='standard'){
 const name=page.locator('#playerNameInput');if(await name.isVisible())await name.fill('Accessibility QA');
 await page.evaluate(()=>showModeSelect());
 await page.evaluate(mode=>startSelectedMode(mode,{quizConfirmed:true,trialGraphConfirmed:true,fadingFortuneConfirmed:true,riskRewardConfirmed:true}),mode);
 if(await page.locator('#guideIntroProceed').isVisible())await page.locator('#guideIntroProceed').click();
 await page.waitForFunction(()=>Boolean(currentQuestion));
 if(mode==='riskReward')await page.evaluate(()=>lockRiskRewardWager(.1));
 await page.waitForFunction(()=>document.querySelectorAll('#answers button').length===4);
}
export function save(name,data){fs.writeFileSync(path.join(out,name),JSON.stringify(data,null,2)+'\n');}
