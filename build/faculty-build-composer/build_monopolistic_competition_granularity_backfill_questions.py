import json, hashlib, re
from pathlib import Path

ROOT=Path(__file__).resolve().parent
OUT=ROOT/'phaseMicro7-monopolistic-competition-granularity-adaptive-backfill-v1_questions.json'
PHASE='phaseMicro7-monopolistic-competition-granularity-adaptive-backfill-v1'
PARENT='monopolistic-competition'; TAG='monopolistic-competition'; CLUSTER='micro_monopolistic_competition'
qs=[]; seq=0; source_id=9900000

def norm(s): return re.sub(r'\s+',' ',str(s).strip()).lower()
def ahash(answer): return hashlib.sha256(norm(answer).encode()).hexdigest()
def shash(obj): return hashlib.sha256(json.dumps(obj,sort_keys=True,ensure_ascii=False,separators=(',',':')).encode()).hexdigest()

def add(pool,subtopic,objective,skill,q,options,correct,feedback,common='misapplies_monopolistic_competition_rule',typ='application',secondary=None):
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
        'id':f"PM7-MCMP-{pool[0].upper() if pool not in ('repair','bridge') else ('R' if pool=='repair' else 'BR')}-{seq:03d}",
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

# 1) Market Structure & Product Differentiation — 4 M, 5 H, 1 R
s='mcomp-structure-differentiation'
items=[
('medium','product_differentiation','A restaurant has many nearby rivals, but customers value its menu and atmosphere enough that a small price increase does not drive everyone away. What best explains this result?',
 ['Product differentiation gives the restaurant limited price-setting power','Free entry makes the restaurant a pure price taker','Many sellers make the restaurant demand curve perfectly elastic','The restaurant controls the entire market supply'],
 'Product differentiation gives the restaurant limited price-setting power','Differentiation makes the firm’s product an imperfect substitute, so its individual demand curve slopes downward.'),
('medium','elasticity_firm_demand','Several new coffee shops open offering very similar drinks and service. Holding other factors constant, what is most likely to happen to the demand facing one existing shop?',
 ['It becomes more elastic because customers have more close substitutes','It becomes less elastic because the market has more sellers','It becomes vertical because each shop is now smaller','It becomes perfectly inelastic because products remain differentiated'],
 'It becomes more elastic because customers have more close substitutes','More close substitutes make customers more responsive to one firm’s price.'),
('medium','market_structure_characteristics','A city has dozens of independently owned fitness studios. Each offers a somewhat different mix of classes, and new studios can enter without major legal barriers. Which model is the best starting point?',
 ['Monopolistic competition','Perfect competition','Monopoly','Oligopoly'],
 'Monopolistic competition','Many sellers, differentiated products, and relatively easy entry are the defining combination.'),
('medium','product_differentiation','A dental practice competes mainly through evening hours, online scheduling, and unusually fast appointments. Which source of differentiation is most important?',
 ['Service differentiation','Resource ownership','Patent protection','Identical-product pricing'],
 'Service differentiation','The practice is differentiating the service experience rather than relying on a legal barrier or identical product.'),
('hard','elasticity_firm_demand','Firm A sells a differentiated snack with many close substitutes. Firm B holds an exclusive patent on a drug with no close substitute. Which comparison is most plausible?',
 ['Firm A faces more elastic demand than Firm B','Firm A faces less elastic demand than Firm B','Both firms face perfectly elastic demand','Both firms must face the same elasticity because each has a downward-sloping demand curve'],
 'Firm A faces more elastic demand than Firm B','Close substitutes make buyers more responsive to Firm A’s price, while the patent shields Firm B from close substitution.'),
('hard','market_structure_characteristics','A boutique raises its price by 4 percent and loses 7 percent of its customers, but many buyers remain because they prefer its style. What does this pattern most strongly indicate?',
 ['The firm has limited market power, not complete control of demand','The firm is a price taker with perfectly elastic demand','The firm has monopoly power protected by an entry barrier','The market must contain only a few strategically interdependent firms'],
 'The firm has limited market power, not complete control of demand','Differentiation can give a firm some control over price while close substitutes still constrain it.'),
('hard','market_structure_characteristics','A market has many sellers and easy entry. Each seller faces a downward-sloping demand curve for its own product. Which additional fact is most consistent with monopolistic competition?',
 ['Products are differentiated but remain close substitutes','Products are identical and firms accept one market price','A single legal franchise blocks all new rivals','A few firms closely track each rival’s strategic moves'],
 'Products are differentiated but remain close substitutes','Differentiation explains why an individual firm faces downward-sloping demand despite many sellers and easy entry.'),
('hard','location_differentiation','Food-delivery technology makes customers almost indifferent to which neighborhood a restaurant occupies. Other features are unchanged. What happens to location as a source of differentiation?',
 ['It becomes weaker because distance matters less to customers','It becomes stronger because delivery creates a new legal barrier','It guarantees each restaurant a perfectly inelastic demand curve','It turns the market into a natural monopoly'],
 'It becomes weaker because distance matters less to customers','When location matters less to buyers, location creates less product differentiation and less insulation from rivals.'),
('hard','close_substitutes','Suppose all meaningful brand, location, service, and quality differences among many sellers disappear while entry remains easy. Which competitive model does the market move toward?',
 ['Perfect competition','Monopoly','Natural monopoly','Oligopoly'],
 'Perfect competition','With many sellers, easy entry, and effectively identical products, the key remaining conditions resemble perfect competition.'),
]
for it in items: add(it[0],s,'MCMP.1',it[1],it[2],it[3],it[4],it[5])
add('repair',s,'MCMP.1','market_structure_characteristics',
    'A market has many small sellers and easy entry, but every seller offers exactly the same product. What key condition for monopolistic competition is missing?',
    ['Product differentiation','A large number of sellers','Freedom of entry and exit','Independent ownership'],
    'Product differentiation','Many sellers and easy entry are not enough. Monopolistic competition also requires differentiated products.')

# 2) Short-Run Firm Choice, Profit/Loss & Shutdown — 1 R, 3 BR
s='mcomp-short-run-choice'
add('repair',s,'MCMP.2','short_run_shutdown',
    'A monopolistically competitive firm chooses its MR=MC output. At that output, price is below ATC but above AVC. What should the firm do in the short run?',
    ['Continue producing and accept an economic loss','Shut down because any loss requires shutdown','Raise output until price equals ATC','Exit the industry immediately because price is below ATC'],
    'Continue producing and accept an economic loss','If price covers AVC, producing helps pay some fixed cost even though the firm earns an economic loss.')
add('bridge',s,'MCMP.2','short_run_output_choice',
    'Cost analysis tells a differentiated firm its MC curve. Which additional curve is needed to apply the usual profit-maximizing output rule?',
    ['Marginal revenue','Average fixed cost','Long-run average cost','Market supply'],
    'Marginal revenue','A monopolistically competitive firm chooses output where MR equals MC, subject to the usual marginal condition.')
add('bridge',s,'MCMP.2','short_run_shutdown',
    'The shutdown rule from cost analysis carries directly into monopolistic competition. Which comparison determines whether the firm should produce in the short run?',
    ['Price compared with AVC at the chosen output','Price compared with AFC at the chosen output','Marginal revenue compared with ATC','Total revenue compared only with fixed cost'],
    'Price compared with AVC at the chosen output','A firm should produce in the short run when price covers average variable cost at its profit-maximizing output.')
add('bridge',s,'MCMP.2','short_run_profit',
    'A firm has already selected output where MR=MC. Which comparison now determines whether it earns profit or loss?',
    ['Price compared with ATC','Price compared with MC','MR compared with AVC','Demand compared with market supply'],
    'Price compared with ATC','At the chosen output, price above ATC means profit, price below ATC means loss, and equality means zero economic profit.')

# 4) Advertising, Branding & Nonprice Competition — 9 E, 6 M, 2 H, 3 R, 3 BR
s='mcomp-advertising-nonprice'
easy_items=[
('advertising_informational','An advertisement lists a store’s prices, hours, and warranty terms. What type of advertising is this primarily?',['Informational advertising','Persuasive advertising','Predatory pricing','Price discrimination'],'Informational advertising','The message mainly reduces consumers’ information costs by providing facts.'),
('advertising_persuasive','A perfume ad links the brand with status and excitement but provides almost no factual product information. What type of advertising is this primarily?',['Persuasive advertising','Informational advertising','Marginal-cost pricing','Perfectly competitive promotion'],'Persuasive advertising','The ad is trying to shape preferences and brand perception rather than mainly transmit facts.'),
('quality_competition','A café upgrades ingredients and service rather than cutting price. Which strategy is it using?',['Nonprice competition through quality','A price ceiling','Perfect price discrimination','Market exit'],'Nonprice competition through quality','Monopolistically competitive firms often compete through quality and service as well as price.'),
('nonprice_competition','A shoe company introduces custom colors and faster delivery while leaving its posted price unchanged. This is an example of:',['Nonprice competition','Collusive pricing','A shutdown decision','Perfect competition'],'Nonprice competition','The firm is competing through product features and service rather than changing price.'),
('selling_cost','A firm buys a one-time advertising campaign that does not change demand. If the expense is fixed, which cost curve does it directly raise?',['Average total cost','Marginal cost','Average variable cost','Marginal revenue'],'Average total cost','A fixed selling cost raises fixed and average total cost but does not directly raise MC or AVC.'),
('selling_cost','A platform charges a promotional fee on every unit a seller sells. The fee acts most like an increase in:',['Variable cost','Fixed cost','Consumer income','Market demand'],'Variable cost','A per-unit selling expense rises with output, so it behaves like a variable cost.'),
('advertising_demand_shift','A successful brand campaign causes more buyers to want the firm’s product at every price. What happens to the firm’s demand curve?',['It shifts to the right','There is a movement down the same demand curve','It becomes the market supply curve','It shifts left because advertising raises cost'],'It shifts to the right','A change in buyers’ willingness to purchase at each price is a demand shift, not a movement along demand.'),
('advertising_elasticity','A loyalty campaign makes customers less willing to switch to rival brands after a price increase. The firm’s demand has become:',['Less elastic','More elastic','Perfectly elastic','Perfectly inelastic in every case'],'Less elastic','Greater brand loyalty reduces responsiveness to the firm’s price, making demand less elastic.'),
('innovation_product_development','A firm develops a distinctive new feature that rivals have not yet copied. What is the most immediate competitive effect?',['Temporary product differentiation','Guaranteed permanent monopoly','Perfectly elastic firm demand','Automatic long-run zero profit immediately'],'Temporary product differentiation','A distinctive feature can temporarily strengthen differentiation until rivals respond or imitate it.')]
for skill,q,opts,ans,fb in easy_items: add('easy',s,'MCMP.5',skill,q,opts,ans,fb)
med_items=[
('selling_cost','A firm spends $20,000 on a fixed ad campaign. Demand shifts right, but MC is unchanged. Which statement is correct?',['The profit-maximizing output may rise because MR changed, while the fixed ad cost also lowers profit','Output must stay unchanged because every advertising expense is fixed','MC shifts upward by exactly $20,000 at every output','Profit must rise because demand shifted right'],'The profit-maximizing output may rise because MR changed, while the fixed ad cost also lowers profit','The demand shift can change MR and output even though the fixed selling cost itself does not shift MC.'),
('advertising_informational','A comparison website makes it easier for buyers to compare nearly identical local services. What effect is most likely on each firm’s demand?',['Demand becomes more elastic','Demand becomes less elastic','Demand becomes vertical','Demand becomes perfectly inelastic'],'Demand becomes more elastic','Better comparison makes substitution easier, increasing buyers’ responsiveness to one firm’s price.'),
('selling_cost','A firm pays a $3 promotional fee for every unit sold, and demand is unchanged. What is the most direct short-run effect?',['MC rises, so the MR=MC output tends to fall','Only fixed cost rises, so output cannot change','Demand shifts right by $3 at every quantity','ATC falls because advertising spreads fixed cost'],'MC rises, so the MR=MC output tends to fall','A per-unit selling cost raises marginal cost and tends to reduce the profit-maximizing output when demand is unchanged.'),
('quality_competition','A restaurant improves food quality. Customers are willing to pay more, but marginal production cost also rises. What determines the new profit-maximizing output?',['The new MR and MC curves together','The demand shift alone','The cost increase alone','The old output because quality is nonprice competition'],'The new MR and MC curves together','Quality improvement can affect both willingness to pay and cost, so the new optimum still requires comparing MR and MC.'),
('advertising_elasticity','A branding campaign leaves the number of buyers unchanged but makes them less price sensitive. What becomes more plausible, other things equal?',['A larger profit-maximizing markup','A perfectly competitive price','A horizontal firm demand curve','A lower willingness to pay at every quantity'],'A larger profit-maximizing markup','Less elastic demand can support greater price-cost markup for a firm with market power.'),
('advertising_signal','Consumers cannot directly observe product durability before purchase. Why might heavy advertising sometimes be interpreted as a quality signal?',['A high-quality seller may expect repeat business that helps justify the advertising expense','Advertising legally guarantees the product will be high quality','Only low-quality sellers are allowed to advertise heavily','Advertising eliminates all uncertainty before purchase'],'A high-quality seller may expect repeat business that helps justify the advertising expense','In signaling models, willingness to incur a visible selling cost can sometimes convey information when higher quality supports repeat sales.')]
for skill,q,opts,ans,fb in med_items: add('medium',s,'MCMP.5',skill,q,opts,ans,fb)
hard_items=[
('selling_cost','Two campaigns cost the same fixed amount. Campaign A shifts demand right but leaves elasticity unchanged. Campaign B leaves demand quantity unchanged but makes demand less elastic. Why can the profit effects differ?',['The campaigns alter the firm’s revenue conditions in different ways even though both add the same fixed cost','Fixed advertising cost always changes MC by the same amount','Only Campaign A can affect marginal revenue','Only Campaign B can affect the price the firm charges'],'The campaigns alter the firm’s revenue conditions in different ways even though both add the same fixed cost','A demand shift and an elasticity change can alter MR and optimal price/output differently, while the fixed cost enters profit separately.'),
('quality_competition','A firm can spend on product quality that shifts demand right but also raises MC. Which conclusion is economically sound before seeing the magnitudes?',['Profit may rise or fall because both revenue and marginal cost conditions change','Profit must rise because buyers value the improvement','Profit must fall because marginal cost increases','Optimal output cannot change because price was not directly altered'],'Profit may rise or fall because both revenue and marginal cost conditions change','The net effect depends on how much the improvement changes willingness to pay relative to the increase in marginal cost.')]
for skill,q,opts,ans,fb in hard_items: add('hard',s,'MCMP.5',skill,q,opts,ans,fb)
repair_items=[
('selling_cost','A fixed advertising bill increases but demand does not change. Why does the MR=MC output stay the same?',['The fixed cost does not directly shift MR or MC','The fixed cost lowers price by the same amount','The fixed cost raises MC at every unit','Advertising expenses never affect profit'],'The fixed cost does not directly shift MR or MC','A pure fixed-cost change lowers profit but does not alter the marginal decision when demand is unchanged.'),
('advertising_informational','An ad tells buyers the product price and where to buy it. Why is this informational rather than persuasive?',['It supplies facts that reduce search costs','It guarantees buyers will prefer the brand','It changes the product’s physical quality','It prevents consumers from switching brands'],'It supplies facts that reduce search costs','Informational advertising communicates useful facts instead of mainly trying to reshape preferences.'),
('advertising_demand_shift','After a successful campaign, buyers purchase more at every possible price. Is this a movement along the firm’s demand curve?',['No, it is a rightward shift of demand','Yes, because quantity demanded increased','Yes, because advertising changes the posted price','No, it is a leftward shift of supply'],'No, it is a rightward shift of demand','More demanded at every price is a demand shift. A movement along demand requires a change in the firm’s own price.')]
for skill,q,opts,ans,fb in repair_items: add('repair',s,'MCMP.5',skill,q,opts,ans,fb)
bridge_items=[
('advertising_elasticity','Elasticity analysis helps explain branding. If brand loyalty reduces the absolute value of price elasticity of demand, buyers become:',['Less responsive to the firm’s price','More responsive to the firm’s price','Completely unwilling to buy','Perfectly responsive at one market price'],'Less responsive to the firm’s price','Lower absolute elasticity means quantity demanded changes less for a given percentage price change.'),
('selling_cost','Cost analysis helps separate two advertising cases. Which selling expense acts most like variable cost?',['A fee charged on each unit sold','A flat annual sponsorship payment','A one-time logo redesign','A fixed monthly billboard lease'],'A fee charged on each unit sold','A per-unit fee varies with output and therefore enters variable and marginal cost.'),
('innovation_product_development','A successful new product feature creates short-run profit in a market with easy entry. What long-run force can erode that profit?',['Entry and imitation by rivals','A permanent legal ban on substitutes','Automatic shutdown of the innovating firm','A requirement that demand become perfectly inelastic'],'Entry and imitation by rivals','With relatively easy entry and close substitutes, successful differentiation can attract rivals and imitation over time.')]
for skill,q,opts,ans,fb in bridge_items: add('bridge',s,'MCMP.5',skill,q,opts,ans,fb)

# 5) Product Variety, Efficiency & Model Limits — 4 E, 4 M, 1 H, 1 R
s='mcomp-efficiency-variety-limits'
easy_items=[
('product_variety','Why can consumers value monopolistic competition even though firms may not produce at minimum ATC?',['It offers product variety that can match different preferences','It guarantees the lowest possible price for every product','It eliminates all selling costs','It makes every firm a price taker'],'It offers product variety that can match different preferences','Differentiation can create consumer value through variety even when the standard model shows some productive inefficiency.'),
('allocative_inefficiency','In the standard long-run model, which condition signals allocative inefficiency for a monopolistically competitive firm?',['Price exceeds marginal cost','Price equals average total cost','Marginal revenue equals marginal cost','Economic profit equals zero'],'Price exceeds marginal cost','Allocative efficiency requires P=MC. A positive markup means some mutually beneficial trades may not occur.'),
('model_limitations','A market has only three differentiated firms, and each changes strategy when a rival cuts price. Why may monopolistic competition be a poor model?',['Strategic interdependence points toward oligopoly','Differentiated products require perfect competition','Few firms automatically create a natural monopoly','Price changes are impossible under monopolistic competition'],'Strategic interdependence points toward oligopoly','The monopolistic-competition model assumes many firms whose individual strategic reactions are usually not central.'),
('welfare_tradeoff','Why is a larger number of brands not automatically socially better?',['Additional variety can create benefits but also use resources and duplicate fixed costs','Every new brand necessarily lowers marginal cost','More brands guarantee P=MC for all firms','Product variety eliminates excess capacity'],'Additional variety can create benefits but also use resources and duplicate fixed costs','The welfare question compares the value of added variety with the resources used to create and sustain it.')]
for skill,q,opts,ans,fb in easy_items: add('easy',s,'MCMP.6',skill,q,opts,ans,fb)
med_items=[
('welfare_tradeoff','A policy causes several niche brands to exit. Average production cost falls, but consumers lose valued variety. What is the correct welfare conclusion?',['The net effect is ambiguous without comparing cost savings with lost variety benefits','Welfare must rise because average cost fell','Welfare must fall because the number of brands fell','The change is irrelevant because firms earn zero economic profit'],'The net effect is ambiguous without comparing cost savings with lost variety benefits','Efficiency analysis must weigh resource savings against the consumer value of differentiation and variety.'),
('market_classification','A textbook labels a market monopolistically competitive because it has many differentiated sellers. In one rural town, however, only two sellers actually serve customers. What is the best caution?',['The local market may display strategic interdependence that the broad model misses','The market must still be perfectly competitive locally','Two local sellers guarantee a natural monopoly','Differentiation becomes irrelevant whenever geography matters'],'The local market may display strategic interdependence that the broad model misses','Market boundaries matter. A broad national description can hide a much more concentrated local competitive environment.'),
('allocative_inefficiency','A long-run monopolistically competitive firm earns zero economic profit but charges P>$MC$. What does this show?',['Zero economic profit does not imply allocative efficiency','The firm must be earning an accounting loss','Entry has failed to eliminate all market power','The firm is producing at minimum ATC'],'Zero economic profit does not imply allocative efficiency','Entry can eliminate economic profit while differentiation leaves a markup and P above MC.'),
('product_variety','Two markets have the same total production cost. Market A offers one standardized product; Market B offers several differentiated versions that consumers value. What can be said?',['Market B may generate greater consumer benefit because variety itself can have value','Market A must be more allocatively efficient because it has fewer products','Market B must have higher deadweight loss because it has more brands','Both markets provide identical welfare because production cost is the same'],'Market B may generate greater consumer benefit because variety itself can have value','Equal production cost does not imply equal consumer benefit when differentiated varieties match heterogeneous preferences.')]
for skill,q,opts,ans,fb in med_items: add('medium',s,'MCMP.6',skill,q,opts,ans,fb)
add('hard',s,'MCMP.6','welfare_tradeoff',
    'Suppose a regulator could force every differentiated firm to price at marginal cost, but doing so would reduce firms’ ability to cover fixed product-development costs and some varieties would disappear. What is the best conclusion?',
    ['The welfare effect depends on the gain from lower markups relative to the loss of valued variety','Marginal-cost pricing must raise welfare because P=MC is always sufficient','Variety loss is irrelevant because all firms initially earned zero economic profit','The policy must lower welfare because regulation can never improve allocation'],
    'The welfare effect depends on the gain from lower markups relative to the loss of valued variety','The standard markup is inefficient, but differentiated products may create variety benefits and require fixed costs. Both sides matter.')
add('repair',s,'MCMP.6','allocative_inefficiency',
    'A monopolistically competitive firm earns zero economic profit in long-run equilibrium. Does that prove the outcome is fully efficient?',
    ['No. Price can still exceed MC and output can remain below the minimum-ATC quantity','Yes. Zero economic profit guarantees both allocative and productive efficiency','Yes. Entry forces price to equal MC and minimum ATC','No. Zero economic profit means the firm should shut down'],
    'No. Price can still exceed MC and output can remain below the minimum-ATC quantity','Zero economic profit is an entry condition, not proof of allocative or productive efficiency.')

assert len(qs)==47, len(qs)
# Exact audited mix
from collections import Counter
assert Counter(q['sourcePool'] for q in qs)==Counter({'easy':13,'medium':14,'hard':8,'repair':6,'bridge':6})
OUT.write_text(json.dumps({'phase':PHASE,'questionCount':len(qs),'questions':qs},indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
print(json.dumps({'questionCount':len(qs),'poolCounts':dict(Counter(q['sourcePool'] for q in qs)),'subtopicCounts':dict(Counter(q['subtopicIds'][0] for q in qs))},indent=2))
