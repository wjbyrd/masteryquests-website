const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const {chromium}=require('C:/Users/Jennings/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
(async()=>{
 const html=fs.readFileSync('outputs/canvas-beta-games/canvas-beta-games.html','utf8');
 const preview='<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Economics in Play — Canvas Preview</title></head><body style="margin:0;padding:20px;background:#fff">'+html+'</body></html>';
 fs.writeFileSync('tmp/canvas-beta-games/preview.html',preview);
 fs.writeFileSync('outputs/canvas-beta-games/canvas-beta-games.txt',html);
 const browser=await chromium.launch({channel:'chrome',headless:true});
 try{const p=await browser.newPage();await p.setContent(preview);
 assert.equal(await p.locator('tbody tr').count(),8);
 assert.equal(await p.locator('script,iframe,style').count(),0);
 const internal=await p.locator('a[href^="#"]').evaluateAll(a=>a.map(x=>x.getAttribute('href').slice(1)));
 for(const id of internal)assert.equal(await p.locator('#'+id).count(),1);
 for(const width of [1100,390]){await p.setViewportSize({width,height:900});assert.ok(await p.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),'No page overflow');await p.screenshot({path:'tmp/canvas-beta-games/preview-'+width+'.png',fullPage:true});}
 const urls=[...new Set(await p.locator('a[href^="https:"]').evaluateAll(a=>a.map(x=>x.href)))];
 const checks=await Promise.all(urls.map(async url=>{const r=await fetch(url);assert.equal(r.status,200,url);return{url,status:r.status};}));
 fs.writeFileSync('tmp/canvas-beta-games/checks.json',JSON.stringify(checks,null,2));console.log('PASS: 8 week rows; all section anchors valid; '+urls.length+' live links return 200; desktop/mobile fit; script-free Canvas HTML.');
 }finally{await browser.close();}
})().catch(e=>{console.error(e);process.exitCode=1});
