import test from 'node:test';
import assert from 'node:assert/strict';
import {SPLASH_BUILDINGS,SPLASH_ROADS,riverBanks,splashLayoutAudit} from '../splash-layout.js';
test('Splash lots, neighborhoods and trees clear roads; both cities stay on their riverbank',()=>{
  assert.deepEqual(splashLayoutAudit(),[]);
  assert.equal(SPLASH_BUILDINGS.filter(b=>b.i<22).length,4);
  assert.equal(SPLASH_BUILDINGS.filter(b=>b.i>28).length,4);
  // Both cameras use one uniform ground/sprite scale, with no portrait-only expansion.
  for(const tileWidth of [20,28])for(const b of SPLASH_BUILDINGS){
    const f=b.footprint;
    for(const r of SPLASH_ROADS)assert.ok(f.maxI*tileWidth<=r.minI*tileWidth||f.minI*tileWidth>=r.maxI*tileWidth||f.maxJ*tileWidth<=r.minJ*tileWidth||f.minJ*tileWidth>=r.maxJ*tileWidth);
    for(let j=f.minJ;j<f.maxJ;j+=.1){const[l,r]=riverBanks(j);assert.ok(f.maxI<l-.6||f.minI>r+.6);}
  }
});
