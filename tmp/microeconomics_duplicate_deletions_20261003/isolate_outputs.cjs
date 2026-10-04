// Redirect only generated comprehensive-test artifacts; expectations and reads
// remain untouched. The existing active runner isolates its other outputs.
const fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../..');
const from=path.join(root,'validation_artifacts/macroeconomics_consolidated_cleanup');
const to=path.join(__dirname,'active-generated');
const resolve=p=>{if(typeof p!=='string')return p;const a=path.resolve(p);return a===from||a.startsWith(from+path.sep)?to+a.slice(from.length):p;};
for(const method of ['writeFileSync','mkdirSync']){const original=fs[method];fs[method]=function(p,...args){return original.call(this,resolve(p),...args);};}
require('node:module').syncBuiltinESMExports();
