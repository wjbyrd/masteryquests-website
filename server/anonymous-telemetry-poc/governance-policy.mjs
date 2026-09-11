// Governance configuration; measurement release/schema/envelope are independent.
export const POLICY=Object.freeze({version:'mq-governance/1',disclosureVersion:'mq-disclosure/1',measurementContract:'mq-measurement/1',ownerApproval:'pending',retentionDaysVariable:'TELEMETRY_RETENTION_DAYS',retentionModeVariable:'TELEMETRY_RETENTION_MODE',defaultMode:'manual',minimumDays:1,maximumDays:36500,unit:'whole-run',clock:'latest-server-receipt',automaticPurge:false});
export function configuration(env={}){
 const mode=env[POLICY.retentionModeVariable]??POLICY.defaultMode;
 if(!['manual','disabled'].includes(mode))throw Object.assign(Error('Invalid TELEMETRY_RETENTION_MODE; use manual or disabled'),{status:400});
 const raw=env[POLICY.retentionDaysVariable];let days=null;
 if(raw!==undefined){if(typeof raw!=='string'||!/^\d+$/.test(raw)||!Number.isSafeInteger(Number(raw))||Number(raw)<POLICY.minimumDays||Number(raw)>POLICY.maximumDays)throw Object.assign(Error('TELEMETRY_RETENTION_DAYS must be an integer from 1 to 36500'),{status:400});days=Number(raw);}
 return {...POLICY,mode,days,configured:days!==null,executable:mode==='manual'&&days!==null,access:env.MAINTENANCE_TOKEN?'separate-maintenance-token':'shared-admin-token',exportCustody:'Downloaded copies are outside D1 retention; recipient controls storage and disposal.',historicalPolicy:'This is current server administration policy, not a claim about policy at historical event creation.'};
}
export function cutoffFor(config,now=Date.now()){
 if(!config.executable)throw Object.assign(Error('Retention inactive: owner must configure a duration and manual mode'),{status:409});
 return new Date(now-config.days*86400000).toISOString();
}
