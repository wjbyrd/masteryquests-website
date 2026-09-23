const pipeline = { any: [{ chosen: 'supply.reform' }, { chosen: 'supply.subsidy' }, { chosen: 'supply.exempt' }] };
const delivered = { any: [{ chosen: 'review.access' }, { chosen: 'review.protect' }] };
export default {
  width: 1448, height: 1086, initial: 'pressure',
  // First match wins. Deterioration remains visible even when construction exists.
  variants: [
    { id: 'maintenance', src: './art/scenes/maintenance.webp', label: 'Deferred maintenance', when: { state: 'quality', op: 'lte', value: 3 },
      alt: 'The same waterfront neighborhood has cracked facades, damaged roofs, boarded windows and torn shop awnings. Barriers mark deferred upkeep; the consequences and quality indicator explain the economic effects.' },
    { id: 'homes', src: './art/scenes/homes.webp', label: 'New homes completed', when: { all: [pipeline, delivered, { state: 'availability', op: 'gte', value: 5 }] },
      alt: 'A completed apartment building with balconies and a planted rooftop adds housing to the waterfront neighborhood. Shops, the clock tower and promenade remain. More homes alone do not resolve every affordability or budget problem.' },
    { id: 'construction', src: './art/scenes/construction.webp', label: 'Housing under construction', phases: ['decision', 'consequence'],
      when: { all: [pipeline, { not: delivered }] },
      alt: 'A crane, exposed apartment frame, workers, materials and blue fencing mark a housing construction site in the same waterfront neighborhood. These homes are being built but are not yet available to tenants.' },
    { id: 'pressure', src: './art/scenes/pressure.webp', label: 'Limited vacancies', when: { state: 'availability', op: 'lte', value: 3 },
      alt: 'A queue waits beneath the yellow-striped awning beside a housing symbol. More people fill the sidewalks and apartment windows glow above them, illustrating competition for limited vacancies in the same waterfront neighborhood.' },
    { id: 'baseline', src: './art/scenes/baseline.webp', label: 'Existing neighborhood',
      alt: 'An elevated illustrated view of Linden: apartment buildings and shops, a clock tower, striped awnings, trees, cars and a bus shelter. A sailboat passes the waterfront promenade, with a city skyline behind the neighborhood.' }
  ]
};
