import json, hashlib, re
from pathlib import Path

ROOT=Path(__file__).resolve().parent
OUT=ROOT/'phaseMicro8-oligopoly-granularity-adaptive-backfill-v1_questions.json'
PHASE='phaseMicro8-oligopoly-granularity-adaptive-backfill-v1'
PARENT='oligopoly'; TAG='oligopoly'; CLUSTER='micro_oligopoly'
qs=[]; seq=0; source_id=9980000

def norm(s): return re.sub(r'\s+',' ',str(s).strip()).lower()
def ahash(answer): return hashlib.sha256(norm(answer).encode()).hexdigest()
def shash(obj): return hashlib.sha256(json.dumps(obj,sort_keys=True,ensure_ascii=False,separators=(',',':')).encode()).hexdigest()

def add(pool,subtopic,objective,skill,q,options,correct,feedback,common='misapplies_oligopoly_rule',typ='application',secondary=None):
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
        'id':f"PM8-OLI-{pool[0].upper() if pool not in ('repair','bridge') else ('R' if pool=='repair' else 'BR')}-{seq:03d}",
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

# ---------------------------------------------------------------------------
# 1) Oligopoly Structure, Strategic Interdependence & Concentration
# deficits: +3 Easy, +4 Medium, +2 Repair, +2 Bridge = 11
# ---------------------------------------------------------------------------
s='oligopoly-structure-concentration'
add('easy',s,'OLI.1','strategic_interdependence',
    'Why does an oligopoly firm pay unusually close attention to a rival’s likely response before changing price?',
    ['Because a few large rivals can materially change the payoff from the firm’s decision','Because every oligopoly firm is legally required to match rival prices','Because oligopoly firms sell only identical products','Because market demand is perfectly elastic for each firm'],
    'Because a few large rivals can materially change the payoff from the firm’s decision',
    'With only a few important firms, one firm’s action can provoke responses that change its own payoff.')
add('easy',s,'OLI.1','barriers_to_entry_oligopoly',
    'Which condition most helps a few established firms remain dominant in an oligopoly?',
    ['Significant barriers that make entry difficult','Perfectly free entry by many small firms','A requirement that every product be identical','A horizontal demand curve for each individual firm'],
    'Significant barriers that make entry difficult',
    'Entry barriers help preserve a market in which a small number of firms account for much of total sales.')
add('easy',s,'OLI.1','concentration_ratio',
    'A four-firm concentration ratio of 82% means that:',
    ['The four largest firms together account for 82% of market sales','Each of the four largest firms has exactly 82% of sales','The HHI must equal 8200','Eighty-two firms control the market'],
    'The four largest firms together account for 82% of market sales',
    'A concentration ratio adds the market shares of the specified number of largest firms.')
add('medium',s,'OLI.1','market_definition',
    'A grocery chain has only 8% of national grocery sales but 55% of sales in one isolated county. What does this example show about concentration measures?',
    ['They depend on how the relevant market is defined','They are valid only for national markets','They ignore geographic competition by definition','They measure profit rather than market share'],
    'They depend on how the relevant market is defined',
    'The same firm can appear small or dominant depending on the economically relevant geographic and product market.')
add('medium',s,'OLI.1','hhi',
    'Two markets each have a four-firm concentration ratio of 80%. In Market A the four firms have nearly equal shares; in Market B one firm is much larger than the other three. Which statement is most accurate?',
    ['Market B can have a higher HHI because HHI gives more weight to large shares','Both markets must have the same HHI because their CR4 values match','Market A must have the higher HHI because equal shares are squared','HHI cannot distinguish markets with the same CR4'],
    'Market B can have a higher HHI because HHI gives more weight to large shares',
    'Squaring market shares makes HHI more sensitive to a very large firm even when CR4 is unchanged.')
add('medium',s,'OLI.1','strategic_interdependence',
    'Three national wireless carriers dominate a market. Before one carrier cuts price, its managers estimate how the other two are likely to respond. Which feature of oligopoly is being illustrated?',
    ['Strategic interdependence','Perfect information with no rivalry','Automatic collusion','Zero barriers to entry'],
    'Strategic interdependence',
    'The payoff from one firm’s choice depends partly on how a small number of major rivals react.')
add('medium',s,'OLI.1','market_concentration',
    'An industry’s HHI rises after two sizable firms merge. What can the HHI increase tell an analyst directly?',
    ['Market concentration increased under the chosen market definition','Consumer welfare necessarily fell','The merger is automatically unlawful','The merged firm must now be a monopolist'],
    'Market concentration increased under the chosen market definition',
    'HHI measures concentration; welfare and policy conclusions require additional evidence about competition and efficiencies.')
add('repair',s,'OLI.1','concentration_ratio',
    'A student says a four-firm concentration ratio squares each firm’s market share. What is the correction?',
    ['The four-firm ratio simply adds the shares of the four largest firms','The four-firm ratio multiplies the four largest shares together','The four-firm ratio subtracts fringe shares from 100','The four-firm ratio averages all firms’ squared shares'],
    'The four-firm ratio simply adds the shares of the four largest firms',
    'Squaring shares is part of HHI, not the four-firm concentration ratio.')
add('repair',s,'OLI.1','strategic_interdependence',
    'A student describes oligopoly as “a market where each firm can safely ignore rivals.” What is the key error?',
    ['Oligopoly decisions are strategically interdependent because major rivals can respond','Oligopoly always has exactly two firms','Oligopoly requires identical products','Oligopoly firms are all price takers'],
    'Oligopoly decisions are strategically interdependent because major rivals can respond',
    'The defining strategic feature is that a few important firms must account for likely rival reactions.')
add('bridge',s,'OLI.1','market_classification',
    'A student can distinguish monopoly from perfect competition but is unsure where a market with four dominant firms belongs. What is the best bridge idea?',
    ['Focus on few-firm strategic interdependence rather than requiring one firm or many tiny price takers','Assume four firms automatically means monopolistic competition','Classify the market only by whether products are identical','Treat every concentrated market as a legal monopoly'],
    'Focus on few-firm strategic interdependence rather than requiring one firm or many tiny price takers',
    'Oligopoly sits between monopoly and atomistic competition because a few large firms interact strategically.')
add('bridge',s,'OLI.1','hhi',
    'A student already understands market shares. What extra step turns those shares into an HHI?',
    ['Square each firm’s percentage share and add the squared shares','Add only the four largest shares','Average the two largest shares','Multiply every share by the market price'],
    'Square each firm’s percentage share and add the squared shares',
    'HHI builds on market shares by squaring each percentage share and summing across firms.')

# ---------------------------------------------------------------------------
# 2) Game Theory Foundations
# deficits: +4 Easy, +7 Medium, +6 Bridge = 17
# ---------------------------------------------------------------------------
s='oligopoly-game-theory-foundations'
add('easy',s,'OLI.2','game_players_strategies_payoffs',
    'In a two-firm game, what does a payoff represent?',
    ['The outcome value a player receives from a particular combination of strategies','The number of firms legally allowed to enter','The market concentration ratio','The slope of the industry demand curve'],
    'The outcome value a player receives from a particular combination of strategies',
    'A payoff records how well a player does under a particular combination of actions.')
add('easy',s,'OLI.2','payoff_matrix_reading',
    'A payoff cell is written (14, 9), with Row’s payoff listed first. What is Column’s payoff?',
    ['9','14','23','5'],
    '9','With payoff order (Row, Column), the second number belongs to Column.')
add('easy',s,'OLI.2','best_response',
    'A best response is the action that:',
    ['Gives a player the highest payoff given the rival’s chosen action','Maximizes the two firms’ combined payoff regardless of incentives','Is chosen by every rival in the market','Always remains best no matter what the rival does'],
    'Gives a player the highest payoff given the rival’s chosen action',
    'A best response is conditional on what the other player does; it need not be a dominant strategy.')
add('easy',s,'OLI.2','nash_equilibrium',
    'Which statement describes a Nash equilibrium?',
    ['Each player is choosing a best response to the other player’s action','The two players necessarily maximize their combined payoff','Both players must have dominant strategies','No player earns positive profit'],
    'Each player is choosing a best response to the other player’s action',
    'At a Nash equilibrium, neither player can improve by changing action alone while the other action stays fixed.')
add('medium',s,'OLI.2','best_response',
    'Suppose Firm B chooses a high price. Firm A earns $8 million with a high price and $11 million with a low price. What is Firm A’s best response to B’s high price?',
    ['Choose the low price','Choose the high price','Randomize because the payoffs differ','Choose whichever action maximizes joint industry profit'],
    'Choose the low price',
    'Conditional on B choosing high, A compares its own payoffs and chooses the action paying 11 rather than 8.')
add('medium',s,'OLI.2','dominant_strategy',
    'Firm A earns more from advertising whether Firm B advertises or not. What follows?',
    ['Advertising is a dominant strategy for Firm A','Advertising must maximize joint profit','The game has no Nash equilibrium','Firm B must also advertise'],
    'Advertising is a dominant strategy for Firm A',
    'A dominant strategy gives the player a higher payoff for every action the rival might take.')
add('medium',s,'OLI.2','dominant_strategy',
    'A strategy is Firm A’s best response when B chooses X, but A prefers a different strategy when B chooses Y. What can be concluded?',
    ['The first strategy is not dominant for A','The first strategy is dominant because it is best once','A has no best responses','The joint-payoff maximum must be a Nash equilibrium'],
    'The first strategy is not dominant for A',
    'Dominance requires the same strategy to be best against every rival action.')
add('medium',s,'OLI.2','nash_equilibrium',
    'At a proposed outcome, Firm A could gain by changing its action while Firm B kept its action fixed. What does that imply?',
    ['The proposed outcome is not a Nash equilibrium','The proposed outcome must maximize joint profit','Firm A has a dominant strategy','The game has no strategic interdependence'],
    'The proposed outcome is not a Nash equilibrium',
    'A unilateral profitable deviation means at least one player is not best responding, so the cell is not Nash.')
add('medium',s,'OLI.2','cooperative_outcome',
    'Two firms could earn $20 million each by coordinating, but the Nash equilibrium gives each $14 million. What does this illustrate?',
    ['A Nash equilibrium need not maximize combined payoff','Every Nash equilibrium is efficient','Coordination eliminates strategic incentives','Dominant strategies always produce the joint-payoff maximum'],
    'A Nash equilibrium need not maximize combined payoff',
    'Mutual best responses can lead to a stable outcome with lower total payoff than a cooperative alternative.')
add('medium',s,'OLI.2','payoff_matrix_reading',
    'In payoff order (Row, Column), the cell for Row choosing A and Column choosing Y is (6, 15). Which comparison is relevant when finding Row’s best response to Y?',
    ['Compare Row’s first-number payoffs across Row’s available actions in column Y','Compare Column’s second-number payoffs across all columns','Add both payoffs in every cell and choose the largest sum','Compare only the diagonal cells'],
    'Compare Row’s first-number payoffs across Row’s available actions in column Y',
    'A best-response calculation holds the rival action fixed and compares the player’s own payoff across its alternatives.')
add('medium',s,'OLI.2','noncooperative_outcome',
    'Why can firms end up at an outcome they both consider worse than another available outcome?',
    ['Individual incentives to deviate can make the better joint outcome unstable','Firms are required to choose the lowest total payoff','A Nash equilibrium always minimizes profit','Payoff matrices ignore strategic behavior'],
    'Individual incentives to deviate can make the better joint outcome unstable',
    'A jointly attractive cell need not survive if one player can gain by deviating while the rival cooperates.')
add('bridge',s,'OLI.2','payoff_matrix_reading',
    'Before trying to find a Nash equilibrium in a payoff matrix, what should a student verify first?',
    ['Which payoff belongs to each player and which actions define the rows and columns','Which cell has the highest combined payoff','Whether the market HHI exceeds a legal threshold','Whether both players earn equal payoffs'],
    'Which payoff belongs to each player and which actions define the rows and columns',
    'Correctly reading the matrix is the prerequisite for identifying best responses and equilibrium.')
add('bridge',s,'OLI.2','best_response',
    'A student keeps searching for one action that is always best, but the player’s preferred action changes with the rival’s move. What concept should the student use?',
    ['Conditional best responses','Market concentration','Joint-profit maximization only','A guaranteed dominant strategy'],
    'Conditional best responses',
    'Best responses can vary with the rival’s action even when no dominant strategy exists.')
add('bridge',s,'OLI.2','dominant_strategy',
    'A student has correctly found a player’s best response in each column. How should the student check for a dominant strategy?',
    ['See whether the same action is the best response in every column','Add the two players’ payoffs in each cell','Choose the action with the highest single payoff anywhere in the matrix','Look only at the rival’s payoffs'],
    'See whether the same action is the best response in every column',
    'A dominant strategy must remain the player’s best response to every rival action.')
add('bridge',s,'OLI.2','nash_equilibrium',
    'After marking each player’s best responses in a matrix, what identifies a pure-strategy Nash equilibrium?',
    ['A cell where both players’ best-response markings coincide','The cell with the largest total payoff even if someone wants to deviate','Any cell where the payoffs are equal','The first cell in which one player has a dominant strategy'],
    'A cell where both players’ best-response markings coincide',
    'Nash equilibrium requires mutual best responses in the same outcome cell.')
add('bridge',s,'OLI.2','cooperative_outcome',
    'A student found the cell with the largest combined payoff and calls it the Nash equilibrium. What must still be checked?',
    ['Whether each player would choose to stay there given the other player’s action','Whether the two payoffs add to a positive number','Whether the firms have equal market shares','Whether the cell lies on the main diagonal'],
    'Whether each player would choose to stay there given the other player’s action',
    'Joint-payoff maximization and Nash stability are separate questions.')
add('bridge',s,'OLI.2','noncooperative_outcome',
    'How does a noncooperative game differ from an assumed cartel solution?',
    ['Each firm follows its own incentives rather than committing to maximize joint profit','The firms necessarily choose identical actions','The firms ignore rivals completely','The government chooses each firm’s strategy'],
    'Each firm follows its own incentives rather than committing to maximize joint profit',
    'Noncooperative analysis asks what individually rational strategies imply without assuming binding joint-profit coordination.')

# ---------------------------------------------------------------------------
# 3) Collusion, Cartels & Prisoner's-Dilemma Incentives
# deficits: +4 Easy, +5 Medium, +2 Hard, +2 Repair = 13
# ---------------------------------------------------------------------------
s='oligopoly-collusion-cartels'
add('easy',s,'OLI.3','joint_profit_maximization',
    'A cartel that successfully coordinates output tries to behave most like:',
    ['A single profit-maximizing monopolist for the industry','A group of independent price-taking firms','A perfectly contestable market with free entry','A regulator setting price equal to marginal cost'],
    'A single profit-maximizing monopolist for the industry',
    'A successful cartel restricts joint output and chooses the industry outcome that maximizes combined profit.')
add('easy',s,'OLI.3','incentive_to_cheat',
    'Why can a cartel agreement be unstable even when all members gain from the agreement?',
    ['An individual member may gain by secretly expanding sales while others keep output restricted','Every member must legally charge a different price','Cartels require marginal cost to equal zero','Joint profit is always lower than competitive profit'],
    'An individual member may gain by secretly expanding sales while others keep output restricted',
    'The group can prefer restriction while each member has a private incentive to capture extra sales.')
add('easy',s,'OLI.3','monitoring_enforcement',
    'What does monitoring do for a cartel?',
    ['It helps members detect whether other members are cheating on the agreement','It guarantees that entry barriers disappear','It makes each firm a price taker','It eliminates the need to restrict output'],
    'It helps members detect whether other members are cheating on the agreement',
    'Monitoring makes hidden deviations easier to discover and therefore easier to punish.')
add('easy',s,'OLI.3','prisoners_dilemma',
    'In a one-shot prisoner’s-dilemma-style pricing game, why might both firms cut price even though both would prefer that neither cut?',
    ['Each firm has an individual incentive to cut given the rival’s possible action','The firms are maximizing total industry profit','Price cuts are legally required','Both firms face perfectly inelastic demand'],
    'Each firm has an individual incentive to cut given the rival’s possible action',
    'Individual incentives can push both firms toward a lower-payoff noncooperative outcome.')
add('medium',s,'OLI.3','cartel_output_allocation',
    'A cartel has already chosen its joint-profit-maximizing total output. Why might it assign more production to a member with lower marginal cost?',
    ['Shifting output toward the lower-cost producer can reduce the cartel’s total production cost','Equal quotas always maximize joint profit','Higher-cost firms must produce more to preserve competition','Output allocation cannot affect cartel profit once total output is fixed'],
    'Shifting output toward the lower-cost producer can reduce the cartel’s total production cost',
    'For a fixed cartel total, allocating more production to lower-marginal-cost members can raise combined profit.')
add('medium',s,'OLI.3','incentive_to_cheat',
    'Three firms agree to keep prices high. One firm quietly gives large rebates while publicly posting the agreed price. Economically, the rebates are best interpreted as:',
    ['Cheating that captures extra sales while rivals maintain the collusive price','Proof that the cartel has eliminated competition','A required form of price leadership','A concentration measure'],
    'Cheating that captures extra sales while rivals maintain the collusive price',
    'Secret rebates undermine the agreement by letting one member expand sales at the others’ expense.')
add('medium',s,'OLI.3','cartel_instability',
    'Which market condition makes a cartel harder to sustain?',
    ['Many opportunities for members to make secret sales that rivals cannot observe','Frequent transparent reporting of member sales','A small number of firms with similar objectives','A credible ability to punish detected deviations'],
    'Many opportunities for members to make secret sales that rivals cannot observe',
    'When cheating is hard to observe, deviations are easier and enforcement becomes weaker.')
add('medium',s,'OLI.3','joint_profit_maximization',
    'A cartel restricts total output below the competitive level. What is the intended effect on the market price?',
    ['Raise price by moving up the market demand curve','Force price down to marginal cost','Make price independent of demand','Create perfectly elastic industry demand'],
    'Raise price by moving up the market demand curve',
    'Restricting industry output raises the price buyers are willing to pay along downward-sloping market demand.')
add('medium',s,'OLI.3','monitoring_enforcement',
    'Suppose cartel members can observe one another’s sales almost immediately. Why can this improve cartel stability?',
    ['It makes cheating easier to detect and respond to','It removes each member’s incentive to earn profit','It guarantees the cartel price equals marginal cost','It causes market concentration to fall'],
    'It makes cheating easier to detect and respond to',
    'Fast observability reduces the chance that a member can profit from hidden deviations for long.')
add('hard',s,'OLI.3','cartel_instability',
    'A cartel’s members all prefer the collusive outcome to the competitive outcome, yet the agreement repeatedly breaks down. Which explanation is most consistent with oligopoly incentives?',
    ['Each firm can gain privately from expanding output if it expects rivals to keep restricting theirs','The cartel outcome cannot produce positive profit','Members have no information about market demand','A jointly preferred outcome is automatically a Nash equilibrium'],
    'Each firm can gain privately from expanding output if it expects rivals to keep restricting theirs',
    'Joint gains do not erase the unilateral incentive to cheat when other members are expected to cooperate.')
add('hard',s,'OLI.3','cartel_welfare',
    'An effective cartel raises price from $30 to $42 and reduces quantity sold. Which statement best separates redistribution from efficiency loss?',
    ['Some consumer surplus becomes producer gain, while trades no longer made create deadweight loss','Every dollar of lost consumer surplus is deadweight loss','Higher cartel profit proves total surplus rose','Deadweight loss is the cartel’s entire increase in revenue'],
    'Some consumer surplus becomes producer gain, while trades no longer made create deadweight loss',
    'A higher price transfers some surplus, but the output restriction also destroys gains from mutually beneficial trades.')
add('repair',s,'OLI.3','prisoners_dilemma',
    'A student says “if both firms would be better off cooperating, they will automatically cooperate.” What is missing?',
    ['Each firm’s unilateral incentive must also be checked; the cooperative outcome can be unstable','Joint payoff is irrelevant in oligopoly','Cooperation requires the firms to have identical costs','Prisoner’s-dilemma incentives exist only in monopoly'],
    'Each firm’s unilateral incentive must also be checked; the cooperative outcome can be unstable',
    'A prisoner’s dilemma exists precisely because individual incentives can undermine a jointly better outcome.')
add('repair',s,'OLI.3','cartel',
    'A student calls any concentrated industry a cartel. What is the correction?',
    ['A cartel requires coordination among firms to restrict competition; concentration alone does not establish that','A cartel is simply any market with fewer than ten firms','A cartel exists whenever HHI is high','A cartel means one firm owns the entire market'],
    'A cartel requires coordination among firms to restrict competition; concentration alone does not establish that',
    'Market structure and collusive conduct are different concepts; a concentrated market need not be a cartel.')

# ---------------------------------------------------------------------------
# 4) Dynamic Strategy: Repeated Games, Credibility & Entry Deterrence
# deficits: +2 Easy, +2 Bridge = 4. NO advanced PV/backward-induction additions.
# ---------------------------------------------------------------------------
s='oligopoly-dynamic-strategy'
add('easy',s,'OLI.4','repeated_games',
    'Why can the expectation of future competition sometimes make cooperation easier to sustain?',
    ['A firm that cheats today may lose future cooperative gains','Future interaction makes current payoffs irrelevant','Repeated games eliminate every incentive to cheat','Firms become price takers when they meet repeatedly'],
    'A firm that cheats today may lose future cooperative gains',
    'When future interaction matters, the short-run gain from cheating can be weighed against future losses after retaliation.')
add('easy',s,'OLI.5','credible_threat',
    'What makes a strategic threat credible?',
    ['Carrying it out would be in the threatening firm’s interest if the situation actually occurred','The threat sounds severe to the rival','The threat was announced publicly','The threat would be costly to both firms'],
    'Carrying it out would be in the threatening firm’s interest if the situation actually occurred',
    'Credibility depends on whether the threatened response would actually be rational when the time comes to act.')
add('bridge',s,'OLI.4','repeated_games',
    'A student understands a one-shot prisoner’s dilemma. What new consideration enters when the firms expect to interact again?',
    ['Today’s action can change future responses and future payoffs','The payoff matrix no longer matters at all','Every cooperative promise becomes binding','Market concentration falls with each round'],
    'Today’s action can change future responses and future payoffs',
    'Repeated interaction links current choices to future rewards or punishments, which can alter incentives.')
add('bridge',s,'OLI.5','credible_commitment',
    'A student knows that talk alone may not deter entry. What can make an incumbent’s announced response more believable?',
    ['A costly action taken in advance that changes the incumbent’s future incentives','A vague promise that entry will be punished somehow','A larger concentration ratio by itself','A public statement with no change in capacity or costs'],
    'A costly action taken in advance that changes the incumbent’s future incentives',
    'A commitment can make future behavior credible by changing what the incumbent will find profitable after entry.')

# ---------------------------------------------------------------------------
# 5) Tacit Coordination, Price Leadership & Nonprice Competition
# deficits: +5 Hard, +1 Repair, +1 Bridge = 7
# ---------------------------------------------------------------------------
s='oligopoly-rivalry-coordination'
add('hard',s,'OLI.4','tacit_coordination',
    'Several airlines raise fares within hours of the same publicly observed jet-fuel cost increase. Which conclusion is strongest?',
    ['Parallel pricing alone does not establish collusion because a common cost shock can produce similar independent responses','The matching fare increases prove an illegal agreement','The airlines must be following a dominant strategy in a payoff matrix','The market cannot be oligopolistic because prices moved together'],
    'Parallel pricing alone does not establish collusion because a common cost shock can produce similar independent responses',
    'Similar prices can arise from common incentives or observation of rivals; parallel behavior by itself is not proof of an agreement.')
add('hard',s,'OLI.4','price_leadership',
    'A dominant firm posts a new price, and several rivals independently match it without an explicit agreement. What best describes the pattern?',
    ['Price leadership that may coordinate expectations without proving explicit collusion','A prisoner’s dilemma requiring both firms to cut price','Perfect competition because all firms charge the same price','A cartel by definition'],
    'Price leadership that may coordinate expectations without proving explicit collusion',
    'Following a recognized price leader can coordinate market behavior, but observation alone does not prove an explicit agreement.')
add('hard',s,'OLI.5','nonprice_competition',
    'Two oligopoly firms avoid matching price cuts and instead compete through warranties, loyalty programs, and product quality. Why might this strategy be attractive?',
    ['It can attract customers without immediately triggering a market-wide price war','It guarantees marginal cost will fall','It makes rival reactions irrelevant','It converts the market into perfect competition'],
    'It can attract customers without immediately triggering a market-wide price war',
    'Nonprice competition can shift demand or strengthen loyalty while avoiding direct price retaliation.')
add('hard',s,'OLI.5','kinked_demand',
    'In the kinked-demand model, a modest marginal-cost change occurs entirely within the discontinuity in marginal revenue. What does the model predict?',
    ['The profit-maximizing price can remain unchanged','Price must immediately fall by the same amount as marginal cost','The firm becomes a price taker','The demand curve becomes perfectly elastic'],
    'The profit-maximizing price can remain unchanged',
    'The MR discontinuity is used to explain why a range of marginal-cost changes may leave the chosen price unchanged.')
add('hard',s,'OLI.4','price_war',
    'One firm mistakes a temporary rival discount for a permanent price cut and responds aggressively. Rivals retaliate, producing several rounds of lower prices. What does this illustrate?',
    ['Strategic reactions can amplify an initial move into a price war','Price wars require a formal cartel agreement','The firms have stopped being strategically interdependent','A price war necessarily raises joint industry profit'],
    'Strategic reactions can amplify an initial move into a price war',
    'In oligopoly, reactions and counterreactions can turn even a misread signal into sustained price rivalry.')
add('repair',s,'OLI.4','tacit_coordination',
    'A student says tacit coordination and explicit collusion are identical. What is the key distinction?',
    ['Tacit coordination can emerge without an explicit agreement among firms','Tacit coordination always requires a written contract','Explicit collusion means firms ignore rivals','Only tacit coordination can affect price'],
    'Tacit coordination can emerge without an explicit agreement among firms',
    'Tacit coordination refers to aligned behavior without the explicit agreement that defines collusion.')
add('bridge',s,'OLI.5','nonprice_competition',
    'A student has learned that oligopoly firms react strategically to price changes. What is the next step when firms compete through quality or advertising instead?',
    ['Apply the same strategic logic to nonprice actions because rivals may respond there too','Assume nonprice choices have no effect on demand','Treat advertising as proof of collusion','Ignore rivals because only prices create interdependence'],
    'Apply the same strategic logic to nonprice actions because rivals may respond there too',
    'Strategic interdependence applies to quality, advertising, service, and other competitive dimensions as well as price.')

# ---------------------------------------------------------------------------
# 6) Oligopoly Welfare, Mergers & Antitrust Tradeoffs
# deficits: +7 Easy, +5 Medium, +6 Hard, +5 Repair = 23
# ---------------------------------------------------------------------------
s='oligopoly-welfare-policy'
add('easy',s,'OLI.6','cartel_welfare',
    'Compared with a competitive outcome, an effective cartel usually chooses:',
    ['Lower output and a higher price','Higher output and a lower price','The same output with zero profit','Price equal to minimum average total cost'],
    'Lower output and a higher price',
    'A cartel acts like a joint monopolist, restricting output to raise price and combined profit.')
add('easy',s,'OLI.6','concentration_limitations',
    'Why is a high HHI not enough by itself to prove consumers are being harmed?',
    ['Concentration measures structure, while welfare also depends on conduct, entry conditions, efficiencies, and rivalry','HHI directly measures consumer surplus','A high HHI guarantees prices equal marginal cost','HHI is unrelated to market shares'],
    'Concentration measures structure, while welfare also depends on conduct, entry conditions, efficiencies, and rivalry',
    'Concentration is evidence about market structure, not a complete welfare verdict.')
add('easy',s,'OLI.6','merger_concentration',
    'If two firms merge and all other market shares remain unchanged, what happens to market concentration?',
    ['It generally increases because two separate shares become one larger share','It must fall because there is one fewer firm','It cannot change unless market demand shifts','It becomes zero if the merged firm cuts price'],
    'It generally increases because two separate shares become one larger share',
    'Combining shares raises concentration measures such as HHI, all else equal.')
add('easy',s,'OLI.6','innovation_tradeoff',
    'A concentrated industry charges high markups but also spends heavily on research. What is the soundest conclusion?',
    ['There may be a tradeoff between market-power costs and innovation benefits that requires evidence','High research spending proves the market is efficient','High markups prove innovation has no value','Concentration always increases total surplus'],
    'There may be a tradeoff between market-power costs and innovation benefits that requires evidence',
    'Oligopoly welfare can involve competing effects rather than a one-variable verdict.')
add('easy',s,'OLI.6','antitrust_rationale',
    'What is the basic economic concern behind antitrust scrutiny of collusion?',
    ['Coordinated restriction of competition can raise price and reduce output below competitive levels','Collusion makes every firm a price taker','Collusion necessarily creates free entry','Collusion guarantees maximum consumer surplus'],
    'Coordinated restriction of competition can raise price and reduce output below competitive levels',
    'The core welfare concern is reduced rivalry that raises prices, restricts output, and can create deadweight loss.')
add('easy',s,'OLI.6','model_limitations',
    'Why should an economist be cautious about predicting one outcome for every oligopoly market?',
    ['Different numbers of firms, products, information, costs, and strategic settings can produce different behavior','Every oligopoly has the same payoff matrix','Oligopoly theory assumes firms never respond to rivals','Market concentration fully determines every price'],
    'Different numbers of firms, products, information, costs, and strategic settings can produce different behavior',
    'Oligopoly is a strategic family of models, not a guarantee that every few-firm market behaves identically.')
add('easy',s,'OLI.6','integrated_oligopoly_analysis',
    'Which statement best summarizes why oligopoly welfare analysis can be complicated?',
    ['Few firms may create market power, but rivalry, innovation, efficiencies, and entry conditions also matter','Any market with four firms is automatically inefficient','Only the number of firms matters for welfare','Oligopoly always produces the monopoly outcome'],
    'Few firms may create market power, but rivalry, innovation, efficiencies, and entry conditions also matter',
    'A sound evaluation combines structure, strategic conduct, efficiency claims, and market responses.')
add('medium',s,'OLI.6','merger_concentration',
    'Two firms with market shares of 18% and 12% merge. Holding all other shares fixed, why does HHI rise?',
    ['The squared share of the combined 30% firm exceeds the sum of the two firms’ separate squared shares','HHI counts the merged firm twice','Every merger doubles total market sales','The merger automatically removes all smaller rivals'],
    'The squared share of the combined 30% firm exceeds the sum of the two firms’ separate squared shares',
    'Because shares are squared, combining two positive shares increases HHI by the cross term 2ab.')
add('medium',s,'OLI.6','antitrust_rationale',
    'A proposed merger would eliminate the closest competitor but also reduce marginal cost substantially. What is the best economic approach?',
    ['Compare the likely loss of rivalry with the magnitude and pass-through of verifiable efficiencies','Approve the merger automatically because costs fall','Block the merger automatically because concentration rises','Ignore cost effects because only the number of firms matters'],
    'Compare the likely loss of rivalry with the magnitude and pass-through of verifiable efficiencies',
    'Merger analysis requires weighing competitive harm against genuine efficiencies rather than using one fact mechanically.')
add('medium',s,'OLI.6','cartel_welfare',
    'When a cartel raises price, some lost consumer surplus becomes additional producer surplus. What happens to the remaining loss associated with trades that no longer occur?',
    ['It becomes deadweight loss','It becomes tax revenue','It becomes an HHI increase','It is automatically recovered through innovation'],
    'It becomes deadweight loss',
    'Foregone mutually beneficial trades destroy total surplus rather than transfer it to another market participant.')
add('medium',s,'OLI.6','concentration_limitations',
    'A domestic industry has a high concentration ratio, but buyers can readily switch to imported substitutes when domestic prices rise. What does this imply?',
    ['Domestic concentration alone may overstate the firms’ effective market power','Imports are irrelevant to market definition','The market must be a monopoly','High concentration guarantees collusion'],
    'Domestic concentration alone may overstate the firms’ effective market power',
    'Competitive constraints from close substitutes, including imports when relevant, matter to the economic market definition.')
add('medium',s,'OLI.6','innovation_tradeoff',
    'A merger creates a larger research budget but also reduces head-to-head price competition. Which statement is most defensible?',
    ['Both innovation benefits and reduced-rivalry costs should be evaluated rather than assuming one dominates','A larger research budget proves consumer welfare will rise','Reduced rivalry is irrelevant whenever innovation is possible','The merger must lower HHI because research increases'],
    'Both innovation benefits and reduced-rivalry costs should be evaluated rather than assuming one dominates',
    'The welfare question is empirical: innovation gains can matter, but so can weaker price and quality competition.')
add('hard',s,'OLI.6','merger_concentration',
    'A merger sharply raises HHI, but entry is easy and several well-funded firms can expand quickly if price rises. What is the strongest economic inference?',
    ['The concentration increase is relevant, but ease of entry and expansion can limit post-merger market power','The HHI increase proves prices will rise','Easy entry is irrelevant once concentration increases','The merger must increase deadweight loss by exactly the HHI change'],
    'The concentration increase is relevant, but ease of entry and expansion can limit post-merger market power',
    'Concentration is one piece of evidence; credible entry and expansion can constrain the merged firm.')
add('hard',s,'OLI.6','antitrust_rationale',
    'Four firms independently raise price after the same large increase in a key input cost. What additional evidence would be needed before inferring collusion?',
    ['Evidence that the firms coordinated rather than merely responding to the common cost shock','A high market price by itself','Proof that the firms earn positive accounting profit','A calculation showing consumer demand slopes downward'],
    'Evidence that the firms coordinated rather than merely responding to the common cost shock',
    'Parallel pricing can have competitive explanations; an inference of collusion needs evidence that distinguishes coordination from common incentives.')
add('hard',s,'OLI.6','cartel_welfare',
    'A cartel restriction transfers $9 million of surplus from consumers to producers and destroys another $3 million of mutually beneficial trade. What is the deadweight loss?',
    ['$3 million','$9 million','$12 million','$6 million'],
    '$3 million','Transfers change who receives surplus; only the destroyed gains from trade are deadweight loss.')
add('hard',s,'OLI.6','innovation_tradeoff',
    'A platform market is highly concentrated because network effects make a large user base valuable, but users can easily use multiple platforms at once. What is the most careful conclusion?',
    ['Network effects can support concentration, while easy multi-homing may still preserve meaningful competitive pressure','High concentration proves the platform has unconstrained monopoly power','Multi-homing makes network effects disappear','The market must be perfectly competitive because users can switch'],
    'Network effects can support concentration, while easy multi-homing may still preserve meaningful competitive pressure',
    'The same structural fact can have different welfare implications depending on switching, multi-homing, and rival expansion.')
add('hard',s,'OLI.6','model_limitations',
    'Two industries have identical CR4 and HHI values. One has standardized products and transparent prices; the other has differentiated products and rapid innovation. Why might their competitive outcomes differ?',
    ['Concentration measures do not capture every strategic and product-market feature that shapes rivalry','Equal concentration measures guarantee equal prices and profits','Differentiation is irrelevant in oligopoly','Only the number of firms can affect oligopoly behavior'],
    'Concentration measures do not capture every strategic and product-market feature that shapes rivalry',
    'Concentration is informative but does not summarize product differentiation, innovation, information, costs, or strategic conduct.')
add('hard',s,'OLI.6','integrated_oligopoly_analysis',
    'A concentrated industry has high prices, strong product innovation, and frequent entry by niche rivals. Which analysis is strongest?',
    ['Evaluate market power, innovation benefits, entry conditions, and consumer substitution together','Conclude the industry is harmful solely because prices are high','Conclude the industry is efficient solely because innovation is high','Ignore entry because the incumbent firms are large'],
    'Evaluate market power, innovation benefits, entry conditions, and consumer substitution together',
    'Oligopoly welfare requires integrating several margins rather than treating one statistic as decisive.')
add('repair',s,'OLI.6','concentration_limitations',
    'A student says “high concentration proves firms are colluding.” What is the correction?',
    ['High concentration can make strategic interaction important, but it does not by itself prove an agreement or harmful conduct','High concentration means every firm charges marginal cost','Collusion is impossible in concentrated markets','Concentration measures directly record secret agreements'],
    'High concentration can make strategic interaction important, but it does not by itself prove an agreement or harmful conduct',
    'Structure can affect incentives, but conduct and welfare conclusions require additional evidence.')
add('repair',s,'OLI.6','cartel_welfare',
    'A student treats every dollar of consumer-surplus loss from a cartel as deadweight loss. What should the student separate?',
    ['Surplus transferred to producers from surplus destroyed by trades that no longer occur','Price changes from quantity changes','HHI from the concentration ratio','Accounting profit from total revenue'],
    'Surplus transferred to producers from surplus destroyed by trades that no longer occur',
    'A cartel can redistribute surplus and destroy surplus; only the destroyed gains from trade are deadweight loss.')
add('repair',s,'OLI.6','merger_concentration',
    'A student says a higher post-merger HHI proves the merger harms consumers. What is the better statement?',
    ['A higher HHI shows greater concentration, but consumer effects also depend on rivalry, entry, efficiencies, and pass-through','HHI directly measures the change in consumer surplus','Any HHI increase means the merged firm becomes a monopolist','HHI is unrelated to merger analysis'],
    'A higher HHI shows greater concentration, but consumer effects also depend on rivalry, entry, efficiencies, and pass-through',
    'Concentration is an input to analysis, not a complete welfare conclusion.')
add('repair',s,'OLI.6','innovation_tradeoff',
    'A student argues that high research spending proves a concentrated market is socially optimal. What is missing?',
    ['Innovation benefits must be weighed against possible higher prices, weaker rivalry, and other welfare effects','Research spending always lowers HHI','Innovation matters only in perfect competition','High research spending eliminates market power'],
    'Innovation benefits must be weighed against possible higher prices, weaker rivalry, and other welfare effects',
    'Innovation can be beneficial without settling the overall welfare comparison.')
add('repair',s,'OLI.6','antitrust_rationale',
    'A student sees several firms charge the same price and immediately labels the behavior collusion. What is the key correction?',
    ['Similar prices can arise independently from common costs or market conditions, so evidence of coordination is still needed','Identical prices are impossible without a cartel','Price equality proves the firms have equal market shares','Collusion can occur only when prices differ'],
    'Similar prices can arise independently from common costs or market conditions, so evidence of coordination is still needed',
    'Parallel conduct is not automatically evidence of an agreement because firms can respond similarly to the same public conditions.')

# Targeted option-length balancing. These replacements keep distractors natural
# while preventing answer length from becoming a cheap cue.
length_balanced_distractors={
 'PM8-OLI-E-001':(1,'Because oligopoly firms are required to match every rival price change in order to remain in the market'),
 'PM8-OLI-E-003':(3,'Each of the four largest firms individually controls 82% of total market sales'),
 'PM8-OLI-M-004':(3,'They ignore geographic differences and therefore always produce the same concentration result nationwide'),
 'PM8-OLI-M-005':(1,'Both markets must have the same HHI because an equal CR4 guarantees identical concentration among the leading firms'),
 'PM8-OLI-M-007':(1,'The merged firm must now be a monopolist because any increase in HHI implies complete control of the market'),
 'PM8-OLI-R-008':(2,'The four-firm ratio multiplies the market shares of the four largest firms and then converts the product to a percentage'),
 'PM8-OLI-R-009':(1,'Oligopoly always has exactly two firms, so any market with three or more important firms belongs to another structure'),
 'PM8-OLI-BR-010':(0,'Assume four dominant firms automatically mean monopolistic competition because any market with multiple sellers and differentiated products fits that model'),
 'PM8-OLI-BR-011':(1,"Multiply each firm's market share by the market price and add the resulting dollar values across firms"),
 'PM8-OLI-E-012':(2,'The maximum number of firms that regulators permit to enter the market under the industry’s legal rules'),
 'PM8-OLI-E-015':(3,'The two players necessarily choose the outcome that maximizes their combined payoff even if one could gain by deviating alone'),
 'PM8-OLI-M-017':(1,'Advertising must maximize the two firms’ combined profit whenever it is more profitable for Firm A than not advertising'),
 'PM8-OLI-M-021':(1,'Compare Column’s second-number payoffs across every column, regardless of which action Column has already chosen'),
 'PM8-OLI-M-022':(0,'Firms are required to choose the outcome with the lowest combined payoff whenever their interests conflict'),
 'PM8-OLI-BR-023':(0,'Whether the market’s concentration measure is high enough to imply that strategic behavior must be present'),
 'PM8-OLI-BR-027':(3,'Whether the two payoffs are both positive and add to more than the payoffs in every neighboring cell'),
 'PM8-OLI-BR-028':(2,'The firms necessarily choose identical actions because noncooperative behavior rules out different strategies'),
 'PM8-OLI-E-029':(3,'A regulator that sets the market price equal to marginal cost and assigns output to each participating firm'),
 'PM8-OLI-E-030':(2,'Joint profit is always lower under collusion than under competition because restricting output reduces total sales'),
 'PM8-OLI-E-031':(3,'It guarantees that barriers to entry disappear once all cartel members can observe one another’s sales'),
 'PM8-OLI-E-032':(2,'The firms are maximizing total industry profit because the individually attractive price cut also maximizes their joint payoff'),
 'PM8-OLI-M-033':(3,'Output allocation cannot affect cartel profit once total output is fixed, even when members have different marginal costs'),
 'PM8-OLI-M-034':(0,'Proof that the cartel has eliminated all competition because no member can gain market share without openly cutting the posted price'),
 'PM8-OLI-M-035':(1,'A credible punishment system that quickly detects and penalizes members who secretly exceed their agreed output'),
 'PM8-OLI-M-036':(0,'Create a perfectly elastic industry demand curve so the cartel can sell any quantity at the higher price'),
}
for rec in qs:
    if rec['id'] in length_balanced_distractors:
        oi,text=length_balanced_distractors[rec['id']]
        assert ahash(rec['options'][oi]) != rec['aHash']
        rec['options'][oi]=text
    rec['sourceHash']=shash({k:v for k,v in rec.items() if k not in ('sourceHash','sourceOccurrences')})
    rec['sourceOccurrences'][0]['sourceHash']=rec['sourceHash']

assert len(qs)==75, len(qs)
# exact audited mix
from collections import Counter
pc=Counter(q['sourcePool'] for q in qs)
assert pc==Counter({'easy':20,'medium':21,'hard':13,'repair':10,'bridge':11}), pc
# Note: 20+21+13=54 ordinary; 10+11=21 adaptive support.
obj={'schemaVersion':'1.0.0','phase':PHASE,'description':'Targeted Oligopoly adaptive-depth and adaptive-support backfill after six-way granularity audit. No new advanced repeated-game PV calculations, backward-induction trees, Elite, Legendary, checkpoint, calculation, or graph items.','questionCount':len(qs),'poolCounts':dict(pc),'questions':qs}
OUT.write_text(json.dumps(obj,indent=2,ensure_ascii=False)+'\n',encoding='utf-8')
print(json.dumps({'output':str(OUT),'count':len(qs),'poolCounts':dict(pc)},indent=2))
