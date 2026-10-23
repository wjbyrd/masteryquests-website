import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';
import {games,groupNames,profiles,readBank,readLibrary,canonicalRows,uniqueCanonical,answerHash,hash,normalize} from './library.mjs';
const core=createRequire(import.meta.url)('../../build/faculty-build-composer/composer-core.js');
const plan=JSON.parse(fs.readFileSync('audit_tools/economic_realm_questions/selection.json'));
const library=readLibrary(),canonical=new Map(uniqueCanonical(canonicalRows(library)).map(r=>[String(r.q.id),r]));
assert.equal(library.librarySha256,plan.librarySha256,'Composer changed: re-audit and review the selection before publishing.');
const assets=new Map(library.assetInventory.map(a=>[a.runtimePath,a]));
const check=process.argv.includes('--check');
const release={baselineCommit:plan.baselineCommit,librarySha256:library.librarySha256,games:{}};
for(const game of games){
 const base=`play/economic-realm/${game}`,bank=Object.fromEntries(groupNames.map(k=>[k,{}]));
 const baseline=readBank(game,plan.baselineCommit);
 for(const p of ['easy','medium','hard','elite','legendary','easyBoss','mediumBoss','finalBoss','legendaryBoss'])bank.questionBanks[p]=[];
 const records=[],files=new Map();
 for(const item of [...plan.games[game].mapped,...plan.games[game].added]){
  const r=item.retained?{concept:item.concept,q:baseline[item.oldGroup][item.oldPool][item.index]}:canonical.get(String(item.canonicalId));assert(r,`${game}: ${item.canonicalId}`);
  const q=structuredClone(r.q);
  // Publish canonical assessment content with stable local identity. Drop import
  // bookkeeping (including private author-machine paths) and plaintext keys.
  if(!item.retained)for(const key of Object.keys(q))if(/^source/.test(key)||['provenance','source','resourceMatching','a','answer','correctAnswer','correctIndex','answerIndex'].includes(key))delete q[key];
  q.id=item.id;if(q.questionId!==undefined)q.questionId=item.id;
  if(!item.retained){q.canonicalId=r.q.canonicalId||r.q.id;q.composerLibrarySha256=library.librarySha256;}
  q.aHash=answerHash(r.q);
  if(item.group==='questionBanks'&&!item.retained){
   if(/Boss$/.test(item.pool))q.checkpointPool=item.pool;
   else {delete q.checkpointPool;q.difficulty=item.pool;q.canonicalDifficulty=item.pool;}
  }
  if(q.image){
   q.image=q.image.replaceAll('\\','/').replace(/^data\//,'');
   if(!q.image.includes('/'))q.image=`question-assets/${r.concept}/${q.image}`;
   const asset=assets.get(q.image);assert(asset,`Unregistered asset: ${q.image}`);
   const bytes=fs.readFileSync(path.join('build/faculty-build-composer',asset.sourceUrl));
   assert.equal(hash(bytes),asset.sha256,`Asset hash mismatch: ${q.image}`);
   files.set(q.image,asset.sha256);
   const target=path.join(base,q.image);
   if(check)assert.equal(hash(fs.readFileSync(target)),asset.sha256,`${game}: asset drift`);
   else if(!fs.existsSync(target)||hash(fs.readFileSync(target))!==asset.sha256){fs.mkdirSync(path.dirname(target),{recursive:true});fs.writeFileSync(target,bytes);}
   // Canonical inventory supplies the same accessible evidence as Composer.
   q.imageAlt ||= asset.imageAlt;
   q.graphDescription ||= asset.graphDescription;
  }
  const pool=item.group==='questionBanks'?item.pool:item.group==='microSkillBridgePools'?'bridge':'repair';
  const issues=core.validateFacultyQuestionRecord(q,pool,library.assetInventory);
  assert.deepEqual(issues,[],`${game}/${q.id}: ${issues}`);
  assert.equal(q.options.filter(o=>hash(normalize(o))===q.aHash).length,1,`${game}/${q.id}: ambiguous answer hash`);
  (bank[item.group][item.pool]||=[]).push(q);
  records.push({id:q.id,canonicalId:q.canonicalId,retained:item.retained||false,group:item.group,pool:item.pool,concept:r.concept,added:!('oldPool'in item)});
 }
 const content='// Generated from validated Composer content plus reviewed unmatched phase-2 supplements.\n// Do not run the historical phase publishers.\n'
  +'// Source and review manifest: audit_tools/economic_realm_questions/{selection.json,overrides.mjs,scope.mjs}.\n'
  +'// Regenerate: node audit_tools/economic_realm_questions/sync.mjs\n'
  +groupNames.map(k=>`const ${k} = ${JSON.stringify(bank[k],null,2)};`).join('\n\n')+'\n';
 const file=`${base}/${profiles[game].bank}`;
 if(check)assert.equal(fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n'),content,`${game}: bank drift`);
 else fs.writeFileSync(file,content);
 release.games[game]={bankSha256:hash(content),assets:Object.fromEntries(files),records};
 console.log(JSON.stringify({game,rows:records.length,added:records.filter(r=>r.added).length,pools:Object.fromEntries(Object.entries(bank.questionBanks).map(([p,q])=>[p,q.length])),assets:files.size}));
}
const releasePath='audit_tools/economic_realm_questions/release.json',serialized=JSON.stringify(release,null,2)+'\n';
if(check)assert.equal(fs.readFileSync(releasePath,'utf8').replace(/\r\n/g,'\n'),serialized,'Release manifest drift');
else fs.writeFileSync(releasePath,serialized);
