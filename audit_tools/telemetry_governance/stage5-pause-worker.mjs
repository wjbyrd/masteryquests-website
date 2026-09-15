import {serializedHttpsOrigin} from '../../server/anonymous-telemetry-poc/dual-mode-ingest.mjs';
// Emergency release entry point, not deployed to production by this rehearsal.
// Keep authorization state intact; do not switch capability admission back to legacy.
export function pausedWorker(base){return {
  scheduled:base.scheduled?.bind(base),
  async fetch(request,env,ctx){const path=new URL(request.url).pathname.replace(/^\/api\/anonymous-telemetry-poc(?=\/|$)/,'');
    if(['/v1/events','/v1/build-capabilities'].includes(path)){
      const headers={'content-type':'application/json','cache-control':'no-store','vary':'Origin','retry-after':'60'};
      const origin=serializedHttpsOrigin(request.headers.get('origin'));
      if(path==='/v1/events'&&request.headers.has('x-mq-ingest-token')&&origin)headers['access-control-allow-origin']=origin;
      return new Response(JSON.stringify({ok:false,error:path==='/v1/events'?'ingest_paused':'activation_unavailable'}),{status:503,headers});
    }
    return base.fetch(request,env,ctx);
  }
};}
