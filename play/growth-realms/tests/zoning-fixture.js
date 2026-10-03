// Local developer fixture only; publication excludes the entire tests directory.
// It calls the production renderer; no alternative layout or art is supplied.
import {createCities} from '../model.js';
import {GAME_BALANCE} from '../config.js';
import {renderCityMap,syncCityMaps,setConstructionProgress,rendererStats} from '../map-engine.js';
import {MAP,iso,SPRITE_ROUTES} from '../visual-config.js';
import {DISTRICT_PARCELS,PROTECTED_ROADS} from '../district-layout.js';
import {parcelBounds} from '../scene-layout.js';
const $=s=>document.querySelector(s);let current={city:'meridian',mode:'max',construction:false,progress:.4};
export async function show(options={}){
  current={...current,...options};const city=createCities().find(c=>c.id===current.city);
  if(current.mode!=='start')for(const key of Object.keys(city.buildings))city.buildings[key]=current.levels?.[key]??(current.mode==='max'?GAME_BALANCE.initialBuildings[city.id][key]+GAME_BALANCE.buildingPointThresholds.length:current.level);
  const pending=structuredClone(city);if(current.construction)for(const key of Object.keys(city.buildings))city.buildings[key]=Math.max(0,city.buildings[key]-1);
  const phase=current.construction?'building':'planning',allocation=Object.fromEntries(Object.keys(city.buildings).map(k=>[k,20]));
  $('#fixture').innerHTML=renderCityMap(city,{phase,owner:'player'});
  setConstructionProgress(current.progress);await syncCityMaps($('#fixture'),[{city,phase,owner:'player',allocation:current.construction?allocation:{},pending:current.construction?pending:null}]);
  $('#city').value=city.id;$('#building').checked=current.construction;$('#progress').value=current.progress;
  const a=rendererStats().states[0].layout;$('#audit').textContent=`${city.name} · ${current.mode} · ${current.construction?'construction':'complete'}\n${a.errors.length? a.errors.join('\n'):'0 spatial conflicts'}\nHidden scenery: ${a.hiddenScenery.join(', ')||'none'}`;
  overlay();document.body.dataset.ready='true';return a;
}
function overlay(){
  document.querySelector('.zone-overlay')?.remove();if(!$('#overlay').checked)return;
  const state=rendererStats().states[0],rect=(r,color)=>`<polygon points="${[[r.minI,r.minJ],[r.maxI,r.minJ],[r.maxI,r.maxJ],[r.minI,r.maxJ]].map(p=>iso(...p).join(',')).join(' ')}" fill="${color}" fill-opacity=".12" stroke="${color}" stroke-width="2"/>`;
  const paths=Object.values(SPRITE_ROUTES).filter(r=>r.category).map(r=>`<polyline points="${[...r.points,r.points[0]].map(p=>iso(...p).join(',')).join(' ')}" fill="none" stroke="#ffec9c" stroke-width="2" stroke-dasharray="6 5"/>`).join('');
  document.querySelector('.map-world').insertAdjacentHTML('beforeend',`<svg class="zone-overlay" viewBox="0 0 ${MAP.width} ${MAP.height}">${PROTECTED_ROADS.map(r=>rect(r,'#ff8291')).join('')}${Object.values(DISTRICT_PARCELS[current.city]).map(p=>rect(parcelBounds(p),'#ffffff')).join('')}${state.layout.occupied.map(r=>rect(r,'#65eac6')).join('')}${paths}</svg>`);
}
$('#city').onchange=()=>show({city:$('#city').value});$('#start').onclick=()=>show({mode:'start',levels:null});$('#max').onclick=()=>show({mode:'max',levels:null});
$('#level').onchange=()=>show({mode:'level',level:Number($('#level').value),levels:null});$('#building').onchange=()=>show({construction:$('#building').checked});
$('#progress').oninput=()=>show({progress:Number($('#progress').value)});$('#overlay').onchange=overlay;
await show();
