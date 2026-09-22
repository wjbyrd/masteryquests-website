// Coordinates are authored once in the supplied 1448 x 1086 image space.
// These two strips lie on opposite sides of the yellow centerline and end
// before the intersection crosswalk. No random positions or animated travel.
export const sceneSize = { width:1448, height:1086 };
export const canonicalReference = './art/scenes/gameday-rivals/canonical-day.webp';
export const roadZones = {
  northwest: { direction:'northwest', rotation:201, polygon:[[100,573],[800,843],[800,875],[100,605]] },
  southeast: { direction:'southeast', rotation:21, polygon:[[200,668],[780,891],[780,933],[200,710]] }
};
export const crosswalks = [
  [[680,1055],[1028,805],[1090,827],[738,1086]],
  [[1080,817],[1121,789],[1272,869],[1235,904]],
  [[1090,1076],[1210,980],[1260,1006],[1150,1086]]
];
export const slots = [
  {id:'nw1',x:250,y:647,rotation:201,direction:'northwest',lane:'northwest',type:'car'},
  {id:'nw2',x:430,y:716,rotation:201,direction:'northwest',lane:'northwest',type:'moped'},
  {id:'nw3',x:610,y:785,rotation:201,direction:'northwest',lane:'northwest',type:'car'},
  {id:'nw4',x:750,y:839,rotation:201,direction:'northwest',lane:'northwest',type:'moped'},
  {id:'se1',x:250,y:708,rotation:21,direction:'southeast',lane:'southeast',type:'moped'},
  {id:'se2',x:430,y:777,rotation:21,direction:'southeast',lane:'southeast',type:'car'},
  {id:'se3',x:610,y:847,rotation:21,direction:'southeast',lane:'southeast',type:'moped'},
  {id:'se4',x:740,y:896,rotation:21,direction:'southeast',lane:'southeast',type:'car'}
];
// Slot indexes are fixed. Each firm uses both directions and keeps its own mark/color.
const playerSlots = [0,5,2,7], rivalSlots = [4,1,6,3];
export function activityFor(playerAction, rivalAction) {
  if (!playerAction || !rivalAction) return {id:'unrevealed',player:0,rival:0,units:[],description:'Current delivery strategies are not yet revealed.'};
  const player = playerAction === 'aggressive' ? 4 : 2, rival = rivalAction === 'aggressive' ? 4 : 2;
  const id = player === rival ? player === 4 ? 'both-heavy' : 'balanced-moderate' : player > rival ? 'player-heavy' : 'rival-heavy';
  return {id,player,rival,description:`Schematic delivery activity: ${player} player units and ${rival} rival units.`,
    units:[...playerSlots.slice(0,player).map(i=>({...slots[i],firm:'player'})),...rivalSlots.slice(0,rival).map(i=>({...slots[i],firm:'rival'}))]};
}
export function sceneFor(scenario, roundIndex) {
  const round = scenario.rounds[roundIndex];
  if (!round) throw Error('Unknown game-day scene');
  return { ...sceneSize, src:`./art/scenes/gameday-rivals/${round.image}`, night:roundIndex === 5,
    alt:`${round.name} in Alderwick: restaurants, the campus stadium and the same diagonal streets. ${round.demand} underlying game-day demand. ${roundIndex === 5 ? 'The final game takes place under stadium lights at night.' : 'The town is visible before nightfall.'} Background crowds and traffic represent the market opportunity, not either platform’s current promotion.` };
}
export function pointInPolygon([x,y], polygon) {
  let inside=false;
  for(let i=0,j=polygon.length-1;i<polygon.length;j=i++) {
    const [xi,yi]=polygon[i],[xj,yj]=polygon[j];
    if(((yi>y)!==(yj>y)) && x < (xj-xi)*(y-yi)/(yj-yi)+xi) inside=!inside;
  }
  return inside;
}
export function footprint(slot) {
  const angle=slot.rotation*Math.PI/180;
  // Includes the renderer's 1.6 scale and the front arrow / outer strokes.
  return [[-32,-12.8],[32,-12.8],[32,12.8],[-32,12.8]].map(([x,y])=>[slot.x+x*Math.cos(angle)-y*Math.sin(angle),slot.y+x*Math.sin(angle)+y*Math.cos(angle)]);
}
