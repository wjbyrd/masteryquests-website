const freeze = value => { if (value && typeof value === 'object') { Object.values(value).forEach(freeze); Object.freeze(value); } return value; };
export const CONFIG = freeze({
  title: 'Labor Force Files', gameID: 'labor-force-files', route: '/games/labor-force-files/',
  description: 'Track employment, unemployment, participation, and discouraged workers to see what the unemployment rate really says.',
  modelNote: 'A simplified instructional labor-market model. Exact counts appear in the report; silhouettes are illustrative.',
  retainedRuns: 20, rateTolerance: 0.05,
  baselines: [
    { id:'district-a', adultPopulation:250, employed:160, unemployed:10 },
    { id:'district-b', adultPopulation:300, employed:180, unemployed:20 },
    { id:'district-c', adultPopulation:400, employed:228, unemployed:12 },
    { id:'district-d', adultPopulation:500, employed:285, unemployed:15 },
    { id:'district-e', adultPopulation:200, employed:114, unemployed:6 },
  ],
  direct: [{id:'hiring-2',kind:'hiring',count:2},{id:'hiring-4',kind:'hiring',count:4},{id:'losses-4',kind:'losses',count:4},{id:'losses-8',kind:'losses',count:8}],
  expansions: [{id:'jobs',toEmployed:20,toUnemployed:0},{id:'search',toEmployed:5,toUnemployed:15},{id:'same-share',proportional:true}],
  discouraged: [{id:'exit-2',count:2},{id:'exit-3',count:3},{id:'exit-4',count:4}],
  mixed: [{id:'hiring-search',hired:2,toEmployed:8,toUnemployed:5},{id:'hiring-return',hired:4,toEmployed:12,toUnemployed:2},{id:'reentry',hired:1,toEmployed:6,toUnemployed:3}],
  headlines: [{id:'hiring'},{id:'discouraged'},{id:'losses'},{id:'search-entry'},{id:'same-share'},{id:'job-entry'}],
  people: [
    {id:'part-time',text:'A person works 20 hours per week and wants full-time work.',answer:'employed',why:'Having a job counts as employment, including part-time work. Wanting more hours does not make this person unemployed.'},
    {id:'searching',text:'A person has no job, is available to work, and actively applied for jobs this week.',answer:'unemployed',why:'This person has no job, is available for work and is actively searching: they are unemployed and in the labor force.'},
    {id:'retired',text:'A retired person has no job and is not looking for work.',answer:'nilf',why:'Without a job or active job search, this person is not in the labor force.'},
    {id:'discouraged',text:'A person has no job, wants work and is available, but stopped searching because they believe suitable work is unavailable.',answer:'nilf',why:'This is a discouraged worker. Stopping active search puts them outside the labor force in this model, even though they want and are available for work.'},
  ],
  scenes: [
    {id:1,label:'Baseline labor market',alt:'Outlined groups divide the adult population into the labor force and people not in the labor force. The labor force contains employed and unemployed people.'},
    {id:2,label:'Employment increases',alt:'The employed group grows and the unemployed group shrinks. The labor force and the group not in the labor force remain unchanged.'},
    {id:3,label:'Unemployment increases',alt:'The unemployed group grows and the employed group shrinks within an unchanged labor force. The group outside the labor force stays the same.'},
    {id:4,label:'Labor-force expansion',alt:'The labor-force boundary expands while the group outside it becomes smaller. New entrants may work or actively search for work.'},
    {id:5,label:'Discouraged workers',alt:'The unemployed group becomes smaller while the group outside the labor force grows, representing people who stopped actively searching. Employment is unchanged.'},
    {id:6,label:'Several flows at once',alt:'The composition of employed, unemployed and nonparticipating adults changes. Use the report counts to trace the separate flows.'},
  ],
});
