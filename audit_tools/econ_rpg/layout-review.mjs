// Development-only A/B capture. Neither candidate changes saves or runtime routing.
import { createRequire } from 'node:module';
import { mkdir, writeFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import { previewServer } from './serve.mjs';
const { chromium } = createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE || 'playwright');
const out = fileURLToPath(new URL('../../tmp/econ-rpg/layout-review/', import.meta.url));
await mkdir(out, { recursive: true });
const server = previewServer();
await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
const origin = `http://127.0.0.1:${server.address().port}`;
const results = [];
let browser;
try {
  browser = await chromium.launch({ channel: process.env.BROWSER_CHANNEL || 'chrome' });
  for (const width of [1280, 390, 320]) for (const placement of ['right', 'above']) {
    const page = await browser.newPage({ viewport: { width, height: 960 }, reducedMotion: 'reduce' });
    await page.route('**/*', route => route.request().url().startsWith(origin + '/') ? route.continue() : route.abort());
    await page.goto(origin);
    await page.getByRole('button', { name: 'Begin scenario' }).click();
    await page.locator('[data-choice="ceiling"]').click();
    if (placement === 'above') {
      // Real DOM placement keeps the candidate's visual and reading orders aligned.
      await page.evaluate(() => document.querySelector('.neighborhood-scene').before(document.querySelector('#state-panel')));
      await page.route(`${origin}/__layout-review.css`, route => route.fulfill({ contentType: 'text/css', body: `
        .layout{grid-template-columns:1fr}
        #state-panel{position:static;margin:0 0 22px;padding:16px 20px;box-shadow:none}
        @media(min-width:761px){
          .indicator-list{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:16px}
          .state-item{border:0}.state-item dt{font-size:.78rem}
          .state-item dd{gap:6px;grid-template-columns:minmax(55px,1fr) 5ch 4ch}
          .steps{min-width:55px}
        }` }));
      await page.addStyleTag({ url: `${origin}/__layout-review.css` });
    }
    await page.locator('.neighborhood-scene img').evaluate(img => img.decode());
    await page.evaluate(() => scrollTo(0, 0));
    const metrics = await page.evaluate(() => {
      const box = selector => {
        const { x, y, width, height } = document.querySelector(selector).getBoundingClientRect();
        return { x, y, width, height };
      };
      return { image: box('.neighborhood-scene img'), conditions: box('#state-panel'),
        action: box('#view .primary'), overflow: document.documentElement.scrollWidth > innerWidth };
    });
    results.push({ width, placement, ...metrics });
    await page.screenshot({ path: `${out}/${placement}-${width}.png`, fullPage: true });
    if (placement === 'right') {
      await page.locator('#state-panel summary').focus(); await page.keyboard.press('Enter');
      await page.screenshot({ path: `${out}/help-${width}.png`, fullPage: true });
    }
    await page.close();
  }
  await writeFile(`${out}/metrics.json`, JSON.stringify(results, null, 2));
  console.log(JSON.stringify(results, null, 2));
} finally { await browser?.close(); await new Promise(resolve => server.close(resolve)); }
