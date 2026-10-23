// Generate embedded definitions from one canonical registry. No engine rewrites.
import fs from 'node:fs';
const check=process.argv.includes('--check');
const read=p=>fs.readFileSync(p,'utf8').replace(/\r\n/g,'\n');
const write=(p,s)=>{if(check){if(read(p)!==s)throw Error('Stale RPG contract: '+p);}else if(read(p)!==s)fs.writeFileSync(p,s);};
const schema=JSON.parse(read('audit_tools/unified_rpg_telemetry/schema.json'));
const minimal={version:schema.version,columns:schema.columns,behaviorFields:schema.behaviorFields,games:schema.games,fields:schema.fields.map(({name,scope,sources})=>({name,scope,sources}))};
const snippet=read('audit_tools/unified_rpg_telemetry/runtime.js').replace('/* RPG_SCHEMA */ null','/* RPG_SCHEMA */ '+JSON.stringify(minimal));
const p='audit_tools/telemetry_contract/runtime.js',original=read(p);
const runtime=original.replace(/\/\/ BEGIN UNIFIED RPG CSV[\s\S]*?\/\/ END UNIFIED RPG CSV\n/,'');
write(p,'// BEGIN UNIFIED RPG CSV\n'+snippet+'// END UNIFIED RPG CSV\n'+runtime);
const targets=JSON.parse(read('audit_tools/unified_rpg_telemetry/baseline.json')).games.map(g=>g.file).filter(p=>!p.includes('managerial-intelligence'));
targets.push('downloads/resources/mastery-quests-faculty-template.html','downloads/resources/mastery-quests-faculty-starter.html');
for(const p of targets){const s=read(p);write(p,s.replace(/const TELEMETRY_COLUMNS\s*=\s*\[[\s\S]*?\];/,'const TELEMETRY_COLUMNS = [\n'+schema.columns.map(c=>JSON.stringify(c)).join(',')+'\n];'));}
console.log('PASS: central RPG registry embedded and generated header copies synchronized.');
