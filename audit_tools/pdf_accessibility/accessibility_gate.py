"""Independent inspection/gate. Does not install files or infer accessibility from flags."""
from repo_guard import *
from pypdf import PdfReader
from pypdf.generic import ArrayObject,NumberObject,ContentStream
from semantic_runs import decoded_shows, compact
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
    content={};artifact_text=[];image_uses={};font_report=[]
    for page_index,page in enumerate(reader.pages):
        stack=[];last_key=None;current_font=None;font_stack=[];used_fonts=set()
        ops=ContentStream(page['/Contents'],reader).operations
        try:shows=decoded_shows(page,ops)
        except (ValueError,UnicodeError) as exc:
            return {'errors':['UNSUPPORTED_TEXT_ENCODING: '+str(exc)],'transcript':[]}
        for oi,(args,op) in enumerate(ops):
            if op==b'q':font_stack.append(current_font)
            elif op==b'Q':current_font=font_stack.pop()
            elif op==b'Tf':current_font=str(args[0])
            if op==b'BMC':stack.append((str(args[0]),None))
            elif op==b'BDC':
                prop=args[1];stack.append((str(args[0]),prop.get('/MCID') if hasattr(prop,'get') else None))
            elif op==b'EMC':
                if not stack:errors.append('UNBALANCED_MARKED_CONTENT')
                else:stack.pop()
            elif op in (b'ET',b'T*'):
                if last_key in content:content[last_key]+=' '
            elif op in (b'Tj',b'Do'):
                keys=[mcid for tag,mcid in stack if mcid is not None]
                key=(page_index,int(keys[-1])) if keys else None
                artifact=any(tag=='/Artifact' for tag,mcid in stack)
                if op==b'Do' and key:
                    obj=page['/Resources']['/XObject'][args[0]].get_object()
                    image_uses.setdefault(key,[]).append(hashlib.sha256(obj.get_data()).hexdigest())
                elif op==b'Tj':
                    text=shows[oi][1];used_fonts.add(current_font)
                    if artifact and text.strip():artifact_text.append(clean(text))
                    elif key is None and text.strip():errors.append('UNTAGGED_MEANINGFUL_TEXT')
                    elif key is not None:content[key]=content.get(key,'')+text;last_key=key
        for name in sorted(used_fonts):
            font=page['/Resources']['/Font'][name].get_object()
            fd=font.get('/FontDescriptor');fd=fd.get_object() if fd else {}
            embedded=any(fd.get(k) for k in ('/FontFile','/FontFile2','/FontFile3'))
            font_report.append({'font':str(font.get('/BaseFont')),'embedded':embedded,'unicodeMap':bool(font.get('/ToUnicode'))})
            if not embedded:errors.append('UNEMBEDDED_USED_FONT')
        if stack:errors.append('UNBALANCED_MARKED_CONTENT')
    transcript=[];linked=[];roles=[];figures=[];formulas=[];tables=[];raw_blocks=[]
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
        if '/ActualText' in obj:child_text=str(obj['/ActualText'])
        if role=='/Table':tables.append(obj)
        if role in ('/Figure','/Formula'):
            alt=obj.get('/Alt')
            if not alt:errors.append('MISSING_ALTERNATIVE')
            elif (role=='/Figure' and len(str(alt).strip())<25) or str(alt).strip().lower() in ('image','graph','figure','a supply and demand graph','placeholder'):
                errors.append('PLACEHOLDER_ALTERNATIVE')
            if role=='/Figure':figures.append(str(alt or ''))
            else:formulas.append({'text':clean(child_text),'alternative':str(alt or ''),'parent':str(obj['/P'].get_object().get('/S'))})
            result=str(alt or child_text)
        else:result=child_text
        if role and role not in ('/Document','/L','/LI') and result:
            transcript.append({'role':role,'text':clean(result)})
        if role in ('/H1','/H2','/H3','/P','/LBody','/Lbl'):raw_blocks.append(child_text)
        return child_text
    visit_element(tree.get_object()['/K'])
    if len(linked)!=len(set(linked)):errors.append('DUPLICATE_CONTENT_ASSOCIATION')
    if set(content)-set(linked):errors.append('UNLINKED_MEANINGFUL_BLOCK')
    if any(text not in ('+','?','!','#') for text in artifact_text):errors.append('MEANINGFUL_TEXT_ARTIFACTED')
    logical=compact(' '.join(raw_blocks))
    if source:
        c=source['content']
        expected=[source['title'],source['disciplineLabel'],source['code'],'Time: '+c['time'],'Outcome: '+c['outcome'],'Difficulty: '+c['difficulty'],'THE CORE IDEA',c['core'],'HOW TO RECOGNIZE IT',*c['recognition'],'WATCH OUT',c['watch'],'WORKED EXAMPLE: '+c['workedLabel'],c['worked'],'CHECK YOURSELF',c['check'],'READY?','Return to the game and master this concept.']
        cursor=0
        for text in expected:
            start=logical.find(compact(text),cursor)
            if start<0:errors.append('INCOMPLETE_OR_WRONG_READING_ORDER');break
            cursor=start+len(compact(text))
    if reference:
        before=PdfReader(contained(reference))
        if len(reader.pages)!=len(before.pages):errors.append('PAGE_COUNT_CHANGED')
        else:
            from visual_repairs import approved_text_equal
            if any(clean(a.extract_text())!=clean(b.extract_text()) and not approved_text_equal(b.extract_text(),a.extract_text(),metadata or {}) for a,b in zip(reader.pages,before.pages)):errors.append('CONTENT_CHANGED_OR_DUPLICATED')
            if any(list(a.mediabox)!=list(b.mediabox) for a,b in zip(reader.pages,before.pages)):errors.append('PAGE_GEOMETRY_CHANGED')
    if metadata:
        if source:
            from visual_repairs import validate_bindings,verify_derivation
            errors.extend(validate_bindings(source,metadata))
            if metadata.get('visualRepair'):
                try:verify_derivation(metadata)
                except ValueError as exc:errors.append(str(exc))
        if source:
            from formula_coverage import check
            errors.extend(check(source,metadata))
        if metadata.get('assetSourcePath') and sha(metadata['assetSourcePath'])!=metadata.get('assetSourceSha256'):errors.append('STALE_SOURCE_ASSET_DESCRIPTION')
        expected_alt=metadata.get('graphAlternative')
        if metadata.get('descriptionKey'):
            canonical=read_json('build/faculty-build-composer/data/concept-reviews/accessibility_semantics.json')
            expected_alt=canonical['descriptions'][metadata['descriptionKey']]
        if expected_alt and not metadata.get('tableRequired') and figures!=[expected_alt]:errors.append('FIGURE_ALTERNATIVE_CHANGED')
        fingerprint=metadata.get('graphDecodedSha256')
        if fingerprint and fingerprint not in [h for hashes in image_uses.values() for h in hashes]:errors.append('STALE_OR_UNLINKED_GRAPH')
        expected_formulas=metadata.get('inlineFormulas',[])+metadata.get('formulaCard',[])
        actual=[(compact(f['text']),f['alternative']) for f in formulas]
        expected=[(compact(f['text']),f['alternative']) for f in expected_formulas]
        if sorted(actual)!=sorted(expected):errors.append('FORMULA_STRUCTURE_TEXT_OR_ALTERNATIVE_MISMATCH')
        if any(f['parent'] not in ('/P','/LBody','/H1','/H2','/H3') for f in formulas if (compact(f['text']),f['alternative']) in [(compact(x['text']),x['alternative']) for x in metadata.get('inlineFormulas',[])]):errors.append('INLINE_FORMULA_PARENT_INVALID')
        if metadata.get('tableRequired'):
            if len(tables)!=1:errors.append('MISSING_SEMANTIC_TABLE')
            else:
                table=tables[0];rows=[r.get_object() for r in table['/K'] if r.get_object().get('/S')=='/TR']
                expected=metadata['tableSource'];values=[['',*expected['columnHeaders']]]+[[h,*v] for h,v in zip(expected['rowHeaders'],expected['cells'])]
                if len(rows)!=3 or any(len(r['/K'])!=3 for r in rows):errors.append('TABLE_DIMENSIONS_CHANGED')
                else:
                    ids={}
                    for ri,row in enumerate(rows):
                        for ci,ref in enumerate(row['/K']):
                            cell=ref.get_object();attrs=cell.get('/A',{});attrs=attrs.get_object() if hasattr(attrs,'get_object') else attrs
                            if str(cell.get('/ActualText',''))!=values[ri][ci]:errors.append('TABLE_CELL_VALUE_CHANGED')
                            if (ri==0 and ci) or (ci==0 and ri):
                                expected_id=('col-' if ri==0 else 'row-')+values[ri][ci]
                                if cell.get('/S')!='/TH' or attrs.get('/Scope')!=('/Column' if ri==0 else '/Row') or cell.get('/ID')!=expected_id:errors.append('MISSING_TABLE_HEADERS')
                                ids[expected_id]=ref
                            elif ri and ci:
                                if cell.get('/S')!='/TD' or list(attrs.get('/Headers',[]))!=['row-'+values[ri][0],'col-'+values[0][ci]]:errors.append('BROKEN_TABLE_HEADER_ASSOCIATION')
                    names=tree.get_object().get('/IDTree',{}).get_object().get('/Names',[]) if tree.get_object().get('/IDTree') else []
                    registered={str(names[i]):names[i+1] for i in range(0,len(names),2)}
                    if any(k not in registered or registered[k]!=v for k,v in ids.items()):errors.append('BROKEN_TABLE_HEADER_ID_TREE')
    def runs(obj,parent=None):
        obj=obj.get_object() if hasattr(obj,'get_object') else obj
        if isinstance(obj,ArrayObject):return [r for child in obj for r in runs(child,parent)]
        if isinstance(obj,(int,NumberObject)):
            pg=parent['/Pg'];pi=page_ids[pg.indirect_reference.idnum]
            return [{'role':'Span','text':content.get((pi,int(obj)),''),'sourceText':content.get((pi,int(obj)),'')}]
        role=str(obj.get('/S','')).lstrip('/')
        if role in ('Formula','Figure'):
            raw=''.join(x['sourceText'] for x in runs(obj.get('/K',ArrayObject()),obj))
            return [{'role':role,'text':str(obj.get('/Alt',raw)),'sourceText':raw}]
        if '/ActualText' in obj:return [{'role':role,'text':str(obj['/ActualText']),'sourceText':str(obj['/ActualText'])}]
        return runs(obj.get('/K',ArrayObject()),obj)
    reading=[]
    def blocks(obj):
        obj=obj.get_object() if hasattr(obj,'get_object') else obj
        if isinstance(obj,ArrayObject):
            for child in obj:blocks(child)
        elif hasattr(obj,'get'):
            role=str(obj.get('/S','')).lstrip('/')
            if role in ('Document','L','LI','Table','TR') or not role:blocks(obj.get('/K',ArrayObject()))
            else:
                rr=runs(obj);reading.append({'role':role,'runs':rr,'sourceText':clean(''.join(x['sourceText'] for x in rr)),
                    'text':clean(''.join(x['text'] if x['role']=='Span' else ' '+x['text']+' ' for x in rr))})
    blocks(tree.get_object()['/K'])
    if source:
        expected_headings=[('H1',source['title']),('H2','THE CORE IDEA'),('H2','HOW TO RECOGNIZE IT'),
                           ('H2','WATCH OUT'),('H2','WORKED EXAMPLE: '+source['content']['workedLabel']),
                           ('H2','CHECK YOURSELF'),('H2','READY?')]
        actual_headings=[(b['role'],b['sourceText']) for b in reading if b['role'] in ('H1','H2')]
        if actual_headings!=expected_headings:errors.append('HEADING_STRUCTURE_CHANGED')
        card=(metadata or {}).get('instructionCard')
        from tag_pilot import card_items
        expected_items=[clean(text) for _,text in card_items(card)] if card else []
        if roles.count('/L')!=1+bool(card) or roles.count('/LI')!=len(source['content']['recognition'])+len(expected_items):errors.append('LIST_STRUCTURE_CHANGED')
        if card:
            sequence=[b['sourceText'] for b in reading]
            try:
                pos=sequence.index(card['heading'])
                if sequence[pos+1:pos+1+len(expected_items)]!=expected_items:errors.append('CARD_READING_ORDER_CHANGED')
            except ValueError:errors.append('MISSING_INSTRUCTION_CARD')
    return {'errors':sorted(set(errors)),'transcript':reading,'roles':roles,'linkedContentCount':len(linked),'figureAlternatives':figures,'formulas':formulas,'fonts':font_report,'rawReadingSequence':[clean(x) for x in raw_blocks]}

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
    registry=contained('build/faculty-build-composer/data/concept-reviews/accessibility_releases.json')
    if release_evidence is None:release_evidence=read_json(registry) if registry.exists() else {}
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
