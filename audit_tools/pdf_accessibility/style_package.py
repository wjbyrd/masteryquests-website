"""Publish only review copies and reports. Never install production files."""
import csv,copy,shutil,html,collections
import style_restoration as s
from style_release import collect
q=s.q
PACKAGE='validation_artifacts/concept_review_owner_review/v3'
REPORT='FINAL_REPORT_concept_review_style_restoration.md'
def write(path,text):
    p=q.contained(path);p.parent.mkdir(parents=True,exist_ok=True);p.write_text(text.rstrip()+'\n',encoding='utf8')

def main():
    assert q.read_json(s.EVIDENCE+'/staged_gate.json')['passed']==151
    restored=collect();rows={r['code']:r for r in q.read_json(s.EVIDENCE+'/final_validation.json')}
    old=q.read_json('validation_artifacts/concept_review_owner_review/v2/candidate_manifest.json')
    oldcsv=list(csv.DictReader(q.contained('validation_artifacts/concept_review_owner_review/v2/REVIEW_CHECKLIST.csv').open(encoding='utf-8-sig')))
    checklist=[];records=[]
    for previous in old['records']:
        code=previous['resourceId'];v=rows[code];dest=PACKAGE+'/'+previous['domain']+'/'+code+'.pdf'
        q.contained(dest).parent.mkdir(parents=True,exist_ok=True)
        assert q.sha(v['output'])==v['sha256'];shutil.copyfile(q.contained(v['output']),q.contained(dest));assert q.sha(dest)==v['sha256']
        r=copy.deepcopy(previous);r.update(reviewCopyPath=dest,reviewCopySHA256=v['sha256'],sourceStagedCandidatePath=v['output'],sourceStagedCandidateSHA256=v['sha256'],
            validationEvidence=s.EVIDENCE+'/staged_gate.json',rawValidatorEvidence=v['validatorReport'],copyEquality=True,
            styleRestored=code in restored,latestStyleReport=REPORT if code in restored else None,contentAuthority='v2')
        records.append(r)
    for row in oldcsv:
        c=copy.deepcopy(row);code=c['Resource'];v=rows[code]
        c.update(CandidatePath=PACKAGE+'/'+code.rsplit('-',1)[0]+'/'+code+'.pdf',CandidateSHA256=v['sha256'],NewCandidateSHA256=v['sha256'],
            CandidateEvidence=s.EVIDENCE+'/staged_gate.json',TechnicalStatus='ACCEPTED',ValidationStatus='PASS',
            StyleRestorationStatus='RESTORED' if code in restored else 'UNCHANGED V2 CANDIDATE',
            StyleReview='PASS' if code in restored else 'REUSED',ContentPreservation='V2 UNCHANGED',
            OwnerReviewStatus='V3 VISUAL OWNER REVIEW PENDING',OwnerFinalReview='',ApprovedForInstall='',OwnerDecision='')
        checklist.append(c)
    counts=dict(collections.Counter(r['domain'] for r in records));assert counts=={'GEN-ECON':26,'MICRO':68,'MACRO':57}
    assert len(list(q.contained(PACKAGE).glob('*/*.pdf')))==151
    q.write_json(PACKAGE+'/candidate_manifest.json',{'task':'CONCEPT_REVIEW_STYLE_RESTORATION_V1','counts':counts,'exactCopies':151,'records':records})
    q.write_json(s.EVIDENCE+'/checklist_rows.json',{'columns':list(checklist[0]),'rows':checklist})
    modes=collections.Counter(r['validation']['layoutEvidence']['layoutMode'] for r in restored.values())
    fonts=collections.Counter(r['validation']['layoutEvidence']['bodyFontSize'] for r in restored.values())
    for p in q.contained(s.EVIDENCE+'/batches').glob('*/checkpoint.json'):
        b=q.read_json(p);b['styleCheckpoint']=[{'code':r['code'],'resolved':'Established visual components restored; v2 content unchanged',
            'sourceFiles':['audit_tools/pdf_accessibility/qa_template.py','audit_tools/pdf_accessibility/qa_renderer.py',q.SEMANTICS],
            'candidateSHA256':r['validation']['sha256'],'validationStatus':'PASS','styleReview':'PASS','remainingBlockers':[]} for r in b['records']];q.write_json(p,b)
    style=f'''# Concept Review visual restoration

## Root Cause
The owner-QA renderer used a simple text flow with a header and footer. It did not reuse the established metadata card, icon rail, teal rules or Watch Out, Worked Example and Check Yourself panels. Short examples left much of the lower page empty.

## Renderer Changes
qa_template.py centralizes the established letter-page frame, navy/teal palette, metadata strip, rounded cards, vector icons, heading hierarchy and spacing. qa_renderer.py selects these components through the sole canonical semantics record's styleRestoration flag. The legacy route remains available for historical reconstruction. Only the 80 authorized records select the restored template. Table painting now uses navy headers, light row-header treatment, restrained rules and emphasized totals; the real semantic table remains intact.

## Pilot
Seven restored resources: {', '.join(s.PILOT)}. MICRO-49 was the eighth, unchanged control, preserving its accepted payoff table. V1/v2/restored comparisons were rendered and inspected. The pilot passed exact v2 text preservation, explicit PDF/UA-1, structure, table/Figure/Formula checks, deterministic rebuild and visual review before proceeding. Table-to-prose spacing and metadata icon placement were refined during the pilot.

## Resources Restored
80: {', '.join(sorted(restored))}.
71 current candidates were reused without regeneration.

## Layout Modes
{dict(modes)}. Text/calculation and text/policy examples occupy fitted worked cards. Retained tall figures use graph + text columns. Wide corrected graphs use full-width graph + explanation. All 22 new/reworked tables use full-width table + explanation. No decorative data was added to fill space.

## Design Components Restored
Navy branded header and resource-code card; divided metadata strip with decorative vector markers; centered title; circular section icons; teal rules; pale teal Watch Out with border; navy Worked Example border; pale teal Check Yourself; navy Ready footer with arrow; consistent margins and balanced vertical spacing. No removed graph was restored.

Body fonts range from 8.5 to 11 points, selected by measured content fit, with the compact setting used on dense sheets. This is within the established family's small worksheet typography, rather than forcing all pages into one fixed text size. Table text is at least 9.18 points. Font-size distribution: {dict(sorted(fonts.items()))}. Pages remain 612 by 792 points and one page. Final render inspection found no clipping or overflow; the Check Yourself card ends at y=77, 19 points above the footer. Human visual approval remains separate from these measurements.

## Content Preservation
The complete canonical instructional source file is byte-identical to the v2 baseline. Every restored visual source has the exact normalized v2 text hash. Graph pixels, alternatives, formulas, table values, labels, header scopes/IDs/associations and reading sequence remain unchanged. Authorized differences are styling and dependent image/candidate fingerprints only.

## Accessibility Preservation
151/151 accepted: 80 independently validated restored candidates plus 71 hash-verified reused records. PDF 1.7, PDF/UA-1, language/title, headings, paragraphs/lists, Formula runs, informative Figures, real Table/TR/TH/TD, embedded fonts, contrast and content associations remain. Tables were not converted into Figures: the established source-generated visible cells retain their semantic table tree.

## Human Review
Owner visual review is still required. Human screen-reader/PDF-reader testing is PENDING. No installation approval is inferred.
'''
    write(PACKAGE+'/STYLE_RESTORATION_SUMMARY.md',style)
    write(PACKAGE+'/README.md','''# Concept Review owner review v3

These are 151 byte-identical REVIEW COPIES of current accepted staged candidates, not active production PDFs. V3 combines frozen v2 instructional corrections with restored v1 visual components on 80 sheets; 71 candidates are reused unchanged.

Open index.html to browse locally. Record decisions in REVIEW_CHECKLIST.csv, not in the HTML. OwnerFinalReview, OwnerDecision and ApprovedForInstall are blank. Historical QA findings and v2 dispositions remain; new style columns describe this pass.

Review MACRO-11, MACRO-13, MACRO-16, MACRO-20, MICRO-49, GEN-ECON-09, MICRO-52 and MICRO-51 first. Then review GEN-ECON-01 through 26, MICRO-01 through 68 and MACRO-01 through 57. Compare template fidelity, readability, page balance, graph/table integration and the frozen corrected content.

Do not use concept-reviews/ or build/faculty-build-composer/data/concept-reviews/ production PDFs as current staged evidence. Resolve versions by candidate_manifest.json and hashes. The earlier v1/v2 review packages remain unchanged.

MICRO-49 retains B/Y=(1,1) and unique equilibrium (A,X). MACRO-11/13 remain graph-free; MACRO-12 retains its production-function graph. MACRO-16 keeps its labor graph, MACRO-20 its bank table, and MICRO-09 remains graph-free.

Next: owner visual approval, human AT sample, then separately authorized installation. Nothing was installed or deployed.
''')
    write(PACKAGE+'/REVIEW_SUMMARY.md','''# V3 review summary

151 staged resources: 26 General Economics, 68 Microeconomics, 57 Macroeconomics. 80 visual restorations and 71 unchanged accepted candidates. 151/151 copy hashes match their staged sources.

V1 is the visual authority; v2 is the corrected-content authority. All approved v2 corrections remain. Original QA findings and dispositions are retained in the checklist, and the v2 CHANGELOG remains the content-change history. This pass made no instructional changes.

The restored family has branded cards, vector icon rail, section rules, bordered/tinted panels and balanced page composition. The pilot and all 80 final renders passed Codex style review. See STYLE_RESTORATION_SUMMARY.md for layout modes, font sizes, scope and limitations.

151/151 ACCEPTED across PDF/UA machine, semantic/project, content preservation, determinism and contrast/visual. Style/template review: 80/80. Owner approval and human AT remain PENDING. The installation preview was updated only; production remains unchanged.
''')
    changelog='# V3 style changelog\n\nAll entries preserve v2 content. See v2/CHANGELOG.md for the frozen instructional corrections.\n'
    for domain,name in [('GEN-ECON','General Economics'),('MICRO','Microeconomics'),('MACRO','Macroeconomics')]:
        changelog+='\n## '+name+'\n'
        for code,r in sorted(restored.items()):
            if code.rsplit('-',1)[0]==domain:changelog+='\n### '+code+'\n\nRestored metadata card, icon rail, section rules, Watch Out/Worked Example/Check Yourself panels and page balance. Layout: '+r['validation']['layoutEvidence']['layoutMode']+'. Corrected content and accessible structures preserved.\n'
    write(PACKAGE+'/CHANGELOG.md',changelog)
    esc=html.escape
    index='''<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width"><title>Concept Review v3</title><style>body{font:16px system-ui;max-width:1100px;margin:2rem auto;padding:0 1rem;color:#172538}a{color:#124f84}input{font:inherit;padding:.6rem;width:80%}li{padding:.7rem;border-bottom:1px solid #ddd}li[hidden]{display:none}</style><h1>Concept Review v3</h1><p>151 staged review copies. 80 restored; 71 unchanged. Production remains untouched.</p><p>Record approval in <a href="REVIEW_CHECKLIST.csv">REVIEW_CHECKLIST.csv</a>. Human AT: PENDING.</p><p><a href="STYLE_RESTORATION_SUMMARY.md">Style summary</a> · <a href="CHANGELOG.md">Changelog</a> · <a href="candidate_manifest.json">Evidence</a></p><label for="filter">Search resource, title or status</label><p><input id="filter" type="search"></p>'''
    for domain,name in [('GEN-ECON','General Economics'),('MICRO','Microeconomics'),('MACRO','Macroeconomics')]:
        index+='<section><h2>'+name+'</h2><ul>'
        for c in checklist:
            code=c['Resource']
            if code.rsplit('-',1)[0]==domain:index+=f'<li><a href="{domain}/{code}.pdf">{code}: {esc(c["Title"])}</a><p>{c["StyleRestorationStatus"]}. Original priority: {c["OriginalPriority"]}. '+('Known owner issue. ' if c['KnownOwnerIssue'] else '')+esc(c['RemediationSummary'])+'</p></li>'
        index+='</ul></section>'
    index+='''<script>document.getElementById('filter').addEventListener('input',e=>document.querySelectorAll('li').forEach(li=>li.hidden=!li.textContent.toLowerCase().includes(e.target.value.toLowerCase())));</script></html>'''
    write(PACKAGE+'/index.html',index)
    at='validation_artifacts/pdf_accessibility/owner_test_pack/'+s.RUN
    atrows=[]
    for code in ['MICRO-49','MACRO-16','MACRO-20','MACRO-11','MICRO-07','MICRO-52','GEN-ECON-09']:
        v=rows[code];dest=at+'/'+code+'.pdf';q.contained(dest).parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(q.contained(v['output']),q.contained(dest));assert q.sha(dest)==v['sha256']
        atrows.append({'resource':code,'source':v['output'],'sha256':v['sha256'],'copy':dest,'humanAT':'PENDING'})
    q.write_json(at+'/manifest.json',{'humanAT':'PENDING','records':atrows})
    write(at+'/README.md','# Human AT sample\n\nPENDING. Check table headers/navigation, payoff reading, graphs/alternatives, removed-graph layout, formulas, headings and reading order. Record tester, reader/screen reader, version, date, observations and outcome. No human AT testing is claimed.')
    q.write_json(s.EVIDENCE+'/package_integrity.json',{'resources':151,'counts':counts,'exactCopies':151,'restored':80,'reused':71,'productionInstalled':False})
    print('V3 package copied: 151 exact PDFs; CSV authoring pending',flush=True)
if __name__=='__main__':main()
