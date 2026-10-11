export const BUDGET = 250000;
export const RATE = .1;
export const FIRST = [
  {id:'warehouse',name:'Warehouse automation',company:'Northline Goods',icon:'warehouse',color:'teal',cost:150000,flows:[70000,70000,70000],description:'A robotic picking line cuts handling costs across three busy years.'},
  {id:'restaurant',name:'Restaurant expansion',company:'Juniper Table',icon:'restaurant',color:'gold',cost:100000,flows:[55000,50000,45000],description:'A second dining room adds capacity, with the strongest demand early on.'},
  {id:'fleet',name:'Delivery fleet',company:'Parcel & Pine',icon:'fleet',color:'blue',cost:80000,flows:[40000,40000,40000],description:'Efficient delivery vans turn lower running costs into steady savings.'},
  {id:'property',name:'Property renovation',company:'Brickwell Studios',icon:'property',color:'rose',cost:120000,flows:[0,10000,190000],description:'A long renovation postpones most of the cash return until year three.'},
  {id:'software',name:'Software platform',company:'Threadwork Systems',icon:'software',color:'violet',cost:70000,flows:[30000,35000,35000],description:'A compact software rollout earns subscription income over three years.'},
  {id:'equipment',name:'Equipment upgrade',company:'Forgefield Works',icon:'equipment',color:'copper',cost:50000,flows:[24000,24000],description:'A short-lived machine upgrade saves labor, but carries a steep price.'}
];
// success probabilities conditional on a strong / soft economy; all figures fictional.
export const SECOND = [
  {id:'distribution',name:'Regional distribution',company:'Crosswind Logistics',icon:'warehouse',color:'teal',cost:110000,good:[65000,65000,65000],bad:[23000,23000,23000],success:[.85,.3],research:{name:'Market demand study',cost:5000,accuracy:.85},description:'A regional hub depends on enough retailers signing delivery contracts.',outcomes:['Retail contracts fill the hub.','Weak bookings leave costly capacity idle.']},
  {id:'medical',name:'Medical technology',company:'Lumen Instruments',icon:'software',color:'violet',cost:100000,good:[20000,80000,110000],bad:[5000,10000,20000],success:[.7,.4],research:{name:'Clinical adoption survey',cost:7000,accuracy:.8},description:'A diagnostic tool has a large upside if clinics adopt it.',outcomes:['Clinic adoption accelerates after the first year.','Clinics delay adoption; sales miss the forecast.']},
  {id:'development',name:'Commercial development',company:'Alder Commons',icon:'property',color:'rose',cost:130000,good:[10000,30000,190000],bad:[0,10000,95000],success:[.8,.2],research:{name:'Tenant interest report',cost:15000,accuracy:.6},description:'Most value arrives at resale. A costly tenant report is only mildly informative.',outcomes:['Strong tenant demand supports a valuable resale.','Vacancies reduce rent and the eventual resale price.']},
  {id:'energy',name:'Renewable energy',company:'Solstice Cooperative',icon:'energy',color:'gold',cost:75000,good:[38000,38000,38000],bad:[28000,28000,28000],success:[.7,.55],research:{name:'Engineering review',cost:6000,accuracy:.8},description:'Contracted sales cushion the downside; operating efficiency remains uncertain.',outcomes:['Efficient operation keeps maintenance costs low.','Higher maintenance costs absorb part of the contracted revenue.']},
  {id:'packing',name:'Fresh-food packing',company:'Fieldglass Foods',icon:'equipment',color:'blue',cost:90000,good:[60000,60000,60000],bad:[-10000,-10000,-10000],success:[.8,.3],research:{name:'Customer order survey',cost:4000,accuracy:.9},operations:{price:40,variable:20,fixed:60000,goodUnits:6000,badUnits:2500},description:'A new packing line must sell enough cases to cover annual fixed costs.',outcomes:['6,000 cases a year cover operating costs and earn a surplus.','2,500 cases a year fail to cover annual operating costs.']}
];
export const WAIT_FEE = 2000;
export const BULLETIN_ACCURACY = .7;
