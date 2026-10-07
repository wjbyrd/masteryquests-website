from pathlib import Path
H=Path(__file__).resolve().parent;R=H.parent.parent;T=R/'build/faculty-build-composer/tests'
s=(R/'audit_tools/macro_faculty_closure_20261006/apply.cjs').read_text(encoding='utf-8')
s=s.replace("'scope.json'","'records.json'").replace('b38b4010a1cfacf0224c973f22174ab266f2b4c992642e9a55df30df59335a20','e97c497ec01857e1bed95bfb333fcfd2095da5fffde5003b4b26eae90ab12f94')
s=s.replace("row.areas.every(a=>a==='macro')||['P77-MVM-L-020','P76-MODL-EL-003'].includes(row.id)","row.areas.every(a=>a==='macro')")
s=s.replace("['category','rationale','economicsRationale','operation','authority']","['patterns','rationales']")
s=s.replace("['q','options','feedback','difficulty','canonicalDifficulty','type','commonError','tag','primarySkill','repairSkill','objective','checkpointPool']","['q','options','feedback','difficulty','canonicalDifficulty']")
s=s.replace("q[f]=clone(v);","if(['difficulty','canonicalDifficulty'].includes(f))assert(['PMOE-POL-L-003','ECON-SP-ELITE-320','ECON-NL-SUBSTITUTION-BIAS-6011'].includes(id));q[f]=clone(v);")
s=s.replace("rationale:p.rationale,economicsRationale:p.economicsRationale,category:p.operation||'Faculty adjudication',authority:p.authority,areas:row.areas,provenance:row.provenance,marketGateDerived:row.marketGateDerived","rationale:p.rationales.join(' '),patterns:p.patterns,areas:row.areas,marketGateDerived:row.marketGateDerived")
# Skill membership must remain identical; this pass changes only difficulty coverage.
s=s.replace("for(const o of record.outcomes)o.skillIds=o.skillIds.filter(s=>validSkills.has(s));","for(const o of record.outcomes)assert(o.skillIds.every(s=>validSkills.has(s)),'Preserved skills');")
(H/'apply.cjs').write_text(s,encoding='utf-8')
s=(R/'audit_tools/macro_voice_20261006/run-tests.cjs').read_text(encoding='utf-8').replace("'run_macro_faculty_voice_validation.js'];","'run_macro_faculty_voice_validation.js','run_macro_faculty_voice_pass2_validation.js'];")
(H/'run-tests.cjs').write_text(s,encoding='utf-8')
s=(R/'audit_tools/macro_faculty_closure_20261006/verify_publication.cjs').read_text(encoding='utf-8').replace('macro-closure-revisions.js','macro-voice2-revisions.js')
# No course-area membership changes or General edits in this pass.
s=s.replace("new Set(['P77-MVM-L-020','P76-MODL-EL-003'])","new Set()")
(H/'verify_publication.cjs').write_text(s,encoding='utf-8')
# Old exact baselines remain independently checked after restoring only the new ledger.
for p in T.glob('*'):
 if p.suffix not in ['.js','.mjs']:continue
 s=p.read_text(encoding='utf-8')
 if p.name=='run_macro_faculty_closure_validation.js':
  s=s.replace("const voice=require('./macro-voice-revisions.js'),current=h.loadComposerLibrary();voice.assertCurrentLibrary(current);","const voice=require('./macro-voice-revisions.js'),pass2=require('./macro-voice2-revisions.js'),actual=h.loadComposerLibrary();pass2.assertCurrentLibrary(actual);\nconst current=pass2.beforeVoice2Library(actual);voice.assertCurrentLibrary(current);")
 elif p.name=='run_macro_faculty_voice_validation.js':
  s=s.replace("const lib=h.loadComposerLibrary();approved.assertCurrentLibrary(lib);","const pass2=require('./macro-voice2-revisions.js'),actual=h.loadComposerLibrary();pass2.assertCurrentLibrary(actual);\nconst lib=pass2.beforeVoice2Library(actual);approved.assertCurrentLibrary(lib);")
 elif p.name!='macro-voice-revisions.js' and p.name!='macro-voice2-revisions.js':
  s=s.replace("require('./macro-voice-revisions.js')","require('./macro-voice2-revisions.js')")
  if p.name=='run_phase3e_graph_question_sync_validation.mjs':s=s.replace('micro.macroVoiceLedger]','micro.macroVoiceLedger, micro.macroVoice2Ledger]')
 if s!=p.read_text(encoding='utf-8'):p.write_text(s,encoding='utf-8')
print('Prepared apply, publication, suite runner and historical test chain')
