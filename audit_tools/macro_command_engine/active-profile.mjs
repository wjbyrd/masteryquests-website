// Captured profiles remain a record of the frozen pages. These explicit corrections
// select the intended existing bank without rewriting any of its question records.
import fs from 'node:fs';
const objectiveLabels=JSON.parse(fs.readFileSync(new URL('./objective-labels.json',import.meta.url),'utf8'));
export function activeProfile(game, profiles){
  const p={...profiles[game],objectiveLabels:objectiveLabels[game]||profiles[game].objectiveLabels};
  if(game!=='national-engine')return p;
  return {...p,
    bank:'national_engine_question_bank_student.js',inlineBank:null,inlineAuxiliary:null,
    saveNamespace:'national-engine-macro-v1',roomKey:'nationalEngineMacroRoom',modeKey:'nationalEngineMacroCurrentMode',
    constants:p.constants.map(s=>s.startsWith('const SAVE_KEY =')?'const SAVE_KEY = "nationalEngineMacroSave_v1";':s),
    highScoreFunction:p.highScoreFunction.replaceAll('gauntletHighScores','nationalEngineMacroHighScores')
  };
}
