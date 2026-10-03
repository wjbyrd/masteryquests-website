import {assetsReady,drawAtlasSprite} from './map-engine.js';
import {ASSETS,SUPPORT} from './visual-config.js';

// A grounded regional scene built from the same art as the playable towns.
// This is a production canvas illustration, not a screenshot of the game.
export async function renderHero(canvas){
  await assetsReady();const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;
  c.clearRect(0,0,768,512);
  const point=(i,j)=>[358+(i-j)*19,88+(i+j)*9.5];
  function tile(i,j,color){const[x,y]=point(i,j);c.fillStyle=color;c.beginPath();c.moveTo(x,y);c.lineTo(x+19,y+9.5);c.lineTo(x,y+19);c.lineTo(x-19,y+9.5);c.closePath();c.fill();}
  for(let i=0;i<19;i++)for(let j=0;j<15;j++){
    const river=i===9||i===10;
    tile(i,j,river?ASSETS.water.base:ASSETS.terrain.grass[(i*3+j)%4]);
    if(river){const[x,y]=point(i,j);c.strokeStyle=ASSETS.water.light;c.beginPath();c.moveTo(x-8,y+10);c.lineTo(x+2,y+15);c.stroke();}
    if(j===6||!river&&(i===5||i===16))tile(i,j,ASSETS.roads.improved);
  }
  const objects=[];
  function add(key,frame,i,j,size){const[x,y]=point(i,j);objects.push({depth:i+j,draw:()=>drawAtlasSprite(c,key,frame,x,y+13,size)});}
  add('capital',3,3,3,140);add('education',3,3,10,133);add('research',2,7,3,123);add('resources',2,7,10,139);
  add('capital',1,14,3,124);add('resources',1,14,11,129);add('education',1,12,7,105);
  for(const [i,j]of [[1,1],[1,12],[7,1]])add('support',SUPPORT.apartments,i,j,62);
  for(const [i,j]of [[17,2],[17,12]])add('support',SUPPORT.house,i,j,56);
  for(const [i,j]of [[0,4],[1,8],[6,13],[8,2],[11,13],[18,5],[18,10],[12,1]])add('support',SUPPORT.tree,i,j,46);
  objects.sort((a,b)=>a.depth-b.depth).forEach(o=>o.draw());
  canvas.dataset.ready='true';
}
