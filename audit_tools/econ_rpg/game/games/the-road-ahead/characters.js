// 48 × 72 native pixel sprites, drawn into 32-bit RGBA sheets.
// Retains the original distance-driven pose contract (eight walks, idle, reaction,
// front/back rows), with new anatomy, clothing, accessories, and shaded palettes.
export const SPRITE={width:48,height:72};
const palettes={
  0:{skin:['#633d31','#a76c4b','#d89a68','#f2bc88'],hair:['#242331','#393342','#594555'],coat:['#204861','#286d91','#4097b4','#78bfd0'],pants:['#253448','#3a4c62','#53677a'],accent:'#d8ad56',style:'curl'},
  1:{skin:['#55372e','#905b40','#bd855a','#e5ad7c'],hair:['#242626','#39392e','#625745'],coat:['#7a393a','#ae534b','#d87962','#efab88'],pants:['#293b43','#3c555e','#62757a'],accent:'#ecd099',style:'glasses'},
  3:{skin:['#714b3c','#ad7960','#dda88b','#f3cdb0'],hair:['#482b29','#773e30','#a15e3b'],coat:['#4e436e','#716394','#9b86b8','#c1afd1'],pants:['#303849','#465367','#6b7988'],accent:'#e7ba69',style:'long'},
  4:{skin:['#422d2a','#744933','#a76d48','#c89164'],hair:['#1d2527','#313b39','#4c4b3d'],coat:['#28564d','#3f806b','#68aa87','#a3cfac'],pants:['#3a3944','#565364','#79728a'],accent:'#e0b661',style:'cap'}
};
function frameCanvas(variant,frame,facing){
  const canvas=document.createElement('canvas');canvas.width=48;canvas.height=72;const ctx=canvas.getContext('2d');
  const p=palettes[variant]||palettes[0],side=facing==='side',back=facing==='back',walking=frame<8||frame>=14;
  const gait=frame<8?frame:frame>=22?frame-22:frame-14,phase=(gait%8)/8*Math.PI*2;
  const stride=walking?Math.round(Math.sin(phase)*5):0,bob=walking&&[1,2,5,6].includes(gait%8)?-1:0;
  const r=(x,y,w,h,c)=>{ctx.fillStyle=c;ctx.fillRect(x,y,w,h);};
  const skin=p.skin,coat=p.coat,pants=p.pants,hair=p.hair,ink='#202e35';
  // Ground and the far arm/leg establish depth before the torso.
  r(12,69,25,2,'#9caa97');r(16,71,18,1,'#bdc5ae');
  function leg(x,offset,near){
    const y=46+bob,lift=walking?Math.max(0,-offset):0;
    r(x,y,9,19-lift,pants[0]);r(x+1,y,6,17-lift,pants[near?1:0]);
    r(x+2,y+3,2,11-lift,pants[2]);r(x-1,y+16-lift,10,5,pants[0]);
    r(x+1,y+15-lift,6,2,pants[1]);r(x-1,y+20-lift,13,4,ink);
    r(x,y+20-lift,11,2,'#dde1d8');r(x+8,y+19-lift,5,4,'#455361');r(x-1,y+24-lift,14,1,'#1e2c31');
  }
  leg(side?19+stride:16+Math.round(stride*.5),-stride,false);
  // Backpacks have seams, buckles, a zipper, and a side pocket.
  if(side||back){r(side?10:11,29+bob,side?10:26,23,ink);r(side?10:12,30+bob,side?8:24,20,p.accent);r(side?11:13,31+bob,side?5:20,3,'#f0d89d');r(side?10:13,43+bob,side?8:20,8,'#967d50');r(side?10:14,44+bob,side?6:18,2,'#c5a869');r(side?10:22,39+bob,2,3,'#f2dfad');}
  const armSwing=walking?Math.round(stride*.6):0;
  function arm(x,offset,near){r(x,31+bob+offset,7,18,coat[0]);r(x+1,32+bob+offset,4,15,coat[near?2:1]);r(x+1,43+bob+offset,5,5,coat[1]);r(x+1,48+bob+offset,5,6,skin[1]);r(x+2,48+bob+offset,3,4,skin[2]);r(x+4,49+bob+offset,1,2,skin[3]);}
  arm(side?27:32,-armSwing,false);
  const bx=side?17:15,bw=side?17:21;
  r(bx,28+bob,bw,23,coat[0]);r(bx+1,29+bob,bw-2,20,coat[1]);r(bx+3,30+bob,side?6:8,18,coat[2]);r(bx+3,30+bob,2,13,coat[3]);
  r(bx+1,47+bob,bw-2,3,coat[0]);r(bx+2,46+bob,bw-4,2,coat[2]);
  if(!back){
    r(side?27:23,28+bob,5,14,'#eee5cc');r(side?26:22,28+bob,2,20,coat[0]);r(side?28:25,31+bob,1,10,'#b6ae9c');
    r(bx+5,28+bob,4,5,coat[3]);r(bx+6,32+bob,4,2,coat[1]);r(bx+bw-5,38+bob,3,1,coat[3]);
    r(side?27:24,44+bob,1,1,p.accent);r(side?27:24,39+bob,1,1,p.accent);
    // A visible shoulder strap and small metal buckle.
    r(bx+2,30+bob,3,17,'#665b4c');r(bx+3,31+bob,1,15,'#b09970');r(bx+2,41+bob,3,3,'#e8d6a2');r(bx+3,42+bob,1,1,'#665b4c');
  }
  leg(side?22-stride:27-Math.round(stride*.5),stride,true);
  // Waist sits over the top of both legs.
  r(bx+1,48+bob,bw-2,3,pants[0]);r(bx+3,48+bob,bw-6,1,'#82766a');if(!back)r(side?28:25,48+bob,3,2,'#d0bf8d');
  arm(side?16:10,armSwing,true);
  // Neck, ears, jaw, facial planes, and hair are independently shaded.
  r(22,23+bob,8,7,skin[0]);r(23,24+bob,6,5,skin[2]);r(23,27+bob,5,1,skin[1]);
  const hx=side?19:17,hw=side?17:20;
  r(hx,8+bob,hw,14,skin[0]);r(hx-1,12+bob,hw+2,8,skin[1]);r(hx+1,9+bob,hw-2,14,skin[2]);r(hx+3,10+bob,hw-6,8,skin[3]);
  r(hx+3,23+bob,hw-7,3,skin[1]);r(hx+4,23+bob,hw-8,2,skin[2]);
  r(hx-2,16+bob,3,5,skin[1]);r(hx-1,17+bob,2,3,skin[2]);
  if(back){r(hx-1,6+bob,hw+1,17,hair[0]);r(hx+1,6+bob,hw-2,14,hair[1]);r(hx+3,8+bob,hw-7,3,hair[2]);r(hx+3,22+bob,hw-7,2,hair[1]);}
  else {
    r(hx-1,6+bob,hw,6,hair[0]);r(hx+1,5+bob,hw-3,5,hair[1]);r(hx+3,6+bob,hw-7,2,hair[2]);
    r(hx-1,10+bob,4,8,hair[0]);r(hx,11+bob,2,5,hair[1]);r(hx+3,10+bob,5,2,hair[1]);
    const ex=side?31:21;r(ex,15+bob,4,1,hair[0]);r(ex,17+bob,3,3,'#f5ebdf');r(ex+1,17+bob,2,3,'#273639');r(ex+1,17+bob,1,1,'#e4eef0');
    if(!side){r(31,15+bob,4,1,hair[0]);r(31,17+bob,3,3,'#f5ebdf');r(32,17+bob,2,3,'#273639');r(32,17+bob,1,1,'#e4eef0');}
    r(side?36:27,18+bob,side?3:2,4,skin[1]);r(side?36:27,18+bob,1,2,skin[3]);r(side?31:25,24+bob,side?4:6,1,'#86554a');
    r(hx+5,21+bob,3,1,skin[3]);
    if(p.style==='glasses'){r(ex-2,16+bob,7,1,ink);r(ex-2,19+bob,7,1,ink);r(ex-2,16+bob,1,4,ink);r(ex+4,16+bob,1,4,ink);if(!side){r(29,16+bob,7,1,ink);r(29,19+bob,7,1,ink);r(29,16+bob,1,4,ink);r(35,16+bob,1,4,ink);r(26,17+bob,3,1,ink);}}
  }
  if(p.style==='curl'){for(const [x,y] of [[18,6],[22,4],[27,4],[32,6],[17,10],[21,8]]){r(x,y+bob,5,4,hair[0]);r(x+1,y+bob,3,1,hair[2]);}}
  if(p.style==='long'){r(hx-3,10+bob,4,21,hair[0]);r(hx-2,11+bob,2,18,hair[1]);r(hx-1,13+bob,1,12,hair[2]);if(back){r(hx+hw-3,12+bob,5,19,hair[1]);r(hx+hw-2,13+bob,2,17,hair[2]);}}
  if(p.style==='cap'){r(hx-2,5+bob,hw+2,8,coat[0]);r(hx,5+bob,hw-2,5,coat[2]);r(hx+2,5+bob,8,2,coat[3]);r(side?hx+8:hx-3,12+bob,side?15:26,2,coat[0]);r(hx+7,8+bob,3,3,p.accent);}
  if(frame===13){r(39,3,2,7,p.accent);r(36,6,8,2,p.accent);r(8,12,2,4,'#fff2c4');}
  return canvas;
}
export class CharacterAtlas {
  constructor(){this.cache=new Map();}
  draw(ctx,entity){const facing=entity.facing||'front',key=`${entity.variant}/${entity.frame}/${facing}`;if(!this.cache.has(key))this.cache.set(key,frameCanvas(entity.variant,entity.frame,facing));
    ctx.save();ctx.imageSmoothingEnabled=false;ctx.translate(Math.round(entity.x),Math.round(entity.y));if(facing==='side'&&entity.direction<0)ctx.scale(-1,1);ctx.drawImage(this.cache.get(key),-24,-72);ctx.restore();
  }
}
