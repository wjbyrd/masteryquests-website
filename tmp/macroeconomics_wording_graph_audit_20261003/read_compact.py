import json,sys
from pathlib import Path
p=Path(__file__).parent
for k in map(int,sys.argv[1:]):
 print('PACKET',k)
 for block in (p/f'remaining-{k:02}.txt').read_text(encoding='utf8').strip().split('\n\n'):
  lines=block.splitlines()
  print(lines[0])
  if ' SHARED ' not in lines[0]:print('\n'.join(lines[1:]))
