import json, hashlib, re
from pathlib import Path

ROOT=Path(__file__).resolve().parent
OUT=ROOT/'phaseMicro6-monopoly-granularity-adaptive-backfill-v1_questions.json'
PHASE='phaseMicro6-monopoly-granularity-adaptive-backfill-v1'
qs=[]; seq=0; source_id=9700000
PARENT='monopoly'; TAG='monopoly'; CLUSTER='micro_monopoly'

def norm(s): return re.sub(r'\s+',' ',str(s).strip()).lower()
def ahash(answer): return hashlib.sha256(norm(answer).encode()).hexdigest()
def shash(obj): return hashlib.sha256(json.dumps(obj,sort_keys=True,ensure_ascii=False,separators=(',',':')).encode()).hexdigest()

def add(pool,subtopic,objective,skill,q,options,correct,feedback,common='misapplies_monopoly_rule',typ='application',secondary=None):
    global seq, source_id
    assert pool in ('easy','medium','hard','repair','bridge')
    assert len(options)==4 and len(set(options))==4 and correct in options
    seq += 1; source_id += 1
    rot=(seq-1)%4
    options=list(options[rot:]+options[:rot])
    if pool in ('easy','medium','hard'):
        difficulty=pool; role='main'; canonical=pool
    else:
        difficulty=pool; role=pool; canonical='easy' if pool=='repair' else 'medium'
    rec={
        'id':f"PM6-MON-{pool[0].upper() if pool not in ('repair','bridge') else ('R' if pool=='repair' else 'BR')}-{seq:03d}",
        'q':q,'options':options,'tag':TAG,'type':typ if pool not in ('repair','bridge') else pool,
        'objective':objective,'difficulty':difficulty,'conceptCluster':CLUSTER,'primarySkill':skill,
        'secondarySkills':secondary or [],'repairSkill':skill,'commonError':common,'feedback':feedback,
        'aHash':ahash(correct),'sourceGame':'micro-concept-library','sourceChapter':[PARENT],
        'sourcePool':pool,'primaryConceptId':PARENT,'secondaryConceptIds':[],'instructionalRole':role,
        'canonicalDifficulty':canonical,'originalSourcePool':pool,'originalBossTier':None,
        'familyConceptId':PARENT,'subtopicIds':[subtopic]
    }
    rec['canonicalId']=rec['id']; rec['sourceId']=source_id
    rec['sourceHash']=shash({k:v for k,v in rec.items() if k not in ('sourceHash','sourceOccurrences')})
    rec['sourceOccurrences']=[{'sourceGame':'micro-concept-library','sourceFile':OUT.name,'sourceGlobal':'questions','sourcePool':pool,'routeKey':skill,'sourceRecordOrder':len(qs),'sourceId':source_id,'sourceHash':rec['sourceHash']}]
    qs.append(rec)

# 1) Monopoly Power, Barriers to Entry & Sources — 5 M, 4 H, 1 R, 3 BR
s='monopoly-power-barriers'
items=[
('medium','barriers_to_entry','A town currently has one ambulance provider, but licenses are readily available and several firms can enter with ordinary equipment. Which conclusion is strongest?',
 ['The current one-seller market does not by itself establish durable monopoly power','The provider is a natural monopoly because only one firm operates today','The provider must have a patent protecting ambulance service','The provider can charge any price because entry has not happened yet'],
 'The current one-seller market does not by itself establish durable monopoly power','A monopoly requires meaningful barriers to entry, not merely one seller at a moment in time.','treats_one_current_seller_as_durable_monopoly'),
('medium','legal_barrier','A patented medical device is profitable while the patent remains in force. What is the patent doing economically?',
 ['Restricting entry and helping preserve the incumbent’s market power','Making the firm’s demand curve horizontal','Forcing marginal revenue to equal price','Guaranteeing that average total cost will fall forever'],
 'Restricting entry and helping preserve the incumbent’s market power','A patent is a legal barrier that can prevent rivals from copying the protected product.','confuses_legal_barrier_with_cost_condition'),
('medium','network_effects','A messaging platform becomes more useful as more friends and businesses join it. Why can this discourage entry by a rival platform?',
 ['Users may prefer the established network because its large user base raises its value','The incumbent’s marginal cost must be zero','The rival automatically faces perfectly inelastic demand','Network effects remove the need for consumer choice'],
 'Users may prefer the established network because its large user base raises its value','Network effects can create a demand-side barrier because users value access to the existing network.','ignores_network_effect_barrier'),
('medium','resource_control','A firm owns the only economically viable source of a rare input required to make a specialized product. Which mechanism protects its market position most directly?',
 ['Control of an essential resource blocks rivals from obtaining a necessary input','Its price must equal marginal cost','Its fixed costs disappear as output rises','Its customers cannot respond to price changes'],
 'Control of an essential resource blocks rivals from obtaining a necessary input','Exclusive control of a critical resource can prevent otherwise capable rivals from entering.','confuses_resource_control_with_demand_elasticity'),
('medium','natural_monopoly','A regional water network requires an enormous pipe system, and duplicating the network would raise average cost. Which fact best supports natural-monopoly status?',
 ['One firm can serve market demand at lower average cost than multiple duplicative networks','The provider has the legal right to discriminate among all buyers','Marginal revenue is always positive','The firm earns accounting profit in the current year'],
 'One firm can serve market demand at lower average cost than multiple duplicative networks','Natural monopoly comes from scale economies over the relevant range of market demand.','confuses_natural_monopoly_with_profitability'),
('hard','barriers_to_entry','A software firm is the only seller this year. Its product can be copied legally, startup costs are modest, and customers can switch easily. What most weakens the claim that it has durable monopoly power?',
 ['The absence of a substantial barrier makes future entry plausible','Its demand curve slopes downward','Its current sales exceed zero','Its marginal revenue may lie below price'],
 'The absence of a substantial barrier makes future entry plausible','Durable monopoly power depends on obstacles that keep potential competitors out.','ignores_contestability'),
('hard','natural_monopoly_cost','Two electricity distributors could duplicate local wires and substations, but one network can serve the whole market at lower ATC. Which entry problem is central?',
 ['A new entrant may be unable to reach a cost-efficient scale without wasteful duplication','Demand must become perfectly elastic when a second firm enters','The incumbent can permanently set price without regard to demand','Entry would eliminate fixed cost for both firms'],
 'A new entrant may be unable to reach a cost-efficient scale without wasteful duplication','Large fixed infrastructure and economies of scale can make duplication inefficient and entry difficult.','misses_scale_based_entry_barrier'),
('hard','network_effects','A new payment app has slightly better technology than the incumbent, but few merchants or consumers accept it. Which force can preserve the incumbent’s advantage despite the technical improvement?',
 ['The value of joining the incumbent network rises with the number of existing participants','The entrant necessarily has higher marginal revenue than price','The incumbent must have lower fixed cost at every output','The entrant can profit only if demand is perfectly inelastic'],
 'The value of joining the incumbent network rises with the number of existing participants','Network effects can lock users into a large installed base even when a rival has attractive features.','ignores_installed_base'),
('hard','legal_barrier','A state grants one company an exclusive twenty-year franchise to operate a bridge. Which statement best separates the source of monopoly from the firm’s later pricing decision?',
 ['The franchise creates the entry barrier; demand still limits the prices and quantities the firm can profitably choose','The franchise makes demand horizontal, so the firm becomes a price taker','The franchise forces the firm to charge average total cost','The franchise guarantees efficient output because rivals are excluded'],
 'The franchise creates the entry barrier; demand still limits the prices and quantities the firm can profitably choose','A legal barrier can create monopoly status, but the monopolist remains constrained by market demand.','assumes_legal_monopoly_has_unlimited_pricing_power'),
]
for pool,skill,q,opts,c,fb,ce in items: add(pool,s,'MON.1',skill,q,opts,c,fb,ce,typ='analysis' if pool=='hard' else 'application')
add('repair',s,'MON.1','barriers_to_entry','What must accompany a single seller for monopoly power to be durable?',
 ['A meaningful barrier that makes entry difficult','A perfectly horizontal demand curve','Zero fixed cost','A requirement that price equal marginal cost'],
 'A meaningful barrier that makes entry difficult','One seller becomes a durable monopoly only when entry is meaningfully blocked.','forgets_entry_barrier')
add('bridge',s,'MON.1','barriers_to_entry','How do barriers to entry connect monopoly structure to persistent economic profit?',
 ['They prevent new rivals from entering quickly when profit appears','They force demand to become perfectly elastic','They make total cost independent of output','They guarantee that the monopolist chooses the efficient quantity'],
 'They prevent new rivals from entering quickly when profit appears','Barriers can keep profit from triggering the entry response that erodes profit in competitive markets.','disconnects_barriers_from_entry',secondary=['persistent_economic_profit'])
add('bridge',s,'MON.1','natural_monopoly','Why does natural-monopoly cost structure often lead directly to a regulation question?',
 ['Efficient scale may favor one supplier, yet that supplier still has market power over price and output','Natural monopolies always produce where price equals marginal cost without policy','Scale economies make demand perfectly elastic','Regulation is needed only when a patent expires'],
 'Efficient scale may favor one supplier, yet that supplier still has market power over price and output','Natural monopoly can make one-firm production cost-efficient while still creating a market-power problem.','separates_natural_monopoly_from_regulation',secondary=['marginal_cost_regulation'])
add('bridge',s,'MON.1','legal_barrier','What happens to a patent-based barrier when the patent expires, holding other barriers constant?',
 ['Legal protection weakens and potential entry becomes easier','The firm’s marginal revenue becomes equal to price automatically','Demand shifts to zero','Average total cost must rise above price'],
 'Legal protection weakens and potential entry becomes easier','Removing a legal barrier increases contestability even if the incumbent remains large.','treats_patent_as_permanent',secondary=['entry'])

# 2) Demand, Revenue & MR — 1 E, 1 M, 2 R, 3 BR
s='monopoly-demand-revenue'
add('easy',s,'MON.2','monopoly_demand','For a single-price monopolist, which curve also shows average revenue at each quantity?',
 ['The demand curve','The marginal-cost curve','The average-total-cost curve','A horizontal line at marginal revenue'],
 'The demand curve','Because AR = TR/Q = P, average revenue lies on the monopolist’s demand curve.','confuses_average_revenue_with_marginal_revenue')
add('medium',s,'MON.2','price_effect_output_effect','A monopolist cuts price to sell one additional unit. Why can marginal revenue be far below the new price?',
 ['The extra unit adds revenue, but the lower price also reduces revenue collected on earlier units','Marginal cost is automatically subtracted from marginal revenue','Average revenue becomes zero when price falls','The demand curve becomes horizontal after the price cut'],
 'The extra unit adds revenue, but the lower price also reduces revenue collected on earlier units','Marginal revenue reflects both the output effect and the price effect on units already sold.','ignores_price_effect')
add('repair',s,'MON.2','marginal_revenue_monopoly','A monopolist lowers price from $20 to $19 to increase sales. Is the marginal revenue from the added unit necessarily $19?',
 ['No; the lower price may also reduce revenue on units that were already being sold','Yes; marginal revenue always equals price for every seller','Yes; average revenue and marginal revenue are identical for a monopolist','No; marginal revenue must always be negative'],
 'No; the lower price may also reduce revenue on units that were already being sold','For a single-price monopolist, MR includes the lost revenue caused by lowering price on previous units.','sets_mr_equal_to_price')
add('repair',s,'MON.2','average_revenue_monopoly','Where should a monopolist read the price consumers will pay for a chosen quantity?',
 ['From the demand curve','From the marginal-revenue curve','From the marginal-cost curve','From the minimum of average total cost'],
 'From the demand curve','Demand gives price at each quantity; MR is used for the marginal output decision.','reads_price_from_mr')
add('bridge',s,'MON.2','marginal_revenue_monopoly','How does the monopolist’s downward-sloping demand curve create the MR curve used for output choice?',
 ['Selling more generally requires a lower price, so MR falls below price','Demand forces MR to equal MC at every quantity','The demand curve makes ATC horizontal','MR is simply the vertical distance between demand and MC'],
 'Selling more generally requires a lower price, so MR falls below price','The price effect from expanding sales makes marginal revenue lower than the price on demand.','disconnects_demand_from_mr',secondary=['profit_maximizing_output'])
add('bridge',s,'MON.2','elasticity_and_mr','What does positive marginal revenue tell you about the portion of a monopolist’s demand curve?',
 ['Demand is elastic at that output','Demand is inelastic at that output','Demand is perfectly inelastic at that output','Demand must have unit elasticity at every output'],
 'Demand is elastic at that output','For a downward-sloping demand curve, MR is positive on the elastic portion.','misreads_mr_elasticity_link',secondary=['price_elasticity_of_demand'])
add('bridge',s,'MON.2','competitive_monopoly_comparison','Why does P = MR hold for a competitive firm but not for a single-price monopolist?',
 ['The competitive firm can sell another unit at the unchanged market price, while the monopolist generally must lower price to expand sales','The monopolist has no demand curve','The competitive firm always has zero marginal cost','The monopolist’s average revenue is unrelated to price'],
 'The competitive firm can sell another unit at the unchanged market price, while the monopolist generally must lower price to expand sales','Price taking removes the price effect that drives monopoly MR below price.','confuses_competitive_and_monopoly_revenue',secondary=['perfect-competition'])

# 3) Output & Price — 2 M, 4 R, 2 BR
s='monopoly-output-price'
add('medium',s,'MON.3','profit_maximizing_output','At 40 units a monopolist has MR=$28 and MC=$22; at 41 units MR=$24 and MC=$25. Which output is the better marginal choice?',
 ['40 units, because the 41st unit costs more at the margin than it adds to revenue','41 units, because price must still exceed marginal revenue','41 units, because a monopolist always produces until price equals MC','40 units only if average total cost is minimized there'],
 '40 units, because the 41st unit costs more at the margin than it adds to revenue','Produce units for which MR covers MC and stop before the next unit has MC greater than MR.','uses_price_instead_of_mr_for_output')
add('medium',s,'MON.3','monopoly_price','A monopolist has already found its profit-maximizing quantity using MR=MC. What is the next step for determining the monopoly price?',
 ['Move up to the demand curve at that quantity','Use the MR curve value as the price','Set price equal to average total cost','Choose the lowest price on the demand curve'],
 'Move up to the demand curve at that quantity','MR determines the quantity condition; demand gives the price buyers will pay for that quantity.','reads_price_from_wrong_curve')
for skill,q,opts,c,fb,ce in [
('profit_maximizing_output','Which equality identifies the candidate output for a single-price monopolist?',['MR = MC','P = MC','P = ATC','MR = P'],'MR = MC','The monopoly output decision uses marginal revenue and marginal cost.','sets_price_equal_to_mc'),
('monopoly_price','After finding Q where MR=MC, where is monopoly price found?',['On demand at that Q','On MR at that Q','On MC at that Q','At minimum ATC'],'On demand at that Q','Demand maps the chosen quantity into the price consumers will pay.','reads_price_from_mr'),
('profit_maximizing_output','If MR exceeds MC at the current output, what should a profit-maximizing monopolist generally do?',['Increase output','Decrease output','Keep output unchanged because price exceeds MR','Shut down immediately'],'Increase output','When MR exceeds MC, another unit adds more revenue than cost.','reverses_marginal_rule'),
('profit_maximizing_output','If the MR=MC intersection occurs where MC is falling and another later intersection occurs where MC is rising, which is the usual profit-maximizing candidate?',['The intersection on the rising portion of MC','The first intersection on the falling portion of MC','Both intersections necessarily give identical profit','Neither intersection because monopoly uses P=MC'],'The intersection on the rising portion of MC','The stable maximum uses MR=MC with MC rising through MR.','ignores_rising_mc_condition')]:
    add('repair',s,'MON.3',skill,q,opts,c,fb,ce)
add('bridge',s,'MON.3','profit_maximizing_output','How do monopoly revenue analysis and marginal cost combine into the output decision?',
 ['Demand generates MR, and the firm compares that MR with MC to choose quantity','Demand sets MC directly, so MR is unnecessary','ATC determines quantity before revenue is considered','Price is chosen first and forces MR to equal MC'],
 'Demand generates MR, and the firm compares that MR with MC to choose quantity','The monopolist’s demand conditions determine MR; costs determine MC; their marginal comparison selects output.','disconnects_revenue_and_cost',secondary=['marginal_revenue_monopoly'])
add('bridge',s,'MON.3','integrated_monopoly_analysis','Why is monopoly price determined only after the profit-maximizing quantity is chosen?',
 ['The firm first uses MR and MC to choose output, then demand reveals the highest single price consistent with that output','Price is unrelated to demand until output is produced','The monopolist has no control over quantity','Average total cost sets price before marginal analysis begins'],
 'The firm first uses MR and MC to choose output, then demand reveals the highest single price consistent with that output','Monopoly analysis is a two-step decision: marginal output choice first, demand-based price second.','reverses_monopoly_two_step_rule',secondary=['monopoly_price'])

# 4) Profit, Loss & Shutdown — 4 E, 2 R, 1 BR
s='monopoly-profit-loss-shutdown'
for skill,q,opts,c,fb,ce in [
('monopoly_profit','A monopolist charges $50, has ATC=$38, and sells 100 units. What is total economic profit?',['$1,200','$5,000','$3,800','$12'],'$1,200','Profit per unit is $12 and total profit is $12 × 100.','confuses_per_unit_and_total_profit'),
('monopoly_loss','A monopolist charges $24 while ATC is $30 at its chosen output. Which statement is correct?',['The firm has an economic loss of $6 per unit','The firm earns $6 economic profit per unit','The firm must shut down immediately','The firm is breaking even'],'The firm has an economic loss of $6 per unit','When P<ATC, the firm incurs a loss equal to ATC−P per unit.','reverses_profit_loss_sign'),
('monopoly_shutdown','A monopolist has P=$18, AVC=$12, and ATC=$25 at its best operating output. In the short run it should generally:',['Produce because price covers variable cost and contributes toward fixed cost','Shut down because price is below ATC','Exit permanently because any accounting loss requires exit','Produce only if price equals MC at every unit'],'Produce because price covers variable cost and contributes toward fixed cost','A short-run loss does not imply shutdown when price remains above AVC.','uses_atc_as_shutdown_rule'),
('monopoly_profit','When a monopolist’s price equals ATC at its chosen output, economic profit is:',['Zero','Equal to total revenue','Negative because MR is below price','Positive because monopoly has market power'],'Zero','P=ATC means revenue exactly covers explicit and implicit economic costs.','assumes_monopoly_always_profits')]:
    add('easy',s,'MON.4',skill,q,opts,c,fb,ce)
add('repair',s,'MON.4','monopoly_profit','Which expression gives total economic profit for a monopolist producing Q units?',
 ['(P − ATC) × Q','(P − MC) × Q','P × Q','(ATC − AVC) × Q'],
 '(P − ATC) × Q','Economic profit equals profit per unit times quantity.','uses_wrong_profit_formula')
add('repair',s,'MON.4','monopoly_shutdown','A monopolist is losing money because P<ATC, but P>AVC. What does the shutdown rule say?',
 ['Continue producing in the short run if the chosen output minimizes the loss','Shut down immediately because any loss requires shutdown','Raise output until P=ATC','Exit the industry immediately regardless of fixed costs'],
 'Continue producing in the short run if the chosen output minimizes the loss','Covering variable cost makes continued short-run production better than shutting down when fixed cost is unavoidable.','confuses_loss_with_shutdown')
add('bridge',s,'MON.4','monopoly_profit','How does the MR=MC output rule connect to the later profit-or-loss calculation?',
 ['MR=MC identifies the best quantity; price from demand and ATC at that quantity determine profit or loss','ATC determines output first and MR then determines price','Profit is known before quantity is chosen','The shutdown rule replaces MR=MC whenever the firm has market power'],
 'MR=MC identifies the best quantity; price from demand and ATC at that quantity determine profit or loss','Output optimization and profit measurement are separate steps in monopoly analysis.','mixes_output_choice_with_profit_measurement',secondary=['profit_maximizing_output'])

# 5) Welfare & Efficiency — 5 E, 2 M, 4 R, 1 BR
s='monopoly-welfare-efficiency'
for skill,q,opts,c,fb,ce in [
('competitive_monopoly_comparison','Compared with an otherwise similar competitive market, a single-price monopoly typically produces:',['Less output at a higher price','More output at a lower price','The same output at the same price','Less output at a lower price'],'Less output at a higher price','Market power generally leads the monopolist to restrict output and charge a higher price than the competitive benchmark.','reverses_monopoly_competitive_comparison'),
('allocative_inefficiency','Why is P>MC at the monopoly quantity evidence of allocative inefficiency?',['Some buyers value additional units more than the marginal cost of producing them','The monopolist must be earning zero profit','Marginal revenue must equal price','Average total cost must be at its minimum'],'Some buyers value additional units more than the marginal cost of producing them','When willingness to pay exceeds MC for foregone units, mutually beneficial trades are left unrealized.','misreads_p_mc_efficiency'),
('monopoly_deadweight_loss','What does monopoly deadweight loss represent?',['Gains from trade lost because output is restricted below the efficient quantity','All profit earned by the monopolist','All consumer surplus transferred to the monopolist','The firm’s fixed cost'],'Gains from trade lost because output is restricted below the efficient quantity','Deadweight loss is surplus that disappears rather than being transferred between buyers and sellers.','confuses_transfer_with_deadweight_loss'),
('rent_seeking','If firms spend resources lobbying for an exclusive monopoly privilege, those expenditures are an example of:',['Rent seeking','Productive efficiency','Price discrimination','Marginal-cost pricing'],'Rent seeking','Resources used to obtain or protect economic rents can create additional social cost.','confuses_rent_seeking_with_production_cost'),
('consumer_surplus_monopoly','A monopoly price increase transfers some surplus from consumers to the firm. Is that entire transfer deadweight loss?',['No; transferred surplus changes who receives the surplus, while deadweight loss is surplus that disappears','Yes; every dollar of monopoly profit is deadweight loss','Yes; consumer surplus and total surplus are identical','No; because monopoly never changes total surplus'],'No; transferred surplus changes who receives the surplus, while deadweight loss is surplus that disappears','Distributional transfers and efficiency losses are different pieces of monopoly welfare analysis.','treats_transfer_as_dwl')]:
    add('easy',s,'MON.5',skill,q,opts,c,fb,ce)
for skill,q,opts,c,fb,ce in [
('competitive_monopoly_comparison','Suppose competition would produce 100 units at $20, while monopoly produces 70 units at $35. Which change is the clearest source of efficiency loss?',['The 30 units between 70 and 100 that would have generated gains from trade are not produced','The monopolist receives revenue on the 70 units it sells','The market price is written in dollars rather than units','Consumers buy positive quantities under monopoly'],'The 30 units between 70 and 100 that would have generated gains from trade are not produced','The efficiency loss comes from mutually beneficial transactions forgone because of restricted output.','focuses_only_on_price_transfer'),
('monopoly_deadweight_loss','If a monopolist reduces output farther below the competitive quantity while demand and cost curves are unchanged, what generally happens to deadweight loss?',['It increases because more mutually beneficial units are forgone','It necessarily falls because the firm earns more profit','It becomes zero when price rises','It is unchanged because transfers do not matter'],'It increases because more mutually beneficial units are forgone','Greater output restriction usually widens the range of lost gains from trade.','reverses_dwl_output_relation')]:
    add('medium',s,'MON.5',skill,q,opts,c,fb,ce)
for skill,q,opts,c,fb,ce in [
('monopoly_deadweight_loss','Which area is conceptually deadweight loss from monopoly?',['The lost surplus on units between monopoly output and the efficient output','The monopolist’s entire profit rectangle','Consumer spending on units still purchased','Total fixed cost'],'The lost surplus on units between monopoly output and the efficient output','Deadweight loss comes from trades not made, not from surplus merely transferred.','confuses_profit_with_dwl'),
('allocative_inefficiency','At the monopoly output, price is $50 and MC is $30. What does the $20 gap imply at the margin?',['Buyers value another unit more than its production cost, so output is too low from an allocative-efficiency standpoint','The monopolist must shut down','The firm is necessarily earning $20 profit per unit','Output is productively efficient because price exceeds MC'],'Buyers value another unit more than its production cost, so output is too low from an allocative-efficiency standpoint','P>MC means potential gains from additional output remain.','confuses_markup_with_profit'),
('consumer_surplus_monopoly','If a monopoly captures $100 of consumer surplus without changing total output, what happens to total surplus from that transfer alone?',['It is redistributed, not destroyed','It falls by exactly $100','It rises by exactly $100','It becomes zero'],'It is redistributed, not destroyed','A pure transfer changes distribution; deadweight loss requires lost gains from trade.','confuses_distribution_with_efficiency'),
('rent_seeking','Why can rent-seeking expenditures make monopoly socially more costly than the standard deadweight-loss triangle alone suggests?',['Real resources may be spent obtaining or defending monopoly privileges rather than producing valued goods and services','They always reduce marginal cost','They automatically expand output to the competitive level','They convert monopoly demand into perfectly elastic demand'],'Real resources may be spent obtaining or defending monopoly privileges rather than producing valued goods and services','Rent seeking can consume resources in addition to the surplus loss from restricted output.','ignores_resource_cost_of_rent_seeking')]:
    add('repair',s,'MON.5',skill,q,opts,c,fb,ce)
add('bridge',s,'MON.5','monopoly_deadweight_loss','How does the monopolist’s MR=MC output choice create the welfare result P>MC?',
 ['MR lies below demand, so choosing Q where MR=MC typically leaves price on demand above MC','The firm sets price equal to MC and then raises output','Average total cost replaces demand in setting price','Market power makes willingness to pay irrelevant'],
 'MR lies below demand, so choosing Q where MR=MC typically leaves price on demand above MC','The gap between demand price and MC at monopoly output is the link between firm optimization and allocative inefficiency.','disconnects_firm_choice_from_welfare',secondary=['profit_maximizing_output'])

# 6) Natural Monopoly & Regulation — 8 E, 5 M, 4 R, 5 BR
s='natural-monopoly-regulation'
for skill,q,opts,c,fb,ce in [
('natural_monopoly_cost','A natural monopoly is most likely when average total cost:',['Falls over the relevant range of market demand','Rises at every output','Equals price at every output','Is unrelated to scale'],'Falls over the relevant range of market demand','Large scale economies over market demand can make one producer less costly than several.','forgets_scale_economies'),
('marginal_cost_regulation','Under marginal-cost regulation, the regulator sets price equal to:',['Marginal cost','Average total cost','Marginal revenue','The unregulated monopoly price'],'Marginal cost','P=MC targets allocative efficiency.','confuses_mc_and_atc_regulation'),
('average_cost_regulation','Average-cost regulation generally targets a price equal to:',['Average total cost','Marginal revenue','The monopoly demand intercept','Zero'],'Average total cost','P=ATC allows the regulated firm to cover economic cost including normal return.','confuses_average_cost_rule'),
('regulatory_tradeoff','Why can P=MC create a financial problem for a natural monopoly?',['When ATC exceeds MC, revenue may be insufficient to cover total cost','MR must become negative','Demand becomes perfectly elastic','The firm necessarily earns monopoly profit'],'When ATC exceeds MC, revenue may be insufficient to cover total cost','Declining ATC often implies MC below ATC, so marginal-cost pricing can produce losses.','ignores_mc_atc_gap'),
('price_cap_regulation','A binding price cap below the unregulated monopoly price is intended primarily to:',['Limit the price the regulated monopolist may charge','Guarantee monopoly profit','Eliminate all fixed cost','Make the firm a price taker in an unregulated market'],'Limit the price the regulated monopolist may charge','A price cap constrains the allowable price and can alter incentives and output.','misunderstands_price_cap'),
('regulatory_tradeoff','If a regulator sets P=ATC rather than P=MC, the main efficiency compromise is that:',['Price may remain above marginal cost even though the firm can cover total cost','The firm must shut down immediately','Demand becomes horizontal','The firm earns unlimited economic profit'],'Price may remain above marginal cost even though the firm can cover total cost','Average-cost pricing addresses financial viability but usually does not attain allocative efficiency.','assumes_atc_pricing_is_fully_efficient'),
('marginal_cost_regulation','If a regulator requires P=MC and the firm would otherwise incur a loss, one possible policy response is:',['Provide a subsidy financed outside the firm’s price revenue','Raise the price back to the unregulated monopoly level','Require output to fall until MR=0','Eliminate the demand curve'],'Provide a subsidy financed outside the firm’s price revenue','A subsidy can cover the gap between total cost and revenue under marginal-cost pricing.','misses_subsidy_tradeoff'),
('natural_monopoly_cost','Which example best fits natural monopoly rather than a legal monopoly created only by statute?',['A single water network has lower ATC than duplicating pipes across several firms','A patent gives one pharmaceutical producer exclusive rights for a fixed term','A license limits taxi entry even though many firms could operate efficiently','A copyright protects a particular book'],'A single water network has lower ATC than duplicating pipes across several firms','Natural monopoly is rooted in cost structure and economies of scale rather than legal exclusion alone.','confuses_natural_and_legal_monopoly')]:
    add('easy',s,'MON.6',skill,q,opts,c,fb,ce)
for skill,q,opts,c,fb,ce in [
('marginal_cost_regulation','A natural monopoly has MC=$12 and ATC=$20 at the allocatively efficient quantity. If regulation sets P=$12, which outcome is most likely without a subsidy?',['The firm incurs an economic loss because price is below ATC','The firm earns $8 profit per unit','The firm breaks even because P=MC','The firm must reduce output to zero by definition'],'The firm incurs an economic loss because price is below ATC','Marginal-cost pricing can require financial support when MC lies below ATC.','confuses_allocative_efficiency_with_break_even'),
('average_cost_regulation','A regulator sets price where demand intersects ATC for a natural monopoly. Which combination best describes the result?',['The firm can cover total economic cost, but price generally remains above MC','The firm earns maximum monopoly profit and output falls to zero','Price equals MC and allocative efficiency is guaranteed','The firm necessarily faces a horizontal demand curve'],'The firm can cover total economic cost, but price generally remains above MC','Average-cost pricing aims for financial viability, not full P=MC efficiency.','assumes_atc_pricing_equals_mc_pricing'),
('price_cap_regulation','A price cap is set above the price the monopolist would charge without regulation. What is the immediate effect?',
 ['The cap is nonbinding and does not constrain the firm’s chosen price','The firm must charge the cap even if it prefers a lower price','The firm becomes perfectly competitive','The firm’s fixed cost becomes zero'],
 'The cap is nonbinding and does not constrain the firm’s chosen price','A ceiling above the unregulated price does not bind.','treats_nonbinding_cap_as_binding'),
('regulatory_tradeoff','A regulator wants lower prices but also wants the utility to maintain infrastructure and innovate. Which concern best captures the tradeoff?',
 ['Aggressive price limits can improve consumer terms while weakening incentives or revenue for cost recovery and investment','Lower prices always increase monopoly profit','Investment incentives are unrelated to expected returns','Any regulation automatically produces the competitive quantity'],'Aggressive price limits can improve consumer terms while weakening incentives or revenue for cost recovery and investment','Regulation balances static consumer/efficiency goals against financial and dynamic incentives.','ignores_dynamic_regulatory_tradeoff'),
('natural_monopoly_cost','Demand for a utility expands enough that the relevant output range moves beyond the region where ATC is falling. What does that suggest about the natural-monopoly argument?',
 ['It may weaken because one firm may no longer have a cost advantage over multiple firms across the new relevant range','It becomes stronger automatically because demand increased','It proves that price discrimination is efficient','It guarantees marginal cost is zero'],'It may weaken because one firm may no longer have a cost advantage over multiple firms across the new relevant range','Natural-monopoly status depends on cost conditions over the relevant market-demand range.','treats_natural_monopoly_as_permanent_label')]:
    add('medium',s,'MON.6',skill,q,opts,c,fb,ce)
for skill,q,opts,c,fb,ce in [
('natural_monopoly_cost','What cost pattern is the key starting point for natural-monopoly analysis?',['ATC falls over the relevant range of market demand','MC is always above price','Demand is perfectly elastic','Fixed cost is zero'],'ATC falls over the relevant range of market demand','Economies of scale over market demand can make a single supplier lowest-cost.','forgets_natural_monopoly_cost_condition'),
('marginal_cost_regulation','What is the efficiency goal of setting a regulated natural-monopoly price equal to MC?',['Produce units up to the point where willingness to pay equals the marginal production cost','Guarantee zero economic profit','Maximize the monopolist’s markup','Prevent all demand changes'],'Produce units up to the point where willingness to pay equals the marginal production cost','P=MC is the allocative-efficiency benchmark.','confuses_mc_pricing_goal'),
('average_cost_regulation','Why does P=ATC usually allow a regulated natural monopoly to remain financially viable?',['Revenue per unit covers average economic cost at the chosen output','It guarantees marginal revenue is zero','It removes all fixed cost','It makes demand perfectly inelastic'],'Revenue per unit covers average economic cost at the chosen output','Average-cost pricing permits recovery of total economic cost including normal profit.','forgets_atc_break_even_logic'),
('price_cap_regulation','When is a price cap actually binding on an unregulated monopolist?',['When the cap is below the price the firm would otherwise charge','Whenever a regulator announces any maximum price','Only when the cap equals ATC','Only when demand is perfectly inelastic'],'When the cap is below the price the firm would otherwise charge','A ceiling constrains behavior only when it lies below the unconstrained price.','misidentifies_binding_cap')]:
    add('repair',s,'MON.6',skill,q,opts,c,fb,ce)
for skill,q,opts,c,fb,ce,secondary in [
('natural_monopoly_cost','How does declining ATC connect the natural-monopoly cost story to the case for one network rather than duplicated networks?',['Serving the market through one larger network can avoid duplicative fixed infrastructure and lower average cost','Declining ATC makes price equal MR','It guarantees one firm will choose the efficient quantity without oversight','It eliminates fixed cost'], 'Serving the market through one larger network can avoid duplicative fixed infrastructure and lower average cost','Scale economies explain why breaking the firm into many duplicative networks may raise production cost.','disconnects_scale_from_market_structure',['economies_of_scale']),
('marginal_cost_regulation','How does marginal-cost regulation connect monopoly policy to the competitive efficiency benchmark?',['Both target P=MC so the last unit’s willingness to pay matches its marginal production cost','Both require P=ATC at every output','Both maximize monopoly profit','Both eliminate the need for demand'],'Both target P=MC so the last unit’s willingness to pay matches its marginal production cost','Marginal-cost pricing tries to reproduce the allocative condition associated with competitive equilibrium.','disconnects_regulation_from_efficiency',['allocative_inefficiency']),
('regulatory_tradeoff','Why might a subsidy accompany marginal-cost pricing for a natural monopoly?',['P=MC can leave revenue below total cost when ATC exceeds MC','A subsidy is required because MR always exceeds price','The subsidy makes demand horizontal','A subsidy prevents all entry barriers'],'P=MC can leave revenue below total cost when ATC exceeds MC','The subsidy addresses the financing gap created by efficient pricing when scale economies keep ATC above MC.','disconnects_subsidy_from_cost_gap',['marginal_cost_regulation']),
('average_cost_regulation','How does average-cost regulation trade some allocative efficiency for financial sustainability?',['P=ATC covers total cost, but price can remain above MC and output below the P=MC level','P=ATC forces the firm to price below MC','P=ATC eliminates all monopoly power','P=ATC makes marginal revenue equal price'],'P=ATC covers total cost, but price can remain above MC and output below the P=MC level','Average-cost pricing is a compromise between cost recovery and the P=MC efficiency benchmark.','misses_regulatory_compromise',['allocative_inefficiency']),
('price_cap_regulation','How can a well-designed price cap change a regulated monopolist’s cost incentives compared with simply reimbursing whatever costs it reports?',['If the firm can keep some gains from lowering cost below the cap, it may have stronger cost-reduction incentives','A cap guarantees the firm will never invest','A cap automatically sets P=MC regardless of its level','A cap makes fixed costs irrelevant'],'If the firm can keep some gains from lowering cost below the cap, it may have stronger cost-reduction incentives','Price-cap design can affect incentives to control cost, not just the allowed price.','ignores_incentive_effect_of_cap',['regulatory_tradeoff'])]:
    add('bridge',s,'MON.6',skill,q,opts,c,fb,ce,secondary=secondary)

# 7) Price Discrimination — 8 E, 8 M, 3 H, 2 R, 4 BR
s='monopoly-price-discrimination'
for skill,q,opts,c,fb,ce in [
('price_discrimination_conditions','For price discrimination to be profitable, the seller generally needs:',['Market power and some ability to separate buyers by willingness to pay or demand responsiveness','Perfectly competitive pricing and free entry','Identical demand elasticity in every group','A requirement that price equal marginal cost'],'Market power and some ability to separate buyers by willingness to pay or demand responsiveness','Price discrimination requires control over price and a way to distinguish relevant buyers or markets.','forgets_market_power_condition'),
('resale_prevention','Why must a price-discriminating seller often prevent resale between customer groups?',['Low-price buyers could otherwise resell to high-price buyers and undermine the price difference','Resale would make marginal cost negative','Resale guarantees the high-price group becomes less elastic','Resale forces average cost to zero'],'Low-price buyers could otherwise resell to high-price buyers and undermine the price difference','Arbitrage erodes segmented prices.','forgets_no_arbitrage_condition'),
('third_degree_price_discrimination','A museum charges local students one price and tourists another based on verifiable group status. This is closest to:',['Third-degree price discrimination','Perfect competition','Marginal-cost regulation','A natural monopoly'],'Third-degree price discrimination','Third-degree discrimination separates identifiable groups and charges them different prices.','misclassifies_group_pricing'),
('third_degree_price_discrimination','All else equal, which customer group usually receives the higher markup under third-degree price discrimination?',['The group with less elastic demand','The group with more elastic demand','The group with the lowest fixed cost','The group with the easiest resale opportunities'],'The group with less elastic demand','Less responsive buyers support a larger markup over marginal cost.','reverses_elasticity_markup_rule'),
('first_degree_price_discrimination','Under perfect first-degree price discrimination, the seller attempts to charge each buyer:',['That buyer’s maximum willingness to pay for each unit','The same single monopoly price','Marginal cost for every unit and nothing more','Average total cost regardless of willingness to pay'],'That buyer’s maximum willingness to pay for each unit','Perfect first-degree discrimination extracts each unit’s willingness to pay.','confuses_first_degree_with_uniform_pricing'),
('price_discrimination_conditions','A theater can identify student status but students can freely transfer discounted tickets to anyone. Which requirement is missing?',['Effective prevention of arbitrage or resale','Market power','A downward-sloping market demand curve','Positive marginal cost'],'Effective prevention of arbitrage or resale','Identification alone is not enough if buyers can defeat segmentation through resale.','ignores_arbitrage'),
('third_degree_price_discrimination','A seller faces two separated groups with the same MC. Group A has more elastic demand than Group B. Which pricing pattern is generally expected?',['A lower price in Group A and a higher price in Group B','A higher price in Group A and a lower price in Group B','The same price because MC is the same','Zero price in the more elastic group'],'A lower price in Group A and a higher price in Group B','The more elastic group receives the smaller markup.','reverses_group_price_rule'),
('price_discrimination_welfare','Can price discrimination ever increase output relative to single-price monopoly?',['Yes; serving additional low-value or elastic-market buyers can expand output in some cases','No; discrimination always leaves output unchanged','No; discrimination always eliminates all consumer purchases','Yes, but only if marginal cost is zero'],'Yes; serving additional low-value or elastic-market buyers can expand output in some cases','The welfare effect depends partly on whether discrimination expands or contracts total output.','assumes_discrimination_always_reduces_output')]:
    add('easy',s,'MON.6',skill,q,opts,c,fb,ce)
for skill,q,opts,c,fb,ce in [
('price_discrimination_conditions','A firm has market power and observes two groups with different demand elasticities, but buyers can costlessly resell the product. What happens to the proposed two-price strategy?',['Arbitrage tends to collapse the price difference','The firm can preserve both prices indefinitely','The high-price group automatically becomes less elastic','Marginal cost becomes different across groups'],'Arbitrage tends to collapse the price difference','Segmentation must be enforceable; costless resale undermines differentiated prices.','ignores_resale_constraint'),
('third_degree_price_discrimination','Why does a third-degree discriminator compare MR from each market with the common MC?',
 ['Profit is increased by allocating another unit to a market whenever that market’s MR exceeds MC','The firm must make prices identical across markets','Average revenue must equal average cost in every market','MC determines demand elasticity directly'],
 'Profit is increased by allocating another unit to a market whenever that market’s MR exceeds MC','The firm allocates output across separated markets using marginal revenue relative to marginal cost.','ignores_market_specific_mr'),
('third_degree_price_discrimination','Two groups have identical MC. Seniors have less elastic demand than students. What happens to the optimal markup?',
 ['The senior markup is larger','The student markup is larger','Both markups must be zero','Both prices must equal ATC'],
 'The senior markup is larger','A less elastic market supports a larger markup over common marginal cost.','reverses_markup_elasticity'),
('first_degree_price_discrimination','Compared with a single-price monopoly, perfect first-degree price discrimination can eliminate the standard output deadweight loss when:',['The firm sells every unit for which willingness to pay is at least MC','The firm charges one common price above MC','Buyers can freely resell units','The firm ignores willingness to pay'],
 'The firm sells every unit for which willingness to pay is at least MC','Perfect discrimination can expand output to the efficient quantity while transferring surplus to the seller.','assumes_first_degree_preserves_dwl'),
('price_discrimination_welfare','A discriminatory pricing plan raises total output by serving a new low-price market. What is the most defensible welfare conclusion?',
 ['Total surplus may rise because additional mutually beneficial trades occur, though distribution also changes','Total surplus must fall because prices differ','Consumer surplus must rise in every group','Deadweight loss is necessarily unchanged'],
 'Total surplus may rise because additional mutually beneficial trades occur, though distribution also changes','Welfare effects depend on output as well as how surplus is redistributed.','judges_welfare_only_from_price_difference'),
('resale_prevention','An airline sells a discounted ticket that cannot be transferred and imposes restrictions that separate leisure from business travelers. What economic purpose do the restrictions serve?',
 ['They help prevent arbitrage and maintain market segmentation','They make the airline a price taker','They force the same elasticity in both groups','They eliminate the airline’s fixed costs'],
 'They help prevent arbitrage and maintain market segmentation','Restrictions can help keep low-price buyers from reselling or masquerading as high-value segments.','ignores_segmentation_device'),
('price_discrimination_conditions','A firm can separate buyers perfectly but faces a perfectly competitive market with many identical sellers. Why is discrimination difficult to sustain?',
 ['The firm lacks enough market power to set different markups without losing customers','Resale prevention becomes irrelevant only because MC is zero','Competitive firms have no costs','Buyer groups necessarily have identical elasticities'],
 'The firm lacks enough market power to set different markups without losing customers','Segmentation is not enough; the seller also needs pricing power.','forgets_market_power_for_discrimination'),
('third_degree_price_discrimination','A monopolist starts charging different prices to two isolated groups. The high-price group is observed to have less elastic demand. Which fact best explains the pricing pattern?',
 ['Optimal monopoly markup is inversely related to demand responsiveness','The high-price group must have higher marginal cost','The low-price group must have higher fixed cost','Price discrimination requires equal prices when MC is common'],
 'Optimal monopoly markup is inversely related to demand responsiveness','Lower elasticity supports a larger markup over marginal cost.','disconnects_elasticity_from_markup')]:
    add('medium',s,'MON.6',skill,q,opts,c,fb,ce)
for skill,q,opts,c,fb,ce in [
('third_degree_price_discrimination','A monopolist serves two isolated markets with PA=90−QA and PB=70−0.5QB. MC=$30 in both. Which price pair is profit maximizing?',
 ['$60 in A and $50 in B','$30 in both','$50 in A and $60 in B','$90 in A and $70 in B'],
 '$60 in A and $50 in B','Set MRA=90−2QA=30 and MRB=70−QB=30; then use each demand curve to find prices.','uses_demand_instead_of_mr_for_segment_output'),
('third_degree_price_discrimination','Market X has elasticity magnitude 2 while Market Y has elasticity magnitude 5 at their candidate prices, with the same MC and effective separation. Which market should generally carry the larger markup?',
 ['Market X, because its demand is less elastic','Market Y, because its demand is more elastic','Both must carry the same markup because MC is equal','Neither; discrimination requires identical elasticities'],
 'Market X, because its demand is less elastic','The lower elasticity magnitude indicates less responsive demand and supports a higher markup.','reverses_lerner_elasticity_logic'),
('price_discrimination_welfare','A perfect first-degree discriminator expands output from the single-price monopoly quantity to the efficient quantity. Which combination is most accurate?',
 ['Standard output deadweight loss disappears, but consumer surplus is largely transferred to the seller','Deadweight loss rises and consumer surplus rises','Price must be identical on every unit','The seller earns zero economic profit by definition'],
 'Standard output deadweight loss disappears, but consumer surplus is largely transferred to the seller','Perfect first-degree discrimination can eliminate output inefficiency while redistributing surplus toward the seller.','confuses_efficiency_with_distribution')]:
    add('hard',s,'MON.6',skill,q,opts,c,fb,ce,typ='analysis')
add('repair',s,'MON.6','price_discrimination_conditions','Which two conditions are especially important for sustaining price discrimination?',
 ['Market power and the ability to segment buyers while limiting resale','Perfect competition and identical buyer demand','Zero marginal cost and free resale','A horizontal demand curve and free entry'],
 'Market power and the ability to segment buyers while limiting resale','The seller needs pricing power and enforceable segmentation.','forgets_conditions_for_discrimination')
add('repair',s,'MON.6','third_degree_price_discrimination','Under third-degree price discrimination, which group normally pays the higher price when marginal cost is the same?',
 ['The group with less elastic demand','The group with more elastic demand','The group with the easiest resale opportunity','The group with lower willingness to pay at every quantity'],
 'The group with less elastic demand','Less elastic demand supports a larger optimal markup.','reverses_elasticity_price_rule')
for skill,q,opts,c,fb,ce,secondary in [
('third_degree_price_discrimination','How does elasticity connect directly to third-degree discriminatory pricing?',
 ['Groups with less elastic demand can sustain larger markups over marginal cost','More elastic groups always pay more','Elasticity determines fixed cost rather than price','Elasticity matters only under perfect competition'],
 'Groups with less elastic demand can sustain larger markups over marginal cost','Different demand responsiveness is the economic reason separated groups can receive different optimal prices.','disconnects_elasticity_from_discrimination',['price_elasticity_of_demand']),
('resale_prevention','How does resale connect segmented pricing back toward a single price?',
 ['Arbitrage lets low-price buyers supply high-price buyers, eroding the price gap','Resale makes demand perfectly inelastic','Resale raises marginal cost only in the low-price market','Resale guarantees first-degree discrimination'],
 'Arbitrage lets low-price buyers supply high-price buyers, eroding the price gap','Preventing resale is what allows separated prices to persist.','disconnects_arbitrage_from_segmentation',['price_discrimination_conditions']),
('price_discrimination_welfare','How should welfare analysis of price discrimination differ from simply asking whether some buyers pay more?',
 ['Track how total output and total surplus change as well as how surplus is redistributed among buyers and the seller','Any price difference is automatically deadweight loss','Only monopoly profit matters for welfare','Consumer surplus alone always equals total surplus'],
 'Track how total output and total surplus change as well as how surplus is redistributed among buyers and the seller','Distribution and efficiency are separate questions; output changes can alter total surplus.','confuses_distribution_with_total_surplus',['monopoly_deadweight_loss']),
('first_degree_price_discrimination','How does perfect first-degree discrimination connect willingness to pay to the efficient-output condition?',
 ['The firm can sell units until the next buyer’s willingness to pay falls below MC','The firm must stop where one common price equals MR','The firm ignores willingness to pay and charges ATC','The firm produces only where demand is unit elastic'],
 'The firm can sell units until the next buyer’s willingness to pay falls below MC','Charging each unit up to willingness to pay can make serving all units with value at least MC profitable.','disconnects_wtp_from_first_degree_efficiency',['allocative_inefficiency'])]:
    add('bridge',s,'MON.6',skill,q,opts,c,fb,ce,secondary=secondary)

# Reduce answer-length cueing without changing question meaning. For a distributed
# sample of stems whose keyed answer is uniquely longest, lengthen one plausible
# distractor with a neutral scope qualifier. This preserves the distractor's false
# claim while preventing option length from signaling the key.
def keyed_index(rec):
    return next(i for i,o in enumerate(rec['options']) if ahash(o)==rec['aHash'])
flagged=[]
for i,rec in enumerate(qs):
    ki=keyed_index(rec); lens=[len(o) for o in rec['options']]
    if lens[ki]==max(lens) and lens.count(max(lens))==1:
        flagged.append(i)
if len(flagged)>=24:
    picks=[]
    for j in range(24):
        picks.append(flagged[round(j*(len(flagged)-1)/23)])
    picks=list(dict.fromkeys(picks))
    qualifiers=[
        ', under the conditions stated in the question',
        ', for the market and time period described',
        ', while the other stated conditions remain unchanged',
        ', over the relevant range described in the scenario',
    ]
    for n,idx in enumerate(picks):
        rec=qs[idx]; ki=keyed_index(rec)
        candidates=[j for j in range(4) if j!=ki]
        di=max(candidates,key=lambda j:len(rec['options'][j]))
        rec['options'][di]=rec['options'][di]+qualifiers[n%len(qualifiers)]
        rec['sourceHash']=shash({k:v for k,v in rec.items() if k not in ('sourceHash','sourceOccurrences')})
        rec['sourceOccurrences'][0]['sourceHash']=rec['sourceHash']

assert len(qs)==94, len(qs)
# Exact audited pool and subtopic counts.
from collections import Counter
assert Counter(q['sourcePool'] for q in qs)==Counter({'easy':26,'medium':23,'hard':7,'repair':19,'bridge':19})
expected={
'monopoly-power-barriers':13,'monopoly-demand-revenue':7,'monopoly-output-price':8,'monopoly-profit-loss-shutdown':7,'monopoly-welfare-efficiency':12,'natural-monopoly-regulation':22,'monopoly-price-discrimination':25}
assert Counter(q['subtopicIds'][0] for q in qs)==Counter(expected)
OUT.write_text(json.dumps({'phase':PHASE,'questionCount':len(qs),'questions':qs},indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
print(json.dumps({'questionCount':len(qs),'poolCounts':Counter(q['sourcePool'] for q in qs),'subtopicCounts':Counter(q['subtopicIds'][0] for q in qs)},default=dict,indent=2))
