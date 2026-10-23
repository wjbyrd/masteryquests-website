// Read-only preservation and export checks. Run after the browser validation.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
import {execFileSync} from 'node:child_process';
import {createRequire} from 'node:module';
import {parseCSV,validateCSV} from '../telemetry_contract/validate.mjs';
const require=createRequire(import.meta.url),analysis=require('../../tools/answer-analysis/analysis.js');
const baseline='47485dd34788de6f23d0db325801aa7dd4640317';
const file='play/micro-domains/labyrinth-of-choice/index.html';
const old=execFileSync('git',['show',`${baseline}:${file}`],{encoding:'utf8',maxBuffer:5e6}).replace(/\r\n/g,'\n');
const current=fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n');
const out='tmp/accessibility_cleanup/labyrinth-modernization';
const registryPattern=/(\/\* RELEASE REGISTRY \*\/ )(\{[^\n]+\})(\);)/;
const oldRegistry=JSON.parse(old.match(registryPattern)[2]),newRegistry=JSON.parse(current.match(registryPattern)[2]);
for(const alias of ['labyrinth-of-choice','labyrinth-choice'])newRegistry.games[alias].engineRevision=oldRegistry.games[alias].engineRevision;
assert.deepEqual(newRegistry,oldRegistry,'Only the two existing Labyrinth engine fingerprints may change');
let restored=current.slice(0,current.indexOf('<!-- Labyrinth-only presentation.'))+'</body>\n</html>\n';
restored=restored.replace(registryPattern,old.match(registryPattern)[0]);
for(const [after,before] of [
 ['The Warden lowers the seal. You have followed preferences through the choices before you. The next chamber of the Labyrinth opens.','The fine print burns clean. You have priced hidden risk, exposed adverse selection, and forced bad information out of the shadows.'],
 ["The Decomposer's prism grows still. You have traced the tradeoffs within consumer choice. Its light now guides you toward the final chamber.",'The surveillance floor goes silent. You have traced hidden action, exposed shirking, and shown how monitoring and incentives reshape behavior.'],
 ['The Sovereign yields the Scepter of Elasticity. Your passage through preferences, tradeoffs, and consumer responses is complete. The Archivist awaits your final record.','The final protocol locks into place. You have read the principal-agent conflict, anticipated how incentives get gamed, and proven you can design the system instead of being played by it.'],
 ['COMPLETE THE LABYRINTH →',"FINALIZE THE AGENCY'S PROTOCOL →"],
 ['Labyrinth-of-Choice-2026.10.23-interface-exam','Labyrinth-of-Choice-2026.08.24-phase1.5']
]){assert(restored.includes(after),after);restored=restored.replace(after,before);}
assert.equal(restored.trimEnd(),old.trimEnd(),'All original bank, shared-helper, scoring, timing, save, report and transport code must remain intact');
const changed=execFileSync('git',['diff','--name-only',baseline,'--','play','build','downloads','server','tools','assets'],{encoding:'utf8'}).trim().split(/\r?\n/).filter(Boolean);
assert.deepEqual(changed,[file],'No other application, builder, bank, server or analysis changes');
let scripts=0;
for(const match of current.matchAll(/<script\b([^>]*)>([\s\S]*?)<\/script\s*>/gi)){
 if(/\bsrc\s*=|application\/ld\+json|application\/json/i.test(match[1]))continue;
 new vm.Script(match[2],{filename:`${file}#inline-${++scripts}`});
}
const columns=JSON.parse(old.match(/const TELEMETRY_COLUMNS = (\[[\s\S]*?\]);/)[1]);
assert.equal(columns.length,70);assert.equal(columns.filter(c=>c.startsWith('riskReward')).length,16);
const results=[];
for(const [name,accepted] of [['exam-drafts.csv',0],['exam-complete.csv',36]]){
 const text=fs.readFileSync(`${out}/${name}`,'utf8');
 assert.deepEqual(parseCSV(text)[0],columns,name+': ordered 70-column header');
 const contract=validateCSV(text);assert.equal(contract.status,'PASS',JSON.stringify(contract));assert.equal(contract.acceptedAttempts,accepted);
 const rows=analysis.parseCSV(text),report=analysis.analyze(rows);assert.equal(report.stats.accepted,accepted);assert.equal(report.stats.included,accepted);assert.equal(report.stats.duplicates,0);assert.equal(report.stats.unresolved,0);
 for(const row of rows.filter(r=>r.answerSnapshotJSON)){
  const snapshot=JSON.parse(row.answerSnapshotJSON);
  if(row.event.startsWith('exam_answer'))assert.equal(snapshot.correctOptionIndices,null,'Draft answer key must be withheld');
  if(row.event==='question'){
   assert.equal(Number(row.canonicalSelectedIndex),snapshot.selectedIndex);
   assert.equal(snapshot.selectedAnswer,snapshot.options[snapshot.selectedIndex]);
   if(snapshot.correctOptionIndices)assert.equal(Number(row.correct),Number(snapshot.correctOptionIndices.includes(snapshot.selectedIndex)));
  }
 }
 results.push({name,contract,analysis:report.stats});
}
// Optional old exports from the retained audit are never modified or backfilled.
for(const name of ['lab-standard.csv','lab-riskReward.csv','managerial-exam.csv']){
 const path=`tmp/accessibility_cleanup/labyrinth-audit/${name}`;
 if(!fs.existsSync(path))continue;
 const text=fs.readFileSync(path,'utf8'),contract=validateCSV(text),report=analysis.analyze(analysis.parseCSV(text));
 assert.equal(contract.status,'PASS',JSON.stringify(contract));
 assert.equal(parseCSV(text)[0].length,name.startsWith('managerial')?88:70);
 results.push({name:'historical/'+name,contract,analysis:report.stats});
}
execFileSync(process.execPath,['audit_tools/labyrinth_alignment/update-fingerprint.mjs','--check'],{stdio:'inherit'});
fs.writeFileSync(`${out}/preservation-results.json`,JSON.stringify({status:'PASS',scripts,originalSourcePreserved:true,otherApplicationsUnchanged:true,columns:70,riskRewardFields:16,exports:results},null,2));
console.log(`PASS: ${scripts} inline scripts; original code and collection isolation; 70 columns including 16 Risk & Reward fields; exports and Class Answer Analysis.`);
