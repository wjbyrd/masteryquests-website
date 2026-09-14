// Server-only provider boundary. No request/environment switch installs a mock verifier.
import {reject} from './capabilities.mjs';
export function createTurnstileVerifier(env, {fetchProvider=globalThis.fetch, now=Date.now}={}) {
  return async ({token,idempotencyKey,context}) => {
    if(typeof env.TURNSTILE_SECRET_KEY!=='string'||!env.TURNSTILE_SECRET_KEY)reject('activation_unavailable',503);
    const response=await fetchProvider('https://challenges.cloudflare.com/turnstile/v0/siteverify',{
      method:'POST',headers:{'content-type':'application/json'},redirect:'manual',
      signal:AbortSignal.timeout(10000),body:JSON.stringify({secret:env.TURNSTILE_SECRET_KEY,response:token,idempotency_key:idempotencyKey})
    });
    if(!response.ok)reject('activation_unavailable',503);
    const reader=response.body.getReader();let size=0;const chunks=[];
    try{for(;;){const {value,done}=await reader.read();if(done)break;size+=value.byteLength;if(size>16384){await reader.cancel();reject('activation_unavailable',503);}chunks.push(value);}}finally{reader.releaseLock();}
    const bytes=new Uint8Array(size);let offset=0;for(const chunk of chunks){bytes.set(chunk,offset);offset+=chunk.length;}
    const result=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(bytes));
    const time=Date.parse(result.challenge_ts),age=now()-time;
    // Siteverify enforces single use; also bound the provider timestamp locally.
    return {success:result.success===true&&Number.isFinite(time)&&age>=-60000&&age<=300000,
      action:result.action,hostname:result.hostname,cdata:result.cdata};
  };
}
