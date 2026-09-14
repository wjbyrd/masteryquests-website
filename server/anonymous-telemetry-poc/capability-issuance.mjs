import {CapabilityError,featureFlags,readBoundedJSON,ACTIVATION_MAX_BYTES,issueBuildCapability} from './capabilities.mjs';
import {createTurnstileVerifier} from './turnstile-verifier.mjs';
const ORIGINS=['https://masteryquests.org','https://www.masteryquests.org'];
function origin(request,env){const value=request.headers.get('origin');return ORIGINS.includes(value)&&String(env.ALLOWED_ORIGINS||'').split(',').map(x=>x.trim()).includes(value)?value:null;}
function reply(request,env,status,body,preflight=false){
  const headers={'cache-control':'no-store','x-content-type-options':'nosniff',vary:preflight?'Origin, Access-Control-Request-Method, Access-Control-Request-Headers':'Origin'};
  if(origin(request,env)){headers['access-control-allow-origin']=origin(request,env);headers['access-control-expose-headers']='Retry-After';if(preflight){headers['access-control-allow-methods']='POST,OPTIONS';headers['access-control-allow-headers']='content-type';}}
  if(status===429)headers['retry-after']='60';
  if(body!==null)headers['content-type']='application/json; charset=utf-8';
  return new Response(body===null?null:JSON.stringify(body),{status,headers});
}
export function issuancePreflight(request,env){
  if(!featureFlags(env).issuance)return reply(request,env,404,{ok:false,error:'activation_unavailable'});
  const headers=(request.headers.get('access-control-request-headers')||'').split(',').map(x=>x.trim().toLowerCase()).filter(Boolean);
  return origin(request,env)&&request.headers.get('access-control-request-method')==='POST'&&headers.every(x=>x==='content-type')
    ?reply(request,env,204,null,true):reply(request,env,403,{ok:false,error:'activation_not_authorized'},true);
}
const CODES=new Set(['invalid_activation','collection_not_enabled','unsupported_version','activation_challenge_failed','activation_unavailable','activation_rate_limited','activation_already_issued','activation_conflict','request_too_large','unsupported_media_type','invalid_json']);
export async function issueCapabilityHTTP(request,env,{verifyChallenge}={}){
  if(!featureFlags(env).issuance)return reply(request,env,404,{ok:false,error:'activation_unavailable'});
  if(!origin(request,env)||new URL(request.url).search)return reply(request,env,403,{ok:false,error:'activation_not_authorized'});
  try{
    const input=await readBoundedJSON(request,ACTIVATION_MAX_BYTES);
    const result=await issueBuildCapability(input,env,{verifyChallenge:verifyChallenge||createTurnstileVerifier(env)});
    return reply(request,env,201,result);
  }catch(error){
    const code=error instanceof CapabilityError&&error.code==='capability_rate_limited'?'activation_rate_limited':error?.code;
    return reply(request,env,error instanceof CapabilityError&&CODES.has(code)?error.status:503,{ok:false,error:CODES.has(code)?code:'activation_unavailable'});
  }
}
