// Authoring shorthand only. Relationships and calendar entries are static data.
export const relationship = (id, difficulty, category, title, tiles, explanation, concepts, families, notes) => ({
  id, domain: id.startsWith('mi-') ? 'micro' : 'macro', category, difficulty,
  title, tiles, explanation, concepts: Array.isArray(concepts) ? concepts : [concepts],
  tags: [...families], ambiguityFamilies: [...families], sourceObjectives: [],
  notes, incompatibleWith: [],
});
