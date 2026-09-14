import fs from 'node:fs';
import path from 'node:path';
export const root=path.resolve(import.meta.dirname,'../../..');
export const out=path.join(root,'validation_artifacts/portable_telemetry_stage2_redaction');
export const name='masteryquests-telemetry-redaction-staging';
export const account=JSON.parse(fs.readFileSync(path.join(root,'server/anonymous-telemetry-poc/.wrangler/cache/wrangler-account.json'))).account.id;
const production=JSON.parse(fs.readFileSync(path.join(root,'server/anonymous-telemetry-poc/wrangler.jsonc')));
export function state(){return JSON.parse(fs.readFileSync(path.join(out,'resources.json')));}
export function save(value){fs.mkdirSync(out,{recursive:true});fs.writeFileSync(path.join(out,'resources.json'),JSON.stringify(value,null,2)+'\n');}
export function safeDatabase(id){if(!/^[a-f0-9-]{36}$/.test(id)||production.d1_databases.some(x=>x.database_id===id)||state().databaseId!==id)throw Error('Staging database identity guard rejected');}
export async function api(suffix,method='GET',body){
  const s=fs.existsSync(path.join(out,'resources.json'))?state():{};
  const allowed=new Set(['/d1/database','/workers/subdomain',`/workers/scripts/${name}`,`/workers/scripts/${name}/subdomain`,`/workers/scripts/${name}/tails`]);
  if(suffix==='/workers/observability/telemetry/query'){
    const filters=body?.parameters?.filters;
    if(method!=='POST'||body?.parameters?.filterCombination!=='and'||filters?.length!==1||filters[0].key!=='$workers.scriptName'||filters[0].operation!=='eq'||filters[0].value!==name)throw Error('Persisted log query must target only the staging Worker');
    allowed.add(suffix);
  }
  if(s.databaseId){safeDatabase(s.databaseId);allowed.add('/d1/database/'+s.databaseId);allowed.add('/d1/database/'+s.databaseId+'/query');}
  if(s.tailId)allowed.add(`/workers/scripts/${name}/tails/${s.tailId}`);
  for(const id of s.extraTailIds||[])allowed.add(`/workers/scripts/${name}/tails/${id}`);
  if(!allowed.has(suffix))throw Error('Non-staging API path rejected');
  if(suffix==='/d1/database'&&(method!=='POST'||body?.name!==name))throw Error('Only a new named staging database may be created');
  const config=fs.readFileSync(path.join(process.env.APPDATA,'xdg.config/.wrangler/config/default.toml'),'utf8');
  const token=config.match(/^oauth_token\s*=\s*"([^"]+)"/m)?.[1];if(!token)throw Error('Wrangler authentication unavailable');
  const response=await fetch(`https://api.cloudflare.com/client/v4/accounts/${account}${suffix}`,{method,headers:{authorization:'Bearer '+token,'content-type':'application/json'},...(body?{body:JSON.stringify(body)}:{}),signal:AbortSignal.timeout(30000)});
  if(response.status===404)return {notFound:true};
  const value=await response.json();if(!response.ok||value.success===false)throw Error('Cloudflare API rejected staging operation: HTTP '+response.status+' codes '+(value.errors||[]).map(x=>x.code).join(','));
  return value.result;
}
export async function query(sql,params=[]){const s=state();safeDatabase(s.databaseId);return api('/d1/database/'+s.databaseId+'/query','POST',{sql,params});}
