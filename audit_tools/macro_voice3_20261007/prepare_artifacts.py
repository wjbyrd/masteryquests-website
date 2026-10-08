import pathlib
D=pathlib.Path(__file__).resolve().parent;P=D.parent/'micro_voice_20261007'
s=(P/'build_csv.mjs').read_text(encoding='utf-8').replace('A1:U','A1:P').replace('A2:U','A2:P').replace("'K:U'","'E:P'").replace('micro_faculty_voice_remediation_20261007.csv','macro_faculty_voice_cleanup_pass3_20261007.csv')
(D/'build_csv.mjs').write_text(s,encoding='utf-8')
s=(P/'verify_exports.py').read_text(encoding='utf-8').replace("area!='micro'","area!='macro'").replace("tables['micro']","tables['macro']").replace("['disciplines']['micro']","['disciplines']['macro']")
start=s.index('sample=');end=s.index("(D/'pdf-review')",start)
s=s[:start]+"sample=['LG-Q-4004','P52B-S1-LRPC-L-002','43196','43313','PG3-MEQ-M-002','PG3-MEQ-H-001','PMOE-FX-LB-003','PG4-MM-M-009','LG-Q-9139','43170','43286','PMOE-FX-M-002']\n"+s[end:]
(D/'verify_exports.py').write_text(s,encoding='utf-8')
