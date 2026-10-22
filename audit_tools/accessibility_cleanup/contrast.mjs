import path from 'node:path';import {createRequire} from 'node:module';import {out,pw,serve,isolated,start,save} from './support.mjs';
const require=createRequire(import.meta.url),{PNG}=require(path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/pngjs'));
const {server,origin}=await serve(),browser=await pw.chromium.launch({channel:'msedge',headless:true});const results=[];
const light=c=>c.map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((a,v,i)=>a+v*[.2126,.7152,.0722][i],0);
const ratio=(a,b)=>{a=light(a);b=light(b);return (Math.max(a,b)+.05)/(Math.min(a,b)+.05);};
async function measure(page,name){
 const text=await page.evaluate(()=>[...document.querySelectorAll('body *')].flatMap(el=>{
  if(el.closest('[inert],[hidden],[aria-hidden="true"],.sr-only'))return [];const s=getComputedStyle(el),m=s.color.match(/[\d.]+/g);if(!m||s.visibility==='hidden')return [];
  const r=el.getBoundingClientRect();if(r.width<8||r.height<8)return [];const direct=[...el.childNodes].filter(n=>n.nodeType===3&&n.textContent.trim());if(!direct.length)return [];
  let opacity=1;for(let parent=el;parent;parent=parent.parentElement)opacity*=+getComputedStyle(parent).opacity;
  return direct.flatMap(n=>{const range=document.createRange();range.selectNodeContents(n);return [...range.getClientRects()].filter(b=>b.width>8&&b.height>8).map(b=>({selector:el.id?'#'+el.id:el.tagName.toLowerCase()+'.'+el.className,text:n.textContent.trim().slice(0,90),color:m.map(Number),backgroundCSS:s.backgroundImage,boxShadow:s.boxShadow,opacity,size:parseFloat(s.fontSize),weight:parseFloat(s.fontWeight),x:b.x,y:b.y+scrollY,width:b.width,height:b.height}));});
 }));
 await page.screenshot({path:path.join(out,name+'-visible.png'),fullPage:true});
 const hidden=await page.addStyleTag({content:'body *{color:transparent!important;-webkit-text-fill-color:transparent!important;text-shadow:none!important}'});
 const png=PNG.sync.read(await page.screenshot({fullPage:true}));await hidden.evaluate(el=>el.remove());
 for(const t of text){let minimum=Infinity,bg=null;const alpha=(t.color[3]??1)*t.opacity;
  for(let y=Math.max(0,Math.ceil(t.y+2));y<Math.min(png.height,t.y+t.height-2);y+=3)for(let x=Math.max(0,Math.ceil(t.x+2));x<Math.min(png.width,t.x+t.width-2);x+=3){const i=(y*png.width+x)*4,b=[...png.data.subarray(i,i+3)],fg=b.map((v,j)=>t.color[j]*alpha+v*(1-alpha)),r=ratio(fg,b);if(r<minimum){minimum=r;bg=b;}}
  t.minimumSampledRatio=Number(minimum.toFixed(2));t.backgroundAtMinimum=bg;t.threshold=t.size>=24||t.size>=18.66&&t.weight>=700?3:4.5;
 }
 results.push({name,method:'Conservative sampling across text rectangles with only text paint hidden; actual gradients/images/translucent backdrops retained. Excludes offscreen, inert and sr-only text. Border/currentColor and glyph-specific contrast still need human review.',text,belowThreshold:text.filter(t=>t.minimumSampledRatio<t.threshold)});save('contrast.json',results);
}
try{
 const {page,context}=await isolated(browser,origin,{viewport:{width:1280,height:900},reducedMotion:'reduce'});
 await page.goto(origin+'/');await measure(page,'home');const link=page.locator('.button,.btn').first();if(await link.count()){await link.focus();await link.hover();await measure(page,'home-hover-focus');}
 await page.goto(origin+'/downloads/resources/mastery-quests-faculty-starter.html');await start(page);await page.waitForTimeout(6500);await measure(page,'question');
 await page.evaluate(()=>{returnToModeSelectFromRun();setQuizQuestionCount(1);});await start(page,'quiz');await page.evaluate(()=>{questionStartTime=Date.now()-30000;});
 const answer=await page.evaluate(async()=>{for(let i=0;i<4;i++)if(await isQuestionAnswerCorrect(currentQuestion,i))return i;});await page.locator('#answers button').nth(answer).click();await page.waitForTimeout(4500);
 const report=page.getByRole('button',{name:'View Mastery Report',exact:false});if(await report.isVisible())await report.click();await measure(page,'report');await context.close();
 console.log(JSON.stringify(results.map(r=>({name:r.name,samples:r.text.length,below:r.belowThreshold.map(t=>({text:t.text,ratio:t.minimumSampledRatio,selector:t.selector}))})),null,2));
}finally{await browser.close();server.close();}
