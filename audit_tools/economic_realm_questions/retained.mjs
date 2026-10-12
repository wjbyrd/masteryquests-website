// These phase-2 supplements postdate the Composer import. They have no source
// provenance match. Retain their reviewed local content and coverage verbatim;
// bare numeric IDs in other Composer modules are NOT corresponding questions.
export const retained = {
 'market-gate':Object.fromEntries([
  [41000,'production-possibilities-frontier'],[41001,'production-possibilities-frontier'],
  [41002,'production-possibilities-frontier'],[41003,'production-possibilities-frontier'],
  [41004,'production-possibilities-frontier'],[41005,'production-possibilities-frontier'],
  [41006,'binding-price-ceilings'],[41007,'binding-price-floors'],
  [41008,'market-equilibrium'],[41009,'market-equilibrium'],
  [41010,'statutory-versus-economic-tax-incidence'],[41011,'statutory-versus-economic-tax-incidence'],
  [41012,'demand'],[41013,'demand']
 ]),
 'national-ledger':Object.fromEntries([
  ...[42000,42001,42002,42011,43000,43004,44000,44005].map(id=>[id,'unemployment-measurement']),
  ...[42003,42004,42005,42006,42007,42009,43001,43002,43003,44001,44002,44003,44004].map(id=>[id,'sources-of-productivity']),
  ...[42008,42010].map(id=>[id,'living-standards-and-growth']),
  ...[44006,44007].map(id=>[id,'real-versus-nominal-gdp'])
 ])
};
