import assert from 'node:assert/strict';
import fs from 'node:fs';
import {createRequire} from 'node:module';
import {XLSX,headers,telemetryRows,workbook,encode} from './workbook-fixtures.mjs';
import {csv} from './release-fixtures.mjs';
const require=createRequire(import.meta.url),a=require('../../tools/answer-analysis/analysis.js'),importer=require('../../tools/answer-analysis/workbook-import.js');
const dir=new URL('./workbook-fixtures/',import.meta.url);fs.mkdirSync(dir,{recursive:true});
const rows=telemetryRows(),expected=a.parseCSV(csv(rows)),base=a.analyze(expected);
assert.equal(headers.length,88);
const results=[];
for(const type of ['xlsx','numbers']){
  const file=new URL('synthetic-cost.'+type,dir);
  // Generation is explicit; normal regression runs use committed binary fixtures.
  if(process.argv.includes('--generate'))fs.writeFileSync(file,encode(workbook(),type));
  const buffer=fs.readFileSync(file),result=importer.parse(buffer,type,XLSX);
  assert.equal(result.tables.length,1);assert.equal(result.ignored.length,1);
  assert.deepEqual(result.tables[0].headers,headers);assert.deepEqual(result.tables[0].rows,expected);
  const report=a.analyze(result.tables[0].rows);assert.deepEqual(report,base);
  const collection=a.createCollection();assert(collection.add('original.csv',csv(rows)));
  assert(!collection.addRows('converted.'+type,result.tables.flatMap(t=>t.rows)), 'Cross-format duplicate detection');
  collection.clear();assert(collection.addRows('converted.'+type,result.tables[0].rows));assert(!collection.add('original.csv',csv(rows)));
  collection.remove(collection.entries()[0].id);assert.equal(collection.rows().length,0);
  assert.throws(()=>importer.parse(Buffer.from(csv(rows)),type,XLSX),/not a genuine/);
  assert.throws(()=>importer.parse(buffer.subarray(0,buffer.length-30),type,XLSX),/incomplete|damaged/);
  results.push({format:type,rows:expected.length,columns:headers.length,identicalCells:true,identicalAnalysis:true,bytes:buffer.length});
  const multiFile=new URL('synthetic-multiple.'+type,dir);
  if(process.argv.includes('--generate'))fs.writeFileSync(multiFile,encode(workbook(rows,{multiple:true}),type));
  const multiple=importer.parse(fs.readFileSync(multiFile),type,XLSX);
  assert.equal(multiple.tables.length,2);assert.equal(a.analyze(multiple.tables.flatMap(t=>t.rows)).stats.included,base.stats.included);
}
const multi=workbook(rows,{multiple:true,title:true}),extracted=importer.extractTables(multi,XLSX);
assert.equal(extracted.tables.length,2);assert.deepEqual(extracted.tables[0].rows,expected);
assert.equal(a.analyze(extracted.tables.flatMap(t=>t.rows)).stats.included,base.stats.included);
const wb=workbook(),sheet=wb.Sheets['Game Data'],address=h=>XLSX.utils.encode_cell({r:1,c:headers.indexOf(h)});
const errors=[
  ['runID',{t:'s',v:'000012345678901234567890'},null],
  ['responseTimeMs',{t:'n',v:12345.6789012345},null],
  ['correct',{t:'b',v:true},null],
  ['runID',{t:'n',v:9007199254740992},/precision/],
  ['runID',{t:'n',v:12,z:'000000'},/formatted numeric identifier/],
  ['timestamp',{t:'d',v:new Date('2026-10-20T00:00:00Z')},/timestamp/],
  ['correct',{t:'n',v:1,f:'1+0'},/formulas/],
  ['correct',{t:'n',f:'1+0'},/formulas/],
  ['correct',{t:'e',v:7},/spreadsheet error/],
];
for(const [h,cell,error] of errors){const old=sheet[address(h)];sheet[address(h)]=cell;
  if(error)assert.throws(()=>importer.extractTables(wb,XLSX),error);
  else assert.equal(importer.extractTables(wb,XLSX).tables[0].rows[0][h],String(cell.v));
  sheet[address(h)]=old;
}
const missing=workbook();missing.Sheets['Game Data'][XLSX.utils.encode_cell({r:0,c:headers.indexOf('runID')})].v='wrong';
assert.throws(()=>importer.extractTables(missing,XLSX),/missing required/);
const duplicate=workbook();duplicate.Sheets['Game Data'].B1={t:'s',v:'eventID'};
assert.throws(()=>importer.extractTables(duplicate,XLSX),/duplicate/);
const empty=XLSX.utils.book_new();XLSX.utils.book_append_sheet(empty,XLSX.utils.aoa_to_sheet([headers]),'Empty');
assert.throws(()=>importer.extractTables(empty,XLSX),/No recognizable/);
const calendar=workbook();calendar.Sheets.Cover=XLSX.utils.aoa_to_sheet([['event','date'],['Class meeting','Tuesday']]);assert.equal(importer.extractTables(calendar,XLSX).tables.length,1);
const privateBook=XLSX.utils.book_new(),privateHeaders=['event_type','run_id','game_id','correct','question_id','response_time_ms','extras_json'];
XLSX.utils.book_append_sheet(privateBook,XLSX.utils.aoa_to_sheet([privateHeaders,['answer_evaluated','001','private','1','0007','123.456','{"attemptID":"001","acceptedAttempt":true}']]),'Private');
assert.deepEqual(importer.extractTables(privateBook,XLSX).tables[0].rows,[Object.fromEntries(privateHeaders.map((h,i)=>[h,['answer_evaluated','001','private','1','0007','123.456','{"attemptID":"001","acceptedAttempt":true}'][i]]))]);
assert.throws(()=>importer.parse(new Uint8Array(),'numbers',XLSX),/empty/);
assert.throws(()=>importer.parse(new Uint8Array(importer.limits.fileBytes+1),'numbers',XLSX),/25 MB/);
const bomb=Buffer.from(fs.readFileSync(new URL('synthetic-cost.xlsx',dir)));let central=bomb.indexOf(Buffer.from([0x50,0x4b,0x01,0x02]));bomb.writeUInt32LE(0x7fffffff,central+24);
assert.throws(()=>importer.parse(bomb,'xlsx',XLSX),/128 MB/);
// Exercise the actual student download function without running a game or sending telemetry.
const source=fs.readFileSync(new URL('../../play/managerial-intelligence-directorate/cost-directive/index.html',import.meta.url),'utf8');
const columns=JSON.parse(source.match(/const TELEMETRY_COLUMNS = (\[[\s\S]*?\]);/)[1]);assert.deepEqual(columns,headers.slice(0,columns.length));
const adapter=fs.readFileSync(new URL('../../play/managerial-intelligence-directorate/local-telemetry.js',import.meta.url),'utf8');
const behavior=JSON.parse(adapter.match(/const BEHAVIOR_FIELDS\s*=\s*(\[[\s\S]*?\]);/)[1]);
const installers=adapter.slice(adapter.indexOf('function installLocalTelemetryColumns(){'),adapter.indexOf('function localTelemetryTail('));
const exporter=source.slice(source.indexOf('function escapeCsvValue('),source.indexOf('// =====================================================',source.indexOf('function downloadTelemetryCsv(')));
let blob,clicked=false;const link={click(){clicked=true;},remove(){}};
new Function('runID','localStorage','LATEST_TELEMETRY_RUN_KEY','readLocalTelemetry','TELEMETRY_COLUMNS','Blob','URL','document','FACULTY_COMPOSITION_CONFIG','setTimeout',exporter+'\ndownloadTelemetryCsv();')(
  '000run-0',{},'unused',()=>rows,columns,Blob,{createObjectURL(b){blob=b;return 'blob:local';},revokeObjectURL(){}},{createElement:()=>link,body:{appendChild(){}}},{slug:'cost-directive'},()=>{});
assert(clicked);assert(link.download.endsWith('.csv'));assert.equal(blob.type,'text/csv;charset=utf-8');
const context={runID:'000run-0',readLocalTelemetry:()=>rows,TELEMETRY_COLUMNS:columns,escapeCsvValue:v=>'"'+String(v??'').replaceAll('"','""')+'"',FACULTY_COMPOSITION_CONFIG:{slug:'cost-directive'}};
new Function('globalValue','BEHAVIOR_FIELDS','window','localStorage','MQContract','state','Blob','URL','document','setTimeout',installers+'\ninstallLocalTelemetryColumns();installLocalCsvDownload();window.downloadTelemetryCsv();')(
  (key,fallback)=>context[key]??fallback,behavior,{downloadTelemetryCsv(){}},{},{exportRows:()=>rows},{},Blob,{createObjectURL(b){blob=b;return 'blob:local';},revokeObjectURL(){}},{createElement:()=>link,body:{appendChild(){}}},()=>{});
assert.deepEqual(columns,headers);assert(link.download.endsWith('.csv'));assert.equal(blob.type,'text/csv;charset=utf-8');assert.deepEqual(a.parseCSV(await blob.text()),expected);
fs.writeFileSync(new URL('fidelity-results.json',dir),JSON.stringify({synthetic:true,results,checks:'exact cell strings, 88 headers, all events, analysis equality, cross-format duplicates, text IDs, precision, empty, malformed, missing headers, formulas, dates, errors, archive limits, multiple tables'},null,2));
console.log('PASS: CSV/XLSX/Numbers exact 88-column fidelity, identical summaries, schema selection, duplicates, multiple tables and malformed/unsafe data.');
