'use strict';
const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const {questionRecords}=require('./composer-integrity-contracts.js'),core=require('../composer-core.js');
const allowlist=require('../../../audit_tools/macro_voice_20261006/visual-allowlist.json');
const reference=/\b(?:graphs?|figures?|diagrams?)\b|\bas shown\b|\buse the dollar market\b/i;
function detect(library,areaName,readBytes=a=>fs.readFileSync(path.resolve(__dirname,'../data',a.runtimePath))){
 const areas=require('../course-area-model.js').create(library.registry.concepts),active=new Set(),byId=new Map(questionRecords(library).map(r=>[String(r.question.id),r.question]));
 for(const cid of Object.keys(library.concepts))if(areas.areasFor(cid).includes(areaName))for(const q of core.ContentScope.allQuestions(core.resolveConceptModule(library,cid)))active.add(String(q.id));
 const assets=new Map(library.assetInventory.map(a=>[a.runtimePath,a])),validated=new Map(),result={area:areaName,scanned:active.size,references:0,validImages:[],allowlisted:[],mismatches:[]};
 for(const id of active){const q=byId.get(id);if(!reference.test(q.q))continue;result.references++;
  if(q.image){
   if(!validated.has(q.image)){let valid=false;const a=assets.get(q.image);try{const bytes=a&&readBytes(a);valid=!!bytes&&bytes.length===a.sizeBytes&&crypto.createHash('sha256').update(bytes).digest('hex')===a.sha256;}catch{}validated.set(q.image,valid);}
   if(validated.get(q.image)){result.validImages.push(id);continue;}
   result.mismatches.push({id,stem:q.q,reason:'Image reference is unregistered, missing, or differs from its registered checksum.'});continue;
  }
  const allowed=allowlist[id];if(allowed?.allowedStems.includes(q.q)){result.allowlisted.push({id,reason:allowed.reason});continue;}
  result.mismatches.push({id,stem:q.q,reason:'Visual-reference language without a valid image or exact-stem conceptual allowlist entry.'});
 }
 return result;
}
module.exports={detect,reference};
