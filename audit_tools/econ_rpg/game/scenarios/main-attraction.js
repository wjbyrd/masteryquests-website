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
      : 'Bookings fit more comfortably within the park, although signature rides still form queues at midday. Management can ration busy slots, sell a different service tier, or continue admitting walk-up visitors.')],
    prompt: 'How should the park manage its busiest hours?',
    choices: [
      { id: 'reserve', label: 'Limit daily admissions with reservations', detail: 'Sell fewer tickets on busy dates to protect time inside the park.',
        effects: { earnings: -1, access: -1, experience: busy ? 2 : 1 }, next: 'segments',
        consequence: 'Reservations shorten queues and make a visit more predictable. Some willing customers cannot obtain a place, and the park forgoes their contribution to earnings. The existing rides serve fewer people rather than gaining new capacity.',
        mechanism: 'Capacity rationing and the congestion cost of an additional guest',
        tradeoff: 'Guests admitted get more useful ride time; customers without a reservation lose access and the park sells fewer tickets.',
        whatIf: 'Open admissions would sell more tickets but make the waiting time imposed on other guests part of the cost.' },
      { id: 'priority', label: 'Offer a paid priority-access pass', detail: 'Keep general admission and sell a limited faster-queue option.',
        effects: { earnings: busy ? 2 : 1, access: -1, experience: busy ? -1 : 0 }, next: 'segments',
        consequence: busy
          ? 'Guests who value time highly buy priority passes, raising earnings. The same ride seats now serve two queues, so ordinary-ticket visitors wait longer and complete fewer rides. Segmentation earns more without removing the capacity bottleneck.'
          : 'Some guests pay to shorten their wait, adding earnings without a general admission increase. Ordinary-ticket visitors get a smaller share of the busiest ride slots. The park has sold different waiting times, not built more ride capacity.',
        mechanism: 'Self-selection by willingness to pay for time; differentiated service',
        tradeoff: 'Priority buyers gain time and the park gains income; ordinary admission provides less practical access to popular rides.',
        whatIf: 'Reservations would manage congestion for everyone admitted, but would sacrifice some ticket volume rather than sell priority.' },
      { id: 'open', label: 'Keep general queues and walk-up admission', detail: 'Accept more visitors and cover the extra operating shifts.',
        effects: { earnings: 1, access: 1, experience: busy ? -2 : -1, ...(busy ? { capacity: -1 } : {}) }, next: 'segments',
        consequence: busy
          ? 'Extra ticket receipts cover the additional staffing and leave a contribution to earnings. Long queues reduce the rides each guest can enjoy, and heavy use takes some equipment out of rotation. A profitable extra admission can still impose waiting costs on other visitors.'
          : 'More customers can visit without planning ahead, and extra receipts exceed the added operating shifts in this season. Queues grow at the most popular rides. The contribution from another guest does not measure the time that guest costs everyone else.',
        mechanism: 'Marginal revenue, marginal operating cost and congestion spillovers',
        tradeoff: 'More people obtain admission and the park retains a cash contribution, while each visit can contain more waiting.',
        whatIf: 'Selling fewer reserved places would protect visit quality, at the cost of excluding some willing customers.' }
    ]
  };
}

// Final review delivers earlier commitments once. These are authored data combinations,
// not a second transition engine: the shared engine adds one matching outcome's effects.
const repairs = [
  { id: 'overhaul', effects: { capacity: 1, experience: 2, earnings: 1 }, text: 'The overhauled signature ride reopens reliably, restoring its closed capacity and reducing interruptions.' },
  { id: 'partial', effects: {}, text: 'Partial repairs keep the signature ride operating, but its larger overhaul remains a future commitment.' },
  { id: 'defer', effects: { capacity: -1, experience: -2, earnings: -1, power: -1 }, text: 'Deferred work now causes closures and patching costs, reducing usable capacity and weakening the experience behind the brand.' }
];
const investments = [
  { id: 'expand', effects: { capacity: 3, experience: 1, power: 1 }, text: 'The new attraction opens for the following season, adding ride capacity and a reason to choose the park.' },
  { id: 'throughput', effects: { capacity: 1, experience: 1 }, text: 'The remaining loading improvements enter service, adding throughput without a new headline attraction.' },
  { id: 'hold', effects: {}, text: 'With no expansion committed, the park still depends on its existing rides and demand management.' }
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
    p('As general manager, set the strategy for this season and the next. Families can still choose festivals, smaller attractions, travel or a day at home.')
  ],
  metadata: {
    concept: 'Monopoly market power, pricing/output, elasticity, price discrimination and long-run investment',
    learningObjective: 'Evaluate monopoly pricing, capacity, investment, and segmentation decisions by tracing their effects on firm outcomes and consumer access.',
    mechanism: 'Downward-sloping demand, marginal revenue and cost, segmentation, congestion, entry barriers and substitutes',
    misconception: 'A dominant firm can raise prices without losing customers, and one strategy must maximize every stakeholder outcome.'
  },
  state: {
    earnings: { label: 'Park earnings', short: 'Operating surplus available after commitments', initial: 5, min: 0, max: 8 },
    access: { label: 'Guest access', short: 'Ability to afford admission and use the park', initial: 4, min: 0, max: 8 },
    experience: { label: 'Guest experience', short: 'Waiting, service and visit quality', initial: 5, min: 0, max: 8 },
    capacity: { label: 'Park capacity', short: 'Ability to serve guests without excess congestion', initial: 4, min: 0, max: 8 },
    power: { label: 'Market power', short: 'Pricing strength from distinction and limited substitutes', initial: 6, min: 0, max: 8 }
  },
  start: 'admission',
  nodes: [
    { id: 'admission', title: 'The price of a day out', time: 'Spring',
      scene: [p('Advance interest is strong. Booking research suggests the core audience is relatively insensitive to a modest price change this season, but some families are already comparing cheaper outings. A larger crowd would need extra staff and the same finite number of ride seats.')],
      prompt: 'Which admission strategy should open the season?',
      choices: [
        { id: 'raise', label: 'Raise the admission price', detail: 'Seek a larger margin per visit and accept lower attendance.', effects: { earnings: 1, access: -2, experience: 1 }, next: 'steady-midway',
          consequence: 'Fewer families buy tickets, leaving shorter queues. In this season’s booking response, the higher receipt per guest outweighs the lost sales, and operating earnings rise. That result depends on relatively inelastic demand; stronger substitutes could reverse it.',
          mechanism: 'Downward-sloping demand and the elasticity of total revenue',
          tradeoff: 'The park earns more and admitted guests wait less, while more price-sensitive households choose other outings.',
          whatIf: 'Lower admission would attract more families, but the assumed attendance response would not fully replace the lower revenue per ticket.' },
        { id: 'hold', label: 'Keep the current admission price', detail: 'Retain the familiar offer and its current mix of attendance and margin.', effects: { earnings: 1 }, next: 'steady-midway',
          consequence: 'The familiar price retains the current mix of guests, and seasonal operations add to earnings. Popular rides still bottleneck at busy hours. Holding the price preserves a workable position but does not test how much extra margin or attendance the park could obtain.',
          mechanism: 'Demand uncertainty and the price–quantity tradeoff',
          tradeoff: 'A predictable offer avoids a sharp change in access, but leaves the existing capacity constraint unresolved.',
          whatIf: 'A price increase would trade some attendance for margin; its effect on receipts would depend on how strongly demand responds.' },
        { id: 'lower', label: 'Lower the admission price', detail: 'Reach more households and prepare for heavier use of the park.', effects: { earnings: -1, access: 2, experience: -2 }, next: 'busy-midway',
          consequence: 'More families visit, but the attendance increase is too small to replace all the revenue lost per ticket in this season. Extra operating shifts further reduce retained earnings. Access improves while longer queues make capacity management the next constraint.',
          mechanism: 'Inelastic demand, total revenue and marginal operating costs',
          tradeoff: 'A broader group can afford the park, but lower retained earnings and crowded rides limit what management can do next.',
          whatIf: 'Keeping the price would preserve more surplus for repairs or expansion, with fewer households able to visit.' }
      ] },
    flow(false), flow(true),
    { id: 'segments', title: 'Different guests, different dates', time: 'Midsummer',
      scene: [p('Weekend visitors have fewer scheduling alternatives than flexible local households. Dated tickets and named passes can limit resale, but checking eligibility and shifting visits both take work. The park must decide how much to vary its offer.')],
      prompt: 'How should admission vary across customers or time?',
      choices: [
        { id: 'single', label: 'Keep one admission price', detail: 'Make the ticket offer simple across dates and customers.', effects: { earnings: 1 }, next: 'maintenance',
          consequence: 'A single price remains easy to understand and administer, preserving a contribution to earnings. Some customers would pay more, while others still cannot justify a ticket at that price. The park leaves that variation in willingness to pay untapped.',
          mechanism: 'Uniform pricing and uncaptured differences in willingness to pay',
          tradeoff: 'Simplicity avoids segmentation costs, but does not expand access for price-sensitive groups or smooth peak demand.',
          whatIf: 'Dated off-peak discounts could reach flexible visitors without lowering every peak-date ticket.' },
        { id: 'dates', label: 'Use peak and off-peak prices', detail: 'Charge more on busy dates and discount quieter days with dated tickets.', effects: { access: 1, experience: 1 }, next: 'maintenance',
          consequence: 'Some flexible visitors move to cheaper dates, easing peak queues and opening access. Higher peak receipts offset off-peak discounts and administration this season, holding retained earnings steady. Dated tickets limit resale; the price differences reflect both demand sensitivity and congestion costs.',
          mechanism: 'Time-based price discrimination, elasticity and peak-load pricing',
          tradeoff: 'Flexible households gain a cheaper option, while families tied to peak dates face higher prices.',
          whatIf: 'A single price would avoid date restrictions, but would give up both demand shifting and the higher peak-date margin.' },
        { id: 'members', label: 'Offer named local off-peak memberships', detail: 'Discount repeat weekday visits while retaining ordinary tickets elsewhere.', effects: { access: 2, experience: -1 }, next: 'maintenance',
          outcomes: [{ when: chosen('admission.raise'), effects: { earnings: 1 }, consequence: 'Memberships bring price-sensitive locals back while higher ordinary tickets remain in place. Named, off-peak passes make resale harder, and this season’s new visits outweigh the discounts to people who would have paid full price. More repeat visits still add waiting at popular rides.' }],
          consequence: 'More local households can visit repeatedly, but some would previously have bought full-price tickets. Added spending roughly offsets those discounts and administration this season, leaving earnings unchanged. Named, off-peak restrictions limit resale, while more visits still add waiting at popular rides.',
          mechanism: 'Group segmentation, resale limits and cannibalization of full-price sales',
          tradeoff: 'Membership broadens access for an eligible group, but discounts can replace existing sales and create more demand for ride time.',
          whatIf: 'Peak/off-peak tickets would segment by dates rather than eligibility, without committing to repeat visits.' }
      ] },
    { id: 'maintenance', title: 'The signature ride', time: 'Late summer',
      scene: [p('The signature coaster needs an overhaul to maintain reliability. Engineers permit continued operation with inspections and occasional closures; unsafe operation is not an option. Closing now loses ride time in the busy season, while delaying leaves a larger operating problem for next year.')],
      variants: [{ when: chosen('admission.lower'), scene: [p('Heavy use after the admission discount has accelerated wear on the signature coaster. Engineers permit continued operation with inspections and occasional closures, but deferral will be particularly disruptive. An immediate overhaul would also remove scarce ride capacity during a busy season.')] }],
      prompt: 'When should the park do the major work?',
      unavailableNote: 'The full overhaul requires 4 earnings steps: 3 committed to the work and 1 retained for operations. Partial repairs or inspected deferral remain available.',
      choices: [
        { id: 'overhaul', label: 'Close now for a full overhaul', detail: 'Commit operating surplus and temporarily remove the ride from service.', when: gte('earnings', 4), effects: { earnings: -3, capacity: -1 }, next: 'investment',
          consequence: 'The coaster closes and the overhaul absorbs retained operating surplus, reducing current capacity. Guests must use the remaining attractions for now. The repaired ride is scheduled to return next season; committing funds today can leave less room for a separate expansion.',
          mechanism: 'Intertemporal maintenance, opportunity cost and reliability investment',
          tradeoff: 'Future reliability improves at the cost of current ride time and funds that could support a new attraction.',
          whatIf: 'Partial repairs would preserve more current funds and capacity, but leave a larger future maintenance commitment.' },
        { id: 'defer', label: 'Defer the major overhaul', detail: 'Keep operating under inspections and fund only required work this season.', effects: { earnings: 1, experience: -1 }, next: 'investment',
          outcomes: [{ when: chosen('admission.lower'), effects: { experience: -1 }, consequence: 'Keeping the ride open preserves current receipts and capacity. Under this season’s heavy use, short stoppages and worn facilities already erode the visit experience. Next season’s closures and patching costs will remain even if management builds another attraction.' }],
          consequence: 'The park preserves current receipts and keeps the coaster available under inspection. Short stoppages and visible wear reduce visit quality. Deferral leaves next season’s closures and patching costs unresolved; a new attraction would not repair the old one.',
          mechanism: 'Deferring maintenance shifts costs and reliability losses across time',
          tradeoff: 'Current funds and operating capacity are preserved, while guests and future operations bear deterioration.',
          whatIf: 'An immediate overhaul would sacrifice current capacity but avoid the modeled closure and patching losses next season.' },
        { id: 'partial', label: 'Make partial repairs during short closures', detail: 'Address the most disruptive problems and retain funds for other uses.', effects: { earnings: -1, experience: 1 }, next: 'investment',
          consequence: 'Short closures fix the most disruptive defects and improve the visit experience. The park spends less than a full overhaul and retains its normal seasonal capacity. Major work is still due later, so this is a bridge rather than a permanent repair.',
          mechanism: 'Marginal repair benefits versus the opportunity cost of funds',
          tradeoff: 'Moderate spending protects today’s experience, but leaves part of the future maintenance bill outstanding.',
          whatIf: 'A full overhaul would require more funds now in exchange for a stronger reliability gain next season.' }
      ] },
    { id: 'investment', title: 'A place for the next crowd', time: 'Autumn planning',
      scene: [p('Land beside the service area can support a major new attraction. Construction would use retained operating surplus now and open next season. Smaller loading and staffing improvements could increase throughput sooner, without giving the park a new headline draw.')],
      prompt: 'How much capacity should the park commit to?',
      unavailableNote: 'The major expansion requires 4 earnings steps: 3 for construction and 1 retained for operations. Earlier commitments leave too little; throughput improvements and holding capacity remain available.',
      choices: [
        { id: 'expand', label: 'Build a major new attraction', detail: 'Use retained funds for construction that opens next season.', when: gte('earnings', 4), effects: { earnings: -3 }, next: 'competition',
          consequence: 'The park commits funds and construction begins beside the service area. Usable capacity does not increase yet. The project may strengthen next season’s capacity and differentiation, but the cash is tied up before demand and competitive conditions are known.',
          mechanism: 'Fixed investment, construction lag and expected future operating surplus',
          tradeoff: 'The park gives up current financial flexibility for future ride capacity and a new reason to visit.',
          whatIf: 'Throughput improvements would cost less and deliver some capacity sooner, but would add less differentiation.' },
        { id: 'throughput', label: 'Improve loading and ride throughput', detail: 'Upgrade boarding processes now and complete the remaining work before next season.', effects: { earnings: -1, capacity: 1 }, next: 'competition',
          consequence: 'Better boarding processes and dispatch coordination put more existing seats into use now. The work uses less retained surplus than a new attraction. Remaining improvements will follow next season, but efficiency alone offers less of a new draw to visitors.',
          mechanism: 'Incremental capacity investment and marginal productivity',
          tradeoff: 'The park gains service capacity at lower cost, while relying on its existing attraction mix to sustain willingness to pay.',
          whatIf: 'A new attraction would require more funds and a wait for completion, but could change both capacity and willingness to visit.' },
        { id: 'hold', label: 'Hold capacity and retain the funds', detail: 'Rely on pricing and guest-flow management with the current rides.', effects: { earnings: 1, power: -1 }, next: 'competition',
          consequence: 'Retaining this season’s surplus strengthens the park’s financial position. No new ride time or headline attraction is added. Customers have fewer fresh reasons to choose Starhaven over other entertainment, so demand management will continue to carry more of the burden.',
          mechanism: 'Opportunity cost of capital and the erosion of differentiation',
          tradeoff: 'Financial flexibility improves while capacity and the competitive appeal of the attraction mix remain constrained.',
          whatIf: 'Incremental throughput work would exchange some retained surplus for more ride time without the full cost of expansion.' }
      ] },
    { id: 'competition', title: 'Another reason to go elsewhere', time: 'Next-season bookings',
      scene: [p('A regional entertainment development has secured financing, while festivals and smaller attractions compete for the same leisure budgets. Entry still takes land, capital and time, so Starhaven’s position will not disappear overnight. Booking research now suggests visitors will respond more strongly to price differences.')],
      variants: [{ when: chosen('investment.expand'), scene: [p('Construction is nearing completion as a rival entertainment development secures financing. Starhaven’s new attraction and earlier repair choices will enter service during the coming season. Entry still takes time, but more alternatives make booking demand more price-sensitive than it was last spring.')] }],
      prompt: 'How should the park respond for the coming season?',
      unavailableNote: 'Additional premium programming requires at least 1 earnings step to commit. Lower-priced packages or retaining the current offer remain available.',
      choices: [
        { id: 'broaden', label: 'Broaden access with lower-priced packages', detail: 'Trade margin for a wider customer base as substitutes improve.', effects: { earnings: -1, access: 2, experience: -1, power: -1 }, next: '$end',
          consequence: 'Lower-priced packages defend attendance while reducing retained margin and adding pressure on rides.',
          outcomes: reviewOutcomes('Lower-priced packages defend attendance against substitutes, but reduce retained margin and add queue pressure; any delivered capacity helps absorb it.'),
          mechanism: 'More elastic demand under substitute competition; delayed investment delivery',
          tradeoff: 'More households can use the park, but price concessions cost margin and any remaining congestion limits the experience.',
          whatIf: 'A premium response would seek willingness to pay through service rather than broadening access through packages.' },
        { id: 'differentiate', label: 'Strengthen the premium experience', detail: 'Fund distinctive programming and service while retaining a higher-priced offer.', when: gte('earnings', 1), effects: { earnings: -1, access: -1, experience: 1 }, next: '$end',
          consequence: 'Distinctive service supports willingness to pay among a narrower audience, while using retained surplus.',
          outcomes: reviewOutcomes('New programming and service spending offset some competitive pressure on willingness to pay, while retaining a higher-priced offer for a narrower audience.'),
          mechanism: 'Differentiation can defend market power but has a resource cost',
          tradeoff: 'A stronger experience can sustain pricing for some guests, while others prefer cheaper substitutes and current surplus funds the response.',
          whatIf: 'Broader packages would reach more price-sensitive households, at the cost of margin and heavier use of ride capacity.' },
        { id: 'course', label: 'Keep the current offer', detail: 'Preserve funds and accept more uncertainty about competing destinations.', effects: { earnings: 1, power: -2 }, next: '$end',
          consequence: 'The park avoids a new response budget, but faces more substitutes with its current offer.',
          outcomes: reviewOutcomes('Keeping the offer avoids new response spending, but leaves a larger erosion of pricing power as customers consider competing destinations.'),
          mechanism: 'Entry barriers slow competition without eliminating contestability',
          tradeoff: 'Retained funds preserve flexibility, while less action to defend the offer leaves future demand more exposed.',
          whatIf: 'Service investment could defend differentiation, but would commit funds before the rival’s demand impact is known.' }
      ] }
  ],
  endings: [
    { id: 'reputation', title: 'Running on Reputation', when: all(chosen('maintenance.defer'), lte('experience', 3), gte('power', 3)),
      summary: 'Starhaven retains meaningful market power, but deferred work weakens the experience supporting its reputation. Preserving current funds kept other options open; closures and patching now consume some of that advantage. Existing attractions and entry barriers buy time, not immunity from substitutes.' },
    { id: 'crowded', title: 'Lines Around the Midway', when: all(gte('access', 6), lte('experience', 4)),
      summary: 'More households can obtain and use admission, but waiting and operating strain limit the quality of each visit. A busy park can earn a contribution while guests bear time costs that ticket receipts do not show. More capacity or tighter demand management would each require giving something up.' },
    { id: 'built', title: 'Built for the Next Season', when: all(chosen('investment.expand'), gte('capacity', 6)),
      summary: 'The new attraction is operating and Starhaven can serve more guests. That capacity and differentiation required funds well before delivery, and a completed ride does not settle the tradeoff between margins and access. The park enters a more competitive market with a larger asset base and the costs of its earlier choices.' },
    { id: 'premium', title: 'A Park Worth the Premium', when: all(gte('earnings', 4), gte('experience', 6), lte('access', 4), gte('power', 5)),
      summary: 'A relatively narrow customer base supports strong earnings and a high-quality visit. Differentiation and demand management help sustain willingness to pay, while many price-sensitive households choose other outings. This position serves one set of priorities; it is not evidence that access or long-run expansion has been maximized.' },
    { id: 'mixed', title: 'Still the Main Attraction',
      summary: 'Starhaven remains a significant regional draw, with a mixture of financial, access and operating strengths. No single headline captures the tradeoffs in this path. The next season still requires matching the price and service offer to capacity, upkeep and customers’ improving alternatives.' }
  ],
  debrief: [
    { title: 'Pricing, demand and marginal reasoning', text: 'Market power permits a markup, not control over how many people buy. For one admission price, selling more tickets may require lowering the price on tickets that would have sold anyway, so marginal revenue is below price. A firm seeking operating profit compares extra revenue with extra operating cost; guests’ added waiting costs are a separate consideration. The first-season price response here is relatively inelastic, not a universal claim about parks. More substitutes can make later demand more elastic.' },
    { title: 'Who pays which price?', text: 'Priority access screens guests by willingness to pay for time. Dated tickets and named off-peak memberships separate customers with different schedules or price sensitivity and limit resale. Some market power and separation are needed to sustain different effective prices. Discounts can attract new visits or merely replace full-price purchases; time-based prices can also reflect genuine differences in capacity costs. Extra revenue is not itself a measure of broader access.' },
    { title: 'Ride time today and investment tomorrow', text: 'A ticket is not a guarantee of unlimited ride time. Reservations, queues and paid priority allocate constrained capacity differently. Maintenance and construction tie up current funds, while repaired or new capacity arrives later; sunk spending on an existing ride is not the marginal cost of admitting another guest. Park earnings here is an ordinal measure of retained operating strength after commitments, not audited accounting profit, cash dollars or a welfare score.' },
    { title: 'A dominant park can still face competition', text: 'Land, reputation and large fixed investments make entry difficult. Differentiation can support pricing, but festivals, other attractions and staying home already constrain demand. A financed rival need not open immediately to change future bookings and investment plans. Long-run market power depends on maintaining a reason to visit, and each response trades resources, access and experience in a different way.' }
  ]
};
