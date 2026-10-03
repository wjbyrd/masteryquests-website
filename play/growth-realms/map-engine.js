import { MAP, CAMERA, ASSETS, SUPPORT, BUILDING_VISUALS, DISTRICTS, DISTRICT_HITBOX, UNIT_VISUALS, SPRITE_ROUTES, LAYERS, iso, visualState, constructionStage } from './visual-config.js';
import { CATEGORIES } from './config.js';
import { routeSample } from './unit-routes.js';

// One clock for all maps; static layers are cached, temporary layers are cleared.
const instances = new Map(), images = new Map();
let ready, raf = 0, tick = 0, lastTime = 0, progress = 0, draws = 0;
const motion = typeof matchMedia === 'function' ? matchMedia('(prefers-reduced-motion: reduce)') : null;
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
export function assetsReady() {
  return ready ||= Promise.all(Object.entries(ASSETS).filter(([, a]) => a.src).map(([key, a]) => new Promise(resolve => {
    const img = new Image(); img.onload = () => { if(a.trim)a.rects=trimFrames(img,a);images.set(key, img); resolve(); };
    img.onerror = () => { console.error(`Unable to load city atlas: ${a.src}`); resolve(); };
    img.src = new URL(a.src, import.meta.url).href;
  })));
}
function trimFrames(img,a) {
  const canvas=document.createElement('canvas');canvas.width=img.width;canvas.height=img.height;
  const c=canvas.getContext('2d',{willReadFrequently:true});c.drawImage(img,0,0);const pixels=c.getImageData(0,0,img.width,img.height).data;
  const rects=[];
  for(let frame=0;frame<a.columns*a.rows;frame++){
    const x0=Math.floor(frame%a.columns*img.width/a.columns),y0=Math.floor(Math.floor(frame/a.columns)*img.height/a.rows);
    const x1=Math.floor((frame%a.columns+1)*img.width/a.columns),y1=Math.floor((Math.floor(frame/a.columns)+1)*img.height/a.rows);
    let left=x1,top=y1,right=x0,bottom=y0;
    for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++)if(pixels[(y*img.width+x)*4+3]>32){left=Math.min(left,x);top=Math.min(top,y);right=Math.max(right,x);bottom=Math.max(bottom,y);}
    rects.push(right>=left?[left,top,right-left+1,bottom-top+1]:[x0,y0,x1-x0,y1-y0]);
  }
  return rects;
}
export function renderCityMap(city, { phase = 'choosing', owner = 'preview' } = {}) {
  const camera = `--world-width:${MAP.width / CAMERA.width * 100}%;--world-height:${MAP.height / CAMERA.height * 100}%;--world-left:${-CAMERA.x / CAMERA.width * 100}%;--world-top:${-CAMERA.y / CAMERA.height * 100}%`;
  return `<div class="city-map" data-map="${city.id}" style="${camera}" aria-label="${esc(city.name)} isometric city"><div class="map-loading">Loading district sprites…</div><div class="map-world">${LAYERS.map(layer => `<canvas class="map-layer ${layer}-layer" data-layer="${layer}" width="768" height="512" aria-hidden="true"></canvas>`).join('')}<div class="district-hitboxes">${CATEGORIES.map(c => {
    const [x,y]=iso(...DISTRICTS[c.id]), box=DISTRICT_HITBOX;
    return `<button class="district-hitbox" data-map-district="${c.id}" data-city="${city.id}" style="left:${(x-box.width/2)/MAP.width*100}%;top:${(y+box.offsetY-box.height/2)/MAP.height*100}%;width:${box.width/MAP.width*100}%;height:${box.height/MAP.height*100}%" aria-label="${esc(c.name)} district. ${owner==='player'&&phase==='planning'?'Activate to invest one development point.':'Activate to inspect.'}" aria-pressed="false" ${phase==='building'?'disabled':''}><span class="sr-only">${esc(c.name)}</span></button><span class="district-plan-badge" data-plan-badge="${c.id}" style="left:${x/MAP.width*100}%;top:${(y+20)/MAP.height*100}%" hidden></span>`;
  }).join('')}</div><div class="map-click-feedback" aria-hidden="true" hidden></div></div><div class="active-district-label" aria-hidden="true"></div><div class="map-caption"><span>HALCYON RIVER</span><span>N ↗</span></div><div class="map-scene-description sr-only"></div></div>`;
}
function poly(ctx, points, fill, stroke) {
  ctx.beginPath(); points.forEach(([x, y], i) => i ? ctx.lineTo(Math.round(x), Math.round(y)) : ctx.moveTo(Math.round(x), Math.round(y))); ctx.closePath();
  if (fill) { ctx.fillStyle = fill; ctx.fill(); } if (stroke) { ctx.strokeStyle = stroke; ctx.lineWidth = 1; ctx.stroke(); }
}
function line(ctx, a, b, color, width = 1) { ctx.beginPath(); ctx.moveTo(...a); ctx.lineTo(...b); ctx.strokeStyle = color; ctx.lineWidth = width; ctx.stroke(); }
function tile(ctx, i, j, color, edge) { const [x, y] = iso(i, j); poly(ctx, [[x,y],[x+32,y+16],[x,y+32],[x-32,y+16]], color, edge); }
function sprite(ctx, key, frame, x, y, size, flip = false, alpha = 1) {
  const img = images.get(key), a = ASSETS[key]; if (!img) return;
  const w = img.width / a.columns, h = img.height / a.rows;
  ctx.save(); ctx.globalAlpha = alpha; ctx.translate(Math.round(x), Math.round(y)); if (flip) ctx.scale(-1,1);
  if(a.rects) {
    const [sx,sy,sw,sh]=a.rects[frame],scale=size/Math.max(sw,sh);
    ctx.drawImage(img,sx,sy,sw,sh,-sw*scale/2,-sh*scale,sw*scale,sh*scale);
  } else ctx.drawImage(img, frame % a.columns * w, Math.floor(frame / a.columns) * h, w, h, -size/2, -size*.85, size, size);
  ctx.restore();
}
function unitSprite(ctx, unit, direction, x, y) {
  const v=UNIT_VISUALS[unit][direction];sprite(ctx,v.asset,v.frame,x,y,v.size,v.flip);
}
function clear(ctx) { ctx.clearRect(0, 0, MAP.width, MAP.height); }
function terrain(m) {
  const c = m.ctx.terrain, theme = getComputedStyle(document.documentElement), texture = theme.getPropertyValue('--mq-navy').trim();
  clear(c); c.fillStyle = theme.getPropertyValue('--mq-bg-dark').trim(); c.fillRect(0,0,768,512);
  // Pixel grain is deterministic: changing a plan never randomizes the world.
  for (let y=0;y<512;y+=4) for(let x=0;x<768;x+=4) if((x*17+y*31)%37<7) { c.fillStyle=texture; c.fillRect(x,y,2,2); }
  poly(c, [[32,287],[384,463],[736,287],[736,306],[384,482],[32,306]], ASSETS.terrain.earth);
  for(let i=0;i<11;i++) for(let j=0;j<11;j++) {
    if(j===10) continue; tile(c,i,j,ASSETS.terrain.grass[(i*7+j*3)%4]);
    const [x,y]=iso(i,j); for(let n=0;n<12;n++){c.fillStyle=n%2?'#94a571':'#728959';c.fillRect(x-19+(n*17+i*13)%39,y+10+(n*7+j*3)%13,2,1);}
  }
}
function roads(m) {
  const c=m.ctx.roads, level=m.state.roadLevel; clear(c);
  const color=ASSETS.roads[['dirt','dirt','improved','paved','arterial'][level]];
  for(let i=0;i<11;i++) for(let j=0;j<11;j++) if(i===5||j===5||j===9||i===10&&j<10) {
    tile(c,i,j,color,level>=3?'#8b9290':'#a4a183');
    const [x,y]=iso(i,j);
    const alongJ=(i===5||i===10)&&j!==5&&j!==9, junction=(i===5||i===10)&&(j===5||j===9);
    if(level>=3 && !junction) line(c,[x-9,y+(alongJ?20:12)],[x+9,y+(alongJ?11:21)],ASSETS.roads.marking,2);
  }
  // Bridge and guardrails share the river crossing.
  const [x,y]=iso(5,10); tile(c,5,10,'#89958d'); line(c,[x-30,y+13],[x,y+29],'#ccd0b3',3);line(c,[x,y+2],[x+30,y+17],'#ccd0b3',3);
  if(level>=2) for(const [i,j] of [[1,5],[5,1],[5,8],[9,5]]) {const [a,b]=iso(i,j);line(c,[a-21,b+13],[a-21,b-10],'#394e4a',2);c.fillStyle='#e5d393';c.fillRect(a-24,b-11,7,3);}
}
function drawBuilding(m,d,ctx=m.ctx.buildings) {
  const [x,y]=iso(...DISTRICTS[d.id]);
  let level=d.level;
  if(m.state.phase==='building' && d.changed && progress>=.2 && progress<.8) return;
  if(m.state.phase==='building' && d.changed && progress>=.8) level=d.nextLevel;
  sprite(ctx,d.id,Math.min(5,level),x,y+23,BUILDING_VISUALS[d.id].levels[0].size);
  // Real model levels above five remain legible as small district annexes.
  for(let n=0;n<Math.max(0,level-5);n++) sprite(ctx,d.id,1,x+63-n*21,y+48+n*8,72);
  if(d.partial && m.state.phase!=='building') materials(ctx,x+61,y+40,Math.max(1,Math.ceil(d.progress*4)));
}
function buildings(m) {
  const c=m.ctx.buildings;clear(c);
  const dense=m.state.city.buildings.capital>=3;
  const objects=[];
  for(const [i,j] of [[.4,1],[.3,4],[.5,8],[2,9],[8.8,.7],[10,3],[10,8.5],[7.5,9.5]]) objects.push({depth:i+j,draw:()=>sprite(c,'support',SUPPORT.tree,...iso(i,j),66)});
  const housing=dense?[[1,.5],[3,.4],[6,.3],[8,.4],[.5,6],[9,3.5]]:[[1,.5],[7,.5],[.5,6]];
  for(const [i,j] of housing) objects.push({depth:i+j,draw:()=>sprite(c,'support',dense?SUPPORT.apartments:SUPPORT.house,...iso(i,j),dense?105:88)});
  if(dense) { objects.push({depth:12,draw:()=>sprite(c,'support',SUPPORT.warehouse,...iso(9.4,2.6),111)});objects.push({depth:17,draw:()=>sprite(c,'support',SUPPORT.power,...iso(8.2,9),100)}); }
  for(const d of m.state.districts) objects.push({depth:DISTRICTS[d.id].reduce((a,b)=>a+b),draw:()=>drawBuilding(m,d)});
  objects.sort((a,b)=>a.depth-b.depth).forEach(o=>o.draw());
}
function materials(c,x,y,count) {
  for(let n=0;n<count;n++) {let a=x+n*7,b=y+n*3;poly(c,[[a,b-5],[a+8,b-1],[a+2,b+2],[a-6,b-2]],'#d4bd87');poly(c,[[a-6,b-2],[a+2,b+2],[a+2,b+6],[a-6,b+2]],'#9b7952');}
  line(c,[x-9,y+8],[x+count*7,y+8+count*3],'#dfc985',2);
}
function water(m,frame) {
  const c=m.ctx.water;clear(c);
  for(let i=0;i<11;i++) {tile(c,i,10,ASSETS.water.base);const [x,y]=iso(i,10);for(let n=0;n<4;n++){const k=(frame+n*2+i)%6;line(c,[x-17+k*3,y+10+n*4],[x-8+k*3,y+14+n*4],n%2?ASSETS.water.light:ASSETS.water.deep,2);}}
}
function construction(m,frame) {
  const c=m.ctx.construction;clear(c); const active=m.state.phase==='building';
  m.el.dataset.construction=active?constructionStage(progress):'none';
  if(!active)return;
  const stage=constructionStage(progress), stages={ 'site-prep':'prep', foundation:'foundation', frame:'frame', finishing:'finishing' };
  for(const d of m.state.districts.filter(d=>d.points>0)) {
    const [x,y]=iso(...DISTRICTS[d.id]);
    if(d.changed && progress<.8) {
      // Build on the same district footprint, with the old structure retained behind scaffolding.
      sprite(c,'support',SUPPORT[stages[stage]],x,y+33,95+d.intensity*30+(d.dominant?15:0));
      if(progress>=.4 && d.intensity>=3) {const cx=x-57,cy=y-38;line(c,[cx,cy+45],[cx,cy-65],ASSETS.effects.crane,3);line(c,[cx-29,cy-62],[cx+74,cy-11],ASSETS.effects.crane,4);line(c,[cx+62,cy-17],[cx+62,cy+9+(frame%4)*3],'#3e4540',1);}
    } else if(!d.changed) { sprite(c,'support',SUPPORT.prep,x+38,y+43,80+d.intensity*12);materials(c,x+52,y+39,d.intensity); }
    if(d.dominant) {c.strokeStyle='#f4d480';c.lineWidth=2;c.strokeRect(x-77,y+47,154,5);c.fillStyle='#f4d480';c.fillRect(x-77,y+47,154*progress,5);}
    const p=SPRITE_ROUTES.constructionWorker;
    for(let n=0;n<Math.min(3,d.intensity);n++){const sample=routeSample(p,frame+n*8),[a,b]=sample.point;const [u,v]=iso(DISTRICTS[d.id][0]+a,DISTRICTS[d.id][1]+b);unitSprite(c,'worker',sample.direction,u,v+29);}
    for(let n=0;n<d.intensity;n++) {c.globalAlpha=.33; c.fillStyle=ASSETS.effects.dust;const step=(frame+n*2)%6;c.fillRect(x-45+n*23+step*2,y+22-step*4,6+step*2,4+step);c.globalAlpha=1;}
  }
}
function units(m,frame) {
  const c=m.ctx.units;clear(c);let count=0;const facings=[];
  for(const [name,r] of Object.entries(SPRITE_ROUTES)) {
    if(!r.category||m.state.city.buildings[r.category]<r.minLevel)continue;
    if((m.state.city.constraints.resourceShortage||m.state.city.constraints.excessCapacity)&&name==='farmTractor')continue;
    if(m.state.city.constraints.resourceShortage&&name==='researchService')continue;
    const sample=routeSample(r,frame+count*19),[x,y]=iso(...sample.point);
    unitSprite(c,r.unit,sample.direction,x,y+17);facings.push(`${name}:${sample.direction}`);count++;
  }
  m.el.dataset.units=String(count);
  m.el.dataset.unitFacings=facings.join(',');
  // Fixed street routes pass behind district sprites; alpha masks prevent roof traffic.
  c.globalCompositeOperation='destination-out';c.drawImage(m.ctx.buildings.canvas,0,0);c.globalCompositeOperation='source-over';
}
function ambient(m,frame) {
  const c=m.ctx.ambient;clear(c);const city=m.state.city,con=city.constraints;
  if(city.buildings.capital>=2 && !con.resourceShortage) {
    const [x,y]=iso(...DISTRICTS.capital);
    for(let n=0;n<3;n++){const f=(frame+n*2)%6;c.globalAlpha=.28*(1-f/7);c.fillStyle=ASSETS.effects.smoke;c.fillRect(x-26+f*3,y-83-f*6,5+f*2,4+f);}
    c.globalAlpha=1;
  }
  if(city.buildings.resources>=2 && !con.resourceShortage && !con.excessCapacity){const [x,y]=iso(...DISTRICTS.resources);line(c,[x-53,y+5],[x-18,y+22],frame%3?'#8fc4c0':'#c6d8c8',2);}
  for(const key of ['research','education','capital']) if(city.buildings[key]>0){const [x,y]=iso(...DISTRICTS[key]);c.fillStyle=key==='capital'&&con.technologyAdoption?'#68786c':frame%4<2?'#e8d690':'#78ada0';c.fillRect(x+13,y-48,3,3);}
  if(con.resourceShortage){const [x,y]=iso(...DISTRICTS.resources);c.globalAlpha=.18;poly(c,[[x-72,y],[x,y+36],[x+65,y+3],[x,y-28]],'#b49a52');c.globalAlpha=1;}
}
function ownership(m) {
  const c=m.ctx.ownership;clear(c);const d=m.state.districts.find(d=>d.id===m.state.selected);
  if(d){const [x,y]=iso(...DISTRICTS[d.id]);c.globalAlpha=.1;poly(c,[[x-92,y-40],[x,y-120],[x+92,y-40],[x,y+40]],'#ffdd86');c.globalAlpha=1;c.lineWidth=2;poly(c,[[x-92,y-40],[x,y-120],[x+92,y-40],[x,y+40]],null,'#f4d58c');}
  const color=m.state.owner==='player'?'#8bbdb2':m.state.owner==='rival'?'#d4a16f':'#b4bf9c';
  line(c,[42,431],[42,397],'#d7d5b3',2);poly(c,[[43,397],[63,399],[61,410],[43,408]],color);
  for(const [index,d] of m.state.diagnostics.entries()){const [x,y]=iso(...DISTRICTS[d.category]);const offset=m.state.diagnostics.slice(0,index).filter(v=>v.category===d.category).length*18;c.fillStyle='#2c3932';c.fillRect(x+50,y-61+offset,18,16);c.fillStyle='#f2cb77';c.font='bold 12px monospace';c.fillText('!',x+56,y-49+offset);}
}
function resolution(m,now) {
  const c=m.ctx.resolution;clear(c);if(m.state.phase!=='resolved'||now-m.born>1500||motion.matches)return;
  const latest=m.state.city.history.at(-1);if(!latest)return;
  for(const d of m.state.districts)if(latest.allocation[d.id]>0){const [x,y]=iso(...DISTRICTS[d.id]);c.globalAlpha=Math.max(0,1-(now-m.born)/1500);c.fillStyle='#263e36';c.fillRect(x-43,y+43,86,17);c.fillStyle='#f4daa1';c.font='bold 10px monospace';c.textAlign='center';c.fillText(latest.startState.buildings[d.id]<d.level?'UPGRADED':'SITE PROGRESS',x,y+55);c.textAlign='left';c.globalAlpha=1;}
}
function paint(m,now=performance.now()) {water(m,tick);construction(m,tick);units(m,tick);ambient(m,tick);resolution(m,now);draws++;}
function animate(now) {
  raf=0;if(document.hidden||motion.matches)return;
  if(now-lastTime>=1000/MAP.fps){tick++;lastTime=now;for(const m of instances.values())if(m.visible)paint(m,now);}
  if(instances.size)raf=requestAnimationFrame(animate);
}
function restartClock(){cancelAnimationFrame(raf);raf=0;lastTime=0;if(!document.hidden&&!motion.matches&&instances.size)raf=requestAnimationFrame(animate);}
const observer=typeof IntersectionObserver==='function'?new IntersectionObserver(entries=>{for(const e of entries){const m=instances.get(e.target.dataset.map);if(m){m.visible=e.isIntersecting;if(m.visible)paint(m);}}},{rootMargin:'100px'}):null;
if(typeof document!=='undefined') {
  document.addEventListener('visibilitychange',restartClock);
  motion.addEventListener('change',()=>{for(const m of instances.values())paint(m);restartClock();});
  window.addEventListener('pagehide',()=>{cancelAnimationFrame(raf);raf=0;observer?.disconnect();instances.clear();});
}
export async function syncCityMaps(root, descriptors) {
  cancelAnimationFrame(raf);raf=0;observer?.disconnect();instances.clear();
  const elements=descriptors.map(({city,...options})=>({el:root.querySelector(`[data-map="${city.id}"]`),state:visualState(city,options)}));
  await assetsReady();
  for(const {el,state} of elements){if(!el?.isConnected)continue;el.querySelector('.map-loading')?.remove();const ctx=Object.fromEntries(LAYERS.map(k=>{const c=el.querySelector(`[data-layer="${k}"]`).getContext('2d');c.imageSmoothingEnabled=false;return[k,c];}));const m={el,ctx,state,visible:true,born:performance.now()};instances.set(state.city.id,m);el.dataset.phase=state.phase;el.dataset.roadLevel=state.roadLevel;el.dataset.levels=state.districts.map(d=>`${d.id}:${d.level}`).join(',');el.dataset.priority=state.districts.filter(d=>d.dominant).map(d=>d.id).join(',');el.querySelector('.map-scene-description').textContent=state.districts.map(d=>`${d.id}: ${d.name}, level ${d.level}${d.partial?', materials stored for next upgrade':''}.`).join(' ')+' '+state.diagnostics.map(d=>d.detail).join(' ');terrain(m);roads(m);buildings(m);ownership(m);paint(m);observer?.observe(el);}
  restartClock();
}
export function setConstructionProgress(value){const prior=constructionStage(progress);progress=Math.max(0,Math.min(1,value));if(prior!==constructionStage(progress))for(const m of instances.values())if(m.state.phase==='building')buildings(m);}
export function updateMapSelection(cityId,selected) {const m=instances.get(cityId);if(m){m.state.selected=selected;ownership(m);}}
export function rendererStats(){return{maps:instances.size,loops:raf?1:0,atlases:images.size,draws,tick,progress,layers:LAYERS.length,states:[...instances.values()].map(m=>({city:m.state.city.id,visible:m.visible,...{districts:m.state.districts,diagnostics:m.state.diagnostics}}))};}
