'use strict';
const assert = require('node:assert/strict');
const vm = require('node:vm');
const Core = require('../composer-core.js');
const Deployment = require('../deployment.js');
const helper = require('./composer-test-helpers.js');

(async () => {
  const library = helper.loadComposerLibrary();
  const recipe = {gameId:Deployment.newId('game'),title:'Deployment <test> " &',slug:'deployment-test',selectedConceptIds:['aggregate-demand'],supportedModes:['standard','quiz']};
  const first = await helper.buildFacultyGame(Core, recipe, {library});
  const second = await helper.buildFacultyGame(Core, {...recipe,title:'Revised presentation',slug:'renamed-game',guideName:'New guide'}, {library});
  assert.equal(first.config.gameId, second.config.gameId);
  assert.notEqual(first.config.buildId, second.config.buildId);
  assert.equal(first.config.saveKeyNamespace, second.config.saveKeyNamespace);
  assert.equal(first.config.saveCompatibilityId, second.config.saveCompatibilityId);
  assert.equal(Core.canonicalRecipe(Core.migrateRecipe(recipe,library).recipe,library).gameId, recipe.gameId);
  const different = await helper.buildFacultyGame(Core, {...recipe,gameId:Deployment.newId('game'),selectedConceptIds:['supply']}, {library});
  assert.notEqual(first.config.gameId, different.config.gameId);
  assert.notEqual(first.config.saveKeyNamespace, different.config.saveKeyNamespace);
  assert.notEqual(Core.activationScope(first.config, first.composition).buildId, Core.activationScope(different.config,different.composition).buildId);
  const changed = structuredClone(first.composition);
  changed.banks.easy[0].q += ' Changed wording.';
  const changedConfig = await Core.createConfig(recipe,library,'template',undefined,changed);
  assert.equal(changedConfig.gameId, first.config.gameId);
  assert.notEqual(changedConfig.saveCompatibilityId, first.config.saveCompatibilityId);
  // A new build with exactly the same recipe and banks must keep its save slot.
  const regenerated = await Core.createConfig(recipe,library,'new-template',undefined,first.composition);
  assert.notEqual(regenerated.buildId, first.config.buildId);
  assert.equal(regenerated.saveKeyNamespace, first.config.saveKeyNamespace);
  assert.notEqual(Deployment.filename(first.config.buildId), Deployment.filename(second.config.buildId));
  for(const built of [first,second,different]){
    helper.assertInlineScriptsCompile(built.html);
    helper.assertInlineScriptsCompile(Deployment.publishingPage(built.config));
    helper.assertInlineScriptsCompile(Deployment.launcher(built.config));
    assert(built.html.includes(built.config.buildId));
    assert(built.html.includes('id="mq-build-info"'));
    // All runtime code, CSS and bank data are in the versioned HTML itself.
    assert(!/<script[^>]+src=|<link[^>]+rel=["']stylesheet/i.test(built.html));
  }
  const urls = [
    ['https://example.test/','/'],
    ['https://wjbyrd.github.io/test','/test/'],
    ['https://wjbyrd.github.io/test/','/test/'],
    ['https://example.test/test/game-one/','/test/game-one/'],
    ['https://example.test/test/index.html','/test/'],
    ['https://example.test/test/Old game & café.html?course=A%26B&v=old#intro','/test/'],
    ['https://example.test/test/unit%20one%20%26%20caf%C3%A9/?course=7&mode=quiz','/test/unit%20one%20%26%20caf%C3%A9/']
  ];
  for(const [input, folder] of urls){
    const embed = Deployment.createEmbed(input, second.config);
    const url = new URL(embed.gameUrl);
    assert.equal(url.pathname, folder + Deployment.filename(second.config.buildId));
    assert.equal(url.searchParams.getAll('v').length, 1);
    assert.equal(url.searchParams.get('v'), second.config.buildId);
    const old = new URL(input);
    for(const [key,value] of old.searchParams) if(key !== 'v') assert.equal(url.searchParams.get(key),value);
    assert.equal(url.hash, old.hash);
    assert(embed.html.includes('width="100%"') && embed.html.includes('title="Revised presentation"'));
    const staleLocation = {href:input,search:`?course=1&v=${second.config.buildId}`,hash:'#intro',replace(value){this.target=value;}};
    vm.runInNewContext(helper.extractInlineScripts(Deployment.launcher(first.config))[0], {URL,URLSearchParams,location:staleLocation,document:{getElementById:()=>({})}});
    assert.equal(new URL(staleLocation.target).searchParams.get('v'),second.config.buildId);
    assert(new URL(staleLocation.target).pathname.endsWith(Deployment.filename(second.config.buildId)));
  }
  assert(Deployment.createEmbed('https://example.test/?x=1',first.config).html.includes('Deployment &lt;test&gt; &quot; &amp;'));
  for(const url of ['javascript:alert(1)','data:text/html,hi','file:///game.html','https://user:pass@example.test/']) assert.throws(()=>Deployment.createEmbed(url,first.config));
  assert.throws(()=>Deployment.filename('../game'));
  const hostile = Deployment.publishingPage({...first.config,title:'</script><script>alert(1)</script>'});
  assert(!hostile.includes('</script><script>alert(1)'));
  assert.equal(Deployment.publishingPage({...first.config,visualTheme:{image:'x'.repeat(100000)}}),Deployment.publishingPage(first.config),'Do not duplicate embedded artwork in the publishing helper');
  const legacy = {...recipe}; delete legacy.gameId;
  const legacyA = await Core.createConfig(legacy,library,'test');
  const legacyB = await Core.createConfig(legacy,library,'test');
  assert.notEqual(legacyA.gameId,legacyB.gameId,'Unidentified recipes must not silently share progress');
  // Published campaign engines and their intentional hub keys are outside this change.
  const template = helper.loadCanonicalTemplate();
  assert(template.includes("const key = 'mq:accessibility:decorative-motion'"),'Keep the shared accessibility preference');
  assert(!/serviceWorker\.register|caches\.open/.test(template));
  console.log('PASS deployment versioning: identities, compatible/incompatible saves, exact build filenames, embedded resources, 7 URL shapes, stale launcher, escaping, legacy isolation, shared accessibility preference.');
})().catch(error => { console.error(error); process.exitCode = 1; });
