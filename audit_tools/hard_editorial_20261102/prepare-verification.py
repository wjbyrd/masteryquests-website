from pathlib import Path
import json
HERE=Path(__file__).resolve().parent; OLD=HERE.parent/'legendary_editorial_20261102'; ROOT=HERE.parents[1]
for name in ['validate.cjs','verify-browser.cjs','verify-exports.py','verify-workbook-scope.py','preserve-sheet-visibility.py']:
    s=(OLD/name).read_text(encoding='utf8').replace('Legendary','Hard').replace('legendary','hard')
    if name=='validate.cjs':
        s=s.replace('1360','2159')
        start=s.index("const audit=require(");end=s.index('const result=',start)
        s=s[:start]+"const screen=require('./screening.json'),dispositions=new Set(ledger.decisions.map(d=>d.id));assert(screen.items.every(x=>dispositions.has(x.id)));\n"+s[end:]
    if name=='verify-browser.cjs':
        s=s.replace('P62C-CPS-LB-003','P62C-CPS-H-001').replace('P62G-MON-L-091','P62G-MON-H-002').replace('P72-OPPC-L-020','P52A-OPPC-B3-001')
        s=s.replace("assert.match(await page.locator('.revision-note').innerText(),/values \\[/);","assert(await page.locator('.revision-note').innerText());")
        s=s.replace("await page.locator('#continueMedium').click();", "await page.locator('#reviewLegendaryRevisions').click();assert.equal(await page.locator('#difficulty').inputValue(),'legendary');assert.equal(await page.locator('#status').inputValue(),'legendaryPending');await page.locator('#continueMedium').click();")
    if name=='verify-exports.py':
        s=s.replace("re.sub('<[^>]+>', '', str(s))", "re.sub(r'</?(?:table|caption|thead|tbody|tr|th|td|b|strong|em|i|span|br)\\b[^>]*>', '', str(s))")
        start=s.index('samples = {');end=s.index('\nresult =',start)
        s=s[:start]+"samples = {'general':['P52A-OPPC-B3-001','P52A-MARG-H-003'], 'micro':['P62E-COP-H-003','P62C-CPS-H-001','P62G-MON-H-002','P62I-OLI-C-026'], 'macro':['LG-Q-9073','P52B-S1-LRPC-L-002','P52B-S3-MPT-B3-001']}\n"+s[end:]
        s=s.replace('len(covered) == 647','len(covered) == len(ledger[\'changes\'])')
    (HERE/name).write_text(s,encoding='utf8')
test=ROOT/'build/faculty-build-composer/tests'
adapter=(test/'legendary-editorial-revisions.js').read_text(encoding='utf8').replace(" current=require('./hard-editorial-revisions.js').beforeHardEditorial(current);\n",'').replace('Legendary','Hard').replace('legendary','hard')
(test/'hard-editorial-revisions.js').write_text(adapter,encoding='utf8')
s=(test/'legendary-editorial-revisions.js').read_text(encoding='utf8')
needle=" current=require('./hard-editorial-revisions.js').beforeHardEditorial(current);"
if needle not in s:s=s.replace('function beforeLegendaryEditorial(current){','function beforeLegendaryEditorial(current){\n'+needle)
(test/'legendary-editorial-revisions.js').write_text(s,encoding='utf8')
s=(test/'faculty-validation-revisions.js').read_text(encoding='utf8')
line="module.exports=require('./hard-editorial-revisions.js').wrap(module.exports);"
if line not in s:s+='\n'+line+'\n'
(test/'faculty-validation-revisions.js').write_text(s,encoding='utf8')
# Preserve the proven data-import portion, changing only this revision's identity.
s=(OLD/'refresh-review.py').read_text(encoding='utf8')
s=s[:s.index("t=(HERE/'baseline/review-template.html')")].replace('Legendary','Hard').replace('legendary','hard')
s=s.replace("data['currentRevisionBatch']={'id'", "data['currentRevisionBatch']={'id'")
s+='''t=(HERE/'baseline/review-template.html').read_text(encoding='utf8')
def replace(a,b):
    global t
    assert t.count(a)==1,a
    t=t.replace(a,b)
replace('647 Legendary questions have updated wording and are ready for your final review. Difficulty levels are unchanged. Your earlier reviews, answers, notes, and accepted Bridge batch are preserved.',f"{len(changes):,} Hard questions have updated wording and are ready for review. Difficulty levels are unchanged. Your Legendary revisions and earlier reviews, answers, and notes are preserved.")
t=t.replace('7,360',f"{len(data['questions']):,}")
replace('<option value="legendaryPending">','<option value="hardPending">Hard revisions — not yet reviewed</option><option value="legendaryPending">')
replace('<button id="reviewLegendaryRevisions" class="primary">','<button id="reviewHardRevisions" class="primary">Review Hard revisions</button><button id="reviewHard">All Hard questions</button><button id="reviewLegendaryRevisions">')
replace('Review Legendary revisions opens the updated versions awaiting your review, including revised questions returned from earlier exclusions.', 'Review Hard revisions opens the updated Hard questions awaiting your review. Review Legendary revisions still opens your pending Legendary revisions. Both include revised questions returned from earlier exclusions.')
replace('The original queue and prior Bridge additions are preserved, with 141 revised Legendary questions returned for verification.',f'The original queue and prior Bridge and Legendary additions are preserved, with {len(added)} revised Hard questions returned for verification.')
replace("$('status').value==='legendaryPending'?","$('status').value==='hardPending'?(q.revision.startsWith('hard-20261102-')&&state[q.id]?.reviewedRevision!==q.revision):$('status').value==='legendaryPending'?")
replace("$('reviewLegendaryRevisions').onclick=", "$('reviewHardRevisions').onclick=()=>difficultyQueue('hard','hardPending');\\n$('reviewHard').onclick=()=>difficultyQueue('hard','');\\n$('reviewLegendaryRevisions').onclick=")
replace("difficultyQueue('legendary','legendaryPending');\\n}\\n</script>","difficultyQueue('hard','hardPending');\\n}\\n</script>")
assert source.read_bytes()==raw,'Concurrent review update'
assert raw==(HERE/'baseline/personal-review-list-data.json').read_bytes(),'Review source changed since baseline; reconcile before writing'
source.write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\\n',encoding='utf8');(PROJECT/'source/review-template.html').write_text(t,encoding='utf8');(HERE/'review-template.html').write_text(t,encoding='utf8');(HERE/'build-review-html.py').write_bytes((PROJECT/'source/build-review-html.py').read_bytes())
subprocess.run([sys.executable,str(PROJECT/'source/build-review-html.py')],check=True)
result={'status':'PASS','reviewQuestions':len(data['questions']),'hardQuestionsInQueue':sum(r['q'].get('canonicalDifficulty')=='hard' for r in data['questions']),'revisedQuestions':len(changes),'addedRevisedQuestions':len(added),'newVersionsAccepted':0,'statusCounts':dict(Counter(r['status'] for r in data['reviewSeed'].values())),'preservedReviewRecords':len(original['reviewSeed']),'allPriorRecordsPreserved':True,'batchApprovalsPreserved':data.get('batchApprovals')==original.get('batchApprovals'),'librarySha256':data['librarySha256']}
(HERE/'review-import.json').write_text(json.dumps(result,indent=2)+'\\n',encoding='utf8');print(json.dumps(result))
'''
(HERE/'refresh-review.py').write_text(s,encoding='utf8')
print('Prepared Hard validation, review refresh, export verification and regression adapters.')
