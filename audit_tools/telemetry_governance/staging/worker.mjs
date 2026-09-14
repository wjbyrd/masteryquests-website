// Temporary synthetic staging entry point. Canonical body, CORS and persistence are unchanged.
import {dualModeIngest,capabilityPreflight} from '../../../server/anonymous-telemetry-poc/dual-mode-ingest.mjs';
export default {
  async fetch(request,env) {
    if(new URL(request.url).pathname!=='/v1/events'||!['POST','OPTIONS'].includes(request.method))
      return new Response(null,{status:404,headers:{'cache-control':'no-store'}});
    const response=request.method==='OPTIONS'?capabilityPreflight(request,env):await dualModeIngest(request,env);
    // Never log request headers, bodies, database rows or arbitrary exceptions.
    console.log(JSON.stringify({fixture:'portable-telemetry-http-staging',status:response.status}));
    return response;
  }
};
