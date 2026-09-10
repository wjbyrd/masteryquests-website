'use strict';
// Public information pages only; gameplay, private builds and historical examples are excluded.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const repo=process.env.MQ_DOC_REPO_ROOT||path.resolve(__dirname,'../..');
const pages=JSON.parse(fs.readFileSync(path.join(__dirname,'pages.json'))),read=p=>fs.readFileSync(path.join(repo,p),'utf8');
function checkLinks(page,html){const results=[];for(const m of html.matchAll(/\b(?:href|src)=["']([^"']+)["']/g)){const raw=m[1].replaceAll('&amp;','&');if(/^(data:|mailto:|tel:|javascript:)/.test(raw))continue;const url=new URL(raw,'https://masteryquests.org/'+page);if(url.origin!=='https://masteryquests.org')continue;let target=decodeURIComponent(url.pathname).slice(1);if(!target||target.endsWith('/'))target+='index.html';assert(fs.existsSync(path.join(repo,target)),page+': missing '+raw);if(url.hash&&target.endsWith('.html')){const id=decodeURIComponent(url.hash.slice(1)),source=read(target);assert(source.includes('id="'+id+'"')||source.includes("id='"+id+"'"),page+': missing anchor '+raw);}results.push({page,url:raw,target});}return results;}
const links=pages.flatMap(p=>checkLinks(p,read(p)));
for(const p of pages){const html=read(p);assert(!/>\s*(How To|Deployment Guide)\s*<\/a>/i.test(html),p+': stale navigation');assert(!html.includes('Faculty Concept Composer'),p+': stale Composer documentation name');}
assert(!read('games/index.html').includes('Full-evidence modes'),'Games duplicates engine explanation');assert(read('games/index.html').includes('/how-to/#adaptive-engine'));
const ui=[...read('build/faculty-build-composer/index.html').matchAll(/<button data-step="\d+"[^>]*>\d+\. ([^<]+)</g)].map(m=>m[1].replace('&amp;','&'));
const steps=[...read('how-to/composer/index.html').matchAll(/<li><span>0\d<\/span><div><h3>([^<]+)<\/h3>/g)].map(m=>m[1].replace('&amp;','&'));assert.deepEqual(steps,ui,'Composer documentation step order differs from current UI');
assert(read('privacy/index.html').includes('anonymous schema-2 collection'));assert(read('how-to/telemetry-data-dictionary/index.html').includes('public and classroom Managerial'));
assert.throws(()=>checkLinks('index.html','<a href="/missing-documentation-path/">Missing</a>'));
assert.throws(()=>checkLinks('index.html','<a href="/how-to/#missing-documentation-anchor">Missing</a>'));
console.log(JSON.stringify({status:'PASS',pages:pages.length,links:links.length,uniqueTargets:new Set(links.map(l=>l.target)).size,brokenLinks:0,negativeControls:2,composerSteps:steps},null,2));
