'use strict';
const fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process');
const BASELINE='0f7c34f5c1498715a4da580ac672fd506ed1627e';
module.exports=function ensureBaseline(){
 const root=path.resolve(__dirname,'../..'),folder=path.join(__dirname,'baseline');fs.mkdirSync(folder,{recursive:true});
 for(const name of ['composer_library.js','composer_registry.json','composer_library_manifest.json','faculty-outcomes.js']){
  const target=path.join(folder,name);if(fs.existsSync(target))continue;
  const bytes=execFileSync('git',['show',`${BASELINE}:build/faculty-build-composer/data/${name}`],{cwd:root,maxBuffer:64*1024*1024});fs.writeFileSync(target,bytes);
 }
};
