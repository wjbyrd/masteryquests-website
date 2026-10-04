"""Assemble this read-only review from current student-facing text."""
import json,re
from pathlib import Path
from collections import Counter

HERE=Path(__file__).parent
ROOT=HERE.parent.parent
rows=json.loads((ROOT/'tmp/micro_student_wording_review_20261004/current_questions.json').read_text(encoding='utf-8'))
by_id={q['id']:q for q in rows}
groups=[]
for p in sorted(HERE.glob('findings_*.json')):
    groups.extend(json.loads(p.read_text(encoding='utf-8')))

def group_for(qid):
    return next(g for g in groups if qid in g['ids'])

group_for('P62I-OLI-B2-032')['ids'] += [f'P62I-OLI-LB-{n:03}' for n in range(28,33)]
group_for('P62I-OLI-EL-028')['ids'] += ['P62I-OLI-L-086']
groups.append(dict(ids=['P62I-OLI-LB-035'],classification='Excess jargon',reaction="'Multi-homing' and 'foreclosure risk' are unexplained specialist terms. I have to translate them into using competing platforms and being blocked from competing before evaluating the acquisition.",direction='Describe the restriction on using multiple platforms and the risk of excluding rivals, retaining the network-effects and entry reasoning.'))

group_for('P52B-TRADE-EL-003')['ids'] += ['P75-TRADE-FB-004','P75-TRADE-FB-005','P75-TRADE-H-009','P75-TRADE-L-012','P75-TRADE-L-013','P75-TRADE-L-015','P75-TRADE-L-023','P75-TRADE-LB-005','P75-TRADE-M-011','P75-TRADE-M-012','P75-TRADE-R-008']
group_for('P52B-TRADE-LB-002')['ids'].remove('P52B-TRADE-LB-002')
groups.append(dict(ids=['P52B-TRADE-LB-002'],classification='Unnatural wording',reaction="'Delegation strictly gains 6 sales' is an unnatural way to describe the extra sales made possible by assigning work to the assistant.",direction='Describe the claimed increase in sales directly, retaining the delegation and supervision comparison.'))

groups.append(dict(ids=['P62I-OLI-B3-042','P62I-OLI-L-076','P62I-OLI-L-078','P62I-OLI-L-080','P62I-OLI-L-082','P62I-OLI-L-084'],classification='Excess jargon',reaction="'Pass-through' or 'consumer pass-through' is used without explaining that it means cost savings reaching buyers through lower prices. The label makes an otherwise familiar merger question sound like a specialist report.",direction='Describe how much of the cost saving would be reflected in lower customer prices, preserving the comparison with reduced competition.'))
groups.append(dict(ids=['P62I-OLI-LB-034'],classification='Excess jargon',reaction="Savings 'pass through' and evidence 'offsets structural concern' are compressed merger-review expressions. I understand the tradeoff, but need to translate both expressions before interpreting the conclusion.",direction='Say that cost savings may lower prices and that easy entry may limit the merged firm\'s market power; preserve the stated assumptions.'))

# Do not flag optimization terminology merely because the economics is advanced.
group_for('PM6-MON-BR-091')['ids'].remove('PM6-MON-BR-091')
group_for('P62H-MCMP-B3-044')['direction']='Describe confidence that the service will continue to be high quality over repeated visits or purchases, retaining the signaling interpretation.'

overrides={
 'PM5-PC-R-086':dict(reaction="'What is the long-run repair?' sounds like an internal teaching label, not a natural request to correct the learner's explanation.",direction="Ask which statement corrects the learner's explanation of how entry affects market supply and price."),
 'PMS-ELAS-R-003':dict(reaction="'Best repair?' sounds like an editing note. A student normally expects to be asked which statement corrects the misconception.",direction="Ask directly which statement corrects the learner's claim about input mobility and supply elasticity."),
 'P77-IEA-R-003':dict(reaction="'A PPF move is described. What connection should be made?' does not identify the economic question. I have to infer the task from the alternatives.",direction='Ask directly what a movement along the PPF reveals about opportunity cost.'),
 'P77-IEA-R-006':dict(reaction="'What completes the reasoning?' does not identify what I should establish about the two producers. I have to infer the intended goal from the alternatives.",direction='Ask what must be compared to determine whether specialization and trade can benefit the producers.'),
 'PM8-OLI-R-073':dict(reaction="The list ends with unexplained 'efficiencies, and pass-through.' I know that mergers can reduce costs, but must decode how this shorthand relates to prices buyers pay.",direction='Describe possible cost savings and how much of them reaches consumers through lower prices, retaining the limit on what HHI establishes.'),
}

findings=[]
for g in groups:
    for qid in g['ids']:
        assert qid in by_id,qid
        q=by_id[qid]
        item=dict(question_id=qid,current_wording=dict(stem=q['stem'],choices=dict(zip('ABCD',q['choices']))),student_reaction=g['reaction'],classification=g['classification'],suggested_direction=g['direction'])
        for k,v in overrides.get(qid,{}).items():
            item[{'reaction':'student_reaction','direction':'suggested_direction'}.get(k,k)]=v
        findings.append(item)
assert len({f['question_id'] for f in findings})==len(findings),'Duplicate finding ID'
findings.sort(key=lambda f:f['question_id'])
categories=['Unnatural wording','Excess jargon','Difficult to decipher','Unnecessarily technical','Other']
counts=Counter(f['classification'] for f in findings)
assert set(counts)<=set(categories)

if __name__=='__main__':
    print(json.dumps(dict(reviewed=len(rows),flagged=len(findings),counts=counts),indent=2))
    if '--check-repeats' in __import__('sys').argv:
        norm=lambda s:re.sub(r'\d+(?:[.,]\d+)*','#',s)
        flagged={f['question_id'] for f in findings}
        patterns={norm(by_id[qid]['stem']):qid for qid in flagged}
        for q in rows:
            if q['id'] not in flagged and norm(q['stem']) in patterns:
                print('SAME STEM',patterns[norm(q['stem'])],json.dumps(q,ensure_ascii=False))
    if '--write' in __import__('sys').argv:
        recurring=[
            "Unexplained specialist shorthand: 'multi-homing,' 'inframarginal,' 'contractible,' 'exogenous,' 'consumer pass-through,' and 'contribution margin.' These need short ordinary-language explanations; the underlying economics can stay demanding.",
            "Formal qualifiers without a plain-language explanation: 'continuation factor,' 'monotonic preferences,' 'strict gains,' 'first-order effect,' and 'weakly expands.' The concern is decoding what these expressions mean in the question, not the calculations or reasoning they support.",
            "Assessment or lesson-planning language in the question itself: 'Best repair?', 'long-run repair,' 'What makes analysis integrated?', 'handles the equality boundary,' and questions about which question stays centered on a topic.",
            "Compressed noun phrases: 'fixed-demand-determinant estimates,' 'social-intersection quantity,' 'graph-based gain and institutional comparison,' and 'output contribution schedule.' Ordinary clauses would identify the task more clearly.",
            "Unclear referents or unnatural descriptions: 'a buyer valued at,' 'elastic participants,' 'switching benefits' that reduce switching, and 'confidence in repeat quality.'",
            "Unexplained game-character introductions involving the Signal Breaker or Market Marshal. These are flagged because of the actual exam wording, not because the questions have boss labels.",
            "A few prompts bundle several comparisons into a single request or make students infer the requested task from the choices. Most long or multistep prompts do not have this problem and were left unflagged.",
        ]
        impression=("The bank would mostly feel like a recognizable college Principles of Microeconomics final. "
          "Most questions tell the student clearly what to calculate, compare, or explain, including demanding graph and multistep questions. "
          "The flagged language is concentrated in recurring templates and a smaller number of isolated phrases; it is not a pervasive problem across the bank. "
          "A prepared sophomore could understand the economics in these items yet pause to translate their wording. "
          "Targeted clarification of those phrases would help without simplifying the economic reasoning.")
        methodology=("Read the current canonical Composer Micro membership: 6,299 unique question IDs, including current shared questions assigned to Micro. "
          "Reviewed the stem and all answer-choice wording as student-facing exam text. "
          "Exact repeated wording and wording differing only in numbers were read in shared form, with all associated IDs included in coverage; "
          "new stems and new choice wording were read throughout the bank. Phrase checks then confirmed consistent treatment of repeated concerns. "
          "No old question versions or previous audit reports were used. Course membership was used only to locate the bank, not evaluated. "
          "No correctness, difficulty, metadata, routing, graph, answer-key, or answer-hash audit was performed. No question-bank files were changed.")
        summary=dict(total_reviewed=len(rows),total_flagged=len(findings),total_not_flagged=len(rows)-len(findings),percent_flagged=round(100*len(findings)/len(rows),2),primary_classification_counts={k:counts[k] for k in categories})
        report=dict(title='Microeconomics student-perspective wording review',date='2026-10-04',review_type='Read-only student-perspective wording review',source='build/faculty-build-composer/data/composer_library.js',methodology=methodology,counting_rule='One primary classification per flagged question; category counts sum to the total flagged. Repeated wording is reported separately for every affected current ID.',summary=summary,recurring_writing_habits=recurring,overall_impression=impression,reviewed_question_ids=[q['id'] for q in rows],findings=findings)
        dest=ROOT/'faculty_exports/audits'
        dest.mkdir(parents=True,exist_ok=True)
        base=dest/'microeconomics_student_perspective_wording_review_20261004'
        base.with_suffix('.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')
        lines=['# Microeconomics student-perspective wording review','', 'Date: October 4, 2026','',
          f"**Reviewed {len(rows):,} current questions; flagged {len(findings):,} ({summary['percent_flagged']:.2f}%). The question bank is unchanged.**",'',
          'Both requested concerns occur: some items sound unlike natural instructor-written exam questions, and some require students to decode unnecessary technical or compressed language. Most of the bank reads clearly.','',
          '## Scope and approach','',methodology,'',report['counting_rule'],'',
          'The findings are editorial judgments from the requested student perspective. They do not claim that any question was written by AI. Suggested directions describe how to clarify the same task; they are not implemented rewrites. Full current stems and choices are included even when the concern is confined to one phrase in an alternative.','',
          '## Individual findings','']
        for f in findings:
            lines += [f"### {f['question_id']}",'','**Current wording**','',f"> {f['current_wording']['stem']}",'']
            lines += [f"- **Choice {letter}:** {text}" for letter,text in f['current_wording']['choices'].items()]
            lines += ['',f"**Student reaction:** {f['student_reaction']}",'',f"**Classification:** {f['classification']}",'',f"**Suggested direction:** {f['suggested_direction']}",'']
        lines += ['## Final totals','', '| Measure | Count |','|---|---:|',f'| Total Micro questions reviewed | {len(rows):,} |',f'| Total questions flagged | {len(findings):,} |']
        lines += [f'| {k} | {counts[k]:,} |' for k in categories]
        lines += [f"| Not flagged | {summary['total_not_flagged']:,} |",'', '## Recurring phrases and writing habits','']
        lines += ['- '+s for s in recurring]
        lines += ['', '## Overall student impression','',impression,'', '**No question-bank changes were made.**','']
        base.with_suffix('.md').write_text('\n'.join(lines),encoding='utf-8')
        # Verify the report faithfully quotes the reviewed snapshot and counts every ID once.
        saved=json.loads(base.with_suffix('.json').read_text(encoding='utf-8'))
        assert len(saved['reviewed_question_ids'])==len(set(saved['reviewed_question_ids']))==6299
        assert sum(saved['summary']['primary_classification_counts'].values())==len(saved['findings'])
        for f in saved['findings']:
            q=by_id[f['question_id']]
            assert f['current_wording']['stem']==q['stem']
            assert list(f['current_wording']['choices'].values())==q['choices']
        md=base.with_suffix('.md').read_text(encoding='utf-8')
        assert len(re.findall(r'^### ',md,re.M))==len(findings)
        print('Reports written and quotation/count checks passed:',base)
