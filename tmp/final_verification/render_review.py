import json
from PIL import Image,ImageDraw
import pypdfium2 as p
d=p.PdfDocument('faculty_exports/general_economics_question_bank.pdf')
pages=json.load(open('tmp/final_verification/visual_pages.json'))
for s in range(0,len(pages),4):
 canvas=Image.new('RGB',(1400,1880),'#d7dce4')
 for j,n in enumerate(pages[s:s+4]):
  page=d[n-1];im=page.render(scale=1.4).to_pil();im.thumbnail((680,890));x=(j%2)*700+10;y=(j//2)*940+35;canvas.paste(im,(x,y));ImageDraw.Draw(canvas).text((x,y-25),'General Economics page '+str(n),fill='black')
 canvas.save('tmp/final_verification/pdf-review-'+str(s//4)+'.png')
for name in ['microeconomics','macroeconomics']:
 d=p.PdfDocument('faculty_exports/'+name+'_question_bank.pdf');im=d[3].render(scale=1.3).to_pil();im.save('tmp/final_verification/'+name+'-review.png')
