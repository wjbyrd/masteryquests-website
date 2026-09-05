// Reuse the existing 57 Managerial browser assertions against classroom URLs.
// Only the URL, evidence destination and localhost API transport are adapted.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {pathToFileURL} from 'node:url';
import {createWorkerHarness} from './worker-harness.mjs';
import {reconstructRun} from '../../server/anonymous-telemetry-poc/telemetry-core.mjs';
const root=path.resolve(process.argv[2]||'.');
const harness=createWorkerHarness(root);
globalThis.__classroomHarness={harness,reconstructRun};
const original=path.join(root,'audit_tools/managerial_ui_parity/run_browser.mjs');
let source=fs.readFileSync(original,'utf8');
const replace=(a,b)=>{assert.ok(source.includes(a),a);source=source.replace(a,b);};
replace("const results=[],screenshots=[],errors=[];","const results=[],screenshots=[],errors=[];\nconst {harness,reconstructRun}=globalThis.__classroomHarness;");
replace("validation_artifacts/managerial_ui_parity","validation_artifacts/managerial_classroom");
replace('const server=http.createServer((req,res)=>{',"const server=http.createServer(async(req,res)=>{\n if(req.url.startsWith('/api/anonymous-telemetry-poc/v1/events'))return harness.serve(req,res);");
replace('/play/managerial-intelligence-directorate/${game}/','/play/managerial-directorate-classroom/${game}/?telemetryDebug=1&telemetrySynthetic=1&telemetryEndpoint=https://invalid.example/ignored');
replace('  await context.close();',fs.readFileSync(new URL('./browser-checks.js',import.meta.url),'utf8')+'\n  await context.close();');
replace(" await check('No browser runtime exceptions'",fs.readFileSync(new URL('./browser-hub-checks.js',import.meta.url),'utf8')+"\n await check('No browser runtime exceptions'");
source=source.replaceAll('import.meta.url',JSON.stringify(pathToFileURL(original).href));
try{await import('data:text/javascript;base64,'+Buffer.from(source+'\n//# sourceURL=classroom-browser-adapter.mjs').toString('base64'));}finally{harness.close();delete globalThis.__classroomHarness;}
