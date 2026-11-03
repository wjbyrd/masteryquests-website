from pathlib import Path
import json,sys
sys.stdout.reconfigure(encoding='utf8');items=json.loads((Path(__file__).parent/'inventory.json').read_text(encoding='utf8'))['items']
start,end=map(int,sys.argv[1:3])
for n,item in enumerate(items[start-1:end],start):
    q=item['question'];r=item['review'];print(f"{n}. {item['id']} [{item['topic']}] {r['Review status']} {q.get('canonicalDifficulty')} {q.get('primarySkill')}")
    print('NOTE:',r['Notes'],'FLAGS:',r['Flag reasons']);print(q['q']);print(' | '.join(('*' if i==item['correctIndex'] else '')+'ABCD'[i]+': '+o for i,o in enumerate(q['options'])));print('EXPLANATION:',q.get('feedback'));print('GRAPH:',q.get('image',''));print()
