export const keys=['capital','resources','research','education'];
export async function fillPlan(page,values){
  const player=await page.evaluate(async()=>(await import('./game.js')).exportRun().playerCity);
  if(!await page.locator('#district-select').count())await page.locator(`#city-tabs [data-view="${player}"]`).click();
  for(const [i,key]of keys.entries()){
    await page.locator('#district-select').selectOption(key);
    for(let n=0;n<Math.floor(values[i]/5);n++)await page.locator('[data-adjust="5"]').click();
    for(let n=0;n<values[i]%5;n++)await page.locator('[data-adjust="1"]').click();
  }
}
export const getRun=page=>page.evaluate(async()=>(await import('./game.js')).exportRun());
export const waitMaps=page=>page.waitForFunction(()=>[...document.querySelectorAll('.city-map')].every(e=>e.dataset.levels));


export async function enterChoice(page){if(await page.locator('#start-game').isVisible())await page.locator('#start-game').click();}
