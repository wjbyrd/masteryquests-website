import { el } from './ui.js';
import { sceneFor, activityFor } from './scenarios/gameday-rivals-scenes.js';
import { BASE_PAYOFFS, CLASSIFICATIONS, seasonStats, mutualStandardCounterfactual, outcomeText, seasonOrderShares } from './scenarios/gameday-rivals-market.js';
import { renderFollowup } from './instructional-followup-view.js';
export const money = n => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
export function shareLabels(history=[]) {
  const tenths=Math.round(seasonOrderShares(history).player*10);
  const format=n=>new Intl.NumberFormat('en-US',{maximumFractionDigits:1}).format(n/10)+'%';
  return {player:format(tenths),rival:format(1000-tenths)};
}
function button(label,action,className='gr-button') { const b=el('button',label,className);b.type='button';b.addEventListener('click',action);return b; }
function title(parent,text,eyebrow) { parent.append(el('p',eyebrow,'eyebrow')); const h=el('h2',text); h.id='view-title';h.tabIndex=-1;parent.append(h); }
function scene(s,run) {
  const metadata=sceneFor(s,run.roundIndex), figure=el('figure',undefined,'gr-scene'), stage=el('div',undefined,'gr-scene-stage');
  const img=el('img'); img.src=metadata.src;img.alt=metadata.alt;img.width=metadata.width;img.height=metadata.height;
  img.addEventListener('error',()=>{const message=el('p',`Missing scene asset: ${metadata.src}. No substitute image has been loaded.`,'notice');stage.append(message);},{once:true});
  stage.append(img);
  figure.append(stage);
  const caption=el('figcaption','Background activity shows the game-day market.');
  figure.append(caption);return figure;
}
function deliveryActivity(s,run) {
  const activity=activityFor(run.playerCurrentChoice,run.rivalCurrentChoice),section=el('section',undefined,'gr-activity');
  section.dataset.activity=activity.id;section.setAttribute('aria-label','Delivery activity');section.append(el('h3','Delivery activity'));
  for(const who of ['player','rival']) {
    const row=el('div',undefined,'gr-activity-row');row.dataset.firm=who;
    row.append(el('span',s.firms[who].name));
    const bar=el('span',undefined,'gr-activity-bar');bar.setAttribute('aria-hidden','true');
    for(let i=0;i<4;i++)bar.append(el('i',undefined,i<activity[who]?'filled':''));
    row.append(bar,el('span',activity[who]===4?'High':'Moderate','gr-activity-level'));section.append(row);
  }
  return section;
}
function stat(label,value,className='') { const cell=el('div',undefined,`gr-stat ${className}`);cell.append(el('dt',label),el('dd',value));return cell; }
export function renderDashboard(s,run,parent) {
  parent.replaceChildren();const heading=el('h2','Season desk');heading.id='state-title';parent.append(heading);
  const stats=el('dl',undefined,'gr-stats'),shares=shareLabels(run?.history);
  stats.append(stat('Your Season Profit',money(run?.playerSeasonProfit||0),'gr-player'),stat('Rival Season Profit',money(run?.rivalSeasonProfit||0),'gr-rival'),stat('Your Market Share',shares.player),stat('Rival Market Share',shares.rival));parent.append(stats);
  if(run) parent.append(el('p',`${run.history.length} of 6 game days completed`,'gr-progress'));
  const help=el('details',undefined,'gr-desk-help');
  help.append(el('summary','How to read these numbers'),el('p','Profit is the financial result of the pricing decisions. Market share tracks each platform’s demand-weighted share of game-day orders across the season.','gr-note'));
  parent.append(help);
}
export function renderLedger(s,run,parent) {
  parent.replaceChildren();parent.append(el('h2','Season history'));
  if(!run?.history.length) {parent.append(el('p','No games revealed yet. Both current offers stay hidden until you commit.','gr-note'));return;}
  const list=el('ol',undefined,'gr-ledger');
  for(const h of run.history) {
    const row=el('li'), heading=el('h3',`${h.roundIndex+1}. ${s.rounds[h.roundIndex].name}`), values=el('dl');
    const player=s.actions.find(a=>a.id===h.playerAction).short,rival=s.actions.find(a=>a.id===h.rivalAction).short;
    values.append(stat('You',player,'gr-player'),stat('Rival',rival,'gr-rival'),stat('Your Profit',money(h.playerProfit)),stat('Rival Profit',money(h.rivalProfit)),stat('Game-Day Order Share · You / Rival',`${h.playerRoundOrderShare}% / ${h.rivalRoundOrderShare}%`));
    row.append(heading,el('p',`Market weight: ${h.multiplier}×`,'gr-note'),values);list.append(row);
  }
  parent.append(list);
}
function reveal(s,run,parent,actions) {
  const h=run.history.at(-1), cards=el('div',undefined,'gr-reveal'),shares=shareLabels(run.history);
  for(const who of ['player','rival']) {
    const card=el('section',undefined,`gr-reveal-card gr-${who}`), action=s.actions.find(a=>a.id===h[`${who}Action`]);
    card.append(el('h3',who==='player'?`You · ${s.firms[who].name}`:`Rival · ${s.firms[who].name}`),el('p',action.label,'gr-action-revealed'),el('p',money(h[`${who}Profit`]),'gr-profit'),el('p',`Game-Day Order Share: ${h[`${who}RoundOrderShare`]}%`,'gr-round-share gr-note'),el('p',`Season Market Share: ${shares[who]}`,'gr-season-share gr-note'));cards.append(card);
  }
  parent.append(cards,el('p',outcomeText(h.playerAction,h.rivalAction),'gr-explanation'));
  parent.append(el('p',`Combined game-day profit: ${money(h.industryProfit)}. Both offers were chosen independently.`,'gr-note'));
  parent.append(button(run.completed?'Review the season':`Prepare Game Day ${run.roundIndex+2}`,actions.next,'gr-button gr-continue'));
}
function debrief(s,run,parent,actions) {
  const classification=CLASSIFICATIONS.find(c=>c.id===run.classification), counts=seasonStats(run.history), benchmark=mutualStandardCounterfactual(s.rounds);
  title(parent,classification.title,'Season complete · six home games');
  parent.append(el('p',classification.summary,'gr-explanation'));
  const totals=el('dl',undefined,'gr-debrief-totals'),shares=shareLabels(run.history);
  totals.append(stat('Your total season profit',money(run.playerSeasonProfit)),stat('Rival total season profit',money(run.rivalSeasonProfit)),stat('Combined industry profit',money(run.industrySeasonProfit)),stat('Final Season Market Share · You / Rival',`${shares.player} / ${shares.rival}`));parent.append(totals);
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
  document.body.classList.toggle('gr-active-round',Boolean(run&&run.phase!=='debrief'));
  const {view,dashboard,ledger}=roots;view.replaceChildren();renderDashboard(s,run||saved,dashboard);renderLedger(s,run||saved,ledger);
  if(!run) {
    title(view,'Six games. Your next move.','Alderwick · delivery operations');
    view.append(el('p',s.introduction,'gr-explanation'),el('p','There are no negotiations. Watch the market, choose your promotion and learn from the revealed history.','gr-note'));
    if(saved) view.append(button(saved.completed?'Review Saved Season':`Resume at Game Day ${saved.roundIndex+1}`,actions.resume,'gr-button gr-continue'));
    else view.append(button('Start Season',actions.start,'gr-button gr-continue'));
    if(qaSeed!==null) view.append(el('p',`QA seed: ${qaSeed}. Replay uses this fixed seed.`,'gr-note'));
    return;
  }
  if(run.phase==='debrief') {
    debrief(s,run,view,actions);
    const followup=renderFollowup(s.id,run);
    if(followup) view.lastElementChild.before(followup);
    return;
  }
  const round=s.rounds[run.roundIndex];title(view,round.name,`Game Day ${run.roundIndex+1} of 6${run.phase==='reveal'?' · Both offers revealed':''}`);
  const opportunity=el('p',undefined,'gr-opportunity');opportunity.append(el('span','Market opportunity'),el('strong',round.demand));view.append(opportunity);
  const body=el('div',undefined,'gr-round-body'),side=el('div',undefined,'gr-round-side');
  body.append(scene(s,run),side);view.append(body);
  if(run.phase==='reveal') {side.append(deliveryActivity(s,run));reveal(s,run,side,actions);return;}
  side.append(el('p',round.context,'gr-context'),el('h3','Choose your game-day offer'),el('p','The rival’s offer is locked. Choose yours to reveal both.','gr-note'));
  const choices=el('div',undefined,'gr-choices');
  for(const action of s.actions) {const b=button('',()=>actions.choose(action.id));b.dataset.strategy=action.id;b.append(el('strong',action.label),el('span',action.detail));choices.append(b);}side.append(choices);
}
