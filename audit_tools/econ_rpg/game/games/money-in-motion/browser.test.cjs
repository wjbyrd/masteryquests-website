// Run against the private local server. Optional env: BASE_URL, PLAYWRIGHT_MODULE_PATH, QA_SCREENSHOTS.
const {chromium}=require(process.env.PLAYWRIGHT_MODULE_PATH || 'playwright');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const base=process.env.BASE_URL || 'http://127.0.0.1:4179';
(async()=>{
  const browser=await chromium.launch({channel:'chrome',headless:true});
  try{
    for(const viewport of [{width:1440,height:900},{width:1280,height:720},{width:820,height:1180},{width:390,height:844},{width:320,height:740}]){
      const reduced=viewport.width<=390;
      const page=await browser.newPage({viewport,reducedMotion:reduced?'reduce':'no-preference'});
      const errors=[];page.on('pageerror',e=>errors.push(e.message));page.on('console',m=>{if(m.type()==='error')errors.push(m.text());});
      await page.goto(`${base}/games/money-in-motion/`);
      const use=async(action)=>{const button=page.locator(`[data-action="${action}"]`);await button.focus();await page.keyboard.press('Enter');};
      const body=()=>page.locator('#work').innerText();
      const loan=async(required,n)=>{
        await page.locator('#required').fill(String(required));await page.keyboard.press('Tab');
        assert.equal(await page.locator('#loan').evaluate(e=>e===document.activeElement),true);
        await page.keyboard.type(String(n));await page.keyboard.press('Tab');
        assert.equal(await page.locator('button[type=submit]').evaluate(e=>e===document.activeElement),true);
        await page.keyboard.press('Enter');
      };
      const check=async(label)=>{
        assert.ok(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),`overflow at ${viewport.width}: ${label}`);
        const tooSmall=await page.locator('button,input,summary,a.return-games').evaluateAll(nodes=>nodes.filter(n=>n.getBoundingClientRect().height<43.9).map(n=>n.textContent));
        assert.deepEqual(tooSmall,[],`touch targets at ${label}`);
        assert.deepEqual(errors,[],`browser errors at ${label}`);
        if(process.env.QA_SCREENSHOTS){fs.mkdirSync(process.env.QA_SCREENSHOTS,{recursive:true});await page.screenshot({path:path.join(process.env.QA_SCREENSHOTS,`${viewport.width}-${label}.png`),fullPage:true});}
      };
      await check('opening');assert.ok(!(await body()).includes('1 / 0.10'));
      await page.keyboard.press('Tab');
      const focusStyle=await page.locator(':focus').evaluate(e=>getComputedStyle(e).outlineStyle);
      assert.notEqual(focusStyle,'none','keyboard focus is visible');
      await use('post');
      await page.locator('#required').fill('99');await page.locator('#loan').fill('900');await page.locator('button[type=submit]').press('Enter');
      assert.match(await page.locator('#feedback').innerText(),/total deposits/);
      await page.locator('#required').fill('100');await page.locator('#loan').fill('901');await page.locator('button[type=submit]').press('Enter');
      assert.match(await page.locator('#feedback').innerText(),/\$99.*\$100.*\$900/);
      await page.locator('#loan').fill('-1');await page.locator('button[type=submit]').press('Enter');
      assert.match(await page.locator('#feedback').innerText(),/zero or more/);
      await page.locator('#loan').fill('');await loan(100,900);await check('training-clear');
      assert.match(await body(),/Payment cleared/);
      await use('next-round');await use('post');await check('training-two');await loan(160,540);
      await use('next-round');await use('post');assert.match(await body(),/\$2,100/);assert.match(await body(),/\$660/);await loan(210,450);
      await use('network');await check('network-start');
      await loan(100,900);await loan(90,810);await loan(81,729);await check('network-end');
      assert.match(await page.locator('.system-ledger').innerText(),/\$3,439/);assert.match(await page.locator('.system-ledger').innerText(),/\$2,439/);
      assert.ok(!(await body()).includes('1 / 0.10'));
      await page.locator('.bank-card summary').first().press('Enter');assert.equal(await page.locator('.bank-card details').first().getAttribute('open'),'');
      if(reduced)assert.equal(await page.locator('.transfer-symbol').evaluate(e=>getComputedStyle(e).animationName),'none');
      await use('pattern-gone');assert.match(await page.locator('#feedback').innerText(),/\$1,000/);
      await use('pattern-right');await use('whole');await check('multiplier');assert.match(await body(),/1 \/ 0.10 = 10/);
      await use('predict-larger');assert.match(await body(),/result is smaller/);assert.match(await body(),/\$5,000/);await use('stress');await check('stress-before');
      await use('cautious');await check('stress-after');assert.match(await body(),/requirement remains 10%/);assert.match(await body(),/\$5,000/);
      await use('close');await check('close');assert.equal(await page.locator('.assumptions').count(),0);
      assert.match(await body(),/\$1,890/);assert.match(await body(),/\$2,300/);
      await use('transfer-rule');assert.equal(await page.locator('.assumptions').count(),0);
      await use('transfer-smaller');await page.locator('.assumptions summary').press('Enter');await check('complete');
      assert.match(await body(),/not a guarantee/);
      await use('restart');assert.match(await body(),/Bank training 1 \/ 3/i);assert.equal(await page.locator('#loan').count(),0);
      // A deliberately smaller first loan must affect the next capacity and the actual-work recap.
      await use('post');await loan(100,500);await use('next-round');await use('post');assert.match(await body(),/\$1,100/);await loan(160,940);
      await use('next-round');await use('post');await loan(210,0);assert.match(await body(),/No loan or outgoing payment/);
      await page.locator('.return-games').press('Enter');await page.waitForURL('**/games/');
      assert.equal(await page.locator('[data-game="money-in-motion"]').count(),0,'prototype must not have a hub card');
      console.log(`PASS ${viewport.width}×${viewport.height}: full flow, correction/retry, keyboard, touch targets, ${reduced?'reduced motion':'motion'}, no overflow/errors, hub navigation`);
      await page.close();
    }
  }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1;});
