from repo_guard import *
from urllib.parse import urlsplit,unquote
from collections import defaultdict,Counter
import re
root=root_guard()
tracked=subprocess.check_output(['git','-C',str(root),'ls-files','-z']).decode().split('\0')
active_prefixes=('about/','assets/js/','build/faculty-build-composer/','games/','how-to/','play/','resources/','downloads/','previews/','evidence/')
excluded=('/tests/','/calibration','/final-','/full-library-production/','/question-assets/','/data/concept-reviews/')
references=defaultdict(list);concept_referrers=[];external=[];unresolved=[]
for relative in tracked:
    if not relative.endswith(('.html','.js','.mjs','.json')):continue
    if relative!='index.html' and not relative.startswith(active_prefixes):continue
    if any(x in relative for x in excluded):continue
    text=contained(relative).read_text(encoding='utf-8',errors='replace')
    if re.search(r'concept.review|conceptReview|GEN-ECON-\d\d\.pdf|MACRO-\d\d\.pdf|MICRO-\d\d\.pdf',text,re.I):
        concept_referrers.append({'path':relative,'literalPdfCodes':sorted(set(re.findall(r'(?:GEN-ECON|MACRO|MICRO)-\d\d(?=\.pdf)',text))),'runtimeReference':bool(re.search(r'concept.review|conceptReview',text,re.I))})
    for match in re.finditer(r'''["']([^"'<>\n]+?\.pdf(?:[?#][^"'<>\n]*)?)["']''',text,re.I):
        target=match.group(1)
        if len(target)>500 or any(x in target for x in ('{','}','\\n','function',';')):continue
        parsed=urlsplit(target)
        if parsed.scheme and parsed.scheme not in ('http','https'):
            unresolved.append({'referrer':relative,'target':target,'reason':'Non-web scheme; not followed'});continue
        if parsed.netloc and parsed.netloc.lower() not in ('masteryquests.org','www.masteryquests.org'):
            external.append({'referrer':relative,'url':target});continue
        path=unquote(parsed.path)
        candidate=(root/path.lstrip('/')) if path.startswith('/') or parsed.netloc else (contained(relative).parent/path)
        try:candidate=contained(candidate.resolve(strict=False))
        except ValueError:
            unresolved.append({'referrer':relative,'target':target,'reason':'Outside repository; not followed'});continue
        if not candidate.is_file():
            unresolved.append({'referrer':relative,'target':target,'reason':'Literal path missing or generated package-relative reference'});continue
        references[str(candidate.relative_to(root)).replace('\\','/')].append(relative)
other=[]
from pypdf import PdfReader
for relative,referrers in sorted(references.items()):
    if re.search(r'(?:^|/)concept-reviews/(?:GEN-ECON|MICRO|MACRO)-\d\d\.pdf$',relative):continue
    path=contained(relative)
    try:
        reader=PdfReader(path)
        item={'path':relative,'sha256':sha(path),'pages':len(reader.pages),'structTreeRoot':bool(reader.trailer['/Root'].get('/StructTreeRoot')),'language':str(reader.trailer['/Root'].get('/Lang')),'title':reader.metadata.title,'producer':reader.metadata.producer}
    except Exception as e:item={'path':relative,'error':str(e)}
    item.update({'referrers':sorted(set(referrers)),'activeUseEvidence':'Literal reference in current site/Composer source; not a browser reachability proof','sourceOwnership':'First-party hosting; authoring ownership must be confirmed from maintained source','remainingGap':'Outside remediation scope; no independent PDF/UA validation or semantic/AT review performed in this run'})
    other.append(item)
write_json('validation_artifacts/pdf_accessibility/public_pdf_references.json',{'method':'Current first-party site/Composer HTML, JS and JSON literal PDF links; excludes historical production directories and tests. Dynamic/encoded and package-relative references separately flagged; no external PDFs fetched.','otherFirstPartyPdfs':other,'conceptReviewReferrers':concept_referrers,'externalReferences':external,'unresolvedReferences':unresolved})
inv=read_json('validation_artifacts/pdf_accessibility/inventory.json')
for r in inv['records']:
    r['referringSourceFiles']=[x['path'] for x in concept_referrers if r['code'] in x['literalPdfCodes']]
    r['routingSource']='build/faculty-build-composer/composer-core.js: resolveConceptReviews; manifest canonicalConceptIds'
    r['generator']='ReportLab baseline; full renderer not present for original 116 sheets' if any(f['baseFont'].startswith('/AAAAAA+Arimo') for f in r['copies'][0]['fonts']) else ('build/faculty-build-composer/tools/expand_micro_concept_reviews.py' if r['code'].startswith('MICRO') else 'build/faculty-build-composer/tools/complete_macro_concept_reviews.py')
    r['semanticReview']='PENDING except the explicitly documented pilot review'
    r['formulaInventoryStatus']='hasCalculation source flag is a screening field, not an exhaustive formula inventory'
    r['tableInventoryStatus']='Image-based tables require visual classification; MICRO-49 pilot confirms a genuine payoff table'
inv['summary']['expectedCopies']=inv['summary'].pop('copies')
inv['summary']['existingCopies']=sum(not c.get('missing',False) for r in inv['records'] for c in r['copies'])
inv['summary']['missingCopies']=[c['path'] for r in inv['records'] for c in r['copies'] if c.get('missing')]
inv['summary']['unequalExistingCopies']=[r['code'] for r in inv['records'] if all(not c.get('missing') for c in r['copies']) and not r['copiesEqual']]
write_json('validation_artifacts/pdf_accessibility/inventory.json',inv)
print('Other literal first-party PDFs',len(other),'concept referrers',len(concept_referrers),'unresolved references',len(unresolved))
print('Other PDF paths',[x['path'] for x in other])
print('Concept review caller files',[x['path'] for x in concept_referrers if x['path'].startswith('play/')])