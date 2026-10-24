import fs from 'node:fs';
import crypto from 'node:crypto';
import assert from 'node:assert/strict';
const banks=new Map(JSON.parse(fs.readFileSync(new URL('./source-patches.json',import.meta.url),'utf8')).banks.map(b=>[b.game,b]));
const hash=s=>crypto.createHash('sha256').update(s).digest('hex');
function transform(bank,source,reverse=false){
  // Manifest positions are Unicode code points, matching Python source slicing.
  const characters=Array.from(source);let delta=0;
  const edits=bank.edits.map(e=>{
    const before=Array.from(reverse?e.after:e.before),after=Array.from(reverse?e.before:e.after);
    const start=e.start+(reverse?delta:0);
    delta+=Array.from(e.after).length-Array.from(e.before).length;
    return {start,before,after};
  });
  for(const e of edits.reverse()){
    assert.equal(characters.slice(e.start,e.start+e.before.length).join(''),e.before.join(''),`${bank.game}: unexpected source context`);
    // Avoid spreading entire banks into a function argument list.
    characters.splice(e.start,e.before.length);
    for(let n=e.after.length;n>0;n-=10000){const from=Math.max(0,n-10000);characters.splice(e.start,0,...e.after.slice(from,n));}
  }
  const result=characters.join('');assert.equal(hash(result),bank[reverse?'before':'after'],`${bank.game}: resulting fingerprint`);return result;
}
export function rewindGame(game,source){source=source.replaceAll('\r\n','\n');const bank=banks.get(game);return bank&&hash(source)===bank.after?transform(bank,source,true):source;}
export function applyGame(game,source){source=source.replaceAll('\r\n','\n');const bank=banks.get(game);if(!bank||hash(source)===bank.after)return source;assert.equal(hash(source),bank.before,`${game}: unreviewed bank drift; no files written`);return transform(bank,source);}
