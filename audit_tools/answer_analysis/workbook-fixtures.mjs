import fs from 'node:fs';
import {createRequire} from 'node:module';
import {dashboardRows} from './dashboard-fixtures.mjs';
const require=createRequire(import.meta.url);
export const XLSX=require('../../tools/answer-analysis/vendor/xlsx.full.min.js');
const schema=JSON.parse(fs.readFileSync(new URL('../telemetry_contract/schema.json',import.meta.url),'utf8')).schemas.find(s=>s.columns.length===88&&s.columns.includes('answerSnapshotJSON'));
export const headers=schema.columns;
export function telemetryRows(){
  const source=dashboardRows();source.splice(9,0,{event:'boss_start',runID:'run-0',objective:'Boss "review", café\nsecond line'},{event:'boss_complete',runID:'run-0'});
  return source.map((row,i)=>Object.fromEntries(headers.map(h=>[h,String(({
    timestamp:'2026-10-20T14:01:02.123Z',questionID:row.event==='question'?(i===1?'000012345678901234567890':'000'+(i%8)):'',
    selectedIndex:row.correct===1?1:0,selectedAnswer:row.correct===1?'It increases':'It decreases',
    ...row,game:'Cost Directive',runID:'000'+row.runID,eventID:'evt-'+i,
    responseTimeMs:row.responseTimeMs??'',
  })[h]??'')])));
}
export function workbook(rows=telemetryRows(),options={}){
  const wb=XLSX.utils.book_new();
  if(options.cover!==false)XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet([['Student game submission'],['Telemetry is on a later table.']]),'Cover');
  const numeric=new Set(['correct','responseTimeMs','selectedIndex','elapsedTimeMs','totalTimeMs','totalAttempts','maxStreak','streak','localSequence']);
  const data=[headers,...rows.map(r=>headers.map(h=>numeric.has(h)&&r[h]!==''&&r[h]!=null?Number(r[h]):r[h]??''))];
  const ws=XLSX.utils.aoa_to_sheet(options.title?[['Telemetry export'],[],...data]:data);
  XLSX.utils.book_append_sheet(wb,ws,'Game Data');
  if(options.multiple)XLSX.utils.book_append_sheet(wb,XLSX.utils.aoa_to_sheet(data),'Second Table');
  return wb;
}
export function encode(wb,type){
  const options={type:'buffer',bookType:type,compression:true};
  if(type==='numbers')options.numbers=require('../../tmp/numbers-import/xlsx.zahl.js');
  return XLSX.write(wb,options);
}
