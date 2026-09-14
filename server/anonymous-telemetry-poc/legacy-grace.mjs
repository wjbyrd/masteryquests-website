import {LEGACY_BUILDS} from './legacy-builds.mjs';
import {reject, validateTuple} from './capabilities.mjs';
const keys=['game_id','build_id','build_version','schema_version','allowed_origin','sunset_at'];
export function legacyGraceEnabled(env={}) { return env.CAPABILITY_LEGACY_GRACE_ENABLED==='true'; }
export function validateLegacyInventory(value) {
  try {
    if(typeof value==='string') { if(value.length>16384)throw Error();value=JSON.parse(value); }
    if(!Array.isArray(value)||!value.length||value.length>64)throw Error();
    const seen=new Set();
    return value.map(entry=>{
      if(!entry||typeof entry!=='object'||Array.isArray(entry)||Object.keys(entry).length!==keys.length||Object.keys(entry).some(k=>!keys.includes(k)))throw Error();
      validateTuple({gameId:entry.game_id,buildId:entry.build_id,buildVersion:entry.build_version,schemaVersion:entry.schema_version});
      if(!['https://masteryquests.org','https://www.masteryquests.org'].includes(entry.allowed_origin))throw Error();
      if(typeof entry.sunset_at!=='string'||!/^\d{4}-\d\d-\d\dT\d\d:\d\d:\d\d\.000Z$/.test(entry.sunset_at))throw Error();
      const ms=Date.parse(entry.sunset_at);if(!Number.isFinite(ms)||ms<=0||new Date(ms).toISOString()!==entry.sunset_at)throw Error();
      const key=JSON.stringify(keys.slice(0,5).map(k=>entry[k]));if(seen.has(key))throw Error();seen.add(key);
      return Object.freeze({...entry,sunsetSeconds:ms/1000});
    });
  } catch { reject('legacy_inventory_unavailable',503); }
}
export function matchLegacyBuild(events,origin,env,now) {
  if(!legacyGraceEnabled(env)||!origin)reject('ingest_not_authorized',403);
  // Only deployment-owned bindings may replace the pending candidate list; never request data.
  const entries=validateLegacyInventory(env.CAPABILITY_LEGACY_INVENTORY??LEGACY_BUILDS);
  const e=events[0];
  const found=entries.find(x=>x.allowed_origin===origin && x.game_id===e.gameId && x.build_id===e.buildId && x.build_version===e.buildVersion && x.schema_version===e.schemaVersion);
  if(!found||now>=found.sunsetSeconds||events.some(e=>e.gameId!==found.game_id||e.buildId!==found.build_id||e.buildVersion!==found.build_version||e.schemaVersion!==found.schema_version))reject('ingest_not_authorized',403);
  return found;
}
export function legacyPermission(entry) {
  return {sql:'unixepoch()<? AND NOT EXISTS(SELECT 1 FROM telemetry_build_policies WHERE game_id=? AND build_id=? AND blocked_at IS NOT NULL)',values:[entry.sunsetSeconds,entry.game_id,entry.build_id]};
}
