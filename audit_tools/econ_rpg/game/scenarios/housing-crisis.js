import housingScenes from './housing-scenes.js';
const p = text => ({ type: 'paragraph', text });
const chosen = id => ({ chosen: id });
const atLeast = (state, value) => ({ state, op: 'gte', value });
const atMost = (state, value) => ({ state, op: 'lte', value });
const exemptLeases = chosen('allocation.exempt');
const distributionRoute = [{ when: exemptLeases, target: 'distribution-open' }, { target: 'distribution-protected' }];
const pipeline = { any: [chosen('supply.reform'), chosen('supply.subsidy'), chosen('supply.exempt')] };
function distribution(open) {
  return {
    id: open ? 'distribution-open' : 'distribution-protected', title: 'A low rent, but whose home?', time: 'Month 12',
    scene: [p(open
      ? 'Existing tenants still have controlled rents, while your exemption lets rents adjust on new leases. More owners are willing to offer vacancies, but newcomers face higher payments. Developers can expect market rents on new leases; that does not give every applicant enough income to pay them.'
      : 'Incumbents who hold protected leases pay less, while newcomers wait for scarce vacancies. Owners must cover costs from controlled rents, and developers weigh expected returns. An affordable posted rent is not the same as an obtainable apartment.')],
    prompt: 'Whose immediate difficulty should receive attention?',
    choices: [
      { id: 'stability', label: 'Strengthen renewal protection for incumbent tenants', detail: 'Extend lease security for covered tenants, accepting fewer opportunities through turnover.',
        effects: { relief: 1, availability: -1 }, next: 'renewal',
        consequence: 'Longer renewal protection reduces displacement risk for covered incumbents. Fewer homes become vacant through turnover, leaving newcomers searching longer. This redistributes security and access; it does not create housing.',
        mechanism: 'Incumbent stability versus newcomer access', tradeoff: 'More security for people already housed can mean fewer openings for people still searching.',
        whatIf: 'Helping applicants navigate vacancies would focus public resources on outsiders, without promising every applicant a home.' },
      { id: 'search', label: 'Fund application and relocation help for newcomers', detail: 'Help applicants navigate vacancies and move when a suitable home becomes available.',
        effects: { budget: -1 }, next: 'renewal',
        consequence: open
          ? 'Search help makes it easier to navigate the exempt rental market, at a public cost. It creates no apartments and cannot pay every higher rent. Covered incumbents retain their lower rents without additional renewal protection.'
          : 'Search help makes the waiting and application process easier to navigate, at a public cost. It creates no apartments and cannot remove the shortage at the controlled rent. Covered incumbents retain their lower rents without additional renewal protection.',
        mechanism: 'Distribution and nonprice access costs', tradeoff: 'Assistance with searching uses funds even when the stock of homes is unchanged.',
        whatIf: 'Stronger renewal protection would have improved incumbent security while reducing turnover opportunities.' }
    ]
  };
}
export default {
  id: 'housing-crisis', version: 2, title: 'Room to Stay',
  subtitle: 'A branching price-ceiling simulation',
  sceneSet: housingScenes,
  introTitle: 'A city under a rent ceiling', stateTitle: 'City conditions', consequenceTitle: 'Policy consequences',
  role: 'Housing advisor · City of Linden', duration: 'About 10–15 minutes', decisions: 6, endingEyebrow: 'Your outcome · Two years of decisions',
  introduction: [
    p('Rapid rent increases brought political pressure for action. Linden has already imposed a binding rent ceiling below the market equilibrium rent, covering existing rentals and future rental projects. Covered tenants who keep their homes pay less. At that lower price, more households seek units and fewer units are offered: a shortage is appearing.'),
    p('You are the housing advisor brought in after the vote. Manage the consequences over two years: scarce vacancies, maintenance pressures, future construction and the different needs of incumbent tenants and newcomers. The city also has a small emergency housing fund; any additional help must compete for budget room.'),
    p('Indicators are bounded, ordinal instructional conditions, not empirical estimates. Higher means more of the named condition.')
  ],
  modelNote: 'An instructional model, not a forecast. Indicators are bounded, ordinal conditions, not dollars, percentages, or estimated policy effects. Higher means more of the named condition. Affordability tracks relief for current renters; availability tracks access for people seeking a home. Zero budget room means further commitments squeeze other services; this model does not measure debt. Values stop at 0 and 8.',
  state: {
    // Former pre-policy baseline was 2/3/5/7/3. The inherited ceiling applies
    // its first-order +3 relief, -1 availability, -1 construction incentives.
    // Quality stays 5: pressure on future repairs is not instant physical damage.
    relief: { label: 'Renter affordability', short: 'Relief for current renters', initial: 5, min: 0, max: 8 },
    availability: { label: 'Housing availability', short: 'Access for people seeking a home', initial: 2, min: 0, max: 8 },
    quality: { label: 'Housing quality', short: 'Maintenance of existing homes; controlled revenue puts future repairs under pressure', initial: 5, min: 0, max: 8 },
    budget: { label: 'Budget room', short: 'Capacity for further commitments', initial: 7, min: 0, max: 8 },
    building: { label: 'Construction incentive', short: 'Willingness to add rental homes', initial: 2, min: 0, max: 8 }
  },
  start: 'allocation',
  metadata: { concept: 'Binding price ceilings and housing markets', learningObjective: 'Manage the shortage, maintenance, supply and distributional consequences of an inherited binding rent ceiling.', misconception: 'Lower posted rents guarantee that all households can obtain housing.' },
  nodes: [
    {
      id: 'allocation', title: 'Who gets the vacant apartment?', time: 'Month 1',
      scene: [p('Lower advertised rents have drawn more applicants. Families report long searches and inconsistent screening. A cheap lease is valuable, but not everyone can get one.')],
      prompt: 'How should scarce vacancies be allocated?',
      choices: [
        { id: 'registry', label: 'Create a transparent vacancy lottery', detail: 'Use a transparent lottery for participating vacant units at the controlled rent.', effects: { budget: -1 }, next: 'maintenance',
          consequence: 'The ceiling lowered covered rents, but requests exceed available units. A transparent lottery makes access less dependent on connections, at an administrative cost. It changes who receives a scarce apartment; it does not eliminate the shortage at the controlled price.',
          mechanism: 'Nonprice rationing', tradeoff: 'A more transparent allocation rule cannot remove the underlying shortage.',
          whatIf: 'Exempting new leases would have encouraged turnover, but new tenants would have faced market rents.' },
        { id: 'exempt', label: 'Exempt new leases from the ceiling', detail: 'Keep existing tenants covered; let rents adjust on new leases, including new construction.', effects: { relief: -1, availability: 1, building: 1 }, next: 'maintenance',
          consequence: 'Vacancy decontrol makes offering a home more attractive, so more existing units enter the market in this model. Existing covered leases retain the ceiling, while new tenants face market rents. Developers can expect adjustable rents on new leases, but no new homes have been built yet.',
          mechanism: 'Supply incentives and distribution across cohorts', tradeoff: 'Improved access comes with higher rents for new tenants.',
          whatIf: 'A vacancy lottery would have kept more rents low while leaving the shortage largely unchanged.' }
      ]
    },
    {
      id: 'maintenance', title: 'Keeping homes habitable', time: 'Month 6', unavailableNote: 'Repair grants require at least 2 steps of budget room. Earlier commitments have left too little capacity.',
      scene: [p('Repair costs have risen. In buildings still under the ceiling, owners cannot recover those costs through higher controlled rents, and some defer repairs. This pressure is not a claim that every owner stops maintaining property. Tenants need protection, but enforcement alone cannot pay for every repair.')],
      prompt: 'What is your maintenance policy?',
      choices: [
        { id: 'inspect', label: 'Expand inspections and require repairs', detail: 'Enforce habitability standards through a larger inspection team.', effects: { budget: -1, availability: -1 }, next: 'supply',
          consequence: 'Inspections prevent some deterioration, but the ceiling limits revenue to cover rising costs. Some owners withdraw marginal units rather than undertake required repairs. Quality holds steady overall while fewer units remain available.',
          mechanism: 'Maintenance incentives and compliance costs', tradeoff: 'Enforcing standards protects tenants, but marginal units may be withdrawn.',
          whatIf: 'Repair grants could have supported quality with fewer withdrawals, while drawing more heavily on the budget.' },
        { id: 'grants', label: 'Offer conditional repair grants', detail: 'Help fund repairs in exchange for continued rental availability.', when: atLeast('budget', 2), effects: { quality: 2, budget: -2 }, next: 'supply',
          consequence: 'Grants offset some repair costs that controlled rents cannot cover. Participating owners maintain homes and agree to keep them in rental use. Quality improves, but these are existing apartments, not new units. The ceiling remains and the city has less money for other programs.',
          mechanism: 'Conditional producer subsidy', tradeoff: 'Improved quality uses funds that could support renters or new supply.',
          whatIf: 'Inspections alone would have cost less publicly, but owners would have had to absorb more of the repair cost.' },
        { id: 'phase', label: 'Phase in repair requirements', detail: 'Keep urgent safety rules; give owners longer to complete other repairs.', effects: { quality: -2 }, next: 'supply',
          consequence: 'Owners get more time, but limited controlled rental revenue still weakens the incentive to complete some repairs. Deferred work accumulates in covered buildings. The city preserves funds while tenants live with declining quality.',
          mechanism: 'Intertemporal tradeoff and maintenance incentives', tradeoff: 'Lower current costs can mean worse housing conditions now and larger repairs later.',
          whatIf: 'Repair grants would have improved conditions sooner, at an immediate public cost.' }
      ]
    },
    {
      id: 'supply', title: 'Homes that are not here yet', time: 'Month 9', unavailableNote: 'An exemption for new construction is offered only if new leases are still controlled. Co-funding requires at least 3 steps of budget room.',
      scene: [p('Builders propose apartments near existing transport. Zoning limits density, permits take time, and infrastructure needs funding. Controlled rents also limit expected returns unless new leases are exempt. Even approved projects will not house anyone immediately.')],
      prompt: 'Which obstacle should the city tackle?',
      choices: [
        { id: 'reform', label: 'Allow more homes and simplify permits', detail: 'Permit small apartment buildings and fund planning capacity.', effects: { building: 3, budget: -1 }, next: distributionRoute,
          consequence: 'More projects become feasible when density limits and delays ease. Construction incentives strengthen, but tenants see no immediate increase in completed homes. Where the ceiling still covers new units, lower expected returns limit how much building follows. Infrastructure demand and neighborhood adjustment accompany construction.',
          mechanism: 'Supply restrictions and construction lags', tradeoff: 'Future capacity requires adjustment and offers little immediate rent relief.',
          whatIf: 'A construction subsidy could have added a stronger financial incentive, but only with sufficient budget room.' },
        { id: 'subsidy', label: 'Co-fund new mixed-rent apartments', detail: 'Pair limited zoning flexibility with support for reserved lower-rent homes.', when: atLeast('budget', 3), effects: { building: 3, budget: -3 }, next: distributionRoute,
          consequence: 'Public support makes a set of mixed-rent projects feasible, including homes reserved for lower-income renters. Completion still takes time. The commitment uses a large share of remaining funds and may support some investment that would have happened anyway.',
          mechanism: 'Supply subsidy and additionality', tradeoff: 'Reserved affordable homes require fiscal resources and careful targeting of projects.',
          whatIf: 'Permitting reform alone would have preserved more funds but provided no reserved lower-rent units.' },
        { id: 'exempt', label: 'Exempt new construction from the rent ceiling', detail: 'Let newly built homes charge market rents while keeping existing covered leases protected.', when: { not: exemptLeases }, effects: { building: 2 }, next: distributionRoute,
          consequence: 'Future new buildings can charge market rents, strengthening expected returns relative to keeping them controlled. Existing tenants keep their protection. Permitting and building still take time, so no apartments appear immediately; future newcomers may face higher rents.',
          mechanism: 'New-construction exemption and expected returns', tradeoff: 'Stronger future supply incentives come with less rent protection in newly built homes.',
          whatIf: 'Keeping new construction controlled would preserve its future rent cap, but reduce the incentive to build it.' },
        { id: 'retain', label: 'Retain current development limits', detail: 'Avoid new infrastructure commitments while reviewing growth plans.', effects: {}, next: distributionRoute,
          consequence: 'The city avoids immediate planning and infrastructure commitments. Existing restrictions continue to limit feasible projects. With demand still strong, the shortage of new homes remains a constraint on every affordability measure.',
          mechanism: 'Constrained long-run supply', tradeoff: 'Avoiding near-term adjustment limits future housing options.',
          whatIf: 'Allowing greater density would have improved future supply incentives, while requiring the city to manage growth.' }
      ]
    },
    distribution(false),
    distribution(true),
    {
      id: 'renewal', title: 'Help layered on the ceiling', time: 'Month 18',
      scene: [p('The ceiling reduced covered rents, but access and payment problems remain. Existing emergency aid is limited. Consider support layered on the ceiling for eligible households still unable to secure or afford a home. New construction, if encouraged, is still underway.')],
      variants: [{ when: atMost('budget', 2), scene: [p('Very little budget room remains. The ceiling still protects covered rents, but shortages and income gaps persist. Additional aid would squeeze other services. Projects underway still need time to offer homes.')] }],
      prompt: 'How should the city handle the next year?',
      choices: [
        { id: 'renew', label: 'Fund a broader round of targeted rental assistance', detail: 'Help eligible renters meet payments while retaining the ceiling on covered leases.', effects: { relief: 2, budget: -2 }, next: 'review',
          consequence: 'Assistance helps eligible renters meet payments in addition to the ceiling’s protection. It does not create vacancies or guarantee a lease. Extra purchasing power may raise rents in exempt segments; controlled units remain rationed. Recurring costs reduce funds for other services.',
          mechanism: 'Recurring fiscal commitments', tradeoff: 'Continuity for recipients competes with other uses of public funds.',
          whatIf: 'Tapering support would have reduced future commitments but exposed recipients to a larger rent burden.' },
        { id: 'bridge', label: 'Offer temporary eviction-prevention grants', detail: 'Cover urgent arrears for a narrower group while keeping covered rents controlled.', effects: { relief: 1, budget: -1 }, next: 'review',
          consequence: 'Temporary grants prevent some immediate displacements on top of the ceiling’s payment relief. They do not create apartments or resolve recurring income shortfalls. Narrower coverage preserves more funds than broader assistance but leaves other households without help.',
          mechanism: 'Targeted mitigation and fiscal opportunity cost', tradeoff: 'Urgent stability for a smaller group leaves other renters and newcomers exposed.',
          whatIf: 'Broader assistance would have reached more households while consuming more budget room.' },
        { id: 'taper', label: 'Taper support with advance notice', detail: 'Reduce the next allocation and give recipients time to plan.', effects: { relief: -1, budget: 1 }, next: 'review',
          consequence: 'The ceiling remains on covered leases. Smaller emergency-aid commitments restore some budget room. Recipients must cover more of their own housing costs before new homes necessarily arrive. The timing of relief and construction now matters as much as the policy choice itself.',
          mechanism: 'Timing mismatch between relief and supply', tradeoff: 'Fiscal flexibility improves while short-run affordability worsens.',
          whatIf: 'Renewing support would have softened the transition but left less capacity for other services.' }
      ]
    },
    {
      id: 'review', title: 'Two years later', time: 'Month 24',
      scene: [p('The task force must set its next priority. Earlier choices determine whether builders have projects to finish and whether the city can keep financing support.')],
      variants: [
        { when: pipeline, scene: [p('Projects encouraged last year are reaching completion. Access will improve as homes open, although costs and existing rent rules still affect how much developers deliver. Current renters may need help before those gains reach them.')] },
        { when: chosen('supply.retain'), scene: [p('Protected tenants retain lower rents, but applicants still compete for scarce openings. With development limits unchanged, the city cannot rely on a wave of new homes to resolve the shortage.')] }
      ],
      prompt: 'What should guide the next phase?',
      choices: [
        { id: 'access', label: 'Prioritize access to more rental homes', detail: 'Ease remaining entry barriers and help projects or vacant units enter the market.', effects: { availability: 1, building: 1 }, next: '$end',
          consequence: 'Easier entry brings some additional homes into rental use. Without a strong construction pipeline, the gain is modest. More access does not guarantee that the lowest-income renters can afford the available units.',
          outcomes: [
            { when: { all: [chosen('supply.reform'), { not: exemptLeases }] }, effects: { availability: 1 }, consequence: 'Some projects enabled by permit reform open, though the ceiling limits expected returns and reduces the response. Entry barriers ease and access improves somewhat. Low posted rents still leave more applicants than homes in parts of the market.' },
            { when: chosen('supply.reform'), effects: { availability: 3 }, consequence: 'Projects enabled by earlier permit reform open, alongside additional units drawn into rental use. The larger stock improves access and eases competition for housing. Households with the least income still face difficult rent payments.' },
            { when: chosen('supply.subsidy'), effects: { availability: 3, relief: 1 }, consequence: 'The co-funded apartments open, including reserved lower-rent homes. Access expands and some eligible renters receive additional relief. Those homes reflect an earlier public commitment that still limits fiscal flexibility.' },
            { when: chosen('supply.exempt'), effects: { availability: 2 }, consequence: 'Projects encouraged by the new-construction exemption now open. Expected market rents made some building viable despite remaining development constraints. Access improves after the lag, but these new homes lack the rent cap that protects existing covered tenants.' }
          ],
          mechanism: 'Long-run supply response and policy interaction', tradeoff: 'More homes improve access; income differences still shape who can afford them.',
          whatIf: 'Prioritizing current renters would have offered more immediate relief but a smaller improvement in access.' },
        { id: 'protect', label: 'Prioritize stability for current renters', detail: 'Commit another round of focused help as the market adjusts.', effects: { relief: 1, budget: -1 }, next: '$end',
          consequence: 'Focused help reduces the burden on current recipients. With no new construction pipeline, people seeking a home still face limited options. Relief and access remain separate challenges.',
          outcomes: [
            { when: { all: [chosen('supply.reform'), { not: exemptLeases }] }, effects: { availability: 1 }, consequence: 'Focused help cushions current renters while some approved homes open. The ceiling limits returns, so construction responds less strongly than it otherwise would in this model. Access improves modestly, and support still uses public funds.' },
            { when: chosen('supply.reform'), effects: { availability: 2 }, consequence: 'Focused help cushions current renters as projects enabled by permit reform open. New homes improve access, while assistance addresses the income gap that additional supply alone cannot immediately close. Both gains leave questions about future funding and infrastructure.' },
            { when: chosen('supply.subsidy'), effects: { availability: 2, relief: 1 }, consequence: 'Co-funded homes open and targeted help supports current renters. More households benefit from lower-rent options, but the combined commitments leave less public money for other needs. The supply gain is real within this model, and so is its fiscal tradeoff.' },
            { when: chosen('supply.exempt'), effects: { availability: 2 }, consequence: 'Newly built, exempt homes open after the construction lag. Focused help cushions current renters, and existing covered tenants retain the ceiling. More homes improve access, but newcomers to these buildings face market rents and support still costs public money.' }
          ],
          mechanism: 'Distribution, supply, and fiscal cost', tradeoff: 'Stability for recipients uses funds and may leave outsiders searching longer.',
          whatIf: 'Prioritizing entry would have added more available units but offered less direct help with current payments.' }
      ]
    }
  ],
  // First match wins. Budget stress takes precedence when outcomes overlap.
  endings: [
    { id: 'fiscal', title: 'Relief with a funding gap', when: atMost('budget', 1),
      summary: 'Measures layered on the inherited rent ceiling have used nearly all the city’s budget room. Covered tenants and aid recipients benefited, but maintaining those gains now competes sharply with other services. Review availability and quality below: spending alone does not tell you whether homes were added or maintained.' },
    { id: 'shortage', title: 'A lease worth holding onto', when: { all: [atMost('availability', 3), atMost('quality', 3)] },
      summary: 'Covered tenants have reasons to keep their leases, while people searching for housing face limited openings and declining quality. Lower rents for incumbents have not resolved scarcity. Deferred maintenance creates a further cost for future tenants and owners.' },
    { id: 'supply', title: 'More homes, a difficult transition', when: { all: [atLeast('availability', 6), atMost('relief', 4)] },
      summary: 'The city has expanded access to rental homes after the initial ceiling-induced shortage, but some initial payment relief was reduced by exemptions or withdrawal of aid. Supply responded with a lag. The remaining challenge is how to support households with low incomes without assuming that more homes immediately solve every affordability problem.' },
    { id: 'protected', title: 'Stability for some, a wait for others', when: { all: [atLeast('relief', 5), atMost('availability', 4)] },
      summary: 'Current renters receive substantial relief, but the pool of available homes remains limited. Benefits depend on whether a household already has a lease or qualifies for assistance. The city must still confront the gap between an affordable posted rent and an obtainable home.' },
    { id: 'mixed', title: 'Room to move, work still ahead',
      summary: 'The city ends with a mixed set of gains and unresolved needs after managing the inherited rent ceiling. Your indicators show which conditions improved and which bore the cost. No single response removed the tension between covered tenants’ relief, newcomer access, quality, and the public budget.' }
  ],
  debrief: [
    { title: 'A lower rent and a shortage', text: 'The binding ceiling was already below the equilibrium rent when you arrived. Covered rents fell, quantity demanded rose and quantity supplied fell: Qd exceeded Qs. A lottery can make rationing more transparent without creating apartments. Later exemptions and supply responses can change the market, but the initial payment relief never guaranteed a home to every applicant.' },
    { title: 'Maintenance and future supply', text: 'Controlled rents limit recovery of rising costs, putting pressure on some owners’ maintenance and developers’ expected returns. Inspections, repair grants, permitting reform and construction support address different constraints. Repairs improve existing homes; new-construction exemptions strengthen future incentives without producing homes immediately. Your construction choices delivered only after a lag.' },
    { title: 'Distribution and affordability', text: 'Covered incumbents benefit from lower rents and stability. Newcomers face rationing or higher rents on exempt leases; owners and developers face different returns. Aid recipients may gain help that other households do not receive. Lower payments for one group need not mean easier access for everyone.' },
    { title: 'Fiscal cost and timing', text: 'Mitigation layered on the ceiling shifts costs to the city budget. More spending is not proof of additional housing: some subsidized construction would have happened anyway. Construction arrives later than rent bills, so the sequence of relief, investment, and withdrawal matters.' }
  ]
};
