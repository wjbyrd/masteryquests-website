import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {createServer} from 'node:http';
import {createRequire} from 'node:module';
import {publishGamesPreview} from './publish-games-preview.mjs';
const root=process.cwd(),out=path.resolve('tmp/econ-rpg/road-ahead/published');fs.mkdirSync(out,{recursive:true});
const config=publishGamesPreview(root,out),base=path.join(out,config.previewRoot,'games/the-road-ahead');
for(const file of ['index.html','app.js','engine.js','data.js','chapters.js','random.js','markets.js','events.js','consequences.js','debrief.js','storage.js','board.js','characters.js','style.css','preview.svg'])assert.ok(fs.existsSync(path.join(base,file)),file);
assert.equal(config.gameCount,17);assert.equal(fs.existsSync(path.join(base,'README.md')),false);assert.ok(fs.existsSync(path.join(base,'../the-long-run/city/sprites.js')));
const server=createServer((req,res)=>{try{let file=path.resolve(out,'.'+new URL(req.url,'http://local').pathname);if(!file.startsWith(out+path.sep))throw Error();if(fs.statSync(file).isDirectory())file=path.join(file,'index.html');res.setHeader('Content-Type',({'.html':'text/html','.js':'text/javascript','.css':'text/css','.svg':'image/svg+xml','.webp':'image/webp','.png':'image/png'})[path.extname(file)]||'application/octet-stream');res.end(fs.readFileSync(file));}catch{res.writeHead(404).end();}});
await new Promise(r=>server.listen(0,'127.0.0.1',r));let browser;
try{const {chromium}=createRequire(import.meta.url)(process.env.PLAYWRIGHT_MODULE||'playwright');browser=await chromium.launch({channel:'chrome',headless:true});const p=await browser.newPage(),errors=[];p.on('pageerror',e=>errors.push(e.message));p.on('response',r=>{if(r.status()>=400)errors.push(`${r.status()} ${r.url()}`);});
  const origin=`http://127.0.0.1:${server.address().port}`;await p.goto(origin+config.previewRoot+'games/');await p.waitForLoadState('networkidle');assert.equal(await p.locator('.game-card').count(),17);
  await p.getByRole('link',{name:'PLAY GAME: The Road Ahead',exact:true}).click();await p.locator('[data-action="select"]').click();await p.locator('[data-action="start"][data-id="natural"]').click();await p.locator('canvas.board-canvas').waitFor();await p.getByRole('link',{name:'Return to Games',exact:true}).first().click();assert.equal(new URL(p.url()).pathname,config.previewRoot+'games/');assert.deepEqual(errors,[]);
  console.log('PASS: packaged 17-game hub → The Road Ahead → hub; 48x72 sprite module, runtime assets, and no browser errors.');
}finally{await browser?.close();await new Promise(r=>server.close(r));}
