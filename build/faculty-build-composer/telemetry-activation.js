(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./ingest-activation.js'):root.MQIngestActivation);if(typeof module==='object'&&module.exports)module.exports=api;else root.MQTelemetryActivation=api;})(globalThis,function(Descriptor){
'use strict';
const endpoint=Descriptor.endpoint.replace('/v1/events','/v1/build-capabilities');
function requestScope(scope){return {activationVersion:'mq-build-activation/1',allowAnonymousDataCollection:true,gameId:scope.gameId,buildId:scope.buildId,buildVersion:scope.buildVersion,schemaVersion:scope.schemaVersion,measurementContract:'mq-measurement/1',governanceVersion:'mq-governance/2',disclosureVersion:'mq-disclosure/2'};}
function createSession({challenge,fetchActivation=globalThis.fetch,hash,now=Date.now,uuid=()=>crypto.randomUUID()}={}){
  let cached=null,inflight=null,generation=0;
  function invalidate(){generation++;cached=null;}
  function current(scope){try{return cached&&Descriptor.validate(cached,scope,now());}catch(_){return null;}}
  async function activate(scope,{enabled,isCurrent=()=>true}={}){
    if(enabled!==true)return null;
    const key=JSON.stringify(requestScope(scope));
    if(current(scope)&&isCurrent())return cached;
    if(inflight){if(inflight.key===key)return inflight.promise;throw new Error('activation_in_progress');}
    const version=generation;
    const promise=(async()=>{
      const control=requestScope(scope),issuanceRequestId=uuid();
      const context=await hash(control);
      const turnstileToken=await challenge({context,action:'mq_build_activate'});
      if(version!==generation||!isCurrent())throw new Error('activation_stale');
      let response;
      try{response=await fetchActivation(endpoint,{method:'POST',headers:{'content-type':'application/json'},body:JSON.stringify({...control,issuanceRequestId,turnstileToken}),credentials:'omit',referrerPolicy:'no-referrer',redirect:'error',signal:AbortSignal.timeout(15000)});}catch(_){throw new Error('activation_unavailable');}
      if(response.status!==201){const code=response.status===429?'activation_rate_limited':response.status===403?'activation_challenge_failed':response.status===400||response.status===422?'activation_unsupported':'activation_unavailable';throw new Error(code);}
      let descriptor;try{descriptor=Descriptor.fromResponse(await response.json(),scope,now());}catch(_){throw new Error('activation_invalid_response');}
      if(version!==generation||!isCurrent())throw new Error('activation_stale');
      cached=descriptor;return descriptor;
    })();
    inflight={key,promise};try{return await promise;}finally{inflight=null;}
  }
  return {activate,current,invalidate};
}
let scriptPromise;
async function browserChallenge({context,action}){
  const sitekey=document.querySelector('meta[name="mq-turnstile-sitekey"]')?.content;
  if(!sitekey||!['https://masteryquests.org','https://www.masteryquests.org'].includes(location.origin))throw new Error('activation_unavailable');
  if(!scriptPromise)scriptPromise=new Promise((resolve,reject)=>{
    const script=document.createElement('script');script.src='https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';script.async=true;script.referrerPolicy='no-referrer';
    const timer=setTimeout(()=>{script.remove();reject(new Error('activation_unavailable'));},15000);
    script.onload=()=>{clearTimeout(timer);resolve();};script.onerror=()=>{clearTimeout(timer);script.remove();reject(new Error('activation_unavailable'));};document.head.appendChild(script);
  }).catch(error=>{scriptPromise=null;throw error;});
  await scriptPromise;
  return new Promise((resolve,reject)=>{
    const container=document.createElement('div');container.setAttribute('aria-label','Build activation verification');document.getElementById('activationChallenge').appendChild(container);
    let widget,timer;
    const finish=(error,token)=>{clearTimeout(timer);if(widget!==undefined)globalThis.turnstile.remove(widget);container.remove();error?reject(new Error(error)):resolve(token);};
    timer=setTimeout(()=>finish('activation_challenge_failed'),120000);
    try{widget=globalThis.turnstile.render(container,{sitekey,action,cData:context,execution:'execute',appearance:'interaction-only',callback:token=>finish(null,token),'error-callback':()=>finish('activation_challenge_failed'),'expired-callback':()=>finish('activation_challenge_failed'),'timeout-callback':()=>finish('activation_challenge_failed')});globalThis.turnstile.execute(container);}catch(_){finish('activation_unavailable');}
  });
}
return {endpoint,requestScope,createSession,browserChallenge};
});
