from pathlib import Path
p=Path('audit_tools/econ_rpg/game/games/the-long-run/index.html')
s=p.read_text(encoding='utf-8')
start=s.index('function windows(')
end=s.index('/* PIXEL ANIMATION')
s=s[:start]+Path('tmp/pixel-town-renderer.txt').read_text(encoding='utf-8')+'\n'+s[end:]
s=s.replace('maps the existing worldState values to sprite density. Grid is 480 × 207,\n   roughly three city-coordinate units per pixel, regardless of device scale.', 'maps the existing worldState values to sprite density. Both canvases use the\n   same 480 × 270 grid; PIXEL_PATHS and PIXEL_ANCHORS locate all activity.')
a=s.index('const PIXEL_PALETTE=');b=s.index(';',a)+1
s=s[:a]+"const PIXEL_PALETTE={O:TOWN_PALETTE.ink,B:TOWN_PALETTE.sand,D:TOWN_PALETTE.ochre,L:TOWN_PALETTE.sun,W:TOWN_PALETTE.sky,G:TOWN_PALETTE.teal,H:TOWN_PALETTE.cream,R:TOWN_PALETTE.brick,T:TOWN_PALETTE.deep,K:TOWN_PALETTE.steel,S:TOWN_PALETTE.skin,C:TOWN_PALETTE.sea,P:TOWN_PALETTE.slate,F:TOWN_PALETTE.wood,Y:TOWN_PALETTE.gold,V:TOWN_PALETTE.far,E:TOWN_PALETTE.paper};"+s[b:]
a=s.index('const PIXEL_PATHS=');b=s.index('function getVisualEconomyState',a)
s=s[:a]+'''const PIXEL_PATHS={
  upperRoad:[[-28,149],[480,149]],lowerRoad:[[480,163],[-28,163]],
  sidewalk:[[13,132],[289,132]],sidewalkReturn:[[289,132],[13,132]],retail:[[108,132],[176,132],[176,119]],
  factory:[[322,128],[451,128]],factoryReturn:[[451,128],[322,128]],factoryEntrance:[[322,128],[409,128],[409,119]],
  construction:[[397,238],[415,238]]
};
'''+s[b:]
s=s.replace("const cache=new Map(),vehicleColors=['#dca75d','#569cac','#bd7462','#cedbc9','#899d6b'];", "const cache=new Map(),vehicleColors=[TOWN_PALETTE.gold,TOWN_PALETTE.teal,TOWN_PALETTE.brick,TOWN_PALETTE.paper,TOWN_PALETTE.purple];")
s=s.replace("const shirtColors=['#578eb1','#ba6b58','#448f7e','#9a77ab','#c49b62'];", "const shirtColors=[TOWN_PALETTE.teal,TOWN_PALETTE.brick,TOWN_PALETTE.leaf,TOWN_PALETTE.purple,TOWN_PALETTE.sand];")
s=s.replace("S:variant%2?'#d5a07a':'#a97154'", "S:variant%2?TOWN_PALETTE.skin:TOWN_PALETTE.ochre")
s=s.replace("if(type==='smoke')palette.E=visual.upgraded?'#ecf3df':'#dce6dc';", "if(type==='smoke')palette.E=visual.upgraded?TOWN_PALETTE.paper:TOWN_PALETTE.steel;")
s=s.replace('fixedPerson(107,172,1,visual.householdIdle);fixedPerson(117,173,2);','fixedPerson(110,236,1,visual.householdIdle);fixedPerson(121,236,2);')
s=s.replace('fixedPerson(23+i*21,92,i)','fixedPerson(28+i*21,126,i)')
s=s.replace('fixedPerson(151+i*9,174,i+3)','fixedPerson(163+i*9,236,i+3)')
a=s.index('  function drawFactory(){');b=s.index('  function priceCorners',a)
s=s[:a]+'''  function drawFactory(){
    const p=TOWN_PALETTE,{x,y}=PIXEL_ANCHORS.machine;
    const operating=visual.factoryActivity!=='slow',gear=operating?Math.floor(time*(visual.upgraded?6:3))%2:0;
    rect(x,y,22,14,p.ink);rect(x+1,y+1,20,12,visual.upgraded?p.teal:p.steel);rect(x+1,y+1,20,2,visual.upgraded?p.sky:p.paper);
    for(const gx of [x+5,x+15]){rect(gx-2,y+6,5,5,p.slate);rect(gx+(gear?1:0),y+7,1,3,p.paper);rect(gx-1,y+8,3,1,p.paper);}
    if(visual.upgraded)rect(x+18,y+4,2,1,gear?p.cream:p.leaf);
    const period=visual.factoryActivity==='busy'?2.1:visual.factoryActivity==='slow'?7:4,puffAge=time%period;
    if(puffAge<1.5){const frame=Math.min(2,Math.floor(puffAge*2));blit('smoke',PIXEL_ANCHORS.stack.x+frame,PIXEL_ANCHORS.stack.y-4-Math.floor(puffAge*6),frame);}
    if(visual.factoryActivity==='busy'&&Math.floor(time*2)%6===0)rect(443,121,2,2,p.cream);
  }
  function drawConstruction(){
    const p=TOWN_PALETTE,active=visual.constructionActivity==='active',position=active?Math.floor(time/1.6)%2:0;
    const hookX=PIXEL_ANCHORS.hook.x+position*2,hookY=PIXEL_ANCHORS.hook.y;
    rect(hookX,hookY,1,19,p.ink);blit('hook',hookX-1,hookY+18);
    if(active){rect(399,252,6,3,p.ochre);rect(400,249,5,3,p.sand);if(position)rect(402,246,4,3,p.sun);}
  }
'''+s[b:]
s=s.replace("const c='#edc56b'",'const c=TOWN_PALETTE.gold')
s=s.replace("blit('flag',252,131,Math.floor(time/1.2)%2)","blit('flag',PIXEL_ANCHORS.flag.x,PIXEL_ANCHORS.flag.y,Math.floor(time/1.2)%2)")
s=s.replace("object.y<94)){rect(160,96,19,7,'#284b60');rect(159,96,1,7,'#a9c6b7');}","object.y<126)){rect(174,122,14,9,TOWN_PALETTE.deep);rect(174,122,1,9,TOWN_PALETTE.steel);}")
s=s.replace("ctx.save();ctx.beginPath();ctx.rect(0,113,480,25);\n    // The existing house roof projects over the near lane: traffic passes behind it.\n    ctx.moveTo(17,155);ctx.lineTo(34,133);ctx.lineTo(92,133);ctx.lineTo(109,155);ctx.closePath();ctx.clip('evenodd');", "ctx.save();ctx.beginPath();ctx.rect(0,148,WORLD_GRID.width,29);ctx.clip();")
s=s.replace("// Price text remains the accessible, exact SVG value. Only its corners tick briefly.\n    if(time<priceUntil&&!reducedMotion.matches){priceCorners(344,167,34,18);if(visual.retailActivity==='open')priceCorners(110,81,42,15);}","// Bitmap price text is also exposed in the canvas description. Corners tick on updates.\n    if(time<priceUntil&&!reducedMotion.matches){const f=PIXEL_ANCHORS.fuelPrice,m=PIXEL_ANCHORS.marketPrice;priceCorners(f.x,f.y,f.w,f.h);if(visual.retailActivity==='open')priceCorners(m.x,m.y,m.w,m.h);}")
s=s.replace('// Canvas backing resolution stays fixed; CSS tracks the SVG exactly, including mobile panning.','// Both canvas backing resolutions stay fixed; CSS scales and pans them together.')
# The modern surrounding shell is kept. Only world-specific rules are replaced.
s=s.replace('.world-svg{display:block;width:100%;height:auto;aspect-ratio:1440/620;background:#c9ebed}', '.world-canvas{display:block;width:100%;height:auto;aspect-ratio:480/270;image-rendering:pixelated;background:#bde7e5}')
a=s.index('/* 3. CITY ILLUSTRATION */');b=s.index('/* 4. HUD */',a)
s=s[:a]+'''/* 3. RETRO WORLD — shared canvas grid, modern outer shell. */
.city-surface{position:relative;width:100%;min-width:960px}.pixel-world{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;image-rendering:pixelated;z-index:1}
.world-shell{border:3px solid #243e50;border-radius:0;background:#243e50;box-shadow:0 0 0 1px #98b5b5,4px 4px 0 #071522}
.world-topline{position:relative;inset:auto;display:flex;align-items:center;padding:6px 9px;gap:10px;background:#243e50;border-bottom:3px solid #98b5b5;font-family:ui-monospace,Consolas,monospace}
.city-name{color:#fff3b2;background:none;font-size:.75rem;letter-spacing:.06em;padding:4px 0;border-radius:0;box-shadow:none}
.motion-control{border:2px solid #98b5b5;border-radius:0;background:#344e6a;box-shadow:2px 2px 0 #1e3444;color:#e7eee0;font-family:inherit;font-size:.72rem;min-height:44px}
.motion-control:hover{background:#536d7d}.time-passage{background:#1e3444f5;font-family:ui-monospace,Consolas,monospace;text-shadow:3px 3px 0 #536d7d}
'''+s[b:]
a=s.index('/* 6. CONSEQUENCE CALLOUTS */');b=s.index('/* 7. FINAL REPORT */',a)
s=s[:a]+'''/* 6. RETRO MESSAGE WINDOWS — original consequence wording stays intact. */
.callouts{position:relative;display:flex;gap:7px;padding:8px;background:#243e50;border-top:3px solid #98b5b5;font-family:ui-monospace,Consolas,monospace}
.callouts:empty{display:none}.callout{flex:1;min-width:0;background:#344e6a;border:2px solid #98b5b5;border-radius:0;padding:7px 9px;color:#e7eee0;box-shadow:2px 2px 0 #1e3444;animation:notice .4s steps(2,end) both}
.callout strong{display:block;font-size:.67rem;letter-spacing:.02em;color:#fff3b2;margin-bottom:5px}.callout p{font-size:.73rem;line-height:1.4;margin:0}
.callout.earlier{border-color:#efc55f}.callout:nth-child(2){animation-delay:.2s}.callout:nth-child(3){animation-delay:.4s}.callout:nth-child(4){animation-delay:.6s}
@keyframes notice{from{opacity:0}to{opacity:1}}
'''+s[b:]
s=s.replace('.world-svg{min-width:950px}','').replace('.world-svg{width:960px;min-width:960px}','')
s=s.replace('.world-topline{right:12px}','').replace('.world-shell{background:#c9ebed}','')
s=s.replace('.world-topline{top:8px;left:9px;right:9px}', '.world-topline{padding:5px 7px;gap:5px}')
s=s.replace('.callouts{position:relative;inset:auto;display:grid;grid-template-columns:1fr 1fr;padding:8px;gap:6px;background:#c9ebed}', '.callouts{display:grid;grid-template-columns:1fr 1fr;padding:7px;gap:6px;background:#243e50}')
s=s.replace('.callout{box-shadow:none;margin:0;max-width:none}', '.callout{margin:0;max-width:none}')
a=s.index('      <div class="world-window"');b=s.index('      <div id="callouts"',a)
s=s[:a]+'''      <div class="world-topline"><span class="city-name">COMMON GROUND · <span id="city-year">YEAR 1</span></span><button class="motion-control" id="motion" type="button" aria-pressed="false">Pause city motion</button></div>
      <div class="world-window" tabindex="0" aria-label="City view. On smaller screens, scroll horizontally to explore every district."><div class="city-surface"><canvas id="world" class="world-canvas" width="480" height="270" role="img" aria-labelledby="world-title world-description"></canvas><canvas id="pixel-world" class="pixel-world" width="480" height="270" aria-hidden="true"></canvas></div></div>
      <span id="world-title" class="sr-only"></span><span id="world-description" class="sr-only"></span>
'''+s[b:]
p.write_text(s,encoding='utf-8')
