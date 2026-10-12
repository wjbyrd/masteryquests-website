import classroom from './classroom-access/worker.mjs';
import {subscriptions} from './subscriptions/worker.mjs';

export default {
  fetch(request, env, ctx) {
    const path=new URL(request.url).pathname;
    if(path==='/api/subscriptions'||path.startsWith('/api/subscriptions/'))return subscriptions(request,env);
    return classroom.fetch(request,env,ctx);
  }
};
