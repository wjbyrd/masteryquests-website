import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {normalizeApprovedRefreshFix} from './private-refresh-scope.cjs';

const root=process.cwd(), out=process.env.MQ_EVIDENCE_DIR||'validation_artifacts/telemetry_site_ux_refresh/ux';
fs.mkdirSync(out,{recursive:true});
const read=p=>fs.readFileSync(p,'utf8').replace(/\r\n/g,'\n');
const before=p=>execFileSync('git',['show','HEAD:'+p],{encoding:'utf8',maxBuffer:16e6}).replace(/\r\n/g,'\n');
const identifiers='Names, email addresses, LMS account identifiers, university identifiers, and free-text responses are not intentionally included in application telemetry.';
for(const p of ['privacy/index.html','how-to/responsible-telemetry-use/index.html','build/faculty-build-composer/index.html','audit_tools/telemetry_governance/render.mjs','audit_tools/managerial_classroom/build.mjs','play/managerial-directorate-classroom/telemetry-client.js','play/managerial-directorate-telemetry-poc/telemetry-client.js']){
  assert(read(p).includes(identifiers),p);
  assert(!/Canvas user IDs|Troy IDs|classroom\/research|research builds/.test(read(p)),p);
}
for(const p of ['how-to/telemetry-data-dictionary/index.html','how-to/composer/index.html','how-to/index.html'])assert(!/classroom\/research|research builds|pilot\/research/.test(read(p)),p);
// Preserve behavior except the exact separately reviewed raw-UUID refresh fix.
const semantic=s=>normalizeApprovedRefreshFix(s).replace(/  \/\/ BEGIN MEASUREMENT CONTRACT[\s\S]*?  \/\/ END MEASUREMENT CONTRACT/,'').replace(/  function addDisclosure\(\)[\s\S]*?\n  }\n/,'');
for(const p of ['build/faculty-build-composer/template/mastery-quests-faculty-template-composer-ready.html','play/managerial-intelligence-directorate/local-telemetry.js','play/managerial-directorate-classroom/telemetry-client.js','play/managerial-directorate-telemetry-poc/telemetry-client.js'])assert.equal(semantic(read(p)),semantic(before(p)),p);
const tracked=execFileSync('git',['ls-files'],{encoding:'utf8'}).trim().split('\n');
const protectedFiles=tracked.filter(p=>p.startsWith('server/')||p.startsWith('how-to/canvas/')||/^play\/(economic-realm|macro-command-system|micro-domains|managerial-intelligence-directorate)\//.test(p)&&p!=='play/managerial-intelligence-directorate/local-telemetry.js'||['audit_tools/telemetry_contract/schema.json','audit_tools/telemetry_contract/release.json','audit_tools/telemetry_contract/runtime.js'].includes(p));
const changes=execFileSync('git',['diff','--name-only','HEAD'],{encoding:'utf8'}).trim().split('\n');
assert.deepEqual(changes.filter(p=>protectedFiles.includes(p)),[],'Protected public games, Canvas instructions, schemas or server source changed');
assert(!/fetch\(|sendBeacon|XMLHttpRequest|anonymousClientId|DEFAULT_ENDPOINT|QUEUE_KEY/.test(read('play/managerial-intelligence-directorate/local-telemetry.js')));

const require=createRequire(import.meta.url),{chromium}=require(process.env.PLAYWRIGHT_MODULE||'playwright');
const server=http.createServer((req,res)=>{
  let p=path.resolve(root,'.'+new URL(req.url,'http://localhost').pathname);
  if(!p.startsWith(root+path.sep)){res.writeHead(403).end();return;}
  try{if(fs.statSync(p).isDirectory())p=path.join(p,'index.html');res.setHeader('content-type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.json':'application/json'})[path.extname(p)]||'application/octet-stream');res.end(fs.readFileSync(p));}catch{res.writeHead(404).end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));
const origin='http://127.0.0.1:'+server.address().port;
const browser=await chromium.launch({channel:'msedge',headless:true}),errors=[],results=[];
try{
  for(const width of [1440,390]){
    const context=await browser.newContext({viewport:{width,height:1000},reducedMotion:'reduce'});
    await context.route('**/*',r=>r.request().url().startsWith(origin)?r.continue():r.abort());
    const p=await context.newPage();p.on('pageerror',e=>errors.push(e.message));
    await p.goto(origin+'/build/faculty-build-composer/');
    await p.waitForFunction(()=>document.querySelector('#readinessMessage').textContent.includes('Anonymous data collection: OFF'));
    assert.equal(await p.locator('#allowAnonymousDataCollection').isChecked(),false);
    const core=require(path.join(root,'build/faculty-build-composer/composer-core.js'));
    await p.locator('#importRecipe').setInputFiles({name:'ux-recipe.json',mimeType:'application/json',buffer:Buffer.from(JSON.stringify({schemaVersion:core.RECIPE_SCHEMA_VERSION,title:'Telemetry UX review',slug:'telemetry-ux-review',selectedConceptIds:['aggregate-demand'],supportedModes:['standard','exam']}))});
    await p.waitForFunction(()=>document.getElementById('gameTitle').value==='Telemetry UX review');
    for(const step of [1,2,6]){
      await p.locator('.step-nav [data-step="'+step+'"]').click();
      assert(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'horizontal overflow at '+width+'/'+step);
      await p.screenshot({path:path.join(out,`composer-${width}-step-${step}-off.png`),fullPage:step!==1});
      if(step===1)await p.locator('.footer').screenshot({path:path.join(out,`composer-${width}-step-1-footer.png`)});
    }
    await p.locator('.step-nav [data-step="2"]').click();
    assert.equal(await p.locator('#allowAnonymousDataCollection').isChecked(),false);
    assert.match(await p.locator('.collection-setting').innerText(),/Anonymous gameplay data[\s\S]*OFF by default/);
    for(const href of await p.locator('.collection-setting a').evaluateAll(as=>as.map(a=>a.getAttribute('href'))))assert((await context.request.get(origin+href)).ok(),href);
    for(const enabled of [true,false]){
      await p.locator('.step-nav [data-step="2"]').click();
      await p.locator('#allowAnonymousDataCollection').setChecked(enabled);
      await p.locator('.step-nav [data-step="6"]').click();
      assert.match(await p.locator('#readinessMessage').innerText(),new RegExp('Anonymous data collection: '+(enabled?'ON':'OFF')));
      const [download]=await Promise.all([p.waitForEvent('download'),p.locator('#downloadRecipe').evaluate(el=>el.click())]);
      const dest=path.join(out,`recipe-${width}-${enabled}.json`);await download.saveAs(dest);
      assert.equal(JSON.parse(read(dest)).allowAnonymousDataCollection,enabled);
      await p.screenshot({path:path.join(out,`composer-${width}-readiness-${enabled?'on':'off'}.png`),fullPage:true});
    }
    results.push({width,steps:[1,2,6],defaultOff:true,readinessBothStates:true,recipeBothStates:true,links:true,noHorizontalOverflow:true});
    await context.close();
  }
  assert.deepEqual(errors,[]);
}finally{await browser.close();await new Promise(r=>server.close(r));}
const report={status:'PASS',protectedFiles:protectedFiles.length,semanticBoundaries:'PASS',identifiers:'PASS',results,errors};
fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(report,null,2));console.log(JSON.stringify(report,null,2));
