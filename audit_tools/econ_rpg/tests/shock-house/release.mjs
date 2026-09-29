import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';import {createHash} from 'node:crypto';
import {publishSignalHouse} from '../../publish-signal-house.mjs';
const root=process.cwd(),cfg=JSON.parse(fs.readFileSync('audit_tools/econ_rpg/signal-house-release.json','utf8'));
const target=path.join(root,'dist',cfg.previewRoute.slice(1));
assert.equal(cfg.gameNumber,12);assert.equal(cfg.publicReleased,false);
assert(!fs.existsSync(path.join(root,'dist',cfg.publicRoute.slice(1))));
const html=fs.readFileSync(path.join(target,'index.html'),'utf8');assert.match(html,/<title>Signal House · Mastery Quests<\/title>/);assert.match(html,/name="robots" content="noindex,nofollow"/);
const files=[];function walk(dir){for(const f of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,f.name);f.isDirectory()?walk(p):files.push(p);}}walk(target);
const hash=p=>createHash('sha256').update(fs.readFileSync(p)).digest('hex');
for(const file of files){const rel=path.relative(target,file);assert(/\.(html|css|js|svg|webp|png|mp3|wav|ogg)$/.test(file));if(rel!=='index.html')assert.equal(hash(file),hash(path.join(root,cfg.source,rel)),'Preview uses unchanged production runtime: '+rel);}
assert(!files.some(f=>f.endsWith('PROMPTS.json')));
const publicFiles=[];function scan(dir){for(const f of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,f.name);if(p.startsWith(target))continue;if(f.isDirectory())scan(p);else if(/\.(html|xml|json|js|txt)$/.test(p))publicFiles.push(p);}}scan(path.join(root,'dist'));
for(const file of publicFiles)assert(!fs.readFileSync(file,'utf8').includes(cfg.previewRoute),'No public link or index of private route: '+file);
assert(!fs.readFileSync('dist/games/index.html','utf8').includes('data-game="signal-house"'));
assert.match(fs.readFileSync(path.join(target,'engine.js'),'utf8'),/mastery-quests\.shock-house\.v1/);
const stage=path.join(root,'tmp/signal-house-release/enabled');fs.mkdirSync(path.join(stage,'games'),{recursive:true});fs.copyFileSync('games/index.html',path.join(stage,'games/index.html'));
publishSignalHouse(root,stage,{releasePublic:true});assert(fs.existsSync(path.join(stage,cfg.publicRoute,'index.html')));assert.match(fs.readFileSync(path.join(stage,'games/index.html'),'utf8'),/data-game="signal-house" data-game-number="12"/);assert.match(fs.readFileSync(path.join(stage,cfg.legacyRoute,'index.html'),'utf8'),/url=\/games\/signal-house\//);
assert.equal(JSON.parse(fs.readFileSync('audit_tools/econ_rpg/signal-house-release.json','utf8')).publicReleased,false);
console.log(JSON.stringify({passed:true,identicalRuntimeFiles:files.length-1,unlisted:cfg.previewRoute,stagedCard:true,enabledRouteVerified:true,legacyKeyPreserved:true}));
