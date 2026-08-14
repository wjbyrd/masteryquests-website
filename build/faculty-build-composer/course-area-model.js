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
    'costs-of-production','perfect-competition','monopoly',
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

    return Object.freeze({
      records:Object.freeze(records),
      get(id){ return records[String(id || '')] || null; },
      disciplineFor(id){ return records[String(id || '')]?.discipline || null; },
      areasFor(id){ return records[String(id || '')]?.areas || []; },
      conceptsForArea(area){
        return Object.values(records).filter(record => record.cardVisible && record.areas.includes(area));
      }
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
    create,
    isConceptVisibleForArea,
    browseCategory
  };
});
