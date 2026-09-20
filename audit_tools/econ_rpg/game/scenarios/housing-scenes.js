const pipeline = { any: [{ chosen: 'supply.reform' }, { chosen: 'supply.subsidy' }] };
const delivered = { any: [{ chosen: 'review.access' }, { chosen: 'review.protect' }] };
export default {
  asset: './art/neighborhood.svg', label: 'Linden · Housing district', initial: 'baseline',
  // First match wins. Deterioration remains visible even when construction exists.
  variants: [
    { id: 'maintenance', label: 'Deferred maintenance', when: { state: 'quality', op: 'lte', value: 3 },
      alt: 'The same waterfront neighborhood, with boarded windows, cracked plaster and repair scaffolding on older apartments. Deferred maintenance is also explained in the consequences and quality indicator.' },
    { id: 'homes', label: 'New homes completed', when: { all: [pipeline, delivered, { state: 'availability', op: 'gte', value: 5 }] },
      alt: 'New apartments with balconies and an occupied entrance replace the small service yard. The existing shops and neighborhood remain. More homes do not by themselves resolve every affordability or budget problem.' },
    { id: 'construction', label: 'Housing under construction', phases: ['decision', 'consequence'],
      when: { all: [pipeline, { not: delivered }] },
      alt: 'A crane, structural frame and work-site fencing occupy the service yard. Homes are being built but are not yet available to tenants.' },
    { id: 'pressure', label: 'Limited vacancies', when: { state: 'availability', op: 'lte', value: 3 },
      alt: 'A larger queue waits outside the lettings office beneath warm, curtained apartment windows. A viewing sign and the occupied homes illustrate competition for limited vacancies in the same waterfront neighborhood.' },
    { id: 'baseline', label: 'Existing neighborhood',
      alt: 'An elevated 2D view of Linden: terracotta, teal and ochre apartment buildings, balconies, a grocer, cafe, repair shop and cycle shop, a bus shelter, crosswalks, trees and a waterfront promenade.' }
  ]
};
