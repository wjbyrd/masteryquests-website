import { CONTEXTS, authoredRow as row, finalizeQuestions } from "./remaining_micro_question_pool_helpers.mjs";

export const PHASE="phase-remaining-principles-micro-question-pools-v1";
export const SOURCE_VERSION="InformationBehavioralPoliticalEconomy-2026.08.26-production-v1";
export const ID_FIRST=42880;
export const ID_LAST=43059;
export const CONCEPT_ID="information-asymmetry-behavioral-and-political-economy";

export const OBJECTIVES=Object.freeze({
  "IBP.1":"Information Asymmetry Fundamentals", "IBP.2":"Adverse Selection", "IBP.3":"Moral Hazard",
  "IBP.4":"Signaling and Screening", "IBP.5":"Behavioral Economics Fundamentals", "IBP.6":"Behavioral Biases and Applications",
  "IBP.7":"Arrow's Impossibility Theorem", "IBP.8":"Condorcet Cycles", "IBP.9":"Median Voter Theorem"
});
export const SUBTOPICS=Object.freeze({ asymmetry:"information-asymmetry-fundamentals",adverse:"adverse-selection",hazard:"moral-hazard",responses:"signaling-and-screening",behavior:"behavioral-economics-fundamentals",biases:"behavioral-biases-and-applications",arrow:"arrow-impossibility-theorem",condorcet:"condorcet-cycles",median:"median-voter-theorem" });
export const GRAPH_ASSETS=Object.freeze({});
const TARGETS={"IBP.1":18,"IBP.2":24,"IBP.3":24,"IBP.4":24,"IBP.5":26,"IBP.6":24,"IBP.7":14,"IBP.8":12,"IBP.9":14};
const tags={"IBP.1":SUBTOPICS.asymmetry,"IBP.2":SUBTOPICS.adverse,"IBP.3":SUBTOPICS.hazard,"IBP.4":SUBTOPICS.responses,"IBP.5":SUBTOPICS.behavior,"IBP.6":SUBTOPICS.biases,"IBP.7":SUBTOPICS.arrow,"IBP.8":SUBTOPICS.condorcet,"IBP.9":SUBTOPICS.median};
const skills={"IBP.1":"identify_information_asymmetry","IBP.2":"analyze_adverse_selection","IBP.3":"analyze_moral_hazard","IBP.4":"distinguish_signaling_screening","IBP.5":"apply_behavioral_economics","IBP.6":"diagnose_behavioral_bias","IBP.7":"apply_arrow_impossibility","IBP.8":"identify_condorcet_cycle","IBP.9":"apply_median_voter_theorem"};

function caseFor(objective,i){
  const context=CONTEXTS[(i+Number(objective.split(".")[1])*7)%CONTEXTS.length],v=i%4;
  const opener=[`In ${context},`,`${context} presents a case where`,`While evaluating ${context},`,`${context} yields evidence that`][v];
  if(objective==="IBP.1"){
    const cases=[
      [`${opener} sellers know product quality but buyers cannot verify it before purchase. What market friction is present?`,"Information asymmetry",["A public good","Perfect information","A binding price floor"],"One side possesses payoff-relevant quality information that the other side lacks before contracting."],
      [`${opener} a borrower knows more about the riskiness of a project than the lender. Why can exchange be inefficient?`,"The lender may price or ration credit without observing individual risk",["Scarcity disappears","The borrower has no private information","Every risky loan must fail"],"Hidden risk prevents contract terms from perfectly matching each borrower's expected cost."],
      [`${opener} both sides can cheaply verify quality and actions. What happens to the information-asymmetry problem?`,"It is substantially reduced",["It becomes a common-resource problem","It necessarily creates monopoly","It turns into sunk cost"],"Reliable shared information narrows the knowledge gap that drives mispricing and mistrust."],
      [`${opener} a platform publishes independently verified quality histories. What is the likely mechanism?`,"Better information can support mutually beneficial trades",["It guarantees every seller is high quality","It removes all uncertainty from life","It makes prices irrelevant"],"Verification helps buyers condition choices on quality, reducing the loss of good trades caused by hidden information."]
    ]; return cases[v];
  }
  if(objective==="IBP.2"){
    const cases=[
      [`${opener} people expecting high medical costs are especially likely to buy generous insurance before coverage begins. What problem appears?`,"Adverse selection",["Moral hazard after coverage","A Condorcet cycle","Present bias"],"Private risk type affects who enters the insurance pool before the contract, changing the pool's average cost."],
      [`${opener} buyers cannot distinguish reliable used products from defective ones, so they offer only an average price. What can follow?`,"High-quality sellers may exit, lowering average quality",["Only low-quality sellers exit","All quality becomes observable","The market automatically reaches perfect efficiency"],"A pooled price can undervalue good products, causing selection that further worsens the pool."],
      [`${opener} an insurer must charge one premium despite applicants having different privately known risks. Why might the premium spiral upward?`,"Low-risk customers leave as the pool becomes disproportionately high risk",["Coverage makes current customers less careful","The insurer creates a public good","Higher premiums reveal every person's risk"],"Selection occurs through enrollment: a worsening risk pool raises costs and can drive out additional low-risk customers."],
      [`${opener} a warranty is purchased disproportionately by customers who privately know their devices are fragile. Which timing identifies the issue?`,"Hidden type affects contracting before covered behavior occurs",["Observed action changes after purchase","A seller sends a costly signal","Voters rank three policies cyclically"],"Adverse selection is hidden information about type at the contracting stage, distinct from hidden action after contracting."]
    ]; return cases[v];
  }
  if(objective==="IBP.3"){
    const cases=[
      [`${opener} insured drivers become less careful after receiving broad coverage. What problem is illustrated?`,"Moral hazard",["Adverse selection","The median voter result","Loss aversion"],"Coverage changes incentives for an action that is difficult for the insurer to observe after contracting."],
      [`${opener} a bank expects a guaranteed bailout and therefore chooses a riskier portfolio. What causes the distortion?`,"Protection shifts part of the downside to others",["The bank's hidden type before borrowing","Perfect screening","A lower opportunity cost of voting"],"When decision makers do not bear the full marginal loss, post-protection risk taking can rise."],
      [`${opener} a deductible makes the customer pay the first part of a covered loss. Why can it reduce moral hazard?`,"It restores some marginal cost of risky behavior to the customer",["It reveals every customer's innate risk type","It guarantees no accident occurs","It converts insurance into a public good"],"Cost sharing leaves the insured with some financial consequence from loss, improving incentives at the margin."],
      [`${opener} behavior is perfectly monitored and a contract can condition payment on every action. What happens to hidden-action moral hazard?`,"It can be greatly reduced through enforceable incentives",["It becomes adverse selection automatically","It must increase","It makes insurance unnecessary in every case"],"Observable, contractible action allows terms to reward care or penalize risk, though monitoring itself may be costly." ]
    ]; return cases[v];
  }
  if(objective==="IBP.4"){
    const cases=[
      [`${opener} a high-quality seller voluntarily buys a credible third-party warranty. Is this signaling or screening?`,"Signaling by the informed seller",["Screening by the buyer","Moral hazard","A default nudge"],"The informed side takes an observable action intended to communicate private quality."],
      [`${opener} an insurer offers a high-deductible and a low-deductible plan so customers reveal risk through their choice. What mechanism is this?`,"Screening by the less-informed insurer",["Signaling by applicants only","A Condorcet vote","Anchoring"],"The uninformed side designs a menu that induces different hidden types to self-select."],
      [`${opener} a credential is more costly for low-productivity workers than for high-productivity workers. Why can it be informative?`,"The differential cost can make the signal separating and credible",["Any costless claim is automatically credible","It directly raises every worker's productivity by definition","It eliminates employer uncertainty without inference"],"A credible signal must be sufficiently harder for the type that would like to imitate it."],
      [`${opener} a lender requires collateral before approving a loan. What informational role can collateral play?`,"It screens or separates borrowers by willingness and ability to bear default consequences",["It insures the borrower against every loss","It creates moral hazard intentionally","It proves all borrowers have identical risk"],"Contract terms can elicit private information when different risk types choose differently or face different costs." ]
    ]; return cases[v];
  }
  if(objective==="IBP.5"){
    const cases=[
      [`${opener} observed choices systematically depart from the fully rational benchmark. What is the behavioral-economics approach?`,"Model predictable psychological and cognitive influences on decisions",["Assume preferences never matter","Replace evidence with moral judgment","Treat every mistake as random noise"],"Behavioral economics modifies standard choice models using testable patterns in attention, beliefs, self-control, and social preferences."],
      [`${opener} a default enrollment rule sharply changes participation even though opting out is easy. What does this challenge?`,"The claim that only final prices and outcomes matter, not choice architecture",["The existence of scarcity","The law of demand in every setting","The possibility of opportunity cost"],"Default effects show that framing and the path of choice can influence behavior even when options remain available."],
      [`${opener} a nudge changes the presentation of options without banning alternatives or materially changing prices. How should it be classified?`,"A choice-architecture intervention",["A binding quantity control","A compulsory transfer","A proof of irrationality for every person"],"Nudges preserve formal options while using predictable decision patterns to influence selection."],
      [`${opener} a behavior appears in one small sample. What is the strongest scientific response?`,"Seek replication and compare predictive performance against alternative models",["Declare universal bias immediately","Reject all rational-choice models","Treat the result as a normative policy mandate"],"Behavioral claims should be evaluated empirically for robustness, magnitude, context, and out-of-sample prediction." ]
    ]; return cases[v];
  }
  if(objective==="IBP.6"){
    const cases=[
      [`${opener} a shopper values the same mug more after being given ownership of it. Which bias fits?`,"Endowment effect",["Availability heuristic","Adverse selection","Median voter convergence"],"Ownership changes stated valuation even though the object's attributes are unchanged."],
      [`${opener} a person weighs a $100 loss more heavily than an equal-sized $100 gain. Which pattern fits?`,"Loss aversion",["Perfectly linear utility","Screening","Condorcet consistency"],"Loss aversion assigns greater psychological weight to losses relative to a reference point than to equal gains."],
      [`${opener} a household repeatedly plans to save next month but favors current spending when next month arrives. Which pattern fits?`,"Present bias and time inconsistency",["Adverse selection","The sunk-cost fallacy only","Perfect commitment"],"The decision maker places disproportionate weight on immediate rewards, causing plans to reverse as the present changes."],
      [`${opener} a dramatic recent news story leads residents to overestimate a rare risk. Which heuristic fits?`,"Availability heuristic",["Equimarginal utility","Moral hazard","Arrow's theorem"],"Events that are vivid or easy to recall can receive too much weight relative to their statistical frequency." ]
    ]; return cases[v];
  }
  if(objective==="IBP.7"){
    const cases=[
      [`${opener} a voting rule must convert rankings over at least three alternatives into a social ranking while satisfying unrestricted domain, Pareto efficiency, independence of irrelevant alternatives, and nondictatorship. What does Arrow's theorem imply?`,"No rank-order rule can satisfy all of those conditions for every possible preference profile",["Majority rule always satisfies them","A dictator is required by moral law","Voting is impossible with two alternatives"],"Arrow establishes an incompatibility among attractive aggregation conditions, not that collective decisions can never be made."],
      [`${opener} adding an irrelevant losing option reverses society's ranking of two unchanged alternatives. Which Arrow condition is implicated?`,"Independence of irrelevant alternatives",["Pareto unanimity","Nondictatorship","Single-peakedness"],"The social comparison between two options should depend only on individual rankings of those two under IIA."],
      [`${opener} every voter ranks A above B but the social rule ranks B above A. Which condition fails?`,"Pareto efficiency or unanimity",["Independence of irrelevant alternatives only","Transitivity of each voter's preferences","The median voter assumption"],"A Pareto-respecting aggregation rule ranks A above B when everyone does."],
      [`${opener} a student says Arrow proves democracy is useless. What is the best correction?`,"The theorem identifies a tradeoff among axioms; real institutions choose which conditions to relax",["The theorem proves dictatorship is ethically best","It applies only to market prices","It guarantees majority rankings are transitive"],"The result is a constraint on preference aggregation, not a normative conclusion that all voting institutions lack value." ]
    ]; return cases[v];
  }
  if(objective==="IBP.8"){
    const cases=[
      [`${opener} one-third ranks A>B>C, one-third B>C>A, and one-third C>A>B. What happens under pairwise majority voting?`,"A cycle can occur: A beats B, B beats C, and C beats A",["A is a Condorcet winner","Every pair ties","The median option always wins"],"Majority preference can be intransitive even when each individual ranking is transitive."],
      [`${opener} pairwise social preferences are A>B, B>C, and C>A. What is this called?`,"A Condorcet cycle",["A dominant strategy equilibrium","Adverse selection","A Lorenz ordering"],"The three pairwise victories form a loop, so no alternative defeats every other alternative."],
      [`${opener} an agenda setter chooses which pairwise vote occurs last when preferences cycle. Why can sequence matter?`,"Different agendas can produce different final winners",["Cycles guarantee the same winner","Every voter becomes indifferent","The agenda removes majority rule"],"With intransitive majority comparisons, eliminating options in different orders can change which alternative survives."],
      [`${opener} all voters have single-peaked preferences along one policy line. What is the likely effect on majority cycles?`,"The restriction helps prevent cycles and supports a stable median outcome",["It guarantees Arrow's axioms for every domain","It creates more multidimensional cycling","It makes preferences intransitive individually"],"Single-peakedness restricts the preference domain in a way that yields transitive majority choice on one dimension." ]
    ]; return cases[v];
  }
  const cases=[
    [`${opener} voters have single-peaked preferences over one tax-rate line and choose by majority rule. Which position is pivotal?`,"The median voter's ideal point",["The mean income regardless of voting","The most extreme voter's ideal point","A randomly chosen policy"],"On a one-dimensional line with single-peaked preferences, the median ideal point defeats alternatives in pairwise votes."],
    [`${opener} two office-seeking candidates care only about winning and voters choose the closer one on a single policy dimension. What tendency follows?`,"Both candidates have an incentive to move toward the median voter",["Both move toward opposite extremes","Policy location becomes irrelevant","The candidate at the mean always loses"],"Moving toward the median can capture pivotal voters without losing those on the candidate's outer side."],
    [`${opener} policy is multidimensional and voters' preferences are not single-peaked. Can median-voter convergence be assumed?`,"No; the theorem's key assumptions may fail",["Yes, it holds under every preference domain","Yes, because mean and median are identical","No, because majority voting is impossible"],"The result depends on a one-dimensional policy space, single-peaked preferences, majority rule, and strategic conditions."],
    [`${opener} the decisive voter lies at the 50th percentile of ordered ideal points. Why is this voter called median?`,"Half the ideal points lie on each side",["The voter has average income","The voter is indifferent among all policies","The voter dictates outcomes without elections"],"Median refers to position in the ordered distribution of ideal points, not necessarily average demographics or income." ]
  ]; return cases[v];
}

const rows=[];
for(const [objective,target] of Object.entries(TARGETS)){
  for(let i=0;i<target;i+=1){ const [q,a,d,f]=caseFor(objective,i); rows.push(row(q,a,d,objective,i%5===0?"interpretation":i%3===0?"integration":"application",skills[objective],f,tags[objective])); }
}
export const productionQuestions=finalizeQuestions(rows,{idFirst:ID_FIRST,idLast:ID_LAST,conceptId:CONCEPT_ID,objectives:OBJECTIVES,objectiveCounts:TARGETS,difficultyQuotas:{easy:44,medium:68,hard:40,elite:14,legendary:14},phase:PHASE,graphAssets:GRAPH_ASSETS});
if(productionQuestions.some(question=>question.graphRequired)) throw new Error("This family must not claim unrelated graph assets.");
