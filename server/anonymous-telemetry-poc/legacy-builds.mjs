// Server-owned candidates only. No production sunset has been approved.
export const LEGACY_BUILDS = Object.freeze([Object.freeze({
  game_id: 'faculty-composer',
  build_id: 'composer-ede71cd5d8134f4b3997592ae992e19f5014d27d17d6c5a626232fc5ef9c4a8a',
  build_version: '296544b1222894d84c67298257964b1bfa4808212cad18c5e6e0fd4c1cafd09f',
  schema_version: 3,
  allowed_origin: 'https://masteryquests.org',
  sunset_at: null
})]);
// null means PENDING OWNER ACTIVATION, never unlimited grace. Active validation rejects it.
// Source: beta-testing/composer-telemetry-live-test/index.html, verified by the HTTP suite.
// Private Managerial POC/classroom artifacts are collection-disabled and are not inventoried.
