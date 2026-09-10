'use strict';
// Authoritative curricular grouping proposals. Each row is stable suffix,
// faculty label, and a skill-name selector. First match owns a skill; the final
// row covers the concept's remaining canonical skills. No difficulty selectors.
// Publication resolves these selectors to explicit skill IDs and tests actual
// primary+secondary-skill eligibility before exposing an independent checkbox.
module.exports = {
 'price-elasticity-of-demand':[
  ['determinants','Explain determinants of demand responsiveness','determinant|substitut|time_horizon|budget_share|market_definition|necessity'],
  ['measurement','Calculate elasticity and distinguish it from slope','calculat|midpoint|percent|slope|linear'],
  ['interpretation','Interpret demand elasticity and limiting cases','.*']],
 'price-elasticity-of-supply':[
  ['determinants','Explain supply responsiveness and adjustment time','determinant|time|capacity|storage'],
  ['measurement','Calculate and interpret supply elasticity','.*']],
 'oligopoly-structure-concentration':[
  ['concentration','Measure concentration and define the relevant market','concentration|hhi|market_definition'],
  ['structure','Explain oligopoly, entry barriers, and interdependence','.*']],
 'oligopoly-game-theory-foundations':[
  ['equilibrium','Identify Nash equilibria and compare cooperative outcomes','nash|cooperative'],
  ['strategies','Read payoff matrices and identify best responses and dominant strategies','.*']],
 'short-run-production':[
  ['marginal-product','Analyze diminishing marginal product and average-product relationships','diminish|average|marginal_product'],
  ['production','Interpret production functions, inputs, and total output','.*']],
 'consumer-surplus':[
  ['graphs','Calculate and interpret consumer surplus on a graph','graph'],
  ['valuation','Use willingness to pay to explain and calculate consumer surplus','.*']],
 'producer-surplus':[
  ['graphs','Calculate and interpret producer surplus on a graph','graph'],
  ['valuation','Use willingness to accept to explain and calculate producer surplus','.*']],
 'tariffs-revenue-deadweight-loss':[
  ['welfare','Analyze tariff revenue, surplus, and deadweight loss','revenue|surplus|welfare|distortion|policy'],
  ['prices-quantities','Trace tariffs into domestic prices and traded quantities','.*']],
 demand:[
  ['market-effects','Analyze multiple demand changes and their market effects','multiple|equilibrium|price_signal'],
  ['related-goods','Analyze income effects, substitutes, and complements','income|normal|inferior|substitut|complement|related_goods'],
  ['core-behavior','Explain the law of demand and distinguish movements from shifts','law_of_demand|movement|schedule'],
  ['shifters','Explain and predict shifts in demand','.*']],
 supply:[
  ['market-effects','Analyze market supply and combined changes','multiple|aggregation|number_of_sellers|equilibrium|short_run_long_run'],
  ['core-behavior','Explain the law of supply and distinguish movements from shifts','law_of_supply|movement'],
  ['shifters','Analyze costs, technology, expectations, and supply shifts','.*']],
 'market-equilibrium':[
  ['combined-shifts','Analyze simultaneous demand and supply changes','simultaneous|double_shift|multi_shift|demand_decrease_supply|demand_increase_supply|expectations_and_supply'],
  ['adjustment','Explain shortages, surpluses, and price adjustment','shortage|surplus'],
  ['equilibrium','Identify and calculate market equilibrium','equilibrium_definition|equilibrium_identification|equilibrium_calculation|algebraic|curve_pairing|graph_reading|quantity_demanded|quantity_supplied'],
  ['single-shifts','Predict equilibrium effects of demand or supply changes','.*']],
 'scarcity-and-tradeoffs':[
  ['policy-tradeoffs','Evaluate policy tradeoffs and their consequences','policy|minimum_wage|labor_surplus|positive_vs_normative'],
  ['efficiency-equity','Distinguish efficiency, equality, and equity','efficien|equal|equity'],
  ['scarcity-choice','Explain scarcity, tradeoffs, and opportunity cost','.*']],
 'monopoly':[
  ['policy','Evaluate monopoly regulation and price discrimination','regulat|discrimination|resale|rent_seeking|policy'],
  ['welfare','Compare monopoly and competitive welfare','surplus|deadweight|allocative|competitive_monopoly'],
  ['profit','Analyze monopoly profit, loss, and shutdown','profit$|loss|shutdown|persistent_economic'],
  ['power','Explain monopoly power and barriers to entry','definition|barrier|resource_control|natural_monopoly|network|market_power'],
  ['revenue-choice','Use demand and revenue to choose output and price','.*']],
 'consumer-choice':[
  ['choice','Choose the best affordable bundle using marginal analysis','optimum|optimal|best_affordable|highest_attainable|tangency|mrs|marginal_rate|equimarginal|utility_per_dollar|budget_exhaustion'],
  ['preferences','Explain preferences, indifference curves, and ordinal utility','preference|indifference|convex|noncrossing|ordinal|rank|special'],
  ['budget-changes','Analyze income and price changes in the budget constraint','change|pivot|shift|purchasing|contraction|expansion|fixed_intercept'],
  ['budget','Construct budget constraints and identify affordable bundles','.*']],
 'real-versus-nominal-gdp':[
  ['prices','Calculate and interpret the GDP deflator','deflator'],
  ['growth','Separate price changes from real output and growth','growth|decomposition|welfare'],
  ['measurement','Distinguish and calculate nominal and real GDP','.*']],
 'quantity-theory-of-money':[
  ['money-market','Interpret money-market graphs and price-level adjustment','graph|axis|curve|shift|money_market|adjustment|money_value|value_of_money|inverse'],
  ['growth-inflation','Connect money growth, output growth, velocity, and inflation','growth|inflation|neutrality|long_run|across|multiple|velocity_change'],
  ['quantity-equation','Apply the quantity equation and interpret velocity and prices','.*']],
 'capital-flows-and-net-capital-outflow':[
  ['risk-capital-flight','Analyze risk, capital flight, and interacting capital-flow forces','risk|flight|competing|reinforcing|feedback'],
  ['interest-rates','Trace interest rates and portfolio choices into capital flows','interest|foreign_rate|portfolio|bridge'],
  ['transactions','Classify asset transactions and calculate net capital outflow','.*']],
 'unemployment-measurement':[
  ['measurement-limits','Interpret participation changes and limits of unemployment measures','discouraged|underemployment|natural_rate|flow|combined'],
  ['labor-force','Classify labor-force status and calculate unemployment and participation','.*']],
 'monetary-policy-transmission':[
  ['limits','Evaluate liquidity traps and limits to monetary transmission','trap|limit|strength|hoarding|expectations'],
  ['quantitative-effects','Use graphs and spending changes to evaluate policy effects','calculate|multiplier|solve|size|output_change'],
  ['transmission','Trace monetary policy through interest rates, spending, and aggregate demand','.*']],
 'ad-as-equilibrium-and-output-gaps':[
  ['potential-output','Distinguish potential output, capacity shifts, and output gaps','lras|natural|shift'],
  ['equilibrium-gaps','Read AD-AS equilibrium and classify output and unemployment gaps','.*']],
 'aggregate-demand':[
  ['shifts','Explain determinants and shifts of aggregate demand','shift'],
  ['slope','Interpret the aggregate-demand curve and explain its slope','.*']],
 'bank-balance-sheets-reserves-and-capital':[
  ['capital-risk','Analyze bank capital, leverage, and asset losses','capital|leverage|loss|liabilities'],
  ['reserves-lending','Use reserve requirements to calculate lending capacity','.*']],
 'binding-price-ceilings':[
  ['rationing','Analyze rationing, distribution, and unintended effects of ceilings','ration|nonmoney|nonprice|search|quality|misallocation|distribution|unintended|tradeoff|mixed_policy'],
  ['ceiling-effects','Identify binding ceilings and calculate shortages and traded quantities','.*']],
 'binding-price-floors':[
  ['labor-policy','Analyze minimum wages and other unintended price-floor effects','wage|labor|unemploy|unintended|tradeoff|government_purchase'],
  ['floor-effects','Identify binding floors and calculate surpluses and traded quantities','.*']],
 'budget-accounting-and-public-saving':[
  ['outlays-revenue','Classify government revenue, purchases, transfers, and outlays','classify|purchase|transfer|mandatory|discretionary|outlay|spending_label|revenue_from'],
  ['public-saving','Calculate and interpret public saving','saving'],
  ['budget-balance','Calculate and interpret budget surpluses and deficits','.*']],
 'central-bank-and-federal-reserve':[
  ['independence','Evaluate central-bank independence and accountability','independen|dominance|inconsistency|accountability|institution_design'],
  ['financial-stability','Explain lender-of-last-resort and financial-stability roles','lender|liquidity|solvency|reserve_supply|balance_sheet|unconventional'],
  ['institutions','Explain central-bank, Federal Reserve, and FOMC responsibilities','.*']],
 'competitive-markets':[
  ['competition-limits','Evaluate entry barriers and limits to competition','barrier|power|concentration|switching|information|effective_entry'],
  ['price-taking','Explain competitive markets and price-taking behavior','.*']],
 'consumer-and-producer-surplus':[
  ['consumer-surplus','Interpret and calculate consumer surplus','consumer|willingness_to_pay'],
  ['producer-surplus','Interpret and calculate producer surplus','producer|willingness_to_accept'],
  ['efficiency','Evaluate total gains, efficient allocation, and policy tradeoffs','.*']],
 'costs-of-production':[
  ['long-run-scale','Analyze long-run average cost, economies of scale, and efficient scale','scale|long_run_average|returns_to'],
  ['cost-profit','Distinguish economic costs and accounting and economic profit','explicit|implicit|profit|opportunity_cost'],
  ['production','Analyze production, productivity, and marginal product','product|inputs|short_run_long_run'],
  ['cost-curves','Calculate cost measures and interpret cost-curve relationships','.*']],
 'debt-measures-burden-and-fiscal-data':[
  ['fiscal-data','Interpret fiscal projections and compare dated debt measures','cbo|project|release|baseline|rounded'],
  ['debt-service','Analyze interest costs and debt service','interest|service|rate_assumption'],
  ['debt-burden','Distinguish debt measures and interpret debt relative to GDP','.*']],
 'deficits-debt-and-government-borrowing':[
  ['debt-dynamics','Trace persistent deficits, borrowing, and debt changes over time','persistent|multi_year|three_fiscal|surplus|smaller|reduced|direction|reconcile|tradeoff'],
  ['stocks-flows','Distinguish deficits, debt, and government borrowing','.*']],
 'demand-and-supply-shocks':[
  ['combined-policy','Evaluate combined shocks and stabilization tradeoffs','combined|simultaneous|policy|response'],
  ['supply-shocks','Trace supply shocks and explain stagflation','supply|sras|stagflation'],
  ['demand-shocks','Trace demand shocks through the AD-AS model','.*']],
 'deposit-creation-and-money-multiplier':[
  ['multiplier','Apply the deposit multiplier and reserve-ratio relationships','multiplier|multiply|reserve_ratio'],
  ['deposit-process','Explain bank lending and successive deposit-creation rounds','.*']],
 'disinflation-and-policy':[
  ['credibility','Explain expectations, credibility, and the costs of disinflation','expectation|credibility|sacrifice|long_run'],
  ['policy-path','Trace disinflation policy and unemployment effects','.*']],
 'economist-policy-role':[
  ['evidence','Evaluate policy evidence, uncertainty, and model limits','causal|validity|measurement|uncertainty|risk|sensitivity|prediction'],
  ['advice-tradeoffs','Distinguish economic analysis from policy goals and advice','.*']],
 'elasticity':[
  ['supply','Calculate and interpret supply elasticity','pes|supply|capacity'],
  ['income-related','Interpret income and cross-price elasticity','income|cross_price'],
  ['applications','Use elasticity to analyze revenue, taxation, and business decisions','revenue|pricing|tax|policy|trade|deadweight|factor_market'],
  ['demand','Calculate demand elasticity and explain its determinants','.*']],
 'externalities':[
  ['private-solutions','Evaluate private solutions, transaction costs, and the Coase theorem','coase|private_|transaction|social_norm'],
  ['permits-regulation','Compare regulation and tradable-permit approaches','permit|regulat|abatement|cost_effectiveness'],
  ['corrective-policy','Evaluate corrective taxes, subsidies, and policy effectiveness','tax|subsid|corrective|policy|intervention|residual|imperfect'],
  ['external-effects','Explain external effects and identify socially efficient outcomes','.*']],
 'factor-markets':[
  ['policy','Evaluate minimum wages and monopsony in labor markets','minimum|floor|binding|monopsony'],
  ['market-shifts','Analyze labor supply, demand shifts, and market equilibrium','equilibrium|shift|surplus|shortage|supply|movement|wage_change|employment_change|axis|disequilibrium|off_equilibrium'],
  ['productivity-hiring','Use marginal product and value of marginal product to explain hiring','.*']],
 'fiscal-multipliers-and-crowding-out':[
  ['crowding-out','Evaluate crowding out and the net fiscal effect','crowding|net_|offset|shortfall'],
  ['multiplier','Explain and apply the spending multiplier','.*']],
 'fiscal-policy-and-aggregate-demand':[
  ['taxes','Trace taxes and household spending into aggregate demand','tax|mpc|consumption'],
  ['government-spending','Explain fiscal policy and government-purchase effects on demand','.*']],
 'fisher-effect':[
  ['changing-inflation','Analyze changing inflation and expected versus realized real returns','changing|offset|realized|actual|disinflation|over_time|combine|graph'],
  ['interest-inflation','Apply the Fisher relationship between interest rates and expected inflation','.*']],
 'foreign-exchange-market':[
  ['combined-shifts','Analyze simultaneous currency-market shifts and feedback','simultaneous|reinforc|offset|indetermina|integrate|feedback|chain|shift_order|magnitude'],
  ['single-shifts','Trace trade and capital-flow changes into currency markets','shift|map_|nco'],
  ['currency-equilibrium','Identify currency-market demand, supply, and equilibrium','.*']],
 'gains-from-trade':[
  ['terms-distribution','Evaluate terms of trade and the distribution of gains','terms|distribution|boundary|transaction|mutual|numerical_gain|post_trade|net_gain'],
  ['model-limits','Evaluate changing comparative advantage and model limitations','dynamic|shock|limit|equal_|missing|community|complete_trade|autarky'],
  ['comparative-advantage','Use opportunity costs and specialization to explain gains from trade','.*']],
 'gdp-components':[
  ['accounting-boundaries','Explain inventories, imports, and government-transfer accounting','inventor|import|transfer|decomposition'],
  ['expenditure','Classify GDP components and apply the expenditure identity','.*']],
 'gdp-measurement':[
  ['production-boundaries','Apply GDP inclusion rules and avoid double counting','boundar|count|final|intermediate|newly|market_production'],
  ['income-output','Explain GDP and the equality of income and expenditure','.*']],
 'incentives':[
  ['design','Evaluate incentive design and unintended consequences','design|gaming|selection|enforcement|policy|unintended|secondary|heterogeneous|multiple'],
  ['margins','Trace incentives through opportunity costs and marginal choices','margin|opportunity|threshold|competing|interaction'],
  ['responses','Identify incentives and predict behavioral responses','.*']],
 'income-inequality-poverty-and-redistribution':[
  ['policy','Evaluate redistribution and antipoverty policies','policy|policies|redistribution|transfer'],
  ['distribution-poverty','Measure income inequality and interpret poverty and income differences','.*']],
 'inflation-costs':[
  ['redistribution','Analyze inflation surprises and debtor-creditor redistribution','unexpected|redistribut|debtor|creditor|debt|fisher|winner'],
  ['behavioral-costs','Explain inflation costs for households and firms','.*']],
 'inflation-tax-and-deflation':[
  ['deflation','Distinguish disinflation and deflation and analyze debt burdens','deflation|disinflation|debt'],
  ['money-finance','Explain seigniorage, the inflation tax, and policy risks','.*']],
 'information-asymmetry-behavioral-and-political-economy':[
  ['collective-choice','Analyze collective-choice rules and voting outcomes','arrow|median|condorcet'],
  ['behavior','Explain behavioral biases in economic decisions','behavior|bias'],
  ['information','Analyze asymmetric information, incentives, and information remedies','.*']],
 'international-trade-and-trade-policy':[
  ['tariffs-quotas','Analyze tariffs, quotas, rents, and policy tradeoffs','tariff|quota|protection|policy|distortion|efficiency_equity|claim'],
  ['surplus','Evaluate trade gains, losses, and distribution','surplus|gains|winners'],
  ['trade-flows','Use world prices to determine trade status and quantities','.*']],
 'international-transactions-and-identities':[
  ['saving-capital','Apply net-capital-outflow and saving-investment identities','nco|saving|asset|capital|external_accounts|identity|reconcile'],
  ['trade-accounting','Classify international transactions and calculate net exports','.*']],
 'liquidity-preference-and-money-market':[
  ['policy-shifts','Analyze money-demand shifts, policy offsets, and spending effects','shift|offset|multiplier|stabilize|income|price_level|investment|ad_'],
  ['equilibrium','Explain liquidity preference and money-market equilibrium','.*']],
 'living-standards-and-growth':[
  ['growth-comparisons','Compare growth rates, catch-up, and doubling times','growth|70|catch'],
  ['living-standards','Use productivity and real GDP per person to compare living standards','.*']],
 'long-run-macroeconomic-self-adjustment':[
  ['policy-timing','Compare self-correction with policy intervention and adjustment speed','policy|speed|stabilization'],
  ['self-correction','Trace short-run gaps into long-run self-correction','.*']],
 'marginal-analysis':[
  ['applications','Apply marginal reasoning to costs, incentives, and policy','to_|external|profit|consumer|scarcity'],
  ['decision-rule','Compare marginal benefits and costs and avoid sunk-cost errors','.*']],
 'models-and-assumptions':[
  ['limits-evidence','Evaluate model assumptions, evidence, and limits','limit|evaluation|discrimination|sensitivity|structural|policy|complexity'],
  ['models','Explain economic models, assumptions, and simplification','.*']],
 'monetary-control-limits':[
  ['policy-limits','Evaluate constraints on monetary-policy transmission','policy|fed|leverage|real_|nominal|loan_demand|discount|interest_on'],
  ['multiplier-limits','Explain currency drain, excess reserves, and deposit-multiplier limits','.*']],
 'monetary-neutrality':[
  ['real-values','Calculate real wages and relative prices after nominal changes','wage|relative|calculate|compare|growth|gdp'],
  ['neutrality','Distinguish nominal and real variables and explain long-run neutrality','.*']],
 'monetary-policy-tools':[
  ['policy-packages','Evaluate combined policy tools and implementation limits','mixed|combine|package|constraint|leakage|actual_multiplier|multiple|tension'],
  ['reserve-rate-tools','Explain reserve requirements and administered-rate tools','requirement|discount|interest_on_reserves|reserve_change|new_excess|policy_change'],
  ['open-market','Trace open-market purchases and sales through bank reserves and money','.*']],
 'money-functions-and-measures':[
  ['measures','Classify and calculate M1 and M2','m1|m2|measure|component|reclass|double_count'],
  ['functions-forms','Explain money functions, forms, and payment technologies','.*']],
 'monopolistic-competition':[
  ['advertising','Analyze advertising and nonprice competition','advertis|branding|brand_|quality|selling|nonprice|innovation'],
  ['long-run-welfare','Explain entry, exit, excess capacity, and welfare tradeoffs','entry|exit|long_run|capacity|markup|inefficien|variety|welfare'],
  ['firm-choice','Analyze differentiated products and short-run firm choice','.*']],
 'nominal-exchange-rates':[
  ['purchasing-power','Analyze exchange-rate effects on prices, purchasing power, and asset values','price|purchasing|buyer|asset|return|export|cost'],
  ['quotes-conversion','Interpret exchange-rate quotes, conversions, and currency changes','.*']],
 'oligopoly':[
  ['welfare-policy','Evaluate concentration, mergers, and antitrust tradeoffs','welfare|antitrust|merger|innovation|concentration_limit|model_limit'],
  ['dynamic-strategy','Analyze repeated interaction, credibility, and strategic entry','repeat|credible|commit|punish|deterren|limit_pric|kinked|price_lead|nonprice|monitor|tacit|price_war'],
  ['collusion','Explain cartels, collusion, and incentives to cheat','cartel|collusion|cheat|joint_profit|prisoner'],
  ['games','Read payoff matrices and identify strategic equilibria','payoff|response|strategy|nash|cooperative|game_'],
  ['structure','Explain oligopoly and strategic interdependence','.*']],
 'open-economy-policy-transmission':[
  ['capital-flight','Trace capital flight through financial and currency markets','flight'],
  ['trade-monetary','Analyze trade and monetary policies in an open economy','trade|monetary|foreign_demand|competing'],
  ['fiscal-chain','Trace saving and fiscal changes through interest rates, currency values, and net exports','.*']],
 'opportunity-cost':[
  ['production-trade','Use production tradeoffs and comparative advantage to calculate opportunity costs','production|ppf|advantage|ratio'],
  ['full-costs','Account for implicit, nonmonetary, and forgone costs','implicit|nonmonetary|wage|owned|full_cost|over_time'],
  ['next-best','Identify the next-best alternative in economic decisions','.*']],
 'perfect-competition':[
  ['long-run','Analyze entry, exit, long-run equilibrium, and efficiency','long_run|entry|exit|industry|efficien|welfare|normal_profit|zero_economic'],
  ['profit-shutdown','Calculate profit and loss and apply shutdown and supply rules','profit_per|loss|total_profit|break_even|shutdown|supply|produce_at'],
  ['firm-choice','Explain price taking and apply revenue and marginal output rules','.*']],
 'production-possibilities-frontier':[
  ['growth','Analyze PPF shifts, productivity, and economic growth','growth|shift|technology|capital|capacity|pivot|future'],
  ['opportunity-cost','Interpret PPF slopes, shapes, and opportunity costs','opportunity|slope|shape|specialization|tradeoff'],
  ['feasibility','Distinguish feasible production, efficiency, and resource use','.*']],
 'public-goods-and-common-resources':[
  ['common-resources','Analyze common-resource overuse and property-rights solutions','common|commons|resource|property|groundwater|grazing|forest|catch|extract|depletion|steward'],
  ['provision','Evaluate public-good provision, financing, and social benefits','provision|benefit|willingness|wtp|summation|marginal|quantity|finance|profit|donation|payment|cost_benefit|value'],
  ['classification','Classify goods by rivalry and excludability and explain free riding','.*']],
 'real-exchange-rates-and-purchasing-power':[
  ['purchasing-parity','Explain purchasing-power parity and evaluate its limits','ppp|traded|purchasing'],
  ['real-rates','Calculate and interpret real exchange rates and price-level changes','.*']],
 'stabilization-policy':[
  ['timing-limits','Evaluate policy lags, automatic stabilizers, and supply-shock tradeoffs','lag|timing|mistim|automatic|self_correction|supply_shock|liquidity|limit'],
  ['combined-effects','Evaluate policy combinations, multipliers, and remaining gaps','calculat|combin|multiplier|crowding|mix|overshoot|remaining|solve|coordinate'],
  ['policy-direction','Choose stabilization responses to recession and overheating','.*']],
 'tax-incidence':[
  ['burden-calculation','Calculate buyer and seller burdens and distinguish burden from the wedge','calculat|total_|price|wedge|burden_split|quantity|revenue'],
  ['elasticity-incidence','Use relative elasticity to explain who bears a tax','.*']],
 'tax-wedges-and-revenue':[
  ['policy-effects','Analyze tax-induced quantity changes and efficiency effects','quantity|deadweight|policy|shrink|size|elasticity'],
  ['wedge-revenue','Calculate tax wedges, buyer and seller prices, and revenue','.*']]
};

// Reviewed labels after the approved thin-group merges.
module.exports.labels = {
 'demand-shifters':'Analyze demand shifters and combined market effects',
 'supply-shifters':'Analyze supply shifters, aggregation, and combined market effects',
 'market-equilibrium-equilibrium':'Determine equilibrium and explain shortage and surplus adjustment',
 'scarcity-and-tradeoffs-policy-tradeoffs':'Evaluate efficiency, equity, and policy tradeoffs',
 'consumer-choice-choice':'Analyze how changing budgets affect optimal consumer choices',
 'capital-flows-and-net-capital-outflow-interest-rates':'Trace interest rates, risk, and capital flight into investment flows',
 'quantity-theory-of-money-quantity-equation':'Apply the quantity equation and interpret money-market adjustment',
 'budget-accounting-and-public-saving-public-saving':'Classify fiscal transactions and calculate public saving',
 'debt-measures-burden-and-fiscal-data-debt-service':'Evaluate debt-service burdens using fiscal data',
 'foreign-exchange-market-single-shifts':'Analyze single and combined currency-market shifts',
 'open-economy-policy-transmission-trade-monetary':'Trace trade policy, monetary changes, and capital flight across markets',
 'opportunity-cost-full-costs':'Calculate opportunity costs using resources and production tradeoffs',
 'production-possibilities-frontier-feasibility':'Analyze feasible production, efficiency, and changes in capacity',
 'stabilization-policy-policy-direction':'Choose and evaluate policy responses to output gaps'
};
