"""Extend exact accepted revision history, preserving historical assertions."""
import pathlib
D=pathlib.Path(__file__).resolve().parent;R=D.parents[1];T=R/'build/faculty-build-composer/tests'
def write(p,s):p.write_text(s,encoding='utf-8')
s=(D.parent/'macro_voice2_20261007/apply.cjs').read_text(encoding='utf-8')
s=s.replace('e97c497ec01857e1bed95bfb333fcfd2095da5fffde5003b4b26eae90ab12f94','0fbe5ff4beb0ab909c300d8b8cd6456d8c392b6fb52910be13ed42d8a9f4d66a')
s=s.replace("['PMOE-POL-L-003','ECON-SP-ELITE-320','ECON-NL-SUBSTITUTION-BIAS-6011']","['P52B-S1-LRPC-L-002']")
write(D/'apply.cjs',s)
s=(T/'macro-voice2-revisions.js').read_text(encoding='utf-8').replace("require('./macro-voice-revisions.js')","require('./micro-voice-revisions.js')").replace('macro_voice2_20261007','macro_voice3_20261007').replace('beforeVoice2Library','beforeVoice3Library').replace('macroVoice2Ledger','macroVoice3Ledger').replace('pass-2','pass-3')
s=s.replace("[['PMOE-POL-L-003',['legendary','hard']],['ECON-SP-ELITE-320',['elite','hard']],['ECON-NL-SUBSTITUTION-BIAS-6011',['medium','hard']]]","[['P52B-S1-LRPC-L-002',['legendary','hard']]]")
s=s.replace("c.id==='ECON-NL-SUBSTITUTION-BIAS-6011'?'bridge':'hard'","'hard'").replace("['ECON-SP-ELITE-320','PMOE-POL-L-003']","['P52B-S1-LRPC-L-002']")
write(T/'macro-voice3-revisions.js',s)
for name in ['composer-audit-contracts.js','run_content_scope_validation.js','run_fading_fortune_validation.js','run_macro_phase2_taxonomy_validation.mjs','run_phase3e_graph_question_sync_validation.mjs','run_question_bank_comprehensive_validation.mjs','run_risk_reward_validation.js','run_trial_by_graph_validation.js']:
 p=T/name;s=p.read_text(encoding='utf-8').replace("require('./micro-voice-revisions.js')","require('./macro-voice3-revisions.js')")
 if name=='run_phase3e_graph_question_sync_validation.mjs':s=s.replace('micro.microVoiceLedger','micro.macroVoice3Ledger, micro.microVoiceLedger')
 write(p,s)
for name in ['run_macro_faculty_closure_validation.js','run_macro_faculty_voice_pass2_validation.js','run_macro_faculty_voice_validation.js']:
 p=T/name;s=p.read_text(encoding='utf-8');s=s.replace('live=h.loadComposerLibrary();latest.assertCurrentLibrary(live);',"post=require('./macro-voice3-revisions.js'),postLive=h.loadComposerLibrary();post.assertCurrentLibrary(postLive);const live=post.beforeVoice3Library(postLive);latest.assertCurrentLibrary(live);")
 write(p,s)
p=T/'run_micro_faculty_voice_validation.js';s=p.read_text(encoding='utf-8').replace('const lib=h.loadComposerLibrary();approved.assertCurrentLibrary(lib);',"const post=require('./macro-voice3-revisions.js'),postLive=h.loadComposerLibrary();post.assertCurrentLibrary(postLive);const lib=post.beforeVoice3Library(postLive);approved.assertCurrentLibrary(lib);")
# Its historical integrity assertion must use the matching registry/manifest.
s=s.replace("registry:JSON.parse(fs.readFileSync(path.join(root,'build/faculty-build-composer/data/composer_registry.json'),'utf8')),manifest:JSON.parse(fs.readFileSync(path.join(root,'build/faculty-build-composer/data/composer_library_manifest.json'),'utf8'))","registry:lib.registry,manifest:{...JSON.parse(fs.readFileSync(path.join(root,'build/faculty-build-composer/data/composer_library_manifest.json'),'utf8')),librarySha256:lib.librarySha256}")
write(p,s)
s=(D.parent/'micro_voice_20261007/run-tests.cjs').read_text(encoding='utf-8').replace("'run_micro_faculty_voice_validation.js']","'run_micro_faculty_voice_validation.js','run_macro_faculty_voice_pass3_validation.js']")
write(D/'run-tests.cjs',s)
s=(D.parent/'micro_voice_20261007/verify_publication.cjs').read_text(encoding='utf-8').replace('micro-voice-revisions.js','macro-voice3-revisions.js').replace('beforeMicroVoiceLibrary','beforeVoice3Library').replace('microVoiceLedger','macroVoice3Ledger').replace("if(a!=='micro')assert.deepEqual(published,prior","if(a!=='macro')assert.deepEqual(published,prior")
write(D/'verify_publication.cjs',s)
