import {POLICY,configuration,cutoffFor} from './governance-policy.mjs';
import {govern} from './governance.mjs';
// No route accepts this internal authority. All public/manual admin routes retain authentication.
export async function scheduledRetention(controller,env,{now=Date.now(),report=value=>console.log(JSON.stringify(value))}={}){
 const operation={governancePolicyVersion:POLICY.version,operationId:crypto.randomUUID(),source:'scheduled',cutoff:null,eligibleRunCount:null,deletedRunCount:null,deletedEventCount:null,deletedBatchCount:null,deletedRateWindowCount:null,status:'failure'};
 try{
  const config=configuration(env);operation.cutoff=cutoffFor(config,now);
  if(!controller||controller.cron!==POLICY.cron||!Number.isSafeInteger(controller.scheduledTime)||controller.scheduledTime<=0||controller.scheduledTime>now)throw Error('Invalid schedule context');
  if(!env.TELEMETRY_DB)throw Error('Storage unavailable');
  const request=body=>new Request('https://internal.invalid/retention',{method:'POST',body:JSON.stringify(body)});
  const preview=await govern(request({action:'dry-run',cutoff:operation.cutoff}),env,'retention',now,'scheduled');operation.eligibleRunCount=preview.counts.runs;
  const result=await govern(request({action:'execute',cutoff:operation.cutoff,confirm:'PURGE_EXPIRED_RUNS'}),env,'retention',now,'scheduled');
  Object.assign(operation,{deletedRunCount:result.counts.runs,deletedEventCount:result.counts.events,deletedBatchCount:result.counts.ingestBatches,deletedRateWindowCount:result.counts.rateLimitWindows,status:'success'});
  report(operation);return operation;
 }catch(_){report({...operation,status:'failure',error:'RETENTION_FAILED'});throw Error('Scheduled retention failed');}
}
