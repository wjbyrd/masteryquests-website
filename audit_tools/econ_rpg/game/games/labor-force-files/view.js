import { CONFIG } from './config.js';
import { QUESTIONS, STAGES, question, model, expected, options, direction, headlineLabels } from './engine.js';
export const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const rate=n=>`${n.toFixed(1)}%`;
const count=n=>n.toLocaleString('en-US');
const btn=(action,text)=>`<button type="button" class="primary" data-action="${action}">${text}</button>`;
export function flowText(flow) {
  return [flow.hired&&`${flow.hired} unemployed people find jobs`,flow.lost&&`${flow.lost} employed people lose jobs and begin actively searching`,flow.toEmployed&&`${flow.toEmployed} adults outside the labor force start jobs`,flow.toUnemployed&&`${flow.toUnemployed} adults outside the labor force begin actively searching and are available for work`,flow.discouraged&&`${flow.discouraged} unemployed people stop actively searching because they believe suitable work is unavailable; they still want and are available for work`].filter(Boolean).join('; ')+'.';
}
function known(run,id) {return QUESTIONS.findIndex(q=>q.id===id)<run.step||(question(run)?.id===id&&run.solved);}
export function board(run) {
  const m=model(run),q=question(run),group=m.group;
  const calculation=group?`${group}-calc`:null;
  const reveal=group==='headline'||(calculation&&known(run,calculation));
  const labels=[['adultPopulation','Adult population'],['employed','Employed'],['unemployed','Unemployed'],['laborForce','Labor force'],['nilf','Not in labor force'],['ur','Unemployment rate (UR)'],['lfpr','Labor-force participation rate (LFPR)']];
  const value=(key,after=false)=>{
    if(!after&&key==='laborForce'&&!known(run,'base'))return 'To calculate';
    if(!after&&key==='ur'&&!known(run,'ur'))return 'To calculate';
    if(!after&&key==='lfpr'&&!known(run,'lfpr'))return 'To calculate';
    if(after&&((['ur','lfpr'].includes(key)&&!reveal)||(key==='laborForce'&&group==='mixed'&&!reveal)))return 'To calculate';
    return ['ur','lfpr'].includes(key)?rate((after?m.current:m.base)[key]):count((after?m.current:m.base)[key]);
  };
  return `<figure class="scene"><img src="../../art/scenes/labor-force-files/labor-${m.scene.id}.webp" width="1672" height="941" alt="${esc(m.scene.alt)}"><figcaption>${m.scene.label} · Illustrative groups; use the exact report counts.</figcaption></figure>
    <section class="population" aria-labelledby="population-title"><h2 id="population-title">Population report</h2>${group?'<p class="case-note">Independent case · compared with this run’s baseline</p>':''}<table><caption class="sr-only">Exact population counts and calculated rates${group?', before and after this case':''}.</caption><thead><tr><th scope="col">Measure</th><th scope="col">${group?'Before':'Baseline'}</th>${group?'<th scope="col">After</th>':''}</tr></thead><tbody>${labels.map(([key,label])=>`<tr class="${['ur','lfpr'].includes(key)?'rate-row':''}"><th scope="row">${label}</th><td>${value(key)}</td>${group?`<td>${value(key,true)}</td>`:''}</tr>`).join('')}</tbody></table></section>`;
}
export function explanation(run) {
  const m=model(run),q=question(run);if(!q)return '';
  if(q.person!==undefined)return CONFIG.people[q.person].why;
  if(q.id==='base')return `Labor force = employed + unemployed: ${m.base.employed} + ${m.base.unemployed} = ${m.base.laborForce}. Adult population = labor force + people not in the labor force: ${m.base.laborForce} + ${m.base.nilf} = ${m.base.adultPopulation}.`;
  if(q.id==='ur')return `${rate(m.base.ur)} of the labor force is unemployed. People outside the labor force are excluded from this rate.`;
  if(q.id==='lfpr')return `${rate(m.base.lfpr)} of the adult population is in the labor force. UR and LFPR use different denominators.`;
  if(q.id==='direct-predict')return `UR ${direction(m.base.ur,m.direct.ur)} because unemployment changes within a labor force of ${m.base.laborForce}. Now calculate the rate and identify what happens to participation.`;
  if(q.id==='direct-calc')return `UR changes from ${rate(m.base.ur)} to ${rate(m.direct.ur)}. LFPR stays ${rate(m.base.lfpr)}: neither the labor force nor adult population changed.`;
  if(q.id==='expansion-predict')return 'LFPR rises. The labor force grows while the adult population stays fixed. UR depends on how many entrants work and how many are still searching.';
  if(q.id==='expansion-calc'||q.id==='expansion-interpret')return `Employment changes from ${m.base.employed} to ${m.expansion.employed}; unemployment from ${m.base.unemployed} to ${m.expansion.unemployed}. LFPR rises to ${rate(m.expansion.lfpr)}; UR ${direction(m.base.ur,m.expansion.ur)} at ${rate(m.expansion.ur)}. Expansion can raise UR when the unemployed share grows, lower it when entrants disproportionately find jobs, or leave it unchanged when entrants match the existing shares.`;
  if(q.id.startsWith('discouraged'))return `UR falls from ${rate(m.base.ur)} to ${rate(m.discouraged.ur)}, but employment stays ${m.base.employed}. LFPR falls from ${rate(m.base.lfpr)} to ${rate(m.discouraged.lfpr)}. These discouraged workers still want and are available for work, but stopped active search. They are not in the labor force and are excluded from both the unemployed numerator and labor-force denominator. The reason for a falling UR matters.`;
  if(q.id.startsWith('mixed'))return `${flowText(m.flows.mixed)} Employment rises by ${m.mixed.employed-m.base.employed}, unemployment ${direction(m.base.unemployed,m.mixed.unemployed)}, and the labor force grows by ${m.mixed.laborForce-m.base.laborForce}. UR ${direction(m.base.ur,m.mixed.ur)} to ${rate(m.mixed.ur)}; LFPR rises to ${rate(m.mixed.lfpr)}.`;
  return `${headlineLabels[run.headlineID]} ${flowText(m.flows.headline)} UR changes from ${rate(m.base.ur)} to ${rate(m.headline.ur)} and LFPR from ${rate(m.base.lfpr)} to ${rate(m.headline.lfpr)}. Read both rates alongside the counts.`;
}
function hints(run,target) {
  if(run.solved||!target||typeof target!=='object'||!('ur'in target||'lfpr'in target))return '';
  const h=run.hints[question(run).id]||{concept:false,formula:false};
  const conceptual=[('ur'in target)&&'The unemployment rate uses the labor force as its denominator.',('lfpr'in target)&&'Participation compares the labor force with the adult population.'].filter(Boolean).join(' ');
  const formulas=[('ur'in target)&&['UR = unemployed ÷ labor force × 100','Unemployment rate equals unemployed divided by labor force, multiplied by one hundred.'],('lfpr'in target)&&['LFPR = labor force ÷ adult population × 100','Labor-force participation rate equals labor force divided by adult population, multiplied by one hundred.']].filter(Boolean);
  return `<div class="hints"><button type="button" data-hint="concept" aria-expanded="${h.concept}" aria-controls="concept-hint">${h.concept?'HIDE HINTS':'NEED A HINT?'}</button><div id="concept-hint" ${h.concept?'':'hidden'}>${h.concept?`<p>${conceptual}</p><button type="button" data-hint="formula" aria-expanded="${h.formula}" aria-controls="formula-hint">${h.formula?'HIDE FORMULA':'SHOW FORMULA'}</button><div id="formula-hint" ${h.formula?'':'hidden'}>${h.formula?formulas.map(([text,spoken])=>`<p class="formula"><span aria-hidden="true">${text}</span><span class="sr-only">${spoken}</span></p>`).join(''):''}</div>`:''}</div></div>`;
}
function numeric(run,target) {
  const labels={laborForce:'People in the labor force',ur:'Unemployment rate (UR)',lfpr:'Labor-force participation rate (LFPR)'};
  return `<form id="answer-form">${Object.keys(target).map(key=>key==='participation'?`<fieldset><legend>What happens to LFPR?</legend>${[['rises','Rises'],['falls','Falls'],['unchanged','Stays unchanged']].map(([id,label])=>`<label class="radio"><input type="radio" name="participation" value="${id}" required ${run.solved?'disabled':''} ${run.answer?.participation===id?'checked':''}>${label}</label>`).join('')}</fieldset>`:`<div class="field"><label for="answer-${key}">${labels[key]}</label><input id="answer-${key}" name="${key}" type="text" inputmode="decimal" autocomplete="off" required aria-describedby="number-help feedback" ${run.solved?'disabled':''} value="${esc(run.answer?.[key]??'')}"></div>`).join('')}<p id="number-help" class="help">Counts are whole people. Round rates to one decimal; a trailing % is optional.</p><button type="submit" class="primary" ${run.solved?'disabled':''}>CHECK REPORT</button></form>`;
}
function result(run) {
  const total=QUESTIONS.length,first=Object.values(run.first).filter(Boolean).length;
  const score=ids=>`${ids.filter(id=>run.first[id]).length}/${ids.length} first try`;
  const ur=QUESTIONS.filter(q=>Object.hasOwn(expected({...run,step:QUESTIONS.indexOf(q)})||{},'ur')).map(q=>q.id);
  const lfpr=QUESTIONS.filter(q=>Object.hasOwn(expected({...run,step:QUESTIONS.indexOf(q)})||{},'lfpr')).map(q=>q.id);
  return `<p class="eyebrow">Nine files reviewed</p><h2 id="stage-title" tabindex="-1">Labor report complete</h2><dl class="results"><div><dt>First-attempt accuracy</dt><dd>${Math.round(first/total*100)}% · ${first}/${total}</dd></div><div><dt>Checks including UR</dt><dd>${score(ur)}</dd></div><div><dt>Checks including LFPR</dt><dd>${score(lfpr)}</dd></div><div><dt>Classification</dt><dd>${score(QUESTIONS.filter(q=>q.person!==undefined).map(q=>q.id))}</dd></div><div><dt>Headline audit</dt><dd>Verified · ${run.attempts.headline} attempt(s)</dd></div></dl><h3>What the final report shows</h3><p>${explanation({...run,step:QUESTIONS.length-1})}</p><p class="takeaway">Having no job does not automatically mean being unemployed. Active search matters. Interpret UR and LFPR together with employment and the underlying flows.</p><div class="actions">${btn('replay','PLAY AGAIN')}<a class="button" href="/games/">RETURN TO GAMES</a></div>`;
}
export function work(run) {
  const q=question(run),m=model(run);
  if(run.step===-1)return `<p class="eyebrow">The population behind the rates</p><h2 id="stage-title" tabindex="-1">Read the labor report.</h2><p>Identify who counts, calculate both rates, then trace what changes when people find work, enter the labor force or stop searching.</p><p class="help">Nine short stages. No timer. Every answer can be corrected.</p>${btn('start','OPEN THE FIRST FILE')}`;
  if(!q)return result(run);
  const within=QUESTIONS.filter(v=>v.stage===q.stage),sub=within.findIndex(v=>v.id===q.id)+1;
  const prompt=q.person!==undefined?CONFIG.people[q.person].text:{
    base:'How many people are in the labor force? Use the exact counts in the population report.',ur:'What is the unemployment rate?',lfpr:'What is the labor-force participation rate?',
    'direct-predict':'Before calculating: what should happen to the unemployment rate?',
    'direct-calc':'Calculate the new UR. Then identify what happens to LFPR.',
    'expansion-predict':'More adults enter the labor force. Before calculating: what happens to LFPR?',
    'expansion-calc':'Calculate both rates after these adults enter the labor force.',
    'expansion-interpret':'In another period, why could UR rise even while employment also rises?',
    'discouraged-calc':'Some unemployed workers stop actively searching. Calculate UR and LFPR after they leave the labor force.',
    'discouraged-interpret':'The unemployment rate fell. Does this case show that more people found jobs?',
    'mixed-calc':'Trace the separate flows. Calculate the new labor force, UR and LFPR.',
    'mixed-interpret':'Which interpretation matches this mixed case?',headline:'What do the data actually show? Select the interpretation supported by both columns.',
  }[q.id];
  const headline={hiring:`Unemployment rate falls to ${rate(m.headline.ur)}.`,discouraged:`UR falls to ${rate(m.headline.ur)} — more people must have found jobs.`,losses:`Unemployment rate rises to ${rate(m.headline.ur)}.`,'search-entry':'Employment rises, but unemployment also increases.','same-share':'UR is unchanged — nothing changed in the labor market.','job-entry':'Employment and participation rise together.'}[run.headlineID];
  const target=expected(run),controls=typeof target==='object'?numeric(run,target):`<div class="answers" role="group" aria-label="Your interpretation">${options(run).map(([id,text])=>`<button type="button" data-answer="${id}" aria-pressed="${run.answer===id}" ${run.solved?'disabled':''}>${esc(text)}${run.answer===id?'<span class="selected-label">Selected</span>':''}</button>`).join('')}</div>`;
  return `<p class="eyebrow">File ${q.stage+1} / 9 · ${sub} / ${within.length} checks</p><h2 id="stage-title" tabindex="-1">${STAGES[q.stage]}</h2>${q.id==='headline'?`<section class="newspaper"><p class="paper-name">The Mastery Quests Daily</p><h3>${headline}</h3></section>`:m.group?`<p class="flow-note">${flowText(m.flow)}</p>`:''}<p class="prompt">${prompt}</p><div id="feedback" tabindex="-1" class="feedback ${run.feedback?'shown':''}">${run.feedback?`<strong>${run.solved?'Verified':'Try again'}</strong><p>${esc(run.solved?explanation(run):run.feedback)}</p>`:''}</div>${controls}${hints(run,target)}${run.solved?btn('next',run.step===QUESTIONS.length-1?'COMPLETE THE REPORT':'CONTINUE'):''}`;
}
