import fs from 'node:fs/promises';
import {Workbook, SpreadsheetFile} from '@oai/artifact-tool';

const dir = new URL('.', import.meta.url);
const data = JSON.parse(await fs.readFile(new URL('extraction.json', dir), 'utf8'));
if (data.summary.exceptions.length) throw Error('Unresolved extraction exceptions');
const headers = ['Page(s)', 'Topic', 'Question ID', "What's Wrong?", 'How to Fix', 'Pass'];
const issues = ['', 'Wording — Question', 'Wording — Correct Answer', 'Wording — Distractor(s)', 'Wording — Answer Choices', 'Wording — Question + Correct Answer', 'Wording — Question + Answer Choices', 'Economics / Answer Key', 'Difficulty', 'Graph', 'Assessment Quality', 'Feedback', 'Other'];
const fixes = ['', 'Rewrite Question', 'Rewrite Correct Answer', 'Rewrite Distractor(s)', 'Rewrite Answer Choices', 'Rewrite Question + Correct Answer', 'Rewrite Question + Answer Choices', 'Fix Economics / Answer Key', 'Reclassify Difficulty', 'Fix Graph', 'Strengthen Question', 'Replace Question', 'Fix Feedback', 'Review Manually'];
const passes = ['', 'Pass'];
const rows = data.rows.map(r => [r.pages.join(', '), r.topic, r.id, null, null, null]);
const end = rows.length + 1;
const wb = Workbook.create();
const sheet = wb.worksheets.add('Question Review');
const lists = wb.worksheets.add('Dropdown Lists');
sheet.getRange(`A1:F${end}`).values = [headers, ...rows];
sheet.getRange(`A1:F${end}`).format.font = {name:'Calibri', size:11};
sheet.getRange(`A1:F${end}`).format.wrapText = true;
sheet.getRange(`A1:F${end}`).format.verticalAlignment = 'center';
sheet.getRange(`A2:F${end}`).format.rowHeight = 32;
sheet.getRange(`A2:C${end}`).setNumberFormat('@');
const widths = [23, 47, 33, 43, 43, 10];
for (let i=0;i<6;i++) sheet.getRange(`${String.fromCharCode(65+i)}1:${String.fromCharCode(65+i)}${end}`).format.columnWidth = widths[i];
sheet.tables.add(`A1:F${end}`,true,'QuestionReview').showFilterButton = true;
sheet.getRange('A1:F1').format = {fill:'#24455E',font:{bold:true,color:'#FFFFFF',size:11},rowHeight:30};
sheet.freezePanes.freezeRows(1);
for (const [col, list, name, target] of [['A',issues,'IssueChoices','D'],['B',fixes,'FixChoices','E'],['C',passes,'PassChoices','F']]) {
  lists.getRange(`${col}1:${col}${list.length}`).values = list.map(v=>[v || null]);
  wb.names.add(name,`'Dropdown Lists'!$${col}$1:$${col}$${list.length}`);
  sheet.getRange(`${target}2:${target}${end}`).dataValidation = {allowBlank:true,rule:{type:'list',formula1:name}};
}
lists.getRange('A1:C14').format.columnWidth = 44;
lists.getRange('A1:C14').format.rowHeight = 24;
wb.recalculate();
console.log((await wb.inspect({kind:'region',sheetId:'Question Review',range:'A1:F5',maxChars:2000})).ndjson);
console.log((await wb.inspect({kind:'region',sheetId:'Question Review',range:`A${end-3}:F${end}`,maxChars:2000})).ndjson);
const errors = rows.flat().filter(v=>typeof v==='string' && /^#(REF!|DIV\/0!|VALUE!|N\/A|NAME\?|NUM!|NULL!)/.test(v));
if(errors.length) throw Error('Error cell text');
for (const [name,range,file] of [['Question Review','A1:F12','preview-top.png'],['Question Review',`A${end-8}:F${end}`,'preview-bottom.png'],['Dropdown Lists','A1:C14','preview-lists.png']]) {
  const image = await wb.render({sheetName:name,range,format:'png',scale:1.4});
  await fs.writeFile(new URL(file,dir),new Uint8Array(await image.arrayBuffer()));
}
await (await SpreadsheetFile.exportXlsx(wb)).save(new URL('../../faculty_exports/microeconomics_manual_review.xlsx',dir).pathname.replace(/^\/([A-Za-z]:)/,'$1'));
const csv = [headers,...rows].map(r=>r.map(v=>'"'+String(v??'').replaceAll('"','""')+'"').join(',')).join('\r\n')+'\r\n';
await fs.writeFile(new URL('../../faculty_exports/microeconomics_manual_review.csv',dir),'\uFEFF'+csv,'utf8');
await fs.writeFile(new URL('expected-lists.json',dir),JSON.stringify({issues,fixes,passes}));
console.log(JSON.stringify({exportedRows:rows.length}));
