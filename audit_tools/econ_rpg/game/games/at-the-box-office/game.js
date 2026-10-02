(() => {
  'use strict';
  const {calculate,summarize,generate,drawVariants,pack,restore,graph,SAVE_KEY,BAG_KEY} = window.BoxOffice;
  let scenarios = window.BoxOffice.scenarios;
  const view = document.querySelector('#view');
  const art = document.querySelector('#scene-image');
  const announcement = document.querySelector('#announcement');
  const help = document.querySelector('#how-to-play');
  let scorePinned = false;
  const money = n => new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
  const number = n => n.toLocaleString('en-US');
  let state = {mode:'start',round:0,history:[]};
  let storageMessage = '', variantHistory = null;
  try {
    variantHistory = JSON.parse(localStorage.getItem(BAG_KEY));
    const raw = localStorage.getItem(SAVE_KEY), saved = raw && restore(raw);
    if(saved){state=saved;scenarios=state.season.scenarios;}
    else if(raw)storageMessage='The previous save could not be read. Start a new season.';
  } catch {storageMessage='Progress is available for this visit only; local saving is unavailable.';}
  function save(){try{localStorage.setItem(SAVE_KEY,pack(state));localStorage.setItem(BAG_KEY,JSON.stringify(variantHistory));storageMessage='';}catch{storageMessage='Progress is available for this visit only; local saving is unavailable.';}}
  function newSeason(){
    const bytes=new Uint32Array(1);crypto.getRandomValues(bytes);let seed=bytes[0];
    if(state.season&&seed===state.season.seed)seed=(seed+1)>>>0;
    const draw=drawVariants(variantHistory,seed);variantHistory=draw.history;
    const season=generate(seed,draw.variants);scenarios=season.scenarios;
    state={mode:'decision',round:0,history:[],season};save();
  }
  const descriptions = {'theater-exterior':'An illuminated Art Deco theater, its marquee reading At the Box Office.','manager-office':'The theater manager’s walnut desk and brass lamp overlooking the city.','concessions-lobby':'Guests gather at the theater’s warm, gold-trimmed popcorn counter.'};
  function setScene(name){art.src=`./scenes/${name}.webp`;art.alt=descriptions[name];}
  function delta(value,before,format=number){const d=value-before;return d===0?'No change':`${d>0?'↑':'↓'} ${format(Math.abs(d))} ${d>0?'more':'less'}`;}
  function metrics(current,before){
    const price=current.segments?`${money(Math.min(...current.segments.map(s=>s.price)))}–${money(Math.max(...current.segments.map(s=>s.price)))}`:money(current.price);
    return `<dl class="metrics"><div class="metric"><dt>${current.segments?'Ticket prices':'Ticket price'}</dt><dd>${price}${before?`<small>${current.segments?'Prices unchanged':`${money(before.price)} → ${money(current.price)}<br>${delta(current.price,before.price,money)}`}</small>`:''}</dd></div><div class="metric"><dt>Attendance</dt><dd>${number(current.attendance)}${before?`<small>${number(before.attendance)} → ${number(current.attendance)}<br>${delta(current.attendance,before.attendance)}</small>`:''}</dd></div><div class="metric"><dt>Ticket revenue</dt><dd>${money(current.ticketRevenue)}${before?`<small>${money(before.ticketRevenue)} → ${money(current.ticketRevenue)}<br>${delta(current.ticketRevenue,before.ticketRevenue,money)}</small>`:''}</dd></div></dl>`;
  }
  function extras(result,before){
    if(result.bundlePrice==null)return '';
    return `<div class="bundle"><p class="eyebrow">${scenarios[state.round]?.bundleLabel||'Popcorn + drink bundle'}</p><p>${before?'Selected':'Current'}: <strong>${money(result.bundlePrice)}</strong></p></div>${before?`<p class="extra">Concession receipts ${money(result.concessionRevenue)} · Combined receipts ${money(result.totalRevenue)} (${delta(result.totalRevenue,before.totalRevenue,money)})</p>`:''}`;
  }
  const progress = () => `<div class="progress" aria-label="Round ${state.round+1} of 7">${scenarios.map((_,i)=>`<span class="${i<=state.round?'done':''}"></span>`).join('')}</div>`;
  function incomeTable(s){return `<table class="income"><caption>Bookings before → after income ${s.incomeIndex[1]>100?'rises':'falls'}, before any promotion</caption><thead><tr><th scope="col">Screening</th><th scope="col">Before</th><th scope="col">After</th><th scope="col">Change</th></tr></thead><tbody>${s.income.map(r=>`<tr><th scope="row">${r.name}</th><td>${r.before}</td><td>${r.after}</td><td>${r.after>=r.before?'+':''}${Math.round((r.after/r.before-1)*100)}%</td></tr>`).join('')}</tbody></table>`;}
  function render(focus=true){
    scorePinned = false;
    document.body.dataset.mode=state.mode;
    if(state.mode==='start'){
      setScene('theater-exterior');
      view.innerHTML='<h1 id="view-title">AT THE<br>BOX OFFICE</h1><div class="ornament" aria-hidden="true">— ◇ —</div><p>A Movie Theater Economics Game</p><button class="primary" data-action="start">ENTER THE THEATER</button><button class="help-button" data-action="help" aria-haspopup="dialog" aria-controls="how-to-play">ⓘ HOW TO PLAY</button>';
    }else if(state.mode==='debrief')renderDebrief();
    else{
      const s=scenarios[state.round],before=calculate(s.startingState);
      setScene(s.background);
      const record=state.history[state.round];
      const event=s.film.split(' · ')[0];
      const score=record?`<div class="score-wrap"><button class="score" data-action="score" aria-label="Market reading: ${record.choice.points} of 2 points" aria-expanded="false" aria-controls="score-explanation" aria-describedby="score-explanation"><span aria-hidden="true">◈</span> ${record.choice.points}/2</button><div id="score-explanation" class="score-popover" role="tooltip" hidden><strong>MARKET READING</strong><p>Points reflect how well your decision fits the week’s stated objective and the market evidence available at the time.</p></div></div>`:'';
      const header=`<div class="week-header"><p class="eyebrow">Week ${state.round+1} / 7 · ${event}</p>${score}</div><h1 id="view-title">${s.title}</h1>`;
      if(state.mode==='decision'){
        view.innerHTML=`${header}<p class="brief">${s.briefing}</p>${s.income?incomeTable(s):''}${metrics(before)}${extras(before)}<p class="mission"><strong>Your goal</strong><br>${s.mission}</p><div class="choices">${s.choices.map((c,i)=>`<button class="choice" data-choice="${i}"><span class="letter" aria-hidden="true">${'ABC'[i]}</span><span><strong>${c.title}</strong><small>${c.detail}</small></span></button>`).join('')}</div>${progress()}`;
      }else{
        view.innerHTML=`<div class="result">${header}<p class="brief">${record.choice.title}</p>${metrics(record.result,before)}${extras(record.result,before)}<div class="result-copy"><p>${record.choice.feedback}</p>${insights(record.choice)}</div><button class="primary" data-action="continue">${state.round===6?'SEE YOUR SEASON':'CONTINUE →'}</button>${progress()}</div>`;
      }
    }
    if(storageMessage)view.insertAdjacentHTML('beforeend',`<p class="save-notice" role="status">${storageMessage}</p>`);
    setupScore();
    if(focus){view.focus({preventScroll:true});window.scrollTo({top:window.matchMedia('(max-width:760px)').matches&&state.mode!=='start'?Math.max(0,view.offsetTop-16):0,behavior:'instant'});}
  }
  function showScore(open){
    const button=view.querySelector('.score'),panel=view.querySelector('.score-popover');
    if(button&&panel){button.setAttribute('aria-expanded',String(open));panel.hidden=!open;}
  }
  function setupScore(){
    const wrap=view.querySelector('.score-wrap'),button=view.querySelector('.score');if(!wrap)return;
    wrap.addEventListener('pointerenter',event=>{if(event.pointerType==='mouse')showScore(true);});
    wrap.addEventListener('pointerleave',()=>{if(!scorePinned&&document.activeElement!==button)showScore(false);});
    button.addEventListener('focus',()=>showScore(true));
    button.addEventListener('blur',()=>{if(!scorePinned)showScore(false);});
  }
  function insights(choice){
    return choice.episodes.map(e=>`<section class="insight"><p class="eyebrow">${e.kind==='price'?'Price elasticity of demand':e.kind==='cross'?'Cross-price elasticity of demand':'Income elasticity of demand'}</p><h2>${e.label}</h2>${e.kind==='price'?'':`<p><strong>${e.title}</strong> · ${e.kind==='income'?'Income index':e.xLabel} ${e.kind==='income'?e.x1:money(e.x1)} → ${e.kind==='income'?e.x2:money(e.x2)} · Attendance ${number(e.q1)} → ${number(e.q2)}</p><p>${e.kind==='income'?(e.label==='Inferior good'?'Negative income elasticity: demand moves opposite to income. Budget matinees can gain demand in a slowdown.':e.label.includes('necessity')?'Positive income elasticity below one: standard demand changes less than proportionally with income.':'Positive income elasticity above one: premium demand is especially responsive to household purchasing power.'):e.interpretation}</p>`}</section>`).join('');
  }
  function renderDebrief(){
    setScene('theater-exterior');
    const total=summarize(state.history);
    const reviews=(kind)=>state.history.flatMap((r,i)=>r.choice.episodes.filter(e=>e.kind===kind).map((e,j)=>`<article class="review"><p class="eyebrow">Week ${i+1} · ${scenarios[i].title}</p><p class="review-action"><strong>Your decision:</strong> ${r.choice.title}</p><p class="review-outcome">Your outcome: ${number(r.result.attendance)} admissions · ${money(r.result.ticketRevenue)} ticket revenue.</p>${graph(e,`graph-${i}-${j}`)}</article>`)).join('');
    const final=state.history[6];
    view.innerHTML=`<div class="debrief"><p class="eyebrow">Season complete</p><h1 id="view-title">Your box office results</h1><p class="summary"><strong>${total.tier}</strong> · ${total.points}/14 market-reading points</p><dl class="metrics"><div class="metric"><dt>Admissions</dt><dd>${number(total.attendance)}</dd></div><div class="metric"><dt>Total ticket revenue</dt><dd>${money(total.ticketRevenue)}</dd></div><div class="metric"><dt>Goals met</dt><dd>${total.strong} / 7</dd></div></dl>
      <section aria-labelledby="price-review"><h2 id="price-review">Price elasticity of demand</h2><p>Ticket price changes quantity demanded along a demand relationship. Compare the price × attendance revenue areas.</p><div class="review-grid">${reviews('price')}</div></section>
      <section aria-labelledby="cross-review"><h2 id="cross-review">Cross-price elasticity of demand</h2><p>These observations hold ticket price fixed. They isolate the related-price change; your later ticket-price or promotion response is separate.</p><div class="review-grid">${reviews('cross')}</div></section>
      <section aria-labelledby="income-review"><h2 id="income-review">Income elasticity of demand</h2><p>All three comparisons show the income response at fixed ticket prices, before your promotion. Income is indexed to 100 before the change.</p><div class="review-grid">${reviews('income')}</div></section>
      <section class="synthesis"><h2>What the season showed</h2><div class="synthesis-grid"><p><strong>Own ticket price</strong><br>Movement along demand: quantity demanded changes.</p><p><strong>Related-good price</strong><br>A demand shift: substitutes or complements change the attraction of a theater visit.</p><p><strong>Consumer income</strong><br>A demand shift: purchasing power changes demand for normal and inferior goods.</p></div><p><strong>Your final application:</strong> ${final.choice.title}. ${final.choice.feedback}</p></section>
      <details><summary>Your seven-week ledger</summary><ol class="ledger">${state.history.map((r,i)=>`<li><strong>Week ${i+1} · ${scenarios[i].title}</strong><br>${r.choice.title}<small>${number(r.result.attendance)} admissions · ${money(r.result.ticketRevenue)} ticket revenue · ${r.choice.points}/2 points</small></li>`).join('')}</ol></details><div class="replay"><h2>A different audience awaits</h2><p>Next season brings new releases, different market conditions and fresh numbers.</p><button class="primary" data-action="restart">PLAY ANOTHER SEASON</button><a class="return-games" href="https://masteryquests.org/beta-testing/october-games-b9021b0dcb5f/games/">RETURN TO GAMES</a></div><p class="footnote">Fictional market data · Revenue is not profit. Season progress and recent variants are saved on this browser when storage is available.</p></div>`;
  }
  view.addEventListener('click',event=>{
    const button=event.target.closest('button');if(!button)return;
    if(button.dataset.action==='help'){help.showModal();}
    else if(button.dataset.action==='score'){scorePinned=!scorePinned;showScore(scorePinned);}
    else if(button.dataset.action==='start'||button.dataset.action==='restart'){
      newSeason();announcement.textContent='';render();
    }else if(button.dataset.choice!==undefined&&state.mode==='decision'){
      const s=scenarios[state.round],choice=s.choices[Number(button.dataset.choice)];if(!choice)return;
      const result=calculate(choice.outcome);state.history.push({choice,result});state.mode='result';save();render();
      announcement.textContent=`Weekend result: ${number(result.attendance)} admissions; ${money(result.ticketRevenue)} ticket revenue. ${choice.feedback}`;
    }else if(button.dataset.action==='continue'&&state.mode==='result'){
      state.round++;state.mode=state.round===scenarios.length?'debrief':'decision';save();announcement.textContent='';render();
    }
  });
  document.addEventListener('keydown',event=>{if(event.key==='Escape'){scorePinned=false;showScore(false);}});
  help.addEventListener('keydown',event=>{if(event.key==='Tab'){event.preventDefault();help.querySelector('button').focus();}});
  document.addEventListener('click',event=>{if(!event.target.closest('.score-wrap')){scorePinned=false;showScore(false);}});
  render(false);
})();
