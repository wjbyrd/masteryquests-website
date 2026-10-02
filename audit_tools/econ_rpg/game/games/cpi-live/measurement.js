// Optional applications of the fixed-basket model. Dollar values here are whole dollars.
export const MEASUREMENT = Object.freeze({
  substitution: [
    { id:'proteins', goods:['Beef meal','Chicken meal'], base:[6,4], current:[10,4], context:'Four meals are needed. This household is willing to replace one beef meal with chicken, but wants to keep at least one beef meal.' },
    { id:'fruit', goods:['Apple portion','Pear portion'], base:[2,2], current:[4,2], context:'Four fruit portions are needed. This household is willing to replace one apple portion with a pear, but wants to keep at least one apple portion.' },
    { id:'brands', goods:['Brand A cereal','Brand B cereal'], base:[4,4], current:[8,4], context:'Four cereal boxes are needed. The brands provide comparable servings. This household is willing to switch one Brand A box to Brand B, but wants to keep at least one Brand A box.' },
  ],
  newGoods: [
    { id:'streaming', old:'Existing streaming plan', product:'New streaming service', oldPrice:20, price:12, context:'The new service offers the same shows this household watches, with the same advertising terms.' },
    { id:'transport', old:'Existing commuter pass', product:'New shuttle pass', oldPrice:40, price:30, context:'The new shuttle serves the same commute at suitable times for this household.' },
    { id:'medicine', old:'Existing prescription', product:'New generic medicine', oldPrice:30, price:20, context:'The approved generic has the same active ingredient, strength, and monthly dose for this patient.' },
  ],
  quality: [
    { id:'laptop', product:'Laptop', oldPrice:1000, price:1100, adjustment:150, improvement:'More memory and faster processing' },
    { id:'phone', product:'Phone', oldPrice:500, price:550, adjustment:75, improvement:'Longer battery life and more storage' },
    { id:'washer', product:'Washing machine', oldPrice:800, price:880, adjustment:120, improvement:'Greater capacity and improved energy efficiency' },
  ],
});
export function measurementModel(extension) {
  const s=MEASUREMENT.substitution.find(v=>v.id===extension.ids.substitution);
  const n=MEASUREMENT.newGoods.find(v=>v.id===extension.ids.newGoods);
  const q=MEASUREMENT.quality.find(v=>v.id===extension.ids.quality);
  const base=2*s.base[0]+2*s.base[1], fixed=2*s.current[0]+2*s.current[1];
  const shifted=(2-extension.shift)*s.current[0]+(2+extension.shift)*s.current[1];
  return {s,n,q,base,fixed,shifted,fixedRate:(fixed/base-1)*100,shiftedRate:(shifted/base-1)*100,
    comparable:q.price-q.adjustment,rawRate:(q.price/q.oldPrice-1)*100,adjustedRate:((q.price-q.adjustment)/q.oldPrice-1)*100};
}
function begin(run, old) {
  const round=(old?.round||0)+1;
  const previous=old?.ids||run.previous?.measurementIDs||{};
  let x=(run.seed+Math.imul(round,2654435761))>>>0;
  x=Math.imul(x^(x>>>16),0x45d9f3b)>>>0;
  x=Math.imul(x^(x>>>16),0x45d9f3b)>>>0;
  x=(x^(x>>>16))>>>0;
  const ids=Object.fromEntries(Object.entries(MEASUREMENT).map(([key,pool])=>{
    const available=pool.filter(v=>v.id!==previous[key]);
    x=(Math.imul(1664525,x)+1013904223)>>>0;
    return [key,available[Math.floor(x/2**32*available.length)].id];
  }));
  return {round,ids,episode:'substitution',shift:0,newStep:'basket',solved:false,selected:null,feedback:'',answers:null,attempts:{},hidden:false};
}
// Every accepted interaction is replayed by storage.js; core score and phase never change.
export function measurementAction(run, action, value=null) {
  if(run.phase!=='complete')return run;
  const old=run.extension;
  let ext=old;
  if(action==='open')ext=old?{...old,hidden:false}:begin(run);
  else if(action==='replay'&&old?.episode==='complete')ext=begin(run,old);
  else if(action==='summary'&&old)ext={...old,hidden:true};
  else if(!old||old.hidden)return run;
  else if(action==='shift'&&old.episode==='substitution'&&!old.solved&&[0,1].includes(value)&&value!==old.shift)ext={...old,shift:value,feedback:'',selected:null};
  else if(action==='next'&&old.solved){
    const episode={substitution:'newGoods',newGoods:'quality',quality:'complete'}[old.episode];
    if(!episode)return run;
    ext={...old,episode,solved:false,selected:null,feedback:'',answers:null};
  }else if(action==='answer'&&!old.solved&&old.episode!=='complete'){
    const m=measurementModel(old);
    let correct=false,feedback='',newStep=old.newStep;
    if(old.episode==='substitution'){
      if(!['overstate','same','understate'].includes(value))return run;
      correct=old.shift===1&&value==='overstate';
      feedback=old.shift!==1?'Move one purchase to the relatively cheaper alternative, then compare the costs.':correct?'Substitution bias: the original basket holds quantities fixed. When consumers can maintain suitable consumption by switching toward relatively cheaper goods, it can overstate cost-of-living growth. This substituted bundle is a comparison, not a new or “true” CPI.':'Compare the two next-period costs against the same original base cost. Which comparison rises more?';
    }else if(old.episode==='newGoods'){
      const allowed=old.newStep==='basket'?['insert','wait']:['update','ignore'];
      if(!allowed.includes(value))return run;
      correct=value==='update';
      if(value==='wait'){newStep='opportunity';feedback='Correct. This product has no base-period price or assigned base quantity. Now consider the new purchasing opportunity.';}
      else feedback=correct?'New goods bias: a fixed basket can miss consumer gains before a new option is incorporated. Later basket updates and appropriate index linking can include it; no base-period price has been invented.':value==='insert'?'A direct fixed-basket comparison needs base-period data. The new good did not exist then.':'New products are not excluded forever. Consider how later basket updates can incorporate them.';
    }else{
      if(!value||typeof value!=='object')return run;
      const fields=['comparable','raw','adjusted'];
      if(fields.some(k=>value[k]!==null&&(!Number.isFinite(value[k])||typeof value[k]!=='number')))return run;
      correct=value.comparable===m.comparable&&Math.abs(value.raw-m.rawRate)<.05&&Math.abs(value.adjusted-m.adjustedRate)<.05&&fields.every(k=>value[k]!==null);
      feedback=correct?'Quality change: part of the observed price pays for a better product. CPI attempts to isolate price change from quality change. This explicit dollar adjustment is a simplified analyst estimate; actual quality adjustment is difficult and imperfect.':'Subtract the estimated quality value from the new price. Compare both the raw and comparable prices with the old price; divide each difference by the old price. Use a minus sign for a decline.';
    }
    const key=old.episode==='newGoods'?`newGoods-${old.newStep}`:old.episode;
    ext={...old,newStep,solved:correct,selected:typeof value==='string'?value:null,answers:typeof value==='object'?value:null,feedback,attempts:{...old.attempts,[key]:(old.attempts[key]||0)+1}};
  }else return run;
  if(JSON.stringify(ext)===JSON.stringify(old))return run;
  return {...run,extension:ext,history:[...run.history,{action:'measurement',value:{action,value}}]};
}
