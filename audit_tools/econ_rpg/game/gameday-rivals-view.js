import { el } from './ui.js';
import { sceneFor, activityFor } from './scenarios/gameday-rivals-scenes.js';
import { BASE_PAYOFFS, CLASSIFICATIONS, seasonStats, mutualStandardCounterfactual, outcomeText } from './scenarios/gameday-rivals-market.js';
export const money = n => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
const signed = n => `${n>0?'+':''}${n}`;
const svgNS='http://www.w3.org/2000/svg';
function svg(tag,attrs={}) { const node=document.createElementNS(svgNS,tag); for(const [key,value] of Object.entries(attrs)) node.setAttribute(key,String(value)); return node; }
function button(label,action,className='gr-button') { const b=el('button',label,className);b.type='button';b.addEventListener('click',action);return b; }
function title(parent,text,eyebrow) { parent.append(el('p',eyebrow,'eyebrow')); const h=el('h2',text); h.id='view-title';h.tabIndex=-1;parent.append(h); }
export function vehicleGraphic(unit,firm) {
  const outer=svg('g',{'data-slot':unit.id,'data-firm':unit.firm,'data-type':unit.type,transform:`translate(${unit.x} ${unit.y}) rotate(${unit.rotation})`});
  const g=svg('g',{transform:'scale(1.6)'});outer.append(g);
  // All silhouettes face local +x; lane rotation determines their travel direction.
  if(unit.type==='car') {
    g.append(svg('rect',{x:-17,y:-7,width:34,height:14,rx:5,fill:firm.color,stroke:'#10243b','stroke-width':2}));
    g.append(svg('rect',{x:3,y:-5,width:6,height:10,rx:2,fill:'#e7f4ff'}));
    g.append(svg('path',{d:'M 17 -3 L 20 0 L 17 3',fill:'#fff'}));
  } else {
    g.append(svg('path',{d:'M -15 0 H 15',stroke:'#0d233a','stroke-width':7,'stroke-linecap':'round'}));
    g.append(svg('rect',{x:-16,y:-7,width:13,height:14,rx:2,fill:firm.color,stroke:'#10243b','stroke-width':2,'data-delivery-box':unit.firm}));
    g.append(svg('path',{d:'M -1 0 H 13 L 16 -4',stroke:firm.color,'stroke-width':5,fill:'none'}));
    g.append(svg('circle',{cx:2,cy:0,r:4,fill:firm.color,stroke:'#10243b','stroke-width':1}));
  }
  const mark=svg('text',{x:unit.type==='car'?-7:-10,y:3,'text-anchor':'middle',fill:'#10243b','font-size':8,'font-weight':900});mark.textContent=firm.mark;g.append(mark);
  return outer;
}
function scene(s,run) {
  const metadata=sceneFor(s,run.roundIndex), figure=el('figure',undefined,'gr-scene'), stage=el('div',undefined,'gr-scene-stage');
  const img=el('img'); img.src=metadata.src;img.alt=metadata.alt;img.width=metadata.width;img.height=metadata.height;
  img.addEventListener('error',()=>{const message=el('p',`Missing scene asset: ${metadata.src}. No substitute image has been loaded.`,'notice');stage.append(message);},{once:true});
  stage.append(img);
  const activity=activityFor(run.phase==='observe'?null:run.playerCurrentChoice,run.phase==='observe'?null:run.rivalCurrentChoice);
  const overlay=svg('svg',{viewBox:`0 0 ${metadata.width} ${metadata.height}`,class:'gr-traffic',role:'img','aria-label':activity.description,'data-activity':activity.id});
  activity.units.forEach(unit=>overlay.append(vehicleGraphic(unit,s.firms[unit.firm])));stage.append(overlay);figure.append(stage);
  const caption=el('figcaption');caption.append(el('span','Background activity shows the game-day market. Outlined P / R units show the revealed promotion activity.'));
  if(run.phase!=='observe') caption.append(el('span',`P · ${s.firms.player.name}: ${activity.player} units   /   R · ${s.firms.rival.name}: ${activity.rival} units`,'gr-unit-key'));
  figure.append(caption);return figure;
}
function stat(label,value,className='') { const cell=el('div',undefined,`gr-stat ${className}`);cell.append(el('dt',label),el('dd',value));return cell; }
export function renderDashboard(s,run,parent) {
  parent.replaceChildren();const heading=el('h2','Season desk');heading.id='state-title';parent.append(heading);
  const stats=el('dl',undefined,'gr-stats');
  stats.append(stat('Your Season Profit',money(run?.playerSeasonProfit||0),'gr-player'),stat('Rival Season Profit',money(run?.rivalSeasonProfit||0),'gr-rival'),stat('Your Market Share',`${run?.playerShare??50}%`),stat('Rival Market Share',`${run?.rivalShare??50}%`));parent.append(stats);
  parent.append(el('p',`You · ${s.firms.player.name} (P, orange)\nRival · ${s.firms.rival.name} (R, green)`,'gr-firms'));
  parent.append(el('p','Profit is the financial result. Market share tracks the distribution of orders; it does not change the profit calculation.','gr-note'));
  if(run) parent.append(el('p',`${run.history.length} of 6 game days completed`,'gr-progress'));
}
export function renderLedger(s,run,parent) {
  parent.replaceChildren();parent.append(el('h2','Season history'));
  if(!run?.history.length) {parent.append(el('p','No games revealed yet. Both current offers stay hidden until you commit.','gr-note'));return;}
  const list=el('ol',undefined,'gr-ledger');
  for(const h of run.history) {
    const row=el('li'), heading=el('h3',`${h.roundIndex+1}. ${s.rounds[h.roundIndex].name}`), values=el('dl');
    const player=s.actions.find(a=>a.id===h.playerAction).short,rival=s.actions.find(a=>a.id===h.rivalAction).short;
    values.append(stat('You',player,'gr-player'),stat('Rival',rival,'gr-rival'),stat('Your Profit',money(h.playerProfit)),stat('Rival Profit',money(h.rivalProfit)),stat('Share · You / Rival',`${h.playerShare}% / ${h.rivalShare}%`));
    row.append(heading,values);list.append(row);
  }
  parent.append(list);
}
function reveal(s,run,parent,actions) {
  const h=run.history.at(-1), cards=el('div',undefined,'gr-reveal');
  for(const who of ['player','rival']) {
    const card=el('section',undefined,`gr-reveal-card gr-${who}`), action=s.actions.find(a=>a.id===h[`${who}Action`]);
    card.append(el('h3',who==='player'?`You · ${s.firms[who].name}`:`Rival · ${s.firms[who].name}`),el('p',action.label,'gr-action-revealed'),el('p',money(h[`${who}Profit`]),'gr-profit'),el('p',`${signed(h[`${who}ShareChange`])} percentage points · share now ${h[`${who}Share`]}%`,'gr-note'));cards.append(card);
  }
  parent.append(cards,el('p',outcomeText(h.playerAction,h.rivalAction),'gr-explanation'));
  parent.append(el('p',`Combined game-day profit: ${money(h.industryProfit)}. Both offers were chosen independently.`,'gr-note'));
  parent.append(button(run.completed?'Review the season':`Prepare Game Day ${run.roundIndex+2}`,actions.next,'gr-button gr-continue'));
}
function debrief(s,run,parent,actions) {
  const classification=CLASSIFICATIONS.find(c=>c.id===run.classification), counts=seasonStats(run.history), benchmark=mutualStandardCounterfactual(s.rounds);
  title(parent,classification.title,'Season complete · six home games');
  parent.append(el('p',classification.summary,'gr-explanation'));
  const totals=el('dl',undefined,'gr-debrief-totals');
  totals.append(stat('Your total season profit',money(run.playerSeasonProfit)),stat('Rival total season profit',money(run.rivalSeasonProfit)),stat('Combined industry profit',money(run.industrySeasonProfit)),stat('Final shares · You / Rival',`${run.playerShare}% / ${run.rivalShare}%`));parent.append(totals);
  parent.append(el('h3','The choices behind your season'));
  const stats=el('dl',undefined,'gr-counts');
  for(const [label,value] of [ ['Your Standard / Aggressive',`${counts.playerStandard} / ${counts.playerAggressive}`],['Rival Standard / Aggressive',`${counts.rivalStandard} / ${counts.rivalAggressive}`],['Mutual Standard',counts.mutualStandard],['Mutual Aggressive',counts.mutualAggressive],['Asymmetric rounds',counts.asymmetric],['You aggressive / rival standard',counts.playerExploits],['Rival aggressive / you standard',counts.rivalExploits] ]) stats.append(stat(label,String(value)));parent.append(stats);
  parent.append(el('h3','Repeated Prisoner’s Dilemma'),el('p','The same individual temptation returned each weekend. Your decisions changed the history the rival observed, while uncertainty kept its next offer hidden.'));
  const wrap=el('div',undefined,'gr-matrix-wrap'), table=el('table',undefined,'gr-matrix');
  table.append(el('caption','Base game-day profit before demand scaling · You / Rival'));
  const head=el('thead'), hr=el('tr');
  for(const text of ['Your promotion','Rival: Standard','Rival: Aggressive']) {const th=el('th',text);th.scope='col';hr.append(th);}head.append(hr);table.append(head);
  const body=el('tbody');
  for(const player of ['standard','aggressive']) {const row=el('tr'),th=el('th',s.actions.find(a=>a.id===player).short);th.scope='row';row.append(th);for(const rival of ['standard','aggressive']) row.append(el('td',BASE_PAYOFFS[`${player}/${rival}`].map(money).join(' / ')));body.append(row);}table.append(body);wrap.append(table);parent.append(wrap);
  const payoffs=el('dl',undefined,'gr-payoff-key');
  for(const [term,text] of [['Temptation · $155,000','Aggressive while the rival stays Standard.'],['Reward · $100,000','Both choose Standard.'],['Punishment · $70,000','Both choose Aggressive.'],['Sucker payoff · $45,000','Standard while the rival chooses Aggressive.']]) payoffs.append(stat(term,text));
  parent.append(payoffs,el('p','T > R > P > S · 155 > 100 > 70 > 45','gr-ordering'),el('p','Each game’s market size scaled both firms’ payoffs by the same amount. It changed the stakes without changing this ordering.','gr-note'));
  parent.append(el('h3','Individual incentives and the joint result'),el('p','In a one-shot game, Aggressive earns more whether the rival chooses Standard ($155,000 rather than $100,000) or Aggressive ($70,000 rather than $45,000). Aggressive is the dominant strategy here. Mutual Aggressive is the one-shot Nash equilibrium: neither firm gains by changing its own choice alone.'),el('p',`Yet mutual Standard produces $200,000 jointly at the base market size, compared with $140,000 under mutual Aggressive. Your season had ${counts.mutualAggressive} mutual-Aggressive ${counts.mutualAggressive===1?'round':'rounds'}, where this margin loss mattered.`));
  parent.append(el('h3','What repetition changes'),el('p',`Your ${counts.playerAggressive} aggressive ${counts.playerAggressive===1?'choice became':'choices became'} part of the rival’s later information. Past aggression can invite retaliation; repeated restraint can make later restraint more likely. These are uncertain responses, not promises. No communication or agreement occurred.`),el('p','The known final game has no later home game in which to respond. A finite horizon does not remove the one-shot incentive; history can still shape beliefs about this uncertain rival. This simulated rival is a bounded, history-dependent competitor, not a claim that restraint is the unique equilibrium of the season.'));
  parent.append(el('h3','A comparison, not a recommended agreement'));
  const comparison=el('dl',undefined,'gr-debrief-totals');comparison.append(stat('Actual industry profit',money(run.industrySeasonProfit)),stat('Both independently Standard every game',money(benchmark)),stat('Difference',money(benchmark-run.industrySeasonProfit)));parent.append(comparison);
  parent.append(el('p','The comparison holds market demand fixed and changes both firms’ choices. It does not predict how the rival would respond to a different player history or suggest coordination. Asymmetric rounds split the same base joint profit as mutual Standard; the joint shortfall here comes from mutual aggressive subsidies.','gr-note'));
  parent.append(button('Play Another Season',actions.reset,'gr-button gr-continue'));
}
export function renderGame(s,run,saved,roots,actions,qaSeed=null) {
  const {view,dashboard,ledger}=roots;view.replaceChildren();renderDashboard(s,run||saved,dashboard);renderLedger(s,run||saved,ledger);
  if(!run) {
    title(view,'Six games. Your next move.','Alderwick · delivery operations');
    view.append(el('p',s.introduction,'gr-explanation'),el('p','There are no negotiations. Watch the market, choose your promotion and learn from the revealed history. Profit and market share tell different parts of the story.','gr-note'));
    if(saved) view.append(button(saved.completed?'Review Saved Season':`Resume at Game Day ${saved.roundIndex+1}`,actions.resume,'gr-button gr-continue'));
    else view.append(button('Start Season',actions.start,'gr-button gr-continue'));
    if(qaSeed!==null) view.append(el('p',`QA seed: ${qaSeed}. Replay uses this fixed seed.`,'gr-note'));
    return;
  }
  if(run.phase==='debrief') {debrief(s,run,view,actions);return;}
  const round=s.rounds[run.roundIndex];title(view,round.name,`Game Day ${run.roundIndex+1} of 6${run.phase==='reveal'?' · Both offers revealed':''}`);
  const opportunity=el('p',undefined,'gr-opportunity');opportunity.append(el('span','Market opportunity'),el('strong',round.demand));view.append(opportunity);
  view.append(scene(s,run));
  if(run.phase==='reveal') {reveal(s,run,view,actions);return;}
  view.append(el('p',round.context,'gr-context'),el('h3','Choose your game-day offer'),el('p','The rival’s offer is already locked and hidden. Your choice will reveal both offers together.','gr-note'));
  const choices=el('div',undefined,'gr-choices');
  for(const action of s.actions) {const b=button('',()=>actions.choose(action.id));b.dataset.strategy=action.id;b.append(el('strong',action.label),el('span',action.detail));choices.append(b);}view.append(choices);
}
