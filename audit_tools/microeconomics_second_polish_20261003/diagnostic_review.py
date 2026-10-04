"""Keep raw diagnostics visible and classify only the bounded reviewed population."""
import json,re,collections
from pathlib import Path
H=Path(__file__).resolve().parent
read=lambda n:json.loads((H/n).read_text(encoding='utf8'))
S=read('scope.json');O=read('originals.json');D=read('quality_diagnostics.json');P=read('patches.json');disp=read('duplicate_dispositions.json')
records={i:{**O[i],**P.get(i,{})} for i in set(S['set_A'])|set(S['graph_review_population'])}
exact=collections.defaultdict(list)
for i,q in records.items():exact[re.sub(r'\s+',' ',q['q'].strip().lower())].append(i)
exact=[sorted(ids) for ids in exact.values() if len(ids)>1]
near=[];seen=set()
for f in D['after']['findings']:
 if f['rule']!='near-duplicate-stem':continue
 a=f['questionId'];b=re.search(r'similar to ([^.]+)\.',f['message'])[1];pair=tuple(sorted([a,b]))
 if pair in seen:continue
 seen.add(pair)
 if set(pair)=={'42656','42660'} or set(pair)=={'42687','42697'}:
  status='documented exact-duplicate exception';reason='Retained duplicate, not claimed as a successful diversification.'
 elif set(pair)=={'P62C-CPS-L-002','P62C-CPS-L-007'}:
  status='substantive parallel task retained';reason='The two retained representatives still use the same fixed-quantity reallocation reasoning with different values. This cross-group numerical variant is not counted as deduplication; retain for instructor review rather than broaden the within-group redesign.'
 else:
  status='graph-family parallel task retained';reason='Same graph-family operation remains as parallel practice. The second pass changed only high-confidence answer architecture or cleanup-induced load; it did not authorize graph-family task deduplication. Different assets, tiers or distractors are not counted as proof of a different reasoning path.'
 near.append({'ids':list(pair),'classification':status,'reason':reason,'same_asset':records[a].get('image')==records[b].get('image'),'skills':[records[a]['primarySkill'],records[b]['primarySkill']],'tasks':[records[a]['q'],records[b]['q']]})
new=[];oldpairs={(f['questionId'],f['rule']) for f in D['before']['findings']}
for f in D['after']['findings']:
 if (f['questionId'],f['rule']) not in oldpairs:
  new.append({**f,'disposition':'Reviewed; no additional authorized change. A lexical flag is not itself evidence of construct, key or tier failure.'})
out={'review_population':len(records),'raw_before_counts':D['before']['counts'],'raw_after_counts':D['after']['counts'],'exact_diagnostic_flags':sum(f['rule']=='duplicate-stem' for f in D['after']['findings']),'exact_diagnostic_groups':[['42656','42660'],['42687','42697']],'all_literal_exact_stem_groups_including_graph_tasks':exact,'near_diagnostic_flags':sum(f['rule']=='near-duplicate-stem' for f in D['after']['findings']),'unique_near_pairs':len(near),'near_pair_dispositions':near,'new_rule_flags':new,'duplicate_group_review':[{'group':g['group'],'members':[{'id':i,**disp[i]} for i in g['ids']],'acceptance':'Revised members use different reasoning operations; retained exceptions are explicitly excluded from successful diversification.'} for g in S['duplicate_groups']]}
(H/'diagnostic_review.json').write_text(json.dumps(out,ensure_ascii=False,indent=2)+'\n',encoding='utf8')
print({k:out[k] for k in ['review_population','exact_diagnostic_flags','near_diagnostic_flags','unique_near_pairs']});print('Literal exact groups including graphs:',len(exact));print('New flags:',[(x['questionId'],x['rule']) for x in new])
