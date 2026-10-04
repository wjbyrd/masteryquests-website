// Presentation only. Model levels and cumulative investment are authoritative.
import { GAME_BALANCE as B, CATEGORIES } from './config.js';
import {DISTRICT_PARCELS, DISTRICT_SPRITES, ROAD_LAYOUT, WORKER_PATH, CAMPUS_WALK, FARM_ROUTE} from './district-layout.js';

export const MAP = { width: 1344, height: 816, tileWidth: 64, tileHeight: 32, fps: 8 };
// Crop only empty backdrop / outer terrain; district art stays inside the camera.
export const CAMERA = { x: 16, y: 0, width: 1312, height: 784 };
export const LAYERS = ['terrain', 'water', 'roads', 'buildings', 'units', 'construction', 'ambient', 'ownership', 'resolution'];
const atlas = (file, columns, rows) => ({ src: `assets/sprites/${file}.png`, columns, rows, temporary: true });
export const ASSETS = {
  capital: atlas('capital', 3, 2), resources: atlas('resources', 3, 2),
  research: atlas('research', 3, 2), education: atlas('education', 3, 2),
  support: atlas('support', 4, 4),
  vehicles: { ...atlas('vehicles-directional', 4, 2), trim: true }, people: { ...atlas('people-directional', 2, 2), trim: true },
  walk: {columns:38,rows:1,generated:true}, // Long Run cached poses, built by walking-sprites.js.
  // Code-native pixel tiles and effects share this replaceable palette contract.
  terrain: { grass: ['#7f9362', '#879c69', '#819766', '#8ca16e'], earth: '#5e6647', sand: '#b1a077' },
  water: { base: '#477e87', deep: '#386c79', light: '#8bb2ae', frames: 6 },
  roads: { dirt: '#a29473', improved: '#929184', paved: '#555e5e', arterial: '#455457', marking: '#c1b9a0' },
  sidewalks: { paving:'#b3b3a0', joint:'#939789', curb:'#ddd9c3', service:'#b2aa8c' },
  effects: { dust: '#cabb91', smoke: '#b9c0b0', crane: '#d7ab4e', glow: '#f6d987', frames: 6 },
};
export const SUPPORT = { house: 0, apartments: 1, warehouse: 2, power: 3, tree: 4, pine: 5, truck: 6, bus: 7, tractor: 8, van: 9, worker: 10, students: 11, prep: 12, foundation: 13, frame: 14, finishing: 15 };
// Measured source rectangles compensate for the temporary atlas's uneven gutters.
// Coordinates use its native 1254 x 1254 canvas; replacement sheets may use uniform cells.
ASSETS.support.rects = [
  [12,100,309,258], [332,45,267,313], [604,103,313,268], [930,94,306,271],
  [40,378,263,290], [365,364,195,309], [613,421,260,234], [886,412,349,247],
  [42,720,247,203], [351,720,219,190], [691,716,158,181], [950,717,254,189],
  [8,964,327,264], [336,1010,311,202], [640,895,300,344], [939,925,300,308],
];
const names = {
  capital: ['Serviced lot', 'Workshop', 'Factory', 'Industrial complex', 'Advanced manufacturing', 'Integrated logistics'],
  resources: ['Cultivated land', 'Organized farm', 'Irrigation and storage', 'Mechanized agriculture', 'Resource network', 'High-efficiency resource system'],
  research: ['Open research lot', 'Technical office', 'Research laboratory', 'Research center', 'Technology campus', 'Innovation district'],
  education: ['Local school', 'Expanded school', 'Technical college', 'University', 'Large university', 'Education and training campus'],
};
export const DISTRICTS = Object.fromEntries(Object.entries(DISTRICT_PARCELS.meridian).map(([id,p])=>[id,[p.anchorX,p.anchorY]]));
export const CROSS_ROAD = ROAD_LAYOUT.cross;
export const ROADS = ROAD_LAYOUT;
export const DISTRICT_HITBOX = { width: 224, height: 216, offsetY: -40 };
const facings = (asset, rear, front, size) => ({
  NE: { asset, frame: rear, flip: false, size }, NW: { asset, frame: rear, flip: true, size },
  SW: { asset, frame: front, flip: false, size }, SE: { asset, frame: front, flip: true, size },
});
export const UNIT_VISUALS = {
  truck: facings('vehicles', 0, 1, 49), bus: facings('vehicles', 2, 3, 57),
  tractor: facings('vehicles', 4, 5, 43), van: facings('vehicles', 6, 7, 43),
  worker: facings('walk', 14, 22, 25), students: facings('walk', 14, 22, 28),
};
// Ground dimensions exclude vehicle roofs and passenger height. Their rendered
// bottom/front ground contact is derived from this footprint, not a magic Y shift.
export const UNIT_GROUND = {truck:[1.3,.6],bus:[1.55,.55],tractor:[1.1,.6],van:[1.1,.55],students:[.5,.4],worker:[.4,.4]};
export const BUILDING_VISUALS = Object.fromEntries(CATEGORIES.map(c => [c.id, {
  levels: names[c.id].map((name, level) => ({ name, ...DISTRICT_SPRITES[c.id][level] })),
  states: ['absent', 'site-prep', 'construction', 'complete', 'upgraded'],
  construction: ['prep', 'foundation', 'frame', 'finishing'],
}]));
const innerLane = [[ROADS.spine+.4, CROSS_ROAD+.4],[ROADS.east-.4,CROSS_ROAD+.4],[ROADS.east-.4,ROADS.front-.4],[ROADS.spine+.4,ROADS.front-.4]];
const outerLane = [[ROADS.spine-.4,CROSS_ROAD-.4],[ROADS.spine-.4,ROADS.front+.4],[ROADS.east+.4,ROADS.front+.4],[ROADS.east+.4,CROSS_ROAD-.4]];
export const SPRITE_ROUTES = {
  factoryTruck: {category:'capital',minLevel:1,unit:'truck',lane:'clockwise',speed:1.7,offset:0,period:164,points:innerLane},
  factoryDelivery: {category:'capital',minLevel:2,unit:'truck',lane:'clockwise',speed:1.7,offset:6,period:164,points:innerLane},
  campusBus: {category:'education',minLevel:2,unit:'bus',lane:'clockwise',speed:2.3,offset:15,period:122,points:innerLane},
  researchService: {category:'research',minLevel:1,unit:'van',lane:'counterclockwise',speed:1.45,offset:7,period:228,points:outerLane},
  campusShuttle: {category:'education',minLevel:3,unit:'bus',lane:'counterclockwise',speed:2.3,offset:26,period:144,points:outerLane},
  farmTractor: {category:'resources',minLevel:1,unit:'tractor',service:true,speed:.8,period:120,points:FARM_ROUTE},
  campusStudents: {category:'education',minLevel:1,unit:'students',pedestrian:true,period:384,points:CAMPUS_WALK},
  constructionWorker: {category:null,unit:'worker',pedestrian:true,period:192,points:WORKER_PATH},
};
export const DIAGNOSTICS = {
  resourceShortage: { category: 'resources', label: 'Resource strain', detail: 'Food, water, and utilities cannot keep up with production. Resource investment can ease the strain.' },
  technologyAdoption: { category: 'research', label: 'Skills constraint', detail: 'Available technology is ahead of workforce training. Education helps workers put those methods to use.' },
  skillsUnderused: { category: 'education', label: 'Skills underused', detail: 'Skills underused: trained workers need complementary equipment.' },
  excessCapacity: { category: 'resources', label: 'Spare capacity', detail: 'Resource services have room to support more production. More capacity alone adds little productivity.' },
  capitalSaturation: { category: 'capital', label: 'Capital mature', detail: 'Capital saturation: additions improve an already mature industrial district.' },
};
export const iso = (i, j) => [672 + (i - j) * 32, 80 + (i + j) * 16];
export function intensity(points) { return points === 0 ? 0 : points <= 3 ? 1 : points <= 6 ? 2 : points <= 9 ? 3 : 4; }
export function constructionStage(progress) { return ['site-prep', 'foundation', 'frame', 'finishing', 'complete'][Math.max(0, Math.min(4, Math.floor(progress * 5)))]; }
export function visualState(city, { allocation = {}, pending = null, phase = 'planning', selected = null, owner = 'preview' } = {}) {
  const max = Math.max(0, ...Object.values(allocation));
  const districts = CATEGORIES.map(c => {
    const level = city.buildings[c.id], points = allocation[c.id] || 0;
    const invested = city.invested[c.id] || 0;
    const crossed = B.buildingPointThresholds.filter(t => invested >= t);
    const last = crossed.at(-1) || 0, next = B.buildingPointThresholds.find(t => t > invested);
    const nextLevel = pending?.buildings[c.id] ?? level;
    return { id: c.id, level, frame: Math.min(5, level), annexes: Math.max(0, level - 5), nextLevel,
      name: BUILDING_VISUALS[c.id].levels[Math.min(5, level)].name,
      points, intensity: intensity(points), dominant: points > 0 && points === max,
      changed: nextLevel > level, progress: next ? (invested - last) / (next - last) : 0,
      partial: next != null && invested > last, state: phase === 'building' && points > 0 ? 'site-prep' : level === 0 ? 'absent' : level > B.initialBuildings[city.id][c.id] ? 'upgraded' : 'complete' };
  });
  return { city, phase, selected, owner, districts, roadLevel: Math.min(4, city.buildings.capital),
    diagnostics: Object.entries(DIAGNOSTICS).filter(([key]) => city.constraints[key]).map(([key, value]) => ({ key, ...value })) };
}
