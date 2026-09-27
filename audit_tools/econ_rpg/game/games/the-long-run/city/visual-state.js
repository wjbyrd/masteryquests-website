/* Read-only boundary: economics -> presentation. Nothing here writes to a run.
   Classic scripts keep this prototype usable over HTTP and as a local file. */
window.LongRunCity = window.LongRunCity || {};
(() => {
  'use strict';
  const limit = (n, lo, hi) => Math.max(lo, Math.min(hi, n));
  const TUNING = Object.freeze({
    width: 480, height: 270, spriteFPS: 8, maxDelta: .05,
    maxPeople: 24, maxVehicles: 9, walkSpeed: [12, 17],
    walkFrames: 8, strideDistance: 16, turnSeconds: .18,
    trafficSpeed: [29, 35], vehicleGap: 14, cloudSpeed: 1.4,
    transitionSeconds: 1.7, indoorSeconds: 3.5,
    laneY: [181, 204], sidewalkY: 150, frontY: 216, bottomY: 264
  });
  function channels(s) {
    const supplyStress = limit(-s.supplyShift / 13, 0, 1.5);
    const pay = (1 + (s.productivity - 50) * .003) * (s.unemployment >= 7 ? 0 : s.unemployment >= 5.8 ? .72 : 1);
    const householdStrain = limit(1 - pay / (s.priceLevel / 100), 0, 1);
    return {
      retail: limit(1 + (s.consumerConfidence - 50) / 23 + (s.aggregateDemand - 100) / 65 - householdStrain * .45, .15, 2.3),
      labor: limit(1 + (4.5 - s.unemployment) / 4, .1, 1.7),
      idleLabor: limit(Math.round(s.unemployment - 4), 0, 3),
      privateInvestment: limit((s.businessInvestment - 35) / 20, 0, 2.8),
      publicInvestment: limit((s.governmentDemand - 43) / 10, 0, 2.5),
      factoryOutput: limit(1 + (s.realGDP - 100) / 24 + (s.productivity - 50) / 25 - supplyStress * .4, .1, 2.8),
      factoryEfficiency: limit(1 + (s.productivity - 50) / 16, .5, 3),
      freight: limit(1 + (s.realGDP - 100) / 30 + (s.productivity - 50) / 22 - supplyStress * .8, .08, 2.6),
      passenger: limit(1 + (s.consumerConfidence - 50) / 30 - householdStrain * .4, .2, 2),
      supplyStress, householdStrain,
      pricePressure: limit((s.inflation - 2.2) / 4, 0, 2),
      basket: 24 * s.priceLevel / 100,
      fuel: 3.49 * s.priceLevel / 100 * (1 + Math.max(0, -s.supplyShift) * .024),
      interestRate: s.interestRate
    };
  }
  // Reconstruct durable assets from realized annual snapshots, never frame count,
  // elapsed wall time, queued effects, or a table of choice paths. Repeated sync is safe.
  function memory(history) {
    let privateWork = 0, publicWork = 0, capacity = 0, wear = 0;
    for (const { state: s } of history) {
      if (s.year > 1) {
        privateWork += Math.max(0, s.businessInvestment - 52) / 20;
        publicWork += Math.max(0, s.governmentDemand - 52) / 16;
        wear = limit(wear + Math.max(0, s.unemployment - 6) * .3 - Math.max(0, s.governmentDemand - 52) * .035, 0, 3);
      }
      capacity = Math.max(capacity, s.potentialGDP - 100);
    }
    return { privateWork: limit(privateWork, 0, 3), publicWork: limit(publicWork, 0, 3), capacity, wear };
  }
  function adapt(economy) {
    const current = channels(economy), previous = channels(economy.previous || economy);
    // The leading mechanism comes from changes in realized quantities. Choice IDs
    // and historic flags cannot make an old shock fire again on a later year.
    const ds = current.supplyStress - previous.supplyStress;
    const de = current.factoryEfficiency - previous.factoryEfficiency;
    const dg = current.publicInvestment - previous.publicInvestment;
    const dr = current.retail - previous.retail;
    const mechanism = ds > .25 ? 'supply' : de > .2 ? 'productivity' : dg > .3 ? 'public' : dr > .2 ? 'demand' : 'adjustment';
    return { year: economy.year, current, previous, mechanism,
      assets: memory(economy.history),
      previousAssets: memory(economy.history.slice(0, -1)),
      signature: JSON.stringify([economy.year, current, economy.history.map(e => e.state.businessInvestment)]) };
  }
  const DELAYS = {
    demand: { retail: 0, passenger: .1, freight: .45, factoryOutput: .85, labor: .9, privateInvestment: 1.1 },
    supply: { supplyStress: 0, freight: 0, factoryOutput: .35, labor: .8, retail: 1, householdStrain: 1 },
    productivity: { factoryEfficiency: 0, factoryOutput: .2, freight: .5, privateInvestment: 1, labor: 1.1, retail: 1.1 },
    public: { publicInvestment: 0, labor: .45, retail: .8, factoryOutput: .85, privateInvestment: 1.1 },
    adjustment: { privateInvestment: .15, retail: .25, factoryOutput: .4, freight: .5 }
  };
  class VisualController {
    constructor() { this.target = null; this.elapsed = 0; }
    sync(next, instant) {
      if (this.target?.signature === next.signature) { if (instant) this.settle(); return false; }
      this.from = this.target && next.year > this.target.year ? this.value : next.previous;
      this.target = next;
      this.elapsed = instant || next.year === 1 ? TUNING.transitionSeconds : 0;
      this.update(0);
      return true;
    }
    settle() { if (this.target) { this.elapsed = TUNING.transitionSeconds; this.update(0); } }
    update(dt) {
      if (!this.target) return;
      this.elapsed = Math.min(TUNING.transitionSeconds, this.elapsed + dt);
      const delays = DELAYS[this.target.mechanism];
      this.value = Object.fromEntries(Object.entries(this.target.current).map(([key, to]) => {
        const progress = limit((this.elapsed - (delays[key] ?? .35)) / .55, 0, 1);
        return [key, progress === 1 ? to : this.from[key] + (to - this.from[key]) * progress];
      }));
      const progress = limit((this.elapsed - 1) / .65, 0, 1);
      this.assets = Object.fromEntries(Object.entries(this.target.assets).map(([key, to]) =>
        [key, this.target.previousAssets[key] + (to - this.target.previousAssets[key]) * progress]));
    }
  }
  Object.assign(window.LongRunCity, { TUNING, limit, adapt, channels, memory, VisualController });
})();
