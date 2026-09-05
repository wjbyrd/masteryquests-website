const fs=require('node:fs'),path=require('node:path');
function destination(file){if(typeof file!=='string')return file;const root=path.resolve(process.env.GATE_REPO),rel=path.relative(root,path.resolve(file));if(rel.startsWith('validation_artifacts'+path.sep)&&!rel.startsWith('validation_artifacts'+path.sep+'classroom_access'+path.sep)){file=path.join(root,'validation_artifacts/classroom_access/existing',rel.slice('validation_artifacts'.length+1));fs.mkdirSync(path.dirname(file),{recursive:true});}return file;}
const sync=fs.writeFileSync,asyncWrite=fs.writeFile,promiseWrite=fs.promises.writeFile;
fs.writeFileSync=function(file,...args){return sync.call(this,destination(file),...args);};
fs.writeFile=function(file,...args){return asyncWrite.call(this,destination(file),...args);};
fs.promises.writeFile=function(file,...args){return promiseWrite.call(this,destination(file),...args);};
require('node:module').syncBuiltinESMExports();
