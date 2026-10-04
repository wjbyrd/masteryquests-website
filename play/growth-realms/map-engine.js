import { MAP, CAMERA, ASSETS, SUPPORT, BUILDING_VISUALS, ROADS, DISTRICT_HITBOX, UNIT_VISUALS, SPRITE_ROUTES, LAYERS, iso, visualState, constructionStage } from './visual-config.js';
import { CATEGORIES } from './config.js';
import { routeSample } from './unit-routes.js';
import {groundContact, depthOrder, layoutAudit, buildingFootprint, unitFootprint, constructionWalks} from './scene-layout.js';
import {PROTECTED_ROADS, SIDEWALKS, districtAnchor, ANNEX_SITES, ANNEX_SCALE, SERVICE_AREAS, CONSTRUCTION_VISUALS} from './district-layout.js';

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
  const camera = `--map-aspect:${CAMERA.width}/${CAMERA.height};--map-ratio:${CAMERA.width/CAMERA.height};--world-width:${MAP.width / CAMERA.width * 100}%;--world-height:${MAP.height / CAMERA.height * 100}%;--world-left:${-CAMERA.x / CAMERA.width * 100}%;--world-top:${-CAMERA.y / CAMERA.height * 100}%`;
  return `<div class="city-map" data-map="${city.id}" style="${camera}" aria-label="${esc(city.name)} isometric city"><div class="map-loading">Loading district sprites…</div><div class="map-world">${LAYERS.map(layer => `<canvas class="map-layer ${layer}-layer" data-layer="${layer}" width="${MAP.width}" height="${MAP.height}" aria-hidden="true"></canvas>`).join('')}<div class="district-hitboxes">${CATEGORIES.map(c => {
    const [x,y]=iso(...districtAnchor(city,c.id)), box=DISTRICT_HITBOX;
    return `<button class="district-hitbox" data-map-district="${c.id}" data-city="${city.id}" style="left:${(x-box.width/2)/MAP.width*100}%;top:${(y+box.offsetY-box.height/2)/MAP.height*100}%;width:${box.width/MAP.width*100}%;height:${box.height/MAP.height*100}%" aria-label="${esc(c.name)} district. ${owner==='player'&&phase==='planning'?'Activate to invest one development point.':'Activate to inspect.'}" aria-pressed="false" ${phase==='building'?'disabled':''}><span class="sr-only">${esc(c.name)}</span></button>`;
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
export {sprite as drawAtlasSprite};
function unitSprite(ctx, unit, direction, x, y) {
  const v=UNIT_VISUALS[unit][direction];sprite(ctx,v.asset,v.frame,x,y,v.size,v.flip);
}
function clear(ctx) { ctx.clearRect(0, 0, MAP.width, MAP.height); }
function terrain(m) {
  const c = m.ctx.terrain, theme = getComputedStyle(document.documentElement), texture = theme.getPropertyValue('--mq-navy').trim();
  clear(c); c.fillStyle = theme.getPropertyValue('--mq-bg-dark').trim(); c.fillRect(0,0,MAP.width,MAP.height);
  // Pixel grain is deterministic: changing a plan never randomizes the world.
  for (let y=0;y<MAP.height;y+=4) for(let x=0;x<MAP.width;x+=4) if((x*17+y*31)%37<7) { c.fillStyle=texture; c.fillRect(x,y,2,2); }
  const left=iso(0,ROADS.extent),front=iso(ROADS.extent,ROADS.extent),right=iso(ROADS.extent,0);
  poly(c, [[left[0]-32,left[1]+16],[front[0],front[1]+32],[right[0]+32,right[1]+16],[right[0]+32,right[1]+34],[front[0],front[1]+50],[left[0]-32,left[1]+34]], ASSETS.terrain.earth);
  for(let i=0;i<=ROADS.extent;i++) for(let j=0;j<=ROADS.extent;j++) {
    if(j===ROADS.river) continue; tile(c,i,j,ASSETS.terrain.grass[(i*7+j*3)%4]);
    const [x,y]=iso(i,j); for(let n=0;n<12;n++){c.fillStyle=n%2?'#94a571':'#728959';c.fillRect(x-19+(n*17+i*13)%39,y+10+(n*7+j*3)%13,2,1);}
  }
}
function groundRect(c,b,color,edge){poly(c,[[b.minI,b.minJ],[b.maxI,b.minJ],[b.maxI,b.maxJ],[b.minI,b.maxJ]].map(p=>iso(...p)),color,edge);}
function sidewalks(m){
  const c=m.ctx.roads,palette=ASSETS.sidewalks;
  for(const s of SIDEWALKS){
    groundRect(c,s,palette.paving,palette.curb);
    if(s.maxI-s.minI>s.maxJ-s.minJ){for(let i=Math.ceil(s.minI);i<s.maxI;i++)line(c,iso(i,s.minJ),iso(i,s.maxJ),palette.joint);}
    else for(let j=Math.ceil(s.minJ);j<s.maxJ;j++)line(c,iso(s.minI,j),iso(s.maxI,j),palette.joint);
  }
  // Construction workers have a paved access walk, separate from traffic.
  if(m.state.phase==='building')for(const d of m.state.districts.filter(d=>d.points>0))for(const path of constructionWalks(m.state.city,d.id))groundRect(c,path,palette.service,palette.joint);
}
function roads(m) {
  const c=m.ctx.roads, level=m.state.roadLevel; clear(c);
  sidewalks(m);
  const color=ASSETS.roads[['dirt','dirt','improved','paved','arterial'][level]];
  for(const road of PROTECTED_ROADS)groundRect(c,road,color,level>=3?'#8b9290':'#a4a183');
  if(level>=3)for(let n=.5;n<ROADS.extent+1;n++){
    for(const [a,b]of [[[n,ROADS.cross],[n+.3,ROADS.cross]],[[n,ROADS.front],[n+.3,ROADS.front]],[[ROADS.spine,n],[ROADS.spine,n+.3]],...(n<ROADS.river?[[[ROADS.east,n],[ROADS.east,n+.3]]]:[])]){
      const junction=[ROADS.spine,ROADS.east].some(v=>Math.abs(a[0]-v)<.7)&&[ROADS.cross,ROADS.front].some(v=>Math.abs(a[1]-v)<.7);
      if(!junction)line(c,iso(...a),iso(...b),ASSETS.roads.marking,2);
    }
  }
  for(const center of [ROADS.spine,ROADS.east]){
    groundRect(c,{minI:center-.5,maxI:center+.5,minJ:ROADS.river,maxJ:ROADS.river+1},'#89958d');
    for(const i of [center-.5,center+.5])line(c,iso(i,ROADS.river),iso(i,ROADS.river+1),'#ccd0b3',3);
  }
}
// Draw the measured source rectangle around the same ground anchor at every tier.
// The generic atlas helper remains unchanged for the title illustration.
export function districtSprite(c,id,level,x,y,scale=1){
  const v=BUILDING_VISUALS[id].levels[Math.min(5,level)],img=images.get(id);if(!img)return;
  c.drawImage(img,...v.sourceRect,Math.round(x-v.anchorOffsetX*scale),Math.round(y-v.anchorOffsetY*scale),v.width*scale,v.height*scale);
}
function drawBuilding(m,d,ctx=m.ctx.buildings) {
  const [x,y]=iso(...districtAnchor(m.state.city,d.id));
  let level=d.level;
  if(m.state.phase==='building' && d.changed && progress>=.2 && progress<.8) return;
  if(m.state.phase==='building' && d.changed && progress>=.8) level=d.nextLevel;
  districtSprite(ctx,d.id,level,x,y);
  if(d.partial && m.state.phase!=='building')districtMaterials(ctx,m,d,Math.max(1,Math.ceil(d.progress*4)));
}
function districtMaterials(c,m,d,count){
  const anchor=districtAnchor(m.state.city,d.id),offset=SERVICE_AREAS.materials.offset;
  // Each pallet is placed along the reserved service strip in map coordinates.
  for(let n=0;n<count;n++){
    const i=anchor[0]+offset[0],j=anchor[1]-.55+n*.35;
    const corners=[[i-.15,j-.15],[i+.15,j-.15],[i+.15,j+.15],[i-.15,j+.15]].map(p=>iso(...p));
    poly(c,corners,'#9b7952');poly(c,corners.map(([x,y])=>[x,y-4]),'#d4bd87','#9b7952');
  }
}
function constructionSprite(c,key,x,y,intensity){
  const v=CONSTRUCTION_VISUALS[key],rect=ASSETS.support.rects[SUPPORT[key]],scale=v.scale*(.55+intensity*.1125);
  c.drawImage(images.get('support'),...rect,x-v.anchorOffsetX*scale,y-v.anchorOffsetY*scale,rect[2]*scale,rect[3]*scale);
}
function buildings(m) {
  clear(m.ctx.buildings);
  const levels=Object.fromEntries(m.state.districts.map(d=>[d.id,m.state.phase==='building'?Math.max(d.level,d.nextLevel):d.level]));
  m.layout=layoutAudit(m.state.city.id,levels,{construction:m.state.phase==='building'});
  // Fail closed: never silently paint an invalid upgrade over a protected road.
  m.el.dataset.layoutErrors=String(m.layout.errors.length);
  if(m.layout.errors.length){m.layout.errors.forEach(error=>console.error(error));m.objects=[];return;}
  const objects=[];
  for(const p of m.layout.scenery){
    const size={tree:66,house:88,apartments:105,warehouse:111,power:100}[p.type];
    const foot=groundContact(...p.center,p.type==='tree'?0:p.half*32);
    objects.push({id:p.id,foot,draw:c=>sprite(c,'support',SUPPORT[p.type],foot.x,foot.y,size)});
  }
  for(const d of m.state.districts){
    const [i,j]=districtAnchor(m.state.city,d.id),[x,y]=iso(i,j),level=m.state.phase==='building'&&progress>=.8?d.nextLevel:d.level;
    const footprint=buildingFootprint(m.state.city,d.id,level);
    objects.push({id:'district:'+d.id,foot:groundContact(footprint.maxI,footprint.maxJ),draw:c=>{
      drawBuilding(m,d,c);
      if(m.state.phase==='building'&&d.points>0){
        if(d.changed&&progress<.8){const stage=constructionStage(progress),key={'site-prep':'prep',foundation:'foundation',frame:'frame',finishing:'finishing'}[stage];constructionSprite(c,key,x,y,d.intensity);}
        else if(!d.changed){constructionSprite(c,'prep',x,y,Math.max(1,d.intensity-1));districtMaterials(c,m,d,d.intensity);}
      }
    }});
    for(let n=0;n<Math.max(0,level-5);n++){
      const [a,b]=ANNEX_SITES[n],footprint=buildingFootprint(m.state.city,d.id,1,[a,b],ANNEX_SCALE),[ax,ay]=iso(i+a,j+b);
      objects.push({id:'annex:'+d.id+':'+n,foot:groundContact(footprint.maxI,footprint.maxJ),draw:c=>districtSprite(c,d.id,1,ax,ay,ANNEX_SCALE)});
    }
  }
  m.objects=objects;
}
function water(m,frame) {
  const c=m.ctx.water;clear(c);
  for(let i=0;i<=ROADS.extent;i++) {tile(c,i,ROADS.river,ASSETS.water.base);const [x,y]=iso(i,ROADS.river);for(let n=0;n<4;n++){const k=(frame+n*2+i)%6;line(c,[x-17+k*3,y+10+n*4],[x-8+k*3,y+14+n*4],n%2?ASSETS.water.light:ASSETS.water.deep,2);}}
}
function construction(m,frame) {
  const c=m.ctx.construction;clear(c);const active=m.state.phase==='building'&&!m.layout?.errors.length;
  m.el.dataset.construction=active?constructionStage(progress):'none';
  if(!active)return;
  for(const d of m.state.districts.filter(d=>d.points>0)){
    const [x,y]=iso(...districtAnchor(m.state.city,d.id));
    if(d.dominant){c.strokeStyle='#ffffff';c.lineWidth=1;c.strokeRect(x-77,y+47,154,4);c.fillStyle='#ffffff';c.fillRect(x-77,y+47,154*progress,4);}
    for(let n=0;n<d.intensity;n++){c.globalAlpha=.33;c.fillStyle=ASSETS.effects.dust;const step=(frame+n*2)%6;c.fillRect(x-45+n*23+step*2,y+22-step*4,6+step*2,4+step);c.globalAlpha=1;}
  }
}
function units(m,frame) {
  const c=m.ctx.units;clear(c);let count=0;const facings=[],objects=[...m.objects],moving=[];
  const addUnit=(id,unit,sample)=>{const footprint=unitFootprint(unit,sample.point,sample.direction),foot=groundContact(footprint.maxI,footprint.maxJ);objects.push({id,foot,draw:ctx=>unitSprite(ctx,unit,sample.direction,foot.x,foot.y)});moving.push({id,point:sample.point,direction:sample.direction,foot,footprint});};
  for(const [name,r]of Object.entries(SPRITE_ROUTES)){
    if(!r.category||m.state.city.buildings[r.category]<r.minLevel)continue;
    if((m.state.city.constraints.resourceShortage||m.state.city.constraints.excessCapacity)&&name==='farmTractor')continue;
    if(m.state.city.constraints.resourceShortage&&name==='researchService')continue;
    const sample=routeSample(r,frame+count*19);addUnit(name,r.unit,sample);facings.push(name+':'+sample.direction);count++;
  }
  if(!m.layout?.errors.length&&m.state.phase==='building')for(const d of m.state.districts.filter(d=>d.points>0)){
    const [i,j]=districtAnchor(m.state.city,d.id),[x,y]=iso(i,j);
    if(d.changed&&progress>=.4&&progress<.8&&d.intensity>=3)objects.push({id:'crane:'+d.id,foot:groundContact(i+SERVICE_AREAS.crane.offset[0],j),draw:c=>{const [cx,baseY]=iso(i+SERVICE_AREAS.crane.offset[0],j),cy=baseY-45;line(c,[cx,cy+45],[cx,cy-65],ASSETS.effects.crane,3);line(c,[cx-29,cy-62],[cx+74,cy-11],ASSETS.effects.crane,4);line(c,[cx+62,cy-17],[cx+62,cy+9+(frame%4)*3],'#3e4540',1);}});
    for(let n=0;n<Math.min(3,d.intensity);n++){const sample=routeSample(SPRITE_ROUTES.constructionWorker,frame+n*8);sample.point=[sample.point[0]+i,sample.point[1]+j];addUnit('worker:'+d.id+':'+n,'worker',sample);}
  }
  objects.sort(depthOrder).forEach(o=>o.draw(c));
  m.moving=moving;m.depthOrder=objects.map(o=>({id:o.id,foot:o.foot}));
  m.el.dataset.units=String(count);m.el.dataset.unitFacings=facings.join(',');
  m.el.dataset.depthOrder=objects.map(o=>o.id).join(',');
}
function ambient(m,frame) {
  const c=m.ctx.ambient;clear(c);if(m.layout?.errors.length)return;const city=m.state.city,con=city.constraints;
  if(city.buildings.capital>=2 && !con.resourceShortage) {
    const [x,y]=iso(...districtAnchor(city,'capital'));
    for(let n=0;n<3;n++){const f=(frame+n*2)%6;c.globalAlpha=.28*(1-f/7);c.fillStyle=ASSETS.effects.smoke;c.fillRect(x-26+f*3,y-83-f*6,5+f*2,4+f);}
    c.globalAlpha=1;
  }
  if(city.buildings.resources>=2 && !con.resourceShortage && !con.excessCapacity){const [x,y]=iso(...districtAnchor(city,'resources'));line(c,[x-53,y+5],[x-18,y+22],frame%3?'#8fc4c0':'#c6d8c8',2);}
}
function ownership(m) {
  // Targeting lives on the accessible district button so hover, focus and selection
  // share one circular marker and stay aligned with the actual interaction target.
  clear(m.ctx.ownership);
}

function resolution(m,now) {
  const c=m.ctx.resolution;clear(c);if(m.layout?.errors.length||m.state.phase!=='resolved'||now-m.born>1500||motion.matches)return;
  const latest=m.state.city.history.at(-1);if(!latest)return;
  for(const d of m.state.districts)if(latest.allocation[d.id]>0){const [x,y]=iso(...districtAnchor(m.state.city,d.id));c.globalAlpha=Math.max(0,1-(now-m.born)/1500);c.fillStyle='#263e36';c.fillRect(x-43,y+43,86,17);c.fillStyle='#f4daa1';c.font='bold 10px monospace';c.textAlign='center';c.fillText(latest.startState.buildings[d.id]<d.level?'UPGRADED':'UPGRADE FUNDED',x,y+55);c.textAlign='left';c.globalAlpha=1;}
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
  for(const {el,state} of elements){if(!el?.isConnected)continue;el.querySelector('.map-loading')?.remove();const ctx=Object.fromEntries(LAYERS.map(k=>{const c=el.querySelector(`[data-layer="${k}"]`).getContext('2d');c.imageSmoothingEnabled=false;return[k,c];}));const m={el,ctx,state,visible:true,born:performance.now()};instances.set(state.city.id,m);el.dataset.phase=state.phase;el.dataset.roadLevel=state.roadLevel;el.dataset.levels=state.districts.map(d=>`${d.id}:${d.level}`).join(',');el.dataset.priority=state.districts.filter(d=>d.dominant).map(d=>d.id).join(',');el.querySelector('.map-scene-description').textContent=state.districts.map(d=>`${d.id}: ${d.name}, level ${d.level}${d.partial?', next upgrade partly funded':''}.`).join(' ')+' '+state.diagnostics.map(d=>d.detail).join(' ');terrain(m);roads(m);buildings(m);ownership(m);paint(m);observer?.observe(el);}
  restartClock();
}
export function setConstructionProgress(value){const prior=constructionStage(progress);progress=Math.max(0,Math.min(1,value));if(prior!==constructionStage(progress))for(const m of instances.values())if(m.state.phase==='building')buildings(m);}
export function updateMapSelection(cityId,selected) {const m=instances.get(cityId);if(m){m.state.selected=selected;ownership(m);}}
export function rendererStats(){return{maps:instances.size,loops:raf?1:0,atlases:images.size,draws,tick,progress,layers:LAYERS.length,states:[...instances.values()].map(m=>({city:m.state.city.id,visible:m.visible,layout:m.layout,moving:m.moving,depthOrder:m.depthOrder,...{districts:m.state.districts,diagnostics:m.state.diagnostics}}))};}
