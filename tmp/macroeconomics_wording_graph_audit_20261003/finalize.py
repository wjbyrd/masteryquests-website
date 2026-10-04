import json, re, hashlib, collections, importlib.util, sys
from pathlib import Path

root = Path.cwd()
p = root / 'tmp/macroeconomics_wording_graph_audit_20261003'
n = json.loads((p/'review_notes.json').read_text(encoding='utf8'))
r = json.loads((p/'records.json').read_text(encoding='utf8'))
shared = set(json.loads((p/'shared.json').read_text(encoding='utf8')))
families = json.loads((p/'families.json').read_text(encoding='utf8'))
images = json.loads((p/'images.json').read_text(encoding='utf8'))
family = {i:f['ids'] for f in families for i in f['ids']}
asset = {i:a for a in images for i in a['ids']}
g = n['graph_decisions']; advanced = n['advanced_candidates']
for i in ['PG5-PC-X-011','ECON-SP-EASY-68','43307','LG-Q-9029']:
    g.pop(i, None)
for i in ['ECON-NL-ELITE-310','ECON-NL-LEGENDARY-9008','ECON-NL-LEGENDARY-9021','ECON-NL-LEGENDARY-9016','P52B-S4-IEA-EL-002','P52A-AD-L-004','P52A-AD-L-006','P52A-AD-EL-003','ECON-SP-ELITE-339','LG-Q-9117','LG-Q-9035']:
    advanced.pop(i, None)
for i, direction, evidence in [
    ('ECON-SP-LEGENDARY-9038','increase','Y1/P1 to Y1/P3'),
    ('ECON-SP-LEGENDARY-9039','decrease','Y1/P3 to Y1/P1'),
    ('ECON-SP-LEGENDARY-9002','increase','Initial Y1/P1, adverse-supply equilibrium Y3/P2, policy endpoint Y1/P3')]:
    g[i] = dict(classification='Graph-choice shortcut',
        why=f'Only the key respects the necessary price-level {direction} from the stated pair of shifts. The other three alternatives hold the price level fixed, reverse its required direction, or deny the ability of AD to offset an output loss. The actual net output effect need not be inspected.',
        evidence=evidence,
        repair=f'Keep joint-shock reasoning and the opposing effects on output. Make at least two alternatives agree on the price-level {direction}, but differ in the plotted net output result and its interpretation. Ask why that particular output result occurs, without implying that it holds for every pair of shifts.')

g['PMOE-FX-M-006']['repair'] = ('The present unmarked, unnumbered D0/S0 asset supplies no independent datum that distinguishes four equilibrium-definition answers. Do not force a color-lookup task or invent coordinates. A substantive future repair would compare labeled candidate exchange rates, require reading quantities demanded and supplied, and identify which rate clears the dollar market and why pressure at a rival rate moves toward equilibrium. That design needs separately scoped reference markers; it cannot honestly be certified as a text-only repair with this asset. Hold this item out of an asset-preserving cleanup until that scope decision is made.')
g['PMOE-FX-M-006']['asset_constraint'] = 'Existing asset has no candidate points, ticks or marked comparison rates. Text-only repair feasibility is unresolved; no asset change is authorized by this audit.'
g['ECON-SP-HARD-228']['repair'] = ('Preserve the supplied numerical assumptions and the distinction between direct stimulus, its multiplied effect and an already-total crowding-out offset. Ask which plotted AD destination represents the derived net effect, with two choices sharing the correct net calculation but assigning it to different displayed curves, and another using the correct curve with double-counting. Do not remove numerical data that the symbolic figure cannot supply; remove any stem disclosure of the curve-to-output association that should be read.')

specific = {
 'LG-Q-9053': ('Reverse inference from a total AD loss to autonomous investment and the rate-to-investment transmission chain.', 'Keep the total AD loss and MPC. Infer the autonomous investment change, then select the labeled money-market and AD transition that produces it. Include two answers with the correct inferred investment amount but different graph paths, and one with the correct path but total spending mistaken for the initial impulse.'),
 'LG-Q-9055': ('Opposing autonomous investment impulses and their net multiplied AD effect.', 'Retain both investment impulses and MPC. Require the graph to identify which labeled policy path produces the rate-induced impulse, alongside the net AD result. Two alternatives should compute the same valid net result but assign it to different paths; another should use the correct path but omit induced spending.'),
 'LG-Q-9056': ('Different investment sensitivity despite the same interest-rate change.', 'Keep the two investment responses and common MPC. Require matching the shared rate change to its plotted start/end labels, then explain why equal rate movements generate unequal AD effects. Use two correct sensitivity explanations with different graph paths and a correct path paired with an incorrect equal-transmission claim.'),
 'LG-Q-9059': ('Policy timing: immediate fiscal offset versus delayed stimulus after monetary restraint ends.', 'Require the displayed monetary path and its reverse recovery path before judging which fiscal timing stabilizes demand. Preserve the already-total fiscal amount and multiplier treatment. Give two economically coherent timing comparisons different labeled monetary paths; include a correct path with the total fiscal effect multiplied twice.'),
 'LG-Q-9064': ('Calibrating the interest-rate change needed for a target AD contraction.', 'Retain target, MPC and investment sensitivity. Derive the required rate change and identify the displayed money-supply/rate path that could implement it. Offer the correct magnitude on two different labeled directions and a correct direction with an erroneous multiplier inversion. The symbolic graph supplies direction and labels, not an invented numeric rate scale.'),
 'LG-Q-9072': ('Opposing money-demand and money-supply shifts and limits on predicting their combined transmission.', 'Remove the disclosed graph direction. Require identifying the displayed supply-only rate/AD path, then evaluate how the additional unmeasured money-demand decline changes what can be predicted. Two alternatives should correctly state the combined ambiguity but differ in the displayed baseline path.'),
 'LG-Q-9131': ('Netting monetary and confidence investment changes before applying the multiplier, including exact offset.', 'Preserve both investment amounts, MPC and exclusions. Require matching the monetary impulse to its labeled graph path as well as calculating the net effect and the independent recovery needed for cancellation. Two answers can agree on the calculation but differ in the graph path; another can use the correct path but double-count the recovery.'),
 'LG-Q-9132': ('Calibrating a rate increase from an AD target using investment sensitivity and the spending multiplier.', 'Keep the numerical target and behavioral assumptions. Combine the required rate change with the money-supply and AD paths actually displayed. Use two equal-magnitude rate changes assigned to competing labeled paths and a correct path with a mistaken multiplier calculation; do not pretend the symbolic figure gives numerical interest rates.')
}
for i,(construct,repair) in specific.items():
    g[i]['construct'] = construct; g[i]['repair'] = repair
for i in ['ECON-SP-ELITE-308','ECON-SP-ELITE-309']:
    advanced[i] = 'The stem specifies both destination curves and asks only for their intersection. Curve-label lookup supplies the work; the joint shocks are not interpreted. Preserve joint AD/SRAS shocks, but require explaining why the observed output result differs from a one-shock counterfactual and why that net result is specific to the displayed shift sizes.'
for i in ['ECON-SP-ELITE-312','ECON-SP-LEGENDARY-9038','ECON-SP-LEGENDARY-9039','ECON-SP-LEGENDARY-9002']:
    advanced[i] = 'The two shifts are specified and only the final output/price result is selected; the options also admit a price-direction shortcut. Multiple curve names create apparent synthesis without policy evaluation. Preserve the opposing output effects, but require evaluating a one-shock counterfactual or explaining why restoration of output is contingent on the displayed offset rather than a universal outcome.'
advanced['ECON-SP-ELITE-341'] = 'The task recognizes an ordinary adverse supply shock; three rivals use an inadmissible starting curve or the wrong mechanism. Multiple curve labels add apparent complexity. Preserve supply-shock diagnosis, but require distinguishing demand stabilization from restoration of productive capacity using an observed outcome and a policy counterfactual.'
n['shared_stem_only_packets'] = []
n['final_adjudication'] = 'All 50 remaining packets were read with full stems and choices; four graph false positives and eleven advanced candidates were excluded on final review.'

wording = n['wording_candidates']
wording.update({
 'P52A-AD-B1-001': 'Recommended: two-part diagnosis distinguishes these events is an assessment-writing ending. Ask how each event changes aggregate demand or quantity demanded, keeping the shift-versus-movement distinction.',
 'P52A-AD-B1-003': 'Recommended: aggregate-demand assessment uses both channels announces test construction, and the initial export amount is unused. Ask how the two changes affect AD and what can be concluded about the net change, preserving the absence of response magnitudes.',
 'LG-Q-2007': 'Recommended: deposits $1000, reserves $200 omits ordinary prepositions and reads like balance-sheet notes. Use deposits of / reserves of, retaining all amounts and withdrawal assumptions.',
 'P52A-BANK-B2-001': 'Recommended: reserves $320 and deposits $1600 is compressed note-like prose. Add of or in while retaining the distinction between required and excess reserves.',
 'P52A-BANK-B3-001': 'Recommended: assets $2400, deposit liabilities $2000 and capital $400 is note-like prose. Use assets of / liabilities of / capital of while retaining the loss and solvency reasoning.',
 '43100': 'Recommended: Which revision and limit follow? is a compressed, abstract ending. Ask how the projected deficit changes and whether that forecast establishes an actual debt repayment.'
})

def snapshot(i):
    q=r[i]['q']; a=r[i]['answer']
    return {'question_id':i,'stem':q['q'],'choices':q['options'],'correct_answer_letter':'ABCD'[a],
            'correct_answer':q['options'][a],'feedback':q.get('feedback'),
            'canonical_difficulty':q.get('canonicalDifficulty'),'raw_difficulty':q.get('difficulty'),
            'concept':q.get('primaryConceptId'),'skill':q.get('primarySkill'),
            'image':q.get('image'),'image_description':q.get('graphDescription'),
            'aHash':q.get('aHash'), 'canonical_record_sha256':hashlib.sha256(json.dumps(q,sort_keys=True,ensure_ascii=False).encode()).hexdigest()}

def construct(i):
    q=r[i]['q']
    return q.get('primaryConceptId','macroeconomics').replace('-',' ')+' — '+q.get('primarySkill',q.get('type','application')).replace('_',' ')+'. The current task and keyed conclusion below define the narrower content to retain.'

findings=[]; counts=collections.Counter(); used=set()
def add(cat, **fields):
    counts[cat]+=1; f={'finding_id':f'MAC-{cat}-{counts[cat]:03d}','category':cat,**fields}; findings.append(f);return f

# Wording families expand only the already reviewed digit-normalized stem family.
# A duplicated seed becomes one finding group, not repeated edits to one record.
for i,note in wording.items():
    if i in used: continue
    ids=[x for x in family[i] if x not in shared]
    if i=='ECON-NL-LEGENDARY-9067': ids += ['ECON-NL-LEGENDARY-9068']
    if i=='PM2A-DIS-EB-012': ids += ['ECON-SP-LEGENDARY-9008']
    if i=='PM2A-DIS-EB-013': ids += ['PM2A-DIS-LB-020']
    ids=list(dict.fromkeys(ids)); used.update(ids)
    cat='A' if note.startswith('Clear') else 'C' if note.startswith('Optional') else 'B'
    clean=re.sub(r'^(Clear|Recommended|Optional)(?: terminology polish| polish| family)?\s*:\s*','',note)
    pieces=re.split(r'(?<=\.)\s+(?=(?:Ask|Use|Add|Retain|Remove|Replace|State|Name|Express|Restore|Keep|Say|Describe|Clearly)\b)',clean,maxsplit=1,flags=re.I)
    add(cat,classification={'A':'Clear correction','B':'Recommended polish','C':'Optional style'}[cat],question_ids=ids,
        current=[snapshot(x) for x in ids],why=pieces[0],suggested_direction=pieces[1] if len(pieces)>1 else clean,
        judgment='Objective clarity/grammar or assessment-author leakage.' if cat=='A' else 'Editorial recommendation; current economics is not being invalidated.' if cat=='B' else 'Instructor preference, not an objective defect.')

for i,d in g.items():
    c=d.get('construct',construct(i))
    checks={
      'status':'Design acceptance conditions; replacement wording/options have not been authored or validated.',
      'construct_test':{'coordinates_alone_sufficient':'NO — required result','reason':'The answer must interpret the plotted evidence using '+c+' A correct graph reading paired with the wrong economic explanation must remain a plausible distractor.'},
      'graph_test':{'theory_alone_sufficient':'NO — required result','reason':'At least two theoretically coherent alternatives must differ on this evidence: '+d['evidence']+' The stem must not disclose that discriminating evidence.'}}
    if 'asset_constraint' in d:
        checks['status']='Conditional design only. Existing asset does not support the proposed marked-rate comparison; text-only feasibility unresolved.'
    add('D' if d['classification']=='Directly optional graph' else 'E', classification=d['classification'],question_ids=[i],current=[snapshot(i)],
        original_construct=c,why= d['why'],graph_evidence=d['evidence'],suggested_direction=d['repair'],
        construct_preservation='Retain the causal, interpretive or model-limit requirement in the original task and keyed conclusion; require it together with the stated graph evidence. Preserve the approved institutional assumptions and exclusions.',
        drift_risk='A replacement that asks only for '+d['evidence'].rstrip('.')+' would lose the economic interpretation. A generic theory question with redundant point labels would leave the graph optional.',
        graph_checks=checks, asset_constraint=d.get('asset_constraint'))

for i,note in advanced.items():
    assert r[i]['q'].get('canonicalDifficulty') in ('elite','legendary'), i
    bits=re.split(r'(?<=\.)\s+(?=(?:Preserve|Retain|Keep|Require|Upgrade)\b)',note,maxsplit=1)
    f=add('F',classification='Pseudo-advanced task',question_ids=[i],current=[snapshot(i)],current_tier=r[i]['q']['canonicalDifficulty'],
          original_construct=construct(i),why=bits[0],appearance_of_difficulty=bits[0],
          suggested_direction=bits[1] if len(bits)>1 else note, tier_change_recommended=False)
    if i in asset:
        f['graph_checks']={'status':'Design acceptance conditions, not completed replacement-item validation.',
          'construct_test':{'coordinates_alone_sufficient':'NO — required result','reason':'Require the stated economic diagnosis/counterfactual, not only the destination coordinates. '+f['suggested_direction']},
          'graph_test':{'theory_alone_sufficient':'NO — required result','reason':'Use at least two economically coherent answers whose graph readings differ; preserve the actual plotted outcome as evidence rather than disclosing it. Coordinate any overlapping D/E finding in the same revision.'}}
for i,note in n['incidental_candidates'].items():
    add('H',classification='Incidental high-priority finding',question_ids=[i],current=[snapshot(i)],why=note,
        suggested_direction='Resolve the stated ambiguity or missing premise in a separately authorized correction; preserve the intended economics and recheck unique answer defensibility.')

byid=collections.defaultdict(list)
for f in findings:
    for i in f['question_ids']:
        assert i in r and i not in shared, i
        byid[i].append(f['finding_id'])
for f in findings:
    f['overlapping_findings']=sorted({j for i in f['question_ids'] for j in byid[i] if j!=f['finding_id']})

calibration_data = [
 ('PMOE-FX-H-003','Ordinary graph application','The graph must distinguish a demand increase from a decrease. Both export-demand explanations are economically coherent before the image is seen; the student must connect foreign purchases to dollar demand and appreciation/depreciation.'),
 ('PM2D1-LRADJ-H-001','Hard reasoning','The task challenges automatic restoration of old potential after productive capital is destroyed. It requires separating a cyclical gap from a change in productive capacity.'),
 ('PG5-PC-L-006','Legendary graph reasoning','Reading B is necessary but insufficient: the student must distinguish expected inflation from a separately measured supply offset and recognize what cannot be identified when that measurement is absent. Two answers share the valid identification-limit statement.'),
 ('P52A-AD-LB-002','Policy/transmission and counterfactual','Observed investment rises despite higher borrowing costs. The student must infer that optimism dominates the restraint and predict the stronger increase without the price-level channel. The competing mechanisms interact.'),
 ('43245','Numerical reasoning','The observed equilibrium change must be decomposed into an investment-demand shift and movement along the new schedule. The unchanged-rate counterfactual cannot be obtained by simply treating observed investment growth as the shift.'),
 ('LG-Q-9035','Advanced numerical contrast','Exact expected and realized returns are used to reprice a new contract that preserves the original expected real return. That counterfactual makes this more than unrelated arithmetic, so it was excluded from the pseudo-advanced list.')]
calibration=[{'question_id':i,'role':role,'why_it_works':why,'current':snapshot(i)} for i,role,why in calibration_data]

baseline=json.loads((p/'baseline_hashes.json').read_text(encoding='utf8'))
changed=[rel for rel,h in baseline.items() if not (root/rel).is_file() or hashlib.sha256((root/rel).read_bytes()).hexdigest()!=h]
assert not changed, changed
spec=importlib.util.spec_from_file_location('exporter',root/'tools/export_faculty_question_bank.py');e=importlib.util.module_from_spec(spec);spec.loader.exec_module(e)
lib=e.load_library(root/e.SOURCE);records,_=e.collect(lib)
e.audit_answers_and_routes(lib,records,root,sys.argv[1])
members=e.course_area_memberships(lib,root,sys.argv[1]);groups=e.partition_disciplines(records,members)
assert set(groups['macro'])==set(r)
assert all(groups['macro'][i]['q']==r[i]['q'] for i in r)
assert not {'42660','42697'} & set(records)
canonical_sha=hashlib.sha256((root/e.SOURCE).read_bytes()).hexdigest()

canonical_advanced=[i for i,x in r.items() if x['q'].get('canonicalDifficulty') in ['elite','legendary']]
advanced_scope=[i for i,x in r.items() if any(any(t in str(x['q'].get(k,'')).lower() for t in ['elite','legendary','boss','checkpoint']) for k in ['canonicalDifficulty','difficulty','assessmentTier','instructionalRole','originalSourcePool','originalBossTier','poolRole','boss'])]
summary={
 'total_macro_screened':len(r),'graph_image_questions_reviewed':len(asset),'distinct_asset_paths_visually_inspected':len(images),
 'distinct_asset_contents_sha256':len({x['sha256'] for x in images}),
 'wording_finding_groups':sum(counts[x] for x in 'ABC'),'distinct_wording_affected_records':len({i for f in findings if f['category'] in 'ABC' for i in f['question_ids']}),
 'clear_correction_groups':counts['A'],'recommended_polish_groups':counts['B'],'optional_style_groups':counts['C'],
 'directly_optional_graph_questions':counts['D'],'graph_choice_shortcut_questions':counts['E'],'pseudo_advanced_tasks':counts['F'],
 'shared_record_residuals':0,'incidental_high_priority_findings':counts['H'],'unique_affected_records':len(byid),
 'shared_records_screened':len(shared),'macro_exclusive_records_screened':len(r)-len(shared),
 'canonical_elite_legendary_records_screened':len(canonical_advanced),'advanced_checkpoint_screening_union':len(advanced_scope)}
preservation={'preexisting_files_hash_verified':len(baseline),'changed_preexisting_files':changed,'canonical_source':str(e.SOURCE).replace('\\','/'),
 'canonical_source_sha256':canonical_sha,'current_canonical_records':len(records),'course_projection_counts':{k:len(v) for k,v in groups.items()},
 'macro_ids_and_full_records_unchanged':True,'deleted_ids_still_absent':['42660','42697'],
 'exports_regenerated':False,'tests_or_validation_suites_run_for_this_readonly_audit':False,
 'read_only_checks':'Normal exporter library loading, answer-hash/route resolution at baseline, current course projection reconstruction, exact record comparison and SHA-256 preservation checks. No claim of a new correctness or suite-validation pass.'}

coverage={'audit':'Macroeconomics wording and graph assessment','started':'2026-10-03','completed':'2026-10-04',
 'summary':summary,'preservation':preservation,
 'method':'All current stems and all four choices reviewed; every attached image reviewed with and without its equivalent accessibility description. Advanced task scrutiny applied to canonical advanced tiers and broader boss/checkpoint/legacy-labelled pool. Shared records protected. No findings means no retained in-scope issue, not certification of all correctness.',
 'assets':[{**x,'visually_inspected':True} for x in images],
 'records':[{'question_id':i,'stem_and_choices_reviewed':True,'graph_hide_test_reviewed':i in asset,'asset_reference':r[i]['q'].get('image'),
             'advanced_task_reviewed':i in advanced_scope,'canonical_advanced':i in canonical_advanced,
             'shared_protection_applied':i in shared,'finding_ids':byid.get(i,[]),
             'disposition':'Flagged' if i in byid else 'No retained in-scope finding'} for i in r]}
data={'audit':'Macroeconomics wording and graph assessment','mode':'read-only','started':'2026-10-03','completed':'2026-10-04',
 'summary':summary,'preservation':preservation,'findings':findings,'calibration':calibration,
 'worklist':[{ 'question_id':i,'finding_ids':fs,'categories':sorted({f['category'] for f in findings if f['finding_id'] in fs}),'current':snapshot(i)} for i,fs in sorted(byid.items())],
 'graph_repair_status':'Recommendations are design requirements, not authored replacements or completed hide-graph validation. PMOE-FX-M-006 has a specifically disclosed existing-asset limitation.',
 'cleanup_order':['A clear wording corrections','D/E coordinated graph repairs','F advanced reasoning, coordinated with graph overlap','B recommended prose polish','C optional style','G only separately approved residuals; none found'],
 'incidental_priority':'Address H separately before student use; no correction is performed here.'}

dest=root/'faculty_exports/audits';base='macroeconomics_wording_graph_audit_20261003'
assert not (dest/(base+'.md')).exists(), 'Do not overwrite an existing report'
for name,doc in [(base+'.json',data),(base+'_coverage.json',coverage)]:
    (dest/name).write_text(json.dumps(doc,ensure_ascii=False,indent=2)+'\n',encoding='utf8')

lines=['# Macroeconomics wording and graph-assessment audit',
       '', 'Read-only review of the current Composer projection. Started October 3, 2026; completed October 4, 2026. The filename retains the start date.', '',
       '| Required measure | Count |','|---|---:|']
for label,key in [('Total Macro questions screened','total_macro_screened'),('Graph/image-bearing questions reviewed','graph_image_questions_reviewed'),('Distinct graph/image assets visually inspected (paths)','distinct_asset_paths_visually_inspected'),('Wording finding groups','wording_finding_groups'),('Distinct wording-affected records','distinct_wording_affected_records'),('Directly optional graphs','directly_optional_graph_questions'),('Graph-choice shortcuts','graph_choice_shortcut_questions'),('Pseudo-advanced tasks','pseudo_advanced_tasks'),('Shared-record residuals','shared_record_residuals'),('Incidental high-priority findings','incidental_high_priority_findings'),('Unique affected records across all categories','unique_affected_records')]:
    lines.append(f'| {label} | {summary[key]} |')
lines += ['', '## Scope, evidence and interpretation','',
 f"Every one of the {len(r):,} current Macro stems and answer sets was screened, including all {len(asset)} attached-image records and all {len(images)} referenced image paths ({summary['distinct_asset_contents_sha256']} distinct file contents). This includes {len(shared):,} approved shared General/Micro records and {len(r)-len(shared):,} Macro-exclusive records. There was no sampling. The coverage JSON lists every ID, image and finding disposition.", '',
 f"All {len(canonical_advanced)} canonical Elite/Legendary records received advanced-task scrutiny. The broader legacy/boss/checkpoint screening union contains {len(advanced_scope):,} records; all other records were also read. Current tier in each F finding follows canonicalDifficulty, the runtime-preferred field. Older source labels are retained in JSON for traceability, not treated as tier defects.", '',
 'The graph test removes both the image and its equivalent accessibility description. D means the task itself supplies enough information; E means the alternatives expose the key through elimination or equivalent-distractor cues. Each graph record receives one primary D/E classification. F can overlap either, and wording can overlap all categories. Category counts therefore must not be summed to infer unique affected records.', '',
 'A prose recommendation does not invalidate the economics. Familiar phrases such as “which inference” were not automatically flagged. C is explicitly optional preference. F concerns the reasoning demanded by the task, not a recommendation to retag its difficulty. Genuine competing-mechanism, counterfactual and identification-limit questions were retained even when they are concise or numerically simple.', '',
 'No shared-record residual met both the concrete-defect and meaningful-Macro-context criteria. Prior General/Micro revisions, Macro correctness and exception closures, scarce/ample-reserves assumptions, instructor adjudications and the two deletions remain the baseline. Historical/hypothetical reserve-ratio exercises are not modernization findings.', '',
 'Every graph repair below must require economics AND graph evidence. The two NO results stated below are acceptance requirements for the proposed design, not claims that unwritten alternatives have already passed validation. A future cleanup must author four distinct alternatives, preserve one defensible answer, and rerun both tests on the actual finished item. Keep at least two economically coherent alternatives without the figure, and at least one plausible correct-reading/wrong-interpretation alternative where appropriate.', '',
 '**Asset constraint:** PMOE-FX-M-006 has no ticks or labeled candidate points. Its equilibrium-definition shortcut is real, but an honest substantive repair cannot currently be promised using only the unchanged unmarked asset. Its entry identifies the conditional design and separate scope decision. No graph is changed or redrawn here.', '',
 '## Findings and cleanup priority','',
 '| Category | Finding groups/items | Distinct records |','|---|---:|---:|']
names={'A':'Clear wording corrections','B':'Recommended prose polish','C':'Optional style','D':'Directly optional graphs','E':'Graph-choice shortcuts','F':'Pseudo-advanced tasks','G':'Shared-record residuals','H':'Incidental high-priority findings'}
for cat,name in names.items():
    lines.append(f"| {cat}. {name} | {counts[cat]} | {len({i for f in findings if f['category']==cat for i in f['question_ids']})} |")
lines += ['', 'Recommended order: A → D/E → F coordinated with overlapping graph work → B → C → separately approved G (none). Address the two H exceptions separately before student use. This is a proposed worklist, not authorization to implement. Merge overlapping findings into one final revision per ID.', '',
          '## Good calibration questions','']
for c in calibration:
    s=c['current'];lines += [f"### {c['question_id']} — {c['role']}",'',f"Current tier: {s['canonical_difficulty']}. {c['why_it_works']}",'',f"Current task: {s['stem']}",'']

def current_block(s, feedback=False):
    out=[f"**{s['question_id']} — current wording**",'',s['stem'],'']
    out += [f"- {letter}. {choice}" for letter,choice in zip('ABCD',s['choices'])]
    out += ['',f"Current key: {s['correct_answer_letter']}. {s['correct_answer']}"]
    if s['image']: out += [f"Attached image: `{s['image']}`."]
    if feedback: out += [f"Current feedback: {s['feedback']}"]
    return out+['']

for cat,name in names.items():
    lines += [f'## {cat}. {name}','']
    fs=[f for f in findings if f['category']==cat]
    if not fs: lines += ['No retained findings.',''];continue
    for f in fs:
        lines += [f"### {f['finding_id']} — {', '.join(f['question_ids'])}",'',f"Classification: **{f['classification']}**.",'']
        for s in f['current']: lines += current_block(s,cat=='H')
        if cat in 'ABC':
            lines += [f"**Why it is awkward:** {f['why']}",'',f"**Suggested direction:** {f['suggested_direction']}",'',f"**Judgment:** {f['judgment']}",'']
        elif cat in 'DE':
            lines += [f"**Original economic construct:** {f['original_construct']}",'',f"**Hide-the-graph bypass:** {f['why']}",'',f"**Graph evidence that should matter:** {f['graph_evidence']}",'',f"**Recommended repair direction:** {f['suggested_direction']}",'',f"**Construct-preservation note:** {f['construct_preservation']}",'',f"**Construct-drift risk:** {f['drift_risk']}",'']
        elif cat=='F':
            lines += [f"**Current tier:** {f['current_tier']}; no tier change recommended.",'',f"**Original intended construct:** {f['original_construct']}",'',f"**Why the item is not genuinely advanced / apparent difficulty:** {f['why']}",'',f"**Recommended reasoning upgrade:** {f['suggested_direction']}",'']
        else: lines += [f"**Incidental issue:** {f['why']}",'',f"**Disposition:** {f['suggested_direction']}",'']
        if 'graph_checks' in f:
            t=f['graph_checks'];lines += ['**Two-part graph standard**','',f"- Construct test — could coordinates alone suffice? **{t['construct_test']['coordinates_alone_sufficient']}**. {t['construct_test']['reason']}",f"- Graph test — could theory alone suffice? **{t['graph_test']['theory_alone_sufficient']}**. {t['graph_test']['reason']}",'',f"Status: {t['status']}",'']
        if f['overlapping_findings']: lines += ['Coordinate with: '+', '.join(f['overlapping_findings'])+'.','']

lines += ['## Preservation and delivery checks','',
 f"All {len(baseline):,} preexisting files captured under build, faculty_exports and tools retain their original SHA-256 hashes. Current Macro IDs and complete canonical record contents exactly match the audit baseline. The canonical bank has {len(records):,} records; projections remain General {len(groups['general']):,}, Micro {len(groups['micro']):,}, Macro {len(groups['macro']):,}. IDs 42660 and 42697 remain absent.",'',
 f"Canonical source: `{preservation['canonical_source']}`. SHA-256: `{canonical_sha}`.",'',
 'No questions, choices, keys, feedback, hashes, metadata, difficulty, routing, graph assets, exports, tests, engine logic or telemetry were changed. No exports were regenerated. No test suite was run for this report-only task. Read-only exporter loading/projection and baseline answer resolution were used to identify the current bank; these are not a new correctness audit.', '',
 f"Companions: `{base}.json` contains exact finding IDs, affected IDs, current snapshots, overlap mapping and recommendations. `{base}_coverage.json` contains all screened records and visually inspected assets. Working review notes are under `tmp/macroeconomics_wording_graph_audit_20261003/`.", '']
(dest/(base+'.md')).write_text('\n'.join(lines),encoding='utf8')
(p/'final_adjudicated_notes.json').write_text(json.dumps(n,ensure_ascii=False,indent=2),encoding='utf8')
print(json.dumps(summary,indent=2))
print('Preservation:',len(baseline),'unchanged files; all Macro records equal; deletions retained.')
print('Report lines:',len(lines))
