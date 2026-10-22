import fs from 'node:fs';import path from 'node:path';import {spawn} from 'node:child_process';import {pathToFileURL} from 'node:url';
import {root,out,pw,serve,save} from './support.mjs';import {previewServer} from '../econ_rpg/serve.mjs';
const local=await serve(),published=await serve(path.join(root,'dist')),sim=previewServer();await new Promise(r=>sim.listen(0,'127.0.0.1',r));const origin=`http://127.0.0.1:${sim.address().port}`;
const runtime=path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const results=[];
try{
 const cases=process.argv.includes('current')?[
  ['audit_tools/econ_rpg/tests/shock-house/release-browser.cjs',{SIGNAL_HOUSE_ORIGIN:published.origin}],
  ['audit_tools/econ_rpg/game/games/money-in-motion/browser.test.cjs',{BASE_URL:origin,PLAYWRIGHT_MODULE_PATH:runtime,QA_SCREENSHOTS:'tmp/accessibility_cleanup/money-in-motion'}],
  ['audit_tools/econ_rpg/game/games/at-the-box-office/browser.test.cjs',{BOX_OFFICE_ORIGIN:published.origin}]
 ]:[
  ['audit_tools/econ_rpg/tests/shock-house/panorama.cjs',{SHOCK_HOUSE_URL:origin+'/games/the-shock-house/',SHOCK_HOUSE_WIDTH:'320'}],
  ['audit_tools/econ_rpg/tests/long-run/browser.test.cjs',{LONG_RUN_URL:origin+'/games/the-long-run/'}],
  ['play/growth-realms/tests/browser.test.mjs',{GAME_URL:local.origin+'/play/growth-realms/'}]
 ];
 for(const [file,env] of cases){
  let source=fs.readFileSync(file,'utf8').replace('tmp/shock-house/panorama-','tmp/accessibility_cleanup/shock-house/panorama-').replace('tmp/long-run-canvas','tmp/accessibility_cleanup/long-run-canvas').replace('../../../tmp/games-preview/growth-realms/in-world-pass/','../../../tmp/accessibility_cleanup/growth-realms/');
  // The ESM suite imports Playwright; resolve the same guarded package as a file URL on Windows.
  if(file.endsWith('.mjs'))source=source.replace("process.env.PLAYWRIGHT_MODULE||'playwright'",JSON.stringify(pathToFileURL(path.join(runtime,'index.mjs')).href));
  source=source.replaceAll('tmp/econ-rpg/','tmp/accessibility_cleanup/existing/').replaceAll('tmp/signal-house-release/','tmp/accessibility_cleanup/signal-house-release/');
  const temporary=path.join(path.dirname(file),'__accessibility_'+path.basename(file));fs.writeFileSync(temporary,source);const log=fs.openSync(path.join(out,path.basename(path.dirname(file))+'-'+path.basename(file)+'.log'),'w');
  try{const code=await new Promise(resolve=>{const child=spawn(process.execPath,['--require',path.resolve('audit_tools/accessibility_cleanup/browser-guard.cjs'),temporary],{env:{...process.env,...env,PLAYWRIGHT_MODULE:runtime,MQ_TEST_CHANNEL:'msedge'},stdio:['ignore',log,log],windowsHide:true});child.on('exit',resolve);});results.push({file,code});console.log(file,code===0?'PASS':'FAIL');}
  finally{fs.closeSync(log);fs.unlinkSync(temporary);}save('additional.json',results);
 }
 const engines={};for(const name of ['chromium','firefox','webkit'])try{const browser=await pw[name].launch({headless:true,...(name==='chromium'?{channel:'msedge'}:{})});engines[name]={available:true,version:browser.version()};await browser.close();}catch(e){engines[name]={available:false,error:e.message};}save('browser-availability.json',engines);
}finally{local.server.close();published.server.close();sim.close();}if(results.some(x=>x.code!==0))process.exitCode=1;
