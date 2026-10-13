import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {fn,templatePath} from '../economic_realm_engine/source.mjs';
const check=process.argv.includes('--check'),formatter=fn(fs.readFileSync(templatePath,'utf8'),'formatMasteryLabel');
function replaceFunctions(source,name,replacement){
 let offset=0;
 while(true){const start=source.indexOf('function '+name+'(',offset);if(start<0)break;const old=fn(source.slice(start),name),next=typeof replacement==='function'?replacement(old):replacement;source=source.slice(0,start)+next+source.slice(start+old.length);offset=start+next.length;}
 return source;
}
function updateTitles(source){return replaceFunctions(source,'getInstructionalObjectiveTitle',old=>{
 if(old.includes('mappedTitle'))return old.replace(/return mappedTitle[^;]+;/,'return formatMasteryLabel(mappedTitle || objectiveId);');
 return 'function getInstructionalObjectiveTitle(id){ return formatMasteryLabel(id); }';
});}
function save(file,next){if(fs.readFileSync(file,'utf8')===next)return;if(check)throw Error('Stale objective labels: '+file);fs.writeFileSync(file,next);}
const files=execFileSync('git',['ls-files','--','*.html',':(exclude)audit_tools',':(exclude)validation_artifacts',':(exclude)tmp'],{encoding:'utf8',maxBuffer:16*1024*1024}).trim().split('\n');let games=0,footers=0;
for(const file of files.filter(f=>/^play\/.*\/index\.html$/.test(f)||/^downloads\/resources\/mastery-quests-faculty-(?:template|starter)\.html$/.test(f))){
 const source=fs.readFileSync(file,'utf8');if(!source.includes('function formatMasteryLabel('))continue;
 save(file,updateTitles(replaceFunctions(source,'formatMasteryLabel',formatter)));games++;
}
// Realm generators retain these resource functions from their published profiles.
for(const file of ['audit_tools/economic_realm_engine/profiles.json','audit_tools/macro_command_engine/profiles.json']){
 const profiles=JSON.parse(fs.readFileSync(file,'utf8'));let changed=false;
 for(const p of Object.values(profiles)){if(!p.resourceSource)continue;const next=updateTitles(p.resourceSource);if(next!==p.resourceSource){p.resourceSource=next;changed=true;}}
 if(changed)save(file,JSON.stringify(profiles,null,2)+'\n');
}
for(const file of files.filter(f=>f.endsWith('.html')&&!/^(audit_tools|validation_artifacts|tmp|server)\//.test(f))){
 const source=fs.readFileSync(file,'utf8');if(!source.includes('class="footer-navigation"'))continue;
 const next=source.replace(/(<nav\b[^>]*class="footer-navigation"[^>]*>)([\s\S]*?)(<\/nav>)/g,(_,open,body,close)=>open+body.replace(/<a\b[^>]*href="\/about\/updates\/"[^>]*>[\s\S]*?<\/a>\s*/g,'')+'<a class="footer-updates" href="/about/updates/">Updates</a>\n'+close);
 save(file,next);footers++;
}
console.log(`PASS: descriptive objective labels in ${games} game/manual builds; Updates button in ${footers} site footers.`);
