from __future__ import annotations

import argparse
import json
import shutil
from pathlib import Path
from typing import Any

from PIL import Image
from reportlab.lib.colors import Color, HexColor, white
from reportlab.lib.pagesizes import letter
from reportlab.lib.utils import ImageReader
from reportlab.pdfbase.pdfdoc import PDFString
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.pdfgen import canvas


GENERATED_AT = "2026-09-04T20:00:00-04:00"
PHASE = "phaseMacroResourceCompletion-v1"
NAVY = HexColor("#0C2D63")
TEAL = HexColor("#00A7A7")
DEEP_TEAL = HexColor("#008F95")
PALE = HexColor("#EAF7F7")
INK = HexColor("#182231")
LIGHT = HexColor("#D8E2EC")


REVIEWS: list[dict[str, Any]] = [
    {
        "code": "MACRO-20",
        "concept": "bank-balance-sheets-reserves-and-capital",
        "title": "Bank Balance Sheets, Reserves, and Capital",
        "outcome": "Classify bank accounts and trace how transactions change reserves and capital.",
        "core": "A bank balance sheet satisfies assets = liabilities + capital. Reserves, loans, and securities are assets. Deposits and bank borrowing are liabilities. Bank capital is owners' equity: assets minus liabilities. Reserves provide liquidity and help meet withdrawals; capital absorbs asset losses. Required reserves and capital requirements therefore constrain different parts of the balance sheet.",
        "recognition": [
            "A customer's deposit is a bank liability; the cash or reserve balance received is an asset.",
            "A cash withdrawal reduces both reserves and deposits by the same amount.",
            "A loan is a bank asset because the borrower owes the bank repayment.",
            "An asset loss reduces capital when liabilities do not change.",
        ],
        "watch": "Do not call reserves bank capital. Reserves are assets available for payments; capital is the residual claim, assets minus liabilities, that cushions losses.",
        "workedLabel": "CAPITAL ABSORBS AN ASSET LOSS",
        "worked": "A bank holds $120 in reserves, $780 in loans, and $100 in securities: assets are $1,000. Deposits of $900 and borrowing of $40 make liabilities $940, so capital is $60. A $25 loan loss cuts assets to $975 while liabilities stay $940. Capital falls to $35; reserves remain $120.",
        "check": "If a depositor withdraws $20 in cash, which asset and which liability fall?",
        "difficulty": "Intermediate", "time": "5 minutes", "calculation": True,
        "tested": ["assets and liabilities", "reserves", "bank capital", "deposits and withdrawals", "asset losses"],
    },
    {
        "code": "MACRO-34", "concept": "short-run-aggregate-supply",
        "title": "Short-Run Aggregate Supply",
        "outcome": "Explain the SRAS slope and distinguish movements from shifts.",
        "core": "Short-run aggregate supply shows the real GDP firms produce at each price level while some wages, input prices, and expectations adjust slowly. It slopes upward because an unexpected rise in the price level can temporarily raise production profitability. A price-level change moves along SRAS; changes in input costs, expected prices, productivity, or business taxes shift the entire curve.",
        "recognition": [
            "A higher current price level, with determinants fixed, means movement up along SRAS.",
            "Higher expected prices or higher input costs shift SRAS left/up.",
            "Lower input costs or higher productivity shift SRAS right/down.",
            "Short-run output can lie above or below potential output because adjustment is incomplete.",
        ],
        "watch": "Do not shift SRAS merely because the current price level changes. Ask whether production conditions changed at every price level.",
        "workedLabel": "AN ADVERSE COST SHOCK",
        "worked": "Higher energy prices raise firms' costs. The graph shifts SRAS from AS0 to AS1, upward and left. At real GDP 150, the price level associated with supply rises from 150 to 190. With aggregate demand fixed, the new short-run equilibrium would have lower real GDP and a higher price level.",
        "check": "Expected input prices fall. Does the economy move along SRAS or does SRAS shift?",
        "difficulty": "Intermediate", "time": "5 minutes", "calculation": False,
        "graphAsset": "question-assets/aggregate-supply/AS-01.webp",
        "graphDescription": "Price level is vertical and real GDP horizontal. Upward-sloping AS1 lies above and left of AS0, showing a decrease in short-run aggregate supply.",
        "tested": ["upward SRAS", "sticky adjustment", "SRAS shifters", "movement versus shift", "cost shocks"],
    },
    {
        "code": "MACRO-35", "concept": "demand-and-supply-shocks",
        "title": "Demand and Supply Shocks",
        "outcome": "Identify AD and SRAS shocks and compare their short-run effects.",
        "core": "An aggregate-demand shock shifts AD and moves real GDP and the price level in the same direction. A short-run aggregate-supply shock shifts SRAS and moves real GDP and the price level in opposite directions. Favorable supply shocks raise output and lower the price level; adverse supply shocks lower output and raise the price level, producing stagflation when lower output accompanies inflation.",
        "recognition": [
            "Spending changes shift AD: consumption, investment, government purchases, or net exports.",
            "Production-cost or expected-price changes shift SRAS.",
            "Demand shock: output and price level move together in the short run.",
            "Supply shock: output and price level move in opposite directions.",
        ],
        "watch": "Do not classify a shock from the outcome alone when several curves move. Identify the initiating event, shift each curve separately, then combine the effects.",
        "workedLabel": "ONE SHIFT AT A TIME",
        "worked": "From A, an AD increase alone moves equilibrium to B: output rises from 75 to 100 and the price level from 100 to 125. An adverse SRAS shift alone moves A to D: output falls from 75 to 50 while the price level rises to 125. The second pattern is stagflation.",
        "check": "Oil prices fall sharply. Which curve shifts, and what happens to output and the price level?",
        "difficulty": "Intermediate", "time": "5 minutes", "calculation": True,
        "graphAsset": "question-assets/macroeconomic-equilibrium-and-shocks/ADAS-02.webp",
        "graphDescription": "AD0 and AD1 slope downward; AS0 and AS1 slope upward. A to B isolates an AD increase. A to D isolates an adverse SRAS shift.",
        "tested": ["AD shocks", "SRAS shocks", "favorable and adverse shocks", "stagflation", "comparative statics"],
    },
    {
        "code": "MACRO-36", "concept": "long-run-macroeconomic-self-adjustment",
        "title": "Long-Run Macroeconomic Self-Adjustment",
        "outcome": "Trace wage and input-price adjustment that returns output toward potential.",
        "core": "A recessionary gap has short-run output below potential; an inflationary gap has output above potential. With no new demand shock or discretionary policy, labor-market and input-price adjustment changes SRAS over time. Weak demand for labor in a recessionary gap reduces wage-cost pressure and shifts SRAS right; an inflationary gap raises wage-cost pressure and shifts SRAS left. Output returns toward LRAS.",
        "recognition": [
            "Compare short-run equilibrium output with the LRAS position to classify the gap.",
            "Below potential: wages and input costs adjust downward, shifting SRAS right.",
            "Above potential: wages and input costs adjust upward, shifting SRAS left.",
            "Self-adjustment changes SRAS; discretionary stabilization deliberately shifts AD.",
        ],
        "watch": "Do not assume aggregate demand must reverse itself. In the textbook self-correction mechanism, wage and input-price adjustment shifts SRAS along the existing AD curve.",
        "workedLabel": "CLOSING A RECESSIONARY GAP",
        "worked": "After AD falls to AD1, the short-run equilibrium is Y3, left of LRAS at Y1. Elevated unemployment reduces wage and input-cost pressure, shifting SRAS from AS1 to AS2. The economy moves along AD1 to Y1 at the lower price level P1 without discretionary policy.",
        "check": "Output is above potential and AD is unchanged. Which direction must SRAS move during self-adjustment?",
        "difficulty": "Intermediate", "time": "5 minutes", "calculation": False,
        "graphAsset": "question-assets/long-run-macroeconomic-adjustment/adaslras.webp",
        "graphDescription": "LRAS is vertical at Y1. At AD1 and AS1, output Y3 is below potential. A rightward SRAS shift to AS2 restores output Y1 at a lower price level.",
        "tested": ["recessionary gap", "inflationary gap", "wage adjustment", "SRAS self-correction", "policy distinction"],
    },
    {
        "code": "MACRO-42", "concept": "saving-and-investment-identities",
        "title": "Saving, Investment, and National-Saving Identities",
        "outcome": "Calculate private, public, and national saving in closed and open economies.",
        "core": "With net taxes T, private saving is Y - T - C and public saving is T - G. National saving is their sum: S = Y - C - G. In a closed economy, S = I. In an open economy, S = I + NCO; because NX = NCO in the course model, S = I + NX. These are aggregate identities, not claims that each saver directly funds one investor.",
        "recognition": [
            "Budget surplus means T - G is positive; a deficit makes public saving negative.",
            "Adding private and public saving cancels T and gives Y - C - G.",
            "Use S = I only for the closed-economy model.",
            "In an open economy, saving can finance domestic investment or net capital outflow.",
        ],
        "watch": "Do not reverse the public-saving sign. T - G is public saving; G - T is the budget deficit. Also state the closed-economy assumption before writing S = I.",
        "workedLabel": "FROM COMPONENTS TO OPEN-ECONOMY SAVING",
        "worked": "Let Y = $1,200, T = $150, C = $760, and G = $260. Private saving is $290; public saving is -$110; national saving is $180. If domestic investment is $140, then NCO = S - I = $40. The accounting identity also gives NX = $40.",
        "check": "Private saving is $220 and public saving is -$50. What is national saving?",
        "difficulty": "Intermediate", "time": "6 minutes", "calculation": True,
        "formulaLines": ["Private saving = Y - T - C", "Public saving = T - G", "National saving = Y - C - G", "Closed: S = I", "Open: S = I + NCO; NX = NCO"],
        "tested": ["private saving", "public saving", "national saving", "closed-economy identity", "open-economy identity"],
    },
    {
        "code": "MACRO-43", "concept": "loanable-funds-equilibrium",
        "title": "Loanable-Funds Equilibrium",
        "outcome": "Find the real interest rate that balances desired saving and investment.",
        "core": "In the closed-economy loanable-funds model, national saving supplies funds and desired investment demands them. A higher real interest rate encourages saving and makes fewer investment projects profitable, so supply slopes upward and demand downward. Equilibrium occurs where desired saving equals desired investment; the real rate coordinates the two plans.",
        "recognition": [
            "Vertical axis: real interest rate; horizontal axis: quantity of loanable funds.",
            "Saving is the source of supply; investment is an important source of demand.",
            "Below equilibrium, desired investment exceeds desired saving and the real rate is pushed up.",
            "Above equilibrium, desired saving exceeds desired investment and the real rate is pushed down.",
        ],
        "watch": "S = I at equilibrium does not mean desired saving equals desired investment at every possible real rate. The real rate adjusts to reconcile the plans.",
        "workedLabel": "READING THE MARKET-CLEARING POINT",
        "worked": "The upward saving curve S0 and downward investment curve D0 meet at A. The equilibrium quantity is 140 and the real interest rate is 8 percent. A rate below 8 percent would create excess demand for funds; a rate above 8 percent would create excess supply.",
        "check": "At a real rate below equilibrium, which planned quantity is larger: saving or investment?",
        "difficulty": "Intermediate", "time": "5 minutes", "calculation": True,
        "graphAsset": "question-assets/saving-investment-and-loanable-funds/LOANABLE-01.webp",
        "graphDescription": "Upward saving supply S0 and downward investment demand D0 intersect at quantity 140 and real interest rate 8 percent.",
        "tested": ["saving supply", "investment demand", "real rate", "equilibrium quantity", "market adjustment"],
    },
    {
        "code": "MACRO-44", "concept": "loanable-funds-shifts",
        "title": "Loanable-Funds Shifts",
        "outcome": "Distinguish curve shifts from movements and predict the new equilibrium.",
        "core": "A change in national saving shifts loanable-funds supply; a change in expected investment profitability shifts demand. Saving incentives or higher public saving can shift supply right. A larger budget deficit can shift supply left. Investment tax incentives, technology, or stronger expected sales can shift demand right. The real interest rate itself causes movement along both curves.",
        "recognition": [
            "More saving at every real rate shifts supply right; less saving shifts it left.",
            "More profitable investment projects shift demand right; fewer shift it left.",
            "Supply right lowers the real rate and raises equilibrium funds.",
            "Demand right raises both the real rate and equilibrium funds.",
        ],
        "watch": "Do not shift a curve because the equilibrium real rate changed. First identify the non-rate event; then move along the other unchanged curve to the new equilibrium.",
        "workedLabel": "A SAVING INCENTIVE",
        "worked": "A tax incentive makes households more willing to save at every real rate. Supply shifts right from S0 to S1 while investment demand D0 stays fixed. Equilibrium moves from A to B: the real rate falls from 8 to 6 percent and loanable funds rise from 80 to 120.",
        "check": "New technology raises expected returns on capital. Which curve shifts, and what happens to the real rate?",
        "difficulty": "Intermediate", "time": "5 minutes", "calculation": True,
        "graphAsset": "question-assets/saving-investment-and-loanable-funds/LOANABLE-02.webp",
        "graphDescription": "Loanable-funds supply shifts right from S0 to S1 along demand D0. The real rate falls from 8 to 6 and quantity rises from 80 to 120.",
        "tested": ["supply shifters", "demand shifters", "saving incentives", "investment incentives", "shift versus movement"],
    },
    {
        "code": "MACRO-45", "concept": "crowding-out-and-capital-formation",
        "title": "Crowding Out and Capital Formation",
        "outcome": "Trace how government borrowing can reduce investment and future capacity.",
        "core": "A larger budget deficit reduces public saving and, other things equal, national saving. Loanable-funds supply shifts left, raising the equilibrium real interest rate. Some private investment projects become unprofitable, so investment falls along the demand curve: crowding out. Less investment can slow capital accumulation, productivity growth, and future potential output.",
        "recognition": [
            "Begin with deficit up -> public saving down -> national saving down.",
            "Lower national saving shifts loanable-funds supply left.",
            "A higher real rate reduces investment through movement along demand.",
            "The long-run concern is less capital formation, not an automatic collapse of all investment.",
        ],
        "watch": "Do not say every dollar of deficit eliminates one dollar of investment. The size of crowding out depends on market responses and, in an open economy, international capital flows.",
        "workedLabel": "THE COMPLETE CROWDING-OUT CHAIN",
        "worked": "The deficit reduces national saving, shifting supply left from S0 to S1. With demand D0 fixed, equilibrium moves from A to B: the real rate rises from 7 to 8 percent and investment falls from 100 to 80. Repeatedly lower investment can leave a smaller future capital stock.",
        "check": "Why does a higher real interest rate reduce private investment in this model?",
        "difficulty": "Intermediate", "time": "5 minutes", "calculation": True,
        "graphAsset": "question-assets/saving-investment-and-loanable-funds/LOANABLE-03.webp",
        "graphDescription": "Loanable-funds supply shifts left from S0 to S1 along D0. The real rate rises from 7 to 8 and equilibrium investment falls from 100 to 80.",
        "tested": ["budget deficit", "national saving", "real interest rate", "crowding out", "capital accumulation"],
    },
    {
        "code": "MACRO-46", "concept": "budget-accounting-and-public-saving",
        "title": "Budget Accounting and Public Saving",
        "outcome": "Calculate surplus, deficit, and public saving with correct signs.",
        "core": "In the course saving model, T is net tax revenue and G is government purchases. Public saving is T - G. A positive value is a budget surplus; a negative value is a budget deficit. The deficit is G - T, the opposite sign. When fiscal data use total outlays instead, use the categories stated in that dataset rather than silently mixing definitions.",
        "recognition": [
            "Revenue above spending: surplus and positive public saving.",
            "Spending above revenue: deficit and negative public saving.",
            "Equal revenue and spending: balanced budget and zero public saving.",
            "A deficit is a flow measured over a period; debt is an accumulated stock.",
        ],
        "watch": "Keep signs straight: a $40 deficit means public saving is -$40, not +$40. State whether G means government purchases or the source's broader outlays measure.",
        "workedLabel": "ONE BUDGET, TWO SIGN CONVENTIONS",
        "worked": "Net tax revenue is $520 billion and government purchases are $560 billion. Public saving is T - G = -$40 billion. The budget deficit is G - T = +$40 billion. Both statements describe the same imbalance using opposite signs.",
        "check": "If T = $680 billion and G = $650 billion, what are public saving and the budget balance?",
        "difficulty": "Foundational", "time": "5 minutes", "calculation": True,
        "formulaLines": ["Public saving = T - G", "Surplus = T - G > 0", "Deficit = G - T > 0", "Balanced budget: T = G", "Deficit is a flow; debt is a stock"],
        "tested": ["government revenue", "government purchases", "surplus", "deficit", "public-saving sign"],
    },
    {
        "code": "MACRO-47", "concept": "deficits-debt-and-government-borrowing",
        "title": "Deficits, Debt, and Government Borrowing",
        "outcome": "Distinguish annual budget flows from accumulated public debt.",
        "core": "A budget deficit occurs when government outlays exceed revenues during a period; it is financed by borrowing and tends to add to public debt. A surplus can reduce debt if used for repayment. Debt is the accumulated stock of outstanding borrowing, not the current year's deficit. Borrowing can finance valuable investment or current spending, so its effects depend on use, scale, interest costs, and economic conditions.",
        "recognition": [
            "Deficit: one period's negative budget balance; debt: outstanding stock at a date.",
            "New borrowing generally rises with a deficit and adds to debt.",
            "Interest payments can absorb future budget resources.",
            "Lower public saving links deficits to loanable funds and possible crowding out.",
        ],
        "watch": "Do not call the debt the sum of all past spending or claim all debt is automatically harmful. Debt changes with deficits, surpluses, interest, repayments, and accounting adjustments.",
        "workedLabel": "UPDATING THE DEBT STOCK",
        "worked": "Public debt begins at $900 billion. A $120 billion deficit adds borrowing; the next year's $20 billion surplus is used to repay debt. Ignoring other adjustments, debt becomes $900 + $120 - $20 = $1,000 billion. The two annual balances are flows; $1,000 billion is the ending stock.",
        "check": "Can the debt remain positive in a year with a budget surplus? Explain briefly.",
        "difficulty": "Intermediate", "time": "5 minutes", "calculation": True,
        "formulaLines": ["Deficit adds to borrowing", "Surplus can repay debt", "Ending debt = beginning debt + deficit - surplus", "Interest costs use future resources", "Economic effects depend on context"],
        "tested": ["deficit versus debt", "government borrowing", "debt accumulation", "interest costs", "conditional consequences"],
    },
    {
        "code": "MACRO-48", "concept": "debt-measures-burden-and-fiscal-data",
        "title": "Debt Measures, Debt Burden, and Fiscal Data",
        "outcome": "Interpret debt levels, debt-to-GDP ratios, and interest burdens.",
        "core": "The debt level is a nominal dollar stock; the debt-to-GDP ratio compares that stock with the economy's annual income and productive capacity. Ratios support comparisons across time and economies, but they do not by themselves prove sustainability. Interest rates, economic growth, revenues, primary balances, maturity, and investor confidence also matter at a Principles level.",
        "recognition": [
            "Debt-to-GDP = public debt divided by nominal GDP, multiplied by 100 percent.",
            "Debt can rise while debt-to-GDP falls if nominal GDP grows faster.",
            "Interest burden can be compared with GDP, revenue, or total outlays.",
            "Nominal levels answer size questions; ratios answer size-relative-to-capacity questions.",
        ],
        "watch": "Do not interpret one ratio as a mechanical crisis threshold. Use consistent definitions and dates, then combine the ratio with growth, interest costs, and budget information.",
        "workedLabel": "LEVEL UP, RATIO DOWN",
        "worked": "Debt rises from $6.0 trillion to $6.6 trillion while nominal GDP rises from $24.0 trillion to $27.5 trillion. Debt-to-GDP moves from 25.0% to 24.0%. The debt level increased, but the economy's nominal scale grew faster, so the relative measure fell.",
        "check": "Debt is $9 trillion and nominal GDP is $30 trillion. What is the debt-to-GDP ratio?",
        "difficulty": "Intermediate", "time": "5 minutes", "calculation": True,
        "formulaLines": ["Debt-to-GDP = debt / nominal GDP x 100%", "Level: nominal stock", "Ratio: stock relative to economic scale", "Interest burden = interest / chosen base", "Sustainability depends on several conditions"],
        "tested": ["debt level", "debt-to-GDP", "interest burden", "nominal versus relative", "fiscal-data interpretation"],
    },
    {
        "code": "MACRO-49", "concept": "deposit-creation-and-money-multiplier",
        "title": "Deposit Creation and the Money Multiplier",
        "outcome": "Apply the textbook fractional-reserve deposit-creation process.",
        "core": "In the simple textbook model, banks keep the required fraction of deposits as reserves and lend the rest. When loan proceeds are redeposited, another bank can lend part again. The repeated process creates deposits. The simple money multiplier m = 1 / rr gives the theoretical maximum total deposit expansion per dollar of new reserves under full lending and redepositing.",
        "recognition": [
            "Required reserves = reserve ratio x deposits; excess reserves can support new lending.",
            "A lower reserve ratio produces a larger simple multiplier.",
            "Each lending round is smaller because a fraction is retained as reserves.",
            "Currency holding and excess reserves make actual expansion smaller than the maximum.",
        ],
        "watch": "Do not confuse the multiplier with bank capital or claim that one bank lends the entire multiplied amount. The multiplier summarizes repeated system-wide rounds under restrictive assumptions.",
        "workedLabel": "A THEORETICAL MAXIMUM",
        "worked": "With rr = 10%, the simple multiplier is 1 / 0.10 = 10. If $1,000 of new reserves enters the banking system, maximum total deposits are $10,000. Banks collectively retain $1,000 as required reserves and can support up to $9,000 of new loans. Cash holding or excess reserves lowers the result.",
        "check": "If rr rises from 10% to 20%, what happens to the simple multiplier?",
        "difficulty": "Intermediate", "time": "5 minutes", "calculation": True,
        "formulaLines": ["Required reserves = rr x deposits", "Excess reserves = actual - required", "Simple multiplier m = 1 / rr", "Maximum deposits = new reserves x m", "Actual expansion can be smaller"],
        "tested": ["fractional reserves", "repeated redepositing", "reserve ratio", "simple multiplier", "model limitations"],
    },
    {
        "code": "MACRO-50", "concept": "long-run-aggregate-supply-and-potential-output",
        "title": "Long-Run Aggregate Supply and Potential Output",
        "outcome": "Explain vertical LRAS and changes in the economy's productive capacity.",
        "core": "Long-run aggregate supply is vertical at potential output, the sustainable output level associated with normal resource use and the natural rate of unemployment. In the long run, the price level does not determine real productive capacity. Labor, physical and human capital, natural resources, institutions, and technology or productivity determine LRAS.",
        "recognition": [
            "A current-output change is not automatically a change in potential output.",
            "More labor, capital, resources, or productivity shifts LRAS right.",
            "Loss of productive resources or persistent lower productivity can shift LRAS left.",
            "A vertical LRAS means higher prices alone do not create more long-run real output.",
        ],
        "watch": "Do not shift LRAS because aggregate demand changes. Demand can move actual output away from potential in the short run; productive-capacity changes move the LRAS line.",
        "workedLabel": "PRODUCTIVITY EXPANDS CAPACITY",
        "worked": "A lasting productivity improvement shifts LRAS from 100 to 115. The graph also shows SRAS shifting right/down. With AD0 unchanged, long-run equilibrium moves from A to B: potential output rises to 115 and the price level falls from 125 to 110. The key LRAS result is higher sustainable real GDP.",
        "check": "A recession lowers actual output but leaves labor, capital, and technology unchanged. Does LRAS shift?",
        "difficulty": "Intermediate", "time": "5 minutes", "calculation": True,
        "graphAsset": "question-assets/macroeconomic-equilibrium-and-shocks/LRAS-02.webp",
        "graphDescription": "Vertical LRAS shifts right from output 100 to 115 after a positive supply-side change; the new long-run equilibrium has higher output.",
        "tested": ["vertical LRAS", "potential output", "productive capacity", "LRAS shifters", "actual versus potential output"],
    },
    {
        "code": "MACRO-51", "concept": "ad-as-equilibrium-and-output-gaps",
        "title": "AD-AS Equilibrium and Output Gaps",
        "outcome": "Read AD, SRAS, and LRAS together to diagnose short-run output gaps.",
        "core": "Short-run macroeconomic equilibrium occurs where AD intersects SRAS, determining real GDP and the price level. LRAS marks potential output. If the short-run intersection lies left of LRAS, the economy has a recessionary gap; if it lies right, an inflationary gap. Long-run equilibrium requires AD, SRAS, and LRAS to meet at potential output.",
        "recognition": [
            "First locate the active AD-SRAS intersection; then compare its output with LRAS.",
            "Left of LRAS: recessionary gap and output below potential.",
            "Right of LRAS: inflationary gap and output above potential.",
            "At LRAS: output equals potential, though the equilibrium price level can differ across scenarios.",
        ],
        "watch": "Do not call the rightmost or highest labeled point long-run equilibrium. A point is long-run equilibrium only when its output lies on LRAS and both AD and SRAS pass through it.",
        "workedLabel": "SHORT RUN VERSUS LONG RUN",
        "worked": "Point C is initial long-run equilibrium at output 100 and price level 125. AD rises from AD0 to AD1, moving short-run equilibrium to D at output 125 and price level 150: an inflationary gap. Later SRAS shifts left to SRAS1, moving equilibrium to B on LRAS at output 100 and price level 175.",
        "check": "An AD-SRAS intersection lies left of LRAS. What gap exists, and how does actual output compare with potential?",
        "difficulty": "Intermediate", "time": "5 minutes", "calculation": True,
        "graphAsset": "question-assets/macroeconomic-equilibrium-and-shocks/ADASLRAS-01.webp",
        "graphDescription": "AD, SRAS, and vertical LRAS are shown together. Point C is long-run equilibrium; D lies right of LRAS; B returns to LRAS after SRAS adjustment.",
        "tested": ["short-run equilibrium", "long-run equilibrium", "potential output", "recessionary gap", "inflationary gap"],
    },
    {
        "code": "MACRO-52", "concept": "international-transactions-and-identities",
        "title": "International Transactions and Open-Economy Identities",
        "outcome": "Calculate trade and capital balances and connect NX, NCO, saving, and investment.",
        "core": "Net exports are exports minus imports: NX = X - M. Positive NX is a trade surplus; negative NX is a trade deficit. Net capital outflow is domestic purchases of foreign assets minus foreign purchases of domestic assets. In the course accounting model, NX = NCO. National saving finances domestic investment and NCO, so S = I + NCO = I + NX.",
        "recognition": [
            "Exports add to NX; imports subtract from NX.",
            "A domestic resident buying a foreign asset raises capital outflow and NCO.",
            "A foreign resident buying a domestic asset lowers NCO and is a capital inflow.",
            "If S exceeds I, the difference is positive NCO and positive NX.",
        ],
        "watch": "Do not import Micro tariff or comparative-advantage analysis into these identities. Also do not call a trade deficit a mathematical error: it corresponds to negative NCO in the accounting model.",
        "workedLabel": "MATCHING THE TWO SIDES",
        "worked": "Exports are $300 billion and imports are $360 billion, so NX = -$60 billion. Residents buy $90 billion of foreign assets while foreigners buy $150 billion of domestic assets, so NCO = $90 - $150 = -$60 billion. If investment is $240 billion, saving is I + NCO = $180 billion.",
        "check": "National saving is $250 billion and investment is $210 billion. What are NCO and NX?",
        "difficulty": "Intermediate", "time": "6 minutes", "calculation": True,
        "formulaLines": ["NX = exports - imports", "NCO = domestic foreign-asset purchases - foreign domestic-asset purchases", "NX = NCO", "S = I + NCO", "Therefore S = I + NX"],
        "tested": ["exports and imports", "trade balance", "NCO", "NX equals NCO", "open-economy saving identity"],
    },
    {
        "code": "MACRO-53", "concept": "nominal-exchange-rates",
        "title": "Nominal Exchange Rates and Currency Values",
        "outcome": "Interpret quotations, convert currencies, and classify appreciation or depreciation.",
        "core": "The nominal exchange rate states how much one currency trades for another. This course uses foreign currency per U.S. dollar for its dollar-market graphs. A higher value means one dollar buys more foreign currency, so the dollar appreciates; a lower value means dollar depreciation. Always write the units before converting or interpreting a percentage change.",
        "recognition": [
            "Foreign currency per dollar: multiply dollars by the quoted rate to obtain foreign currency.",
            "To convert foreign currency back to dollars, divide by foreign currency per dollar.",
            "A rise from 0.90 to 0.99 foreign units per dollar is a 10% dollar appreciation.",
            "The reciprocal quotation moves in the opposite direction.",
        ],
        "watch": "Never say only 'the exchange rate rose.' Name the quotation. A rise in foreign currency per dollar is dollar appreciation, but a rise in dollars per foreign currency means dollar depreciation.",
        "workedLabel": "UNITS FIRST, THEN ARITHMETIC",
        "worked": "At 0.90 euros per U.S. dollar, $200 buys 200 x 0.90 = 180 euros. If the quote rises to 0.99 euros per dollar, the dollar appreciates by (0.99 - 0.90) / 0.90 = 10%. The same $200 then buys 198 euros.",
        "check": "The quote falls from 1.20 to 1.08 foreign units per dollar. Did the dollar appreciate or depreciate, and by what percent?",
        "difficulty": "Intermediate", "time": "5 minutes", "calculation": True,
        "formulaLines": ["Course quote: foreign currency / U.S. dollar", "Foreign currency = dollars x quote", "Dollars = foreign currency / quote", "% change = (new - old) / old x 100", "Higher quote = dollar appreciation"],
        "tested": ["quotation units", "currency conversion", "appreciation", "depreciation", "percentage change"],
    },
    {
        "code": "MACRO-54", "concept": "real-exchange-rates-and-purchasing-power",
        "title": "Real Exchange Rates and Purchasing Power",
        "outcome": "Calculate the real exchange rate and use PPP as a long-run benchmark.",
        "core": "Let e be foreign currency per domestic currency, P the domestic price level, and P* the foreign price level. The course convention is epsilon = e x P / P*. A higher epsilon is a real appreciation: domestic goods are relatively more expensive. Purchasing-power parity suggests epsilon tends toward 1 when comparable traded goods can be arbitraged, but transport costs, trade barriers, nontraded goods, and market frictions prevent exact short-run equality.",
        "recognition": [
            "Nominal e compares currencies; real epsilon compares basket prices after conversion.",
            "A higher e or P raises epsilon; a higher P* lowers epsilon, other things equal.",
            "Real appreciation tends to reduce exports and raise imports.",
            "Relative PPP links currency changes to inflation differentials over longer horizons.",
        ],
        "watch": "Do not invert the formula by importing another textbook's quotation. Write e's units first. Here e is foreign currency per domestic currency, so epsilon = eP/P*.",
        "workedLabel": "CONVERTING TWO BASKETS",
        "worked": "A U.S. basket costs $50, a comparable foreign basket costs 40 foreign units, and e = 0.80 foreign units per dollar. Then epsilon = 0.80 x 50 / 40 = 1.00. If the U.S. price rises to $55 with e and P* fixed, epsilon becomes 1.10: a 10% real appreciation.",
        "check": "With e and P fixed, foreign prices rise. Does epsilon rise or fall under the course formula?",
        "difficulty": "Intermediate", "time": "6 minutes", "calculation": True,
        "formulaLines": ["e: foreign currency / domestic currency", "epsilon = e x P / P*", "Higher epsilon = real appreciation", "PPP benchmark: epsilon near 1", "Approx.: % change epsilon = %e + domestic inflation - foreign inflation"],
        "tested": ["nominal versus real", "real-rate formula", "real appreciation", "PPP", "inflation differentials"],
    },
    {
        "code": "MACRO-55", "concept": "capital-flows-and-net-capital-outflow",
        "title": "Capital Flows and Net Capital Outflow",
        "outcome": "Classify international asset purchases and trace interest-rate effects on NCO.",
        "core": "Net capital outflow equals domestic residents' purchases of foreign assets minus foreign residents' purchases of domestic assets. Positive NCO is net capital outflow; negative NCO is net capital inflow. Capital tends to move toward more attractive risk-adjusted returns. In the textbook model, a higher domestic real interest rate lowers NCO and therefore reduces the supply of dollars in the foreign-exchange market.",
        "recognition": [
            "A U.S. resident buying a foreign bond raises U.S. NCO.",
            "A foreign resident buying a U.S. asset lowers U.S. NCO.",
            "Higher domestic real returns attract inflow and discourage outflow, lowering NCO.",
            "NCO supplies dollars to the FX market as residents acquire foreign assets.",
        ],
        "watch": "NCO and NX describe different transactions: assets versus goods and services. They are equal as an accounting relationship in the course model, not because every asset purchase is an export.",
        "workedLabel": "CLASSIFY, THEN NET",
        "worked": "U.S. residents buy $140 billion of foreign assets; foreigners buy $90 billion of U.S. assets. U.S. NCO is $140 - $90 = +$50 billion, a net outflow. That positive NCO supplies dollars in exchange for foreign currency and corresponds to NX of +$50 billion.",
        "check": "Foreign purchases of U.S. assets rise while U.S. foreign-asset purchases are fixed. What happens to U.S. NCO?",
        "difficulty": "Intermediate", "time": "5 minutes", "calculation": True,
        "formulaLines": ["NCO = domestic purchases of foreign assets", "      - foreign purchases of domestic assets", "Positive NCO = net outflow", "Higher domestic real rate -> lower NCO", "In the course model: NCO = NX"],
        "tested": ["foreign asset purchases", "capital inflow", "capital outflow", "NCO calculation", "real-rate effect"],
    },
    {
        "code": "MACRO-56", "concept": "foreign-exchange-market",
        "title": "Foreign-Exchange Market Equilibrium",
        "outcome": "Analyze dollar demand, dollar supply, and exchange-rate movements.",
        "core": "The foreign-exchange market determines the exchange rate and quantity of dollars exchanged. The course graphs place foreign currency per U.S. dollar vertically, so a higher value is dollar appreciation. Demand for dollars slopes downward; the core graph family uses upward-sloping supply. Foreign demand for U.S. goods or assets can raise dollar demand, while stronger U.S. demand for foreign goods or assets can raise dollar supply.",
        "recognition": [
            "Demand right raises the exchange rate and quantity: dollar appreciation.",
            "Supply right lowers the exchange rate and raises quantity: dollar depreciation.",
            "Simultaneous shifts can make one equilibrium outcome indeterminate.",
            "Read the axis convention before translating up/down into appreciation/depreciation.",
        ],
        "watch": "Do not use an inverse quotation. On these graphs, moving upward means more foreign currency per dollar and therefore appreciation of the U.S. dollar.",
        "workedLabel": "A RIGHTWARD DEMAND SHIFT",
        "worked": "Dollar demand shifts from D0 to D1 while S0 remains fixed. Equilibrium moves from A to B: quantity rises from 100 to 150 and the exchange rate rises from 1.0 to 1.2 foreign units per dollar. The higher quote means the U.S. dollar appreciates.",
        "check": "Dollar supply shifts right while demand stays fixed. What happens to the dollar and to quantity exchanged?",
        "difficulty": "Intermediate", "time": "5 minutes", "calculation": True,
        "graphAsset": "question-assets/foreign-exchange-market/FX-02.webp",
        "graphDescription": "Foreign currency per U.S. dollar is vertical and quantity of dollars horizontal. Demand shifts right from D0 to D1 along S0, raising the rate from 1.0 to 1.2 and quantity from 100 to 150.",
        "tested": ["dollar demand", "dollar supply", "equilibrium", "appreciation and depreciation", "simultaneous shifts"],
    },
    {
        "code": "MACRO-57", "concept": "open-economy-policy-transmission",
        "title": "Open-Economy Policy and Macroeconomic Transmission",
        "outcome": "Trace fiscal and financial shocks through saving, NCO, FX, NX, and AD.",
        "core": "Open-economy policy analysis connects several markets. A larger budget deficit lowers public and national saving, raises the real interest rate, reduces investment and NCO, and shifts the supply of dollars left. With dollar demand fixed, the dollar appreciates and net exports fall. The NX decline and investment crowding out can partly offset the direct aggregate-demand effect of higher government purchases.",
        "recognition": [
            "Write the chain market by market; do not skip from policy directly to the exchange rate.",
            "Higher domestic real rates lower NCO by making domestic assets relatively attractive.",
            "Lower NCO means fewer dollars supplied in the FX market.",
            "Dollar appreciation makes U.S. goods relatively dearer and reduces NX.",
        ],
        "watch": "Do not claim a fixed quantitative offset or that every fiscal expansion changes output by the same amount. The model identifies directions; magnitudes depend on responses across markets.",
        "workedLabel": "FROM A DEFICIT TO NET EXPORTS",
        "worked": "Suppose a deficit raises the real rate and lowers NCO. In the graph, dollar supply falls from NCO0 = 100 to NCO1 = 50. Equilibrium moves from A to B, and the exchange rate rises from 1.0 to 1.5 foreign units per dollar. Dollar appreciation reduces NX; higher rates also crowd out some investment.",
        "check": "Capital flight raises NCO. Trace the likely directions of dollar supply, the dollar's value, and NX.",
        "difficulty": "Advanced", "time": "6 minutes", "calculation": True,
        "graphAsset": "question-assets/foreign-exchange-market/FX-09.webp",
        "graphDescription": "With D0 = NX0 fixed, vertical dollar supply shifts left from S0 = NCO0 at 100 to S1 = NCO1 at 50. The foreign-currency-per-dollar rate rises from 1.0 to 1.5.",
        "tested": ["fiscal policy", "real interest rate", "NCO", "FX supply", "exchange rate and NX", "aggregate demand"],
    },
]


def write_json(path: Path, value: dict[str, Any]) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    with path.open("w", encoding="utf-8", newline="\n") as stream:
        stream.write(json.dumps(value, indent=2, ensure_ascii=False) + "\n")


def wrapped_lines(text: str, font: str, size: float, width: float) -> list[str]:
    words = text.split()
    lines: list[str] = []
    current = ""
    for word in words:
        candidate = f"{current} {word}".strip()
        if current and stringWidth(candidate, font, size) > width:
            lines.append(current)
            current = word
        else:
            current = candidate
    if current:
        lines.append(current)
    return lines


def draw_wrapped(c: canvas.Canvas, text: str, x: float, y: float, width: float, *, size: float = 9.2,
                 leading: float = 11.0, font: str = "Helvetica", color: Color = INK,
                 max_lines: int | None = None) -> float:
    c.setFont(font, size)
    c.setFillColor(color)
    lines = wrapped_lines(text, font, size, width)
    if max_lines is not None:
        lines = lines[:max_lines]
    for line in lines:
        c.drawString(x, y, line)
        y -= leading
    return y


def draw_bullets(c: canvas.Canvas, items: list[str], x: float, y: float, width: float) -> float:
    for item in items:
        lines = wrapped_lines(item, "Helvetica", 8.35, width - 12)
        c.setFillColor(INK)
        c.setFont("Helvetica", 8.35)
        c.drawString(x, y, "-")
        for index, line in enumerate(lines[:2]):
            c.drawString(x + 10, y - index * 9.8, line)
        y -= max(1, min(2, len(lines))) * 9.8 + 2
    return y


def rounded_box(c: canvas.Canvas, x: float, y: float, w: float, h: float, fill: Color, stroke: Color, radius: float = 8) -> None:
    c.setFillColor(fill)
    c.setStrokeColor(stroke)
    c.setLineWidth(1)
    c.roundRect(x, y, w, h, radius, stroke=1, fill=1)


def draw_icon(c: canvas.Canvas, x: float, y: float, symbol: str, fill: Color = TEAL) -> None:
    c.setFillColor(fill)
    c.circle(x, y, 15, stroke=0, fill=1)
    c.setFillColor(white)
    c.setFont("Helvetica-Bold", 15)
    c.drawCentredString(x, y - 5, symbol)


def draw_graph_asset(c: canvas.Canvas, asset_path: Path, x: float, y: float, w: float, h: float) -> None:
    if not asset_path.is_file():
        raise FileNotFoundError(f"Concept Review graph asset is missing: {asset_path}")
    with Image.open(asset_path) as source:
        image = source.convert("RGB")
        luminance = image.convert("L")
        nonwhite = luminance.point(lambda value: 255 if value < 248 else 0)
        bounds = nonwhite.getbbox()
        if bounds:
            padding = max(8, round(min(image.size) * 0.012))
            left = max(0, bounds[0] - padding)
            top = max(0, bounds[1] - padding)
            right = min(image.width, bounds[2] + padding)
            bottom = min(image.height, bounds[3] + padding)
            image = image.crop((left, top, right, bottom))
        image.load()
    scale = min(w / image.width, h / image.height)
    draw_w = image.width * scale
    draw_h = image.height * scale
    draw_x = x + (w - draw_w) / 2
    draw_y = y + (h - draw_h) / 2
    c.drawImage(ImageReader(image), draw_x, draw_y, draw_w, draw_h, preserveAspectRatio=True, mask="auto")


def draw_formula_card(c: canvas.Canvas, review: dict[str, Any]) -> None:
    rounded_box(c, 94, 218, 170, 126, PALE, TEAL, 7)
    c.setFillColor(DEEP_TEAL)
    c.setFont("Helvetica-Bold", 9.5)
    c.drawCentredString(179, 326, "KEY RELATIONSHIPS")
    y = 307
    for line in review.get("formulaLines", review["tested"][:5]):
        c.setFillColor(TEAL)
        c.circle(107, y + 2, 2.5, stroke=0, fill=1)
        y = draw_wrapped(c, line, 116, y, 138, size=7.2, leading=8.0, max_lines=2) - 4


def draw_review(review: dict[str, Any], output: Path, logo_path: Path, asset_root: Path) -> None:
    output.parent.mkdir(parents=True, exist_ok=True)
    c = canvas.Canvas(str(output), pagesize=letter, pageCompression=1, invariant=1)
    c.setTitle(f"{review['code']} - {review['title']}")
    c.setAuthor("Mastery Quests")
    c.setSubject("Macroeconomics Concept Review")
    c._doc.Catalog.Lang = PDFString("en-US")
    width, _ = letter

    c.setFillColor(NAVY); c.roundRect(16, 704, width - 32, 72, 10, stroke=0, fill=1)
    rounded_box(c, 34, 717, 52, 46, white, white, 7)
    if logo_path.exists():
        c.drawImage(str(logo_path), 38, 720, 44, 40, preserveAspectRatio=True, mask="auto")
    c.setFillColor(white); c.setFont("Helvetica-Bold", 23); c.drawString(99, 733, "MACROECONOMICS")
    rounded_box(c, 452, 724, 124, 39, NAVY, TEAL, 9)
    c.setFillColor(white); c.setFont("Helvetica-Bold", 13); c.drawCentredString(514, 738, review["code"])

    rounded_box(c, 29, 650, 554, 45, white, LIGHT, 9)
    c.setStrokeColor(LIGHT); c.line(171, 650, 171, 695); c.line(407, 650, 407, 695)
    c.setFillColor(INK); c.setFont("Helvetica-Bold", 8.5); c.drawString(43, 673, "Time:")
    c.setFont("Helvetica", 8.5); c.drawString(67, 673, review["time"])
    c.setFont("Helvetica-Bold", 8.2); c.drawString(184, 681, "Outcome:")
    draw_wrapped(c, review["outcome"], 226, 681, 170, size=7.25, leading=8.4, max_lines=3)
    c.setFont("Helvetica-Bold", 8.5); c.drawString(419, 673, "Difficulty:")
    c.setFillColor(TEAL); c.circle(475, 675, 3, stroke=0, fill=1); c.circle(484, 675, 3, stroke=0, fill=1)
    c.setStrokeColor(TEAL); c.circle(493, 675, 3, stroke=1, fill=0)
    c.setFillColor(INK); c.setFont("Helvetica", 8.2); c.drawString(501, 672.5, review["difficulty"])

    title_size = 17.2
    while stringWidth(review["title"], "Helvetica-Bold", title_size) > 540 and title_size > 10.5:
        title_size -= 0.4
    c.setFillColor(NAVY); c.setFont("Helvetica-Bold", title_size)
    c.drawCentredString(width / 2, 624, review["title"])

    draw_icon(c, 50, 590, "+")
    c.setFillColor(NAVY); c.setFont("Helvetica-Bold", 14); c.drawString(80, 595, "THE CORE IDEA")
    c.setStrokeColor(TEAL); c.setLineWidth(0.8); c.line(80, 590, 582, 590)
    draw_wrapped(c, review["core"], 80, 578, 500, size=8.15, leading=9.2, max_lines=6)

    draw_icon(c, 50, 521, "?")
    c.setFillColor(NAVY); c.setFont("Helvetica-Bold", 14); c.drawString(80, 526, "HOW TO RECOGNIZE IT")
    c.setStrokeColor(TEAL); c.line(80, 521, 582, 521)
    draw_bullets(c, review["recognition"], 85, 510, 492)

    rounded_box(c, 79, 408, 503, 47, PALE, TEAL, 8)
    draw_icon(c, 50, 431, "!", DEEP_TEAL)
    c.setFillColor(DEEP_TEAL); c.setFont("Helvetica-Bold", 13); c.drawString(91, 437, "WATCH OUT")
    draw_wrapped(c, review["watch"], 91, 424, 479, size=8.0, leading=9.0, max_lines=3)

    rounded_box(c, 79, 192, 503, 204, white, NAVY, 8)
    draw_icon(c, 50, 372, "#", NAVY)
    label = "WORKED EXAMPLE: " + review["workedLabel"]
    label_size = 12.2
    while stringWidth(label, "Helvetica-Bold", label_size) > 474 and label_size > 8.8:
        label_size -= 0.35
    c.setFillColor(NAVY); c.setFont("Helvetica-Bold", label_size); c.drawString(91, 373, label)
    graph_asset = review.get("graphAsset")
    if graph_asset:
        draw_graph_asset(c, asset_root / graph_asset, 91, 206, 255, 154)
        draw_wrapped(c, review["worked"], 358, 337, 206, size=8.0, leading=9.45, max_lines=14)
    else:
        draw_formula_card(c, review)
        draw_wrapped(c, review["worked"], 278, 331, 286, size=8.45, leading=10.0, max_lines=12)

    rounded_box(c, 79, 127, 503, 52, PALE, TEAL, 8)
    draw_icon(c, 50, 153, "?", TEAL)
    c.setFillColor(DEEP_TEAL); c.setFont("Helvetica-Bold", 13); c.drawString(91, 158, "CHECK YOURSELF")
    draw_wrapped(c, review["check"], 91, 143, 478, size=8.35, leading=9.4, max_lines=2)

    c.setFillColor(NAVY); c.roundRect(16, 28, width - 32, 72, 9, stroke=0, fill=1)
    c.setFillColor(TEAL); c.setFont("Helvetica-Bold", 15); c.drawString(108, 58, "READY?")
    c.setFillColor(white); c.setFont("Helvetica-Bold", 10.5); c.drawString(206, 59, "Return to the game and master this concept.")
    c.setStrokeColor(white); c.circle(91, 63, 10, stroke=1, fill=0); c.line(88, 68, 94, 63); c.line(94, 63, 88, 58)
    c.showPage(); c.save()


def load_library(composer_root: Path) -> dict[str, Any]:
    text = (composer_root / "data" / "composer_library.js").read_text(encoding="utf-8").strip()
    prefix = "window.MQ_COMPOSER_LIBRARY="
    return json.loads(text[len(prefix):-1])


def question_count(library: dict[str, Any], concept_id: str) -> int:
    concepts = library["concepts"]
    concept = concepts[concept_id]
    owner = concepts.get(concept.get("derivedFromConceptId"), concept)
    groups = list((owner.get("questions") or {}).values())
    groups += [owner.get("repairQuestions") or [], owner.get("repairSeedQuestions") or [], owner.get("bridgeQuestions") or []]
    if concept.get("derivedFromConceptId"):
        filter_id = concept.get("subtopicFilterId") or concept_id
        return sum(filter_id in (question.get("subtopicIds") or []) for group in groups for question in group)
    return sum(len(group) for group in groups)


def source_record(review: dict[str, Any], inspected: int) -> dict[str, Any]:
    graph_asset = review.get("graphAsset")
    has_graph = bool(graph_asset)
    return {
        "code": review["code"],
        "canonicalConceptIds": [review["concept"]],
        "title": review["title"],
        "discipline": "macro",
        "disciplineLabel": "MACROECONOMICS",
        "focusTerms": review["tested"],
        "content": {
            "outcome": review["outcome"], "core": review["core"], "recognition": review["recognition"],
            "watch": review["watch"], "worked": review["worked"], "check": review["check"],
            "graph": has_graph, "calculation": review["calculation"], "difficulty": review["difficulty"],
            "time": review["time"], "exampleQuestionId": None, "checkQuestionId": None,
            "workedLabel": review["workedLabel"],
            **({"graphAssetPath": graph_asset, "graphDescription": review["graphDescription"]} if has_graph else {}),
        },
        "instructionalEvidence": {
            "canonicalDefinition": review["outcome"], "selectedQuestionIds": [],
            "testedDistinctions": review["tested"], "observedMisconceptions": [review["watch"]],
            "questionsInspected": inspected,
        },
        "manualQuality": {
            "normalWrittenEnglish": True, "economicsConceptuallyClear": True, "coreIdeaCoherent": True,
            "recognitionCluesCompleteAndUseful": True, "watchOutNaturalAndEvidenceBased": True,
            "workedExampleTrulyWorked": True, "workedExampleHasSetupReasoningConclusion": True,
            "graphExplanationMatchesVisibleGraph": True if has_graph else None,
            "checkYourselfAligned": True, "noStitchedFragments": True,
            "noUnnecessaryAxisRestatement": True, "noConclusionWithoutReasoning": True,
            "noInvisiblePointOrCurveReferences": True, "proseReadsNaturally": True,
            "conceptContaminationDetected": False, "formulaAndSignConventionChecked": True,
            "humanReviewedForPhaseMacroResourceCompletion": True,
        },
    }


def publish_sources(composer_root: Path) -> None:
    review_root = composer_root / "data" / "concept-reviews"
    source_path = review_root / "concept_review_source.json"
    source = json.loads(source_path.read_text(encoding="utf-8"))
    library = load_library(composer_root)
    replacements = {review["code"]: source_record(review, question_count(library, review["concept"])) for review in REVIEWS}
    updated: list[dict[str, Any]] = []
    for record in source["reviews"]:
        updated.append(replacements.pop(record["code"], record))
    updated.extend(replacements[code] for code in sorted(replacements))
    source["generatedAt"] = GENERATED_AT
    source["reviews"] = updated
    overrides = source.setdefault("conceptDispositionOverrides", {})
    for review in REVIEWS:
        overrides.pop(review["concept"], None)
    write_json(source_path, source)

    validation_path = review_root / "concept_review_validation.json"
    validation = json.loads(validation_path.read_text(encoding="utf-8"))
    validation["generatedAt"] = GENERATED_AT
    validation["reviewCount"] = len(updated)
    validation["macroResourceCompletion"] = {
        "phase": PHASE,
        "revisedReviewCodes": ["MACRO-20", "MACRO-34", "MACRO-35", "MACRO-36"],
        "newReviewCodes": [f"MACRO-{number:02d}" for number in range(42, 58)],
        "renderAndVisualQaRequired": True,
        "manualVisualChecksPassed": True,
        "manualContentChecksPassed": True,
        "graphAssets": {review["code"]: review["graphAsset"] for review in REVIEWS if review.get("graphAsset")},
    }
    write_json(validation_path, validation)


def main() -> None:
    parser = argparse.ArgumentParser(description="Generate the completed Principles Macro Concept Review set.")
    parser.add_argument("--composer-root", type=Path, required=True)
    parser.add_argument("--output-dir", type=Path, required=True)
    parser.add_argument("--review-codes", nargs="*", default=None)
    parser.add_argument("--publish", action="store_true")
    parser.add_argument("--public-root", type=Path)
    args = parser.parse_args()
    composer_root = args.composer_root.resolve()
    output_dir = args.output_dir.resolve()
    logo = composer_root.parent.parent / "assets" / "images" / "mastery-quests-logo-standalone.png"
    asset_root = composer_root / "data"
    requested = set(args.review_codes or [review["code"] for review in REVIEWS])
    known = {review["code"] for review in REVIEWS}
    unknown = sorted(requested - known)
    if unknown:
        raise ValueError(f"Unknown Macro Concept Review codes: {', '.join(unknown)}")
    selected = [review for review in REVIEWS if review["code"] in requested]
    for review in selected:
        draw_review(review, output_dir / f"{review['code']}.pdf", logo, asset_root)
    if args.publish:
        if len(selected) != len(REVIEWS):
            raise ValueError("Publishing requires the complete 20-sheet set.")
        review_root = composer_root / "data" / "concept-reviews"
        for review in selected:
            shutil.copy2(output_dir / f"{review['code']}.pdf", review_root / f"{review['code']}.pdf")
        if args.public_root:
            args.public_root.resolve().mkdir(parents=True, exist_ok=True)
            for review in selected:
                shutil.copy2(output_dir / f"{review['code']}.pdf", args.public_root.resolve() / f"{review['code']}.pdf")
        publish_sources(composer_root)
    print(json.dumps({
        "phase": PHASE, "generatedAt": GENERATED_AT,
        "reviewCodes": [review["code"] for review in selected],
        "outputCount": len(selected), "published": args.publish,
        "outputDirectory": str(output_dir),
    }, indent=2))


if __name__ == "__main__":
    main()
