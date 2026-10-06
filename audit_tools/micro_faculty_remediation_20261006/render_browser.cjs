// Render the actual Composer graph component CSS/functions in a local fixture.
'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const {chromium}=require('C:/Users/Jennings/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const root=path.resolve(__dirname,'../..'),cdir=path.join(root,'build/faculty-build-composer'),out=path.join(__dirname,'browser');fs.mkdirSync(out,{recursive:true});
const ledger=JSON.parse(fs.readFileSync(path.join(__dirname,'expectations.json'),'utf8')),source=fs.readFileSync(path.join(cdir,'template/mastery-quests-faculty-template-composer-ready.html'),'utf8');
const css=[...source.matchAll(/<style[^>]*>([\s\S]*?)<\/style>/g)].map(m=>m[1]).join('\n');
const start=source.indexOf('function getQuestionGraphAccessibility('),end=source.indexOf('document.addEventListener("click", function(event)',start);
const functions=source.slice(start,end);
const html=`<!doctype html><meta name="viewport" content="width=device-width, initial-scale=1"><style>${css}</style><div id="gameShell"><div id="gameBox" style="display:block"><div id="questionContainer"><div id="questionImageBox"></div><div id="question"></div></div></div></div><div id="graphLightbox" aria-hidden="true" role="dialog"><button id="graphLightboxClose">×</button><img id="graphLightboxImg"><p id="graphLightboxDescription" class="sr-only"></p></div><script>let questionAssetMetadata={};function escapeHTML(s){return s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');}function resolveQuestionImage(s){return window.graphSource;}function pauseFadingFortune(){}function resumeFadingFortune(){}function setAnswerButtonsDisabled(){}${functions}</script>`;
fs.writeFileSync(path.join(out,'component.html'),html);
(async()=>{const browser=await chromium.launch({headless:true,channel:'msedge'});const page=await browser.newPage();const results=[];
for(const [index,asset]of ledger.assets.entries()){
 const data='data:image/webp;base64,'+fs.readFileSync(path.join(cdir,'data',asset.path)).toString('base64');const row={index,asset:asset.path,renders:[]};
 for(const [mode,width,height,lightbox]of [['desktop',1365,900,false],['grayscale',1365,900,false],['mobile',390,844,false],['lightbox',1365,900,true],['mobile-lightbox',390,844,true]]){
  await page.setViewportSize({width,height});await page.setContent(html);await page.evaluate(({data,asset})=>{window.graphSource=data;renderQuestionGraph({image:asset});},{data,asset:asset.path});await page.locator('#questionImageBox img').evaluate(img=>img.decode());
  if(lightbox)await page.evaluate(()=>{const img=document.querySelector('#questionImageBox img');openGraphLightbox(img.src,img.alt,img.dataset.graphDescription);});
  if(mode==='grayscale')await page.addStyleTag({content:'img {filter:grayscale(1)}'});
  const img=page.locator(lightbox?'#graphLightboxImg':'#questionImageBox img');await img.evaluate(i=>i.decode());const bounds=await img.boundingBox();assert(bounds&&bounds.width>0&&bounds.height>0);
  if(mode==='mobile-lightbox'){
   assert(bounds.width>=760,'Readable expanded mobile width');
   await page.screenshot({path:path.join(out,`${String(index).padStart(2,'0')}-mobile-pan-left.png`)});
   const pan=await page.locator('#graphLightbox').evaluate(el=>{el.scrollLeft=el.scrollWidth;return el.scrollLeft;});assert(pan>0,'Mobile graph can pan to right edge');
   await page.screenshot({path:path.join(out,`${String(index).padStart(2,'0')}-mobile-pan-right.png`)});
   await page.locator('#graphLightbox').evaluate(el=>el.scrollLeft=0);
  }else assert(bounds.x>=-1&&bounds.x+bounds.width<=width+1,'Horizontal clipping');
  const name=`${String(index).padStart(2,'0')}-${mode}.png`;await img.screenshot({path:path.join(out,name)});row.renders.push({mode,viewport:{width,height},bounds,file:name});
 }
 results.push(row);
}
await browser.close();fs.writeFileSync(path.join(out,'render-index.json'),JSON.stringify({librarySha256:ledger.afterLibrarySha256,component:'Exact template CSS and graph rendering/lightbox functions; isolated fixture, not full gameplay',assets:results},null,2));console.log('Rendered '+results.length+' graphs in five contexts.');})().catch(e=>{console.error(e);process.exitCode=1});
