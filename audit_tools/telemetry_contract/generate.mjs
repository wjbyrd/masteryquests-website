import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const check=process.argv.includes('--check');
const read=p=>fs.readFileSync(path.join(root,p),'utf8').replace(/\r\n/g,'\n');
const sha=v=>crypto.createHash('sha256').update(v).digest('hex');
const write=(p,s)=>{if(check){if(read(p)!==s)throw Error('Stale generated contract: '+p);}else fs.writeFileSync(path.join(root,p),s);};
const template='build/faculty-build-composer/template/mastery-quests-faculty-template-composer-ready.html';
const client='play/managerial-directorate-telemetry-poc/telemetry-client.js';
const runtime=read('audit_tools/telemetry_contract/runtime.js');
const release=JSON.parse(read('audit_tools/telemetry_contract/release.json'));
const strip=s=>s.replace(/  \/\/ BEGIN MEASUREMENT CONTRACT[\s\S]*?  \/\/ END MEASUREMENT CONTRACT/g,'');
const filesUnder=dir=>fs.readdirSync(path.join(root,dir),{withFileTypes:true}).flatMap(x=>x.isDirectory()?filesUnder(dir+'/'+x.name):[dir+'/'+x.name]);
const assetHash=dir=>sha(JSON.stringify(filesUnder(dir).filter(p=>/\.(webp|png|jpg|svg|mp3|wav)$/i.test(p)).sort().map(p=>[p.slice(dir.length+1),sha(fs.readFileSync(path.join(root,p)))])));
const games={};
for(const slug of ['cost-directive','market-signal','strategy-desk','agency-protocol']){
 const dir='play/managerial-intelligence-directorate/'+slug;
 games[slug]={engineRevision:sha(strip(read(dir+'/index.html'))+read('play/managerial-intelligence-directorate/managerial-parity.js')),pocEngineRevision:sha(read('play/managerial-directorate-telemetry-poc/'+slug+'/index.html')+read('play/managerial-intelligence-directorate/managerial-parity.js')),classroomEngineRevision:sha(read('play/managerial-directorate-classroom/'+slug+'/index.html')+read('play/managerial-intelligence-directorate/managerial-parity.js')),assetRevision:assetHash(dir)};
}
games.composer={engineRevision:sha(strip(read(template))),assetRevision:assetHash('build/faculty-build-composer/data/question-assets')};
const registry={...release,trackerSourceRevision:sha(runtime+strip(read(client))+read('audit_tools/managerial_classroom/build.mjs')+read('audit_tools/published_managerial_parity/sync.mjs')),games};
for(const p of [template,client]){
 const getter=p===template?'(name,fallback)=>{try{return eval(name);}catch(_){return fallback;}}':'globalValue';
 const block='  // BEGIN MEASUREMENT CONTRACT\n'+runtime+'\n  const MQContract=createTelemetryContract('+getter+', /* RELEASE REGISTRY */ '+JSON.stringify(registry)+');\n  // END MEASUREMENT CONTRACT';
 write(p,read(p).replace(/  \/\/ BEGIN MEASUREMENT CONTRACT[\s\S]*?  \/\/ END MEASUREMENT CONTRACT/,block));
}
write('audit_tools/telemetry_contract/hash.mjs',runtime+'\nconst utilities=createTelemetryContract(()=>null,{});\nexport const contractHash=utilities.hash,stableContractJSON=utilities.stable;\n');
write('audit_tools/telemetry_contract/registry.json',JSON.stringify(registry,null,2)+'\n');
console.log('PASS: deterministic artifact registry and embedded contract helpers.');
