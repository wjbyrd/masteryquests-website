import pathlib,json
D=pathlib.Path(__file__).resolve().parent;R=D.parents[1]
s=(D.parent/'macro_voice3_20261007/verify_exports.py').read_text(encoding='utf-8').replace("area!='macro'","area!='micro'").replace("tables['macro']","tables['micro']").replace("['disciplines']['macro']","['disciplines']['micro']")
start=s.index('sample=');end=s.index("(D/'pdf-review')",start)
s=s[:start]+"sample=['42705','P62C-CPS-H-019','P62C-CPS-L-074','42576','42379','42335','P62C-CPS-LB-024','43058','P62F-PC-LB-005','P62G-MON-EL-019','PM8-OLI-BR-052','42097']\n"+s[end:]
# Negative controls include exact output CSVs, not only source payloads.
s=s.replace("result={'status'", "for area in ['general','macro']:\n name=report['disciplines'][area]['csv_file'];assert (R/'faculty_exports'/name).read_bytes()==(D/'baseline'/name).read_bytes(),area+' CSV changed'\nresult={'generalMacroCsvByteIdentical':True,'status'")
(D/'verify_exports.py').write_text(s,encoding='utf-8')
ledger=json.loads((D/'expectations.json').read_text());manifest=json.loads((D/'manifest.json').read_text());m={c['id']:c for c in manifest['candidates']}
headers=['Question ID','Prior PDF page','Topic','Identified patterns','Original stem','Final stem','Original alternatives','Final alternatives','Original correct answer','Final correct answer','Correct option index preserved','Feedback changed','Difficulty before','Difficulty after','Structural role preserved','Graph association preserved','Course-area membership','Action','Rationale','Validation result','Original feedback','Final feedback']
matrix=[headers]
for c in ledger['changes']:
 b=c['beforeRecord'];a=c['afterRecord'];id=c['id'];i=c['correctIndex']
 alternatives=lambda q:'\n'.join(f'{letter}. {text}' for letter,text in zip('ABCD',q['options']))
 matrix.append([id,m[id]['page'],b['primaryConceptId'],'; '.join(c['patterns']),b['q'],a['q'],alternatives(b),alternatives(a),'ABCD'[i]+'. '+b['options'][i],'ABCD'[i]+'. '+a['options'][i],f'YES ({"ABCD"[i]}; zero-based {i})','YES' if b['feedback']!=a['feedback'] else 'NO',b['canonicalDifficulty'],a['canonicalDifficulty'],'YES — '+b['instructionalRole'],'YES' if b.get('image') else 'YES — no graph','Micro','EDITED',c['rationale']+(' Faculty wording override applied.' if c['facultyOverride'] else ''),'PASS',b['feedback'],a['feedback']])
assert len(matrix)==95 and all(len(r)==22 for r in matrix)
(D/'audit-rows.json').write_text(json.dumps(matrix,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
s=(D.parent/'macro_voice3_20261007/build_csv.mjs').read_text(encoding='utf-8').replace('A1:P','A1:V').replace('A2:P','A2:V').replace("'E:P'","'E:V'").replace('macro_faculty_voice_cleanup_pass3_20261007.csv','micro_faculty_voice_pass3_remediation_20261007.csv')
# Required full topic labels need room in the verification preview.
s=s.replace("sheet.getRange('C:D').format.columnWidth=34;","sheet.getRange('C:C').format.columnWidth=46;sheet.getRange('D:D').format.columnWidth=40;")
(D/'build_csv.mjs').write_text(s,encoding='utf-8')
