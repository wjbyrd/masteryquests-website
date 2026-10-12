import test from 'node:test';
import assert from 'node:assert/strict';
import {createServer} from 'node:http';
import {subscriptions} from '../../server/subscriptions/worker.mjs';
import site from '../../server/site-worker.mjs';
const origin='https://masteryquests.org',email='faculty@example.edu';
const env=()=>({SUBSCRIPTIONS_ENABLED:'true',BREVO_API_KEY:'synthetic-test-key',BREVO_LIST_ID:'9',BREVO_DOI_TEMPLATE_ID:'12',SUBSCRIPTION_IP_LIMIT:{limit:async()=>({success:true})},SUBSCRIPTION_EMAIL_LIMIT:{limit:async()=>({success:true})},SUBSCRIPTION_GLOBAL_LIMIT:{limit:async()=>({success:true})}});
const request=(body={email,consent:true,website:''},headers={})=>new Request(origin+'/api/subscriptions',{method:'POST',headers:{origin,'content-type':'application/json','cf-connecting-ip':'192.0.2.1',...headers},body:typeof body==='string'?body:JSON.stringify(body)});
test('disabled or missing configuration never calls the provider',async()=>{for(const field of ['SUBSCRIPTIONS_ENABLED','BREVO_API_KEY','BREVO_LIST_ID','BREVO_DOI_TEMPLATE_ID','SUBSCRIPTION_IP_LIMIT','SUBSCRIPTION_EMAIL_LIMIT','SUBSCRIPTION_GLOBAL_LIMIT']){const e=env();delete e[field];assert.equal((await subscriptions(request(),e,()=>{throw Error('must not call')})).status,503)}});
test('public readiness reveals no credentials or contacts',async()=>{const r=await subscriptions(new Request(origin+'/api/subscriptions'),env());assert.deepEqual(await r.json(),{available:true});assert.equal(r.headers.get('cache-control'),'no-store')});
test('strict origin and method boundaries',async()=>{assert.equal((await subscriptions(request(undefined,{origin:'https://other.test'}),env())).status,403);assert.equal((await subscriptions(new Request('https://other.test/api/subscriptions'),env())).status,403);assert.equal((await subscriptions(new Request(origin+'/api/subscriptions',{method:'DELETE'}),env())).status,405);assert.equal((await subscriptions(new Request(origin+'/api/subscriptions/contacts'),env())).status,404)});
test('affirmative consent, email validation, honeypot and exact payload required',async()=>{for(const b of [{email,consent:false,website:''},{email:'bad',consent:true,website:''},{email:'bad\n@example.edu',consent:true,website:''},{email,consent:true,website:'bot'},{email,consent:true,website:'',extra:1},null,[],{}])assert.equal((await subscriptions(request(b),env(),()=>{throw Error('must not call')})).status,400)});
test('oversized and malformed bodies do not reach Brevo',async()=>{for(const b of ['{','x'.repeat(2200)])assert.equal((await subscriptions(request(b),env(),()=>{throw Error('must not call')})).status,400)});
test('each rate limiter can stop submission without provider calls',async()=>{for(const field of ['SUBSCRIPTION_IP_LIMIT','SUBSCRIPTION_EMAIL_LIMIT','SUBSCRIPTION_GLOBAL_LIMIT']){const e=env();e[field]={limit:async()=>({success:false})};const r=await subscriptions(request(),e,()=>{throw Error('must not call')});assert.equal(r.status,429);assert.equal(r.headers.get('retry-after'),'60')}});
test('rate keys do not contain email or IP',async()=>{const keys=[],e=env();for(const k of ['SUBSCRIPTION_IP_LIMIT','SUBSCRIPTION_EMAIL_LIMIT'])e[k]={limit:async ({key})=>{keys.push(key);return {success:true}}};await subscriptions(request(),e,async()=>new Response('',{status:503}));assert.equal(keys.length,2);keys.forEach(k=>assert.match(k,/^[a-f0-9]{64}$/))});
test('confirmed members and unsubscribed contacts are not added or emailed again',async()=>{for(const c of [{listIds:[9],emailBlacklisted:false},{listIds:[],emailBlacklisted:true}]){let calls=0;const r=await subscriptions(request(),env(),async()=>{calls++;return Response.json(c)});assert.equal(r.status,202);assert.equal(calls,1);assert(!(await r.text()).includes(email))}});
test('new subscription uses the DOI endpoint and not direct list insertion',async()=>{const calls=[];const r=await subscriptions(request({email:' FACULTY@EXAMPLE.EDU ',consent:true,website:''}),env(),async(url,options)=>{calls.push({url,options});return calls.length===1?new Response('',{status:404}):Response.json({},{status:201})});assert.equal(r.status,202);assert.equal(calls.length,2);assert.equal(calls[1].url,'https://api.brevo.com/v3/contacts/doubleOptinConfirmation');const body=JSON.parse(calls[1].options.body);assert.deepEqual(body,{email,includeListIds:[9],templateId:12,redirectionUrl:origin+'/about/subscribe/confirmation/',contactPixelTrackingConsent:false});assert.equal(calls[1].options.redirect,'manual')});
test('a contact in a different list must also confirm first',async()=>{let count=0;const r=await subscriptions(request(),env(),async()=>++count===1?Response.json({listIds:[88],emailBlacklisted:false}):Response.json({},{status:201}));assert.equal(r.status,202);assert.equal(count,2)});
test('provider rejection never reports success or leaks response bodies',async()=>{for(const stage of ['lookup','doi'])for(const code of [400,401,403,429,500]){let calls=0;const r=await subscriptions(request(),env(),async()=>{calls++;return new Response('private provider diagnostic '+email,{status:stage==='doi'&&calls===1?404:code})});assert.equal(r.status,503);assert(!(await r.text()).includes(email))}});
test('network failures close safely without exposing details',async()=>{const r=await subscriptions(request(),env(),async()=>{throw Error('private API detail')});assert.equal(r.status,503);assert(!(await r.text()).includes('private API'))});

test('provider redirects fail closed without following the target or forwarding credentials',async()=>{
  let targetHits=0,redirectStatus=302;
  const server=createServer((req,res)=>{
    req.resume();
    if(req.url==='/target'){targetHits++;res.writeHead(200);res.end('{}');return;}
    assert.equal(req.headers['api-key'],'synthetic-test-key');
    res.writeHead(redirectStatus,{location:'/target'});res.end();
  });
  await new Promise((resolve,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',resolve)});
  try{
    const local='http://127.0.0.1:'+server.address().port;
    for(const stage of ['lookup','doi'])for(const status of [301,302,303,307,308]){
      redirectStatus=status;let calls=0;
      const result=await subscriptions(request(),env(),async(url,options)=>{
        calls++;
        if(stage==='doi'&&calls===1)return new Response('',{status:404});
        return fetch(local+'/redirect',options);
      });
      assert.equal(result.status,503);
      assert.equal(calls,stage==='lookup'?1:2);
      assert.equal(targetHits,0);
      assert(!(await result.text()).includes('synthetic-test-key'));
    }
  }finally{await new Promise(resolve=>server.close(resolve))}
});
test('wrapper preserves public assets and the closed classroom gate',async()=>{const e={ASSETS:{fetch:async r=>new Response(new URL(r.url).pathname)}};assert.equal(await (await site.fetch(new Request(origin+'/how-to/'),e)).text(),'/how-to/');assert.equal((await site.fetch(new Request(origin+'/play/managerial-directorate-classroom/'),e)).status,503);assert.deepEqual(await (await site.fetch(new Request(origin+'/api/subscriptions'),e)).json(),{available:false})});
