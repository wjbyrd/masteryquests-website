// Validate one real downloaded report for every supported game/mode pair.
import fs from 'node:fs';import assert from 'node:assert/strict';import {createRequire} from 'node:module';
import {parseCSV,validateCSV} from '../telemetry_contract/validate.mjs';
const schema=JSON.parse(fs.readFileSync('audit_tools/unified_rpg_telemetry/schema.json','utf8'));
const audit=JSON.parse(fs.readFileSync('audit_tools/unified_rpg_telemetry/baseline.json','utf8'));
const analysis=createRequire(import.meta.url)('../../tools/answer-analysis/analysis.js'),results=[];
for(const game of audit.games)for(const mode of game.modes){
 const file='tmp/unified-rpg-telemetry/browser/'+game.game.replace(/[^a-z0-9]+/gi,'-')+'-'+mode+'.csv';
 const text=fs.readFileSync(file,'utf8'),table=parseCSV(text);assert.deepEqual(table[0],schema.columns,file);
 const validation=validateCSV(text);assert.equal(validation.status,'PASS',file+': '+JSON.stringify(validation.issues));
 const report=analysis.analyze(analysis.parseCSV(text));assert.equal(report.stats.included,mode==='exam'?0:1,file);assert.equal(report.stats.duplicates,0);
 results.push({game:game.game,collection:game.collection,mode,file,status:'PASS',columns:137,accepted:report.stats.accepted});
}
assert.equal(results.length,142);
fs.writeFileSync('tmp/unified-rpg-telemetry/samples.json',JSON.stringify({status:'PASS',count:results.length,results},null,2)+'\n');
console.log('PASS: 142 actual game/mode CSV downloads; identical 137-column header, semantic validation and Class Answer Analysis.');
