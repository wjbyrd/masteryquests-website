// A single illustrative competitive market drives the graph and feedback.
export const VERSION=2;
export const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
export const initialValues=()=>({d:0,s:0,q:50,p:60,price:60,qs:40,qd:60});
export const demand=(q,d=0)=>100+.8*d-.8*q;
export const supply=(q,s=0)=>20-.8*s+.8*q;
export const market=(d=0,s=0)=>({q:50+(d+s)/2,p:60+.4*(d-s)});
export function atPrice(price,d=0,s=0,type='ceiling'){
  const qd=Math.max(0,(100+.8*d-price)/.8),qs=Math.max(0,(price-20+.8*s)/.8),e=market(d,s);
  const binding=type==='floor'?price>e.p:price<e.p;
  return {qd,qs,binding,shortage:binding?Math.max(0,qd-qs):0,surplus:binding?Math.max(0,qs-qd):0,traded:binding?Math.min(qd,qs):e.q};
}
const shift=(id,title,event,d,s,art)=>({id,title,event,d,s,art,type:'shift'});
export const BANKS=[
  [shift('festival-buyers','A festival fills the square.','A new festival brings more berry buyers to Linden at every price. Growers’ costs and capacity are unchanged.',1,0,'festival'),
   shift('recipe-buzz','The recipe everyone wants.','A popular local recipe makes berries more desirable at every price. Nothing has changed for growers.',1,0,'festival'),
   shift('apple-sale','A rival fruit goes on sale.','Apples, a substitute for berries, become cheaper. Buyers want fewer berries at every price. Growers’ costs and capacity are unchanged.',-1,0,'quiet'),
   shift('cancelled-fair','A quieter weekend.','The county fair is cancelled. Fewer visiting buyers want berries at every price. Growing and delivery costs are unchanged.',-1,0,'quiet')],
  [shift('storm-crop','Rain on the harvest.','A storm damages the berry crop. Growers offer fewer crates at every price. Buyers’ preferences and incomes are unchanged.',0,-1,'storm'),
   shift('fuel-costs','The delivery bill climbs.','Higher fuel costs make berry deliveries more expensive. Sellers offer fewer crates at every price. Buyers’ preferences and incomes are unchanged.',0,-1,'truck'),
   shift('bumper-crop','A generous harvest.','Favorable weather produces a bumper berry crop. Growers offer more crates at every price. Buyers’ preferences and incomes are unchanged.',0,1,'orchard'),
   shift('cold-storage','A better way to keep berries.','New cold storage reduces spoilage and sellers’ costs. They offer more berries at every price. Buyers’ preferences and incomes are unchanged.',0,1,'truck')],
  [shift('festival-harvest','A crowd and a bumper crop.','A festival brings more berry buyers, while favorable weather increases the crop available at every price. We do not know the relative sizes of these changes.',1,1,'festival'),
   shift('recipe-storage','Good news on both sides.','A popular recipe increases buyers’ desire for berries. Better cold storage also lowers sellers’ costs. We do not know the relative sizes of these changes.',1,1,'orchard'),
   shift('fair-storm','Two setbacks in one week.','The cancelled fair reduces the number of berry buyers. A storm also damages the crop. We do not know the relative sizes of these changes.',-1,-1,'storm'),
   shift('sale-fuel','Cheaper apples. Costlier deliveries.','Cheaper apples draw buyers away from berries, while higher fuel costs make berry deliveries more expensive. We do not know the relative sizes of these changes.',-1,-1,'truck')],
  [shift('festival-storm','The busiest, hardest weekend.','A festival brings more berry buyers, but a storm damages the crop. We do not know the relative sizes of these changes.',1,-1,'storm'),
   shift('recipe-fuel','Popular berries, costly journeys.','A popular recipe increases buyers’ desire for berries, while higher fuel costs make deliveries more expensive. We do not know the relative sizes of these changes.',1,-1,'festival'),
   shift('sale-harvest','An abundant, quiet market.','Cheaper apples draw buyers away from berries, while favorable weather produces a bumper berry crop. We do not know the relative sizes of these changes.',-1,1,'orchard'),
   shift('fair-storage','Fewer visitors. Better storage.','The cancelled fair reduces the number of berry buyers, while new cold storage reduces sellers’ costs. We do not know the relative sizes of these changes.',-1,1,'quiet')]
];
export const STEP_LABELS=['Demand','Supply','Both together','Opposing shifts','Price control'];
const policies=['ceiling','floor'].flatMap(type=>(type==='ceiling'?[36,40,44]:[76,80,84]).map(price=>({id:type+'-'+price,type,price,art:'policy',title:type==='ceiling'?'A price promise.':'A price guarantee.',event:`Back in the original market, the council sets a ${type==='ceiling'?'maximum':'minimum'} legal price of $${price} per crate. Demand and supply are unchanged. ${type==='floor'?'The council does not buy unsold berries. ':''}How many crates will sellers offer, and how many will buyers want?`})));
export const SCENARIOS=Object.fromEntries([...BANKS.flat(),...policies].map(m=>[m.id,m]));
export const isPolicy=m=>m.type!=='shift';
export const missions=run=>run.plan.map(id=>SCENARIOS[id]);
const randomFor=seed=>()=>{let t=seed=(seed+0x6D2B79F5)>>>0;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return ((t^(t>>>14))>>>0)/4294967296;};
function shuffled(random){const a=[0,1,2,3];for(let i=3;i>0;i--){const j=Math.floor(random()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
export function freshRun(previous=null,seed=Math.floor(Math.random()*4294967296)){
  const random=randomFor(seed),pick=a=>a[Math.floor(random()*a.length)];
  const plan=BANKS.map((bank,i)=>pick(bank.filter(m=>m.id!==previous?.plan[i])).id);
  const prior=SCENARIOS[previous?.plan[4]],type=prior?(prior.type==='ceiling'?'floor':'ceiling'):(random()<.5?'ceiling':'floor');
  plan.push(pick(policies.filter(m=>m.type===type)).id);
  return {version:VERSION,seed,plan,index:0,stage:'mission',bulletinRead:false,values:initialValues(),attempts:[],hints:0,completed:false,records:[],quiz:{index:0,answers:Array.from({length:5},()=>[]),orders:Array.from({length:5},()=>shuffled(random))}};
}
export function missionText(m,index){
  const tag=`0${index+1} · ${STEP_LABELS[index]}`;
  if(isPolicy(m)){
    const ceiling=m.type==='ceiling',a=atPrice(m.price,0,0,m.type),gap=ceiling?'shortage':'surplus';
    return {...m,tag,concept:`Binding price ${m.type} and ${gap}`,task:`Set the ${ceiling?'maximum':'minimum'} price to $${m.price}. Place Qs and Qd on their curves at that price.`,hint:`A price ${m.type} is a horizontal line. At $${m.price}, find supply for Qs and demand for Qd. The legal limit does not shift either curve.`,debrief:`At $${m.price}, sellers offer ${a.qs} crates and buyers want ${a.qd}. The ${gap} is ${a[gap]} crates. With no other intervention, at most ${a.traded} crates trade. ${ceiling?'Some buyers cannot buy all they want.':'With no government purchases, sellers cannot sell all they offer.'}`};
  }
  const both=m.d!==0&&m.s!==0,dir=x=>x>0?'right':'left';
  let concept,debrief;
  if(!m.s){concept='Demand shifts; movement along supply';debrief=`Demand shifts ${dir(m.d)}. Price and quantity ${m.d>0?'rise':'fall'}. Growers move along the unchanged supply curve; supply itself does not shift.`;}
  else if(!m.d){concept='Supply shifts; movement along demand';debrief=`Supply shifts ${dir(m.s)}. Price ${m.s>0?'falls':'rises'} and quantity ${m.s>0?'rises':'falls'}. Buyers move along the unchanged demand curve; demand itself does not shift.`;}
  else if(m.d===m.s){concept='Quantity is predictable; price depends on shift sizes';debrief=`Demand and supply both shift ${dir(m.d)}. Quantity must ${m.d>0?'rise':'fall'}. Price can rise, fall, or stay unchanged, depending on the relative sizes of the shifts. Your graph illustrates one possible price outcome.`;}
  else{concept='Price is predictable; quantity depends on shift sizes';debrief=`Demand shifts ${dir(m.d)} and supply shifts ${dir(m.s)}. Price must ${m.d>0?'rise':'fall'}. Quantity can rise, fall, or stay unchanged, depending on the relative sizes of the shifts. Your graph illustrates one possible quantity outcome.`;}
  return {...m,tag,concept,debrief,task:both?'Shift both curves to show one plausible outcome. Place E₁ at their new intersection.':'Shift the affected curve. Place E₁ at your forecast equilibrium.',hint:`${m.d?`Move demand ${dir(m.d)}.`:'Keep demand at its starting position.'} ${m.s?`Move supply ${dir(m.s)}.`:'Keep supply at its starting position.'} ${both?'The event gives directions, not exact sizes.':''} Place E₁ where your two curves meet.`};
}
const bounds={d:[-30,30],s:[-30,30],q:[0,100],p:[0,120],price:[0,120],qs:[0,100],qd:[0,100]};
const validValues=v=>Object.entries(bounds).every(([k,[lo,hi]])=>Number.isFinite(v?.[k])&&v[k]>=lo&&v[k]<=hi);
const close=(a,b,t=2.5)=>Math.abs(a-b)<=t;
export function check(m,v){
  if(!m||!validValues(v))return {ok:false,code:'invalid',text:'Use the graph controls to enter a valid forecast.'};
  if(!isPolicy(m)){
    for(const [key,name] of [['d','demand'],['s','supply']]){
      if(!m[key]&&v[key]!==0)return {ok:false,code:'wrong-curve',text:`This event does not shift ${name}. Return ${name} to its starting position.`};
      if(m[key]&&Math.sign(v[key])!==m[key])return {ok:false,code:'direction',text:`The event shifts ${name} ${m[key]>0?'right':'left'}. At every price, ${name==='demand'?'buyers want':'sellers offer'} ${m[key]>0?'more':'fewer'} crates.`};
    }
    const e=market(v.d,v.s),direction=(actual,placed,start)=>actual===start?close(placed,start,.5):Math.sign(actual-start)===Math.sign(placed-start);
    if(!close(v.q,e.q)||!close(v.p,e.p)||!direction(e.q,v.q,50)||!direction(e.p,v.p,60))return {ok:false,code:'intersection',text:'Your shifts fit the event. Move E₁ to the intersection of your current curves, where quantity supplied equals quantity demanded.'};
    return {ok:true,code:'correct',text:'Forecast accepted. Your curves and equilibrium tell the same economic story.'};
  }
  if(v.d!==0||v.s!==0)return {ok:false,code:'wrong-curve',text:'The legal price does not shift either curve. Return both curves to their starting positions.'};
  if(!close(v.price,m.price,.01))return {ok:false,code:'price',text:`The council’s ${m.type==='ceiling'?'maximum':'minimum'} is $${m.price} per crate. Set the price line to $${m.price}.`};
  const a=atPrice(m.price,0,0,m.type);
  if(close(v.qs,a.qd)&&close(v.qd,a.qs))return {ok:false,code:'swapped',text:'Your quantities are reversed. Qs belongs on the upward-sloping supply curve; Qd belongs on the downward-sloping demand curve.'};
  if(!close(v.qs,a.qs)||!close(v.qd,a.qd))return {ok:false,code:'quantities',text:`Read each curve at $${m.price}. Place Qs where the price line meets supply, and Qd where it meets demand.`};
  return {ok:true,code:'correct',text:`Forecast accepted. This price ${m.type} creates a ${m.type==='ceiling'?'shortage':'surplus'}, not a new market-clearing equilibrium.`};
}
export function quizQuestions(run){
  const [d,s,b,o,p]=missions(run),up=d.d>0,ceiling=p.type==='ceiling';
  return [
    {prompt:'Which market change follows from this news?',options:['Demand shifted right; price and quantity rose.','Demand shifted left; price and quantity fell.','Only supply shifted.','The change in price caused demand to shift.'],correct:up?0:1,explanation:missionText(d,0).debrief},
    {prompt:'Why did the quantity buyers purchased change?',options:['Buyers moved along unchanged demand as supply shifted.','Demand shifted because the price changed.','Every quantity change is a shift of both curves.','The demand curve became vertical.'],correct:0,explanation:missionText(s,1).debrief},
    {prompt:'What can you conclude without knowing the sizes of the changes?',options:[`Quantity ${b.d>0?'rises':'falls'}; price depends on the relative shift sizes.`,`Both price and quantity must ${b.d>0?'rise':'fall'}.`,'Price must stay unchanged.','Nothing can be predicted about quantity.'],correct:0,explanation:missionText(b,2).debrief},
    {prompt:'Which outcome is certain from this news alone?',options:[`Price ${o.d>0?'rises':'falls'}; quantity depends on the relative shift sizes.`,'Neither price nor quantity has a predictable direction.','Quantity must stay unchanged.',`Price must ${o.d>0?'fall':'rise'} and quantity must rise.`],correct:0,explanation:missionText(o,3).debrief},
    {prompt:'What limits trade under this price rule?',options:[ceiling?'A shortage: sellers offered fewer crates than buyers wanted.':'A surplus: buyers wanted fewer crates than sellers offered.','The price rule shifted both curves.','The council automatically bought every unsold crate.',ceiling?'A surplus: sellers offered more than buyers wanted.':'A shortage: buyers wanted more than sellers offered.'],correct:0,explanation:missionText(p,4).debrief}
  ];
}
export function answerQuiz(run,choice){
  const i=run.quiz.index,answers=run.quiz.answers[i];
  if(run.stage!=='quiz'||!Number.isInteger(choice)||choice<0||choice>3||answers.some(a=>a.correct||a.choice===choice))return false;
  answers.push({choice,correct:choice===quizQuestions(run)[i].correct});return true;
}
export function advanceQuiz(run){
  if(run.stage!=='quiz'||!run.quiz.answers[run.quiz.index].at(-1)?.correct)return false;
  if(run.quiz.index===4)run.stage='report';else run.quiz.index++;return true;
}
export const allRecords=run=>[...run.records,{id:run.plan[run.index],values:run.values,attempts:run.attempts,hints:run.hints}];
export function restoreRun(v){
  const fail=()=>{throw new Error('Saved market is incomplete or incompatible.');};
  if(v?.bulletinRead!==undefined&&typeof v.bulletinRead!=='boolean')fail();
  if(!v||v.version!==VERSION||!Number.isInteger(v.seed)||!Array.isArray(v.plan)||v.plan.length!==5||!BANKS.every((bank,i)=>bank.some(m=>m.id===v.plan[i]))||!policies.some(m=>m.id===v.plan[4])||!Number.isInteger(v.index)||v.index<0||v.index>4||!['mission','quiz','report'].includes(v.stage)||typeof v.completed!=='boolean'||!Array.isArray(v.records)||v.records.length!==v.index)fail();
  for(const [i,r] of allRecords(v).entries()){
    if(!r||r.id!==v.plan[i]||!validValues(r.values)||!Number.isInteger(r.hints)||r.hints<0||!Array.isArray(r.attempts))fail();
    for(const a of r.attempts)if(!validValues(a?.values)||typeof a.ok!=='boolean'||typeof a.code!=='string'||check(SCENARIOS[r.id],a.values).ok!==a.ok)fail();
    if((i<v.index||v.completed)&&(!r.attempts.at(-1)?.ok||!check(SCENARIOS[r.id],r.values).ok))fail();
    if(i===v.index&&!v.completed&&r.attempts.some(a=>a.ok))fail();
  }
  if(v.stage!=='mission'&&(v.index!==4||!v.completed))fail();
  const q=v.quiz,questions=quizQuestions(v);
  if(!q||!Number.isInteger(q.index)||q.index<0||q.index>4||!Array.isArray(q.answers)||q.answers.length!==5||!Array.isArray(q.orders)||q.orders.length!==5)fail();
  for(let i=0;i<5;i++){
    if(!Array.isArray(q.orders[i])||q.orders[i].length!==4||[...q.orders[i]].sort().join('')!=='0123'||!Array.isArray(q.answers[i]))fail();
    const seen=new Set();
    for(const [j,a] of q.answers[i].entries()){
      if(!Number.isInteger(a?.choice)||a.choice<0||a.choice>3||seen.has(a.choice)||a.correct!==(a.choice===questions[i].correct)||(a.correct&&j!==q.answers[i].length-1))fail();seen.add(a.choice);
    }
    if(i<q.index&&!q.answers[i].at(-1)?.correct||i>q.index&&q.answers[i].length||v.stage==='mission'&&q.answers[i].length)fail();
  }
  if(v.stage==='mission'&&q.index!==0||v.stage==='report'&&(q.index!==4||!q.answers[4].at(-1)?.correct))fail();
  // Earlier v2 saves already opened the forecast board. Keep their place.
  return {...structuredClone(v),bulletinRead:v.bulletinRead??true};
}
