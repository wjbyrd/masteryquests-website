/* Fixed-camera town, authored at 480 x 270. Every coordinate is a world pixel.
   Layer boundaries live here; economic quantities arrive only as visual values. */
(() => {
  'use strict';
  const { brush, lettering, line, TUNING: T } = window.LongRunCity;
  const DOORS = {
    cafe: { width: 18, height: 30, frame: 'wood', leaf: 'ochre' },
    market: { width: 18, height: 30, frame: 'teal', leaf: 'glass' },
    bank: { width: 20, height: 30, frame: 'sand', leaf: 'wood' },
    factory: { width: 18, height: 30, frame: 'metalShade', leaf: 'slate' },
    home: { width: 16, height: 24, frame: 'cream', leaf: 'coral' },
    civic: { width: 22, height: 21, frame: 'concrete', leaf: 'wood' },
    workshop: { width: 20, height: 28, frame: 'wood', leaf: 'bark' }
  };
  class Town {
    constructor(ctx) { this.ctx = ctx; this.r = brush(ctx); }
    box(x, y, w, h, color, edge = 'ink') {
      this.r(x, y, w, h, edge); this.r(x + 1, y + 1, w - 2, h - 2, color);
    }
    sign(text, x, y, w, color = 'cream', ink = 'ink') {
      this.r(x + 1, y + 2, w, 9, 'metalShade'); this.box(x, y, w, 9, color);
      this.r(x + 1, y + 1, w - 2, 1, color === 'cream' ? 'paper' : 'steel');
      lettering(this.r, text, x + Math.floor((w - text.length * 4 + 1) / 2), y + 2, ink);
    }
    window(x, y, w = 12, h = 15, lit = true) {
      const r = this.r;
      this.box(x - 1, y - 1, w + 2, h + 3, 'steel'); this.box(x, y, w, h, 'deep');
      r(x + 2, y + 2, w - 4, h - 4, lit ? 'sun' : 'glass');
      r(x + 2, y + 2, w - 4, 2, lit ? 'sand' : 'metalShade');
      r(x + 2, y + 4, Math.max(2, w - 7), h - 6, lit ? 'cream' : 'glassLight');
      for (let d = 0; d < Math.min(w - 4, h - 5); d++) r(x + 2 + d, y + h - 4 - d, 1, 1, lit ? 'paper' : 'steel');
      r(x + Math.floor(w / 2), y + 1, 1, h - 2, 'wood'); r(x + 1, y + Math.floor(h / 2), w - 2, 1, 'wood');
      r(x - 2, y + h + 1, w + 4, 1, 'cream');
      r(x, y + h + 2, w + 3, 1, 'metalShade'); r(x - 1, y, 1, h, 'metalLight');
    }
    door(x, y, open, style) {
      const r = this.r, d = DOORS[style], left = x - d.width / 2, top = y - d.height;
      this.box(left, top, d.width, d.height, d.frame);
      r(left + 2, top + 2, d.width - 4, d.height - 3, 'deep');
      r(left + 1, top, d.width - 2, 1, style === 'bank' ? 'gold' : 'metalLight');
      r(left + 1, top + 1, 1, d.height - 2, d.frame);
      if (open) {
        // Keep the actor opening clear while retaining the entrance's own materials.
        r(left + 2, top + 3, 2, d.height - 5, d.leaf);
        if (style === 'bank') r(left + d.width - 4, top + 3, 2, d.height - 5, d.leaf);
        if (style === 'market') r(left + 2, y - 12, 3, 1, 'paper');
      } else {
        r(left + 3, top + 3, d.width - 6, d.height - 5, d.leaf);
        switch (style) {
          case 'cafe':
            this.box(x - 5, y - 26, 10, 15, 'glass', 'wood');
            r(x - 4, y - 25, 3, 5, 'glassLight'); r(x, y - 25, 1, 13, 'wood');
            r(x - 4, y - 19, 8, 1, 'wood');
            this.box(x - 4, y - 9, 8, 6, 'bark', 'wood');
            r(x + 4, y - 11, 1, 2, 'gold');
            break;
          case 'market':
            r(x - 5, y - 26, 3, 20, 'glassLight'); r(x + 3, y - 26, 2, 20, 'sea');
            r(x - 6, y - 14, 12, 2, 'teal'); r(x - 3, y - 14, 6, 1, 'paper');
            r(x - 6, y - 5, 12, 3, 'steel');
            break;
          case 'bank':
            for (const offset of [-6, 1]) {
              r(x + offset, y - 25, 5, 16, 'glass'); r(x + offset, y - 25, 2, 12, 'glassLight');
              this.box(x + offset, y - 7, 5, 4, 'ochre', 'wood');
            }
            r(x - 1, y - 27, 2, 25, 'sand');
            r(x - 3, y - 12, 1, 4, 'gold'); r(x + 2, y - 12, 1, 4, 'gold');
            break;
          case 'factory':
            this.box(x - 4, y - 25, 8, 8, 'glass', 'metalShade');
            r(x - 2, y - 24, 1, 6, 'steel'); r(x + 1, y - 24, 1, 6, 'steel');
            r(x - 3, y - 21, 6, 1, 'steel');
            for (let vent = 0; vent < 3; vent++) r(x - 4, y - 9 + vent * 2, 7, 1, 'metalShade');
            r(x + 3, y - 14, 3, 1, 'paper'); r(x - 6, y - 3, 12, 1, 'gold');
            break;
          case 'home':
            this.box(x - 3, y - 20, 6, 6, 'glassLight', 'wood');
            r(x - 1, y - 19, 1, 4, 'cream'); r(x - 2, y - 18, 4, 1, 'cream');
            this.box(x - 3, y - 9, 6, 6, 'brick', 'brickDark');
            r(x - 2, y - 12, 4, 1, 'gold'); r(x + 4, y - 10, 1, 2, 'gold');
            break;
          case 'civic':
            // The low civic portal starts below the Town Hall plaque and its shadow.
            for (const offset of [-7, 2]) {
              this.box(x + offset, y - 17, 5, 6, 'bark', 'ochre');
              this.box(x + offset, y - 8, 5, 5, 'bark', 'ochre');
            }
            r(x - 1, y - 18, 2, 16, 'deep');
            r(x - 3, y - 11, 1, 3, 'gold'); r(x + 2, y - 11, 1, 3, 'gold');
            break;
          case 'workshop':
            for (let plank = -6; plank <= 6; plank += 3) r(x + plank, y - 24, 1, 22, 'wood');
            this.box(x - 5, y - 24, 10, 8, 'glass', 'metalShade');
            r(x - 1, y - 23, 1, 6, 'steel'); r(x - 4, y - 20, 8, 1, 'steel');
            r(x - 6, y - 14, 12, 2, 'sand'); r(x - 6, y - 4, 12, 2, 'sand');
            line(r, x - 5, y - 5, x + 5, y - 13, 'ochre');
            r(x + 4, y - 11, 2, 3, 'ink');
            break;
        }
      }
      r(left - 1, y, d.width + 2, 2, 'metalShade'); r(left - 1, y, d.width + 1, 1, 'metalLight');
    }
    masonry(x, y, w, h, base = 'brick') {
      const r = this.r, mortar = base === 'brick' ? 'mortar' : 'plasterShade';
      for (let row = 0; row < h; row += 5) {
        r(x, y + row, w, 1, mortar);
        for (let col = (row % 10 ? 2 : 7); col < w - 1; col += 12) {
          r(x + col, y + row + 1, 1, Math.min(4, h - row - 1), mortar);
          if ((row + col) % 3 === 0) r(x + col + 2, y + row + 2, Math.min(5, w - col - 2), 1, base === 'brick' ? 'brickLight' : 'cream');
        }
      }
    }
    facade(x, y, w, h, color, side = 'ochre') {
      const r = this.r;
      r(x + 4, y + 4, w, h, 'groundShadow'); this.box(x, y, w, h, color);
      if (color === 'brick') this.masonry(x + 2, y + 4, w - 7, h - 7);
      else if (color === 'sand' || color === 'sun') {
        for (let yy = y + 6; yy < y + h - 3; yy += 5) { r(x + 2, yy, w - 6, 1, 'ochre'); r(x + 2, yy + 1, w - 7, 1, 'sun'); }
      } else if (color === 'paper') {
        for (let yy = y + 7; yy < y + h - 3; yy += 8) {
          r(x + 2, yy, w - 6, 1, 'concrete');
          for (let xx = x + 12 + yy % 3 * 3; xx < x + w - 4; xx += 18) r(xx, yy - 6, 1, 6, 'steel');
        }
      } else {
        for (let xx = x + 7; xx < x + w - 5; xx += 15) { r(xx, y + 4, 1, h - 7, 'metalShade'); r(xx + 1, y + 4, 1, h - 7, 'metalLight'); }
        r(x + 2, y + h - 8, w - 7, 1, 'metalShade');
      }
      r(x + w - 5, y + 1, 4, h - 2, side); r(x + 1, y + 1, w - 6, 2, 'cream');
      r(x + 1, y + 2, 1, h - 4, 'paper'); r(x + 2, y + h - 4, w - 6, 3, side);
      r(x + 2, y + h - 4, w - 7, 1, 'metalShade');
    }
    roof(x, y, w, h, color = 'brickDark', light = 'brick') {
      const r = this.r;
      for (let i = 0; i < h; i++) {
        r(x + h - i, y + i, w - 2 * (h - i), 1, color);
        if (i % 4 === 0) r(x + h - i + 2, y + i, w - 2 * (h - i) - 4, 1, color === 'brickDark' ? 'roofShade' : 'deep');
        if (i % 4 === 2) for (let j = h - i + 2 + i % 3; j < w - h + i - 4; j += 8) {
          r(x + j, y + i, 6, 1, light); r(x + j, y + i + 1, 1, 1, color === 'brickDark' ? 'roofLight' : 'steel');
        }
      }
      r(x, y + h, w, 3, 'ink'); r(x + 2, y + h, w - 4, 1, light);
      r(x + 3, y + h + 3, w - 5, 1, 'metalShade'); r(x + w - 3, y + h + 2, 1, 9, 'steel');
    }
    crate(x, y, w = 10, h = 9) {
      const r = this.r;
      this.box(x, y, w, h, 'sand', 'wood'); r(x + 1, y + 1, w - 3, 1, 'sun'); r(x + w - 3, y + 2, 2, h - 3, 'ochre');
      r(x + 2, y + h - 3, w - 4, 1, 'ochre'); r(x + 3, y + 1, 1, h - 2, 'bark'); r(x + 1, y + 2, 1, h - 4, 'cream');
    }
    tree(x, ground, time = 0) {
      const r = this.r, sway = Math.floor(time / 2 + x) % 4 === 0 ? 1 : 0, y = ground - 39 - x % 3;
      r(x - 7, ground, 21, 2, 'groundShadow'); r(x - 3, ground - 18, 5, 18, 'bark');
      r(x - 3, ground - 16, 1, 14, 'barkLight'); r(x + 1, ground - 15, 2, 15, 'wood');
      line(r, x - 1, ground - 13, x - 7, ground - 23, 'bark', 2); line(r, x, ground - 17, x + 6, ground - 25, 'wood', 2);
      r(x - 12, y + 10, 26, 15, 'leafDeep'); r(x - 9, y + 5, 22, 22, 'leafMid'); r(x - 5, y + 2, 14, 24, 'leaf');
      r(x - 15, y + 14, 6, 8, 'leafMid'); r(x + 10, y + 12, 7, 9, 'leafDeep');
      // Large overlapping clusters, with sparse leaf rims rather than speckle.
      for (const [dx, dy, ww, hh] of [[-9,7,10,9],[-4,1,10,10],[3,6,10,9],[-12,14,11,8],[-3,13,12,11],[6,17,8,7]]) {
        r(x + dx, y + dy + 2, ww, hh, 'leaf'); r(x + dx + 1, y + dy, ww - 3, hh - 2, 'leafLight');
        r(x + dx + 1 + sway, y + dy, Math.max(2, ww - 6), 2, 'leafSun'); r(x + dx + ww - 2, y + dy + hh - 2, 2, 3, 'leafMid');
      }
      r(x - 9, y + 24, 6, 2, 'leafDeep'); r(x + 3, y + 25, 8, 2, 'leafDeep');
    }
    background(world, assets) {
      const r = this.r;
      r(0, 0, 480, 270, 'sky');
      for (const [i, origin] of [12, 151, 292, 438].entries()) {
        const x = (origin + world.time * T.cloudSpeed) % 550 - 35, y = 18 + i % 2 * 10;
        r(x, y + 7, 38, 5, 'cloudShade'); r(x + 3, y + 4, 31, 6, 'cloud'); r(x + 11, y, 15, 7, 'cloud'); r(x + 26, y + 3, 8, 4, 'cloud');
      }
      for (let x = 0; x < 480; x += 8) r(x, 65 + Math.round(Math.sin(x / 41) * 8), 8, 45, 'far');
      for (const [x, y, w] of [[18, 55, 20], [49, 42, 15], [81, 61, 24], [135, 43, 19], [202, 57, 22], [245, 47, 16], [305, 49, 22], [390, 40, 18], [444, 54, 25]]) {
        r(x, y, w, 52, '#7da5cd'); r(x + w - 3, y, 3, 52, '#668ab8');
        for (let yy = y + 5; yy < 94; yy += 9) for (let xx = x + 3; xx < x + w - 4; xx += 6) r(xx, yy, 2, 3, '#c1def3');
      }
      r(0, 103, 480, 167, 'grass');
      for (let x = 4; x < 480; x += 23) {
        for (const y of [110 + x % 7, 227 + x % 5, 248]) { r(x, y, 3, 1, 'lightGrass'); r(x + 2, y - 1, 1, 1, 'leafLight'); r(x + 8, y + 3, 2, 1, 'leaf'); }
      }
      r(0, 137, 480, 21, 'paving'); r(0, 156, 480, 2, 'steel'); r(0, 155, 480, 1, 'paper');
      r(0, 158, 480, 48, 'road'); r(0, 158, 480, 1, 'slate'); r(0, 205, 480, 1, 'slate');
      for (let x = 5; x < 480; x += 27) r(x, 182, 13, 1, 'cream');
      // Asphalt motifs are sparse and deterministic; no random noise overlay.
      for (let x = 19; x < 480; x += 73) {
        r(x, 170 + x % 3, 3, 1, 'asphaltLight'); r(x + 8, 174, 1, 1, 'asphaltDark');
        r(x + 21, 195, 5, 1, 'asphaltDark'); r(x + 22, 196, 2, 1, 'asphaltLight');
      }
      r(115, 187, 29, 9, 'asphaltDark'); r(117, 188, 26, 7, 'road'); r(117, 188, 24, 1, 'asphaltLight');
      for (const x of [82, 267, 460]) {
        r(x, 158, 12, 3, 'deep'); r(x + 1, 158, 10, 1, 'metalShade');
        for (let dx = 2; dx < 11; dx += 3) r(x + dx, 159, 1, 2, 'asphaltLight');
      }
      r(0, 206, 480, 14, 'paving'); r(0, 206, 480, 2, 'steel'); r(0, 209, 480, 1, 'paper');
      for (let x = 12; x < 480; x += 25) {
        r(x, 140, 1, 14, 'pavingShade'); r(x + 1, 140, 1, 14, 'cream');
        r(x, 211, 1, 8, 'pavingShade'); r(x + 1, 211, 1, 7, 'cream');
      }
      r(0, 145, 480, 1, 'pavingShade'); r(0, 153, 480, 1, 'cream');
      for (let x = 3; x < 480; x += 16) { r(x, 155, 1, 3, 'curbShade'); r(x, 206, 1, 3, 'curbShade'); }
      r(0, 261, 480, 9, 'paving');
      for (const x of [88, 182, 275, 346]) r(x, 218, 9, 52, 'paving');
      // Ground improvements go below actors, while shelters/cones occlude by depth.
      if (assets.publicWork > .2) {
        r(194, 210, Math.round(Math.min(79, assets.publicWork * 40)), 8, 'steel');
        for (let x = 195; x < 194 + Math.min(79, assets.publicWork * 40); x += 8) r(x, 211, 1, 6, 'paper');
      }
    }
    rear(world, v, assets) {
      const r = this.r;
      // Café: striped awning, cup silhouettes and a real recessed entrance.
      this.facade(9, 95, 72, 42, 'sand'); this.roof(5, 80, 79, 15);
      this.sign('CAFE', 24, 96, 40); this.window(17, 115, 25, 17);
      r(15, 133, 31, 3, 'bark'); r(16, 133, 28, 1, 'barkLight');
      for (const x of [22, 33]) { r(x, 123, 4, 4, 'paper'); r(x + 4, 124, 1, 2, 'cream'); }
      this.door(69, 137, world.doorOpen('cafe'), 'cafe');
      this.awning(12, 107, 66, 'brick');
      // Market: apartments above the store, display shelves and printed basket price.
      this.facade(94, 70, 86, 67, 'brick', 'brickDark');
      r(91, 68, 92, 4, 'ink'); r(94, 65, 86, 3, 'brickDark'); r(96, 66, 82, 1, 'sand');
      for (const x of [103, 125, 147]) this.window(x, 78, 13, 16, v.retail > .5);
      r(96, 95, 78, 2, 'sand'); r(96, 97, 78, 1, 'brickDark');
      r(174, 73, 2, 61, 'metalShade'); r(174, 73, 1, 61, 'steel');
      this.sign('MARKET', 105, 98, 62, 'cream'); this.awning(97, 108, 79, 'teal');
      this.box(101, 120, 43, 15, 'deep');
      for (const y of [125, 132]) { r(103, y, 39, 1, 'wood'); for (let x = 104; x < 141; x += 7) if (v.supplyStress < .5 || x % 3) r(x, y - 4, 4, 4, x % 2 ? 'sand' : 'leaf'); }
      this.door(163, 137, world.doorOpen('shop'), 'market');
      r(104, 128, 29, 7, 'cream'); lettering(r, '$' + v.basket.toFixed(1), 106, 129);
      // Bank remains a separate financial district; its rate comes from the engine.
      this.facade(194, 99, 73, 38, 'paper', 'steel'); this.roof(190, 85, 81, 14, 'slate', 'sea');
      this.sign('BANK', 211, 100, 39); this.window(201, 116, 11, 17); this.door(239, 137, world.doorOpen('bank'), 'bank');
      for (const x of [219, 251]) { r(x, 114, 4, 23, 'steel'); r(x, 114, 1, 21, 'paper'); r(x - 2, 112, 8, 2, 'cream'); }
      for (const x of [220, 252]) r(x + 1, 117, 1, 17, 'metalShade');
      r(253, 122, 13, 13, 'slate'); lettering(r, v.interestRate.toFixed(1), 254, 126, 'cream');
      // Capacity leaves an enduring annex, separate from production animation.
      if (assets.capacity >= 3) {
        this.facade(403, 60, 65, 35, 'sea', 'slate'); this.sign('ANNEX', 414, 65, 43);
        for (const x of [410, 429, 448]) this.window(x, 79, 10, 11);
      }
      this.factory(world, v, assets);
      for (const x of [3, 187, 279, 476]) this.tree(x, 137, world.time);
    }
    awning(x, y, w, color) {
      const r = this.r;
      r(x + 2, y + 6, w - 2, 3, 'bark');
      for (let i = 0; i < w; i += 6) {
        r(x + i, y, Math.min(6, w - i), 5, i % 12 ? color : 'cream');
        r(x + i + 1, y, Math.min(4, w - i), 1, i % 12 ? color === 'teal' ? 'glassLight' : 'brickLight' : 'paper');
        r(x + i + 1, y + 5, Math.min(4, w - i), 2, i % 12 ? color : 'sand');
      }
    }
    factory(world, v) {
      const r = this.r, efficient = v.factoryEfficiency > 1.4;
      for (const [x, y] of [[304, 44], [323, 55]]) {
        this.box(x, y, 9, 43, 'brickDark'); r(x - 2, y, 13, 3, 'ink'); r(x + 2, y + 4, 2, 34, 'brick');
        for (let yy = y + 9; yy < 84; yy += 8) r(x + 1, yy, 7, 1, 'wood');
        r(x + 1, y + 2, 1, 37, 'roofLight'); r(x + 7, y + 3, 1, 38, 'roofShade');
      }
      // Steam comes from a bounded set of phases, not accumulating particles.
      for (let i = 0; i < Math.ceil(v.factoryOutput * 2); i++) {
        const age = (world.time * .55 + i * .7) % 3, x = 306 + age * 6, y = 40 - age * 8;
        r(x, y, 5 + age * 2, 3, age > 2 ? 'cloudShade' : 'cloud');
      }
      this.facade(288, 86, 180, 51, efficient ? 'far' : 'steel', 'sea');
      for (let x = 286; x < 382; x += 24) {
        for (let y = 0; y < 15; y++) r(x + 18 - y, 71 + y, 6 + y, 1, 'slate');
        r(x + 18, 75, 4, 10, 'teal'); r(x + 19, 76, 1, 8, 'sky');
      }
      r(382, 82, 89, 5, 'slate'); r(384, 82, 85, 1, 'steel');
      for (const x of [298, 344, 438]) {
        r(x, 100, 19, 4, 'metalShade'); for (let dx = 2; dx < 18; dx += 3) r(x + dx, 101, 1, 2, 'deep');
      }
      this.sign('COMMON WORKS', 296, 90, 113, efficient ? 'teal' : 'slate', 'cream');
      for (const x of [298, 318]) this.window(x, 108, 13, 23, v.factoryOutput > .6);
      this.door(354, 137, world.doorOpen('factory'), 'factory');
      // Open machine hall: paired presses and a conveyor visibly change cadence.
      this.box(370, 105, 51, 29, 'deep');
      r(373, 127, 45, 4, 'steel'); r(374, 128, 43, 2, 'slate');
      for (let i = 0; i < 4; i++) r(374 + (world.machineTime * 10 + i * 11) % 41, 130, 2, 1, 'cream');
      for (const x of [377, 399]) {
        r(x, 110, 14, 3, efficient ? 'teal' : 'sea'); r(x + 2, 113, 2, 13, 'steel'); r(x + 11, 113, 2, 13, 'steel');
        const pressY = 114 + [0, 2, 5, 2][Math.floor(world.machineTime * 5) % 4];
        r(x + 5, 112, 3, pressY - 110, 'steel'); r(x + 3, pressY, 8, 3, 'gold');
      }
      for (let i = 0; i < Math.round(v.factoryOutput * 2); i++) this.crate(375 + (world.loadingTime * 12 + i * 12) % 36, 123, 6, 5);
      this.box(428, 109, 33, 28, 'deep');
      r(426, 108, 2, 29, 'metalShade'); r(426, 108, 1, 28, 'metalLight'); r(462, 110, 2, 27, 'metalShade');
      const shutter = v.supplyStress > .6 ? 16 : 4 + Math.floor(world.loadingTime / 3) % 2 * 5;
      r(430, 111, 29, shutter, 'steel'); for (let y = 112; y < 111 + shutter; y += 3) r(430, y, 29, 1, 'sea');
      for (let i = 0; i < Math.ceil(v.freight * 2); i++) this.crate(431 + i % 2 * 12, 127 - Math.floor(i / 2) * 9);
      if (v.supplyStress > .6) this.sign('FUEL DELAY', 418, 97, 49, 'sand');
      if (efficient) { r(410, 77, 44, 5, 'teal'); r(413, 78, 4, 2, 'sky'); r(421, 78, 29, 1, 'steel'); }
    }
    foreground(world, v, assets) {
      const r = this.r;
      // Home and household basket: work income/purchasing power remain textual too.
      this.facade(9, 231, 72, 30, 'sun'); this.roof(4, 217, 82, 14);
      r(66, 217, 6, 10, 'brickDark'); r(65, 216, 8, 2, 'brick'); r(67, 219, 2, 7, 'brickLight');
      for (const x of [16, 58]) this.window(x, 241, 11, 16, v.householdStrain < .5);
      this.door(43, 261, false, 'home'); this.sign('HOME', 26, 226, 34);
      this.crate(97, 251, 21, 10);
      for (let i = 0; i < Math.max(1, Math.floor((1 - v.householdStrain) * 5)); i++) r(100 + i * 3, 247, 3, 5, i % 2 ? 'leaf' : 'brick');
      // Park benches sit behind the waiting residents, outside the walking path.
      for (const x of [125, 153]) {
        r(x + 2, 251, 2, 10, 'ink'); r(x + 18, 251, 2, 10, 'ink');
        for (const y of [247, 250, 254]) { r(x, y, 22, 2, 'bark'); r(x, y, 21, 1, 'barkLight'); }
        r(x, 254, 1, 4, 'metalShade'); r(x + 21, 254, 1, 4, 'metalShade');
      }
      this.tree(128, 247, world.time); this.tree(174, 246, world.time);
      this.facade(195, 231, 72, 30, 'paper', 'steel'); this.roof(190, 221, 82, 10, 'slate', 'sea');
      this.sign('TOWN HALL', 207, 229, 49); this.window(201, 244, 10, 14); this.window(251, 244, 10, 14); this.door(232, 261, false, 'civic');
      r(263, 222, 1, 17, 'ink'); r(264, 222, 9, 5, 'teal'); r(272, 223 + Math.floor(world.time) % 2, 2, 3, 'cream');
      // Fiscal activity repairs the public footway; it is never a private building.
      if (assets.publicWork >= 1) {
        r(290, 211, 40, 3, 'teal'); r(293, 214, 2, 15, 'steel'); r(325, 214, 2, 15, 'steel');
        r(298, 224, 24, 2, 'wood'); this.sign('BUS', 303, 215, 18);
      }
      if (v.publicInvestment > .9) {
        this.sign('PUBLIC WORKS', 193, 218, 79, 'teal', 'cream');
        for (const x of [224, 270]) { r(x, 215, 6, 2, 'brick'); r(x + 1, 212, 4, 3, 'cream'); r(x + 2, 209, 2, 3, 'brick'); }
        for (let i = 0; i < Math.ceil(v.publicInvestment); i++) r(251 + i * 5, 216, 4, 3, 'steel');
      }
      // Printed fuel prices live on the station canopy.
      this.facade(289, 241, 49, 20, 'paper', 'steel'); r(286, 236, 55, 5, 'brick');
      this.sign('FUEL ' + v.fuel.toFixed(1), 289, 229, 49);
      for (const x of [295, 320]) { this.box(x, 246, 10, 15, 'brick'); this.box(x + 2, 248, 6, 5, 'cream'); r(x + 10, 249, 3, 9, 'wood'); r(x + 11, 257, 3, 2, 'wood'); }
      for (const x of [295, 320]) { r(x + 1, 247, 1, 12, 'brickLight'); r(x + 8, 247, 1, 12, 'brickDark'); r(x + 3, 255, 3, 1, 'steel'); r(x - 1, 261, 13, 1, 'metalShade'); }
      this.construction(world, v, assets);
      if (assets.wear > .6) {
        for (let i = 0; i < Math.floor(assets.wear * 3); i++) { const x = 89 + i * 17; r(x, 267, 5, 1, 'slate'); r(x + 4, 268, 3, 1, 'slate'); }
      }
    }
    construction(world, v, assets) {
      const r = this.r, stage = assets.privateWork, active = v.privateInvestment >= .45;
      r(356, 222, 119, 39, 'paving'); this.sign(stage >= 2.7 ? 'NEW WORKSHOPS' : 'PRIVATE PROJECT', 358, 219, 111);
      if (stage >= 2.7) {
        this.facade(389, 232, 79, 29, 'brick', 'brickDark'); r(386, 229, 85, 4, 'slate');
        for (const x of [396, 419]) this.window(x, 238, 14, 17, active); this.door(453, 261, false, 'workshop');
      } else {
        r(390, 257, 79, 4, 'steel'); r(393, 259, 73, 1, 'paper');
        if (stage > .25) {
          const height = Math.min(27, 10 + stage * 10);
          for (const x of [392, 429, 465]) { r(x, 258 - height, 3, height, 'sand'); r(x, 258 - height, 1, height, 'cream'); }
          r(391, 258 - height, 77, 3, 'steel'); r(391, 247, 77, 2, 'steel');
          if (stage > 1.2) {
            r(395, 248, 31, 10, 'brick'); r(432, 248, 31, 10, 'brick');
            this.masonry(395, 248, 31, 10); this.masonry(432, 248, 31, 10);
            if (stage > 2) { this.window(400, 233, 12, 11, false); this.window(442, 233, 12, 11, false); }
          }
        }
        // Lattice crane, moving hook and materials: local equipment, not road traffic.
        r(371, 215, 3, 44, 'gold'); r(379, 215, 2, 44, 'gold');
        for (let y = 218; y < 255; y += 8) line(r, 374, y, 379, y + 6, 'ochre');
        r(363, 213, 101, 2, 'gold'); r(363, 219, 101, 1, 'ochre');
        for (let x = 367; x < 457; x += 8) line(r, x, 215, x + 5, 218, 'gold');
        const hook = active ? Math.round(Math.sin(world.time * .65) * 4) : 0;
        r(448, 215, 1, 17 + hook, 'ink'); r(446, 231 + hook, 4, 2, 'steel');
        this.crate(358, 250); this.crate(376, 252);
        // Tracked excavator has its own work cycle and stays within the site.
        r(361, 255, 26, 5, 'deep'); r(363, 256, 22, 2, 'metalShade');
        for (let x = 364; x < 385; x += 4) { r(x, 256, 2, 2, 'steel'); r(x, 259, 2, 1, 'slate'); }
        this.box(364, 242, 13, 13, 'gold'); r(365, 243, 11, 1, 'sun'); r(366, 245, 8, 6, 'glass'); r(366, 245, 7, 2, 'glassLight'); r(373, 247, 1, 3, 'wood');
        r(361, 251, 4, 3, 'ochre'); r(361, 251, 4, 1, 'sun');
        const lift = active ? Math.floor(world.time * 2) % 3 : 1;
        line(r, 376, 248, 385, 240 + lift, 'gold', 2); line(r, 385, 240 + lift, 392, 251, 'gold', 2); r(389, 251, 6, 4, 'ochre');
        if (!active) this.sign('ON HOLD', 411, 237, 40, 'steel');
      }
    }
    streetFurniture() {
      const r = this.r;
      for (const x of [86, 273, 475]) {
        r(x, 128, 2, 27, 'ink'); r(x - 3, 126, 8, 2, 'ink'); r(x - 2, 128, 6, 5, 'sun'); r(x - 3, 133, 8, 1, 'ink'); r(x - 2, 155, 6, 2, 'slate');
        r(x, 135, 1, 18, 'metalShade'); r(x - 1, 129, 2, 3, 'cream'); r(x - 3, 154, 5, 1, 'metalShade');
      }
      // One hydrant and two planters keep the pavement readable.
      r(183, 147, 5, 7, 'brickDark'); r(184, 146, 3, 2, 'brickLight'); r(182, 149, 7, 2, 'brick'); r(184, 148, 1, 5, 'sun'); r(182, 154, 7, 1, 'ink');
      for (const x of [47, 266]) { r(x, 150, 10, 5, 'ochre'); r(x + 1, 151, 8, 2, 'sand'); r(x - 1, 149, 12, 2, 'bark'); r(x + 1, 146, 8, 3, 'leafMid'); r(x + 2, 145, 3, 3, 'leafLight'); }
    }
    furniture(world) {
      // Foreground foliage intentionally occludes actors by its ground depth.
      this.tree(4, 269, world.time); this.tree(479, 268, world.time);
    }
  }
  window.LongRunCity.Town = Town;
})();
