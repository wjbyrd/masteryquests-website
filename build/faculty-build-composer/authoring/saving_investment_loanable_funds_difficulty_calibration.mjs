// Targeted faculty calibration for the fixed-ID production bank. These overrides
// change student-facing cognition and copy only; routing and structural metadata stay fixed.

const revised = (q, answer, distractors, feedback, type) => Object.freeze({ q, answer, distractors, feedback, type });

export const DIFFICULTY_CALIBRATION_OVERRIDES = Object.freeze({
  43170: revised(
    "A household buys existing shares from another investor. Later, the corporation issues new bonds and uses the proceeds to build a factory. Which statement correctly distinguishes the transactions?",
    "Only the new factory is current GDP investment",
    ["Both securities trades are current GDP investment because money changes hands", "Only the existing-share purchase is current GDP investment because it changes ownership", "Neither the bond issue nor the factory affects saving, financing, or current production"],
    "Existing-share trades transfer financial claims. Newly issued bonds can channel saving to the firm, but the newly produced factory is the transaction counted as current macroeconomic investment.",
    "integration"
  ),
  43173: revised(
    "A firm produces $12 million of goods this year but sells them next year without producing replacements. How are the two years affected, all else equal?",
    "Inventory investment rises this year and falls next year",
    ["Consumption rises this year and inventory investment is unchanged next year", "Inventory investment falls this year and rises again when the goods are sold", "The goods count as financial investment in both years because ownership changes"],
    "Unsold current production adds $12 million to inventories this year. Selling those previously produced goods next year reduces inventories, creating negative inventory investment then.",
    "application"
  ),
  43175: revised(
    "Households reduce current consumption and buy a firm's newly issued bonds. The firm uses the proceeds for new machinery and to purchase an existing office building. Which chain is economically correct?",
    "Saving finances the firm, but only the new machinery is current GDP investment",
    ["Both firm purchases are current GDP investment because both use borrowed funds", "The bond purchase is physical investment, while neither firm purchase enters GDP", "Household saving enters GDP directly, and the machinery is only a financial asset"],
    "The bond market channels household saving to the borrower. New machinery is current production and GDP investment; transferring an existing building is not new production.",
    "integration"
  ),
  43177: revised(
    "A software firm develops a new platform for long-term use, buys an existing patent from another firm, and issues shares to finance both activities. Which evaluation is most accurate?",
    "Only the new platform may be current intellectual-property investment",
    ["All three activities are current intellectual-property investment because each has a price", "Only the share issue is current GDP investment because it raises financial capital", "The existing patent purchase creates new output, while developing the platform is current consumption"],
    "Qualifying development creates a new productive intangible asset. Buying an existing patent and issuing shares transfer ownership or financial claims rather than independently creating current output.",
    "integration"
  ),
  43179: revised(
    "An investor buys an existing corporate bond from another household, and the issuer receives none of the sale proceeds. Which inference is justified?",
    "It only reallocates an existing financial claim",
    ["The issuer's investment rises automatically by the bond's resale price", "National saving falls because every secondary-market trade uses saved funds", "The trade creates inventory investment because the bond remains unsold by the issuer"],
    "A secondary-market bond sale changes who owns the claim. With no new proceeds to the issuer and no new production specified, it creates no direct GDP investment.",
    "interpretation"
  ),
  43184: revised(
    "Income is $1,000, net taxes are $180, consumption is $650, and government purchases are $220. If government purchases then rise by $30 with the other values fixed, which result follows?",
    "Private saving stays $170; public and national saving fall $30",
    ["Private saving falls to $140; public saving is unchanged, shifting investment demand left", "Private saving stays $170; public and national saving each rise by $30, shifting supply right", "Private saving rises to $200; national saving is unchanged because taxes did not change"],
    "Private saving is Y − T − C = $170. Higher G does not change that amount, but it lowers T − G and national saving by $30, so loanable-funds supply shifts left.",
    "integration"
  ),
  43187: revised(
    "Private saving rises by $25 billion while public saving falls by $40 billion. What happens in the loanable-funds market, all else equal?",
    "National saving falls by $15 billion, shifting supply left and raising the equilibrium real rate",
    ["National saving rises by $65 billion, shifting supply right and lowering the real rate", "National saving rises by $15 billion, shifting investment demand right and raising the real rate", "National saving is unchanged because private and public saving always offset one another"],
    "The two components change national saving by +25 − 40 = −$15 billion. Lower national saving shifts loanable-funds supply left, raising the real rate and reducing equilibrium investment.",
    "integration"
  ),
  43189: revised(
    "Private saving increases by $25 billion, but a larger deficit reduces public saving by $40 billion. With investment demand unchanged, which sequence follows?",
    "National saving falls by $15 billion; supply shifts left, the real rate rises, and investment falls",
    ["National saving rises by $65 billion; supply shifts right, the real rate falls, and investment rises", "National saving falls by $15 billion; investment demand shifts left, lowering both rate and quantity", "National saving rises by $15 billion; supply shifts right, but investment necessarily falls"],
    "The public-saving decline is larger than the private-saving increase, so national saving falls by $15 billion. Supply shifts left, raising financing costs and crowding out investment along demand.",
    "integration"
  ),
  43191: revised(
    "Initially Y = $900, T = $150, C = $600, and G = $180. Net taxes then rise by $20 and government purchases rise by $35 while Y and C stay fixed. What changes?",
    "Private saving falls $20, public saving falls $15, and national saving falls $35",
    ["Private saving rises $20, public saving rises $15, and national saving rises $35", "Private saving falls $20, public saving rises $20, and national saving is unchanged", "Private saving is unchanged, public saving falls $35, and national saving falls $15"],
    "Higher net taxes reduce private saving by $20. Public saving changes by +$20 − $35 = −$15. Together, national saving falls $35, matching the change in Y − C − G.",
    "integration"
  ),
  43196: revised(
    "Output rises by $100, consumption rises by $70, and government purchases rise by $10. What happens to national saving and loanable-funds supply?",
    "National saving rises by $20, so loanable-funds supply shifts right",
    ["National saving falls by $20, so loanable-funds supply shifts left", "National saving rises by $180, so investment demand shifts right", "National saving is unchanged because output and spending all increased"],
    "Using S = Y − C − G, the change is +100 − 70 − 10 = +$20. Higher national saving shifts the loanable-funds supply curve right.",
    "integration"
  ),
  43199: revised(
    "Net taxes are $320 and government purchases are $280. Private saving then falls by $20 while fiscal quantities remain fixed. What follows?",
    "Public saving stays $40; national saving falls $20",
    ["Public saving falls to $20, but national saving remains unchanged", "Public saving remains $40, while national saving rises $20 and supply shifts right", "Public saving rises to $60, shifting investment demand rather than loanable-funds supply"],
    "Public saving remains T − G = $40 because fiscal quantities do not change. The $20 decline in private saving therefore lowers national saving and shifts supply left.",
    "integration"
  ),
  43203: revised(
    "In a closed economy, private saving rises by $20 billion while public saving falls by $35 billion. At the same time, new technology raises desired investment. What can be concluded without shift magnitudes?",
    "Supply shifts left, demand shifts right; the rate rises and quantity is ambiguous",
    ["Both curves shift right; quantity rises, while the real rate is ambiguous", "Supply shifts left only; both the real rate and quantity must fall", "Investment demand shifts right only; the real rate rises and quantity must rise"],
    "National saving falls by $15 billion, shifting supply left. Technology shifts investment demand right. Both changes raise the real rate, but they push equilibrium quantity in opposite directions.",
    "integration"
  ),
  43205: revised(
    "A student argues: ‘Because S = I in a closed economy, desired saving and desired investment are automatically equal at every real interest rate, and each saver funds one firm.’ Which correction is complete?",
    "An aggregate equilibrium identity coordinated through financial markets",
    ["S = I applies to each household, but only when the government budget is balanced", "S = I means desired quantities can differ permanently because the real rate has no coordinating role", "S = I is a rule for open economies only and does not describe aggregate accounting"],
    "The equality concerns aggregate realized saving and investment in the closed-economy model. Planned quantities need not match away from equilibrium, and intermediaries pool funds rather than pair savers with firms.",
    "integration"
  ),
  43207: revised(
    "National saving is initially $420 billion in a closed economy. Improved technology then raises desired investment at every real interest rate. What is the adjustment?",
    "Investment demand shifts right, creating upward rate pressure until planned saving and investment are equal again",
    ["Investment stays permanently at $420 billion because the identity prevents demand from shifting", "Loanable-funds supply shifts right by exactly the technology improvement, leaving the rate fixed", "The identity is violated because desired investment can never differ from saving, even away from equilibrium"],
    "The accounting identity does not freeze behavior. Higher expected returns shift investment demand right; the real rate adjusts, inducing movements along both curves toward a new equilibrium equality.",
    "integration"
  ),
  43210: revised(
    "Government purchases fall by $25 billion with output and consumption fixed in a closed economy, while firms also become more optimistic about future sales. Which market description is complete?",
    "Both curves shift right; quantity rises and the rate is ambiguous",
    ["Only supply shifts right, so both quantity and the real rate must rise", "Only investment demand shifts right, so quantity rises and the real rate falls", "Both curves shift left, so quantity falls while the real-rate effect is ambiguous"],
    "Lower government purchases raise national saving by $25 billion and shift supply right. Stronger expected sales shift investment demand right. Quantity rises, but the rate depends on relative shifts.",
    "integration"
  ),
  43213: revised(
    "Private saving is $360 billion and public saving is −$60 billion. If desired investment at the current real rate is $340 billion, what pressure should move the closed-economy market toward equilibrium?",
    "Excess demand raises the real rate toward equilibrium",
    ["Excess saving puts downward pressure on the real rate, increasing the gap", "Investment demand shifts left automatically by $40 billion because S = I is an identity", "Loanable-funds supply shifts right automatically until both quantities equal $360 billion"],
    "National saving is $300 billion, below desired investment of $340 billion at the current rate. Excess demand pushes the rate upward, causing movements along the curves toward equilibrium.",
    "integration"
  ),
  43217: revised(
    "Refer to the graph above. Suppose the real interest rate is temporarily 10 percent while the curves remain fixed. Which adjustment is consistent with the market returning to point A?",
    "Excess saving pushes the rate down toward point A",
    ["Excess investment demand pushes the rate higher as both curves shift right", "Excess saving shifts investment demand left until quantity reaches zero", "Saving and investment remain unequal because point A no longer represents equilibrium"],
    "Above the 8 percent equilibrium, saving supplied exceeds investment demanded. Downward pressure on the rate moves the market along S0 and D0 until their planned quantities again match at A.",
    "graph_integration"
  ),
  43219: revised(
    "Refer to the graph above. In this closed economy, a student says point A proves that any increase in desired investment must be matched immediately by an identical outward shift of saving supply. What is wrong with the claim?",
    "Point A is the initial equilibrium; rate adjustment coordinates a new one",
    ["Point A proves both curves must shift together because aggregate S = I at every possible rate", "The investment curve cannot shift because it represents an accounting identity rather than behavior", "Saving supply must shift left whenever expected investment profitability rises"],
    "The graph shows equality at the initial intersection, not automatic equality of planned quantities after a shock. Higher desired investment can shift demand, after which the real rate coordinates movements toward a new equilibrium.",
    "graph_integration"
  ),
  43225: revised(
    "Refer to the graph above. Which variable acts as the market price, and where is it measured?",
    "The real interest rate on the vertical axis",
    ["The quantity of loanable funds on the horizontal axis", "National saving along the S0 curve", "Desired investment along the D0 curve"],
    "The real interest rate is the price that coordinates saving and investment decisions, and the graph measures it on the vertical axis.",
    "graph_interpretation"
  ),
  43227: revised(
    "A larger budget deficit lowers public saving while private saving and investment determinants remain unchanged. Which complete loanable-funds sequence follows?",
    "Supply shifts left, raising the rate and reducing investment",
    ["National saving falls, investment demand shifts left, and both the rate and quantity fall", "National saving rises, supply shifts right, and investment falls along demand", "National saving is unchanged because public saving is not part of loanable-funds supply"],
    "Public saving is part of national saving, which supplies loanable funds. A deficit lowers that supply, raises the equilibrium real interest rate, and crowds out investment along unchanged demand.",
    "integration"
  ),
  43229: revised(
    "A higher real return encourages households to postpone consumption, while a new retirement incentive increases saving at every real rate. How should these effects be represented?",
    "Movement along supply, followed by a rightward supply shift",
    ["Both changes shift saving supply right because each raises observed saving", "The higher rate shifts supply right, while the incentive causes movement along the curve", "Both changes cause movement along the original saving curve because neither affects demand"],
    "The current real rate determines a quantity supplied on a given curve. A retirement incentive changes saving behavior at every real rate, so it shifts the whole curve.",
    "integration"
  ),
  43231: revised(
    "At a real interest rate below equilibrium, desired investment exceeds desired saving. A student claims this disproves S = I in a closed economy. Which response is correct?",
    "Planned quantities can differ; rate adjustment restores aggregate equilibrium",
    ["The student is correct because any planned imbalance permanently invalidates national accounting", "S = I requires every saver to lend directly to one investor at the posted rate", "The gap shows that closed economies can finance investment only through unrecorded foreign saving"],
    "Planned supply and demand can differ at a disequilibrium rate. Excess demand creates upward rate pressure, coordinating decisions at equilibrium without turning the aggregate identity into one-to-one behavior.",
    "integration"
  ),
  43233: revised(
    "The real interest rate is above equilibrium with loanable-funds curves unchanged. Which adjustment moves the market back toward equilibrium?",
    "Excess saving pushes the rate down toward equilibrium",
    ["Excess investment demand pushes the rate up, increasing the imbalance", "Saving supply shifts left until all planned investment disappears", "Investment demand shifts right because the high rate makes more projects profitable"],
    "Above equilibrium, the quantity of funds supplied exceeds the quantity demanded. Downward pressure on the rate causes movements along both curves until planned saving and investment are equal.",
    "application"
  ),
  43238: revised(
    "Households become more willing to save at every real interest rate. The resulting equilibrium rate falls, and firms undertake more projects. Which description separates the initial cause from the response?",
    "Saving supply shifts right; investment rises through movement down along unchanged demand",
    ["Investment demand shifts right first; saving rises through movement along unchanged supply", "Both saving supply and investment demand shift right merely because their quantities rise", "The lower rate shifts saving supply left and shifts investment demand right"],
    "Greater willingness to save shifts supply right. The lower equilibrium rate then makes more projects profitable, increasing investment as movement along the original investment-demand curve.",
    "integration"
  ),
  43241: revised(
    "A retirement incentive increases saving at every real rate, while improved technology raises expected returns on investment. Which conclusion follows without knowing shift sizes?",
    "Both curves shift right and equilibrium quantity rises; the real-rate direction is ambiguous",
    ["Only saving supply shifts right, so the real rate must fall", "Both curves shift right and the real rate must remain unchanged", "Saving supply shifts left while investment demand shifts right, so quantity is ambiguous"],
    "The saving incentive shifts supply right, while improved technology shifts investment demand right. Both changes raise equilibrium quantity, but their pressures on the real interest rate oppose one another.",
    "integration"
  ),
  43243: revised(
    "A saving incentive shifts loanable-funds supply right. The lower equilibrium real rate makes more investment projects profitable, and firms also become more optimistic about future sales. Which description is complete?",
    "Movement along demand, followed by a separate rightward demand shift",
    ["Both investment increases are movements along demand because firms ultimately borrow more", "Both investment increases shift demand because the equilibrium rate changes", "The saving incentive shifts investment demand right, while optimism moves firms along that curve"],
    "The saving shock lowers the rate and causes movement along the existing investment-demand curve. Optimism changes desired investment at every rate, so it separately shifts demand right.",
    "integration"
  ),
  43245: revised(
    "Improved technology raises expected project returns, and the resulting equilibrium real interest rate rises. How should a firm's investment response be decomposed?",
    "Demand shifts right; the higher rate partly offsets the increase",
    ["Technology causes movement along demand, while the higher rate shifts demand left", "Both changes shift investment demand right because desired investment initially increases", "The higher rate shifts saving supply left, leaving investment demand unchanged"],
    "Technology changes profitability at every rate and shifts demand right. The higher equilibrium rate is an endogenous price change that reduces quantity demanded along the shifted curve.",
    "integration"
  ),
  43249: revised(
    "Refer to the graph above. The market moves from A to B. Which event is inconsistent with the change shown?",
    "A new investment tax credit raises expected project profitability",
    ["Households become more willing to save at every real rate", "A retirement incentive increases private saving", "A budget improvement increases public and national saving"],
    "The graph shows saving supply shifting right while investment demand remains D0. An investment tax credit would instead shift investment demand right and would not by itself produce this diagram.",
    "graph_integration"
  ),
  43252: revised(
    "Refer to the graph above. Congress reduces government purchases while output and consumption remain fixed. Which explanation connects that policy to the movement from A to B?",
    "National saving and supply rise; the rate falls and investment rises",
    ["National saving falls, shifting supply left; the higher rate lowers investment along demand", "Desired investment rises, shifting D0 right; saving supply remains fixed", "The lower rate itself shifts saving supply right and investment demand left"],
    "Lower government purchases raise Y − C − G and national saving. Supply shifts from S0 to S1; the lower equilibrium rate then increases investment through movement along D0.",
    "graph_integration"
  ),
  43253: revised(
    "Refer to the graph above. Which economic change could shift saving supply from S0 to S1?",
    "Households become more willing to save at every real interest rate",
    ["Expected investment profitability rises at every real interest rate", "Households become less willing to save at every real interest rate", "The current real interest rate rises with saving preferences unchanged"],
    "A greater willingness to save increases the quantity supplied at every real interest rate, shifting the saving curve right from S0 to S1.",
    "graph_integration"
  ),
  43255: revised(
    "Refer to the graph above. From A to B, firms undertake more investment because the real interest rate falls. How should the firm's response be classified?",
    "A movement down along D0 caused by the saving-supply shift",
    ["A rightward shift from D0 because every increase in investment is a demand shift", "A leftward shift of D0 caused by the lower financing cost", "A movement up along S0 caused by improved expected profitability"],
    "The initiating change is the rightward saving-supply shift. Firms respond to the lower rate by moving along unchanged investment demand D0, rather than shifting that curve.",
    "graph_integration"
  ),
  43257: revised(
    "Refer to the graph above. Private saving rises by $15 billion while a larger deficit reduces public saving by $30 billion. Which interpretation is consistent with A moving to B?",
    "National saving falls by $15 billion, shifting supply left and raising the real rate",
    ["National saving rises by $45 billion, shifting supply right and lowering the real rate", "National saving falls by $15 billion, shifting investment demand left and lowering the rate", "National saving is unchanged because private and public saving changes cannot be combined"],
    "The net change in national saving is +15 − 30 = −$15 billion. The resulting leftward supply shift matches S0 to S1 and raises the equilibrium real interest rate.",
    "graph_integration"
  ),
  43259: revised(
    "Refer to the graph above. A deficit reduces public saving while a technological improvement raises expected investment returns. Why can this graph not represent the complete scenario?",
    "It omits the technology-driven rightward demand shift",
    ["It shifts both curves right, although a deficit should shift supply left", "It shows investment demand shifting right but leaves saving supply fixed", "It is inconsistent because both shocks must lower the real interest rate"],
    "The deficit is represented by the leftward saving-supply shift. The technology shock would also require a rightward investment-demand shift, which the graph does not display.",
    "graph_integration"
  ),
  43261: revised(
    "Refer to the graph above. Can the 20-unit decline in equilibrium quantity be interpreted as the horizontal size of the saving-supply shift?",
    "No; quantity also changes through movement along D0",
    ["Yes; every change in equilibrium quantity equals the horizontal curve shift", "Yes; D0 is fixed, so firms cannot move along it", "No; the quantity decline must instead equal a leftward investment-demand shift"],
    "The supply curve shifts, but the higher real rate also moves firms upward along unchanged D0. Therefore the change from 100 to 80 is an equilibrium response, not the horizontal shift magnitude.",
    "graph_integration"
  ),
  43264: revised(
    "Public saving falls by $30 billion while private saving rises by $10 billion. With investment demand unchanged, what follows?",
    "Supply shifts left, raising the rate and reducing investment",
    ["National saving rises $40 billion, shifting supply right and increasing investment", "National saving falls $20 billion, shifting investment demand left and lowering the rate", "National saving remains unchanged because private saving always offsets a deficit"],
    "The component changes sum to −$20 billion. Lower national saving shifts loanable-funds supply left, which raises the equilibrium real rate and reduces investment along demand.",
    "integration"
  ),
  43269: revised(
    "Refer to the graph above. Both the real interest rate and equilibrium quantity rise from A to B while saving behavior is unchanged. Which diagnosis fits the evidence?",
    "Expected project profitability increased, shifting investment demand right",
    ["Households became more willing to save, shifting loanable-funds supply right", "A larger deficit reduced public saving, shifting loanable-funds supply left", "The higher real rate itself shifted investment demand right"],
    "With S0 fixed, higher expected profitability shifts investment demand from D0 to D1. That demand increase raises both the equilibrium real rate and quantity, as shown.",
    "graph_integration"
  ),
  43271: revised(
    "Refer to the graph above. Improved technology raises investment demand, while households also become more willing to save. What limitation matters when using this graph for that scenario?",
    "It omits the household-saving supply shift",
    ["It depicts the saving shift but keeps investment demand fixed", "It depicts both shifts and therefore proves the real rate must rise", "It cannot show investment demand because D1 is a saving curve"],
    "The graph cleanly represents technology through D0 shifting to D1. The scenario also requires saving supply to shift right, but S0 remains fixed, so the full combined outcome is not shown.",
    "graph_integration"
  ),
  43273: revised(
    "Refer to the graph above. Technology raises investment demand, but a new deficit simultaneously reduces national saving. Which conclusion goes beyond what this graph establishes?",
    "That the combined scenario must raise equilibrium quantity from 80 to 120",
    ["Technology places upward pressure on the real interest rate", "The deficit would shift loanable-funds supply left", "The two shocks together place upward pressure on the real interest rate"],
    "This graph isolates a rightward demand shift with supply fixed. Adding a deficit would shift supply left; both shocks raise the rate, but their quantity effects oppose one another, so 120 is not guaranteed.",
    "graph_integration"
  ),
  43275: revised(
    "Refer to the graph above. The market moves from A to B while saving behavior remains unchanged. Which change best explains the joint decline in the real rate and quantity?",
    "Firms expect weaker future sales, shifting investment demand left",
    ["Households save more at every real rate, shifting supply right", "A larger deficit reduces national saving, shifting supply left", "The lower real rate itself shifts investment demand left"],
    "Weaker expected sales reduce desired investment at every rate, shifting D0 left to D1. With S0 fixed, both the equilibrium real rate and quantity fall.",
    "graph_integration"
  ),
  43278: revised(
    "Refer to the graph above. The market moves from A to B with saving supply fixed. Which change could have caused this outcome?",
    "Firms expect weaker future demand for their output",
    ["A tax credit raises expected investment profitability", "Households become more willing to save at every real rate", "A deficit reduces public saving while investment determinants remain fixed"],
    "Weaker expected sales reduce desired investment at every real interest rate, shifting demand left from D0 to D1 and lowering both equilibrium variables.",
    "graph_integration"
  ),
  43281: revised(
    "The real interest rate and equilibrium quantity both fall while saving supply is unchanged. Which explanation is most consistent with those observations?",
    "Weaker expected sales reduced investment demand at every real rate",
    ["Households became more willing to save at every real rate", "A larger deficit reduced public and national saving", "The lower real rate caused investment demand to shift left"],
    "With supply fixed, a leftward investment-demand shift lowers both equilibrium variables. Weaker sales expectations provide the causal determinant; the rate change itself produces movement along demand.",
    "interpretation"
  ),
  43283: revised(
    "Technology improves expected project returns, but the equilibrium real interest rate subsequently rises. Which statement correctly separates the two effects on investment?",
    "Demand shifts right; the higher rate partly offsets the increase",
    ["Technology moves firms along demand, while the higher rate shifts the entire curve left", "Both changes shift demand right because equilibrium investment initially rises", "The higher rate shifts loanable-funds supply left and leaves investment demand unchanged"],
    "Improved technology changes profitability at every rate and shifts investment demand right. The endogenous rate increase makes fewer marginal projects profitable along the new curve, partly offsetting the initial increase.",
    "integration"
  ),
  43285: revised(
    "Expected investment profitability falls while a budget deficit also reduces national saving. What must happen, and what remains uncertain?",
    "Quantity falls; the real-rate direction is ambiguous",
    ["The real rate falls, while equilibrium quantity is ambiguous", "Both the real rate and quantity must rise", "The real rate must remain unchanged, while quantity falls"],
    "Investment demand shifts left and loanable-funds supply shifts left. Both changes reduce equilibrium quantity, but demand puts downward pressure on the rate while supply puts upward pressure on it.",
    "integration"
  ),
  43287: revised(
    "Refer to the graph above. A deficit rises by $30 billion while private saving increases by only $10 billion. Which chain matches the movement from A to B?",
    "Supply shifts left; the rate rises and investment falls along D0",
    ["National saving rises $40 billion, supply shifts right, and investment rises along D0", "National saving falls $20 billion, D0 shifts left, and the real rate falls", "Public and private saving cancel, so neither curve moves from the initial equilibrium"],
    "The deficit-driven public-saving loss exceeds the private-saving gain, reducing national saving by $20 billion. The leftward supply shift raises the rate and crowds out investment along unchanged D0.",
    "graph_integration"
  ),
  43290: revised(
    "Refer to the graph above. Why is the fall in equilibrium investment from A to B a movement along D0 rather than a leftward shift of investment demand?",
    "Firms move along D0 after the deficit raises the real rate",
    ["The deficit directly lowers expected project profitability at every real rate", "Any decline in investment quantity requires the demand curve itself to shift", "The graph shows D0 moving left while saving supply remains fixed"],
    "The fiscal shock reduces public and national saving, shifting supply left. The higher equilibrium rate makes fewer projects profitable, so investment falls along the unchanged D0 curve.",
    "graph_integration"
  ),
  43293: revised(
    "Refer to the graph above. Private saving rises by $30 billion while public saving falls by $10 billion. Which interpretation is consistent with A moving to B?",
    "Supply shifts right; the rate falls and investment rises",
    ["National saving falls $40 billion, shifting supply left and reducing investment", "National saving rises $20 billion, shifting investment demand right and raising the rate", "National saving is unchanged because public saving offsets all private-saving changes"],
    "The net change in national saving is +$20 billion. Greater loanable-funds supply shifts right, lowers the equilibrium real rate, and increases investment along unchanged demand.",
    "graph_integration"
  ),
  43295: revised(
    "Refer to the graph above. A budget improvement raises public saving by $25 billion while private saving falls by $10 billion. What connects the accounting to the new equilibrium?",
    "National saving rises, shifting supply right and increasing investment along D0",
    ["National saving falls $35 billion, shifting supply left; the higher rate reduces investment", "National saving rises $15 billion, shifting D0 right; the real rate and quantity both rise", "National saving remains fixed, so the move to B must come from weaker investment demand"],
    "Public and private saving changes sum to +$15 billion. The resulting supply increase matches S0 to S1; the lower rate then raises investment through movement along D0.",
    "graph_integration"
  ),
  43297: revised(
    "Refer to the graph above. In this closed economy, a student says the rise in investment from A to B occurs ‘because S = I forces firms to invest every extra unit households save at the old rate.’ Which correction is best?",
    "Rate adjustment, not the identity alone, induces the investment increase",
    ["The claim is correct because the accounting identity removes any role for the real interest rate", "Higher saving shifts investment demand right directly, so firms invest more at every rate", "S = I applies only to individual saver-firm pairs and not to the aggregate market"],
    "The identity does not specify a behavioral one-for-one transfer at the old rate. Greater saving shifts supply, the real rate adjusts downward, and firms move along demand to the new equilibrium quantity.",
    "graph_integration"
  ),
  43302: revised(
    "A deficit increases by $30 billion while private saving rises by $10 billion. Which conclusion stays within the loanable-funds mechanism rather than importing multiplier analysis?",
    "Supply shifts left, raising the rate and crowding out investment",
    ["Aggregate demand must fall by exactly $20 billion after every multiplier effect", "Investment demand shifts right by $30 billion because deficits directly raise project profitability", "National saving rises $40 billion, so the real rate falls and private investment expands"],
    "The relevant chain is public saving down, only partly offset by private saving, then national saving and loanable-funds supply down. The task does not calculate short-run aggregate-demand multipliers.",
    "integration"
  ),
  43305: revised(
    "Refer to the graph above. Saving supply and investment demand both increase. What does theory establish before the graph's marked intersections resolve the remaining issue?",
    "Quantity rises; theory leaves the rate ambiguous, but this graph shows no change",
    ["The real rate must rise, while quantity is theoretically ambiguous; this graph shows quantity unchanged", "Both variables are theoretically ambiguous; the graph shows both falling", "Quantity must fall, while the real rate must remain unchanged in every such case"],
    "Both rightward shifts raise equilibrium quantity. Supply puts downward pressure on the real rate while demand puts upward pressure on it; the marked A and B intersections show those pressures offset here.",
    "graph_integration"
  ),
  43307: revised(
    "Refer to the graph above. In general, simultaneous rightward shifts make the real-rate effect ambiguous. What does this particular outcome imply about the depicted shift magnitudes?",
    "The rate pressures offset while both shifts raise quantity",
    ["The saving shift is absent because the real rate did not fall", "The investment-demand shift dominates, so the real rate must rise above 6 percent", "Both shifts reduce quantity, but equal magnitudes conceal the decline"],
    "A rightward supply shift pushes the rate down and a rightward demand shift pushes it up. The unchanged 6 percent rate shows offsetting rate effects, while both shifts raise quantity from A to B.",
    "graph_integration"
  ),
  43309: revised(
    "Refer to the graph above. Private saving rises by $25 billion, public saving falls by $10 billion, and technology raises desired investment. Which interpretation uses both the accounting and the graph?",
    "National saving and both curves shift right; rate pressures offset and quantity rises",
    ["National saving falls, both curves shift left, and the graph shows a lower equilibrium quantity", "National saving rises, only supply shifts right, and the graph proves technology had no effect", "National saving is unchanged, only demand shifts right, and the graph shows the real rate rising"],
    "Private and public changes raise national saving by $15 billion, shifting supply right; technology shifts demand right. Both raise quantity, while the graph shows their opposing real-rate pressures offset at 6 percent.",
    "graph_integration"
  ),
  43310: revised(
    "Refer to the graph above. Given the relative shift sizes drawn, which outcome occurs from A to B?",
    "Quantity rises while the real interest rate remains unchanged",
    ["Quantity falls while the real interest rate remains unchanged", "Quantity remains unchanged while the real interest rate rises", "Both equilibrium variables fall"],
    "The marked intersections incorporate the relative curve shifts: equilibrium quantity rises from 40 to 80, while both points remain at a 6 percent real interest rate.",
    "graph_integration"
  ),
  43314: revised(
    "Refer to the graph above. Why can the real interest rate remain at 6 percent even though equilibrium quantity doubles?",
    "The shifts' opposing rate pressures offset in this graph",
    ["Simultaneous rightward shifts always leave the real interest rate unchanged", "The quantity axis fixes the real interest rate whenever quantity increases", "Both curves are vertical at point B, so neither shift affects the rate"],
    "The two shocks reinforce one another on equilibrium quantity but have opposing effects on the real rate. In this graph, their depicted magnitudes leave the new intersection at 6 percent.",
    "graph_integration"
  ),
  43312: revised(
    "Refer to the graph above. Where do the new saving and investment-demand curves intersect?",
    "At point B",
    ["At point A", "At the D0 intercept", "At the S0 intercept"],
    "The dashed S1 and D1 curves represent the new saving and investment-demand schedules, and their intersection is labeled point B.",
    "graph_interpretation"
  ),
  43317: revised(
    "Saving supply rises while investment demand falls. What happens to the equilibrium real interest rate?",
    "It falls",
    ["It rises", "It remains unchanged", "It cannot be determined"],
    "Both the rightward supply shift and the leftward demand shift put downward pressure on the equilibrium real interest rate, while their quantity effects oppose one another.",
    "application"
  ),
  43318: revised(
    "Saving supply falls while investment demand rises. What happens to the equilibrium real interest rate?",
    "It rises",
    ["It falls", "It remains unchanged", "It cannot be determined"],
    "Both the leftward supply shift and the rightward demand shift put upward pressure on the equilibrium real interest rate, while their quantity effects oppose one another.",
    "application"
  ),
  43321: revised(
    "National saving rises and lowers the real interest rate, but many funded projects have low returns and depreciation is unusually high. What is the careful long-run conclusion?",
    "More financing can support capital formation, but does not guarantee it",
    ["The higher saving rate guarantees an equal permanent increase in productive capacity", "Every financed project becomes physical capital, so project quality and depreciation are irrelevant", "Greater saving must reduce investment because the closed-economy identity fixes the capital stock"],
    "Greater saving can lower financing costs and enable more investment. Actual capital accumulation and future output still depend on project quality, depreciation, technology, and other conditions.",
    "integration"
  ),
  43323: revised(
    "Crowding out reduces new machinery purchases, while depreciation and all other growth determinants are unchanged. Which conclusion is warranted?",
    "The future capital stock is lower than otherwise, but may still grow",
    ["The existing capital stock falls immediately by the full amount of forgone investment", "Future output must decline by exactly the reduction in machinery spending", "The capital stock is unchanged because investment affects only financial claims"],
    "Less gross investment means less addition to the capital stock than in the counterfactual. The stock can still grow if remaining investment exceeds depreciation, so an absolute decline is not implied.",
    "interpretation"
  )
});

const protectedFields = Object.freeze(["id", "objective", "objectiveLabel", "primarySkill", "secondarySkills", "repairSkill", "difficulty", "pool", "tag", "conceptCluster", "graphRequired", "asset", "scenario", "sourceCurationPhase"]);

export function applyDifficultyCalibration(baseQuestions) {
  const byId = new Map(baseQuestions.map(question => [question.id, question]));
  for (const id of Object.keys(DIFFICULTY_CALIBRATION_OVERRIDES).map(Number)) {
    if (!byId.has(id)) throw new Error(`Difficulty-calibration override references missing question ${id}.`);
  }
  return baseQuestions.map(question => {
    const override = DIFFICULTY_CALIBRATION_OVERRIDES[question.id];
    if (!override) return question;
    const calibrated = Object.freeze({ ...question, ...override });
    for (const field of protectedFields) {
      if (calibrated[field] !== question[field]) throw new Error(`Calibration changed protected ${field} on ${question.id}.`);
    }
    return calibrated;
  });
}
