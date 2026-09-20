const chosen = id => ({ chosen: id });
const gte = (state, value) => ({ state, op: 'gte', value });
const lte = (state, value) => ({ state, op: 'lte', value });
const delivered = { any: ['broaden','differentiate','course'].map(id => chosen(`competition.${id}`)) };
const variant = (id, label, alt, when) => ({ id, src: `./art/scenes/main-attraction/${id}.webp`, label, alt, ...(when ? { when } : {}) });
export default {
  width: 1448, height: 1086, initial: 'baseline',
  variants: [
    variant('maintenance', 'Deferred upkeep', 'The same park shows worn roofs, faded surfaces, patchy paths and fenced repair areas among operating rides. Deferred work and its effect on guests are explained in the consequences.', { all: [chosen('maintenance.defer'), lte('experience', 3)] }),
    variant('upgraded', 'Expansion open', 'A new balloon ride and refreshed visitor areas add to the familiar Ferris wheel, coaster and waterfront park. Expanded capacity is now in use; the earnings and access tradeoffs remain in the text.', { all: [chosen('investment.expand'), delivered] }),
    variant('construction', 'Expansion under construction', 'Fencing, building equipment and an unfinished attraction occupy a work site beside the operating amusement park. The construction adds no usable ride capacity until the following season.', { all: [chosen('investment.expand'), { not: delivered }] }),
    variant('crowded', 'Crowded midway', 'Dense crowds and long lines fill the paths between the familiar rides, concessions and entrance. More people have access, while the text explains waiting and capacity constraints.', { any: [{ all: [gte('access', 6), lte('capacity', 5)] }, { all: [gte('access', 7), lte('capacity', 6)] }] }),
    variant('premium', 'Premium operation', 'The familiar park has fewer visitors, carefully maintained rides and spacious visitor areas. This lower-volume presentation supports a premium offer; it does not indicate a best outcome.', { all: [lte('access', 4), gte('experience', 5), { any: [chosen('admission.raise'), chosen('steady-midway.priority'), chosen('busy-midway.priority'), chosen('competition.differentiate')] }] }),
    variant('baseline', 'Existing park', 'An elevated view of Starhaven Park: a Ferris wheel, red roller coaster, carousel, concessions, queues and service area beside a river. The functioning park has moderate crowds and well-maintained visitor areas.')
  ]
};
