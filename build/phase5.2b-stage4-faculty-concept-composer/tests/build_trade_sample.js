const fs=require('fs'); const path=require('path'); const core=require('../composer-core.js');
const root=path.resolve(__dirname,'..');
const raw=fs.readFileSync(path.join(root,'data','composer_library.js'),'utf8');
const library=JSON.parse(raw.replace(/^\s*window\.MQ_COMPOSER_LIBRARY\s*=\s*/,'').replace(/;\s*$/,''));
const template=fs.readFileSync(path.join(root,'template','mastery-quests-faculty-template-composer-ready.html'),'utf8');
(async()=>{
 const recipe={schemaVersion:'1.2.0',title:'Comparative Advantage Mastery Quest',slug:'comparative-advantage-mastery-quest',supportedModes:['standard','timed','exam','legendary','score'],selectedConceptIds:['gains-from-trade'],checkpointFocus:{checkpointOne:null,checkpointTwo:null,finalCheckpoint:null}};
 const composition=core.compose(library,recipe); const audit=await core.verifyAnswers(composition); if(composition.errors.length||!audit.ok) throw new Error(JSON.stringify({errors:composition.errors,audit}));
 const templateSha=await core.sha256Hex(template); const config=await core.createConfig(recipe,library,templateSha); const metadata={schemaVersion:core.RECIPE_SCHEMA_VERSION,composerVersion:core.COMPOSER_VERSION,title:config.title,slug:config.slug,selectedConceptIds:config.selectedConceptIds,checkpointFocus:config.checkpointFocus,bossCoverage:composition.bossCoverage,supportedModes:config.supportedModes,saveKeyNamespace:config.saveKeyNamespace,compositionFingerprint:config.compositionFingerprint,libraryVersion:library.libraryVersion,librarySha256:library.librarySha256,templateSha256:templateSha};
 composition.embeddedQuestionAssets={};
 const html=core.buildHtml(template,composition,config,metadata);
 fs.writeFileSync(path.join(root,'tests','comparative-advantage-sample.html'),html);
 fs.writeFileSync(path.join(root,'tests','comparative-advantage-sample-manifest.json'),JSON.stringify({...metadata,poolCounts:composition.counts},null,2));
 console.log(JSON.stringify({ok:true,bytes:Buffer.byteLength(html),counts:composition.counts},null,2));
})();
