import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import assert from 'node:assert/strict';
import {Workbook} from '@oai/artifact-tool';
const dir=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(dir,'../..');
const matrix=JSON.parse(await fs.readFile(path.join(dir,'audit-rows.json'),'utf8'));
const wb=Workbook.create(),sheet=wb.worksheets.add('Execution ledger');
const range=sheet.getRange(`A1:U${matrix.length}`);range.values=matrix;
range.format.font={name:'Arial',size:11};range.format.verticalAlignment='top';
sheet.showGridLines=false;sheet.freezePanes.freezeRows(1);sheet.freezePanes.freezeColumns(1);
sheet.getRange('A1:U1').format={fill:'#243A50',font:{name:'Arial',bold:true,color:'#FFFFFF'},wrapText:true,rowHeight:42};
sheet.getRange(`A2:U${matrix.length}`).format.wrapText=true;
sheet.getRange('A:A').format.columnWidth=26;sheet.getRange('B:B').format.columnWidth=12;
sheet.getRange('C:D').format.columnWidth=34;sheet.getRange('E:G').format.columnWidth=32;
sheet.getRange('H:J').format.columnWidth=20;sheet.getRange('K:U').format.columnWidth=70;
sheet.getRange(`A2:U${matrix.length}`).format.rowHeight=120;
wb.recalculate();
assert.deepEqual(range.values,matrix,'Exact output matrix preservation');
console.log((await wb.inspect({kind:'table',range:'Execution ledger!A1:D5',include:'values',tableMaxRows:5,tableMaxCols:4,maxChars:1800})).ndjson);
// CSV has no styles or worksheet objects. Serialize the authored cell values
// with RFC4180 quoting; no formula/model transformation is performed.
const quote=v=>'"'+String(v??'').replaceAll('"','""')+'"';
const csv=range.values.map(row=>row.map(quote).join(',')).join('\r\n')+'\r\n';
const dest=path.join(root,'faculty_exports/audits/micro_faculty_voice_remediation_20261007.csv');
await fs.writeFile(dest,'\uFEFF'+csv,'utf8');
const image=await wb.render({sheetName:sheet.name,range:'A1:D5',scale:1.4,format:'png'});
await fs.writeFile(path.join(dir,'audit-preview.png'),new Uint8Array(await image.arrayBuffer()));
console.log(JSON.stringify({file:dest,rows:matrix.length-1,columns:matrix[0].length}));
