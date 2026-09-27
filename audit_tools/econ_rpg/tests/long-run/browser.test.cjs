/* Run against the existing loopback preview. PLAYWRIGHT_MODULE may point to an
   installed Playwright package; no runtime dependency is added to the game. */
const { chromium } = require(process.env.PLAYWRIGHT_MODULE || 'playwright');
const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const output = path.resolve('tmp/long-run-canvas'); fs.mkdirSync(output, { recursive: true });
const url = process.env.LONG_RUN_URL || 'http://127.0.0.1:4179/games/the-long-run/';
const cases = {
  baseline: [], demand: ['confidence'], supply: ['energy'], productivity: ['breakthrough'],
  fiscal: ['confidence', 'fiscal-expand'], private: ['breakthrough', 'fiscal-hold', 'rate-cut', 'housing-boom'],
  decline: ['energy', 'fiscal-contract', 'rate-hike', 'commodities'],
  recovery: ['energy', 'fiscal-expand', 'rate-cut', 'infrastructure', 'support']
};
(async () => {
  const browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'chrome', headless: true });
  const errors = [], result = {};
  try {
    const page = await browser.newPage({ viewport: { width: 1440, height: 950 }, reducedMotion: 'reduce' });
    page.on('pageerror', e => errors.push(e.message));
    page.on('response', response => { if (response.status() >= 400) errors.push(response.url()); });
    await page.goto(url);
    result.allPaths = await page.evaluate(async () => {
      const profiles = new Set(); let graphs = 0;
      for (let code = 0; code < 243; code++) {
        reset(); let n = code;
        for (const year of YEARS) { const id = year.options[n % 3].id; n = Math.floor(n / 3); await advanceTime(id); }
        if (economy.phase !== 'finished' || document.querySelectorAll('.story li').length !== 6) throw Error('Incomplete report');
        if (!document.querySelector('#world-shell').classList.contains('finished')) throw Error('Unfrozen ending');
        profiles.add(endingProfile().name);
        for (let year = 1; year <= 6; year++) {
          renderGraph(year); graphs++;
          if (!document.querySelector('#graph-description').textContent.includes('output ' + economy.history[year - 1].state.realGDP.toFixed(1))) throw Error('Graph diverged');
        }
        const v = pixelWorld.inspect();
        if (v.people.length > 24 || v.vehicles.length > 9) throw Error('Unbounded population');
      }
      reset(); return { paths: 243, reportYears: 1458, graphs, profiles: [...profiles] };
    });
    for (const [name, choices] of Object.entries(cases)) {
      await page.evaluate(async ids => { reset(); for (const id of ids) await advanceTime(id); }, choices);
      await page.locator('#world-shell').screenshot({ path: path.join(output, `${name}.png`) });
      result[name] = await page.evaluate(() => ({ visual: pixelWorld.inspect().visual, assets: pixelWorld.inspect().assets, people: pixelWorld.inspect().people.length, vehicles: pixelWorld.inspect().vehicles.length }));
    }
    for (const width of [320, 390, 768, 1280, 1440, 1920]) {
      await page.setViewportSize({ width, height: 950 }); await page.evaluate(() => reset());
      const geometry = await page.evaluate(() => {
        const c = document.querySelector('#world'), r = c.getBoundingClientRect(), parent = c.parentElement.getBoundingClientRect();
        return { overflow: document.documentElement.scrollWidth > innerWidth, ratio: r.width / r.height,
          backing: [c.width, c.height], smoothing: c.getContext('2d').imageSmoothingEnabled,
          rendering: getComputedStyle(c).imageRendering, clipped: r.width > parent.width,
          targets: [...document.querySelectorAll('[data-choice]')].every(b => b.getBoundingClientRect().height >= 44),
          named: !!document.querySelector('#world-description').textContent };
      });
      assert.equal(geometry.overflow, false); assert.equal(geometry.clipped, false); assert.ok(Math.abs(geometry.ratio - 16 / 9) < .001);
      assert.deepEqual(geometry.backing, [480, 270]); assert.equal(geometry.smoothing, false); assert.equal(geometry.rendering, 'pixelated'); assert.ok(geometry.targets && geometry.named);
      if (width === 390 || width === 1440) await page.screenshot({ path: path.join(output, `layout-${width}.png`), fullPage: true });
    }
    // Drive actual controls, transfer feedback and all six model-year buttons.
    await page.setViewportSize({ width: 390, height: 844 });
    await page.evaluate(() => reset());
    for (const id of ['energy', 'fiscal-expand', 'rate-hike', 'infrastructure', 'support']) {
      await page.locator(`[data-choice="${id}"]`).click();
      await page.waitForFunction(() => ['choice', 'finished'].includes(economy.phase));
      assert.equal(await page.evaluate(() => document.activeElement.id), 'decision-title');
    }
    await page.locator('[data-transfer="1"]').click(); assert.ok(await page.locator('#transfer-feedback').isVisible());
    await page.locator('#model-toggle').click();
    for (let year = 1; year <= 6; year++) {
      await page.locator(`[data-graph-year="${year}"]`).click();
      assert.equal(await page.locator('[data-graph-year][aria-pressed="true"]').count(), 1);
      const clipped = await page.locator('#graph text').evaluateAll(nodes => nodes.filter(n => { const r = n.getBBox(); return r.x < 0 || r.y < 0 || r.x + r.width > 640 || r.y + r.height > 405; }).map(n => n.textContent));
      assert.deepEqual(clipped, []);
    }
    await page.locator('#model').screenshot({ path: path.join(output, 'mobile-adas.png') });
    await page.locator('#restart').click(); assert.equal(await page.evaluate(() => economy.year), 1);
    assert.equal(await page.locator('#report').isVisible(), false);
    assert.equal(await page.evaluate(() => localStorage.length), 0); // Existing game has no persistence storage.
    // Pose sheets: all authored walk poses differ; reverse facing is exact mirroring.
    result.sprites = await page.evaluate(() => {
      const atlas = pixelWorld.atlas, sheet = atlas.get('shopper', 2), ctx = sheet.canvas.getContext('2d');
      const frames = Array.from({ length: 8 }, (_, i) => Array.from(ctx.getImageData(i * sheet.w, 0, sheet.w, sheet.h).data).join(','));
      const sheetPreview = document.createElement('canvas'); sheetPreview.width = 480; sheetPreview.height = 120;
      const c = sheetPreview.getContext('2d'); c.imageSmoothingEnabled = false; c.fillStyle = '#d9cfb2'; c.fillRect(0, 0, 480, 120);
      c.drawImage(sheet.canvas, 0, 0, sheet.canvas.width, 24, 12, 12, sheet.canvas.width * 2, 48);
      for (const [i, type] of ['car','van','delivery','industrial','construction'].entries()) {
        const s = atlas.get(type, i); c.drawImage(s.canvas, 0, 0, s.w, s.h, 12 + i * 90, 85 - s.h, s.w, s.h);
      }
      const facing = direction => {
        const canvas=document.createElement('canvas');canvas.width=sheet.w;canvas.height=sheet.h;
        atlas.draw(canvas.getContext('2d'), {type:'shopper',variant:2,frame:2,x:sheet.w/2,y:sheet.h,direction,state:'walk'});
        return canvas.getContext('2d').getImageData(0,0,sheet.w,sheet.h).data;
      };
      const left=facing(-1),right=facing(1);let mirrored=true;
      for(let y=0;y<sheet.h;y++)for(let x=0;x<sheet.w;x++)for(let c=0;c<4;c++)if(left[(y*sheet.w+x)*4+c]!==right[(y*sheet.w+sheet.w-1-x)*4+c])mirrored=false;
      return { distinctWalkPoses: new Set(frames).size, mirrored, data: sheetPreview.toDataURL() };
    });
    assert.equal(result.sprites.distinctWalkPoses, 8);
    assert.ok(result.sprites.mirrored);
    fs.writeFileSync(path.join(output, 'sprites.png'), Buffer.from(result.sprites.data.split(',')[1], 'base64')); delete result.sprites.data;
    // Live RAF, pause, resume, operating-system preference changes and tab visibility.
    await page.setViewportSize({ width: 1440, height: 950 }); await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.waitForTimeout(250);
    const a = await page.evaluate(() => pixelWorld.inspect()); await page.waitForTimeout(450); const b = await page.evaluate(() => pixelWorld.inspect());
    assert.ok(b.time > a.time); assert.ok(b.frameCount > a.frameCount + 5);
    assert.notEqual(b.people[0].x, a.people[0].x); assert.notEqual(b.people[0].frame, a.people[0].frame);
    await page.locator('#motion').focus(); await page.keyboard.press('Enter'); await page.waitForTimeout(60);
    const paused = await page.evaluate(() => ({ state: pixelWorld.inspect(), pixels: document.querySelector('#world').toDataURL() }));
    await page.waitForTimeout(400);
    assert.deepEqual(await page.evaluate(() => ({ state: pixelWorld.inspect(), pixels: document.querySelector('#world').toDataURL() })), paused);
    await page.locator('[data-choice="confidence"]').click();
    assert.equal(await page.locator('[data-choice]:enabled').count(), 0);
    await page.waitForFunction(() => economy.year === 2 && economy.phase === 'choice');
    assert.equal(await page.locator('#motion').getAttribute('aria-pressed'), 'true');
    const changed = await page.evaluate(() => pixelWorld.inspect()); assert.equal(changed.time, paused.state.time); assert.ok(changed.visual.retail > paused.state.visual.retail);
    await page.locator('#motion').click(); await page.waitForTimeout(150); assert.ok((await page.evaluate(() => pixelWorld.inspect())).running);
    await page.emulateMedia({ reducedMotion: 'reduce' }); await page.waitForTimeout(80);
    const reduced = await page.evaluate(() => pixelWorld.inspect()); await page.waitForTimeout(200);
    assert.deepEqual(await page.evaluate(() => pixelWorld.inspect()), reduced);
    await page.emulateMedia({ reducedMotion: 'no-preference' });
    await page.evaluate(() => { Object.defineProperty(document, 'hidden', { configurable: true, value: true }); document.dispatchEvent(new Event('visibilitychange')); });
    const hidden = await page.evaluate(() => pixelWorld.inspect()); await page.waitForTimeout(180);
    assert.deepEqual(await page.evaluate(() => pixelWorld.inspect()), hidden);
    await page.evaluate(() => { delete document.hidden; document.dispatchEvent(new Event('visibilitychange')); });
    await page.waitForTimeout(100); assert.ok((await page.evaluate(() => pixelWorld.inspect())).running);
    // Follow door activity and record an animation strip using the same update methods.
    result.entityBehavior = await page.evaluate(() => {
      pixelWorld.flags.paused = true; pixelWorld.reconcile();
      const world = new LongRunCity.World(), v = LongRunCity.adapt(economy).current;
      const states = new Set(), types = new Set(); let reversed = false;
      for (let i = 0; i < 60 * 90; i++) {
        world.update(1 / 60, v);
        for (const p of world.people) { states.add(p.state); if (p.visited && p.direction < 0) reversed = true; }
        for (const vehicle of world.vehicles) types.add(vehicle.type);
      }
      return { states: [...states], vehicleTypes: [...types], reversed };
    });
    for (const state of ['walk', 'enter', 'inside', 'exit', 'work']) assert.ok(result.entityBehavior.states.includes(state));
    assert.ok(result.entityBehavior.reversed);
    const strip = await page.evaluate(() => {
      const w = new LongRunCity.World(), v = LongRunCity.adapt(initialEconomy()).current;
      w.staticState(v);
      const c=document.createElement('canvas');c.width=640;c.height=88;const g=c.getContext('2d');g.imageSmoothingEnabled=false;
      g.fillStyle='#d9cfb2';g.fillRect(0,0,640,88);
      for(let i=0;i<8;i++){
        if(i)for(let step=0;step<8;step++)w.update(1/64,v);
        const p=w.people.find(p=>p.id===0);
        g.save();g.translate(i*80+8,10);g.scale(2,2);
        LongRunCity.lettering(LongRunCity.brush(g),String(i+1),1,0);
        g.fillStyle='#b4cad6';g.fillRect(0,30,31,1);
        pixelWorld.atlas.draw(g,{...p,x:9+(p.x-18),y:30});g.restore();
      }
      return c.toDataURL();
    });
    fs.writeFileSync(path.join(output,'walking-strip.png'),Buffer.from(strip.split(',')[1],'base64'));
    // Rendering budget measured separately from browser scheduling, with a busy town.
    result.performance = await page.evaluate(() => {
      economy=initialEconomy();recordYear();['breakthrough','fiscal-expand','rate-cut','housing-boom'].forEach(stepEconomy);render();
      const samples=[];for(let i=0;i<180;i++){pixelWorld.world.update(1/60,pixelWorld.controller.value);const t=performance.now();pixelWorld.draw();samples.push(performance.now()-t);}
      samples.sort((a,b)=>a-b);return { medianDrawMs:samples[90], p95DrawMs:samples[171], cachedSheets:pixelWorld.atlas.cache.size };
    });
    assert.deepEqual(errors, []);
    result.errors = errors; result.motion = 'pause/resume, preference changes, visibility, frozen decisions passed';
    fs.writeFileSync(path.join(output, 'results.json'), JSON.stringify(result, null, 2));
    console.log(JSON.stringify({ paths: result.allPaths, viewports: 6, spritePoses: result.sprites, motion: result.motion, behavior: result.entityBehavior, performance: result.performance, errors }, null, 2));
  } finally { await browser.close(); }
})().catch(error => { console.error(error); process.exitCode = 1; });
