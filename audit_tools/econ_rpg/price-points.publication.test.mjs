import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import {publishGamesPreview} from './publish-games-preview.mjs';
test('Price Points publishes its runtime, cover card and beta return route only',()=>{
 const root=process.cwd(),dist=path.resolve('tmp/price-points/publication-test');fs.mkdirSync(dist,{recursive:true});
 const c=publishGamesPreview(root,dist),base=path.join(dist,c.previewRoot.slice(1),'games/price-points');
 const files=fs.readdirSync(base,{recursive:true}).filter(p=>fs.statSync(path.join(base,p)).isFile()).map(p=>p.replaceAll('\\','/'));
 assert.deepEqual(files.sort(),['index.html','app.js','graph.js','model.js','styles.css',...['high-street','cafe','neighborhood','workshop'].map(n=>'assets/'+n+'.webp')].sort());
 const html=fs.readFileSync(path.join(base,'index.html'),'utf8');assert(html.includes('href="'+c.previewRoot+'games/"'));assert(html.includes('content="noindex,nofollow"'));assert(html.includes('Beta preview'));
 const hub=fs.readFileSync(path.join(dist,c.previewRoot.slice(1),'games/index.html'),'utf8'),micro=hub.split('aria-labelledby="microeconomics-heading"')[1].split('</section>')[0];
 assert.equal(c.gameCount,19);assert.equal((hub.match(/class="game-card"/g)||[]).length,19);assert(micro.includes('data-game="price-points"'));assert(micro.includes('./price-points/assets/high-street.webp'));assert(micro.includes('href="./price-points/"'));
 assert(fs.readFileSync(path.join(base,'assets/high-street.webp')).equals(fs.readFileSync(path.join(root,c.source,'games/price-points/assets/high-street.webp'))));
});
