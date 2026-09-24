import {expected,accepts,model} from './engine.js';

// Presentation-only validation of the submitted parts. Use the engine's existing
// acceptance rules; do not change scoring, saved answers, or economic outcomes.
export function fieldFeedback(run) {
  const target=expected(run);
  if(!run.answer||!target||typeof target!=='object')return [];
  const m=model(run),period=m.group?'after-period':'baseline';
  const labels={laborForce:'Labor force',ur:'UR',lfpr:'LFPR',participation:'LFPR'};
  const guidance={
    laborForce:`Use the ${period} employed and unemployed counts. Exclude people outside the labor force.`,
    ur:`Compare ${period} unemployment with the ${period} labor force, not the adult population.`,
    lfpr:`Compare the ${period} labor force with the adult population. People outside the labor force still belong in the adult population.`,
    participation:'The labor force and adult population are unchanged, so LFPR stays the same.',
  };
  return Object.entries(target).map(([key,value])=>{
    const correct=accepts(run.answer[key],value,key);
    const result=key==='participation'?`unchanged at ${m.current.lfpr.toFixed(1)}%`:key==='laborForce'?`${value} people`:`${value.toFixed(1)}%`;
    return {key,label:labels[key],correct,text:`${labels[key]}: ${correct?`Correct — ${result}.`:`Recheck. ${guidance[key]}`}`};
  });
}
export function fieldSummary(run) {
  const fields=fieldFeedback(run);
  return fields.length?`${fields.filter(f=>f.correct).length} of ${fields.length} answers correct. Update ${fields.filter(f=>!f.correct).map(f=>f.label).join(' and ')}.`:run.feedback;
}
