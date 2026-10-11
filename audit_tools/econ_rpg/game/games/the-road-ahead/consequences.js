import {RULES,money} from './data.js';
import {chance,clamp,random} from './random.js';
import {honorsScreen,employerProbability,lossProbability,POLICIES,carPool} from './markets.js';
export function resolve(s,id) {
  const a=s.attributes,o=s.observable,f=s.flags,delayed=[];let next=null,text='';
  const add=(values)=>{for(const [key,value] of Object.entries(values))a[key]+=value;};
  const signal=(values)=>{for(const [key,value] of Object.entries(values))o[key]+=value;};
  const delay=(source,note)=>{if(!f.chanceMilestones||s.history.some(h=>h.eventID===source))delayed.push({source,note});};
  const job=(name,pay,salary)=>{Object.assign(f,{job:name,pay,salary});};
  switch(s.event) {
    case 'honors':
      f.honors=id==='apply'&&honorsScreen(o);f.honorsChoice=id;
      add({money:id==='apply'?-150:450});
      if(f.honors){add({money:1800});signal({credential:12});text='The published screen admits you. The scholarship arrives before the performance review.';}
      else text=id==='apply'?'The committee declines your application based on the visible record. Your degree path remains open.':'You decline Honors, earn $450, and keep control of your schedule.';
      next='honors-effort';break;
    case 'honors-effort':
      f.study=id;
      if(id==='prepare'){add({skills:12,preparation:18,discipline:8,wellbeing:-10});text='You build a study routine. Its real test comes after graduation.';}
      else {add({money:800,wellbeing:6,preparation:-3});text='You earn $800 and use fewer study hours. That choice alone is not dishonest; the final assessment is still ahead.';}
      f.honorsHiddenAction=!!f.honors;break;
    case 'graduation': {
      const p=clamp(.15+a.aptitude*.004+a.preparation*.004+a.skills*.002,.15,.92);
      const pass=chance(s,p,'advanced coursework');f.advancedPassed=pass;
      signal({gpa:pass?.18:-.28});
      if(f.honors){f.honorsRetained=pass;if(!pass)signal({credential:-10});}
      text=`${pass?'Your preparation and aptitude carry you through advanced coursework.':'Advanced coursework exposes gaps this time.'} ${f.honors?(pass?'You retain the Honors credential.':'The review ends your Honors status; the up-front scholarship is not recovered.'):''} `;
      delay('honors-effort',`Your ${f.study==='prepare'?'study routine':'lighter study schedule'} contributed to a ${Math.round(p*100)}% pass chance; you ${pass?'passed':'struggled'}.`);
      f.route=id;
      if(id==='portfolio'){add({money:-600,skills:16,experience:12,wellbeing:-5});signal({internship:1,sample:14});text+='The internship gives you both practical skill and evidence to show recruiters.';}
      if(id==='work'){add({money:2200,experience:15,adaptability:5,wellbeing:-Math.round(12-a.adaptability*.1)});signal({reference:6});text+='Summer work adds income and experience, with less time for a technical portfolio.';}
      if(id==='credential'){add({money:-700});signal({credential:22});text+='The certificate strengthens your résumé without automatically increasing productivity.';}
      f.offerProbability=employerProbability(o,s.market.downturn);break;
    }
    case 'pool':
      if(id==='join'){add({money:900,experience:8,wellbeing:-4});text='You join the remaining applicants and take a temporary placement. The pooled wage still draws a different mix of workers than the original pool.';}
      else {add({money:-350});signal({sample:Math.round(a.skills*.25)});text='You spend time making your work observable outside the pooled placement. Your sample helps a later screen, but cannot reveal everything.';}
      f.poolChoice=id;f.offerProbability=employerProbability(o,s.market.downturn);delay('graduation',`Your ${f.route} route enters recruiting with ${a.skills} skills and ${o.credential} credential points: separate quantities.`);break;
    case 'contract':
      if(id==='investigate'){
        add({money:-250});f.investigated=true;
        const accurate=chance(s,RULES.referenceAccuracy,'former employee report');
        f.referenceReport=`The former employee describes Beacon as ${(accurate?s.market.beaconSupport:!s.market.beaconSupport)?'supportive, with manageable hours':'demanding, with limited support'}.`;
        text=f.referenceReport;next='contract';break;
      }
      if(id==='harbor'){job('Harbor Cooperative','salary',46000);add({skills:6,satisfaction:7});text='Harbor hires you into a stable training role. Your salary is fixed; advancement still considers recorded sales.';}
      if(id==='beacon'){
        const p=employerProbability(o,s.market.downturn);f.offerProbability=p;f.beaconAccepted=chance(s,p,'Beacon résumé screen');
        if(f.beaconAccepted){job('Beacon Sales','commission',38000);add({satisfaction:s.market.beaconSupport?10:-15});text=`Beacon accepts your observable record. Once inside, you find ${s.market.beaconSupport?'a supportive team':'long hours and limited support'}. The contract rewards each recorded sale.`;}
        else {job('Harbor Cooperative','salary',46000);add({skills:6});text='Beacon declines your application. The screen is imperfect, and Harbor’s salary role remains available; you accept it.';}
      }
      if(id==='search'){
        add({money:-600});const found=chance(s,.2+a.social*.006-(s.market.downturn?.1:0),'extended search');
        job(found?'Juniper Services':'Bridge Services','salary',found?53000:42000);add({satisfaction:found?8:-4});text=found?'A contact leads to a $53k role after the search delay.':'The preferred opening does not materialize. You take a $42k bridge role with future mobility.';
      }
      delay('graduation',`Recruiters used GPA ${o.gpa.toFixed(2)}, credentials ${o.credential}, references ${o.reference}, internship ${o.internship}, and work sample ${o.sample}; they could not read aptitude or discipline.`);break;
    case 'incentives': {
      if(f.chanceMilestones&&!f.job)job('Temporary Sales','salary',42000);
      f.allocation=id;const effort={sales:8,balanced:5,service:2}[id];
      f.sales=Math.round((effort*2+a.skills*.11+a.discipline*.05)*(s.market.downturn?.8:1)*(0.85+random(s)*.3));
      f.quality=clamp((10-effort)*8+a.skills*.25);f.customerLoss=Math.round(Math.max(0,60-f.quality)*40);
      f.surplus=Math.round(f.salary*.13+(f.pay==='commission'?f.sales*240:0));
      add({money:f.surplus,experience:15,wellbeing:-Math.round(14-a.discipline*.08)});signal({record:Math.min(100,f.sales*3)});
      text=`You record ${f.sales} sales and save ${money(f.surplus)} after six months of living costs and tax. ${f.pay==='commission'?'Commission increases your pay.':'Your salary is unchanged by individual sales.'} The service effects take longer to emerge.`;
      delay('contract',`The ${f.pay} agreement shaped the payoff to allocating effort toward recorded sales.`);delay('honors-effort',`Accumulated skills (${a.skills}) and discipline (${a.discipline}) helped determine output.`);break;
    }
    case 'review': {
      if(f.chanceMilestones&&!f.allocation){
        if(!f.job)job('Bridge Services','salary',42000);
        f.surplus=Math.round(f.salary*.13);
        if(id==='switch'){add({money:-800+5720,skills:14,career:8,satisfaction:10});job('Northline Training','salary',44000);text='You take a $44k training role, save $5,720 over six months, and pay $800 to move.';}
        if(id==='recover'){add({money:Math.round(f.surplus/2),wellbeing:20,satisfaction:10});text='You work reduced hours for this period, earn half the usual savings, and recover some energy.';}
        if(id==='stay'){add({money:f.surplus,experience:12,wellbeing:-8});text=`You save ${money(f.surplus)} over six months at ${f.job}, gaining experience at a cost in energy.`;}
        f.reviewChoice=id;break;
      }
      const found=chance(s,RULES.reviewDetection,'service audit');f.auditFound=found;
      if(found){const change=f.quality<60?-14:10;add({reputation:change});signal({record:change});}
      text=`Customers incurred ${money(f.customerLoss)} in service-related losses. ${found?'The audit identifies service quality and updates your record.':'The audit misses service quality; the sales record remains the main visible measure.'} `;
      delay('incentives',`Your ${f.allocation} allocation produced service quality ${Math.round(f.quality)}/100 and ${money(f.customerLoss)} of customer losses, which the employer did not observe initially.`);
      if(id==='switch'){add({money:-800+5720,skills:14,career:8,satisfaction:10});job('Northline Training','salary',44000);text+='You switch to a $44k training role and save $5,720 over the next six months, less the $800 move.';}
      if(id==='recover'){add({money:Math.round(f.surplus/2),wellbeing:20,satisfaction:10});text+='Reduced hours restore energy at half the next period’s savings.';}
      if(id==='stay'){const p=clamp(.15+o.record*.007,.15,.85),promoted=chance(s,p,'promotion screen');add({money:f.surplus,career:promoted?22:6,satisfaction:promoted?5:-3});text+=promoted?'Your visible record earns a promotion and another period of savings.':'You earn another period of savings, but no promotion this time.';}
      f.reviewChoice=id;break;
    }
    case 'car':case 'car-purchase':
      if(id==='inspect'){
        add({money:-200});f.inspected=true;const correct=chance(s,RULES.inspectionAccuracy,'car inspection');f.carReport=(correct?s.market.bargainSound:!s.market.bargainSound)?'sound':'fragile';text=`The mechanic reports ${f.carReport} condition. You can still decline the car.`;next='car-purchase';break;
      }
      f.car=id;f.carMarket=carPool(id==='certified');add({money:-(id==='bargain'?3000:id==='certified'?8500:900)});
      if(id==='transit'){add({wellbeing:-4});text='You choose transit, keep your purchase options open, and accept a time cost.';}
      else text=`You buy ${id==='bargain'?'the bargain':'a certified'} car. Its underlying quality was fixed before your decision; the next travel period reveals any repair need.`;
      delay('review',`Work and career choices left ${money(a.money)} after this transportation decision. A negative balance is a carried financial shortfall, not a blocked path.`);break;
    case 'insurance':
      f.policy=id;add({money:-POLICIES[id].premium});text=`You choose ${id==='none'?'to retain the risk':id+' cover'}. ${money(POLICIES[id].deductible)} of a $4,000 loss remains yours. Precautions are still your decision.`;break;
    case 'precautions': {
      if(f.chanceMilestones&&!f.policy)f.policy='none';
      f.precaution=id;const p=lossProbability(s.market.risk,id,a.adaptability),loss=chance(s,p,'insured exposure');f.lossOccurred=loss;
      add({money:-(id==='careful'?180:0)-(loss?POLICIES[f.policy].deductible:0),wellbeing:id==='careful'?-3:4});
      f.insurerPaid=loss?4000-POLICIES[f.policy].deductible:0;
      text=`At a ${Math.round(p*100)}% loss chance, ${loss?`a loss occurs. You pay ${money(POLICIES[f.policy].deductible)}; the insurer pays ${money(f.insurerPaid)}.`:'no loss occurs this period.'} `;
      delay('insurance',`The ${f.policy} arrangement left ${money(POLICIES[f.policy].deductible)} at risk; you chose ${id==='careful'?'preventive care':'less precaution'}.`);
      if(f.chanceMilestones?['bargain','certified'].includes(f.car):f.car!=='transit'){
        const sound=f.car==='certified'?s.market.certifiedSound:s.market.bargainSound;
        const repair=chance(s,sound?.1:.7,'mechanical failure');f.repair=repair;
        const honored=repair&&f.car==='certified'&&chance(s,RULES.warrantyRecovery,'warranty claim');
        if(repair)add({money:honored?0:-2200});text+=repair?(honored?'A separate mechanical failure is covered by your warranty.':'A separate mechanical failure costs you $2,200; collision coverage excludes it.'):'Your transportation has no mechanical repair this period.';
        delay('car',`${f.car} car: ${sound?'sound':'fragile'} underlying type. ${f.inspected?'The inspection was informative, not perfect. ':''}${repair?'A repair was needed.':'No repair was needed.'}`);
      }break;
    }
    case 'housing':
      if(s.market.housing==='rental'){
        const defect=s.market.defect,discount=o.record>=55?400:0;
        add({money:-(id==='cheap'?1100:1550)+discount-(defect?(id==='cheap'?1300:150):0),wellbeing:defect?(id==='cheap'?-8:-2):5});
        text=`Your visible employment record reduces the deposit by ${money(discount)}. ${defect?(id==='cheap'?'A concealed defect leaves you paying $1,300 for repairs.':'A defect is found. The repair clause shifts repair costs to the landlord; enforcement costs $150.'):'No concealed defect emerges during this period.'}`;
      }else if(id==='bank'){
        const repayment=o.record>=55?2180:2400;add({money:2000-1500-repayment,career:10});f.loanLiability=repayment;text=`You receive $2,000, spend $1,500 relocating, and owe ${money(repayment)}. Your financial position includes the full liability immediately; borrowing did not create wealth.`;
      }else {add({money:-800,wellbeing:4});text='You choose the smaller move, pay $800, and keep the current job without taking on a loan.';}
      delay('review',`Recorded performance ${o.record} shaped the terms available to you; hidden reliability was not visible to the counterparty.`);break;
    case 'final':text='Your journey is complete. Compare what you could know when deciding with what happened afterward.';break;
    default: throw Error(`Unknown event ${s.event}`);
  }
  for(const key of Object.keys(a))if(key!=='money')a[key]=clamp(a[key]);
  o.gpa=clamp(o.gpa,0,4);for(const k of ['credential','reference','sample','record'])o[k]=clamp(o[k]);
  f.offerProbability=employerProbability(o,s.market.downturn);
  return {text,next,delayed};
}