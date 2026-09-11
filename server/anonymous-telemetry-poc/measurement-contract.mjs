import {contractHash,stableContractJSON} from '../../audit_tools/telemetry_contract/hash.mjs';
export const CONTRACT_FIELDS=['contractID','manifestID','provenanceStatus','presentationID','attemptID','canonicalSelectedIndex','localSequence','manifestJSON','deliveryQuality','supportJSON','originAttemptID','resourceID'];
const fail=m=>{throw new Error('Measurement contract: '+m);};
const check=(v,m)=>{if(!v)fail(m);};
const keys=(v,list)=>check(v&&typeof v==='object'&&!Array.isArray(v)&&Object.keys(v).every(k=>list.includes(k)),'unknown object field');
const id=v=>typeof v==='string'&&/^[a-zA-Z0-9:_-]{1,160}$/.test(v);
const digest=v=>typeof v==='string'&&/^[a-f0-9]{64}$/.test(v);
const count=v=>typeof v==='number'&&Number.isSafeInteger(v)&&v>=0&&v<=1e9;
const ids=v=>check(Array.isArray(v)&&v.length<=1000&&v.every(id),'invalid ID list');
export function validateManifest(m,expected){
 keys(m,['buildRevision','manifestSchema','contractID','measurementRevision','engineRevision','trackerSourceRevision','assetRevision','contentRevision','configuration','configurationRevision','mode','modeParameters']);
 check(m.manifestSchema==='mq-run-manifest/1'&&m.contractID==='mq-measurement/1','unknown manifest version');
 check(m.measurementRevision==='mq-tracker-2026.09.10-contract1','unknown tracker version');
 for(const k of ['buildRevision','engineRevision','trackerSourceRevision','assetRevision','contentRevision','configurationRevision'])check(digest(m[k]),'invalid '+k);
 check(['standard','timed','exam','quiz','unlimited','legendary','score','trialGraph','fadingFortune','riskReward'].includes(m.mode),'invalid mode');
 const c=m.configuration;
 keys(c,['recipeSchema','selectedConceptIds','contentScopes','policyFingerprint','samplingStrategies','supportedModes','dailyChallengesEnabled','checkpoints','fadingIntervals','startingBankroll','wagerRatios']);
 check(c.recipeSchema===null||/^\d+\.\d+\.\d+$/.test(c.recipeSchema),'invalid recipe schema');
 keys(c.samplingStrategies,['quiz','trialGraph','fadingFortune','riskReward']);Object.values(c.samplingStrategies).forEach(v=>check(v===null||['balanced','adaptive'].includes(v),'invalid sampling strategy'));
 ids(c.selectedConceptIds);ids(c.supportedModes);
 check(c.policyFingerprint===null||digest(c.policyFingerprint),'invalid policy');
 check(c.dailyChallengesEnabled===null||typeof c.dailyChallengesEnabled==='boolean','invalid daily flag');
 check(c.contentScopes&&Object.keys(c.contentScopes).length<=1000,'invalid scope');
 for(const [k,s] of Object.entries(c.contentScopes)){check(id(k),'invalid concept ID');keys(s,['preset','outcomeIds']);check(s.preset===null||['standard','brief','full','custom'].includes(s.preset),'invalid preset');ids(s.outcomeIds);}
 keys(c.checkpoints,['checkpointOne','checkpointTwo','finalCheckpoint']);Object.values(c.checkpoints).forEach(ids);
 keys(c.fadingIntervals,['easy','medium','hard','elite','legendary']);Object.values(c.fadingIntervals).forEach(v=>check(v===null||count(v),'invalid interval'));
 check(c.startingBankroll===null||count(c.startingBankroll),'invalid bankroll');
 check(Array.isArray(c.wagerRatios)&&c.wagerRatios.length<=10&&c.wagerRatios.every(v=>v===null||typeof v==='number'&&v>0&&v<=1),'invalid wager');
 keys(m.modeParameters,['quizTarget','trialGraphTarget','timedLimitMs','fadingTarget','riskTarget']);Object.values(m.modeParameters).forEach(v=>check(v===null||count(v),'invalid parameter'));
 check(contractHash(c)===m.configurationRevision,'configuration hash mismatch');
 check(contractHash(m)===expected,'manifest hash mismatch');return m;
}
export function validateContractField(key,value,event){
 if(value===null)return null;
 if(key==='contractID'){check(value==='mq-measurement/1','unknown contract');return value;}
 if(key==='manifestID'){check(digest(value),'invalid manifest reference');return value;}
 if(key==='provenanceStatus'){check(['measured-segment','resume-segment','unresolved'].includes(value),'invalid provenance status');return value;}
 if(['presentationID','attemptID','originAttemptID','resourceID'].includes(key)){check(id(value),'invalid '+key);return value;}
 if(['canonicalSelectedIndex','localSequence'].includes(key)){check(count(value),'invalid '+key);return value;}
 check(typeof value==='string'&&value.length<=60000,'invalid JSON field');const parsed=JSON.parse(value);
 if(key==='manifestJSON'){check(event.eventType==='run_manifest','manifest on non-manifest event');validateManifest(parsed,event.manifestID);}
 if(key==='deliveryQuality'){keys(parsed,['overflow','permanentlyRejected','cancelled','storageFailures','localLastSequence','localRetainedRows','knownMissingPrefix','remoteOverflow','remoteCancelled','remotePermanentlyRejected','remoteStorageFailures','remotePending']);Object.values(parsed).forEach(v=>check(count(v),'invalid quality count'));}
 if(key==='supportJSON'){keys(parsed,['hintDisplayed','artifactApplied','artifactRemovedCanonical','modeRemovedCanonical','remainingOptionCount']);check(typeof parsed.hintDisplayed==='boolean'&&typeof parsed.artifactApplied==='boolean','invalid support flag');for(const k of ['artifactRemovedCanonical','modeRemovedCanonical'])check(Array.isArray(parsed[k])&&parsed[k].length<=100&&parsed[k].every(v=>v===null||count(v)),'invalid option list');check(parsed.remainingOptionCount===null||count(parsed.remainingOptionCount),'invalid remaining options');}
 return stableContractJSON(parsed);
}
