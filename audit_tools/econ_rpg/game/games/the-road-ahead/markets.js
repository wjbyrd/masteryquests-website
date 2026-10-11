// Institutions receive explicit observable records, never the full player state.
export function honorsScreen({gpa,reference,credential}) {return gpa>=3.25 && reference+credential>=8;}
export function employerProbability({gpa,credential,reference,sample,internship},downturn=false) {
  return Math.max(.15,Math.min(.85,.12+gpa*.07+credential*.004+reference*.003+sample*.004+internship*.10-(downturn?.14:0)));
}
export function laborPool(wage=48) {
  const applicants=Array.from({length:20},(_,i)=>({type:i<10?'experienced':'developing',productivity:i<10?75:40,reservation:i<10?50+(i%10)*2:32+(i%10)*2}));
  const remaining=applicants.filter(a=>a.reservation<=wage);
  return {wage,total:applicants.length,count:remaining.length,experienced:remaining.filter(a=>a.type==='experienced').length,average:remaining.reduce((v,a)=>v+a.productivity,0)/remaining.length,initialAverage:57.5};
}
export function carPool(verified=false) {
  // Two sound-car owners need a quick sale; four can wait for a quality-sensitive price.
  const soundReservations=[2500,2800,7000,7500,8000,8500];
  const sellers=Array.from({length:12},(_,i)=>({quality:i<6?'sound':'fragile',reservation:i<6?soundReservations[i]:3000}));
  const remaining=sellers.filter(s=>s.reservation<=(verified&&s.quality==='sound'?8500:3000));
  return {total:sellers.length,count:remaining.length,sound:remaining.filter(s=>s.quality==='sound').length};
}
export const POLICIES={full:{premium:900,deductible:200},basic:{premium:300,deductible:1800},none:{premium:0,deductible:4000}};
export function insurancePool() {
  // Risk types privately know expected loss. Buy full cover iff expected payout >= premium.
  const types=[...Array(10).fill(.1),...Array(10).fill(.35)];
  const buyers=types.filter(r=>r*(4000-200)>=900);
  return {total:20,count:buyers.length,high:buyers.filter(r=>r===.35).length,expectedPayout:buyers.reduce((v,r)=>v+r*3800,0)/buyers.length};
}
export function lossProbability(risk,precaution,adaptability) {return Math.max(.03,Math.min(.6,risk+(precaution==='relax'?.10:-.06)-(adaptability-40)*.001));}
