const fs=require('fs'), path=require('path'), crypto=require('crypto');
const root=path.resolve(__dirname,'..');
const core=require('../composer-core.js');
const raw=fs.readFileSync(path.join(root,'data','composer_library.js'),'utf8');
const lib=JSON.parse(raw.replace(/^\s*window\.MQ_COMPOSER_LIBRARY\s*=\s*/,'').replace(/;\s*$/,''));
const template=fs.readFileSync(path.join(root,'template','mastery-quests-faculty-template-composer-ready.html'),'utf8');
(async()=>{
 const recipe={schemaVersion:core.RECIPE_SCHEMA_VERSION,title:'Trial by Graph Validation Game',slug:'trial-by-graph-validation-game',supportedModes:[...core.MODE_ORDER],selectedConceptIds:['perfect-competition'],checkpointFocus:{checkpointOne:null,checkpointTwo:null,finalCheckpoint:null}};
 const c=core.compose(lib,recipe); if(c.errors.length) throw new Error(c.errors.join(' | '));
 const embedded={}; const assetIssues=[];
 for(const a of c.assets){ const fp=path.join(root,'data',a.runtimePath); if(!fs.existsSync(fp)){assetIssues.push(`missing ${a.runtimePath}`); continue;} const b=fs.readFileSync(fp); const h=crypto.createHash('sha256').update(b).digest('hex'); if(h!==a.sha256) assetIssues.push(`hash ${a.runtimePath}`); embedded[a.runtimePath]=`data:image/webp;base64,${b.toString('base64')}`; }
 if(assetIssues.length) throw new Error(assetIssues.join(' | ')); c.embeddedQuestionAssets=embedded;
 const tsha=await core.sha256Hex(template); const config=await core.createConfig(recipe,lib,tsha); const metadata={schemaVersion:core.RECIPE_SCHEMA_VERSION,composerVersion:core.COMPOSER_VERSION,title:config.title,slug:config.slug,selectedConceptIds:config.selectedConceptIds,checkpointFocus:config.checkpointFocus,bossCoverage:c.bossCoverage,supportedModes:config.supportedModes,saveKeyNamespace:config.saveKeyNamespace,compositionFingerprint:config.compositionFingerprint,libraryVersion:lib.libraryVersion,librarySha256:lib.librarySha256,templateSha256:tsha};
 const html=core.buildHtml(template,c,config,metadata); fs.writeFileSync(path.join(root,'tests','trial-by-graph-all-eight-embedded.html'),html);
 const out={ok:true,composerVersion:core.COMPOSER_VERSION,graphSafe:c.counts.graphSafe,graphSafeByDifficulty:c.counts.graphSafeByDifficulty,trialGraphQuestionIds:c.trialGraphQuestionIds.length,assets:c.assets.length,htmlBytes:Buffer.byteLength(html),modes:c.validation.modes.map(m=>({mode:m.mode,ok:m.ok}))}; fs.writeFileSync(path.join(root,'trial_by_graph_embedded_sample_results_4.5s.2k.json'),JSON.stringify(out,null,2)); console.log(JSON.stringify(out,null,2));
})();
