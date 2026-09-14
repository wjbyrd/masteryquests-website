import {CapabilityError} from './capabilities.mjs';
import {admitCapabilityRequest,admitLegacyGraceRequest} from './capability-admission.mjs';
import {PHASE} from './telemetry-core.mjs';
const FIRST_PARTY=['https://masteryquests.org','https://www.masteryquests.org'];
const HEADERS=['content-type','x-telemetry-phase','x-mq-ingest-token'];
const ERRORS={
  ingest_not_authorized:[403,'ingest_not_authorized'],ingest_scope_mismatch:[403,'ingest_scope_mismatch'],
  ingest_conflict:[409,'event_conflict'],manifest_required:[409,'manifest_required'],
  request_too_large:[413,'request_too_large'],unsupported_media_type:[415,'unsupported_media_type'],
  capability_rate_limited:[429,'ingest_rate_limited'],invalid_batch:[400,'invalid_batch'],
  invalid_json:[400,'invalid_json'],invalid_request:[400,'invalid_request'],credential_in_payload:[400,'invalid_batch']
};
function allowedOrigin(request,env) {
  const origin=request.headers.get('origin');
  return origin && FIRST_PARTY.includes(origin) && String(env.ALLOWED_ORIGINS||'').split(',').map(x=>x.trim()).includes(origin)?origin:null;
}
function response(request,env,body,status,preflight=false) {
  const headers={'cache-control':'no-store','x-content-type-options':'nosniff','vary':preflight?'Origin, Access-Control-Request-Method, Access-Control-Request-Headers':'Origin'};
  if(body!==null)headers['content-type']='application/json; charset=utf-8';
  const origin=allowedOrigin(request,env);
  if(origin){headers['access-control-allow-origin']=origin;headers['access-control-expose-headers']='Retry-After';if(preflight){headers['access-control-allow-methods']='POST,OPTIONS';headers['access-control-allow-headers']=HEADERS.join(',');}}
  if(status===429)headers['retry-after']='60';
  return new Response(body===null?null:JSON.stringify(body),{status,headers});
}
export function capabilityPreflight(request,env) {
  const method=request.headers.get('access-control-request-method');
  const requested=(request.headers.get('access-control-request-headers')||'').split(',').map(x=>x.trim().toLowerCase()).filter(Boolean);
  if(!allowedOrigin(request,env)||method!=='POST'||requested.some(x=>!HEADERS.includes(x)))return response(request,env,{ok:false,phase:PHASE,error:'ingest_not_authorized'},403,true);
  return response(request,env,null,204,true);
}
export async function dualModeIngest(request,env) {
  try {
    if(request.headers.has('origin')&&!allowedOrigin(request,env))return response(request,env,{ok:false,phase:PHASE,error:'ingest_not_authorized'},403);
    // Presence, including an empty or malformed value, selects capability ONLY. Never fall back.
    const admit=request.headers.has('x-mq-ingest-token')?admitCapabilityRequest:admitLegacyGraceRequest;
    return response(request,env,await admit(request,env,{httpSemantics:true}),202);
  } catch(error) {
    // New credential-bearing paths never reach the legacy raw-error logger.
    const [status,code]=error instanceof CapabilityError ? ERRORS[error.code]||[503,'ingest_unavailable'] : [503,'ingest_unavailable'];
    return response(request,env,{ok:false,phase:PHASE,error:code},status);
  }
}
