// Separate maintenance foundation; no scheduled or opportunistic invocation is installed.
import {boundedInteger,safeDatabaseError} from './capabilities.mjs';
export async function cleanupExpiredScopeWindows(db,{limit=100}={}) {
  const bounded=boundedInteger(limit,100,1000);
  try {
    const result=await db.batch([db.prepare(`DELETE FROM telemetry_scope_windows WHERE rowid IN
      (SELECT rowid FROM telemetry_scope_windows WHERE window_seconds>0 AND expires_at IS NOT NULL
       AND expires_at<=unixepoch() ORDER BY expires_at,rowid LIMIT ?)` ).bind(bounded)]);
    return {deleted:Number(result[0].meta?.changes||0),limit:bounded};
  } catch(error) { throw safeDatabaseError(error); }
}
