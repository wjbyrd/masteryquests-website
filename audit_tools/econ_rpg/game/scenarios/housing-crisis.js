import housingScenes from './housing-scenes.js';
const p = text => ({ type: 'paragraph', text });
const chosen = id => ({ chosen: id });
const atLeast = (state, value) => ({ state, op: 'gte', value });
const atMost = (state, value) => ({ state, op: 'lte', value });
const ceiling = chosen('response.ceiling');
export default {
  id: 'housing-crisis', version: 1, title: 'Room to Stay',
  subtitle: 'A branching housing-policy scenario',
  sceneSet: housingScenes,
  introTitle: 'Housing policy brief', stateTitle: 'City conditions', consequenceTitle: 'Policy consequences',
  role: 'Housing advisor · City of Linden', duration: 'About 10–15 minutes', decisions: 6, endingEyebrow: 'Your outcome · Two years of decisions',
  introduction: [
    p('Rents in Linden have risen faster than household incomes. Apartment vacancies are scarce, and new homes take time to build. Linden already has a small emergency housing fund; the city asks you to build on that response while keeping homes available and maintained.'),
    p('Advise the housing task force through six decisions over two years. Each policy changes the conditions you face next. You will see who benefits, what it costs, and what remains unresolved.')
  ],
  modelNote: 'An instructional model, not a forecast. Indicators are bounded, ordinal conditions, not dollars, percentages, or estimated policy effects. Higher means more of the named condition. Affordability tracks relief for current renters; availability tracks access for people seeking a home. Zero budget room means further commitments squeeze other services; this model does not measure debt. Values stop at 0 and 8.',
  state: {
    relief: { label: 'Renter affordability', short: 'Relief for current renters', initial: 2, min: 0, max: 8 },
    availability: { label: 'Housing availability', short: 'Access for people seeking a home', initial: 3, min: 0, max: 8 },
    quality: { label: 'Housing quality', short: 'Maintenance of existing homes', initial: 5, min: 0, max: 8 },
    budget: { label: 'Budget room', short: 'Capacity for further commitments', initial: 7, min: 0, max: 8 },
    building: { label: 'Construction incentive', short: 'Willingness to add rental homes', initial: 3, min: 0, max: 8 }
  },
  start: 'response',
  metadata: { concept: 'Housing market interventions', learningObjective: 'Trace direct and second-order effects of policy under scarce housing supply.', misconception: 'Lower posted rents guarantee that all households can obtain housing.' },
  nodes: [
    {
      id: 'response', title: 'The next rent payment', time: 'Month 1',
      scene: [p('Tenants facing lease renewals need help now. Builders report that zoning and permit delays limit new apartments. Your first recommendation must address the immediate pressure.')],
      prompt: 'Where should the city begin?',
      choices: [
        { id: 'ceiling', label: 'Limit rents below current market levels', detail: 'Apply a binding ceiling to existing rentals and future rental projects.',
          effects: { relief: 3, availability: -1, building: -1 }, next: 'allocation',
          consequence: 'Covered tenants who keep their homes pay less. At the lower rent, more households seek units while fewer units are offered, widening the shortage. Access now depends more on waiting and selection than on price.',
          mechanism: 'Binding price ceiling and excess demand', tradeoff: 'Relief for incumbent tenants can come at the expense of access for newcomers.',
          whatIf: 'Targeted assistance would have preserved rent signals but used city funds and left some rent increases uncovered.' },
        { id: 'assistance', label: 'Fund targeted rental assistance', detail: 'Help low-income renters meet payments while market rents can adjust.',
          effects: { relief: 2, budget: -2 }, next: 'bridge',
          consequence: 'Eligible households can meet more of their rent, but the city commits funds immediately. With few vacancies, some of the extra purchasing power can feed into rents rather than additional housing. Assistance does not itself create new apartments.',
          mechanism: 'Demand assistance with inelastic short-run supply', tradeoff: 'Targeting limits fiscal cost but leaves households outside eligibility without relief.',
          whatIf: 'A binding ceiling would have reduced covered rents without this initial outlay, while increasing nonprice rationing.' },
        { id: 'bridge', label: 'Offer temporary eviction-prevention grants', detail: 'Cover urgent arrears while preserving funds for a longer-term response.',
          effects: { relief: 1, budget: -1 }, next: 'bridge',
          consequence: 'Emergency grants keep some households from losing their homes. They do not change ongoing rents, so families with a persistent income shortfall remain exposed. The city retains more room to address the supply problem.',
          mechanism: 'Temporary relief versus a recurring affordability gap', tradeoff: 'A smaller immediate program preserves funds but reaches fewer renters.',
          whatIf: 'Broader rental assistance would have eased more current payments at a higher recurring fiscal cost.' }
      ]
    },
    {
      id: 'allocation', title: 'Who gets the vacant apartment?', time: 'Month 3',
      scene: [p('Lower advertised rents have drawn more applicants. Families report long searches and inconsistent screening. A cheap lease is valuable, but not everyone can get one.')],
      prompt: 'How should scarce vacancies be allocated?',
      choices: [
        { id: 'registry', label: 'Create a transparent vacancy lottery', detail: 'Use a city registry and lottery for participating vacant units.', effects: { budget: -1 }, next: 'maintenance',
          consequence: 'A registry makes access less dependent on personal connections, at an administrative cost. A lottery changes who gets a scarce apartment without increasing the number available. Households not selected still need another option.',
          mechanism: 'Nonprice rationing', tradeoff: 'A more transparent allocation rule cannot remove the underlying shortage.',
          whatIf: 'Exempting new leases would have encouraged turnover, but new tenants would have faced market rents.' },
        { id: 'exempt', label: 'Exempt new leases from the ceiling', detail: 'Keep existing tenants covered; let rents adjust when a unit turns over.', effects: { relief: -1, availability: 1, building: 1 }, next: 'maintenance',
          consequence: 'Offering a vacant home becomes more attractive, so more units come onto the market in this model. New tenants face higher rents than protected incumbents. The city now has two groups of renters with different protections.',
          mechanism: 'Supply incentives and distribution across cohorts', tradeoff: 'Improved access comes with higher rents for new tenants.',
          whatIf: 'A vacancy lottery would have kept more rents low while leaving the shortage largely unchanged.' }
      ]
    },
    {
      id: 'bridge', title: 'Help that lasts?', time: 'Month 3',
      scene: [p('Applications for help exceed the original allocation. Households just above the eligibility threshold also report difficulty paying rent. The city must decide how far to stretch the program.')],
      prompt: 'How should the next round of support work?',
      choices: [
        { id: 'expand', label: 'Extend support to more households', detail: 'Broaden eligibility and fund another round.', effects: { relief: 2, budget: -2 }, next: 'maintenance',
          consequence: 'More households can stay current on rent. The broader commitment reduces funds available for repairs and construction support. Since supply is still tight, additional assistance cannot guarantee an available home for every applicant.',
          mechanism: 'Fiscal opportunity cost and constrained supply', tradeoff: 'Broader coverage leaves less capacity for later investment.',
          whatIf: 'Keeping support focused would have preserved budget room but excluded more households.' },
        { id: 'target', label: 'Keep support focused on urgent need', detail: 'Prioritize households facing imminent displacement.', effects: { budget: -1 }, next: 'maintenance',
          consequence: 'The city renews support for the most urgent cases. Households outside that group still face high housing costs. Narrower coverage preserves more funds for measures that might expand access later.',
          mechanism: 'Targeting and opportunity cost', tradeoff: 'Fiscal capacity is preserved through a narrower distribution of benefits.',
          whatIf: 'Broader eligibility would have provided more immediate relief, with fewer funds left for later decisions.' }
      ]
    },
    {
      id: 'maintenance', title: 'Keeping homes habitable', time: 'Month 6', unavailableNote: 'Repair grants require at least 2 steps of budget room. Earlier commitments have left too little capacity.',
      scene: [p('Repair costs have risen, and older buildings need work. Some owners are postponing maintenance. Tenants want action before small problems become expensive failures.')],
      variants: [{ when: ceiling, scene: [p('Repair costs have risen. In buildings still under the ceiling, owners cannot recover those costs through higher rents, and some defer repairs. Tenants need protection, but enforcement alone cannot pay for every repair.')] }],
      prompt: 'What is your maintenance policy?',
      choices: [
        { id: 'inspect', label: 'Expand inspections and require repairs', detail: 'Enforce habitability standards through a larger inspection team.', effects: { quality: 1, budget: -1 }, next: 'supply',
          consequence: 'Inspections bring some overdue repairs forward. Enforcement costs money and may lead owners of marginal units to leave the rental market. Standards address quality directly, but they do not remove the cost of providing housing.',
          outcomes: [{ when: ceiling, effects: { availability: -1, quality: -1 }, consequence: 'Inspections prevent some deterioration, but the ceiling limits revenue to cover rising costs. Some owners withdraw marginal units rather than undertake required repairs. Quality holds steady overall while the shortage deepens.' }],
          mechanism: 'Maintenance incentives and compliance costs', tradeoff: 'Enforcing standards protects tenants, but marginal units may be withdrawn.',
          whatIf: 'Repair grants could have supported quality with fewer withdrawals, while drawing more heavily on the budget.' },
        { id: 'grants', label: 'Offer conditional repair grants', detail: 'Help fund repairs in exchange for continued rental availability.', when: atLeast('budget', 2), effects: { quality: 2, budget: -2 }, next: 'supply',
          consequence: 'Grants make needed repairs affordable for participating owners, who agree to keep the homes in rental use. Tenants receive better-maintained housing. The city pays part of a cost that owners would otherwise bear, leaving less for other programs.',
          mechanism: 'Conditional producer subsidy', tradeoff: 'Improved quality uses funds that could support renters or new supply.',
          whatIf: 'Inspections alone would have cost less publicly, but owners would have had to absorb more of the repair cost.' },
        { id: 'phase', label: 'Phase in repair requirements', detail: 'Keep urgent safety rules; give owners longer to complete other repairs.', effects: { quality: -1 }, next: 'supply',
          consequence: 'A longer timetable avoids an immediate fiscal commitment. Some nonurgent repairs remain undone, reducing housing quality during the wait. The city preserves funds but passes some of the burden to current tenants.',
          outcomes: [{ when: ceiling, effects: { quality: -1 }, consequence: 'Owners get more time, but limited rental revenue still weakens the incentive to complete repairs. Deferred work accumulates in covered buildings. The city preserves funds while tenants live with a larger decline in quality.' }],
          mechanism: 'Intertemporal tradeoff and maintenance incentives', tradeoff: 'Lower current costs can mean worse housing conditions now and larger repairs later.',
          whatIf: 'Repair grants would have improved conditions sooner, at an immediate public cost.' }
      ]
    },
    {
      id: 'supply', title: 'Homes that are not here yet', time: 'Month 9', unavailableNote: 'Co-funding apartments requires at least 3 steps of budget room. Earlier commitments have left too little capacity.',
      scene: [p('Builders propose apartments near existing transport. Zoning limits density, permits take time, and infrastructure needs funding. Even approved projects will not house anyone immediately.')],
      prompt: 'Which obstacle should the city tackle?',
      choices: [
        { id: 'reform', label: 'Allow more homes and simplify permits', detail: 'Permit small apartment buildings and fund planning capacity.', effects: { building: 3, budget: -1 }, next: 'renewal',
          consequence: 'More projects become feasible when density limits and delays ease. Construction incentives strengthen, but tenants see no immediate increase in completed homes. Infrastructure demand and neighborhood adjustment will accompany any building that follows.',
          mechanism: 'Supply restrictions and construction lags', tradeoff: 'Future capacity requires adjustment and offers little immediate rent relief.',
          whatIf: 'A construction subsidy could have added a stronger financial incentive, but only with sufficient budget room.' },
        { id: 'subsidy', label: 'Co-fund new mixed-rent apartments', detail: 'Pair limited zoning flexibility with support for reserved lower-rent homes.', when: atLeast('budget', 3), effects: { building: 3, budget: -3 }, next: 'renewal',
          consequence: 'Public support makes a set of mixed-rent projects feasible, including homes reserved for lower-income renters. Completion still takes time. The commitment uses a large share of remaining funds and may support some investment that would have happened anyway.',
          mechanism: 'Supply subsidy and additionality', tradeoff: 'Reserved affordable homes require fiscal resources and careful targeting of projects.',
          whatIf: 'Permitting reform alone would have preserved more funds but provided no reserved lower-rent units.' },
        { id: 'retain', label: 'Retain current development limits', detail: 'Avoid new infrastructure commitments while reviewing growth plans.', effects: {}, next: 'renewal',
          consequence: 'The city avoids immediate planning and infrastructure commitments. Existing restrictions continue to limit feasible projects. With demand still strong, the shortage of new homes remains a constraint on every affordability measure.',
          mechanism: 'Constrained long-run supply', tradeoff: 'Avoiding near-term adjustment limits future housing options.',
          whatIf: 'Allowing greater density would have improved future supply incentives, while requiring the city to manage growth.' }
      ]
    },
    {
      id: 'renewal', title: 'The next budget meeting', time: 'Month 12',
      scene: [p('The first year is ending. Payments that were temporary are now part of household budgets. New construction, if encouraged, is still underway.')],
      variants: [{ when: atMost('budget', 2), scene: [p('Very little budget room remains. Continuing relief would squeeze other city services. Any projects underway still need time before they can offer homes.')] }],
      prompt: 'How should the city handle the next year?',
      choices: [
        { id: 'renew', label: 'Renew temporary housing support', detail: 'Maintain near-term relief through another funding cycle.', effects: { relief: 1, budget: -2 }, next: 'review',
          consequence: 'Renewed support prevents an abrupt loss of help for current recipients. Recurring costs narrow the city’s options in the next budget. If the housing stock does not expand, the need for support may persist.',
          mechanism: 'Recurring fiscal commitments', tradeoff: 'Continuity for recipients competes with other uses of public funds.',
          whatIf: 'Tapering support would have reduced future commitments but exposed recipients to a larger rent burden.' },
        { id: 'taper', label: 'Taper support with advance notice', detail: 'Reduce the next allocation and give recipients time to plan.', effects: { relief: -1, budget: 1 }, next: 'review',
          consequence: 'Smaller future commitments restore some budget room. Recipients must cover more of their own housing costs before new homes necessarily arrive. The timing of relief and construction now matters as much as the policy choice itself.',
          mechanism: 'Timing mismatch between relief and supply', tradeoff: 'Fiscal flexibility improves while short-run affordability worsens.',
          whatIf: 'Renewing support would have softened the transition but left less capacity for other services.' }
      ]
    },
    {
      id: 'review', title: 'Two years later', time: 'Month 24',
      scene: [p('The task force must set its next priority. Earlier choices determine whether builders have projects to finish and whether the city can keep financing support.')],
      variants: [
        { when: { any: [chosen('supply.reform'), chosen('supply.subsidy')] }, scene: [p('Projects encouraged last year are reaching completion. Access will improve as homes open, although costs and existing rent rules still affect how much developers deliver. Current renters may need help before those gains reach them.')] },
        { when: ceiling, scene: [p('Protected tenants retain lower rents, but applicants still compete for scarce openings. With development limits unchanged, the city cannot rely on a wave of new homes to resolve the shortage.')] }
      ],
      prompt: 'What should guide the next phase?',
      choices: [
        { id: 'access', label: 'Prioritize access to more rental homes', detail: 'Ease remaining entry barriers and help projects or vacant units enter the market.', effects: { availability: 1, building: 1 }, next: '$end',
          consequence: 'Easier entry brings some additional homes into rental use. Without a strong construction pipeline, the gain is modest. More access does not guarantee that the lowest-income renters can afford the available units.',
          outcomes: [
            { when: { all: [chosen('supply.reform'), ceiling, { not: chosen('allocation.exempt') }] }, effects: { availability: 1 }, consequence: 'Some projects enabled by permit reform open, though the ceiling limits expected returns and reduces the response. Entry barriers ease and access improves somewhat. Low posted rents still leave more applicants than homes in parts of the market.' },
            { when: chosen('supply.reform'), effects: { availability: 3 }, consequence: 'Projects enabled by earlier permit reform open, alongside additional units drawn into rental use. The larger stock improves access and eases competition for housing. Households with the least income still face difficult rent payments.' },
            { when: chosen('supply.subsidy'), effects: { availability: 3, relief: 1 }, consequence: 'The co-funded apartments open, including reserved lower-rent homes. Access expands and some eligible renters receive additional relief. Those homes reflect an earlier public commitment that still limits fiscal flexibility.' }
          ],
          mechanism: 'Long-run supply response and policy interaction', tradeoff: 'More homes improve access; income differences still shape who can afford them.',
          whatIf: 'Prioritizing current renters would have offered more immediate relief but a smaller improvement in access.' },
        { id: 'protect', label: 'Prioritize stability for current renters', detail: 'Commit another round of focused help as the market adjusts.', effects: { relief: 1, budget: -1 }, next: '$end',
          consequence: 'Focused help reduces the burden on current recipients. With no new construction pipeline, people seeking a home still face limited options. Relief and access remain separate challenges.',
          outcomes: [
            { when: { all: [chosen('supply.reform'), ceiling, { not: chosen('allocation.exempt') }] }, effects: { availability: 1 }, consequence: 'Focused help cushions current renters while some approved homes open. The ceiling limits returns, so construction responds less strongly than it otherwise would in this model. Access improves modestly, and support still uses public funds.' },
            { when: chosen('supply.reform'), effects: { availability: 2 }, consequence: 'Focused help cushions current renters as projects enabled by permit reform open. New homes improve access, while assistance addresses the income gap that additional supply alone cannot immediately close. Both gains leave questions about future funding and infrastructure.' },
            { when: chosen('supply.subsidy'), effects: { availability: 2, relief: 1 }, consequence: 'Co-funded homes open and targeted help supports current renters. More households benefit from lower-rent options, but the combined commitments leave less public money for other needs. The supply gain is real within this model, and so is its fiscal tradeoff.' }
          ],
          mechanism: 'Distribution, supply, and fiscal cost', tradeoff: 'Stability for recipients uses funds and may leave outsiders searching longer.',
          whatIf: 'Prioritizing entry would have added more available units but offered less direct help with current payments.' }
      ]
    }
  ],
  // First match wins. Budget stress takes precedence when outcomes overlap.
  endings: [
    { id: 'fiscal', title: 'Relief with a funding gap', when: atMost('budget', 1),
      summary: 'Housing measures have used nearly all the city’s budget room. Some renters benefited, but maintaining those gains now competes sharply with other services. Review availability and quality below: spending alone does not tell you whether homes were added or maintained.' },
    { id: 'shortage', title: 'A lease worth holding onto', when: { all: [atMost('availability', 3), atMost('quality', 3)] },
      summary: 'Covered tenants have reasons to keep their leases, while people searching for housing face limited openings and declining quality. Lower rents for incumbents have not resolved scarcity. Deferred maintenance creates a further cost for future tenants and owners.' },
    { id: 'supply', title: 'More homes, a difficult transition', when: { all: [atLeast('availability', 6), atMost('relief', 4)] },
      summary: 'The city has expanded access to rental homes, but current renters experienced limited payment relief. Supply responded with a lag. The remaining challenge is how to support households with low incomes without assuming that more homes immediately solve every affordability problem.' },
    { id: 'protected', title: 'Stability for some, a wait for others', when: { all: [atLeast('relief', 5), atMost('availability', 4)] },
      summary: 'Current renters receive substantial relief, but the pool of available homes remains limited. Benefits depend on whether a household already has a lease or qualifies for assistance. The city must still confront the gap between an affordable posted rent and an obtainable home.' },
    { id: 'mixed', title: 'Room to move, work still ahead',
      summary: 'The city ends with a mixed set of gains and unresolved needs. Your indicators show which conditions improved and which bore the cost. No single policy removed the tension between current relief, access, quality, and the public budget.' }
  ],
  debrief: [
    { title: 'Efficiency and quantity', text: 'Restrictions, subsidies, and maintenance incentives affect how many homes are offered and at what resource cost. More budget spending is not itself evidence of greater efficiency.' },
    { title: 'Distribution and affordability', text: 'Incumbent tenants, newcomers, aid recipients, and property owners experience different effects. Lower payments for one group need not mean easier access for everyone.' },
    { title: 'Fiscal cost and timing', text: 'Public support shifts costs to the city budget. Construction arrives later than rent bills, so the sequence of relief, investment, and withdrawal matters.' }
  ]
};
