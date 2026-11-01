import fs from 'node:fs/promises';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
import {Workbook,SpreadsheetFile,FileBlob} from '@oai/artifact-tool';
import assert from 'node:assert/strict';
const here=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(here,'../..'),output=path.join(root,'faculty_exports');
await fs.mkdir(path.join(here,'qa'),{recursive:true});
if(process.argv.includes('--help-visibility')){
 const wb=Workbook.create();console.log(wb.help('worksheet',{search:'visibility|hidden|visible',include:'index,notes',maxChars:3000}).ndjson);process.exit(0);
}
if(process.argv.includes('--inspect')){
 const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(path.join(output,'microeconomics_manual_review.xlsx')));
 console.log((await wb.inspect({kind:'workbook,sheet,table',maxChars:3500,tableMaxRows:3,tableMaxCols:8})).ndjson);
 const sheet=wb.worksheets.getItem('Question Review');
 console.log(JSON.stringify({headers:sheet.getRange('A1:AZ3').values}));
 const png=await wb.render({sheetName:sheet.name,range:'A1:F5',scale:1});
 await fs.writeFile(path.join(here,'qa/manual-before.png'),new Uint8Array(await png.arrayBuffer()));
 process.exit(0);
}
const report=JSON.parse(await fs.readFile(path.join(output,'validation_summary.json'),'utf8'));
assert.equal(report.status,'complete');
const colName=i=>{let s='';for(i++;i;i=Math.floor((i-1)/26))s=String.fromCharCode(65+(i-1)%26)+s;return s;};
const results=[];
for(const [area,title]of [['general','General Economics'],['micro','Microeconomics'],['macro','Macroeconomics']]){
 if(process.argv.includes('--micro-only')&&area!=='micro')continue;
 const info=report.disciplines[area],csv=await fs.readFile(path.join(output,info.csv_file),'utf8');
 const wb=await Workbook.fromCSV(csv.replace(/^\uFEFF/,''),{sheetName:title}),sheet=wb.worksheets.getItem(title);
 const values=sheet.getUsedRange().values,headers=values[0],last=colName(headers.length-1),end=values.length;
 const all=sheet.getRange(`A1:${last}${end}`);all.format.font={name:'Arial',size:10};all.format.verticalAlignment='top';
 all.format.rowHeight=32;sheet.showGridLines=false;
 sheet.getRange(`A1:${last}1`).format={fill:'#24465B',font:{name:'Arial',size:10,bold:true,color:'#FFFFFF'},rowHeight:32,wrapText:true};
 sheet.freezePanes.freezeRows(1);sheet.freezePanes.freezeColumns(1);
 const widths=headers.map(h=>/^(Question|Feedback|Hint)$/.test(h)?76:/^Choice |Correct Answer/.test(h)?44:/Learning Objective|Common Misconception/.test(h)?42:/Question ID/.test(h)?29:/Topic/.test(h)?34:24);
 for(let c=0;c<headers.length;c++)sheet.getRange(`${colName(c)}1:${colName(c)}${end}`).format.columnWidth=widths[c];
 sheet.getRange(`A2:${last}${end}`).format.wrapText=true;
 // Fit each row to its longest wrapped field; keep original strings and ID types intact.
 for(let r=1;r<end;r++){
  const lines=Math.max(...values[r].map((v,c)=>String(v??'').split('\n').reduce((n,line)=>n+Math.max(1,Math.ceil(line.length/Math.max(12,widths[c]-3))),0)));
  sheet.getRange(`A${r+1}:${last}${r+1}`).format.rowHeight=Math.min(409,Math.max(34,lines*14+8));
 }
 const table=sheet.tables.add(`A1:${last}${end}`,true,`${area}QuestionBank`);table.showFilterButton=true;
 wb.recalculate();
 assert.equal(values.length-1,info.question_count??values.length-1);
 assert.equal(new Set(values.slice(1).map(r=>r[headers.indexOf('Question ID')])).size,end-1);
 const inspection=await wb.inspect({kind:'table',range:`'${title}'!A1:${last}3`,include:'values',tableMaxRows:3,tableMaxCols:headers.length,maxChars:1800});
 await fs.writeFile(path.join(here,`qa/${area}-xlsx-inspection.json`),inspection.ndjson);
 const target=path.join(output,info.csv_file.replace(/\.csv$/,'.xlsx'));
 await (await SpreadsheetFile.exportXlsx(wb)).save(target);
 const qcol=headers.indexOf('Question'),fcol=Math.min(headers.length-1,qcol+2);
 const png=await wb.render({sheetName:title,range:`${colName(qcol)}1:${colName(fcol)}4`,scale:1});
 await fs.writeFile(path.join(here,`qa/${area}-xlsx.png`),new Uint8Array(await png.arrayBuffer()));
 results.push({area,file:path.basename(target),rows:end-1,columns:headers.length});console.log(JSON.stringify(results.at(-1)));
}
// Preserve the existing manual review workbook and reviewer-entered columns.
const manual=path.join(output,'microeconomics_manual_review.xlsx');
try{await fs.access(path.join(here,'baseline/microeconomics_manual_review.xlsx'));}catch{await fs.copyFile(manual,path.join(here,'baseline/microeconomics_manual_review.xlsx'));}
const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(manual)),sheet=wb.worksheets.getItem('Question Review');
const original=sheet.getUsedRange().values,pages=report.disciplines.micro.question_pages;
let updatedPages=0;const unmatched=[];
for(let r=1;r<original.length;r++){
 const id=String(original[r][2]??'');if(!id)continue;
 if(pages[id]){const p=String(pages[id]);if(p!==String(original[r][0]??'')){sheet.getRange(`A${r+1}`).values=[[p]];updatedPages++;}}
 else {unmatched.push(id);sheet.getRange(`A${r+1}`).values=[['Not in bank']];}
}
wb.recalculate();const after=sheet.getUsedRange().values;
for(let r=0;r<original.length;r++)assert.deepEqual(after[r].slice(1),original[r].slice(1),'Preserve topic, ID, and reviewer annotations');
await (await SpreadsheetFile.exportXlsx(wb)).save(manual);
const png=await wb.render({sheetName:'Question Review',range:'A1:F5',scale:1});
await fs.writeFile(path.join(here,'qa/manual-after.png'),new Uint8Array(await png.arrayBuffer()));
// Keep its existing CSV companion aligned while retaining its reviewer-entered columns.
const csvPath=path.join(output,'microeconomics_manual_review.csv');
try{await fs.access(path.join(here,'baseline/microeconomics_manual_review.csv'));}catch{await fs.copyFile(csvPath,path.join(here,'baseline/microeconomics_manual_review.csv'));}
const csvWb=await Workbook.fromCSV((await fs.readFile(csvPath,'utf8')).replace(/^\uFEFF/,''),{sheetName:'Review'}),csvRows=csvWb.worksheets.getItem('Review').getUsedRange().values;
for(let r=1;r<csvRows.length;r++){const id=String(csvRows[r][2]);if(pages[id])csvRows[r][0]=String(pages[id]);else if(id)csvRows[r][0]='Not in bank';}
const quote=v=>'"'+String(v??'').replaceAll('"','""')+'"';
await fs.writeFile(csvPath,'\uFEFF'+csvRows.map(r=>r.map(quote).join(',')).join('\r\n')+'\r\n');
results.push({file:path.basename(manual),rows:original.length-1,updatedPageReferences:updatedPages,unmatchedHistoricalIds:unmatched,reviewerColumnsPreserved:true});
let previous=[];try{previous=JSON.parse(await fs.readFile(path.join(here,'excel-validation.json'),'utf8'));}catch{}
const merged=[...previous.filter(r=>!results.some(n=>n.file===r.file)),...results];
await fs.writeFile(path.join(here,'excel-validation.json'),JSON.stringify(merged,null,2)+'\n');
console.log(JSON.stringify(results.at(-1)));
