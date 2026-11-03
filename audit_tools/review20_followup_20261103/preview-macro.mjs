// Read-only inspection of the saved workbook; no re-export or cell edits.
import fs from 'node:fs/promises';
import path from 'node:path';
import {createRequire} from 'node:module';
import {fileURLToPath,pathToFileURL} from 'node:url';
const here=path.dirname(fileURLToPath(import.meta.url)),root=path.resolve(here,'../..');
const req=createRequire(path.join(root,'audit_tools/easy_pool_review_20261101/excel.mjs'));
const {SpreadsheetFile,FileBlob}=await import(pathToFileURL(req.resolve('@oai/artifact-tool')).href);
const wb=await SpreadsheetFile.importXlsx(await FileBlob.load(path.join(root,'faculty_exports/macroeconomics_question_bank.xlsx'))),sheet=wb.worksheets.getItem('Macroeconomics');
const values=sheet.getUsedRange().values,row=values.findIndex(r=>r[0]==='ECON-SP-MEDIUM-146')+1;if(row<2)throw Error('Question missing');
const png=await wb.render({sheetName:sheet.name,range:`G${row}:I${row+2}`,scale:1});
await fs.writeFile(path.join(here,'qa/macro-xlsx.png'),new Uint8Array(await png.arrayBuffer()));console.log('Rendered saved macro workbook, row '+row);
