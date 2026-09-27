import fs from 'node:fs';
import {loadComposerLibrary,collectComposerQuestions,auditQuestionConstruction} from '../../audit_tools/question_quality_auditor.mjs';
const ids=new Set(JSON.parse(fs.readFileSync('audit_tools/macroeconomics_exception_closure/inputs/baseline.json')).targets);
const result=auditQuestionConstruction(collectComposerQuestions(loadComposerLibrary()).filter(x=>ids.has(x.id)));
fs.writeFileSync('tmp/macroeconomics_exception_closure/choice_quality.json',JSON.stringify(result,null,2));
console.log(JSON.stringify(result,null,2));
