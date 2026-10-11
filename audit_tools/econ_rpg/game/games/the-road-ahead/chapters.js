import {LABELS,money,RULES} from './data.js';
import {clamp} from './random.js';

export const CHAPTERS=[
  {deadline:'Graduation',checkpoints:[{after:1,event:'honors',node:4},{after:3,event:'graduation',node:5}],activities:[
    {id:'study',node:1,label:'Study at the library',kind:'learn',effects:{skills:4,preparation:5,wellbeing:-4}},
    {id:'shift',node:2,label:'Work a café shift',kind:'earn',effects:{money:180,experience:2,wellbeing:-5}},
    {id:'network',node:3,label:'Meet the alumni',kind:'connect',effects:{money:-35,social:4,wellbeing:-2},signals:{reference:3}},
    {id:'rest',node:0,label:'Take an afternoon off',kind:'rest',effects:{money:-10,wellbeing:7}}
  ]},
  {deadline:'Job offers',checkpoints:[{after:0,event:'pool',node:6},{after:3,event:'contract',node:11}],activities:[
    {id:'sample',node:7,label:'Build a work sample',kind:'learn',effects:{money:-70,skills:3,wellbeing:-3},signals:{sample:6}},
    {id:'bridge',node:8,label:'Take a temporary shift',kind:'earn',effects:{money:220,experience:3,wellbeing:-5}},
    {id:'contacts',node:9,label:'Visit the career fair',kind:'connect',effects:{money:-20,social:2,wellbeing:-2},signals:{reference:4}},
    {id:'rest',node:10,label:'Clear your head',kind:'rest',effects:{money:-12,wellbeing:7}}
  ]},
  {deadline:'Performance review',checkpoints:[{after:0,event:'incentives',node:12},{after:3,event:'review',node:17}],activities:[
    {id:'training',node:13,label:'Learn a new tool',kind:'learn',effects:{money:-60,skills:4,preparation:2,wellbeing:-4}},
    {id:'overtime',node:14,label:'Take an extra shift',kind:'earn',effects:{money:200,wellbeing:-6,satisfaction:-2}},
    {id:'mentor',node:15,label:'Meet your mentor',kind:'connect',effects:{money:-25,skills:3,reputation:2,wellbeing:-3}},
    {id:'rest',node:16,label:'Protect your evening',kind:'rest',effects:{money:-10,wellbeing:7}}
  ]},
  {deadline:'The road home',checkpoints:[{after:0,event:'car',node:18},{after:0,event:'insurance',node:19},{after:3,event:'precautions',node:23},{after:3,event:'housing',node:23},{after:3,event:'final',node:23}],activities:[
    {id:'maintain',node:20,label:'Learn a practical repair',kind:'learn',effects:{money:-45,adaptability:3,wellbeing:-3}},
    {id:'errands',node:21,label:'Take some paid errands',kind:'earn',effects:{money:160,wellbeing:-5}},
    {id:'community',node:22,label:'Help your neighbors',kind:'connect',effects:{money:-35,social:4,reputation:2,wellbeing:-3}},
    {id:'rest',node:22,label:'Coffee and a quiet afternoon',kind:'rest',effects:{money:-15,wellbeing:7}}
  ]}
];
export const CIRCUMSTANCES=[
  {title:'An unexpected bill',text:'An overdue bill costs $90, whichever activity you choose.'},
  {title:'A demanding week',text:'Everything takes extra energy. Taking a break avoids the extra strain.'},
  {title:'Room to plan',text:'An ordinary week. Choose what deserves your time.'},
  {title:'Extra hands needed',text:'Paid work earns an extra $80 this turn.'},
  {title:'People have time',text:'Meeting people brings stronger connections this turn.'},
  {title:'A clear head',text:'Learning is more productive, or a break restores extra energy.'}
];
export function effectText(effects){return Object.entries(effects).map(([k,v])=>`${v<0?'−':'+'}${k==='money'?money(Math.abs(v)):Math.abs(v)} ${k==='money'?'Money':LABELS[k]}`).join(' · ');}
export function activityOptions(s){
  return CHAPTERS[s.zone].activities.map(a=>{
    const effects={...a.effects},signals={...a.signals},kind=a.kind,stats=s.attributes;
    if(kind==='learn')effects.skills=(effects.skills||0)+Math.max(0,Math.floor((stats.aptitude-40)/20));
    if(kind==='connect'){effects.social=(effects.social||0)+Math.max(0,Math.floor((stats.social-40)/10));if(signals.reference)signals.reference+=Math.max(0,Math.floor((stats.social-40)/10));}
    if(effects.wellbeing<0)effects.wellbeing=Math.min(-1,effects.wellbeing+Math.max(0,Math.floor((stats.discipline-40)/20))+(kind==='earn'?Math.max(0,Math.floor((stats.adaptability-40)/20)):0));
    if(s.die===1)effects.money=(effects.money||0)-90;
    if(s.die===2&&kind!=='rest')effects.wellbeing-=2;
    if(s.die===4&&kind==='earn')effects.money+=80;
    if(s.die===5&&kind==='connect'){effects.social=(effects.social||0)+2;if(signals.reference)signals.reference+=2;}
    if(s.die===6&&kind==='learn')effects.skills=(effects.skills||0)+2;
    if(s.die===6&&kind==='rest')effects.wellbeing+=2;
    for(const k of Object.keys(effects))if(!effects[k])delete effects[k];
    return {...a,effects,signals,detail:`1 of your ${RULES.turnsPerChapter} turns · ${effectText({...effects,...signals})}`};
  });
}
export function resolveActivity(s,choice){
  for(const [k,v] of Object.entries(choice.effects))s.attributes[k]=k==='money'?s.attributes[k]+v:clamp(s.attributes[k]+v);
  for(const [k,v] of Object.entries(choice.signals))s.observable[k]=clamp(s.observable[k]+v);
  const alternatives=activityOptions(s).filter(a=>a.id!==choice.id).map(a=>a.label);
  return {text:`${choice.label}. One turn spent; ${RULES.turnsPerChapter-s.turn-1} left before ${CHAPTERS[s.zone].deadline.toLowerCase()}.`,next:null,delayed:[],alternatives};
}
