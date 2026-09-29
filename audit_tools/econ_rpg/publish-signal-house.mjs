import fs from 'node:fs';
import path from 'node:path';
// The same reviewed runtime supplies the private device route and eventual release.
export function publishSignalHouse(root,dist,{releasePublic}={}){
 const config=JSON.parse(fs.readFileSync(path.join(root,'audit_tools/econ_rpg/signal-house-release.json'),'utf8'));
 if(releasePublic!==undefined)config.publicReleased=releasePublic;
 const source=path.join(root,config.source);
 const copyRuntime=(route,preview)=>{
  if(!/^\/(?:beta-testing|games)\/[a-z0-9-]+\/$/.test(route))throw Error('Invalid Signal House route');
  const target=path.join(dist,route.slice(1));
  const visit=(dir,relative='')=>{for(const entry of fs.readdirSync(dir,{withFileTypes:true})){
   const rel=path.join(relative,entry.name),src=path.join(dir,entry.name),dest=path.join(target,rel);
   if(entry.isDirectory())visit(src,rel);
   else if(/\.(?:html|js|css|svg|webp|png|mp3|wav|ogg)$/.test(entry.name)){
    fs.mkdirSync(path.dirname(dest),{recursive:true});
    if(rel==='index.html'){
     let html=fs.readFileSync(src,'utf8');
     if(preview)html=html.replace('<meta charset="utf-8">','<meta charset="utf-8">\n  <meta name="robots" content="noindex,nofollow">');
     fs.writeFileSync(dest,html);
    }else fs.copyFileSync(src,dest);
   }
  }};visit(source);
 };
 copyRuntime(config.previewRoute,true);
 // The staged card is integrated into the real Games page only on explicit release.
 if(config.publicReleased){
  copyRuntime(config.publicRoute,false);
  const hub=path.join(dist,'games/index.html');
  let html=fs.readFileSync(hub,'utf8');
  const marker=/<!-- SIGNAL_HOUSE_RELEASE_CARD:[\s\S]*?-->/;
  if(!marker.test(html))throw Error('Missing public Games card insertion point');
  html=html.replace(marker,()=>fs.readFileSync(path.join(root,config.cardTemplate),'utf8'));
  fs.writeFileSync(hub,html);
  const legacy=path.join(dist,config.legacyRoute.slice(1));fs.mkdirSync(legacy,{recursive:true});
  fs.writeFileSync(path.join(legacy,'index.html'),'<!doctype html><html lang="en"><meta charset="utf-8"><meta name="robots" content="noindex,nofollow"><meta http-equiv="refresh" content="0;url='+config.publicRoute+'"><title>Signal House · Mastery Quests</title><a href="'+config.publicRoute+'">Open Signal House</a></html>');
 }
 fs.appendFileSync(path.join(dist,'_headers'),`${config.previewRoute}*\n  X-Robots-Tag: noindex, nofollow\n  Cache-Control: no-cache\n`);
 return config;
}
