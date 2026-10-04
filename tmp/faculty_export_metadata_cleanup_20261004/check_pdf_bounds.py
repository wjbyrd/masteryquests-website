import json
from pathlib import Path
import pypdfium2 as pdfium

root=Path(__file__).resolve().parents[2]
summary=json.loads((root/'faculty_exports/validation_summary.json').read_text(encoding='utf-8'))
results={}
for area, info in summary['disciplines'].items():
    images=0; outside=[]; objects=0
    with pdfium.PdfDocument(str(root/'faculty_exports'/info['pdf_file'])) as doc:
        for i in range(len(doc)):
            page=doc[i];w,h=page.get_size()
            for obj in page.get_objects():
                objects+=1
                l,b,r,t=obj.get_bounds()
                if l < -0.5 or b < -0.5 or r > w+0.5 or t > h+0.5:
                    outside.append({'page':i+1,'bounds':[l,b,r,t]})
                if obj.type==pdfium.raw.FPDF_PAGEOBJ_IMAGE:images+=1
            page.close()
    assert not outside, (area,outside[:5])
    assert images==info['questions_with_images'],(area,images)
    results[area]={'pages':info['pdf_pages'],'objects_checked':objects,'objects_outside_page':0,'embedded_graph_occurrences':images}
    print(area,results[area],flush=True)
(Path(__file__).parent/'pdf_bounds.json').write_text(json.dumps(results,indent=2)+'\n',encoding='utf-8')
