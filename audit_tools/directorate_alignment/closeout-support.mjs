// Actual answer/lifecycle integration, synthetic users, local-only network.
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE);
const out=path.resolve(process.env.AUDIT_OUTPUT_DIR||path.join(root,'_private_course_sources/eco6655/alignment-audit/closeout-2026-09-28'));
fs.mkdirSync(out,{recursive:true});
const server=http.createServer((req,res)=>{
 const relative=decodeURIComponent(new URL(req.url,'http://localhost').pathname);
 if(relative==='/favicon.ico'){res.writeHead(204).end();return;}
 if(!/^\/(play|assets|build)\//.test(relative)){res.writeHead(403).end();return;}
 let file=path.resolve(root,'.'+relative);if(!file.startsWith(root+path.sep)){res.writeHead(403).end();return;}
 try{if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.png':'image/png','.webp':'image/webp','.mp3':'audio/mpeg','.wav':'audio/wav','.pdf':'application/pdf'})[path.extname(file)]||'application/octet-stream');fs.createReadStream(file).pipe(res);}catch{res.writeHead(404).end();}
});
await new Promise(r=>server.listen(0,'127.0.0.1',r));const origin='http://127.0.0.1:'+server.address().port;
const games=process.env.AUDIT_GAME?[process.env.AUDIT_GAME]:['cost-directive','market-signal','strategy-desk','agency-protocol'];
const results=[];let browser;
const profiles=process.env.AUDIT_PROFILES?.split(',')||['steady','fast','mixed','recovery','save-question','save-boss','save-recovery','rapid-recovery'];
async function snap(page){return page.evaluate(()=>({room,mode:gameMode,phase:typeof runPhase==='undefined'?null:runPhase,ending:runEnding,attempts:totalAttempts,correct:correctAnswers,question:currentQuestion?.id,pool:currentQuestion?.__mqDifficulty,remediation:{...remediationState},bossHealth,checkpoint:bossCheckpoint,pending:answerSubmissionPending,completed:localStorage.getItem(REALM_COMPLETE_KEY),runID,visibleButtons:[...document.querySelectorAll('button')].filter(b=>b.getClientRects().length&&getComputedStyle(b).visibility!=='hidden').map(b=>({id:b.id,text:b.innerText.slice(0,80),disabled:b.disabled})),storage:Object.fromEntries(Object.entries(localStorage).filter(([k])=>/managerialHub.*(complete|status|started|room)$/.test(k)))}));}
async function settle(page){
 for(let i=0;i<12;i++){
  await page.clock.runFor(4500);
  const action=await page.evaluate(()=>{
   const visible=e=>e&&e.getClientRects().length&&getComputedStyle(e).visibility!=='hidden'&&getComputedStyle(e).display!=='none';
   for(const selector of ['#guideIntroProceed','#bossRevealProceed','.principal-begin-btn','#gameModalConfirm','#continueBtn']){const b=document.querySelector(selector);if(visible(b)&&!b.disabled){b.click();return selector;}}
   return null;
  });
  const s=await snap(page);
  if(s.ending)return s;
  if(!action&&s.phase==='question'&&!s.pending)return s;
 }
 return snap(page);
}
export {fs,path,root,chromium,out,server,origin,games,snap,settle};
