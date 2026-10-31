import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {publishGamesPreview} from './publish-games-preview.mjs';

test('Market Shift ships only its runtime in the beta Microeconomics collection',()=>{
  const root=process.cwd(),dist=path.resolve('tmp/market-shift/publication-test');
  fs.mkdirSync(dist,{recursive:true});
  const config=publishGamesPreview(root,dist),base=path.join(dist,config.previewRoot.slice(1),'games/market-shift');
  const files=fs.readdirSync(base,{recursive:true}).filter(name=>fs.statSync(path.join(base,name)).isFile()).map(name=>name.replaceAll('\\','/'));
  const art=['market','busy','quiet','storm','harvest','delivery','busy-harvest','quiet-harvest','busy-storm','quiet-storm'];
  assert.deepEqual(files.sort(),['index.html','app.js','model.js','graph.js','scene.js','styles.css',...art.map(name=>`assets/linden-${name}.webp`)].sort());
  const html=fs.readFileSync(path.join(base,'index.html'),'utf8');
  assert.match(html,/name="robots" content="noindex,nofollow"/);
  assert.ok(html.includes(`class="return-games" href="${config.previewRoot}games/"`));
  const hub=fs.readFileSync(path.join(dist,config.previewRoot.slice(1),'games/index.html'),'utf8');
  assert.equal(config.gameCount,18);
  assert.equal((hub.match(/class="game-card"/g)||[]).length,config.gameCount);
  const micro=hub.split('aria-labelledby="microeconomics-heading"')[1].split('</section>')[0];
  assert.match(micro,/data-game="market-shift"/);
  assert.match(micro,/src="\.\/market-shift\/assets\/linden-busy.webp"/);
  assert.match(micro,/href="\.\/market-shift\/"/);
  assert.ok(fs.readFileSync(path.join(base,'assets/linden-busy.webp')).equals(fs.readFileSync(path.join(root,config.source,'games/market-shift/assets/linden-busy.webp'))));
});
