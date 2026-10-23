import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';

const catalog=JSON.parse(fs.readFileSync(new URL('./graph-descriptions.json',import.meta.url),'utf8'));

// Use the existing asset metadata consumer without mutating published questions,
// graph eligibility, or any presentation/accessibility handler.
export function buildGraphMetadata(game,questions,base){
  const descriptions=catalog.games[game];
  assert(descriptions,`${game}: graph description catalog missing`);
  const paths=[...new Set(questions.filter(q=>q.image).map(q=>q.image))];
  assert.deepEqual(Object.keys(descriptions).sort(),[...paths].sort(),`${game}: graph description coverage drift`);
  return Object.fromEntries(paths.map(asset=>{
    const entry=descriptions[asset];
    const hash=crypto.createHash('sha256').update(fs.readFileSync(`${base}/${asset}`)).digest('hex');
    assert.equal(hash,entry.sha256,`${game}/${asset}: image changed; review its graph description`);
    for(const key of ['imageAlt','graphDescription'])assert(typeof entry[key]==='string'&&entry[key].trim(),`${game}/${asset}: missing ${key}`);
    // Question-level metadata takes precedence in the shared renderer. Reject
    // contradictory overrides instead of silently hiding the reviewed asset text.
    for(const q of questions.filter(q=>q.image===asset))for(const key of ['imageAlt','graphDescription']){
      assert(!q[key]||q[key]===entry[key],`${game} question ${q.id}: ${key} conflicts with reviewed graph metadata`);
    }
    return [asset,{imageAlt:entry.imageAlt,graphDescription:entry.graphDescription}];
  }));
}
