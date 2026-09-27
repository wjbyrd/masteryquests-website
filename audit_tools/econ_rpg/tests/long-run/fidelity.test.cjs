const fs = require('node:fs'), path = require('node:path'), crypto = require('node:crypto'), assert = require('node:assert/strict');
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const root = path.resolve(__dirname, '../../game/games/the-long-run');
const fixture = path.join(__dirname, 'fidelity-preservation.json');
const sha = s => crypto.createHash('sha256').update(s.replaceAll('\r\n','\n')).digest('hex');
function protectedSource(folder, before = false) {
  const read = file => fs.readFileSync(path.join(folder, file), 'utf8').replaceAll('\r\n','\n');
  const prefix = before ? '' : 'city/';
  const visual = read(prefix+'visual-state.js'), entities = read(prefix+'entities.js'), renderer = read(prefix+'renderer.js');
  return {
    completeEconomicInterfaceAndLayout: sha(read('index.html')),
    economicMappingsSequencingPersistence: sha(visual.slice(visual.indexOf('  function channels('))),
    vehicleLogic: sha(entities.slice(entities.indexOf('  class Vehicle'), entities.indexOf('  class World'))),
    populationTargets: sha(entities.slice(entities.indexOf('    targets()'), entities.indexOf('    seed()'))),
    spawnLogic: sha(entities.slice(entities.indexOf('    spawn(dt)'), entities.indexOf('    // Frozen users'))),
    staticStateAndDoors: sha(entities.slice(entities.indexOf('    // Frozen users'))),
    rafAndMotionControls: sha(renderer.slice(0, renderer.indexOf('    draw() {'))),
    rendererInspectionAndAssetDescription: sha(renderer.slice(renderer.indexOf('    inspect() {')))
  };
}
if (process.argv[2] === '--record-before') {
  fs.writeFileSync(fixture, JSON.stringify(protectedSource(path.resolve('tmp/long-run-canvas/fidelity-before'), true), null, 2)+'\n');
  console.log('Recorded retained pre-pass source hashes.'); process.exit(0);
}
assert.deepEqual(protectedSource(root), JSON.parse(fs.readFileSync(fixture, 'utf8')));
(async () => {
  const browser = await chromium.launch({ channel: 'chrome', headless: true });
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 950 }, reducedMotion: 'reduce' });
    const errors=[];page.on('pageerror',error=>errors.push(error.message));
    await page.goto(process.env.LONG_RUN_URL || 'http://127.0.0.1:4179/games/the-long-run/');
    const result = await page.evaluate(() => {
      const {Pedestrian, World, SpriteAtlas, TUNING:T, PERSON, P} = LongRunCity;
      const assert = (condition,message) => { if(!condition)throw Error(message); };
      const atlas = new SpriteAtlas(), canvas=document.createElement('canvas');canvas.width=400;canvas.height=70;
      const g=canvas.getContext('2d');g.imageSmoothingEnabled=false;
      const output={dimensions:[PERSON.w,PERSON.h],walkFrames:T.walkFrames,stride:T.strideDistance,velocity:T.walkSpeed,walkFPS:T.walkSpeed.map(s=>s/T.strideDistance*T.walkFrames),contactSamples:0,maxContactDrift:0};
      for(const direction of [-1,1])for(const speed of [12,14.5,17])for(let variant=0;variant<6;variant++){
        const start=direction===1?50:300;
        const p=new Pedestrian(variant,'shopper',start,55,null,speed);p.direction=direction;
        const world={people:[p]};
        for(let i=0;i<360;i++){
          p.update(1/120,world);g.clearRect(0,0,400,70);atlas.draw(g,p);
          const halfStride=Math.floor(p.walkDistance/(T.strideDistance/2));
          const shoeX=start+direction*halfStride*8+(direction===1?5:-6);
          let drift=Infinity;
          for(let d=-1;d<=1;d++){
            const rgb=Array.from(g.getImageData(shoeX+d,54,1,1).data).slice(0,3).map(n=>n.toString(16).padStart(2,'0')).join('');
            if('#'+rgb===P.wood)drift=Math.min(drift,Math.abs(d));
          }
          assert(drift<=1,`Skating foot: direction ${direction}, speed ${speed}, frame ${p.frame}, distance ${p.walkDistance}`);
          output.maxContactDrift=Math.max(output.maxContactDrift,drift);output.contactSamples++;
          assert(p.frame===Math.floor(p.walkDistance/2)%8,'Distance/pose mismatch');
        }
      }
      const p=new Pedestrian(1,'shopper',80,150,null,14), blocker=new Pedestrian(2,'shopper',87,150,null,14);
      const stationary={people:[p,blocker]};const x=p.x;
      for(let i=0;i<90;i++)p.update(1/60,stationary);
      assert(p.x===x&&p.walkDistance===0&&p.frame===8,'Blocked pedestrian cycles or moves');
      p.turn(-1);for(let i=0;i<10;i++)p.update(1/60,stationary);
      assert(p.x===x&&p.direction===1&&p.state==='turn','Turn changed mid-stride');
      p.update(1/60,stationary);assert(p.direction===-1&&p.x===x,'Turn did not settle');
      const a=new Pedestrian(0,'resident',80,150,null,15),b=new Pedestrian(0,'resident',80,150,null,15);
      for(let i=0;i<120;i++)a.update(1/60,{people:[a]});for(let i=0;i<60;i++)b.update(1/30,{people:[b]});
      assert(Math.abs(a.x-b.x)<1e-8&&Math.abs(a.walkDistance-b.walkDistance)<1e-8,'Gait depends on display refresh');
      const w=new World(),v=LongRunCity.adapt(economy).current,states=new Set(),facings=new Set();
      for(let i=0;i<60*70;i++){w.update(1/60,v);for(const p of w.people){states.add(p.state);facings.add(p.facing);}}
      for(const state of ['walk','turn','work','inspect','idle','carry','reposition','enter','inside','exit','wait'])assert(states.has(state),'Missing behavior '+state);
      assert(facings.has('back')&&facings.has('front'),'Lateral pose used at doors');
      output.states=[...states];output.facings=[...facings];
      const strips=document.createElement('canvas');strips.width=640;strips.height=192;const c=strips.getContext('2d');c.imageSmoothingEnabled=false;c.fillStyle=P.paving;c.fillRect(0,0,640,192);
      for(const direction of [1,-1]){
        const actor=new Pedestrian(0,'shopper',direction===1?50:300,55,null,16);actor.direction=direction;
        for(let frame=0;frame<8;frame++){
          if(frame)for(let i=0;i<8;i++)actor.update(1/64,{people:[actor]});
          c.save();c.translate(frame*80+4,direction===1?0:96);c.scale(2,2);
          const r=LongRunCity.brush(c);LongRunCity.lettering(r,String(frame+1),1,3);r(0,39,36,1,'steel');
          // A fixed world reference in every panel makes support-foot drift visible.
          atlas.draw(c,{...actor,x:direction===1?9+(actor.x-50):26+(actor.x-300),y:39});c.restore();
        }
      }
      output.strip=strips.toDataURL();
      const pixels=document.querySelector('#world').getContext('2d').getImageData(0,0,480,270).data,colors=new Set();
      for(let i=0;i<pixels.length;i+=4){assert(pixels[i+3]===255,'Antialiased world pixel');colors.add(`${pixels[i]},${pixels[i+1]},${pixels[i+2]}`);}
      output.visibleColors=colors.size;output.cachedSheets=atlas.cache.size;
      assert([...atlas.cache.values()].every(s=>!s.canvas.getContext('2d').imageSmoothingEnabled),'Smoothed sprite atlas');
      return output;
    });
    const output=path.resolve('tmp/long-run-canvas');fs.mkdirSync(output,{recursive:true});
    fs.writeFileSync(path.join(output,'fidelity-contact-strip.png'),Buffer.from(result.strip.split(',')[1],'base64'));delete result.strip;
    await page.emulateMedia({reducedMotion:'no-preference'});
    result.liveScenes=[];
    const scenes={stable:[],consumer:['confidence'],public:['confidence','fiscal-expand'],supply:['energy'],factory:['breakthrough','fiscal-hold','rate-hold','infrastructure'],private:['breakthrough','fiscal-hold','rate-cut','housing-boom'],year6:['energy','fiscal-expand','rate-cut','infrastructure','support']};
    for(const [name,choices]of Object.entries(scenes)){
      const before=await page.evaluate(ids=>{reset();ids.forEach(stepEconomy);render();return {economic:JSON.stringify(economy),frames:pixelWorld.frameCount};},choices);
      await page.waitForTimeout(800);
      const after=await page.evaluate(()=>({economic:JSON.stringify(economy),frames:pixelWorld.frameCount}));
      assert.equal(after.economic,before.economic);assert.ok(after.frames>before.frames+5);
      await page.locator('#world-shell').screenshot({path:path.join(output,`fidelity-live-${name}.png`)});result.liveScenes.push(name);
    }
    // Observe actual Year 6 freezing through its existing controller, not just a rendered snapshot.
    await page.evaluate(()=>{reset();['breakthrough','fiscal-expand','rate-cut','housing-boom'].forEach(stepEconomy);render();});
    await page.locator('[data-choice="adjust"]').click();await page.waitForFunction(()=>economy.phase==='finished');
    const finalTime=await page.evaluate(()=>pixelWorld.world.time);await page.waitForTimeout(180);assert.equal(await page.evaluate(()=>pixelWorld.world.time),finalTime);
    assert.deepEqual(errors,[]);result.protectedSource='unchanged';result.browserErrors=errors;
    fs.writeFileSync(path.join(output,'fidelity-results.json'),JSON.stringify(result,null,2));console.log(JSON.stringify(result,null,2));
  }finally{await browser.close();}
})().catch(error=>{console.error(error);process.exitCode=1});
