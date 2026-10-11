import {NODES,ZONES,CHARACTERS,point,BOARD} from './data.js';
import {CHAPTERS} from './chapters.js';
import {CharacterAtlas} from './characters.js';
export class Board {
  constructor(canvas,viewport){this.canvas=canvas;this.viewport=viewport;this.ctx=canvas.getContext('2d');this.atlas=new CharacterAtlas();this.motion=matchMedia('(prefers-reduced-motion: reduce)');this.raf=0;this.fast=false;this.overview=false;this.entity={variant:0,frame:8,state:'idle',direction:1,facing:'front',walkDistance:0};}
  scene(s){
    this.state=s;const c=this.ctx;c.clearRect(0,0,BOARD.width,BOARD.height);c.fillStyle='#f6f3ea';c.fillRect(0,0,BOARD.width,BOARD.height);
    const visited=new Set(s.history.map(h=>h.position)),available=new Set(s.phase==='plan'?CHAPTERS[s.zone].activities.map(a=>a.node):[]);
    for(const [zone,z] of ZONES.entries()){
      const top=zone*BOARD.zoneHeight;c.fillStyle=z.color;c.fillRect(18,top+12,684,BOARD.zoneHeight-14);
      c.fillStyle='#253d40';c.textAlign='left';c.font='bold 13px system-ui';c.fillText(`CHAPTER ${zone+1} / ${z.place.toUpperCase()}`,42,top+44);c.font='25px Georgia';c.fillText(z.name,42,top+78);
      c.save();c.translate(355,top+145);c.scale(.55,.55);this.landmark(c,zone,0,0);c.restore();
      const hub=point(zone*6);
      for(let local=1;local<6;local++){const pts=[hub,point(zone*6+local)];this.path(c,pts,19,'#fffdf5');this.path(c,pts,2,'#afbeb3',[4,7]);}
      if(zone<3)this.path(c,[point(zone*6+5),point((zone+1)*6)],10,'#fffdf5');
    }
    for(const n of NODES){
      const selected=n.id===s.destination&&s.phase==='moving';
      c.beginPath();c.arc(n.x,n.y,selected||available.has(n.id)?24:20,0,Math.PI*2);
      c.fillStyle=n.id===s.position?'#285e51':available.has(n.id)?'#fffdf0':visited.has(n.id)?'#a6c6b2':n.type==='milestone'?'#dec083':'#f7faf3';c.fill();c.lineWidth=available.has(n.id)||selected?4:2;c.strokeStyle=available.has(n.id)?'#377d66':'#63756e';c.stroke();
      c.fillStyle=n.id===s.position?'#fff':'#243b3c';c.textAlign='center';c.font='bold 15px system-ui';c.fillText(n.type==='milestone'?'◆':'•',n.x,n.y+5);c.font='bold 14px system-ui';c.fillStyle='#253d40';c.fillText(n.name,n.x,n.y+42);
    }
    c.textAlign='left';this.background=c.getImageData(0,0,BOARD.width,BOARD.height);this.entity.variant=CHARACTERS.find(x=>x.id===s.character).variant;
    const p=point(s.position);this.x=p.x;this.y=p.y;this.paint();
  }

  landmark(c,zone,x,y){
    c.save();c.translate(x,y);c.strokeStyle='#75827b';c.fillStyle='#faf7ee';c.lineWidth=2;
    if(zone===0){c.beginPath();c.moveTo(-74,-12);c.lineTo(0,-49);c.lineTo(74,-12);c.closePath();c.fill();c.stroke();c.fillRect(-65,-10,130,52);for(let i=-50;i<65;i+=25)c.strokeRect(i,-8,10,47);}
    if(zone===1){c.strokeRect(-73,-37,62,75);c.strokeRect(2,-22,75,60);for(let i=-60;i<60;i+=25){c.fillStyle='#a89bb5';c.fillRect(i,0,12,16);}c.fillStyle='#fff';c.fillRect(-14,18,28,20);}
    if(zone===2){c.strokeRect(-60,-53,65,91);c.strokeRect(10,-20,62,58);for(let row=0;row<3;row++)for(let col=0;col<3;col++){c.fillStyle='#8da6af';c.fillRect(-50+col*17,-41+row*24,9,12);}c.beginPath();c.arc(39,4,12,0,7);c.stroke();}
    if(zone===3){c.beginPath();c.moveTo(-73,0);c.lineTo(-38,-35);c.lineTo(-3,0);c.stroke();c.strokeRect(-63,0,50,36);c.strokeRect(7,-7,70,44);c.fillStyle='#bc935b';c.fillRect(7,-7,70,10);c.strokeRect(-43,14,12,22);}
    c.restore();
  }
  path(c,pts,width,color,dash=[]){if(!pts.length)return;c.beginPath();c.moveTo(pts[0].x,pts[0].y);for(const p of pts.slice(1))c.lineTo(p.x,p.y);c.lineWidth=width;c.lineJoin='round';c.lineCap='round';c.strokeStyle=color;c.setLineDash(dash);c.stroke();c.setLineDash([]);}
  paint(){const c=this.ctx;c.putImageData(this.background,0,0);this.atlas.draw(c,{...this.entity,x:this.x,y:this.y-6});}
  follow(){if(this.overview)return;const scale=this.canvas.getBoundingClientRect().width/720;this.viewport.scrollTop=this.y*scale-this.viewport.clientHeight*.56;this.viewport.scrollLeft=this.x*scale-this.viewport.clientWidth*.5;}
  async move(id){const to=point(id,this.state.flags.route),from={x:this.x,y:this.y};let last=null;const distance=Math.hypot(to.x-from.x,to.y-from.y);let traveled=0;
    this.entity.state='walk';this.entity.direction=to.x<from.x?-1:1;this.entity.facing=Math.abs(to.y-from.y)>Math.abs(to.x-from.x)?(to.y<from.y?'back':'front'):'side';
    await new Promise(resolve=>{const tick=t=>{
      const dt=last===null?0:Math.min(.05,(t-last)/1000);last=t;
      if(!document.hidden)traveled+=dt*330;
      if(this.fast||this.motion.matches)traveled=distance;
      const ratio=Math.min(1,traveled/distance);this.x=from.x+(to.x-from.x)*ratio;this.y=from.y+(to.y-from.y)*ratio;
      this.entity.walkDistance=traveled/2;this.entity.frame=(this.entity.facing==='back'?14:this.entity.facing==='front'?22:0)+Math.floor(traveled/320*8)%8;
      this.paint();this.follow();if(ratio<1)this.raf=requestAnimationFrame(tick);else{this.raf=0;this.entity.state='idle';this.entity.frame=8;this.paint();resolve();}
    };this.raf=requestAnimationFrame(tick);});
  }
  reaction(){this.entity.frame=13;this.paint();}
}
