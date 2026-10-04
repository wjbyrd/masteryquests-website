"""Final semantic review before the guarded application."""
from author_graph import *
# Retain two narrow cases rather than claim a cosmetic distinction.
P.pop('42660');R.pop('42660')
e('42662','Preferences are strictly convex. A and B are distinct, equally preferred bundles. What follows about a bundle containing the average of their quantities?','It is strictly preferred to either A or B.',['It must have utility equal to the arithmetic average of their utility numbers.','It must be less preferred than both extremes.','It must cost less than both A and B.'],'Strict convexity favors an interior mixture of distinct equally ranked bundles. It does not assign cardinal meaning to utility numbers or imply a lower price.','Deduces a preference restriction from the assumption and separates it from utility-number and cost claims, reversing the original inference.')
e('42696','X and Y are useful only in one-to-one pairs. A consumer has 4 X and 7 Y, then loses 4 Y. How many useful pairs are lost?','1 pair.',['None.','3 pairs.','4 pairs.'],'Initially X limits the consumer to 4 pairs. After the loss, only 3 Y remain, so Y becomes the limiting good and there are 3 pairs.','Tests a switch in the binding component; losing four components destroys only one complete pair.','min(4,7)−min(4,3)=1.')
e('42704','At an interior optimum, X costs $3 and Y costs $2. The marginal utility of X is 12. What marginal utility of Y makes marginal utility per dollar equal for the two goods?','8.',['4.','12.','18.'],'X provides 12/3 = 4 units of marginal utility per dollar. Y must also provide 4 per dollar, so its marginal utility is 4 × 2 = 8.','Solves for a missing marginal value from the optimality condition rather than repeating a direction-of-adjustment rule.','12/3=8/2=4.')
save()
dispositions={}
for group in S['duplicate_groups']:
 for i in group['ids']:
  dispositions[i]={'group':group['group'],'status':'revised' if i in P else 'instructor-review exception' if i in ['42660','42697'] else 'retained representative','reason':R[i]['reasoning_difference'] if i in R else 'Explaining the shared-bundle contradiction repeats the representative’s nonintersection reasoning; further distinct applications would exceed this Easy item’s original task.' if i=='42660' else 'A sixth introductory perfect-substitute task would repeat identification, equivalence or geometry, or require additional optimization beyond this Easy tier.' if i=='42697' else 'Retained as the group’s clear baseline task; other revised members use the recorded different reasoning paths.'}
(H/'duplicate_dispositions.json').write_text(json.dumps(dispositions,indent=2)+'\n',encoding='utf8')
baseline=read('baseline.json');baseline['target_ids']=sorted(P);(H/'baseline.json').write_text(json.dumps(baseline,indent=2)+'\n',encoding='utf8')
print('Final proposals:',len(P),'duplicates:',sum('A' in r['categories'] for r in R.values()),'graphs:',sum('graph_test' in r for r in R.values()))
