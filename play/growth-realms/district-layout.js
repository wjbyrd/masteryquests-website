// Presentation geometry only. Coordinates are continuous ground-plane tiles;
// iso(i,j) is a ground point (not a tile's top-left plus an implicit half tile).
// These parcels reserve the largest authored lot, four post-level-5 annexes,
// and an outer service walk. Identical zoning is intentional for the two cities.
const parcel = (anchorX, anchorY) => ({
  anchorX, anchorY, width: 6.5, height: 6.5, padding: .3,
  // Configurable directional expansion uses four map-space extents instead of
  // compass names. Structures leave .3 tile for the outer service walk.
  expansionLimits: {negativeI: 2.95, positiveI: 2.95, negativeJ: 2.95, positiveJ: 2.95},
});
export const DISTRICT_PARCELS = {
  meridian: {education: parcel(3.75,3.75), capital: parcel(13.25,3.75), resources: parcel(3.75,13.25), research: parcel(13.25,13.25)},
  rivermark: {education: parcel(3.75,3.75), capital: parcel(13.25,3.75), resources: parcel(3.75,13.25), research: parcel(13.25,13.25)},
};
export const districtAnchor = (city,id) => {
  const p=DISTRICT_PARCELS[typeof city==='string'?city:city.id][id];
  return [p.anchorX,p.anchorY];
};
export const ROAD_LAYOUT = {spine:8.5,cross:8.5,front:18,east:18,extent:19,river:19,halfWidth:.8};
// The renderer draws these exact rectangles. Intersections are their union;
// the spine includes the bridge approach and the bridge across the river.
export const PROTECTED_ROADS = [
  {id:'spine / bridge approach',minI:ROAD_LAYOUT.spine-.8,maxI:ROAD_LAYOUT.spine+.8,minJ:0,maxJ:ROAD_LAYOUT.extent+1},
  {id:'cross street',minI:0,maxI:ROAD_LAYOUT.extent+1,minJ:ROAD_LAYOUT.cross-.8,maxJ:ROAD_LAYOUT.cross+.8},
  {id:'riverfront street',minI:0,maxI:ROAD_LAYOUT.extent+1,minJ:ROAD_LAYOUT.front-.8,maxJ:ROAD_LAYOUT.front+.8},
  {id:'east street / bridge approach',minI:ROAD_LAYOUT.east-.8,maxI:ROAD_LAYOUT.east+.8,minJ:0,maxJ:ROAD_LAYOUT.extent+1},
];

// Continuous .7-tile pavements on the district side of each street, including
// joined corners. Routes stay on one block; no unmarked street crossings.
export const SIDEWALK_WIDTH=.7;
export const SIDEWALKS=[];
for(const [minI,maxI]of [[0,ROAD_LAYOUT.spine-.8],[ROAD_LAYOUT.spine+.8,ROAD_LAYOUT.east-.8]])for(const [minJ,maxJ]of [[0,ROAD_LAYOUT.cross-.8],[ROAD_LAYOUT.cross+.8,ROAD_LAYOUT.front-.8]]){
  const block=`${minI}:${minJ}`;
  SIDEWALKS.push({id:`${block}:east`,minI:maxI-SIDEWALK_WIDTH,maxI,minJ,maxJ},
    {id:`${block}:south`,minI,maxI,minJ:maxJ-SIDEWALK_WIDTH,maxJ});
  if(minI)SIDEWALKS.push({id:`${block}:west`,minI,maxI:minI+SIDEWALK_WIDTH,minJ,maxJ});
  if(minJ)SIDEWALKS.push({id:`${block}:north`,minI,maxI,minJ,maxJ:minJ+SIDEWALK_WIDTH});
}
const campusI=ROAD_LAYOUT.spine-.8-SIDEWALK_WIDTH/2,campusJ=ROAD_LAYOUT.cross-.8-SIDEWALK_WIDTH/2;
export const CAMPUS_WALK=[[1,campusJ],[campusI,campusJ],[campusI,1],[campusI,campusJ]];
// An agricultural extension outside the urban parcels, connected to Resources.
export const FARM_FIELD={minI:-2.5,maxI:0,minJ:9.8,maxJ:16.2};
export const FARM_ROUTE=[[-1.8,10.5],[-.8,10.5],[-.8,15.5],[-1.8,15.5]];

// Native 512px cells. Source rectangles exclude neighboring-frame bleed and
// transparent glow. Ground corners were measured on the actual lot artwork,
// including fences/planting/parked equipment, independently of tower height.
// Order: rear, right, front, left. The inferred rear corner may be under a roof.
// Keep the 238/512 pixel scale: a larger world does not shrink native buildings.
const scale=238/512;
const measured = {
  capital: [
    [[42,231,428,229], [[253,234],[470,347],[256,460],[42,347]]],
    [[41,200,428,260], [[254,237],[470,348],[253,460],[40,348]]],
    [[24,124,455,337], [[253,229],[479,343],[253,461],[24,343]]],
    [[9,113,502,333], [[255,176],[511,312],[270,446],[9,312]]],
    [[9,85,503,364], [[260,179],[512,315],[272,449],[9,315]]],
    [[0,58,508,391], [[255,171],[508,310],[261,449],[0,310]]],
  ],
  resources: [
    [[31,197,446,256], [[255,226],[477,340],[255,453],[31,340]]],
    [[14,141,475,324], [[252,223],[489,344],[255,465],[14,344]]],
    [[9,106,490,370], [[254,218],[499,347],[254,476],[9,347]]],
    [[14,91,490,321], [[255,163],[504,287],[255,412],[14,287]]],
    [[9,84,503,335], [[258,159],[512,289],[261,419],[9,289]]],
    [[0,53,507,394], [[252,171],[507,309],[252,447],[0,309]]],
  ],
  research: [
    [[37,199,451,270], [[254,239],[488,354],[273,469],[37,344]]],
    [[41,179,437,291], [[257,237],[478,355],[259,470],[41,350]]],
    [[28,191,464,282], [[254,237],[492,358],[270,473],[28,347]]],
    [[15,132,497,297], [[258,177],[512,319],[305,429],[15,278]]],
    [[0,31,512,401], [[254,170],[512,324],[284,432],[0,278]]],
    [[0,63,508,378], [[248,166],[508,323],[275,441],[0,283]]],
  ],
  education: [
    [[82,194,322,227], [[244,261],[404,342],[242,421],[82,342]]],
    [[0,171,493,282], [[242,198],[493,329],[255,453],[0,324]]],
    [[0,138,506,322], [[250,190],[506,325],[268,460],[0,316]]],
    [[7,19,496,390], [[254,132],[503,278],[273,409],[7,265]]],
    [[0,25,512,407], [[254,147],[512,298],[270,432],[0,279]]],
    [[0,34,508,395], [[252,145],[508,294],[266,429],[0,279]]],
  ],
};
export const DISTRICT_SPRITES=Object.fromEntries(Object.entries(measured).map(([id,levels])=>[id,levels.map(([rect,corners],frame)=>{
  // Inverse of the 64x32 isometric projection. Reserve a 2px ground-edge
  // tolerance for antialiasing; do not mistake the full image for occupied land.
  const points=corners.map(([x,y])=>[(x/64+y/32)*scale,(y/32-x/64)*scale]);
  const minI=Math.min(...points.map(p=>p[0])),maxI=Math.max(...points.map(p=>p[0]));
  const minJ=Math.min(...points.map(p=>p[1])),maxJ=Math.max(...points.map(p=>p[1]));
  const i=(minI+maxI)/2,j=(minJ+maxJ)/2;
  const sourceAnchor=[(i-j)*32/scale,(i+j)*16/scale];
  return {asset:id,frame,size:238,sourceRect:[frame%3*512+rect[0],Math.floor(frame/3)*512+rect[1],rect[2],rect[3]],
    sourceGroundCorners:corners,sourceAnchor,scale,
    width:rect[2]*scale,height:rect[3]*scale,
    anchorOffsetX:(sourceAnchor[0]-rect[0])*scale,anchorOffsetY:(sourceAnchor[1]-rect[1])*scale,
    groundFootprint:{widthTiles:maxI-minI+.125,heightTiles:maxJ-minJ+.125},
  };
})]));

// All annexes are real occupied lots in a reserved strip, not offsets scattered
// through the main building. Four covers the highest reachable level (9).
export const ANNEX_SITES=[[-1.8,2.5],[-.6,2.5],[.6,2.5],[1.8,2.5]];
export const ANNEX_SCALE=48/238;
export const CONSTRUCTION_FOOTPRINT={widthTiles:4.6,heightTiles:4.3};
export const SERVICE_AREAS={materials:{offset:[2.65,0],widthTiles:.55,heightTiles:1.6},crane:{offset:[-2.65,0],widthTiles:.4,heightTiles:.5}};
// Rear/left service walk avoids the annex strip, pallets and crane base.
export const WORKER_PATH=[[-3.05,-2.55],[-3.05,1.75],[-3.05,-2.55],[-2.3,-2.55]];
export const WORKER_FOOTPRINT=.4;

// Ground corners of the four support construction frames, relative to their
// source rectangles. The crane boom belongs to image bounds, not the base lot.
const constructionLots={
  prep:[[165,48],[327,163],[160,264],[0,115]],
  foundation:[[156,42],[311,103],[163,202],[0,93]],
  frame:[[159,138],[300,261],[141,344],[0,229]],
  finishing:[[152,149],[300,232],[145,308],[0,225]],
};
export const CONSTRUCTION_VISUALS=Object.fromEntries(Object.entries(constructionLots).map(([id,corners])=>{
  const points=corners.map(([x,y])=>[x/64+y/32,y/32-x/64]);
  const minI=Math.min(...points.map(p=>p[0])),maxI=Math.max(...points.map(p=>p[0])),minJ=Math.min(...points.map(p=>p[1])),maxJ=Math.max(...points.map(p=>p[1]));
  const i=(minI+maxI)/2,j=(minJ+maxJ)/2;
  const scale=Math.min(4.15/(maxI-minI),4.15/(maxJ-minJ));
  return [id,{sourceGroundCorners:corners,anchorOffsetX:(i-j)*32,anchorOffsetY:(i+j)*16,scale,groundFootprint:{widthTiles:(maxI-minI)*scale+.125,heightTiles:(maxJ-minJ)*scale+.125}}];
}));
