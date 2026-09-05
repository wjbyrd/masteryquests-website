const ROOT = '/play/managerial-directorate-classroom';
const COOKIE = '__Secure-MQClassroom';
const LIFETIME = 10 * 60 * 60;
const encoder = new TextEncoder();
const securityHeaders = {
  'cache-control': 'private, no-store, max-age=0',
  'x-robots-tag': 'noindex, nofollow, noarchive',
  'referrer-policy': 'same-origin',
  'x-content-type-options': 'nosniff',
  'content-security-policy': "default-src 'none'; style-src 'unsafe-inline'; form-action 'self'; frame-ancestors 'none'; base-uri 'none'"
};
function pathForGate(url) {
  // Assets may normalize encoded paths. Apply the same boundary conservatively.
  let pathname = url.pathname;
  for(let i=0;i<3;i++) { try { const decoded=decodeURIComponent(pathname);if(decoded===pathname)break;pathname=decoded; } catch { break; } }
  return new URL(pathname.replaceAll('\\','/').replace(/\/{2,}/g,'/'),url.origin).pathname;
}
function protectedPath(url) { const p=pathForGate(url);return p===ROOT || p.startsWith(ROOT+'/'); }
function base64url(bytes) { return btoa(String.fromCharCode(...new Uint8Array(bytes))).replaceAll('+','-').replaceAll('/','_').replace(/=+$/,''); }
function unbase64url(value) { if(!/^[A-Za-z0-9_-]+$/.test(value))throw Error('invalid');return Uint8Array.from(atob(value.replaceAll('-','+').replaceAll('_','/')),c=>c.charCodeAt(0)); }
async function keyFor(secret) { return crypto.subtle.importKey('raw',encoder.encode(secret),{name:'HMAC',hash:'SHA-256'},false,['sign','verify']); }
async function sign(payload,key) { return base64url(await crypto.subtle.sign('HMAC',key,encoder.encode('classroom-session:'+payload))); }
async function authenticated(request,key,now) {
  try {
    const matches=(request.headers.get('cookie')||'').split(';').map(s=>s.trim()).filter(s=>s.startsWith(COOKIE+'='));
    if(matches.length!==1)return false;
    const token=matches[0].slice(COOKIE.length+1);if(token.length>512)return false;
    const parts=token.split('.');if(parts.length!==2)return false;
    if(!await crypto.subtle.verify('HMAC',key,unbase64url(parts[1]),encoder.encode('classroom-session:'+parts[0])))return false;
    const data=JSON.parse(new TextDecoder().decode(unbase64url(parts[0])));
    return data.v===1 && Object.keys(data).sort().join(',')==='exp,iat,v' && Number.isInteger(data.iat) && Number.isInteger(data.exp) && data.iat<=now && data.exp>now && data.exp-data.iat===LIFETIME;
  } catch { return false; }
}
function page(error='',status=200,closed=false) {
  const html=`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="robots" content="noindex,nofollow,noarchive"><title>Private Class Build</title><style>*{box-sizing:border-box}body{margin:0;min-height:100dvh;display:grid;place-items:center;background:#020617;color:#edf2fa;font:17px/1.6 system-ui,sans-serif;padding:24px}main{width:100%;max-width:460px;border:1px solid #766640;border-radius:16px;padding:clamp(24px,6vw,40px);background:#081425}h1{color:#f7d982;font-size:clamp(26px,6vw,34px);line-height:1.2;margin:0 0 18px}label{display:block;margin-top:24px;font-weight:600}input,button{font:inherit;width:100%;border-radius:8px;padding:12px;margin-top:8px}input{min-width:0;background:#020617;color:#fff;border:1px solid #94a3b8}button{margin-top:22px;background:#f7d982;color:#081425;border:0;font-weight:700;cursor:pointer}:focus-visible{outline:3px solid #8bdcff;outline-offset:4px}.note{font-size:13px;color:#cbd5e1;margin-top:24px}.error{color:#fecaca}</style></head><body><main><h1>Private Class Build</h1>${closed?'<p>This class activity is currently closed.</p>':`<p>Enter the class access code to continue.</p>${error?`<p id="error" class="error" role="alert">${error}</p>`:''}<form method="post" autocomplete="off"><label for="access-code">Access code</label><input id="access-code" name="accessCode" type="password" required maxlength="256" autocomplete="off" autocapitalize="none" spellcheck="false"${error?' aria-invalid="true" aria-describedby="error"':''}><button type="submit">Continue</button></form><p class="note">This private build is available only to participants in the current class activity.</p>`}</main></body></html>`;
  return new Response(html,{status,headers:{...securityHeaders,'content-type':'text/html; charset=utf-8',...(status===429?{'retry-after':'60'}:{})}});
}
function redirect(path,cookie) { return new Response(null,{status:303,headers:{...securityHeaders,location:path,...(cookie?{'set-cookie':cookie}:{})}}); }
export default {
  async fetch(request,env) {
    const url=new URL(request.url);
    if(!protectedPath(url))return env.ASSETS.fetch(request);
    // Missing configuration or pilot shutdown closes the subtree, including old sessions.
    if(env.CLASSROOM_CLOSED==='true'||typeof env.CLASSROOM_ACCESS_CODE!=='string'||env.CLASSROOM_ACCESS_CODE.length<12||typeof env.CLASSROOM_SESSION_SECRET!=='string'||env.CLASSROOM_SESSION_SECRET.length<32)return page('',503,true);
    if(url.protocol!=='https:')return new Response(null,{status:308,headers:{...securityHeaders,location:'https://'+url.host+url.pathname}});
    if(pathForGate(url)===ROOT)return redirect(ROOT+'/');
    const key=await keyFor(env.CLASSROOM_SESSION_SECRET),now=Math.floor(Date.now()/1000);
    if(await authenticated(request,key,now)) {
      const upstream=await env.ASSETS.fetch(request);
      const headers=new Headers(upstream.headers);headers.set('cache-control','private, no-store, max-age=0');headers.set('x-robots-tag','noindex, nofollow, noarchive');
      return new Response(upstream.body,{status:upstream.status,statusText:upstream.statusText,headers});
    }
    if(request.method==='GET'||request.method==='HEAD') { const response=page();return request.method==='HEAD'?new Response(null,{status:response.status,headers:response.headers}):response; }
    if(request.method!=='POST')return new Response(null,{status:405,headers:{...securityHeaders,allow:'GET, HEAD, POST'}});
    if(request.headers.get('origin')!==url.origin)return page('That access code is not valid.',403);
    if(!/^application\/x-www-form-urlencoded(?:;|$)/i.test(request.headers.get('content-type')||''))return page('That access code is not valid.',400);
    // Shared class-wide bucket: no account, IP, cookie or telemetry identifier.
    try { if(!env.CLASSROOM_LOGIN_LIMIT||!(await env.CLASSROOM_LOGIN_LIMIT.limit({key:'managerial-classroom-login'})).success)return page('Please wait a minute before trying again.',429); } catch { return page('',503,true); }
    let submitted;
    try {
      const reader=request.body?.getReader();if(!reader)throw Error('empty');let size=0;const chunks=[];
      for(;;){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>2048){await reader.cancel();throw Error('large');}chunks.push(value);}
      const body=new Uint8Array(size);let offset=0;for(const chunk of chunks){body.set(chunk,offset);offset+=chunk.length;}
      const fields=new URLSearchParams(new TextDecoder().decode(body));if(fields.getAll('accessCode').length!==1||[...fields.keys()].some(k=>k!=='accessCode'))throw Error('invalid');submitted=fields.get('accessCode');if(submitted.length>256)throw Error('large');
    } catch {return page('That access code is not valid.',400);}
    // Web Crypto performs MAC verification without a character-by-character secret comparison.
    const expected=await crypto.subtle.sign('HMAC',key,encoder.encode('classroom-code:'+env.CLASSROOM_ACCESS_CODE));
    if(!await crypto.subtle.verify('HMAC',key,expected,encoder.encode('classroom-code:'+submitted)))return page('That access code is not valid.',403);
    const payload=base64url(encoder.encode(JSON.stringify({v:1,iat:now,exp:now+LIFETIME})));
    const token=payload+'.'+await sign(payload,key);
    // The current classroom URL supplies the return destination; no user-provided redirect field.
    return redirect(pathForGate(url),`${COOKIE}=${token}; Path=${ROOT}/; Max-Age=${LIFETIME}; HttpOnly; Secure; SameSite=Lax`);
  }
};
