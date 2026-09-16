import { GROUPS as LEGACY_GROUPS, BOARDS as LEGACY_BOARDS } from './pools/v1.js';
import { MICRO_GROUPS } from './pools/micro-v2.js';
import { MACRO_GROUPS } from './pools/macro-v2.js';
import { BOARDS as LOCAL_BOARDS } from './pools/calendar-v2.js';

export const POOL_VERSION = '2';
const authoredGroups = [...MICRO_GROUPS, ...MACRO_GROUPS];
// Authored ambiguity families are conservative exclusion rules, not a runtime
// board generator. Materialize explicit incompatibleWith IDs for every group.
export const GROUPS = authoredGroups.map(group => ({ ...group,
  incompatibleWith: authoredGroups.filter(other => other.id !== group.id && other.domain === group.domain
    && group.ambiguityFamilies.some(family => other.ambiguityFamilies.includes(family))).map(other => other.id),
}));
export const BOARDS = LOCAL_BOARDS;
// v1 is a frozen historical answer key. Do not migrate its dates or overwrite it.
export const PUZZLE_POOLS = {
  '1': { groups: LEGACY_GROUPS, boards: LEGACY_BOARDS, dateBasis: 'utc' },
  '2': { groups: GROUPS, boards: BOARDS, dateBasis: 'local' },
};
