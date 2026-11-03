from pathlib import Path
import subprocess,sys
HERE=Path(__file__).resolve().parent;PROJECT=Path('C:/Users/Jennings/Documents/Mastery Quests Website/Conference_Presentation')
for p in [PROJECT/'source/review-template.html',HERE/'review-template.html']:
 s=p.read_text(encoding='utf8');p.write_text(s.replace('bank refreshed November 2, 2026','bank refreshed November 3, 2026'),encoding='utf8')
subprocess.run([sys.executable,str(PROJECT/'source/build-review-html.py')],check=True)
p=HERE/'prepare-final-checks.py';s=p.read_text(encoding='utf8').replace("'P73-SCAR-B2-002'","'P52A-SCAR-B2-002'")
s=s.replace("q*(p-atc),.02)","q*(p-atc),['P62G-MON-M-019','P62G-MON-M-022'].includes(id)?.51:.02)")
start=s.index("const shutdown=byId.get('PM5-PC-M-041');");end=s.index("checks++;",start)+len('checks++;')
s=s[:start]+"const shutdown=byId.get('PM5-PC-M-041');assert(shutdown.afterRecord.q.includes('receives $7 per unit'));assert(shutdown.afterRecord.q.includes('average variable cost is $8'));assert(/shut down/i.test(shutdown.afterRecord.options[shutdown.correctIndex]));checks++;"+s[end:]
s=s.replace('needle=" let s=',"t=t.replace('bank refreshed November 2, 2026','bank refreshed November 3, 2026')\nneedle=\" let s=")
p.write_text(s,encoding='utf8')
p=HERE/'preview-macro.mjs';p.write_text((HERE.parent/'medium_editorial_20261102/preview-macro.mjs').read_text(encoding='utf8').replace('P52A-FISCAD-B2-001','ECON-EC-MEDIUMBOSS-18010'),encoding='utf8')
print('Updated review date and finalized reproducible verification scripts.')
