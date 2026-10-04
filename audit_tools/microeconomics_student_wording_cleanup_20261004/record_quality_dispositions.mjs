import fs from 'node:fs';
import {loadComposerLibrary,collectComposerQuestions,auditQuestionRecords} from '../question_quality_auditor.mjs';
const library=loadComposerLibrary('build/faculty-build-composer/data/composer_library.js');
const notes={
 '40020': 'Removing the assessment-writer phrase compare the two determinant effects and infer removes a lexical REASONING_CUE match. The student must still infer both demand and supply shifts from income and input costs, then identify their new intersection. Options, key, graph and difficulty are unchanged.',
 'PG1-SUP-L-003': 'Replacing what is the mechanism with how would the market reach that quantity removes a lexical REASONING_CUE match. The student must still read the original target quantity, infer the halfway supply curve and required price, and distinguish a movement along that curve from a supply shift. Options, key, graph and difficulty are unchanged.'
};
const entries=collectComposerQuestions(library).filter(e=>Object.hasOwn(notes,String(e.id)));
const assetMap=new Map();for(const a of library.assetInventory||[])for(const k of [a.runtimePath,a.sourceAssetPath,a.sourceUrl,a.filename])if(k)assetMap.set(String(k).replaceAll('\\','/'),a);
const result=auditQuestionRecords(entries,{assetMap,composerRoot:'build/faculty-build-composer'});
if(result.counts.errors||result.findings.length!==2||result.findings.some(f=>f.rule!=='possible-difficulty-overstatement'||f.severity!=='REVIEW'))throw Error('Unexpected findings');
fs.writeFileSync(new URL('./quality_dispositions.json',import.meta.url),JSON.stringify({findings:result.findings.map(f=>({...f,note:notes[String(f.questionId)]}))},null,2)+'\n');
