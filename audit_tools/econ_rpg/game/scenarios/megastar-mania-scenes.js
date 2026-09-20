import { all, any, not, chosen, gte, stageChosen, marketIs, marketCondition } from './megastar-mania-market.js';
const expanded = any(chosen('expansion.dates'), chosen('expansion.venues'));
const illness = stageChosen('illness', ['cancel', 'postpone', 'recovery']);
const publicity = stageChosen('publicity', ['acknowledge', 'quiet', 'image']);
const crossover = any(chosen('crossover.experiment'), chosen('crossover.full'));
const variant = (id, label, alt, when, phases) => ({ id, src: `./art/scenes/megastar-mania/${id}.webp`, label, alt, ...(when ? { when } : {}), ...(phases ? { phases } : {}) });
export default {
  width: 1448, height: 1086, initial: 'baseline',
  variants: [
    variant('supply-shock', 'Canceled performances · fewer tickets available', 'The waterfront venue is dark and closed, its seats empty. A tour map marks canceled dates and security staff stand beside the shut gates. No audience waits for a performance. Illness has removed shows from the current tour.', all(illness, not(publicity)), ['consequence']),
    variant('demand-drop', 'Remaining shows · weaker ticket sales', 'Jules performs at the open waterfront venue, but many seats are empty and the grounds are quiet. The stage and seating are still available. Weaker public interest, together with the posted price, leaves tickets unsold.', all(publicity, marketIs('surplus'))),
    variant('demand-boom', 'New listeners · strong demand', 'An energized crowd fills the waterfront concert venue as Jules performs. The busy grounds and strong audience response accompany new listeners discovering the music. Existing performances attract more buyers; no extra dates have been added.', all(crossover, gte('demand', 6), marketCondition(m => m.wanted >= m.supply))),
    variant('expanded-tour', 'More dates and seats on the tour map', 'A large illuminated tour map dominates the waterfront scene, with many connected stops, touring buses and production equipment. Strong attendance accompanies the expanded schedule. The map represents more performances and seats, not more consumer demand.', all(expanded, not(illness), marketCondition(m => m.wanted >= m.supply))),
    variant('shortage', 'Sold out · some fans cannot get tickets', 'The waterfront venue is packed. A sold-out sign and long lines of shut-out fans show that more people want tickets at the official price than there are tickets available for the continuing performances.', marketIs('shortage')),
    variant('surplus', 'Open seats · downward pressure on price', 'Jules performs on the lit waterfront stage, with substantial empty seating and only a small crowd on the grounds. The concert is operating, but available tickets exceed the number buyers want at the posted price.', marketIs('surplus')),
    variant('baseline', 'A healthy concert market', 'The waterfront concert venue has a lively but measured audience, with a lit stage, touring buses and visitors around the entrance. This neutral view represents a healthy market without a major shortage or surplus.')
  ]
};
