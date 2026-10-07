'use strict';
// Heuristics produce review candidates, never style failures.
const words=s=>(String(s||'').match(/[\p{L}\p{N}]+(?:[’'−.-][\p{L}\p{N}]+)*/gu)||[]).length;
const patterns={
 'internal taxonomy':/\b(?:NCO-based (?:model|FX)|money-supply effect|loanable-funds effect|fixed-price planning model|deposit-multiplier model with monetary-control limits|model-based effect|policy-channel effect|which statement best combines|which relationship integrates|which mechanism combines)\b/i,
 'noun stack':/\b(?:retirement-saving incentive|saving-supply (?:shift|change)|investment-demand (?:effect|shift)|induced-spending gain|currency-supply curve|fixed-price planning model)\b/i,
 'actor wrapper':/\b(?:an analyst|a report|a planner|an observer|a memo|a commentator)\b/i,
 'multiple tasks':/\band (?:what would|why\b|what does this imply|can we conclude|how does|does the|what .*\?)|\bif all figures were complete and exact\b/i
};
function screen(q,key){
 const stemFlags=Object.entries(patterns).filter(([,re])=>re.test(q.q)).map(([p])=>p);
 const allFlags=Object.entries(patterns).filter(([p,re])=>p!=='actor wrapper'&&p!=='multiple tasks'&&[q.q,...q.options,q.feedback||''].some(s=>re.test(s))).map(([p])=>p);
 const preQuestion=q.q.split(/\b(?:What|Which|How|Why|Does|Do|Can|Is|Are|Would)\b/).slice(0,-1).join(' ');
 if(q.image&&words(preQuestion)>50)stemFlags.push('graph narration');
 if((q.q.match(/\b(?:if|unless|provided that|assuming|suppose)\b/gi)||[]).length>1)stemFlags.push('embedded conditions');
 if((q.q.match(/\?/g)||[]).length>1)stemFlags.push('multiple questions');
 if(words(q.q)>90)stemFlags.push('long scenario');
 const counts=q.options.map(words),d=counts.filter((_,i)=>i!==key).sort((a,b)=>a-b),median=d[Math.floor(d.length/2)],correct=counts[key];
 const ratioFlag=correct>1.5*median&&correct-median>=6;
 const clauseFlag=median<=8&&correct>=median+6&&(q.options[key].match(/;|\bbecause\b|\btherefore\b|\bso\b/gi)||[]).length>=2;
 return {stemWords:words(q.q),setupWords:words(preQuestion),stemFlags:[...new Set(stemFlags)],flags:[...new Set([...stemFlags,...allFlags])],optionWords:counts,correctWords:correct,medianDistractorWords:median,lengthOutlier:ratioFlag||clauseFlag,lengthReason:ratioFlag?'Key >1.5× median and ≥6 words longer':clauseFlag?'Multi-clause key versus short distractors':null};
}
module.exports={words,screen};
