"""Reproducible source for the bounded 2026-10-04 graph repairs.

New plots use the explicitly stated models below. Label-only repairs load immutable
original bytes from the recorded Git baseline, preserving every plotted curve.
Output is staged for visual acceptance; --install is intentionally not supported.
"""
from review_tools import *
import io, subprocess, hashlib, sys
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from PIL import Image, ImageDraw, ImageFont
OUT=EVIDENCE/'graph-drafts';OUT.mkdir(exist_ok=True)
BASE=json.loads((EVIDENCE/'baseline.json').read_text())['head']
LEDGER={}
C={'D':'#1769aa','S':'#c33c26','MR':'#793cc4','MC':'#bd302c','ATC':'#168047','AVC':'#bc7516'}
plt.rcParams.update({'font.family':'DejaVu Sans','font.size':15,'axes.labelsize':16,'axes.titlesize':17,'lines.linewidth':2.6,'savefig.facecolor':'white'})
def original(asset):
 raw=subprocess.check_output(['git','show',BASE+':build/faculty-build-composer/data/'+asset],cwd=ROOT)
 return Image.open(io.BytesIO(raw)).convert('RGB')
def note(asset,fix,model=None,source=None):
 LEDGER[asset]={'fix':fix,'model':model,'source':source or 'Explicit model in generate_graphs.py','generator':'audit_tools/graph_assessment_live_playthrough_remediation_20261004/generate_graphs.py'}
def save(fig,asset,fix,model=None):
 p=OUT/asset;p.parent.mkdir(parents=True,exist_ok=True)
 b=io.BytesIO();fig.savefig(b,format='png',dpi=170,bbox_inches='tight',pad_inches=.2);plt.close(fig)
 Image.open(b).convert('RGB').save(p,format='WEBP',lossless=True)
 note(asset,fix,model)
def axes(xlim,ylim,xlabel='Quantity',ylabel='Price / cost',title=None):
 fig,ax=plt.subplots(figsize=(8.4,5.8));setup(ax,xlim,ylim,xlabel,ylabel,title);return fig,ax
def setup(ax,xlim,ylim,xlabel,ylabel,title=None):
 ax.set(xlim=xlim,ylim=ylim,xlabel=xlabel,ylabel=ylabel,title=title)
 ax.spines[['top','right']].set_visible(False);ax.grid(color='#e3e8ed',lw=.7);ax.set_axisbelow(True)
def line(ax,x,y,label,color=None):ax.plot(x,y,label=label,color=color or C.get(label))
def point(ax,x,y,label=None,offset=(7,8),color='#222222'):
 ax.plot(x,y,'o',color=color,ms=5,zorder=5)
 if label:ax.annotate(label,(x,y),xytext=offset,textcoords='offset points',weight='bold',bbox={'facecolor':'white','edgecolor':'none','alpha':.9,'pad':1})
def guide(ax,x,y):
 ax.plot([x,x,0],[0,y,y],color='#77828e',ls='--',lw=1,zorder=1)
def legend(ax):ax.legend(loc='upper center',bbox_to_anchor=(.5,1.20),ncol=4,frameon=False,fontsize=13)
def getasset(g):return INDEX[g]['asset']

# A tax imposed on buyers. The original equilibrium has its own numerical tick.
fig,ax=axes((0,250),(0,19),'Quantity of movies (thousands)','Price of a movie ($)')
x=np.linspace(0,240,300);line(ax,x,18-.075*x,'D0',C['D']);line(ax,x,3+.075*x,'S0',C['S']);line(ax,x,12-.075*x,'Demand with tax',C['MR'])
for q,p in [(100,10.5),(60,13.5),(60,7.5)]:guide(ax,q,p);point(ax,q,p,'e' if q==100 else None)
ax.set_xticks([0,60,100,160,200,240]);ax.set_yticks([0,3,7.5,10.5,13.5,18]);ax.set_yticklabels(['0','3','7.50','10.50','13.50','18']);legend(ax)
save(fig,getasset(134),'Label original equilibrium $10.50 explicitly; retain both tax prices and quantities.','D=18−0.075Q; S=3+0.075Q; taxed demand=12−0.075Q.')

# Shared compact surplus chart: added Q=4 readings are needed by quota users.
fig,ax=axes((0,11),(0,27));x=np.linspace(0,11,150)
line(ax,x,24-2*x,'D');line(ax,x,4+2*x,'S')
for q,p,l in [(5,14,'E'),(4,16,None),(4,12,None)]:guide(ax,q,p);point(ax,q,p,l)
ax.set_xticks([0,4,5,8,10]);ax.set_yticks([0,4,12,14,16,24]);legend(ax)
save(fig,getasset(5),'Separate quota guides and equilibrium labels; explicitly show marginal value 16 and cost 12 at Q=4.','D=24−2Q; S=4+2Q.')

# Budget graphs use the original authoring assumptions and identical bundle locations.
for g in [10,11,12,13]:
 fig,ax=axes((0,12),(0,12),'Yogurt (units)','Cereal (units)')
 x=np.linspace(0,10,100);line(ax,x,5-.5*x,'BC0',C['D'])
 if g>10:ax.lines[-1].set_linestyle('--')
 if g==10:pts=[(2,2,'A'),(6,2,'B'),(8,3,'C')];caption='Income $40 · Yogurt $4 · Cereal $8'
 elif g==11:line(ax,x,10-x,'BC1',C['S']);pts=[(6,2,'A'),(6,4,'B')];caption='Initial: income $40 · Yogurt $4 · Cereal $8'
 elif g==12:line(ax,x,5-x,'BC1',C['S']);pts=[(6,2,'A'),(4,1,'B')];caption='Initial: income $40 · Yogurt $4 · Cereal $8'
 else:line(ax,x,4-.5*x,'BC1',C['S']);pts=[(6,2,'A'),(4,2,'B')];caption='Initial: income $40 · Yogurt $4 · Cereal $8'
 for q,p,l in pts:guide(ax,q,p);point(ax,q,p,l)
 ax.set_xticks([0,2,4,5,6,8,10,12] if g==12 else range(0,13,2));ax.set_yticks([0,2,4,5,6,8,10,12]);ax.set_title(caption,fontsize=14,pad=18);ax.legend(loc='upper right',frameon=False)
 save(fig,getasset(g),'Readable original budget assumptions, bundle labels and intercepts.',caption)

fig,ax=axes((0,25),(0,25),'Good X','Good Y');x=np.linspace(1,25,500)
for k,v in enumerate([35,90,190],1):line(ax,x,v/x,'IC'+str(k),['#1769aa','#168047','#793cc4'][k-1])
for q,p,l in [(5,18,'A'),(10,9,'B'),(20,4.5,'C'),(10,3.5,'D')]:point(ax,q,p,l)
ax.annotate('4.5',(20,4.5),xytext=(8,-18),textcoords='offset points',fontsize=12)
ax.set_xticks([0,5,10,15,20,25]);ax.set_yticks([0,3.5,9,14,18,25]);legend(ax)
save(fig,'question-assets/consumer-choice/CHOICE-05-bundles.webp','A/B/C identify bundles on IC2; D on IC1. No preference conclusion is printed on the graph.','IC1:XY=35; IC2:XY=90; IC3:XY=190. Labeled bundle coordinates preserve the original IC2 readings.')

fig,ax=axes((0,105),(0,18),'Quantity demanded','Price ($)');x=np.linspace(0,105,250)
line(ax,x,13.6-.08*x,'D1',C['D']);line(ax,x,17-.2*x,'D2',C['S'])
for q,p,l,off in [(95,6,'A',(6,7)),(45,10,'B',(7,10)),(55,6,'C',(8,8)),(35,10,'D',(-20,10))]:guide(ax,q,p);point(ax,q,p,l,off)
ax.set_xticks([0,35,45,55,75,95]);ax.set_yticks([0,6,10,14,18]);legend(ax)
save(fig,getasset(39),'Remove unnecessary adjacent ticks; retain all four exact price/quantity readings.','D1=13.6−0.08Q; D2=17−0.2Q.')

for g,vals in [(35,[0,10,23,36,47,56,63,68,71]),(36,[0,9,21,34,45,54,60,62,60]),(37,[0,8,20,34,46,56,64,70,74])]:
 fig,ax=axes((-.2,8.4),(0,85),'Workers','Total product (units)');x=np.arange(9)
 line(ax,x,vals,'Total product',C['D'])
 for q,p in zip(x,vals):point(ax,q,p,str(p),(0,9))
 ax.set_xticks(x);save(fig,getasset(g),'Explicit output at each worker count; marginal-product arithmetic needs no pixel estimates.',{'totalProduct':vals})

for g in [51,52]:
 fig,ax=axes((0,102),(0,104),'Cumulative population (%)','Cumulative income (%)');x=[0,20,40,60,80,100]
 line(ax,[0,100],[0,100],'Equality','#666666')
 series=[('Lorenz',[0,5,15,30,55,100],C['D'])] if g==51 else [('A',[0,10,22,40,65,100],C['D']),('B',[0,2,7,17,40,100],C['S'])]
 for name,ys,col in series:
  line(ax,x,ys,name,col)
  for q,p in zip(x[1:-1],ys[1:-1]):point(ax,q,p,str(p),(0,8),col)
 ax.set_xticks(x);ax.set_yticks(x);legend(ax)
 save(fig,getasset(g),'Label cumulative shares at quintile boundaries; preserve all shared-user income shares.',{n:y for n,y,c in series})

# MON-04 is deliberately a label-only repair below. Shared questions use its
# original displayed rounded prices; do not substitute a reconstructed model.

fig,ax=axes((0,120),(0,80));x=np.linspace(3,120,500)
line(ax,x,74-.6*x,'D');line(ax,x,74-1.2*x,'MR');line(ax,x,np.full_like(x,20),'MC');line(ax,x,20+180/x,'LRAC',C['ATC'])
for q,p in [(45,47),(90,20)]:guide(ax,q,p);point(ax,q,p)
ax.set_xticks([0,30,45,60,90,120]);ax.set_yticks([0,20,40,47,60,80]);legend(ax)
fig.text(.5,-.03,'Long-run costs for identical firms using the same technology',ha='center',fontsize=13)
save(fig,'question-assets/monopoly/MON-03-long-run.webp','Explicit long-run model, same monopoly/efficient quantities; compare falling LRAC without estimating a $2 difference.','Each active firm TC=180+20Q; identical technology, setup cost avoidable by not operating in the long run.')

fig,ax=axes((0,85),(0,65));x=np.linspace(8,85,500)
line(ax,x,60-.5*x,'D');line(ax,x,60-x,'MR');line(ax,x,10+.25*x,'MC');line(ax,x,10+.125*x+1200/x,'ATC');line(ax,x,10+.125*x,'AVC')
for q,p in [(40,40),(40,45),(40,20),(40,15)]:guide(ax,q,p);point(ax,q,p)
ax.set_xticks([0,20,40,60,80]);ax.set_yticks([0,15,20,30,40,45,60]);legend(ax)
save(fig,'question-assets/monopoly/MON-02-variable-cost.webp','Cost-consistent AVC variant gives all evidence for shutdown-versus-operating-loss comparisons.','D=60−0.5Q; MR=60−Q; TC=1200+10Q+0.125Q²; MC=10+0.25Q; AVC=10+0.125Q.')

fig,ax=axes((0,90),(0,65));x=np.linspace(8,90,500)
line(ax,x,60-.5*x,'D');line(ax,x,60-x,'MR');line(ax,x,15+.25*x,'MC')
for q,p in [(36,42),(36,24),(48,36),(48,27),(60,30)]:guide(ax,q,p);point(ax,q,p)
ax.set_xticks([0,20,36,48,60,80]);ax.set_yticks([0,15,24,30,36,42,60]);legend(ax)
ax.annotate('$27',(48,27),xytext=(8,-24),textcoords='offset points',arrowprops={'arrowstyle':'-','color':'#555'},bbox={'facecolor':'white','edgecolor':'none','pad':2})
save(fig,'question-assets/monopoly/MON-01-welfare.webp','Separate guides at an omitted-trade quantity; graph supplies marginal value and resource cost.','MON-01 demand and marginal-cost model unchanged; additional Q=48 guides.')

def integration(asset,price,marketq,F,a,b,c,firmq,marketmax,firmmax):
 fig,(left,right)=plt.subplots(1,2,figsize=(12,5.6));fig.subplots_adjust(wspace=.30)
 setup(left,(0,marketmax),(0,price*1.8),'Market quantity' if 'pc_market_firm' in asset else 'Market quantity (000s)','Price ($)','Market')
 setup(right,(0,firmmax),(0,price*1.6),'Firm quantity','Cost ($)','Representative firm')
 x=np.linspace(0,marketmax,300);slope=price*.6/marketq
 line(left,x,price+slope*marketq-slope*x,'D');line(left,x,price-slope*marketq+slope*x,'S');guide(left,marketq,price);point(left,marketq,price,'E')
 left.set_yticks([0,price*.5,price,price*1.5]);left.set_xticks([0,marketq,marketmax]);left.legend(frameon=False)
 q=np.linspace(3,firmmax,700)
 line(right,q,a+2*b*q+3*c*q*q,'MC');line(right,q,F/q+a+b*q+c*q*q,'ATC');line(right,q,a+b*q+c*q*q,'AVC')
 # Neutral grid includes several quantities and costs. No MR line, selected
 # output, or highlighted point independently identifies the market price.
 right.set_xticks(sorted(set([0,firmq*.5,firmq,firmmax])))
 right.set_yticks(sorted(set([0,price*.25,price*.5,price*.75,price,price*1.5])))
 right.set_title('Representative firm',pad=38)
 right.legend(frameon=False,loc='upper center',bbox_to_anchor=(.5,1.10),ncol=3,fontsize=12)
 save(fig,asset,'Market supplies equilibrium price; firm supplies unselected cost curves. No duplicate price/MR/optimum in firm panel.',{'marketPrice':price,'marketQuantity':marketq,'TC':[F,a,b,c],'firmOptimum':firmq})
integration('question-assets/perfect-competition/PC-06-integration.webp',40,75,450,8,-11/90,1/450,90,125,120)
integration('question-assets/perfect-competition/PC-08-integration.webp',25,100,400,17,-.16,.0032,50,160,90)
# Legacy variants retain the approximately $45/$42 market prices and the cost
# relationships used by their users, with an explicit coherent cost model.
integration('question-assets/perfect-competition/pc_market_firm_1-integration.webp',45,75,400,35,-.7,96.8/(3*62**2),62,110,100)
integration('question-assets/perfect-competition/pc_market_firm_2-integration.webp',42,80,500,36,-.65,85.3/(3*61**2),61,110,100)

# Label-only raster transformations. No original curve/point is moved.
FONT=ImageFont.truetype(str(Path(matplotlib.get_data_path())/'fonts/ttf/DejaVuSans.ttf'),25)
BOLD=ImageFont.truetype(str(Path(matplotlib.get_data_path())/'fonts/ttf/DejaVuSans-Bold.ttf'),25)
def raster_save(im,asset,fix,source):
 p=OUT/asset;p.parent.mkdir(parents=True,exist_ok=True);im.save(p,format='WEBP',lossless=True)
 note(asset,fix,source=BASE+':'+source)
def label(draw,xy,text,fill='#111111',font=FONT,anchor='mm'):
 box=draw.textbbox(xy,text,font=font,anchor=anchor);draw.rectangle((box[0]-4,box[1]-3,box[2]+4,box[3]+3),fill='white');draw.text(xy,text,font=font,fill=fill,anchor=anchor)

asset=getasset(86);im=original(asset);w,h=im.size;arr=np.asarray(im);dark=np.all(arr<80,axis=2)
y0=int(np.argmax(dark.sum(axis=1)));x0=int(np.argmax(dark.sum(axis=0)));end=np.where(dark[y0])[0].max();draw=ImageDraw.Draw(im)
draw.rectangle((x0-25,y0+7,w,y0+90),fill='white')
tickfont=ImageFont.truetype(str(Path(matplotlib.get_data_path())/'fonts/ttf/DejaVuSans.ttf'),29)
for q in [0,35,70,116,140,180,225]:draw.text((x0+(end-x0)*q/225,y0+17),str(q),font=tickfont,fill='black',anchor='mt')
raster_save(im,asset,'Separate crowded quantity ticks; retain all original curves, plotted points and displayed rounded prices for every shared user.',asset)

# Explicit firm price only; preserve shared PC-07's original geometry and users.
asset=getasset(111);im=original(asset);w,h=im.size;draw=ImageDraw.Draw(im)
# Baseline image coordinates are invariant and verified by the baseline hash.
label(draw,(w*.50,h*.420),'15',font=ImageFont.truetype(str(Path(matplotlib.get_data_path())/'fonts/ttf/DejaVuSans-Bold.ttf'),31),anchor='rm')
raster_save(im,asset,'Print 15 beside the firm price line without moving any curve.',asset)

# Total fixed cost: label the horizontal TFC line directly.
asset=getasset(34);im=original(asset);w,h=im.size;draw=ImageDraw.Draw(im)
label(draw,(w*.73,h*.76),'TFC = $240',font=BOLD)
raster_save(im,asset,'Explicit $240 fixed-cost label; preserve TC/TVC/TFC geometry.',asset)

def legacy_labels(g,price=None,threshold=None):
 asset=getasset(g);im=original(asset);w,h=im.size;pix=np.asarray(im)
 dark=np.all(pix[:,:,:3]<70,axis=2)
 # The longest horizontal/vertical black strokes locate the original axes.
 y0=int(np.argmax(dark.sum(axis=1)));x0=int(np.argmax(dark.sum(axis=0)))
 draw=ImageDraw.Draw(im)
 # Erase detached right-side labels, outside the original plotted data.
 draw.rectangle((int(w*(.895 if g in [94,95] else .915)),0,w,y0-2),fill='white')
 if g in [94,95]:
  entries=[('D / AR','#1f77b4'),('MR','#ff7f0e'),('MC','#2ca02c'),('ATC','#d62728'),('AVC','#9467bd')]
 else:entries=[('MC','#1f77b4'),('ATC','#2ca02c'),('AVC','#ff7f0e')]
 if g in [130,131,132]:entries=[('MC','#1f77b4'),('AVC','#ff7f0e')]
 if g==114:entries=[('MC','#1f77b4'),('ATC','#ff7f0e')]
 # A color legend replaces detached labels; preserve the horizontal P label.
 top=85;canvas=Image.new('RGB',(w,h+top),'white');canvas.paste(im,(0,top));draw=ImageDraw.Draw(canvas)
 space=w/len(entries)
 for k,(name,col) in enumerate(entries):
  xp=space*(k+.5);draw.line((xp-55,32,xp-20,32),fill=col,width=5);draw.text((xp-10,32),name,font=BOLD,fill='#111111',anchor='lm')
 if g not in [94,95,130,131,132]:
  # All these single-panel PC sources use 0..100 in increments of 20.
  # Their axes extend to 108; erase the old Q1/tick row, then restore ticks.
  bottom=y0+top
  draw.rectangle((x0-18,bottom+9,w,bottom+51),fill='white')
  axisend=np.where(dark[y0])[0].max();unit=(axisend-x0)/108
  for q in [0,20,40,60,80,100]:draw.text((x0+q*unit,bottom+14),str(q),font=FONT,fill='black',anchor='mt')
  blue=(pix[:,:,2]>pix[:,:,0]+15)&(pix[:,:,1]>pix[:,:,0]+8)&(pix[:,:,0]>60)&(pix[:,:,0]<220)
  counts=blue[:max(0,y0-10),:].sum(axis=0);gx=int(np.argmax(counts))
  if counts[gx]>h*.15:label(draw,(gx,bottom-22),'Q1',font=BOLD)
 if price is not None:
  rgb=pix.astype(int);blue=(rgb[:,:,0]<90)&(rgb[:,:,1]>75)&(rgb[:,:,1]<170)&(rgb[:,:,2]>130)
  price_y=int(np.argmax(blue.sum(axis=1)))
  # Callout in the open upper-right area with a leader to the price line.
  px=w*.81;py=top+y0*.25;endx=w*.89;endy=top+price_y
  draw.line((px,py+18,endx,endy),fill='#666666',width=2)
  label(draw,(px,py),f'P ≈ ${price}',font=BOLD)
 if threshold is not None:
  rgb=pix.astype(int);orange=(rgb[:,:,0]>180)&(rgb[:,:,1]>65)&(rgb[:,:,1]<180)&(rgb[:,:,2]<80)
  ys,xs=np.where(orange);minimum_y=int(ys.max());minimum_x=float(np.median(xs[ys>minimum_y-2]))
  xp=x0+250;yp=top+y0*.70
  draw.line((xp,yp+18,minimum_x,top+minimum_y),fill='#666666',width=2)
  label(draw,(xp,yp),f'≈ ${threshold}',font=BOLD)
 raster_save(canvas,asset,'Preserve plotted geometry; replace detached curve labels with a color key, separate Q1 from numeric ticks and label required approximate values.',asset)
for g,p in [(114,24),(117,20),(118,21),(119,18.5),(125,37),(126,None),(127,36),(128,14),(129,12),(133,23)]:legacy_labels(g,p)
for g,p in [(130,16),(131,18),(132,14)]:legacy_labels(g,threshold=p)
for g in [94,95]:legacy_labels(g)

# Entry/exit: final price in the existing firm panel, no altered curves.
for g in [115,116]:
 asset=getasset(g);im=original(asset);w,h=im.size;draw=ImageDraw.Draw(im)
 # Place the value alongside the dashed P2 line with a short leader.
 draw.line((w*.87,h*.56,w*.90,h*.669),fill='#666666',width=2)
 label(draw,(w*.87,h*.53),'P2 ≈ $25',font=BOLD)
 raster_save(im,asset,'Make final firm price P2 readable; retain both original panels and all curves.',asset)

# Cartel arithmetic requires the linear demand intercept and constant MC.
for g,A,b,mc in [(99,100,2,20),(100,140,2.5,30)]:
 fig,ax=axes((0,A/b),(0,A*1.1));x=np.linspace(0,A/b,300)
 line(ax,x,A-b*x,'D');line(ax,x,A-2*b*x,'MR');line(ax,x,np.full_like(x,mc),'MC')
 qm=(A-mc)/(2*b);qe=(A-mc)/b;p=(A+mc)/2
 for q,v in [(qm,p),(qm,mc),(qe,mc)]:guide(ax,q,v);point(ax,q,v)
 ax.set_xticks(sorted(set([0,qm,qe,A/b])));ax.set_yticks(sorted(set([0,mc,p,A])));legend(ax)
 save(fig,getasset(g),'Explicit constant marginal cost, cartel/competitive guides and demand intercepts for shared arithmetic tasks.',f'D={A}−{b}Q; MR={A}−{2*b}Q; MC={mc}.')

(OUT/'asset-changes.json').write_text(json.dumps(LEDGER,indent=2,ensure_ascii=False)+'\n',encoding='utf8')
print('Staged graph sources:',len(LEDGER))
