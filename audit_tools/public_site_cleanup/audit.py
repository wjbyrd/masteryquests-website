"""Read-only publication inventory for the LMS / converter / About cleanup."""
from pathlib import Path
from lxml import html
from zipfile import ZipFile
import xml.etree.ElementTree as ET
import json,re

root=Path.cwd();dist=root/'dist';out=root/'validation_artifacts/public_site_cleanup_lms_ai'
remaining=[];converter=[];links=[];docs=[]
for p in dist.rglob('*'):
    if not p.is_file():continue
    rel=p.relative_to(dist).as_posix()
    if re.search(r'canvas[- _]quiz[- _]converter',rel,re.I):converter.append(rel)
    if p.suffix=='.html':
        tree=html.fromstring(p.read_text(encoding='utf-8-sig'))
        for n in tree.xpath('//script|//style'):n.drop_tree()
        for n in tree.xpath('//text()|//meta/@content|//@title|//@aria-label|//@alt'):
            text=' '.join(str(n).split())
            if re.search(r'\bCanvas\b',text,re.I):remaining.append({'file':rel,'text':text,'reason':'Dedicated Canvas-specific embedding guide or explicitly labeled link to that guide.'})
            assert not re.search(r'quiz converter|\bQTI\b',text,re.I),(rel,text)
        for value in tree.xpath('//@href|//@src'):
            assert not re.search(r'canvas[- _]quiz[- _]converter',value,re.I),(rel,value)
            if re.search(r'canvas',value,re.I):links.append({'file':rel,'reference':value,'reason':'Existing Canvas-specific guide URL / anchor; preserved to avoid breaking legitimate technical links.'})
    elif p.suffix in ['.docx','.xlsx']:
        with ZipFile(p) as z:
            members=[n for n in z.namelist() if n.endswith('.xml') and (n.startswith('word/') or n.startswith('xl/'))]
            text=' '.join(' '.join(ET.fromstring(z.read(n)).itertext()) for n in members)
        matches=re.findall(r'.{0,60}(?:\bCanvas\b|quiz converter|\bQTI\b).{0,80}',text,re.I)
        docs.append({'file':rel,'matches':matches})
        assert not matches,(rel,matches)
assert not converter
assert all(r['file'] in ['how-to/canvas/index.html','how-to/index.html','how-to/composer/index.html'] for r in remaining),remaining
for rel in ['tools/question-bank-validator/index.html','tools/question-bank-validator/validator.js','downloads/resources/faculty-question-bank-validator.xlsx','downloads/resources/mastery-quests-faculty-template.html','downloads/resources/mastery-quests-faculty-starter.html','downloads/resources/faculty-question-package-blank.json','downloads/resources/faculty-question-package-example.json','downloads/resources/manual-faculty-guide.html']:
    assert (dist/rel).exists(),rel
assert 'AI as a co-creator' in (dist/'about/index.html').read_text()
inventory=[p.as_posix() for base in [Path('tools'),Path('downloads')] for p in base.rglob('*') if p.is_file() and re.search(r'canvas[- _]quiz[- _]converter',p.as_posix(),re.I)]
result={'status':'PASS','remainingCanvasCopy':remaining,'retainedCanvasPaths':links,'publicConverterFiles':converter,'retainedConverterSource':inventory,'downloadableTextAudit':docs,'validatorAndTemplatePresent':True}
(out/'publication-audit.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
print(json.dumps({'status':'PASS','remainingCanvasCopy':len(remaining),'retainedConverterSource':inventory,'converterPublished':len(converter),'downloadableDocumentsChecked':len(docs)},indent=2))
