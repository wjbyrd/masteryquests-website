export const VERSION=1;
export const CHAPTERS=[
  {id:'demand',name:'Price & the customer',short:'The customer',description:'Follow demand. Discover what happens to receipts.',art:'cafe'},
  {id:'related',name:'A connected marketplace',short:'The neighborhood',description:'Trace the effects of other prices and household income.',art:'neighborhood'},
  {id:'supply',name:'Can producers respond?',short:'The workshop',description:'Explore production, time, and the limits of response.',art:'workshop'}
];
export const clamp=(x,a,b)=>Math.min(b,Math.max(a,x));
export const money=x=>Number.isFinite(x)?'$'+x.toLocaleString('en-US',{maximumFractionDigits:2}):'—';
export const fmt=x=>Number.isFinite(x)?x.toLocaleString('en-US',{maximumFractionDigits:2}):'—';
export const midpoint=(a,b)=>a===b?0:2*(b-a)/(a+b);
export function elasticity(p0,q0,p1,q1,signed=false){
  const dp=midpoint(p0,p1),dq=midpoint(q0,q1);
  if(Math.abs(dp)<1e-10)return Math.abs(dq)<1e-10?null:Infinity;
  const e=dq/dp;return signed?e:Math.abs(e);
}
export const category=e=>e===null?'No change to compare':e===Infinity?'Perfectly elastic':Math.abs(e)<1e-8?'Perfectly inelastic':Math.abs(Math.abs(e)-1)<1e-6?'Unit elastic':Math.abs(e)>1?'Elastic':'Inelastic';
const rng=seed=>()=>{let t=seed=(seed+0x6D2B79F5)>>>0;t=Math.imul(t^(t>>>15),t|1);t^=t+Math.imul(t^(t>>>7),t|61);return((t^(t>>>14))>>>0)/4294967296;};
export function order(seed,length=4){const r=rng(seed),a=Array.from({length},(_,i)=>i);for(let i=a.length-1;i;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]];}return a;}
const revenueOptions=['Revenue rises.','Revenue falls.','Revenue stays the same.'];
const responseOptions=['Quantity changes proportionally more than price.','Quantity changes proportionally less than price.','Quantity and price change proportionally equally.','Quantity does not change.'];
function choice(prompt,options,correct){return {prompt,options,correct};}
export function curriculum(seed){
  const random=rng(seed),pick=a=>a[Math.floor(random()*a.length)],p0=pick([12,16,20]),q0=pick([80,100,120]);
  const shop=pick(['Juniper Café','Linden Bookshop','Willow Kitchen']),product=shop.includes('Book')?'book bundles':shop.includes('Kitchen')?'lunch boxes':'coffee bundles';
  const up=pick([false,true]),factor=up?1.25:.8;
  const base=(id,chapter,mission,title,model,more={})=>({id,chapter,mission,title,model,p0,q0,art:CHAPTERS.find(c=>c.id===chapter).art,unit:'orders per day',...more});
  const own=(id,mission,title,e)=>{
    const f=mission===2?1/factor:factor,target=p0*f,raise=target>p0,elastic=e>1;
    const audience=e===1?'a separate subscription audience':elastic?'weekend shoppers with many alternatives':'regular customers who especially value this offering';
    return base(id,'demand',mission,title,'demand',{e,target,story:`${shop} studies ${audience} for its ${product}. At ${money(p0)}, its model predicts ${q0} daily orders; at ${money(target)}, it predicts ${fmt(q0*f**-e)}. These are daily averages. Tastes, income, and other prices stay fixed within this comparison.`,task:`Test a price of ${money(target)}.`,prediction:choice('What will happen to daily revenue?',revenueOptions,e===1?2:(raise!==elastic?0:1)),debrief:e===1?'This curved demand relationship has unit elasticity throughout. Every price–quantity pair produces the same revenue. A changed rectangle need not have a changed area.':elastic?'The percentage quantity response outweighs the percentage price change. Price and total revenue move in opposite directions over this interval.':'The percentage quantity response is smaller than the percentage price change. Price and total revenue move in the same direction over this interval.'});
  };
  const rounds=[own('responsive',1,'The weekend offer',1.6),own('loyal',2,'A different kind of customer',.45),own('unit-demand',3,'Same takings, different crowd',1)];
  rounds.push(base('linear','demand',4,'Find the turning point','linear',{p0:p0*1.5,q0:q0*.5,anchorP:p0,anchorQ:q0,target:p0,story:`The town gallery has tested a straight-line demand model. You can explore the entire affordable range. Its current price is ${money(p0*1.5)} and it sells ${q0*.5} visits per day. Find the price with the greatest total receipts.`,task:'Find the revenue-maximizing price.',unit:'visits per day',prediction:choice('At the revenue peak, point elasticity will be…',['Elastic.','Inelastic.','Unit elastic.','Zero.'],2),debrief:'On this straight demand line, slope stays constant while elasticity changes. The upper portion is elastic; the lower portion is inelastic. Revenue peaks at the unit-elastic midpoint. Moving away from that point lowers revenue; it is not a constant-revenue curve.'}));
  rounds.push(base('fixed-demand','demand',5,'The fixed order','vertical-demand',{target:p0*1.25,story:`In this deliberately extreme model, a standing order remains ${q0} units at every displayed price. The order quantity does not respond to price. Use the model to investigate its revenue implications.`,task:`Raise the price to ${money(p0*1.25)}.`,prediction:choice('What will happen to revenue?',revenueOptions,0),debrief:'Perfectly inelastic demand is vertical. Quantity does not change, so elasticity is zero. Higher price raises revenue for this fixed quantity. This is an idealized case, not a claim that real necessities have zero responsiveness.'}));
  rounds.push(base('open-demand','demand',5,'A price customers can match','horizontal-demand',{target:p0,story:`An individual seller offers a standardized product that buyers can obtain elsewhere for ${money(p0)}. In the price-taking idealization, a higher asking price loses all buyers. At the matching price, demand alone does not pin down a unique sales quantity.`,task:'Set the highest price at which buyers remain willing to buy.',prediction:choice('What happens if this seller asks more than the going price?',['It sells the same quantity.','Its quantity demanded becomes zero.','Market-wide demand shifts right.','It must receive more revenue.'],1),debrief:'The horizontal line represents perfectly elastic demand facing this seller. Above the going price, quantity demanded is zero. At that price, actual sales require information beyond this demand curve. We do not invent a finite quantity or revenue from price alone.'}));
  const related=(id,mission,title,kind,e,x0,x1,context)=>{
    const dx=midpoint(x0,x1),q1=Math.round(q0*(2+e*dx)/(2-e*dx));
    const income=kind==='income';
    const classification=income?(e<0?'Inferior':e>1?'Normal · luxury-like':'Normal · necessity-like'):(e>0?'Substitutes':'Complements');
    const options=income?['Normal · necessity-like','Normal · luxury-like','Inferior','No income response']:['Substitutes','Complements','Unrelated in this model'];
    return base(id,'related',mission,title,'shift',{kind,e,x0,x1,q1,target:q1,classification,story:`${context} The business keeps its own price at ${money(p0)}. Its isolated observations are ${q0} orders before and ${q1} after. Other demand conditions are unchanged.`,task:`Place the new demand point at ${q1} orders, keeping own price at ${money(p0)}.`,prediction:choice(income?'How does this good respond to income?':'What relationship does the evidence show?',options,income?(e<0?2:e>1?1:0):(e>0?0:1)),debrief:income?(e<0?'Demand moves opposite income: this is an inferior good in the model. “Inferior” describes an income response, not product quality.':e>1?'Demand moves with income and more than proportionally: this is a normal good with a luxury-like income response.':'Demand moves with income but less than proportionally: this is a normal good with a necessity-like income response.'):(e>0?'The related price and this good’s demand move in the same direction. Positive cross-price elasticity identifies substitutes in these observations.':'The related price and this good’s demand move in opposite directions. Negative cross-price elasticity identifies complements in these observations.')});
  };
  const x1=up?15:10,x0=up?12:12.5;
  rounds.push(related('substitutes',6,'A rival changes its price','cross',.8,x0,x1,`A nearby café changes its meal price from ${money(x0)} to ${money(x1)}.`));
  rounds.push(related('complements',6,'The whole afternoon out','cross',-.8,x0,x1,`The riverside gallery changes admission from ${money(x0)} to ${money(x1)}. The neighboring café tracks its own orders.`));
  for(const [id,title,e,context] of [['necessity','The everyday basket',.55,'Households adjust orders of an everyday grocery basket.'],['luxury','A little extra',1.5,'Households adjust bookings for a premium workshop.'],['inferior','A different choice',-.7,'Households adjust orders of a basic refurbished bundle.']])rounds.push(related(id,7,title,'income',e,100,up?120:80,`${context} The household income index changes from 100 to ${up?120:80}.`));
  const supply=(id,mission,title,model,e,context)=>base(id,'supply',mission,title,model,{e,target:p0*factor,unit:'pieces per week',story:`${context} Start at ${money(p0)} and ${q0} pieces per week. The market price changes to ${money(p0*factor)}; other production conditions remain fixed within this comparison.`,task:`Move to the new price of ${money(p0*factor)}.`,prediction:choice('How will the percentage quantity response compare with price?',responseOptions,model==='vertical-supply'?3:e===1?2:e>1?0:1),debrief:model==='vertical-supply'?'Perfectly inelastic supply is vertical: output is fixed throughout the displayed price range. This is a limiting case of no quantity response.':e===1?'This supply line passes through the origin. Price and quantity change in equal percentages; supply is unit elastic throughout. Unlike constant unit-elastic demand, it is a straight line.':e>1?'With time to adjust equipment and staffing, this model has a larger percentage output response than price response. Its supply is elastic.':'With existing equipment and shifts, this model has a smaller percentage output response than price response. Its supply is inelastic.'});
  rounds.push(supply('short-run',8,'This week at the kiln','supply',.35,'Linden Ceramics cannot change its equipment this week. It can only adjust use of its existing workshop.'));
  rounds.push(supply('long-run',8,'Time to adapt','supply',1.5,'Compare a longer adjustment period at Linden Ceramics. It can change its equipment and staffing. The baseline price and output are the same as in the short-run comparison.'));
  rounds.push(supply('unit-supply',9,'A proportional response','supply',1,'A neighboring workshop follows the displayed proportional supply relationship.'));
  for(const r of rounds.filter(r=>r.model==='supply'))r.story+=` Its production study forecasts an average of ${fmt(r.q0*(r.target/r.p0)**r.e)} pieces per week at the new price.`;
  rounds.push(supply('fixed-supply',9,'Only so many spaces','vertical-supply',0,'For this comparison, the town has a fixed number of workshop spaces. No additional spaces can be made available at any displayed price.'));
  const fixed=rounds.at(-1);fixed.unit='spaces available';fixed.story=`The town has exactly ${q0} workshop spaces available for daily rental. In this idealized case, availability is fixed at every displayed rental price. The price per space changes from ${money(p0)} to ${money(p0*factor)}.`;
  rounds.push(base('open-supply','supply',9,'Ready at the going price','horizontal-supply',{target:q0*1.5,unit:'pieces per week',story:`An idealized supplier can fulfill additional orders at a constant price of ${money(p0)} throughout the displayed range. Compare ${q0} and ${q0*1.5} pieces per week.`,task:`Place the new order at ${q0*1.5} pieces, without changing price.`,prediction:choice('How much must price change to obtain the larger order?',['Price must rise proportionally.','Price must fall.','Price can remain unchanged.','The supply curve must shift.'],2),debrief:'Perfectly elastic supply is horizontal. Quantity can change at the same price; the quantity response divided by a zero price change has infinite elasticity. The displayed order is specified by the task, not determined by the supply curve alone.'}));
  return rounds;
}
export const isShift=r=>r.model==='shift';
export function limits(r){
  const p=r.anchorP||r.p0,q=r.anchorQ||r.q0;
  if(isShift(r))return {min:0,max:Math.ceil(r.q0*2),step:1,key:'q',label:'Orders at the unchanged own price'};
  if(r.model==='horizontal-supply')return {min:r.q0*.5,max:r.q0*2,step:1,key:'q',label:'Quantity supplied'};
  return {min:r.model==='linear'?p*.1:p*.5,max:r.model==='linear'?p*1.9:p*1.5,step:p/100,key:'p',label:r.chapter==='supply'?'Market price':'Price'};
}
export function quantity(r,p){
  if(isShift(r))return null;
  if(r.model==='linear')return Math.max(0,2*r.anchorQ-(r.anchorQ/r.anchorP)*p);
  if(r.model.startsWith('vertical'))return r.q0;
  if(r.model==='horizontal-demand')return p>r.p0+1e-7?0:null;
  if(r.model==='horizontal-supply')return null;
  return r.q0*(p/r.p0)**(r.chapter==='supply'?r.e:-r.e);
}
export function initialValue(r){return isShift(r)||r.model==='horizontal-supply'?r.q0:r.model==='horizontal-demand'?r.p0*1.25:r.p0;}
export function observation(r,value){
  const q=isShift(r)||r.model==='horizontal-supply'?value:quantity(r,value),p=isShift(r)||r.model==='horizontal-supply'?r.p0:value;
  const e=isShift(r)?elasticity(r.x0,r.q0,r.x1,q,true):elasticity(r.p0,r.q0,p,q);
  const point=isShift(r)?null:r.model==='linear'?(q===0?Infinity:(r.anchorQ/r.anchorP)*p/q):r.model==='demand'||r.model==='supply'?r.e:r.model.startsWith('vertical')?0:Infinity;
  return {p,q,revenue:Number.isFinite(q)?p*q:null,e:Number.isFinite(q)?e:null,point};
}
export function check(r,value){
  const l=limits(r);if(!Number.isFinite(value)||value<l.min-1e-7||value>l.max+1e-7)return {ok:false,text:'Keep your point inside the displayed graph range.'};
  const tolerance=l.key==='q'?.51:r.p0*.006;
  if(Math.abs(value-r.target)>tolerance)return {ok:false,text:r.model==='linear'?'Keep comparing revenue areas. Look for the largest rectangle and the peak of the revenue curve.':isShift(r)?`Use the observed ${r.q1} orders at the unchanged own price.`:r.model==='horizontal-demand'?'Find the highest price that does not exceed the alternatives available to buyers.':`Match the brief: ${l.key==='p'?money(r.target):fmt(r.target)+' '+r.unit}.`};
  return {ok:true,text:r.debrief};
}
export function hint(r){return r.model==='linear'?'Try the midpoint between the two demand intercepts. Compare revenue on either side.':isShift(r)?'Keep the point on the horizontal own-price guide. Use the observed after quantity.':r.model==='horizontal-demand'?'The going price is the height of the horizontal demand line.':`Use the ${limits(r).key==='p'?'price':'quantity'} slider or the number field to reach the requested value.`;}
export function freshRun(scope='all',seed=Math.floor(Math.random()*4294967296)){
  if(!['all',...CHAPTERS.map(c=>c.id)].includes(scope))throw Error('Unknown chapter');
  return {version:VERSION,seed:seed>>>0,scope,chapter:scope==='all'?'demand':scope,index:0,stage:'brief',value:null,prediction:null,attempts:[],hints:0,records:[],quizzes:{},quizIndex:0,quizAnswers:[],complete:false};
}
export const chapterRounds=run=>curriculum(run.seed).filter(r=>r.chapter===run.chapter);
export const current=run=>chapterRounds(run)[run.index];
export function predict(run,answer){const r=current(run);if(run.stage!=='brief'||!Number.isInteger(answer)||answer<0||answer>=r.prediction.options.length)return false;run.prediction=answer;run.value=initialValue(r);run.stage='work';return true;}
export function submit(run){if(run.stage!=='work')return false;const result=check(current(run),run.value);run.attempts.push({value:run.value,ok:result.ok});if(result.ok)run.stage='debrief';return result;}
export function nextRound(run){
  if(run.stage!=='debrief')return false;
  const r=current(run);run.records.push({id:r.id,value:run.value,prediction:run.prediction,predictionCorrect:run.prediction===r.prediction.correct,attempts:run.attempts.map(a=>({...a})),hints:run.hints});
  if(run.index+1<chapterRounds(run).length){run.index++;run.stage='brief';run.prediction=null;run.value=null;run.attempts=[];run.hints=0;}else{run.stage='quiz';run.quizIndex=0;run.quizAnswers=[];}
  return true;
}
export function questions(run,chapter=run.chapter){
  const rounds=curriculum(run.seed),r=id=>rounds.find(x=>x.id===id),from=(id,prompt,options,correct,explanation)=>({id,context:r(id).story,round:r(id),value:r(id).target,prompt,options,correct,explanation});
  if(chapter==='demand')return [
    from('responsive','What explains the revenue change?', ['The proportional quantity response outweighs the price response.','Any discount increases revenue.','A price change shifts demand.','Revenue and profit are identical.'],0,'Elastic demand makes the percentage quantity response larger than the percentage price response over this comparison.'),
    from('loyal','Did the business’s own-price change shift its demand curve?',['Yes, every price change shifts demand.','No. It moved along the unchanged curve.','Yes, but only if revenue rose.','Only because quantity changed.'],1,'Own price changes quantity demanded along a curve. Other demand conditions were held fixed.'),
    from('linear','Why does elasticity change along this straight line?',['Its slope gets steeper.','Prices stop affecting quantity.','The percentage bases change even though slope stays constant.','Revenue is profit.'],2,'Elasticity uses percentage changes, not simply the slope. Point elasticity is one at the revenue peak.'),
    from('unit-demand','How does this curve differ from the straight-line mission?',['Every point on this curve has the same revenue.','Every demand curve has constant revenue.','This curve must be a 45-degree straight line.','Quantity stays fixed.'],0,'Constant unit-elastic demand is curved and maintains P × Q. A straight demand curve has only one unit-elastic point.')
  ];
  if(chapter==='related')return [
    from('substitutes','What sign does cross-price elasticity have in these observations?',['Negative.','Zero.','Positive.','Its sign cannot be used.'],2,'Substitutes have positive cross-price elasticity: the related price and this good’s demand move together.'),
    from('complements','Why is this a demand shift rather than an own-price movement?',['The café changed its own price.','The related price changed while the café’s own price stayed fixed.','All quantity changes shift demand.','The supply curve became horizontal.'],1,'A complementary good’s price changes demand at each own price. The good’s own price stays fixed in these observations.'),
    from('inferior','What does “inferior” establish here?',['Poor product quality.','An unethical purchase.','Demand moves opposite income.','Demand is perfectly inelastic.'],2,'Inferior describes the direction of the income response. It is not a judgment about quality or buyers.'),
    from('luxury','Which statement best describes the measured income response?',['Normal and more than proportional.','Normal and less than proportional.','Inferior.','A negative cross-price elasticity.'],0,'Positive income elasticity above one indicates a luxury-like normal-good response in this model.')
  ];
  if(chapter==='supply')return [
    from('long-run','Why is the long-run response larger in this model?',['Producers have more time to change capacity.','Demand must have shifted.','The law of supply reverses.','A high price automatically makes supply perfectly elastic.'],0,'The model allows more production adjustments over time. This comparison holds the starting price and output constant.'),
    from('unit-supply','Which shape has constant unit elasticity of supply?',['Any horizontal line.','Any vertical line.','A straight supply line through the origin.','Every upward-sloping line.'],2,'A line through the origin keeps price and quantity proportional. Not every straight supply line has unit elasticity.'),
    from('fixed-supply','What is supply elasticity when price changes but output does not?',['One.','Zero.','Infinity.','Negative one.'],1,'A zero percentage quantity response gives zero elasticity: perfectly inelastic supply.'),
    from('open-supply','Does this horizontal supply curve alone tell us how many units will trade?',['Yes, always the largest shown quantity.','Yes, always zero.','No. Quantity also requires demand or a specified order.','Yes, multiply price by elasticity.'],2,'The task supplies the order quantity. A horizontal curve alone does not identify the quantity traded.')
  ];
  return [
    {id:'transfer-price',context:'A new seller raises its own price from $10 to $12. Purchases fall from 100 to 90. Other conditions are unchanged.',prompt:'Which interpretation fits this evidence?',options:['Demand shifted and revenue fell.','Demand is inelastic over the interval, and revenue rose.','Demand is elastic, and revenue rose.','Profit must have risen.'],correct:1,explanation:'Revenue rises from $1,000 to $1,080. Midpoint demand elasticity is about 0.58. This is movement along demand; costs are unknown.'},
    {id:'transfer-related',context:'A bicycle shop keeps its own prices fixed. A nearby bike-hire service raises its prices, and bicycle purchases increase.',prompt:'Which relationship is consistent with those isolated observations?',options:['Negative income elasticity.','Perfectly inelastic supply.','Positive cross-price elasticity: substitutes.','Negative cross-price elasticity: complements.'],correct:2,explanation:'The related price and bicycle demand rise together, which identifies a positive cross-price response in these observations.'},
    {id:'transfer-income',context:'Income rises by 10% using midpoint percentages. Demand for an offering falls by 5%, with own price and other conditions fixed.',prompt:'What is its income elasticity?',options:['−0.5: inferior.','+0.5: normal.','−2: a complement.','+2: luxury-like.'],correct:0,explanation:'−5% ÷ 10% = −0.5. The negative income response identifies an inferior good in this scenario.'}
  ];
}
export function answerQuiz(run,answer){
  if(!['quiz','final'].includes(run.stage))return false;
  const q=questions(run,run.stage==='final'?'final':run.chapter)[run.quizIndex];
  if(!Number.isInteger(answer)||answer<0||answer>=q.options.length)return false;
  const attempts=run.quizAnswers[run.quizIndex]||=[];
  if(attempts.some(a=>a.correct||a.answer===answer))return false;
  attempts.push({answer,correct:answer===q.correct});return true;
}
export function nextQuestion(run){
  if(!['quiz','final'].includes(run.stage)||!run.quizAnswers[run.quizIndex]?.at(-1)?.correct)return false;
  const key=run.stage==='final'?'final':run.chapter;
  if(run.quizIndex+1<questions(run,key).length){run.quizIndex++;return true;}
  run.quizzes[key]=run.quizAnswers;
  if(key==='final'||run.scope!=='all'){run.stage='report';run.complete=true;}else run.stage='chapterDone';
  return true;
}
export function nextChapter(run){
  if(run.stage!=='chapterDone')return false;
  const i=CHAPTERS.findIndex(c=>c.id===run.chapter);
  if(i===2){run.stage='final';run.quizIndex=0;run.quizAnswers=[];}else{run.chapter=CHAPTERS[i+1].id;run.index=0;run.stage='brief';run.prediction=null;run.value=null;run.attempts=[];run.hints=0;run.quizIndex=0;run.quizAnswers=[];}
  return true;
}
export function restoreRun(data){
  const bad=()=>{throw Error('Unrecognized saved progress');};
  if(!data||data.version!==VERSION||!Number.isInteger(data.seed)||data.seed<0||data.seed>4294967295||!['all',...CHAPTERS.map(c=>c.id)].includes(data.scope)||!CHAPTERS.some(c=>c.id===data.chapter)||!['brief','work','debrief','quiz','chapterDone','final','report'].includes(data.stage))bad();
  if(data.scope!=='all'&&data.scope!==data.chapter)bad();
  const rounds=chapterRounds(data);if(!Number.isInteger(data.index)||data.index<0||data.index>=rounds.length||!Array.isArray(data.records)||!Array.isArray(data.attempts)||!Array.isArray(data.quizAnswers)||!data.quizzes||typeof data.quizzes!=='object'||!Number.isInteger(data.hints)||data.hints<0||typeof data.complete!=='boolean')bad();
  if(!Number.isInteger(data.quizIndex)||data.quizIndex<0||data.quizIndex>=questions(data,data.stage==='final'?'final':data.chapter).length)bad();
  const r=current(data),l=limits(r);
  if(['work','debrief'].includes(data.stage)&&(!Number.isFinite(data.value)||data.value<l.min||data.value>l.max||!Number.isInteger(data.prediction)||data.prediction<0||data.prediction>=r.prediction.options.length))bad();
  const all=curriculum(data.seed),seen=new Set();
  for(const record of data.records){const item=all.find(x=>x.id===record?.id);if(!item||seen.has(record.id)||!Number.isFinite(record.value)||!Array.isArray(record.attempts)||!record.attempts.length||!Number.isInteger(record.prediction)||record.prediction<0||record.prediction>=item.prediction.options.length||!Number.isInteger(record.hints)||record.hints<0)bad();seen.add(record.id);}
  const validAnswers=(answers,key)=>{if(!Array.isArray(answers))bad();const qs=questions(data,key);if(answers.length>qs.length)bad();answers.forEach((attempts,i)=>{if(!Array.isArray(attempts)||attempts.some(a=>!Number.isInteger(a?.answer)||a.answer<0||a.answer>=qs[i].options.length||a.correct!==(a.answer===qs[i].correct)))bad();});};
  validAnswers(data.quizAnswers,data.stage==='final'||(data.stage==='report'&&data.scope==='all')?'final':data.chapter);
  for(const [key,answers] of Object.entries(data.quizzes)){if(!['demand','related','supply','final'].includes(key))bad();validAnswers(answers,key);}
  if(data.stage==='debrief'&&!check(r,data.value).ok)bad();
  return structuredClone(data);
}
