export const PHASE = "phase-externalities-question-pool-v1";
export const SOURCE_VERSION = "Externalities-2026.08.26-copy-taxonomy-repair-v2";
export const ID_FIRST = 42000;
export const ID_LAST = 42159;
export const PARENT_CONCEPT_ID = "market-failures";
export const CONCEPT_ID = "externalities";

export const TAXONOMY_CONCEPTS = Object.freeze({
  externalities: {
    title: "Externalities",
    description: "Analyze positive and negative externalities, social and private margins, corrective policies, private solutions, and Coase bargaining."
  },
  "public-goods-and-common-resources": {
    title: "Public Goods and Common Resources",
    description: "Distinguish public goods from common resources and analyze free riding, nonrivalry, nonexcludability, congestion, and shared-resource depletion."
  },
  "market-power": {
    title: "Market Power",
    description: "Identify price-setting ability, barriers to entry, restricted output, allocative inefficiency, and deadweight loss from market power."
  }
});

export const LEGACY_SUBTOPIC_ASSIGNMENTS = Object.freeze({
  externalities: Object.freeze([
    "ECON-MG-EASY-12", "P77-MFAIL-E-003", "ECON-MG-MEDIUM-106", "P52B-MFAIL-M-001",
    "P77-MFAIL-M-006", "P52B-MFAIL-H-001", "ECON-MG-ELITE-337", "ECON-MG-ELITE-338",
    "P77-MFAIL-EL-014", "P52B-MFAIL-L-001", "P77-MFAIL-L-019", "P77-MFAIL-L-022",
    "ECON-MG-EASYBOSS-2016", "P52B-MFAIL-B2-001", "P52B-MFAIL-R-001",
    "P77-MFAIL-R-035", "P77-MFAIL-BR-038"
  ]),
  "public-goods-and-common-resources": Object.freeze([
    "ECON-MG-EASY-13", "P77-MFAIL-E-004", "P52B-MFAIL-M-002", "P77-MFAIL-M-007",
    "P52B-MFAIL-H-002", "P77-MFAIL-H-012", "P52B-MFAIL-L-002", "P77-MFAIL-L-016",
    "P77-MFAIL-L-017", "P77-MFAIL-L-023", "P52B-MFAIL-B2-002", "P77-MFAIL-LB-029",
    "P77-MFAIL-LB-031", "P52B-MFAIL-R-002", "P52B-MFAIL-BR-001", "P77-MFAIL-BR-039"
  ]),
  "market-power": Object.freeze([
    "ECON-MG-EASY-14", "P77-MFAIL-E-005", "ECON-MG-MEDIUM-107", "P77-MFAIL-M-009",
    "P52B-MFAIL-H-003", "P52B-MFAIL-L-003", "P77-MFAIL-L-020", "P52B-MFAIL-B2-003",
    "P77-MFAIL-R-036"
  ])
});

export const OBJECTIVES = {
  "EXT.1": "Positive versus Negative Externalities",
  "EXT.2": "Negative Externalities and Market Efficiency",
  "EXT.3": "Regulation of Negative Externalities",
  "EXT.4": "Corrective Taxes",
  "EXT.5": "Positive Externalities and Market Efficiency",
  "EXT.6": "Corrective Subsidies",
  "EXT.7": "Tradable Permits",
  "EXT.8": "Private Solutions",
  "EXT.9": "Coase Theorem"
};

const COMMON = {
  "EXT.1": "Misclassifying the sign or the production-versus-consumption channel of an externality.",
  "EXT.2": "Using private curves alone when social costs or benefits determine efficiency.",
  "EXT.3": "Treating every regulation as equivalent or ignoring the efficient quantity target.",
  "EXT.4": "Confusing the corrective wedge, incidence, revenue, and deadweight loss.",
  "EXT.5": "Reversing social and private curves or predicting overproduction instead of underproduction.",
  "EXT.6": "Confusing subsidy expenditure with external benefit or taxing a positive externality.",
  "EXT.7": "Assuming permit allocation changes the cap or that all firms should abate equally.",
  "EXT.8": "Assuming any voluntary response necessarily eliminates the entire externality.",
  "EXT.9": "Treating Coase bargaining as costless or as proof that initial rights never matter."
};

export const SCENARIOS = [
  {
    number: 1, subject: "fast-fashion garments", unit: "million garments",
    axis: "Quantity of fast-fashion garments (millions)", externality: "negative production externality",
    marketQ: 240, marketP: "$12", efficientQ: 160, efficientP: "$15", quantityGap: 80,
    gapDirection: "overproduction", externalAmount: "$6 per garment", policy: "a $6 corrective tax per garment",
    policyNoun: "corrective tax", buyerPrice: "$15", sellerPrice: "$9", fiscalLabel: "tax revenue",
    fiscalAmount: "$960 million", dwl: "$240 million",
    curves: "MPB slopes downward from $21 to $9, MPC slopes upward from $3 to $15, and MSC runs parallel $6 above MPC.",
    curveAnswer: "MSC is above MPC because production imposes an external cost",
    curveDistractors: ["MSC is below MPC because buyers receive an external benefit", "MPB is above MSB because production creates a benefit", "MPC is above MSC because firms pay every social cost"],
    directionAnswer: "The market overproduces by 80 million garments",
    directionDistractors: ["The market underproduces by 80 million garments", "The market is efficient because MPB intersects MPC", "The market overproduces by 160 million garments"],
    policyDirection: "Raise the private marginal cost faced by producers",
    policyDistractors: ["Lower the marginal cost faced by producers", "Shift MPB upward by the external cost", "Set output at the unregulated market quantity"]
  },
  {
    number: 2, subject: "disposable vapes", unit: "thousand vapes",
    axis: "Quantity of disposable vapes consumed (thousands)", externality: "negative consumption externality",
    marketQ: 180, marketP: "$10", efficientQ: 140, efficientP: "$8", quantityGap: 40,
    gapDirection: "overconsumption", externalAmount: "$4 per vape", policy: "a $4 corrective tax per vape",
    policyNoun: "corrective tax", buyerPrice: "$12", sellerPrice: "$8", fiscalLabel: "tax revenue",
    fiscalAmount: "$560 thousand", dwl: "$80 thousand",
    curves: "MPB slopes downward from $19 to $7, MPC slopes upward from $1 to $13, and MSB runs parallel $4 below MPB.",
    curveAnswer: "MSB is below MPB because consumption imposes an external cost",
    curveDistractors: ["MSC is above MPC because production creates the spillover", "MSB is above MPB because consumers receive a benefit", "MPC is below MSC because sellers receive a subsidy"],
    directionAnswer: "The market overconsumes by 40 thousand vapes",
    directionDistractors: ["The market underconsumes by 40 thousand vapes", "The market is efficient at 180 thousand vapes", "The market overconsumes by 140 thousand vapes"],
    policyDirection: "Reduce the private marginal benefit of consumption",
    policyDistractors: ["Increase the private marginal benefit of consumption", "Lower sellers' marginal production cost", "Preserve the market quantity of 180 thousand"]
  },
  {
    number: 3, subject: "native-plant gardens", unit: "gardens",
    axis: "Quantity of native-plant gardens", externality: "positive production externality",
    marketQ: 100, marketP: "$12", efficientQ: 150, efficientP: "$10", quantityGap: 50,
    gapDirection: "underproduction", externalAmount: "$5 per garden", policy: "a $5 producer subsidy per garden",
    policyNoun: "producer subsidy", buyerPrice: "$10", sellerPrice: "$15", fiscalLabel: "subsidy expenditure",
    fiscalAmount: "$750", dwl: "$125",
    curves: "MPB slopes downward from $16 to $8, MPC slopes upward from $6 to $18, and MSC runs parallel $5 below MPC.",
    curveAnswer: "MSC is below MPC because production creates an external benefit",
    curveDistractors: ["MSC is above MPC because production creates an external cost", "MSB is below MPB because buyers impose a cost", "MPC is below MSC because producers receive all social benefits"],
    directionAnswer: "The market underproduces by 50 gardens",
    directionDistractors: ["The market overproduces by 50 gardens", "The market is efficient at 100 gardens", "The market underproduces by 150 gardens"],
    policyDirection: "Lower the effective marginal cost faced by producers",
    policyDistractors: ["Raise the marginal cost faced by producers", "Shift MPB downward by the external benefit", "Limit production to the unregulated market quantity"]
  },
  {
    number: 4, subject: "public-transit rides", unit: "thousand rides per day",
    axis: "Quantity of public-transit rides (thousands per day)", externality: "positive consumption externality",
    marketQ: 150, marketP: "$5", efficientQ: 200, efficientP: "$6", quantityGap: 50,
    gapDirection: "underconsumption", externalAmount: "$2 per ride", policy: "a $2 rider subsidy per ride",
    policyNoun: "rider subsidy", buyerPrice: "$4", sellerPrice: "$6", fiscalLabel: "subsidy expenditure",
    fiscalAmount: "$400 thousand per day", dwl: "$50 thousand per day",
    curves: "MPB slopes downward from $8 to $3, MPC slopes upward from $2 to $7, and MSB runs parallel $2 above MPB.",
    curveAnswer: "MSB is above MPB because consumption creates an external benefit",
    curveDistractors: ["MSB is below MPB because riders impose an external cost", "MSC is above MPC because providers create a cost", "MPB is above MSB because riders receive every social benefit"],
    directionAnswer: "The market underconsumes by 50 thousand rides per day",
    directionDistractors: ["The market overconsumes by 50 thousand rides per day", "The market is efficient at 150 thousand rides", "The market underconsumes by 200 thousand rides"],
    policyDirection: "Increase the private marginal benefit of taking transit",
    policyDistractors: ["Reduce the private marginal benefit of taking transit", "Raise providers' marginal production cost", "Cap ridership at the unregulated market quantity"]
  }
];

export const GRAPH_ASSETS = Object.fromEntries(SCENARIOS.flatMap(s => {
  const base = `The horizontal axis is ${s.axis}; the vertical axis is marginal benefit and cost in dollars. ${s.curves}`;
  return [
    [`EXTERNALITY-A-0${s.number}.webp`, { assetClass: "A", scenario: s.number, imageAlt: `${s.subject} externality graph showing private and social marginal curves without outcome markers.`, graphDescription: `${base} No outcome dots or projection guides are shown.` }],
    [`EXTERNALITY-B-0${s.number}.webp`, { assetClass: "B", scenario: s.number, imageAlt: `${s.subject} externality graph marking market and socially efficient outcomes.`, graphDescription: `${base} Dots and projection guides mark the market outcome at ${s.marketQ} ${s.unit} and ${s.marketP}, and the socially efficient outcome at ${s.efficientQ} ${s.unit} and ${s.efficientP}.` }],
    [`EXTERNALITY-C-0${s.number}.webp`, { assetClass: "C", scenario: s.number, imageAlt: `${s.subject} externality graph showing the optimal ${s.policyNoun} wedge.`, graphDescription: `${base} A vertical policy wedge at ${s.efficientQ} ${s.unit} separates the price paid (${s.buyerPrice}) from the amount received (${s.sellerPrice}).` }]
  ];
}));

GRAPH_ASSETS["EXTERNALITY-D-02.webp"] = {
  assetClass: "D", scenario: 2,
  imageAlt: "Disposable-vape externality graph showing an imperfect $2 corrective tax and remaining overconsumption.",
  graphDescription: "The horizontal axis is disposable vapes consumed in thousands; the vertical axis is marginal benefit and cost in dollars per vape. MPC slopes upward, MPB slopes downward, and MSB is $4 below MPB. A dashed policy-adjusted MPB lies $2 below MPB and intersects MPC at 160 thousand vapes. Consumers pay $11 and sellers receive $9. The efficient outcome remains 140 thousand vapes at $8."
};

function tuple(q, answer, distractors, objective, type, difficulty, primarySkill, feedback) {
  return { q, answer, distractors, objective, type, difficulty, primarySkill, feedback };
}

function efficientIntersection(s) {
  if (s.number === 1) return "MSC intersects MPB";
  if (s.number === 2) return "MPC intersects MSB";
  if (s.number === 3) return "MSC intersects MPB";
  return "MPC intersects MSB";
}

function marketFeedback(s) {
  return `The unregulated market equilibrium occurs where MPC intersects MPB, at ${s.marketQ} ${s.unit} and ${s.marketP}.`;
}

function efficientFeedback(s) {
  return `The socially efficient outcome occurs where ${efficientIntersection(s)}, at ${s.efficientQ} ${s.unit} and ${s.efficientP}.`;
}

function quantityFeedback(s) {
  return `${marketFeedback(s)} ${efficientFeedback(s)} The difference is ${s.quantityGap} ${s.unit}, so the market has ${s.gapDirection}.`;
}

function policyFeedback(s) {
  const mechanisms = {
    1: "The tax makes producers face the $6 marginal external cost, aligning private marginal cost with MSC",
    2: "The tax makes consumers face the $4 marginal external cost, aligning their private incentive with MSB",
    3: "The producer subsidy rewards the $5 marginal external benefit, aligning the producer's effective cost with MSC",
    4: "The rider subsidy rewards the $2 marginal external benefit, aligning the rider's private incentive with MSB"
  };
  return `${mechanisms[s.number]} and moving quantity to ${s.efficientQ} ${s.unit}.`;
}

function graphA(s, difficulties, objectives) {
  const asset = `EXTERNALITY-A-0${s.number}.webp`;
  const choices = ["Negative production externality", "Negative consumption externality", "Positive production externality", "Positive consumption externality"];
  const externalValue = Number(s.externalAmount.match(/\d+/)[0]);
  const externalUnit = s.externalAmount.replace(/^\$\d+\s*/, "");
  const amountDistractors = [2, 4, 5, 6].filter(value => value !== externalValue).slice(0, 3).map(value => `$${value} ${externalUnit}`);
  return [
    tuple(`Refer to the ${s.subject} graph. Which type of externality is represented by the private and social marginal curves?`, s.externality[0].toUpperCase() + s.externality.slice(1), choices.filter(choice => choice.toLowerCase() !== s.externality), objectives[0], "graph_interpretation", difficulties[0], "externality_identification", `This is a ${s.externality}: the activity creates a ${s.number <= 2 ? "cost" : "benefit"} for people outside the market transaction, so the relevant social and private marginal curves differ.`),
    tuple(`Based on the ${s.subject} graph, what economic relationship explains the position of the social curve relative to the private curve?`, s.curveAnswer, s.curveDistractors, objectives[1], "graph_interpretation", difficulties[1], s.number <= 2 ? "externality_social_cost" : "positive_externality", `${s.curveAnswer}. The constant vertical separation is the marginal external ${s.number <= 2 ? "cost omitted from private decisions" : "benefit not captured by the private decision-maker"}.`),
    tuple(`If no corrective policy is adopted, how will the market quantity of ${s.subject} compare with the socially efficient quantity?`, s.directionAnswer, s.directionDistractors, objectives[2], "graph_interpretation", difficulties[2], s.number <= 2 ? "externality_social_cost" : "positive_externality", `${quantityFeedback(s)} Private choices omit the external ${s.number <= 2 ? "cost" : "benefit"}.`),
    tuple(`Based on the vertical distance between the private and social curves, what is the constant marginal external effect for ${s.subject}?`, s.externalAmount, amountDistractors, objectives[3], "graph_interpretation", difficulties[3], "external_marginal_cost", `The private and social curves remain ${s.externalAmount} apart, so each unit creates that amount of marginal external ${s.number <= 2 ? "cost" : "benefit"}.`),
    tuple(`Which change in incentives would move the ${s.subject} market toward its socially efficient quantity?`, s.policyDirection, s.policyDistractors, objectives[4], "graph_trap", difficulties[4], s.number <= 2 ? "corrective_tax_externality_logic" : "subsidy_price_signal", policyFeedback(s))
  ].map(question => ({ ...question, asset }));
}

function graphB(s, difficulties, objectives) {
  const asset = `EXTERNALITY-B-0${s.number}.webp`;
  const market = `${s.marketQ} ${s.unit}`;
  const efficient = `${s.efficientQ} ${s.unit}`;
  const gap = `${s.quantityGap} ${s.unit}`;
  const externalValue = Number(s.externalAmount.match(/\d+/)[0]);
  const externalUnit = s.externalAmount.replace(/^\$\d+\s*/, "");
  const amountDistractors = [2, 4, 5, 6].filter(value => value !== externalValue).slice(0, 3).map(value => `$${value} ${externalUnit}`);
  return [
    tuple(`Refer to the graph. At what quantity do MPC and MPB intersect in the unregulated market for ${s.subject}?`, market, [efficient, gap, `${s.marketQ + s.efficientQ} ${s.unit}`], objectives[0], "graph_interpretation", difficulties[0], "graph_reading", marketFeedback(s)),
    tuple(`At the unregulated MPC-MPB intersection for ${s.subject}, what market price is shown?`, s.marketP, [s.efficientP, s.buyerPrice, s.sellerPrice, "$0"].filter((value, index, all) => value !== s.marketP && all.indexOf(value) === index).slice(0, 3), objectives[1], "graph_interpretation", difficulties[1], "equilibrium_price", marketFeedback(s)),
    tuple(`Which marked quantity represents the socially efficient outcome for ${s.subject}?`, efficient, [market, gap, `${s.marketQ + s.efficientQ} ${s.unit}`], objectives[2], "graph_interpretation", difficulties[2], "externality_social_cost", efficientFeedback(s)),
    tuple(`Based on the graph, why does the unregulated ${s.subject} outcome differ from the socially efficient outcome?`, "The market uses private incentives, while efficiency uses the relevant social marginal curve", ["The efficient outcome ignores all external effects", "The market outcome already includes the full spillover", "The difference is caused only by statutory tax incidence"], objectives[3], "graph_interpretation", difficulties[3], "externality_social_cost", `${marketFeedback(s)} By contrast, ${efficientFeedback(s).replace(/^The /, "the ")} The social outcome includes the spillover that private choices omit.`),
    tuple(`By how many ${s.unit} does the unregulated ${s.subject} quantity differ from the socially efficient quantity?`, gap, [market, efficient, `${s.marketQ + s.efficientQ} ${s.unit}`], objectives[4], "graph_calculation", difficulties[4], "externality_quantity_gap", quantityFeedback(s)),
    tuple(`At the efficient quantity for ${s.subject}, what marginal external ${s.number <= 2 ? "cost" : "benefit"} is represented by the gap between the curves?`, s.externalAmount, amountDistractors, objectives[5], "graph_calculation", difficulties[5], "external_marginal_cost", `At the efficient quantity, the relevant private and social curves are ${s.externalAmount} apart. That vertical gap is the marginal external ${s.number <= 2 ? "cost" : "benefit"}.`),
    tuple(`Using the quantity distortion and marginal external effect shown for ${s.subject}, what is the original deadweight loss?`, s.dwl, [s.fiscalAmount, `$${s.quantityGap}`, `$${s.quantityGap * Number(s.externalAmount.match(/\d+/)[0])}`], objectives[6], "graph_calculation", difficulties[6], "externality_dwl_calculation", `The distortion is ${s.quantityGap} ${s.unit} and the marginal external effect is ${s.externalAmount}. The triangular loss is one-half times those values, or ${s.dwl}.`),
    tuple(`Suppose regulators replace the price instrument with a quantity limit. Based on the graph, what ${s.subject} quantity would reproduce the efficient outcome?`, efficient, [market, gap, `${s.marketQ + s.efficientQ} ${s.unit}`], objectives[7], "graph_calculation", difficulties[7], s.number <= 2 ? "regulatory_quantity_target" : "subsidy_quantity_target", `${efficientFeedback(s)} A correctly calibrated quantity rule would therefore set the target at ${efficient}.`),
    tuple(`Based on the ${s.subject} graph, which corrective-policy claim is economically accurate?`, `${s.policy} would close the marginal private-social gap`, ["Any $1 policy would necessarily restore efficiency", "The policy should move quantity farther from the social outcome", "The policy amount should equal market price rather than the spillover"], objectives[8], "graph_trap", difficulties[8], s.number <= 2 ? "corrective_tax_externality_logic" : "subsidy_price_signal", `${policyFeedback(s)} The optimal per-unit correction equals the marginal external effect, ${s.externalAmount}.`),
    tuple(`If affected parties could bargain costlessly over the ${s.subject} spillover, which quantity on the graph would be their efficient target?`, efficient, [market, gap, "Equal gains for every party regardless of rights"], objectives[9], "graph_trap", difficulties[9], "coase_efficiency", `${efficientFeedback(s)} Under the Coase assumptions, bargaining can reach that quantity, although the initial rights assignment still affects who compensates whom.`)
  ].map(question => ({ ...question, asset }));
}

function graphC(s, difficulties, objectives, types) {
  const asset = `EXTERNALITY-C-0${s.number}.webp`;
  const efficient = `${s.efficientQ} ${s.unit}`;
  const gap = `${s.quantityGap} ${s.unit}`;
  const scale = s.number === 1 ? " million" : s.number === 2 ? " thousand" : "";
  const externalValue = Number(s.externalAmount.match(/\d+/)[0]);
  const externalUnit = s.externalAmount.replace(/^\$\d+\s*/, "");
  const amountDistractors = [2, 4, 5, 6].filter(value => value !== externalValue).slice(0, 3).map(value => `$${value} ${externalUnit}`);
  const fiscalDistractors = s.fiscalLabel === "tax revenue"
    ? [s.dwl, `$${s.efficientQ * 2}${scale}`, `$${s.marketQ * Number(s.externalAmount.match(/\d+/)[0])}${scale}`]
    : [s.dwl, `$${s.marketQ * Number(s.externalAmount.match(/\d+/)[0])}`, `$${s.quantityGap * Number(s.externalAmount.match(/\d+/)[0])}`];
  return [
    tuple(`Based on the graph, by how much must the quantity of ${s.subject} change to move from the unregulated market outcome to the corrected outcome?`, gap, [`${s.marketQ} ${s.unit}`, efficient, `${s.marketQ + s.efficientQ} ${s.unit}`], objectives[0], types[0], difficulties[0], "externality_quantity_gap", quantityFeedback(s)),
    tuple(`What per-unit gap between private and social incentives must the policy internalize in the ${s.subject} market?`, s.externalAmount, amountDistractors, objectives[1], types[1], difficulties[1], "external_marginal_cost", `The relevant private and social marginal curves are ${s.externalAmount} apart. Matching that vertical gap makes the private decision reflect the marginal external ${s.number <= 2 ? "cost" : "benefit"}.`),
    tuple(`Which corrective instrument and per-unit amount shown on the graph would move ${s.subject} to the efficient quantity?`, s.policy, [`a $1 ${s.policyNoun} per unit`, `a ${s.externalAmount} policy in the opposite direction`, `a quantity target at ${s.marketQ} ${s.unit}`], objectives[2], types[2], difficulties[2], s.number <= 2 ? "corrective_tax_externality_logic" : "subsidy_price_signal", `${policyFeedback(s)} Therefore the graph's optimal instrument is ${s.policy}.`),
    tuple(`At the corrected quantity shown for ${s.subject}, how much ${s.fiscalLabel} does the per-unit policy generate?`, s.fiscalAmount, fiscalDistractors, objectives[3], types[3], difficulties[3], s.fiscalLabel === "tax revenue" ? "tax_revenue_calculation" : "subsidy_expenditure_calculation", `The corrected quantity is ${s.efficientQ} ${s.unit} and the policy is ${s.externalAmount}. Multiplying the per-unit amount by quantity gives ${s.fiscalAmount} in ${s.fiscalLabel}.`),
    tuple(`After the optimal ${s.policyNoun} internalizes the spillover, what quantity of ${s.subject} is produced or consumed?`, efficient, [`${s.marketQ} ${s.unit}`, gap, `${s.marketQ + s.efficientQ} ${s.unit}`], objectives[4], types[4], difficulties[4], "corrective_policy_quantity", `${policyFeedback(s)} The corrected quantity is therefore ${efficient}.`),
    tuple(`Why does the corrected quantity of ${efficient} represent social efficiency in this market?`, "Marginal social benefit equals marginal social cost there", ["Tax revenue or subsidy spending is maximized there", "Buyers and sellers receive equal dollar gains there", "Private curves remain at their original market intersection there"], objectives[5], types[5], difficulties[5], "social_efficiency_condition", `${efficientFeedback(s)} At that intersection, marginal social benefit equals marginal social cost, so no additional mutually beneficial unit is omitted and no inefficient unit is produced.`),
    tuple(`At the corrected ${s.subject} quantity, which buyer-price and seller-receipt pair reflects the policy wedge?`, `Buyers pay ${s.buyerPrice}; sellers receive ${s.sellerPrice}`, [`Buyers pay ${s.sellerPrice}; sellers receive ${s.buyerPrice}`, `Both sides face ${s.marketP}`, `Both sides face ${s.efficientP}`], objectives[6], types[6], difficulties[6], "buyer_seller_policy_wedge", `At ${efficient}, buyers pay ${s.buyerPrice} and sellers receive ${s.sellerPrice}. The ${s.externalAmount} difference is the ${s.policyNoun} wedge, not deadweight loss.`),
    tuple(`How does the ${s.policyNoun} change private incentives in the ${s.subject} market?`, "It makes the private decision-maker face the marginal social effect", ["It removes scarcity from the market", "It guarantees equal surplus for buyers and sellers", "It preserves market quantity while changing only transfers"], objectives[7], types[7], difficulties[7], "policy_internalization", `${policyFeedback(s)} Internalization changes the marginal choice; it does not remove scarcity or guarantee equal gains.`),
    tuple(`Which conclusion is inconsistent with the correctly calibrated ${s.subject} policy shown on the graph?`, "Any policy with the correct direction automatically has the optimal size", ["The optimal wedge equals the marginal external effect", "Corrected quantity equates social marginal benefit and cost", "Policy can create a price difference between buyers and sellers"], objectives[8], types[8], difficulties[8], s.number <= 2 ? "corrective_tax_misconception" : "coase_policy_comparison", `A policy must have both the correct direction and the correct size. Here the optimal wedge equals ${s.externalAmount}; a smaller or larger intervention would leave a quantity distortion.`)
  ].map(question => ({ ...question, asset }));
}

function graphD() {
  const asset = "EXTERNALITY-D-02.webp";
  return [
    tuple("Refer to the imperfect-correction graph. How large is the tax represented by the policy-adjusted MPB curve?", "$2 per vape", ["$1 per vape", "$4 per vape", "$6 per vape"], "EXT.3", "graph_interpretation", "elite", "imperfect_corrective_tax", "The policy-adjusted MPB curve is $2 below MPB, so consumers face a $2 tax. The optimal correction would equal the full $4 marginal external cost."),
    tuple("At what quantity does the $2 vaping tax leave the market after shifting the private consumption incentive?", "160 thousand vapes", ["140 thousand vapes", "180 thousand vapes", "20 thousand vapes"], "EXT.3", "graph_interpretation", "elite", "imperfect_policy_quantity", "The policy-adjusted MPB curve intersects MPC at 160 thousand vapes. That is below the unregulated 180 thousand but above the efficient 140 thousand."),
    tuple("Based on the graph, how much overconsumption remains after the imperfect $2 vaping tax?", "20 thousand vapes", ["40 thousand vapes", "140 thousand vapes", "160 thousand vapes"], "EXT.3", "graph_integration", "elite", "residual_quantity_distortion", "The tax reduces consumption to 160 thousand vapes, while efficiency requires MPC to intersect MSB at 140 thousand. The remaining overconsumption is 20 thousand vapes."),
    tuple("At the taxed quantity of 160 thousand vapes, which consumer-price and seller-receipt pair is shown?", "Consumers pay $11; sellers receive $9", ["Consumers pay $12; sellers receive $8", "Consumers pay $10; sellers receive $10", "Consumers pay $9; sellers receive $11"], "EXT.4", "graph_integration", "elite", "buyer_seller_policy_wedge", "At 160 thousand vapes, consumers pay $11 and sellers receive $9. Their $2 difference is the actual tax wedge, which is smaller than the optimal $4 wedge."),
    tuple("Using the remaining quantity distortion, what residual deadweight loss remains after the $2 vaping tax?", "$20 thousand", ["$80 thousand", "$320 thousand", "$40 thousand"], "EXT.4", "graph_integration", "legendary", "residual_dwl_calculation", "The market still overconsumes by 20 thousand vapes, and the remaining marginal wedge is $2. Residual DWL is 0.5 x 20 thousand x $2 = $20 thousand."),
    tuple("What percentage of the original vaping deadweight loss is removed by the $2 tax?", "75%", ["25%", "50%", "100%"], "EXT.4", "graph_integration", "elite", "dwl_reduction_percentage", "Original DWL is $80 thousand and residual DWL is $20 thousand, so the policy removes $60 thousand, or 75%, while leaving 25%."),
    tuple("How much tax revenue does the government collect when the $2 vaping tax leaves consumption at 160 thousand units?", "$320 thousand", ["$560 thousand", "$80 thousand", "$20 thousand"], "EXT.4", "graph_integration", "elite", "tax_revenue_calculation", "Tax revenue equals the $2 tax multiplied by 160 thousand vapes, or $320 thousand. Revenue is a transfer and should not be confused with residual DWL."),
    tuple("Which assessment correctly compares the actual $2 vaping tax with the optimal $4 correction?", "It improves efficiency but does not restore it because the optimal tax is $4", ["It restores efficiency because every positive tax is corrective", "It worsens efficiency because revenue is not social surplus", "It eliminates the external cost although quantity remains above 140 thousand"], "EXT.4", "graph_integration", "legendary", "imperfect_policy_evaluation", "The $2 tax reduces consumption from 180 thousand to 160 thousand, so it improves efficiency. Because MPC and MSB intersect at 140 thousand, 20 thousand vapes of overconsumption and $20 thousand of residual DWL remain.")
  ].map(question => ({ ...question, asset }));
}

const aDifficulties = [
  ["easy", "easy", "easy", "medium", "medium"],
  ["easy", "easy", "medium", "medium", "medium"],
  ["easy", "easy", "easy", "medium", "medium"],
  ["easy", "easy", "medium", "medium", "medium"]
];
const aObjectives = [
  ["EXT.1", "EXT.2", "EXT.2", "EXT.2", "EXT.3"],
  ["EXT.1", "EXT.2", "EXT.2", "EXT.2", "EXT.4"],
  ["EXT.1", "EXT.5", "EXT.5", "EXT.5", "EXT.6"],
  ["EXT.1", "EXT.5", "EXT.5", "EXT.5", "EXT.6"]
];
const bDifficulties = ["easy", "medium", "medium", "medium", "medium", "medium", "hard", "hard", "hard", "hard"];
const cNegativeDifficulties = ["hard", "hard", "hard", "hard", "hard", "hard", "elite", "elite", "elite"];
const cPositiveDifficulties = ["hard", "hard", "hard", "hard", "hard", "hard", "elite", "elite", "legendary"];

const graphQuestions = [];
for (const s of SCENARIOS) graphQuestions.push(...graphA(s, aDifficulties[s.number - 1], aObjectives[s.number - 1]));
for (const s of SCENARIOS) {
  const objectives = s.number <= 2
    ? ["EXT.2", "EXT.2", "EXT.2", "EXT.2", "EXT.2", "EXT.2", "EXT.2", "EXT.3", "EXT.4", "EXT.9"]
    : ["EXT.5", "EXT.5", "EXT.5", "EXT.5", "EXT.5", "EXT.5", "EXT.5", "EXT.6", "EXT.6", "EXT.9"];
  graphQuestions.push(...graphB(s, bDifficulties, objectives));
}
for (const s of SCENARIOS) {
  const negative = s.number <= 2;
  const objectives = negative
    ? ["EXT.2", "EXT.2", "EXT.4", "EXT.4", "EXT.4", "EXT.4", "EXT.4", "EXT.4", "EXT.4"]
    : ["EXT.5", "EXT.5", "EXT.6", "EXT.6", "EXT.6", "EXT.6", "EXT.6", "EXT.6", "EXT.9"];
  const types = negative
    ? ["graph_calculation", "graph_calculation", "graph_calculation", "graph_calculation", "graph_integration", "graph_integration", "graph_integration", "graph_integration", "graph_trap"]
    : ["graph_calculation", "graph_calculation", "graph_calculation", "graph_integration", "graph_integration", "graph_integration", "graph_integration", "graph_integration", "graph_trap"];
  graphQuestions.push(...graphC(s, negative ? cNegativeDifficulties : cPositiveDifficulties, objectives, types));
}
graphQuestions.push(...graphD());

const NON_GRAPH_BLUEPRINTS = {
  "EXT.1": [
    tuple("A steel mill's smoke harms nearby households. Which classification is most precise?", "Negative production externality", ["Negative consumption externality", "Positive production externality", "Positive consumption externality"], "EXT.1", "application", "easy", "externality_identification", "Production imposes a third-party cost."),
    tuple("Secondhand smoke from using a product harms restaurant patrons. What kind of spillover is this?", "Negative consumption externality", ["Negative production externality", "Positive production externality", "Positive consumption externality"], "EXT.1", "application", "easy", "externality_identification", "The harmful spillover follows consumption."),
    tuple("A beekeeper's hives improve nearby orchard yields without payment. How is the effect classified?", "Positive production externality", ["Negative production externality", "Negative consumption externality", "Positive consumption externality"], "EXT.1", "application", "easy", "externality_identification", "Production by the beekeeper creates an external benefit."),
    tuple("A vaccination reduces infection risk for people other than the patient. What is the spillover?", "Positive consumption externality", ["Negative consumption externality", "Negative production externality", "Positive production externality"], "EXT.1", "application", "easy", "externality_identification", "Consuming the vaccination benefits third parties."),
    tuple("A landscaping company creates noise while serving a customer. Which channel creates the externality?", "Production", ["Consumption", "A public-good channel", "A price-control channel"], "EXT.1", "application", "easy", "externality_channel", "The spillover is created while the service is produced."),
    tuple("A driver's use of a congested road delays other drivers. Which description is best?", "A negative consumption externality", ["A positive production externality", "A private cost borne only by the driver", "A positive consumption externality"], "EXT.1", "application", "easy", "externality_identification", "Road use imposes delay on other users."),
    tuple("What distinguishes an external cost from an ordinary private cost?", "An external cost falls on a third party outside the transaction", ["It is always paid as a tax", "It is any expense a seller records", "It exists only for public goods"], "EXT.1", "interpretation", "medium", "externality", "External effects reach people outside the exchange."),
    tuple("Why does the sign of an externality not reveal its production or consumption channel?", "Sign identifies harm or benefit; channel identifies which activity creates it", ["Sign and channel are always the same", "Only production creates positive spillovers", "Only consumption creates negative spillovers"], "EXT.1", "interpretation", "medium", "externality_channel", "Sign and source are separate dimensions."),
    tuple("A firm's research helps other firms imitate a process. Which private-social relationship is likely?", "Social benefit of production exceeds the producer's private benefit", ["Social cost of consumption exceeds private cost", "Private benefit of consumption exceeds social benefit", "The effect is negative because rivals benefit"], "EXT.1", "interpretation", "medium", "positive_externality", "Knowledge spillovers can make social production returns exceed private returns."),
    tuple("Buyers receive all benefits and sellers bear all costs of a trade. What externality evidence is present?", "None from those facts alone", ["A negative production externality", "A positive consumption externality", "Both positive and negative externalities"], "EXT.1", "interpretation", "medium", "externality_identification", "An externality requires a third-party effect.")
  ],
  "EXT.2": [
    tuple("A factory ignores a constant marginal pollution cost. Relative to efficient quantity, what does the market tend to produce?", "Too much output", ["Too little output", "The efficient output automatically", "Zero output in every case"], "EXT.2", "application", "medium", "negative_externality_efficiency", "Ignoring external cost makes private marginal cost too low."),
    tuple("Consumers ignore harms their purchases impose on bystanders. What is the usual quantity result?", "Overconsumption", ["Underconsumption", "No quantity distortion", "A shortage caused by a price ceiling"], "EXT.2", "application", "medium", "negative_externality_efficiency", "Private marginal benefit exceeds social marginal benefit."),
    tuple("Why can equating MPB with MPC fail when consumption creates an external cost?", "MPB exceeds MSB, so some privately chosen units have social cost above social benefit", ["MPC necessarily exceeds MSC", "External cost raises MSB above MPB", "Efficiency never uses marginal analysis"], "EXT.2", "interpretation", "hard", "externality_social_cost", "Efficiency compares social marginal benefit and cost."),
    tuple("Market quantity is 90, efficient quantity is 60, and marginal external cost is $8. What triangular DWL results?", "$120", ["$240", "$480", "$720"], "EXT.2", "calculation", "hard", "externality_dwl_calculation", "DWL is 0.5 x 30 x $8 = $120.")
  ],
  "EXT.3": [
    tuple("A rule requires factories to install a verified scrubber. What policy type is this?", "Command-and-control technology regulation", ["A corrective consumer subsidy", "A tradable-permit market", "A private Coase bargain"], "EXT.3", "application", "easy", "regulation_policy_identification", "The rule mandates a technology."),
    tuple("A city caps each plant's sulfur emissions at 20 tons. What instrument is used?", "An emissions standard", ["A consumption subsidy", "An unregulated permit market", "A price floor on output"], "EXT.3", "application", "easy", "regulation_policy_identification", "A legal maximum emissions amount is a standard."),
    tuple("Plants have different abatement costs, but a regulator orders equal cuts. What concern arises?", "The same aggregate reduction may cost more than necessary", ["The policy changes a negative externality into a positive one", "Equal cuts guarantee equal marginal costs", "The rule automatically creates tax revenue"], "EXT.3", "application", "medium", "regulatory_cost_effectiveness", "Uniform cuts can ignore marginal-cost differences."),
    tuple("A safety rule bans disposal of toxic waste in a river. What is its intended mechanism?", "Prevent the harmful action rather than price each unit", ["Subsidize river disposal", "Create a tradable cap automatically", "Guarantee compensation to every resident"], "EXT.3", "application", "medium", "regulation_mechanism", "A prohibition directly restricts the action."),
    tuple("Factories can evade an emissions standard cheaply. Which limitation matters most?", "Weak enforcement can prevent the rule from achieving its target", ["Every standard becomes a subsidy", "External cost becomes private benefit", "Monitoring has no link to compliance"], "EXT.3", "application", "hard", "regulatory_enforcement", "Rules require observable, enforceable compliance."),
    tuple("A regulator knows the emissions target but not each firm's abatement cost. What design issue matters?", "Flexibility may reach the target at lower total cost", ["Every firm must have identical technology", "Initial permit allocation determines the fixed cap", "An output subsidy is required"], "EXT.3", "application", "hard", "regulatory_design", "Flexibility can allocate reductions toward lower-cost sources."),
    tuple("How does an emissions standard differ from a corrective tax?", "A standard fixes a legal quantity constraint; a tax sets a price on harm", ["A standard creates revenue while a tax never does", "A tax fixes emissions with certainty", "They are identical whenever enforced"], "EXT.3", "interpretation", "medium", "policy_comparison", "Quantity and price instruments use different control variables."),
    tuple("Why might a performance standard be preferred to mandated technology?", "It can let firms choose how to meet the required outcome", ["It removes monitoring needs", "It guarantees zero compliance cost", "It turns the externality into a public good"], "EXT.3", "interpretation", "medium", "regulatory_flexibility", "Performance standards preserve some compliance flexibility."),
    tuple("A production ban removes highly harmful and low-harm units. What tradeoff should be evaluated?", "Avoided external harm versus lost gains from low-harm output", ["Only the regulator's budget", "Whether tax incidence falls on buyers", "Whether permit allocation is equal"], "EXT.3", "integration", "elite", "regulatory_tradeoff", "Efficient regulation compares marginal social benefits and costs."),
    tuple("A standard reaches the efficient pollution quantity but forces equal cuts despite unequal costs. Which assessment is accurate?", "The target can be efficient while abatement allocation is not cost-effective", ["The target guarantees minimum total cost", "Unequal costs make the target too strict", "The standard is distributionally neutral"], "EXT.3", "integration", "elite", "efficiency_vs_cost_effectiveness", "Outcome efficiency and least-cost allocation are distinct.")
  ],
  "EXT.4": [
    tuple("A corrective tax equals marginal external cost at efficient output. What does it accomplish?", "It makes the decision-maker face the omitted social cost", ["It guarantees sellers bear the legal tax", "It eliminates distributional effects", "It makes revenue equal DWL"], "EXT.4", "application", "medium", "corrective_tax_externality_logic", "The tax internalizes marginal external cost."),
    tuple("Why is tax revenue not the same as deadweight loss?", "Revenue is a transfer; deadweight loss is forgone net social surplus", ["Revenue is always larger than social costs", "Deadweight loss is a producer transfer", "They are identical with downward demand"], "EXT.4", "interpretation", "medium", "tax_revenue_vs_dwl", "Transfers and efficiency losses differ."),
    tuple("A market sells 500 units after a $3 corrective tax. What revenue is collected?", "$1,500", ["$167", "$503", "$3,000"], "EXT.4", "calculation", "hard", "tax_revenue_calculation", "Revenue is $3 x 500."),
    tuple("Marginal external cost is $7, but corrective tax is $4. What wedge remains?", "$3 per unit", ["$4 per unit", "$7 per unit", "$11 per unit"], "EXT.4", "calculation", "hard", "imperfect_corrective_tax", "The remaining wedge is $7 - $4.")
  ],
  "EXT.5": [
    tuple("Education benefits employers and neighbors beyond the student. What quantity tendency can result?", "Underconsumption relative to social optimum", ["Overconsumption", "No efficiency effect", "A binding price floor"], "EXT.5", "application", "easy", "positive_externality", "Private marginal benefit can lie below social marginal benefit."),
    tuple("Why can a positive production externality make output too low?", "Producers do not receive the full social benefit they create", ["MPC exceeds every buyer's willingness to pay", "Consumers impose an external cost", "MSC is always above MPC"], "EXT.5", "interpretation", "medium", "positive_externality_efficiency", "Omitted external benefits weaken private incentives.")
  ],
  "EXT.6": [
    tuple("A per-unit subsidy equals vaccination's marginal external benefit. What is intended?", "Increase vaccination toward socially efficient quantity", ["Reduce vaccination below market quantity", "Leave private incentives unchanged", "Turn benefit into external cost"], "EXT.6", "application", "easy", "subsidy_price_signal", "The subsidy raises private incentive by the external benefit."),
    tuple("Why is subsidy expenditure not proof that a positive-externality policy raises welfare?", "Correction benefits must be compared with resource and financing costs", ["Every subsidy is equal DWL", "Spending determines externality sign", "A subsidy cannot change quantity"], "EXT.6", "interpretation", "medium", "subsidy_policy_evaluation", "Fiscal cost and net social benefit are distinct.")
  ],
  "EXT.7": [
    tuple("A regulator issues permits covering exactly 1,000 tons. What fixes aggregate emissions?", "The total number of valid permits", ["The number of firms trading", "Initial market shares", "Tax revenue from trades"], "EXT.7", "application", "medium", "tradable_permit_cap", "The permit total fixes the cap."),
    tuple("Firm A abates for $20 per ton and B for $70. At a $45 permit price, what is efficient?", "A abates more and can sell permits; B buys permits and abates less", ["B abates more because its cost is higher", "Both must abate equally", "Trading loosens the cap"], "EXT.7", "application", "medium", "tradable_permit_trading", "The lower-cost reducer abates when cost is below permit price."),
    tuple("What happens to the emissions cap when two firms trade an existing permit?", "The cap is unchanged", ["It rises by one unit", "It falls by one unit", "It becomes voluntary"], "EXT.7", "application", "medium", "tradable_permit_cap", "Trading reallocates an existing right."),
    tuple("A regulator retires 10% of outstanding permits. What changes directly?", "The aggregate emissions cap tightens", ["The cap loosens", "Only initial wealth changes", "Abatement incentives disappear"], "EXT.7", "application", "hard", "tradable_permit_cap", "Fewer permits authorize less emissions."),
    tuple("Why can permits reach a fixed target more cheaply than equal cuts?", "Trading shifts more abatement to firms with lower marginal abatement costs", ["Trading eliminates the cap", "Every firm ends with equal emissions", "High-cost firms sell all permits"], "EXT.7", "interpretation", "hard", "tradable_permit_cost_effectiveness", "Trading tends to equalize marginal abatement costs."),
    tuple("What signal does a higher permit price create?", "A stronger incentive to abate rather than use a permit", ["An incentive to emit without permits", "Proof the cap loosened", "A requirement for equal abatement"], "EXT.7", "interpretation", "elite", "tradable_permit_price_signal", "A permit's opportunity cost rises with its price."),
    tuple("Permits are given free rather than auctioned. Which conclusion is sound?", "Allocation changes wealth but need not change cost-effective trading under frictionless competition", ["Free allocation raises the cap", "Auctioning creates more emissions", "Initial allocation never affects distribution"], "EXT.7", "integration", "elite", "permit_allocation_distribution", "Allocation affects distribution while the fixed cap governs total emissions."),
    tuple("A permit system has a fixed cap but severe monitoring failures. What risk follows?", "Unrecorded emissions can exceed the legal cap", ["Monitoring guarantees lower costs", "Permit price becomes a subsidy", "Initial allocation repairs enforcement"], "EXT.7", "integration", "elite", "permit_enforcement", "The cap requires enforceable emissions records."),
    tuple("A city tightens its permit cap with unchanged emissions demand. What likely happens?", "Permits become scarcer and price tends to rise", ["Permits become abundant and price falls", "The cap is unchanged", "Marginal abatement cost becomes zero"], "EXT.7", "integration", "elite", "permit_cap_comparative_statics", "A tighter cap reduces permit supply."),
    tuple("Two systems reach the same cap; one allocates permits equally and one auctions them. What must be separated?", "Cost-effective emissions allocation from distribution of permit value", ["Aggregate emissions from trading", "External cost from private cost", "The cap from permit count"], "EXT.7", "integration", "legendary", "efficiency_vs_distribution", "Allocation can change wealth without changing the least-cost emissions allocation."),
    tuple("Three firms can eliminate one ton for $15, $35, and $80. If two tons must be eliminated, what is minimum cost?", "$50", ["$95", "$115", "$130"], "EXT.7", "calculation", "elite", "abatement_cost_allocation", "Choose the two lowest-cost reductions."),
    tuple("A cap falls from 500 to 420 tons. How much aggregate abatement is required regardless of allocation?", "80 tons", ["420 tons", "500 tons", "920 tons"], "EXT.7", "calculation", "legendary", "tradable_permit_cap_calculation", "Required abatement is 500 - 420.")
  ],
  "EXT.8": [
    tuple("A paper mill buys downstream fishing rights and cuts pollution because it bears lost fishery value. What is illustrated?", "Business integration internalizes the spillover", ["A binding price ceiling", "A government permit cap", "Guaranteed correction through norms"], "EXT.8", "application", "medium", "private_solution_integration", "Common ownership brings the external cost into private calculation."),
    tuple("Neighbors and a music venue sign an enforceable volume contract for payment. What mechanism is this?", "Voluntary bargaining with a contract", ["A government corrective tax", "Public-good provision", "A ticket-price floor"], "EXT.8", "application", "elite", "private_contract_solution", "The parties contract over the spillover."),
    tuple("Why can community norms reduce an externality without guaranteeing full efficiency?", "Coverage and enforcement may be incomplete", ["Norms always equate social margins", "Norms eliminate all transaction costs", "Voluntary action cannot affect spillovers"], "EXT.8", "interpretation", "elite", "social_norm_solution", "Private institutions can help without fully internalizing harm."),
    tuple("A landlord installs soundproofing because quieter units earn higher rents. What links action to benefit?", "The landlord captures some benefit through property value", ["The action creates a permit cap", "Government assigns tax incidence", "Soundproofing makes units nonrival"], "EXT.8", "integration", "legendary", "private_incentive_capture", "Private correction is stronger when benefits can be captured."),
    tuple("Thousands of dispersed residents each suffer a small pollution loss. Why may negotiation fail?", "Organizing and bargaining costs can exceed gains", ["Harm becomes private benefit", "Large numbers guarantee compensation", "Rights cease to affect distribution"], "EXT.8", "integration", "legendary", "transaction_cost_barrier", "Large groups can make coordination too costly."),
    tuple("Preventing damage worth $900 costs $500. Ignoring bargaining costs, what joint surplus is available?", "$400", ["$500", "$900", "$1,400"], "EXT.8", "calculation", "legendary", "transaction_cost_net_gain", "Joint gain is $900 - $500."),
    tuple("A contract creates $1,200 in joint gains but costs $350 to negotiate and enforce. What net gain remains?", "$850", ["$350", "$1,200", "$1,550"], "EXT.8", "calculation", "legendary", "transaction_cost_net_gain", "Net gain is $1,200 - $350."),
    tuple("Noise reduction costs $700 and benefits neighbors $1,000. Agreement costs $400. Is bargaining worthwhile?", "No; the $300 gross gain is below the $400 transaction cost", ["Yes; every external benefit guarantees bargaining", "Yes; net gain is $700", "No; initial rights prevent efficiency"], "EXT.8", "calculation", "legendary", "transaction_cost_threshold", "Gross gain is $300, below transaction cost.")
  ],
  "EXT.9": [
    tuple("A rancher and one farmer have enforceable rights, full information, and negligible bargaining costs. What does Coase predict?", "They can bargain toward the efficient spillover level", ["They must split gains equally", "Government can never help", "Initial rights have no distributional effect"], "EXT.9", "application", "elite", "coase_efficiency", "Low-cost bargaining over rights can reach efficiency."),
    tuple("Under ideal Coase conditions, how does changing initial rights affect the result?", "It can change compensation while leaving efficient allocation attainable", ["It necessarily changes efficient quantity", "It affects neither efficiency nor distribution", "It prevents bargaining"], "EXT.9", "interpretation", "elite", "coase_distribution", "Rights affect distribution even when bargaining reaches efficiency."),
    tuple("A pollution bargain has poor information and strategic holdouts among thousands. Which Coase condition is weakest?", "Low transaction and bargaining costs", ["Scarcity", "Downward demand", "Government tax collection"], "EXT.9", "integration", "elite", "coase_assumptions", "Information, coordination, and holdouts make bargaining costly."),
    tuple("Avoided pollution damage is $2 million, prevention costs $1.2 million, and bargaining costs $1 million. What follows?", "The $0.8 million gross gain is below bargaining costs, so bargaining may fail", ["Residents must gain equally", "Initial factory rights make pollution efficient", "Coase proves policy cannot help"], "EXT.9", "integration", "legendary", "coase_transaction_cost_threshold", "The $0.8 million potential surplus does not cover $1 million in costs.")
  ]
};

const NON_GRAPH_FEEDBACK_EXTENSIONS = [
  " Because the smoke is created during production, the omitted harm raises marginal social cost above the mill's private marginal cost.",
  " The purchase itself is not the spillover; the harm generated when the product is consumed falls on people outside the transaction.",
  " The beekeeper does not capture all of the added orchard output, so the social benefit of producing hives exceeds the private benefit.",
  " The patient receives a private benefit, while reduced transmission creates an additional social benefit for other people.",
  " The customer and landscaper are the transacting parties, while nearby residents experience a cost created by the production process.",
  " Each trip adds congestion delays for other road users, so the driver's private cost understates the social cost of road use.",
  " Costs already paid by the buyer or seller are private; an external cost is omitted from their exchange and therefore from the market price.",
  " A positive or negative sign identifies the effect on third parties, whereas production or consumption identifies the activity that generates it.",
  " Because imitators receive gains without compensating the innovator, private production incentives can be weaker than the total social return.",
  " Benefits and costs confined to the transacting parties are already private; evidence of a spillover requires an effect on someone else.",
  " The factory compares MPB with MPC and omits pollution damage, so MPC lies below MSC and the private intersection occurs at too much output.",
  " When consumers omit harm to bystanders, MPB lies above MSB and the market chooses units whose social benefit is below their social cost.",
  " The market uses MPB, but efficiency uses MSB for a consumption externality; confusing those curves overstates the value of marginal consumption.",
  " The inefficient quantity range is 30 units, and the triangular welfare loss uses one-half of that base rather than the full rectangle.",
  " Because the regulator specifies the equipment rather than a price or emissions allowance, firms cannot choose a different compliance technology.",
  " The legal maximum directly constrains each plant's emissions quantity; it does not create a subsidy or a tradable right by itself.",
  " Equal cuts ignore differences in marginal abatement cost, so the target could be reached with less total cost by shifting reductions toward lower-cost plants.",
  " A ban is a direct quantity restriction: it prevents the damaging behavior instead of charging a price for each unit of harm.",
  " A written standard changes outcomes only when emissions can be observed and violations can be detected and penalized.",
  " Flexibility lets low-cost firms undertake more abatement and high-cost firms less, potentially preserving the target while lowering total compliance cost.",
  " A standard determines an allowed quantity, while a corrective tax changes the marginal private price; those instruments need not produce identical certainty or revenue.",
  " Firms retain freedom to select the least-cost method, although regulators still must define, monitor, and enforce the performance outcome.",
  " Eliminating every unit can sacrifice trades whose private and social benefits still exceed their harm, so efficient policy compares marginal benefits and costs.",
  " Reaching the efficient aggregate quantity does not ensure least-cost abatement when marginal abatement costs remain unequal across firms.",
  " At the efficient quantity, adding the tax to the private margin closes the gap between private and social cost and removes the incentive to choose harmful excess units.",
  " Tax revenue changes who holds purchasing power, while deadweight loss measures mutually beneficial surplus that disappears because quantity is inefficient.",
  " Revenue uses the post-tax quantity: $3 per unit multiplied by 500 units. It is not calculated from the pre-tax quantity or from a welfare triangle.",
  " The $4 tax internalizes only part of the $7 marginal harm, so decision-makers still omit $3 of social cost on each unit.",
  " Because consumers count only their private return, MPB lies below MSB and the private market stops before all socially worthwhile units are consumed.",
  " For a positive production externality, MSC lies below MPC because some production benefit reaches third parties rather than the producer.",
  " By rewarding the external benefit, the subsidy raises the consumer's effective private incentive and moves the MPB-based choice toward the MSB-based efficient quantity.",
  " Government spending is a fiscal cost, not a direct measure of welfare; policy evaluation must compare the external benefit gained with real resource and financing costs.",
  " Each permit authorizes a unit of emissions, so the number of valid permits fixes total legal emissions even when ownership changes through trade.",
  " Firm A's $20 abatement cost is below the $45 permit price, while Firm B's $70 cost is above it, so trade assigns more reduction to the lower-cost source.",
  " A trade transfers permission to emit from one firm to another; it neither creates nor retires a permit and therefore leaves aggregate emissions unchanged.",
  " Retiring permits reduces the legal quantity of emissions, requiring additional aggregate abatement if regulated demand for emissions is otherwise unchanged.",
  " Firms compare marginal abatement cost with the permit price, and trading shifts reductions until avoidable cost differences are exhausted.",
  " Using a permit now carries a larger opportunity cost, so more emissions-reduction projects become cheaper than surrendering the permit.",
  " Free allocation changes who receives permit scarcity value, but with frictionless trading the cap and marginal-cost comparisons still govern total emissions and abatement.",
  " A cap is effective only when emissions are measured and permits are enforced; unrecorded emissions break the link between permits and actual pollution.",
  " With a smaller fixed supply of permits and unchanged demand to emit, scarcity increases and the equilibrium permit price tends to rise.",
  " Both systems can reach the same least-cost allocation through trading, while the initial distribution or auction of permits changes who receives the scarcity rents.",
  " Selecting the $15 and $35 reductions minimizes cost because the required two tons should be abated by the two lowest marginal-cost firms.",
  " The cap reduction itself determines required aggregate abatement: authorized emissions fall by 80 tons regardless of which firms ultimately reduce them.",
  " Combining ownership makes the mill bear both production gains and fishery losses, bringing a previously external cost into the same private decision.",
  " The enforceable agreement assigns obligations and compensation between affected parties rather than relying on a government tax or quantity mandate.",
  " Norms can change behavior, but incomplete participation and weak enforcement can leave some marginal external harm outside private decisions.",
  " Higher rents let the landlord capture part of the neighbors' benefit, strengthening the private incentive to undertake an otherwise externality-reducing investment.",
  " When many parties each have small stakes, locating participants, coordinating terms, preventing holdouts, and enforcing payment can consume the bargaining surplus.",
  " The efficient action creates $900 of avoided harm at a $500 resource cost, leaving $400 that the parties could divide before transaction costs.",
  " Negotiation and enforcement costs use $350 of the $1,200 gross surplus, leaving $850 available to make the parties better off.",
  " The action creates only $300 of gross joint surplus, so spending $400 to reach and enforce an agreement would make the bargain inefficient.",
  " With enforceable rights and negligible transaction costs, the parties can compare prevention cost with avoided harm and bargain to the quantity that maximizes joint surplus.",
  " Either rights assignment can support the efficient quantity under ideal bargaining, but it determines which party pays and how the bargaining gains are divided.",
  " Poor information, many participants, and strategic holdouts raise the cost of reaching and enforcing agreement, undermining the low-transaction-cost assumption.",
  " Prevention creates only $0.8 million of gross joint surplus, which cannot cover $1 million of bargaining cost; the mutually beneficial bargain therefore disappears."
];

const nonGraphRows = Object.entries(NON_GRAPH_BLUEPRINTS).flatMap(([objective, rows]) => rows.map(row => ({ ...row, objective })));
if (NON_GRAPH_FEEDBACK_EXTENSIONS.length !== nonGraphRows.length) {
  throw new Error(`Expected ${nonGraphRows.length} non-graph feedback extensions; found ${NON_GRAPH_FEEDBACK_EXTENSIONS.length}.`);
}
const nonGraphQuestions = nonGraphRows.map((row, index) => ({
  ...row,
  feedback: `${row.feedback}${NON_GRAPH_FEEDBACK_EXTENSIONS[index]}`
}));

const ANSWER_SET_RATIONALES = [
  "because only the private curves determine the outcome",
  "because the full market quantity is treated as the distortion",
  "because the efficient quantity is mistaken for deadweight loss",
  "because the social curve is read in the wrong direction",
  "because tax revenue is substituted for the external effect",
  "because the market price is used as the corrective wedge",
  "because the policy is applied at the unregulated quantity",
  "because buyer price and seller receipt are reversed",
  "because the original distortion is used after correction",
  "because production and consumption channels are interchanged"
];
const answerSetKeys = new Set();

function distinctDistractors(question, index) {
  const distractors = question.distractors.slice(0, 3);
  const keyFor = () => [question.answer, ...distractors].map(value => String(value).normalize("NFKC").trim().toLowerCase()).sort().join("\u0000");
  let key = keyFor();
  let attempt = 0;
  while (answerSetKeys.has(key)) {
    distractors[2] = `${question.distractors[2]} ${ANSWER_SET_RATIONALES[(index + attempt) % ANSWER_SET_RATIONALES.length]}`;
    key = keyFor();
    attempt += 1;
  }
  answerSetKeys.add(key);
  return distractors;
}

function finalize(question, index) {
  const assetMetadata = question.asset ? GRAPH_ASSETS[question.asset] : null;
  return {
    id: ID_FIRST + index,
    q: question.q,
    answer: question.answer,
    distractors: distinctDistractors(question, index),
    objective: question.objective,
    objectiveLabel: OBJECTIVES[question.objective],
    primarySkill: question.primarySkill,
    secondarySkills: [],
    repairSkill: question.primarySkill,
    difficulty: question.difficulty,
    type: question.type,
    tag: "externalities",
    conceptCluster: "externalities",
    commonError: COMMON[question.objective],
    feedback: question.feedback,
    graphRequired: Boolean(question.asset),
    asset: question.asset || null,
    assetClass: assetMetadata?.assetClass || null,
    scenario: assetMetadata?.scenario || null
  };
}

export const ordinaryQuestions = [...graphQuestions, ...nonGraphQuestions].map(finalize);

if (ordinaryQuestions.length !== 160) {
  throw new Error(`Expected 160 externalities questions; found ${ordinaryQuestions.length}.`);
}
