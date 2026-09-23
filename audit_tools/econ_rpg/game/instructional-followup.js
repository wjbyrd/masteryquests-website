import { ticketMarket, marketCopy } from './scenarios/megastar-mania-market.js';
import { variantIndex, parkQuestion, housingQuestion } from './instructional-variants.js';

// Presentation-only applications. Neither answers nor diagrams enter the saved
// economic state. A reload offers a fresh practice attempt on the saved outcome.
const option = (text, feedback) => ({ text, feedback });
const question = (id, prompt, correct, options, explanation) => ({ id, prompt, correct, options, explanation });
const pathLink = entry => `You chose “${entry.label}”. Your path illustrated ${entry.mechanism.toLowerCase()}. Apply that reasoning to a different setting.`;

export function followupFor(id, run, { variant: override } = {}) {
  if (!run || !['ending', 'debrief'].includes(run.phase)) return null;
  const history = run.history;
  if (id === 'housing-crisis') return {
    title: 'Read the rent ceiling',
    intro: `You already saw this happen. You inherited a ceiling below equilibrium and chose “${history[0].label}”, then “${history[1].label}”. Lower covered rents helped incumbents, while more applicants sought fewer available units. The graph shows that initial controlled market; later exemptions and mitigation in your path can change its response.`,
    graph: { kind: 'ceiling', description: 'Rent is on the vertical axis; rental units on the horizontal axis. Upward-sloping S and downward-sloping D intersect at equilibrium rent Pe and quantity Qe. The binding ceiling Pc is below Pe. At Pc, Qs is below Qe and Qd is above Qe: Qd > Qs. The bracket from Qs to Qd is the shortage, Qd − Qs. This is an illustrative initial market, not measured Linden quantities or the final market after exemptions.' },
    questions: [
      question('housing-graph', 'At Pc in the diagram, another city allocates the available Qs apartments through a transparent lottery. With the ceiling and curves unchanged, what happens to the shortage bracket?', 0, [
        option('It remains Qd − Qs; the lottery changes who gets the available units.', ''),
        option('It disappears because everyone now has an equal chance.', 'A fairer chance is not a promise of a lease. Compare how many households want units at Pc with how many units are offered.'),
        option('It becomes Qe − Qs because demand stays at the equilibrium quantity.', 'Qe is the quantity at Pe. At the lower controlled price Pc, read the demand curve again: quantity demanded changes too.')
      ], 'At the binding ceiling, Qd exceeds Qs. A lottery can improve transparency while leaving the shortage Qd − Qs unchanged. Relief for successful tenants and access for those still searching remain different outcomes.'),
      question('housing-access', 'Another city lowers an already binding rent ceiling. With upward-sloping rental supply and no new construction, what is the likely effect on access for newcomers?', 1, [
        option('Access improves automatically because every advertised rent is lower.', 'A lower payment helps someone who obtains a lease. Consider how the number seeking units compares with the number owners offer.'),
        option('The shortage widens: more households seek units while fewer units are offered.', ''),
        option('A vacancy lottery eliminates the shortage.', 'A lottery changes who gets the available homes. It does not add homes or remove excess demand.')
      ], 'A binding ceiling can lower rents for protected tenants while worsening access for newcomers. Price relief and housing availability are different outcomes.'),
      housingQuestion(variantIndex(run, 'housing-additionality', override))
    ]
  };
  if (id === 'main-attraction') return {
    title: 'Try the next attraction', intro: pathLink(history.at(-1)),
    questions: [
      parkQuestion(variantIndex(run, 'attraction-margin', override)),
      question('attraction-resale', 'A new museum offers cheap student tickets and expensive general tickets. Student tickets are freely transferable and easy to resell. What threatens this pricing plan?', 2, [
        option('A price difference alone guarantees higher profit.', 'Higher-price customers need a reason they cannot use the cheap tickets. Think about what easy resale lets them do.'),
        option('The museum’s past construction spending becomes a marginal admission cost.', 'Past construction spending does not change when one more ticket is sold. The issue here is keeping customer groups separated.'),
        option('Resale lets general customers buy cheap tickets, weakening the separation between groups.', '')
      ], 'Price discrimination depends on market power, separable customers and limited resale. Transferable discounts can replace full-price sales instead of adding new visits.')
    ]
  };
  if (id === 'ppf') {
    const shock = history.find(h => h.nodeID === 'shock');
    const expanded = history.some(h => h.nodeID === 'final-expanded');
    const point = run.state.utilization < 8 ? 'B' : expanded ? 'C' : 'A';
    return {
      title: 'Read the frontier',
      intro: `During the disruption, you chose “${shock.label}”; resources fell idle without being destroyed. Your final allocation: “${history.at(-1).label}”. ${point === 'B' ? 'Resources remain idle: your outcome is inside the available frontier (like B).' : point === 'C' ? 'Completed improvements expanded capacity: your outcome is on a larger frontier (like C).' : 'Resources are fully used, without realized expansion: your outcome is on the original frontier (like A).'}`,
      graph: { kind: 'ppf', point, expanded, description: 'Household consumer goods run horizontally; capital goods run vertically. A is on the original frontier. B is inside it. C is on a larger, dashed frontier. Moving B toward A restores use of existing capacity. Moving the frontier outward makes C feasible. At full utilization, more of one good requires less of the other.' },
      questions: [
        question('ppf-idle', 'A neighboring economy repairs its job-matching system. Previously idle workers return, but equipment and technology are unchanged. Which movement on the diagram represents recovery?', 1, [
          option('The original frontier shifts to the dashed frontier.', 'Recovery uses resources that were already available. An outward frontier needs a change in productive capacity.'),
          option('From B toward the original frontier, such as A.', ''),
          option('From A to another point on the original frontier.', 'Movement along a frontier reallocates fully used resources. This economy began with unused workers.')
        ], 'B is inside the frontier. Re-employing idle resources can increase both outputs without expanding the frontier.'),
        question('ppf-growth', 'Training and better equipment are now completed and usable in that economy, raising what the same workforce can produce. What does the dashed frontier represent?', 2, [
          option('Only a preference for more household goods.', 'Preferences can change the desired mix without changing what is feasible. Here productive capability changed.'),
          option('Idle capacity, even when resources are fully used.', 'Idle capacity puts output inside a given frontier. It does not by itself create a larger feasible set.'),
          option('An outward shift: combinations such as C become feasible.', '')
        ], 'Realized productivity gains expand the production possibilities frontier. Projects still in preparation do not automatically create that capacity today.'),
        question('ppf-cost', 'At A, all resources are efficiently used. Before any productivity gains arrive, planners produce more capital goods. What is the immediate opportunity cost?', 0, [
          option('Household consumer goods that those resources could have produced.', ''),
          option('Nothing, because investment pays off later.', 'A later benefit does not release workers or equipment for two jobs today. Identify the current alternative use.'),
          option('An automatic inward shift of the whole frontier.', 'Changing the mix does not destroy productive capacity. It moves production along the same frontier.')
        ], 'Scarce resources move from consumer goods to capital goods. Future growth may repay that sacrifice, but it does not remove today’s forgone consumption.')
      ]
    };
  }
  if (id === 'megastar-mania') {
    const market = ticketMarket(run), status = market.status;
    return {
      title: 'Here is what economists draw',
      intro: `You already saw this happen. Your last choice was “${history.at(-1).label}”: ${history.at(-1).mechanism.toLowerCase()}. The diagram shows your final ticket market (${status}) at the price you retained. Fan interest is preference strength, not a ticket count.`,
      graph: { kind: 'market', status, description: `S is fixed remaining capacity; D slopes downward as a higher price reduces quantity demanded. At your posted price, ${status === 'shortage' ? 'Qd lies to the right of Qs: requests exceed capacity.' : status === 'surplus' ? 'Qd lies to the left of Qs: capacity exceeds requests.' : 'Qd and Qs coincide: requests match capacity.'} This schematic uses your price-sensitive market result, with no numerical price or quantity scale.` },
      questions: [
        question('market-reading', 'Hold the remaining schedule and fan preferences fixed. What does your graph imply at the posted price?', ['shortage','balanced','surplus'].indexOf(status), [
          option('Requests exceed seats; unmet demand puts upward pressure on price.', status === 'surplus' ? 'Unsold seats mean capacity exceeds requests, rather than the reverse. Read Qd and Qs at the posted-price line.' : 'A shortage needs Qd to exceed Qs. Compare their positions on the posted-price line.'),
          option('Requests match seats; there is no shortage or surplus at this price.', 'Balance requires Qd and Qs to coincide. Compare where demand and capacity meet the posted-price line.'),
          option('Seats exceed requests; unsold capacity puts downward pressure on price.', status === 'shortage' ? 'Fans still seeking seats indicate unmet demand, not unsold capacity. Read Qd and Qs at the posted-price line.' : 'A surplus needs Qs to exceed Qd. Compare their positions on the posted-price line.')
        ], `${marketCopy[status]} This describes pressure, not a forced price change or a guarantee of maximum profit. For fixed short-run capacity, the intersection of D and S is the market-clearing price.`),
        question('market-shift', 'For another artist, a new hit increases fan interest while the ticket price and remaining schedule stay fixed. What changes in this model?', 1, [
          option('Supply shifts right because more fans want tickets.', 'Wanting tickets does not create performances or seats. Identify which side of the market changed.'),
          option('Demand shifts right; quantity demanded rises, but sales cannot exceed remaining capacity.', ''),
          option('Only movement along the same demand curve.', 'Movement along the same demand curve comes from a price change. The ticket price is unchanged here; preferences changed.')
        ], 'Stronger preferences shift demand right at a given price. A price cut instead moves along demand. If the schedule is already sold out, more interest can intensify shortage without raising ticket sales or the artist’s receipts at the fixed price.')
      ]
    };
  }
  if (id === 'gameday-rivals') return {
    title: 'A different promotion game',
    intro: `Your season included ${history.filter(h => h.playerAction === 'aggressive').length} Aggressive choices in ${history.length} games. In your game, Aggressive had a one-shot advantage against either rival offer. Now consider a different delivery market where matching an aggressive promotion is much more expensive. These hypothetical profits replace the season’s payoff matrix for this task only.`,
    table: { caption: 'New market · profit per game, you / rival', headers: ['Your offer', 'Rival Standard', 'Rival Aggressive'], rows: [['Standard', '$120 / $120', '$50 / $140'], ['Aggressive', '$140 / $50', '$40 / $40']] },
    questions: [question('rivals-transfer', 'With no future rounds, which offer gives you the higher profit against each rival offer in this NEW market?', 1, [
      option('Aggressive against either rival offer, just as in the season.', 'Against an Aggressive rival, compare your $40 from Aggressive with your $50 from Standard. The changed matching cost matters.'),
      option('Aggressive against Standard; Standard against Aggressive. Neither offer is dominant.', ''),
      option('Standard against either rival offer because mutual Standard has the highest combined profit.', 'Against a Standard rival, compare your own $120 with $140. The highest joint profit need not be your individual best response.')
    ], 'Against Standard, $140 beats $120; against Aggressive, $50 beats $40. Neither offer is dominant, and mutual Aggressive is no longer a Nash equilibrium: either firm could gain by switching alone. Re-check incentives when payoffs change; the season’s result is not universal.')]
  };
  return null;
}

export function evaluateAnswer(task, index) {
  if (!Number.isInteger(index) || !task.options[index]) return null;
  return { correct: index === task.correct, feedback: index === task.correct ? task.explanation : task.options[index].feedback };
}
