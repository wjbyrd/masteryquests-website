"""Independent inspection/gate. Does not install files or infer accessibility from flags."""
from repo_guard import *
from pypdf import PdfReader
from pypdf.generic import ArrayObject,NumberObject
import re

def clean(s):return re.sub(r'\s+',' ',s).strip()

def inspect(path,source=None,reference=None,metadata=None):
    path=contained(path);errors=[]
    reader=PdfReader(path,strict=True);catalog=reader.trailer['/Root']
    if not catalog.get('/Lang'):errors.append('MISSING_LANGUAGE')
    if not reader.metadata or not reader.metadata.title:errors.append('MISSING_TITLE')
    tree=catalog.get('/StructTreeRoot')
    if not tree or not tree.get_object().get('/K'):
        return {'errors':errors+['MISSING_REAL_STRUCTURE'],'transcript':[]}
    content={};artifact_text=[];image_uses={}
    for page_index,page in enumerate(reader.pages):
        stack=[]
        def before(op,args,cm,tm):
            if op==b'BMC':stack.append((str(args[0]),None))
            elif op==b'BDC':
                prop=args[1]
                stack.append((str(args[0]),prop.get('/MCID') if hasattr(prop,'get') else None))
            elif op==b'EMC':
                if not stack:errors.append('UNBALANCED_MARKED_CONTENT')
                else:stack.pop()
            elif op==b'Do':
                keys=[mcid for tag,mcid in stack if mcid is not None]
                if keys:
                    obj=page['/Resources']['/XObject'][args[0]].get_object()
                    image_uses.setdefault((page_index,int(keys[-1])),[]).append(hashlib.sha256(obj.get_data()).hexdigest())
        def visit(text,cm,tm,font,size):
            if not text.strip():return
            if any(tag=='/Artifact' for tag,mcid in stack):artifact_text.append(clean(text))
            else:
                keys=[mcid for tag,mcid in stack if mcid is not None]
                if not keys:errors.append('UNTAGGED_MEANINGFUL_TEXT')
                else:
                    key=(page_index,int(keys[-1]));content[key]=content.get(key,'')+text
        page.extract_text(visitor_operand_before=before,visitor_text=visit)
        if stack:errors.append('UNBALANCED_MARKED_CONTENT')
    transcript=[];linked=[];roles=[];figures=[]
    page_ids={p.indirect_reference.idnum:i for i,p in enumerate(reader.pages)}
    seen=set()
    def visit_element(obj,parent=None):
        obj=obj.get_object() if hasattr(obj,'get_object') else obj
        if isinstance(obj,ArrayObject):
            return ''.join(visit_element(k,parent) for k in obj)
        if isinstance(obj,(int,NumberObject)):
            if parent is None:return ''
            pg=parent.get('/Pg')
            if pg is None:errors.append('MISSING_PAGE_ASSOCIATION');return ''
            pi=page_ids.get(pg.indirect_reference.idnum if hasattr(pg,'indirect_reference') else pg.idnum)
            key=(pi,int(obj));linked.append(key)
            if key not in content and key not in image_uses:errors.append('BROKEN_CONTENT_ASSOCIATION')
            return content.get(key,'')
        if not hasattr(obj,'get'):errors.append('INVALID_STRUCTURE_OBJECT');return ''
        role=str(obj.get('/S',''))
        if role:roles.append(role)
        child_text=visit_element(obj.get('/K',ArrayObject()),obj)
        if role in ('/Figure','/Formula'):
            alt=obj.get('/Alt')
            if not alt:errors.append('MISSING_ALTERNATIVE')
            elif len(str(alt).strip())<25 or str(alt).strip().lower() in ('image','graph','figure','a supply and demand graph','placeholder'):
                errors.append('PLACEHOLDER_ALTERNATIVE')
            if role=='/Figure':figures.append(str(alt or ''))
            result=str(alt or child_text)
        else:result=child_text
        if role and role not in ('/Document','/L','/LI') and result:
            transcript.append({'role':role,'text':clean(result)})
        return result+' '
    visit_element(tree.get_object()['/K'])
    if len(linked)!=len(set(linked)):errors.append('DUPLICATE_CONTENT_ASSOCIATION')
    if set(content)-set(linked):errors.append('UNLINKED_MEANINGFUL_BLOCK')
    if any(text not in ('+','?','!','#') for text in artifact_text):errors.append('MEANINGFUL_TEXT_ARTIFACTED')
    logical=' '.join(x['text'] for x in transcript)
    if source:
        c=source['content']
        expected=[source['title'],source['disciplineLabel'],source['code'],'Time: '+c['time'],'Outcome: '+c['outcome'],'Difficulty: '+c['difficulty'],'THE CORE IDEA',c['core'],'HOW TO RECOGNIZE IT',*c['recognition'],'WATCH OUT',c['watch'],'WORKED EXAMPLE: '+c['workedLabel'],c['worked'],'CHECK YOURSELF',c['check'],'READY?','Return to the game and master this concept.']
        cursor=0
        for text in expected:
            start=logical.find(clean(text),cursor)
            if start<0:errors.append('INCOMPLETE_OR_WRONG_READING_ORDER');break
            cursor=start+len(clean(text))
    if reference:
        before=PdfReader(contained(reference))
        if len(reader.pages)!=len(before.pages):errors.append('PAGE_COUNT_CHANGED')
        else:
            if any(a.extract_text()!=b.extract_text() for a,b in zip(reader.pages,before.pages)):errors.append('CONTENT_CHANGED_OR_DUPLICATED')
            if any(list(a.mediabox)!=list(b.mediabox) for a,b in zip(reader.pages,before.pages)):errors.append('PAGE_GEOMETRY_CHANGED')
    if metadata:
        fingerprint=metadata.get('graphDecodedSha256')
        if fingerprint and fingerprint not in [h for hashes in image_uses.values() for h in hashes]:errors.append('STALE_OR_UNLINKED_GRAPH')
        if metadata.get('tableRequired') and ('/Table' not in roles or '/TH' not in roles):errors.append('MISSING_TABLE_HEADERS')
    return {'errors':sorted(set(errors)),'transcript':transcript,'roles':roles,'linkedContentCount':len(linked),'figureAlternatives':figures}

def check_copies(paths,expected_sha,expected_size):
    errors=[];hashes=[]
    for value in paths:
        path=contained(value)
        if not path.is_file():errors.append('MISSING_OUTPUT');continue
        digest=sha(path);hashes.append(digest)
        if digest!=expected_sha:errors.append('MANIFEST_CHECKSUM_MISMATCH')
        if path.stat().st_size!=expected_size:errors.append('MANIFEST_SIZE_MISMATCH')
    if len(hashes)==2 and hashes[0]!=hashes[1]:errors.append('ACTIVE_COPY_MISMATCH')
    return sorted(set(errors)),hashes

def active_gate(manifest,release_evidence=None):
    release_evidence=release_evidence or {}
    rows=[]
    sources={r['code']:r for r in read_json('build/faculty-build-composer/data/concept-reviews/concept_review_source.json')['reviews']}
    semantics=read_json('build/faculty-build-composer/data/concept-reviews/accessibility_semantics.json')['pilot']
    for r in manifest['reviews']:
        paths=[contained(prefix+r['pdfPath']) for prefix in ('concept-reviews/','build/faculty-build-composer/data/concept-reviews/')]
        errors,copies=check_copies(paths,r['sha256'],r['sizeBytes'])
        for path in paths:
            if not path.is_file():continue
            reader=PdfReader(path)
            tree=reader.trailer['/Root'].get('/StructTreeRoot')
            if not tree or not tree.get_object().get('/K'):errors.append('MISSING_REAL_STRUCTURE')
        source=sources.get(r['code']);semantic=semantics.get(r['code'])
        if not source:errors.append('NEW_OR_UNAUTHORED_DOCUMENT')
        if not semantic:errors.append('NO_REVIEWED_SEMANTIC_SOURCE')
        if source and semantic:
            digest=hashlib.sha256(json.dumps(source,sort_keys=True,ensure_ascii=False).encode()).hexdigest()
            if digest!=semantic.get('sourceRecordSha256'):errors.append('STALE_SEMANTIC_SOURCE')
            canonical=contained('build/faculty-build-composer/data/concept-reviews/'+r['pdfPath'])
            if canonical.is_file():errors.extend(inspect(canonical,source,metadata=semantic)['errors'])
        evidence=release_evidence.get(r['code'])
        if not evidence:errors.append('NO_VALIDATED_RELEASE_EVIDENCE')
        else:
            # Require the raw independent report, bound to the exact current
            # bytes by retained release evidence. Booleans alone cannot pass.
            report_path=evidence.get('validatorReport')
            if not report_path or not contained(report_path).is_file():
                errors.append('MISSING_INDEPENDENT_VALIDATOR_REPORT')
            else:
                raw=read_json(report_path)
                jobs=raw.get('report',{}).get('jobs',[])
                valid=[j for j in jobs if Path(j.get('itemDetails',{}).get('name','')).name==Path(r['pdfPath']).name and any(v.get('compliant') is True and 'PDF/UA-1' in v.get('profileName','') for v in j.get('validationResult',[]))]
                if not valid:errors.append('INDEPENDENT_VALIDATION_NOT_PASSED')
                if sha(report_path)!=evidence.get('validatorReportSha256'):errors.append('VALIDATOR_REPORT_CHANGED')
            if evidence.get('sha256')!=r['sha256']:errors.append('STALE_VALIDATION_EVIDENCE')
            if evidence.get('profile')!='ISO 14289-1:2014' or evidence.get('independentValidator')!='veraPDF':errors.append('WRONG_VALIDATOR_PROFILE')
            for field in ('independentValidationPassed','semanticReviewPassed','contentPreservationPassed','graphIdentityPassed','renderComparisonPassed'):
                if evidence.get(field) is not True:errors.append('INCOMPLETE_'+field.upper())
        rows.append({'code':r['code'],'status':'FAIL' if errors else 'PASS','errors':sorted(set(errors))})
    return rows

if __name__=='__main__':
    root_guard()
    manifest=read_json('build/faculty-build-composer/data/concept-reviews/manifest.json')
    rows=active_gate(manifest)
    write_json('validation_artifacts/pdf_accessibility/active_gate.json',{'task':TASK,'status':'FAIL' if any(r['status']=='FAIL' for r in rows) else 'PASS','records':rows})
    print('Active accessibility release gate:',sum(r['status']=='PASS' for r in rows),'/',len(rows),'PASS')
    raise SystemExit(1 if any(r['status']=='FAIL' for r in rows) else 0)