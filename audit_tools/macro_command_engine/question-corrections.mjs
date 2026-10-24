import fs from 'node:fs';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import {rewindGame,applyGame} from '../approved_question_banks/replay.mjs';

// Keep the approved content edits separate from the historical publisher output.
// Only the named fields may differ from the protected baseline bank.
const {corrections}=JSON.parse(fs.readFileSync(new URL('./question-corrections.json',import.meta.url),'utf8'));
function applyHistoricalQuestionCorrections(game, source){
  const approved=corrections.filter(c=>c.game===game);
  if(!approved.length)return source;
  const banks=vm.runInNewContext(source+'; questionBanks',{});
  let updated=source;
  for(const correction of approved){
    const matches=banks[correction.pool].filter(q=>q.id===correction.id);
    assert.equal(matches.length,1,`${game}: expected one question ${correction.id}`);
    const question=matches[0];
    const before=JSON.stringify(question,null,2).split('\n').map((line,i)=>i?'    '+line:line).join('\n');
    for(const [field,{before:oldValue,after:newValue}] of Object.entries(correction.fields)){
      assert(question[field]===oldValue||question[field]===newValue,`${game} #${question.id}: unexpected ${field}; review before republishing`);
      question[field]=newValue;
    }
    const after=JSON.stringify(question,null,2).split('\n').map((line,i)=>i?'    '+line:line).join('\n');
    const newline=source.includes('\r\n')?'\r\n':'\n';
    const original=before.replaceAll('\n',newline),replacement=after.replaceAll('\n',newline);
    assert.equal(updated.split(original).length,2,`${game} #${question.id}: expected one exact source record`);
    updated=updated.replace(original,replacement);
  }
  return updated;
}
export function applyApprovedQuestionCorrections(game,source){
  return applyGame(game,applyHistoricalQuestionCorrections(game,rewindGame(game,source)));
}
