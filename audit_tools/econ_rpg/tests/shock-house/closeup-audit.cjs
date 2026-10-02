// Read-only rendered-resolution audit. Fixtures use the real renderers and inspection shell.
const fs=require('node:fs');
const {chromium}=require(process.env.PLAYWRIGHT_PATH||'C:/Users/Jennings/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const out='tmp/shock-house/inspection-polish';fs.mkdirSync(out,{recursive:true});
(async()=>{const browser=await chromium.launch({channel:'chrome',headless:true}),rows=[];try{
 for(const [width,height,dpr] of [[1440,900,1],[768,1024,1],[390,844,3],[844,390,2]]){
  const p=await browser.newPage({viewport:{width,height},deviceScaleFactor:dpr,reducedMotion:'reduce'});
  await p.goto('http://127.0.0.1:4179/games/the-shock-house/');await p.locator('[data-action="begin"]').click();await p.locator('[data-action="search"][data-id="mail"]').click();
  const data=await p.evaluate(async()=>{
   const t=await import('./tactile.js'),o=await import('./objects.js'),e=await import('./engine.js'),rv=await import('./recovery-view.js'),rs=await import('./recovery-state.js'),c=await import('./content.js');
   const s=e.newState(),r=rs.newRecovery(),cases=[],result=[];
   const ids=[...new Set([...Object.keys(t.MINI),'coat','drawer','wallet','groceries','receipt','tags','rent','utility-bill','receiver','service'])];
   for(const phase of ['initial','revealed']){
    if(phase==='revealed'){s.inspectedObjects=['moved:jar','moved:bread','moved:catalogue','search:files','moved:postcard','moved:wallet','moved:bin-lid','rent-read','old-food','new-food','output-read'];r.flags=[...rs.RECOVERY_FLAGS];r.channel=0;r.ticketFace=true;}
    for(const id of ids)cases.push(['M1 '+id+' '+phase,t.renderTactile(id,s)]);
    for(const id of Object.keys(c.DOCUMENTS))cases.push(['M1 document '+id+' '+phase,t.tactileDocument(id,s)||o.renderDocument(id)]);
    for(const id of ['budget','cost','orders','indicators','radio','policy','exit','mandate','memo'])cases.push(['M1 mechanism '+id+' '+phase,o.renderMechanism(id,s)]);
    for(const id of ['coat','coin','ticket','frame','ledger','gardening','meter','service-cost','machine','mail','bin','records','adoption','television','comparison','mandate','exit'])cases.push(['M2 '+id+' '+phase,rv.recoveryView(id,r)]);
   }
   const target=document.querySelector('.inspection-object');
   for(const [view,html] of cases){
    const parts=view.split(' '),documentView=parts[1]==='document'||parts[1]==='mechanism',id=parts[documentView?2:1];
    const name=documentView?id:'search:'+id;
    target.className='view-panel inspection-object type-'+name.replace(':','-');
    target.parentElement.className='inspection-layer '+(name.startsWith('search:')||['production','stock','index','bills','invoices'].includes(name)?'tactile-layer':'');
    target.innerHTML=html;await Promise.all([...target.querySelectorAll('img')].map(x=>x.decode().catch(()=>{})));
    for(const img of target.querySelectorAll('img')){
     const b=img.getBoundingClientRect(),parent=img.parentElement.getBoundingClientRect();if(!b.width||!b.height)continue;
     const scale=img.style.width.endsWith('%')?parseFloat(img.style.width)/100:1;
     const scaleY=img.style.height.endsWith('%')?parseFloat(img.style.height)/100:1;
     result.push({view,asset:img.dataset.asset||img.src.split('/').pop().replace('.webp',''),file:img.src.split('/').pop(),nativeW:img.naturalWidth,nativeH:img.naturalHeight,crop:scale>1?[+(100/scale).toFixed(3),+(100/scaleY).toFixed(3),img.style.left,img.style.top]:null,renderW:Math.ceil(scale>1?parent.width:b.width),renderH:Math.ceil(scaleY>1?parent.height:b.height),failed:!img.naturalWidth||!!img.dataset.failed});
    }
    for(const el of target.querySelectorAll('*')){
     const b=el.getBoundingClientRect(),bg=getComputedStyle(el).backgroundImage;if(!b.width||!b.height||!bg.includes('assets/illustrated/'))continue;
     const files=[...bg.matchAll(/assets\/illustrated\/([^"\)]+)/g)].map(m=>m[1]);
     for(const file of files)result.push({view,asset:file.replace(/-(?:768|384)?\.webp$|\.webp$/,''),file,css:true,atlas:file==='object_atlas.webp',renderW:Math.ceil(b.width),renderH:Math.ceil(b.height),selector:el.className});
    }
    for(const selector of ['.open-catalogue','.desk-balance-indicator'])for(const el of target.querySelectorAll(selector)){const b=el.getBoundingClientRect();result.push({view,asset:selector,cssFallback:true,renderW:Math.ceil(b.width),renderH:Math.ceil(b.height)});}
   }
   return result;
  });rows.push(...data.map(row=>({...row,width,height,dpr})));await p.close();
 }
 fs.writeFileSync(out+'/resolution-audit.json',JSON.stringify(rows,null,2));console.log(JSON.stringify({samples:rows.length,failed:rows.filter(x=>x.failed),viewports:4}));
}finally{await browser.close();}})().catch(e=>{console.error(e);process.exitCode=1;});
