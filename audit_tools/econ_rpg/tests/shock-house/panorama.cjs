const assert=require('node:assert/strict');
const fs=require('node:fs');
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'C:/Users/Jennings/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const url=process.env.SHOCK_HOUSE_URL||'http://127.0.0.1:4179/games/the-shock-house/';
const width=Number(process.env.SHOCK_HOUSE_WIDTH)||1440;
const out=`tmp/shock-house/panorama-${width}`;fs.mkdirSync(out,{recursive:true});
(async()=>{
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{
 const page=await browser.newPage({viewport:{width,height:900},reducedMotion:'reduce'}),errors=[];
 page.on('pageerror',e=>errors.push(e.message));
 const act=(action,id)=>page.locator(`button[data-action="${action}"]${id===undefined?'':`[data-id="${id}"]`}:not([inert] *):visible`).first().click();
 const search=id=>act('search',id),open=id=>act('open',id),back=()=>act('back');
 const saved=()=>page.evaluate(()=>JSON.parse(localStorage.getItem('mastery-quests.shock-house.v1')));
 const solved=async id=>assert((await saved()).solvedPuzzles.includes(id),id+' solved');
 const leave=async()=>{for(let i=0;i<12&&await page.locator('[data-action="back"]').count();i++)await back();assert.equal(await page.locator('[data-action="back"]').count(),0);};
 const camera=async id=>{await leave();for(let i=0;i<5&&(await saved()).currentRoom!==id;i++)await act('pan','right');assert.equal((await saved()).currentRoom,id);};
 const path=async(...ids)=>{for(const id of ids)await search(id);};
 await page.goto(url);await act('begin');
 assert.equal((await saved()).settings.showObjects,false);
 assert.equal(await page.locator('[data-action="room"],.hallway-exit,.hotspot').count(),0);
 assert.equal(await page.locator('.environment-object[data-action="open"]').count(),1,'Exit is the only direct mechanism in this view');
 // All views are freely accessible; the utility mechanism retains the dependency.
 for(const id of ['hall','residence','workshop','archive','policy']){
   await camera(id);assert(!/RESIDENCE|WORKSHOP|ARCHIVE|CONTROL/.test(await page.locator('.room-art').textContent()));
   await page.screenshot({path:`${out}/${id}.png`});
 }
 await search('utility');await act('locked','utility');assert.equal(await page.locator('.room-notice').innerText(),'Locked.');await leave();
 await page.reload();await act('continue');assert.equal((await saved()).currentRoom,'policy','Can resume in locked utility area');
 const household=async()=>{ await camera('residence');await search('desk');await search('utility-bill');await leave();
 await camera('hall');await path('mail');await act('move','postcard');await path('rent');await act('discover','rent-read');await leave();assert((await saved()).inspectedObjects.includes('bills'));
 await camera('residence');await path('bag','groceries');assert.equal(await page.locator('[data-id="receipt"]').count(),0,'Receipt hidden beneath groceries');
 await act('move','jar');await page.reload();await act('continue');await path('bag','groceries');assert.equal(await page.locator('[data-action="move"][data-id="jar"]').count(),0,'Moved grocery survives reload');
 await act('move','bread');await path('receipt');await act('discover','old-food');assert(!(await saved()).inspectedObjects.includes('food'),'Old prices alone do not complete comparison');await back();await path('tags');await act('discover','new-food');assert((await saved()).inspectedObjects.includes('food'));await leave();
 await path('desk');await open('pay');await page.screenshot({path:`${out}/wallet.png`});await back();assert(await page.getByRole('heading',{name:'Writing desk',exact:true}).count());await leave();
 await path('desk');await open('budget');
 await act('hint');await act('more-hint');await act('more-hint');assert.equal((await saved()).hintLevels.budget,3);await act('close-hint');
 await act('solve','budget');assert(!(await saved()).solvedPuzzles.includes('budget'));
 for(const i of ['0','1','2','2'])await act('household-dial',i);
 await act('solve','budget');await solved('budget');for(const id of ['badge','date','household']){await act('drawer-preview',id);await act('drawer-collect',id);}
};
 const workshop=async()=>{ await camera('workshop');await path('tray');await act('move','catalogue');await path('files');assert((await saved()).inspectedObjects.includes('shipping-date'));await leave();
 await path('schedule');await leave();await open('production');assert.equal(await page.locator('.machine-memory').count(),1,'Output uses a physical machine counter');await leave();
 await open('cost');await act('use-badge');await act('reorder','invoices:0:1');await act('reorder','invoices:1:1');await act('solve','cost');await solved('cost');await leave();
 await path('bin');await act('move','bin-lid');await open('stock');await leave();
 await open('orders');await act('job','B');await act('solve','orders');assert(!(await saved()).solvedPuzzles.includes('orders'));await act('job','B');await act('job','A');await act('job','C');await act('solve','orders');await solved('orders');
};
 const route=process.env.SHOCK_HOUSE_ROUTE||'A';
 if(route==='C'){await camera('archive');await path('receiver');await open('radio');assert(await page.locator('[data-knob]').isDisabled());await leave();await path('television');for(let i=0;i<3;i++)await act('tv-channel','next');}
 if(route==='D'){await camera('workshop');await open('production');await camera('residence');await path('desk');await open('pay');assert.equal((await saved()).solvedPuzzles.length,0);}
 if(route==='B'||route==='C'){await camera('workshop');await open('production');await leave();await open('cost');assert(await page.locator('.cost-controls').isDisabled());assert(!(await saved()).solvedPuzzles.includes('budget'));}await household();await workshop();
 await camera('archive');await path('records','register');assert.equal(await page.locator('[data-action="open"][data-id="indicators"]').count(),1,'Clasp can be encountered before gathering bulletins');await leave();
 await search('television');for(let i=0;i<3;i++)await act('tv-channel','next');for(const id of ['output-read','work-read','prices-read'])assert((await saved()).inspectedObjects.includes(id));await page.screenshot({path:`${out}/television.png`});await leave();
 await path('records','register');await open('indicators');for(const id of ['household','costs','staffing'])await act('connect',id);
 await act('gauge','indicators:0');await act('gauge','indicators:0');await act('gauge','indicators:1');await act('gauge','indicators:2');await act('solve','indicators');await solved('indicators');await leave();
 await path('receiver','service');assert((await saved()).inspectedObjects.includes('index'));await leave();await search('receiver');await open('radio');
 await page.locator('[data-knob]').press('Home');for(let i=0;i<3;i++)await page.locator('[data-knob]').press('ArrowRight');
 for(const date of ['March 14','March 16','March 21']){await page.selectOption('#date',date);await act('tune');await act('record-dispatch');}
 await act('solve','radio');await solved('radio');await camera('policy');await search('utility');await open('policy');
 const lever=page.locator('[data-input="policy"]');await lever.press('Home');await lever.press('End');await act('seal','prices');await act('seal','work');await act('solve','policy');await solved('policy');
 assert(!/negative aggregate supply|SRAS/.test(await page.locator('body').innerText()));
 await camera('hall');await open('exit');
 assert.equal(await page.getByRole('button',{name:'Place event: Storm disrupts input deliveries',exact:true}).count(),1);
 assert((await page.locator('[data-action="place-final"][data-id="broadcast"]').innerText()).includes('Evidence: March 14 radio report'));
 await page.screenshot({path:`${out}/exit-events-unplaced.png`});
 for(const id of ['broadcast','costs','staffing','indicators','tradeoff'])await act('place-final',id);
 assert.equal(await page.locator('.evidence-position .causal-event').count(),5);
 assert.equal(await page.locator('.evidence-position .causal-event strong').first().innerText(),'Storm disrupts input deliveries');
 await page.screenshot({path:`${out}/exit-events-placed.png`});await act('solve','exit');await solved('exit');
 await act('reveal');assert(await page.getByRole('heading',{name:'You reconstructed a negative aggregate supply shock.'}).isVisible());
 await act('gauge','transfer:0');await act('gauge','transfer:1');await act('gauge','transfer:2');await act('gauge','transfer:2');await act('transfer');await act('results');assert.equal((await saved()).stage,'results');
 await page.reload();await act('continue');assert(await page.getByRole('heading',{name:'ESCAPED',exact:true}).isVisible());
 await act('restart');await act('confirm-new');
 for(const w of [320,390,768,1024,1440]){await page.setViewportSize({width:w,height:844});await camera('residence');const geometry=await page.evaluate(()=>({width:innerWidth,scroll:document.documentElement.scrollWidth,targets:[...document.querySelectorAll('.environment-object')].map(el=>({w:el.getBoundingClientRect().width,h:el.getBoundingClientRect().height}))}));assert(geometry.scroll<=w);assert(geometry.targets.every(r=>r.w>=44&&r.h>=44));}
 await act('menu');await act('settings');await page.locator('[data-setting="showObjects"]').check();await act('close-dialog');assert(await page.locator('body').evaluate(e=>e.classList.contains('show-objects')));
 await page.locator('.environment-object').first().focus();await page.keyboard.press('Enter');assert(await page.locator('[data-heading]').last().evaluate(e=>e===document.activeElement));await page.keyboard.press('Escape');assert.equal(await page.locator('.inspection-layer').count(),0);
 assert.deepEqual(errors,[]);console.log(JSON.stringify({passed:true,width,route,puzzles:7,layouts:[320,390,768,1024,1440],errors}));
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
