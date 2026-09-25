const fs=require('node:fs');let s=fs.readFileSync('tmp/the-long-run-anatomy-volume-check.cjs','utf8');
s=s.replaceAll('pre-anatomy-volume','pre-final-art').replaceAll('long-run-anatomy-volume-','long-run-final-art-');
const start=s.indexOf('const scrub='),end=s.indexOf('assert.equal(scrub',start);
s=s.slice(0,start)+String.raw`const scrub=s=>s.replace(/const TOWN_PALETTE=[\s\S]*?(?=const PIXEL_POLISH=)/,'PALETTE\n').replace(/for\(const \[x,y\] of \[\[30,24\][^\n]+/,'CLOUD_COLORS').replace(/const SPRITE_PLACEMENT=[\s\S]*?(?=const sprites=\{)/,'ACTOR_ART\n').replace(/[/][/] Redrawn [^\n]+/,'ACTOR_DESCRIPTION').replace(/function spriteImage[\s\S]*?(?=  function blit)/,'ACTOR_BITMAP\n');`+'\n'+s.slice(end);
s=s.replace("assert.equal(section(now,'function walkingPhase(','const PERSON_HEAD='),section(old,'function walkingPhase(','const PERSON_HEAD='));", "assert.equal(section(now,'function walkingPhase(','function walkingFeet('),section(old,'function walkingPhase(','function walkingFeet('));");
s=s.replace('[46,28]','[48,30]').replace('[52,28]','[54,30]').replace('[22,32]','[20,30]');
s=s.replace('21-(foot.x+2)','19-(foot.x+2)');
s=s.replace('if(y>=24&&tables.some','if(y>=22&&tables.some');
// A palette-normalized render must match exactly, so the brighter colors cannot hide geometry changes.
s=s.replace("assert.equal(await page.locator('#world').evaluate(c=>c.toDataURL()),await before.locator('#world').evaluate(c=>c.toDataURL()));",`const oldPalette=await before.evaluate(()=>({...TOWN_PALETTE}));const background=await page.evaluate(oldPalette=>{const saved={...TOWN_PALETTE};Object.assign(TOWN_PALETTE,oldPalette,{cloudShade:oldPalette.cloud});renderWorld();const image=document.querySelector('#world').toDataURL();Object.assign(TOWN_PALETTE,saved);renderWorld();return image;},oldPalette);assert.equal(background,await before.locator('#world').evaluate(c=>c.toDataURL()));`);
fs.writeFileSync('tmp/the-long-run-final-art-check.cjs',s);
