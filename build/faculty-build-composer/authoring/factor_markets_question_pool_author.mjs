export const PHASE = "phase-factor-markets-question-pool-v1";
export const SOURCE_VERSION = "FactorMarkets-2026.08.26-production-v1";
export const ID_FIRST = 42320;
export const ID_LAST = 42559;
export const CONCEPT_ID = "factor-markets";

export const OBJECTIVES = Object.freeze({
  "FM.1": "Diminishing Marginal Product of Labor",
  "FM.2": "Value of Marginal Product, Wages, and Hiring Decisions",
  "FM.3": "Calculate Value of Marginal Product",
  "FM.4": "Calculate Marginal Product of Labor",
  "FM.5": "Movement Along versus Shift of Labor Demand",
  "FM.6": "Labor-Demand Changes and Market Equilibrium",
  "FM.7": "Relationships among Factor Markets",
  "FM.8": "Labor-Supply Determinants",
  "FM.9": "Labor-Supply Changes and Market Equilibrium",
  "FM.10": "Factor-Market Equilibrium",
  "FM.11": "Labor-Market Equilibrium Wage and Employment",
  "FM.12": "Labor-Demand Determinants",
  "FM.13": "Cross-Factor Market Effects"
});

export const SUBTOPICS = Object.freeze({
  production: "production-and-diminishing-marginal-product",
  marginalValue: "marginal-product-and-value-of-marginal-product",
  firmDecision: "firm-labor-demand-and-input-decisions",
  derivedDemand: "derived-demand-and-labor-demand-determinants",
  equilibrium: "competitive-labor-market-equilibrium-and-wages",
  demandShifts: "labor-demand-shifts-and-comparative-statics",
  supplyShifts: "labor-supply-determinants-and-shifts",
  factorLinks: "relationships-among-factor-markets",
  applications: "supplemental-labor-market-applications"
});

const COMMON_ERRORS = Object.freeze({
  "FM.1": "Confuses diminishing marginal product with falling total product or negative marginal product.",
  "FM.2": "Compares physical marginal product directly with a dollar wage instead of comparing VMP with labor cost.",
  "FM.3": "Forgets that VMP equals output price times marginal product under the competitive-output-market assumption.",
  "FM.4": "Uses total or average product instead of the change in output divided by the change in labor.",
  "FM.5": "Treats a wage change as a labor-demand shift or a productivity change as movement along the curve.",
  "FM.6": "Reverses the wage or employment effect of a labor-demand shift.",
  "FM.7": "Assumes productive inputs are always substitutes or always complements without using the stated relationship.",
  "FM.8": "Treats the wage as a labor-supply shifter rather than a cause of movement along labor supply.",
  "FM.9": "Reverses the wage or employment effect of a labor-supply shift.",
  "FM.10": "Confuses the equilibrium factor price and quantity or ignores shortage and surplus adjustment.",
  "FM.11": "Confuses a firm hiring decision with equilibrium in the market that aggregates many firms and workers.",
  "FM.12": "Forgets that labor demand is derived from productivity and output-market conditions.",
  "FM.13": "Infers a cross-factor effect without identifying whether the inputs are complements or substitutes."
});

export const GRAPH_ASSETS = Object.freeze({
  "LABOR-01.webp": {
    scenario: "competitive warehouse labor market",
    imageAlt: "Warehouse labor demand and supply intersect at 4,000 workers and an hourly wage of $20.",
    graphDescription: "The vertical axis is hourly wage in dollars. The horizontal axis is hundreds of warehouse workers. Labor demand slopes downward and labor supply slopes upward. Their marked intersection is at 40 on the horizontal scale, or 4,000 workers, and $20 per hour."
  },
  "LABOR-02.webp": {
    scenario: "increase in warehouse labor demand",
    imageAlt: "Warehouse labor demand shifts right, raising equilibrium from 4,000 workers at $20 to 6,000 workers at $25 per hour.",
    graphDescription: "The vertical axis is hourly wage in dollars and the horizontal axis is hundreds of warehouse workers. Supply is unchanged. Labor demand shifts right from dashed D L0 to solid D L1. The marked equilibrium moves from 4,000 workers at $20 per hour to 6,000 workers at $25 per hour."
  },
  "LABOR-03.webp": {
    scenario: "decrease in orchard labor demand",
    imageAlt: "Orchard labor demand shifts left, lowering equilibrium from 4,000 workers at $20 to 2,000 workers at $15 per hour.",
    graphDescription: "The vertical axis is hourly wage in dollars and the horizontal axis is hundreds of orchard workers. Supply is unchanged. Labor demand shifts left from dashed D L0 to solid D L1. The marked equilibrium moves from 4,000 workers at $20 per hour to 2,000 workers at $15 per hour."
  },
  "LABOR-04.webp": {
    scenario: "increase in healthcare labor supply",
    imageAlt: "Healthcare labor supply shifts right, moving equilibrium from 4,000 workers at $20 to 6,000 workers at $15 per hour.",
    graphDescription: "The vertical axis is hourly wage in dollars and the horizontal axis is hundreds of healthcare workers. Labor demand is unchanged. Labor supply shifts right from dashed S L0 to solid S L1. The marked equilibrium moves from 4,000 workers at $20 per hour to 6,000 workers at $15 per hour."
  },
  "LABOR-05.webp": {
    scenario: "decrease in construction labor supply",
    imageAlt: "Construction labor supply shifts left, moving equilibrium from 4,000 workers at $20 to 2,000 workers at $25 per hour.",
    graphDescription: "The vertical axis is hourly wage in dollars and the horizontal axis is hundreds of construction workers. Labor demand is unchanged. Labor supply shifts left from dashed S L0 to solid S L1. The marked equilibrium moves from 4,000 workers at $20 per hour to 2,000 workers at $25 per hour."
  },
  "LABOR-06.webp": {
    scenario: "binding minimum wage in a restaurant labor market",
    imageAlt: "A $20 minimum wage lies above the $15 competitive restaurant wage, with labor demanded of 2,000 and labor supplied of 6,000 workers.",
    graphDescription: "The vertical axis is hourly wage in dollars and the horizontal axis is hundreds of restaurant workers. Competitive labor demand and supply intersect at 4,000 workers and $15 per hour. A horizontal minimum wage at $20 intersects labor demand at 2,000 workers and labor supply at 6,000 workers, creating a labor surplus of 4,000 workers."
  },
  "LABOR-07.webp": {
    scenario: "nonbinding minimum wage in a restaurant labor market",
    imageAlt: "A $10 minimum wage lies below the restaurant labor-market equilibrium of 4,000 workers at $15 per hour.",
    graphDescription: "The vertical axis is hourly wage in dollars and the horizontal axis is hundreds of restaurant workers. Labor demand and supply intersect at 4,000 workers and $15 per hour. A horizontal minimum wage at $10 lies below the equilibrium wage, so it is nonbinding and the competitive outcome remains unchanged."
  },
  "LABOR-08.webp": {
    scenario: "monopsony nursing labor market",
    imageAlt: "A nursing monopsony hires 4,000 nurses where MFC equals MRP and pays $20 on labor supply; competition would employ 6,000 at $25.",
    graphDescription: "The vertical axis is hourly wage in dollars and the horizontal axis is hundreds of nurses. Labor supply slopes upward, marginal factor cost rises more steeply, and marginal revenue product slopes downward. MFC equals MRP at 4,000 nurses and $30 of marginal factor cost; the wage read from labor supply at that employment is $20. Labor supply intersects MRP at the competitive outcome of 6,000 nurses and $25 per hour."
  },
  "LABOR-09.webp": {
    scenario: "simultaneous increases in nursing labor demand and supply",
    imageAlt: "Nursing labor demand and supply both shift right, increasing equilibrium employment from 4,000 to 8,000 while the wage remains $20.",
    graphDescription: "The vertical axis is hourly wage in dollars and the horizontal axis is hundreds of nurses. Dashed D L0 and S L0 intersect at 4,000 nurses and $20 per hour. Solid D L1 and S L1 intersect at 8,000 nurses and the same $20 wage. In this particular simultaneous-shift case, employment doubles while the equilibrium wage is unchanged."
  }
});

function row(q, answer, distractors, objective, type, primarySkill, feedback, subtopic, extra = {}) {
  return { q, answer, distractors, objective, type, primarySkill, feedback, subtopic, ...extra };
}

const G = [];
const g = (...args) => G.push(row(...args));

// LABOR-01: ten market-equilibrium questions.
g("What hourly wage clears the warehouse labor market shown?", "$20 per hour", ["$10 per hour", "$30 per hour", "$40 per hour"], "FM.11", "graph_interpretation", "labor_market_equilibrium_wage", "Labor demand and labor supply intersect at $20 per hour, so plans of firms and workers are consistent at that wage.", SUBTOPICS.equilibrium, { asset: "LABOR-01.webp" });
g("At the market-clearing wage, how many warehouse workers are employed?", "4,000 workers", ["400 workers", "12,000 workers", "40,000 workers"], "FM.11", "graph_interpretation", "labor_market_equilibrium_employment", "The intersection is at 40 on an axis measured in hundreds of workers, which represents 4,000 workers.", SUBTOPICS.equilibrium, { asset: "LABOR-01.webp" });
g("Suppose the wage is $30 per hour. What imbalance is visible in this warehouse labor market?", "Labor supplied exceeds labor demanded", ["Labor demanded exceeds labor supplied", "The market remains at equilibrium", "Both curves shift right"], "FM.10", "graph_interpretation", "factor_market_surplus", "At $30, the supply curve lies to the right of demand, so more workers seek jobs than firms wish to hire.", SUBTOPICS.equilibrium, { asset: "LABOR-01.webp" });
g("At a $10 hourly wage, which pressure would move this market toward equilibrium?", "Firms compete for scarce workers and bid the wage upward", ["Unemployed workers bid the wage downward", "Labor demand shifts left automatically", "Labor supply shifts right automatically"], "FM.10", "graph_integration", "factor_market_shortage_adjustment", "At $10, quantity of labor demanded exceeds quantity supplied. Competition among employers puts upward pressure on the wage toward $20.", SUBTOPICS.equilibrium, { asset: "LABOR-01.webp" });
g("How should the point where the two curves cross be interpreted?", "It is the wage and employment where labor demanded equals labor supplied", ["It is one firm's profit-maximizing hiring point", "It is the maximum possible workforce", "It is the wage where worker productivity becomes zero"], "FM.11", "graph_trap", "market_vs_firm_labor_demand", "The graph represents an entire labor market. Its intersection balances aggregated firm demand with worker supply; it is not a single firm's VMP decision.", SUBTOPICS.equilibrium, { asset: "LABOR-01.webp" });
g("If employment is 6,000 workers on the graph, what does the market wage imply?", "The displayed supply wage exceeds the displayed demand wage", ["The market is at the marked equilibrium", "Firms want more labor than workers supply", "Labor demand must shift right"], "FM.10", "graph_interpretation", "off_equilibrium_factor_quantity", "At 6,000 workers, the supply curve is above the demand curve. The wage workers require exceeds what firms are willing to pay for that quantity.", SUBTOPICS.equilibrium, { asset: "LABOR-01.webp" });
g("The warehouse wage falls from $20 to $15 with both curves unchanged. What does the graph show?", "A shortage of labor at the lower wage", ["A surplus of labor", "A new equilibrium at 6,000 workers", "A rightward shift of labor demand"], "FM.10", "graph_integration", "movement_along_factor_curves", "Below the $20 intersection, firms demand more workers while fewer workers supply labor, producing a shortage rather than a curve shift.", SUBTOPICS.equilibrium, { asset: "LABOR-01.webp" });
g("At equilibrium, what payment does an additional employed worker receive in this competitive market?", "The market wage of $20 per hour", ["The vertical intercept of labor demand", "The vertical intercept of labor supply", "The total value of all warehouse output"], "FM.11", "graph_interpretation", "competitive_factor_price", "A competitive labor market pays the common equilibrium factor price, shown at the intersection as $20 per hour.", SUBTOPICS.equilibrium, { asset: "LABOR-01.webp" });
g("Which coordinate pair matches the marked warehouse equilibrium?", "$20 per hour and 4,000 workers", ["$40 per hour and 2,000 workers", "$20 per hour and 400 workers", "$30 per hour and 12,000 workers"], "FM.11", "graph_calculation", "labor_equilibrium_coordinates", "The guide lines mark a wage of $20 and 40 hundreds of workers, or 4,000 workers.", SUBTOPICS.equilibrium, { asset: "LABOR-01.webp" });
g("Why does 40 on the horizontal axis not mean 40 warehouse workers?", "The axis is measured in hundreds, so 40 represents 4,000", ["The axis is measured in thousands, so 40 represents 40,000", "The wage axis supplies the missing zero", "Only the curve labels determine employment"], "FM.10", "graph_calculation", "factor_market_axis_scale", "The horizontal-axis title explicitly uses hundreds of workers. Multiplying 40 by 100 gives 4,000 workers.", SUBTOPICS.equilibrium, { asset: "LABOR-01.webp" });

// LABOR-02: nine labor-demand increase questions.
g("After warehouse labor demand shifts to D L1, what is the new equilibrium?", "6,000 workers at $25 per hour", ["4,000 workers at $20 per hour", "6,000 workers at $15 per hour", "2,000 workers at $25 per hour"], "FM.6", "graph_interpretation", "labor_demand_shift_equilibrium", "The solid demand curve intersects supply at 60 hundreds of workers and $25 per hour, or 6,000 workers at $25.", SUBTOPICS.demandShifts, { asset: "LABOR-02.webp" });
g("How does the demand increase change the warehouse labor market?", "Both the equilibrium wage and employment rise", ["The wage rises and employment falls", "The wage falls and employment rises", "Both the wage and employment fall"], "FM.6", "graph_interpretation", "labor_demand_increase_comparative_statics", "The equilibrium moves from 4,000 workers at $20 to 6,000 at $25, so both market outcomes rise.", SUBTOPICS.demandShifts, { asset: "LABOR-02.webp" });
g("How many additional warehouse workers are employed after the shift?", "2,000 workers", ["200 workers", "4,000 workers", "6,000 workers"], "FM.6", "graph_calculation", "labor_employment_change", "Employment rises from 4,000 to 6,000 workers, an increase of 2,000.", SUBTOPICS.demandShifts, { asset: "LABOR-02.webp" });
g("By how much does the equilibrium hourly wage rise?", "$5 per hour", ["$2 per hour", "$20 per hour", "$25 per hour"], "FM.6", "graph_calculation", "labor_wage_change", "The marked wage rises from $20 to $25 per hour, a $5 increase.", SUBTOPICS.demandShifts, { asset: "LABOR-02.webp" });
g("A new sorting system raises each warehouse worker's productivity. Which curve change in the graph fits that story?", "Labor demand shifts from D L0 to D L1", ["Labor supply shifts left", "There is movement down D L0", "Both curves shift left"], "FM.12", "graph_integration", "productivity_labor_demand", "Higher worker productivity raises the value firms obtain from labor at each wage, matching the rightward demand shift shown.", SUBTOPICS.derivedDemand, { asset: "LABOR-02.webp" });
g("Customer demand for next-day delivery rises. Why can the solid demand curve represent the resulting labor-market change?", "More valuable warehouse output raises derived demand for workers", ["A higher wage shifts labor demand right", "Workers supply less labor at every wage", "Labor ceases to be a productive input"], "FM.12", "graph_integration", "derived_labor_demand", "Labor demand is derived from demand for the services workers help produce. Stronger delivery demand can raise the value of workers' marginal product.", SUBTOPICS.derivedDemand, { asset: "LABOR-02.webp" });
g("At the original $20 wage after demand shifts, what does the graph imply?", "Firms demand more labor than workers supply", ["Workers supply more labor than firms demand", "The market remains at the original equilibrium", "Labor demand moves back to D L0"], "FM.6", "graph_interpretation", "demand_shift_shortage", "At $20 on D L1, labor demanded lies to the right of labor supplied. The shortage bids the wage upward toward $25.", SUBTOPICS.demandShifts, { asset: "LABOR-02.webp" });
g("Which part of the graph shows that this is a shift rather than movement along labor demand?", "Two demand curves appear while labor supply is unchanged", ["The wage axis is vertical", "The new equilibrium has a dot", "The supply curve slopes upward"], "FM.12", "graph_trap", "labor_demand_shift_identification", "D L0 and D L1 show different quantities demanded at a given wage. That is a change in demand, not movement on one curve.", SUBTOPICS.derivedDemand, { asset: "LABOR-02.webp" });
g("Why does employment rise by less than the horizontal distance between the two demand curves at $20?", "The wage rises as the market moves along labor supply", ["Labor supply shifts left", "The graph measures firms rather than workers", "Higher wages eliminate derived demand"], "FM.6", "graph_integration", "equilibrium_adjustment_labor_demand", "The demand shift creates a shortage at $20. Wage bidding moves the market up along labor supply until the new equilibrium is reached at $25.", SUBTOPICS.demandShifts, { asset: "LABOR-02.webp" });

// LABOR-03: nine labor-demand decrease questions.
g("After orchard labor demand shifts left, what equilibrium does the graph show?", "2,000 workers at $15 per hour", ["4,000 workers at $20 per hour", "2,000 workers at $25 per hour", "6,000 workers at $15 per hour"], "FM.6", "graph_interpretation", "labor_demand_decrease_equilibrium", "The solid D L1 curve intersects supply at 20 hundreds of workers and $15 per hour.", SUBTOPICS.demandShifts, { asset: "LABOR-03.webp" });
g("What happens to orchard wages and employment when demand shifts from D L0 to D L1?", "Both the equilibrium wage and employment fall", ["The wage rises and employment falls", "The wage falls and employment rises", "Both outcomes rise"], "FM.6", "graph_interpretation", "labor_demand_decrease_comparative_statics", "The marked equilibrium moves from 4,000 workers at $20 to 2,000 at $15, lowering both outcomes.", SUBTOPICS.demandShifts, { asset: "LABOR-03.webp" });
g("How large is the fall in orchard employment?", "2,000 workers", ["200 workers", "4,000 workers", "6,000 workers"], "FM.6", "graph_calculation", "labor_employment_change", "Employment declines from 4,000 to 2,000 workers, a reduction of 2,000.", SUBTOPICS.demandShifts, { asset: "LABOR-03.webp" });
g("The price of apples falls. Which visible change is consistent with lower worker VMP?", "Labor demand shifts left to D L1", ["Labor supply shifts right", "The market moves up D L0", "Labor demand shifts right"], "FM.12", "graph_integration", "output_price_labor_demand", "A lower output price reduces the dollar value of workers' marginal product and shifts labor demand left, as shown.", SUBTOPICS.derivedDemand, { asset: "LABOR-03.webp" });
g("A disease reduces each orchard worker's harvest. How does the graph translate that productivity loss?", "Lower productivity shifts labor demand left", ["Lower productivity shifts labor supply left", "The wage change alone shifts demand", "Employment rises at every wage"], "FM.12", "graph_integration", "productivity_labor_demand", "With less output per worker, the value of marginal product falls at each employment level, reducing labor demand.", SUBTOPICS.derivedDemand, { asset: "LABOR-03.webp" });
g("At the old $20 wage after demand falls, what imbalance appears?", "Labor supplied exceeds labor demanded", ["Labor demanded exceeds labor supplied", "The new market is already in equilibrium", "Both curves shift right"], "FM.6", "graph_interpretation", "demand_shift_labor_surplus", "At $20, D L1 lies left of labor supply. The resulting surplus of workers puts downward pressure on the wage.", SUBTOPICS.demandShifts, { asset: "LABOR-03.webp" });
g("By how much does the marked equilibrium wage fall?", "$5 per hour", ["$2 per hour", "$15 per hour", "$20 per hour"], "FM.6", "graph_calculation", "labor_wage_change", "The equilibrium wage declines from $20 to $15 per hour, a $5 decrease.", SUBTOPICS.demandShifts, { asset: "LABOR-03.webp" });
g("Why is the solid D L1 curve not merely the result of a lower wage?", "A wage change would move the market along one demand curve", ["Wages never affect labor demanded", "A lower wage shifts labor supply only", "Demand curves cannot slope downward"], "FM.12", "graph_trap", "movement_vs_shift_labor_demand", "The graph displays a new demand curve. A wage change changes quantity demanded along the existing curve rather than relocating the curve.", SUBTOPICS.derivedDemand, { asset: "LABOR-03.webp" });
g("Which adjustment carries the market from the old to the new orchard equilibrium?", "A worker surplus pushes the wage down while employment contracts", ["A worker shortage pushes the wage up", "Labor supply shifts left to preserve employment", "Firms move right along D L0"], "FM.6", "graph_integration", "labor_demand_decrease_adjustment", "The leftward demand shift creates excess labor supply at $20. Wage pressure moves the market to 2,000 workers at $15.", SUBTOPICS.demandShifts, { asset: "LABOR-03.webp" });

// LABOR-04: eight labor-supply increase questions.
g("After healthcare labor supply shifts right, what is the new equilibrium?", "6,000 workers at $15 per hour", ["4,000 workers at $20 per hour", "2,000 workers at $25 per hour", "6,000 workers at $25 per hour"], "FM.9", "graph_interpretation", "labor_supply_increase_equilibrium", "The solid S L1 curve intersects demand at 6,000 healthcare workers and $15 per hour.", SUBTOPICS.supplyShifts, { asset: "LABOR-04.webp" });
g("How do the equilibrium wage and employment change when healthcare labor supply increases?", "The wage falls and employment rises", ["The wage rises and employment falls", "Both outcomes rise", "Both outcomes fall"], "FM.9", "graph_interpretation", "labor_supply_increase_comparative_statics", "The equilibrium moves from 4,000 workers at $20 to 6,000 at $15, so employment rises while the wage falls.", SUBTOPICS.supplyShifts, { asset: "LABOR-04.webp" });
g("A licensing reform lets more trained healthcare workers enter the occupation. Which curve change fits the graph?", "Labor supply shifts from S L0 to S L1", ["Labor demand shifts left", "There is movement up S L0", "Both curves shift right"], "FM.8", "graph_integration", "labor_supply_entry", "Easier occupational entry increases the number willing and able to work at each wage, matching the rightward supply shift.", SUBTOPICS.supplyShifts, { asset: "LABOR-04.webp" });
g("How many additional healthcare workers are employed at the new equilibrium?", "2,000 workers", ["200 workers", "4,000 workers", "6,000 workers"], "FM.9", "graph_calculation", "labor_employment_change", "Employment rises from 4,000 to 6,000, so 2,000 additional workers are employed.", SUBTOPICS.supplyShifts, { asset: "LABOR-04.webp" });
g("At the old $20 wage after supply increases, what imbalance appears?", "More workers seek jobs than firms want to hire", ["Firms seek more workers than are available", "The market stays at the old equilibrium", "Labor demand shifts right"], "FM.9", "graph_interpretation", "supply_shift_labor_surplus", "At $20, S L1 lies to the right of labor demand. The worker surplus pushes wages downward.", SUBTOPICS.supplyShifts, { asset: "LABOR-04.webp" });
g("Expanded nursing programs graduate more workers. Why is that a supply shift rather than movement along supply?", "The number of qualified workers changes at every wage", ["The equilibrium wage changes", "Labor demand slopes downward", "Hospitals use derived demand"], "FM.8", "graph_integration", "labor_supply_training", "Training expands the qualified workforce, altering labor supplied at a given wage and shifting the entire curve.", SUBTOPICS.supplyShifts, { asset: "LABOR-04.webp" });
g("By how much does the equilibrium healthcare wage decline?", "$5 per hour", ["$2 per hour", "$15 per hour", "$20 per hour"], "FM.9", "graph_calculation", "labor_wage_change", "The wage falls from $20 to $15 per hour, a $5 decline.", SUBTOPICS.supplyShifts, { asset: "LABOR-04.webp" });
g("Which feature demonstrates that labor demand did not change?", "The same D L curve passes through both equilibrium adjustments", ["The wage falls", "The new supply curve is solid", "The horizontal axis uses hundreds"], "FM.8", "graph_trap", "labor_supply_shift_identification", "The blue demand curve is unchanged. Both equilibria are evaluated against that same market labor-demand schedule.", SUBTOPICS.supplyShifts, { asset: "LABOR-04.webp" });

// LABOR-05: eight labor-supply decrease questions.
g("What is the new construction labor-market equilibrium after supply shifts left?", "2,000 workers at $25 per hour", ["4,000 workers at $20 per hour", "6,000 workers at $15 per hour", "2,000 workers at $15 per hour"], "FM.9", "graph_interpretation", "labor_supply_decrease_equilibrium", "The solid S L1 curve intersects demand at 2,000 construction workers and $25 per hour.", SUBTOPICS.supplyShifts, { asset: "LABOR-05.webp" });
g("How does the supply decrease affect construction wages and employment?", "The wage rises and employment falls", ["The wage falls and employment rises", "Both outcomes rise", "Both outcomes fall"], "FM.9", "graph_interpretation", "labor_supply_decrease_comparative_statics", "The equilibrium moves from 4,000 workers at $20 to 2,000 at $25.", SUBTOPICS.supplyShifts, { asset: "LABOR-05.webp" });
g("Many construction workers leave the region. Which graph change represents that event?", "Labor supply shifts from S L0 to S L1", ["Labor demand shifts right", "There is movement down S L0", "Labor demand shifts left"], "FM.8", "graph_integration", "labor_supply_migration", "Worker exit reduces the number available at each wage, shifting labor supply left.", SUBTOPICS.supplyShifts, { asset: "LABOR-05.webp" });
g("How many fewer construction workers are employed after the shift?", "2,000 workers", ["200 workers", "4,000 workers", "6,000 workers"], "FM.9", "graph_calculation", "labor_employment_change", "Employment falls from 4,000 to 2,000 workers, a decline of 2,000.", SUBTOPICS.supplyShifts, { asset: "LABOR-05.webp" });
g("At the old $20 wage after supply contracts, what does the graph imply?", "Firms want more workers than are available", ["More workers seek jobs than firms want", "The market remains at equilibrium", "Demand shifts left"], "FM.9", "graph_interpretation", "supply_shift_labor_shortage", "At $20, quantity demanded exceeds labor supplied on S L1. Employer competition pushes the wage upward.", SUBTOPICS.supplyShifts, { asset: "LABOR-05.webp" });
g("Improved job opportunities in another industry draw workers away from construction. Why does S L1 fit?", "The outside option reduces construction labor supplied at each wage", ["It raises construction labor demand", "It causes movement up the old supply curve", "It makes worker productivity zero"], "FM.8", "graph_integration", "alternative_jobs_labor_supply", "A more attractive alternative occupation reduces the number willing to work in construction at any given construction wage.", SUBTOPICS.supplyShifts, { asset: "LABOR-05.webp" });
g("How much higher is the new equilibrium hourly wage?", "$5 per hour", ["$2 per hour", "$20 per hour", "$25 per hour"], "FM.9", "graph_calculation", "labor_wage_change", "The wage rises from $20 to $25 per hour, an increase of $5.", SUBTOPICS.supplyShifts, { asset: "LABOR-05.webp" });
g("What distinguishes the leftward supply shift from a wage-induced change in labor supplied?", "The graph shows a different supply curve at the same possible wages", ["Employment falls", "Demand slopes downward", "The wage is measured hourly"], "FM.8", "graph_trap", "movement_vs_shift_labor_supply", "S L0 and S L1 give different quantities supplied at a given wage. A wage change alone would move along one curve.", SUBTOPICS.supplyShifts, { asset: "LABOR-05.webp" });

// LABOR-06: seven binding-minimum-wage questions kept proportional.
g("Why is the $20 minimum wage binding in the restaurant market shown?", "It is above the $15 competitive wage", ["It is below the competitive wage", "It equals labor demand", "It shifts labor supply right"], "FM.10", "graph_interpretation", "binding_minimum_wage", "The demand-supply intersection gives a $15 market-clearing wage. A legal floor at $20 therefore constrains the market.", SUBTOPICS.applications, { asset: "LABOR-06.webp" });
g("At the $20 wage floor, how many restaurant workers do firms want to hire?", "2,000 workers", ["200 workers", "4,000 workers", "6,000 workers"], "FM.11", "graph_interpretation", "minimum_wage_labor_demanded", "The wage-floor line meets labor demand at 20 hundreds of workers, or 2,000 workers.", SUBTOPICS.applications, { asset: "LABOR-06.webp" });
g("How many workers seek restaurant jobs at the minimum wage?", "6,000 workers", ["600 workers", "2,000 workers", "4,000 workers"], "FM.11", "graph_interpretation", "minimum_wage_labor_supplied", "The $20 line intersects labor supply at 60 hundreds of workers, or 6,000 workers.", SUBTOPICS.applications, { asset: "LABOR-06.webp" });
g("What labor surplus does the $20 floor create in the textbook model?", "4,000 workers", ["400 workers", "2,000 workers", "6,000 workers"], "FM.10", "graph_calculation", "minimum_wage_labor_surplus", "Labor supplied is 6,000 and labor demanded is 2,000, leaving a surplus of 4,000 workers.", SUBTOPICS.applications, { asset: "LABOR-06.webp" });
g("If employment cannot exceed firms' quantity demanded, what employment level follows at the floor?", "2,000 workers", ["4,000 workers", "6,000 workers", "8,000 workers"], "FM.11", "graph_integration", "minimum_wage_employment", "At $20, firms demand 2,000 workers. Willingness of 6,000 people to work does not create additional jobs.", SUBTOPICS.applications, { asset: "LABOR-06.webp" });
g("Compared with the competitive outcome, what changes at the binding floor?", "The wage rises and employment falls", ["The wage falls and employment rises", "Both wage and employment rise", "Neither outcome changes"], "FM.11", "graph_integration", "minimum_wage_comparative_statics", "The market moves from 4,000 workers at $15 to employment limited by 2,000 workers demanded at $20.", SUBTOPICS.applications, { asset: "LABOR-06.webp" });
g("A student calls 6,000 workers the employment level at the floor. What graph-based correction is needed?", "That is labor supplied; firms demand only 2,000 workers", ["That is labor demanded; supply is 2,000", "The floor creates 6,000 new jobs", "The competitive equilibrium is 6,000 workers"], "FM.10", "graph_trap", "minimum_wage_quantity_distinction", "The right intersection measures people willing to work. Actual transactions are limited by the short side, labor demanded at 2,000.", SUBTOPICS.applications, { asset: "LABOR-06.webp" });

// LABOR-07: four nonbinding-minimum-wage questions.
g("How should the $10 minimum wage in the graph be classified?", "Nonbinding because it is below the $15 equilibrium wage", ["Binding because it is above zero", "Binding because labor demand slopes down", "An equilibrium wage of $10"], "FM.10", "graph_interpretation", "nonbinding_minimum_wage", "The legal floor lies below the market-clearing wage, so firms and workers continue to trade at the $15 equilibrium.", SUBTOPICS.applications, { asset: "LABOR-07.webp" });
g("What market outcome remains after the $10 floor is imposed?", "4,000 workers at $15 per hour", ["2,000 workers at $10 per hour", "6,000 workers at $10 per hour", "4,000 workers at $10 per hour"], "FM.11", "graph_interpretation", "nonbinding_floor_outcome", "Because the floor is below equilibrium, the intersection at 4,000 workers and $15 remains feasible and unchanged.", SUBTOPICS.applications, { asset: "LABOR-07.webp" });
g("Why does the graph not imply a labor surplus caused by this policy?", "The market wage already exceeds the legal minimum", ["Labor supply is perfectly elastic", "Labor demand shifts right", "The legal minimum removes scarcity"], "FM.10", "graph_integration", "nonbinding_floor_no_surplus", "The $15 equilibrium satisfies a requirement to pay at least $10, so the floor does not constrain wage setting.", SUBTOPICS.applications, { asset: "LABOR-07.webp" });
g("Which change would make the wage floor binding, holding the curves fixed?", "Raise it above $15 per hour", ["Lower it below $10", "Move it to zero", "Keep it at $10"], "FM.11", "graph_trap", "binding_threshold", "A floor affects the competitive outcome only when it is set above the $15 market-clearing wage.", SUBTOPICS.applications, { asset: "LABOR-07.webp" });

// LABOR-08: four limited monopsony questions.
g("Where does the monopsony choose nursing employment?", "4,000 nurses, where MFC equals MRP", ["6,000 nurses, where supply equals MRP", "4,000 nurses, where supply equals MRP", "8,000 nurses, where MFC equals supply"], "FM.2", "graph_interpretation", "monopsony_employment", "The employer equates marginal factor cost with marginal revenue product at 40 hundreds of nurses, or 4,000.", SUBTOPICS.applications, { asset: "LABOR-08.webp" });
g("After choosing 4,000 nurses, what hourly wage does the monopsony pay?", "$20 per hour, read from labor supply", ["$30 per hour, read from MFC", "$25 per hour, read from the competitive intersection", "$40 per hour, read from MRP"], "FM.2", "graph_trap", "monopsony_wage", "MFC equals MRP at an employment of 4,000, but the wage paid is found on labor supply at that quantity: $20 per hour.", SUBTOPICS.applications, { asset: "LABOR-08.webp" });
g("What competitive outcome is shown for the nursing market?", "6,000 nurses at $25 per hour", ["4,000 nurses at $20 per hour", "4,000 nurses at $30 per hour", "8,000 nurses at $25 per hour"], "FM.11", "graph_interpretation", "competitive_vs_monopsony", "Labor supply intersects MRP at 60 hundreds of nurses and $25 per hour, the competitive benchmark.", SUBTOPICS.applications, { asset: "LABOR-08.webp" });
g("How does the monopsony outcome compare with competition in this graph?", "It has lower employment and a lower wage", ["It has higher employment and a higher wage", "It has lower employment and a higher wage", "It has the same wage and employment"], "FM.11", "graph_integration", "monopsony_comparison", "The monopsony hires 4,000 nurses at $20, compared with 6,000 at $25 under competition.", SUBTOPICS.applications, { asset: "LABOR-08.webp" });

// LABOR-09: five simultaneous-shift questions.
g("After both nursing labor curves shift, what new equilibrium does the graph show?", "8,000 nurses at $20 per hour", ["4,000 nurses at $20 per hour", "8,000 nurses at $40 per hour", "6,000 nurses at $25 per hour"], "FM.6", "graph_interpretation", "simultaneous_labor_shifts", "The solid curves intersect at 80 hundreds of nurses, or 8,000, and the wage remains $20.", SUBTOPICS.demandShifts, { asset: "LABOR-09.webp" });
g("What happens to nursing employment and wages in this particular simultaneous-shift case?", "Employment rises while the equilibrium wage is unchanged", ["Employment falls while the wage rises", "Both employment and wage rise", "Both employment and wage fall"], "FM.9", "graph_interpretation", "simultaneous_labor_shift_outcome", "The equilibrium moves horizontally from 4,000 to 8,000 nurses while staying at $20 per hour.", SUBTOPICS.supplyShifts, { asset: "LABOR-09.webp" });
g("Why is an unchanged wage consistent with major market change here?", "The demand and supply increases offset in their wage effects", ["Neither curve moved", "Employment is fixed by law", "A wage cannot change when supply rises"], "FM.6", "graph_integration", "simultaneous_shift_wage_offset", "Higher labor demand tends to raise wages, while higher labor supply tends to lower them. In the displayed magnitudes those effects offset.", SUBTOPICS.demandShifts, { asset: "LABOR-09.webp" });
g("By how much does nursing employment increase?", "4,000 nurses", ["400 nurses", "2,000 nurses", "8,000 nurses"], "FM.9", "graph_calculation", "simultaneous_shift_employment_change", "Employment rises from 4,000 to 8,000 nurses, an increase of 4,000.", SUBTOPICS.supplyShifts, { asset: "LABOR-09.webp" });
g("What conclusion is justified by the graph, but not by simultaneous increases in every possible case?", "The equilibrium wage happens to remain $20", ["Employment must fall", "Labor demand must be derived", "Supply and demand cannot shift together"], "FM.11", "graph_trap", "simultaneous_shift_ambiguity", "Employment rises when both curves increase, but the wage effect is generally ambiguous. This graph's equal $20 wages reflect the particular shift sizes shown.", SUBTOPICS.equilibrium, { asset: "LABOR-09.webp" });

if (G.length !== 64) throw new Error(`Expected 64 graph questions; found ${G.length}.`);

const N = [];
const n = (...args) => N.push(row(...args));

// FM.1: twenty diminishing-MPL questions.
const diminishingCases = [
  ["restaurant kitchen", 18, 13, "meals"], ["warehouse packing line", 24, 19, "orders"],
  ["apple orchard", 16, 11, "crates"], ["landscaping crew", 9, 6, "yards"],
  ["furniture workshop", 12, 8, "tables"], ["delivery center", 30, 22, "parcels"],
  ["construction crew", 10, 7, "wall sections"], ["bakery", 20, 14, "trays"],
  ["greenhouse", 15, 10, "plant flats"], ["repair shop", 8, 5, "repairs"],
  ["seafood packing plant", 25, 17, "cases"], ["solar installation crew", 7, 4, "arrays"],
  ["printing shop", 40, 31, "print runs"], ["hotel housekeeping team", 11, 8, "rooms"],
  ["coffee roastery", 14, 9, "batches"], ["machine shop", 6, 3, "parts"],
  ["farm harvest crew", 28, 20, "bins"], ["catering company", 13, 9, "events"],
  ["bottling line", 35, 27, "cases"], ["roofing crew", 8, 6, "roof sections"]
];
diminishingCases.forEach(([place, prior, next, unit], i) => {
  const stems = [
    `At a ${place}, one worker adds ${prior} ${unit} per shift and the next adds ${next}. What does the comparison show?`,
    `A ${place} expands its crew. The latest worker adds ${next} ${unit}, down from ${prior} for the worker before. How should the manager interpret this?`,
    `With equipment and floor space fixed, marginal output at a ${place} falls from ${prior} to ${next} ${unit} as another worker joins. What principle is operating?`,
    `The ${place} still produces more after hiring, but the added output falls from ${prior} to ${next} ${unit}. Which conclusion follows?`
  ];
  n(stems[i % stems.length], "Marginal product is diminishing even though total product may still rise", ["Total product must be falling", "The latest worker has negative marginal product", "Average product must equal marginal product"], "FM.1", i % 5 === 0 ? "interpretation" : "application", "diminishing_marginal_product", `The added worker still contributes ${next} ${unit}, so total product can rise. The smaller increment relative to ${prior} is diminishing marginal product.`, SUBTOPICS.production, i === 18 ? { support: "repair" } : i === 19 ? { support: "bridge" } : {});
});

// FM.2: twenty nongraph VMP/wage hiring decisions (two graph records complete the objective).
const hiringCases = [
  ["bakery", 6, 8, 42, "loaves"], ["warehouse", 5, 10, 44, "orders"],
  ["orchard", 4, 12, 50, "crates"], ["car wash", 3, 15, 40, "cars"],
  ["furniture shop", 2, 30, 55, "chairs"], ["landscaper", 4, 14, 60, "lawns"],
  ["printer", 8, 7, 52, "jobs"], ["food truck", 10, 5, 46, "meals"],
  ["repair shop", 2, 35, 72, "repairs"], ["greenhouse", 7, 6, 38, "plant trays"],
  ["delivery depot", 9, 6, 50, "deliveries"], ["machine shop", 3, 24, 68, "parts"],
  ["catering firm", 5, 11, 58, "orders"], ["bottling plant", 12, 4, 45, "cases"],
  ["solar installer", 1, 90, 85, "installations"], ["laundry service", 8, 5, 44, "loads"],
  ["coffee roaster", 4, 16, 64, "batches"], ["nursery", 6, 9, 60, "flats"],
  ["cabinet shop", 2, 28, 50, "cabinets"], ["packing plant", 10, 6, 65, "cases"]
];
hiringCases.forEach(([firm, mpl, price, wage, unit], i) => {
  const vmp = mpl * price;
  const hire = vmp > wage;
  const equal = vmp === wage;
  const answer = equal ? "The firm is at the marginal hiring condition because VMP equals the wage" : hire ? "Hire the worker because VMP exceeds the wage" : "Do not hire the worker because VMP is below the wage";
  const stems = [
    `A worker at a ${firm} adds ${mpl} ${unit} per hour, each worth $${price}. The wage is $${wage}. What should the competitive firm do?`,
    `The ${firm}'s next worker has an MPL of ${mpl} ${unit}, and output sells for $${price} per unit. At a $${wage} wage, is the hire profitable?`,
    `For the next worker, a ${firm} estimates ${mpl} additional ${unit} at $${price} each. Compare that contribution with the $${wage} hourly wage.`,
    `At a ${firm}, the marginal worker produces value from ${mpl} extra ${unit} sold for $${price} apiece. How does a $${wage} wage affect the hiring decision?`
  ];
  n(stems[i % 4], answer, ["Hire whenever marginal product is positive", "Compare total output with the wage instead", hire || equal ? "Do not hire because the wage is a fixed cost" : "Hire because any positive VMP raises profit"], "FM.2", i % 4 === 1 ? "calculation" : "application", "vmp_wage_hiring_rule", `The worker's VMP is $${vmp} per hour (${mpl} × $${price}). ${equal ? "That equals the wage, which is the marginal hiring condition." : hire ? `Because $${vmp} exceeds $${wage}, the added value is greater than labor cost.` : `Because $${vmp} is below $${wage}, the worker costs more than the added output value.`}`, SUBTOPICS.firmDecision, i === 18 ? { support: "repair" } : i === 19 ? { support: "bridge" } : {});
});

// FM.3: eighteen direct VMP calculations with interpretation.
const vmpCases = [
  ["bakery", 7, 6, "loaves"], ["orchard", 5, 9, "crates"], ["warehouse", 8, 7, "orders"],
  ["cabinet shop", 3, 24, "doors"], ["greenhouse", 10, 4, "plant flats"], ["repair garage", 2, 45, "repairs"],
  ["coffee roastery", 6, 11, "batches"], ["printing company", 9, 5, "jobs"], ["delivery hub", 12, 4, "routes"],
  ["furniture plant", 4, 18, "chairs"], ["landscaping firm", 3, 20, "yards"], ["bottling line", 15, 3, "cases"],
  ["seafood processor", 8, 8, "boxes"], ["solar crew", 2, 40, "panels"], ["laundry", 11, 5, "loads"],
  ["catering kitchen", 5, 13, "orders"], ["machine shop", 4, 22, "parts"], ["farm stand", 9, 7, "baskets"]
];
vmpCases.forEach(([firm, mpl, price, unit], i) => {
  const value = mpl * price;
  const distractorValues = [...new Set([mpl, price, mpl + price, value + price, value - mpl])].filter(candidate => candidate !== value).slice(0, 3);
  const stems = [
    `A ${firm} worker adds ${mpl} ${unit} per hour, and each sells for $${price}. What is the worker's VMP?`,
    `The marginal product of a worker at a ${firm} is ${mpl} ${unit}. With an output price of $${price}, calculate the value of marginal product.`,
    `One more worker lets a ${firm} sell ${mpl} additional ${unit} at $${price} each. How much value does that worker add per hour?`
  ];
  n(stems[i % 3], `$${value} per hour`, distractorValues.map(candidate => `$${candidate} per hour`), "FM.3", "calculation", "calculate_value_marginal_product", `VMP equals output price times MPL: $${price} × ${mpl} = $${value} per hour. MPL is physical output; VMP expresses that contribution in dollars.`, SUBTOPICS.marginalValue);
});

// FM.4: eighteen MPL calculations, including multiworker changes.
const mplCases = [
  ["bakery", 4, 5, 120, 138, "loaves"], ["warehouse", 6, 7, 210, 234, "orders"],
  ["orchard", 8, 9, 300, 316, "crates"], ["printer", 3, 4, 72, 84, "jobs"],
  ["machine shop", 5, 6, 90, 99, "parts"], ["greenhouse", 10, 11, 250, 264, "flats"],
  ["delivery depot", 12, 13, 420, 450, "parcels"], ["restaurant", 7, 8, 160, 180, "meals"],
  ["furniture shop", 4, 6, 80, 106, "chairs"], ["landscaping crew", 3, 5, 42, 58, "yards"],
  ["laundry", 6, 8, 150, 174, "loads"], ["bottling line", 10, 12, 500, 550, "cases"],
  ["solar crew", 5, 6, 24, 30, "installations"], ["catering firm", 8, 10, 96, 118, "orders"],
  ["repair shop", 4, 5, 35, 43, "repairs"], ["farm crew", 9, 12, 270, 306, "bins"],
  ["coffee roastery", 3, 4, 48, 55, "batches"], ["packing plant", 14, 16, 630, 676, "boxes"]
];
mplCases.forEach(([firm, l0, l1, q0, q1, unit], i) => {
  const mpl = (q1 - q0) / (l1 - l0);
  const stems = [
    `A ${firm} increases labor from ${l0} to ${l1} workers, and output rises from ${q0} to ${q1} ${unit}. What is MPL over this change?`,
    `Output at a ${firm} rises from ${q0} to ${q1} ${unit} when staffing rises from ${l0} to ${l1}. Calculate marginal product per added worker.`,
    `The ${firm} adds ${l1 - l0} worker${l1 - l0 === 1 ? "" : "s"} and gains ${q1 - q0} ${unit} of output. What is the marginal product per worker?`
  ];
  n(stems[i % 3], `${mpl} ${unit} per added worker`, [`${q1 - q0} total additional ${unit}`, `${q1} total ${unit}`, `${Math.round((q1 / l1) * 10) / 10} ${unit} per worker`], "FM.4", "calculation", "calculate_marginal_product_labor", `MPL is the change in output divided by the change in labor: (${q1} − ${q0}) ÷ (${l1} − ${l0}) = ${mpl} ${unit} per added worker.`, SUBTOPICS.production);
});

// FM.5: twenty movement-versus-shift diagnoses.
const demandChangeCases = [
  ["The hourly wage for warehouse workers falls", "Movement down the existing labor-demand curve", "wage"],
  ["A new scanner raises warehouse-worker productivity", "A rightward shift of labor demand", "productivity"],
  ["Restaurant wages rise while menu demand is unchanged", "Movement up the existing labor-demand curve", "wage"],
  ["The market price of restaurant meals rises", "A rightward shift of restaurant labor demand", "output price"],
  ["Apple prices fall in a competitive orchard market", "A leftward shift of orchard labor demand", "output price"],
  ["The construction wage declines", "Movement down construction labor demand", "wage"],
  ["Better tools raise each carpenter's marginal product", "A rightward shift of carpenter labor demand", "productivity"],
  ["Demand for printed catalogs falls", "A leftward shift of printer labor demand", "product demand"],
  ["The wage for delivery drivers rises", "Movement up the delivery-driver demand curve", "wage"],
  ["Online orders make delivery services more valuable", "A rightward shift of driver labor demand", "product demand"],
  ["A drought lowers farm-worker marginal product", "A leftward shift of farm labor demand", "productivity"],
  ["The hourly wage for machine operators falls", "Movement down the machine-operator demand curve", "wage"],
  ["The price of machined parts increases", "A rightward shift of machine-operator demand", "output price"],
  ["A software tool substitutes for routine bookkeeping labor", "A leftward shift of bookkeeping labor demand", "substitute input"],
  ["The wage paid to hotel housekeepers increases", "Movement up the existing housekeeping labor-demand curve", "wage"],
  ["Tourism demand raises the price of hotel rooms", "A rightward shift of housekeeping labor demand", "output demand"],
  ["A bottling plant's worker wage falls", "Movement down its labor-demand curve", "wage"],
  ["Faster bottling equipment complements line workers and raises their MPL", "A rightward shift of line-worker demand", "complementary capital"],
  ["The market wage for landscapers rises", "Movement up the landscaper demand curve", "wage"],
  ["Homeowners cut spending on landscaping services", "A leftward shift of landscaper labor demand", "product demand"]
];
demandChangeCases.forEach(([event, answer, cause], i) => {
  n(`${event}. How should the firm's labor-demand response be represented?`, answer, [answer.includes("Movement") ? "A shift of labor demand" : "Movement along the original labor-demand curve", "A shift of labor supply", "No change in the firm's labor choice"], "FM.5", "interpretation", "movement_vs_shift_labor_demand", `${cause === "wage" ? "The wage is the price of labor, so changing it changes quantity of labor demanded along the existing curve." : `The ${cause} changes the value of labor at a given wage, so the labor-demand curve shifts.`}`, SUBTOPICS.derivedDemand, i === 18 ? { support: "repair" } : i === 19 ? { support: "bridge" } : {});
});

// FM.6: six nongraph labor-demand comparative-statics questions.
[
  ["A rise in demand for home renovations increases contractors' demand for electricians", "The equilibrium electrician wage and employment both rise"],
  ["A fall in airline travel reduces airlines' demand for baggage handlers", "The equilibrium wage and employment both fall"],
  ["New diagnostic equipment raises technicians' productivity and labor demand", "Technician wages and employment rise"],
  ["Lower crop prices reduce farms' demand for seasonal labor", "Seasonal wages and employment fall"],
  ["More restaurants open in a city and each demands kitchen labor", "Market labor demand shifts right, raising wage and employment"],
  ["Several furniture plants close, reducing market demand for upholsterers", "The wage and employment of upholsterers fall"]
].forEach(([event, answer], i) => n(`${event}. With labor supply unchanged, what happens in the competitive labor market?`, answer, ["The wage rises and employment falls", "The wage falls and employment rises", "Only the number of workers willing to work changes"], "FM.6", i % 2 ? "integration" : "application", "labor_demand_equilibrium_effect", `The event shifts labor demand ${answer.includes("rise") || answer.includes("right") ? "right" : "left"}. With labor supply unchanged, the equilibrium wage and employment move in the same direction as labor demand.`, SUBTOPICS.demandShifts));

// FM.7: sixteen relationships among factor markets.
const factorRelations = [
  ["A restaurant adds ovens that let cooks prepare more meals per hour", "Ovens and cooks are complements here, so cook MPL and labor demand rise"],
  ["A warehouse installs robots that perform the same sorting tasks as entry-level workers", "Robots substitute for that labor, so demand for those workers falls"],
  ["A clinic hires more physicians, which makes each medical technician more productive", "Physicians and technicians are complements, raising technician demand"],
  ["A farm loses irrigation capacity, reducing what its field workers can harvest", "Less complementary capital lowers worker MPL and labor demand"],
  ["A design firm gains access to faster computers that raise designer output", "Computer capital raises the marginal product and demand for designers"],
  ["Self-checkout machines replace routine cashier tasks", "Capital substitutes for cashier labor and reduces cashier demand"],
  ["A construction boom increases firms' use of both cranes and crane operators", "Output expansion raises derived demand for complementary capital and labor"],
  ["More delivery trucks make drivers more productive", "Truck capital and drivers are complements in the stated production process"],
  ["Speech-recognition software performs work formerly done by transcriptionists", "Software substitutes for transcription labor"],
  ["More laboratory space allows researchers to run additional experiments", "Labor and laboratory space are complements here"],
  ["A factory replaces manual welding with fully automated welding cells", "Automation substitutes for manual welders in this task"],
  ["A hotel opens another building and needs more housekeepers and maintenance workers", "Expanded productive capacity raises demand for multiple complementary inputs"],
  ["A mine closes access to a productive deposit", "Less usable land or natural resources can reduce demand for mining labor and equipment"],
  ["A hospital's nursing shortage leaves operating rooms idle", "Scarce complementary labor can reduce the marginal value of operating-room capital"],
  ["A firm can use either paralegals or document-review software for the same task", "The scenario identifies software and paralegal labor as substitutes"],
  ["Engineers become more effective when supported by skilled technicians", "The two labor types are complements in this production setting"]
];
factorRelations.forEach(([event, answer], i) => n(`${event}. What relationship among productive inputs does the scenario imply?`, answer, ["All factors must be substitutes", "All factors must be complements", "Only the wage can affect factor demand"], "FM.7", i % 4 === 3 ? "integration" : "application", "factor_market_relationships", `${answer}. Factor relationships depend on the production process described; they are not universally substitutes or complements.`, SUBTOPICS.factorLinks, i === 14 ? { support: "repair" } : i === 15 ? { support: "bridge" } : {}));

// FM.8: twelve nongraph labor-supply determinants (six graph records complete the objective).
const supplyDeterminants = [
  ["A city attracts many licensed nurses from other regions", "Nursing labor supply shifts right"],
  ["A new training program lowers the cost of becoming an electrician", "Electrician labor supply shifts right over time"],
  ["Safer working conditions make mining jobs more attractive at each wage", "Mining labor supply shifts right"],
  ["Remote-work options make software jobs more attractive to qualified workers", "Labor supply to those jobs shifts right"],
  ["A neighboring industry raises wages while local factory wages are unchanged", "Factory labor supply shifts left"],
  ["A licensing rule becomes more restrictive for dental hygienists", "Hygienist labor supply shifts left"],
  ["Population growth expands the number of working-age residents", "Market labor supply tends to shift right"],
  ["Many construction workers retire and few replacements enter", "Construction labor supply shifts left"],
  ["Workers come to value flexible schedules offered by one occupation", "Labor supply to that occupation shifts right"],
  ["Childcare becomes less available for local workers", "Labor supply may shift left when fewer people can take jobs"],
  ["The wage for restaurant work rises with nonwage conditions unchanged", "Quantity of restaurant labor supplied rises along the existing curve"],
  ["The wage for delivery work falls with all supply determinants unchanged", "Quantity of delivery labor supplied falls along the existing curve"]
];
supplyDeterminants.forEach(([event, answer], i) => n(`${event}. What happens to labor supply?`, answer, [answer.includes("along") ? "The labor-supply curve shifts" : "There is movement along an unchanged labor-supply curve", "Labor demand necessarily shifts in the same direction", "Worker productivity must fall"], "FM.8", "application", "labor_supply_determinants", `${event.includes("wage") ? "A change in the occupation's wage causes movement along its labor-supply curve." : "This nonwage determinant changes how many workers are willing or able to work at a given wage, shifting labor supply."}`, SUBTOPICS.supplyShifts));

// FM.9: six nongraph labor-supply comparative-statics questions.
[
  ["An influx of qualified nurses increases nursing labor supply", "The equilibrium wage falls and nursing employment rises"],
  ["Many electricians retire, reducing labor supply", "The equilibrium wage rises and electrician employment falls"],
  ["Better job amenities attract more applicants to teaching", "Teacher employment rises while the equilibrium wage falls"],
  ["Stricter licensing reduces the supply of dental assistants", "The wage rises and employment falls"],
  ["A training subsidy expands the supply of technicians", "Technician wages fall and employment rises"],
  ["Improved outside opportunities pull workers out of food processing", "Food-processing wages rise while employment falls"]
].forEach(([event, answer], i) => n(`${event}. With labor demand unchanged, what is the new competitive-market direction?`, answer, ["Both wage and employment rise", "Both wage and employment fall", "The wage changes but employment cannot change"], "FM.9", i % 2 ? "integration" : "application", "labor_supply_equilibrium_effect", `A labor-supply ${answer.includes("falls") && answer.includes("rises") ? (event.includes("increases") || event.includes("attract") || event.includes("expands") ? "increase" : "decrease") : "change"} moves wage and employment in opposite directions when labor demand is unchanged.`, SUBTOPICS.supplyShifts));

// FM.10: eight nongraph factor-market equilibrium questions.
const equilibriumCases = [
  ["commercial land", 50, 70, "$2,000 per acre", "a shortage of 20 acres"],
  ["machine rentals", 90, 60, "$300 per day", "a surplus of 30 machines"],
  ["warehouse space", 40, 55, "$8 per square foot", "a shortage of 15 units on the stated scale"],
  ["farm leases", 75, 45, "$500 per acre", "a surplus of 30 acres"],
  ["delivery vans", 30, 48, "$120 per day", "a shortage of 18 vans"],
  ["construction cranes", 64, 50, "$900 per day", "a surplus of 14 cranes"],
  ["timberland leases", 22, 35, "$1,200 per acre", "a shortage of 13 acres"],
  ["server capacity", 80, 80, "$40 per unit", "market equilibrium"]
];
equilibriumCases.forEach(([market, supplied, demanded, price, answer], i) => n(`In the market for ${market}, at ${price}, quantity supplied is ${supplied} and quantity demanded is ${demanded}. What is the market condition?`, answer, [supplied === demanded ? "a shortage" : demanded > supplied ? `a surplus of ${demanded - supplied}` : `a shortage of ${supplied - demanded}`, "a shift of both factor curves", "proof that the factor price is zero"], "FM.10", "calculation", "factor_market_disequilibrium", `${demanded > supplied ? `Quantity demanded exceeds quantity supplied by ${demanded - supplied}, producing ${answer}.` : supplied > demanded ? `Quantity supplied exceeds quantity demanded by ${supplied - demanded}, producing ${answer}.` : "Quantity demanded equals quantity supplied, so the stated factor price clears the market."}`, SUBTOPICS.equilibrium));

// FM.11: four nongraph labor-market equilibrium questions (fourteen graph records complete the objective).
[
  ["software testers", 900, 30, 100, 10, 20, 300],
  ["electricians", 720, 24, 120, 16, 15, 360],
  ["lab technicians", 600, 20, 120, 10, 16, 280],
  ["delivery drivers", 840, 28, 140, 7, 20, 280]
].forEach(([market, d0, ds, s0, ss, wage, employment]) => n(`In a market for ${market}, labor demand is Ld = ${d0} − ${ds}w and labor supply is Ls = ${s0} + ${ss}w. What are the equilibrium wage and employment?`, `$${wage} per hour and ${employment} workers`, [`$${wage} per hour and ${d0} workers`, `$${wage + 5} per hour and ${employment} workers`, `$${Math.max(5,wage - 5)} per hour and ${employment + 100} workers`], "FM.11", "calculation", "solve_labor_market_equilibrium", `Set labor demanded equal to labor supplied and solve for w. Substituting w = $${wage} into either equation gives equilibrium employment of ${employment} workers.`, SUBTOPICS.equilibrium));

// FM.12: twelve nongraph labor-demand determinants (six graph records complete the objective).
const demandDeterminants = [
  ["The price of restaurant meals rises", "Demand for restaurant labor shifts right because worker output is more valuable"],
  ["A new tool raises carpenters' hourly output", "Demand for carpenters shifts right as VMP rises"],
  ["Consumers buy fewer printed newspapers", "Demand for press operators shifts left because derived output demand falls"],
  ["More landscaping firms enter the local market", "Market demand for landscapers shifts right"],
  ["Several textile mills close", "Market demand for textile workers shifts left"],
  ["A drought lowers the harvest produced by each field worker", "Farm labor demand shifts left as MPL falls"],
  ["Better scheduling software complements nurses and raises their productivity", "Demand for nurses shifts right"],
  ["A machine replaces routine packaging tasks", "Demand for packaging labor shifts left when capital substitutes for labor"],
  ["Demand for home healthcare expands", "Derived demand for home-health workers shifts right"],
  ["The selling price of solar installations falls", "Installer labor demand shifts left, other things equal"],
  ["A factory's worker wage falls while productivity and output conditions are unchanged", "Quantity of labor demanded rises along the existing curve"],
  ["The wage for technicians rises with all demand determinants fixed", "Quantity of technicians demanded falls along the existing curve"]
];
demandDeterminants.forEach(([event, answer], i) => n(`${event}. What is the labor-demand effect?`, answer, [answer.includes("along") ? "The labor-demand curve shifts" : "Only movement along the original demand curve occurs", "Labor supply must shift in the same direction", "Labor demand cannot respond to product markets"], "FM.12", "application", "labor_demand_determinants", `${event.includes("wage") ? "The wage changes quantity of labor demanded along the curve." : "The event changes worker productivity, output value, firm count, or a related input, so labor demand shifts."}`, SUBTOPICS.derivedDemand, i === 10 ? { support: "repair" } : i === 11 ? { support: "bridge" } : {}));

// FM.13: sixteen cross-factor market effects.
const crossFactorCases = [
  ["A subsidy makes forklifts cheaper, and forklifts complement warehouse labor", "Firms use more forklifts, warehouse-worker MPL rises, and labor demand shifts right"],
  ["Industrial robots become cheaper and substitute for routine assembly labor", "Robot use rises and demand for routine assembly labor shifts left"],
  ["A shortage of nurses leaves hospital equipment underused", "The marginal product and demand for complementary medical equipment can fall"],
  ["More irrigation equipment raises the productivity of farm labor", "Farm labor demand rises because complementary capital raises MPL"],
  ["Skilled technicians are needed to operate new diagnostic machines", "More machines can raise demand for complementary technicians"],
  ["Software performs the same basic tax-preparation tasks as junior staff", "Better software can reduce demand for substitute junior labor"],
  ["A construction boom raises demand for cranes", "Demand for complementary crane operators is also likely to rise"],
  ["A decline in usable vineyard land reduces grape production", "Demand for vineyard labor and specialized equipment can fall"],
  ["More chefs make existing kitchen stations more productive", "Demand for complementary kitchen capital can rise"],
  ["A shortage of pilots forces an airline to ground aircraft", "The marginal value and rental demand for complementary aircraft fall"],
  ["Automated checkout substitutes for cashiers but requires maintenance technicians", "Cashier demand can fall while technician demand rises"],
  ["More classrooms raise the productivity of teachers when space was the bottleneck", "Demand for teachers can rise because classroom capital complements labor"],
  ["A sawmill loses access to timber", "Demand for both sawmill labor and complementary machinery falls"],
  ["A firm hires more sales staff, increasing the useful workload for support staff", "Demand for complementary support labor rises"],
  ["A new machine replaces manual cutting but makes finishing workers more productive", "Demand can fall for cutting labor and rise for complementary finishing labor"],
  ["An engineering shortage delays every major building project", "Demand for complementary construction labor and equipment can decline"]
];
crossFactorCases.forEach(([event, answer], i) => n(`${event}. Trace the effect into the related factor market.`, answer, ["Demand for every factor moves in the same direction", "Only factor supply can change", "No cross-factor effect is possible in competitive markets"], "FM.13", i % 3 === 2 ? "integration" : "application", "cross_factor_market_effect", `${answer}. The direction follows the stated technological relationship between inputs, not a blanket rule about all factors.`, SUBTOPICS.factorLinks, i === 14 ? { support: "repair" } : i === 15 ? { support: "bridge" } : {}));

if (N.length !== 176) throw new Error(`Expected 176 nongraph questions; found ${N.length}.`);

const EXPECTED_OBJECTIVE_COUNTS = Object.freeze({
  "FM.1": 20, "FM.2": 22, "FM.3": 18, "FM.4": 18, "FM.5": 20,
  "FM.6": 20, "FM.7": 16, "FM.8": 18, "FM.9": 18, "FM.10": 18,
  "FM.11": 18, "FM.12": 18, "FM.13": 16
});

const ORDINARY_DIFFICULTY_QUOTAS = Object.freeze({ easy: 60, medium: 78, hard: 54, elite: 18, legendary: 18 });
const DIFFICULTY_CYCLE = ["easy", "medium", "hard", "medium", "easy", "hard", "medium", "elite", "easy", "legendary", "medium", "hard"];

function buildDifficultyPlan(count) {
  const remaining = { ...ORDINARY_DIFFICULTY_QUOTAS };
  const plan = [];
  let cursor = 0;
  while (plan.length < count) {
    const candidate = DIFFICULTY_CYCLE[cursor++ % DIFFICULTY_CYCLE.length];
    if (remaining[candidate] > 0) {
      plan.push(candidate);
      remaining[candidate] -= 1;
    }
  }
  if (Object.values(remaining).some(Boolean)) throw new Error(`Difficulty quotas remain: ${JSON.stringify(remaining)}`);
  return plan;
}

function assignPool(difficulty, seen) {
  seen[difficulty] = (seen[difficulty] || 0) + 1;
  if (seen[difficulty] <= 6) {
    if (difficulty === "easy") return "easyBoss";
    if (difficulty === "medium") return "mediumBoss";
    if (difficulty === "hard") return "finalBoss";
    if (difficulty === "legendary") return "legendaryBoss";
  }
  return difficulty;
}

const allRows = [...G, ...N];
const ordinaryRows = allRows.filter(question => !question.support);
const difficultyPlan = buildDifficultyPlan(ordinaryRows.length);
const poolSeen = {};
let ordinaryIndex = 0;

export const productionQuestions = allRows.map((question, index) => {
  const supportPool = question.support === "repair" ? "repairQuestions" : question.support === "bridge" ? "bridgeQuestions" : null;
  const difficulty = supportPool ? "medium" : difficultyPlan[ordinaryIndex++];
  const pool = supportPool || assignPool(difficulty, poolSeen);
  return {
    id: ID_FIRST + index,
    q: question.asset ? `Refer to the graph above. ${question.q}` : question.q,
    answer: question.answer,
    distractors: question.distractors,
    objective: question.objective,
    objectiveLabel: OBJECTIVES[question.objective],
    primarySkill: question.primarySkill,
    secondarySkills: [],
    repairSkill: question.primarySkill,
    difficulty,
    pool,
    type: supportPool === "bridgeQuestions" ? "bridge" : question.type,
    tag: question.subtopic,
    conceptCluster: CONCEPT_ID,
    commonError: COMMON_ERRORS[question.objective],
    feedback: question.feedback,
    graphRequired: Boolean(question.asset),
    asset: question.asset || null,
    scenario: question.asset ? GRAPH_ASSETS[question.asset].scenario : null
  };
});

if (productionQuestions.length !== 240) throw new Error(`Expected 240 production questions; found ${productionQuestions.length}.`);
if (productionQuestions.at(-1).id !== ID_LAST) throw new Error(`Expected final ID ${ID_LAST}; found ${productionQuestions.at(-1).id}.`);
if (productionQuestions.filter(question => question.graphRequired).length !== 64) throw new Error("Expected exactly 64 graph-dependent questions.");
const objectiveCounts = productionQuestions.reduce((counts, question) => (counts[question.objective] = (counts[question.objective] || 0) + 1, counts), {});
if (Object.entries(EXPECTED_OBJECTIVE_COUNTS).some(([objective, count]) => objectiveCounts[objective] !== count)) throw new Error(`Objective distribution mismatch: ${JSON.stringify(objectiveCounts)}`);
const supportCounts = productionQuestions.reduce((counts, question) => (counts[question.pool] = (counts[question.pool] || 0) + 1, counts), {});
if (supportCounts.repairQuestions !== 6 || supportCounts.bridgeQuestions !== 6) throw new Error(`Expected six repair and six bridge records; found ${JSON.stringify(supportCounts)}.`);
