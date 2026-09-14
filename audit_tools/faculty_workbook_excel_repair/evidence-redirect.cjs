// Preserve earlier workstream evidence while rerunning their unchanged checks.
const fs=require('node:fs'),path=require('node:path');
function destination(file){
  if(typeof file!=='string')return file;
  const rel=path.relative(path.resolve('validation_artifacts'),path.resolve(file));
  if(rel.startsWith('..')||path.isAbsolute(rel)||rel.startsWith('faculty_workbook_excel_repair'+path.sep))return file;
  const output=path.resolve('validation_artifacts/faculty_workbook_excel_repair/regressions',rel);
  fs.mkdirSync(path.dirname(output),{recursive:true});return output;
}
for(const key of ['writeFileSync','writeFile']){const original=fs[key];fs[key]=function(file,...args){return original.call(this,destination(file),...args);};}
const original=fs.promises.writeFile;fs.promises.writeFile=function(file,...args){return original.call(this,destination(file),...args);};
for(const key of ['copyFile','copyFileSync']){const original=fs[key];fs[key]=function(source,dest,...args){return original.call(this,source,destination(dest),...args);};}
const copy=fs.promises.copyFile;fs.promises.copyFile=function(source,dest,...args){return copy.call(this,source,destination(dest),...args);};
require('node:module').syncBuiltinESMExports();
