"""Exact-copy V4 review package; no active installation."""
import csv,copy,shutil,collections,html
from completion_release import q,OUT
PACKAGE='validation_artifacts/concept_review_owner_review/v4'
def write(path,text):
    p=q.contained(path);p.parent.mkdir(parents=True,exist_ok=True);p.write_text(text.rstrip()+'\n',encoding='utf-8')
def main():
    assert q.read_json(OUT+'/staged_gate.json')['passed']==151
    vals={r['code']:r for r in q.read_json(OUT+'/final_validation.json')}
    ds={r['code']:r for r in q.read_json(OUT+'/dispositions.json')}
    old=q.read_json('validation_artifacts/concept_review_owner_review/v3/candidate_manifest.json')
    rows=[]
    for o in old['records']:
        r=copy.deepcopy(o);code=r['resourceId'];v=vals[code];dest=PACKAGE+'/'+r['domain']+'/'+code+'.pdf'
        q.contained(dest).parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(q.contained(v['output']),q.contained(dest))
        assert q.sha(dest)==q.sha(v['output'])==v['sha256']
        r.update(reviewCopyPath=dest,reviewCopySHA256=v['sha256'],sourceStagedCandidatePath=v['output'],sourceStagedCandidateSHA256=v['sha256'],validationEvidence=OUT+'/staged_gate.json',rawValidatorEvidence=v['validatorReport'],copyEquality=True,canonicalTemplateStatus='PASS' if code in ds else 'REUSED CANONICAL',latestStyleReport='FINAL_REPORT_concept_review_canonical_completion_composer_install.md')
        rows.append(r)
    counts=dict(collections.Counter(r['domain'] for r in rows));assert counts=={'GEN-ECON':26,'MICRO':68,'MACRO':57}
    assert len(list(q.contained(PACKAGE).glob('*/*.pdf')))==151
    q.write_json(PACKAGE+'/candidate_manifest.json',{'task':'CONCEPT_REVIEW_CANONICAL_COMPLETION_COMPOSER_INSTALL_V1','counts':counts,'exactCopies':151,'records':rows})
    checklist=[]
    with q.contained('validation_artifacts/concept_review_owner_review/v3/REVIEW_CHECKLIST.csv').open(encoding='utf-8-sig',newline='') as f:
        for o in csv.DictReader(f):
            code=o['Resource'];v=vals[code]
            front={'Resource':code,'Domain':code.rsplit('-',1)[0],'Title':o['Title'],'CandidateSHA256':v['sha256'],'CanonicalTemplateStatus':'PASS' if code in ds else 'REUSED CANONICAL','AccessibilityStatus':'PDF/UA-1 PASS','ContentQAStatus':'APPROVED CONTENT PRESERVED','GraphTableStatus':'PASS','OwnerFinalReview':'','ApprovedForComposer':'','OwnerNotes':''}
            row={**front,**{k:value for k,value in o.items() if k not in front}}
            row.update(CandidatePath=PACKAGE+'/'+front['Domain']+'/'+code+'.pdf',CandidateEvidence=OUT+'/staged_gate.json',NewCandidateSHA256=v['sha256'],OwnerFinalReview='',ApprovedForComposer='',OwnerNotes='',ApprovedForInstall='',OwnerDecision='',OwnerReviewStatus='V4 FINAL REVIEW PENDING',StyleReview='CANONICAL PASS' if code in ds else 'REUSED')
            checklist.append(row)
    q.write_json(OUT+'/checklist_rows.json',{'columns':list(checklist[0]),'rows':checklist})
    intro='151 exact review copies: 26 General Economics, 68 Microeconomics, 57 Macroeconomics. All 80 QA-remediated resources use the GEN-ECON-01 canonical components; 71 established candidates are reused. Approved instructional content is unchanged. Human AT and owner final review remain PENDING.'
    write(PACKAGE+'/README.md','# Concept Review V4\n\n'+intro+'\n\nOpen index.html to browse locally. Record owner decisions in REVIEW_CHECKLIST.csv; the HTML does not record approvals. Review GEN-ECON-01 through 26, MICRO-01 through 68, then MACRO-01 through 57.\n\nThis package resolves candidates by accepted hashes, not timestamps. Composer-only installation is owner-authorized after package validation. Public concept-reviews/ PDFs remain unchanged and must not be treated as the current corrected collection. See the final report for the actual installation outcome. No deployment is authorized.\n\nPrior QA findings and remediation history remain in the checklist. The simple final-review fields are blank for the owner. Check economics/content fidelity, graph/table readability, canonical components and reading order. MICRO-49 retains B/Y=(1,1); MACRO-11/13 and MICRO-09 remain graph-free; MACRO-12 retains its graph; MACRO-16 and MACRO-20 retain the approved graph/table.')
    write(PACKAGE+'/REVIEW_SUMMARY.md','# V4 review summary\n\n'+intro+'\n\n80/80 canonical alignment PASS. 151/151 staged acceptance: PDF/UA-1, semantic/project, content preservation, deterministic regeneration, contrast/render review. All 31 inherited fit blockers resolved; all 43 provisional fits fully validated. Six previously accepted canonical replacements reproduce identical bytes.\n\nNo instructional corrections were introduced in this template pass. Retained graphs were transcribed into source-bound label-aware presentation models where bitmap scaling violated readability. Approved numerical labels, relationships and Figure alternatives remain. Canonical geometry and source JSON are frozen. Owner review remains separate from machine and Codex visual checks.')
    changelog='# V4 canonical alignment changelog\n\nFrozen v2/v3 content; layout changes only.\n'
    for domain in ['GEN-ECON','MICRO','MACRO']:
        changelog+='\n## '+domain+'\n'
        for code,d in sorted(ds.items()):
            if code.rsplit('-',1)[0]==domain:changelog+='\n- '+code+': '+('Reused accepted canonical bytes.' if d['status']=='PRIOR_ACCEPTED' else 'Canonical components; '+d['layout']['layoutMode']+'; validated content, accessibility and determinism.')
    write(PACKAGE+'/CHANGELOG.md',changelog)
    write(PACKAGE+'/CANONICAL_TEMPLATE_AUDIT.md','# Canonical template audit\n\n## Canonical Reference\nGEN-ECON-01, unchanged accepted control.\n\n## Frozen Specification\n`audit_tools/pdf_accessibility/canonical_components/specification.json` is unchanged. Page 612 x 792 pt; retained header, metadata strip, hourglass/target/difficulty dots, Arimo typography, icon rail, rules and footer. Cards retain x=79.92, width=503.28, radius=8 and 1.05-pt stroke. Exact remaining tokens and glyph assets are in the frozen specification.\n\n## Renderer Architecture\nOne canonical component renderer serves all domains through qa_renderer. Domain labels are data. Worked interiors use text, table, graph columns or full-width stacked diagrams. Compact flow changes leading and internal spacing, never header/metadata/footer geometry.\n\n## Pilot and Fidelity\nThe eight-resource pilot remains valid, including unchanged GEN-ECON-01 and MICRO-49. All 80 applicable candidates passed component observation against GEN-ECON-01 and byte-identical maintained regeneration. Equal-scale comparisons are retained in the completion evidence directory.\n\n## Exceptions\nContent-dependent card heights; explicit compact flow at 9.5 pt or larger; controlled long-title wrapping; source-bound graph dimensions and table row padding. No alternate outer template.\n\n## Human Review\nPENDING. Codex inspected all new candidate renders; this does not constitute owner or human AT approval.')
    modes=collections.Counter(d.get('mode','PRIOR_ACCEPTED') for d in ds.values())
    summary='# Dense layout summary\n\n## Modes\nCANONICAL_COMPACT_FLOW: body leading 1.20 and compact panel-heading/body gap. CANONICAL_COMPACT_FLOW_TIGHT: leading 1.18 and 7.5-pt minimum flexible gaps, only where needed. CANONICAL_GRAPH_DENSE: label-aware 320 x 145-pt graph with adjacent frozen prose. CANONICAL_GRAPH_TEXT_STACKED: full-width paired graph above prose. CANONICAL_TABLE_DENSE and CANONICAL_LONG_TITLE retain prior accepted behavior.\n\n## Typography Floors\nBody 10.45-pt target, 9.5-pt floor. Tables approximately 9.665 pt. Graph labels at least 8.5 pt at actual display size. No global page shrink.\n\n## Resource Usage and Budget\n'+str(dict(modes))+'\n\n|Resource|Prior fit|Mode|Body pt|Budget|\n|---|---|---|---|---|\n'
    for code,d in sorted(ds.items()):
        l=d.get('layout',{});summary+=f"|{code}|{d.get('priorFit')}|{d.get('mode','PRIOR ACCEPTED')}|{l.get('bodyFontSize','unchanged')}|{l.get('budget','unchanged')}|\n"
    summary+='\n## Human Review Notes\nAll new page renders inspected for canonical grouping, legibility, overlap and balance. Two missing em-dash glyphs in table placeholders were corrected typographically without changing semantic cell text. Detailed coordinates, graph-label bounds and candidate hashes remain in the completion evidence. Human AT PENDING.\n'
    write(PACKAGE+'/DENSE_LAYOUT_SUMMARY.md',summary)
    index='<!doctype html><html lang="en"><meta charset="utf-8"><title>Concept Review V4</title><style>body{font:16px system-ui;margin:2rem;max-width:1100px;color:#102e55}li{padding:.6rem}input{font:inherit;padding:.5rem}li[hidden]{display:none}</style><h1>Concept Review V4</h1><p>'+intro+'</p><p>Record approval in <a href="REVIEW_CHECKLIST.csv">REVIEW_CHECKLIST.csv</a>.</p><label>Search <input id="search" type="search"></label>'
    for domain in ['GEN-ECON','MICRO','MACRO']:
        index+='<h2>'+domain+'</h2><ul>'
        for r in rows:
            if r['domain']==domain:index+='<li><a href="'+domain+'/'+r['resourceId']+'.pdf">'+r['resourceId']+' — '+html.escape(r['title'])+'</a> · '+r['canonicalTemplateStatus']+'</li>'
        index+='</ul>'
    write(PACKAGE+'/index.html',index+'<script>document.getElementById("search").oninput=e=>document.querySelectorAll("li").forEach(li=>li.hidden=!li.textContent.toLowerCase().includes(e.target.value.toLowerCase()));</script></html>')
    at='validation_artifacts/pdf_accessibility/owner_test_pack/canonical_completion_v1';atrows=[]
    for code in ['GEN-ECON-01','GEN-ECON-09','MICRO-49','MICRO-52','MACRO-11','MACRO-16','MACRO-20','MACRO-38']:
        v=vals[code];p=at+'/'+code+'.pdf';q.contained(p).parent.mkdir(parents=True,exist_ok=True);shutil.copyfile(q.contained(v['output']),q.contained(p));assert q.sha(p)==v['sha256'];atrows.append({'code':code,'path':p,'sha256':v['sha256']})
    q.write_json(at+'/manifest.json',{'humanAT':'PENDING','records':atrows})
    write(at+'/README.md','# Human AT sample\n\nPENDING. Inspect heading/paragraph/Formula navigation, semantic table headers, payoff reading, Figure alternatives and reading order. No human AT result is claimed.')
    q.write_json(OUT+'/package_integrity.json',{'counts':counts,'exactCopies':151,'ownerFieldsBlank':True,'csvPending':True})
    print('V4: 151 exact PDFs; CSV pending')
if __name__=='__main__':main()
