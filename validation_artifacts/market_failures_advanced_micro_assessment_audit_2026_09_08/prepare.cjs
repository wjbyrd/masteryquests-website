const fs=require('fs'),path=require('path'),crypto=require('crypto');
const w=__dirname, read=n=>JSON.parse(fs.readFileSync(path.join(w,n),'utf8')),write=(n,x)=>fs.writeFileSync(path.join(w,n),JSON.stringify(x,null,2)+'\n');
const b=read('library-baseline.json'),inv=read('inventory-before.json'),v=read('resolved-baseline.json');
const sources=[...new Set(Object.keys(v).map(c=>b.concepts[c].derivedFromConceptId||c))];write('sources.json',sources);
inv.rawSelectedDefinitions=Object.fromEntries(Object.keys(v).map(c=>[c,b.concepts[c]]));inv.authoritativeSources=Object.fromEntries(sources.map(c=>[c,b.concepts[c]]));
write('inventory-before.json',inv);
const projection=structuredClone(b);Object.assign(projection.concepts,v);fs.writeFileSync(path.join(w,'quality-projection-before.js'),'window.MQ_COMPOSER_LIBRARY='+JSON.stringify(projection)+';\n');
write('audit-projection-provenance.json',{reason:'The existing auditor only reads direct question containers and reports zero for raw derived definitions. Audit-only projection substitutes the exact core.resolveConceptModule result for each selected definition. Production library and engine are not changed by projection.',sourceLibrarySemanticSha256:b.librarySha256,selected:Object.keys(v),authoritativeSources:sources,expectedQuestionCount:362});
console.log(JSON.stringify({sources,parentPools:Object.fromEntries(Object.entries(b.concepts['market-failures'].questions).map(([p,q])=>[p,q.length])),assets:inv.assets.map(a=>({path:a.runtimePath,alt:a.imageAlt,description:a.graphDescription}))},null,2));
