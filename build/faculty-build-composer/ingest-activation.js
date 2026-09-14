(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.MQIngestActivation=api;})(globalThis,function(){
'use strict';
const endpoint='https://masteryquests.org/api/anonymous-telemetry-poc/v1/events';
const fields=['activationVersion','capability','capabilityId','endpoint','gameId','buildId','buildVersion','schemaVersion','issuedAt','expiresAt'];
function validToken(value){
  if(typeof value!=='string'||!/^mqic1_[A-Za-z0-9_-]{43}$/.test(value))return false;
  try{const encoded=value.slice(6),bytes=atob(encoded.replace(/-/g,'+').replace(/_/g,'/')+'=');return bytes.length===32&&btoa(bytes).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'')===encoded;}catch(_){return false;}
}
function validEndpoint(value){return value===endpoint;}
function validate(value,scope,now=Date.now()){
  if(!value||typeof value!=='object'||Array.isArray(value)||Object.keys(value).length!==fields.length||Object.keys(value).some(k=>!fields.includes(k)))throw new Error('invalid_activation_descriptor');
  if(value.activationVersion!=='mq-build-activation/1'||!validToken(value.capability)||!validEndpoint(value.endpoint)||
    !/^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/.test(value.capabilityId)||
    value.gameId!=='faculty-composer'||!/^composer-[a-f0-9]{64}$/.test(value.buildId)||! /^[a-f0-9]{64}$/.test(value.buildVersion)||value.schemaVersion!==3)throw new Error('invalid_activation_descriptor');
  for(const key of ['gameId','buildId','buildVersion','schemaVersion'])if(value[key]!==scope[key])throw new Error('activation_scope_mismatch');
  const issued=Date.parse(value.issuedAt),expires=Date.parse(value.expiresAt);
  if(!Number.isFinite(issued)||!Number.isFinite(expires)||new Date(issued).toISOString()!==value.issuedAt||new Date(expires).toISOString()!==value.expiresAt||issued>now+60000||expires<=now||expires-issued!==365*86400000)throw new Error('activation_expired');
  return Object.freeze(Object.fromEntries(fields.map(k=>[k,value[k]])));
}
function fromResponse(value,scope,now){
  const responseFields=[...fields,'ok','governanceVersion'];
  if(!value||value.ok!==true||value.governanceVersion!=='mq-governance/2'||Object.keys(value).length!==responseFields.length||Object.keys(value).some(k=>!responseFields.includes(k)))throw new Error('invalid_activation_response');
  return validate(Object.fromEntries(fields.map(k=>[k,value[k]])),scope,now);
}
return Object.freeze({endpoint,fields,validEndpoint,validToken,validate,fromResponse});
});
