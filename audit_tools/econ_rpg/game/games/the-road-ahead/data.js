export const CHARACTERS = [
  {id:'natural',name:'The Natural',attribute:'aptitude',bonus:20,color:'#9e6230',variant:0,description:'Learn quickly. Decide what to build with that head start.',tradeoff:'Early grades can come easily; advanced work still needs preparation.'},
  {id:'grinder',name:'The Grinder',attribute:'discipline',bonus:20,color:'#316a8c',variant:1,description:'Show up prepared. Turn steady effort into progress.',tradeoff:'Time spent preparing is time unavailable for work or relationships.'},
  {id:'connector',name:'The Connector',attribute:'social',bonus:20,color:'#80537f',variant:3,description:'Open doors through relationships. Grow into the opportunity.',tradeoff:'A strong recommendation can open a door before your skills are ready.'},
  {id:'juggler',name:'The Juggler',attribute:'adaptability',bonus:20,color:'#327763',variant:4,description:'Find a way through change. Make competing commitments work.',tradeoff:'Flexibility helps, but spreading your time has a cost.'}
];
export const LABELS = {aptitude:'Learning aptitude',discipline:'Discipline',social:'Social capital',adaptability:'Adaptability',skills:'Human capital',preparation:'Preparation',experience:'Experience',money:'Financial position',reputation:'Reputation',wellbeing:'Well-being',satisfaction:'Job satisfaction',career:'Career progress',gpa:'GPA',credential:'Credentials',reference:'Recommendation',sample:'Work sample',record:'Recorded performance'};
export const BASE = {aptitude:40,discipline:40,social:40,adaptability:40,skills:35,preparation:35,experience:0,money:5000,reputation:50,wellbeing:75,satisfaction:60,career:0};
export const ZONES = [
  {name:'The College Years',short:'College',place:'Alder University',entry:'Campus paths lead to Honors Hall, the library, and graduation.',color:'#dce7d5'},
  {name:'The Job Market',short:'Job market',place:'The recruiting district',entry:'Through the university gates: recruiters see your record, not the work behind it.',color:'#e6dded'},
  {name:'The Working World',short:'Working world',place:'Your first workplace',entry:'An agreement is signed. What will you do when no one can see every part of the job?',color:'#d9e7ec'},
  {name:'The Real World',short:'Real world',place:'The neighborhood marketplace',entry:'Your earnings meet sellers, insurers, and landlords with information of their own.',color:'#f0e3ca'}
];
export const BOARD={width:720,height:2160,zoneHeight:530,spacesPerZone:6};
const places=[
  ['Campus green','Library','Campus café','Alumni center','Honors Hall','Graduation'],
  ['Recruiting center','Portfolio studio','Temp agency','Career fair','City park','Contract desk'],
  ['Sales floor','Training lab','Extra shift','Mentor lounge','Courtyard','Review office'],
  ['Auto market','Insurance office','Repair workshop','Paid errands','Neighborhood park','Your new home']
];
const milestones=new Set([4,5,6,11,12,17,18,19,23]);
const layout=[[350,260],[130,150],[585,150],[130,380],[585,380],[350,460]];
export const NODES=places.flatMap((names,zone)=>names.map((name,local)=>({id:zone*6+local,zone,name,type:milestones.has(zone*6+local)?'milestone':'activity',x:layout[local][0],y:zone*530+layout[local][1]})));
export const LAST_SPACE=NODES.length-1;
export const point=id=>({...NODES[id]});
export const RULES={turnsPerChapter:3,dieSides:6,inspectionAccuracy:.8,referenceAccuracy:.75,reviewDetection:.65,loss:4000,warrantyRecovery:.8};
export const money=n=>new Intl.NumberFormat('en-US',{style:'currency',currency:'USD',maximumFractionDigits:0}).format(n);
