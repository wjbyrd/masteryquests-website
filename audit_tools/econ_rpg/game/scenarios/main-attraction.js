import sceneSet from './main-attraction-scenes.js';
const p = text => ({ type: 'paragraph', text });
const chosen = id => ({ chosen: id });
const gte = (state, value) => ({ state, op: 'gte', value });
const lte = (state, value) => ({ state, op: 'lte', value });
const all = (...conditions) => ({ all: conditions });
const sum = (...effects) => effects.reduce((result, effect) => {
  for (const [key, value] of Object.entries(effect)) result[key] = (result[key] || 0) + value;
  return result;
}, {});

// Author two reconverging versions of the queue decision using the same schema.
function flow(busy) {
  return {
    id: busy ? 'busy-midway' : 'steady-midway', title: busy ? 'A full midway' : 'Room between the rides', time: 'Early summer',
    scene: [p(busy
      ? 'Lower admission has filled the paths, but ride throughput has not changed. Another ticket brings revenue and staffing costs; it also adds waiting time for guests already inside.'
      : 'The park has room for the expected visitors, although popular rides still have queues at midday. Management can limit admissions, sell faster queue access, or keep admitting walk-up visitors.')],
    prompt: 'How should the park manage its busiest hours?',
    choices: [
      { id: 'reserve', label: 'Limit daily admissions with reservations', detail: 'Sell fewer tickets on busy dates to protect time inside the park.',
        effects: { earnings: -1, access: -1, experience: busy ? 2 : 1 }, next: 'segments',
        consequence: 'Reservations shorten queues and make a visit more predictable. Some willing customers cannot obtain a place, costing the park ticket sales and earnings. The existing rides serve fewer people rather than gaining new capacity.',
        mechanism: 'Capacity rationing and congestion',
        tradeoff: 'Guests admitted get more useful ride time; customers without a reservation lose access and the park sells fewer tickets.',
        whatIf: 'Open admissions would sell more tickets, at the cost of longer waits for guests already inside.' },
      { id: 'priority', label: 'Offer a paid priority-access pass', detail: 'Keep general admission and sell a limited faster-queue option.',
        effects: { earnings: busy ? 2 : 1, access: -1, experience: busy ? -1 : 0 }, next: 'segments',
        consequence: busy
          ? 'Guests willing to pay to avoid waiting buy priority passes, raising earnings. The same ride seats now serve two queues, so ordinary-ticket visitors wait longer and complete fewer rides. Selling priority earns more without adding capacity.'
          : 'Some guests pay to shorten their wait, adding earnings without a general admission increase. Ordinary-ticket visitors get a smaller share of the busiest ride slots. The park has sold different waiting times, not built more ride capacity.',
        mechanism: 'Self-selection and service differentiation',
        tradeoff: 'Priority buyers gain time and the park gains income; ordinary admission provides less practical access to popular rides.',
        whatIf: 'Reservations would shorten queues for everyone admitted, but the park would sell fewer tickets.' },
      { id: 'open', label: 'Keep general queues and walk-up admission', detail: 'Accept more visitors and cover the extra operating shifts.',
        effects: { earnings: 1, access: 1, experience: busy ? -2 : -1, ...(busy ? { capacity: -1 } : {}) }, next: 'segments',
        consequence: busy
          ? 'Extra ticket receipts more than cover the additional staffing costs. Long queues reduce the rides each guest can enjoy, and heavy use takes some equipment out of rotation. A profitable extra admission can still impose waiting costs on other visitors.'
          : 'More customers can visit without planning ahead, and extra receipts exceed the cost of added operating shifts this season. Queues grow at the most popular rides. Earnings from another guest do not account for the extra waiting time that guest imposes on others.',
        mechanism: 'Marginal revenue, marginal operating cost and congestion spillovers',
        tradeoff: 'More people can enter and the park earns more, but guests spend more of their visit waiting.',
        whatIf: 'Selling fewer reserved places would protect visit quality, at the cost of excluding some willing customers.' }
    ]
  };
}

// Final review delivers earlier commitments once. These are authored data combinations,
// not a second transition engine: the shared engine adds one matching outcome's effects.
const repairs = [
  { id: 'overhaul', effects: { capacity: 1, experience: 2, earnings: 1 }, text: 'The overhauled signature ride reopens, restoring capacity and reducing costly interruptions.' },
  { id: 'partial', effects: {}, text: 'Partial repairs keep the signature ride operating, though a larger overhaul is still due.' },
  { id: 'defer', effects: { capacity: -1, experience: -2, earnings: -1, power: -1 }, text: 'Deferred work now causes closures and patching costs, reducing capacity and giving guests less reason to pay for another visit.' }
];
const investments = [
  { id: 'expand', effects: { capacity: 3, experience: 1, power: 1 }, text: 'The new attraction opens for the following season, adding ride capacity and a reason to choose the park.' },
  { id: 'throughput', effects: { capacity: 1, experience: 1 }, text: 'The remaining loading improvements let existing rides serve more guests, without adding a new attraction.' },
  { id: 'hold', effects: {}, text: 'Without expansion, the park still relies on pricing and admission rules to manage use of its existing rides.' }
];
function reviewOutcomes(response) {
  return repairs.flatMap(repair => investments.map(investment => ({
    when: all(chosen(`maintenance.${repair.id}`), chosen(`investment.${investment.id}`)),
    effects: sum(repair.effects, investment.effects),
    consequence: `${response} ${repair.text} ${investment.text}`
  })));
}

export default {
  id: 'main-attraction', version: 1, title: 'The Main Attraction',
  subtitle: 'A branching monopoly and market-power scenario',
  role: 'General manager · Starhaven Park', introTitle: 'The coming season', stateTitle: 'Park conditions',
  consequenceTitle: 'Operating consequences', endingEyebrow: 'Your outcome · The following season',
  duration: 'About 10–15 minutes', decisions: 6, sceneSet,
  introduction: [
    p('Starhaven Park is the region’s dominant amusement park. Its established rides, reputation and scarce riverside land would be expensive to replicate. The business is healthy, but its busiest rides are nearing capacity.'),
    p('As general manager, make pricing and investment decisions for this season and the next. Families can still choose festivals, smaller attractions, travel or a day at home.')
  ],
  metadata: {
    concept: 'Monopoly market power, pricing/output, elasticity, price discrimination and long-run investment',
    learningObjective: 'Evaluate monopoly pricing, capacity, investment, and segmentation decisions by tracing their effects on firm outcomes and consumer access.',
    mechanism: 'Downward-sloping demand, marginal revenue and cost, segmentation, congestion, entry barriers and substitutes',
    misconception: 'A dominant firm can raise prices without losing customers, and one strategy must maximize every stakeholder outcome.'
  },
  state: {
    earnings: { label: 'Park earnings', short: 'Funds left from operations after spending decisions', initial: 5, min: 0, max: 8 },
    access: { label: 'Guest access', short: 'Ability to afford admission and use the park', initial: 4, min: 0, max: 8 },
    experience: { label: 'Guest experience', short: 'Waiting, service and visit quality', initial: 5, min: 0, max: 8 },
    capacity: { label: 'Park capacity', short: 'Ability to serve guests without excess congestion', initial: 4, min: 0, max: 8 },
    power: { label: 'Market power', short: 'Ability to sustain higher prices through differentiation and limited substitutes', initial: 6, min: 0, max: 8 }
  },
  start: 'admission',
  nodes: [
    { id: 'admission', title: 'The price of a day out', time: 'Spring',
      scene: [p('Advance interest is strong. Booking research suggests the core audience is relatively insensitive to a modest price change this season, but some families are already comparing cheaper outings. A larger crowd would need extra staff and the same finite number of ride seats.')],
      prompt: 'What admission price should the park charge this season?',
      choices: [
        { id: 'raise', label: 'Raise the admission price', detail: 'Seek a larger margin per visit and accept lower attendance.', effects: { earnings: 1, access: -2, experience: 1 }, next: 'steady-midway',
          consequence: 'Fewer families buy tickets, leaving shorter queues. This season, the higher price per ticket more than offsets the drop in sales, and operating earnings rise. That result depends on relatively inelastic demand; stronger substitutes could reverse it.',
          mechanism: 'Downward-sloping demand and elasticity',
          tradeoff: 'The park earns more and admitted guests wait less, while more price-sensitive households choose other outings.',
          whatIf: 'Lower admission would attract more families, but their extra purchases would not offset the price cut this season.' },
        { id: 'hold', label: 'Keep the current admission price', detail: 'Keep the existing balance of attendance and margin per guest.', effects: { earnings: 1 }, next: 'steady-midway',
          consequence: 'At the familiar price, the park attracts a similar mix of guests and adds to earnings over the season. Popular rides still bottleneck at busy hours. Holding the price leaves both attendance and margin largely unchanged, along with the need to manage queues.',
          mechanism: 'Demand uncertainty and the price–quantity tradeoff',
          tradeoff: 'A predictable offer avoids a sharp change in access, but leaves the existing capacity constraint unresolved.',
          whatIf: 'A price increase would trade some attendance for margin; its effect on receipts would depend on how strongly demand responds.' },
        { id: 'lower', label: 'Lower the admission price', detail: 'Reach more households and prepare for heavier use of the park.', effects: { earnings: -1, access: 2, experience: -2 }, next: 'busy-midway',
          consequence: 'More families visit, but the extra sales do not offset the lower price per ticket this season. Extra operating shifts further reduce earnings. More households can afford admission; longer queues now make managing capacity more urgent.',
          mechanism: 'Inelastic demand, total revenue and marginal operating costs',
          tradeoff: 'A broader group can afford the park, but lower retained earnings and crowded rides limit what management can do next.',
          whatIf: 'Keeping the price would preserve more surplus for repairs or expansion, with fewer households able to visit.' }
      ] },
    flow(false), flow(true),
    { id: 'segments', title: 'Different guests, different dates', time: 'Midsummer',
      scene: [p('Some families can visit only on weekends; others can choose quieter weekdays. Tickets tied to a date and passes issued to one person can limit resale. Different prices could attract more guests or earn more from busy dates, but checking eligibility and administering discounts cost money.')],
      prompt: 'How should admission vary across customers or time?',
      choices: [
        { id: 'single', label: 'Keep one admission price', detail: 'Charge the same admission price across dates and customer groups.', effects: { earnings: 1 }, next: 'maintenance',
          consequence: 'One price is easy to understand and inexpensive to administer, leaving more earnings for the park. Some customers would pay more; others still find a ticket too expensive. A single price cannot capture those differences in willingness to pay.',
          mechanism: 'Uniform pricing and willingness to pay',
          tradeoff: 'Simplicity avoids segmentation costs, but does not expand access for price-sensitive groups or smooth peak demand.',
          whatIf: 'Dated off-peak discounts could reach flexible visitors without lowering every peak-date ticket.' },
        { id: 'dates', label: 'Use peak and off-peak prices', detail: 'Charge more on busy dates and discount quieter days with dated tickets.', effects: { access: 1, experience: 1 }, next: 'maintenance',
          consequence: 'Visitors with flexible schedules move to cheaper dates, making admission more affordable and easing peak queues. Higher peak receipts offset discounts and administration this season, leaving earnings unchanged. Dated tickets limit resale; different prices reflect both price sensitivity and congestion costs.',
          mechanism: 'Time-based price discrimination, elasticity and peak-load pricing',
          tradeoff: 'Flexible households gain a cheaper option, while families tied to peak dates face higher prices.',
          whatIf: 'A single price would avoid date restrictions, but would give up both demand shifting and the higher peak-date margin.' },
        { id: 'members', label: 'Offer off-peak memberships to local residents', detail: 'Issue passes to named residents for repeat weekday visits; keep regular tickets for other guests.', effects: { access: 2, experience: -1 }, next: 'maintenance',
          outcomes: [{ when: chosen('admission.raise'), effects: { earnings: 1 }, consequence: 'Memberships bring price-sensitive locals back without lowering regular ticket prices. Passes tied to a named resident and off-peak dates limit resale. This season, added spending exceeds the cost of discounts and administration, raising earnings, though repeat visits add waiting at popular rides.' }],
          consequence: 'More local households can visit repeatedly, including some who would have bought full-price tickets. Added spending offsets those discounts and administration this season, leaving earnings unchanged. Passes tied to a named resident and off-peak dates limit resale, but repeat visits add waiting at popular rides.',
          mechanism: 'Group segmentation, resale limits and cannibalization of full-price sales',
          tradeoff: 'Membership broadens access for an eligible group, but discounts can replace existing sales and create more demand for ride time.',
          whatIf: 'Peak/off-peak tickets would offer cheaper dates to more households, without the repeat visits included in a membership.' }
      ] },
    { id: 'maintenance', title: 'The signature ride', time: 'Late summer',
      scene: [p('The signature coaster needs an overhaul to maintain reliability. Engineers permit continued operation with inspections and occasional closures; unsafe operation is not an option. Closing now loses ride time in the busy season, while delaying leaves a larger operating problem for next year.')],
      variants: [{ when: chosen('admission.lower'), scene: [p('Heavy use after the admission discount has accelerated wear on the signature coaster. Engineers permit continued operation with inspections and occasional closures, but deferral will be particularly disruptive. An immediate overhaul would also remove scarce ride capacity during a busy season.')] }],
      prompt: 'When should the park do the major work?',
      unavailableNote: 'The full overhaul requires 4 earnings steps: 3 committed to the work and 1 retained for operations. Partial repairs or inspected deferral remain available.',
      choices: [
        { id: 'overhaul', label: 'Close now for a full overhaul', detail: 'Pay for major repairs and temporarily take the ride out of service.', when: gte('earnings', 4), effects: { earnings: -3, capacity: -1 }, next: 'investment',
          consequence: 'The overhaul uses funds from operations and closes the coaster, reducing capacity. Guests must use the remaining attractions until it reopens next season. Paying for repairs now leaves less money for a separate expansion.',
          mechanism: 'Intertemporal maintenance and opportunity cost',
          tradeoff: 'Future reliability improves at the cost of current ride time and funds that could support a new attraction.',
          whatIf: 'Partial repairs would leave more funds and ride time available now, but more major work would remain for later.' },
        { id: 'defer', label: 'Defer the major overhaul', detail: 'Keep operating under inspections and fund only required work this season.', effects: { earnings: 1, experience: -1 }, next: 'investment',
          outcomes: [{ when: chosen('admission.lower'), effects: { experience: -1 }, consequence: 'Keeping the ride open maintains ticket receipts and capacity. Heavy use this season leads to more stoppages and worn facilities, making visits less enjoyable. Next season’s closures and patching costs will remain even if management builds another attraction.' }],
          consequence: 'The coaster stays open under inspection, maintaining ticket receipts and capacity. Short stoppages and visible wear reduce visit quality. Next season still brings closures and patching costs; a new attraction would not repair the old one.',
          mechanism: 'Deferred maintenance and future operating costs',
          tradeoff: 'More funds and ride capacity are available now, at the cost of worse conditions for guests and more repair costs later.',
          whatIf: 'An immediate overhaul would remove ride capacity now but avoid the added closures and patching costs next season.' },
        { id: 'partial', label: 'Make partial repairs during short closures', detail: 'Address the most disruptive problems and retain funds for other uses.', effects: { earnings: -1, experience: 1 }, next: 'investment',
          consequence: 'Short closures fix the most disruptive defects and improve visits. Repairs cost less than a full overhaul and leave normal seasonal capacity intact. Major work is still due later.',
          mechanism: 'Marginal repair benefits and opportunity cost',
          tradeoff: 'Moderate spending protects today’s experience, but leaves part of the future maintenance bill outstanding.',
          whatIf: 'A full overhaul would require more funds now in exchange for a stronger reliability gain next season.' }
      ] },
    { id: 'investment', title: 'Investing in capacity', time: 'Autumn planning',
      scene: [p('Land beside the service area can support a major new attraction. Construction would use funds from operations now; the ride would open next season. Smaller loading and staffing improvements could serve more guests sooner, without adding a new attraction.')],
      prompt: 'How should the park invest in capacity?',
      unavailableNote: 'The major expansion requires 4 earnings steps: 3 for construction and 1 retained for operations. Earlier commitments leave too little; throughput improvements and holding capacity remain available.',
      choices: [
        { id: 'expand', label: 'Build a major new attraction', detail: 'Use retained funds for construction that opens next season.', when: gte('earnings', 4), effects: { earnings: -3 }, next: 'competition',
          consequence: 'Construction begins beside the service area, using funds the park could have spent elsewhere. Usable capacity does not increase yet. The new ride will add capacity and another reason to visit next season, but the park must pay before it knows how many guests will come.',
          mechanism: 'Fixed investment and construction lag',
          tradeoff: 'The park gives up current financial flexibility for future ride capacity and a new reason to visit.',
          whatIf: 'Throughput improvements would cost less and deliver some capacity sooner, but would add less differentiation.' },
        { id: 'throughput', label: 'Improve loading and ride throughput', detail: 'Upgrade boarding processes now and complete the remaining work before next season.', effects: { earnings: -1, capacity: 1 }, next: 'competition',
          consequence: 'Faster boarding and better-timed departures let existing rides serve more guests now. The work costs less than a new attraction, with further improvements due next season. It makes better use of existing rides but adds no new attraction to advertise.',
          mechanism: 'Incremental capacity investment and marginal productivity',
          tradeoff: 'Capacity increases at lower cost, but the same rides must still persuade guests to choose the park.',
          whatIf: 'A new attraction would require more funds and a wait for completion, but could change both capacity and willingness to visit.' },
        { id: 'hold', label: 'Keep existing capacity and save the funds', detail: 'Use pricing and admission rules to manage demand for the existing rides.', effects: { earnings: 1, power: -1 }, next: 'competition',
          consequence: 'Saving this season’s earnings leaves more funds available for later needs. The park adds neither capacity nor a new attraction. With fewer new reasons for guests to choose Starhaven, management must rely more on pricing and admission rules.',
          mechanism: 'Opportunity cost of capital and the erosion of differentiation',
          tradeoff: 'The park has more funds available, but no extra ride capacity or new attraction to help it compete.',
          whatIf: 'Incremental throughput work would exchange some retained surplus for more ride time without the full cost of expansion.' }
      ] },
    { id: 'competition', title: 'A new competitor', time: 'Next-season bookings',
      scene: [p('A regional entertainment development has secured financing. Festivals and smaller attractions already compete for families’ leisure budgets. Booking research suggests guests are becoming more price-sensitive, but entry takes land, capital and time: Starhaven’s established rides and reputation can still support substantial market power.')],
      variants: [{ when: chosen('investment.expand'), scene: [p('Starhaven’s new attraction is nearly complete as a rival entertainment development secures financing. The expansion and earlier repair decisions will affect the coming season. More alternatives make bookings more price-sensitive than last spring, but Starhaven’s distinctive rides and reputation can still support substantial market power.')] }],
      prompt: 'How should the park respond for the coming season?',
      unavailableNote: 'New entertainment and premium service require at least 1 earnings step. Lower-priced packages or keeping existing prices and services remain available.',
      choices: [
        { id: 'broaden', label: 'Broaden access with lower-priced packages', detail: 'Trade margin for a wider customer base as substitutes improve.', effects: { earnings: -1, access: 2, experience: -1, power: -1 }, next: '$end',
          consequence: 'Lower-priced packages help keep guests from choosing substitutes, at the cost of lower margins and longer queues. More competition reduces pricing power without necessarily removing it.',
          outcomes: reviewOutcomes('Lower-priced packages help keep guests from choosing substitutes, at the cost of lower margins and longer queues. More competition reduces pricing power without necessarily removing it.'),
          mechanism: 'Substitute competition and demand elasticity',
          tradeoff: 'More households can use the park, but price concessions cost margin and any remaining congestion limits the experience.',
          whatIf: 'Better service could support higher prices, but would cost money and reach fewer price-sensitive households.' },
        { id: 'differentiate', label: 'Strengthen the premium experience', detail: 'Pay for distinctive entertainment and better service to support higher prices.', when: gte('earnings', 1), effects: { earnings: -1, access: -1, experience: 1 }, next: '$end',
          consequence: 'New entertainment and better service cost money but give some guests a reason to pay more. These differences help sustain pricing power despite increased competition, serving a narrower audience.',
          outcomes: reviewOutcomes('New entertainment and better service cost money but give some guests a reason to pay more. These differences help sustain pricing power despite increased competition, serving a narrower audience.'),
          mechanism: 'Product differentiation and market power',
          tradeoff: 'Some guests will pay more for a better experience; others choose cheaper outings. Providing that service uses funds the park could spend elsewhere.',
          whatIf: 'Broader packages would reach more price-sensitive households, at the cost of margin and heavier use of ride capacity.' },
        { id: 'course', label: 'Keep existing prices and services', detail: 'Save the funds and accept the risk of losing guests to other destinations.', effects: { earnings: 1, power: -2 }, next: '$end',
          consequence: 'Keeping prices and services unchanged saves money, but pricing power falls more as guests consider other destinations. Established attractions and barriers to entry still limit how much competition can change at once.',
          outcomes: reviewOutcomes('Keeping prices and services unchanged saves money, but pricing power falls more as guests consider other destinations. Established attractions and barriers to entry still limit how much competition can change at once.'),
          mechanism: 'Entry barriers and contestability',
          tradeoff: 'More funds remain available, but the park risks losing guests as other destinations become more appealing.',
          whatIf: 'Better service could help distinguish the park, but would cost money before the rival’s effect on bookings is known.' }
      ] }
  ],
  endings: [
    { id: 'reputation', title: 'Running on Reputation', when: all(chosen('maintenance.defer'), lte('experience', 3), gte('power', 3)),
      summary: 'Starhaven still has meaningful market power, but deferred work makes visits less enjoyable and weakens its reputation. Delaying repairs left funds for other uses; closures and patching now absorb some of those savings. Existing attractions and entry barriers buy time, not immunity from substitutes.' },
    { id: 'crowded', title: 'Lines Around the Midway', when: all(gte('access', 6), lte('experience', 4)),
      summary: 'More households can visit, but long waits and strained facilities make each visit less enjoyable. Extra ticket sales can add to earnings even as guests lose time in queues. More capacity would cost money; limiting admissions would turn some guests away.' },
    { id: 'built', title: 'Built for the Next Season', when: all(chosen('investment.expand'), gte('capacity', 6)),
      summary: 'The new attraction gives Starhaven more capacity and another reason for guests to choose it. Building it used funds long before opening day, and pricing still involves a tradeoff between margins and access. More competition is coming, but the expanded park can still have substantial market power.' },
    { id: 'premium', title: 'A Park Worth the Premium', when: all(gte('earnings', 4), gte('experience', 6), lte('access', 4), gte('power', 5)),
      summary: 'A relatively narrow customer base supports strong earnings and a high-quality visit. Distinctive attractions and shorter queues help sustain higher prices despite more competition. Many price-sensitive households choose other outings, and the park has not necessarily added capacity for more guests.' },
    { id: 'mixed', title: 'Still the Main Attraction',
      summary: 'Starhaven remains a major regional attraction. The gains and costs across earnings, access and ride conditions reflect the choices made along the way. Next season, prices and service still need to fit the park’s capacity and upkeep, as guests gain more alternatives.' }
  ],
  debrief: [
    { title: 'Pricing, demand and marginal reasoning', text: 'Market power permits a markup, not control over how many people buy. With one admission price, selling more tickets requires cutting the price even for guests who would have paid more: marginal revenue is below price. The park compares extra revenue with extra operating cost; guests also bear waiting costs. Opening demand here is relatively inelastic, so raising price raises revenue. With elastic demand, it would reduce revenue.' },
    { title: 'Who pays which price?', text: 'Priority access separates guests by how much they will pay to avoid waiting. Dated tickets and named memberships separate customers by schedules or price sensitivity and limit resale. Price discrimination needs that separation and some market power. Discounts can attract new visits or replace full-price sales; peak prices also reflect congestion costs. Higher earnings do not necessarily mean broader access.' },
    { title: 'Ride time today and investment tomorrow', text: 'A ticket is not a guarantee of unlimited ride time. Reservations, queues and paid priority allocate limited capacity differently. Repairs and construction use funds now for benefits later, leaving less for other uses today. Sunk spending on existing rides is not the marginal cost of admitting another guest. Park earnings tracks funds left after operating and investment decisions.' },
    { title: 'A dominant park can still face competition', text: 'Scarce land, reputation and large fixed investments make entry difficult. Starhaven’s distinctive rides can sustain substantial market power even as competition increases. Festivals, other attractions and staying home already limit demand; more substitutes can make it more elastic over time. A financed rival can affect bookings and investment before opening. Keeping guests interested still costs money or requires price concessions.' }
  ]
};
