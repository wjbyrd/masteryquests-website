from common import *
import re
by={g['id']:g for g in W['wording_findings']}
# Apply only each authorized phrase to the exact IDs in that finding.
for g in W['wording_findings']:
 n=int(g['id'].split('-')[-1])
 for i in g['ids']:
  q=draft(i);s=q['q'];opts=q['options'][:]
  if n==1:
   s=s.removeprefix('Refer to the total-product curve. ').rstrip('.');s+='.” Which statement corrects this claim?'
  elif n==2:s=s.removeprefix('Refer to the graph. ')
  elif n==3:opts=['Increases','Declines','Remains constant','Switches immediately from zero to infinity']
  elif n==4:opts=[t.replace('because add the demand triangle to all payments','because the demand triangle is added to all payments') for t in opts]
  elif n==5:
   s='Refer to the payoff matrix. With payoffs ordered (Row, Column), which choice identifies all pure-strategy Nash equilibria, if any?'
  elif n==6:
   s='Refer to the game tree. The incumbent threatens to fight if the entrant enters. What path does backward induction predict, and is the threat to fight credible?'
   opts=[t.replace('the alternative threat','the threat to fight').replace('; threat is credible','; the threat to fight is credible') for t in opts]
  elif n in (7,27):
   vals=[int(t) for t in re.search(r'values \[([^]]+)\]',s)[1].split(',')];rank=int(re.search(r'among the highest (\d+)',s)[1]);value=sorted(vals,reverse=True)[rank-1]
   s=re.sub(r'the marginal buyer among the highest \d+ values',f'the buyer whose willingness to pay is ${value}',s)
   s=s.replace('the cheapest 1 sellers','the lowest-cost seller')
  elif n==8:opts=[t.replace('in the two intervals over the shown interval','in the two intervals') for t in opts]
  elif n==9:
   names={'Economic profit':'economic profit','Accounting profit':'accounting profit','Economic cost':'total economic cost','TC':'total cost','TFC':'total fixed cost','TVC':'total variable cost','ATC':'average total cost','AVC':'average variable cost','MC':'marginal cost over this output change','MP':'the added worker’s marginal product','AP':'average product per worker','AFC':'average fixed cost'}
   s=re.sub(r'(Economic profit|Accounting profit|Economic cost|TC|TFC|TVC|ATC|AVC|MC|MP|AP|AFC)\?$',lambda m:'What is '+names[m[1]]+'?',s)
  elif n==10:s=re.sub(r'(?:Best correction|Correction)\?$','Which statement corrects this mistake?',s)
  elif n==11:
   s=re.sub(r'^In hypothetical consumer-choice case [A-Z],\s*','',s);s=s[0].upper()+s[1:]
  elif n==12:s=s.replace('what is the new competitive-market direction?','what happens to the equilibrium wage and employment?')
  elif n==13:
   target={'42546':'demand for hospital equipment','42549':'demand for junior tax-preparation staff','42551':'demand for complementary vineyard inputs','42553':'demand for aircraft services','42556':'demand for complementary sawmill inputs','42557':'demand for support staff','42544':'demand for warehouse labor','42547':'demand for farm labor','42548':'demand for skilled technicians when more diagnostic machines are installed','42550':'demand for crane operators','42552':'demand for kitchen stations','42554':'demand for cashiers and maintenance technicians','42555':'demand for teachers','42545':'demand for routine assembly labor','42558':'demand for manual cutters and finishing workers','42559':'demand for complementary construction inputs'}[i]
   s=s.replace('Trace the effect into the related factor market.',f'How does this affect {target}?')
  elif n==14:s=s.replace('Which combined curve-and-decision result is correct?','How does this change affect the firm’s cost curves and short-run output decision?')
  elif n==15:s=s.replace('What is the best integrated conclusion?','What output should the firm choose, and what economic profit or loss would it earn?')
  elif n==16:s=s.replace('Which output-profit decision is correct?','What output should the firm choose, and what economic profit or loss would result?')
  elif n==17:s=s.replace('Which paired result is correct?','What quantity and price maximize the monopolist’s profit?')
  elif n==18:s=s.replace('Which comparison controls shutdown?','Which price-cost comparison determines whether the firm should produce in the short run?')
  elif n==19:
   s=s.replace('Which statement about the two crossings in this cost family is correct?','Which statement correctly describes where MC crosses AVC and ATC?').replace('preserves allocative logic but removes profit','maintains allocative efficiency while eliminating economic profit')
  elif n==20:s=s.replace('Separate the unrealized gains into geometry and economic meaning.','How much total surplus is forgone, and why would the missing trades create gains?')
  elif n==21:s=s.replace('supports the social-intersection quantity','supports the socially efficient quantity').replace('Which fiscal and price account is consistent with both the graph and payment on every garden produced?','Which government-spending and buyer/seller-price combination matches the graph when the subsidy is paid on every garden produced?')
  elif n==22:
   instrument='subsidy' if i in ['42062','42071'] else 'tax'
   opts=[re.sub(r'(a \$\d+ per \w+) policy in the opposite direction',lambda m:m[1]+' '+instrument,t) for t in opts]
  elif n==23:s=s.replace('Which channel creates the externality?','Does the externality arise from production or consumption?').replace('Why does the sign of an externality not reveal its production or consumption channel?','Why does knowing whether a spillover is harmful or beneficial not tell us whether it arises from production or consumption?')
  elif n==24:s=s.replace('what zero-profit geometry characterizes the standard long-run equilibrium?','how do the firm’s demand and ATC curves relate in the standard long-run equilibrium?')
  elif n==25:
   s={'P62F-PC-M-032':'Refer to the graph. At an output of 50 units, what is the firm’s economic profit per unit?','P62F-PC-M-041':'Refer to the paired market and firm graph. At an output of 90 units, what is the firm’s economic profit per unit?','P62F-PC-M-036':'Refer to the graph. What is average total cost at an output of 30 units?','P62F-PC-M-037':'Refer to the graph. What is average variable cost at an output of 30 units?'}[i]
  elif n==26:opts=[t.replace(' for the displayed firm','') for t in opts]
  elif n==28:s=s.replace('safest','best supported')
  elif n==29:s=s.replace('which statement is exact?','which statement is correct?').replace('the exact error and correct result','the error and correct result')
  elif n==30:s=s.replace('Checkpoint: ','')
  elif n==31:s=s.replace('has chosen output','has profit-maximizing output')
  elif n==32:s='Refer to the payoff matrix. Which strategy, if any, is strictly dominant for the Row firm?';opts=[t.replace('Row has no strictly dominant strategy','Neither A nor B').replace('Both row strategies are dominant','Both A and B').replace('The joint-payoff-maximizing cell','Whichever strategy gives the largest combined payoff') for t in opts]
  fields={}
  if s!=q['q']:fields['q']=s
  if opts!=q['options']:fields['options']=opts
  assert fields,(g['id'],i)
  edit(i,**fields)
save();print('Prepared wording revisions for',len(P),'records; no canonical writes.')
