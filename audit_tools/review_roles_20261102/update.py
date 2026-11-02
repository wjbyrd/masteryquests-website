"""Expose the bank's existing instructional roles in the offline review tool."""
from pathlib import Path
from collections import Counter
import copy,hashlib,json,shutil,subprocess,sys
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1]
PROJECT=Path('C:/Users/Jennings/Documents/Mastery Quests Website/Conference_Presentation')
SOURCE=PROJECT/'source';source=SOURCE/'personal-review-list-data.json';html_path=PROJECT/'deliverables/MasteryQuests_Question_Review.html'
source_bytes=source.read_bytes();data=json.loads(source_bytes.decode('utf-8-sig'))
def payload(p):return json.loads(p.read_text(encoding='utf8').split('<script id="data" type="application/json">',1)[1].split('</script>',1)[0])
old_payload=payload(html_path)
template=SOURCE/'review-template.html';builder=SOURCE/'build-review-html.py'
template_bytes=template.read_bytes();builder_bytes=builder.read_bytes()
t=template_bytes.decode('utf8').replace('\r\n','\n');b=builder_bytes.decode('utf8').replace('\r\n','\n')
def replace(old,new):
    global t
    assert t.count(old)==1,old
    t=t.replace(old,new)
role_function='''def review_role(q):
    role=q.get('instructionalRole','unknown')
    if role in ['repair','repairSeed','bridge']:return role
    if role in ['boss','legendaryBoss']:return 'checkpoint'
    if role in ['main','calculation','integration','easy','medium','hard','elite','legendary']:return 'main'
    return 'unknown'

'''
assert b.count("tiers=dict(zip(")==1 and b.count("stem=q['q']")==1
b=b.replace('tiers=dict(zip(',role_function+'tiers=dict(zip(').replace("stem=q['q']","role=review_role(q),stem=q['q']")
replace('.filters{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}', '.filters{display:grid;grid-template-columns:repeat(3,1fr);gap:12px}.filters>label:first-child{grid-column:1/-1}')
replace('<label class="filter">Review status', '<label class="filter">Question role<select id="role"><option value="">All roles</option></select></label>\n<label class="filter">Review status')
replace('<button id="continueMedium" class="primary">Continue Medium review</button>', '<button id="continueMedium" class="primary">Continue Medium review</button><button id="reviewSupport">Review support questions</button>')
replace('Category counts reflect your other filters.', 'Question role identifies Repair, Bridge, and Repair seed items. Use Review support questions to open unmarked items with unspecified difficulty. Category counts reflect your other filters.')
replace("const flagReasons=", "const roleLabels={main:'Main question',checkpoint:'Boss/checkpoint',repair:'Repair',bridge:'Bridge',repairSeed:'Repair seed',unknown:'Role not specified'};\nconst flagReasons=")
replace("for(const topic of topics)$('topic').add(new Option(topic,topic));", "for(const role of Object.keys(roleLabels))if(Q.some(q=>q.role===role))$('role').add(new Option(roleLabels[role],role));\nfor(const topic of topics)$('topic').add(new Option(topic,topic));")
replace("&&(skip==='difficulty'||!$('difficulty').value||q.difficulty===$('difficulty').value)", "&&(skip==='difficulty'||!$('difficulty').value||q.difficulty===$('difficulty').value)&&(skip==='role'||!$('role').value||q.role===$('role').value)")
replace("for(const dimension of ['topic','difficulty'])", "for(const dimension of ['topic','difficulty','role'])")
replace("const label=option.value?(dimension==='difficulty'&&option.value==='unknown'?'Unspecified':option.value):(dimension==='topic'?'All topics':'All difficulties');", "const label=option.value?(dimension==='role'?roleLabels[option.value]:dimension==='difficulty'&&option.value==='unknown'?'Unspecified':option.value):({topic:'All topics',difficulty:'All difficulties',role:'All roles'}[dimension]);")
replace('<span class="badge">${esc(q.topic)}</span>', '<span class="badge">${esc(q.topic)}</span><span class="badge question-role">${esc(roleLabels[q.role]||q.role)}</span>')
replace("for(const id of ['course','topic','difficulty','status','size'])", "for(const id of ['course','topic','difficulty','role','status','size'])")
replace("'Current difficulty','Previous difficulty']", "'Current difficulty','Previous difficulty','Question role']")
replace("q.difficulty,q.previous?.difficulty||'']", "q.difficulty,q.previous?.difficulty||'',roleLabels[q.role]||q.role]")
replace("function difficultyQueue(difficulty,status){$('search').value='';$('course').value='';$('topic').value='';", "function difficultyQueue(difficulty,status){$('search').value='';$('course').value='';$('topic').value='';$('role').value='';")
replace("for(const id of ['search','course','topic','difficulty'])", "for(const id of ['search','course','topic','difficulty','role'])")
replace("for(const id of ['search','course','topic','difficulty','status'])", "for(const id of ['search','course','topic','difficulty','role','status'])")
replace("$('continueMedium').onclick=()=>difficultyQueue('medium','unknown');", "$('continueMedium').onclick=()=>difficultyQueue('medium','unknown');\n$('reviewSupport').onclick=()=>difficultyQueue('unknown','unknown');")
baseline=HERE/'baseline';baseline.mkdir(exist_ok=True)
for p in [template,builder]:
    assert not (baseline/p.name).exists(),'Baseline already captured'
    shutil.copy2(p,baseline/p.name)
assert source.read_bytes()==source_bytes and template.read_bytes()==template_bytes and builder.read_bytes()==builder_bytes,'Concurrent source edit'
template.write_text(t,encoding='utf8');builder.write_text(b,encoding='utf8')
(HERE/template.name).write_text(t,encoding='utf8');(HERE/builder.name).write_text(b,encoding='utf8')
subprocess.run([sys.executable,str(builder)],check=True)
assert source.read_bytes()==source_bytes,'Review data must remain byte-for-byte unchanged'
new_payload=payload(html_path);compare=copy.deepcopy(new_payload)
for q in compare['questions']:del q['role']
assert compare==old_payload,'Only presentation role added to embedded question data'
unspecified=[q for q in new_payload['questions'] if q['difficulty']=='unknown']
counts=Counter(q['role'] for q in unspecified);assert counts=={'repair':416,'bridge':279,'repairSeed':8}
report={'status':'PASS','questions':len(new_payload['questions']),'unspecifiedRoleCounts':dict(counts),'unmarkedUnspecifiedRoleCounts':dict(Counter(q['role'] for q in unspecified if data['reviewSeed'][q['id']]['status']=='unknown')),'defaultDifficulty':'medium','defaultStatus':'unknown','allExistingEmbeddedDataPreserved':True,'sourceDataUnchanged':True,'reviewDataSha256':hashlib.sha256(source_bytes).hexdigest(),'reviewHtmlSha256':hashlib.sha256(html_path.read_bytes()).hexdigest()}
(HERE/'validation.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf8');print(json.dumps(report))
