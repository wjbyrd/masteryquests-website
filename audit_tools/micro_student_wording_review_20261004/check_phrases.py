import json,re
from pathlib import Path
rows=json.loads(Path('tmp/micro_student_wording_review_20261004/current_questions.json').read_text(encoding='utf-8'))
patterns=[
 r'strict(?:ly)? (?:gain|benefit)|gain strictly|strict mutual',
 r'continuation factor|continue with factor',
 r'multi.hom',
 r'contribution margin|incremental contribution|output contribution schedule|confidence in repeat quality',
 r'frictionless competition|equate social margins|rent capture alone|social-intersection|aggregate reading and marginal rule|target different margins|elastic participants|efficiency wedge',
 r'contract on|contractible|separating and credible|separating rationale|inframarginal|preferred specification|alternative specifications',
 r'monotonic preferences|not uniquely identified|weakly expands|first-order effect|coefficient in levels|identification problem|exogenous|equality boundary',
 r'best repair|long-run repair|industry-cost-condition|interior optim|pass.through|take.up rate',
 r'Signal Breaker|Market Marshal|fixed-demand-determinant|switching benefits|low-sensory',
]
import sys
for i in map(int,sys.argv[1:]):
 print('PATTERN',i,patterns[i])
 for q in rows:
  matches=[('STEM',q['stem'])] if re.search(patterns[i],q['stem'],re.I) else []
  matches += [(chr(65+n),v) for n,v in enumerate(q['choices']) if re.search(patterns[i],v,re.I)]
  if matches: print(q['id'],json.dumps(matches,ensure_ascii=False))
