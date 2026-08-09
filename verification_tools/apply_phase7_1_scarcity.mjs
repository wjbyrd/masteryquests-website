import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const repoRoot = process.argv[2];
if (!repoRoot) throw new Error('Usage: node apply_phase7_1_scarcity.mjs <authoritative-repo>');

const PHASE = 'phase7.1-scarcity-standalone-expansion-v1';
const PREVIOUS_PHASE = 'phase6.4-graph-accessibility-v1';
const GENERATED_AT = '2026-08-09T22:30:00.000Z';
const CONCEPT_ID = 'scarcity-and-tradeoffs';
const SOURCE_GAME = 'phase7.1-scarcity-standalone-expansion';
const SOURCE_FILE = 'validation_artifacts/scarcity_standalone_expansion/scarcity_question_changes.json';
const composerRoot = path.join(repoRoot, 'build', 'faculty-build-composer');
const libraryPath = path.join(composerRoot, 'data', 'composer_library.js');
const registryPath = path.join(composerRoot, 'data', 'composer_registry.json');
const manifestPath = path.join(composerRoot, 'data', 'composer_library_manifest.json');
const provenancePath = path.join(composerRoot, `${PHASE}.json`);
const artifactRoot = path.join(repoRoot, 'validation_artifacts', 'scarcity_standalone_expansion');
const changesPath = path.join(artifactRoot, 'scarcity_question_changes.json');

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function stable(value) {
  if (Array.isArray(value)) return value.map(stable);
  if (value && typeof value === 'object') return Object.fromEntries(Object.keys(value).sort().map(key => [key, stable(value[key])]));
  return value;
}

function loadLibrary() {
  const raw = fs.readFileSync(libraryPath, 'utf8');
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(raw, context, { filename: libraryPath });
  return { raw, library: context.window.MQ_COMPOSER_LIBRARY };
}

function idOf(question) {
  return String(question?.canonicalId ?? question?.id ?? '');
}

function answerHash(answer) {
  const normalized = String(answer).normalize('NFKC').trim().replace(/\s+/g, ' ').toLowerCase();
  return sha256(normalized);
}

function sourceHash(question, pool) {
  return sha256(JSON.stringify(stable({
    id: idOf(question), q: question.q, options: question.options, aHash: question.aHash,
    tag: question.tag, type: question.type, objective: question.objective,
    difficulty: question.difficulty, primarySkill: question.primarySkill,
    secondarySkills: question.secondarySkills || [], repairSkill: question.repairSkill,
    commonError: question.commonError, feedback: question.feedback, pool
  })));
}

function snapshot(question) {
  return {
    id: idOf(question), q: question.q, options: [...question.options], type: question.type,
    difficulty: question.difficulty, canonicalDifficulty: question.canonicalDifficulty,
    primarySkill: question.primarySkill, repairSkill: question.repairSkill,
    commonError: question.commonError, feedback: question.feedback, aHash: question.aHash,
    sourceHash: question.sourceHash
  };
}

const rewriteSpecs = {
  'ECON-MG-EASY-1': {
    q: 'A community has one available parcel and can build either an elementary school or a recreation complex this year, but not both. What is illustrated most directly?',
    options: [
      'Scarcity, because one limited parcel has competing valued uses',
      'A shortage, because the community temporarily ran out of buildings',
      'Equality, because both projects would serve the same residents',
      'Abundance, because the parcel can support at least one project'
    ],
    answer: 'Scarcity, because one limited parcel has competing valued uses',
    type: 'application',
    commonError: 'Confusing scarcity with a temporary shortage or simple absence.',
    feedback: 'The parcel is limited relative to competing valued uses, so the community must choose.'
  },
  'ECON-MG-EASY-16': {
    q: 'A clinic assigns its limited nurse-hours to the cases expected to produce the greatest total health benefit. Which goal is the clinic emphasizing?',
    options: [
      'Efficiency in the use of its limited clinical resources',
      'Equality through identical treatment time for every patient',
      'Abundance because the clinic can schedule some patients',
      'A shortage caused by setting the price of care too low'
    ],
    answer: 'Efficiency in the use of its limited clinical resources',
    type: 'application',
    commonError: 'Confusing efficient resource use with equal distribution.',
    feedback: 'Efficiency asks whether scarce resources generate the greatest total value.'
  },
  'ECON-MG-EASY-17': {
    q: 'A scholarship office divides a fixed fund so every eligible student receives the same award. Which goal is it emphasizing?',
    options: [
      'Equality in how the available scholarship funds are distributed',
      'Efficiency measured only by the total number of degrees completed',
      'Abundance created by dividing the existing fund into equal shares',
      'A shortage created by charging students a below-market tuition'
    ],
    answer: 'Equality in how the available scholarship funds are distributed',
    type: 'application',
    commonError: 'Confusing equal distribution with maximum total value.',
    feedback: 'Equality concerns how benefits or prosperity are distributed across people.'
  },
  'P52A-SCAR-E-001': {
    q: 'A wealthy city can afford more services than before, yet this year it must choose between expanding transit and replacing aging water lines. Why does scarcity remain?',
    options: [
      'Its budget, crews, and construction time are still limited relative to valued projects',
      'Wealth makes every desired project physically impossible to complete',
      'Higher income automatically creates a temporary market shortage',
      'The city faces scarcity only if both projects charge a money price'
    ],
    answer: 'Its budget, crews, and construction time are still limited relative to valued projects',
    type: 'application',
    commonError: 'Treating scarcity as a problem only for poor societies.',
    feedback: 'Greater wealth relaxes constraints, but limited resources still have competing uses.'
  },
  'P52A-SCAR-E-002': {
    q: 'A free campus workshop still involves scarcity because:',
    options: [
      'It still uses limited seats, instructor time, and student time',
      'A zero price makes every required resource unlimited in supply',
      'Only the workshop topic, rather than its inputs, can be scarce',
      'Free admission creates a legal ceiling on every campus price'
    ],
    answer: 'It still uses limited seats, instructor time, and student time',
    type: 'application',
    commonError: 'Assuming a zero money price means no scarce resources are used.',
    feedback: 'A zero admission price does not make space, labor, or time unlimited.'
  },
  'P52A-SCAR-M-001': {
    options: [
      'A tradeoff created by competing uses of a limited city budget',
      'An end to scarcity created by collecting and spending local taxes',
      'A temporary shortage produced by fixing a public-service price',
      'A specialization gain created by assigning each project to a district'
    ],
    answer: 'A tradeoff created by competing uses of a limited city budget'
  },
  'P52A-SCAR-M-003': {
    options: [
      'Efficiency concerns total value; equality concerns its distribution',
      'Efficiency requires equal shares; equality requires maximum output',
      'Efficiency and equality describe the same resource-allocation goal',
      'Efficiency concerns prices; equality concerns physical production'
    ],
    answer: 'Efficiency concerns total value; equality concerns its distribution'
  },
  'P52A-SCAR-M-004': {
    options: [
      'Scarcity disappears because higher crop output satisfies every want',
      'Scarcity becomes a shortage because technology changes only prices',
      'The crop constraint eases, but land, time, and other wants remain',
      'The technology removes the need to choose among all production uses'
    ],
    answer: 'The crop constraint eases, but land, time, and other wants remain'
  },
  'P52A-SCAR-M-005': {
    options: [
      'The stockout is temporary; scarcity is limited resources relative to wants',
      'The stockout and scarcity are identical because both involve limited water',
      'The storm proves scarcity exists only when stores cannot restock quickly',
      'Water elsewhere means neither the store nor society faces any constraint'
    ],
    answer: 'The stockout is temporary; scarcity is limited resources relative to wants'
  },
  'P52A-SCAR-H-002': {
    options: [
      'Any allocation rule leaves at least one valued use of the bed unmet',
      'An equal lottery creates enough capacity to treat both patients fully',
      'No money price means the intensive-care bed is not economically scarce',
      'A medically fair rule removes the physical limit on available treatment'
    ],
    answer: 'Any allocation rule leaves at least one valued use of the bed unmet'
  },
  'P52A-SCAR-H-003': {
    options: [
      'It may improve total output while worsening the distribution of gains',
      'It must improve both efficiency and equality because output increased',
      'It eliminates scarcity because the economy can now produce more output',
      'It cannot improve efficiency because at least one affected group loses'
    ],
    answer: 'It may improve total output while worsening the distribution of gains'
  },
  'P52A-SCAR-H-005': {
    options: [
      'The project still trades off against other uses of engineers and materials',
      'Government financing makes the engineers and materials no longer scarce',
      'Large environmental benefits remove every resource cost from the project',
      'Only privately financed energy projects compete for productive resources'
    ],
    answer: 'The project still trades off against other uses of engineers and materials'
  },
  'ECON-MG-ELITE-335': {
    options: [
      'It presents an efficiency-equity tradeoff requiring both criteria',
      'It proves the policy is desirable because equity necessarily dominates',
      'It proves the policy is undesirable because total surplus necessarily dominates',
      'It removes scarcity because one distributional goal improves'
    ],
    answer: 'It presents an efficiency-equity tradeoff requiring both criteria'
  },
  'P52A-SCAR-EL-001': {
    options: [
      'Compare each feasible use, its benefits, and who bears the forgone alternatives',
      'Declare every use essential and assume the parcel can fully support all three',
      'Choose the project with the largest budget without comparing displaced uses',
      'Treat public ownership as evidence that the parcel has no competing use'
    ],
    answer: 'Compare each feasible use, its benefits, and who bears the forgone alternatives'
  },
  'P52A-SCAR-EL-002': {
    options: [
      'Several goals may improve, while taxes and inputs still have alternative uses',
      'Several benefits mean the policy uses no scarce resources or public funds',
      'Scarcity matters only when total production falls after the policy change',
      'Any tax increase proves the policy reduces both efficiency and equality'
    ],
    answer: 'Several goals may improve, while taxes and inputs still have alternative uses'
  },
  'P52A-SCAR-EL-003': {
    options: [
      'Cheap copying means digital production and distribution use no scarce inputs',
      'Higher productivity can relax a binding resource constraint without ending scarcity',
      'A zero money price can still require scarce server capacity and user time',
      'Allocation rules can change who receives access to a capacity-limited service'
    ],
    answer: 'Cheap copying means digital production and distribution use no scarce inputs'
  },
  'ECON-MG-LEGENDARY-9013': {
    options: [
      'The rule creates benefits and costs because compliance uses scarce inputs',
      'The rule eliminates opportunity cost because its safety goal is worthwhile',
      'The rule creates scarcity only for consumers rather than for producing firms',
      'The rule makes efficiency and equality move together in every affected market'
    ],
    answer: 'The rule creates benefits and costs because compliance uses scarce inputs'
  },
  'P52A-SCAR-L-001': {
    options: [
      'Compare unavoidable tradeoffs, total benefits, and losses under each allocation rule',
      'Serve the highest bidder and treat the resulting allocation as automatically fair',
      'Raise the posted price and assume the grid can physically supply every requested use',
      'Divide electricity equally and conclude that the capacity constraint has disappeared'
    ],
    answer: 'Compare unavoidable tradeoffs, total benefits, and losses under each allocation rule'
  },
  'P52A-SCAR-B1-001': {
    q: 'A school has more requests for tutoring than its staff can serve this week. Which fact makes tutoring time scarce?',
    options: [
      'Limited tutor-hours have several valued uses and cannot meet every request',
      'The school has permanently run out of every kind of educational service',
      'Families differ in income even if every tutoring request could be served',
      'The school charges a price below the market-clearing price for tutoring'
    ],
    answer: 'Limited tutor-hours have several valued uses and cannot meet every request',
    type: 'application',
    commonError: 'Confusing scarcity with poverty, high prices, or a temporary stockout.',
    feedback: 'Tutor-hours are limited relative to the competing requests for them.'
  },
  'P52A-SCAR-B1-002': {
    q: 'A community center has one gym available tonight. Scheduling a youth league means canceling an adult exercise class. What does that choice show?',
    options: [
      'Using the fixed gym for one valued activity leaves less access for another',
      'The community has permanently exhausted every recreation resource',
      'The gym stops being scarce once managers publish the schedule',
      'Both groups receive equal access because the choice is publicly announced'
    ],
    answer: 'Using the fixed gym for one valued activity leaves less access for another',
    type: 'application',
    commonError: 'Ignoring the displaced use of a fixed resource.',
    feedback: 'Assigning the fixed gym to one activity displaces another valued use.'
  },
  'P52A-SCAR-B2-003': {
    options: [
      'It still uses limited labor, space, equipment, and user time',
      'A zero price guarantees enough capacity for every possible user',
      'Only services sold for money can require scarce productive inputs',
      'Free access removes every competing use of the service resources'
    ],
    answer: 'It still uses limited labor, space, equipment, and user time'
  },
  'P52A-SCAR-B3-001': {
    options: [
      'The allocation rule changes, while the limited number of beds does not',
      'The vulnerability rule immediately creates enough beds for every applicant',
      'The beds stop being scarce because recipients do not bid a money price',
      'The rule makes efficiency and equality identical measures of the outcome'
    ],
    answer: 'The allocation rule changes, while the limited number of beds does not'
  },
  'P52A-SCAR-B3-002': {
    options: [
      'Remaining capital, skilled labor, time, and wants still create choices',
      'Higher productivity guarantees that every available project can be funded',
      'Only government agencies continue to face tradeoffs after technology improves',
      'Productivity growth changes scarcity into a temporary market shortage'
    ],
    answer: 'Remaining capital, skilled labor, time, and wants still create choices'
  },
  'ECON-MG-LEGENDARYBOSS-9100': {
    options: [
      'Six repaired mains are gained while eighteen bridge inspections are forgone',
      'Only the crew wages matter because public work has no resource tradeoff',
      'Eighteen bridge inspections are gained while six main repairs are forgone',
      'No tradeoff can be identified until both services receive market prices'
    ],
    answer: 'Six repaired mains are gained while eighteen bridge inspections are forgone'
  },
  'ECON-MG-LEGENDARYBOSS-9101': {
    options: [
      'The rule has safety benefits and opportunity costs that should be compared',
      'Lower entry proves the rule is inefficient without considering accident risk',
      'A worthwhile safety goal eliminates the scarcity of compliance resources',
      'Entry effects are irrelevant whenever a policy goal includes a value judgment'
    ],
    answer: 'The rule has safety benefits and opportunity costs that should be compared'
  },
  'ECON-MG-LEGENDARYBOSS-9102': {
    options: [
      'The extra 2,000 kits require giving up 12,000 meals',
      'The mixed plan becomes infeasible after adding any medical kits',
      'The proposal creates 12,000 meals while adding 2,000 kits',
      'Medical kits have no forgone alternative during an emergency'
    ],
    answer: 'The extra 2,000 kits require giving up 12,000 meals'
  },
  'P52A-SCAR-R-002': {
    options: [
      'Resources are arranged to generate the greatest total value',
      'Resources are divided into identical shares for every person',
      'Income differences are removed regardless of total production',
      'Every affected group receives the same gain from the policy'
    ],
    answer: 'Resources are arranged to generate the greatest total value'
  },
  'P52A-SCAR-R-003': {
    options: [
      'Using a limited resource one way restricts another valued use',
      'Every choice requires an explicit payment made with money',
      'Only public agencies must choose among competing resource uses',
      'A high-benefit choice stops using scarce inputs and worker time'
    ],
    answer: 'Using a limited resource one way restricts another valued use'
  }
};

const additions = {
  easy: [
    {
      id: 'P71-SCAR-E-001',
      q: 'A hospital has eight nurse-hours available for either a vaccination clinic or follow-up calls. What is the scarce resource?',
      options: ['The eight available nurse-hours', 'The number of patients who value care', 'The absence of a money price for calls', 'The hospital building in every future period'],
      answer: 'The eight available nurse-hours', type: 'application', skill: 'scarcity_definition',
      commonError: 'Naming a want or a price instead of the binding resource constraint.',
      feedback: 'The limited nurse-hours cannot be used fully for both services.'
    },
    {
      id: 'P71-SCAR-E-002',
      q: 'A family uses its monthly budget to replace a broken refrigerator, leaving less for a planned vacation. What is the tradeoff?',
      options: ['Refrigerator spending leaves less budget for the vacation', 'The refrigerator creates unlimited future income', 'The vacation becomes a temporary market shortage', 'The family no longer faces scarcity after buying an appliance'],
      answer: 'Refrigerator spending leaves less budget for the vacation', type: 'application', skill: 'tradeoff_identification',
      commonError: 'Recognizing the purchase but not the displaced use of the budget.',
      feedback: 'Using the fixed budget for one purpose reduces what remains for another.'
    },
    {
      id: 'P71-SCAR-E-003',
      q: 'A bakery can use its oven this hour for bread or pastries, but there is not enough oven time for both batches. What choice is forced by scarcity?',
      options: ['How to allocate the limited oven time', 'How to eliminate every customer want', 'How to create a legal price ceiling', 'How to make flour an unlimited resource'],
      answer: 'How to allocate the limited oven time', type: 'application', skill: 'tradeoff_identification',
      commonError: 'Overlooking production time as the constrained resource.',
      feedback: 'Limited oven time with competing uses requires an allocation choice.'
    },
    {
      id: 'P71-SCAR-E-004',
      q: 'A reservoir currently contains enough water for all essential uses, but not for every lawn, pool, factory, and farm request. Which conclusion is correct?',
      options: ['Water is scarce because not every valued use can be satisfied', 'Water is abundant because essential uses can be satisfied', 'A shortage exists only because the reservoir charges too much', 'Scarcity ends whenever some users receive the resource'],
      answer: 'Water is scarce because not every valued use can be satisfied', type: 'application', skill: 'scarcity_definition',
      commonError: 'Treating partial adequacy as proof that a resource is nonscarce.',
      feedback: 'Scarcity remains when the available amount cannot satisfy every competing use.'
    }
  ],
  medium: [
    {
      id: 'P71-SCAR-M-001',
      q: 'A university converts two classrooms into laboratories. Science students gain space, while other departments lose course capacity. Which analysis is most complete?',
      options: ['The conversion reallocates scarce space and creates gains and losses', 'The conversion ends scarcity because laboratories are more specialized', 'Only departments charging lab fees face a resource constraint', 'Classroom capacity becomes a shortage caused by a legal price rule'],
      answer: 'The conversion reallocates scarce space and creates gains and losses', type: 'scenario', skill: 'tradeoff_identification',
      commonError: 'Counting the new benefit while ignoring displaced classroom users.',
      feedback: 'The same limited space cannot simultaneously serve both sets of uses.'
    },
    {
      id: 'P71-SCAR-M-002',
      q: 'A faster 3D printer doubles output per hour, but every job still requires one technician and the lab has only two technicians. What changed?',
      options: ['One constraint eased, while technician time still limits feasible production', 'All scarcity ended because machine productivity doubled', 'The technician constraint became a price shortage', 'The lab can now complete every desired job without choosing'],
      answer: 'One constraint eased, while technician time still limits feasible production', type: 'application', skill: 'core_scarcity',
      commonError: 'Assuming improvement in one input removes every remaining constraint.',
      feedback: 'Technology can shift the binding constraint without eliminating scarcity.'
    },
    {
      id: 'P71-SCAR-M-003',
      q: 'A transit agency moves buses from a lightly used route to an overcrowded route. Which statement best captures the tradeoff?',
      options: ['Crowded-route riders gain capacity while other riders lose service frequency', 'The transfer creates more buses because average ridership rises', 'Public ownership means the routes do not compete for vehicles', 'The agency eliminates scarcity by serving the larger group first'],
      answer: 'Crowded-route riders gain capacity while other riders lose service frequency', type: 'scenario', skill: 'policy_tradeoff_analysis',
      commonError: 'Analyzing beneficiaries without identifying who loses the reallocated resource.',
      feedback: 'Reassigning a fixed fleet benefits one route while reducing capacity elsewhere.'
    },
    {
      id: 'P71-SCAR-M-004',
      q: 'A larger reservoir expands the region’s water supply. Cities, farms, and ecosystems still request more water than is available in dry years. Which statement follows?',
      options: ['The expansion relaxes scarcity but does not remove competing uses', 'The expansion eliminates scarcity because total water increased', 'The remaining conflict must be a temporary retail shortage', 'More capacity means allocation rules no longer affect any group'],
      answer: 'The expansion relaxes scarcity but does not remove competing uses', type: 'application', skill: 'core_scarcity',
      commonError: 'Assuming a resource increase eliminates all unmet wants.',
      feedback: 'More resources can ease a constraint while valued uses still exceed availability.'
    }
  ],
  hard: [
    {
      id: 'P71-SCAR-H-001',
      q: 'After a flood, a county can use its emergency fund for temporary housing or immediate levee repairs. Housing aids displaced families now; repairs reduce future risk. What must an economic analysis include?',
      options: ['Current beneficiaries, future risk reduction, and the use forgone under either choice', 'Only the number of residents receiving immediate housing assistance', 'Only the engineering estimate for the levee repair project', 'A claim that emergency spending makes the county budget unlimited'],
      answer: 'Current beneficiaries, future risk reduction, and the use forgone under either choice', type: 'policy-analysis', skill: 'policy_tradeoff_analysis',
      commonError: 'Evaluating one time horizon while ignoring the competing use and affected groups.',
      feedback: 'Scarcity requires comparing both uses, their timing, and who gains or loses.'
    },
    {
      id: 'P71-SCAR-H-002',
      q: 'Automation reduces the labor needed in a warehouse, but expansion still requires scarce electricity, loading space, and computing capacity. Which conclusion is strongest?',
      options: ['Automation changes the constraint mix rather than abolishing scarcity', 'Automation abolishes scarcity because fewer workers are required', 'The remaining limits are shortages caused only by incorrect prices', 'Every expansion becomes feasible once one input requirement falls'],
      answer: 'Automation changes the constraint mix rather than abolishing scarcity', type: 'application', skill: 'core_scarcity',
      commonError: 'Treating a productivity gain as the elimination of all production choices.',
      feedback: 'Reducing one input requirement can leave other resources as binding constraints.'
    },
    {
      id: 'P71-SCAR-H-003',
      q: 'A low-income household and a wealthy household both have 24 hours in a day, but very different financial options. Which statement correctly distinguishes poverty from scarcity?',
      options: ['Poverty concerns limited material means; both households still face scarce time', 'Only the low-income household faces scarcity because wealth removes all constraints', 'Both households are poor because neither can create more hours in a day', 'Scarcity describes temporary stockouts, while poverty describes every tradeoff'],
      answer: 'Poverty concerns limited material means; both households still face scarce time', type: 'comparison', skill: 'scarcity_definition',
      commonError: 'Equating scarcity with poverty and overlooking universal nonmoney constraints.',
      feedback: 'Poverty and scarcity are different: scarcity persists across income levels.'
    },
    {
      id: 'P71-SCAR-H-004',
      q: 'A delivery disruption leaves a hospital temporarily short of oxygen cylinders, while its long-run budget also limits how many backup systems it can maintain. Which statement is accurate?',
      options: ['The disruption is a shortage; the budget tradeoff reflects ongoing scarcity', 'Both conditions are temporary shortages because money is involved', 'Both conditions are scarcity only if oxygen receives a market price', 'The backup budget eliminates scarcity once deliveries resume'],
      answer: 'The disruption is a shortage; the budget tradeoff reflects ongoing scarcity', type: 'comparison', skill: 'scarcity_definition',
      commonError: 'Collapsing a temporary supply disruption and a persistent resource constraint.',
      feedback: 'A shortage is a temporary availability problem; scarcity is the broader need to choose among limited resources.'
    }
  ],
  legendary: [
    {
      id: 'P71-SCAR-L-001',
      q: 'Following an earthquake, a hospital has one surgical team for trauma cases, routine emergencies, and patients already scheduled. Which policy best acknowledges scarcity without pretending one criterion settles the decision?',
      options: ['Compare expected health gains, urgency, and displaced care under each priority rule', 'Treat scheduled patients as costless to postpone because trauma care has high value', 'Use equal waiting time and conclude the surgical constraint has disappeared', 'Charge the highest price and label the result both efficient and fair'],
      answer: 'Compare expected health gains, urgency, and displaced care under each priority rule', type: 'multi-step', skill: 'policy_tradeoff_analysis',
      commonError: 'Using one allocation criterion while ignoring displaced care and distribution.',
      feedback: 'A complete analysis compares benefits, forgone care, and distribution under feasible rules.'
    },
    {
      id: 'P71-SCAR-L-002',
      q: 'A city can zone a waterfront parcel for housing, a flood barrier, or a public park. A developer claims housing demand makes the other uses economically irrelevant. What is the strongest response?',
      options: ['High housing value does not erase the flood and recreation benefits forgone', 'Market demand makes the parcel physically available for all three uses', 'Public benefits matter only when users pay an admission price', 'Choosing housing proves the other uses were not valued by anyone'],
      answer: 'High housing value does not erase the flood and recreation benefits forgone', type: 'error-analysis', skill: 'tradeoff_identification',
      commonError: 'Treating the chosen use as proof that forgone uses have no value.',
      feedback: 'Scarcity makes the benefits of mutually exclusive uses economically relevant.'
    },
    {
      id: 'P71-SCAR-L-003',
      q: 'A hospital opens two new operating rooms but cannot hire additional anesthesiologists. Administrators announce that the capacity problem is solved. Which diagnosis is best?',
      options: ['Physical rooms increased, but specialized labor may now be the binding constraint', 'New rooms eliminate scarcity because capital is the only health-care input', 'Anesthesiologist availability is a shortage only if wages are regulated', 'Capacity is unlimited whenever one input expands faster than patient demand'],
      answer: 'Physical rooms increased, but specialized labor may now be the binding constraint', type: 'constraint-analysis', skill: 'core_scarcity',
      commonError: 'Assuming expansion of one input removes complementary-input constraints.',
      feedback: 'Capacity depends on multiple scarce inputs; the binding constraint can shift.'
    },
    {
      id: 'P71-SCAR-L-004',
      q: 'A factory that builds both emergency generators and defense equipment receives a fixed allocation of skilled machinist-hours. Why does a larger government budget not automatically remove the production tradeoff this quarter?',
      options: ['Money cannot instantly create the specialized labor and machine time required', 'Government purchases never use resources that have alternative civilian uses', 'A larger budget converts every physical constraint into an accounting entry', 'Defense production eliminates scarcity whenever national security is valuable'],
      answer: 'Money cannot instantly create the specialized labor and machine time required', type: 'causal-analysis', skill: 'core_scarcity',
      commonError: 'Treating additional financing as immediate creation of specialized capacity.',
      feedback: 'Nominal funding cannot instantly expand every real resource needed for production.'
    },
    {
      id: 'P71-SCAR-L-005',
      q: 'During a drought, a river authority must allocate water among cities, farms, and minimum ecosystem flows. Which statement avoids both an efficiency-only and a fairness-only mistake?',
      options: ['Compare total benefits and ecological effects while showing how each rule distributes losses', 'Maximize measured output and treat every resulting distribution as necessarily fair', 'Divide water equally and treat every resulting use as necessarily efficient', 'Raise water prices until the physical drought no longer limits river flow'],
      answer: 'Compare total benefits and ecological effects while showing how each rule distributes losses', type: 'evaluation', skill: 'efficiency_equity_policy_tradeoff',
      commonError: 'Using efficiency or equality as a complete allocation rule without examining the other.',
      feedback: 'Scarce-water policy requires both value and distributional analysis.'
    },
    {
      id: 'P71-SCAR-L-006',
      q: 'A university can admit more students by enlarging lectures, but laboratory space and advising time remain fixed. What does the enrollment expansion demonstrate?',
      options: ['Relaxing one capacity limit can intensify other educational tradeoffs', 'Larger lectures eliminate scarcity throughout the university', 'Advising time becomes abundant when tuition revenue increases', 'Laboratory capacity matters only for programs charging separate fees'],
      answer: 'Relaxing one capacity limit can intensify other educational tradeoffs', type: 'transfer', skill: 'core_scarcity',
      commonError: 'Ignoring constraints that become more important after another constraint relaxes.',
      feedback: 'The binding limit can move from lecture seats to labs or advising.'
    },
    {
      id: 'P71-SCAR-L-007',
      q: 'A region adds inexpensive solar generation, but its transmission network cannot carry all available power to users. Which conclusion is most accurate?',
      options: ['Generation scarcity eased while transmission capacity remains scarce', 'Cheap generation makes grid capacity unlimited by economic definition', 'Unused solar power proves the region has no energy-related tradeoff', 'The transmission limit is poverty rather than scarcity because wires are costly'],
      answer: 'Generation scarcity eased while transmission capacity remains scarce', type: 'constraint-analysis', skill: 'core_scarcity',
      commonError: 'Treating abundant output at one stage as abundance throughout a system.',
      feedback: 'A production gain does not remove downstream infrastructure constraints.'
    },
    {
      id: 'P71-SCAR-L-008',
      q: 'A public agency reassigns cybersecurity analysts to clear a benefits-processing backlog. Which consequence must be included even if the backlog is urgent?',
      options: ['The forgone security monitoring performed by the same scarce analysts', 'The analysts become nonscarce because both assignments serve the public', 'The backlog creates more analyst-hours by increasing social need', 'Only the agency payroll, not analyst time, has an alternative use'],
      answer: 'The forgone security monitoring performed by the same scarce analysts', type: 'application', skill: 'tradeoff_identification',
      commonError: 'Letting urgency obscure the alternative output of a fixed workforce.',
      feedback: 'Urgency can affect priorities but does not remove the forgone use of analyst time.'
    },
    {
      id: 'P71-SCAR-L-009',
      q: 'A government funds both climate adaptation and transit by postponing courthouse maintenance. Officials call the package “tradeoff-free” because two programs expand. What is wrong?',
      options: ['The postponed maintenance is a displaced use of scarce public resources', 'Two expanding programs guarantee that no group bears a cost', 'Deferred maintenance is not a cost until a courthouse closes', 'Public borrowing makes labor and materials immediately unlimited'],
      answer: 'The postponed maintenance is a displaced use of scarce public resources', type: 'error-analysis', skill: 'policy_tradeoff_analysis',
      commonError: 'Ignoring a less visible displaced use when multiple visible goals improve.',
      feedback: 'A package can advance several goals while shifting costs to another use or time.'
    },
    {
      id: 'P71-SCAR-L-010',
      q: 'Robots free workers from one assembly task, but the firm must choose whether to assign those workers to quality control or product development. Which principle remains?',
      options: ['Productivity changes feasible choices but does not eliminate alternative uses', 'Automation makes worker time abundant for every desired project', 'Released workers have no opportunity cost because machines replaced one task', 'Technology turns all remaining firm choices into temporary shortages'],
      answer: 'Productivity changes feasible choices but does not eliminate alternative uses', type: 'transfer', skill: 'core_scarcity',
      commonError: 'Assuming labor-saving technology eliminates choice over the released resources.',
      feedback: 'Freed resources still have competing valuable uses.'
    },
    {
      id: 'P71-SCAR-L-011',
      q: 'A wealthy country can afford either a high-speed rail network or a major hospital modernization program sooner, but construction crews and materials cannot complete both on the same schedule. What does this show?',
      options: ['Wealth expands options without eliminating real resource constraints', 'Wealth eliminates scarcity whenever both projects have positive benefits', 'Only lower-income countries face tradeoffs involving public infrastructure', 'The conflict is a temporary shortage caused entirely by incorrect prices'],
      answer: 'Wealth expands options without eliminating real resource constraints', type: 'application', skill: 'scarcity_definition',
      commonError: 'Treating national wealth as freedom from physical and time constraints.',
      feedback: 'Wealth increases capacity, but real inputs and time remain limited.'
    },
    {
      id: 'P71-SCAR-L-012',
      q: 'A transit authority postpones track maintenance to accelerate a network extension. The extension raises capacity next year but increases breakdown risk now. Which analysis best captures the dynamic tradeoff?',
      options: ['Compare current reliability losses with future capacity gains and their distribution', 'Count only future riders because maintenance creates no new visible service', 'Treat postponed work as costless until a breakdown actually occurs', 'Assume future capacity removes the present scarcity of repair crews'],
      answer: 'Compare current reliability losses with future capacity gains and their distribution', type: 'multi-step', skill: 'policy_tradeoff_analysis',
      commonError: 'Ignoring intertemporal costs because their effects are delayed or uncertain.',
      feedback: 'Scarcity links present resource use to future benefits and risks.'
    },
    {
      id: 'P71-SCAR-L-013',
      q: 'A food program can maximize meals served by delivering only to dense neighborhoods, while rural households would receive less access. Which conclusion is best?',
      options: ['The efficient delivery pattern may raise an equality concern that still requires judgment', 'Serving more meals proves every household receives an equal opportunity to participate', 'An equality concern proves the delivery pattern cannot increase total meals', 'Scarcity prevents comparing distribution once the meal total is known'],
      answer: 'The efficient delivery pattern may raise an equality concern that still requires judgment', type: 'evaluation', skill: 'efficiency_equity_tradeoff',
      commonError: 'Using the total output result as a complete judgment about distribution.',
      feedback: 'Efficiency and equality are distinct dimensions of a scarce-resource allocation.'
    },
    {
      id: 'P71-SCAR-L-014',
      q: 'A country discovers a large rare-earth deposit, but refining plants, skilled workers, and environmental capacity remain limited. What is the most defensible conclusion?',
      options: ['The discovery expands possibilities while other constraints preserve tradeoffs', 'The discovery abolishes scarcity because the underground stock increased', 'Environmental limits are irrelevant once the resource has a high market value', 'Refining capacity is a shortage only because firms have not raised prices enough'],
      answer: 'The discovery expands possibilities while other constraints preserve tradeoffs', type: 'constraint-analysis', skill: 'core_scarcity',
      commonError: 'Assuming discovery of one resource makes the complete production system unconstrained.',
      feedback: 'New resources can expand feasible output without removing complementary constraints.'
    },
    {
      id: 'P71-SCAR-L-015',
      q: 'A state has one construction workforce for unsafe bridges, aging schools, and storm-water upgrades. Which proposal most clearly hides the tradeoff?',
      options: ['Complete all projects immediately because each has benefits greater than zero', 'Rank projects by expected benefits, urgency, and displaced work', 'Phase projects as crews and materials become available', 'State which communities wait under each feasible schedule'],
      answer: 'Complete all projects immediately because each has benefits greater than zero', type: 'error-analysis', skill: 'tradeoff_identification',
      commonError: 'Treating positive benefits as proof that mutually competing projects are jointly feasible.',
      feedback: 'Positive benefits do not create the crews and materials required to do everything at once.'
    },
    {
      id: 'P71-SCAR-L-016',
      q: 'A fishery can allow a larger catch this season or preserve more breeding stock for future seasons. Which feature makes this a scarcity problem rather than only a biological fact?',
      options: ['The limited stock has competing current and future valued uses', 'The fish have no posted price while still in the ocean', 'The catch becomes scarce only after a legal quota is adopted', 'Future fish are unlimited because they have not yet been harvested'],
      answer: 'The limited stock has competing current and future valued uses', type: 'transfer', skill: 'scarcity_definition',
      commonError: 'Ignoring competing uses across time when the resource is renewable.',
      feedback: 'The breeding stock cannot simultaneously support maximum current catch and future reproduction.'
    },
    {
      id: 'P71-SCAR-L-017',
      q: 'A parent can accept additional paid work only by reducing caregiving or rest. A colleague says no tradeoff exists because caregiving has no money price. What is the best correction?',
      options: ['Time is scarce even when an alternative use is unpaid', 'Only lost wages can count as a scarce-resource sacrifice', 'Unpaid activities use no economically relevant resources', 'A tradeoff exists only when the household budget falls'],
      answer: 'Time is scarce even when an alternative use is unpaid', type: 'error-analysis', skill: 'tradeoff_identification',
      commonError: 'Restricting tradeoffs to alternatives with explicit money prices.',
      feedback: 'Nonmarket time has competing valuable uses and remains scarce.'
    },
    {
      id: 'P71-SCAR-L-018',
      q: 'A machine can produce medical sensors or environmental monitors during the same shift. Demand is high for both. Which information is essential before calling one production plan superior?',
      options: ['Benefits of each output and what the machine time displaces', 'Whether either product has ever experienced a retail stockout', 'Whether the machine was purchased with public or private funds', 'Whether every buyer values the two products by the same amount'],
      answer: 'Benefits of each output and what the machine time displaces', type: 'evaluation', skill: 'policy_tradeoff_analysis',
      commonError: 'Choosing from demand alone without comparing value and displaced output.',
      feedback: 'Scarcity makes both the chosen benefit and forgone production relevant.'
    },
    {
      id: 'P71-SCAR-L-019',
      q: 'An evacuation plan dedicates the only outbound bridge to buses carrying people without cars, delaying private vehicles. Which statement is most complete?',
      options: ['The rule reallocates scarce road capacity and changes who bears delay', 'Prioritizing vulnerable residents creates additional bridge capacity', 'A fairness goal makes the delay imposed on other users economically irrelevant', 'The bridge is not scarce because evacuees are not charged a toll'],
      answer: 'The rule reallocates scarce road capacity and changes who bears delay', type: 'policy-analysis', skill: 'efficiency_equity_policy_tradeoff',
      commonError: 'Treating a fairness rationale as elimination of the underlying capacity cost.',
      feedback: 'The priority rule affects distribution, but the bridge capacity remains fixed.'
    },
    {
      id: 'P71-SCAR-L-020',
      q: 'A school replaces a large lecture with small laboratory sections. Students receive more hands-on instruction, but fewer can enroll. Which statement best identifies the scarcity-driven tradeoff?',
      options: ['Instructional intensity rises while access to the limited teacher-hours falls', 'Hands-on instruction makes classroom capacity unlimited for enrolled students', 'Lower enrollment proves the laboratory format has no educational benefit', 'The tradeoff disappears because both formats use the same school building'],
      answer: 'Instructional intensity rises while access to the limited teacher-hours falls', type: 'comparison', skill: 'tradeoff_identification',
      commonError: 'Looking at quality or access alone instead of their competing use of instructional capacity.',
      feedback: 'Limited teacher-hours can support greater intensity or broader access, not both without limit.'
    },
    {
      id: 'P71-SCAR-L-021',
      q: 'An aid aircraft can carry water filters, antibiotics, or shelter materials after a cyclone. Which decision process best applies scarcity reasoning?',
      options: ['Compare needs, expected benefits, cargo limits, and what each load leaves behind', 'Carry equal weight of each item and conclude the cargo constraint is resolved', 'Choose the most expensive item because price alone measures every urgent benefit', 'Ignore forgone cargo because all three supplies support the same relief goal'],
      answer: 'Compare needs, expected benefits, cargo limits, and what each load leaves behind', type: 'multi-step', skill: 'policy_tradeoff_analysis',
      commonError: 'Using a single rule while ignoring cargo capacity and the supplies displaced.',
      feedback: 'A complete allocation compares benefits and forgone uses within the aircraft’s capacity.'
    }
  ],
  boss: [
    {
      id: 'P71-SCAR-B1-001', tier: 'easyBoss',
      q: 'A classroom has 24 seats and 31 students who want to attend. Which statement identifies the scarce resource?',
      options: ['The 24 available classroom seats', 'The seven students without seats', 'The tuition paid by every student', 'The number of courses in the catalog'],
      answer: 'The 24 available classroom seats', type: 'application', skill: 'scarcity_definition',
      commonError: 'Naming unmet wants rather than the resource that constrains them.',
      feedback: 'Seats are the limited resource relative to enrollment demand.'
    },
    {
      id: 'P71-SCAR-B2-001', tier: 'mediumBoss',
      q: 'A county gives more reservoir water to farms during planting season, leaving less for lawn irrigation and some industrial uses. What is the best interpretation?',
      options: ['A limited resource is being shifted among competing users', 'The county has eliminated scarcity by choosing agriculture', 'Only users paying the highest price face a water tradeoff', 'The reduced uses prove the reservoir has a temporary leak'],
      answer: 'A limited resource is being shifted among competing users', type: 'scenario', skill: 'tradeoff_identification',
      commonError: 'Treating a priority decision as elimination of the resource constraint.',
      feedback: 'Prioritizing farms reallocates water and reduces what remains for other users.'
    },
    {
      id: 'P71-SCAR-B3-001', tier: 'finalBoss',
      q: 'A space agency has one launch window for a weather satellite or a communications satellite. Both have large benefits. Which claim is least defensible?',
      options: ['Large benefits allow both satellites to use the same launch window', 'Choosing either mission forgoes the other mission’s near-term benefits', 'The launch window remains scarce even if the agency receives more money', 'A complete choice compares benefits, timing, and affected users'],
      answer: 'Large benefits allow both satellites to use the same launch window', type: 'error-analysis', skill: 'policy_tradeoff_analysis',
      commonError: 'Assuming positive benefits make mutually exclusive projects jointly feasible.',
      feedback: 'Value does not allow two missions to occupy one fixed launch window.'
    }
  ],
  legendaryBoss: [
    {
      id: 'P71-SCAR-LB-001',
      q: 'A relief convoy can carry food for 800 people or water for 500 people. A mixed load reduces both amounts. Which planning statement is economically sound?',
      options: ['Compare lives protected by each mix and identify the supplies displaced', 'Choose the full food load because larger numbers always maximize welfare', 'Split cargo evenly and conclude that the transport limit disappears', 'Ignore forgone cargo because every load serves the same emergency'],
      answer: 'Compare lives protected by each mix and identify the supplies displaced', type: 'multi-step', skill: 'policy_tradeoff_analysis',
      commonError: 'Using one visible quantity without comparing benefits and displaced cargo.',
      feedback: 'The scarce carrying capacity makes the mix and its forgone alternatives central.'
    },
    {
      id: 'P71-SCAR-LB-002',
      q: 'A city chooses a flood barrier for its only waterfront parcel. Officials say the housing and park proposals now have zero economic value. What is the error?',
      options: ['A chosen use does not erase the benefits of mutually exclusive alternatives', 'Public ownership prevents the parcel from having alternative uses', 'Flood protection makes the parcel physically available for every proposal', 'Unbuilt alternatives matter only if developers already paid for them'],
      answer: 'A chosen use does not erase the benefits of mutually exclusive alternatives', type: 'error-analysis', skill: 'tradeoff_identification',
      commonError: 'Treating rejection of an alternative as evidence that it had no value.',
      feedback: 'Forgone housing and recreation benefits remain part of the tradeoff.'
    },
    {
      id: 'P71-SCAR-LB-003',
      q: 'A breakthrough triples battery output, but mines and transmission lines remain capacity constrained. Which prediction follows most directly?',
      options: ['Some tradeoffs ease while bottlenecks shift to other scarce inputs', 'Every energy tradeoff disappears because battery productivity rose', 'Mining limits become poverty rather than scarcity after the breakthrough', 'Transmission capacity expands automatically with battery production'],
      answer: 'Some tradeoffs ease while bottlenecks shift to other scarce inputs', type: 'constraint-analysis', skill: 'core_scarcity',
      commonError: 'Generalizing one productivity improvement to the entire production system.',
      feedback: 'Technology can relocate constraints rather than eliminate them.'
    },
    {
      id: 'P71-SCAR-LB-004',
      q: 'A high-income country postpones either hospital upgrades or rail expansion because both require the same engineers. Which statement best explains why scarcity persists?',
      options: ['Real labor and time remain limited despite the country’s financial wealth', 'High national income means only poor households face economic scarcity', 'Borrowing more money immediately doubles the specialized engineering workforce', 'Valuable public projects have no opportunity cost in wealthy societies'],
      answer: 'Real labor and time remain limited despite the country’s financial wealth', type: 'application', skill: 'scarcity_definition',
      commonError: 'Equating wealth with unlimited real resources.',
      feedback: 'Financial capacity does not make specialized labor or time unlimited.'
    },
    {
      id: 'P71-SCAR-LB-005',
      q: 'A vaccine rule maximizes expected lives saved but gives remote communities fewer doses. Which evaluation is most complete?',
      options: ['It may be efficient by one measure while creating an equality concern', 'It must be equally fair because expected lives saved are maximized', 'It cannot be efficient because some communities receive fewer doses', 'It eliminates scarcity by applying a medically informed allocation rule'],
      answer: 'It may be efficient by one measure while creating an equality concern', type: 'evaluation', skill: 'efficiency_equity_policy_tradeoff',
      commonError: 'Treating an efficiency result as a complete distributional judgment.',
      feedback: 'Total benefit and distribution are distinct criteria under scarcity.'
    },
    {
      id: 'P71-SCAR-LB-006',
      q: 'A port can use crews now for routine maintenance or for a resilience upgrade that lowers future storm losses. Which comparison best handles scarcity across time?',
      options: ['Current service risk versus future resilience benefits and who bears each', 'Future benefits alone because present maintenance can always be recovered', 'Current maintenance alone because uncertain future losses have no value', 'Crew wages alone because time has no alternative use across periods'],
      answer: 'Current service risk versus future resilience benefits and who bears each', type: 'multi-step', skill: 'policy_tradeoff_analysis',
      commonError: 'Ignoring either the present or future use of a fixed workforce.',
      feedback: 'Intertemporal scarcity requires comparing present sacrifices with future gains.'
    }
  ],
  repair: [
    {
      id: 'P71-SCAR-R-001',
      q: 'A wealthy person must choose how to use one free evening. Why can that person still face scarcity?',
      options: ['Time is limited even when the person has substantial income', 'Scarcity applies only when a person cannot afford basic goods', 'Wealth makes every nonmoney resource unlimited', 'A choice among activities is only a temporary shortage'],
      answer: 'Time is limited even when the person has substantial income', type: 'diagnostic', skill: 'scarcity_definition',
      commonError: 'Equating scarcity with poverty.',
      feedback: 'Poverty concerns limited material means; scarcity also includes universal limits such as time.'
    },
    {
      id: 'P71-SCAR-R-002',
      q: 'A grocery store temporarily runs out of bottled water after a storm. Why is this different from scarcity?',
      options: ['The stockout is temporary; scarcity is the broader need to choose among limited resources', 'The stockout proves scarcity exists only during emergencies', 'Scarcity applies only if every store runs out at the same time', 'The two terms are identical whenever buyers cannot obtain a good'],
      answer: 'The stockout is temporary; scarcity is the broader need to choose among limited resources', type: 'diagnostic', skill: 'scarcity_definition',
      commonError: 'Equating scarcity with a temporary shortage.',
      feedback: 'A shortage is a temporary market condition; scarcity is the general constraint underlying choice.'
    },
    {
      id: 'P71-SCAR-R-003',
      q: 'A faster machine reduces production time but the firm still has limited workers and materials. What did the technology do?',
      options: ['It relaxed one constraint without eliminating scarcity', 'It made every productive input unlimited', 'It changed scarcity into a retail shortage', 'It removed the need to choose among projects'],
      answer: 'It relaxed one constraint without eliminating scarcity', type: 'diagnostic', skill: 'core_scarcity',
      commonError: 'Assuming technology eliminates all scarcity.',
      feedback: 'Technology can expand possibilities while other scarce inputs and wants remain.'
    },
    {
      id: 'P71-SCAR-R-004',
      q: 'A fair lottery assigns one available treatment slot among two equally eligible patients. What does the lottery change?',
      options: ['Who receives the slot, not the number of available slots', 'The number of slots, because a fair rule creates capacity', 'Scarcity into abundance, because each patient had an equal chance', 'Efficiency into equality, because the two ideas are identical'],
      answer: 'Who receives the slot, not the number of available slots', type: 'diagnostic', skill: 'policy_tradeoff_analysis',
      commonError: 'Assuming fairness removes the underlying resource constraint.',
      feedback: 'An allocation rule can be fair without creating more of the scarce resource.'
    }
  ],
  bridge: [
    {
      id: 'P71-SCAR-BR-001',
      q: 'A campus uses its only open parcel for a laboratory instead of student housing. Scarcity creates a tradeoff; which neighboring idea names the next-best use forgone?',
      options: ['Opportunity cost', 'Market equilibrium', 'Price elasticity', 'Monetary neutrality'],
      answer: 'Opportunity cost', type: 'bridge', skill: 'tradeoff_identification', secondaryConceptIds: ['opportunity-cost'],
      commonError: 'Recognizing a tradeoff without connecting it to the next-best forgone alternative.',
      feedback: 'Opportunity cost is the value of the next-best alternative given up when scarcity forces a choice.'
    },
    {
      id: 'P71-SCAR-BR-002',
      q: 'A factory divides fixed labor and machine time between medical devices and water filters. Which neighboring model displays the feasible combinations created by this scarcity?',
      options: ['A production possibilities frontier', 'A consumer price index', 'A money-demand curve', 'A Phillips curve'],
      answer: 'A production possibilities frontier', type: 'bridge', skill: 'core_scarcity', secondaryConceptIds: ['production-possibilities-frontier'],
      commonError: 'Recognizing limited resources without connecting them to feasible production combinations.',
      feedback: 'A PPF represents the combinations possible when scarce productive resources have competing uses.'
    }
  ]
};

function allQuestionLocations(module) {
  const locations = [];
  for (const [pool, questions] of Object.entries(module.questions || {})) {
    for (const question of questions) locations.push({ pool, list: questions, question });
  }
  for (const [pool, list] of [['repair', module.repairQuestions], ['repairSeed', module.repairSeedQuestions], ['bridge', module.bridgeQuestions]]) {
    for (const question of list || []) locations.push({ pool, list, question });
  }
  return locations;
}

function occurrenceFor(question, pool, order, globalName) {
  return {
    sourceGame: SOURCE_GAME,
    sourceFile: SOURCE_FILE,
    sourceGlobal: globalName,
    sourcePool: pool,
    routeKey: question.primarySkill || null,
    sourceRecordOrder: order,
    sourceId: question.sourceId,
    sourceHash: question.sourceHash
  };
}

function applyRewrite(question, spec, pool, order) {
  const before = snapshot(question);
  for (const field of ['q', 'options', 'type', 'primarySkill', 'repairSkill', 'commonError', 'feedback']) {
    if (spec[field] !== undefined) question[field] = Array.isArray(spec[field]) ? [...spec[field]] : spec[field];
  }
  if (spec.answer) question.aHash = answerHash(spec.answer);
  if (!question.options.includes(spec.answer || question.options.find(option => answerHash(option) === question.aHash))) {
    throw new Error(`${idOf(question)} rewritten answer is not present in options.`);
  }
  delete question.a;
  question.sourceCurationPhase = PHASE;
  question.sourceHash = sourceHash(question, pool);
  const occurrence = occurrenceFor(question, pool, order, 'questions');
  question.sourceOccurrences = [...(question.sourceOccurrences || []).filter(item => item.sourceCurationPhase !== PHASE), { ...occurrence, sourceCurationPhase: PHASE }];
  return { id: idOf(question), concept: CONCEPT_ID, pool, action: 'REWRITE', before, after: snapshot(question) };
}

function makeQuestion(spec, pool, order, sourceId) {
  const isBoss = pool === 'boss';
  const isLegendaryBoss = pool === 'legendaryBoss';
  const isRepair = pool === 'repair';
  const isBridge = pool === 'bridge';
  const storedPool = isBoss ? spec.tier : pool;
  const canonicalDifficulty = isBoss
    ? ({ easyBoss: 'easy', mediumBoss: 'medium', finalBoss: 'hard' })[spec.tier]
    : isLegendaryBoss ? 'legendary'
      : (isRepair || isBridge) ? 'unknown' : pool;
  const difficulty = isBoss ? spec.tier : isLegendaryBoss ? 'legendaryBoss' : isRepair ? 'microRepair' : isBridge ? 'microBridge' : pool;
  const role = isBoss ? 'boss' : isLegendaryBoss ? 'legendaryBoss' : isRepair ? 'repair' : isBridge ? 'bridge' : pool === 'elite' ? 'elite' : pool === 'legendary' ? 'legendary' : 'main';
  const question = {
    id: spec.id,
    sourceGame: SOURCE_GAME,
    q: spec.q,
    options: [...spec.options],
    tag: 'scarcity_tradeoffs',
    type: spec.type,
    objective: 'LO1.1',
    difficulty,
    conceptCluster: 'core_scarcity_tradeoffs',
    primarySkill: spec.skill,
    secondarySkills: [...(spec.secondarySkills || [])],
    repairSkill: spec.repairSkill || spec.skill,
    commonError: spec.commonError,
    feedback: spec.feedback,
    aHash: answerHash(spec.answer),
    canonicalId: spec.id,
    sourceId,
    sourceChapter: [1],
    sourcePool: isRepair || isBridge ? spec.skill : storedPool,
    primaryConceptId: CONCEPT_ID,
    secondaryConceptIds: [...(spec.secondaryConceptIds || [])],
    instructionalRole: role,
    canonicalDifficulty,
    originalSourcePool: isRepair || isBridge ? spec.skill : storedPool,
    originalBossTier: isBoss ? spec.tier : isLegendaryBoss ? 'legendaryBoss' : null,
    sourceCurationPhase: PHASE
  };
  if (!question.options.includes(spec.answer)) throw new Error(`${spec.id}: answer is not present in options.`);
  if (isBoss) question.boss = ({ easyBoss: 'Checkpoint One', mediumBoss: 'Checkpoint Two', finalBoss: 'Final Checkpoint' })[spec.tier];
  if (isLegendaryBoss) question.bossStage = 'middle';
  question.sourceHash = sourceHash(question, pool);
  question.sourceOccurrences = [{ ...occurrenceFor(question, question.sourcePool, order, isRepair ? 'microSkillRepairPools' : isBridge ? 'microSkillBridgePools' : 'questions'), sourceCurationPhase: PHASE }];
  return question;
}

function uniqueQuestions(module) {
  const seen = new Set();
  return allQuestionLocations(module).map(item => item.question).filter(question => {
    const id = idOf(question);
    if (!id || seen.has(id)) return false;
    seen.add(id);
    return true;
  });
}

const { raw: beforeRaw, library } = loadLibrary();
if (!library || !library.concepts?.[CONCEPT_ID]) throw new Error('Scarcity module not found.');
if (!String(library.libraryVersion).endsWith(PREVIOUS_PHASE) && library.sourceCurationPhase !== PHASE) {
  throw new Error(`Expected ${PREVIOUS_PHASE} or idempotent ${PHASE}; found ${library.libraryVersion}`);
}

const beforeLibraryVersion = library.libraryVersion;
const beforeLibrarySha256 = library.librarySha256;
const beforeLibraryFileSha256 = sha256(beforeRaw);
const module = library.concepts[CONCEPT_ID];
const beforeIds = uniqueQuestions(module).map(idOf);
const review = beforeIds.filter(id => !id.startsWith('P71-SCAR-')).map(id => ({
  id,
  action: rewriteSpecs[id] ? 'REWRITE' : 'KEEP'
}));
if (review.length !== 48) throw new Error(`Expected 48 pre-expansion Scarcity records, found ${review.length}.`);

const changes = [];
let rewriteOrder = 0;
for (const location of allQuestionLocations(module)) {
  const spec = rewriteSpecs[idOf(location.question)];
  if (spec) changes.push(applyRewrite(location.question, spec, location.pool, rewriteOrder++));
}
const missingRewrites = Object.keys(rewriteSpecs).filter(id => !changes.some(change => change.id === id));
if (missingRewrites.length) throw new Error(`Rewrite IDs not found: ${missingRewrites.join(', ')}`);

let newSourceOrdinal = 0;
for (const [pool, specs] of Object.entries(additions)) {
  const targetList = pool === 'repair' ? module.repairQuestions : pool === 'bridge' ? module.bridgeQuestions : module.questions[pool];
  const prefixIds = new Set(specs.map(spec => spec.id));
  for (let index = targetList.length - 1; index >= 0; index -= 1) {
    if (prefixIds.has(idOf(targetList[index]))) targetList.splice(index, 1);
  }
  specs.forEach((spec, index) => {
    const question = makeQuestion(spec, pool, index, 7100001 + newSourceOrdinal++);
    targetList.push(question);
    changes.push({ id: question.id, concept: CONCEPT_ID, pool: pool === 'boss' ? spec.tier : pool, action: 'ADD', before: null, after: snapshot(question) });
  });
}

module.microSkillRepairPools = {
  scarcity_definition: ['P52A-SCAR-R-001', 'P71-SCAR-R-001', 'P71-SCAR-R-002'],
  efficiency_definition: ['P52A-SCAR-R-002'],
  equality_definition: ['P52A-SCAR-R-002'],
  efficiency_vs_equality: ['P52A-SCAR-R-002'],
  efficiency_equity_tradeoff: ['P52A-SCAR-R-002'],
  efficiency_equity_policy_tradeoff: ['P52A-SCAR-R-002', 'P71-SCAR-R-004'],
  tradeoff_identification: ['P52A-SCAR-R-003'],
  core_scarcity: ['P71-SCAR-R-003'],
  policy_tradeoff_analysis: ['P71-SCAR-R-004']
};
module.microSkillBridgePools = {
  tradeoff_identification: ['P52A-SCAR-BR-001', 'P71-SCAR-BR-001'],
  core_scarcity: ['P52A-SCAR-BR-002', 'P71-SCAR-BR-002'],
  scarcity_definition: ['P71-SCAR-BR-001'],
  policy_tradeoff_analysis: ['P71-SCAR-BR-001'],
  efficiency_definition: ['P71-SCAR-BR-002'],
  equality_definition: ['P71-SCAR-BR-002'],
  efficiency_vs_equality: ['P71-SCAR-BR-002'],
  efficiency_equity_tradeoff: ['P71-SCAR-BR-002'],
  efficiency_equity_policy_tradeoff: ['P71-SCAR-BR-002']
};

const expectedPools = { easy: 10, medium: 10, hard: 10, elite: 4, legendary: 27, calculation: 0, boss: 12, legendaryBoss: 9, integration: 0 };
for (const [pool, expected] of Object.entries(expectedPools)) {
  if (module.questions[pool].length !== expected) throw new Error(`${pool}: expected ${expected}, found ${module.questions[pool].length}`);
}
if (module.repairQuestions.length !== 7 || module.repairSeedQuestions.length !== 3 || module.bridgeQuestions.length !== 4) {
  throw new Error(`Auxiliary counts mismatch: repair ${module.repairQuestions.length}, seed ${module.repairSeedQuestions.length}, bridge ${module.bridgeQuestions.length}`);
}
const finalQuestions = uniqueQuestions(module);
if (finalQuestions.length !== 96) throw new Error(`Expected 96 unique Scarcity questions, found ${finalQuestions.length}.`);
const finalIds = new Set(finalQuestions.map(idOf));
if (finalIds.size !== finalQuestions.length) throw new Error('Duplicate Scarcity canonical IDs detected.');

const registry = library.registry.concepts.find(item => item.canonicalConceptId === CONCEPT_ID);
registry.sourceGames = [...new Set([...(registry.sourceGames || []), SOURCE_GAME])];
registry.questionCountByRole = {
  boss: 12, bridge: 4, calculation: 0, elite: 4, integration: 0,
  legendary: 27, legendaryBoss: 9, main: 30, repair: 7, repairSeed: 3
};
registry.questionCountByDifficulty = { easy: 14, elite: 4, hard: 14, legendary: 36, medium: 14, unknown: 14 };
registry.repairCoverage = { directSkillMatches: 7, mainWithUsableSkill: 82 };
registry.bridgeCoverage = { directSkillMatches: 4, mainWithUsableSkill: 82 };
registry.calculationCoverage = finalQuestions.filter(question => String(question.type).toLowerCase() === 'calculation').length;
registry.graphCoverage = 0;
registry.notes = 'Concept boundary follows structured source objectives and skills. Phase 7.1 matured the shared General/Macro Scarcity bank with application-led ordinary pools, full Legendary depth, rotating checkpoints, and misconception-specific Repair/Bridge routes.';
registry.instructionalClassification = 'Standalone-ready';
registry.coverageStatus = 'ready-focused';
registry.coverageStatusLabel = 'Ready for focused use';
registry.coverageStatusNote = 'Compact standalone profile met: full-run ordinary and Legendary depth, checkpoint rotation, direct diagnostic Repair, and genuine conceptual Bridges.';
registry.coverageFloorVersion = PHASE;

library.libraryVersion = library.libraryVersion.endsWith(`-${PHASE}`) ? library.libraryVersion : `${library.libraryVersion}-${PHASE}`;
library.sourceCurationPhase = PHASE;
library.sourceGeneratedAt = GENERATED_AT;
library.registry.generatedAt = GENERATED_AT;
library.canonicalQuestionCount = Object.values(library.concepts).reduce((total, conceptModule) => total + uniqueQuestions(conceptModule).length, 0);
if (library.canonicalQuestionCount !== 6400) throw new Error(`Expected library canonical total 6400, found ${library.canonicalQuestionCount}.`);
delete library.librarySha256;
library.librarySha256 = sha256(JSON.stringify(stable(library)));
const libraryText = `window.MQ_COMPOSER_LIBRARY = ${JSON.stringify(library)};\n`;

fs.mkdirSync(artifactRoot, { recursive: true });
const changesArtifact = {
  schemaVersion: '1.0.0',
  phase: PHASE,
  generatedAt: GENERATED_AT,
  concept: { canonicalConceptId: CONCEPT_ID, title: module.title, courseAreas: ['General Economics', 'Macroeconomics'] },
  sourceLibrary: { beforeVersion: beforeLibraryVersion, beforeLogicalSha256: beforeLibrarySha256, beforeFileSha256: beforeLibraryFileSha256 },
  reviewSummary: {
    existingReviewed: review.length,
    keep: review.filter(item => item.action === 'KEEP').length,
    rewrite: review.filter(item => item.action === 'REWRITE').length,
    relocateRepair: 0,
    relocateBridge: 0,
    remove: 0
  },
  existingReview: review,
  changes,
  afterCounts: {
    totalCanonical: 96, easy: 10, medium: 10, hard: 10, elite: 4, legendary: 27,
    easyBoss: 4, mediumBoss: 4, finalBoss: 4, legendaryBoss: 9,
    repair: 7, repairSeed: 3, bridge: 4, calculation: 0, integration: 0
  }
};

fs.writeFileSync(libraryPath, libraryText);
fs.writeFileSync(registryPath, `${JSON.stringify(library.registry, null, 2)}\n`);

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
manifest.assets = library.assetInventory;
manifest.assetCount = library.assetInventory.length;
manifest.conceptCount = library.conceptCount;
manifest.canonicalQuestionCount = library.canonicalQuestionCount;
manifest.libraryVersion = library.libraryVersion;
manifest.librarySha256 = library.librarySha256;
manifest.generatedAt = GENERATED_AT;
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

changesArtifact.afterLibrary = {
  version: library.libraryVersion,
  sourceCurationPhase: library.sourceCurationPhase,
  logicalSha256: library.librarySha256,
  fileSha256: sha256(libraryText),
  canonicalQuestionCount: library.canonicalQuestionCount
};
fs.writeFileSync(changesPath, `${JSON.stringify(changesArtifact, null, 2)}\n`);

const provenance = {
  phase: PHASE,
  generatedAt: GENERATED_AT,
  repository: repoRoot,
  concept: CONCEPT_ID,
  before: { libraryVersion: beforeLibraryVersion, librarySha256: beforeLibrarySha256, libraryFileSha256: beforeLibraryFileSha256, conceptCanonicalQuestions: 48 },
  after: { libraryVersion: library.libraryVersion, librarySha256: library.librarySha256, libraryFileSha256: sha256(libraryText), conceptCanonicalQuestions: 96 },
  counts: changesArtifact.afterCounts,
  actions: {
    reviewed: review.length,
    kept: review.filter(item => item.action === 'KEEP').length,
    rewritten: changes.filter(item => item.action === 'REWRITE').length,
    added: changes.filter(item => item.action === 'ADD').length,
    relocatedRepair: 0,
    relocatedBridge: 0,
    removed: 0
  },
  otherConceptQuestionContentChanged: false,
  graphQuestionsChanged: false,
  graphAssetsChanged: false
};
fs.writeFileSync(provenancePath, `${JSON.stringify(provenance, null, 2)}\n`);

const cacheKey = '20260809-scarcity-standalone-v1';
for (const file of [path.join(repoRoot, 'build', 'index.html'), path.join(composerRoot, 'index.html')]) {
  let text = fs.readFileSync(file, 'utf8');
  text = text.replaceAll('20260809-graph-accessibility-v1', cacheKey);
  fs.writeFileSync(file, text);
}

console.log(JSON.stringify({
  phase: PHASE,
  libraryVersion: library.libraryVersion,
  librarySha256: library.librarySha256,
  libraryFileSha256: sha256(libraryText),
  canonicalQuestionCount: library.canonicalQuestionCount,
  scarcityQuestionCount: finalQuestions.length,
  reviewed: review.length,
  rewrites: changes.filter(item => item.action === 'REWRITE').length,
  additions: changes.filter(item => item.action === 'ADD').length,
  changesPath,
  provenancePath,
  cacheKey
}, null, 2));
