import pathlib
D=pathlib.Path(__file__).resolve().parent;R=D.parents[1];T=R/'build/faculty-build-composer/tests'
for name in ['composer-audit-contracts.js','run_content_scope_validation.js','run_fading_fortune_validation.js','run_macro_phase2_taxonomy_validation.mjs','run_phase3e_graph_question_sync_validation.mjs','run_question_bank_comprehensive_validation.mjs','run_risk_reward_validation.js','run_trial_by_graph_validation.js']:
 p=T/name;s=p.read_text(encoding='utf-8').replace("require('./macro-voice3-revisions.js')","require('./micro-voice3-revisions.js')")
 if name=='run_phase3e_graph_question_sync_validation.mjs':s=s.replace('micro.macroVoice3Ledger, micro.microVoiceLedger','micro.microVoice3Ledger, micro.macroVoice3Ledger, micro.microVoiceLedger')
 p.write_text(s,encoding='utf-8')
for name in ['run_macro_faculty_closure_validation.js','run_macro_faculty_voice_validation.js','run_macro_faculty_voice_pass2_validation.js','run_micro_faculty_voice_validation.js']:
 p=T/name;s=p.read_text(encoding='utf-8').replace("postLive=h.loadComposerLibrary();post.assertCurrentLibrary(postLive);","newest=require('./micro-voice3-revisions.js'),newestLive=h.loadComposerLibrary();newest.assertCurrentLibrary(newestLive);const postLive=newest.beforeMicroVoice3Library(newestLive);post.assertCurrentLibrary(postLive);")
 p.write_text(s,encoding='utf-8')
p=T/'run_macro_faculty_voice_pass3_validation.js';s=p.read_text(encoding='utf-8').replace('const lib=h.loadComposerLibrary();approved.assertCurrentLibrary(lib);',"const newest=require('./micro-voice3-revisions.js'),newestLive=h.loadComposerLibrary();newest.assertCurrentLibrary(newestLive);const lib=newest.beforeMicroVoice3Library(newestLive);approved.assertCurrentLibrary(lib);")
s=s.replace("registry:JSON.parse(fs.readFileSync(path.join(root,'build/faculty-build-composer/data/composer_registry.json'),'utf8')),manifest:JSON.parse(fs.readFileSync(path.join(root,'build/faculty-build-composer/data/composer_library_manifest.json'),'utf8'))","registry:lib.registry,manifest:{...JSON.parse(fs.readFileSync(path.join(root,'build/faculty-build-composer/data/composer_library_manifest.json'),'utf8')),librarySha256:lib.librarySha256}")
p.write_text(s,encoding='utf-8')
p=T/'run_active_composer_suite.js';s=p.read_text(encoding='utf-8').replace("  'run_risk_reward_state_validation.js'","  'run_risk_reward_state_validation.js',\n  'run_macro_faculty_voice_validation.js',\n  'run_macro_faculty_voice_pass2_validation.js',\n  'run_macro_faculty_voice_pass3_validation.js',\n  'run_micro_faculty_voice_validation.js',\n  'run_micro_faculty_voice_pass3_validation.js'")
p.write_text(s,encoding='utf-8')
s=(D.parent/'macro_voice3_20261007/verify_publication.cjs').read_text(encoding='utf-8').replace('macro-voice3-revisions.js','micro-voice3-revisions.js').replace('beforeVoice3Library','beforeMicroVoice3Library').replace('macroVoice3Ledger','microVoice3Ledger').replace("if(a!=='macro')assert.deepEqual(published,prior","if(a!=='micro')assert.deepEqual(published,prior")
(D/'verify_publication.cjs').write_text(s,encoding='utf-8')
s=(D.parent/'macro_voice3_20261007/run-tests.cjs').read_text(encoding='utf-8');start=s.index('const prior=');end=s.index('const results=',start)
s=s[:start]+"const text=fs.readFileSync(path.join(dir,'run_active_composer_suite.js'),'utf8');\nconst names=require('vm').runInNewContext(text.match(/const ACTIVE_RUNNERS = (\\[[\\s\\S]*?\\]);/)[1]);\n"+s[end:]
(D/'run-tests.cjs').write_text(s,encoding='utf-8')
