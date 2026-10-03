// All names, economic coefficients, doctrine rules, and existing art hooks live here.
export const GAME_CONFIG = {
  title: 'Growth Realms', subtitle: 'Choose a city. Build the stronger growth path.',
  brand: 'MASTERY QUESTS', region: 'THE HALCYON RIVER REGION', constructionMs: 2400,
  cities: [
    { id: 'meridian', name: 'Meridian', color: '#24645d', startingNote: 'An established industrial skyline. What comes next?', strength: 'High productivity and advanced infrastructure.', challenge: 'Sustain growth near the technological frontier.' },
    { id: 'rivermark', name: 'Rivermark', color: '#a75a2a', startingNote: 'Workshops, fields, and room to build something bigger.', strength: 'Large catch-up opportunities.', challenge: 'Build capital, raise productivity, and close the gap without creating bottlenecks.' },
  ],
};
export const GAME_BALANCE = {
  developmentPointsPerCycle: 20,
  initial: {
    meridian: { capital: 1400, resources: 350, technology: 1.85, education: 225, labor: 68, researchCapacity: 5, pendingEducation: 0 },
    rivermark: { capital: 135, resources: 155, technology: 1.12, education: 26, labor: 56, researchCapacity: 2, pendingEducation: 0 },
  },
  outputScale: 8, capitalExponent: 0.36,
  capitalPerPoint: 9, resourcesPerPoint: 4.25, educationPerPoint: 4.25,
  educationImmediateShare: 0.35,
  humanCapitalMaximumBonus: 0.65, humanCapitalHalfSaturation: 120,
  equipmentComplementScale: 4,
  adoptionFloor: 0.2, adoptionEducationScale: 85, adoptionTechnologyExponent: 1.2,
  researchSkillFloor: 0.2, researchEducationScale: 120,
  knowledgePerPoint: 2.75, immediateResearchKnowledge: 0.9,
  researchSaturationScale: 200, innovationRate: 0.0035, diffusionRate: 0.0125,
  technologyProductivityWeight: 1,
  laborGrowthRate: 0.015, migrationBonusMax: 1,
  capacityBase: 26, capacityPerResource: 0.24,
  capitalResourceDemand: 0.018, outputResourceDemand: 0.004,
  resourcePenaltyExponent: 0.8, laborCrowdingPower: 2,
  migrationMinOutputPerWorker: 28, migrationMinCapitalPerWorker: 6, migrationHeadroom: 1.12,
  resourceConstraintThreshold: 0.98, adoptionConstraintThreshold: 0.55,
  skillUnderuseEducationPerWorker: 1.6, skillUnderuseCapitalPerWorker: 5,
  excessResourceUtilization: 0.68, capitalSaturationPerWorker: 30,
  buildingPointThresholds: [4, 15, 30, 50, 80, 120],
  initialBuildings: { meridian: { capital: 3, resources: 2, research: 2, education: 3 }, rivermark: { capital: 1, resources: 1, research: 0, education: 1 } },
  technologyDisplayScale: 100, gapTolerance: 0.02, pathShiftPoints: 3,
  feedbackCapitalPoints: 10, feedbackResearchPoints: 7, feedbackEducationPoints: 5,
  cpu: {
    resourceTargetUtilization: 0.85, resourceResponse: 25,
    adoptionTarget: 0.65, educationResponse: 12,
    capitalMaturityScale: 12, educationReadinessScale: 120,
    minimumWeight: 0.25,
  },
};
export const CPU_DOCTRINES = {
  balanced: { name: 'Balanced Growth', cities: ['meridian', 'rivermark'], weights: { capital: 5, resources: 5, research: 5, education: 5 }, resourceResponse: 1, educationResponse: 0.7, capitalShift: 1, researchShift: 1 },
  industrial: { name: 'Industrial Push', cities: ['meridian', 'rivermark'], weights: { capital: 12, resources: 4, research: 2, education: 2 }, resourceResponse: 1.2, educationResponse: 0.5, capitalShift: 7, researchShift: 4 },
  humanCapital: { name: 'Human Capital', cities: ['meridian', 'rivermark'], weights: { capital: 3, resources: 3, research: 3, education: 11 }, resourceResponse: 0.8, educationResponse: 0.8, capitalShift: 1, researchShift: 1, educationToResearch: 6 },
  innovation: { name: 'Innovation', cities: ['meridian', 'rivermark'], weights: { capital: 2, resources: 3, research: 10, education: 5 }, resourceResponse: 0.8, educationResponse: 1.5, capitalShift: 0.5, researchShift: 1 },
  resourceSecurity: { name: 'Resource Security', cities: ['meridian', 'rivermark'], weights: { capital: 4, resources: 11, research: 2, education: 3 }, resourceResponse: 1.5, educationResponse: 0.5, capitalShift: 1, researchShift: 1 },
  frontier: { name: 'Frontier Strategy', cities: ['meridian'], weights: { capital: 1, resources: 3, research: 8, education: 8 }, resourceResponse: 1, educationResponse: 1, capitalShift: 0, researchShift: 1 },
};
export const CATEGORIES = [
  { id: 'capital', name: 'Industry & Infrastructure', economicLabel: 'Physical Capital', examples: 'Factories, roads, machinery, power, and logistics', icon: 'factory', short: 'Capital', color: '#526b70', projects: ['Workshop', 'Factory', 'Logistics hub', 'Advanced manufacturing'], description: 'Equip firms and connect the city. Equipment helps most when capital per worker is low; expansion also needs water and utilities.' },
  { id: 'resources', name: 'Food, Water & Resources', economicLabel: 'Resource Capacity', examples: 'Agriculture, utilities, storage, water, and basic inputs', icon: 'leaf', short: 'Resources', color: '#718147', projects: ['Small farm', 'Irrigated fields', 'Water & food systems', 'Resource network'], description: 'Support workers and production. Extra capacity is valuable when systems are strained, but has little direct payoff when supplies are already abundant.' },
  { id: 'research', name: 'Research & Innovation', economicLabel: 'Research', examples: 'Technology adoption, R&D, and production methods', icon: 'flask', short: 'Research', color: '#537a91', projects: ['Adoption workshop', 'Research lab', 'Technology center', 'Innovation campus'], description: 'Build a lasting research base. New methods work better with trained workers and adequate equipment; much of the payoff comes in later cycles.' },
  { id: 'education', name: 'Schools & Training', economicLabel: 'Education / Human Capital', examples: 'Schools, technical training, universities, and workforce skills', icon: 'book', short: 'Education', color: '#aa7751', projects: ['School', 'Technical college', 'University', 'Learning campus'], description: 'Build workforce skills. Most training completes next cycle, improving productivity and the use of technology without creating more workers.' },
];
// Presentation assets live in the centralized visual-config.js manifest.
export const CYCLES = [
  { name: 'Foundations', kicker: 'Choose what comes first', objective: 'Commit your development points to projects in your economy. Across the river, an independent rival is making its own plans.' },
  { name: 'Expansion', kicker: 'Yesterday’s choices change today’s opportunities', objective: 'Inspect the first results. More equipment, spare capacity, skills, or new methods: decide what your city needs next.' },
  { name: 'Productivity', kicker: 'Better tools need capable hands', objective: 'Training and research are beginning to pay off. Look at output per worker, not just the size of the economy.' },
  { name: 'Bottlenecks', kicker: 'Check the foundations of your expansion', objective: 'Check resource security and technology adoption. Strain emerges from the economy you built; no crisis is scheduled for this cycle.' },
  { name: 'Convergence', kicker: 'Look across the river', objective: 'Inspect the productivity gap and your rival’s past investments. Fund the opportunities created by your own city’s history.' },
  { name: 'Long Run', kicker: 'One final development plan', objective: 'Balance the immediate payoff against the future you leave behind. Then compare both paths and the bottlenecks still unresolved.' },
];
