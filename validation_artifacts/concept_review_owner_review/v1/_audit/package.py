"""Read-only project inspection; outputs restricted to this owner-review package."""
import sys,json,hashlib,subprocess,shutil,collections
from pathlib import Path
ROOT=Path(__file__).resolve().parents[4]
sys.path.insert(0,str(ROOT/'audit_tools/pdf_accessibility'))
from repo_guard import root_guard,contained,read_json,sha
from tag_pilot import source_hash,semantic_hash,normalized
from pypdf import PdfReader
from PIL import Image,ImageDraw,ImageFont
root_guard()
OUT=ROOT/'validation_artifacts/concept_review_owner_review/v1'
RUN='validation_artifacts/pdf_accessibility/micro49_unique_nash_v2'
def save(name,value):
    p=OUT/name;p.parent.mkdir(parents=True,exist_ok=True)
    p.write_text(json.dumps(value,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
manifest_path='build/faculty-build-composer/data/concept-reviews/manifest.json'
source_path='build/faculty-build-composer/data/concept-reviews/concept_review_source.json'
semantics_path='build/faculty-build-composer/data/concept-reviews/accessibility_semantics.json'
sources={r['code']:r for r in read_json(source_path)['reviews']}
metadata=read_json(semantics_path)
manifest=read_json(manifest_path)
validation=read_json(RUN+'/final_validation.json');gate=read_json(RUN+'/staged_gate.json')
preview=read_json(RUN+'/installation_preview.json');receipt=read_json(RUN+'/review_receipt.json')
expected={r['code'] for r in manifest['reviews']};assert len(expected)==151
assert {r['code'] for r in validation}==expected and len(validation)==151
assert gate['passed']==151 and gate['blocked']==0 and sha(manifest_path)==gate['manifestSha256']==preview['manifestSha256']
gate_rows={r['code']:r for r in gate['records']};plan={r['code']:r for r in preview['records']}
records=[];details=[];protected={p:sha(p) for p in (manifest_path,source_path,semantics_path)}
for row in validation:
    code=row['code'];source=sources[code];meta=metadata['pilot'][code]
    staged=contained(row['output']);assert staged.is_relative_to(ROOT/'tmp/pdf_accessibility')
    h=sha(staged)
    assert h==row['sha256']==gate_rows[code]['candidateSha256']==plan[code]['sha256']==receipt['records'][code]['sha256']
    assert row['sourceRecordSha256']==source_hash(source) and row['resourceSemanticsSha256']==semantic_hash(metadata,code)
    assert sha(row['validatorReport'])==row['validatorReportSha256']
    jobs=read_json(row['validatorReport'])['report']['jobs']
    jobs=[j for j in jobs if Path(j['itemDetails']['name']).resolve()==staged]
    assert len(jobs)==1 and any(v.get('compliant') is True and 'PDF/UA-1' in v.get('profileName','') for v in jobs[0]['validationResult'])
    assert row['passed'] and row['independentPass'] and not row['projectErrors'] and row['deterministic'] and sha(row['determinismRebuild'])==h
    domain=code.rsplit('-',1)[0];relative=f'{domain}/{code}.pdf';dest=OUT/relative;dest.parent.mkdir(exist_ok=True)
    if dest.exists():assert sha(dest)==h
    else:shutil.copyfile(staged,dest)
    assert sha(dest)==h
    correction=('FINAL_REPORT_micro49_unique_nash_fix.md' if code=='MICRO-49' else
                'FINAL_REPORT_pdf_accessibility_blocked_25.md' if ('blocked_25_v1' in row['output']) else 'FINAL_REPORT_pdf_accessibility_full_batch.md')
    rec={'resourceId':code,'domain':domain,'title':source['title'],'reviewCopyPath':relative,'reviewCopySHA256':h,
         'sourceStagedCandidatePath':staged.relative_to(ROOT).as_posix(),'sourceStagedCandidateSHA256':h,
         'validationEvidence':{'collection':RUN+'/final_validation.json','stagedGate':RUN+'/staged_gate.json','installationPreview':RUN+'/installation_preview.json','rawValidatorReport':row['validatorReport'],'rawValidatorReportSHA256':row['validatorReportSha256'],'sourceRecordSHA256':row['sourceRecordSha256'],'resourceSemanticsSHA256':row['resourceSemanticsSha256']},
         'latestApplicableCorrectionReport':correction,'copyEquality':True,'technicalStatus':'ACCEPTED','ownerApproval':'PENDING'}
    records.append(rec)
    protected[staged.relative_to(ROOT).as_posix()]=h
    for prefix in ('concept-reviews','build/faculty-build-composer/data/concept-reviews'):
        p=f'{prefix}/{code}.pdf'
        if contained(p).exists():protected[p]=sha(p)
    pdf=PdfReader(staged);assert len(pdf.pages)==1
    txt=normalized(pdf.pages[0].extract_text())
    assert normalized(source['content']['worked']) in txt
    render=contained(Path(row['validatorReport']).parent/'rendered_after'/f'{code}.png')
    assert render.exists(),render
    alt=metadata.get('descriptions',{}).get(meta.get('descriptionKey'),meta.get('graphAlternative',''))
    details.append({'code':code,'title':source['title'],'content':source['content'],'pdfText':txt,'graphAlternative':alt,'table':meta.get('tableSource'),
                    'instructionCard':meta.get('instructionCard'),'formulaCard':meta.get('formulaCard'),'renderPath':render.relative_to(ROOT).as_posix()})
order=lambda r:({'GEN-ECON':0,'MICRO':1,'MACRO':2}[r['code'].rsplit('-',1)[0]],r['code'])
details.sort(key=order)
records.sort(key=lambda r:order({'code':r['resourceId']}))
micro=next(r for r in details if r['code']=='MICRO-49')
assert micro['table']['cells']==[['(9, 9)','(2, 3)'],['(3, 2)','(1, 1)']]
assert '(A, X) is the unique Nash equilibrium' in micro['pdfText']
save('candidate_manifest.json',{'task':'CONCEPT_REVIEW_OWNER_QA_V1','resolutionAuthority':RUN,'resourceCount':151,'copyEqualityCount':151,'productionFallbacks':0,'records':records})
save('_audit/details.json',details)
save('_audit/baseline.json',{'root':str(ROOT),'branch':subprocess.check_output(['git','branch','--show-current'],text=True).strip(),'head':subprocess.check_output(['git','rev-parse','HEAD'],text=True).strip(),'protectedHashes':protected})
# Read-only existing validated page renders, arranged solely for inspection.
for batch in range(0,len(details),6):
    canvas=Image.new('RGB',(1800,1620),'#e5e7eb');draw=ImageDraw.Draw(canvas)
    for i,r in enumerate(details[batch:batch+6]):
        image=Image.open(contained(r['renderPath'])).convert('RGB');image.thumbnail((590,775))
        x=(i%3)*600+5;y=(i//3)*810+30
        draw.text((x,y-23),r['code'],fill='black',font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',20))
        canvas.paste(image,(x,y))
    canvas.save(OUT/f'_audit/contact-{batch//6+1:02}.png')
print('151 exact copies; current source, per-resource semantics, accepted hashes and raw validator evidence agree. No production fallback.')
