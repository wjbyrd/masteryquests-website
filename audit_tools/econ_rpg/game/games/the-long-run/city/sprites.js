/* Original pixel artwork. Authored poses are cached as tiny sprite sheets;
   the renderer only blits integer-aligned frames, never rescales individual actors. */
(() => {
  'use strict';
  const P = Object.freeze({
    ink: '#233b4a', deep: '#192e40', slate: '#344d68', road: '#465d70', steel: '#b4cad6',
    sky: '#86cef4', far: '#92bbdb', cloud: '#fff9e7', cloudShade: '#cde7fa',
    leaf: '#3e8a46', grass: '#76b65a', shade: '#285b46', lightGrass: '#b9dc78',
    paving: '#d9cfb2', cream: '#fff0c8', paper: '#eff5eb', sand: '#eab66c',
    ochre: '#a57042', sun: '#ffdc8c', gold: '#f3c543', brick: '#df7851',
    brickDark: '#a24a45', wood: '#504039', teal: '#2aa6b4', sea: '#669cab',
    blue: '#328fce', coral: '#ee7955', violet: '#a277c9', jade: '#299c78',
    mortar: '#bf765c', brickLight: '#efab77', plasterShade: '#c4b89a',
    concrete: '#a8b7bb', concreteShade: '#7f969c', glass: '#70b2c6', glassLight: '#b5e2e3',
    leafDeep: '#254c3e', leafMid: '#377052', leafLight: '#8fbe65', leafSun: '#c2d887',
    bark: '#715548', barkLight: '#b79063', asphaltLight: '#536776', asphaltDark: '#3a5061',
    pavingShade: '#b8af98', curbShade: '#879ba3', roofLight: '#cf7862', roofShade: '#743f42',
    metalLight: '#e1ece2', metalShade: '#75909b', groundShadow: '#8b9079'
  });
  function brush(ctx) {
    return (x, y, w, h, c) => { ctx.fillStyle = P[c] || c; ctx.fillRect(Math.round(x), Math.round(y), Math.round(w), Math.round(h)); };
  }
  // Small bitmap alphabet keeps every window, label, and price on the same grid.
  const FONT = {
    A:'010101111101101',B:'110101110101110',C:'011100100100011',D:'110101101101110',E:'111100110100111',F:'111100110100100',G:'011100101101011',H:'101101111101101',I:'111010010010111',J:'001001001101010',K:'101101110101101',L:'100100100100111',M:'101111111101101',N:'101111111111101',O:'010101101101010',P:'110101110100100',Q:'010101101111011',R:'110101110101101',S:'011100010001110',T:'111010010010010',U:'101101101101111',V:'101101101101010',W:'101101111111101',X:'101101010101101',Y:'101101010010010',Z:'111001010100111',
    '0':'111101101101111','1':'010110010010111','2':'110001111100111','3':'110001011001110','4':'101101111001001','5':'111100110001110','6':'011100111101111','7':'111001010010010','8':'111101111101111','9':'111101111001110','.':'000000000000010','-':'000000111000000','$':'011110010011110','/':'001001010100100','%':'101001010100101'
  };
  function lettering(r, value, x, y, color = 'ink') {
    for (const char of String(value).toUpperCase()) {
      const bits = FONT[char];
      if (bits) for (let i = 0; i < 15; i++) if (bits[i] === '1') r(x + i % 3, y + Math.floor(i / 3), 1, 1, color);
      x += 4;
    }
  }
  function line(r, x, y, tx, ty, color, thickness = 1) {
    const steps = Math.max(Math.abs(tx - x), Math.abs(ty - y), 1);
    for (let i = 0; i <= steps; i++) r(x + (tx - x) * i / steps, y + (ty - y) * i / steps, thickness, thickness, color);
  }
  // Shared, limited ramps: upper-left highlights, lower-right shade. Six original
  // silhouettes include a jacket, rolled sleeves, long hair, a cap and a satchel.
  const CLOTHES = [
    ['#91c7df', '#438aad', '#2c566c'], ['#f2b196', '#c77561', '#85494d'],
    ['#a1c994', '#5e977d', '#365c58'], ['#c1b5d9', '#8b7fa9', '#574c70'],
    ['#e3c88d', '#b39862', '#6d614f'], ['#8bd2ca', '#459d9f', '#2c606e']
  ];
  const SKIN = [['#f4cfaa','#dbaa83','#a8745d'],['#e6b184','#ba815b','#805340'],['#c78d65','#966345','#634533']];
  // [near ankle x, far ankle x, near lift, far lift, near knee x,
  //  far knee x, near arm x, body bob]. Ground is row 27 in EVERY pose.
  // During each stance the ankle moves +4,+2,0,-2 as the body travels 2px/frame.
  const GAIT_POSES = Object.freeze([
    [4,-4,0,0, 2,-2,-3,0], [2,-4,0,2, 2,-1,-2,1],
    [0,-1,0,4, 0, 2, 0,0], [-2,3,0,2,-1, 3, 2,-1],
    [-4,4,0,0,-2, 2, 3,0], [-4,2,2,0,-1, 2, 2,1],
    [-1,0,4,0, 2, 0, 0,0], [3,-2,2,0, 3,-1,-2,-1]
  ]);
  const PERSON = Object.freeze({ w:20, h:28, anchorX:10, anchorY:28, idle:8, idleShift:13, work:9, back:14, front:22, carry:30, frames:38 });
  function drawPerson(r, role, variant, frame, correction = 0) {
    const walking = frame < 8 || frame >= 14, work = frame >= 9 && frame <= 12;
    const vertical = frame >= 14 && frame < 30, back = frame >= 14 && frame < 22, carry = frame >= 30;
    const gaitFrame = frame < 8 ? frame : frame >= 30 ? frame - 30 : frame >= 22 ? frame - 22 : frame - 14;
    const pose = walking ? GAIT_POSES[gaitFrame] : [-1,2,0,0,-1,1,0,0];
    let [near, far, liftNear, liftFar, kneeNear, kneeFar, arm, bob] = pose;
    // Sub-frame contact correction is a 0–2px cached ankle adjustment. The eight
    // body poses stay at gait cadence; the planted shoe stays on its world pixel.
    if (walking && !vertical) { if (gaitFrame < 4) near -= correction; else far -= correction; }
    if (frame === 13) kneeNear++;
    const ramp = role === 'public' ? CLOTHES[5] : role === 'builder' ? CLOTHES[4] : CLOTHES[variant];
    const [skinLight, skin, skinDark] = SKIN[variant % 3];
    const jacket = variant === 0 || variant === 3, broad = variant === 2 || variant === 4 ? 1 : 0;
    const short = variant === 1 ? 1 : 0, hipY = 16 + bob + short;
    const limb = (hip, knee, ankle, lift, nearSide) => {
      const shade = nearSide ? '#455c70' : '#2a3e53', edge = nearSide ? '#71838a' : '#3b5063';
      const ankleX = vertical ? (nearSide ? 12 : 7) : 9 + ankle;
      const kneeX = vertical ? (nearSide ? 11 : 8) : 9 + knee;
      line(r, hip, hipY, kneeX, 21 - lift / 2, shade, 2);
      line(r, kneeX, 21 - lift / 2, ankleX, 26 - lift, shade, 2);
      r(kneeX, 20 - lift / 2, 1, 2, edge);
      r(ankleX, 26 - lift, 3, 2, 'deep'); r(ankleX + 1, 27 - lift, 3, 1, 'wood');
      if (nearSide) r(ankleX, 26 - lift, 2, 1, 'metalShade');
    };
    limb(8, kneeFar, far, liftFar, false);
    // Far arm swings opposite the far leg; near arm below opposes near leg.
    const farHand = vertical ? 5 : 8 - arm;
    line(r, 7, 10 + bob, farHand, 16 + bob, ramp[2], 2); r(farHand, 16 + bob, 2, 2, skinDark);
    limb(10, kneeNear, near, liftNear, true);
    r(7, 8 + bob + short, 6 + broad, 9, ramp[2]); r(7, 9 + bob + short, 4 + broad, 7, ramp[1]);
    r(7, 9 + bob + short, 2, 5, ramp[0]); r(7, 16 + bob, 6 + broad, 1, 'ink');
    if (jacket) { r(10, 9 + bob, 1, 6, 'cream'); r(9, 10 + bob, 1, 2, ramp[2]); }
    else { r(8, 9 + bob, 3, 1, ramp[0]); r(11, 13 + bob, 1, 2, ramp[2]); }
    const handY = work ? [11,8,11,16][frame - 9] : carry ? 14 : 17 + bob;
    const handX = work || carry ? 14 : vertical ? 13 : 10 + arm;
    line(r, 11 + broad, 10 + bob, handX, handY - 2, ramp[1], 2);
    r(11 + broad, 10 + bob, 1, 2, ramp[0]); r(handX, handY - 1, 2, 3, skin); r(handX, handY - 1, 1, 1, skinLight);
    // Small head with jaw, ear, neck, lit brow and a deliberate profile.
    const hy = 2 + bob + short, hair = variant === 4 ? 'barkLight' : variant === 1 ? 'roofShade' : 'wood';
    r(9, hy + 5, 3, 3, skinDark); r(7, hy, 6, 5, hair);
    r(8, hy + 2, 5, 4, skin); r(9, hy + 6, 3, 1, skinDark);
    r(8, hy + 2, 2, 2, skinLight); r(7, hy + 1, 5, 1, 'bark');
    if (back) { r(8, hy + 2, 5, 4, hair); r(8, hy + 2, 2, 2, 'bark'); r(7, hy + 4, 1, 2, skin); }
    else if (vertical) { r(8, hy + 3, 1, 1, 'deep'); r(12, hy + 3, 1, 1, 'deep'); r(10, hy + 5, 1, 1, skinDark); }
    else { r(13, hy + 3, 1, 2, skin); r(12, hy + 3, 1, 1, 'deep'); r(8, hy + 4, 1, 1, skinDark); }
    if (variant === 1 || variant === 3) { r(6, hy + 3, 2, 5, hair); r(6, hy + 3, 1, 4, 'bark'); }
    if (variant === 5) { r(7, hy, 7, 2, 'slate'); r(11, hy + 2, 4, 1, 'ink'); }
    if (role === 'builder' || role === 'public') {
      const helmet = role === 'public' ? 'paper' : 'gold';
      r(7, hy - 1, 6, 2, helmet); r(6, hy + 1, 9, 1, role === 'public' ? 'steel' : 'ochre'); r(8, hy - 1, 2, 1, 'cream');
      r(8, 11 + bob, 1, 4, 'cream'); r(12, 11 + bob, 1, 4, 'cream'); r(8, 14 + bob, 5, 1, 'cream');
    }
    if (!work && !carry && (role === 'shopper' || role === 'worker')) {
      const bx = handX + 1, by = handY + 2;
      r(bx, by - 2, 3, 1, 'wood'); r(bx - 1, by - 1, 5, 5, role === 'shopper' ? 'ochre' : 'wood');
      r(bx - 1, by, 3, 3, role === 'shopper' ? 'sand' : 'bark'); r(bx, by, 1, 2, role === 'shopper' ? 'sun' : 'barkLight');
    }
    if (work && role === 'builder') { r(15, handY - 4, 1, 7, 'bark'); r(13, handY - 5, 5, 2, 'metalShade'); r(13, handY - 5, 4, 1, 'metalLight'); }
    if (work && role === 'public') { line(r, 15, handY, 17, 24, 'bark'); r(16, 24, 3, 3, 'metalShade'); r(16, 24, 1, 2, 'steel'); }
    if (carry) { r(11, 14, 8, 8, 'bark'); r(12, 15, 6, 6, 'sand'); r(12, 15, 5, 1, 'sun'); r(14, 16, 1, 5, 'ochre'); }
  }
  const VEHICLES = Object.freeze({ car: { w: 52, h: 25 }, van: { w: 57, h: 30 }, delivery: { w: 68, h: 34 }, industrial: { w: 70, h: 32 }, construction: { w: 64, h: 32 }, publicworks: { w:57, h:30 } });
  function drawVehicle(r, type, variant, frame) {
    const { w, h } = VEHICLES[type];
    const [light, body, shade] = type === 'publicworks' ? CLOTHES[5] : type === 'construction' ? CLOTHES[4] : CLOTHES[variant % 6];
    const wheel = x => {
      r(x - 1, h - 8, 10, 5, 'deep'); r(x, h - 9, 8, 8, 'deep');
      r(x + 1, h - 8, 5, 1, 'slate'); r(x + 2, h - 7, 4, 4, 'metalShade');
      r(x + 2, h - 7, 3, 1, 'metalLight'); r(x + 3, h - 6, 2, 2, 'slate');
      r(x + (frame ? 4 : 3), h - 5, 1, 1, 'steel');
    };
    r(2, h - 8, w - 4, 5, 'deep');
    if (type === 'car') {
      r(3, 12, 45, 8, shade); r(1, 14, 50, 5, body); r(4, 11, 44, 6, body);
      r(12, 4, 27, 9, 'ink'); r(16, 2, 17, 2, shade); r(14, 3, 23, 2, light);
      r(14, 5, 21, 7, 'glass'); r(15, 5, 17, 2, 'glassLight'); r(25, 5, 2, 7, shade);
      r(12, 8, 3, 4, body); r(35, 7, 3, 5, body); r(36, 10, 4, 3, body);
      r(4, 12, 44, 1, light); r(4, 17, 44, 2, shade); r(24, 13, 1, 6, shade);
      r(27, 13, 4, 1, 'metalLight'); r(14, 13, 3, 1, 'metalShade');
      r(40, 11, 7, 1, light); r(4, 11, 6, 1, light); r(36, 10, 3, 2, 'ink');
    } else if (type === 'van' || type === 'publicworks') {
      r(4, 3, 34, 21, shade); r(5, 2, 30, 2, light); r(5, 4, 29, 18, body);
      r(7, 5, 26, 1, light); r(7, 8, 22, 10, shade); r(8, 9, 20, 8, body);
      r(32, 5, 13, 17, body); r(43, 12, 10, 10, body); r(50, 16, 6, 7, shade);
      r(35, 6, 8, 9, 'ink'); r(36, 7, 6, 7, 'glass'); r(36, 7, 5, 2, 'glassLight');
      r(43, 10, 3, 5, 'glassLight'); r(34, 17, 18, 1, light); r(35, 18, 3, 1, 'metalLight');
      r(5, 21, 47, 3, shade); r(31, 6, 1, 15, shade); r(29, 17, 2, 1, 'metalLight');
      if (type === 'publicworks') {
        r(7, 19, 25, 2, 'cream'); r(7, 1, 29, 1, 'ink');
        for (const x of [10, 20, 30]) r(x, 0, 2, 3, 'steel');
        r(12, 11, 11, 5, 'cream'); line(r, 14, 12, 20, 14, 'teal');
      } else { r(11, 10, 12, 8, light); r(12, 11, 10, 6, body); r(15, 11, 2, 6, shade); }
    } else {
      const cargo = w - 25;
      if (type === 'delivery') {
        r(3, 2, cargo, h - 10, 'metalShade'); r(4, 3, cargo - 2, h - 13, 'paper');
        r(5, 3, cargo - 4, 2, 'metalLight');
        for (let x = 8; x < cargo; x += 7) r(x, 7, 1, h - 20, 'steel');
      }
      r(3, h - 11, cargo, 3, 'metalShade');
      if (type === 'delivery') { r(12, 11, 17, 10, body); r(14, 12, 13, 8, light); r(20, 12, 1, 8, shade); r(14, 17, 13, 1, shade); }
      else if (type === 'construction') {
        r(4, 11, cargo - 2, 12, 'ochre'); r(5, 12, cargo - 4, 9, 'gold');
        r(4, 11, cargo - 2, 2, 'sun');
        for (let x = 8; x < cargo - 3; x += 8) { r(x, 7 + x % 3, 8, 4, 'concrete'); r(x + 1, 7 + x % 3, 5, 1, 'steel'); r(x, 15, 1, 6, 'ochre'); }
        r(5, 21, cargo - 4, 2, 'barkLight');
      } else {
        for (let x = 7; x < cargo - 4; x += 11) { r(x, 10, 9, 11, 'bark'); r(x + 1, 11, 7, 8, type === 'construction' ? 'paving' : 'sand'); r(x + 1, 11, 7, 1, 'cream'); r(x + 4, 12, 1, 7, 'ochre'); }
        r(4, 21, cargo - 2, 2, shade); for (let x = 5; x < cargo; x += 13) r(x, 17, 2, 7, 'steel');
      }
      r(w - 24, 9, 18, h - 15, shade); r(w - 23, 10, 16, h - 19, body); r(w - 23, 9, 14, 2, light);
      r(w - 6, 17, 5, h - 23, body); r(w - 22, 12, 11, 9, 'ink'); r(w - 21, 13, 9, 7, 'glass');
      r(w - 21, 13, 8, 2, 'glassLight'); r(w - 22, 22, 17, 1, light); r(w - 21, 24, 3, 1, 'metalLight');
      r(w - 12, 16, 2, 2, 'wood'); r(w - 8, 14, 3, 2, 'ink');
    }
    r(w - 3, h - 12, 2, 3, 'cream'); r(2, h - 12, 2, 3, 'brickDark');
    r(w - 4, h - 8, 4, 2, 'metalShade'); r(w - 4, h - 8, 3, 1, 'metalLight');
    r(1, h - 8, 4, 2, 'steel'); wheel(8); wheel(w - 17);
  }
  class SpriteAtlas {
    constructor() { this.cache = new Map(); }
    get(type, variant = 0, correction = 0) {
      variant %= 6;
      const key = `${type}/${variant}/${correction}`;
      if (this.cache.has(key)) return this.cache.get(key);
      const vehicle = VEHICLES[type], w = vehicle?.w || PERSON.w, h = vehicle?.h || PERSON.h, count = vehicle ? 2 : PERSON.frames;
      const canvas = document.createElement('canvas'); canvas.width = w * count; canvas.height = h;
      const ctx = canvas.getContext('2d'); ctx.imageSmoothingEnabled = false;
      for (let frame = 0; frame < count; frame++) {
        ctx.save(); ctx.translate(frame * w, 0);
        if (vehicle) drawVehicle(brush(ctx), type, variant, frame); else drawPerson(brush(ctx), type, variant, frame, correction);
        ctx.restore();
      }
      const sheet = { canvas, w, h, count }; this.cache.set(key, sheet); return sheet;
    }
    draw(ctx, entity, publicWorks = false) {
      const type = publicWorks ? 'publicworks' : entity.type;
      const vehicle = !!VEHICLES[type];
      const correction = !vehicle && entity.facing === 'side' && ['walk','carry','reposition'].includes(entity.state)
        ? Math.max(0, Math.min(2, Math.round((entity.walkDistance || 0) % 2))) : 0;
      const s = this.get(type, entity.variant, correction), frame = entity.frame % s.count;
      const x = Math.round(entity.x) - s.w / 2, y = Math.round(entity.y) - s.h;
      ctx.imageSmoothingEnabled = false;
      // Hard-edged, shared-light grounding shadows. No translucent blur.
      const r = brush(ctx);
      if (vehicle) { r(entity.x - s.w / 2 + 5, entity.y - 2, s.w - 6, 2, 'asphaltDark'); }
      else if (!['enter','exit'].includes(entity.state)) { r(entity.x - 4, entity.y, 11, 1, 'groundShadow'); r(entity.x - 2, entity.y + 1, 7, 1, 'pavingShade'); }
      ctx.save();
      if (entity.direction < 0 && (vehicle || !entity.facing || entity.facing === 'side')) { ctx.translate(Math.round(x + s.w), y); ctx.scale(-1, 1); }
      else ctx.translate(Math.round(x), y);
      // Enter/exit uses a door-width clip; no transparency or smoothed sprites.
      if (entity.state === 'enter' || entity.state === 'exit') {
        ctx.beginPath(); ctx.rect(0, 0, Math.ceil(s.w * entity.visibility), s.h); ctx.clip();
      }
      ctx.drawImage(s.canvas, frame * s.w, 0, s.w, s.h, 0, 0, s.w, s.h);
      ctx.restore();
    }
  }
  Object.assign(window.LongRunCity, { P, brush, lettering, line, VEHICLES, PERSON, GAIT_POSES, SpriteAtlas });
})();
