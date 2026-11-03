from pathlib import Path
import json,re
from PIL import Image,ImageDraw,ImageFont
HERE=Path(__file__).resolve().parent;ROOT=HERE.parents[1];OLD=HERE.parent/'medium_editorial_20261102';QA=HERE/'qa';QA.mkdir(exist_ok=True)
for name in ['batch-020-controls-fiscal.cjs']:
 p=HERE/name;s=p.read_text(encoding='utf8');s=s.replace('or an unsupported graph reference','or clarify the graph context');p.write_text(s,encoding='utf8')
p=HERE/'batch-080-trade.cjs';s=p.read_text(encoding='utf8');s=s.replace("p.q+=' Assume a small-country competitive market, free trade without transport costs, and unchanged domestic demand and supply.';", "p.q='Assume competitive markets that take the world price as given, with no trade barriers or transport costs. '+p.q;");p.write_text(s,encoding='utf8')
inventory=json.loads((HERE/'inventory.json').read_text(encoding='utf8'));lib=json.loads((HERE/'baseline/composer_library.js').read_text(encoding='utf8').split('=',1)[1].rstrip(';\n'))
groups={};root=ROOT/'build/faculty-build-composer/data'
for i in inventory['items']:
 q=i['question'];asset=q.get('image') or q.get('graphImageMetadata',{}).get('asset')
 if not asset:continue
 target=root/asset
 if not target.is_file():
  candidates=[a for a in lib['assetInventory'] if a.get('filename')==Path(asset).name and a.get('conceptId')==i['conceptId']]
  assert len(candidates)==1,(i['id'],asset,candidates)
  target=root/candidates[0]['runtimePath']
 assert target.is_file(),target
 groups.setdefault(str(target),[]).append(i['id'])
font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',18)
manifest=[]
for n,(filename,ids) in enumerate(sorted(groups.items())):
 card=Image.new('RGB',(800,650),'white');d=ImageDraw.Draw(card)
 d.text((10,6),str(n+1)+' '+Path(filename).parent.name+'/'+Path(filename).name,fill='black',font=font)
 d.text((10,30),', '.join(ids[:3])+f' ({len(ids)} items)',fill='black',font=font)
 with Image.open(filename) as im:
  im=im.convert('RGB');im.thumbnail((780,580));card.paste(im,((800-im.width)//2,64+(580-im.height)//2))
 page=n//4+1
 if n%4==0:contact=Image.new('RGB',(1600,1300),'#ddd')
 contact.paste(card,((n%2)*800,((n%4)//2)*650));contact.save(QA/f'graphs-{page:02}.png')
 manifest.append({'n':n+1,'page':page,'asset':Path(filename).relative_to(ROOT).as_posix(),'ids':ids})
(HERE/'graph-manifest.json').write_text(json.dumps(manifest,indent=2)+'\n')
print(json.dumps({'uniqueGraphs':len(groups),'graphQuestions':sum(map(len,groups.values())),'contactSheets':page}))
for name in ['validate.cjs','verify-browser.cjs','verify-exports.py','verify-workbook-scope.py','preserve-sheet-visibility.py','verify-delivery.py']:
 s=(OLD/name).read_text(encoding='utf8').replace('medium_editorial_20261102','medium_complete_review_20261103').replace('medium-editorial-20261102-','medium-complete-20261103-')
 if name=='validate.cjs':s=s.replace('beforeMediumEditorial','beforeMediumCompleteReview');s=re.sub(r"const screen=require\('./screening.json'\).*?\n",'',s)
 if name=='verify-exports.py':
  a=s.index('samples = {');b=s.index('\nresult =',a);s=s[:a]+"samples = {'general':['P52A-MARG-M-003','P73-SCAR-B2-002'], 'micro':['42459','PM5-PC-M-041','P62G-MON-M-021','P62G-MON-B2-028'], 'macro':['ECON-EC-MEDIUMBOSS-18010','P52B-S4-STAB-B2-003','P52A-FISCAD-B2-003']}\n"+s[b:]
 (HERE/name).write_text(s,encoding='utf8')
test=ROOT/'build/faculty-build-composer/tests'
restore=" current=require('./medium-complete-review-revisions.js').beforeMediumCompleteReview(current);\n"
s=(test/'medium-editorial-revisions.js').read_text(encoding='utf8').replace(restore,'').replace('medium_editorial_20261102','medium_complete_review_20261103').replace('MediumEditorial','MediumCompleteReview').replace('mediumEditorialLedger','mediumCompleteReviewLedger')
(test/'medium-complete-review-revisions.js').write_text(s,encoding='utf8')
p=test/'medium-editorial-revisions.js';s=p.read_text(encoding='utf8').replace(restore,'');s=s.replace('function beforeMediumEditorial(current){','function beforeMediumEditorial(current){\n'+restore.rstrip());p.write_text(s,encoding='utf8')
p=test/'faculty-validation-revisions.js';wrap="module.exports=require('./medium-complete-review-revisions.js').wrap(module.exports);";s=p.read_text(encoding='utf8').replace(wrap,'').rstrip()+'\n\n'+wrap+'\n';p.write_text(s,encoding='utf8')
