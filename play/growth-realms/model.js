import { GAME_BALANCE as B, CATEGORIES, GAME_CONFIG, CYCLES } from './config.js';

export const emptyAllocation = () => Object.fromEntries(CATEGORIES.map(c => [c.id, 0]));
export const allocationTotal = a => CATEGORIES.reduce((sum, c) => sum + (a?.[c.id] ?? 0), 0);
export function validAllocation(a) {
  return !!a && CATEGORIES.every(c => Number.isInteger(a[c.id]) && a[c.id] >= 0 && a[c.id] <= B.developmentPointsPerCycle) && allocationTotal(a) === B.developmentPointsPerCycle;
}
export function adjustAllocation(allocation, category, delta) {
  if (!CATEGORIES.some(c => c.id === category) || ![1, -1].includes(delta)) return allocation;
  const next = allocation[category] + delta;
  if (next < 0 || allocationTotal(allocation) + delta > B.developmentPointsPerCycle) return allocation;
  return { ...allocation, [category]: next };
}
export function adoption(education, technology) {
  return B.adoptionFloor + (1 - B.adoptionFloor) * education / (education + B.adoptionEducationScale * Math.pow(technology, B.adoptionTechnologyExponent));
}
export function economy(stocks) {
  const capitalPerWorker = stocks.capital / stocks.labor;
  const equipmentComplement = capitalPerWorker / (capitalPerWorker + B.equipmentComplementScale);
  const humanCapital = 1 + B.humanCapitalMaximumBonus * stocks.education / (stocks.education + B.humanCapitalHalfSaturation) * equipmentComplement;
  const technologyAdoption = adoption(stocks.education, stocks.technology);
  const effectiveTechnology = 1 + B.technologyProductivityWeight * (stocks.technology - 1) * technologyAdoption * equipmentComplement;
  const potentialOutput = B.outputScale * stocks.labor * Math.pow(capitalPerWorker, B.capitalExponent) * humanCapital * effectiveTechnology;
  const laborCapacity = B.capacityBase + stocks.resources * B.capacityPerResource;
  const resourceDemand = stocks.labor + stocks.capital * B.capitalResourceDemand + potentialOutput * B.outputResourceDemand;
  const resourceUtilization = resourceDemand / laborCapacity;
  const resourceAdequacy = Math.min(1, 1 / resourceUtilization);
  const output = potentialOutput * Math.pow(resourceAdequacy, B.resourcePenaltyExponent);
  const constraints = {
    resourceShortage: resourceAdequacy < B.resourceConstraintThreshold,
    technologyAdoption: technologyAdoption < B.adoptionConstraintThreshold && stocks.researchCapacity > B.initial[stocks.id].researchCapacity,
    skillsUnderused: stocks.education / stocks.labor > B.skillUnderuseEducationPerWorker && capitalPerWorker < B.skillUnderuseCapitalPerWorker,
    excessCapacity: resourceUtilization < B.excessResourceUtilization,
    capitalSaturation: capitalPerWorker > B.capitalSaturationPerWorker,
  };
  return { ...stocks, output, outputPerWorker: output / stocks.labor, capitalPerWorker, humanCapital, equipmentComplement, technologyAdoption, effectiveTechnology, potentialOutput, laborCapacity, resourceDemand, resourceUtilization, resourceAdequacy, constraints };
}
export function snapshot(city) {
  const { history, ...state } = city;
  return structuredClone(state);
}
export function createCities() {
  return GAME_CONFIG.cities.map(config => ({
    ...economy({ ...B.initial[config.id], id: config.id, name: config.name }),
    growthRate: 0, productivityGrowthRate: 0, developmentPoints: B.developmentPointsPerCycle, currentCycle: 0,
    buildings: { ...B.initialBuildings[config.id] }, invested: emptyAllocation(), history: [],
  }));
}
export function projectPlan(city, allocation) {
  return CATEGORIES.filter(c => allocation[c.id] > 0).map(c => {
    const before = B.buildingPointThresholds.filter(t => city.invested[c.id] >= t).length;
    const after = B.buildingPointThresholds.filter(t => city.invested[c.id] + allocation[c.id] >= t).length;
    const level = city.buildings[c.id] + after - before;
    return { category: c.id, level, changed: after > before, name: c.projects[Math.min(c.projects.length - 1, Math.max(0, level - 1))], type: level === 0 ? 'Prepared' : level > city.buildings[c.id] ? (city.buildings[c.id] ? 'Upgraded' : 'Built') : 'Improved' };
  });
}
export function bottlenecks(city) {
  const c = city.constraints;
  return [
    c.resourceShortage && 'Food, water, and utilities are limiting production and workforce growth.',
    c.technologyAdoption && 'Technical training is lagging behind available production technology.',
    c.skillsUnderused && 'Skilled workers have too little equipment to use their training fully.',
    c.excessCapacity && 'Ample resource capacity has little additional direct productivity payoff.',
    c.capitalSaturation && 'High capital per worker means small gains from additional equipment.',
  ].filter(Boolean);
}
export function advanceCity(city, allocation, cycle, frontier, doctrine = null) {
  if (!validAllocation(allocation)) throw new Error(`Allocate exactly ${B.developmentPointsPerCycle} whole development points.`);
  if (cycle !== city.currentCycle + 1 || cycle > CYCLES.length) throw new Error('Cycles must resolve once, in order.');
  const startState = snapshot(city);
  const educationInvestment = allocation.education * B.educationPerPoint;
  const education = city.education + city.pendingEducation + educationInvestment * B.educationImmediateShare;
  const pendingEducation = educationInvestment * (1 - B.educationImmediateShare);
  const researchSkill = B.researchSkillFloor + (1 - B.researchSkillFloor) * education / (education + B.researchEducationScale);
  const researchEffort = city.researchCapacity + allocation.research * B.immediateResearchKnowledge;
  const effectiveResearch = researchEffort / (1 + researchEffort / B.researchSaturationScale);
  const innovation = city.technology * B.innovationRate * effectiveResearch * researchSkill;
  const diffusion = Math.max(0, frontier - city.technology) * allocation.research * B.diffusionRate * adoption(education, city.technology);
  const candidate = economy({ ...startState,
    capital: city.capital + allocation.capital * B.capitalPerPoint,
    resources: city.resources + allocation.resources * B.resourcesPerPoint,
    education, pendingEducation, technology: city.technology + innovation + diffusion,
    researchCapacity: city.researchCapacity + allocation.research * B.knowledgePerPoint,
  });
  const laborSpace = Math.min(1, candidate.laborCapacity / (city.labor * (1 + B.laborGrowthRate)));
  const growthRoom = Math.pow(candidate.resourceAdequacy * laborSpace, B.laborCrowdingPower);
  const migration = candidate.laborCapacity / candidate.resourceDemand > B.migrationHeadroom && candidate.outputPerWorker >= B.migrationMinOutputPerWorker && candidate.capitalPerWorker >= B.migrationMinCapitalPerWorker ? B.migrationBonusMax : 0;
  const labor = city.labor + city.labor * B.laborGrowthRate * growthRoom + migration;
  const calculated = economy({ ...candidate, labor });
  const growthRate = (calculated.output / city.output - 1) * 100;
  const productivityGrowthRate = (calculated.outputPerWorker / city.outputPerWorker - 1) * 100;
  const projects = projectPlan(city, allocation), buildings = { ...city.buildings }, invested = { ...city.invested };
  for (const c of CATEGORIES) invested[c.id] += allocation[c.id];
  for (const p of projects) buildings[p.category] = p.level;
  const endState = { ...calculated, buildings, invested, currentCycle: cycle, developmentPoints: 0, growthRate, productivityGrowthRate };
  const majorMechanisms = [
    allocation.capital > 0 && 'Physical capital accumulation with diminishing returns',
    allocation.education > 0 && 'Delayed human capital and technology complementarity',
    innovation > 0 && 'Innovation from accumulated research',
    diffusion > 0 && 'Adoption of existing frontier technology',
    allocation.resources > 0 && 'Expanded food, water, and utility capacity',
  ].filter(Boolean);
  const record = {
    cycle, doctrine, allocation: { ...allocation }, startState, endState: structuredClone(endState),
    outputChange: endState.output - city.output,
    outputPerWorkerChange: endState.outputPerWorker - city.outputPerWorker,
    capitalPerWorker: endState.capitalPerWorker, growthRate, productivityGrowthRate,
    bottlenecks: bottlenecks(endState), technologyGain: endState.technology - city.technology,
    educationGain: education - city.education, majorMechanisms, completedProjects: projects,
    innovation, diffusion, migration,
  };
  return { ...endState, history: [...city.history, record] };
}
export function advanceRegion(cities, allocations, cycle, doctrines = {}) {
  // Both cities see the same PRE-cycle technology frontier. No ordering advantage.
  const frontier = Math.max(...cities.map(c => c.technology));
  return cities.map(c => advanceCity(c, allocations[c.id], cycle, frontier, doctrines[c.id] ?? null));
}
export function consequence(city) {
  const h = city.history.at(-1); if (!h) return '';
  const a = h.allocation, c = city.constraints;
  if (c.resourceShortage) return 'Expansion has outgrown food, water, and utilities. Capacity is now limiting production and workforce growth.';
  if (c.technologyAdoption && a.research >= B.feedbackResearchPoints) return 'New methods became available, but limited workforce training muted their productivity payoff.';
  if (c.skillsUnderused) return 'Training improved skills, but workers need more equipment to make full use of them.';
  if (c.excessCapacity && a.resources >= B.feedbackCapitalPoints) return 'Resource capacity is secure. More supplies add little productivity until the rest of the economy expands.';
  if (a.capital >= B.feedbackCapitalPoints) {
    const earlier = city.history.slice(0, -1).find(r => r.allocation.capital >= B.feedbackCapitalPoints);
    if (earlier && h.outputPerWorkerChange < earlier.outputPerWorkerChange) return 'Another industrial expansion helped, but output per worker gained less than after your earlier equipment investment.';
    return `Industrial expansion changed output per worker by ${h.outputPerWorkerChange.toFixed(1)}. Equipment makes a larger difference where capital per worker is low.`;
  }
  if (a.research >= B.feedbackResearchPoints && city.technologyAdoption >= B.adoptionConstraintThreshold) return 'Workforce skills helped firms use better production methods. The research base will keep contributing in future cycles.';
  if (a.education >= B.feedbackEducationPoints) return 'Training is building worker skills. Most of this cycle’s new training will complete next cycle.';
  return 'Equipment, skills, and better methods are working together. Compare productivity growth with the rival’s result.';
}
export function gapReport(initial, final) {
  const start = 1 - initial[1].outputPerWorker / initial[0].outputPerWorker;
  const finish = 1 - final[1].outputPerWorker / final[0].outputPerWorker;
  const change = Math.abs(finish) - Math.abs(start);
  const gapChangePercent = Math.abs(start) > Number.EPSILON ? change / Math.abs(start) * 100 : null;
  return { start, finish, gapChangePercent, absoluteGapStart: Math.abs(initial[0].outputPerWorker - initial[1].outputPerWorker), absoluteGapEnd: Math.abs(final[0].outputPerWorker - final[1].outputPerWorker), label: Math.abs(change) <= B.gapTolerance ? 'Little change' : change < 0 ? 'Gap narrowed' : 'Gap widened', overtook: finish < 0 };
}
