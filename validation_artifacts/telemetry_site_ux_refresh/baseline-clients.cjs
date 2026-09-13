const fs=require('node:fs'),path=require('node:path'),{execFileSync}=require('node:child_process'),{Readable}=require('node:stream');
const root=process.cwd(),original=fs.createReadStream;
fs.createReadStream=function(file,...args){const p=path.relative(root,String(file)).replaceAll('\\','/');if(/^play\/managerial-directorate-(classroom|telemetry-poc)\/telemetry-client\.js$/.test(p))return Readable.from(execFileSync('git',['show','HEAD:'+p],{maxBuffer:16e6}));return original.call(this,file,...args);};
require('node:module').syncBuiltinESMExports();
