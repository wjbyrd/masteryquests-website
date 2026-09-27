/* One RAF owns movement, sprites, environment and visual sequencing.
   No DOM reads in the loop. Motion/visibility observers only change cached flags. */
(() => {
  'use strict';
  const { TUNING: T, adapt, VisualController, World, SpriteAtlas, Town } = window.LongRunCity;
  class LongRunRenderer {
    constructor(canvas, shell, motionQuery) {
      this.canvas = canvas; canvas.width = T.width; canvas.height = T.height;
      this.ctx = canvas.getContext('2d', { alpha: false }); this.ctx.imageSmoothingEnabled = false;
      this.world = new World(); this.controller = new VisualController(); this.atlas = new SpriteAtlas(); this.town = new Town(this.ctx);
      this.shell = shell; this.motionQuery = motionQuery; this.raf = 0; this.lastTime = null; this.frameCount = 0;
      this.flags = { paused: shell.classList.contains('paused'), finished: shell.classList.contains('finished'), reduced: motionQuery.matches, hidden: document.hidden };
      this.onShell = () => {
        this.flags.paused = shell.classList.contains('paused'); this.flags.finished = shell.classList.contains('finished');
        if (this.flags.finished) { this.controller.settle(); this.draw(); }
        this.reconcile();
      };
      this.onVisibility = () => { this.flags.hidden = document.hidden; this.reconcile(); };
      this.onPreference = () => {
        this.flags.reduced = motionQuery.matches;
        if (this.flags.reduced && this.controller.target) {
          this.controller.settle(); this.world.staticState(this.controller.value); this.draw();
        }
        this.reconcile();
      };
      this.observer = new MutationObserver(this.onShell); this.observer.observe(shell, { attributes: true, attributeFilter: ['class'] });
      document.addEventListener('visibilitychange', this.onVisibility); motionQuery.addEventListener('change', this.onPreference);
      this.tick = this.tick.bind(this);
    }
    sync(economy) {
      const next = adapt(economy), restart = this.controller.target && next.year < this.controller.target.year;
      if (restart) { this.world.reset(); this.controller = new VisualController(); }
      // Paused city still reflects an explicit economic decision as one static scene.
      const instant = this.flags.paused || this.flags.reduced || economy.phase !== 'watching';
      const changed = this.controller.sync(next, instant);
      this.world.visual = this.controller.value;
      if (instant && changed) this.world.staticState(this.controller.value);
      else if (!this.world.seeded) this.world.seed();
      this.draw(); this.reconcile();
    }
    canAnimate() { return this.controller.target && !Object.values(this.flags).some(Boolean); }
    reconcile() {
      if (this.raf) cancelAnimationFrame(this.raf);
      this.raf = 0; this.lastTime = null;
      if (this.canAnimate()) this.raf = requestAnimationFrame(this.tick);
    }
    tick(timestamp) {
      this.raf = 0;
      if (!this.canAnimate()) return;
      const dt = this.lastTime === null ? 0 : Math.min(T.maxDelta, (timestamp - this.lastTime) / 1000);
      this.lastTime = timestamp;
      this.controller.update(dt); this.world.update(dt, this.controller.value); this.draw();
      this.raf = requestAnimationFrame(this.tick);
    }
    draw() {
      if (!this.controller.target) return;
      const { world, town, ctx } = this, v = this.controller.value, assets = this.controller.assets;
      town.background(world, assets); town.rear(world, v, assets);
      const people = world.people.filter(p => p.active && p.state !== 'inside');
      const draw = actor => this.atlas.draw(ctx, actor, actor.type === 'van' && v.publicInvestment > .9);
      // Ground-contact sorting gives rear pedestrians / far lane / near lane / front
      // pedestrians consistent occlusion. Lower premises then cover the rear footway.
      people.filter(p => p.y < T.frontY).sort((a, b) => a.y - b.y || a.id - b.id).forEach(draw);
      town.streetFurniture();
      world.vehicles.slice().sort((a, b) => a.y - b.y).forEach(draw);
      people.filter(p => p.y === T.frontY).sort((a, b) => a.id - b.id).forEach(draw);
      town.foreground(world, v, assets);
      people.filter(p => p.y > T.frontY).sort((a, b) => a.y - b.y || a.id - b.id).forEach(draw);
      town.furniture(world); this.frameCount++;
    }
    inspect() {
      return { ...this.world.inspect(), visual: { ...this.controller.value }, assets: { ...this.controller.assets },
        mechanism: this.controller.target?.mechanism, transition: this.controller.elapsed,
        frameCount: this.frameCount, running: !!this.raf, spriteSheets: this.atlas.cache.size };
    }
    describeAssets() {
      const a = this.controller.target.assets;
      return `City history: the private project ${a.privateWork >= 2.7 ? 'has become permanent new workshops' : a.privateWork > 1.2 ? 'has walls and a structural frame' : a.privateWork > .25 ? 'has a structural frame' : 'is at its foundation'}. ` +
        `${a.capacity >= 3 ? 'Earlier capacity gains have added a permanent factory annex. ' : ''}` +
        `${a.publicWork >= 1 ? 'Public improvements include a repaired footway and a bus shelter. ' : a.publicWork > .2 ? 'Public purchases have improved part of the footway. ' : ''}` +
        `${a.wear > .6 ? 'Earlier labor-market weakness has left worn pavement; renewed public activity can repair it.' : ''}`;
    }
    destroy() {
      if (this.raf) cancelAnimationFrame(this.raf);
      this.raf = 0; this.observer.disconnect();
      document.removeEventListener('visibilitychange', this.onVisibility); this.motionQuery.removeEventListener('change', this.onPreference);
    }
  }
  window.LongRunCity.LongRunRenderer = LongRunRenderer;
})();
