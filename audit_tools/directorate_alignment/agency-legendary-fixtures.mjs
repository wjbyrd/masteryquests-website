// Focused selector/encounter boundary and long-copy layout fixtures.
import {fs,path,chromium,out,server,origin,settle} from './closeout-support.mjs';
const browser=await chromium.launch({channel:'msedge',headless:true});
try {
 const context=await browser.newContext();await context.route('**/*',r=>new URL(r.request().url()).origin===origin?r.continue():r.fulfill({status:204,body:''}));
 const page=await context.newPage();await page.clock.install();
 await page.goto(`${origin}/play/managerial-intelligence-directorate/agency-protocol/`);
 const selectors=await page.evaluate(()=>{
  const runs=[];
  for(let seed=1;seed<=100;seed++){
   let n=seed;Math.random=()=>((n=(Math.imul(n,1664525)+1013904223)>>>0)/4294967296);
   resetRunStateForNewMode();gameMode='legendary';const ordinary=[];
   legendaryBossObjectivesUsedThisRun=[];
   for(let i=0;i<questionBanks.legendary.length*3;i++)ordinary.push(getAdaptiveQuestion('legendary',i%2?'signaling':null).id);
   const size=questionBanks.legendary.length;
   if([0,1,2].some(c=>new Set(ordinary.slice(c*size,(c+1)*size)).size!==size))throw Error('Recycled before exhaustion');
   const encounters=[];
   for(let checkpoint=1;checkpoint<=3;checkpoint++){
    const picked=pickAgencyLegendaryBossQuestions(questionBanks.legendaryBoss);
    const ids=picked.map(q=>q.id),stages=picked.map(q=>q.bossStage),objectives=[...new Set(picked.map(q=>q.objective))];
    if(ids.length!==3||new Set(ids).size!==3||stages.join(',')!=='opening,middle,final'||objectives.length!==1)throw Error('Malformed encounter');
    usedQuestions.legendaryBoss.push(...ids);encounters.push({ids,stages,objective:objectives[0]});
   }
   if(new Set(encounters.map(e=>e.objective)).size!==3)throw Error('Repeated encounter objective');
   runs.push({seed,ordinary,encounters});
  }
  return {poolSize:questionBanks.legendary.length,groups:getScaffoldedBossGroups(questionBanks.legendaryBoss).map(group=>group.map(q=>({id:q.id,objective:q.objective,stage:q.bossStage}))),runs};
 });
 await page.evaluate(()=>startSelectedMode('legendary'));await settle(page);
 const layout=[];
 for(const viewport of [{width:1365,height:900},{width:390,height:844}]){
  await page.setViewportSize(viewport);
  const checks=await page.evaluate(()=>{
   const rows=[];
   for(const q of [...questionBanks.legendary,...questionBanks.legendaryBoss]){
    currentQuestion={...q,options:[...q.options]};
    // Same stem container as the actual Legendary loadQuestion branch; this
    // isolates copy/layout after end-to-end lifecycle tests exercise selection.
    document.getElementById('question').innerHTML=`<div>${q.q}</div>`;
    renderQuestionGraph(currentQuestion);displayQuestion();
    rows.push({id:q.id,horizontalOverflow:document.documentElement.scrollWidth>innerWidth+1,hasStem:document.body.innerText.includes(q.q),hasAllOptions:q.options.every(o=>document.body.innerText.includes(o))});
   }
   return rows;
  });
  if(checks.some(c=>c.horizontalOverflow||!c.hasStem||!c.hasAllOptions))throw Error('Layout/content mismatch '+JSON.stringify(checks.filter(c=>c.horizontalOverflow||!c.hasStem||!c.hasAllOptions)));
  layout.push({viewport,checks});
 }
 fs.writeFileSync(path.join(out,'legendary-fixtures.json'),JSON.stringify({selectors,layout},null,2));
 console.log(JSON.stringify({seeds:selectors.runs.length,groups:selectors.groups.length,pool:selectors.poolSize,layoutChecks:layout.reduce((n,v)=>n+v.checks.length,0)}));
}finally{await browser.close();await new Promise(r=>server.close(r));}
