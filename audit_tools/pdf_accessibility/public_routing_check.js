'use strict';
const fs=require('fs'),path=require('path'),crypto=require('crypto'),assert=require('assert');
const root=path.resolve(__dirname,'../..');
assert.strictEqual(root.toLowerCase(),'c:\\users\\jennings\\documents\\github\\masteryquests-website');
const Runtime=require('../../build/faculty-build-composer/concept-review-runtime.js');
const manifest=JSON.parse(fs.readFileSync(path.join(root,'build/faculty-build-composer/data/concept-reviews/manifest.json'),'utf8'));
const hash=b=>crypto.createHash('sha256').update(b).digest('hex');
(async()=>{
  const records=[];
  for(const r of manifest.reviews){
    assert.strictEqual(r.runtimeFilename,r.code+'.pdf');
    const url=Runtime.PUBLIC_REVIEW_BASE_URL+r.runtimeFilename;
    assert.strictEqual(Runtime.safeReviewPath(url),url);
    assert.strictEqual(Runtime.safeReviewPath('concept-reviews/'+r.runtimeFilename),'concept-reviews/'+r.runtimeFilename);
    const relative=new URL(url).pathname.slice(1),file=path.join(root,relative);
    assert.strictEqual(hash(fs.readFileSync(file)),r.sha256);
    records.push({resource:r.code,url,relativePath:relative,sha256:r.sha256,result:'PASS'});
  }
  const filtered=await Runtime.filterAvailableReviewResult({recommendations:records.map(r=>({path:r.url})),more:[],choices:[]});
  assert.strictEqual(filtered.recommendations.length,151);
  for(const bad of ['https://example.com/concept-reviews/MICRO-49.pdf','concept-reviews/../bad.pdf','https://masteryquests.org/concept-reviews/MICRO-49.pdf?x=1'])assert.strictEqual(Runtime.safeReviewPath(bad),null);
  Runtime.resetManifestCache();
  const fallback=await Runtime.loadConceptReviewManifest({fetchImpl:async()=>({ok:false,status:404}),consoleImpl:{warn(){}}});
  assert.strictEqual(fallback,null);Runtime.resetManifestCache();
  fs.writeFileSync(path.join(root,'validation_artifacts/pdf_accessibility/public_sync_v1/routing.json'),JSON.stringify({localRouting:'PASS',count:records.length,records,unsafePathsRejected:true,missingManifestFallback:'null; no invented PDF URL',liveSiteChecked:false,deployed:false},null,2)+'\n');
  console.log('Public local routing: 151/151 PASS; safe-path and fallback checks PASS');
})().catch(e=>{console.error(e);process.exitCode=1;});
