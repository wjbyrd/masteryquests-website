'use strict';
// Generate a local-only entry from the current public baseline. Every seam must match.
const fs=require('node:fs'),path=require('node:path');
const here=__dirname,root=path.resolve(here,'../..');
function replaceOnce(source,old,next){if(source.split(old).length!==2)throw new Error('Staging integration seam changed: '+old.slice(0,90));return source.replace(old,next);}
let html=fs.readFileSync(path.join(root,'index.html'),'utf8').replace(/\r\n/g,'\n');
html=replaceOnce(html,'<head>','<head>\n  <base href="../../">\n  <meta name="robots" content="noindex,nofollow">\n  <link rel="stylesheet" href="authoring/hybrid/hybrid.css">');
html=html.replaceAll('Faculty Concept Composer','Hybrid Composer · Unreleased');
html=replaceOnce(html,'Choose economics content, modes, and artwork. Check readiness, then download a polished Mastery Quest.','Local staging extension for owner review. Not released or evaluated in the submitted manuscript.');
html=replaceOnce(html,'<nav class="step-nav"','<section id="hybridGuide" class="panel" aria-labelledby="hybridHeading"></section>\n    <nav class="step-nav"');
html=replaceOnce(html,'<script src="composer.js?v=20261028-build-versioning"></script>','<script src="authoring/hybrid/hybrid-core.js"></script>\n  <script src="authoring/hybrid/hybrid-ui.js"></script>\n  <script src="authoring/hybrid/generated-composer.js"></script>');
html=html.replace('import composition_recipe.json','import your separately saved authoring project');
html=html.replace('Download Composition Recipe (.JSON)','Save Authoring Project (.JSON)');
let js=fs.readFileSync(path.join(root,'composer.js'),'utf8').replace(/\r\n/g,'\n');
js=replaceOnce(js,'const Core = window.MQComposerCore;',`const Hybrid = window.MQHybridUI;
const Core = Hybrid.engine.Core;`);
js=replaceOnce(js,'schemaVersion: Core.RECIPE_SCHEMA_VERSION,\n    gameId: state.gameId,','schemaVersion: Core.RECIPE_SCHEMA_VERSION,\n    hybrid: Hybrid.project(),\n    gameId: state.gameId,');
js=replaceOnce(js,'state.composition = Core.compose(Library, recipe());','state.composition = Core.compose(Library, recipe());\n  Hybrid.changed(recipe(), state.composition);');
js=replaceOnce(js,"  const container = $('coverageRecommendations');",`  const container = $('coverageRecommendations');
  if(Hybrid.project().source === 'own'){
    container.textContent = 'Use the pool requirements below to choose a supported mode or add your own questions. This guide does not create checkpoint, repair, bridge, or graph pools.';
    return;
  }`);
js=replaceOnce(js,"  const selectedTitles = instructionSelected.map(id => metaById.get(id)?.title || id);",`  const selectedTitles = (Hybrid.project().source === 'own' ? [] : instructionSelected).map(id => metaById.get(id)?.title || id);
  if(Hybrid.project().source !== 'shared') selectedTitles.push('Instructor questions');`);
js=replaceOnce(js,"$('downloadRecipe').disabled = !state.selectedConceptIds.length;","$('downloadRecipe').disabled = false;");
js=replaceOnce(js,'if(instructionSelected.length === 1){',"if(Hybrid.project().source === 'shared' && instructionSelected.length === 1){");
js=replaceOnce(js,'    activeRecipe.selectedConceptIds\n  );',"    Hybrid.projectFrom(activeRecipe).source === 'own' ? [] : activeRecipe.selectedConceptIds\n  );");
js=replaceOnce(js,"    {name: 'composition_recipe.json', data: Core.stableStringify(Core.canonicalRecipe(activeRecipe, Library, ThemeLibrary), 2) + '\\n'},\n",'');
js=js.replace('import composition_recipe.json','import your separately saved authoring project');
js=js.replace('Save this recipe to update the same Game ID later.','Save the separate authoring project from the staged Composer to update the same Game ID later.');
js=replaceOnce(js,'  const imported = JSON.parse(await file.text());','  const imported = JSON.parse(await file.text());\n  await Hybrid.acceptRecipe(imported);');
js=replaceOnce(js,'  if(imported.contentScopes != null){','  if(!imported.hybrid && imported.contentScopes != null){');
js=replaceOnce(js,'  recalculate();\n  switchStep(1);',`  await Hybrid.mount({recipe,importRecipe,recalculate,switchStep,downloadBlob});
  recalculate();
  switchStep(1);`);
// Source uses CRLF in some checkouts; normalize before matching by reading above.
fs.writeFileSync(path.join(here,'index.html'),html);
fs.writeFileSync(path.join(here,'generated-composer.js'),js);
console.log('Prepared unreleased authoring/hybrid/index.html from current Composer. No public files changed.');
