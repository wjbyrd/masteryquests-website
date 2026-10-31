'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path');
const H=require('./hybrid-core.js'),Base=require('../../composer-core.js'),helpers=require('../../tests/composer-test-helpers.js');
const library=helpers.loadComposerLibrary(),{Core,prepare,inputs}=H.wrap(Base);
const checks=[];
const test=(name,fn)=>{fn();checks.push(name);};
const recipe={title:'Cell Biology Quest',slug:'cell-biology',supportedModes:['quiz'],selectedConceptIds:[],contentScopes:{}};
(async()=>{
  const demo=H.importCSV(fs.readFileSync(path.join(__dirname,'demo-biology.csv'),'utf8'));
  test('demo has 15 structurally complete drafts without assumed review',()=>{assert.equal(demo.questions.length,15);assert.equal(demo.warnings.length,0);assert(demo.questions.every(q=>!q.review));});
  test('CSV quoted commas, doubled quotes, embedded newlines, BOM, CRLF and CR',()=>{
    for(const newline of ['\n','\r\n','\r']){
      const r=H.importCSV('\uFEFFquestion,A,B,C,D,answer,explanation,topic,outcome,difficulty'+newline+'"What, exactly?","A ""quote""",B,C,D,A,"Line 1'+newline+'Line 2",Cells,Identify,easy');
      assert.equal(r.questions[0].question,'What, exactly?');assert.equal(r.questions[0].A,'A "quote"');assert.equal(r.questions[0].explanation,'Line 1\nLine 2');
    }
  });
  test('invalid columns and malformed CSV actionable',()=>{assert.throws(()=>H.importCSV('question,image\nQ,pic'),/Unsupported CSV column/);assert.throws(()=>H.importCSV('question\n"unclosed'),/unclosed/);assert.throws(()=>H.importCSV('question\nQ,extra'),/extra fields/);});
  test('paste drafts retain useful content and flag unknown keys',()=>{const p=H.importPaste('question: First\nA: Answer\nimage: no.png\n---\nquestion: Second');assert.equal(p.questions.length,2);assert.equal(p.questions[0].A,'Answer');assert(p.warnings.some(s=>s.includes('unsupported field')));assert(H.issues(p.questions[1]).some(s=>s.includes('choice B')));});
  test('HTML/media, invalid answers, and normalized duplicate choices rejected',()=>{for(const changes of [{answer:'5'},{question:'<img src=x>'},{D:'Nucleus'},{A:'Ａ',B:'A'}])assert(H.issues(H.edit(demo.questions[0],changes),false).length);});
  const project=H.fresh();project.source='own';project.questions=demo.questions.map(H.acknowledge);
  test('bulk acknowledgement reviews complete included questions only',()=>{
    const incomplete=H.draft({question:'Missing choices'}),excluded={...demo.questions[0],id:H.fresh().id,included:false};
    const batch=H.acknowledgeIncluded([...demo.questions,incomplete,excluded]);
    assert.equal(batch.reviewedCount,15);assert.equal(batch.blocked.length,1);assert.equal(batch.blocked[0].number,16);
    assert(batch.questions.slice(0,15).every(q=>q.review));assert.equal(batch.questions[15].review,null);assert.equal(batch.questions[16].review,null);
    assert(demo.questions.every(q=>q.review===null));
    assert.equal(H.acknowledgeIncluded(batch.questions).reviewedCount,0);
  });
  test('edits after bulk review reopen only the affected acknowledgement',()=>{
    const bank=H.acknowledgeIncluded(demo.questions).questions;
    const edited=bank.map((q,i)=>i===2?H.edit(q,{explanation:'Updated explanation.'}):q);
    assert.equal(edited.filter(q=>q.review).length,14);assert.equal(edited[2].review,null);
    assert.equal(H.acknowledgeIncluded(edited).reviewedCount,1);
  });
  await prepare(project);
  test('material edits invalidate review; inclusion preserves it',()=>{const q=project.questions[0];assert.equal(H.edit(q,{explanation:'A new explanation'}).review,null);assert.deepEqual(H.edit(q,{question:q.question}).review,q.review);assert(H.restore({...project,questions:[{...q,included:false}]}).questions[0].review);});
  test('project round trip retains IDs, exclusions, source and review',()=>assert.deepEqual(H.restore(JSON.parse(JSON.stringify(project))),project));
  test('restored edits cannot retain stale acknowledgement',()=>{const q={...project.questions[0],question:'Changed outside the guide'};assert.equal(H.restore({...project,questions:[q]}).questions[0].review,null);});
  test('duplicate IDs and unknown project versions rejected',()=>{assert.throws(()=>H.restore({...project,questions:[project.questions[0],project.questions[0]]}),/duplicate identity/);assert.throws(()=>H.restore({...project,version:99}),/version/);});
  const own={...recipe,hybrid:project};let composition=Core.compose(library,own);
  test('instructor-only quiz has exact real pools and no filler',()=>{assert.deepEqual(composition.errors,[]);assert.equal(composition.counts.totalCanonical,15);assert.equal(composition.counts.easy,5);assert.equal(composition.counts.medium,5);assert.equal(composition.counts.hard,5);assert(Object.values(composition.banks).flat().every(q=>q.source==='instructor-custom'&&!('a' in q)));assert.equal(composition.counts.repair,0);assert.equal(composition.counts.bridge,0);});
  assert.equal((await Core.verifyAnswers(composition)).ok,true);checks.push('generated answer hashes verify against exactly one choice');
  test('included unfinished questions block export and stay out of runtime banks',()=>{const q=H.draft({question:'UNFINISHED_SENTINEL'});const c=Core.compose(library,{...own,hybrid:{...project,questions:[...project.questions,q]}});assert(c.errors.some(e=>e.includes('My question 16')));assert(!JSON.stringify(c.banks).includes('UNFINISHED_SENTINEL'));});
  test('excluded drafts stay out of compiled content',()=>{const c=Core.compose(library,{...own,hybrid:{...project,questions:[...project.questions,{...H.draft({question:'EXCLUDED_SENTINEL'}),included:false}]}});assert.deepEqual(c.errors,[]);assert(!JSON.stringify(c).includes('EXCLUDED_SENTINEL'));});
  const supplied={...recipe,selectedConceptIds:['demand'],contentScopes:{demand:{depth:'full'}}};
  test('supplied workflow is identical under shared source',()=>assert.deepEqual(Core.compose(library,{...supplied,hybrid:{...project,source:'shared'}}),Base.compose(library,supplied)));
  const mixed={...supplied,hybrid:{...project,source:'mixed'}};
  test('custom topics and outcomes have readable runtime labels',()=>{const q=composition.banks.easy[0];assert.equal(composition.objectiveLabels[q.tag],'Cell biology');assert.equal(composition.objectiveLabels[q.objective],'Identify functions of cell structures');});
  test('custom questions do not inherit supplied concept review routing',()=>{
    const reviews=require('../../concept-review-runtime.js'),manifest=Base.resolveConceptReviews(library,helpers.loadConceptReviewManifest(),['demand']).runtimeIndex;
    const q=composition.banks.easy[0];assert.equal(reviews.resolveMasteryConceptReviews({manifest,canonicalConceptId:q.primaryConceptId,objective:q.objective,skill:q.primarySkill,tag:q.tag,hasMeaningfulWeakness:true}).kind,'NONE');
  });
  test('mixed respects selected supplied content and preserves separate namespaces',()=>{const c=Core.compose(library,mixed),s=Base.compose(library,supplied);assert.deepEqual(c.errors,[]);assert.equal(c.counts.totalCanonical,s.counts.totalCanonical+15);assert.equal(c.banks.easy.filter(q=>q.source==='instructor-custom').length,5);});
  test('own source cannot leak remembered supplied selections',()=>{const c=Core.compose(library,{...supplied,hybrid:project});assert.equal(c.counts.totalCanonical,15);assert(Object.values(c.banks).flat().every(q=>q.source==='instructor-custom'));});
  test('insufficient banks report exact mode shortages',()=>{const c=Core.compose(library,{...own,supportedModes:['standard']});assert(c.errors.some(e=>e.includes('easy needs 6, found 5')));assert(c.errors.some(e=>e.includes('repair needs 1, found 0')));assert(c.errors.some(e=>e.includes('easyBoss needs 3, found 0')));});
  test('recipe round trip retains complete editable authoring state',()=>{const saved=Core.canonicalRecipe(mixed,library);assert.deepEqual(Core.migrateRecipe(JSON.parse(JSON.stringify(saved)),library).recipe.hybrid,mixed.hybrid);});
  const config=await Core.createConfig(own,library,'test-template');
  test('runtime config excludes authoring questions and review keys',()=>{assert(!config.hybrid);assert(!JSON.stringify(config).includes('signature'));});
  const template=helpers.loadCanonicalTemplate();
  composition.conceptReviewRuntimeIndex=Core.resolveConceptReviews(library,helpers.loadConceptReviewManifest(),[]).runtimeIndex;
  composition.conceptReviewRuntimeSource=fs.readFileSync(path.join(__dirname,'../../concept-review-runtime.js'),'utf8');
  const html=Core.buildHtml(template,composition,config,{});
  test('runtime guard prevents custom remediation and preserves engine integrity pipeline',()=>{assert(html.includes('if(question?.source === "instructor-custom") return false;'));assert(html.includes('if(question?.source === "instructor-custom") return null;'));assert(html.includes('mq-custom:'));assert(!html.includes('"answer":'));assert(!html.includes('"review":'));});
  const out=path.resolve(__dirname,'../../../../tmp/hybrid-composer');fs.mkdirSync(out,{recursive:true});
  fs.writeFileSync(path.join(out,'own-project.json'),JSON.stringify({...own,hybrid:{...project,questions:[...project.questions,{...H.draft({question:'EXCLUDED_SENTINEL'}),included:false}]}},null,2));
  fs.writeFileSync(path.join(out,'mixed-project.json'),JSON.stringify(mixed,null,2));
  fs.writeFileSync(path.join(out,'own-game.html'),html);
  test('generated entry excludes authoring recipe from student zip',()=>{const source=fs.readFileSync(path.join(__dirname,'generated-composer.js'),'utf8');assert(!source.includes("{name: 'composition_recipe.json'"));assert(source.includes('Hybrid.projectFrom(activeRecipe).source'));});
  const root=path.resolve(__dirname,'../../../..');
  test('publication exclusions cover staging through Pages and asset paths',()=>{assert(fs.readFileSync(path.join(root,'_config.yml'),'utf8').includes('build/faculty-build-composer/authoring/hybrid'));assert(fs.readFileSync(path.join(root,'.assetsignore'),'utf8').includes('/build/faculty-build-composer/authoring/hybrid/**'));assert(fs.readFileSync(path.join(root,'audit_tools/public_site_publication/build-dist.mjs'),'utf8').includes('file.includes("/authoring/")'));});
  fs.writeFileSync(path.join(out,'unit-results.json'),JSON.stringify({passed:checks.length,checks},null,2));
  console.log(JSON.stringify({passed:checks.length,checks},null,2));
})().catch(e=>{console.error(e);process.exitCode=1;});
