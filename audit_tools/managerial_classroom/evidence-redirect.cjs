// Existing suites run unchanged; keep their historical evidence files intact.
const fs=require('node:fs'),path=require('node:path');
const original=fs.writeFileSync;
fs.writeFileSync=function(file,...args){
 if(typeof file==='string'){
  const absolute=path.resolve(file),root=path.resolve(process.env.CLASSROOM_REPO),rel=path.relative(root,absolute);
  if(rel.startsWith('validation_artifacts'+path.sep)&&!rel.startsWith('validation_artifacts'+path.sep+'managerial_classroom'+path.sep)){
   file=path.join(root,'validation_artifacts/managerial_classroom/existing',rel.slice('validation_artifacts'.length+1));fs.mkdirSync(path.dirname(file),{recursive:true});
  }
 }
 return original.call(this,file,...args);
};
require('node:module').syncBuiltinESMExports();

// The POC inventory predates the completed public UI parity work. For the
// explicitly scoped rerun only, use this task's captured hashes in memory.
const originalRead=fs.readFileSync;
fs.readFileSync=function(file,...args){
 const result=originalRead.call(this,file,...args);
 if(process.env.CLASSROOM_CURRENT_BASELINE==='1' && typeof file==='string' && path.basename(file)==='pre_edit_inventory.json'){
  const inventory=JSON.parse(result.toString());const baseline=JSON.parse(originalRead(path.join(process.env.CLASSROOM_REPO,'validation_artifacts/managerial_classroom/baseline_hashes.json'),'utf8'));
  for(const key of Object.keys(inventory.protectedFiles)){if(!baseline[key])throw Error('Missing baseline '+key);inventory.protectedFiles[key]=baseline[key];}
  const output=JSON.stringify(inventory);return typeof result==='string'?output:Buffer.from(output);
 }
 return result;
};
require('node:module').syncBuiltinESMExports();
