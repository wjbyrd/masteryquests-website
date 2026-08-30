(function(root, factory){
  const api = factory();
  if(typeof module === 'object' && module.exports) module.exports = api;
  if(root) root.MQCourseAreaModel = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function(){
  'use strict';

  const AREA_KEYS = Object.freeze(['general','micro','macro']);
  // General Economics mirrors the canonical concepts covered by the
  // GEN-ECON Concept Review series. Multiple review sheets can resolve from
  // one card (Demand, Supply, and Market Equilibrium), so 26 PDFs map to
  // 22 selectable General Economics concept cards.
  const GENERAL_AREA_IDS = new Set([
    'scarcity-and-tradeoffs','incentives','opportunity-cost','marginal-analysis',
    'micro-versus-macro','positive-versus-normative-analysis',
    'models-and-assumptions','production-possibilities-frontier',
    'gains-from-trade','economist-policy-role','competitive-markets',
    'demand','supply','market-equilibrium','binding-price-ceilings',
    'binding-price-floors','statutory-versus-economic-tax-incidence',
    'tax-incidence','trade-world-price-status','tariffs-revenue-deadweight-loss',
    'import-quotas-quota-rents','trade-policy-efficiency-distribution'
  ]);
  const MICRO_AREA_IDS = new Set([
    'marginal-analysis','incentives','gains-from-trade','market-failures',
    'externalities','public-goods-and-common-resources','market-power',
    'production-possibilities-frontier','positive-versus-normative-analysis',
    'economist-policy-role','competitive-markets','demand','supply',
    'market-equilibrium','price-signals','binding-price-ceilings',
    'binding-price-floors','tax-wedges-and-revenue',
    'statutory-versus-economic-tax-incidence','tax-incidence',
    'integrated-economic-analysis','elasticity',
    'price-elasticity-of-demand','price-elasticity-of-supply',
    'income-elasticity-of-demand','cross-price-elasticity-of-demand',
    'elasticity-and-total-revenue','applications-of-elasticity',
    'consumer-and-producer-surplus','consumer-surplus','producer-surplus',
    'total-surplus-gains-from-exchange','efficient-quantity-allocation',
    'surplus-changes-policy-effects','efficiency-equity-surplus-limits',
    'international-trade-and-trade-policy','trade-world-price-status',
    'trade-domestic-production-consumption-quantities',
    'trade-gains-surplus-winners-losers','tariffs-revenue-deadweight-loss',
    'import-quotas-quota-rents','trade-policy-efficiency-distribution',
    'costs-of-production','factor-markets','consumer-choice',
    'income-inequality-poverty-and-redistribution',
    'information-asymmetry-behavioral-and-political-economy',
    'perfect-competition','monopoly',
    'monopolistic-competition','oligopoly'
  ]);
  const MICRO_FAMILY_PARENT_IDS = new Set([
    'consumer-and-producer-surplus','costs-of-production','elasticity',
    'international-trade-and-trade-policy','monopolistic-competition',
    'monopoly','oligopoly','perfect-competition'
  ]);
  const MICRO_DISCIPLINE_OVERRIDES = new Set(['elasticity']);
  // These trade-family children use the General Economics review series even
  // though their broader parent remains a Microeconomics family.
  const GENERAL_DISCIPLINE_OVERRIDES = new Set([
    'trade-world-price-status','tariffs-revenue-deadweight-loss',
    'import-quotas-quota-rents','trade-policy-efficiency-distribution'
  ]);

  function family(id, label, aliases, conceptIds){
    return Object.freeze({id, label, aliases:Object.freeze(aliases), conceptIds:Object.freeze(conceptIds)});
  }

  // Navigation-only groupings. Canonical concept IDs remain the source of
  // truth for selection and builds; these families only control browsing.
  const NAVIGATION_FAMILIES = Object.freeze({
    general:Object.freeze([
      family('economic-thinking', 'Economic thinking and foundations', ['foundations','economic reasoning','basics'], [
        'scarcity-and-tradeoffs','opportunity-cost','marginal-analysis','incentives',
        'models-and-assumptions','micro-versus-macro','positive-versus-normative-analysis',
        'economist-policy-role','production-possibilities-frontier'
      ]),
      family('markets-equilibrium', 'Markets and equilibrium', ['demand and supply','market basics'], [
        'competitive-markets','demand','supply','market-equilibrium'
      ]),
      family('trade-specialization', 'Trade and specialization', ['comparative advantage','international trade'], [
        'gains-from-trade','trade-world-price-status','tariffs-revenue-deadweight-loss',
        'import-quotas-quota-rents','trade-policy-efficiency-distribution'
      ]),
      family('policy-incidence', 'Government policy and tax incidence', ['price controls','taxes'], [
        'binding-price-ceilings','binding-price-floors',
        'statutory-versus-economic-tax-incidence','tax-incidence'
      ])
    ]),
    micro:Object.freeze([
      family('micro-foundations', 'Micro foundations and economic reasoning', ['foundations','economic reasoning','basics'], [
        'marginal-analysis','incentives','production-possibilities-frontier',
        'positive-versus-normative-analysis','economist-policy-role','integrated-economic-analysis'
      ]),
      family('markets-equilibrium', 'Markets, demand, supply, and equilibrium', ['market basics','price system'], [
        'competitive-markets','demand','supply','market-equilibrium','price-signals'
      ]),
      family('elasticity', 'Elasticity', ['responsiveness','ped','pes','total revenue'], [
        'elasticity','price-elasticity-of-demand','price-elasticity-of-supply',
        'income-elasticity-of-demand','cross-price-elasticity-of-demand',
        'elasticity-and-total-revenue','applications-of-elasticity'
      ]),
      family('welfare-surplus', 'Welfare, efficiency, and surplus', ['consumer surplus','producer surplus','total surplus'], [
        'consumer-and-producer-surplus','consumer-surplus','producer-surplus',
        'total-surplus-gains-from-exchange','efficient-quantity-allocation',
        'surplus-changes-policy-effects','efficiency-equity-surplus-limits'
      ]),
      family('policy-market-failure', 'Policy, market failure, and public goods', ['externalities','common resources','taxes','price controls'], [
        'binding-price-ceilings','binding-price-floors','tax-wedges-and-revenue',
        'statutory-versus-economic-tax-incidence','tax-incidence','market-failures',
        'externalities','public-goods-and-common-resources','market-power'
      ]),
      family('international-trade', 'International trade and trade policy', ['comparative advantage','world price','tariffs','quotas'], [
        'gains-from-trade','international-trade-and-trade-policy','trade-world-price-status',
        'trade-domestic-production-consumption-quantities','trade-gains-surplus-winners-losers',
        'tariffs-revenue-deadweight-loss','import-quotas-quota-rents',
        'trade-policy-efficiency-distribution'
      ]),
      family('costs-production', 'Costs of production', ['cost curves','afc','avc','atc','mc','lrac','mes'], [
        'costs-of-production','economic-costs','profit-concepts','short-run-production',
        'cost-components-schedules','average-costs','marginal-cost-production-linkages',
        'short-run-cost-curves','sunk-avoidable-costs','long-run-average-cost-scale',
        'minimum-efficient-scale'
      ]),
      family('perfect-competition', 'Perfect competition', ['price taking','mr equals mc','competitive firm'], [
        'perfect-competition','competitive-market-price-taking-revenue','competitive-output-choice',
        'competitive-profit-loss','competitive-shutdown','competitive-short-run-supply',
        'competitive-entry-exit-long-run','competitive-industry-cost-conditions',
        'competitive-efficiency-limits'
      ]),
      family('monopoly', 'Monopoly', ['price discrimination','natural monopoly'], [
        'monopoly','monopoly-power-barriers','monopoly-demand-revenue','monopoly-output-price',
        'monopoly-profit-loss-shutdown','monopoly-welfare-efficiency',
        'natural-monopoly-regulation','monopoly-price-discrimination'
      ]),
      family('monopolistic-competition', 'Monopolistic competition', ['m comp','product differentiation','nonprice competition'], [
        'monopolistic-competition','mcomp-structure-differentiation','mcomp-short-run-choice',
        'mcomp-entry-exit-long-run','mcomp-advertising-nonprice','mcomp-efficiency-variety-limits'
      ]),
      family('oligopoly', 'Oligopoly and game theory', ['nash equilibrium','payoff matrix','collusion','cartels','hhi'], [
        'oligopoly','oligopoly-structure-concentration','oligopoly-game-theory-foundations',
        'oligopoly-collusion-cartels','oligopoly-dynamic-strategy',
        'oligopoly-rivalry-coordination','oligopoly-welfare-policy'
      ]),
      family('people-institutions', 'Consumers, factor markets, and distribution', ['consumer choice','labor markets','inequality','behavioral economics'], [
        'factor-markets','consumer-choice','income-inequality-poverty-and-redistribution',
        'information-asymmetry-behavioral-and-political-economy'
      ])
    ]),
    macro:Object.freeze([
      family('macro-foundations', 'Macro foundations and economic reasoning', ['foundations','economic reasoning','basics'], [
        'scarcity-and-tradeoffs','opportunity-cost','marginal-analysis','incentives',
        'models-and-assumptions','micro-versus-macro','positive-versus-normative-analysis',
        'economist-policy-role','production-possibilities-frontier','gains-from-trade'
      ]),
      family('markets-policy', 'Markets and government intervention', ['demand and supply','price controls','tax incidence'], [
        'competitive-markets','demand','supply','market-equilibrium','binding-price-ceilings',
        'binding-price-floors','statutory-versus-economic-tax-incidence','tax-incidence'
      ]),
      family('international-trade', 'International trade and policy', ['world price','tariffs','quotas'], [
        'trade-world-price-status','tariffs-revenue-deadweight-loss',
        'import-quotas-quota-rents','trade-policy-efficiency-distribution'
      ]),
      family('gdp-national-income', 'GDP and national income', ['gdp','national output','national accounts'], [
        'gdp-measurement','gdp-components','real-versus-nominal-gdp','limits-of-gdp'
      ]),
      family('inflation-real-values', 'Inflation measurement and real values', ['cpi','gdp deflator','real interest rate'], [
        'cpi-and-inflation-measurement','cpi-bias','cpi-versus-gdp-deflator',
        'indexing-and-real-values','real-versus-nominal-interest-rates','inflation-costs'
      ]),
      family('growth-productivity', 'Economic growth and productivity', ['living standards','growth'], [
        'living-standards-and-growth','productivity-measurement','sources-of-productivity',
        'economic-growth-policy'
      ]),
      family('unemployment-labor', 'Unemployment and labor markets', ['labor force','natural rate','frictional','structural','cyclical'], [
        'unemployment-measurement','unemployment-types','labor-market-institutions',
        'natural-rate-of-unemployment'
      ]),
      family('saving-fiscal-foundations', 'Saving, investment, budgets, and debt', ['loanable funds','deficits','federal debt'], [
        'saving-investment-and-loanable-funds','federal-budgets-and-debt'
      ]),
      family('money-banking-fed', 'Money, banking, and the Federal Reserve', ['fed','central bank','money creation'], [
        'money-functions-and-measures','central-bank-and-federal-reserve','bank-money-creation',
        'monetary-policy-tools','monetary-control-limits'
      ]),
      family('money-growth-inflation', 'Money growth, inflation, and neutrality', ['qtm','fisher effect','quantity theory'], [
        'quantity-theory-of-money','monetary-neutrality','fisher-effect','inflation-tax-and-deflation'
      ]),
      family('ad-as-equilibrium', 'Aggregate demand, aggregate supply, and equilibrium', ['ad-as','adas','sras','lras','macro equilibrium'], [
        'aggregate-demand','aggregate-supply','macroeconomic-equilibrium-and-shocks',
        'long-run-macroeconomic-adjustment'
      ]),
      family('stabilization-policy', 'Stabilization and policy transmission', ['monetary policy','fiscal policy','crowding out','money market'], [
        'liquidity-preference-and-money-market','monetary-policy-transmission',
        'fiscal-policy-and-aggregate-demand','fiscal-multipliers-and-crowding-out',
        'stabilization-policy'
      ]),
      family('phillips-disinflation', 'Phillips curves and disinflation', ['srpc','lrpc','expectations','sacrifice ratio'], [
        'short-run-phillips-curve','long-run-phillips-curve','phillips-curve-expectations',
        'disinflation-and-policy','sacrifice-ratio'
      ])
    ])
  });

  const CONCEPT_SEARCH_ALIASES = Object.freeze({
    'production-possibilities-frontier':Object.freeze(['ppf','production possibilities curve']),
    'market-equilibrium':Object.freeze(['shortage','surplus','equilibrium price']),
    'price-elasticity-of-demand':Object.freeze(['ped']),
    'price-elasticity-of-supply':Object.freeze(['pes']),
    'tariffs-revenue-deadweight-loss':Object.freeze(['dwl','deadweight loss']),
    'average-costs':Object.freeze(['afc','avc','atc']),
    'marginal-cost-production-linkages':Object.freeze(['mc','marginal product']),
    'long-run-average-cost-scale':Object.freeze(['lrac','economies of scale']),
    'minimum-efficient-scale':Object.freeze(['mes']),
    'competitive-output-choice':Object.freeze(['mr mc','mr equals mc']),
    'oligopoly-game-theory-foundations':Object.freeze(['nash','payoff matrix','dominant strategy']),
    'central-bank-and-federal-reserve':Object.freeze(['fed','federal reserve']),
    'quantity-theory-of-money':Object.freeze(['qtm','mv py']),
    'aggregate-demand':Object.freeze(['ad']),
    'aggregate-supply':Object.freeze(['as','sras','lras']),
    'short-run-phillips-curve':Object.freeze(['srpc']),
    'long-run-phillips-curve':Object.freeze(['lrpc']),
    'saving-investment-and-loanable-funds':Object.freeze(['loanable funds'])
  });

  function unique(items){ return [...new Set(items || [])]; }

  function create(registry){
    const concepts = Array.isArray(registry) ? registry : [];
    const sourceById = new Map(concepts.map(concept => [String(concept?.canonicalConceptId || ''), concept]));
    const generalIds = new Set(GENERAL_AREA_IDS);
    const microIds = new Set(MICRO_AREA_IDS);
    for(const parentId of MICRO_FAMILY_PARENT_IDS){
      const parent = sourceById.get(parentId);
      for(const childId of parent?.childConceptIds || []) microIds.add(childId);
    }

    const disciplineCache = new Map();
    function disciplineFor(id, stack = new Set()){
      if(disciplineCache.has(id)) return disciplineCache.get(id);
      if(stack.has(id)) throw new Error(`Course-area parent cycle at ${id}.`);
      const concept = sourceById.get(id);
      if(!concept) throw new Error(`Course-area metadata references unknown concept ${id}.`);
      const nextStack = new Set(stack);
      nextStack.add(id);
      let discipline;
      if(GENERAL_DISCIPLINE_OVERRIDES.has(id)){
        discipline = 'general';
      }else if(concept.parentConceptId){
        discipline = disciplineFor(concept.parentConceptId, nextStack);
      }else if(MICRO_DISCIPLINE_OVERRIDES.has(id)){
        discipline = 'micro';
      }else if(generalIds.has(id)){
        discipline = 'general';
      }else if(microIds.has(id)){
        discipline = 'micro';
      }else{
        discipline = 'macro';
      }
      disciplineCache.set(id, discipline);
      return discipline;
    }

    const records = {};
    for(const concept of concepts){
      const id = String(concept?.canonicalConceptId || '');
      if(!id) continue;
      const areas = [];
      if(generalIds.has(id)) areas.push('general');
      if(microIds.has(id)) areas.push('micro');
      if(generalIds.has(id) || (!generalIds.has(id) && !microIds.has(id))) areas.push('macro');
      records[id] = Object.freeze({
        canonicalConceptId:id,
        discipline:disciplineFor(id),
        areas:Object.freeze(unique(areas)),
        parentConceptId:concept.parentConceptId || null,
        childConceptIds:Object.freeze(unique(concept.childConceptIds || [])),
        selectable:concept.status === 'active',
        cardVisible:concept.status === 'active' && concept.supplementType !== 'checkpoint-challenge'
      });
    }

    const navigationFamilies = {};
    const navigationFamilyLookup = {};
    for(const area of AREA_KEYS){
      const eligibleIds = Object.values(records)
        .filter(record => record.cardVisible && record.areas.includes(area))
        .map(record => record.canonicalConceptId);
      const assigned = new Set();
      const families = [];
      for(const definition of NAVIGATION_FAMILIES[area]){
        const conceptIds = definition.conceptIds.filter(id => eligibleIds.includes(id));
        if(!conceptIds.length) continue;
        for(const id of conceptIds){
          if(assigned.has(id)) throw new Error(`Concept ${id} is assigned to multiple ${area} navigation families.`);
          assigned.add(id);
          navigationFamilyLookup[`${area}:${id}`] = definition.id;
        }
        families.push(Object.freeze({...definition, conceptIds:Object.freeze(conceptIds)}));
      }
      const unassigned = eligibleIds.filter(id => !assigned.has(id));
      if(unassigned.length){
        const fallback = family('additional-concepts', `Additional ${area} concepts`, ['other'], unassigned);
        families.push(fallback);
        for(const id of unassigned) navigationFamilyLookup[`${area}:${id}`] = fallback.id;
      }
      navigationFamilies[area] = Object.freeze(families);
    }

    return Object.freeze({
      records:Object.freeze(records),
      get(id){ return records[String(id || '')] || null; },
      disciplineFor(id){ return records[String(id || '')]?.discipline || null; },
      areasFor(id){ return records[String(id || '')]?.areas || []; },
      conceptsForArea(area){
        return Object.values(records).filter(record => record.cardVisible && record.areas.includes(area));
      },
      navigationFamiliesForArea(area){ return navigationFamilies[area] || []; },
      navigationFamilyFor(id, area){
        const familyId = navigationFamilyLookup[`${area}:${String(id || '')}`];
        return (navigationFamilies[area] || []).find(item => item.id === familyId) || null;
      },
      searchAliasesFor(id){ return CONCEPT_SEARCH_ALIASES[String(id || '')] || []; }
    });
  }

  function isConceptVisibleForArea(concept, activeArea){
    if(!concept || !AREA_KEYS.includes(activeArea)) return false;
    return concept.cardVisible !== false
      && concept.supplementType !== 'checkpoint-challenge'
      && Array.isArray(concept.areas)
      && concept.areas.includes(activeArea);
  }

  function browseCategory(concept){
    const status = String(concept?.coverageStatus || '');
    return ['ready-family-slice','ready-focused','ready-focused-subtopic'].includes(status)
      ? 'ready'
      : 'supporting';
  }

  return {
    AREA_KEYS,
    GENERAL_AREA_IDS:Object.freeze([...GENERAL_AREA_IDS]),
    MICRO_AREA_IDS:Object.freeze([...MICRO_AREA_IDS]),
    MICRO_FAMILY_PARENT_IDS:Object.freeze([...MICRO_FAMILY_PARENT_IDS]),
    MICRO_DISCIPLINE_OVERRIDES:Object.freeze([...MICRO_DISCIPLINE_OVERRIDES]),
    GENERAL_DISCIPLINE_OVERRIDES:Object.freeze([...GENERAL_DISCIPLINE_OVERRIDES]),
    NAVIGATION_FAMILIES,
    CONCEPT_SEARCH_ALIASES,
    create,
    isConceptVisibleForArea,
    browseCategory
  };
});
