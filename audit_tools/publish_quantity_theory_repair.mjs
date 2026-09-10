import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';

// A narrow post-publish step: never import obsolete whole-bank snapshots.
const args=process.argv.slice(2),arg=k=>args.includes(k)?args[args.indexOf(k)+1]:null;
const repo=path.resolve(arg('--repo')||path.join(path.dirname(fileURLToPath(import.meta.url)),'..'));
const output=arg('--output-dir'),write=args.includes('--write');
const spec=JSON.parse(fs.readFileSync(arg('--spec')||path.join(repo,'play/economic-realm/liquidity-grid/authoring/quantity_theory_corrections.json'),'utf8'));
const sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const norm=x=>String(x).normalize('NFKC').trim().replace(/\s+/g,' ').toLowerCase();
const stable=x=>Array.isArray(x)?x.map(stable):x&&typeof x==='object'?Object.fromEntries(Object.keys(x).sort().map(k=>[k,stable(x[k])])):x;
const assert=(v,m)=>{if(!v)throw Error(m);};
const products=[];
function save(relative,bytes){bytes=Buffer.from(bytes);const dest=path.join(repo,relative);const differs=!fs.existsSync(dest)||!fs.readFileSync(dest).equals(bytes);products.push({file:relative,stale:differs,sha256:sha(bytes)});if(output||write){const target=path.join(output||repo,relative);fs.mkdirSync(path.dirname(target),{recursive:true});if(output||differs)fs.writeFileSync(target,bytes);}}
function apply(record,s){assert(record.aHash===s.expectedAnswerHash,'Unexpected answer key '+s.id);assert(record.options.filter(o=>sha(norm(o))===record.aHash).length===1,'Ambiguous answer '+s.id);for(const [k,v]of Object.entries(s.fields)){if(v===null)delete record[k];else record[k]=v;}}
const bankRel='play/economic-realm/liquidity-grid/liquidity_grid_questions_student.js';
let text=fs.readFileSync(path.join(repo,bankRel),'utf8');
const context={};vm.createContext(context);vm.runInContext(text+';globalThis.exported=questionBanks',context);
const bank=context.exported,originalBank=JSON.stringify(bank,null,2),seen=new Set();
for(const records of Object.values(bank))for(const q of records){const s=spec.builtin.find(s=>s.id===q.id);if(s){assert(!seen.has(q.id),'Duplicate bank ID '+q.id);seen.add(q.id);apply(q,s);}}
assert(seen.size===spec.builtin.length,'Missing built-in IDs');
const marker='const questionBanks = ';assert(text.includes(marker),'Bank declaration');
let head=text.slice(0,text.indexOf(marker));
if(!head.includes('publish_quantity_theory_repair.mjs'))head=head.replace(' * Edit the private faculty source and run the publisher again.',' * Edit the private faculty source and run the publisher again.\n * Then apply authoring/quantity_theory_corrections.json with\n * audit_tools/publish_quantity_theory_repair.mjs --write.');
const start=text.indexOf(marker)+marker.length;
assert(text.slice(start,start+originalBank.length)===originalBank,'Unexpected bank formatting');
save(bankRel,head+marker+JSON.stringify(bank,null,2)+text.slice(start+originalBank.length));
const base='build/faculty-build-composer/data/';
const lib=JSON.parse(fs.readFileSync(path.join(repo,base+'composer_library.js'),'utf8').split('window.MQ_COMPOSER_LIBRARY=')[1].trim().replace(/;$/,''));
const found=new Set();
function walk(x){if(!x||typeof x!=='object')return;if(x.q&&Array.isArray(x.options)){const s=spec.composer.find(s=>s.id===x.id);if(s){apply(x,s);found.add(s.id);}return;}Object.values(x).forEach(walk);}
walk(lib.concepts);assert(found.size===spec.composer.length,'Missing Composer IDs');
delete lib.librarySha256;delete lib.registry.librarySha256;lib.librarySha256=sha(JSON.stringify(stable(lib)));lib.registry.librarySha256=lib.librarySha256;
save(base+'composer_library.js','window.MQ_COMPOSER_LIBRARY='+JSON.stringify(lib)+';\n');
for(const name of ['composer_registry.json','composer_library_manifest.json']){const obj=JSON.parse(fs.readFileSync(path.join(repo,base+name),'utf8'));obj.librarySha256=lib.librarySha256;save(base+name,JSON.stringify(obj,null,2)+'\n');}
save('play/economic-realm/liquidity-grid/quantity-theory-fixed-v-y.png',fs.readFileSync(path.join(repo,base+'concept-reviews/assets/quantity-theory-fixed-v-y.png')));
// Optional synchronization of the recovered private faculty HTML. Its existing
// one-line objects and plaintext answer indexes are preserved, not republished.
const privatePath=arg('--private-source');
if(privatePath){
 let html=fs.readFileSync(privatePath,'utf8');
 for(const s of spec.builtin){
  const re=new RegExp('^.*\\{ id: '+s.id+',.*$','m'),match=html.match(re);assert(match,'Private source ID '+s.id);
  const line=match[0];let next=line;
  for(const [key,val]of Object.entries(s.fields)){
   const field=new RegExp('\\b'+key+': "(?:[^"\\\\]|\\\\.)*"');
   if(val===null){next=next.replace(new RegExp('\\b'+key+': "(?:[^"\\\\]|\\\\.)*",? ?'),'');}
   else if(field.test(next))next=next.replace(field,()=>key+': '+JSON.stringify(val));
   else next=next.replace(/\s*},?\s*$/,end=>', '+key+': '+JSON.stringify(val)+end);
  }
  html=html.replace(line,next);
 }
 const differs=html!==fs.readFileSync(privatePath,'utf8');products.push({file:privatePath,stale:differs,sha256:sha(html)});
 if(output)fs.writeFileSync(path.join(output,'private-source.html'),html);
 else if(write&&differs)fs.writeFileSync(privatePath,html);
}
console.log(JSON.stringify({status:products.some(p=>p.stale)&&!write&&!output?'STALE':'PASS',products},null,2));
