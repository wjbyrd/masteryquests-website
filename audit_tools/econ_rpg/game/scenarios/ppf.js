import sceneSet from './ppf-scenes.js';
const p = text => ({ type: 'paragraph', text });
const eq = (state, value) => ({ state, op: 'eq', value });
const gte = (state, value) => ({ state, op: 'gte', value });
const lte = (state, value) => ({ state, op: 'lte', value });
const chosen = id => ({ chosen: id });
const all = (...conditions) => ({ all: conditions });
const any = (...conditions) => ({ any: conditions });

// Authored feasible mixes on one unchanged frontier, from capital to consumption.
// These helpers construct ordinary outcome data; the shared engine handles all play.
const mixes = [[2,7],[4,6],[5,5],[6,4],[7,2]];
const at = ([consumption, capital]) => all(eq('consumption', consumption), eq('capital', capital));
function reallocations(direction, text, expansion = 0) {
  return mixes.flatMap((before, index) => {
    const after = mixes[index + direction];
    if (!after) return [];
    return [{ when: at(before), effects: { consumption: after[0] - before[0] + expansion, capital: after[1] - before[1] + expansion }, consequence: text }];
  });
}
const finalRoute = [
  { when: lte('utilization', 7), target: 'final-slack' },
  { when: gte('growth', 3), target: 'final-expanded' },
  { target: 'final-current' }
];
const recoveryRoute = [{ when: eq('utilization', 8), target: 'investment-ready' }, { target: 'investment-slack' }];
// Residual idle resources after phased or equipment-first recovery. The conditions
// retain the allocation history so coincident indicator values cannot select a wrong mix.
const initialMix = { consumption: 3, balanced: 2, capital: 1 };
const shifts = { consumption: 1, hold: 0, capital: -1 };
const residuals = [[1,1],[0,1],[2,0],[1,0]];
function finishRecovery(text) {
  return Object.entries(initialMix).flatMap(([first, index]) => Object.entries(shifts).flatMap(([second, shift]) => {
    const target = mixes[index + shift];
    return residuals.map(([c, k]) => ({
      when: all(chosen(`allocation.${first}`), chosen(`pressure.${second}`), eq('consumption', target[0]-c), eq('capital', target[1]-k), eq('utilization', 8-c-k)),
      effects: { consumption: c, capital: k, utilization: c+k }, consequence: text
    }));
  }));
}
const recoveryEffects = (kind, texts) => [
  { id: 'wait', losses: [2,2] }, { id: 'coordinate', losses: [1,1] }, { id: 'households', losses: [1,2] }
].map(({id, losses: [c,k]}) => ({
  when: chosen(`shock.${id}`),
  effects: kind === 'full' ? { consumption: c, capital: k, utilization: c+k }
    : kind === 'phased' ? { consumption: 1, capital: 1, utilization: 2 }
    : { capital: k, utilization: k },
  consequence: texts[id]
}));
function finalAllocation(expanded) {
  const suffix = expanded ? 'expanded' : 'current';
  const common = expanded
    ? 'Earlier equipment, training and infrastructure projects are ready to enter use together. They will let the same labor force produce more this period. Bringing idle resources back was recovery; putting these completed improvements to work will expand productive capacity.'
    : 'Workers and equipment are back in use. Earlier projects have not yet added enough productive capacity to change what the economy can produce this period. A different mix still means giving up one type of output for more of the other.';
  const descriptions = expanded ? {
    hold: 'Completed improvements let both household output and capital production rise together, with resources fully employed. Some projects have left the future-growth pipeline because they are now in use. The earlier sacrifice has paid off, though choosing between uses of this larger capacity still matters.',
    consumption: 'Productivity improvements expand capacity, and more of that capacity goes to household goods. Consumption rises more than it would with the previous mix, at the cost of capital goods the larger economy could have produced. Completed projects leave a smaller pipeline of work still to come.',
    capital: 'Productivity improvements expand capacity, and more of that capacity goes to equipment and infrastructure. This builds on earlier investment, but households receive less than they could under a more consumption-oriented use of the new capacity. Completed projects are now in use rather than waiting in the growth pipeline.'
  } : {
    hold: 'The economy keeps its chosen mix with labor and equipment fully used. Both sectors avoid another round of reassignment, but neither gains resources from the other. Any unfinished productivity projects still need time before they can expand capacity.',
    consumption: 'Moving workers and equipment into household production raises current consumption and reduces capital output. Resources remain fully used; there has been no expansion of capacity. Fewer new capital goods also leave less support for future growth.',
    capital: 'More workers and equipment produce capital goods, and households receive less current output. Resources remain fully used along the same production boundary. The extra capital strengthens the growth pipeline, but it cannot raise both outputs immediately.'
  };
  return { id: `final-${suffix}`, title: expanded ? 'Using a larger capacity' : 'The next production mix', time: 'Following planning period',
    scene: [p(common)], prompt: 'How should the economy use its available capacity?',
    unavailableNote: 'This mix already puts the strongest available emphasis on one sector. Keep it or shift resources toward the other.',
    choices: [
      { id: 'hold', label: expanded ? 'Increase both types of output' : 'Keep the production mix', detail: expanded ? 'Use the productivity gains across household goods and capital goods.' : 'Continue producing the existing mix at full utilization.',
        effects: expanded ? { growth: -2 } : {}, outcomes: reallocations(0, descriptions.hold, expanded ? 1 : 0), next: '$end', consequence: descriptions.hold,
        mechanism: expanded ? 'Productivity and an outward shift' : 'Productive efficiency and allocation',
        tradeoff: expanded ? 'Both outputs benefit from the earlier investment, which required giving up household goods before these gains arrived.' : 'Stable production avoids further reallocation, but leaves the same tradeoff between household goods and capital goods.',
        whatIf: 'A different mix would give more of the available capacity to one sector, leaving less for the other.' },
      { id: 'consumption', label: 'Give household goods more of the capacity', detail: 'Raise household output and accept less capital production than another mix could provide.', ...(expanded ? {} : { when: gte('capital', 4) }),
        effects: { growth: expanded ? -3 : -1 }, outcomes: reallocations(1, descriptions.consumption, expanded ? 1 : 0), next: '$end', consequence: descriptions.consumption,
        mechanism: expanded ? 'Allocation on an expanded frontier' : 'Opportunity cost along the frontier',
        tradeoff: 'Households receive more now, but less equipment and infrastructure is produced than the available capacity could support.',
        whatIf: 'A capital-oriented mix would add more equipment, at the cost of goods households could use now.' },
      { id: 'capital', label: 'Give capital goods more of the capacity', detail: 'Produce more equipment and infrastructure, with less output for household use.', when: gte('consumption', 4),
        effects: { growth: expanded ? -1 : 1 }, outcomes: reallocations(-1, descriptions.capital, expanded ? 1 : 0), next: '$end', consequence: descriptions.capital,
        mechanism: expanded ? 'Capital formation on an expanded frontier' : 'Capital formation and opportunity cost',
        tradeoff: 'More capital supports later production, but households give up goods they could have received this period.',
        whatIf: 'A household-oriented mix would raise current living standards, with less capital formation for later periods.' }
    ] };
}

export default {
  id: 'ppf', version: 1, title: 'The Economy’s Edge', subtitle: 'A branching production-possibilities scenario',
  role: 'Director of economic planning · Calder', introTitle: 'An economy at work', stateTitle: 'Economic conditions',
  consequenceTitle: 'Production consequences', endingEyebrow: 'Your outcome · The following period', duration: 'About 10–15 minutes', decisions: 6, sceneSet,
  introduction: [
    p('Calder’s workers and equipment are fully employed. They produce goods for households and capital goods for further production. As director of economic planning, choose how this limited capacity is used and what the country gives up today for tomorrow.'),
    p('The four views show capital goods at top left, future improvements at top right, idle resources at bottom left and household goods at bottom right. Unused workers and equipment mean lost production; future improvements take time to become usable capacity.')
  ],
  metadata: { concept: 'Scarcity, opportunity cost, production possibilities, utilization and economic growth',
    learningObjective: 'Distinguish reallocation along a production frontier, underutilization inside it, recovery toward it and investment that expands it.',
    mechanism: 'Resource allocation, increasing opportunity cost, idle capacity and delayed productivity gains',
    misconception: 'Producing more of both outputs always means growth, and current investment raises productive capacity immediately.' },
  state: {
    consumption: { label: 'Current consumption', short: 'Current output for household use and living standards', min: 0, max: 8, initial: 5 },
    capital: { label: 'Capital production', short: 'Current output of equipment, infrastructure and other productive investment', min: 0, max: 8, initial: 5 },
    utilization: { label: 'Resource utilization', short: 'How fully available labor and capital are being used', min: 0, max: 8, initial: 8 },
    growth: { label: 'Future growth', short: 'Improvements still in preparation that can expand later output', min: 0, max: 8, initial: 2 }
  },
  start: 'allocation',
  nodes: [
    { id: 'allocation', title: 'What should the economy produce?', time: 'Opening plan',
      scene: [p('Households want more goods and services. Producers also need machinery, transport links and trained workers. With labor and equipment already in use, producing more for one purpose means less for the other.')],
      prompt: 'Which production mix should begin the period?',
      choices: [
        { id: 'consumption', label: 'Lean toward household goods', detail: 'Increase current living standards with less capital production.', effects: { consumption: 1, capital: -1, growth: -1 }, next: 'pressure',
          consequence: 'More workers and equipment produce goods for households. Capital production falls because those same resources cannot do both jobs. Living standards improve now, with fewer new tools and projects supporting later growth.',
          mechanism: 'Scarcity and opportunity cost', tradeoff: 'Households receive more current output, at the cost of capital goods for later production.', whatIf: 'A capital emphasis would prepare more future capacity, but households would receive less now.' },
        { id: 'balanced', label: 'Keep a balanced production mix', detail: 'Continue supplying both household goods and capital goods.', effects: {}, next: 'pressure',
          consequence: 'Production continues in both sectors with resources fully used. Households and capital projects keep their existing shares. This avoids a shift in priorities, but it cannot satisfy demands for more of both outputs.',
          mechanism: 'Productive efficiency and competing uses', tradeoff: 'Neither sector loses resources, and neither gains the extra output that a different allocation could provide.', whatIf: 'More household goods would improve living standards now, with less capital production.' },
        { id: 'capital', label: 'Lean toward capital goods', detail: 'Produce more equipment and infrastructure, accepting fewer household goods.', effects: { consumption: -1, capital: 1, growth: 1 }, next: 'pressure',
          consequence: 'Resources move into equipment and infrastructure, leaving less output for households. More capital projects strengthen the prospects for later production. They are still being built and prepared, so usable capacity has not increased yet.',
          mechanism: 'Capital formation and current sacrifice', tradeoff: 'The economy prepares for later growth by giving up household goods today.', whatIf: 'A household emphasis would deliver more now, but leave fewer new capital goods for later use.' }
      ] },
    { id: 'pressure', title: 'More output from the same resources', time: 'Production review',
      scene: [p('Households and equipment producers both ask for more. Easy transfers can use workers suited to either sector. A further push must move more specialized resources, so each extra gain can require a larger sacrifice elsewhere.')],
      prompt: 'Should the economy change its production mix?',
      choices: [
        { id: 'consumption', label: 'Shift more resources to household goods', detail: 'Accept the capital goods lost when specialized resources are reassigned.', effects: { growth: -1 },
          outcomes: reallocations(1, 'Household output rises and capital production falls, with resources still fully employed. Pushing farther toward household goods can give up more capital for each additional gain because specialized workers and equipment are harder to replace. The country has changed its mix, not its capacity.'), next: 'shock',
          consequence: 'More household goods require less capital production from the same resources.', mechanism: 'Increasing opportunity cost', tradeoff: 'Current consumption rises at the expense of equipment and infrastructure, with a steeper sacrifice at a more concentrated mix.', whatIf: 'Keeping the mix would avoid that sacrifice, but would leave the request for more household goods unmet.' },
        { id: 'hold', label: 'Keep the existing mix', detail: 'Decline requests that would require taking resources from the other sector.', effects: {}, next: 'shock',
          consequence: 'Both sectors keep their resources and production levels. The economy remains fully employed, but neither request can be met without a sacrifice. Preserving the mix also leaves its existing balance between current use and future investment unchanged.',
          mechanism: 'Scarcity at full utilization', tradeoff: 'Stable allocation avoids taking output from either sector, but forgoes gains that a different mix could deliver.', whatIf: 'Reallocation could meet one request only by producing less for the other use.' },
        { id: 'capital', label: 'Shift more resources to capital goods', detail: 'Give up household goods to produce more equipment and infrastructure.', effects: { growth: 1 },
          outcomes: reallocations(-1, 'Capital production rises and household output falls, with resources still fully employed. A stronger capital emphasis draws in workers and equipment better suited to household production, making the sacrifice larger. More investment is underway, but it has not expanded usable capacity yet.'), next: 'shock',
          consequence: 'More capital goods require less household output from the same resources.', mechanism: 'Increasing opportunity cost and capital formation', tradeoff: 'More equipment and infrastructure are produced, at an increasing cost in household goods.', whatIf: 'Keeping the mix would preserve more current consumption, with less additional capital formation.' }
      ] },
    { id: 'shock', title: 'Resources fall idle', time: 'A disruption',
      scene: [p('A breakdown in delivery schedules and job matching interrupts production across the country. Workers and equipment remain available, but some cannot reach the jobs and inputs they need. No productive assets have been destroyed; the problem is using the capacity Calder already has.')],
      prompt: 'How should the country handle the disruption?', unavailableNote: 'An immediate nationwide restart needs at least 2 future-growth steps of project work to draw teams from. With less preparation available, wait or protect household supply first.',
      choices: [
        { id: 'wait', label: 'Allow local restarts to proceed', detail: 'Keep project teams on their existing work and accept a deeper initial slowdown.', effects: { consumption: -2, capital: -2, utilization: -4 }, next: 'recovery',
          consequence: 'Delivery failures leave workers and equipment idle in both sectors. Household goods and capital output fall together even though the country could still produce its earlier mix. Future projects keep their teams, but households and producers bear a deeper interruption now.',
          mechanism: 'Underutilization inside the frontier', tradeoff: 'Project work continues, at the cost of more lost current production.', whatIf: 'Coordinating restarts sooner would limit the output loss, but would pull teams away from future improvements.' },
        { id: 'coordinate', label: 'Coordinate restarts immediately', detail: 'Move project teams into restoring delivery and matching workers to jobs.', when: gte('growth', 2), effects: { consumption: -1, capital: -1, utilization: -2, growth: -2 }, next: 'recovery',
          consequence: 'Coordination limits the shutdowns, though both types of output still fall and some resources remain idle. Teams taken from future projects slow that work. The smaller loss reflects better use of existing capacity, not an increase in what the economy could produce.',
          mechanism: 'Utilization and the opportunity cost of coordination', tradeoff: 'More current production is kept running, but future improvements lose staff and time.', whatIf: 'Waiting would protect the project pipeline, with a larger loss of current output.' },
        { id: 'households', label: 'Restore household supply first', detail: 'Reassign a smaller team to restoring deliveries for household producers.', effects: { consumption: -1, capital: -2, utilization: -3, growth: -1 }, next: 'recovery',
          consequence: 'Household producers regain some deliveries, limiting the fall in consumption. Equipment producers face longer interruptions, and unused resources remain in both sectors. The smaller reassignment also slows future project work, though less than a nationwide restart would.',
          mechanism: 'Uneven underutilization across sectors', tradeoff: 'Household supply receives priority, at the cost of some future preparation and a longer interruption to capital output.', whatIf: 'A coordinated restart would reduce the loss of capital output too, but would delay more future project work.' }
      ] },
    { id: 'recovery', title: 'Putting resources back to work', time: 'Recovery planning',
      scene: [p('The idle workers and equipment could produce again if deliveries and job matching were restored. Both sectors can gain without taking resources from one another while this slack remains. A faster restart would need teams currently preparing future projects.')],
      prompt: 'How should the remaining idle capacity return to use?',
      unavailableNote: 'A full coordinated restart is offered only when substantial slack remains and future project teams can be reassigned. Otherwise use phased or equipment-first restarts.',
      choices: [
        { id: 'full', label: 'Complete a coordinated restart', detail: 'Restore the earlier production mix and delay some future project work.', when: all(lte('utilization', 5), gte('growth', 1)), effects: { growth: -1 },
          outcomes: recoveryEffects('full', Object.fromEntries(['wait','coordinate','households'].map(id => [id, 'Deliveries and job matching are restored, bringing both outputs back to their earlier levels. Labor and equipment are fully used again, but teams reassigned from future projects slow those improvements. This is recovery to existing capacity, not growth in that capacity.']))), next: recoveryRoute,
          consequence: 'Idle resources return to both sectors, at the cost of delayed project work.', mechanism: 'Recovery toward the existing frontier', tradeoff: 'Current output recovers fully, with less progress on future improvements.', whatIf: 'A phased restart would protect project teams but leave more output unproduced for now.' },
        { id: 'phased', label: 'Restart both sectors in stages', detail: 'Bring some idle resources back without taking teams from future projects.', effects: {},
          outcomes: recoveryEffects('phased', { wait: 'Restarts raise both household goods and capital output, although idle resources remain. Project teams stay on their existing work. The economy has recovered part of its lost production without expanding its productive capacity.', coordinate: 'Earlier coordination lets the remaining restarts restore both sectors to their previous output. Resources are fully used again, and no further project teams need to move. Returning to the earlier mix is recovery, not an outward expansion of capacity.', households: 'Both types of output rise as deliveries resume. Household production returns to its earlier level, but some capital-producing resources remain idle. Project work continues, and the remaining shortfall still reflects unused capacity rather than a smaller frontier.' }), next: recoveryRoute,
          consequence: 'Both outputs rise as idle resources return to work.', mechanism: 'Recovery using idle resources', tradeoff: 'Project work keeps its teams, but current production recovers only as quickly as earlier coordination permits.', whatIf: 'A faster restart could recover more output sooner, at the cost of delaying future improvements.' },
        { id: 'equipment', label: 'Restart equipment production first', detail: 'Restore capital output before finishing household-sector restarts.', effects: {},
          outcomes: recoveryEffects('equipment', Object.fromEntries(['wait','coordinate','households'].map(id => [id, 'Equipment and infrastructure production returns to its earlier level. Some household-producing workers and equipment remain idle, so utilization improves without becoming complete. Capital projects regain supplies, but households still receive less than the economy could provide.']))), next: recoveryRoute,
          consequence: 'Capital production recovers before household production.', mechanism: 'Sectoral recovery and unused capacity', tradeoff: 'Capital producers recover first, leaving households to wait for the remaining restarts.', whatIf: 'Restarting both sectors together would spread the immediate gains, with less priority for capital producers.' }
      ] },
    { id: 'investment-ready', title: 'Production for later growth', time: 'Investment planning',
      scene: [p('Workers and equipment are fully used again. New equipment, training and better production methods could increase future capacity, but preparing them uses resources now. That work counts as productive investment; the growth pipeline is not a third current output.')],
      prompt: 'How much current output should go toward future capacity?', unavailableNote: 'The economy already has the strongest available emphasis on one sector. Keep that mix or move toward the other.',
      choices: [
        { id: 'invest', label: 'Produce more equipment and training', detail: 'Give up household goods to prepare machinery, skills and better production methods.', when: gte('consumption', 4), effects: { growth: 2 },
          outcomes: reallocations(-1, 'More resources produce equipment and training, so household output falls. The growth pipeline strengthens, but the new tools and methods still need time to work together. Current capacity has not increased; later gains depend on how much preparation is already in place.'), next: finalRoute,
          consequence: 'Investment rises at the cost of current household goods.', mechanism: 'Capital formation, opportunity cost and delayed growth', tradeoff: 'Households give up current goods to prepare a larger productive capacity later.', whatIf: 'Keeping the mix would preserve more current consumption, but prepare fewer improvements for the next period.' },
        { id: 'hold', label: 'Keep investment at its existing share', detail: 'Continue current household and capital production without another reallocation.', effects: {}, next: finalRoute,
          consequence: 'Both sectors continue at their existing levels. Earlier capital projects keep progressing, but no extra household output is sacrificed to accelerate them. Whether enough improvements are ready next period depends on the earlier allocation and disruption decisions.',
          mechanism: 'Investment timing and path dependence', tradeoff: 'Current production stays stable, with no additional push to expand future capacity.', whatIf: 'More investment could strengthen later production, at the cost of household goods now.' },
        { id: 'consumption', label: 'Shift production toward household goods', detail: 'Use more resources for current living standards and fewer for capital projects.', effects: { growth: -1 },
          outcomes: reallocations(1, 'Household production rises as resources leave capital production. Labor and equipment remain fully used, so the gain comes from changing the mix rather than expanding capacity. Fewer tools and projects are prepared for later growth.'), next: finalRoute,
          consequence: 'Current living standards gain at the cost of capital output.', mechanism: 'Current consumption versus capital formation', tradeoff: 'More goods reach households today, with less support for future productive capacity.', whatIf: 'Keeping more resources in capital production would support later growth but deliver fewer household goods now.' }
      ] },
    { id: 'investment-slack', title: 'Recovery before new investment', time: 'Investment planning',
      scene: [p('Some productive resources are still idle. Completing restarts would raise current output using capacity that already exists. Preparing a new investment drive at the same time would spread the available planning teams too thin.')],
      prompt: 'What should the planning teams prioritize?',
      choices: [
        { id: 'restart', label: 'Finish restarts before adding new projects', detail: 'Use this planning period to restore the earlier production mix.', effects: {},
          outcomes: finishRecovery('The remaining idle resources return to use, restoring the earlier production mix. No new capacity has been created by these restarts. Existing capital projects continue, but planning a fresh investment drive has to wait.'), next: finalRoute,
          consequence: 'Remaining restarts restore production within existing capacity.', mechanism: 'Recovery versus capacity expansion', tradeoff: 'Current output returns, but this planning period is used for recovery rather than a new investment programme.', whatIf: 'Keeping teams with existing projects would avoid reorganizing their work, but leave more current production unused.' },
        { id: 'continue', label: 'Keep teams on their existing projects', detail: 'Advance future preparation and accept another period of idle resources.', effects: { growth: 1 }, next: finalRoute,
          consequence: 'Keeping planning teams with existing capital projects advances the preparation of future improvements. Remaining delivery and job-matching problems go unresolved, leaving output below the mix the economy could produce. That stronger pipeline is not yet usable capacity and does not replace the lost current production.',
          mechanism: 'Underutilization and competing uses of planning capacity', tradeoff: 'Future preparation advances, but households and producers give up the output that a completed restart could restore.', whatIf: 'Finishing restarts would recover current production, at the cost of delaying further preparation for future growth.' }
      ] },
    finalAllocation(false), finalAllocation(true),
    { id: 'final-slack', title: 'Unfinished recovery', time: 'Following planning period',
      scene: [p('Some workers and equipment remain idle. Future projects need more preparation before they can expand capacity. Planning teams can now complete restarts or keep preparing those improvements, accepting lower current output for another period.')],
      prompt: 'Which work should receive the available planning teams?',
      choices: [
        { id: 'restore', label: 'Complete the remaining restarts', detail: 'Recover current production and slow the preparation of future improvements.', effects: { growth: -1 },
          outcomes: finishRecovery('The last idle resources return to production, bringing output back to the earlier feasible mix. Reassigning teams slows future improvements. This is a return to existing capacity; it does not by itself make the country able to produce more than before the disruption.'), next: '$end',
          consequence: 'Completing restarts recovers output but slows future preparation.', mechanism: 'Recovery without an outward shift', tradeoff: 'Households and producers regain lost current output, with less progress on future capacity.', whatIf: 'Keeping project teams in place would strengthen preparation for later growth, but leave current resources idle.' },
        { id: 'prepare', label: 'Continue preparing future improvements', detail: 'Advance existing projects while accepting the remaining production shortfall.', effects: { growth: 1 }, next: '$end',
          consequence: 'Teams make further progress on the equipment and training projects already underway. Those improvements are not yet in use, and unresolved restarts leave current output below capacity. A stronger pipeline can coexist with idle resources; it is not realized growth.',
          mechanism: 'Future preparation versus current utilization', tradeoff: 'Future projects advance, but output that could be recovered today remains unproduced.', whatIf: 'Reassigning the teams to restarts would recover current output sooner and delay those improvements.' }
      ] }
  ],
  endings: [
    { id: 'slack', title: 'Slack and Strain', when: lte('utilization', 7), summary: 'The economy still produces less than its workers and equipment could provide. Some future projects have progressed, but households and producers continue to lose output through unused capacity. A promising pipeline has not yet replaced either recovery or realized productivity growth.' },
    { id: 'growth', title: 'A Larger Frontier', when: any(...['hold','consumption','capital'].map(id => chosen(`final-expanded.${id}`))), summary: 'Completed improvements have expanded what Calder can produce with its resources. Both household goods and capital goods could exceed the earlier mix; your final allocation determines how those gains are used. This capacity came after earlier sacrifices, and scarcity still requires choices within the larger economy.' },
    { id: 'consumption', title: 'Living for Today', when: gte('consumption', 6), summary: 'The economy is fully employed and gives a larger share of its resources to household goods. Current living standards take priority over producing more capital. The country recovered its existing capacity, but this outcome does not include an outward expansion; future gains still depend on the investment left in preparation.' },
    { id: 'capital', title: 'Building Tomorrow', when: gte('capital', 6), summary: 'The economy is fully employed with a strong emphasis on equipment and infrastructure. Households receive less current output in exchange for more capital formation. The earlier disruption and recovery choices affected how far future projects progressed; more capital output is not the same as already having a larger frontier.' },
    { id: 'recovered', title: 'Back on Track', summary: 'Both sectors are back at the balanced production mix and resources are fully used. Recovery restored output that had been lost to idle workers and equipment. Existing projects may support later growth, but the economy has returned to its earlier production boundary rather than expanded it.' }
  ],
  debrief: [
    { title: 'Scarcity and opportunity cost', text: 'At full utilization, more household goods required less capital production, and more capital required fewer household goods. Pushing farther in one direction gave up more of the other output as specialized workers and equipment moved to less suitable uses. The cost was production forgone, not a penalty for choosing the wrong priority.' },
    { title: 'Producing on the frontier', text: 'A fully employed economy can still choose different mixes. Balanced production is not inherently better than a consumption or capital emphasis. Each can use available resources efficiently. Moving between them changes who benefits now and how much is prepared for later; it does not expand the productive frontier.' },
    { title: 'Idle resources and recovery', text: 'The disruption left productive resources unused rather than destroying them. Both outputs could fall inside the existing frontier. Restarts then allowed both to rise as slack disappeared. Recovering lost output is different from making the economy capable of more than it could produce before the interruption.' },
    { title: 'Investment and outward shifts', text: 'Equipment, training and improved methods used resources that could have supplied households. Capital production records that investment work today; future growth shows improvements still in preparation, not a third current output. Only completed improvements expanded capacity. A larger frontier made more of both outputs possible, though the final production mix remained a choice.' }
  ]
};
