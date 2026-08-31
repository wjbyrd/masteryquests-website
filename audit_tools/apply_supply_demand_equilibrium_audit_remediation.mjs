#!/usr/bin/env node

import crypto from "node:crypto";
import childProcess from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const COMPOSER = path.join(ROOT, "build", "faculty-build-composer");
const LIBRARY_PATH = path.join(COMPOSER, "data", "composer_library.js");
const REGISTRY_PATH = path.join(COMPOSER, "data", "composer_registry.json");
const MANIFEST_PATH = path.join(COMPOSER, "data", "composer_library_manifest.json");
const CONCEPT_REVIEW_MANIFEST_PATH = path.join(COMPOSER, "data", "concept-reviews", "manifest.json");
const MARKET_GATE_AUTHOR_PATH = path.join(ROOT, "play", "economic-realm", "market-gate", "authoring", "market_gate_phase2a_author.mjs");
const ARTIFACT_DIR = path.join(ROOT, "validation_artifacts", "question_quality");
const AUDIT_PATH = path.join(ARTIFACT_DIR, "supply_demand_equilibrium_quality_audit.json");
const BASELINE_AUDIT_PATH = path.join(ARTIFACT_DIR, "supply_demand_equilibrium_quality_audit_pre_remediation.json");
const AUTHORIZATION_PATH = path.join(ARTIFACT_DIR, "supply_demand_equilibrium_audit_authorization.json");
const CHANGE_PATH = path.join(ARTIFACT_DIR, "supply_demand_equilibrium_audit_remediation.json");
const PHASE = "phaseQH4-supply-demand-equilibrium-audit-remediation-v1";
const GENERATED_AT = "2026-08-31T16:00:00.000Z";
const TARGET_CONCEPTS = new Set(["demand", "supply", "market-equilibrium"]);

const fixes = new Map();
function authorize(id, rules, patch, reason) {
  const current = fixes.get(id) || { id, rules: [], patch: {}, reasons: [] };
  current.rules = [...new Set([...current.rules, ...rules])];
  Object.assign(current.patch, patch);
  current.reasons.push(reason);
  fixes.set(id, current);
}

// Demand: 14 REVIEW-affected questions.
authorize("40010", ["possible-difficulty-overstatement"], {
  q: "Refer to the graph. Streaming subscriptions are substitutes for movie tickets, and demand shifts from D0 to D1 while supply remains S0. Which explanation connects a change in the streaming market to the new movie-ticket equilibrium?",
  options: [
    "A higher streaming-subscription price shifts movie-ticket demand right, raising both equilibrium price and quantity",
    "A lower streaming-subscription price shifts movie-ticket demand right, raising both equilibrium price and quantity",
    "Higher theater operating costs shift movie-ticket demand right while leaving supply unchanged",
    "A higher movie-ticket price shifts demand from D0 to D1 along the unchanged supply curve"
  ],
  answer: "A higher streaming-subscription price shifts movie-ticket demand right, raising both equilibrium price and quantity",
  feedback: "A higher price for streaming makes movie tickets relatively more attractive. Movie-ticket demand shifts right from D0 to D1; with S0 fixed, equilibrium price and quantity both rise."
}, "Replace a direct shift lookup with scenario-to-graph causal reasoning.");
authorize("ECON-MG-EASY-42", ["weak-absolute-distractors"], {
  options: [
    "One good can be used in place of the other",
    "The goods are typically consumed together",
    "The goods use the same raw material in production",
    "A price change for one good leaves demand for the other unrelated"
  ], answer: "One good can be used in place of the other"
}, "Use economically plausible relationship errors instead of absolute wording.");
authorize("ECON-MG-HARD-261", ["near-duplicate-stem", "possible-difficulty-overstatement"], {
  q: "Refer to the graph. The price of a substitute rises, shifting demand from D1 to D2 while supply remains S1. Which chain of graph evidence explains the resulting equilibrium change?",
  options: [
    "Demand shifts right; equilibrium moves from P2, Q1 to P3, Q2, so both price and quantity rise",
    "Demand shifts left; equilibrium moves from P3, Q2 to P2, Q1, so both price and quantity fall",
    "Supply shifts right; equilibrium moves from P2, Q1 to P1, Q2, so price falls as quantity rises",
    "Supply shifts left; equilibrium moves from P2, Q3 to P3, Q2, so price rises as quantity falls"
  ],
  answer: "Demand shifts right; equilibrium moves from P2, Q1 to P3, Q2, so both price and quantity rise",
  feedback: "The higher substitute price increases demand. With supply fixed at S1, the graph moves from the D1/S1 intersection at P2, Q1 to the D2/S1 intersection at P3, Q2."
}, "Differentiate the paired graph item through causal evidence and a full equilibrium chain.");
authorize("ECON-MG-HARD-262", ["possible-difficulty-overstatement"], {
  q: "Refer to the graph. A close substitute becomes cheaper, reducing demand from D2 to D1 while supply remains S2. Which explanation correctly traces the change in equilibrium?",
  options: [
    "Demand shifts left; equilibrium moves from P2, Q3 to P1, Q2, reducing both price and quantity",
    "Demand shifts right; equilibrium moves from P1, Q2 to P2, Q3, increasing both price and quantity",
    "Supply shifts left; equilibrium moves from P2, Q3 to P3, Q2, increasing price and reducing quantity",
    "Supply shifts right; equilibrium moves from P3, Q2 to P2, Q3, reducing price and increasing quantity"
  ],
  answer: "Demand shifts left; equilibrium moves from P2, Q3 to P1, Q2, reducing both price and quantity",
  feedback: "A cheaper substitute reduces demand for this good. With S2 unchanged, the equilibrium moves from D2/S2 at P2, Q3 to D1/S2 at P1, Q2."
}, "Require the learner to connect a determinant, curve shift, and equilibrium outcome.");
authorize("ECON-MG-LEGENDARYBOSS-9122", ["weak-absolute-distractors"], {
  options: [
    "Tea demand rises because the substitute-price effect is larger than the income effect",
    "Tea demand falls because the income effect is larger than the substitute-price effect",
    "The direction of the tea-demand shift is ambiguous",
    "Tea demand is unchanged because tea's own price did not change"
  ], answer: "The direction of the tea-demand shift is ambiguous",
  feedback: "The higher coffee price raises demand for tea, while lower income reduces demand for tea because it is normal. Without relative effect sizes, the net shift cannot be determined."
}, "Replace categorical distractors with competing-effect interpretations.");
authorize("ECON-MG-MEDIUM-167", ["near-duplicate-stem"], {
  q: "Refer to the graph. Consumer income rises for a normal good while production conditions remain unchanged. Which equilibrium movement provides evidence of the resulting demand change?",
  options: [
    "From P1, Q2 to P2, Q3 along S2, showing demand shifts right from D1 to D2",
    "From P2, Q1 to P1, Q2 along D1, showing supply shifts right from S1 to S2",
    "From P3, Q2 to P2, Q3 along D2, showing supply shifts right from S1 to S2",
    "From P2, Q3 to P1, Q2 along S2, showing demand shifts left from D2 to D1"
  ],
  answer: "From P1, Q2 to P2, Q3 along S2, showing demand shifts right from D1 to D2",
  feedback: "Higher income raises demand for a normal good. With supply fixed at S2, the equilibrium moves along S2 from D1/S2 at P1, Q2 to D2/S2 at P2, Q3."
}, "Differentiate this demand scenario from the paired supply-shift item.");
authorize("P52B-S3-DEM-B1-003", ["weak-absolute-distractors"], {
  options: [
    "Instant noodles are a normal good for these consumers",
    "Instant noodles are an inferior good for these consumers",
    "A lower noodle price caused movement along the demand curve",
    "A supply decrease raised purchases despite the income change"
  ], answer: "Instant noodles are an inferior good for these consumers"
}, "Use realistic normal-good, movement, and supply-confusion distractors.");
authorize("P52B-S3-DEM-B3-002", ["weak-absolute-distractors"], {
  options: [
    "Demand rises if the income effect is larger than the substitute-price effect",
    "Demand falls if the substitute-price effect is larger than the income effect",
    "Quantity demanded changes along one curve because both events change the ticket price",
    "The net shift is uncertain because the two effects oppose each other"
  ], answer: "The net shift is uncertain because the two effects oppose each other"
}, "Make distractors depend on plausible relative-magnitude and movement errors.");
authorize("P52B-S3-DEM-EL-001", ["weak-absolute-distractors"], {
  options: [
    "The net shift is uncertain because the two effects oppose each other.",
    "Demand rises if the income effect exceeds the response to the cheaper substitute.",
    "Demand falls if the substitute-price effect exceeds the income effect.",
    "Quantity demanded changes along the original curve because both events alter the good's own price."
  ], answer: "The net shift is uncertain because the two effects oppose each other."
}, "Replace absolute distractors with conditional competing-effect diagnoses.");
authorize("P52B-S3-DEM-L-001", ["weak-absolute-distractors"], {
  options: [
    "Current demand rises if the combined income and tea-price effects exceed the expectations effect.",
    "Current demand falls if the expectations effect exceeds the other two effects combined.",
    "The direction is ambiguous because two forces raise current demand while one lowers it.",
    "Current quantity demanded moves along one curve because expectations and related-good prices change coffee's own price."
  ], answer: "The direction is ambiguous because two forces raise current demand while one lowers it."
}, "Use conditional magnitude comparisons and a movement-versus-shift error.");
authorize("PG1-DMD-EL-003", ["possible-difficulty-overstatement"], {
  q: "Refer to the graph. Compare the initial point on D0 at $6 with the final point on D1 at $4. Which explanation correctly separates the demand shift from the subsequent price movement?",
  options: [
    "The shift to D1 lowers quantity at each price; moving down D1 then raises quantity to 100 thousand, only partly offsetting the shift",
    "The shift to D1 raises quantity at each price; moving down D1 then lowers quantity to 100 thousand",
    "Demand stays on D0 because the price fall accounts for the entire move to 100 thousand",
    "Supply shifts left first, and movement along D1 restores quantity to 150 thousand"
  ],
  answer: "The shift to D1 lowers quantity at each price; moving down D1 then raises quantity to 100 thousand, only partly offsetting the shift",
  feedback: "At $6, shifting from D0 to D1 reduces quantity demanded. The later price decline produces movement down D1 to 100 thousand, but that movement does not fully undo the demand decrease."
}, "Turn a final-coordinate lookup into shift-versus-movement decomposition.");
authorize("PG1-DMD-H-001", ["possible-difficulty-overstatement"], {
  q: "Refer to the graph. Calculate the quantity response per $1 price decrease from A to B, then infer which demand relationship that calculation illustrates.",
  options: [
    "Quantity demanded rises 25 thousand per $1 decrease, illustrating movement along a downward-sloping demand curve",
    "Demand rises 25 thousand per $1 decrease, illustrating a rightward shift of the demand curve",
    "Quantity demanded falls 25 thousand per $1 decrease, illustrating movement up the demand curve",
    "Demand falls 125 thousand per $1 decrease, illustrating a leftward shift of the demand curve"
  ],
  answer: "Quantity demanded rises 25 thousand per $1 decrease, illustrating movement along a downward-sloping demand curve",
  feedback: "From A to B, price falls $5 and quantity demanded rises 125 thousand, or 25 thousand per dollar. Because the good's own price changes, this is movement along the demand curve, not a curve shift."
}, "Combine graph calculation with movement-versus-shift interpretation.");
authorize("PG1-DMD-H-003", ["possible-difficulty-overstatement"], {
  q: "Refer to the tea graph. Compare D0 with D1 at both $4 and $6. Which inference is supported by the repeated horizontal gap?",
  options: [
    "Demand decreases by 100 thousand units at each shown price, indicating a leftward curve shift",
    "Quantity demanded decreases by 100 thousand solely because tea's own price rises",
    "Demand increases by 100 thousand units at each shown price, indicating a rightward curve shift",
    "Supply decreases by 100 thousand units, causing movement from D0 to D1"
  ],
  answer: "Demand decreases by 100 thousand units at each shown price, indicating a leftward curve shift",
  feedback: "At both $4 and $6, D1 lies 100 thousand units left of D0. A repeated horizontal difference at fixed prices identifies a decrease in demand rather than movement along one curve."
}, "Require cross-price graph comparison and shift diagnosis.");
authorize("PG1-DMD-L-002", ["possible-difficulty-overstatement"], {
  q: "Refer to the graph. Compare the two stages from the initial point on D0 to the final point on D1, and identify the accounting that separates the curve shift from movement caused by the price fall.",
}, "Make the existing two-stage legendary task explicitly require decomposition and comparison.");

// Market equilibrium: 30 REVIEW-affected questions.
authorize("ECON-MG-EASY-51", ["weak-absolute-distractors"], {
  options: [
    "Quantity demanded equals quantity supplied",
    "Quantity demanded exceeds quantity supplied, creating a shortage",
    "Quantity supplied exceeds quantity demanded, creating a surplus",
    "The demand curve reaches the price axis"
  ], answer: "Quantity demanded equals quantity supplied"
}, "Replace absolute distractors with shortage, surplus, and graph-location errors.");
authorize("ECON-MG-EASY-54", ["near-duplicate-stem"], {
  q: "A popular endorsement increases demand for a product while production conditions remain unchanged. How does the market's equilibrium price respond?",
  options: ["It increases", "It decreases", "It remains unchanged", "It becomes a shortage at every price"],
  answer: "It increases",
  feedback: "The endorsement shifts demand right. With supply unchanged, buyers compete for the product and the equilibrium price rises."
}, "Differentiate the demand case from the paired supply question through a concrete causal scenario.");
authorize("ECON-MG-ELITE-305", ["weak-absolute-distractors"], {
  options: [
    "Price rises, but quantity is ambiguous",
    "Quantity rises, but price is ambiguous",
    "Price and quantity rise if the demand shift is larger",
    "Price rises and quantity falls if the supply shift has the larger quantity effect"
  ], answer: "Price rises, but quantity is ambiguous"
}, "Use competing-effect and relative-size alternatives rather than categorical claims.");
authorize("ECON-MG-EQUILIBRIUM-PREDICTION-5008", ["near-duplicate-stem"], {
  q: "A learner correctly identifies a rightward demand shift with supply fixed. Which paired equilibrium prediction completes the reasoning?",
  options: ["Both price and quantity rise", "Both price and quantity fall", "Price rises while quantity falls", "Price falls while quantity rises"],
  answer: "Both price and quantity rise",
  feedback: "A rightward demand shift creates upward pressure on both equilibrium price and equilibrium quantity when supply is fixed."
}, "Preserve the repair role while requiring completion of a causal reasoning chain.");
authorize("ECON-MG-HARD-224", ["near-duplicate-stem"], {
  q: "Demand increases while supply decreases, and the observed equilibrium quantity is unchanged. Which inference best reconciles the two shifts with that observation?",
  options: [
    "Equilibrium price rises, and the opposing quantity effects happen to offset",
    "Equilibrium price falls, and the two shifts reinforce the quantity effect",
    "Equilibrium quantity is unchanged because neither curve shifts",
    "Equilibrium price is unchanged because the demand and supply shifts are equal"
  ],
  answer: "Equilibrium price rises, and the opposing quantity effects happen to offset",
  feedback: "A demand increase and supply decrease both raise equilibrium price. Their quantity effects oppose one another, and the observed unchanged quantity indicates that those effects offset in this case."
}, "Differentiate the mirror item by asking students to reconcile an observed quantity outcome.");
authorize("ECON-MG-HARD-228", ["possible-difficulty-overstatement"], {
  q: "A market initially has Qd = 500 - 10P and Qs = 100 + 10P. Demand then rises to Qd = 600 - 10P. Calculate the new equilibrium price and compare it with the original equilibrium.",
  options: ["$25, which is $5 higher", "$20, so price is unchanged", "$30, which is $10 higher", "$15, which is $5 lower"],
  answer: "$25, which is $5 higher",
  feedback: "Initially, 500 - 10P = 100 + 10P gives P = $20. After demand rises, 600 - 10P = 100 + 10P gives P = $25, a $5 increase."
}, "Require two equilibrium calculations and a comparative-static interpretation.");
authorize("ECON-MG-HARD-229", ["possible-difficulty-overstatement"], {
  q: "Demand is Qd = 500 - 10P. Supply shifts from Qs = 100 + 10P to Qs = 40 + 10P. Calculate the new equilibrium quantity and infer the effect of the supply decrease.",
  options: ["270; equilibrium quantity falls from 300", "300; equilibrium quantity is unchanged", "230; equilibrium quantity falls from 300", "350; equilibrium quantity rises from 300"],
  answer: "270; equilibrium quantity falls from 300",
  feedback: "The new equilibrium solves 500 - 10P = 40 + 10P, so P = $23 and Q = 270. Compared with the original Q = 300, the supply decrease lowers equilibrium quantity."
}, "Combine algebraic solution with interpretation of a supply shift.");
authorize("ECON-MG-HARD-230", ["possible-difficulty-overstatement"], {
  q: "In a market with Qd = 300 - 10P and Qs = 10P, price is initially $12. Diagnose the disequilibrium and calculate the price toward which an unregulated market adjusts.",
  options: ["A shortage of 60; price rises toward $15", "A surplus of 60; price falls toward $9", "A shortage of 120; price rises toward $18", "A surplus of 120; price falls toward $6"],
  answer: "A shortage of 60; price rises toward $15",
  feedback: "At $12, Qd = 180 and Qs = 120, so the shortage is 60. Setting 300 - 10P = 10P gives the equilibrium price of $15, toward which the shortage pushes price."
}, "Require disequilibrium calculation plus equilibrium-price adjustment.");
authorize("ECON-MG-HARD-231", ["possible-difficulty-overstatement"], {
  q: "In a market with Qd = 410 - 10P and Qs = -10 + 10P, price is initially $25. Diagnose the disequilibrium and calculate the price toward which an unregulated market adjusts.",
  options: ["A surplus of 80; price falls toward $21", "A shortage of 80; price rises toward $29", "A surplus of 40; price falls toward $23", "A shortage of 40; price rises toward $27"],
  answer: "A surplus of 80; price falls toward $21",
  feedback: "At $25, Qs = 240 and Qd = 160, so the surplus is 80. Setting the schedules equal gives P = $21, and seller competition pushes price downward toward it."
}, "Require disequilibrium calculation plus equilibrium-price adjustment.");
authorize("ECON-MG-HARD-232", ["possible-difficulty-overstatement"], {
  q: "A drought reduces wheat supply while a health trend increases demand for wheat bread. Explain which equilibrium effect is certain and which depends on the relative shift sizes.",
  options: [
    "Price rises; quantity is ambiguous because the shifts have opposing quantity effects",
    "Price falls; quantity rises because both shifts increase purchases",
    "Price rises; quantity rises because demand determines both outcomes",
    "Price is ambiguous; quantity falls because supply determines both outcomes"
  ], answer: "Price rises; quantity is ambiguous because the shifts have opposing quantity effects",
  feedback: "The demand increase and supply decrease both raise price. Demand raises quantity while the supply decrease lowers it, so quantity depends on the relative magnitudes."
}, "Require explicit separation of reinforced and opposing comparative-static effects.");
authorize("ECON-MG-HARD-233", ["possible-difficulty-overstatement"], {
  q: "Production technology lowers costs while consumer interest in the good falls. Explain which equilibrium effect is certain and which depends on the relative shift sizes.",
  options: [
    "Price falls; quantity is ambiguous because the shifts have opposing quantity effects",
    "Price rises; quantity falls because both shifts reduce market availability",
    "Price falls; quantity rises because supply determines both outcomes",
    "Price is ambiguous; quantity falls because demand determines both outcomes"
  ], answer: "Price falls; quantity is ambiguous because the shifts have opposing quantity effects",
  feedback: "The supply increase and demand decrease both lower price. Supply raises quantity while the demand decrease lowers it, so quantity depends on the relative magnitudes."
}, "Require explicit separation of reinforced and opposing comparative-static effects.");
authorize("ECON-MG-HARD-258", ["near-duplicate-stem", "possible-difficulty-overstatement"], {
  q: "Refer to the graph. Starting at D1/S1, demand and supply both increase to D2/S2. Which explanation compares the general prediction with the particular equilibrium drawn?",
  options: [
    "Quantity rises for certain; price is generally ambiguous but remains at P2 in this drawing",
    "Price rises for certain; quantity is generally ambiguous but remains at Q1 in this drawing",
    "Both price and quantity are generally fixed because the curves shift together",
    "Quantity falls for certain; price is generally ambiguous but falls to P1 here"
  ],
  answer: "Quantity rises for certain; price is generally ambiguous but remains at P2 in this drawing",
  feedback: "Both increases raise equilibrium quantity. Their price effects oppose, so theory alone leaves price ambiguous; the displayed intersections show P2 in both the initial and final equilibria."
}, "Differentiate the paired graph item and require theory-to-evidence comparison.");
authorize("ECON-MG-HARD-259", ["possible-difficulty-overstatement"], {
  q: "Refer to the graph. Demand increases from D1 to D2 while supply decreases from S2 to S1. Infer what theory guarantees, then use the plotted equilibria to explain the quantity outcome.",
  options: [
    "Price rises for certain; quantity is generally ambiguous but stays at Q2 in this drawing",
    "Quantity rises for certain; price is generally ambiguous but stays at P2 in this drawing",
    "Price falls for certain; quantity stays at Q2 because both curves shift right",
    "Quantity falls for certain; price stays at P1 because the shifts offset"
  ],
  answer: "Price rises for certain; quantity is generally ambiguous but stays at Q2 in this drawing",
  feedback: "The demand increase and supply decrease both raise price. Their quantity effects oppose; the graph shows those effects offset at Q2 for this particular pair of shifts."
}, "Require general comparative statics plus interpretation of the drawn special case.");
authorize("ECON-MG-HARD-264", ["weak-absolute-distractors"], {
  options: [
    "Quantity rises while price stays the same",
    "Quantity rises while price rises because the demand shift has the larger price effect",
    "Quantity rises while price falls because the supply shift has the larger price effect",
    "Price rises while quantity stays the same because the shifts have equal quantity effects"
  ], answer: "Quantity rises while price stays the same"
}, "Use plausible alternative relative-size outcomes instead of absolute claims.");
authorize("ECON-MG-LEGENDARY-9015", ["near-duplicate-stem"], {
  q: "Refer to the graph. Tastes shift demand from D1 to D2 while supply remains S1. Which explanation uses both intersections to distinguish the demand shift from the market's movement along supply?",
  options: [
    "Demand shifts right, and equilibrium moves along S1 from P2, Q1 to P3, Q2",
    "Supply shifts right, and equilibrium moves along D1 from P2, Q1 to P1, Q2",
    "Demand shifts left, and equilibrium moves along S1 from P3, Q2 to P2, Q1",
    "Supply shifts left, and equilibrium moves along D2 from P2, Q3 to P3, Q2"
  ],
  answer: "Demand shifts right, and equilibrium moves along S1 from P2, Q1 to P3, Q2",
  feedback: "The taste change shifts the entire demand curve from D1 to D2. Because S1 is fixed, the new intersection is also a movement along S1 to a higher price and quantity."
}, "Differentiate this legendary item by combining curve-shift and movement-along-curve reasoning.");
authorize("ECON-MG-LEGENDARY-9019", ["possible-difficulty-overstatement"], {
  q: "Refer to the graph. Evaluate the move from D1/S1 to D2/S2 by separating what simultaneous demand and supply increases imply in general from what the displayed intersections establish here.",
  options: [
    "Quantity rises generally; price is ambiguous generally but stays at P2 here as quantity moves from Q1 to Q3",
    "Price rises generally; quantity is ambiguous generally but stays at Q1 here as price moves from P1 to P3",
    "Both variables are ambiguous generally, and the graph shows both unchanged",
    "Quantity falls generally; price is ambiguous generally but falls to P1 here"
  ],
  answer: "Quantity rises generally; price is ambiguous generally but stays at P2 here as quantity moves from Q1 to Q3",
  feedback: "Both shifts raise quantity. Their price effects oppose, so price is indeterminate without magnitudes; this graph supplies those magnitudes and shows the price effects offset at P2."
}, "Raise the legendary item from coordinate reading to theory/evidence synthesis.");
for (const [id, answer, distractors, feedback] of [
  ["ECON-MG-LEGENDARY-9020", "Equilibrium quantity is ambiguous, while equilibrium price rises", ["Equilibrium quantity rises if the demand effect is larger", "Equilibrium quantity falls if the supply effect is larger", "Equilibrium price falls while quantity is ambiguous"], "The demand increase and supply decrease reinforce each other on price but oppose on quantity. Quantity therefore depends on relative shift sizes."],
  ["ECON-MG-LEGENDARY-9021", "Equilibrium price rises, while equilibrium quantity is ambiguous", ["Equilibrium quantity rises if the demand effect is larger", "Equilibrium quantity falls if the supply effect is larger", "Equilibrium price falls while quantity is ambiguous"], "Higher laptop demand and reduced chip supply both raise price. Their quantity effects oppose, leaving quantity dependent on relative magnitudes."],
  ["ECON-MG-LEGENDARY-9022", "Equilibrium price falls, while equilibrium quantity is ambiguous", ["Equilibrium quantity falls if the demand effect is larger", "Equilibrium quantity rises if the supply effect is larger", "Equilibrium price rises while quantity is ambiguous"], "Lower demand and greater supply both reduce price. Their quantity effects oppose, so quantity depends on relative magnitudes."],
  ["ECON-MG-LEGENDARY-9026", "Equilibrium price rises, while equilibrium quantity is ambiguous", ["Equilibrium quantity rises if the income-driven demand effect is larger", "Equilibrium quantity falls if the input-cost supply effect is larger", "Equilibrium price falls while quantity is ambiguous"], "Higher input costs decrease supply and higher income increases demand. Both raise price, while their quantity effects oppose."],
  ["ECON-MG-LEGENDARY-9027", "Equilibrium price falls, while equilibrium quantity is ambiguous", ["Equilibrium quantity rises if the technology-driven supply effect is larger", "Equilibrium quantity falls if the taste-driven demand effect is larger", "Equilibrium price rises while quantity is ambiguous"], "The supply increase and demand decrease both lower price. Their quantity effects oppose, leaving quantity dependent on relative magnitudes."],
  ["ECON-MG-LEGENDARY-9034", "Equilibrium quantity falls, while equilibrium price is ambiguous", ["Equilibrium price falls if the demand decrease has the larger price effect", "Equilibrium price rises if the supply decrease has the larger price effect", "Equilibrium quantity rises while price is ambiguous"], "Both decreases reduce equilibrium quantity. Demand's decrease lowers price while supply's decrease raises it, so price depends on relative shift sizes."]
]) authorize(id, ["weak-absolute-distractors"], { options: [answer, ...distractors], answer, feedback }, "Replace absolute distractors with plausible relative-magnitude alternatives.");
authorize("ECON-MG-MEDIUM-126", ["near-duplicate-stem", "repeated-feedback"], {
  q: "A product goes viral while firms' production conditions remain unchanged. How do the resulting demand shift and movement along supply change equilibrium?",
  options: ["Price rises and quantity rises", "Price falls and quantity falls", "Price rises and quantity falls", "Price falls and quantity rises"],
  answer: "Price rises and quantity rises",
  feedback: "The viral interest shifts demand right. With supply fixed, the new intersection lies higher and farther right, so equilibrium price and quantity both rise."
}, "Differentiate the item from its boss variant and provide scenario-specific feedback.");
authorize("ECON-MG-MEDIUM-129", ["weak-absolute-distractors"], {
  options: ["Price should fall", "Price should rise", "Demand shifts right in response to unsold inventory", "Supply shifts left before price can adjust"],
  answer: "Price should fall"
}, "Use plausible adjustment-mechanism errors instead of absolute curve-shift claims.");
authorize("ECON-MG-MEDIUM-163", ["near-duplicate-stem"], {
  q: "Refer to the graph. A production improvement shifts supply from S1 to S2 while demand remains D1. Which explanation connects the curve shift to the new equilibrium?",
  options: [
    "Equilibrium moves from P2, Q1 to P1, Q2, so price falls and quantity rises",
    "Equilibrium moves from P1, Q2 to P2, Q3, so price and quantity rise",
    "Equilibrium moves from P3, Q2 to P2, Q3, so price falls and quantity rises",
    "Equilibrium moves from P2, Q3 to P3, Q2, so price rises and quantity falls"
  ],
  answer: "Equilibrium moves from P2, Q1 to P1, Q2, so price falls and quantity rises",
  feedback: "The production improvement shifts supply right to S2. Along unchanged D1, the intersection moves from P2, Q1 to P1, Q2."
}, "Differentiate the supply scenario from the paired demand-shift graph item.");
authorize("ECON-MG-MEDIUMBOSS-3014", ["weak-absolute-distractors"], {
  options: ["A surplus creates downward pressure on price", "A shortage creates upward pressure on price", "Unsold inventories shift demand right", "Seller competition shifts supply left"],
  answer: "A surplus creates downward pressure on price"
}, "Replace categorical distractors with plausible disequilibrium-adjustment errors.");
authorize("P52B-S3-MEQ-B3-003", ["possible-difficulty-overstatement"], {
  q: "At the current price, quantity demanded is 400 and quantity supplied is 520. Which explanation diagnoses the imbalance and traces the adjustment along the existing curves without a price control?",
  options: [
    "A surplus pushes price down, raising quantity demanded and lowering quantity supplied until they converge",
    "A shortage pushes price up, lowering quantity demanded and raising quantity supplied until they converge",
    "A surplus shifts demand right while price remains fixed until inventories clear",
    "A shortage shifts supply left while buyers reduce quantity demanded"
  ],
  answer: "A surplus pushes price down, raising quantity demanded and lowering quantity supplied until they converge",
  feedback: "Quantity supplied exceeds quantity demanded by 120, creating a surplus. Falling price moves the market along both curves: quantity demanded rises and quantity supplied falls toward equilibrium."
}, "Require diagnosis plus a complete movement-along-curves adjustment mechanism.");
authorize("PG1-EQ-EL-001", ["possible-difficulty-overstatement"], {
  q: "Refer to the graph. Compare quantities at $2 with those at the $3 equilibrium and explain how movements along both curves eliminate the 100-thousand-gallon shortage.",
}, "Make the elite task explicitly require two-curve comparison and adjustment reasoning.");
authorize("PG1-EQ-H-001", ["possible-difficulty-overstatement"], {
  q: "Refer to the graph. Calculate the disequilibrium at $1 per gallon and explain the price pressure that follows from buyers' and sellers' incentives.",
}, "Combine graph calculation with disequilibrium adjustment reasoning.");
authorize("PG1-EQ-L-001", ["possible-difficulty-overstatement"], {
  q: "Refer to the graph. Compare the market at $2 with the market at $4, then infer how the two opposite price-adjustment forces both move the market toward the $3 equilibrium.",
}, "Require comparison of two disequilibria and synthesis of their adjustment paths.");

// Supply: 12 REVIEW-affected questions.
authorize("40007", ["possible-difficulty-overstatement"], {
  q: "Refer to the graph. Equilibrium moves from A to B after one market determinant changes. Evaluate the graph evidence: which explanation identifies the curve shift and connects it to the new price and quantity?",
  options: [
    "Higher theater operating costs shift supply left, raising price and reducing quantity",
    "A higher substitute price shifts demand left, raising price and reducing quantity",
    "Higher consumer income shifts supply left for a normal good, reducing quantity",
    "A lower ticket price shifts supply left as firms move along the demand curve"
  ],
  answer: "Higher theater operating costs shift supply left, raising price and reducing quantity",
  feedback: "Higher operating costs reduce supply, shifting it left from S0 to S1. With demand unchanged, the equilibrium moves from A to B: price rises and quantity falls."
}, "Replace a direct event lookup with determinant-to-curve-to-equilibrium reasoning.");
authorize("ECON-MG-LEGENDARYBOSS-9125", ["possible-difficulty-overstatement", "weak-absolute-distractors"], {
  q: "Evaluate the competing effects of a cost-saving production technology and a new compliance cost. What can be inferred about the net supply shift without relative magnitudes?",
  options: [
    "Supply shifts right if the technology's cost reduction is larger",
    "Supply shifts left if the compliance-cost increase is larger",
    "The net direction is ambiguous without relative magnitudes",
    "Supply is unchanged if the two cost effects are equal"
  ],
  answer: "The net direction is ambiguous without relative magnitudes",
  feedback: "Technology pushes supply right and compliance costs push it left. The net direction depends on which cost effect is larger; equal effects would offset."
}, "Require evaluation of competing cost effects and replace categorical distractors.");
authorize("P52B-S2-SUP-B3-001", ["weak-absolute-distractors"], {
  options: [
    "Supply shifts right because the subsidy lowers marginal cost by more than the regulation raises it",
    "Supply shifts left because the regulation raises marginal cost by more than the subsidy lowers it",
    "Quantity supplied rises along the original curve because the product's market price increases",
    "The two per-unit effects offset, so supply is unchanged."
  ], answer: "The two per-unit effects offset, so supply is unchanged."
}, "Use magnitude and movement-versus-shift errors instead of absolute claims.");
authorize("P52B-S2-SUP-B3-003", ["weak-absolute-distractors"], {
  options: [
    "Current supply increases if the technology effect exceeds the inventory-withholding effect.",
    "The net direction is ambiguous without knowing the strength of each effect.",
    "Current supply decreases if the inventory-withholding effect exceeds the technology effect.",
    "Quantity supplied moves along one curve because both events change the product's current price."
  ], answer: "The net direction is ambiguous without knowing the strength of each effect."
}, "Use conditional relative-magnitude and movement-versus-shift distractors.");
authorize("P52B-S2-SUP-EL-001", ["weak-absolute-distractors"], {
  options: [
    "Supply shifts right if the machine's cost reduction exceeds the environmental fee.",
    "Supply shifts left if the environmental fee exceeds the machine's cost reduction.",
    "Supply is unchanged if the two per-unit cost effects are equal.",
    "The net supply shift cannot be determined without comparing the two cost changes."
  ], answer: "The net supply shift cannot be determined without comparing the two cost changes."
}, "Replace absolute distractors with conditional net-cost alternatives.");
authorize("P52B-S2-SUP-EL-002", ["weak-absolute-distractors"], {
  options: [
    "Entry pushes supply right and higher input cost pushes it left, making the net effect uncertain.",
    "Market supply rises if the entry effect is larger than the input-cost effect.",
    "Market supply falls if the input-cost effect is larger than the entry effect.",
    "Quantity supplied changes along the original curve because entry and input costs change the product's price."
  ], answer: "Entry pushes supply right and higher input cost pushes it left, making the net effect uncertain."
}, "Use conditional magnitude and movement-versus-shift distractors.");
authorize("P52B-S2-SUP-H-001", ["weak-absolute-distractors"], {
  options: [
    "Current supply rises if the wage reduction has the larger effect.",
    "Current supply falls if inventory withholding has the larger effect.",
    "The net direction is uncertain because the two changes push current supply in opposite directions.",
    "Quantity supplied changes along the original curve because both events change the product's current price."
  ], answer: "The net direction is uncertain because the two changes push current supply in opposite directions."
}, "Replace absolute distractors with conditional competing-effect diagnoses.");
authorize("P52B-S2-SUP-L-001", ["possible-difficulty-overstatement"], {
  q: "At $30, three sellers offer 12, 18, and 25 units; at $35 they offer 16, 24, and 30 units. Calculate both market quantities and infer what the comparison represents.",
  options: [
    "Market quantity rises from 55 to 70 units, representing movement along market supply",
    "Market supply shifts right from 55 to 70 units because the number of sellers increases",
    "Market quantity falls from 70 to 55 units, representing movement down market supply",
    "Market supply shifts left by 15 units because individual quantities are aggregated vertically"
  ],
  answer: "Market quantity rises from 55 to 70 units, representing movement along market supply",
  feedback: "Horizontal summation gives 55 units at $30 and 70 at $35. Because only the product's own price changes, the 15-unit increase is movement along the market supply curve."
}, "Raise a one-step sum into two-price aggregation plus movement-versus-shift interpretation.");
authorize("P52B-S2-SUP-L-004", ["weak-absolute-distractors"], {
  options: [
    "Current and future supply both rise because firms expand production immediately and store none of it.",
    "Current supply falls as firms hold inventory, while future supply rises when the inventory is released.",
    "Current supply rises as firms sell inventory before the expected spike, while future supply falls.",
    "Current quantity supplied falls along one curve because the current product price decreases."
  ], answer: "Current supply falls as firms hold inventory, while future supply rises when the inventory is released."
}, "Use plausible timing and movement-versus-shift alternatives without absolute cues.");
authorize("PG1-SUP-EL-002", ["possible-difficulty-overstatement"], {
  q: "Refer to the graph. Compare the initial point on S0 at $9 with the final point on S1 at $13. Which explanation separates the supply shift from the subsequent price movement?",
  options: [
    "The shift to S1 lowers quantity at each price; moving up S1 then raises quantity back to 200 thousand",
    "The shift to S1 raises quantity at each price; moving up S1 then lowers quantity to 200 thousand",
    "Supply stays on S0 because the price rise accounts for the entire return to 200 thousand",
    "Demand shifts right first, and movement down S1 restores quantity to 100 thousand"
  ],
  answer: "The shift to S1 lowers quantity at each price; moving up S1 then raises quantity back to 200 thousand",
  feedback: "The leftward shift from S0 to S1 reduces quantity supplied at each price. The later price rise causes movement up S1 until quantity supplied returns to 200 thousand."
}, "Turn a final-coordinate lookup into shift-versus-movement decomposition.");
authorize("PG1-SUP-EL-003", ["possible-difficulty-overstatement"], {
  q: "Refer to the graph. Compare point A on S0 with the final point on S1 at $2. Which explanation separates the supply increase from the later price movement?",
  options: [
    "The shift to S1 raises quantity at each price; moving down S1 then lowers quantity back to about 100 thousand",
    "The shift to S1 lowers quantity at each price; moving down S1 then raises quantity to about 100 thousand",
    "Supply remains on S0 because the price decline explains the entire move",
    "Demand shifts left first, and movement up S1 raises quantity to about 225 thousand"
  ],
  answer: "The shift to S1 raises quantity at each price; moving down S1 then lowers quantity back to about 100 thousand",
  feedback: "The rightward shift to S1 raises quantity supplied at each price. The later price decline causes movement down S1, offsetting that increase in this particular comparison."
}, "Turn a final-coordinate lookup into shift-versus-movement decomposition.");
authorize("PG1-SUP-H-001", ["possible-difficulty-overstatement"], {
  q: "Refer to the graph. Calculate the quantity response per $1 price increase from A to B, then infer which supply relationship that calculation illustrates.",
  options: [
    "Quantity supplied rises 25 thousand per $1 increase, illustrating movement along an upward-sloping supply curve",
    "Supply rises 25 thousand per $1 increase, illustrating a rightward shift of the supply curve",
    "Quantity supplied falls 25 thousand per $1 increase, illustrating movement down the supply curve",
    "Supply rises 125 thousand per $1 increase because production costs decline"
  ],
  answer: "Quantity supplied rises 25 thousand per $1 increase, illustrating movement along an upward-sloping supply curve",
  feedback: "From A to B, price rises $5 and quantity supplied rises 125 thousand, or 25 thousand per dollar. Because the product's own price changes, this is movement along supply rather than a curve shift."
}, "Combine graph calculation with movement-versus-shift interpretation.");

// Context-specific feedback for the remaining repeated-feedback warnings.
authorize("ECON-MG-EQUILIBRIUM-PREDICTION-6010", ["repeated-feedback"], {
  feedback: "Once the demand increase is identified, unchanged supply means the new intersection lies at both a higher equilibrium price and a higher equilibrium quantity."
}, "Tailor bridge feedback to the preceding diagnostic step.");
authorize("ECON-MG-EASY-49", ["repeated-feedback"], {
  feedback: "Steel is an input in car production. A higher steel price raises producers' costs, so the car supply curve shifts left."
}, "Tailor feedback to the steel-input scenario.");
authorize("ECON-MG-MEDIUMBOSS-3008", ["repeated-feedback"], {
  feedback: "More expensive steel raises the cost of producing cars at every output level, shifting car supply left rather than changing demand."
}, "Tailor boss feedback to the input-cost-versus-demand distinction.");
authorize("ECON-MG-SUPPLY-SHIFTERS-5007", ["repeated-feedback"], {
  feedback: "The repair cue identifies steel as an input. A higher input price raises marginal production cost and shifts car supply left."
}, "Tailor repair feedback to the explicit input-price cue.");
authorize("ECON-MG-SUPPLY-SHIFTERS-6009", ["repeated-feedback"], {
  feedback: "The bridge from production cost to market supply is direct: higher steel cost makes each quantity of cars more expensive to produce, reducing supply."
}, "Tailor bridge feedback to the cost-to-supply connection.");
authorize("ECON-MG-MEDIUMBOSS-3010", ["repeated-feedback"], {
  feedback: "At this checkpoint, the demand increase moves the market to a higher point on the unchanged supply curve, raising both equilibrium price and quantity."
}, "Tailor boss feedback to checkpoint reasoning.");

const sha256 = value => crypto.createHash("sha256").update(value).digest("hex");
const answerHash = value => sha256(String(value ?? "").normalize("NFKC").trim().replace(/\s+/g, " ").toLowerCase());
function stableStringify(value) {
  if (Array.isArray(value)) return `[${value.map(stableStringify).join(",")}]`;
  if (value && typeof value === "object") return `{${Object.keys(value).sort().map(key => `${JSON.stringify(key)}:${stableStringify(value[key])}`).join(",")}}`;
  return JSON.stringify(value);
}
function parseLibrary(source, filename) {
  const context = { window: {} };
  vm.runInNewContext(source, context, { filename });
  return context.window.MQ_COMPOSER_LIBRARY;
}
function loadLibrary() { return parseLibrary(fs.readFileSync(LIBRARY_PATH, "utf8"), LIBRARY_PATH); }
function questionEntries(library) {
  const entries = [];
  for (const [conceptId, module] of Object.entries(library.concepts || {})) {
    for (const [pool, questions] of Object.entries(module.questions || {})) for (const question of questions || []) entries.push({ conceptId, pool, question });
    for (const pool of ["repairQuestions", "repairSeedQuestions", "bridgeQuestions"]) for (const question of module[pool] || []) entries.push({ conceptId, pool: pool.replace("Questions", ""), question });
  }
  return entries;
}
function questionId(question) { return String(question.canonicalId || question.id); }
function sourceHash(question) {
  const payload = Object.fromEntries(["id", "q", "options", "image", "primarySkill", "primaryConceptId", "difficulty", "objective"].map(key => [key, question[key] ?? null]));
  return sha256(stableStringify(payload));
}
function assertAnswer(question) {
  const matches = (question.options || []).filter(option => answerHash(option) === String(question.aHash || "").replace(/^sha256:/, ""));
  if (matches.length !== 1) throw new Error(`${questionId(question)} answer hash resolves to ${matches.length} options.`);
}
function snapshotQuestion(question) {
  return JSON.parse(JSON.stringify(question));
}
function applyPatch(question, patch) {
  const allowed = new Set(["q", "options", "answer", "feedback", "difficulty", "canonicalDifficulty", "graphRequired", "type", "primarySkill", "objective"]);
  for (const key of Object.keys(patch)) if (!allowed.has(key)) throw new Error(`Unauthorized patch field ${key} on ${questionId(question)}.`);
  for (const [key, value] of Object.entries(patch)) {
    if (key === "answer") continue;
    question[key] = Array.isArray(value) ? [...value] : value;
  }
  if (patch.answer != null) question.aHash = answerHash(patch.answer);
  assertAnswer(question);
}
function replaceUnique(source, expected, replacement, label) {
  if (expected === replacement) return source;
  const beforeCount = source.split(expected).length - 1;
  const afterCount = source.split(replacement).length - 1;
  if (beforeCount === 1 && afterCount === 0) return source.replace(expected, replacement);
  if (beforeCount === 0 && afterCount === 1) return source;
  throw new Error(`${label} did not resolve uniquely in Market Gate authoring source (${beforeCount} before, ${afterCount} after).`);
}
function renderMarketGateAuthor(baselines) {
  let source = fs.readFileSync(MARKET_GATE_AUTHOR_PATH, "utf8");
  for (const id of ["40007", "40010"]) {
    const spec = fixes.get(id), before = baselines.get(id), after = spec.afterQuestion;
    if (id === "40007") {
      const trustedIntermediate = "Refer to the graph. Equilibrium moves from A to B after one market determinant changes. Which explanation identifies the curve shift and connects it to the new price and quantity?";
      if (source.includes(JSON.stringify(trustedIntermediate))) {
        source = replaceUnique(source, JSON.stringify(trustedIntermediate), JSON.stringify(after.q), `${id} trusted intermediate stem`);
      }
    }
    source = replaceUnique(source, JSON.stringify(before.q), JSON.stringify(after.q), `${id} stem`);
    source = replaceUnique(source, JSON.stringify(before.feedback), JSON.stringify(after.feedback), `${id} feedback`);
    const beforeAnswer = before.options.find(option => answerHash(option) === String(before.aHash).replace(/^sha256:/, ""));
    const afterAnswer = after.options.find(option => answerHash(option) === String(after.aHash).replace(/^sha256:/, ""));
    const beforeDistractors = before.options.filter(option => option !== beforeAnswer);
    const afterDistractors = after.options.filter(option => option !== afterAnswer);
    source = replaceUnique(source, JSON.stringify(beforeAnswer), JSON.stringify(afterAnswer), `${id} answer`);
    if (beforeDistractors.length !== afterDistractors.length) throw new Error(`${id} changed distractor count.`);
    for (let index = 0; index < beforeDistractors.length; index += 1) {
      source = replaceUnique(source, JSON.stringify(beforeDistractors[index]), JSON.stringify(afterDistractors[index]), `${id} distractor ${index + 1}`);
    }
  }
  return source;
}

function render() {
  const baselineAudit = fs.existsSync(BASELINE_AUDIT_PATH)
    ? JSON.parse(fs.readFileSync(BASELINE_AUDIT_PATH, "utf8"))
    : JSON.parse(fs.readFileSync(AUDIT_PATH, "utf8"));
  const counts = baselineAudit.summary || baselineAudit.counts;
  if (counts.errors !== 0 || counts.warnings !== 30 || counts.reviews !== 59) throw new Error(`Unexpected baseline audit counts: ${JSON.stringify(counts)}.`);
  const findingIds = new Set(baselineAudit.findings.map(finding => String(finding.questionId)));
  const reviewIds = new Set(baselineAudit.findings.filter(finding => finding.severity === "REVIEW").map(finding => String(finding.questionId)));
  const graphIds = baselineAudit.findings.filter(finding => finding.rule === "image-without-graph-required").map(finding => String(finding.questionId));
  if (reviewIds.size !== 56 || graphIds.length !== 23) throw new Error(`Unexpected baseline scope: ${reviewIds.size} REVIEW IDs and ${graphIds.length} graph warnings.`);
  for (const id of graphIds) authorize(id, ["image-without-graph-required"], { graphRequired: true }, "Mark an existing graph-dependent question as graphRequired without changing its asset.");
  for (const id of fixes.keys()) if (!findingIds.has(id)) throw new Error(`${id} is not present in the authoritative baseline audit.`);
  for (const id of reviewIds) if (!fixes.has(id)) throw new Error(`Missing remediation authorization for REVIEW question ${id}.`);

  const library = loadLibrary();
  const entries = questionEntries(library);
  const beforeLibrarySnapshot = new Map(entries.map(entry => [questionId(entry.question), stableStringify(entry.question)]));
  const headLibrary = parseLibrary(childProcess.execFileSync("git", ["show", "HEAD:build/faculty-build-composer/data/composer_library.js"], { cwd: ROOT, encoding: "utf8", maxBuffer: 256 * 1024 * 1024 }), "HEAD:composer_library.js");
  const headEntries = questionEntries(headLibrary);
  const previous = fs.existsSync(CHANGE_PATH) ? JSON.parse(fs.readFileSync(CHANGE_PATH, "utf8")) : null;
  const previousChanges = new Map((previous?.changes || []).map(change => [String(change.id), change]));
  const baselines = new Map();
  const changes = [];

  for (const spec of fixes.values()) {
    const matches = entries.filter(entry => TARGET_CONCEPTS.has(entry.conceptId) && questionId(entry.question) === spec.id);
    if (matches.length !== 1) throw new Error(`${spec.id} resolved to ${matches.length} target records; expected one.`);
    const entry = matches[0];
    const headQuestion = headEntries.find(candidate => candidate.conceptId === entry.conceptId && questionId(candidate.question) === spec.id)?.question;
    const baseline = previousChanges.get(spec.id)?.before || (headQuestion ? snapshotQuestion(headQuestion) : null);
    if (!baseline) throw new Error(`${spec.id} has no trustworthy pre-curation baseline.`);
    baselines.set(spec.id, baseline);
    applyPatch(entry.question, spec.patch);
    entry.question.sourceCurationPhase = PHASE;
    entry.question.sourceHash = sourceHash(entry.question);
    for (const occurrence of entry.question.sourceOccurrences || []) {
      occurrence.sourceHash = entry.question.sourceHash;
      occurrence.sourceCurationPhase = PHASE;
    }
    spec.afterQuestion = snapshotQuestion(entry.question);
    changes.push({
      id: spec.id,
      conceptId: entry.conceptId,
      pool: entry.pool,
      rules: [...spec.rules].sort(),
      reason: spec.reasons.join(" "),
      authorizedFields: [...new Set([...Object.keys(spec.patch).filter(key => key !== "answer"), ...(spec.patch.answer != null ? ["aHash"] : [])])].sort(),
      before: snapshotQuestion(baseline),
      after: snapshotQuestion(entry.question)
    });
  }

  const afterEntries = questionEntries(library);
  const changedIds = [];
  for (const entry of afterEntries) {
    const id = questionId(entry.question);
    if (stableStringify(entry.question) !== beforeLibrarySnapshot.get(id)) changedIds.push(id);
  }
  const unexpected = changedIds.filter(id => !fixes.has(id));
  if (unexpected.length) throw new Error(`Questions changed outside authorization: ${unexpected.join(", ")}`);
  // Idempotent reruns may begin with every authorized question already at its
  // intended final state. applyPatch above verifies the full final state; this
  // comparison exists only to reject drift outside the authorized ID set.

  library.libraryVersion = String(library.libraryVersion).includes(PHASE) ? library.libraryVersion : `${library.libraryVersion}-${PHASE}`;
  library.sourceCurationPhase = PHASE;
  library.sourceGeneratedAt = GENERATED_AT;
  library.generatedAt = GENERATED_AT;
  Object.assign(library.registry, {
    generatedAt: GENERATED_AT,
    curationPhase: PHASE,
    curationSummary: "Authorized Supply, Demand, and Market Equilibrium audit remediation: differentiated stems, tier-appropriate reasoning, plausible distractors, graphRequired metadata, and contextual feedback.",
    libraryVersion: library.libraryVersion,
    canonicalQuestionCount: library.canonicalQuestionCount
  });
  delete library.librarySha256;
  delete library.registry.librarySha256;
  library.librarySha256 = sha256(stableStringify(library));
  library.registry.librarySha256 = library.librarySha256;
  const manifest = {
    assetCount: library.assetInventory.length,
    assets: library.assetInventory,
    conceptCount: library.conceptCount,
    canonicalQuestionCount: library.canonicalQuestionCount,
    libraryVersion: library.libraryVersion,
    librarySha256: library.librarySha256,
    generatedAt: GENERATED_AT
  };
  const conceptReviewManifest = JSON.parse(fs.readFileSync(CONCEPT_REVIEW_MANIFEST_PATH, "utf8"));
  conceptReviewManifest.generatedAt = GENERATED_AT;
  conceptReviewManifest.composerLibraryVersion = library.libraryVersion;
  const authorization = {
    phase: PHASE,
    generatedAt: GENERATED_AT,
    sourceAudit: path.relative(ROOT, BASELINE_AUDIT_PATH).replaceAll("\\", "/"),
    scope: {
      concepts: [...TARGET_CONCEPTS],
      authoritativeFindingCounts: counts,
      authorizedQuestionCount: fixes.size,
      authorizedQuestionIds: [...fixes.keys()].sort(),
      protectedOutOfScopeQuestionIds: ["43192"]
    },
    controls: {
      onlyAuditFindingIdsAuthorized: true,
      answerKeyChangesRequireExplicitPatchAnswer: true,
      baselineEvidenceIsImmutableAcrossReruns: true,
      graphAssetsMayNotChange: true,
      auditorRulesAndThresholdsMayNotChange: true
    },
    changes: changes.map(change => ({ id: change.id, conceptId: change.conceptId, pool: change.pool, rules: change.rules, reason: change.reason, authorizedFields: change.authorizedFields, before: change.before, intendedAfter: change.after }))
  };
  const record = {
    phase: PHASE,
    generatedAt: GENERATED_AT,
    scope: { concepts: [...TARGET_CONCEPTS], changedQuestionCount: changes.length },
    libraryVersion: library.libraryVersion,
    librarySha256: library.librarySha256,
    baselineAuditSha256: sha256(`${JSON.stringify(baselineAudit, null, 2)}\n`),
    authorizationSha256: sha256(`${JSON.stringify(authorization, null, 2)}\n`),
    changes
  };
  return {
    baselineAudit,
    outputs: [
      [LIBRARY_PATH, `window.MQ_COMPOSER_LIBRARY=${JSON.stringify(library)};\n`],
      [REGISTRY_PATH, `${JSON.stringify(library.registry, null, 2)}\n`],
      [MANIFEST_PATH, `${JSON.stringify(manifest, null, 2)}\n`],
      [CONCEPT_REVIEW_MANIFEST_PATH, `${JSON.stringify(conceptReviewManifest, null, 2)}\n`],
      [MARKET_GATE_AUTHOR_PATH, renderMarketGateAuthor(baselines)],
      [AUTHORIZATION_PATH, `${JSON.stringify(authorization, null, 2)}\n`],
      [CHANGE_PATH, `${JSON.stringify(record, null, 2)}\n`]
    ],
    summary: {
      phase: PHASE,
      changedQuestionCount: changes.length,
      reviewQuestionCount: reviewIds.size,
      graphRequiredCount: graphIds.length,
      librarySha256: library.librarySha256
    }
  };
}

const generated = render();
if (process.argv.includes("--write")) {
  fs.mkdirSync(ARTIFACT_DIR, { recursive: true });
  if (!fs.existsSync(BASELINE_AUDIT_PATH)) fs.writeFileSync(BASELINE_AUDIT_PATH, `${JSON.stringify(generated.baselineAudit, null, 2)}\n`, "utf8");
  for (const [file, contents] of generated.outputs) fs.writeFileSync(file, contents, "utf8");
  console.log(JSON.stringify({ status: "WROTE", ...generated.summary }, null, 2));
} else {
  console.log(JSON.stringify({ status: "DRY_RUN", ...generated.summary }, null, 2));
}
