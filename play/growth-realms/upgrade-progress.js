import {GAME_BALANCE as B} from './config.js';
import {BUILDING_VISUALS} from './visual-config.js';

// A view of the existing cumulative-investment rules; never mutates the city.
export function upgradeProgress(city,category,planned=0) {
  const funded=city.invested[category],level=city.buildings[category];
  const required=B.buildingPointThresholds.find(n=>n>funded);
  if(required===undefined)return {complete:true,funded,planned,level,name:BUILDING_VISUALS[category].levels[Math.min(5,level)].name};
  const nextLevel=level+1;
  const name=nextLevel<=5?BUILDING_VISUALS[category].levels[nextLevel].name:`${BUILDING_VISUALS[category].levels[5].name} · annex ${nextLevel-5}`;
  return {complete:false,name,funded,required,planned,projected:funded+planned,remaining:Math.max(0,required-funded-planned)};
}
