// Open the collapsed settings panel just as an instructor would before changing it.
export async function settingsControl(page,selector){
  if(!await page.locator('#data-settings').evaluate(node=>node.open))await page.locator('#data-settings > summary').click();
  return page.locator(selector);
}
