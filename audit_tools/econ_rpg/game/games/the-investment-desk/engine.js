import {SECOND,BUDGET,RATE,WAIT_FEE,BULLETIN_ACCURACY} from './data.js';
import {npv,bestPortfolio,rng} from './finance.js';
import {generateFirst,projectValue} from './first-scenario.js';
export {npv,bestPortfolio,rng} from './finance.js';
export const posterior = (prior,positive,accuracy) => {
  const yes=positive?accuracy:1-accuracy, no=positive?1-accuracy:accuracy;
  return prior*yes/(prior*yes+(1-prior)*no);
};
export const signalProbability = (p,a) => p*a+(1-p)*(1-a);
export const expected = (p,prob) => prob*npv(p.cost,p.good)+(1-prob)*npv(p.cost,p.bad);
export const breakeven = p => p.operations.fixed/(p.operations.price-p.operations.variable);
export const zeroNPVUnits = p => (p.operations.fixed+p.cost/[1,2,3].reduce((v,t)=>v+(1+RATE)**-t,0))/(p.operations.price-p.operations.variable);
export function world(seed) {
  const random=rng(seed),prior=[.4,.55,.7][Math.floor(random()*3)],strong=random()<prior;
  const bulletin=random()<(strong?BULLETIN_ACCURACY:1-BULLETIN_ACCURACY);
  const projects=Object.fromEntries(SECOND.map(p=>{const success=random()<p.success[strong?0:1];return[p.id,{success,signal:random()<(success?p.research.accuracy:1-p.research.accuracy)}];}));
  return {prior,strong,bulletin,projects};
}
export function informationValue(p,prob) {
  const a=p.research.accuracy,s=signalProbability(prob,a);
  return s*Math.max(0,expected(p,posterior(prob,true,a)))+(1-s)*Math.max(0,expected(p,posterior(prob,false,a)))-Math.max(0,expected(p,prob));
}
export class Game {
  #world;
  constructor(seed=Date.now()>>>0){
    this.seed=seed>>>0;this.first=generateFirst(this.seed);this.#world=world(this.seed);this.phase='intro';this.selected=[];this.history=[];this.second={};this.fees=0;this.window=1;this.revealIndex=0;
  }
  log(action,detail={}){this.history.push({action,phase:this.phase,...detail});}
  start(){if(this.phase!=='intro')return false;this.phase='first';this.log('quest_started',{quest:1});return true;}
  toggle(id){
    if(this.phase!=='first')return false;const p=this.first.projects.find(p=>p.id===id);if(!p)return false;
    if(this.selected.includes(id)){this.selected=this.selected.filter(x=>x!==id);this.log('project_removed',{id});return true;}
    if(p.cost>this.remaining())return false;this.selected.push(id);this.log('project_selected',{id});return true;
  }
  firstResult(){
    const items=this.first.projects.map(p=>({...p,value:projectValue(p)}));
    const chosen=items.filter(p=>this.selected.includes(p.id)),cost=chosen.reduce((s,p)=>s+p.cost,0);
    return {value:chosen.reduce((s,p)=>s+p.value,0),cost,remaining:this.first.budget-cost,best:bestPortfolio(items,this.first.budget)};
  }
  remaining(){return ['intro','first','firstReport'].includes(this.phase)?this.firstResult().remaining:BUDGET-SECOND.filter(p=>this.second[p.id]?.status==='invested').reduce((s,p)=>s+p.cost,0)-this.fees;}
  commitFirst(){if(this.phase!=='first')return false;this.phase='firstReport';this.log('capital_committed',{quest:1,ids:[...this.selected]});this.log('quest_completed',{quest:1});return true;}
  unlock(){if(this.phase!=='firstReport')return false;this.phase='second';this.log('quest_started',{quest:2});return true;}
  get prior(){return this.#world.prior;}
  get bulletin(){return this.window===2?this.#world.bulletin:null;}
  marketProbability(excludeId){
    let strong=this.prior,soft=1-this.prior;
    if(this.window===2){strong*=this.#world.bulletin?BULLETIN_ACCURACY:1-BULLETIN_ACCURACY;soft*=this.#world.bulletin?1-BULLETIN_ACCURACY:BULLETIN_ACCURACY;}
    // Other projects' private reports also carry evidence about the shared economy.
    // Exclude this project's report here, then apply it to its outcome below.
    for(const p of SECOND){const r=this.second[p.id]?.research;if(!r||p.id===excludeId)continue;
      const a=signalProbability(p.success[0],p.research.accuracy),b=signalProbability(p.success[1],p.research.accuracy);
      strong*=r.positive?a:1-a;soft*=r.positive?b:1-b;
    }
    return strong/(strong+soft);
  }
  probability(p){
    const market=this.marketProbability(p.id);
    const base=market*p.success[0]+(1-market)*p.success[1],r=this.second[p.id]?.research;
    return r?posterior(base,r.positive,p.research.accuracy):base;
  }
  available(p){const status=this.second[p.id]?.status;return this.phase==='second' && (!status || (status==='waiting'&&this.window===2));}
  research(id,intent='undecided'){
    const p=SECOND.find(p=>p.id===id);if(!p||!this.available(p)||this.second[id]?.research||p.research.cost>this.remaining())return false;
    const prob=this.probability(p),before=expected(p,prob),value=informationValue(p,prob),positive=this.#world.projects[id].signal;
    this.second[id]??={};this.second[id].research={positive,before,value,window:this.window,intent:['invest','reject'].includes(intent)?intent:'undecided'};this.fees+=p.research.cost;
    this.second[id].research.after=expected(p,this.probability(p));
    this.log('research_purchased',{id,cost:p.research.cost,positive,expectedBefore:before,expectedAfter:this.second[id].research.after});return true;
  }
  act(id,action){
    const p=SECOND.find(p=>p.id===id);if(!p||!this.available(p))return false;
    this.second[id]??={};const record=this.second[id];
    if(action==='invest'){
      if(p.cost>this.remaining())return false;
      const candidates=SECOND.filter(x=>this.available(x)).map(x=>({...x,value:expected(x,this.probability(x))}));
      const best=bestPortfolio(candidates,this.remaining()),forced=expected(p,this.probability(p))+bestPortfolio(candidates.filter(x=>x.id!==id),this.remaining()-p.cost).value;
      record.forecast=expected(p,this.probability(p));record.prob=this.probability(p);record.opportunityGap=Math.max(0,best.value-forced);record.status='invested';record.window=this.window;
    }else if(action==='wait'){
      if(this.window!==1||WAIT_FEE>this.remaining())return false;this.fees+=WAIT_FEE;record.waitCost=WAIT_FEE;record.status='waiting';
    }else if(action==='reject'){record.status='rejected';record.rejectedForecast=expected(p,this.probability(p));}
    else return false;
    this.log(action==='invest'?'capital_committed':action==='wait'?'project_waited':'project_rejected',{id,forecast:record.forecast??record.rejectedForecast??null});return true;
  }
  advance(passOpen=false){
    if(this.phase!=='second'||this.window!==1)return false;
    if(passOpen)for(const p of SECOND)if(!this.second[p.id]?.status)this.act(p.id,'reject');
    if(SECOND.some(p=>!this.second[p.id]?.status))return false;
    this.window=2;this.log('market_bulletin',{positive:this.bulletin});return true;
  }
  canResolve(){return this.phase==='second'&&SECOND.every(p=>['invested','rejected'].includes(this.second[p.id]?.status));}
  finish(){
    if(this.phase!=='second')return false;
    // Explicitly closing the desk passes on open/held projects using current information.
    // No new research, bulletin, fees, or hindsight enter these final decisions.
    for(const p of SECOND){
      const status=this.second[p.id]?.status;
      if(status==='invested'||status==='rejected')continue;
      this.second[p.id]??={};
      Object.assign(this.second[p.id],{status:'rejected',rejectedForecast:expected(p,this.probability(p))});
      this.log('project_rejected',{id:p.id,forecast:this.second[p.id].rejectedForecast,reason:'desk_closed'});
    }
    return this.resolve();
  }
  resolve(){
    if(!this.canResolve())return false;
    this.outcomes=SECOND.filter(p=>this.second[p.id].status==='invested').map(p=>({id:p.id,success:this.#world.projects[p.id].success,realized:npv(p.cost,this.#world.projects[p.id].success?p.good:p.bad),forecast:this.second[p.id].forecast}));
    this.phase=this.outcomes.length?'reveal':'report';this.log('quest_completed',{quest:2});if(this.outcomes.length)this.log('investment_outcome_revealed',{id:this.outcomes[0].id});return true;
  }
  next(){if(this.phase!=='reveal')return false;this.revealIndex++;if(this.revealIndex>=this.outcomes.length)this.phase='report';else this.log('investment_outcome_revealed',{id:this.outcomes[this.revealIndex].id});return true;}
  totals(){return{expected:(this.outcomes||[]).reduce((s,p)=>s+p.forecast,0)-this.fees,realized:(this.outcomes||[]).reduce((s,p)=>s+p.realized,0)-this.fees,research:SECOND.reduce((s,p)=>s+(this.second[p.id]?.research?p.research.cost:0),0),wait:SECOND.reduce((s,p)=>s+(this.second[p.id]?.waitCost||0),0)};}
}
