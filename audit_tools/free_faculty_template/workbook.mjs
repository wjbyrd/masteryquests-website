import fs from 'node:fs/promises';
import path from 'node:path';
import assert from 'node:assert/strict';
import {FileBlob,SpreadsheetFile} from '@oai/artifact-tool';
const root=process.cwd(),out=path.join(root,'validation_artifacts/free_faculty_template_parity/workbook');
await fs.mkdir(out,{recursive:true});
const file=path.join(root,'downloads/resources/faculty-question-bank-validator.xlsx');
const backup=path.join(out,'before.xlsx');
try{await fs.access(backup);}catch{await fs.copyFile(file,backup);}
const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(process.argv.includes('--review')?file:backup));
if(process.argv.includes('--review')){
  await fs.writeFile(path.join(out,'Examples-A1-B4.png'),new Uint8Array(await (await wb.render({sheetName:'Examples',range:'A1:B4',scale:1})).arrayBuffer()));
  process.exit(0);
}
console.log((await wb.inspect({kind:'sheet',include:'id,name',maxChars:2000})).ndjson);
await fs.writeFile(path.join(out,'before.png'),new Uint8Array(await (await wb.render({sheetName:'Question_Bank',range:'A1:J5',scale:1})).arrayBuffer()));
console.log(wb.help('worksheet.dataValidations',{include:'index,examples,notes',maxChars:2500}).ndjson);
if(process.argv.includes('--inspect'))process.exit(0);
const sheet=wb.worksheets.getItem('Question_Bank');
// Preserve the original drafting columns and 300 input rows. The unsafe JS export
// is replaced by explicit clipboard conversion in the canonical browser validator.
sheet.getRange('AG1:AJ1').values=[['AnswerHash','ImageAlt','GraphDescription','BossStage']];
sheet.getRange('AB1:AE1').values=[['IDConventionNote','DraftStatus','DraftMessage','NextStep']];
sheet.getRange('V1').values=[['LegacyImageNote']];
sheet.getRange('AG1:AJ301').format.columnWidth=30;
sheet.getRange('AH1:AI301').format.wrapText=true;
sheet.getRange('AG2:AG301').numberFormat='@';
sheet.getRange('A2:Y301').clear({applyTo:'contents'});
sheet.getRange('AF2:AJ301').clear({applyTo:'contents'});
sheet.getRange('A1:AJ301').dataValidation=null;
sheet.getRange('A1:AJ301').conditionalFormats.clear();
const sample=JSON.parse(await fs.readFile('downloads/resources/faculty-question-package-example.json','utf8'));
const examples=[['easy',sample.banks.easy[0]],['medium',sample.banks.medium[0]],['easyBoss',sample.banks.easyBoss[0]],['repair',sample.repairQuestions[0]],['bridge',sample.bridgeQuestions[0]]];
for(let i=0;i<examples.length;i++){
  const [pool,q]=examples[i],r=i+2;
  sheet.getRange(`A${r}:Y${r}`).values=[[q.id,pool,q.difficulty,q.q,...q.options,'A',q.feedback,q.tag,q.type,q.objective,sample.objectiveLabels.NUM1,q.primarySkill,q.repairSkill,'','','','',q.image||'','','','','Demonstration only; replace with reviewed course content.']];
  sheet.getRange(`AF${r}:AJ${r}`).values=[[q.graphRequired?'TRUE':'FALSE','',q.image?sample.questionAssetMetadata[q.image].imageAlt:'',q.image?sample.questionAssetMetadata[q.image].graphDescription:'','']];
}
const formulas=[];
for(let r=2;r<=301;r++)formulas.push([
  `=IF(A${r}="","",IF(MAX(LEN(E${r}),LEN(F${r}),LEN(G${r}),LEN(H${r}))>2*MIN(LEN(E${r}),LEN(F${r}),LEN(G${r}),LEN(H${r})),"Review answer lengths",""))`,
  `=IF(A${r}="","",IF(COUNTIF($A$2:$A$301,A${r})>1,"Duplicate ID",IF(COUNTIF($D$2:$D$301,D${r})>1,"Review repeated text","")))`,
  `=IF(A${r}="","","Unique string or number; no numeric range required")`,
  `=IF(A${r}="","",IF(OR(B${r}="",D${r}="",E${r}="",F${r}="",G${r}="",H${r}="",J${r}="",K${r}="",L${r}="",M${r}="",O${r}="",P${r}="",AND(I${r}="",AG${r}=""),AND(B${r}<>"repair",B${r}<>"bridge",C${r}="")),"INCOMPLETE","CHECK ONLINE"))`,
  `=IF(A${r}="","",IF(AC${r}="INCOMPLETE","Fill required fields including RepairSkill and an answer. See Instructions.","Copy all columns with headers to the browser validator for full schema, assets and mode checks."))`,
  `=IF(A${r}="","","https://masteryquests.org/tools/question-bank-validator/")`
]);
sheet.getRange('Z2:AE301').formulas=formulas;
sheet.getRange('B2:B301').dataValidation={rule:{type:'list',values:[...Object.keys(sample.banks),'repair','bridge']}};
sheet.getRange('C2:C301').dataValidation={rule:{type:'list',values:['easy','medium','hard','elite','legendary']}};
sheet.getRange('I2:I301').dataValidation={rule:{type:'list',values:['A','B','C','D']}};
sheet.getRange('AF2:AF301').dataValidation={rule:{type:'list',values:['TRUE','FALSE']}};
sheet.getRange('A1:AJ1').format={fill:'#17395C',font:{color:'#FFFFFF',bold:true},rowHeight:42,wrapText:true};
sheet.getRange('Z2:AE301').format={font:{color:'#46596F'},wrapText:true};
sheet.getRange('A2:Y6').format.rowHeight=88;
sheet.freezePanes.freezeRows(1);sheet.freezePanes.freezeColumns(3);
const lists=wb.worksheets.getItem('Lists');lists.getUsedRange().clear({applyTo:'all'});
lists.getRange('A1:C12').values=[['Pools','Difficulty','Type guidance'],...Object.keys({...sample.banks,repair:[],bridge:[]}).map((p,i)=>[p,['easy','medium','hard','elite','legendary'][i]||'',i===0?'Any nonempty text label; no closed enumeration.':''])];
lists.getRange('A1:C12').format.columnWidth=28;lists.getRange('C1:C12').format.columnWidth=60;
const summary=wb.worksheets.getItem('Validator_Summary');summary.getUsedRange().unmerge();summary.getUsedRange().clear({applyTo:'all'});
summary.getRange('A1:D1').merge();summary.getRange('A1').values=[['Question package drafting status']];
summary.getRange('A3:B6').values=[['Rows started',null],['Missing basic fields',null],['Ready for full validation',null],['Final schema and mode checks','Use browser validator after every edit']];
summary.getRange('B3:B5').formulas=[['=COUNTA(Question_Bank!A2:A301)'],['=COUNTIF(Question_Bank!AC2:AC301,"INCOMPLETE")'],['=COUNTIF(Question_Bank!AC2:AC301,"CHECK ONLINE")']];
summary.getRange('A8:D10').merge();summary.getRange('A8').values=[['This workbook is an optional drafting aid. It does not certify runtime acceptance. Copy Question_Bank including headers and all columns into https://masteryquests.org/tools/question-bank-validator/ and choose copied workbook rows.']];
summary.getRange('A1:D10').format.columnWidth=28;summary.getRange('A1:D10').format.wrapText=true;summary.getRange('A1:D10').format.rowHeight=28;
const instructions=wb.worksheets.getItem('Instructions');instructions.getUsedRange().unmerge();instructions.getUsedRange().clear({applyTo:'all'});
const notes=[
['Manual faculty question drafting','Current engine schema; final acceptance uses the browser validator.'],
['1 Start','Read https://masteryquests.org/downloads/resources/manual-faculty-guide.html. Download the blank game and sample JSON.'],
['2 Draft','Replace the five demonstration rows. Keep all headers. QuestionID may be any unique string or number.'],
['Required','QuestionID, Pool, QuestionText, four options, CorrectAnswer A–D or AnswerHash, Feedback, Tag, Type, Objective, PrimarySkill, RepairSkill.'],
['Difficulty','Main/boss: easy, medium, hard, elite or legendary matching pool. easyBoss=easy; mediumBoss=medium; finalBoss=hard; legendaryBoss=legendary. Optional for repair/bridge.'],
['Type and IDs','Any nonempty text Type is allowed. No enforced numeric ID ranges. Custom labels are legitimate.'],
['Images','ImageFile is relative to the game. Supply ImageAlt and GraphDescription (columns AH/AI). The sample uses sample-bars.svg from the resources folder.'],
['GraphRequired','TRUE for Trial by Graph eligibility; FALSE or blank otherwise. Do not use yes/no.'],
['Optional notes','ObjectiveLabel, CommonError, ConceptCluster, Hint and BossStage are exported. SecondarySkills, LegacyImageNote, BossEligible, AnswerVerified and Notes are editorial only in this workbook. For richer optional data and aliases edit JSON directly.'],
['3 Validate','Copy A1:AJ through your last question. Paste into https://masteryquests.org/tools/question-bank-validator/ and choose copied workbook rows. It checks required fields, pools, IDs, assets/accessibility and mode counts.'],
['4 Export','Download checked JSON from the validator. Replace only the JSON between MANUAL PACKAGE START and MANUAL PACKAGE END in the blank HTML. Excel does not generate executable JavaScript.'],
['5 Assets','Copied rows refer to local image files. Keep those files beside the game or add embeddedQuestionAssets to JSON. Check every image in the actual game.'],
['6 Test','Launch every enabled mode; test wrong/correct answers, feedback, repair/bridge, completion, save/refresh/resume, keyboard and mobile layout. Download Game Data stays local.'],
['Telemetry','Manual/free and public polished games are local-only. Remote collection OFF by default. Do not add student identifiers. Operational telemetry is not research by default.'],
['Limits','Basic Excel completeness is not a full schema verdict. The browser validator accepts current aliases via JSON, warns about repeated text and checks launch minimums. Review teaching accuracy and answer keys yourself.']
];
instructions.getRange('A1:B15').values=notes;instructions.getRange('A1:A15').format.columnWidth=26;instructions.getRange('B1:B15').format.columnWidth=105;instructions.getRange('A1:B15').format.wrapText=true;instructions.getRange('A1:B15').format.rowHeight=65;
// Replace any old export-guide sheet contents: the clipboard workflow owns serialization.
for(let i=0;i<wb.worksheets.items.length;i++){
  const s=wb.worksheets.items[i];if(!['Question_Bank','Lists','Validator_Summary','Instructions'].includes(s.name)){s.getUsedRange().unmerge();s.getUsedRange().clear({applyTo:'all'});s.getRange('A1:B4').values=[['Export checked JSON','Use the browser validator'],['Copy','Question_Bank A1:AJ through the last filled row, including headers.'],['Validate','Paste as copied workbook rows. Correct errors and review warnings.'],['Download','Download checked JSON; paste into the marked manual package region.']];s.getRange('A1:B4').format.columnWidth=60;s.getRange('A1:B4').format.wrapText=true;s.getRange('A1:B4').format.rowHeight=55;}
}
wb.recalculate();
assert.equal(summary.getRange('B3').values[0][0],5);
sheet.getRange('P2').values=[['']];wb.recalculate();assert.equal(sheet.getRange('AC2').values[0][0],'INCOMPLETE');
sheet.getRange('P2').values=[['addition']];wb.recalculate();assert.equal(sheet.getRange('AC2').values[0][0],'CHECK ONLINE');
await fs.writeFile(path.join(out,'verification.json'),JSON.stringify({rows:summary.getRange('B3:B5').values,requiredRepairSkillMutation:'PASS'},null,2));
for(const [name,range] of [['Question_Bank','A1:J6'],['Question_Bank','Z1:AJ6'],['Instructions','A1:B8'],['Instructions','A9:B15'],['Validator_Summary','A1:D10'],['Lists','A1:C12']])await fs.writeFile(path.join(out,`${name}-${range.replace(':','-')}.png`),new Uint8Array(await (await wb.render({sheetName:name,range,scale:1})).arrayBuffer()));
await (await SpreadsheetFile.exportXlsx(wb)).save(file);
console.log('Updated workbook and verified required-field recalculation.');
