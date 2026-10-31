'use strict';
// Generate a local-only entry from the current public baseline. Every seam must match.
const fs=require('node:fs'),path=require('node:path');
const here=__dirname,root=path.resolve(here,'../..');
function replaceOnce(source,old,next){if(source.split(old).length!==2)throw new Error('Staging integration seam changed: '+old.slice(0,90));return source.replace(old,next);}
let html=fs.readFileSync(path.join(root,'index.html'),'utf8').replace(/\r\n/g,'\n');
html=replaceOnce(html,'<head>','<head>\n  <base href="../../">\n  <meta name="robots" content="noindex,nofollow">\n  <link rel="stylesheet" href="authoring/hybrid/hybrid.css">');
html=html.replaceAll('Faculty Concept Composer','Faculty Composer');
html=replaceOnce(html,'Choose economics content, modes, and artwork. Check readiness, then download a polished Mastery Quest.','Choose Mastery Quests questions, add your own, or combine both. <span class="hybrid-unreleased">Unreleased preview</span>');
html=replaceOnce(html,'<nav class="step-nav"','<div id="hybridProjectTools"></div>\n    <nav class="step-nav"');
html=replaceOnce(html,'1. Concepts &amp; scope','1. Questions');
html=replaceOnce(html,'    <section class="step active" data-step-panel="1">\n      <div class="panel">','    <section class="step active" data-step-panel="1">\n      <section id="hybridGuide" class="panel" aria-labelledby="hybridHeading"></section>\n      <div class="panel" id="hybridSharedContent">');
html=replaceOnce(html,'<h2>Choose concepts</h2>','<h2>2. Select Mastery Quests content</h2>');
html=replaceOnce(html,'Choose concepts, then select the learning outcomes you teach. Use coverage presets for a quick start.','Choose a course area to browse the ready-to-use question collection.');
html=replaceOnce(html,'<script src="composer.js?v=20261028-build-versioning"></script>','<script src="authoring/hybrid/quiz-core.js"></script>\n  <script src="authoring/hybrid/hybrid-core.js"></script>\n  <script src="authoring/hybrid/hybrid-ui.js"></script>\n  <script src="authoring/hybrid/quiz-ui.js"></script>\n  <script src="authoring/hybrid/generated-composer.js"></script>');
html=html.replace('import composition_recipe.json','import your separately saved authoring project');
html=html.replace('Download Composition Recipe (.JSON)','Save Authoring Project (.JSON)');
const detailsStart=html.indexOf('    <section class="step" data-step-panel="2">');
const detailsEnd=html.indexOf('    <section class="step" data-step-panel="3">',detailsStart);
if(detailsStart<0||detailsEnd<0)throw new Error('Game details integration seam changed.');
const oldDetails=html.slice(detailsStart,detailsEnd);
// Rebuilding this entire panel must not silently discard a new upstream control or disclosure.
if(require('node:crypto').createHash('sha256').update(oldDetails).digest('hex')!=='4c8964fae077bc7fe4266555d28b10b1ebcc6e88840e9fea01d3cf46474925fa')throw new Error('Game details baseline changed. Review the complete panel before updating this staging transformation.');
const disclosure=oldDetails.match(/<p id="anonymousCollectionHelp">[\s\S]*?(?=\n        <\/div>)/)?.[0];
if(!disclosure)throw new Error('Anonymous collection disclosure seam changed.');
html=replaceOnce(html,oldDetails,`    <section class="step" data-step-panel="2">
      <div class="panel hybrid-game-details">
        <h2>Name your game</h2>
        <p>Give students a title they will recognize.</p>
        <div class="form-grid">
          <div class="field"><label for="gameTitle">Game title</label><input id="gameTitle" value="My Faculty Mastery Quest" maxlength="100"></div>
          <div class="field"><label for="gameSlug">File name</label><input id="gameSlug" value="my-faculty-mastery-quest" pattern="[a-z0-9\\-]+"><small>Used for your download. Lowercase letters, numbers, and hyphens.</small></div>
        </div>
        <section class="collection-setting hybrid-collection" aria-labelledby="collectionHeading">
          <h3 id="collectionHeading">Optional: anonymous gameplay data</h3>
          <label><input id="allowAnonymousDataCollection" type="checkbox" aria-describedby="anonymousCollectionSummary"> Allow anonymous gameplay data collection</label>
          <p id="anonymousCollectionSummary">Off by default. Your game works with collection off. Enabling it asks Mastery Quests to authorize anonymous gameplay collection when you generate.</p>
          <details><summary>Privacy and data collection details</summary>${disclosure}</details>
        </section>
        <section id="reuseAssignment" class="hybrid-reuse" hidden aria-labelledby="reuseHeading">
          <h3 id="reuseHeading">Reusing this saved project for another assignment?</h3>
          <p>Create a separate assignment with these questions and settings. Its students' saved progress stays separate from the original. Give it a new title and file name above.</p>
          <button id="startDifferentGame" type="button" class="secondary">Create a separate assignment</button>
          <p id="assignmentCopyStatus" role="status" aria-live="polite"></p>
        </section>
      </div>
    </section>

`);
let js=fs.readFileSync(path.join(root,'composer.js'),'utf8').replace(/\r\n/g,'\n');
js=replaceOnce(js,'const Core = window.MQComposerCore;',`const Hybrid = window.MQHybridUI;
const Core = Hybrid.engine.Core;`);
js=replaceOnce(js,'schemaVersion: Core.RECIPE_SCHEMA_VERSION,\n    gameId: state.gameId,','schemaVersion: Core.RECIPE_SCHEMA_VERSION,\n    hybrid: Hybrid.project(),\n    gameId: state.gameId,');
js=replaceOnce(js,'state.composition = Core.compose(Library, recipe());','state.composition = Core.compose(Library, recipe());\n  Hybrid.changed(recipe(), state.composition);');
js=replaceOnce(js,'  state.step = Math.max(1, Math.min(7, Number(step)));','  if(Hybrid.project().quizSelection.enabled && Number(step)===4)step=state.step>4?3:5;\n  state.step = Math.max(1, Math.min(7, Number(step)));\n  Hybrid.stepChanged(state.step);');
js=replaceOnce(js,"    announce('New game identity created. Current settings retained. Use a separate publishing folder to preserve earlier assignments.');","    Hybrid.assignmentCopied();\n    announce('Separate assignment created. Give it a new title and file name.');");
js=replaceOnce(js,"  const container = $('coverageRecommendations');",`  const container = $('coverageRecommendations');
  if(Hybrid.project().quizSelection.enabled){container.textContent='This Quiz uses only your selected questions. Check the selected total and questions per attempt above.';return;}
  if(Hybrid.project().source === 'own'){
    container.textContent = 'Use the pool requirements below to choose a supported mode or add your own questions. This guide does not create checkpoint, repair, bridge, or graph pools.';
    return;
  }`);
js=replaceOnce(js,"  const selectedTitles = instructionSelected.map(id => metaById.get(id)?.title || id);",`  const selectedTitles = (Hybrid.project().source === 'own' ? [] : composition.quizSelection ? composition.recipe.selectedConceptIds.filter(id=>Library.concepts[id]) : instructionSelected).map(id => metaById.get(id)?.title || id);
  if(Hybrid.project().source !== 'shared') selectedTitles.push('Instructor questions');`);
js=replaceOnce(js,"$('downloadRecipe').disabled = !state.selectedConceptIds.length;","$('downloadRecipe').disabled = false;");
js=replaceOnce(js,'if(instructionSelected.length === 1){',"if(!composition.quizSelection && Hybrid.project().source === 'shared' && instructionSelected.length === 1){");
js=replaceOnce(js,'    activeRecipe.selectedConceptIds\n  );',"    Hybrid.projectFrom(activeRecipe).source === 'own' ? [] : composition.quizSelection ? composition.recipe.selectedConceptIds.filter(id=>Library.concepts[id]) : activeRecipe.selectedConceptIds\n  );");
js=replaceOnce(js,"    const selected=activeRecipe.selectedConceptIds.filter(id=>metaById.has(id));","    const selected=composition.quizSelection ? [] : activeRecipe.selectedConceptIds.filter(id=>metaById.has(id));");
js=replaceOnce(js,'  const thinSelected = state.selectedConceptIds','  const thinSelected = (composition.quizSelection ? [] : state.selectedConceptIds)');
js=replaceOnce(js,'  const keyMetrics = [',`  const keyMetrics = composition.quizSelection ? [
    ['Selected questions',counts.totalCanonical],['Questions per attempt',composition.quizSelection.count],['Easy',counts.easy],['Medium',counts.medium],['Hard',counts.hard]
  ] : [`);
js=replaceOnce(js,"? 'Fixed-length classroom quiz. Students choose 1–15 questions; faculty-selected concepts stay locked.'","? Hybrid.project().quizSelection.enabled ? 'Uses only your selected questions, with the length you set in Questions.' : 'Fixed-length classroom quiz. Students choose 1–15 questions; faculty-selected concepts stay locked.'");
js=replaceOnce(js,"${instructionSelected.length} selected concept${instructionSelected.length === 1 ? '' : 's'}","${composition.quizSelection ? composition.quizSelection.count + ' questions per attempt' : instructionSelected.length + ' selected concepts'}");
js=replaceOnce(js,"    {name: 'composition_recipe.json', data: Core.stableStringify(Core.canonicalRecipe(activeRecipe, Library, ThemeLibrary), 2) + '\\n'},\n",'');
js=js.replace('import composition_recipe.json','import your separately saved authoring project');
js=js.replace('Save this recipe to update the same Game ID later.','Save the separate authoring project from the staged Composer to update the same Game ID later.');
js=replaceOnce(js,'  const imported = JSON.parse(await file.text());','  const imported = JSON.parse(await file.text());\n  await Hybrid.acceptRecipe(imported);');
js=replaceOnce(js,'  if(imported.contentScopes != null){','  if(!imported.hybrid && imported.contentScopes != null){');
js=replaceOnce(js,'  recalculate();\n  switchStep(1);',`  await Hybrid.mount({recipe,importRecipe,recalculate,switchStep,downloadBlob,quizOnly(){state.supportedModes=['quiz'];renderModeOptions();renderThemeSlots();}});
  recalculate();
  switchStep(1);`);
// Source uses CRLF in some checkouts; normalize before matching by reading above.
fs.writeFileSync(path.join(here,'index.html'),html);
fs.writeFileSync(path.join(here,'generated-composer.js'),js);
console.log('Prepared unreleased authoring/hybrid/index.html from current Composer. No public files changed.');
