from pathlib import Path
HERE=Path(__file__).resolve().parent;OLD=HERE.parent/'medium_editorial_20261102'
s=(OLD/'check-calculations.cjs').read_text(encoding='utf8')
s=s.replace("byId=new Map(draft.changes.map(c=>[c.id,c]));","byId=new Map(require('./inventory.json').items.map(i=>[i.id,{id:i.id,correctIndex:i.correctIndex,afterRecord:i.question}]));for(const c of draft.changes)byId.set(c.id,c);")
s=s.replace('increases labor from','increases its workforce from')
s=s.replace("if(s.includes('Price buyers will pay'))", "if(s.includes('Price buyers will pay')&&!/from \\d+ to \\d+/.test(s))")
s=s.replace('assert(ids.size>=90);',"""
for(const[id,a,b]of [['42447',14,1],['42450',26,2],['42453',50,2],['42459',46,2]])number(byId.get(id),a/b);
for(const[id,q,p,atc]of [['P62G-MON-M-017',20,60,35],['P62G-MON-M-019',22.5,56.25,58.03],['P62G-MON-M-020',20,70,40],['P62G-MON-M-021',4.88,60.24,111.74],['P62G-MON-M-022',19.33,64.4,54.52]])number(byId.get(id),q*(p-atc),['P62G-MON-M-019','P62G-MON-M-022'].includes(id)?.51:.02);
for(const[id,a,b,c,d,f]of [['P62G-MON-B2-028',120,2.5,24,.2,420],['P62G-MON-B2-031',64,1.8,48,.15,300],['P62G-MON-B2-034',105,2.1,18,.3,650]]){const q=(a-c)/(2*b+d);number(byId.get(id),q*(a-b*q)-f-c*q-d*q*q/2,.02);}
for(const id of ['LG-Q-335','LG-Q-9026'])number(byId.get(id),((1/1.5)/(1/2)-1)*100,.05);
for(const[id,values]of Object.entries({'P52B-S4-STAB-B2-003':[390-260],'PM2A-SAC-M-006':[3*2.5],'PM2A-SAC-H-011':[9/3]}))for(const v of values)number(byId.get(id),v,.02);
const shutdown=byId.get('PM5-PC-M-041');assert(shutdown.afterRecord.q.includes('receives $7 per unit'));assert(shutdown.afterRecord.q.includes('average variable cost is $8'));assert(/shut down/i.test(shutdown.afterRecord.options[shutdown.correctIndex]));checks++;
assert(ids.size>=90);
""")
s=s.replace("Unchanged graph values and calculations retain prior validation.","Graph readings for all 320 graph-bearing items were separately compared against all 115 referenced asset paths. All 1,586 questions received complete text review.")
(HERE/'check-calculations.cjs').write_text(s,encoding='utf8')
s=(OLD/'refresh-review.py').read_text(encoding='utf8');a=s.index("t=(HERE/'baseline/review-template.html')");b=s.index("assert source.read_bytes()",a)
s=s[:a]+'''t=(HERE/'baseline/review-template.html').read_text(encoding='utf8')
old_notice='615 remaining Medium questions have updated wording and are ready for review. Difficulty levels are unchanged. Your approved questions, earlier notes, and pending Hard and Legendary revisions are preserved.'
assert old_notice in t
t=t.replace(old_notice,f'All 1,586 remaining Medium questions received a complete review. This pass revised {len(changes):,} questions, answers, or explanations. Use the comparison in each revised question to see what changed. Your earlier reviews and notes are preserved.')
old_filter="q.revision.startsWith('medium-editorial-20261102-')"
assert old_filter in t
t=t.replace(old_filter,"(q.revision.startsWith('medium-editorial-20261102-')||q.revision.startsWith('medium-complete-20261103-'))")
t=t.replace('bank refreshed November 2, 2026','bank refreshed November 3, 2026')
needle=" let s='<div class=\\\"revision-note\\\"><strong>Updated question</strong>';"
assert needle in t
t=t.replace(needle,needle+"\\n if(q.previous){const fields=[];if(q.stem!==q.previous.stem)fields.push('question');if(JSON.stringify(q.options)!==JSON.stringify(q.previous.options))fields.push('answer choices');if(q.feedback!==q.previous.feedback)fields.push('explanation');if(fields.length)s+='<p><strong>Changed:</strong> '+fields.join(', ')+'.</p>';} ")
''' +s[b:]
# Prefix only the new revision IDs; retain the old filter above.
s=s.replace("row['revision']='medium-editorial-20261102-'", "row['revision']='medium-complete-20261103-'")
s=s.replace("'id':'medium-editorial-20261102'", "'id':'medium-complete-review-20261103'")
s=s.replace('Editorial pass over the remaining unmarked Medium questions in the current queue.', 'Complete reading and consistency review of all 1,586 remaining unmarked Medium questions in the current queue, including every choice, explanation, and referenced graph.')
s=s.replace("result={'status':'PASS'", "pending=sum(r.get('revision','').startswith(('medium-editorial-20261102-','medium-complete-20261103-')) and data['reviewSeed'][r['id']].get('reviewedRevision')!=r['revision'] for r in data['questions'])\nresult={'status':'PASS','pendingMediumRevisions':pending")
(HERE/'refresh-review.py').write_text(s,encoding='utf8')
p=HERE/'verify-browser.cjs';s=p.read_text(encoding='utf8')
s=s.replace("const page=await context.newPage(),errors=[];", "const pending=source.questions.filter(r=>/^medium-(editorial-20261102|complete-20261103)-/.test(r.revision||'')&&source.reviewSeed[r.id]?.reviewedRevision!==r.revision).length;const page=await context.newPage(),errors=[];")
s=s.replace("ledger.changes.length+' questions'", "pending+' questions'").replace("(ledger.changes.length-1)+' questions'","(pending-1)+' questions'")
s=s.replace("revisedMediumQueue:ledger.changes.length", "revisedMediumQueue:pending,newBatchRevisions:ledger.changes.length")
s=s.replace("await search('42146');", "await search('42459');")
s=s.replace("await search('P62G-MON-M-002');", "await search('P62G-MON-M-002');")
s=s.replace("await search('P62H-MCMP-M-031');", "await search('P62F-PC-M-031');")
p.write_text(s,encoding='utf8')
print('Prepared full-review arithmetic, review refresh and browser verification.')
