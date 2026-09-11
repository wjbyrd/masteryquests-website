// Maintained POC engines are the existing POC HTML files, including reviewed award hooks.
// Refresh integration only; the old one-time public clone would erase those hooks and double-install trackers.
import fs from 'node:fs';import path from 'node:path';
const repo=path.resolve(process.argv[2]||'.');
// A build-level faculty/deployer switch; browser overrides cannot enable a disabled build.
const REMOTE_COLLECTION_ENABLED=true;
const check=process.argv.includes('--check');
for(const game of ['cost-directive','market-signal','strategy-desk','agency-protocol']){
 const file=path.join(repo,'play/managerial-directorate-telemetry-poc',game,'index.html');
 const original=fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n');
 let html=original.replace(/<meta name="anonymous-telemetry-collection" content="[^"]*">/g,'');
 html=html.replace('<head>','<head><meta name="anonymous-telemetry-collection" content="'+(REMOTE_COLLECTION_ENABLED?'enabled':'disabled')+'">');
 if(html.includes('../local-telemetry.js'))throw Error('Public adapter must not coexist in private POC: '+game);
 const includes=[...html.matchAll(/<script[^>]*src="[^"]*telemetry-client\.js"[^>]*><\/script>/g)];
 if(includes.length!==1||!includes[0][0].includes('data-game-id="'+game+'"'))throw Error('Invalid POC integration: '+game);
 if(check){if(html!==original)throw Error('Stale POC collection configuration: '+game);}else fs.writeFileSync(file,html);
}
console.log('PASS: POC integration and maintained collection setting; engine/award hooks preserved.');
