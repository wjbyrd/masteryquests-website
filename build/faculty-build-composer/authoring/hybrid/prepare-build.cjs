'use strict';
const fs=require('node:fs'),path=require('node:path');
module.exports=function prepareBuild(){
  const here=__dirname,route='/build/faculty-build-composer/authoring/hybrid/';
  let html=fs.readFileSync(path.resolve(here,'../../../index.html'),'utf8').replace(/\r\n/g,'\n');
  function replace(old,next){if(html.split(old).length!==2)throw new Error('Build preview integration seam changed: '+old.slice(0,80));html=html.replace(old,next);}
  replace('<title>Build a Quest | Mastery Quests</title>','<title>Build a Quest — Private Preview | Mastery Quests</title>\n<meta name="robots" content="noindex,nofollow"/>\n<link rel="stylesheet" href="'+route+'build-preview.css"/>\n<script defer src="'+route+'build-preview.js"></script>');
  replace('<p class="eyebrow">Faculty builder</p>','<p class="eyebrow">Faculty builder · Private preview</p>');
  replace('Build and customize an economics Mastery Quest in the Faculty Build Composer, or use the advanced blank template for a custom subject library.','Build a practice game or a quiz with Mastery Quests questions, your own questions, or both. Private unreleased preview.');
  replace('<strong>Build a game from existing economics concepts</strong>','<strong>Build a practice game</strong>');
  replace('Use the Faculty Build Composer to build from the current economics library with adaptive practice support.','Choose economics concepts and supported game modes, with adaptive practice and remediation where available.');
  const subject='<label class="goal-option">\n<input name="faculty-goal" type="checkbox" value="subject"/>';
  replace(subject,`<label class="goal-option"><input name="faculty-goal" type="checkbox" value="quiz"/><span><strong>Build a quiz</strong><small>Pick individual MQ questions, import your own, or combine both. Set the number of questions students answer.</small></span></label>\n${subject}`);
  replace('Use the advanced blank template with the question-authoring references and validator.','Write or import questions in the guided Composer, with advanced authoring resources available below.');
  replace('Select one or more goals. You can change your selections at any time\n          without losing work inside the composer.','Choose a builder and any supporting resources you need. Switching between the game and quiz builders keeps a separate browser draft for each.');
  replace('<p class="resource-type">Existing economics concepts</p>','<p class="resource-type">Practice games</p>');
  replace('<h2>Faculty Build Composer</h2>','<h2>Build a practice game</h2>');
  replace('Select concepts by course area and the learning outcomes you teach, review readiness, choose supported\n                modes, confirm checkpoint coverage, and generate a self-contained Mastery Quest.','Choose MQ concepts, add your own questions, or combine both. Select supported modes, check readiness, and generate a self-contained Mastery Quest.');
  replace('Open Composer Full Page','Open Game Composer Full Page');
  replace('Download the self-contained game and reusable recipe, then publish the game at an HTTPS address for your LMS.','Download the self-contained game and save your authoring project separately, then publish the game at an HTTPS address for your LMS.');
  html=html.replaceAll('href="/build/faculty-build-composer/"',`href="${route}"`).replaceAll('src="/build/faculty-build-composer/"',`src="${route}"`);
  const ownPanel='<section class="goal-result-panel" data-goal-panel="" data-goals="subject" id="subject-authoring">';
  replace(ownPanel,`<section class="goal-result-panel composer-result-panel" data-goal-panel="" data-goals="quiz" id="quiz-composer" hidden>
<div class="goal-panel-heading"><div><p class="resource-type">Instructor-selected questions</p><h2>Build a quiz</h2><p>Choose individual MQ questions, write or import your own, or combine both. Use your entire selection or set a random sample size. Students answer the number you assign.</p></div><div class="resource-actions"><a class="button button-primary" href="${route}quiz.html">Open Quiz Composer Full Page</a><a class="button button-outline-dark" href="/how-to/#answer-hardening">Assessment guidance</a></div></div>
<div aria-label="Quiz quick start" class="build-step-grid compact-build-steps"><article class="build-step-card"><span class="feature-number">01</span><h3>Choose your questions</h3><p>Search the MQ collection or bring your own bank. Preview questions and answers before including them.</p></article><article class="build-step-card"><span class="feature-number">02</span><h3>Set the length and appearance</h3><p>Use every selected question or a random sample. Choose a title and theme.</p></article><article class="build-step-card"><span class="feature-number">03</span><h3>Check, download, and deploy</h3><p>Check readiness, save your editable project, and download the quiz for your course.</p></article></div>
<div class="composer-frame-shell"><div class="composer-frame-toolbar"><strong>Quiz Composer</strong><span>Quiz only · Your selected questions · Your assigned length</span></div><iframe class="composer-frame" loading="lazy" src="${route}quiz.html" title="Mastery Quests Quiz Composer"></iframe></div>
</section>
${ownPanel}`);
  replace('<p class="resource-type">Blank template + question authoring</p>','<p class="resource-type">Guided and advanced question authoring</p>');
  replace('Start with the blank template and use the guides to write, organize, and check questions for your subject.\n                The economics Composer remains the faster path when its concept library fits your course.','Write or import your bank in the guided Composer. The blank template and references below remain available for advanced question types and adaptive support.');
  replace('<h2>Create a quest for your own subject</h2>','<h2>Create questions for your own subject</h2>');
  const ownIntro='The blank template and references below remain available for advanced question types and adaptive support.\n              </p>';
  replace(ownIntro,ownIntro+`\n<a class="button button-primary" data-own-composer href="${route}?source=own">Open My Questions in the Composer</a>`);
  html=html.replaceAll('href="/build/"',`href="${route}build-preview.html"`);
  fs.writeFileSync(path.join(here,'build-preview.html'),html);
};
