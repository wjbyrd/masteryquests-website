import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {execFileSync} from 'node:child_process';
import {fileURLToPath} from 'node:url';
// Set false before generating a private local-only build. This is an application transmission control, not retrospective deletion.
const REMOTE_COLLECTION_ENABLED = true;
export const games=['cost-directive','market-signal','strategy-desk','agency-protocol'];
export const publicRoot='play/managerial-intelligence-directorate';
export const pocRoot='play/managerial-directorate-telemetry-poc';
export const classroomRoot='play/managerial-directorate-classroom';
export const disclosure="This private build records game interactions, including answers, timing, and counts of relevant selection/copy actions. It never stores selected or copied content, clipboard contents, keystrokes, or unrelated-tab activity. A random browser ID can link runs without identifying a person. Use Download Game Data to inspect your own record. A tab switch or copy action alone does not establish misconduct, intent, attention, cognition, or learning. Turning off future transmission cancels pending unsent events and keeps local downloads available; the choice persists after refresh when browser storage is available. Re-enabling does not replay cancelled events. It cannot retract in-flight requests or delete accepted server records, downloaded copies, or backups. Retention and access arrangements require the course or study notice. Disclosure mq-disclosure/1; governance mq-governance/1.";
export const read=(root,p)=>fs.readFileSync(path.join(root,p),'utf8');
function replaceOnce(s,a,b){if(!s.includes(a)||s.indexOf(a)!==s.lastIndexOf(a))throw Error('Expected one match: '+a.slice(0,100));return s.replace(a,b);}
export function instrumentHTML(root,game){
 let s=read(root,`${publicRoot}/${game}/index.html`),poc=read(root,`${pocRoot}/${game}/index.html`);
 // The public local adapter and private anonymous adapter must never coexist.
 s=s.replace(/<script src="\.\.\/local-telemetry\.js"><\/script>\r?\n/,'');
 // Transplant the validated POC hooks at existing award sites, not restoration sites.
 const blocks=[...poc.matchAll(/        const artifactAlreadyOwned = localStorage.getItem\([^\n]+\n[\s\S]*?        recordArtifactAward\([^\n]+\n/g)].map(m=>m[0]);
 if(blocks.length!==(game==='agency-protocol'?6:3))throw Error('Unexpected award sites: '+game);
 for(const block of blocks){const before=block.replace(/        const artifactAlreadyOwned[^\n]+\n/,'').replace(/        recordArtifactAward[^\n]+\n/,'');s=replaceOnce(s,before,block);}
 const helper=poc.match(/function recordArtifactAward\([\s\S]*?\n}\n/)[0].replace('POC gameplay hook:','Gameplay hook:');
 s=replaceOnce(s,'function unlockArtifact(key) {',helper+'\nfunction unlockArtifact(key) {');
 const old='        if(storageKey) localStorage.setItem(storageKey, "true");';
 const replacement=poc.match(/        if\(storageKey\)\{\n            const alreadyOwned[\s\S]*?\n        }/)[0];
 s=replaceOnce(s,old,replacement);
 const head=`<meta name="robots" content="noindex,nofollow,noarchive"><meta name="anonymous-telemetry-collection" content="${REMOTE_COLLECTION_ENABLED ? 'enabled' : 'disabled'}"><meta name="anonymous-telemetry-phase" content="phaseAnonymousTelemetryPOC-v1"><base href="/${publicRoot}/${game}/"><script src="/${classroomRoot}/telemetry-storage-isolation.js"></script>`;
 s=replaceOnce(s,'<head>','<head>'+head);
 // Install on original engine callbacks before the parity adapter captures them.
 s=replaceOnce(s,'<script src="../managerial-parity.js"></script>',`<script src="/${classroomRoot}/telemetry-client.js" data-game-id="${game}"></script>\n<script src="../managerial-parity.js"></script>`);
 s=s.replace('try { safeStorageSet(key, JSON.stringify(value)); }','try { if(!safeStorageSet(key, JSON.stringify(value)))state.quality.storageFailures++; }');
 return s;
}
export function classroomClient(root){
 let s=read(root,`${pocRoot}/telemetry-client.js`);
 s=s.replace('function anonymousTelemetryPOC()','function anonymousClassroomTelemetry()').replace('"managerial-directorate-telemetry-poc"','"managerial-directorate-classroom"').replace('"2026.09.10-parity3"','"2026.09.10-classroom-parity3"');
 s=s.replace(/  const FAILURE_KEY[^\n]+\n/,'');
 s=s.replace(/  const params = new URLSearchParams[\s\S]*?  const syntheticMode[^\n]+\n/,'  const endpoint = DEFAULT_ENDPOINT;\n');
 s=s.replace('    failureSimulation: localStorage.getItem(FAILURE_KEY) === "1",\n','').replace('    debugNode: null\n','');
 s=s.replace('failureSimulation: readJSON(FAILURE_KEY,0) === 1,\n','');
 s=s.replace('synthetic: Boolean(options.synthetic || syntheticMode)','synthetic: false');
 s=s.replace(/    if \(state.failureSimulation\) \{[\s\S]*?\n    }\n/,'');
 const disclosureStart=s.indexOf('  function addDisclosure()');
 const debugEnd=s.indexOf('  function pauseForLifecycle(',disclosureStart);
 s=s.slice(0,disclosureStart)+`  function addDisclosure() {
    const disclosure = document.createElement("div");
    disclosure.id = "anonymousTelemetryDisclosure";
    disclosure.innerHTML = "<button type='button' class='game-menu-option' aria-expanded='false' aria-controls='anonymousTelemetryDetails'>About this class build</button><p id='anonymousTelemetryDetails' hidden>This private build records game interactions, including answers, timing, and counts of relevant selection/copy actions. It never stores selected or copied content, clipboard contents, keystrokes, or unrelated-tab activity. A random browser ID can link runs without identifying a person. Use Download Game Data to inspect your own record. A tab switch or copy action alone does not establish misconduct, intent, attention, cognition, or learning. Turning off future transmission cancels pending unsent events and keeps local downloads available; the choice persists after refresh when browser storage is available. Re-enabling does not replay cancelled events. It cannot retract in-flight requests or delete accepted server records, downloaded copies, or backups. Retention and access arrangements require the course or study notice. Disclosure mq-disclosure/1; governance mq-governance/1. <a href='/privacy/'>Privacy and your choices</a></p>";
    disclosure.querySelector("button").onclick = event => {
      const details = disclosure.querySelector("p");
      details.hidden = !details.hidden;
      event.currentTarget.setAttribute("aria-expanded", String(!details.hidden));
    };
    const control=document.createElement('label');control.innerHTML='<input type="checkbox"> Send future anonymous gameplay events';
    const toggle=control.querySelector('input');toggle.checked=remoteEnabled();
    toggle.addEventListener('change',()=>{toggle.checked=setRemoteCollection(toggle.checked);});disclosure.appendChild(control);
    // BEGIN GOVERNANCE STATUS
    const collectionStatus=document.createElement('p');const updateCollectionStatus=()=>{collectionStatus.textContent=remoteEnabled()?'Anonymous transmission is enabled. Local Download Game Data remains available.':'Anonymous transmission is disabled. Game data and Download Game Data remain local.';};updateCollectionStatus();toggle?.addEventListener?.('change',updateCollectionStatus);disclosure.appendChild?.(collectionStatus);
    // END GOVERNANCE STATUS
    document.getElementById("gameMenuOptions")?.appendChild(disclosure);
  }

`+s.slice(debugEnd);
 s=s.replace(/  window.AnonymousTelemetryPOC = Object.freeze\([\s\S]*?\n  }\);\n/,'');
 s=s.replace(/^\s*updateDebug\(\);\r?\n/gm,'').replace('  addDebugPanel();\n','');
 // Storage can be denied or full; instrumentation must still fail open.
 s=s.replaceAll('localStorage.getItem(', 'safeStorageGet(').replaceAll('localStorage.setItem(', 'safeStorageSet(');
 s=s.replace('  function readJSON(key, fallback) {',`  function safeStorageGet(key) { try { return localStorage.getItem(key); } catch (_) { return null; } }
  function safeStorageSet(key, value) { try { localStorage.setItem(key, value); return true; } catch (_) { return false; } }
  let memoryClientId = "";

  function readJSON(key, fallback) {`);
 s=s.replace('let value = safeStorageGet(CLIENT_KEY);','let value = memoryClientId || safeStorageGet(CLIENT_KEY);').replace('    return value;\n  }\n\n  function nextSequence','    memoryClientId = value;\n    return value;\n  }\n\n  function nextSequence');
 s=s.replace('"artifactAlreadyOwned", "artifactOwnedBeforeRun", "artifactNewlyEarned"\n',
   '"artifactAlreadyOwned", "artifactOwnedBeforeRun", "artifactNewlyEarned",\n        "wagerAmount", "scoreBeforeWager", "removedOptionIndex", "remainingOptionCount"\n');
 return s;
}
export function build(root){
 const out=path.join(root,'validation_artifacts/managerial_classroom');fs.mkdirSync(out,{recursive:true});
 const baseline=path.join(out,'baseline_hashes.json');
 if(!fs.existsSync(baseline)){
  const files=execFileSync('git',['ls-files'],{cwd:root,encoding:'utf8'}).trim().split('\n');
  fs.writeFileSync(baseline,JSON.stringify(Object.fromEntries(files.filter(p=>!p.startsWith(classroomRoot+'/')&&!p.startsWith('audit_tools/managerial_classroom/')&&!p.startsWith('validation_artifacts/managerial_classroom/')).map(p=>[p,crypto.createHash('sha256').update(fs.readFileSync(path.join(root,p))).digest('hex')])),null,2)+'\n');
 }
 for(const game of games){fs.mkdirSync(path.join(root,classroomRoot,game),{recursive:true});fs.writeFileSync(path.join(root,classroomRoot,game,'index.html'),instrumentHTML(root,game));}
 fs.writeFileSync(path.join(root,classroomRoot,'telemetry-client.js'),classroomClient(root));
 fs.writeFileSync(path.join(root,classroomRoot,'telemetry-storage-isolation.js'),read(root,`${pocRoot}/telemetry-storage-isolation.js`).replace('mq:managerial-directorate-telemetry-poc:','mq:managerial-directorate-classroom:'));
 const names=['Cost Directive','Market Signal','Strategy Desk','Agency Protocol'];
 fs.writeFileSync(path.join(root,classroomRoot,'index.html'),`<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="robots" content="noindex,nofollow,noarchive"><title>Managerial Intelligence Directorate — Class Build</title>
<style>*{box-sizing:border-box}body{margin:0;min-height:100vh;background:#020617;color:#f2f5fa;font:17px/1.6 system-ui,sans-serif}main{max-width:900px;margin:auto;padding:clamp(24px,6vw,70px) 24px}.label{color:#f7d982;font-size:13px;letter-spacing:.16em;text-transform:uppercase}h1{font-size:clamp(28px,5vw,44px);line-height:1.15}nav{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,280px),1fr));gap:18px;margin:32px 0}a{display:block;padding:24px;border:1px solid #766640;border-radius:12px;background:#081425;color:#f7d982;text-decoration:none;font-weight:650}a:hover{background:#12233a}a:focus-visible,summary:focus-visible{outline:3px solid #8bdcff;outline-offset:4px}details{max-width:680px;color:#cbd5e1;font-size:14px}summary{cursor:pointer}</style></head>
<body><main><p class="label">Private class build</p><h1>Managerial Intelligence Directorate</h1><p>Choose an operation to begin or continue your game.</p><nav aria-label="Managerial games">${games.map((g,i)=>`<a href="./${g}/">${names[i]}</a>`).join('')}</nav><details><summary>About this class build</summary><p>${disclosure}</p></details></main></body></html>\n`);
 console.log('Built '+classroomRoot+' from current public pages and validated POC hooks.');
}
if(process.argv[1] && path.resolve(process.argv[1])===fileURLToPath(import.meta.url))build(path.resolve(process.argv[2]||'.'));
