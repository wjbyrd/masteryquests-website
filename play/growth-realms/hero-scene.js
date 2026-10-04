import {SPLASH_ROADS,SPLASH_BUILDINGS,SPLASH_TREES,SPLASH_NEIGHBORHOODS,riverBanks} from './splash-layout.js';
import {assetsReady,drawAtlasSprite,districtSprite} from './map-engine.js';
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

// Full-bleed splash, composed from the production atlases. Portrait mode
// rearranges the region instead of cropping one of the two cities away.
export async function renderSplash(canvas){
  await assetsReady();
  const portrait=canvas.clientWidth/canvas.clientHeight<.85;
  const layout=portrait?'portrait':'landscape';
  const viewport=`${canvas.clientWidth}x${canvas.clientHeight}`;
  if(canvas.dataset.viewport===viewport&&canvas.dataset.ready)return;
  canvas.width=portrait?900:1440;canvas.height=portrait?Math.round(900*canvas.clientHeight/canvas.clientWidth):960;
  const c=canvas.getContext('2d');c.imageSmoothingEnabled=false;
  const w=portrait?20:28,h=w/2,scale=w/32;
  const point=(i,j)=>[canvas.width/2-3*w+(i-j)*w,(portrait?canvas.height*.25:-160)+(i+j)*h];
  function polygon(points,fill,stroke){c.beginPath();points.forEach((p,n)=>{const[x,y]=point(...p);n?c.lineTo(x,y):c.moveTo(x,y);});c.closePath();c.fillStyle=fill;c.fill();if(stroke){c.strokeStyle=stroke;c.lineWidth=2*scale;c.stroke();}}
  function rect(r,fill,stroke){polygon([[r.minI,r.minJ],[r.maxI,r.minJ],[r.maxI,r.maxJ],[r.minI,r.maxJ]],fill,stroke);}
  c.fillStyle='#7f9362';c.fillRect(0,0,canvas.width,canvas.height);
  for(let i=-70;i<100;i++)for(let j=-70;j<100;j++)rect({minI:i,maxI:i+1,minJ:j,maxJ:j+1},ASSETS.terrain.grass[((i*7+j*3)%4+4)%4]);
  // Continuous curved banks and deeper channel replace the blue checkerboard.
  const left=[],right=[];
  for(let j=-80;j<=110;j++){const[a,b]=riverBanks(j);left.push([a,j]);right.push([b,j]);}
  polygon([...left.map(([i,j])=>[i-.6,j]),...right.toReversed().map(([i,j])=>[i+.6,j])],'#b7aa7e','#667955');
  polygon([...left,...right.toReversed()],'#327d91','#bcd1b6');
  polygon([...left.map(([i,j])=>[i+.65,j]),...right.toReversed().map(([i,j])=>[i-.65,j])],'#226479');
  for(let j=-60;j<100;j+=1.4){const[a,b]=riverBanks(j),i=a+.7+((Math.round(j*10)%7+7)%7)/7*(b-a-1.6);c.beginPath();c.moveTo(...point(i,j));c.lineTo(...point(i+.12,j+.7));c.strokeStyle='#76b7bf';c.lineWidth=scale;c.stroke();}
  for(const r of SPLASH_ROADS){
    rect({minI:r.minI-.22,maxI:r.maxI+.22,minJ:r.minJ-.22,maxJ:r.maxJ+.22},'#b9b8a2');
    rect(r,'#586568','#d4cbb0');
  }
  // Bridge parapets span the water and bank slopes, not the city lots.
  for(const j of [10,22,34])for(const edge of [j-.57,j+.57]){c.beginPath();c.moveTo(...point(22,edge));c.lineTo(...point(28,edge));c.strokeStyle='#eee2ba';c.lineWidth=3*scale;c.stroke();}
  const objects=SPLASH_BUILDINGS.map(b=>({depth:b.i+b.j,draw:()=>{const[x,y]=point(b.i,b.j);districtSprite(c,b.key,b.frame,x,y,scale);}}));
  // Neighborhoods sit in the same serviced blocks, with generous road setbacks.
  for(const [i,j]of SPLASH_NEIGHBORHOODS){
    const[x,y]=point(i,j);objects.push({depth:i+j,draw:()=>drawAtlasSprite(c,'support',i<22?SUPPORT.apartments:SUPPORT.house,x,y,75*scale)});
  }
  for(const [i,j]of SPLASH_TREES){const[x,y]=point(i,j);objects.push({depth:i+j,draw:()=>drawAtlasSprite(c,'support',SUPPORT.tree,x,y,75*scale)});}
  objects.sort((a,b)=>a.depth-b.depth).forEach(o=>o.draw());
  canvas.dataset.layout=layout;canvas.dataset.viewport=viewport;canvas.dataset.ready='true';
}
