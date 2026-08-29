import { authoredRow, finalizeQuestions } from "./remaining_micro_question_pool_helpers.mjs";
import { applyDifficultyCalibration } from "./saving_investment_loanable_funds_difficulty_calibration.mjs";

export const PHASE = "phase-saving-investment-loanable-funds-question-pool-v1";
export const SOURCE_VERSION = "saving-investment-loanable-funds-production-v2-difficulty-calibration";
export const ID_FIRST = 43168;
export const ID_LAST = 43327;
export const CONCEPT_ID = "saving-investment-and-loanable-funds";

export const OBJECTIVES = Object.freeze({
  SLF1: "Saving Versus Investment",
  SLF2: "Private, Public, and National Saving",
  SLF3: "Saving and Investment in a Closed Economy",
  SLF4: "Loanable-Funds Equilibrium",
  SLF5: "Movement Along Versus Shift",
  SLF6: "Changes in Saving",
  SLF7: "Investment Demand",
  SLF8: "Government Deficits and Crowding Out",
  SLF9: "Simultaneous Shifts",
  SLF10: "Investment and Capital Formation"
});

export const OBJECTIVE_COUNTS = Object.freeze({
  SLF1: 16, SLF2: 19, SLF3: 14, SLF4: 19, SLF5: 13,
  SLF6: 19, SLF7: 18, SLF8: 19, SLF9: 15, SLF10: 8
});

export const SUBTOPICS = Object.freeze({
  SLF1: "saving-versus-investment",
  SLF2: "private-public-national-saving",
  SLF3: "closed-economy-saving-investment-identity",
  SLF4: "loanable-funds-equilibrium",
  SLF5: "loanable-funds-movement-versus-shift",
  SLF6: "changes-in-saving",
  SLF7: "investment-demand",
  SLF8: "deficits-and-crowding-out",
  SLF9: "simultaneous-loanable-funds-shifts",
  SLF10: "investment-capital-formation"
});

export const GRAPH_ASSETS = Object.freeze({
  "LOANABLE-01.webp": {
    scenario: "Baseline loanable-funds equilibrium",
    imageAlt: "Saving supply S0 and investment demand D0 intersect at point A, a real interest rate of 8 percent and 140 units of loanable funds.",
    graphDescription: "The vertical axis is the real interest rate and the horizontal axis is the quantity of loanable funds. Upward-sloping S0 (saving) and downward-sloping D0 (investment) intersect at A: Q = 140 and r = 8 percent."
  },
  "LOANABLE-02.webp": {
    scenario: "Increase in saving",
    imageAlt: "Saving supply shifts right from S0 to S1, moving equilibrium from A at 80 and 8 percent to B at 120 and 6 percent.",
    graphDescription: "Investment demand D0 is fixed. Saving supply shifts right from solid S0 to dashed S1. Equilibrium moves from A (Q = 80, r = 8 percent) to B (Q = 120, r = 6 percent)."
  },
  "LOANABLE-03.webp": {
    scenario: "Decrease in saving",
    imageAlt: "Saving supply shifts left from S0 to S1, moving equilibrium from A at 100 and 7 percent to B at 80 and 8 percent.",
    graphDescription: "Investment demand D0 is fixed. Saving supply shifts left from solid S0 to dashed S1. Equilibrium moves from A (Q = 100, r = 7 percent) to B (Q = 80, r = 8 percent)."
  },
  "LOANABLE-04.webp": {
    scenario: "Increase in investment demand",
    imageAlt: "Investment demand shifts right from D0 to D1, moving equilibrium from A at 80 and 5 percent to B at 120 and 7 percent.",
    graphDescription: "Saving supply S0 is fixed. Investment demand shifts right from solid D0 to dashed D1. Equilibrium moves from A (Q = 80, r = 5 percent) to B (Q = 120, r = 7 percent)."
  },
  "LOANABLE-05.webp": {
    scenario: "Decrease in investment demand",
    imageAlt: "Investment demand shifts left from D0 to D1, moving equilibrium from A at 80 and 5 percent to B at 60 and 4 percent.",
    graphDescription: "Saving supply S0 is fixed. Investment demand shifts left from solid D0 to dashed D1. Equilibrium moves from A (Q = 80, r = 5 percent) to B (Q = 60, r = 4 percent)."
  },
  "LOANABLE-06.webp": {
    scenario: "Deficit-driven decrease in national saving",
    imageAlt: "Saving supply shifts left from S0 to S1, moving equilibrium from A at 100 and 6 percent to B at 60 and 8 percent.",
    graphDescription: "Investment demand D0 is fixed. Saving supply shifts left from solid S0 to dashed S1. Equilibrium moves from A (Q = 100, r = 6 percent) to B (Q = 60, r = 8 percent), a loanable-funds crowding-out case."
  },
  "LOANABLE-07.webp": {
    scenario: "Increase in national saving",
    imageAlt: "Saving supply shifts right from S0 to S1, moving equilibrium from A at 60 and 8 percent to B at 100 and 6 percent.",
    graphDescription: "Investment demand D0 is fixed. Saving supply shifts right from solid S0 to dashed S1. Equilibrium moves from A (Q = 60, r = 8 percent) to B (Q = 100, r = 6 percent)."
  },
  "LOANABLE-08.webp": {
    scenario: "Saving and investment demand both increase",
    imageAlt: "Saving supply and investment demand both shift right, moving equilibrium from A at 40 and 6 percent to B at 80 and 6 percent.",
    graphDescription: "Solid S0 and D0 intersect at A (Q = 40, r = 6 percent). Dashed S1 and D1 are both to the right and intersect at B (Q = 80, r = 6 percent). Quantity rises by 40 while this graph holds the real interest rate unchanged."
  }
});

export const QUARANTINED_ASSETS = Object.freeze({
  "LOANABLE-09.webp": "A and B pair S0 with D1 and S1 with D0 rather than the old S0/D0 and new S1/D1 intersections.",
  "LOANABLE-10.webp": "A and B pair S0 with D1 and S1 with D0 rather than the old S0/D0 and new S1/D1 intersections."
});

const skills = Object.freeze({
  SLF1: "distinguish_saving_and_investment",
  SLF2: "calculate_national_saving",
  SLF3: "apply_closed_economy_saving_identity",
  SLF4: "analyze_loanable_funds_equilibrium",
  SLF5: "distinguish_movement_from_shift_loanable_funds",
  SLF6: "analyze_saving_supply_shift",
  SLF7: "analyze_investment_demand_shift",
  SLF8: "trace_deficit_crowding_out",
  SLF9: "analyze_simultaneous_loanable_funds_shifts",
  SLF10: "connect_investment_to_capital_formation"
});

const rows = [];
function add(objective, q, answer, distractors, feedback, type = "application", extra = {}) {
  rows.push(authoredRow(q, answer, distractors, objective, type, skills[objective], feedback, SUBTOPICS[objective], extra));
}
function graph(objective, asset, q, answer, distractors, feedback, type = "graph_interpretation") {
  add(objective, `Refer to the graph above. ${q}`, answer, distractors, feedback, type, { asset });
}

// SLF1 — 16
add("SLF1", "Which action is saving in the macroeconomic sense?", "Setting aside current income for future use", ["Buying newly produced factory equipment", "Building a newly constructed apartment", "Adding unsold goods to business inventories"], "Saving is current income not used for consumption; the other choices are forms of new macroeconomic investment.", "definition");
add("SLF1", "Which purchase is counted as new macroeconomic investment in GDP?", "A firm buys newly produced machinery", ["A household buys an existing corporate share", "An investor buys an existing government bond", "A collector buys a previously owned painting"], "New production equipment expands the capital stock and is GDP investment; secondary financial and used-asset trades do not.", "definition");
add("SLF1", "An investor buys 100 shares from another investor. How is the transaction classified?", "A financial-asset purchase, not new GDP investment", ["New business fixed investment in current GDP", "New residential investment in current GDP", "An increase in current business inventories"], "Ownership of an existing share changes hands, but the transaction does not itself create new capital included in GDP investment.");
add("SLF1", "A construction company completes a new warehouse for a retailer. What macroeconomic category applies?", "New investment in a structure", ["Household saving without investment", "A transfer of an existing asset", "Government consumption spending"], "A newly produced warehouse is a structure added to the capital stock, so it is macroeconomic investment.");
add("SLF1", "Why does construction of a new home count as investment in GDP?", "It creates a new long-lived residential asset", ["Every household purchase is classified as investment", "The buyer must have purchased an existing stock", "Residential services are excluded from production"], "GDP conventions treat new residential construction as investment because it adds a durable structure that yields housing services.");
add("SLF1", "When a firm produces goods that remain unsold at year-end, how are they recorded?", "As inventory investment", ["As household saving", "As a financial transfer", "As used-goods consumption"], "Unsold current production adds to inventories, which are included in macroeconomic investment for the period.");
add("SLF1", "A household deposits part of its paycheck in a bank. What broad role can that saving play?", "It can supply funds that the bank channels to borrowers", ["It automatically becomes the household's GDP investment", "It directly creates an equal quantity of physical capital", "It removes the funds permanently from the financial system"], "Financial intermediaries can channel saving toward borrowers who finance investment, without making the deposit itself physical investment.");
add("SLF1", "A corporation sells newly issued bonds to finance a factory. What does the bond market do in this example?", "Channels savers' funds toward a borrowing firm", ["Converts every bond purchase into household consumption", "Counts the existing bond itself as physical capital", "Eliminates the need for saving before investment"], "The bond market connects savers and borrowers; the factory, not the financial claim, is the new productive capital.");
add("SLF1", "Which statement correctly distinguishes financial investment from macroeconomic investment?", "Financial assets can change ownership without creating new capital", ["Every financial-asset trade adds equally to current GDP investment", "Macroeconomic investment means purchasing only stocks and bonds", "New equipment is saving rather than macroeconomic investment"], "Trading an existing claim need not add to current production, while new equipment, structures, inventories, and qualifying intellectual property do.", "interpretation");
add("SLF1", "A software firm develops a new commercial platform for long-term use. Under GDP conventions, what may it represent?", "Investment in intellectual property products", ["A transfer payment to software users", "A purchase of an existing financial claim", "Household consumption of a used asset"], "Qualifying research and software development can be investment in intellectual property because it creates a productive asset.");
add("SLF1", "How does greater national saving make more investment possible?", "It makes more resources available through the financial system", ["It guarantees every proposed project will be profitable", "It requires each saver to build a specific machine", "It makes the real interest rate irrelevant"], "Saving frees resources from current consumption and the financial system allocates funds among potential investment projects.");
add("SLF1", "A buyer purchases an existing bond from another household. What is the direct GDP effect of that trade?", "No new macroeconomic investment is created by the trade", ["Business fixed investment rises by the bond's price", "Residential investment rises by the bond's price", "Inventory investment rises by the bond's face value"], "The secondary-market transaction transfers a financial claim; it does not itself produce a new structure, machine, inventory, or intellectual property asset.");
add("SLF1", "Which institution is acting as a financial intermediary?", "A bank accepts deposits and makes business loans", ["A factory converts steel into new machinery", "A retailer sells newly produced consumer goods", "A household consumes services from an existing home"], "A financial intermediary gathers funds from savers and supplies financing to borrowers rather than producing the capital good itself.");
add("SLF1", "Why is the statement 'each saver finances one identical investment project' incorrect?", "Financial markets pool funds and allocate them among borrowers", ["National saving is unrelated to available financing", "Only governments can channel funds to firms", "Every saver must purchase newly produced equipment"], "The aggregate saving-investment link is mediated through institutions and markets, not one-to-one matching of people and projects.", "interpretation");
add("SLF1", "How does household saving connect to later capital formation?", "Financial channels can direct saved funds to investment projects", ["Saving is itself always a newly produced capital good", "Saved funds must remain idle outside all markets", "Capital formation occurs only through household consumption"], "The financial system connects the repaired saving idea to firms and households that borrow for new capital investment.", "bridge");
add("SLF1", "Which activity is macroeconomic investment rather than a financial-asset trade?", "A manufacturer installs new production equipment", ["An investor buys an existing stock", "A saver buys an existing bond", "A collector resells an old sculpture"], "New production equipment adds to the capital stock; the other choices transfer ownership of existing assets.", "application");

// SLF2 — 19
add("SLF2", "With T defined as net tax revenue, which expression gives private saving?", "Y − T − C", ["T − G", "Y − C − G", "C + G − Y"], "Private saving is disposable income, Y minus net taxes, less consumption C.", "definition");
add("SLF2", "With T defined as net tax revenue and G as government purchases, which expression gives public saving?", "T − G", ["Y − T − C", "Y − C − G", "G − T + C"], "Under the stated textbook convention, public saving equals net tax revenue minus government purchases.", "definition");
add("SLF2", "Which expression gives national saving in the stated closed-economy accounting model?", "Y − C − G", ["Y − T − C", "T − G", "C + I + G"], "Adding private saving Y − T − C and public saving T − G cancels T, leaving Y − C − G.", "definition");
add("SLF2", "Income is $1,000, net taxes are $180, and consumption is $650. What is private saving?", "$170", ["$180", "$350", "$530"], "Private saving equals Y − T − C, so $1,000 − $180 − $650 = $170.", "calculation");
add("SLF2", "Net tax revenue is $240 and government purchases are $290. What is public saving?", "−$50", ["+$50", "$240", "$530"], "Public saving is T − G, so $240 − $290 = −$50 under the stated net-tax convention.", "calculation");
add("SLF2", "Private saving is $180 and public saving is −$40. What is national saving?", "$140", ["$40", "$180", "$220"], "National saving is the sum of private and public saving: $180 + (−$40) = $140.", "calculation");
add("SLF2", "Income is $1,200, consumption is $760, and government purchases are $260. What is national saving?", "$180", ["$260", "$440", "$700"], "National saving equals Y − C − G, so $1,200 − $760 − $260 = $180.", "calculation");
add("SLF2", "Income is $900, net taxes are $150, consumption is $600, and government purchases are $180. What are private and public saving?", "$150 and −$30", ["$120 and +$30", "$300 and −$30", "$150 and +$180"], "Private saving is $900 − $150 − $600 = $150; public saving is $150 − $180 = −$30.", "calculation");
add("SLF2", "Using the same economy with private saving of $150 and public saving of −$30, what is national saving?", "$120", ["$30", "$150", "$180"], "Adding the two components gives national saving of $150 − $30 = $120.", "calculation");
add("SLF2", "If net taxes rise by $20 while income, consumption, and government purchases stay fixed, what happens to national saving?", "It remains unchanged", ["It rises by $20", "It falls by $20", "It becomes equal to net taxes"], "Private saving falls by $20 while public saving rises by $20, so their sum and Y − C − G are unchanged.", "integration");
add("SLF2", "If government purchases rise by $30 with income and consumption fixed, what happens to national saving?", "It falls by $30", ["It rises by $30", "It remains unchanged", "It falls by net taxes"], "From S = Y − C − G, a $30 increase in G lowers national saving by $30, other terms fixed.");
add("SLF2", "Consumption falls by $25 while income and government purchases remain fixed. What happens to national saving?", "It rises by $25", ["It falls by $25", "It remains unchanged", "It rises by net taxes"], "Because S = Y − C − G, lower consumption leaves $25 more national saving.");
add("SLF2", "Income rises from $1,400 to $1,500 while consumption and government purchases are unchanged. How does national saving change?", "It rises by $100", ["It falls by $100", "It stays fixed", "It rises by $1,500"], "Holding C and G fixed, the $100 increase in Y raises Y − C − G by $100.", "calculation");
add("SLF2", "A table lists total federal revenues and total outlays including transfers and interest. What does revenues minus outlays measure directly?", "The federal budget balance", ["Public saving T − G under every definition", "Private saving Y − T − C", "National saving Y − C − G"], "Total revenues minus total outlays is the budget balance; it should not be relabeled T − G unless the specified components match net taxes and purchases.", "interpretation");
add("SLF2", "Why must a saving question define T before using Y − T − C or T − G?", "T must consistently mean net taxes in both expressions", ["T must always mean total federal debt", "T must include every government outlay", "T must equal household consumption"], "The private- and public-saving formulas share T, so a consistent net-tax definition prevents mixing textbook saving with total-budget accounting.", "interpretation");
add("SLF2", "Net taxes are $320 and government purchases are $280. What fiscal saving contribution enters national saving?", "+$40 of public saving", ["−$40 of private saving", "+$280 of public saving", "$600 of national saving"], "Public saving is T − G = $320 − $280 = +$40, which is one component of national saving.", "calculation");
add("SLF2", "Private saving falls by $15 while public saving rises by $35. What happens to national saving?", "It rises by $20", ["It falls by $20", "It rises by $50", "It remains unchanged"], "National saving changes by the sum of component changes: −$15 + $35 = +$20.", "calculation");
add("SLF2", "How does positive public saving connect the accounting identities to the loanable-funds market?", "It adds to national saving, the supply of loanable funds", ["It shifts investment demand by definition", "It makes private saving equal zero", "It converts government purchases into consumption"], "Public saving joins private saving to form national saving, which supplies funds in the closed-economy loanable-funds model.", "bridge");
add("SLF2", "Net tax revenue is $500 and government purchases are $450. What is public saving?", "+$50", ["−$50", "$450", "$950"], "Using the defined quantities, T − G equals $500 − $450 = +$50.", "calculation");

// SLF3 — 14
add("SLF3", "In a closed economy, which expenditure identity omits net exports?", "Y = C + I + G", ["Y = C + G − I", "Y = T + I + G", "Y = C + I + NX"], "With no international sector in the model, output is allocated to consumption, investment, and government purchases.", "definition");
add("SLF3", "How does the closed-economy identity imply I = Y − C − G?", "Subtract consumption and government purchases from both sides", ["Add net exports to both sides", "Set private saving equal to taxes", "Replace investment with consumption"], "Rearranging Y = C + I + G yields I = Y − C − G.", "interpretation");
add("SLF3", "Why does national saving equal investment in the textbook closed-economy model?", "Both equal Y − C − G", ["Every household finances one firm directly", "Government purchases always equal taxes", "Consumption must equal private saving"], "National saving and investment are each equal to output not used for consumption or government purchases in this closed-economy accounting setup.", "interpretation");
add("SLF3", "In a closed economy, Y is $1,500, C is $900, and G is $350. What are saving and investment?", "Both are $250", ["Both are $350", "Saving is $600 and investment is $250", "Saving is $250 and investment is $900"], "Y − C − G equals $250; in the closed-economy model both national saving and investment equal that amount.", "calculation");
add("SLF3", "National saving is $420 in a closed economy. What aggregate investment amount is consistent with the identity?", "$420", ["$0", "$210", "$840"], "The closed-economy aggregate identity requires S = I, so investment is $420.", "calculation");
add("SLF3", "In a closed economy, a student says each household's saving must equal one firm's investment. What is the correction?", "S = I is an aggregate identity mediated by the financial system", ["Each saver must buy one physical machine", "Only public saving can finance investment", "The equality applies only to individual bank accounts"], "The equality concerns economy-wide totals; intermediaries and markets pool saving and allocate financing across borrowers.", "interpretation");
add("SLF3", "Consumption rises by $40 in a closed economy while output and government purchases are fixed. What happens to saving and investment?", "Both fall by $40", ["Both rise by $40", "Saving falls but investment rises", "Neither aggregate changes"], "The increase in C reduces Y − C − G by $40, lowering both national saving and investment in the closed-economy identity.");
add("SLF3", "Government purchases fall by $25 with output and consumption fixed in a closed economy. What follows?", "Saving and investment rise by $25", ["Saving and investment fall by $25", "Only private saving changes", "Investment becomes unrelated to saving"], "Lower G raises Y − C − G by $25, so both aggregate national saving and investment rise.");
add("SLF3", "Which claim improperly extends the closed-economy identity?", "Domestic saving must equal domestic investment in every open economy", ["National saving equals Y − C − G in the stated closed model", "The financial system connects savers and borrowers", "Aggregate saving can finance investment through markets"], "Open economies can finance domestic investment with international flows, so the domestic S = I statement requires the closed-economy qualifier.", "interpretation");
add("SLF3", "Output is $2,000, consumption is $1,250, and government purchases are $450 in a closed economy. What is investment?", "$300", ["$450", "$750", "$1,550"], "Rearranging the closed-economy expenditure identity gives I = $2,000 − $1,250 − $450 = $300.", "calculation");
add("SLF3", "Private saving is $360 and public saving is −$60 in a closed economy. What investment level is implied?", "$300", ["$60", "$360", "$420"], "National saving is $360 − $60 = $300, and closed-economy investment equals national saving.", "calculation");
add("SLF3", "What role does the financial system play when closed-economy saving equals investment?", "It reallocates aggregate saving among borrowers and projects", ["It requires identical saving from every household", "It eliminates all differences in project profitability", "It turns every security trade into new capital"], "Intermediation explains how economy-wide saving can finance investment without one-to-one matching between individual savers and firms.", "interpretation");
add("SLF3", "How does the accounting identity connect to the loanable-funds model?", "National saving supplies funds that finance aggregate investment", ["Consumption becomes the demand for loanable funds", "Government purchases become the real interest rate", "Every saver chooses the same investment project"], "The closed-economy identity provides the aggregate connection; the loanable-funds market explains coordination through the real interest rate.", "bridge");
add("SLF3", "In the closed-economy model, what aggregate relationship connects national saving and investment?", "National saving equals investment", ["Private saving equals consumption", "Public saving equals income", "Investment equals government purchases"], "Both national saving and investment equal Y − C − G in the specified closed-economy model.", "definition");

// SLF4 — 19 (10 graph)
graph("SLF4", "LOANABLE-01.webp", "What real interest rate clears the market at point A?", "8 percent", ["6 percent", "10 percent", "14 percent"], "S0 and D0 intersect at A on the 8 percent horizontal guide, so planned saving equals planned investment there.", "graph_calculation");
graph("SLF4", "LOANABLE-01.webp", "What quantity of loanable funds is exchanged at equilibrium?", "140 units", ["70 units", "210 units", "280 units"], "The vertical guide from A reaches 140 on the quantity axis, the equilibrium amount supplied and demanded.", "graph_calculation");
graph("SLF4", "LOANABLE-01.webp", "Which labeled curve represents national saving?", "S0, the upward-sloping red curve", ["D0, the downward-sloping blue curve", "The horizontal guide through 8 percent", "The vertical guide through 140 units"], "The graph labels the upward-sloping supply of loanable funds as S0 (saving).", "graph_interpretation");
graph("SLF4", "LOANABLE-01.webp", "Which labeled curve represents desired investment?", "D0, the downward-sloping blue curve", ["S0, the upward-sloping red curve", "The horizontal guide through 8 percent", "The vertical guide through 140 units"], "The graph labels the downward-sloping demand for loanable funds as D0 (investment).", "graph_interpretation");
graph("SLF4", "LOANABLE-01.webp", "At a real interest rate above 8 percent, which comparison does the graph imply?", "Saving supplied exceeds investment demanded", ["Investment demanded exceeds saving supplied", "Saving and investment remain equal", "Both curves shift to the right"], "Above A, the upward S0 curve lies to the right of D0, so the quantity supplied exceeds the quantity demanded.", "graph_integration");
graph("SLF4", "LOANABLE-01.webp", "At a real interest rate below 8 percent, which imbalance appears?", "Investment demanded exceeds saving supplied", ["Saving supplied exceeds investment demanded", "Saving and investment remain equal", "Both curves shift to the left"], "Below A, D0 gives a larger quantity than S0, creating excess demand for loanable funds.", "graph_integration");
graph("SLF4", "LOANABLE-01.webp", "What does point A establish about planned saving and investment?", "Their aggregate quantities are equal at 140", ["Saving exceeds investment by 140", "Investment exceeds saving by 8 percent", "Both quantities are zero at equilibrium"], "Point A is the S0-D0 intersection, so the two planned quantities are equal at 140 units.", "graph_interpretation");
graph("SLF4", "LOANABLE-01.webp", "If the rate moves from 8 percent to 10 percent without any curve shift, what pattern is visible?", "More saving supplied and less investment demanded", ["Less saving supplied and more investment demanded", "Both saving and investment increase", "Both curves shift outward"], "Moving upward from A travels along both curves: quantity supplied rises while quantity demanded falls.", "graph_integration");
graph("SLF4", "LOANABLE-01.webp", "Which axis shows the price that coordinates this market?", "The vertical real-interest-rate axis", ["The horizontal quantity axis", "The S0 curve label", "The point A label"], "The real interest rate is the market price; the horizontal axis measures the quantity of funds.", "graph_interpretation");
graph("SLF4", "LOANABLE-01.webp", "Which statement uses both coordinates of the marked equilibrium?", "A is 140 units at an 8 percent real rate", ["A is 8 units at a 140 percent rate", "A is 210 units at a 10 percent rate", "A is 70 units at a 6 percent rate"], "The guides from A identify Q = 140 on the horizontal axis and r = 8 percent on the vertical axis.", "graph_calculation");
add("SLF4", "What supplies loanable funds in the closed-economy model?", "National saving", ["Household consumption", "Government purchases", "Desired investment"], "Private and public saving combine into national saving, the source of funds offered in this market.", "definition");
add("SLF4", "What creates demand in the loanable-funds market?", "Desired investment spending", ["Current household consumption", "The stock of federal debt", "Net tax revenue alone"], "Firms and households demand funds to finance investment projects whose expected returns justify borrowing.", "definition");
add("SLF4", "Why does the supply of loanable funds slope upward?", "Higher real returns encourage more saving", ["Higher rates make every investment project profitable", "Lower rates increase the reward to saving", "Saving is fixed at every possible rate"], "A higher real return rewards postponing consumption, increasing the quantity of funds supplied along the saving curve.", "interpretation");
add("SLF4", "Why does investment demand slope downward?", "Fewer projects are profitable at higher real borrowing costs", ["More projects pass the profitability test at higher rates", "Saving automatically falls whenever investment rises", "The real interest rate is unrelated to project cost"], "As the real cost of financing rises, marginal investment projects no longer earn enough to be undertaken.", "interpretation");
add("SLF4", "What adjustment is expected when the real interest rate is below equilibrium?", "Excess demand puts upward pressure on the rate", ["Excess supply puts downward pressure on the rate", "Both curves permanently shift left", "National saving becomes zero"], "Below equilibrium, desired borrowing exceeds funds supplied, creating pressure for the real interest rate to rise.");
add("SLF4", "What adjustment is expected when the real interest rate is above equilibrium?", "Excess supply puts downward pressure on the rate", ["Excess demand puts upward pressure on the rate", "Investment demand shifts right automatically", "Public saving becomes negative"], "Above equilibrium, savers offer more funds than investors want, creating downward pressure on the real interest rate.");
add("SLF4", "How does the equilibrium real interest rate connect saving and investment decisions?", "It makes the quantities supplied and demanded equal", ["It makes every investment project identical", "It forces each household to lend directly", "It fixes national saving independently of behavior"], "The equilibrium rate is the price at which planned national saving matches desired investment financing.", "bridge");
add("SLF4", "Which side of the loanable-funds market represents saving?", "The supply side", ["The demand side", "The price axis", "The investment schedule"], "National saving supplies the funds available to borrowers in the closed-economy model.", "definition");
add("SLF4", "A student labels desired investment as the supply of loanable funds. What correction is needed?", "Investment is demand; national saving is supply", ["Investment is supply; consumption is demand", "Both investment and saving are demand", "Both investment and saving are supply"], "Borrowers demand funds to finance desired investment, while national saving provides the funds supplied.", "interpretation");

// SLF5 — 13
add("SLF5", "A higher real interest rate by itself causes what change in saving?", "A movement upward along the saving curve", ["A rightward shift of the saving curve", "A leftward shift of investment demand", "A movement downward along investment demand"], "The real interest rate is on the vertical axis, so its change alters quantity supplied along an unchanged saving curve.");
add("SLF5", "A lower real interest rate by itself causes what change in investment?", "A movement down along investment demand", ["A rightward shift of investment demand", "A leftward shift of saving supply", "A movement up along saving supply"], "A rate change changes the quantity of investment demanded along the existing curve; it does not shift that curve.");
add("SLF5", "Households become more willing to save at every real interest rate. What changes?", "The saving curve shifts right", ["There is only movement along saving", "Investment demand shifts left", "The real-interest-rate axis shifts"], "Greater willingness to save is a non-interest determinant, raising supply at each rate and shifting the curve right.");
add("SLF5", "New technology raises expected returns on capital at every real interest rate. What changes?", "Investment demand shifts right", ["There is only movement along investment demand", "Saving supply shifts left", "The quantity axis shifts"], "Higher project profitability is a non-interest determinant of investment demand, so the entire curve shifts right.");
add("SLF5", "Which event causes movement along both loanable-funds curves rather than shifting either one?", "A change in the real interest rate", ["A change in household saving preferences", "A change in expected business profitability", "A change in public saving"], "Because the real interest rate is the market price on the vertical axis, its change alters quantities along existing curves.", "definition");
add("SLF5", "A saving tax incentive increases funds supplied at every real rate. How should it be shown?", "As a rightward saving-supply shift", ["As movement up along saving supply", "As a leftward investment-demand shift", "As movement down along investment demand"], "The incentive changes saving behavior independently of the current rate, so supply shifts rather than showing movement along it.");
add("SLF5", "Businesses become pessimistic about future sales. What is the correct diagrammatic treatment?", "Investment demand shifts left", ["Investment demand moves downward along itself", "Saving supply shifts right", "Saving supply moves upward along itself"], "Weaker expected sales reduce project profitability at each real rate, shifting investment demand left.");
add("SLF5", "After saving supply shifts right, the equilibrium rate falls. How should the resulting investment change be described?", "A movement down along investment demand", ["A rightward shift of investment demand", "A leftward shift of investment demand", "A movement up along saving supply"], "The original shock shifts saving; the lower equilibrium rate then increases investment as movement along unchanged demand.", "integration");
add("SLF5", "After investment demand shifts right, the equilibrium rate rises. How should the saving response be described?", "A movement up along the saving curve", ["A rightward shift of saving supply", "A leftward shift of saving supply", "A movement down along investment demand"], "The demand shock raises the rate, which increases the quantity saved along the unchanged supply curve.", "integration");
add("SLF5", "Which wording contains the standard movement-versus-shift error?", "A higher real rate shifts investment demand left", ["A higher real rate lowers investment along demand", "Greater expected profit shifts investment demand right", "More household saving shifts supply right"], "A higher rate changes the quantity of investment demanded; it does not change investment demand at every rate.", "interpretation");
add("SLF5", "The quantity of saving rises after the rate increases, with preferences unchanged. What occurred?", "Movement along the saving curve", ["A saving-supply shift", "An investment-demand shift", "A change in public saving"], "With no non-interest determinant changing, the rate increase explains a larger quantity supplied along the same curve.");
add("SLF5", "How does a curve shift lead to a movement on the other side of the market?", "The shift changes equilibrium price, altering quantity on the unchanged curve", ["Both curves must shift by equal distances", "The unchanged curve becomes vertical", "The quantity axis determines the new price"], "A non-interest shock shifts one curve; the resulting rate change causes movement along the other curve.", "bridge");
add("SLF5", "If only the real interest rate rises, does the saving curve shift?", "No, quantity saved rises along the curve", ["Yes, saving supply shifts right", "Yes, saving supply shifts left", "No, quantity saved must fall"], "A change in the market price causes movement along the saving curve, not a shift.", "interpretation");

// SLF6 — 19 (14 graph)
for (const item of [
  ["LOANABLE-02.webp", "After saving increases, what real interest rate is shown at B?", "6 percent", ["4 percent", "8 percent", "10 percent"], "The new S1-D0 intersection is point B at a 6 percent real interest rate."],
  ["LOANABLE-02.webp", "After saving increases, what equilibrium quantity is shown at B?", "120 units", ["40 units", "80 units", "160 units"], "Point B projects to 120 units on the quantity axis after saving increases."],
  ["LOANABLE-02.webp", "How does the equilibrium change from A to B?", "The rate falls and quantity rises", ["The rate rises and quantity falls", "Both rate and quantity rise", "Both rate and quantity fall"], "The graph moves from A (80, 8 percent) to B (120, 6 percent)."],
  ["LOANABLE-02.webp", "Which curve shifts between the two equilibria?", "Saving supply shifts right from S0 to S1", ["Saving supply shifts left from S1 to S0", "Investment demand shifts right from D0", "Investment demand shifts left from D0"], "D0 remains fixed while the saving curve moves right from solid S0 to dashed S1."],
  ["LOANABLE-02.webp", "Which event is consistent with the displayed shift?", "Households save more at every real rate", ["Expected investment profitability rises", "Households save less at every real rate", "The current real rate rises by itself"], "The displayed rightward supply shift means more national saving is offered at each real interest rate."],
  ["LOANABLE-02.webp", "How much does the saving increase raise equilibrium quantity?", "40 units", ["20 units", "80 units", "120 units"], "The quantity rises from 80 at A to 120 at B, an increase of 40 units."],
  ["LOANABLE-02.webp", "Which point is the equilibrium after saving increases?", "Point B", ["Point A", "The S0 label", "The D0 intercept"], "Point B is where the new saving curve S1 intersects unchanged investment demand D0."],
  ["LOANABLE-03.webp", "After saving decreases, what real interest rate is shown at B?", "8 percent", ["6 percent", "7 percent", "10 percent"], "The left-shifted S1 curve intersects D0 at B on the 8 percent level."],
  ["LOANABLE-03.webp", "What is the new equilibrium quantity after the shift?", "80 units", ["60 units", "100 units", "120 units"], "Point B lies at 80 units after the decrease in saving supply."],
  ["LOANABLE-03.webp", "How does the saving decrease change equilibrium from A to B?", "The rate rises and quantity falls", ["The rate falls and quantity rises", "Both rate and quantity rise", "Both rate and quantity fall"], "The graph moves from A (100, 7 percent) to B (80, 8 percent)."],
  ["LOANABLE-03.webp", "Which curve movement is displayed?", "Saving supply shifts left from S0 to S1", ["Saving supply shifts right from S1 to S0", "Investment demand shifts right from D0", "Investment demand shifts left from D0"], "D0 is unchanged while saving supply moves left from solid S0 to dashed S1."],
  ["LOANABLE-03.webp", "Which change could produce the new equilibrium?", "Households become less willing to save", ["Households become more willing to save", "Expected investment returns increase", "The real interest rate falls by itself"], "Less saving at every rate shifts the supply curve left, matching S0 to S1."],
  ["LOANABLE-03.webp", "By how much does equilibrium quantity decline?", "20 units", ["1 unit", "7 units", "80 units"], "The quantity falls from 100 at A to 80 at B, a decline of 20 units."],
  ["LOANABLE-03.webp", "Which point marks the equilibrium after saving decreases?", "Point B", ["Point A", "The S0 label", "The D0 intercept"], "Point B is the intersection of the new leftward saving curve S1 with D0."]
]) graph("SLF6", item[0], item[1], item[2], item[3], item[4], /how|which change|curve|point/i.test(item[1]) ? "graph_integration" : "graph_calculation");
add("SLF6", "A retirement-saving incentive increases household saving. What is the loanable-funds effect?", "Supply shifts right, lowering the rate and raising quantity", ["Supply shifts left, raising the rate and lowering quantity", "Demand shifts right, raising both outcomes", "Demand shifts left, lowering both outcomes"], "Greater saving increases supply at each rate; the new equilibrium has a lower real rate and more funds.", "integration");
add("SLF6", "Public saving falls while private saving is unchanged. What happens to national saving?", "It falls, shifting loanable-funds supply left", ["It rises, shifting supply right", "It is unchanged, leaving supply fixed", "It shifts investment demand right"], "National saving is the sum of private and public saving, so a lower public component reduces supply.");
add("SLF6", "A rise in saving supply lowers the equilibrium real rate. How does investment respond?", "Investment rises along its demand curve", ["Investment demand shifts left", "Investment demand shifts right", "Investment falls along demand"], "The saving shock shifts supply; the lower rate increases the quantity of investment demanded along unchanged demand.", "integration");
add("SLF6", "How does greater national saving connect to investment?", "More supply lowers financing cost and raises equilibrium investment", ["More supply raises financing cost and lowers investment", "Saving shifts investment demand left by definition", "Saving removes all funds from financial markets"], "The supply shift lowers the real interest rate, encouraging more investment projects to be financed.", "bridge");
add("SLF6", "If national saving increases, which curve shifts?", "The supply of loanable funds shifts right", ["Investment demand shifts right", "Investment demand shifts left", "Saving supply shifts left"], "National saving is the supply of loanable funds, so an increase shifts that curve right.", "definition");

// SLF7 — 18 (12 graph)
for (const item of [
  ["LOANABLE-04.webp", "After investment demand increases, what real interest rate is shown at B?", "7 percent", ["5 percent", "9 percent", "13 percent"], "The new D1-S0 intersection at B lies at a 7 percent real interest rate."],
  ["LOANABLE-04.webp", "What equilibrium quantity follows the investment-demand increase?", "120 units", ["80 units", "160 units", "260 units"], "Point B lies at 120 units after investment demand increases."],
  ["LOANABLE-04.webp", "How does stronger investment demand change equilibrium from A to B?", "Both the rate and quantity rise", ["Both the rate and quantity fall", "The rate rises and quantity falls", "The rate falls and quantity rises"], "The marked equilibrium moves from A (80, 5 percent) to B (120, 7 percent)."],
  ["LOANABLE-04.webp", "Which rightward curve shift creates B?", "Investment demand shifts right from D0 to D1", ["Investment demand shifts left from D1 to D0", "Saving supply shifts right from S0", "Saving supply shifts left from S0"], "S0 stays fixed while the investment-demand curve moves right to D1."],
  ["LOANABLE-04.webp", "Which event could explain the displayed demand increase?", "New technology raises expected project profitability", ["Households save more at every rate", "Expected project profitability falls", "Public saving rises with investment unchanged"], "Higher expected returns raise desired investment at every rate, matching the rightward D0-to-D1 shift."],
  ["LOANABLE-04.webp", "By how much does equilibrium quantity rise?", "40 units", ["2 units", "80 units", "120 units"], "Quantity rises from 80 at A to 120 at B, an increase of 40 units."],
  ["LOANABLE-05.webp", "After investment demand decreases, what real interest rate is shown at B?", "4 percent", ["3 percent", "5 percent", "7 percent"], "The new D1-S0 intersection at B is located at a 4 percent real interest rate."],
  ["LOANABLE-05.webp", "What equilibrium quantity follows the investment-demand decrease?", "60 units", ["40 units", "80 units", "140 units"], "Point B lies at 60 units after investment demand decreases."],
  ["LOANABLE-05.webp", "How does weaker investment demand change equilibrium from A to B?", "Both the rate and quantity fall", ["Both the rate and quantity rise", "The rate rises and quantity falls", "The rate falls and quantity rises"], "The graph moves from A (80, 5 percent) to B (60, 4 percent)."],
  ["LOANABLE-05.webp", "Which leftward curve shift creates B?", "Investment demand shifts left from D0 to D1", ["Investment demand shifts right from D1 to D0", "Saving supply shifts right from S0", "Saving supply shifts left from S0"], "S0 stays fixed while desired investment moves left from D0 to D1."],
  ["LOANABLE-05.webp", "Which event could explain the displayed demand decrease?", "Firms expect weaker future demand for their output", ["A tax credit raises investment profitability", "Households become more willing to save", "Public saving declines with demand unchanged"], "Weaker expected sales reduce desired investment at each rate, matching the leftward demand shift."],
  ["LOANABLE-05.webp", "By how much does equilibrium quantity fall?", "20 units", ["1 unit", "4 units", "60 units"], "Quantity falls from 80 at A to 60 at B, a decrease of 20 units."]
]) graph("SLF7", item[0], item[1], item[2], item[3], item[4], /how|which/i.test(item[1]) ? "graph_integration" : "graph_calculation");
add("SLF7", "An investment tax credit raises the after-tax return on new equipment. What happens?", "Investment demand shifts right", ["Investment demand shifts left", "Saving supply shifts right", "There is only movement along demand"], "The credit raises project profitability at each real rate, increasing desired investment and shifting demand right.");
add("SLF7", "Firms expect much weaker sales next year. What is the likely market effect?", "Investment demand shifts left", ["Investment demand shifts right", "Saving supply shifts left", "There is movement up along demand"], "Weaker expected sales reduce expected returns from new capital, lowering desired investment at every rate.");
add("SLF7", "A higher real interest rate occurs with expected profitability unchanged. What happens to investment?", "Quantity demanded falls along the existing curve", ["Investment demand shifts left", "Investment demand shifts right", "Saving supply shifts left"], "A rate change is movement along investment demand, not a change in demand at every rate.");
add("SLF7", "Why can improved technology increase investment demand?", "It can raise the expected return from new capital", ["It makes every saver consume more", "It fixes the real interest rate by law", "It turns investment into public saving"], "Productivity-enhancing technology can make more projects profitable at each financing rate.", "interpretation");
add("SLF7", "Investment demand rises while saving supply is fixed. What must happen at the new equilibrium?", "The real rate and quantity both rise", ["The real rate and quantity both fall", "The rate falls while quantity rises", "The rate rises while quantity falls"], "A rightward demand shift along upward-sloping supply raises both the equilibrium price and quantity.");
add("SLF7", "Investment demand falls while saving supply is fixed. What must happen?", "The real rate and quantity both fall", ["The real rate and quantity both rise", "The rate falls while quantity rises", "The rate rises while quantity falls"], "A leftward demand shift along upward-sloping supply lowers the equilibrium price and quantity.");

// SLF8 — 19 (14 graph)
for (const item of [
  ["LOANABLE-06.webp", "What is the real interest rate after national saving falls?", "8 percent", ["5 percent", "6 percent", "10 percent"], "The new S1-D0 intersection is B at an 8 percent real interest rate."],
  ["LOANABLE-06.webp", "What equilibrium quantity follows the fall in national saving?", "60 units", ["40 units", "100 units", "140 units"], "After supply shifts left, B lies at 60 units of loanable funds."],
  ["LOANABLE-06.webp", "How does lower national saving move equilibrium from A to B?", "The rate rises and quantity falls", ["The rate falls and quantity rises", "Both outcomes rise", "Both outcomes fall"], "The graph moves from A (100, 6 percent) to B (60, 8 percent)."],
  ["LOANABLE-06.webp", "Which fiscal deterioration is consistent with S0 shifting to S1?", "A larger government deficit lowers public saving", ["A larger surplus raises public saving", "An investment credit raises expected returns", "A lower rate causes supply to shift"], "A deficit reduces public and national saving, shifting the supply of loanable funds left."],
  ["LOANABLE-06.webp", "By how much does equilibrium investment fall?", "40 units", ["2 units", "60 units", "100 units"], "In the closed-economy model equilibrium investment equals loanable funds, which fall from 100 to 60."],
  ["LOANABLE-06.webp", "Which point represents the deficit-affected equilibrium?", "Point B", ["Point A", "The S0 label", "The D0 intercept"], "Point B is where the lower-saving curve S1 intersects unchanged investment demand."],
  ["LOANABLE-06.webp", "What market evidence shows crowding out?", "A higher rate accompanies lower equilibrium investment", ["A lower rate accompanies higher investment", "Demand shifts right with saving fixed", "Both curves remain at their old positions"], "The supply decrease raises the rate from 6 to 8 percent and lowers investment from 100 to 60."],
  ["LOANABLE-07.webp", "What is the real interest rate after national saving rises?", "6 percent", ["5 percent", "8 percent", "10 percent"], "The new S1-D0 intersection at B lies at a 6 percent real interest rate."],
  ["LOANABLE-07.webp", "What equilibrium quantity follows the rise in national saving?", "100 units", ["60 units", "80 units", "140 units"], "Point B lies at 100 units after the saving-supply increase."],
  ["LOANABLE-07.webp", "How does higher national saving move equilibrium from A to B?", "The rate falls and quantity rises", ["The rate rises and quantity falls", "Both outcomes rise", "Both outcomes fall"], "The graph moves from A (60, 8 percent) to B (100, 6 percent)."],
  ["LOANABLE-07.webp", "Which fiscal improvement is consistent with S0 shifting to S1?", "A budget improvement raises public saving", ["A wider deficit lowers public saving", "Weaker expectations lower investment demand", "A higher rate shifts supply right"], "Greater public saving adds to national saving and shifts the supply of loanable funds right."],
  ["LOANABLE-07.webp", "By how much does equilibrium investment rise?", "40 units", ["2 units", "60 units", "100 units"], "Equilibrium loanable funds and investment increase from 60 at A to 100 at B."],
  ["LOANABLE-07.webp", "Which point represents the higher-saving equilibrium?", "Point B", ["Point A", "The S0 label", "The D0 intercept"], "Point B is where new saving supply S1 intersects investment demand D0."],
  ["LOANABLE-07.webp", "What market evidence indicates less crowding out than at A?", "A lower rate accompanies greater equilibrium investment", ["A higher rate accompanies less investment", "Demand shifts left with saving fixed", "Both curves remain at their old positions"], "More national saving lowers the real rate from 8 to 6 percent and raises investment from 60 to 100."]
]) graph("SLF8", item[0], item[1], item[2], item[3], item[4], /how|which|evidence/i.test(item[1]) ? "graph_integration" : "graph_calculation");
add("SLF8", "Trace the loanable-funds mechanism of a larger government deficit, all else equal.", "Public saving falls, supply shifts left, and the real rate rises", ["Public saving rises, supply shifts right, and the rate falls", "Investment demand shifts right while supply stays fixed", "Consumption falls, demand shifts left, and the rate falls"], "A deficit lowers public and national saving, reducing loanable-funds supply and raising the equilibrium real interest rate.", "integration");
add("SLF8", "Why does private investment fall after a deficit reduces national saving?", "The higher real rate makes fewer projects profitable", ["The deficit shifts investment demand right", "The lower real rate discourages borrowing", "National saving becomes investment demand"], "Lower supply raises the financing cost, so investment falls along its unchanged downward-sloping demand curve.", "interpretation");
add("SLF8", "Which statement respects the boundary with short-run fiscal-multiplier analysis?", "This bank traces deficits through saving, real rates, and investment", ["This bank calculates the final aggregate-demand multiplier", "This bank treats every deficit as a fixed AD offset", "This bank replaces loanable funds with the money multiplier"], "The focus here is the saving-supply and investment mechanism, not calculation of net short-run aggregate-demand effects.", "interpretation");
add("SLF8", "A budget surplus increases public saving while private saving is unchanged. What follows?", "National saving rises and crowding out is reduced", ["National saving falls and crowding out increases", "Investment demand shifts left by definition", "The real rate must rise"], "Higher public saving raises national saving, shifts supply right, lowers the real rate, and supports more private investment.");
add("SLF8", "Why is 'a deficit eliminates all private investment' too strong?", "Crowding out means investment is lower than otherwise, not necessarily zero", ["Deficits always reduce the real interest rate", "Public saving is unrelated to national saving", "Investment demand becomes perfectly vertical"], "The market mechanism reduces equilibrium investment relative to its counterfactual level; the size depends on curves and the saving change.", "interpretation");

// SLF9 — 15 (10 graph)
for (const item of [
  ["What is the original equilibrium quantity at A?", "40 units", ["6 units", "60 units", "80 units"], "Solid S0 and D0 intersect at A at 40 units."],
  ["With both curves shifted right, what equilibrium quantity is shown at B?", "80 units", ["40 units", "60 units", "100 units"], "Dashed S1 and D1 intersect at B at 80 units."],
  ["What happens to the real interest rate from A to B?", "It remains at 6 percent", ["It rises to 8 percent", "It falls to 4 percent", "It becomes 80 percent"], "Both marked equilibria lie on the 6 percent horizontal level."],
  ["Which two curves shift between A and B?", "Saving supply and investment demand both shift right", ["Both curves shift left", "Only saving supply shifts right", "Only investment demand shifts right"], "The graph shows dashed S1 to the right of S0 and dashed D1 to the right of D0."],
  ["How much does equilibrium quantity increase under the two displayed shifts?", "40 units", ["6 units", "20 units", "80 units"], "Quantity rises from 40 at A to 80 at B, a 40-unit increase."],
  ["Which statement is supported by the displayed shift magnitudes?", "Quantity rises while the real rate is unchanged", ["Quantity is ambiguous and the rate rises", "Quantity falls while the rate is unchanged", "Both equilibrium variables are ambiguous"], "The actual intersections resolve the result: Q doubles from 40 to 80 and r remains 6 percent."],
  ["Which pair of events could produce the two rightward shifts?", "More household saving and more profitable investment projects", ["Less household saving and weaker expected profits", "A higher real rate and lower consumption", "A deficit and weaker investment incentives"], "Greater saving shifts S right, while stronger profitability shifts investment demand right."],
  ["Which point is formed by the new S1 and D1 curves?", "Point B", ["Point A", "The D0 intercept", "The S0 intercept"], "The dashed new curves S1 and D1 intersect at point B."],
  ["Why is the interest-rate outcome not ambiguous in this particular graph?", "The marked new intersection is visibly at 6 percent", ["Simultaneous shifts always leave rates unchanged", "The quantity axis fixes every interest rate", "Saving and investment shifts must be equal"], "General theory allows ambiguity, but the graph displays the relative shifts and the resulting B intersection."],
  ["How does the new quantity compare with the old quantity?", "It is twice as large", ["It is half as large", "It is unchanged", "It is 20 units smaller"], "The graph moves from 40 units at A to 80 units at B, so the new quantity is double."]
]) graph("SLF9", "LOANABLE-08.webp", item[0], item[1], item[2], item[3], /why|which|how|happens/i.test(item[0]) ? "graph_integration" : "graph_calculation");
add("SLF9", "Saving supply and investment demand both increase. What must happen to equilibrium quantity?", "It rises", ["It falls", "It remains fixed", "Its direction is always ambiguous"], "Both shifts raise the equilibrium quantity; their competing effects make the real-rate direction depend on relative sizes.");
add("SLF9", "Saving supply and investment demand both decrease. What must happen to equilibrium quantity?", "It falls", ["It rises", "It remains fixed", "Its direction is always ambiguous"], "Both leftward shifts reduce equilibrium quantity, while their effects on the real rate oppose each other.");
add("SLF9", "Saving supply rises while investment demand falls. What happens to the real interest rate?", "It falls unambiguously", ["It rises unambiguously", "It must remain unchanged", "Its direction is always ambiguous"], "Both a rightward supply shift and a leftward demand shift push the equilibrium real rate downward; quantity depends on relative shifts.");
add("SLF9", "Saving supply falls while investment demand rises. What happens to the real interest rate?", "It rises unambiguously", ["It falls unambiguously", "It must remain unchanged", "Its direction is always ambiguous"], "Both a leftward supply shift and a rightward demand shift push the equilibrium real rate upward; quantity may be ambiguous.");
add("SLF9", "A deficit lowers saving while new technology raises investment demand. What can be concluded without shift magnitudes?", "The real rate rises; the quantity effect is ambiguous", ["The real rate falls; quantity rises", "Both outcomes fall", "Both outcomes are necessarily unchanged"], "Supply left and demand right both raise the rate, but they push equilibrium quantity in opposite directions.", "integration");

// SLF10 — 8
add("SLF10", "How can more current investment affect future productive capacity?", "It can enlarge the stock of physical capital", ["It must reduce every worker's productivity", "It converts all capital into consumption", "It eliminates depreciation permanently"], "New structures and equipment add to the capital stock and can raise the economy's future capacity, all else equal.");
add("SLF10", "Which chain best links saving to long-run productive capacity?", "Saving finances investment, which adds to capital", ["Saving raises consumption, which removes capital", "Investment lowers saving, which eliminates output", "Consumption becomes loanable-funds supply"], "The financial system channels saving toward investment, and successful investment expands the productive capital stock.", "integration");
add("SLF10", "Why can crowding out matter beyond the current loanable-funds market?", "Lower investment can mean less capital accumulation than otherwise", ["Higher rates always destroy the existing capital stock", "A deficit makes future production impossible", "Public saving becomes identical to depreciation"], "When financing costs reduce private investment, the future capital stock may grow more slowly than in the counterfactual.", "interpretation");
add("SLF10", "A firm buys new productivity-enhancing machinery. What is the long-run connection?", "The machinery can increase future productive capacity", ["The purchase is only a financial-asset transfer", "The machinery reduces the physical capital stock", "The transaction must lower national saving"], "New machinery is physical investment that can help workers produce more output in future periods.");
add("SLF10", "Which statement is appropriately qualified?", "More investment can raise future capacity, all else equal", ["More investment always guarantees faster growth", "Every investment project succeeds equally", "Capital accumulation makes saving unnecessary"], "Investment contributes to capital formation, but outcomes also depend on project quality, depreciation, technology, and other conditions.", "interpretation");
add("SLF10", "If private investment is $30 billion lower because of crowding out, what is the careful growth implication?", "Capital formation is lower than it otherwise would be", ["The existing capital stock immediately falls by $30 billion", "Long-run output must fall by exactly $30 billion", "All future economic growth stops"], "Crowding out reduces the flow of new capital investment relative to the counterfactual; it does not mechanically erase existing capital.", "interpretation");
add("SLF10", "What distinguishes this capital-formation link from a full growth theory?", "It isolates one channel from investment to productive capacity", ["It explains every determinant of productivity", "It derives a complete production function", "It proves convergence across all economies"], "This Principles bridge identifies the physical-capital channel without rebuilding broader growth theory.", "interpretation");
add("SLF10", "A saving increase lowers the real rate and raises investment. What is the next long-run link?", "More investment can add to the future capital stock", ["More investment must reduce productive capacity", "The real rate becomes a capital good", "Saving turns directly into current consumption"], "The market outcome finances more new capital, which can expand future productive capacity, all else equal.", "integration");

export const uncalibratedProductionQuestions = finalizeQuestions(rows, {
  idFirst: ID_FIRST,
  idLast: ID_LAST,
  conceptId: CONCEPT_ID,
  objectives: OBJECTIVES,
  objectiveCounts: OBJECTIVE_COUNTS,
  difficultyQuotas: { easy: 40, medium: 60, hard: 36, elite: 12, legendary: 12 },
  phase: PHASE,
  graphAssets: GRAPH_ASSETS
});

export const productionQuestions = applyDifficultyCalibration(uncalibratedProductionQuestions);

if (productionQuestions.length !== 160) throw new Error(`Expected 160 questions; found ${productionQuestions.length}.`);
if (productionQuestions.filter(question => question.graphRequired).length !== 60) throw new Error("Expected exactly 60 graph-dependent questions.");
if (new Set(productionQuestions.map(question => question.id)).size !== 160) throw new Error("Question IDs must remain unique.");
