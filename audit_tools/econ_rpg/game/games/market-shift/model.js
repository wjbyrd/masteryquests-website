// One illustrative competitive-market model drives the graph and its feedback.
export const VERSION=1;
export const clamp=(n,min,max)=>Math.max(min,Math.min(max,n));
export const initialValues=()=>({d:0,s:0,q:50,p:60,ceiling:60,qs:40,qd:60});
export const demand=(q,d=0)=>100+.8*d-.8*q;
export const supply=(q,s=0)=>20-.8*s+.8*q;
export function market(d=0,s=0){return {q:50+(d+s)/2,p:60+.4*(d-s)};}
export function atPrice(p,d=0,s=0){
  const qd=Math.max(0,(100+.8*d-p)/.8),qs=Math.max(0,(p-20+.8*s)/.8);
  const equilibrium=market(d,s);
  const binding=p<equilibrium.p;
  return {qd,qs,shortage:binding?Math.max(0,qd-qs):0,traded:binding?Math.min(qd,qs):equilibrium.q,binding};
}
export const MISSIONS=[
  {id:'harvest',tag:'01 · The harvest',title:'Rain on the harvest.',event:'A storm damages the berry crop. Growers bring fewer crates to market at every price. Buyers’ preferences and incomes are unchanged.',task:'Shift the affected curve, then place E₁ at your forecast equilibrium.',concept:'Supply shifts; movement along demand',hint:'The event changes what sellers can offer at every price. Keep buyers’ demand curve in place. At the same price, the new supply curve should show fewer crates.',debrief:'A smaller harvest shifts supply left. Price rises and the quantity traded falls. Buyers move along the unchanged demand curve; demand itself has not fallen.'},
  {id:'festival',tag:'02 · The festival',title:'A crowd comes to town.',event:'A new festival attracts more buyers for berries at every price. Growers’ costs and capacity have not changed. This is a fresh market, starting from the original curves.',task:'Build the new demand-and-supply picture. Place E₁ where the market clears.',concept:'Demand shifts; movement along supply',hint:'More buyers want berries at every price. Change demand, keeping supply in place. Higher price and higher quantity can occur together when demand shifts.',debrief:'More buyers shift demand right. Price and quantity traded rise. Growers respond by moving along the unchanged supply curve; the supply curve does not shift.'},
  {id:'ceiling',tag:'03 · The council',title:'A price promise.',event:'Back in the original market, the council sets a maximum legal price of $40 per crate. Demand and supply are unchanged. How many crates will sellers offer, and how many will buyers want?',task:'Set the price ceiling to $40. Move Qs and Qd to the quantities at that price.',concept:'Binding price ceiling and shortage',hint:'A price ceiling is a horizontal line. At $40, find its intersection with supply for Qs and with demand for Qd. A lower legal price does not move either curve.',debrief:'At $40, sellers offer 25 crates while buyers want 75. The shortage is 50 crates. With no other intervention, at most 25 crates trade. Some buyers pay less if they obtain berries; others cannot buy all they want.'}
];
const close=(a,b,tolerance=2.5)=>Math.abs(a-b)<=tolerance;
export function check(index,v){
  if(!Number.isInteger(index)||index<0||index>=MISSIONS.length||Object.values(v).some(x=>!Number.isFinite(x)))return {ok:false,code:'invalid',text:'Use the graph controls to enter a valid forecast.'};
  if(index<2){
    if(index===0&&Math.abs(v.d)>.01)return {ok:false,code:'wrong-curve',text:'You moved demand. The storm changed the crop available to sellers; buyers’ preferences and incomes stayed the same. Return demand to its starting position.'};
    if(index===1&&Math.abs(v.s)>.01)return {ok:false,code:'wrong-curve',text:'You moved supply. The festival brought buyers, while growers’ costs and capacity stayed the same. Return supply to its starting position.'};
    if(index===0&&v.s>=0)return {ok:false,code:'direction',text:'At any given price, growers now offer fewer crates. Move supply left of its starting position.'};
    if(index===1&&v.d<=0)return {ok:false,code:'direction',text:'At any given price, more berries are wanted. Move demand right of its starting position.'};
    const e=market(v.d,v.s);
    const directionFits=v.p>60&&(index===0?v.q<50:v.q>50);
    if(!directionFits||!close(v.q,e.q)||!close(v.p,e.p))return {ok:false,code:'intersection',text:'Your curve shift fits the event. Move E₁ to the intersection of the two current curves, where quantity supplied equals quantity demanded.'};
    return {ok:true,code:'correct',text:'Forecast accepted. Your curve and equilibrium tell the same economic story.'};
  }
  if(Math.abs(v.ceiling-40)>.01)return {ok:false,code:'ceiling',text:'The council’s maximum is $40 per crate. Move the price ceiling to $40; the original equilibrium price is $60.'};
  const actual=atPrice(v.ceiling);
  if(close(v.qs,actual.qd)&&close(v.qd,actual.qs))return {ok:false,code:'swapped',text:'Your quantities are reversed. Qs belongs on the upward-sloping supply curve; Qd belongs on the downward-sloping demand curve.'};
  if(!close(v.qs,actual.qs)||!close(v.qd,actual.qd))return {ok:false,code:'quantities',text:'Read each curve at $40. Place Qs where the price line meets supply, and Qd where it meets demand.'};
  return {ok:true,code:'correct',text:'Forecast accepted. The maximum price creates a shortage, not a new market-clearing equilibrium.'};
}
export const freshRun=()=>({version:VERSION,index:0,values:initialValues(),attempts:[],hints:0,completed:false,records:[]});
export function restoreRun(value){
  if(!value||value.version!==VERSION||!Number.isInteger(value.index)||value.index<0||value.index>2||typeof value.completed!=='boolean'||!Array.isArray(value.records)||value.records.length!==value.index||!Array.isArray(value.attempts)||!Number.isInteger(value.hints)||value.hints<0)throw new Error('Saved forecast is not compatible.');
  const bounds={d:[-30,30],s:[-30,30],q:[0,100],p:[0,120],ceiling:[0,120],qs:[0,100],qd:[0,100]};
  for(const [key,[min,max]] of Object.entries(bounds))if(!Number.isFinite(value.values?.[key])||value.values[key]<min||value.values[key]>max)throw new Error('Saved graph values are invalid.');
  for(const [i,record] of value.records.entries())if(!record||record.id!==MISSIONS[i].id||!Array.isArray(record.attempts)||!record.attempts.length||!record.attempts.at(-1).ok||!Number.isInteger(record.hints)||record.hints<0||!record.values||!check(i,record.values).ok)throw new Error('Saved notebook is invalid.');
  for(const attempt of [...value.attempts,...value.records.flatMap(r=>r.attempts||[])])if(!attempt||typeof attempt.ok!=='boolean'||typeof attempt.code!=='string'||!attempt.values)throw new Error('Saved attempts are invalid.');
  if(value.completed&&!check(value.index,value.values).ok)throw new Error('Saved completion is inconsistent.');
  return structuredClone(value);
}
