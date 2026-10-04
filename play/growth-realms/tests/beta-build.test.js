import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=fileURLToPath(new URL('../../../',import.meta.url));
const config=JSON.parse(fs.readFileSync(path.join(root,'audit_tools/econ_rpg/games-preview.json')));
const beta=path.join(root,'dist',config.previewRoot.slice(1),'games');
test('Built beta card launches the authoritative Rival Cities runtime with return navigation',()=>{
 const hub=fs.readFileSync(path.join(beta,'index.html'),'utf8'),html=fs.readFileSync(path.join(beta,'growth-realms/index.html'),'utf8');
 assert.equal((hub.match(/class="game-card"/g)||[]).length,config.gameCount);
 assert.match(hub,/data-game="growth-realms"/);assert.match(hub,/href="\.\/growth-realms\/"/);assert.match(html,/href="\.\.\/"[^>]*>Return to Games/);assert.match(html,/name="robots" content="noindex,nofollow"/);
 for(const file of ['rivalry.js','flow.css','characters.js','splash-layout.js','advisor.js','report-learning.js','traffic.js','walking-sprites.js'])assert.ok(fs.existsSync(path.join(beta,'growth-realms',file)),`Production flow dependency: ${file}`);
 const seen=[];
 function scan(dir){for(const e of fs.readdirSync(dir,{withFileTypes:true})){const file=path.join(dir,e.name);if(e.isDirectory())scan(file);else seen.push(file);}}
 scan(path.join(beta,'growth-realms'));
 assert.ok(fs.existsSync(path.join(beta,'growth-realms/district-layout.js')),'Production zoning module must ship with the renderer');
 for(const file of seen){assert.match(file,/\.(?:html|js|css|svg|webp|png|mp3|wav|ogg)$/);assert.ok(!file.split(path.sep).includes('tests'));if(!file.endsWith('.html'))assert.deepEqual(fs.readFileSync(file),fs.readFileSync(path.join(root,'play/growth-realms',path.relative(path.join(beta,'growth-realms'),file))));}
 assert.ok(!fs.readFileSync(path.join(root,'dist/games/index.html'),'utf8').includes(config.previewRoot));
 assert.equal(fs.existsSync(path.join(root,'dist/play/growth-realms/index.html')),false);
 assert.match(fs.readFileSync(path.join(root,'dist/_headers'),'utf8'),/X-Robots-Tag: noindex, nofollow/);
});
