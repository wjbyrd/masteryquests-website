import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
export const account='731780cdf08ed25520def0167a6be2df',database='16b248ff-20cb-429c-a4a1-dd50d17c1fd0';
export const workers=['masteryquests-anonymous-telemetry-poc','masteryquests-website'];
export async function readAPI(suffix,{sql,raw=false}={}){
  const allowed=new Set(['/workers/domains','/d1/database/'+database,...workers.flatMap(w=>['/workers/scripts/'+w,'/workers/scripts/'+w+'/settings','/workers/scripts/'+w+'/deployments','/workers/scripts/'+w+'/schedules','/workers/scripts/'+w+'/content/v2'])]);
  if(sql){assert.equal(suffix,'/d1/database/'+database+'/query');assert(/^SELECT\s/i.test(sql)&&!/[;]/.test(sql),'Single read-only SELECT required');assert(!/SELECT\s+\*/i.test(sql),'Raw contents prohibited');}
  else assert(allowed.has(suffix),'Read-only API path guard');
  const text=fs.readFileSync(path.join(process.env.APPDATA,'xdg.config/.wrangler/config/default.toml'),'utf8'),token=text.match(/^oauth_token\s*=\s*"([^"]+)"/m)?.[1];assert(token,'Wrangler session unavailable');
  const r=await fetch('https://api.cloudflare.com/client/v4/accounts/'+account+suffix,{method:sql?'POST':'GET',headers:{authorization:'Bearer '+token,'content-type':'application/json'},...(sql?{body:JSON.stringify({sql})}:{}),signal:AbortSignal.timeout(30000)});
  if(!r.ok)throw Error('Read-only Cloudflare request failed HTTP '+r.status);
  if(raw)return r;const value=await r.json();assert(value.success!==false,'Read-only API returned failure');return value.result;
}
export async function productionQuery(sql){return (await readAPI('/d1/database/'+database+'/query',{sql}))[0].results;}
