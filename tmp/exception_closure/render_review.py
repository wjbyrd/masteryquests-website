import json,re
from PIL import Image,ImageDraw
import pypdfium2 as p
d=p.PdfDocument('faculty_exports/general_economics_question_bank.pdf')
ids=[x['id'] for x in json.load(open('tmp/exception_closure/changes.json',encoding='utf-8'))]
found={}
for i in range(len(d)):
 t=d[i].get_textpage().get_text_bounded()
 for qid in re.findall(r'Question ID:\s*([^\s]+)',t):
  if qid in ids:found[qid]=i+1
pages=list(dict.fromkeys([1,2]+[found[qid] for qid in ids]))
json.dump({'ids':found,'pages':pages},open('tmp/exception_closure/visual_pages.json','w'),indent=2)
for s in range(0,len(pages),4):
 canvas=Image.new('RGB',(1400,1880),'#d7dce4')
 for j,n in enumerate(pages[s:s+4]):
  im=d[n-1].render(scale=1.4).to_pil();im.thumbnail((680,890));x=(j%2)*700+10;y=(j//2)*940+35;canvas.paste(im,(x,y));ImageDraw.Draw(canvas).text((x,y-25),'General Economics page '+str(n),fill='black')
 canvas.save('tmp/exception_closure/pdf-review-'+str(s//4)+'.png')
for name in ['microeconomics','macroeconomics']:
 dd=p.PdfDocument('faculty_exports/'+name+'_question_bank.pdf');dd[0].render(scale=1.1).to_pil().save('tmp/exception_closure/'+name+'-review.png')
print(json.dumps({'pages':pages,'sheets':(len(pages)+3)//4,'targets_found':len(found)}))
