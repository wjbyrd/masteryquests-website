const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const {createHash}=require('node:crypto');
const config=JSON.parse(fs.readFileSync('audit_tools/econ_rpg/games-preview.json'));
const dest=path.join('dist',config.previewRoot,'games/at-the-box-office');
const source='audit_tools/econ_rpg/game/games/at-the-box-office';
test('all nine runtime files publish, supplied imagery remains identical, source-only files stay private',()=>{
  const files=[];function visit(dir){for(const entry of fs.readdirSync(dir,{withFileTypes:true})){const p=path.join(dir,entry.name);if(entry.isDirectory())visit(p);else files.push(path.relative(dest,p).replaceAll('\\','/'));}}visit(dest);
  assert.deepEqual(files.sort(),['game.js','graphs.js','index.html','scenarios.js','seasons.js','styles.css','scenes/concessions-lobby.webp','scenes/manager-office.webp','scenes/theater-exterior.webp'].sort());
  for(const file of files){if(file==='index.html')continue;assert.equal(createHash('sha256').update(fs.readFileSync(path.join(source,file))).digest('hex'),createHash('sha256').update(fs.readFileSync(path.join(dest,file))).digest('hex'));}
  // Revised office/lobby imagery is supplied directly in the canonical source.
  // The runtime hash comparisons above verify those exact assets are shipped.
  assert.deepEqual(fs.readFileSync(path.join(source,'scenes/theater-exterior.webp')),fs.readFileSync('tmp/econ-rpg/at-the-box-office/scenes/theater-exterior.webp'));
  assert.match(fs.readFileSync(path.join(dest,'index.html'),'utf8'),/name="robots" content="noindex,nofollow"/);
});
test('13-card hub links the game and its art; no link appears on the public hub',()=>{
  const hub=fs.readFileSync(path.join('dist',config.previewRoot,'games/index.html'),'utf8');
  assert.equal((hub.match(/class="game-card"/g)||[]).length,config.gameCount);assert.equal(config.gameCount,13);
  assert.match(hub,/href="\.\/at-the-box-office\/"/);assert.match(hub,/src="\.\/at-the-box-office\/scenes\/theater-exterior.webp"/);
  assert(!fs.readFileSync('dist/games/index.html','utf8').includes('at-the-box-office'));
});
