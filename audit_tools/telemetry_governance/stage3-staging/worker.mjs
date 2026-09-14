// Temporary first-party staging entry point; uses the canonical real verifier.
import worker from '../../../server/anonymous-telemetry-poc/worker.mjs';
export default {
  async fetch(request,env) {
    if(!['/v1/build-capabilities','/v1/events'].includes(new URL(request.url).pathname)||!['POST','OPTIONS'].includes(request.method))
      return new Response(null,{status:404,headers:{'cache-control':'no-store'}});
    return worker.fetch(request,env);
  }
};
