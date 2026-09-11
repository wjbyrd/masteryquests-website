// Owner-approved policy source. Deployment values and disclosures derive from this file.
export const POLICY=Object.freeze({version:'mq-governance/2',disclosureVersion:'mq-disclosure/2',measurementContract:'mq-measurement/1',ownerApproval:'2026-09-10',retentionDays:730,retentionDaysVariable:'TELEMETRY_RETENTION_DAYS',retentionModeVariable:'TELEMETRY_RETENTION_MODE',identityVariable:'TELEMETRY_GOVERNANCE_POLICY',mode:'automatic',unit:'whole-run',clock:'latest-server-receipt',automaticPurge:true,cron:'17 4 * * *',scheduleUTC:'04:17 UTC daily',custodian:'Project Owner / Telemetry Custodian',maintenanceSeparation:true});
export function approvedEnvironment(){return {[POLICY.retentionDaysVariable]:String(POLICY.retentionDays),[POLICY.retentionModeVariable]:POLICY.mode,[POLICY.identityVariable]:POLICY.version};}
export function configuration(env={}){
 for(const [key,value] of Object.entries(approvedEnvironment()))if(env[key]!==value)throw Object.assign(Error('Missing or contradictory governance configuration: '+key),{status:400});
 return {...POLICY,days:POLICY.retentionDays,configured:true,executable:true,access:'separate-maintenance-token',exportCustody:'Ordinary exports follow the approved disposal horizon in restricted storage; separately designated research datasets require their own documented decision. D1 cannot delete downloaded copies.',historicalPolicy:'Current server administration policy; not a claim about policy at historical event creation.'};
}
export function cutoffFor(config,now=Date.now()){
 if(config.version!==POLICY.version||config.days!==POLICY.retentionDays||config.mode!==POLICY.mode||!config.executable)throw Object.assign(Error('Invalid approved retention policy'),{status:409});
 if(!Number.isSafeInteger(now)||now<=POLICY.retentionDays*86400000||!Number.isFinite(new Date(now).valueOf()))throw Object.assign(Error('Invalid trusted server time'),{status:400});
 return new Date(now-config.days*86400000).toISOString();
}
