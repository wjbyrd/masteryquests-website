import {FIRST,RATE} from './data.js';

// All amounts are dollars. Alternate schedules represent different contract or asset
// lives, not hidden outcomes. Cost factors reflect installation quotes; cash factors
// reflect the stated operating-volume / savings assumptions for that proposal.
const additions = [
  {id:'packaging',name:'Packaging automation',company:'Cedar Cartons',icon:'packaging',color:'copper',cost:85000,flows:[28000,40000,44000],alternate:[30000,37000,41000,23000],driver:'packing throughput',description:'Automated packing reduces handling costs as production builds.'},
  {id:'retail',name:'Retail expansion',company:'Marlow Outfitters',icon:'retail',color:'rose',cost:115000,flows:[22000,45000,52000,40000],alternate:[25000,55000,70000],driver:'shop sales volume',description:'A neighborhood store earns more as its customer base develops.'},
  {id:'cold-storage',name:'Cold-storage installation',company:'Frostline Produce',icon:'cold',color:'blue',cost:95000,flows:[37000,39000,40000,15000],alternate:[45000,46000,48000],driver:'refrigerated capacity used',description:'Cold rooms reduce spoilage and earn storage fees.'},
  {id:'efficiency',name:'Energy-efficiency upgrade',company:'Brightmill Textiles',icon:'efficiency',color:'gold',cost:60000,flows:[19000,20000,21000,21000],alternate:[20000,21000,22000,21000,16000],driver:'energy savings',description:'Insulation and efficient motors lower the plant’s energy bill.'},
  {id:'conveyors',name:'Distribution conveyors',company:'Aster Supply',icon:'conveyor',color:'teal',cost:75000,flows:[42000,45000],alternate:[33000,35000,26000],driver:'sorting labor savings',description:'A faster sorting system cuts labor and handling costs.'},
  {id:'production',name:'Production-line renewal',company:'Stonebridge Fabrication',icon:'production',color:'copper',cost:155000,flows:[40000,55000,65000,65000],alternate:[50000,72000,85000],driver:'line output',description:'A modern line ramps up output after an installation period.'},
  {id:'scanner',name:'Medical scanning equipment',company:'Willow Diagnostics',icon:'scanner',color:'violet',cost:125000,flows:[25000,42000,48000,50000,20000],alternate:[35000,50000,55000,42000],driver:'scheduled scans',description:'A scanner adds appointment capacity under clinic contracts.'},
  {id:'hotel',name:'Hotel renovation',company:'Harbor House',icon:'hotel',color:'rose',cost:135000,flows:[0,50000,65000,80000],alternate:[10000,45000,55000,60000,40000],driver:'occupied room nights',description:'Refurbishment delays revenue before refreshed rooms reopen.'},
  {id:'routing',name:'Logistics routing system',company:'Wayfinder Freight',icon:'routing',color:'blue',cost:55000,flows:[23000,25000,28000],alternate:[35000,36000],driver:'route-mile savings',description:'Smarter routes reduce fuel use and paid driver hours.'},
  {id:'processing',name:'Food-processing equipment',company:'Orchard Kitchen',icon:'processing',color:'gold',cost:105000,flows:[43000,44000,37000],alternate:[30000,39000,42000,27000],driver:'processing volume',description:'A processing line turns seasonal fruit into packaged products.'},
  {id:'ordering',name:'Digital ordering system',company:'Bramble Cafés',icon:'ordering',color:'violet',cost:45000,flows:[23000,24000],alternate:[17000,19000,16000],driver:'digital order volume',description:'Direct ordering earns additional sales and lowers service fees.'},
  {id:'inventory',name:'Inventory automation',company:'Lantern Merchants',icon:'inventory',color:'teal',cost:65000,flows:[12000,28000,30000,20000],alternate:[22000,28000,32000],driver:'stock-handling savings',description:'Better stock tracking reduces waste after a phased rollout.'},
  {id:'water',name:'Water-recovery system',company:'Brookwell Ceramics',icon:'water',color:'blue',cost:80000,flows:[23000,24000,26000,26000,10000],alternate:[26000,28000,29000,23000],driver:'water and disposal savings',description:'Recovery equipment lowers water purchases and disposal costs.'},
  {id:'workshop',name:'Workshop expansion',company:'Copperleaf Furniture',icon:'workshop',color:'copper',cost:140000,flows:[25000,45000,60000,65000],alternate:[20000,40000,45000,50000,50000],driver:'custom furniture orders',description:'A larger workshop earns more as new staff reach capacity.'}
];
const originalDrivers=['picking labor savings','dining-room sales','vehicle running-cost savings','rent and resale proceeds','subscription volume','machining savings'];
const originals=FIRST.map((p,i)=>({...p,driver:originalDrivers[i],alternate:[
  [55000,55000,55000,35000],[65000,70000],[35000,35000,32000,18000],
  [0,10000,20000,190000],[38000,43000],[17000,19000,18000]
][i],description:[
  'A robotic picking line cuts warehouse handling costs.',
  'A second dining room adds capacity, with demand strongest early on.',
  'Efficient vans turn lower running costs into steady savings.',
  'A lengthy renovation postpones most income until resale.',
  'A software rollout earns subscription income over its contract term.',
  'A machine upgrade saves labor but has a limited useful life.'
][i]}));

export const FIRST_LIBRARY=[...originals,...additions].map(({alternate,driver,...p})=>Object.freeze({
  ...p,flows:Object.freeze(p.flows),duration:p.flows.length,rate:RATE,
  generation:Object.freeze({costFactors:[.85,1,1.15],cashFactors:[.85,1,1.15],driver,schedules:[p.flows,alternate]})
}));

// Candidate proposals and conditions only: winners are always calculated, never specified.
export const FALLBACKS=[
  {budget:250000,rate:.1,ids:['warehouse','restaurant','fleet','property','software','equipment']},
  {budget:225000,rate:.08,ids:['packaging','retail','cold-storage','efficiency','conveyors','production']},
  {budget:275000,rate:.12,ids:['scanner','hotel','routing','processing','ordering','inventory']}
];
