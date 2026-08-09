import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const repoRoot = path.resolve(process.argv[2] || process.cwd());
const CONCEPT = 'opportunity-cost';
const PHASE = 'phase7.2-opportunity-cost-standalone-expansion-v1';
const PREVIOUS = 'phase7.1-scarcity-standalone-expansion-v1';
const GENERATED_AT = '2026-08-10T01:15:00.000Z';
const SOURCE_GAME = 'phase7.2-opportunity-cost-standalone-expansion';
const artifactRoot = path.join(repoRoot, 'validation_artifacts', 'opportunity_cost_standalone_expansion');
const composerRoot = path.join(repoRoot, 'build', 'faculty-build-composer');
const libraryPath = path.join(composerRoot, 'data', 'composer_library.js');
const registryPath = path.join(composerRoot, 'data', 'composer_registry.json');
const manifestPath = path.join(composerRoot, 'data', 'composer_library_manifest.json');
fs.mkdirSync(artifactRoot, { recursive: true });

const sha256 = value => crypto.createHash('sha256').update(value).digest('hex');
const stable = value => Array.isArray(value) ? value.map(stable) : value && typeof value === 'object'
  ? Object.fromEntries(Object.keys(value).sort().map(key => [key, stable(value[key])])) : value;
const idOf = q => String(q?.id || q?.questionId || '');
const normalizeAnswer = value => String(value).normalize('NFKC').trim().replace(/\s+/g, ' ').toLowerCase();
const answerHash = value => sha256(normalizeAnswer(value));
const loadLibrary = raw => { const c = { window: {} }; vm.createContext(c); vm.runInContext(raw, c); return c.window.MQ_COMPOSER_LIBRARY; };
const libraryRaw = fs.readFileSync(libraryPath, 'utf8');
const library = loadLibrary(libraryRaw);
if (!String(library.libraryVersion).endsWith(PREVIOUS) && library.sourceCurationPhase !== PHASE) throw new Error(`Expected ${PREVIOUS}; found ${library.libraryVersion}`);
const module = library.concepts?.[CONCEPT];
if (!module) throw new Error('Opportunity Cost module missing.');

const allLocations = target => [
  ...Object.entries(target.questions || {}).flatMap(([pool, list]) => (list || []).map(question => ({ pool, question }))),
  ...(target.repairQuestions || []).map(question => ({ pool: 'repair', question })),
  ...(target.repairSeedQuestions || []).map(question => ({ pool: 'repairSeed', question })),
  ...(target.bridgeQuestions || []).map(question => ({ pool: 'bridge', question }))
];
const uniqueQuestions = target => { const seen = new Set(); return allLocations(target).filter(x => !seen.has(idOf(x.question)) && seen.add(idOf(x.question))); };
const beforeIds = uniqueQuestions(module).map(x => idOf(x.question)).filter(id => !id.startsWith('P72-OPPC-'));
if (beforeIds.length !== 49) throw new Error(`Expected 49 baseline records, found ${beforeIds.length}.`);

const rewriteSpecs = {
  'ECON-MG-EASY-3': {
    q: 'A library can use its only meeting room for a job workshop or a tax-help clinic this evening. It chooses the workshop. What is the opportunity cost?',
    options: ['The value of the tax-help clinic that cannot be held', 'The original cost of constructing and maintaining the meeting room over time', 'The value of both events added together', 'Zero because the library already owns the room'],
    answer: 'The value of the tax-help clinic that cannot be held', type: 'application', skill: 'next_best_alternative',
    commonError: 'Treating an owned resource as costless or adding both options.', feedback: 'The clinic is the next-best use forgone when the room hosts the workshop.'
  },
  'ECON-MG-EASY-4': {
    q: 'A student spends two hours volunteering instead of preparing for tomorrow’s exam. Which item belongs in the opportunity cost of volunteering?',
    options: ['The value of the study time the student gives up', 'Only the bus fare paid to reach the volunteer site', 'Every activity the student could have imagined doing', 'The volunteer work itself because it was the chosen activity'],
    answer: 'The value of the study time the student gives up', type: 'application', skill: 'nonmonetary_opportunity_cost',
    commonError: 'Ignoring a nonmonetary forgone alternative.', feedback: 'The next-best use of the student’s time can be an opportunity cost without a money price.'
  },
  'P52A-OPPC-E-003': {
    q: 'A parent attends a free evening class and gives up two hours of family time. Why can the class still have an opportunity cost?',
    options: ['The family time is a valued alternative use of those hours', 'Free classes always charge an unannounced cash fee', 'Only the building’s operating expense counts as a cost', 'A zero tuition price eliminates every competing use of the parent’s time'],
    answer: 'The family time is a valued alternative use of those hours', type: 'application', skill: 'nonmonetary_opportunity_cost',
    commonError: 'Equating a zero price with zero opportunity cost.', feedback: 'Time has valued alternative uses even when an activity charges no fee.'
  },
  'P52A-OPPC-E-004': {
    q: 'A resident can spend Saturday repairing a porch, helping at a food pantry, or hiking. Helping at the pantry is chosen, and porch repair was valued most among the rejected options. What is the relevant forgone alternative?',
    options: ['Repairing the porch', 'Hiking only', 'Both rejected activities added together', 'The food-pantry shift that was chosen'],
    answer: 'Repairing the porch', type: 'application', skill: 'next_best_alternative',
    commonError: 'Adding all rejected options or selecting the least-valued one.', feedback: 'Opportunity cost uses the single highest-valued rejected alternative.'
  },
  'ECON-MG-MEDIUM-100': {
    q: 'A laboratory assistant works an extra Saturday shift and gives up a study group that would improve preparation for a licensing exam. Which interpretation is best?',
    options: ['The value of improved exam preparation is part of the shift’s opportunity cost', 'The earned wage makes the forgone study group economically irrelevant', 'Only transportation to the laboratory can count as a cost', 'Every unused Saturday activity must be added to the cost'],
    answer: 'The value of improved exam preparation is part of the shift’s opportunity cost', type: 'application', skill: 'nonmonetary_opportunity_cost',
    commonError: 'Counting only explicit money costs.', feedback: 'A valuable nonmonetary alternative can be the next-best option forgone.'
  },
  'P52A-OPPC-H-003': {
    q: 'A theater has already spent $40,000 designing a production. Before staging it, managers can either spend $25,000 more for an expected $20,000 return or use the dates for a concert expected to net $12,000. What is the opportunity cost of staging the production now?',
    options: ['$12,000 from the forgone concert', '$40,000 already spent on design', '$52,000 from adding design and concert values', '$5,000 because the remaining production return is below its added cost'],
    answer: '$12,000 from the forgone concert', type: 'application', skill: 'sunk_cost_distinction',
    commonError: 'Treating a sunk design expense as the current opportunity cost.', feedback: 'The $40,000 is sunk; the current opportunity cost is the best alternative use of the dates.'
  },
  'ECON-MG-ELITE-333': {
    q: 'A software founder uses a personally owned server for a new service. The server could instead be leased for $18,000, and the founder could earn $70,000 at another firm. Which costs are missing from a cash-expense-only analysis?',
    options: ['Forgone lease income and forgone salary', 'Only the server’s historical purchase price', 'Every possible technology investment added together', 'No costs because neither resource requires a new payment'],
    answer: 'Forgone lease income and forgone salary', type: 'transfer', skill: 'full_cost_opportunity_cost_analysis',
    commonError: 'Ignoring opportunity costs of owner-supplied assets and labor.', feedback: 'Owned capital and owner labor have valuable alternative uses that are implicit costs.'
  },
  'ECON-MG-ELITE-334': {
    q: 'A museum has already paid a nonrefundable $30,000 deposit for an exhibit. It can proceed for another $12,000 and earn $9,000, or use the gallery for a lecture series worth $7,000. Which item is the opportunity cost of proceeding?',
    options: ['The $7,000 lecture series forgone', 'The $30,000 nonrefundable deposit', 'The $42,000 total of past and future spending', 'Zero because the deposit cannot be recovered'],
    answer: 'The $7,000 lecture series forgone', type: 'transfer', skill: 'sunk_cost_distinction',
    commonError: 'Using an irreversible past expenditure instead of the best current alternative.', feedback: 'The deposit is sunk; the lecture series is the best forgone current use.'
  },
  'P52A-OPPC-EL-001': {
    q: 'A county can assign an emergency team to wildfire prevention valued at $1.4 million, flood preparation valued at $1.1 million, or routine inspections valued at $0.8 million. Political rules require the flood project. What is its opportunity cost?',
    options: ['$1.4 million in forgone wildfire prevention', '$2.2 million from both rejected programs', '$1.1 million because that is the chosen project’s value', '$0.8 million because routine inspections cost the least'],
    answer: '$1.4 million in forgone wildfire prevention', type: 'transfer', skill: 'next_best_alternative',
    commonError: 'Confusing the chosen project, the least-valued option, or the sum of alternatives with opportunity cost.', feedback: 'The wildfire program is the most valuable feasible alternative forgone.'
  },
  'ECON-MG-LEGENDARY-9011': {
    q: 'A researcher initially gives up consulting worth $900 to spend a weekend on a paper. A new consulting request worth $1,400 then becomes available before the weekend begins. If the paper remains the choice, how does its opportunity cost change?',
    options: ['It rises from $900 to $1,400 because the next-best alternative changed', 'It remains $900 because only the original alternatives matter', 'It becomes $2,300 because both consulting offers must be added', 'It falls to zero because research produces future benefits'],
    answer: 'It rises from $900 to $1,400 because the next-best alternative changed', type: 'dynamic-analysis', skill: 'opportunity_cost_over_time',
    commonError: 'Freezing opportunity cost when the best available alternative changes.', feedback: 'Opportunity cost is forward-looking and updates when the next-best feasible alternative changes.'
  },
  'ECON-MG-LEGENDARY-9054': {
    q: 'A popular clinic charges no appointment fee, but patients must wait four hours. A nearby clinic charges $80 with almost no wait. Which claim correctly compares the options?',
    options: ['The free clinic can have a higher full cost for a patient whose time is especially valuable', 'The free clinic must have zero opportunity cost because its posted price is zero', 'The paid clinic always has the higher full cost regardless of time values', 'Waiting time is a sunk cost and cannot affect a current clinic choice'],
    answer: 'The free clinic can have a higher full cost for a patient whose time is especially valuable', type: 'synthesis', skill: 'nonmonetary_opportunity_cost',
    commonError: 'Treating posted price as total economic cost.', feedback: 'The opportunity cost of waiting time can outweigh the difference in money price.'
  },
  'ECON-EC-EASYBOSS-17003': {
    q: 'A recreation center assigns its only instructor to swimming lessons instead of the next-best option, a safety workshop. What is the opportunity cost?',
    options: ['The value of the safety workshop that is not offered', 'The instructor’s wage plus every rejected program', 'Zero because the instructor is already employed', 'The value of the swimming lessons that were chosen'],
    answer: 'The value of the safety workshop that is not offered', type: 'application', skill: 'next_best_alternative',
    commonError: 'Using the chosen activity or treating assigned staff as costless.', feedback: 'The safety workshop is the next-best use of the instructor’s time.'
  },
  'ECON-MG-EASYBOSS-2000': {
    q: 'A café manager moves one employee from taking orders to preparing deliveries. The next-best use of that employee was serving counter customers. What is forgone?',
    options: ['The value of the counter service the employee would have provided', 'Every task performed anywhere in the café that day', 'Only the employee’s past training expense', 'Nothing because the employee remains on the payroll'],
    answer: 'The value of the counter service the employee would have provided', type: 'application', skill: 'next_best_alternative',
    commonError: 'Ignoring the displaced output of an already-paid worker.', feedback: 'An employee’s time has an opportunity cost equal to its best forgone use.'
  },
  'ECON-MG-EASYBOSS-2001': {
    q: 'A student uses a prepaid transit pass to travel to a debate tournament instead of visiting a grandparent. Which item can be part of the tournament’s opportunity cost?',
    options: ['The value of the forgone family visit', 'Only an additional transit fare paid today', 'The original price of the transit pass in every case', 'Zero because the pass makes the trip free at the margin'],
    answer: 'The value of the forgone family visit', type: 'application', skill: 'nonmonetary_opportunity_cost',
    commonError: 'Assuming no new cash payment means no opportunity cost.', feedback: 'The valued family visit is a forgone alternative even without a new fare.'
  },
  'P52A-OPPC-B2-001': {
    q: 'A musician spends an evening rehearsing and gives up both a paid performance worth $220 and family time valued at $160. Which alternative determines the opportunity cost?',
    options: ['The $220 performance because it is the more valuable forgone option', 'The $160 family time because nonmonetary options always rank first', 'Both alternatives added together for a total of $380', 'Zero because rehearsal may improve future performance'],
    answer: 'The $220 performance because it is the more valuable forgone option', type: 'application', skill: 'next_best_alternative',
    commonError: 'Adding every rejected option or selecting the lower-valued one.', feedback: 'Only the highest-valued forgone alternative determines opportunity cost.'
  },
  'P52A-OPPC-B3-001': {
    q: 'A city has spent $6 million planning a rail extension. It now must choose between spending $20 million more to finish it or using the construction crews on water repairs valued at $24 million. What is the current opportunity cost of finishing the rail line?',
    options: ['$24 million in forgone water repairs', '$6 million already spent on planning', '$30 million from adding planning and water values', '$20 million because that is the remaining rail expenditure'],
    answer: '$24 million in forgone water repairs', type: 'application', skill: 'sunk_cost_distinction',
    commonError: 'Treating sunk planning expense or remaining explicit spending as the forgone alternative.', feedback: 'The prior planning expense is sunk; the water repairs are the best current alternative use of the crews.'
  },
  'ECON-MG-LEGENDARYBOSS-9103': {
    q: 'A consultant can spend Saturday earning $480 or attend a certification workshop costing $120. She attends the workshop. Ignoring future benefits, what is the opportunity cost of attending?',
    options: ['$120', '$360', '$480', '$600'], answer: '$600', type: 'calculation', skill: 'full_cost_opportunity_cost_analysis', calculationTaskFamily: 'explicit-plus-forgone-wages',
    commonError: 'Counting only the workshop fee or only the forgone earnings.', feedback: 'The $120 fee and $480 forgone earnings together create a $600 opportunity cost.'
  },
  'ECON-MG-LEGENDARYBOSS-9104': {
    q: 'A factory can use a machine shift to produce 300 valves or 180 pumps. It switches from valves to pumps and produces 45 pumps. Assuming constant tradeoffs, how many valves are forgone?',
    options: ['45', '60', '75', '120'], answer: '75', type: 'calculation', skill: 'production_tradeoff_ratio', calculationTaskFamily: 'per-unit-production-tradeoff',
    commonError: 'Reversing the production tradeoff ratio.', feedback: 'Each pump costs 300/180 valves, so 45 pumps cost 75 valves.'
  },
  'ECON-MG-LEGENDARYBOSS-9105': {
    q: 'A student values a concert ticket at $90. She already owns the ticket and could resell it for $140. Attending also requires a $20 parking fee. What is the economic cost of attending tonight?',
    options: ['$20', '$90', '$140', '$160'], answer: '$160', type: 'calculation', skill: 'sunk_cost_distinction', calculationTaskFamily: 'forgone-resale-plus-explicit-cost',
    commonError: 'Using personal value or the original ticket price instead of forgone resale value.', feedback: 'The forgone $140 resale value plus $20 parking cost totals $160; the purchase price is sunk.'
  },
  'P52A-OPPC-BR-001': {
    q: 'Scarcity means a community cannot fund every valued program. How does that fact create opportunity cost when it funds a clinic?',
    options: ['Funding the clinic requires giving up the best alternative program', 'Scarcity makes the clinic’s historical spending a sunk cost', 'Opportunity cost disappears once officials approve a budget', 'Every unfunded program must be added together as the cost'],
    answer: 'Funding the clinic requires giving up the best alternative program', type: 'bridge', skill: 'scarcity_to_opportunity_cost', secondaryConceptIds: ['scarcity-and-tradeoffs'],
    commonError: 'Seeing scarcity and opportunity cost as unrelated definitions.', feedback: 'Scarcity forces a choice; the best forgone use created by that choice is its opportunity cost.'
  },
  'P52A-OPPC-BR-002': {
    q: 'Moving along a production possibilities frontier from more food toward more machinery requires giving up food. What does the food forgone measure?',
    options: ['The opportunity cost of the additional machinery', 'The sunk cost of previously produced food', 'The money price of machinery in the product market', 'The total value of all unattainable production points'],
    answer: 'The opportunity cost of the additional machinery', type: 'bridge', skill: 'opportunity_cost_ppf', secondaryConceptIds: ['production-possibilities-frontier'],
    commonError: 'Failing to connect a production tradeoff with opportunity cost.', feedback: 'The output surrendered when production shifts measures the opportunity cost along a PPF.'
  }
};

const additions = {
  easy: [
    { id:'P72-OPPC-E-005', q:'A nurse can use a lunch break to take a walk or finish a required report. She finishes the report. What is the opportunity cost?', options:['The value of the walk she gives up','The value of the completed report','The value of both lunch-break activities added together','Zero because the break is unpaid'], answer:'The value of the walk she gives up', type:'application', skill:'nonmonetary_opportunity_cost', commonError:'Using the chosen activity instead of the forgone alternative.', feedback:'The walk is the alternative surrendered when the report is chosen.' },
    { id:'P72-OPPC-E-006', q:'A family spends its last $50 of entertainment money on a museum visit instead of the next-best choice, a movie night. What is the opportunity cost?', options:['The value the family placed on movie night','The value of the museum visit itself','Every activity available in the city','Only the family’s earlier spending on unrelated entertainment choices'], answer:'The value the family placed on movie night', type:'application', skill:'next_best_alternative', commonError:'Confusing the selected benefit with the best option forgone.', feedback:'Movie night is the next-best alternative given up.' },
    { id:'P72-OPPC-E-007', q:'A bakery assigns its only decorator to a wedding cake, so a birthday-cake order cannot be completed. Which item is forgone?', options:['The value of the birthday-cake order','The decorator’s entire annual salary plus all bakery overhead','Both cake orders added together','Nothing because the decorator remains employed'], answer:'The value of the birthday-cake order', type:'application', skill:'opportunity_cost_identification', commonError:'Ignoring the alternative output of an already-employed worker.', feedback:'The birthday-cake order is the best displaced use of the decorator’s time.' },
    { id:'P72-OPPC-E-008', q:'A nonprofit uses a donated room for tutoring instead of leasing it to a neighborhood group. Which item can be an opportunity cost?', options:['The rental value the nonprofit gives up','The donor’s original cost of the room','Zero because the room was donated','Every possible future use combined'], answer:'The rental value the nonprofit gives up', type:'application', skill:'owned_resource_opportunity_cost', commonError:'Treating a donated or owned resource as costless.', feedback:'Forgone rental value is an implicit opportunity cost of using the room.' }
  ],
  medium: [
    { id:'P72-OPPC-M-006', q:'A photographer can accept a portrait job worth $500, an event job worth $650, or spend the day editing a personal project valued at $420. If the portrait job is chosen, what is its opportunity cost?', options:['$650 from the event job','$1,070 from both rejected options','$500 from the chosen portrait job','$420 from the least valuable alternative'], answer:'$650 from the event job', type:'calculation', skill:'next_best_alternative', calculationTaskFamily:'next-best-return', commonError:'Adding rejected options or selecting the chosen or least-valued alternative.', feedback:'The $650 event job is the highest-valued option forgone.' },
    { id:'P72-OPPC-M-007', q:'A free certification exam takes five hours. A worker would otherwise earn $25 per hour and also pays $15 for transit. Ignoring other effects, what is the opportunity cost?', options:['$140 from forgone wages plus transit','$125 from forgone wages only','$15 because only cash payments count','$110 after subtracting transit from wages'], answer:'$140 from forgone wages plus transit', type:'calculation', skill:'full_cost_opportunity_cost_analysis', calculationTaskFamily:'time-wages-plus-explicit-cost', commonError:'Omitting either forgone earnings or an explicit cost.', feedback:'Five hours of wages equal $125; adding $15 transit gives $140.' },
    { id:'P72-OPPC-M-008', q:'A printer owned by a design firm can produce client brochures worth $9,000 or internal marketing materials worth $6,500. If it produces internal materials, what is the opportunity cost?', options:['$9,000 in forgone client work','$2,500 as the difference in values','$6,500 from the chosen materials','Zero because the firm owns the printer'], answer:'$9,000 in forgone client work', type:'application', skill:'owned_resource_opportunity_cost', commonError:'Using the value difference or treating owned equipment as free.', feedback:'The best forgone use of the printer is the $9,000 client work.' },
    { id:'P72-OPPC-M-009', q:'A student spends three hours at a free festival instead of tutoring for $22 per hour. Ignoring other costs, what is the opportunity cost?', options:['$66 in forgone tutoring wages','$22 because only one hourly wage counts','$0 because festival admission is free','$88 from adding the chosen event’s value'], answer:'$66 in forgone tutoring wages', type:'calculation', skill:'forgone_wages', calculationTaskFamily:'forgone-wages-over-time', commonError:'Ignoring duration or assuming zero price means zero cost.', feedback:'Three forgone tutoring hours at $22 each equal $66.' },
    { id:'P72-OPPC-M-010', q:'A club paid a nonrefundable $2,000 deposit for a banquet. Today it can hold the banquet or use the date for a fundraiser expected to net $3,500. Which amount is the opportunity cost of holding the banquet now?', options:['$3,500 from the forgone fundraiser','$2,000 from the nonrefundable deposit','$5,500 from adding both amounts','$1,500 from subtracting the deposit'], answer:'$3,500 from the forgone fundraiser', type:'application', skill:'sunk_cost_distinction', commonError:'Substituting a sunk payment for the best current alternative.', feedback:'The deposit cannot be changed; the fundraiser is the current alternative forgone.' },
    { id:'P72-OPPC-M-011', q:'A mechanic plans to repair personal equipment, giving up a customer job worth $300. Before work begins, a $450 emergency job becomes available. If the personal repair remains the choice, what is its opportunity cost?', options:['$450 because the best available alternative changed','$300 because the original plan fixes the cost','$750 because both customer jobs are forgone','$150 because only the increase matters'], answer:'$450 because the best available alternative changed', type:'dynamic-analysis', skill:'opportunity_cost_over_time', commonError:'Failing to update the next-best alternative.', feedback:'The new $450 job replaces the $300 job as the best option forgone.' }
  ],
  hard: [
    { id:'P72-OPPC-H-007', q:'A retailer uses an owned parcel for parking. The parcel could be leased for $70,000 or used for pickup lockers expected to net $85,000. Parking produces a benefit valued at $90,000. What is the opportunity cost of parking?', options:['$85,000 from the locker project','$155,000 from both rejected uses','$5,000 as parking’s net advantage','$70,000 because leasing is a cash transaction'], answer:'$85,000 from the locker project', type:'calculation', skill:'owned_resource_opportunity_cost', calculationTaskFamily:'owned-resource-next-best-return', commonError:'Adding alternatives or using the lower cash-based option.', feedback:'The locker project is the most valuable feasible use forgone.' },
    { id:'P72-OPPC-H-008', q:'A one-year program charges $18,000 tuition and $2,000 for required supplies. A student gives up a $44,000 job but gains employer-independent health coverage valued at $4,000 while enrolled. Ignoring future benefits, what is the net opportunity cost?', options:['$60,000 after crediting the gained coverage','$64,000 from tuition, supplies, and wages','$44,000 because only forgone earnings count','$20,000 because only explicit payments count'], answer:'$60,000 after crediting the gained coverage', type:'calculation', skill:'opportunity_cost_net_benefit', calculationTaskFamily:'mixed-costs-and-offsetting-benefit', commonError:'Omitting explicit costs or failing to credit a benefit received.', feedback:'Costs total $64,000; subtracting the $4,000 gained benefit leaves $60,000.' },
    { id:'P72-OPPC-H-009', q:'A government funds a coastal barrier valued at $30 million. The same engineers could instead complete a water system valued at $34 million or road repairs valued at $21 million. Which statement is correct?', options:['The barrier’s opportunity cost is the $34 million water system','$55 million is the cost because both alternatives are rejected','$4 million is the cost because it is the value difference','$30 million is the cost because it is the chosen project’s value'], answer:'The barrier’s opportunity cost is the $34 million water system', type:'application', skill:'next_best_alternative', commonError:'Adding rejected projects or using chosen value or value difference.', feedback:'The water system is the highest-valued alternative use of the engineers.' },
    { id:'P72-OPPC-H-010', q:'A factory bought a machine for $500,000 five years ago. It can now use one shift for parts worth $28,000 or rent the shift to another firm for $31,000. What is the current opportunity cost of producing parts?', options:['$31,000 in forgone rental income','$500,000 from the historical purchase','$3,000 as the difference between uses','$28,000 because that is the chosen output'], answer:'$31,000 in forgone rental income', type:'application', skill:'sunk_cost_distinction', commonError:'Using historical purchase price or the value difference as opportunity cost.', feedback:'The purchase price is sunk; current opportunity cost is the best alternative return.' },
    { id:'P72-OPPC-H-011', q:'An entrepreneur can keep a salaried job paying $82,000 or launch a venture expected to earn $105,000 after explicit expenses while using an owned office that could rent for $16,000. Ignoring risk differences, what is expected economic profit?', options:['$7,000 after both implicit costs','$23,000 after salary alone','$89,000 after rent alone','$105,000 because explicit expenses are paid'], answer:'$7,000 after both implicit costs', type:'calculation', skill:'full_cost_opportunity_cost_analysis', calculationTaskFamily:'economic-profit-owner-resources', commonError:'Ignoring forgone salary or rental income.', feedback:'Subtract $82,000 salary and $16,000 rent from $105,000 to obtain $7,000.' },
    { id:'P72-OPPC-H-012', q:'A researcher devotes ten hours per week for six weeks to an unpaid project instead of consulting at $75 per hour. She also pays a one-time $120 data fee. Ignoring benefits, what is the total opportunity cost?', options:['$4,620 from forgone consulting plus the fee','$4,500 from forgone consulting only','$870 from one week of time plus the fee','$120 because the project pays no wage'], answer:'$4,620 from forgone consulting plus the fee', type:'calculation', skill:'forgone_wages', calculationTaskFamily:'total-opportunity-cost-over-time', commonError:'Ignoring repeated time or the explicit project fee.', feedback:'Sixty consulting hours cost $4,500; adding the $120 fee gives $4,620.' }
  ],
  elite: [
    { id:'P72-OPPC-EL-003', q:'A port authority has already installed specialized foundations for a terminal. It can complete the terminal for $40 million and obtain benefits of $55 million, or redirect crews to storm protection worth $22 million. Which comparison is relevant now?', options:['Terminal net benefit of $15 million versus $22 million forgone storm protection','All foundation spending plus $40 million versus terminal benefits','Terminal benefits of $55 million versus foundation spending alone','Only the irreversible foundations because they created the current choice'], answer:'Terminal net benefit of $15 million versus $22 million forgone storm protection', type:'transfer', skill:'sunk_cost_distinction', commonError:'Allowing sunk construction to replace forward-looking incremental costs and alternatives.', feedback:'Past foundations are sunk; completing nets $15 million and forgoes storm protection worth $22 million.' },
    { id:'P72-OPPC-EL-004', q:'An owner-operated studio earns $150,000 after explicit expenses. The owner could earn $92,000 elsewhere, lease the studio for $28,000, and license the brand separately for $18,000. What is economic profit?', options:['$12,000 after all three implicit costs','$30,000 after salary and studio rent','$58,000 after forgone salary only','$138,000 after subtracting the least alternative'], answer:'$12,000 after all three implicit costs', type:'multi-step', skill:'full_cost_opportunity_cost_analysis', calculationTaskFamily:'multiple-owner-supplied-inputs', commonError:'Omitting one or more separable owner-supplied resources.', feedback:'Implicit costs total $138,000, leaving $12,000 in economic profit.' }
  ],
  legendary: [
    { id:'P72-OPPC-L-005', q:'A student chooses a fellowship that pays $12,000 and provides research experience valued at $8,000. The best rejected option is a job paying $27,000; a second rejected internship is valued at $21,000. What is the opportunity cost of the fellowship?', options:['$27,000 from the best rejected job','$48,000 from both rejected positions','$7,000 after subtracting fellowship benefits','$20,000 from the fellowship’s own combined value'], answer:'$27,000 from the best rejected job', type:'multi-step', skill:'next_best_alternative', calculationTaskFamily:'next-best-composite-alternatives', commonError:'Adding rejected alternatives or netting chosen benefits against opportunity cost.', feedback:'The job is the single highest-valued feasible alternative forgone.' },
    { id:'P72-OPPC-L-006', q:'A startup has one engineering sprint. A reliability upgrade would create $140,000 in value, a new feature $125,000, and a custom client project $115,000. The firm chooses the feature because $30,000 was already spent designing it. What is the feature’s opportunity cost now?', options:['$140,000 from the reliability upgrade','$30,000 from the completed design work','$255,000 from both rejected projects','$15,000 as the difference between top values'], answer:'$140,000 from the reliability upgrade', type:'synthesis', skill:'sunk_cost_distinction', commonError:'Letting sunk design work displace the best current alternative.', feedback:'Past design spending is sunk; reliability is the most valuable use of the sprint forgone.' },
    { id:'P72-OPPC-L-007', q:'A hospital reserves an operating room for a procedure expected to generate 18 quality-adjusted life-years. The room could instead support procedures expected to generate 22 or 14 quality-adjusted life-years. What is the opportunity cost?', options:['22 quality-adjusted life-years from the best alternative','36 quality-adjusted life-years from both alternatives','4 quality-adjusted life-years as the difference','18 quality-adjusted life-years from the chosen procedure'], answer:'22 quality-adjusted life-years from the best alternative', type:'transfer', skill:'nonmonetary_opportunity_cost', commonError:'Assuming opportunity cost must be money or only a value difference.', feedback:'The most valuable forgone procedure determines the nonmonetary opportunity cost.' },
    { id:'P72-OPPC-L-008', q:'A research council funds an energy project with expected social benefit of $42 million. The same budget and scientists could support a vaccine platform worth $50 million or several smaller projects worth $37 million in total. What is forgone?', options:['The $50 million vaccine platform as the next-best package','$87 million from all rejected research combined','$8 million as the difference between the top projects','$42 million because that is the funded project’s benefit'], answer:'The $50 million vaccine platform as the next-best package', type:'policy-analysis', skill:'next_best_alternative', commonError:'Adding mutually exclusive alternatives or using the difference in values.', feedback:'The vaccine platform is the highest-valued feasible alternative allocation.' },
    { id:'P72-OPPC-L-009', q:'A city uses waterfront land for a public market valued at $9 million annually. The land could support housing valued at $12 million or be leased for offices at $10 million. What is the market’s annual opportunity cost?', options:['$12 million from the housing use','$22 million from housing plus offices','$3 million as the housing-market difference','$10 million because lease income is monetary'], answer:'$12 million from the housing use', type:'calculation', skill:'owned_resource_opportunity_cost', calculationTaskFamily:'public-land-alternative-use', commonError:'Adding alternatives or privileging a cash return over a higher noncash value.', feedback:'Housing is the highest-valued alternative use of the waterfront land.' },
    { id:'P72-OPPC-L-010', q:'During a drought, one unit of water can preserve orchard output worth $600, support household use valued at $750, or maintain habitat valued at $680. If it is assigned to the orchard, what is its opportunity cost?', options:['$750 in forgone household-use value','$1,430 from both rejected uses','$150 as the difference from household use','$600 because that is the orchard value'], answer:'$750 in forgone household-use value', type:'resource-allocation', skill:'next_best_alternative', commonError:'Adding alternative uses or reporting the value difference.', feedback:'Household use is the most valuable feasible alternative forgone.' },
    { id:'P72-OPPC-L-011', q:'Military engineers can repair a base runway, restore a civilian bridge worth $18 million, or reinforce a dam worth $23 million. The runway is selected for strategic reasons. Which economic statement follows?', options:['Its opportunity cost is the $23 million dam reinforcement','Its opportunity cost is every civilian project added together','Strategic importance eliminates opportunity cost','Its opportunity cost is the lower-valued bridge project'], answer:'Its opportunity cost is the $23 million dam reinforcement', type:'policy-analysis', skill:'next_best_alternative', commonError:'Assuming a mandated or strategic choice has no opportunity cost.', feedback:'Even a required choice forgoes the highest-valued feasible alternative use.' },
    { id:'P72-OPPC-L-012', q:'A factory assigns its only robotics specialist to reduce defects, creating $95,000 in expected value. The specialist could instead increase output by $110,000 or cut energy costs by $80,000. What is the opportunity cost of the defect project?', options:['$110,000 in forgone output gains','$190,000 from both rejected assignments','$15,000 as the value difference','$95,000 from the selected assignment'], answer:'$110,000 in forgone output gains', type:'labor-allocation', skill:'opportunity_cost_identification', commonError:'Using selected value, summed alternatives, or the difference.', feedback:'The output assignment is the best alternative use of the specialist.' },
    { id:'P72-OPPC-L-013', q:'An arena uses a Saturday date for a youth championship valued at $160,000. A concert would net $210,000 and a convention would net $185,000. The championship also requires $15,000 in security spending. What is its full opportunity cost?', options:['$225,000 from the concert plus security','$210,000 from the concert alone','$410,000 from both rejected events plus security','$65,000 from the value difference plus security'], answer:'$225,000 from the concert plus security', type:'calculation', skill:'full_cost_opportunity_cost_analysis', calculationTaskFamily:'explicit-cost-plus-next-best-event', commonError:'Omitting explicit cost or adding multiple rejected events.', feedback:'The best forgone event is $210,000; adding $15,000 security gives $225,000.' },
    { id:'P72-OPPC-L-014', q:'A tunnel-boring machine can complete 80 meters of transit tunnel or 50 meters of a water tunnel per month. If 20 meters of water tunnel are produced under a constant tradeoff, how many transit-tunnel meters are forgone?', options:['32 meters','20 meters','50 meters','80 meters'], answer:'32 meters', type:'calculation', skill:'production_tradeoff_ratio', calculationTaskFamily:'constant-production-tradeoff', commonError:'Reversing or ignoring the output tradeoff ratio.', feedback:'Each water meter costs 80/50 transit meters; 20 water meters cost 32 transit meters.' },
    { id:'P72-OPPC-L-015', q:'A nonprofit has 400 skilled volunteer-hours. A tax clinic would use all hours and create value estimated at $30,000. The best alternative is a housing clinic worth $34,000; a food program worth $20,000 uses different volunteers. What is the tax clinic’s opportunity cost?', options:['$34,000 from the housing clinic','$54,000 from both other programs','$4,000 as the difference in clinic values','$30,000 from the tax clinic itself'], answer:'$34,000 from the housing clinic', type:'constraint-analysis', skill:'next_best_alternative', commonError:'Including an alternative that does not compete for the constrained resource.', feedback:'Only feasible competing uses of the same volunteer-hours matter; housing is the best one.' },
    { id:'P72-OPPC-L-016', q:'A farmer plants berries on land that could yield corn worth $48,000 or solar-lease income of $55,000. Berries are expected to net $62,000 after new expenses. What is the berries’ net benefit relative to their opportunity cost?', options:['$7,000','$14,000','$55,000','$117,000'], answer:'$7,000', type:'calculation', skill:'opportunity_cost_net_benefit', calculationTaskFamily:'net-benefit-relative-to-best-land-use', commonError:'Comparing with the wrong land use or adding alternative returns.', feedback:'The solar lease is the $55,000 opportunity cost; $62,000 minus $55,000 equals $7,000.' },
    { id:'P72-OPPC-L-017', q:'A plant can produce 240 sensors or 160 controllers per shift. An order requires 60 controllers. With a constant production tradeoff, what is the opportunity cost of filling the order?', options:['90 sensors','40 sensors','60 sensors','160 sensors'], answer:'90 sensors', type:'calculation', skill:'production_tradeoff_ratio', calculationTaskFamily:'required-output-tradeoff', commonError:'Using the controller quantity directly or reversing the ratio.', feedback:'Each controller costs 240/160 sensors, so 60 controllers cost 90 sensors.' },
    { id:'P72-OPPC-L-018', q:'A cloud platform uses reserved computing capacity for fraud detection worth $1.8 million. The capacity could instead support search improvements worth $2.1 million or recommendation improvements worth $1.9 million. Reservation fees were prepaid and nonrefundable. What is the current opportunity cost?', options:['$2.1 million from search improvements','The nonrefundable reservation fee','$4.0 million from both rejected systems','$0.3 million as the difference from search'], answer:'$2.1 million from search improvements', type:'technology-transfer', skill:'sunk_cost_distinction', commonError:'Using a prepaid sunk fee or the difference rather than the forgone project.', feedback:'The prepaid fee is sunk; search is the highest-valued alternative use of capacity.' },
    { id:'P72-OPPC-L-019', q:'A consultant chooses a public-interest case, initially giving up a $40,000 commercial project. That commercial project is canceled, and the best remaining alternative is a $28,000 training contract. What happens to the case’s opportunity cost?', options:['It falls from $40,000 to $28,000','It stays $40,000 because the original choice is binding','It becomes $68,000 because both projects were once possible','It becomes zero because the first alternative disappeared'], answer:'It falls from $40,000 to $28,000', type:'dynamic-analysis', skill:'opportunity_cost_over_time', commonError:'Treating a no-longer-feasible alternative as the current opportunity cost.', feedback:'Opportunity cost updates to the best alternative that remains feasible.' },
    { id:'P72-OPPC-L-020', q:'A pharmaceutical lab has spent $12 million on a failed compound. It can spend $3 million to pursue a weak follow-up or use the same scientists on a platform expected to create $7 million in value. Which amount is the follow-up’s opportunity cost now?', options:['$7 million from the platform project','$12 million already spent on the compound','$15 million from past and future research spending','$4 million from subtracting follow-up spending'], answer:'$7 million from the platform project', type:'sunk-cost-trap', skill:'sunk_cost_distinction', commonError:'Counting unrecoverable research spending as the current alternative forgone.', feedback:'The $12 million is sunk; the platform is the best current use of the scientists.' },
    { id:'P72-OPPC-L-021', q:'A chef opens a restaurant that earns $130,000 after explicit expenses. The chef gives up a $78,000 salary, uses an owned space that could rent for $32,000, and supplies equipment that could lease for $9,000. What is economic profit?', options:['$11,000','$20,000','$52,000','$119,000'], answer:'$11,000', type:'calculation', skill:'full_cost_opportunity_cost_analysis', calculationTaskFamily:'economic-profit-three-implicit-inputs', commonError:'Omitting one or more owner-supplied inputs.', feedback:'Implicit costs total $119,000, so economic profit is $130,000 minus $119,000, or $11,000.' },
    { id:'P72-OPPC-L-022', q:'A transportation agency can start a bus redesign now or delay it one year to complete a safety audit worth $6 million. Delay would also raise redesign costs by $2 million. If it starts now, which item describes the opportunity cost?', options:['The $6 million safety audit forgone','The $2 million future cost increase avoided','Both amounts added because each relates to timing','The entire budget of the bus redesign'], answer:'The $6 million safety audit forgone', type:'dynamic-policy', skill:'opportunity_cost_over_time', commonError:'Confusing a consequence of the chosen timing with the alternative forgone.', feedback:'Starting now forgoes the audit; avoided future expense is a benefit of starting now, not its opportunity cost.' },
    { id:'P72-OPPC-L-023', q:'A free municipal charging station requires a two-hour wait. One driver could earn $35 per hour during that time; another values the same two hours at $20 total. Which statement is best?', options:['The first driver faces the larger time opportunity cost','Both drivers face zero cost because charging is free','Both drivers face the same cost because the wait is identical','The second driver faces the larger cost because leisure is nonmonetary'], answer:'The first driver faces the larger time opportunity cost', type:'heterogeneous-values', skill:'nonmonetary_opportunity_cost', commonError:'Assuming identical time requirements imply identical opportunity costs.', feedback:'Opportunity cost depends on the value of each person’s best alternative use of time.' },
    { id:'P72-OPPC-L-024', q:'A workshop can use one hour to make the first table by giving up 3 chairs, while making a second table would require giving up 5 additional chairs. What is the opportunity cost of the second table?', options:['5 chairs','3 chairs','8 chairs','2 chairs'], answer:'5 chairs', type:'calculation', skill:'production_tradeoff_ratio', calculationTaskFamily:'marginal-unit-opportunity-cost', commonError:'Using the first unit’s cost or cumulative cost for the next unit.', feedback:'The relevant cost of the second table is the 5 additional chairs forgone.' },
    { id:'P72-OPPC-L-025', q:'A media company uses a studio day for a documentary expected to net $70,000. A sports broadcast would net $82,000 after a $6,000 licensing fee, while a concert stream would net $75,000. What is the documentary’s opportunity cost?', options:['$82,000 from the sports broadcast','$157,000 from both rejected programs','$12,000 as the difference from sports','$76,000 before the sports licensing fee'], answer:'$82,000 from the sports broadcast', type:'multi-step', skill:'next_best_alternative', calculationTaskFamily:'compare-net-alternative-returns', commonError:'Comparing gross rather than net alternatives or summing rejected options.', feedback:'The stated $82,000 sports return is already net and is the highest-valued alternative.' }
  ],
  boss: [
    { id:'P72-OPPC-B1-005', tier:'easyBoss', q:'A student spends a free afternoon practicing piano instead of the next-best option, visiting a friend. What is the opportunity cost?', options:['The value of the friend visit that is forgone','Zero because neither activity requires payment','The value of both activities added together','The value of piano practice because it was chosen'], answer:'The value of the friend visit that is forgone', type:'application', skill:'nonmonetary_opportunity_cost', commonError:'Assuming only money payments create opportunity cost.', feedback:'The valued friend visit is the next-best use of the afternoon forgone.' },
    { id:'P72-OPPC-B2-004', tier:'mediumBoss', q:'A business uses its owned van for deliveries instead of renting it out for $900 or using it for service calls worth $1,100. What is the delivery decision’s opportunity cost?', options:['$1,100 from the service calls','$2,000 from both rejected uses','$900 because rental income is explicit cash','$0 because the business owns the van'], answer:'$1,100 from the service calls', type:'application', skill:'owned_resource_opportunity_cost', commonError:'Adding uses, privileging cash rent, or treating ownership as costless.', feedback:'Service calls are the highest-valued alternative use of the van.' },
    { id:'P72-OPPC-B2-005', tier:'mediumBoss', q:'A worker attends a free six-hour workshop instead of a shift paying $24 per hour and pays $12 for parking. Ignoring benefits, what is the opportunity cost?', options:['$156 from forgone wages plus parking','$144 from forgone wages only','$12 because the workshop is free','$132 after subtracting parking'], answer:'$156 from forgone wages plus parking', type:'calculation', skill:'full_cost_opportunity_cost_analysis', calculationTaskFamily:'checkpoint-wages-plus-explicit-cost', commonError:'Omitting either forgone wages or an explicit cost.', feedback:'Six hours at $24 equals $144; adding $12 parking gives $156.' },
    { id:'P72-OPPC-B3-004', tier:'finalBoss', q:'A university has already spent $4 million designing a laboratory. It can finish the lab or assign the same construction team to a residence project valued at $11 million. What is the current opportunity cost of finishing the lab?', options:['$11 million in forgone residence value','$4 million already spent on design','$15 million from adding both amounts','Zero because laboratory design is complete'], answer:'$11 million in forgone residence value', type:'application', skill:'sunk_cost_distinction', commonError:'Treating sunk design spending as the current alternative forgone.', feedback:'The design expense is sunk; the residence project is the current best alternative use of the team.' },
    { id:'P72-OPPC-B3-005', tier:'finalBoss', q:'A firm earns $190,000 after explicit expenses. The owner gives up a $105,000 salary, $45,000 in rental income, and $20,000 from leasing equipment. What is economic profit?', options:['$20,000','$40,000','$85,000','$170,000'], answer:'$20,000', type:'calculation', skill:'full_cost_opportunity_cost_analysis', calculationTaskFamily:'checkpoint-multiple-implicit-costs', commonError:'Omitting one or more owner-supplied inputs.', feedback:'Implicit costs total $170,000, leaving $20,000 in economic profit.' }
  ],
  legendaryBoss: [
    { id:'P72-OPPC-LB-006', q:'A foundation can fund a health program worth $8 million, an education program worth $7 million, or two compatible small programs together worth $9 million. It chooses health. What is the opportunity cost?', options:['$9 million from the compatible program package','$16 million from all rejected projects','$1 million as the difference from the package','$8 million from the chosen health program'], answer:'$9 million from the compatible program package', type:'multi-step', skill:'next_best_alternative', commonError:'Failing to treat a feasible package as one alternative or adding mutually exclusive options.', feedback:'The compatible package is the most valuable feasible alternative forgone.' },
    { id:'P72-OPPC-LB-007', q:'An owner uses a shop that could rent for $36,000 and works there instead of earning a $64,000 salary. The shop earns $112,000 after explicit expenses. What is economic profit?', options:['$12,000','$48,000','$76,000','$112,000'], answer:'$12,000', type:'calculation', skill:'full_cost_opportunity_cost_analysis', calculationTaskFamily:'legendary-checkpoint-owner-rent-and-labor', commonError:'Ignoring either owner labor or owned-property rent.', feedback:'Subtract $64,000 salary and $36,000 rent from $112,000 to obtain $12,000.' },
    { id:'P72-OPPC-LB-008', q:'A film studio spent $9 million on footage that cannot be resold. It can spend $4 million more to finish the film or use its release slot for a documentary worth $6 million. What is the film’s current opportunity cost?', options:['$6 million from the documentary','$9 million in unrecoverable footage','$13 million in total film spending','$2 million as the documentary-finish difference'], answer:'$6 million from the documentary', type:'sunk-cost-trap', skill:'sunk_cost_distinction', commonError:'Counting unrecoverable production spending as the current forgone alternative.', feedback:'The $9 million is sunk; the documentary is the best alternative use of the release slot.' },
    { id:'P72-OPPC-LB-009', q:'A city assigns a scarce engineering team to a stadium roof. A flood barrier would create $26 million in value and a transit repair $19 million. The stadium roof is legally required. What is its opportunity cost?', options:['$26 million from the flood barrier','$45 million from both public projects','$7 million as the difference between alternatives','Zero because the roof is legally required'], answer:'$26 million from the flood barrier', type:'policy-analysis', skill:'next_best_alternative', commonError:'Assuming a mandate eliminates opportunity cost or adding rejected projects.', feedback:'A mandate does not erase the best alternative use of the engineering team.' },
    { id:'P72-OPPC-LB-010', q:'A machine produces 420 filters or 280 pumps per day. A contract requires 70 pumps. Under a constant tradeoff, how many filters are forgone?', options:['105 filters','70 filters','140 filters','210 filters'], answer:'105 filters', type:'calculation', skill:'production_tradeoff_ratio', calculationTaskFamily:'legendary-checkpoint-production-ratio', commonError:'Reversing the output ratio or using the required pump count directly.', feedback:'Each pump costs 420/280 filters; 70 pumps therefore cost 105 filters.' },
    { id:'P72-OPPC-LB-011', q:'A manager plans to use a weekend for maintenance, initially giving up production worth $40,000. Before the weekend, an urgent order worth $58,000 becomes feasible. If maintenance continues, what is its opportunity cost?', options:['$58,000 from the urgent order','$98,000 from both production alternatives','$40,000 because the plan was made first','$18,000 because only the increase matters'], answer:'$58,000 from the urgent order', type:'dynamic-analysis', skill:'opportunity_cost_over_time', commonError:'Failing to update opportunity cost when a better feasible alternative appears.', feedback:'The urgent order becomes the next-best alternative forgone.' }
  ],
  repair: [
    { id:'P72-OPPC-R-004', q:'A person rejects options valued at $30, $20, and $5. If another activity is chosen, which rejected value determines its opportunity cost?', options:['$30, the highest-valued rejected option','$55, the sum of all rejected options','$5, the least-valued rejected option','$20, the middle rejected option'], answer:'$30, the highest-valued rejected option', type:'diagnostic', skill:'next_best_alternative', commonError:'Adding all rejected alternatives or selecting the least valuable.', feedback:'Opportunity cost uses one alternative: the highest-valued option forgone.' },
    { id:'P72-OPPC-R-005', q:'Why can spending an hour in a free park have an opportunity cost?', options:['The hour could have been used for another valued activity','Parks always collect a hidden entrance payment','Only travel spending can create opportunity cost','Free time has no alternative uses'], answer:'The hour could have been used for another valued activity', type:'diagnostic', skill:'nonmonetary_opportunity_cost', commonError:'Assuming opportunity cost must be monetary.', feedback:'Time is scarce and can have a valuable next-best use even when no money changes hands.' },
    { id:'P72-OPPC-R-006', q:'A nonrefundable ticket was bought last month. When deciding whether to attend tonight, what should be treated as sunk?', options:['The amount already paid for the ticket','The best activity available tonight','Income that could be earned during the event','A resale price still available tonight'], answer:'The amount already paid for the ticket', type:'diagnostic', skill:'sunk_cost_distinction', commonError:'Treating an unrecoverable past payment as a current opportunity cost.', feedback:'A sunk payment cannot be changed; current alternatives and recoverable values remain relevant.' },
    { id:'P72-OPPC-R-007', q:'An owner uses a room that could be rented to someone else. Why is the room not costless?', options:['Using it gives up possible rental income','Ownership requires paying its purchase price again','Every imaginable room use must be added together','Only borrowed rooms can have opportunity costs'], answer:'Using it gives up possible rental income', type:'diagnostic', skill:'owned_resource_opportunity_cost', commonError:'Assuming owned resources have no opportunity cost.', feedback:'The best forgone use of an owned resource is an implicit cost.' },
    { id:'P72-OPPC-R-008', q:'A worker takes two unpaid hours off instead of working for $18 per hour. What wage value is forgone?', options:['$36','$18','$0','$54'], answer:'$36', type:'diagnostic', skill:'forgone_wages', calculationTaskFamily:'repair-forgone-wages', commonError:'Ignoring duration or assuming unpaid time has no opportunity cost.', feedback:'Two forgone work hours at $18 each equal $36.' }
  ],
  bridge: [
    { id:'P72-OPPC-BR-003', q:'Two producers can make the same goods, but one gives up fewer shirts for each bicycle. How does opportunity cost identify comparative advantage?', options:['The producer giving up fewer shirts has comparative advantage in bicycles','The producer making more total goods in both industries must have comparative advantage','The producer with the higher bicycle opportunity cost should specialize','Comparative advantage depends only on money prices of the goods'], answer:'The producer giving up fewer shirts has comparative advantage in bicycles', type:'bridge', skill:'opportunity_cost_comparative_advantage', secondaryConceptIds:['gains-from-trade'], commonError:'Assigning comparative advantage to absolute output or higher opportunity cost.', feedback:'Comparative advantage belongs to the producer with the lower opportunity cost.' },
    { id:'P72-OPPC-BR-004', q:'A firm considers producing one additional unit. How does opportunity cost enter a marginal decision?', options:['The forgone value of resources used for that unit is compared with its added benefit','Every past expense and every earlier unit’s benefit are added to the next unit’s marginal cost','The total benefit of all earlier units determines the next unit’s cost','Opportunity cost matters only before the first unit is produced'], answer:'The forgone value of resources used for that unit is compared with its added benefit', type:'bridge', skill:'opportunity_cost_marginal_decision', secondaryConceptIds:['marginal-analysis'], commonError:'Using sunk or total values instead of additional benefit and cost.', feedback:'Marginal analysis compares added benefit with the opportunity cost of the next unit.' },
    { id:'P72-OPPC-BR-005', q:'An entrepreneur uses a personally owned building and unpaid owner labor. How do these opportunity costs connect to economic profit?', options:['Forgone rent and salary are implicit costs subtracted from accounting profit','Owned inputs disappear from both accounting and economic analysis','Historical purchase prices plus every owner cash withdrawal are charged again each period','Economic profit subtracts every rejected business idea'], answer:'Forgone rent and salary are implicit costs subtracted from accounting profit', type:'bridge', skill:'opportunity_cost_implicit_cost', secondaryConceptIds:['costs-of-production'], commonError:'Treating owner-supplied inputs as free when moving from accounting to economic profit.', feedback:'Implicit opportunity costs explain why economic profit can be below accounting profit.' },
    { id:'P72-OPPC-BR-006', q:'A workshop gives up progressively more chairs for each additional table. What connection does this create between opportunity cost and the production tradeoff?', options:['The opportunity cost of later tables rises as more chairs are forgone','Opportunity cost stays equal to the money price of a table in every production decision','Past chair production becomes a sunk cost of every table','The tradeoff disappears because both goods use the same workshop'], answer:'The opportunity cost of later tables rises as more chairs are forgone', type:'bridge', skill:'opportunity_cost_production_tradeoff', secondaryConceptIds:['production-possibilities-frontier'], commonError:'Failing to interpret forgone output as the cost of additional production.', feedback:'The amount of one good forgone measures the opportunity cost of producing more of the other.' }
  ]
};

function questionHash(question) {
  return sha256(JSON.stringify(stable({ q: question.q, options: question.options, aHash: question.aHash, type: question.type, difficulty: question.difficulty, primarySkill: question.primarySkill, repairSkill: question.repairSkill })));
}
function snapshot(question) {
  return { id:idOf(question), q:question.q, options:[...(question.options || [])], aHash:question.aHash, type:question.type, difficulty:question.difficulty, canonicalDifficulty:question.canonicalDifficulty, primarySkill:question.primarySkill, repairSkill:question.repairSkill, commonError:question.commonError, feedback:question.feedback, sourceCurationPhase:question.sourceCurationPhase };
}
function applyRewrite(question, spec, pool, order) {
  const before = snapshot(question);
  question.q = spec.q;
  question.options = [...spec.options];
  question.aHash = answerHash(spec.answer);
  if (!question.options.includes(spec.answer)) throw new Error(`${idOf(question)} rewritten answer missing from options.`);
  question.type = spec.type || question.type;
  question.primarySkill = spec.skill || question.primarySkill;
  question.repairSkill = spec.repairSkill || spec.skill || question.repairSkill || question.primarySkill;
  question.commonError = spec.commonError;
  question.feedback = spec.feedback;
  question.primaryConceptId = CONCEPT;
  question.secondaryConceptIds = [...(spec.secondaryConceptIds || question.secondaryConceptIds || [])];
  if (spec.calculationTaskFamily) question.calculationTaskFamily = spec.calculationTaskFamily;
  question.sourceCurationPhase = PHASE;
  question.sourceHash = questionHash(question);
  question.sourceOccurrences ||= [];
  question.sourceOccurrences = question.sourceOccurrences.filter(item => item.sourceCurationPhase !== PHASE);
  question.sourceOccurrences.push({ sourceGame:SOURCE_GAME, sourceFile:'validation_artifacts/opportunity_cost_standalone_expansion/opportunity_cost_question_changes.json', sourceGlobal:'questions', sourcePool:pool, routeKey:question.repairSkill, sourceRecordOrder:order, sourceId:question.sourceId, sourceHash:question.sourceHash, sourceCurationPhase:PHASE });
  return { id:idOf(question), concept:CONCEPT, pool, action:'REWRITE', before, after:snapshot(question) };
}
function createQuestion(spec, pool, order, sourceId) {
  const isBoss = pool === 'boss'; const isLB = pool === 'legendaryBoss'; const isRepair = pool === 'repair'; const isBridge = pool === 'bridge';
  const storedPool = isBoss ? spec.tier : pool;
  const canonicalDifficulty = isBoss ? ({easyBoss:'easy',mediumBoss:'medium',finalBoss:'hard'})[spec.tier] : isLB ? 'legendary' : (isRepair || isBridge) ? 'unknown' : pool;
  const difficulty = isBoss ? spec.tier : isLB ? 'legendaryBoss' : isRepair ? 'microRepair' : isBridge ? 'microBridge' : pool;
  const instructionalRole = isBoss ? 'boss' : isLB ? 'legendaryBoss' : isRepair ? 'repair' : isBridge ? 'bridge' : pool === 'elite' ? 'elite' : pool === 'legendary' ? 'legendary' : 'main';
  if (!spec.options.includes(spec.answer)) throw new Error(`${spec.id}: answer missing from options.`);
  const question = {
    id:spec.id, sourceGame:SOURCE_GAME, q:spec.q, options:[...spec.options], tag:'opportunity_cost', type:spec.type, objective:'LO1.2', difficulty,
    conceptCluster:'core_opportunity_cost', primarySkill:spec.skill, secondarySkills:[...(spec.secondarySkills || [])], repairSkill:spec.repairSkill || spec.skill,
    commonError:spec.commonError, feedback:spec.feedback, aHash:answerHash(spec.answer), canonicalId:spec.id, sourceId, sourceChapter:[1], sourcePool:isRepair || isBridge ? spec.skill : storedPool,
    primaryConceptId:CONCEPT, secondaryConceptIds:[...(spec.secondaryConceptIds || [])], instructionalRole, canonicalDifficulty,
    originalSourcePool:isRepair || isBridge ? spec.skill : storedPool, originalBossTier:isBoss ? spec.tier : isLB ? 'legendaryBoss' : null, sourceCurationPhase:PHASE
  };
  if (spec.calculationTaskFamily) question.calculationTaskFamily = spec.calculationTaskFamily;
  if (isBoss) question.boss = ({easyBoss:'Checkpoint One',mediumBoss:'Checkpoint Two',finalBoss:'Final Checkpoint'})[spec.tier];
  if (isLB) question.bossStage = ['opening','middle','final'][order % 3];
  question.sourceHash = questionHash(question);
  question.sourceOccurrences = [{ sourceGame:SOURCE_GAME, sourceFile:'validation_artifacts/opportunity_cost_standalone_expansion/opportunity_cost_question_changes.json', sourceGlobal:isRepair?'microSkillRepairPools':isBridge?'microSkillBridgePools':'questions', sourcePool:question.sourcePool, routeKey:question.repairSkill, sourceRecordOrder:order, sourceId, sourceHash:question.sourceHash, sourceCurationPhase:PHASE }];
  return question;
}

const review = beforeIds.map(id => ({ id, action: rewriteSpecs[id] ? 'REWRITE' : 'KEEP' }));
const changes = [];
let rewriteOrder = 0;
for (const {pool, question} of allLocations(module)) {
  if (rewriteSpecs[idOf(question)]) changes.push(applyRewrite(question, rewriteSpecs[idOf(question)], pool, rewriteOrder++));
}
const missingRewrites = Object.keys(rewriteSpecs).filter(id => !changes.some(change => change.id === id));
if (missingRewrites.length) throw new Error(`Missing rewrite IDs: ${missingRewrites.join(', ')}`);

let sourceOrdinal = 0;
for (const [pool, specs] of Object.entries(additions)) {
  const target = pool === 'repair' ? module.repairQuestions : pool === 'bridge' ? module.bridgeQuestions : module.questions[pool];
  const ids = new Set(specs.map(spec => spec.id));
  for (let i = target.length - 1; i >= 0; i--) if (ids.has(idOf(target[i]))) target.splice(i, 1);
  specs.forEach((spec, index) => {
    const question = createQuestion(spec, pool, index, 7200001 + sourceOrdinal++);
    target.push(question);
    changes.push({ id:question.id, concept:CONCEPT, pool:pool === 'boss' ? spec.tier : pool, action:'ADD', before:null, after:snapshot(question) });
  });
}

module.microSkillRepairPools = {
  opportunity_cost_definition:['P52A-OPPC-R-001','P72-OPPC-R-004'],
  opportunity_cost_identification:['P52A-OPPC-R-002','P72-OPPC-R-004'],
  next_best_alternative:['P72-OPPC-R-004'],
  nonmonetary_opportunity_cost:['P52A-OPPC-R-002','P72-OPPC-R-005'],
  sunk_cost_distinction:['P72-OPPC-R-006'],
  owned_resource_opportunity_cost:['P52A-OPPC-R-003','P72-OPPC-R-007'],
  opportunity_cost_full_cost:['P52A-OPPC-R-003','P72-OPPC-R-007'],
  full_cost_opportunity_cost_analysis:['P52A-OPPC-R-003','P72-OPPC-R-007','P72-OPPC-R-008'],
  forgone_wages:['P72-OPPC-R-008'],
  opportunity_cost_calculation:['P72-OPPC-R-008'],
  opportunity_cost_net_benefit:['P72-OPPC-R-004'],
  opportunity_cost_over_time:['P72-OPPC-R-004','P72-OPPC-R-006'],
  production_tradeoff_ratio:['P72-OPPC-R-004']
};
module.microSkillBridgePools = {
  opportunity_cost_definition:['P52A-OPPC-BR-001'], opportunity_cost_identification:['P52A-OPPC-BR-001'], next_best_alternative:['P52A-OPPC-BR-001','P72-OPPC-BR-003'],
  nonmonetary_opportunity_cost:['P52A-OPPC-BR-001'], sunk_cost_distinction:['P72-OPPC-BR-004'], owned_resource_opportunity_cost:['P72-OPPC-BR-005'],
  opportunity_cost_full_cost:['P72-OPPC-BR-005'], full_cost_opportunity_cost_analysis:['P72-OPPC-BR-005'], forgone_wages:['P72-OPPC-BR-004'],
  opportunity_cost_calculation:['P52A-OPPC-BR-002'], opportunity_cost_net_benefit:['P72-OPPC-BR-004'], opportunity_cost_over_time:['P72-OPPC-BR-004'],
  production_tradeoff_ratio:['P52A-OPPC-BR-002','P72-OPPC-BR-006']
};

const expectedPools = {easy:10,medium:12,hard:12,elite:6,legendary:27,calculation:2,boss:15,legendaryBoss:9,integration:0};
for (const [pool, count] of Object.entries(expectedPools)) if ((module.questions[pool] || []).length !== count) throw new Error(`${pool}: expected ${count}, found ${(module.questions[pool] || []).length}`);
if (module.repairQuestions.length !== 8 || module.repairSeedQuestions.length !== 1 || module.bridgeQuestions.length !== 6) throw new Error('Repair/seed/bridge counts do not match 8/1/6.');
const uniqueAfter = uniqueQuestions(module);
if (uniqueAfter.length !== 108) throw new Error(`Expected 108 canonical Opportunity Cost questions, found ${uniqueAfter.length}.`);

const mainQuestions = [...module.questions.easy,...module.questions.medium,...module.questions.hard,...module.questions.elite,...module.questions.legendary,...module.questions.calculation,...module.questions.boss,...module.questions.legendaryBoss];
const skills = [...new Set(uniqueAfter.map(x => x.question.primarySkill).filter(Boolean))].sort();
const calculationLinked = uniqueAfter.filter(({question}) => question.type === 'calculation' || question.calculationTaskFamily).length;
const calculationFamilies = [...new Set(uniqueAfter.map(x => x.question.calculationTaskFamily).filter(Boolean))].sort();
const registryEntry = library.registry.concepts.find(item => item.canonicalConceptId === CONCEPT);
Object.assign(registryEntry, {
  includedSkills:skills, sourceGames:[...new Set([...(registryEntry.sourceGames || []), SOURCE_GAME])].sort(),
  questionCountByRole:{boss:15,bridge:6,calculation:2,elite:6,integration:0,legendary:27,legendaryBoss:9,main:34,repair:8,repairSeed:1},
  questionCountByDifficulty:{easy:15,elite:6,hard:18,legendary:36,medium:18,unknown:15},
  repairCoverage:{directSkillMatches:8,mainWithUsableSkill:mainQuestions.length}, bridgeCoverage:{directSkillMatches:6,mainWithUsableSkill:mainQuestions.length},
  calculationCoverage:calculationLinked, graphCoverage:0, instructionalClassification:'Standalone-ready', coverageStatus:'ready-focused', coverageStatusLabel:'Ready for focused use',
  coverageStatusNote:'Compact calculation-rich standalone profile met with full Legendary depth, checkpoint rotation, diagnostic Repair, and genuine conceptual Bridges.', coverageFloorVersion:PHASE,
  notes:'Phase 7.2 matured the shared General/Macro Opportunity Cost bank around next-best alternatives, implicit and time costs, sunk-cost distinctions, production tradeoffs, and varied calculation families.'
});

const registryFile = JSON.parse(fs.readFileSync(registryPath, 'utf8'));
const registryFileEntry = registryFile.concepts.find(item => item.canonicalConceptId === CONCEPT);
Object.assign(registryFileEntry, JSON.parse(JSON.stringify(registryEntry)));
registryFile.generatedAt = GENERATED_AT;

const previousVersion = String(library.libraryVersion);
if (!previousVersion.endsWith(PHASE)) library.libraryVersion = `${previousVersion}-${PHASE}`;
library.sourceCurationPhase = PHASE;
library.generatedAt = GENERATED_AT;
library.canonicalQuestionCount = 6459;
library.registry.generatedAt = GENERATED_AT;
library.registry.libraryVersion = library.libraryVersion;
library.registry.canonicalQuestionCount = 6459;
registryFile.libraryVersion = library.libraryVersion;
registryFile.canonicalQuestionCount = 6459;
delete library.librarySha256;
library.librarySha256 = sha256(JSON.stringify(stable(library)));
registryFile.librarySha256 = library.librarySha256;

const serializedLibrary = `window.MQ_COMPOSER_LIBRARY=${JSON.stringify(library)};\n`;
fs.writeFileSync(libraryPath, serializedLibrary, 'utf8');
fs.writeFileSync(registryPath, `${JSON.stringify(registryFile, null, 2)}\n`, 'utf8');
const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
Object.assign(manifest, {canonicalQuestionCount:6459,libraryVersion:library.libraryVersion,librarySha256:library.librarySha256,generatedAt:GENERATED_AT});
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`, 'utf8');

const changeArtifact = { phase:PHASE, concept:CONCEPT, reviewedBaselineRecords:review, actions:{KEEP:review.filter(x=>x.action==='KEEP').length,REWRITE:changes.filter(x=>x.action==='REWRITE').length,ADD:changes.filter(x=>x.action==='ADD').length,RELOCATE_REPAIR:0,RELOCATE_BRIDGE:0,REMOVE:0}, changes };
fs.writeFileSync(path.join(artifactRoot, 'opportunity_cost_question_changes.json'), `${JSON.stringify(changeArtifact, null, 2)}\n`, 'utf8');

const counts = {totalCanonical:108,easy:10,medium:12,hard:12,elite:6,legendary:27,calculation:2,easyBoss:5,mediumBoss:5,finalBoss:5,legendaryBoss:9,repair:8,repairSeed:1,bridge:6,calculationLinked,calculationFamilies};
const provenance = {phase:PHASE,generatedAt:GENERATED_AT,repository:repoRoot,concept:CONCEPT,before:{libraryVersion:previousVersion,librarySha256:loadLibrary(libraryRaw).librarySha256,libraryFileSha256:sha256(libraryRaw),conceptCanonicalQuestions:49},after:{libraryVersion:library.libraryVersion,librarySha256:library.librarySha256,libraryFileSha256:sha256(serializedLibrary),conceptCanonicalQuestions:108},counts,actions:{reviewed:49,kept:review.filter(x=>x.action==='KEEP').length,rewritten:changes.filter(x=>x.action==='REWRITE').length,added:changes.filter(x=>x.action==='ADD').length,relocatedRepair:0,relocatedBridge:0,removed:0},otherConceptQuestionContentChanged:false,graphQuestionsChanged:false,graphAssetsChanged:false};
fs.writeFileSync(path.join(composerRoot, `${PHASE}.json`), `${JSON.stringify(provenance, null, 2)}\n`, 'utf8');

for (const file of [path.join(repoRoot,'build','index.html'),path.join(composerRoot,'index.html')]) {
  const text = fs.readFileSync(file,'utf8').replaceAll('20260809-scarcity-standalone-v1','20260810-opportunity-cost-standalone-v1');
  fs.writeFileSync(file,text,'utf8');
}

console.log(JSON.stringify({phase:PHASE,libraryVersion:library.libraryVersion,librarySha256:library.librarySha256,libraryFileSha256:sha256(serializedLibrary),canonicalQuestionCount:6459,opportunityCostQuestionCount:108,reviewed:49,rewrites:changes.filter(x=>x.action==='REWRITE').length,additions:changes.filter(x=>x.action==='ADD').length,counts,cacheKey:'20260810-opportunity-cost-standalone-v1'},null,2));
