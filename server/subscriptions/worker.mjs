// Brevo owns confirmation, list membership, campaign unsubscribe and suppression.
// No subscriber database, telemetry integration, or public contact lookup exists here.
const ORIGINS = new Set(['https://masteryquests.org', 'https://www.masteryquests.org']);
const HEADERS = {'content-type':'application/json; charset=utf-8','cache-control':'no-store','x-content-type-options':'nosniff','referrer-policy':'no-referrer'};
const reply = (status, value) => new Response(JSON.stringify(value), {status, headers:{...HEADERS,...(status===429?{'retry-after':'60'}:{})}});
const unavailable = () => reply(503,{ok:false,message:'Email sign-up is currently unavailable. Please try later or read the Updates page.'});
const accepted = () => reply(202,{ok:true,message:'Request processed. If this address is eligible for a new subscription, check its inbox for a confirmation link. Existing subscriptions are unchanged. If no email arrives, contact wjbyrd@troy.edu.'});
function configured(env) {
  return env.SUBSCRIPTIONS_ENABLED==='true' && typeof env.BREVO_API_KEY==='string' && env.BREVO_API_KEY.length>0 &&
    /^[1-9]\d*$/.test(env.BREVO_LIST_ID||'') && Number.isSafeInteger(Number(env.BREVO_LIST_ID)) &&
    /^[1-9]\d*$/.test(env.BREVO_DOI_TEMPLATE_ID||'') && Number.isSafeInteger(Number(env.BREVO_DOI_TEMPLATE_ID)) &&
    !!env.SUBSCRIPTION_IP_LIMIT && !!env.SUBSCRIPTION_EMAIL_LIMIT && !!env.SUBSCRIPTION_GLOBAL_LIMIT;
}
async function bodyJSON(request) {
  if(!/^application\/json(?:;|$)/i.test(request.headers.get('content-type')||''))throw Error('type');
  const reader=request.body?.getReader();if(!reader)throw Error('empty');
  let size=0;const chunks=[];
  for(;;){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>2048){await reader.cancel();throw Error('large')}chunks.push(value)}
  const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length}
  return JSON.parse(new TextDecoder().decode(bytes));
}
async function bucket(value, secret) {
  const encoder=new TextEncoder(),key=await crypto.subtle.importKey('raw',encoder.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign']);
  return Array.from(new Uint8Array(await crypto.subtle.sign('HMAC',key,encoder.encode(value))),x=>x.toString(16).padStart(2,'0')).join('');
}
export async function subscriptions(request, env, send=fetch) {
  const url=new URL(request.url);
  if(url.pathname!=='/api/subscriptions')return reply(404,{ok:false,message:'Not found.'});
  if(!ORIGINS.has(url.origin))return reply(403,{ok:false,message:'Use the Mastery Quests website to sign up.'});
  if(request.method==='GET')return reply(200,{available:configured(env)});
  if(request.method!=='POST')return new Response(null,{status:405,headers:{...HEADERS,allow:'GET, POST'}});
  if(request.headers.get('origin')!==url.origin)return reply(403,{ok:false,message:'Reload the sign-up page before trying again.'});
  if(!configured(env))return unavailable();
  try {
    const ip=request.headers.get('cf-connecting-ip');if(!ip)return unavailable();
    if(!(await env.SUBSCRIPTION_IP_LIMIT.limit({key:await bucket('ip:'+ip,env.BREVO_API_KEY)})).success)return reply(429,{ok:false,message:'Please wait a minute before trying again.'});
    const body=await bodyJSON(request);
    if(!body||Object.keys(body).sort().join(',')!=='consent,email,website'||body.consent!==true||body.website!==''||typeof body.email!=='string')return reply(400,{ok:false,message:'Enter your email and select the opt-in checkbox.'});
    const email=body.email.trim().toLowerCase();
    if(email.length>254||! /^[a-z0-9.!#$%&'*+\/=?^_`{|}~-]+@[a-z0-9](?:[a-z0-9-]*[a-z0-9])?(?:\.[a-z0-9](?:[a-z0-9-]*[a-z0-9])?)+$/i.test(email)||email.split('@')[0].length>64)return reply(400,{ok:false,message:'Enter a valid email address.'});
    if(!(await env.SUBSCRIPTION_EMAIL_LIMIT.limit({key:await bucket('email:'+email,env.BREVO_API_KEY)})).success||!(await env.SUBSCRIPTION_GLOBAL_LIMIT.limit({key:'subscriptions'})).success)return reply(429,{ok:false,message:'Please wait a minute before trying again.'});
    const headers={'api-key':env.BREVO_API_KEY,'accept':'application/json','content-type':'application/json'};
    const lookup=await send('https://api.brevo.com/v3/contacts/'+encodeURIComponent(email),{headers,signal:AbortSignal.timeout(8000),redirect:'error'});
    if(lookup.status===200){
      const contact=await lookup.json();
      // Do not re-enrol suppressed contacts or reveal whether an address is subscribed.
      if(contact.emailBlacklisted===true||(Array.isArray(contact.listIds)&&contact.listIds.includes(Number(env.BREVO_LIST_ID))))return accepted();
    }else if(lookup.status!==404)return unavailable();
    const result=await send('https://api.brevo.com/v3/contacts/doubleOptinConfirmation',{method:'POST',headers,body:JSON.stringify({email,includeListIds:[Number(env.BREVO_LIST_ID)],templateId:Number(env.BREVO_DOI_TEMPLATE_ID),redirectionUrl:'https://masteryquests.org/about/subscribe/confirmation/',contactPixelTrackingConsent:false}),signal:AbortSignal.timeout(8000),redirect:'error'});
    // Never treat provider errors (including a duplicate race) as successful delivery.
    return result.ok?accepted():unavailable();
  }catch(error){
    // Never echo provider responses, email addresses, secrets, or exception messages.
    if(['type','empty','large'].includes(error.message)||error instanceof SyntaxError)return reply(400,{ok:false,message:'The sign-up request could not be read. Please reload and try again.'});
    return unavailable();
  }
}
