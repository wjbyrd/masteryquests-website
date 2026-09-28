// Art, normalized regions, and loading are independent of economic puzzle state.
export const CAMERA_ORDER=['hall','residence','workshop','archive','policy'];
export const CAMERA_DESCRIPTIONS={hall:'The locked exit, a hanging coat, and a console',residence:'An armchair, shopping bag, and writing desk',workshop:'A workbench and idle equipment',archive:'Bookshelves, television, and wooden radio',policy:'A shuttered cabinet beside the window'};
export const PANORAMAS={hall:'panorama_exit',residence:'panorama_living',workshop:'panorama_work',archive:'panorama_records',policy:'panorama_utility'};
// Decorative furnishings stay in the plates. Hotspots reveal evidence,
// provide readable story details, or lead to working interactions.
export const SCENE_OBJECTS={
 hall:[['exit','Exit lock',500,296,130,160,'open'],['mail','Letter rack',731,191,95,93]],
 residence:[['bag','Shopping bag',400,438,95,124],['desk','Writing desk',768,365,320,174],['ledger','Books',759,145,197,132]],
 workshop:[['tray','Filing tray',269,267,105,88],['machine','Machine',735,334,205,228],['cost','Cabinet lock',439,410,151,137,'open'],['orders','Press',447,261,83,92,'open'],['bin','Storage bin',900,424,144,135],['calendar','Calendar',307,174,62,89]],
 archive:[['records','Bookshelf',217,208,234,278],['television','Television',548,282,135,102],['receiver','Radio',759,282,96,111]],
 policy:[['utility','Cabinet shutter',395,277,197,408],['meter','Meter cover',185,204,85,83]]
};
export function assetURL(id,small=false){return `assets/illustrated/${id}${small&&id!=='object_atlas'?'-768':''}.webp`;}
const cache=new Map();
export function warmAsset(id){const url=assetURL(id,innerWidth<760);if(cache.has(url))return cache.get(url);const img=new Image();img.src=url;const task=img.decode().catch(()=>{});cache.set(url,task);return task;}
export function warmView(room,view){
 warmAsset(PANORAMAS[room]);const i=CAMERA_ORDER.indexOf(room);
 // At most the two adjacent panoramas; never eagerly load every close-up.
 const idle=window.requestIdleCallback||((fn)=>setTimeout(fn,150));
 idle(()=>{warmAsset(PANORAMAS[CAMERA_ORDER[(i+1)%5]]);warmAsset(PANORAMAS[CAMERA_ORDER[(i+4)%5]]);const frequent={residence:'drawer_close',archive:'radio_close'}[room];if(frequent)warmAsset(frequent);});
 if(view?.includes('coat')){warmAsset('coat_close');warmAsset('coat_pocket_open');warmAsset('object_atlas');}
 if(view?.includes('desk')||view?.includes('drawer'))warmAsset('drawer_close');
 if(view?.includes('wallet'))warmAsset('wallet_open');
 if(view?.includes('bag')){warmAsset('bag_close');warmAsset('object_atlas');}
 if(view?.includes('receiver'))warmAsset('radio_close');
 if(['search:receipt','search:tags','search:rent'].includes(view))warmAsset('paper_unfolded');
}
export function plate(id,extra='',crop=null){
 const style=crop?`style="width:${10000/crop[2]}%;height:${10000/crop[3]}%;left:${-crop[0]*100/crop[2]}%;top:${-crop[1]*100/crop[3]}%"`:'';
 return `<img class="asset-plate ${extra}" data-asset="${id}" src="${assetURL(id,typeof innerWidth!=='undefined'&&innerWidth<760)}" ${style} alt="" decoding="async" draggable="false">`;
}
export function sceneArt(room,s={}){return `<div class="room-art illustrated-panorama" role="img" aria-label="${CAMERA_DESCRIPTIONS[room]}">${plate(PANORAMAS[room])}${s.solvedPuzzles?.includes('indicators')&&room==='archive'?'<i class="world-radio-light" aria-hidden="true"></i>':''}${s.solvedPuzzles?.includes('radio')&&room==='policy'?'<i class="world-cabinet-light" aria-hidden="true"></i>':''}${s.solvedPuzzles?.includes('exit')&&room==='hall'?'<div class="exit-leaf is-opening illustrated-exit" aria-hidden="true"></div>':''}</div>`;}
export function installAssetFallback(){document.addEventListener('error',event=>{const el=event.target;if(!el.matches?.('img[data-asset]')||el.dataset.failed)return;el.dataset.failed='true';el.src='assets/cover.svg';el.style.cssText='';el.classList.add('fallback-plate');},{capture:true});}
