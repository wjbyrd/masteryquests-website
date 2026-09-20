const chosen = id => ({ chosen: id });
const lte = (state, value) => ({ state, op: 'lte', value });
const gte = (state, value) => ({ state, op: 'gte', value });
const all = (...conditions) => ({ all: conditions });
const any = (...conditions) => ({ any: conditions });
const not = condition => ({ not: condition });
const recovery = any(...['full','phased','equipment'].map(id => chosen(`recovery.${id}`)));
const invested = any(...['invest','hold','consumption'].map(id => chosen(`investment-ready.${id}`)), ...['restart','continue'].map(id => chosen(`investment-slack.${id}`)));
const allocated = any(...['hold','consumption','capital'].map(id => chosen(`final-current.${id}`)));
const variant = (id, label, alt, when) => ({ id, src: `./art/scenes/the-economys-edge/${id}.webp`, label, alt, ...(when ? { when } : {}) });
export default {
  width: 1448, height: 1086, initial: 'balanced',
  variants: [
    variant('growth', 'Expanded productive capacity', 'The same four views show more productive equipment at top left and completed technology and infrastructure at top right. Workers and equipment are active below, and household activity is stronger at bottom right. Completed improvements make more of both outputs possible.', any(...['hold','consumption','capital'].map(id => chosen(`final-expanded.${id}`)))),
    variant('slowdown', 'Unused productive capacity', 'Quieter capital production at top left and household activity at bottom right accompany more idle workers and equipment at bottom left. Future projects remain at top right. The unused resources represent lost production, not destroyed productive capacity.', any(lte('utilization', 5), all(any(...['wait','coordinate','households'].map(id => chosen(`shock.${id}`))), not(recovery)), all(lte('utilization', 7), invested))),
    variant('recovery', 'Resources returning to use', 'Activity resumes in the familiar capital and household sectors. Workers and equipment at bottom left are returning to use, while future projects at top right remain in preparation. Recovery uses existing capacity rather than creating a larger frontier.', any(all(recovery, not(invested)), all(chosen('investment-slack.restart'), not(allocated)), chosen('final-slack.restore'))),
    variant('consumption', 'More household goods', 'The bottom-right household sector is busier and top-left capital production is lighter. Idle resources remain limited at bottom left, and the top-right growth projects continue at a quieter pace. The economy has reallocated its existing capacity toward consumption.', all(gte('utilization', 8), gte('consumption', 6))),
    variant('capital', 'More capital goods', 'Machinery production at top left and projects at top right are more active. Bottom-right household activity is quieter, with limited idle resources at bottom left. More capital production costs current household output; projects are still preparing future capacity.', all(gte('utilization', 8), gte('capital', 6))),
    variant('balanced', 'A balanced production mix', 'Four views of one economy: capital production at top left, technology and training at top right, idle-resource space at bottom left and household goods at bottom right. Most workers and equipment are in use, with current production shared between capital and household goods.')
  ]
};
