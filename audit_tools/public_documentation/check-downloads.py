"""Read-only guards for the four current downloadable teaching guides."""
from pathlib import Path
from zipfile import ZipFile
import xml.etree.ElementTree as ET
import json,os
repo=Path(os.environ.get('MQ_DOC_REPO_ROOT',Path(__file__).resolve().parents[2]))
names=['faculty-composer-quick-start-guide.docx','faculty-game-overview-guide.docx','faculty-implementation-guide.docx','student-instructions-and-faculty-customization-checklist.docx']
results=[]
for name in names:
    with ZipFile(repo/'downloads/resources'/name) as archive:
        root=ET.fromstring(archive.read('word/document.xml'))
    text=' '.join(n.text or '' for n in root.iter() if n.tag.endswith('}t'))
    assert '30-room practice path' not in text and 'without checkpoints, milestones' not in text,name
    assert 'checkpoint commitment' in text and 'classroom research' in text,name
    assert 'https://masteryquests.org/how-to/learning-outcomes/' in text,name
    if name in (names[0],names[2]):
        tables=[' '.join(n.text or '' for n in table.iter() if n.tag.endswith('}t')) for table in root.iter() if table.tag.endswith('}tbl')]
        steps=next(t for t in tables if 'Game details' in t)
        positions=[steps.index(t) for t in ['Concepts and scope','Game details','Modes','Checkpoints','Appearance']]
        assert positions==sorted(positions),name
        assert all(t in text for t in ['Brief','Standard','Full','Custom']),name
    results.append({'file':name,'status':'PASS'})
print(json.dumps(results,indent=2))
