import {roundMoney, requiredReserves, excessReserves, maxLoan, bank, applyDeposit, makeLoanAndClear, transferLoan, systemTotals, theoreticalDepositMaximum, maximumLoans, sequence, trainingEvents, postTrainingRound, BANK_NAMES, COMPARISON_RATIO, CAUTIOUS_HOLDING, initialState} from './model.js';

let state=initialState();
const work=document.querySelector('#work');
const dollars=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',minimumFractionDigits:Number.isInteger(n)?0:2,maximumFractionDigits:2}).format(n);
const pct=n=>`${Math.round(n*100)}%`;
const button=(action,label,primary=true)=>`<button type="button" data-action="${action}" class="${primary?'primary':''}">${label}</button>`;
const field=(id,label)=>`<div class="field"><label for="${id}">${label}</label><input id="${id}" name="${id}" type="text" inputmode="decimal" autocomplete="off" aria-describedby="entry-help feedback" required></div>`;
const feedback=()=>'<p id="feedback" class="feedback" role="status" aria-live="polite" aria-atomic="true"></p>';
const heading=(eyebrow,title)=>`<p class="eyebrow">${eyebrow}</p><h2 id="stage-title">${title}</h2>`;
function announce(message){document.querySelector('#announcement').textContent=message;}
function error(message,id){
  document.querySelector('#feedback').textContent=message;
  if(id){const input=document.getElementById(id);input.setAttribute('aria-invalid','true');input.focus();}
  state.studentHistory.push({type:'correction',phase:state.gamePhase,round:state.round,message});
}
function number(id){
  const input=document.getElementById(id),text=input.value.trim();
  input.removeAttribute('aria-invalid');
  if(!/^\d+(\.\d{1,2})?$/.test(text) || !Number.isFinite(Number(text)) || Number(text)>1e9){
    error('Enter a dollar amount of zero or more, with no commas and at most two decimal places.',id);return null;
  }
  return Number(text);
}
const row=(label,n,cls='')=>`<div class="account-row ${cls}"><span>${label}</span><strong>${dollars(n)}</strong></div>`;
function balance(b,showDerived=true){
  const required=requiredReserves(b.deposits,state.reserveRatio),excess=excessReserves(b.reserves,b.deposits,state.reserveRatio);
  return `<section class="panel" aria-label="${b.name} balance sheet"><p class="eyebrow">Balance sheet</p><h3>${b.name}</h3>
    <div class="balance-grid"><div><h4>Assets</h4>${row('▣ Reserves',b.reserves,'reserves')}${row('↗ Loans',b.loans,'loans')}${row('Total assets',roundMoney(b.reserves+b.loans),'total')}</div><div><h4>Liabilities</h4>${row('▤ Deposits',b.deposits,'deposits')}${row('Total liabilities',b.deposits,'total')}</div></div>
    <p class="balanced">✓ Balance sheet balanced</p><div class="reserve-desk"><h4>Reserve account · ${pct(state.reserveRatio)} requirement</h4><dl><div><dt>Total reserves</dt><dd>${dollars(b.reserves)}</dd></div><div><dt>Required reserves</dt><dd>${showDerived?dollars(required):'Awaiting your entry'}</dd></div><div><dt>Excess available for lending</dt><dd>${showDerived?dollars(excess):'Calculate at the loan desk'}</dd></div></dl><p class="small">Required and excess are two measures of the same reserve account, not separate accounts.</p></div></section>`;
}
function loanForm(mode){
  const b=mode==='training'?state.currentBank:state.bankNetwork[state.networkStep];
  return `<form id="loan-form" data-mode="${mode}" novalidate><div class="mobile-snapshot" aria-label="Current bank balances">${row('▤ Total deposits',b.deposits,'deposits')}${row('▣ Total reserves',b.reserves,'reserves')}${row('↗ Existing loans',b.loans,'loans')}</div><div class="fields">${field('required','Required reserves ($)')}${field('loan','Loan to authorize ($)')}</div><p class="small" id="entry-help">Required reserves = total deposits × ${pct(state.reserveRatio)}. Subtract that minimum from total reserves to find lending capacity. Enter dollars without commas.</p><button class="primary" type="submit">Authorize loan &amp; clear payment</button>${feedback()}</form>`;
}
function training(){
  const events=trainingEvents[state.round],last=state.studentHistory.filter(e=>e.type==='approved-loan'&&e.phase===1).at(-1);
  return `${heading(`Act 1 · Your Bank · Bank training ${state.round+1} / 3`,'Common Ground Bank operations')}
  <div class="desk"><div class="panel"><div class="slip"><h3>Transaction queue</h3><ul>${events.map(e=>`<li>${e.type==='deposit'?'Customer deposit +':'Customer withdrawal −'}${dollars(e.amount)}</li>`).join('')}</ul><span class="small">${state.posted?'✓ Posted to deposits and reserves':'Ready to post'}</span></div>
    ${!state.posted?`<p>${state.round===0?'Start with an empty bank. Post the customer’s deposit to open the reserve account and deposit ledger.':state.round===2?'Post both events. A withdrawal reduces both deposits and reserves; evaluate the bank’s resulting total position.':'The existing loans stay on the books. Add the new deposit, then inspect the entire balance sheet.'}</p>${button('post','Post queued transactions')}`:
    !state.cleared?`<h3>Loan desk</h3><p>${state.round===0?'Try lending all available excess reserves for this training round. You may keep some as a buffer; later rounds will carry your actual balances forward.':'Use total deposits and total reserves—not just the newest deposit. You may lend any amount up to the available excess.'}</p>${loanForm('training')}`:
    `<div class="confirmation"><h3>Payment cleared</h3><p>${last.amount?`The borrower spent ${dollars(last.amount)} outside this bank. Common Ground exchanged ${dollars(last.amount)} in reserves for a ${dollars(last.amount)} loan asset.`:'You kept the excess reserves. No loan or outgoing payment was created.'}</p><p class="small">${dollars(maxLoan(state.currentBank,state.reserveRatio))} remains available for lending.</p></div>${state.round<2?button('next-round','Open next transaction queue'):`<p>You have been running one bank. But where did the money from those loans go?</p>${button('network','Pull back to the banking network')}`}`}
    </div>${balance(state.currentBank,!state.posted||state.cleared)}</div>`;
}
function ledger(){
  const t=systemTotals(state.bankNetwork);
  return `<dl class="system-ledger" aria-label="System ledger"><div><dt>Initial new reserves</dt><dd>${dollars(state.initialReserveInjection)}</dd></div><div class="deposits"><dt>Total deposits</dt><dd>${dollars(t.deposits)}</dd></div><div class="loans"><dt>Total loans</dt><dd>${dollars(t.loans)}</dd></div><div class="reserves"><dt>Total reserves</dt><dd>${dollars(t.reserves)}</dd></div></dl>`;
}
function bankCards(){
  return `<div class="network" aria-label="Four-bank network">${state.bankNetwork.map((b,i)=>`<section class="bank-card ${i===state.networkStep?'active':''}" aria-label="${b.name}"><h3>${b.name}</h3>${row('▤ Deposits',b.deposits,'deposits')}${row('▣ Reserves',b.reserves,'reserves')}${row('↗ Loans',b.loans,'loans')}<details><summary>Inspect balance sheet</summary>${row('Total assets',roundMoney(b.reserves+b.loans))}${row('Total liabilities',b.deposits)}<p class="balanced">✓ Balanced</p>${row('Required',requiredReserves(b.deposits,state.reserveRatio))}${row('Excess',maxLoan(b,state.reserveRatio))}</details></section>`).join('')}</div>`;
}
function network(){
  const step=state.networkStep,last=state.studentHistory.filter(e=>e.type==='bank-transfer').at(-1);
  return `${heading('Act 2 · Across Town · Bank network','Follow the payment')}
    <p>A clean system-wide exercise: a new ${dollars(state.initialReserveInjection)} of reserves enters the banking system and supports a deposit at Common Ground Bank. The fictional reserve requirement is ${pct(state.reserveRatio)}.</p>
    ${ledger()}${bankCards()}
    ${last?`<div class="transfer"><span class="transfer-symbol" aria-hidden="true">▣ →</span> <strong>${dollars(last.amount)} payment settled:</strong> reserves moved from ${BANK_NAMES[last.from]} to ${BANK_NAMES[last.to]}; the recipient gained a deposit of the same amount.</div>`:''}
    <div class="panel">${step<3?`<h3>${BANK_NAMES[step]} · authorize the next link</h3><p>For this maximum-expansion exercise, lend all available excess reserves. The borrower spends the loan, and the next bank receives the payment as a deposit.</p>${loanForm('network')}`:
    !state.pattern?`<h3>Pause at River Bank</h3><p>Four deposits are on the books after three loan transfers. What pattern is developing?</p><div class="options">${button('pattern-right',`Each new deposit is ${pct(1-state.reserveRatio)} of the previous deposit`,false)}${button('pattern-same','Every bank creates the same deposit',false)}${button('pattern-gone','Reserves disappear after every loan',false)}</div>${feedback()}`:
    `<div class="confirmation"><h3>A smaller deposit at each stop</h3><p>Each bank keeps ${pct(state.reserveRatio)} and lends the other ${pct(1-state.reserveRatio)}. Total system reserves remain ${dollars(systemTotals(state.bankNetwork).reserves)}; they move between banks rather than disappearing.</p></div>${button('whole','Continue the sequence')}`}</div>`;
}
const sequenceView=(holding)=>`<div class="sequence" aria-label="Successive deposits">${sequence(state.initialReserveInjection,holding,6).map((n,i)=>`${i?'<b aria-hidden="true">→</b>':''}<span>${dollars(n)}</span>`).join('')}<b>…</b></div>`;
function maximumPanel(r){
  return `<p class="formula">1 / ${r.toFixed(2)} = ${1/r}</p><dl class="report-list"><div><dt>Theoretical maximum total deposits</dt><dd>${dollars(theoreticalDepositMaximum(state.initialReserveInjection,r))}</dd></div><div><dt>Initial new reserves / total reserves</dt><dd>${dollars(state.initialReserveInjection)}</dd></div><div><dt>Maximum additional deposits through lending</dt><dd>${dollars(maximumLoans(state.initialReserveInjection,r))}</dd></div><div><dt>Maximum loans</dt><dd>${dollars(maximumLoans(state.initialReserveInjection,r))}</dd></div></dl>`;
}
function whole(){
  return `${heading('Act 3 · The Whole System','The pattern has a limit')}
    <p>You just built the first rounds manually. The multiplier summarizes the pattern you were already creating.</p>${sequenceView(state.reserveRatio)}
    <div class="desk"><section class="panel"><h3>Simplified deposit multiplier</h3><p>1 / reserve ratio. At a ${pct(state.reserveRatio)} requirement, successive deposits get smaller and their sum approaches a theoretical maximum.</p>${maximumPanel(state.reserveRatio)}<p class="small">This maximum assumes full lending of excess reserves, redepositing of loan proceeds, no currency drain, and no additional liquidity or capital constraints.</p></section>
    <section class="panel"><h3>Change one rule</h3>${!state.comparison?`<p>Before setting the fictional reserve requirement to <strong>20%</strong>, predict what happens to maximum total deposits.</p><div class="actions">${button('predict-larger','Larger',false)}${button('predict-smaller','Smaller',false)}</div>${feedback()}`:
    `<p class="confirmation">${state.comparison==='smaller'?'Your prediction matched.':'The result is smaller.'} With a higher required fraction, each bank can pass less on to the next bank.</p><h4>Comparison · 20% reserve requirement</h4>${maximumPanel(COMPARISON_RATIO)}${button('stress','Test the original model’s assumptions')}`}</section></div>`;
}
function cautious(){
  const b=applyDeposit(bank(BANK_NAMES[0]),state.initialReserveInjection),holding=CAUTIOUS_HOLDING,held=requiredReserves(b.deposits,holding),lend=maxLoan(b,holding);
  return `${heading('Act 4 · When the Maximum Is Not Reached','The rule stays. Bank behavior changes.')}
    <div class="desk"><section class="panel"><h3>Reserve policy desk</h3><dl class="report-list"><div><dt>Required reserve ratio</dt><dd>${pct(state.reserveRatio)}</dd></div><div><dt>Chosen reserve holding</dt><dd>${pct(holding)}</dd></div><div><dt>Required on the initial deposit</dt><dd>${dollars(requiredReserves(b.deposits,state.reserveRatio))}</dd></div><div><dt>Reserves the bank chooses to keep</dt><dd>${dollars(held)}</dd></div><div><dt>Loan under the cautious policy</dt><dd>${dollars(lend)}</dd></div></dl>
    <p>Banks voluntarily keep more than the required minimum. Apply this behavior at every bank in a fresh chain.</p>${!state.cautious?button('cautious','Authorize cautious lending across the system'):`<p class="confirmation">Policy applied: ${pct(holding)} held at each bank, while the requirement remains ${pct(state.reserveRatio)}.</p>`}</section>
    <section class="panel"><h3>${state.cautious?'Smaller loans, smaller deposit expansion':'Ready to compare'}</h3>${state.cautious?`${sequenceView(holding)}<dl class="report-list"><div><dt>Total deposits approach</dt><dd>${dollars(theoreticalDepositMaximum(b.deposits,holding))}</dd></div><div><dt>Total loans approach</dt><dd>${dollars(maximumLoans(b.deposits,holding))}</dd></div><div><dt>Total system reserves</dt><dd>${dollars(b.reserves)}</dd></div><div><dt>10% requirement’s theoretical maximum deposits</dt><dd>${dollars(theoreticalDepositMaximum(b.deposits,state.reserveRatio))}</dd></div></dl><p>The 10× maximum is not reached. Holding extra reserves reduces each subsequent loan and deposit; it does not change the reserve requirement.</p><p class="small">These are limiting totals, not totals already reached after the six displayed deposits. At the limit, half the reserves are required and half are voluntarily held excess.</p>${button('close','Review your banking system')}`:`<p>The maximum assumes that every bank lends all available excess reserves. Here, they choose a buffer instead.</p><p>Run the cautious policy to see how the sequence changes.</p>`}</section></div>`;
}
function close(){
  const h=state.studentHistory,approved=h.filter(e=>e.type==='approved-loan'&&e.phase===1),sum=items=>roundMoney(items.reduce((t,e)=>t+e.amount,0));
  const deposits=sum(h.filter(e=>e.type==='deposit'&&e.phase===1)),withdrawals=sum(h.filter(e=>e.type==='withdrawal'&&e.phase===1)),totals=systemTotals(state.bankNetwork);
  return `${heading('Banking journey complete','Make sense of the system')}
    <div class="summary-grid"><section class="panel"><h3>1. What happened?</h3><dl class="report-list"><div><dt>Customer deposits you posted at Common Ground</dt><dd>${dollars(deposits)}</dd></div><div><dt>Customer withdrawals you posted</dt><dd>${dollars(withdrawals)}</dd></div><div><dt>Loans you approved at Common Ground</dt><dd>${approved.map(e=>dollars(e.amount)).join(' + ')} = ${dollars(sum(approved))}</dd></div><div><dt>Common Ground’s ending deposits / reserves</dt><dd>${dollars(state.currentBank.deposits)} / ${dollars(state.currentBank.reserves)}</dd></div><div><dt>Clean network exercise</dt><dd>${state.networkStep} loan transfers · ${state.bankNetwork.length} deposits</dd></div><div><dt>Network reserve requirement</dt><dd>${pct(state.reserveRatio)}</dd></div><div><dt>Total deposits in your manual chain</dt><dd>${dollars(totals.deposits)}</dd></div><div><dt>Loans in your manual chain</dt><dd>${dollars(totals.loans)}</dd></div><div><dt>Theoretical maximum total deposits</dt><dd>${dollars(theoreticalDepositMaximum(state.initialReserveInjection,state.reserveRatio))}</dd></div><div><dt>Deposits approached with 20% actual holding</dt><dd>${dollars(theoreticalDepositMaximum(state.initialReserveInjection,CAUTIOUS_HOLDING))}</dd></div></dl><p class="small">Your single-bank training and the clean network exercise are separate runs; their totals are not added together.</p></section>
    <section class="panel"><h3>2. Why did it happen economically?</h3><ol><li>Posting an incoming deposit increased both the bank’s deposit liabilities and reserves.</li><li>The reserve rule set the minimum on <em>total</em> deposits in this simplified system.</li><li>Reserves above that minimum gave the bank lending capacity.</li><li>A loan spent at another bank sent reserves there and supported a new deposit.</li><li>The receiving bank repeated that process.</li><li>Each round was smaller, so total deposits formed a converging sequence.</li><li>The multiplier summarized maximum expansion under the model’s assumptions.</li><li>Choosing to hold extra reserves left less to lend, so deposit expansion was smaller.</li></ol></section>
    <section class="panel wide"><h3>3. Can you use it somewhere else?</h3><p>A different banking system has a 10% reserve requirement. Banks become cautious and hold more than required. What happens to deposit expansion?</p>${!state.transferAnswered?`<div class="options">${button('transfer-larger','Deposit expansion becomes larger',false)}${button('transfer-smaller','Deposit expansion becomes smaller',false)}${button('transfer-rule','The reserve requirement automatically falls',false)}</div>${feedback()}`:
    `<p class="confirmation">When banks hold more reserves instead of lending them, fewer funds move into new deposits at other banks. The simple multiplier therefore overstates the expansion actually produced.</p><details class="assumptions"><summary>Explore the model and its assumptions</summary><h4>This simplified model assumes:</h4><ul><li>A fixed reserve ratio.</li><li>Banks are willing to lend all available excess reserves.</li><li>Loan proceeds return to the banking system as deposits.</li><li>No currency leakage.</li><li>No additional liquidity, capital, or other lending constraints.</li></ul><p>The multiplier describes a maximum under these assumptions, not a guarantee. This textbook exercise is not a complete account of modern bank lending and makes no claim about current U.S. reserve regulation.</p></details>${button('restart','Operate a fresh system',false)}`}</section></div>`;
}
function render(focus=true){
  const names=['Your Bank','Across Town','The Whole System','Below the Maximum'];
  document.querySelector('#progress').innerHTML=names.map((name,i)=>`<li ${state.gamePhase===i+1?'aria-current="step"':''}><b>${state.gamePhase>i+1?'✓':i+1}</b>${name}</li>`).join('');
  work.innerHTML=[null,training,network,whole,cautious,close][state.gamePhase]();
  if(focus)work.focus();
}
work.addEventListener('submit',e=>{
  if(e.target.id!=='loan-form')return;e.preventDefault();
  const required=number('required');if(required===null)return;
  const loan=number('loan');if(loan===null)return;
  const b=state.gamePhase===1?state.currentBank:state.bankNetwork[state.networkStep],minimum=requiredReserves(b.deposits,state.reserveRatio),capacity=maxLoan(b,state.reserveRatio);
  state.studentHistory.push({type:'proposed-loan',phase:state.gamePhase,round:state.round,amount:loan,required});
  if(required!==minimum){error(`Required reserves use total deposits: ${dollars(b.deposits)} × ${pct(state.reserveRatio)} = ${dollars(minimum)}, not just the newest deposit.`, 'required');return;}
  if(loan>capacity){error(`This loan would leave ${b.name} below its required reserve level: ${dollars(roundMoney(b.reserves-loan))} would remain, but ${dollars(minimum)} is required. Maximum loan available: ${dollars(capacity)}.`, 'loan');return;}
  if(state.gamePhase===2 && loan!==capacity){error(`This guided chain tests full lending: authorize ${dollars(capacity)}. Keeping a buffer is allowed in the model; you will test that behavior in Act 4.`, 'loan');return;}
  state.studentHistory.push({type:'approved-loan',phase:state.gamePhase,round:state.round,amount:loan});
  if(state.gamePhase===1){state.currentBank=makeLoanAndClear(b,loan,state.reserveRatio);state.cleared=true;render();announce(`${dollars(loan)} authorized. ${dollars(state.currentBank.reserves)} reserves remain; the balance sheet balances.`);}
  else{const from=state.networkStep;state.bankNetwork=transferLoan(state.bankNetwork,from,from+1,loan,state.reserveRatio);state.studentHistory.push({type:'bank-transfer',from,to:from+1,amount:loan});state.networkStep++;render();announce(`${dollars(loan)} payment settled at ${BANK_NAMES[from+1]}. Total deposits now ${dollars(systemTotals(state.bankNetwork).deposits)}.`);}
});
work.addEventListener('click',e=>{
  const action=e.target.closest('[data-action]')?.dataset.action;if(!action)return;
  if(action==='post'){state.currentBank=postTrainingRound(state.currentBank,state.round);state.posted=true;for(const event of trainingEvents[state.round])state.studentHistory.push({...event,phase:1,round:state.round});render();announce(`Transactions posted. Deposits ${dollars(state.currentBank.deposits)}. Reserves ${dollars(state.currentBank.reserves)}.`);return;}
  if(action==='next-round'){state.round++;state.posted=false;state.cleared=false;}
  if(action==='network'){state.gamePhase=2;state.bankNetwork=BANK_NAMES.map(bank);state.bankNetwork[0]=applyDeposit(state.bankNetwork[0],state.initialReserveInjection);}
  if(action==='pattern-right'){state.pattern=true;state.studentHistory.push({type:'pattern',answer:'90%'});}
  if(action==='pattern-same'){error(`Compare the deposit ledgers: ${state.bankNetwork.map(b=>dollars(b.deposits)).join(', ')}. Each bank holds back its required fraction before lending.`);return;}
  if(action==='pattern-gone'){error(`The system still holds ${dollars(systemTotals(state.bankNetwork).reserves)} in reserves. Payments move reserves to another bank; they do not remove them from this system.`);return;}
  if(action==='whole')state.gamePhase=3;
  if(action.startsWith('predict-')){state.comparison=action.slice(8);state.studentHistory.push({type:'prediction',answer:state.comparison});}
  if(action==='stress')state.gamePhase=4;
  if(action==='cautious'){state.cautious=true;state.studentHistory.push({type:'reserve-policy',requiredRatio:state.reserveRatio,actualHolding:CAUTIOUS_HOLDING});}
  if(action==='close')state.gamePhase=5;
  if(action==='transfer-larger'){error('Extra reserves stay at the bank instead of financing another loan. Less reaches the next bank as a deposit. Try again.');return;}
  if(action==='transfer-rule'){error('A bank’s choice to hold extra reserves does not change the required ratio. Consider how much remains to lend.');return;}
  if(action==='transfer-smaller'){state.transferAnswered=true;state.studentHistory.push({type:'transfer-answer',answer:'smaller'});}
  if(action==='restart')state=initialState();
  render();
});
render(false);
