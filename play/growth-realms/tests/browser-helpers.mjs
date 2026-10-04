export const keys=['capital','resources','research','education'];
export async function fillPlan(page,values){
  const player=await page.evaluate(async()=>(await import('./game.js')).exportRun().playerCity);
  if(!await page.locator('.district-local').count())await page.locator(`#city-tabs [data-view="${player}"]`).click();
  for(const [i,key]of keys.entries()){
    await page.locator(`[data-plan-city=${player}][data-plan-district=${key}]`).click();
    for(let n=0;n<Math.floor(values[i]/5);n++)await page.locator('[data-adjust="5"]').click();
    for(let n=0;n<values[i]%5;n++)await page.locator('[data-adjust="1"]').click();
  }
}
export const getRun=page=>page.evaluate(async()=>(await import('./game.js')).exportRun());
export const waitMaps=page=>page.waitForFunction(()=>[...document.querySelectorAll('.city-map')].every(e=>e.dataset.levels));


// Seed only the assignment draw; rival selection still uses the page's RNG.
export async function startCity(page,id='rivermark',trigger='#start-game'){
  await page.locator(trigger).waitFor({state:'visible'});
  await page.waitForFunction(selector=>{const button=document.querySelector(selector);return button&&!button.disabled;},trigger);
  await page.evaluate(id=>{const random=Math.random;let first=true;Math.random=()=>{if(first){first=false;return id==='meridian'?.1:.9;}return random();};},id);
  await page.locator(trigger).click();await waitMaps(page);
}

export async function selectDistrict(page,key){
  const player=(await getRun(page)).playerCity;
  if(!await page.locator(`[data-board=${player}]`).count())await page.locator(`#city-tabs [data-view=${player}]`).click();
  await page.locator(`[data-plan-city=${player}][data-plan-district=${key}]`).click();
}
