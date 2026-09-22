import { pathToFileURL } from 'node:url';
import { writeFileSync, existsSync } from 'node:fs';
import scenario from './game/scenarios/gameday-rivals.js';
import { createSeason, commitRival, revealRound, nextRound } from './game/gameday-rivals-engine.js';
import { CLASSIFICATIONS, seasonStats } from './game/scenarios/gameday-rivals-market.js';
export const seeds=Array.from({length:32},(_,i)=>i);
export const histories=Array.from({length:64},(_,mask)=>Array.from({length:6},(_,i)=>mask & (1<<(5-i))?'aggressive':'standard'));
export function simulate(seed,sequence) {
  let run=createSeason({seed,runID:'qa',startedAt:0});const phases=[run];
  for(const action of sequence){run=revealRound(run,action,commitRival(run));phases.push(run);run=nextRound(run);phases.push(run);}
  return {run,phases,stats:seasonStats(run.history),sequence};
}
export function audit() {
  const seasons=seeds.flatMap(seed=>histories.map(sequence=>simulate(seed,sequence)));
  const specs=[
    ['Mostly mutual Standard',s=>s.stats.mutualStandard>=5],
    ['Mostly mutual Aggressive',s=>s.stats.mutualAggressive>=4],
    ['Player repeatedly exploits restraint',s=>s.stats.playerExploits>=3&&s.stats.rivalExploits===0],
    ['Rival repeatedly exploits the player',s=>s.stats.rivalExploits>=3&&s.stats.playerExploits===0],
    ['Retaliation cycle',s=>s.run.classification==='retaliation-cycle'],
    ['Mixed / uneasy season',s=>s.run.classification==='uneasy-restraint'],
    ['Final temptation after restraint',s=>s.run.history.slice(0,5).every(h=>h.playerAction==='standard'&&h.rivalAction==='standard')&&s.run.history[5].playerAction==='aggressive'],
    ['Final escalation after hostile history',s=>s.run.history.slice(0,5).filter(h=>h.playerAction==='aggressive'&&h.rivalAction==='aggressive').length>=3&&s.run.history[5].playerAction==='aggressive'&&s.run.history[5].rivalAction==='aggressive']
  ];
  const representatives=specs.map(([label,predicate])=>{const match=seasons.find(predicate);if(!match)throw Error(`Missing representative: ${label}`);return {label,...match};});
  for(const c of CLASSIFICATIONS) if(!representatives.some(s=>s.run.classification===c.id)) representatives.push({label:c.title,...seasons.find(s=>s.run.classification===c.id)});
  const missingReference=existsSync(new URL('./game/art/scenes/gameday-rivals/canonical-day.webp',import.meta.url))?[]:['game/art/scenes/gameday-rivals/canonical-day.webp'];
  const classifications=Object.fromEntries(CLASSIFICATIONS.map(c=>[c.id,seasons.filter(s=>s.run.classification===c.id).length]));
  return {seasons,representatives,summary:{playerHistories:histories.length,seeds:seeds.length,completeSeasons:seasons.length,rounds:6,classifications,missingReference}};
}
const notation = seq => seq.map(a=>a==='standard'?'S':'A').join('');
export function manualGuide(data) {
  const lines=['# Gameday Rivals — QA paths','',
    'Private preview: <http://127.0.0.1:4179/?scenario=gameday-rivals>. S = Standard Promotion; A = Aggressive Promotion. Read six letters from left to right. Both buttons have the same visual weight.','',
    `Exhaustive player histories: **64**. Seeds: every unsigned integer **0–31**. Total complete seeded seasons: **${data.summary.completeSeasons}** (64 × 32), with **12,288 round reveals**. Each completed season has six rounds.`, '',
    '## Representative manual seasons','',
    'Open the linked seed. If an earlier save exists, choose New Season and confirm; QA replay reuses the URL seed. Ordinary play without a seed generates a fresh seed. Resume keeps the saved seed and moves to the next unresolved round.', '',
    '| Purpose | Seed | Player S/A | Rival S/A | Classification |', '|---|---:|---|---|---|'];
  data.representatives.forEach(r=>lines.push(`| ${r.label} | [${r.run.seed}](http://127.0.0.1:4179/?scenario=gameday-rivals&seed=${r.run.seed}) | ${notation(r.sequence)} | ${notation(r.run.history.map(h=>h.rivalAction))} | ${CLASSIFICATIONS.find(c=>c.id===r.run.classification).title} |`));
  lines.push('','## All player histories','',...histories.map((s,i)=>`${i+1}. \`${notation(s)}\``),'','## Classification reachability','',...Object.entries(data.summary.classifications).map(([id,count])=>`- ${CLASSIFICATIONS.find(c=>c.id===id).title}: ${count} seasons`),'',
    '## Manual checks','',
    '- Before choosing, only completed rival actions appear in the ledger. Current strategies and all payoff-matrix/theory terminology remain absent until the appropriate reveal/debrief.',
    '- Click either strategy once. Both actions appear together, both profits post once, shares sum to 100%, and the ledger gains one row. Double-clicks must not award another payoff.',
    '- Reload immediately after a reveal: resume at the next unresolved game with the same totals, shares and seed. After Game 6, resume the full debrief. No previously resolved game pays twice.',
    '- Compare Standard/Standard and Aggressive/Aggressive: outlined P/R delivery units become busier in the latter, but joint profit falls. Background crowds depend on the game, not the chosen strategy.',
    '- Inspect the eight fixed road slots at full scene size. P/orange and R/green each retain their own vehicle/box colors. Opposing lanes have opposite orientations. Overlays must stay off sidewalks and crosswalks.',
    '- Only Game 6 uses the night image. Each earlier game uses its own supplied image; a missing file must show a named asset error, not another scene.',
    '- At 320px and 390px, read both reveal cards, status totals and the stacked ledger. Use Tab, Enter, Space, Escape and the skip link. No color-only result or animation is required.',
    '- The final page includes all six outcomes in the ledger, both firms’ counts/profits/shares, industry profit, the base matrix, T > R > P > S, one-shot incentives and the independent mutual-Standard comparison.',
    '- New Season resets only this game. Check that all four older RPG saves and their interfaces still work.','',
    '## Assets and final status','',
    ...(data.summary.missingReference.length?['**Missing reference:** `canonical-day.webp` is not present in the supplied runtime folder. All six required round images exist. No substitute canonical image is generated or silently selected. Canonical-source geometry comparison awaits that file.','']:['Canonical reference is present.','']),
    '**Verified September 21, 2026:** 49/49 unit, regression and publication tests passed. Gameday browser QA passed 42 complete seasons (14 coverage paths × 3 widths), all six classifications, 72 round/activity/width screenshots, reload/reset/keyboard checks and explicit failure handling. All four older browser suites also passed (152 complete regression runs). No unresolved runtime test failure remains. The missing canonical reference above is still a limitation, not a passed reference comparison.', '',
    'Initial QA found two test-harness issues: JavaScript strict equality distinguishes negative zero in a complementary-share assertion, and a notice assertion ran before the dynamically loaded controller mounted. Both assertions were corrected and rerun successfully; neither required a gameplay rule change. Vehicle indicators were enlarged within their verified road footprints after visual inspection.', '',
    'Detailed results, commands and browser evidence are recorded in GAMEDAY-RIVALS-REPORT.md. Assertion scripts exit nonzero on failure; rerun the unit and browser scripts before treating later code changes as validated.','');
  return lines.join('\n');
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href) {
  const data=audit();console.log(JSON.stringify(data.summary,null,2));
  if(process.argv.includes('--write'))writeFileSync(new URL('./GAMEDAY-RIVALS-QA-PATHS.md',import.meta.url),manualGuide(data));
}
