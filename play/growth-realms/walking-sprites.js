/* Adapted from The Long Run city/sprites.js: original palette, person poses and cached sheets.
   Its distance-driven gait is reused in the existing Rival Cities map clock. */
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

const sheets = new Map();
export function walkPose(distance, moving = true) { return moving ? Math.floor(distance / 16 * 8) % 8 : 8; }
function sheet(role) {
  if(sheets.has(role))return sheets.get(role);
  const canvas=document.createElement('canvas');canvas.width=20*38;canvas.height=28;
  const ctx=canvas.getContext('2d');
  for(let frame=0;frame<38;frame++){ctx.save();ctx.translate(frame*20,0);drawPerson(brush(ctx),role,role==='builder'?4:0,frame);ctx.restore();}
  sheets.set(role,canvas);return canvas;
}
export function drawWalker(ctx,unit,direction,pose,x,y){
  const back=direction[0]==='N',flip=direction==='NW'||direction==='SE';
  const frame=pose===8?8:(back?14:22)+pose, scale=unit==='worker'?.9:.85;
  ctx.save();ctx.translate(Math.round(x),Math.round(y));if(flip)ctx.scale(-1,1);
  const draw=(offset,frameOffset=0)=>ctx.drawImage(sheet(unit==='worker'?'builder':'worker'),((frameOffset&&pose!==8)?(back?14:22)+(pose+4)%8:frame)*20,0,20,28,offset-10*scale,-28*scale,20*scale,28*scale);
  draw(unit==='students'?-5:0);if(unit==='students')draw(6,4);ctx.restore();
}
