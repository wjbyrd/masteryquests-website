"""Deterministic accessible graph sources; stages assets, never installs them.

Models are transcribed from prior equation-based generators and the baseline
graphs. Direct black labels and redundant line styles survive grayscale.
"""
import io,json,math,hashlib,sys
from pathlib import Path
import numpy as np
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from PIL import Image
HERE=Path(__file__).parent
ROOT=HERE.resolve().parents[1]
DATA=ROOT/'build/faculty-build-composer/data'
OUT=HERE/'graph-drafts';OUT.mkdir(exist_ok=True)
INDEX=json.loads((HERE/'graph_inventory.json').read_text())
LEDGER={}
plt.rcParams.update({'font.family':'DejaVu Sans','font.size':15,'axes.labelsize':16,'lines.linewidth':2.6,'savefig.facecolor':'white'})
COLORS=['#145b91','#a83320','#28663c','#683b82','#855b00']
STYLES=['-','--','-.',':',(0,(5,2,1,2))]
def asset(i):return INDEX[i]['asset']
def chart(xmax,ymax,xlabel='Quantity',ylabel='Price / cost ($)',title=None):
    fig,ax=plt.subplots(figsize=(9,6));ax.set(xlim=(0,xmax),ylim=(0,ymax),xlabel=xlabel,ylabel=ylabel,title=title)
    ax.spines[['top','right']].set_visible(False);ax.grid(color='#e5e5e5',lw=.65);ax.set_axisbelow(True)
    return fig,ax
def curve(ax,x,y,name,k=0,label_at=.88,offset=(5,9)):
    x=np.asarray(x);y=np.asarray(y);ax.plot(x,y,color=COLORS[k%5],ls=STYLES[k%5])
    valid=np.flatnonzero((y>ax.get_ylim()[0]+.02*np.ptp(ax.get_ylim()))&(y<ax.get_ylim()[1]*.93))
    if len(valid):
        j=valid[min(len(valid)-1,int(len(valid)*label_at))]
        ax.annotate(name,(x[j],y[j]),xytext=offset,textcoords='offset points',color='#111111',weight='bold',fontsize=14,
                    bbox=dict(facecolor='white',edgecolor='none',pad=1,alpha=.96),arrowprops=dict(arrowstyle='-',color='#333333',lw=.8))
def guide(ax,q,p):ax.plot([q,q,0],[0,p,p],color='#777777',ls=':',lw=1.1,zorder=0)
def point(ax,q,p,text=None,offset=(7,8)):
    ax.plot(q,p,'o',color='#111111',ms=4,zorder=5)
    if text:ax.annotate(text,(q,p),xytext=offset,textcoords='offset points',fontsize=13,weight='bold',bbox=dict(facecolor='white',edgecolor='none',pad=.5))
def save(fig,target,model,reason='Replace color-only or detached labels with direct curve labels and redundant line styles.'):
    if isinstance(target,int):target=asset(target)
    p=OUT/target;p.parent.mkdir(parents=True,exist_ok=True)
    buf=io.BytesIO();fig.savefig(buf,format='png',dpi=160,bbox_inches='tight',pad_inches=.2);plt.close(fig)
    Image.open(buf).convert('RGB').save(p,'WEBP',lossless=True)
    LEDGER[target]={'model':model,'reason':reason,'generator':str(Path(__file__).relative_to(ROOT)),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()}

fig,ax=chart(11,27);x=np.linspace(0,11,300)
curve(ax,x,24-2*x,'D',0);curve(ax,x,4+2*x,'S',1)
for q,p,l in [(5,14,'E'),(4,16,None),(4,12,None)]:guide(ax,q,p);point(ax,q,p,l)
ax.set_xticks([0,4,5,8,10]);ax.set_yticks([0,4,12,14,16,24]);save(fig,12,'D=24−2Q; S=4+2Q.')

for idx in range(20,24):
    fig,ax=chart(12,12,'Yogurt (units)','Cereal (units)');x=np.linspace(0,10,200)
    curve(ax,x,5-.5*x,'BC0',0,label_at=.72,offset=(0,-22))
    if idx==20:pts=[(2,2,'A'),(6,2,'B'),(8,3,'C')]
    elif idx==21:curve(ax,x,10-x,'BC1',1,label_at=.45);pts=[(6,2,'A'),(6,4,'B')]
    elif idx==22:curve(ax,x,5-x,'BC1',1,label_at=.45,offset=(-40,-22));pts=[(6,2,'A'),(4,1,'B')]
    else:curve(ax,x,4-.5*x,'BC1',1,label_at=.5,offset=(-40,-24));pts=[(6,2,'A'),(4,2,'B')]
    if idx>20:ax.lines[0].set_linestyle('--');ax.lines[1].set_linestyle('-')
    for q,p,l in pts:guide(ax,q,p);point(ax,q,p,l)
    ax.set_xticks([0,2,4,5,6,8,10,12]);ax.set_yticks([0,2,4,5,6,8,10,12])
    ax.set_title(('Initial: ' if idx>20 else '')+'income $40 · Yogurt $4 · Cereal $8',fontsize=15)
    save(fig,idx,'BC0: Y=5−0.5X; BC1 respectively Y=10−X, 5−X, 4−0.5X. Original bundles retained.')
fig,ax=chart(25,25,'Good X','Good Y');x=np.linspace(1,25,400)
for k,v in enumerate([35,90,190]):curve(ax,x,v/x,'IC'+str(k+1),k,label_at=.92,offset=(3,9))
for q,p,l in [(5,18,'A'),(10,9,'B'),(20,4.5,'C'),(10,3.5,'D')]:point(ax,q,p,l)
ax.set_xticks([0,5,10,15,20,25]);ax.set_yticks([0,3.5,9,14,18,25]);save(fig,24,'IC1 XY=35; IC2 XY=90; IC3 XY=190; original A/B/C/D coordinates.')

fig,ax=chart(105,18,'Quantity demanded','Price ($)');x=np.linspace(0,105,400)
curve(ax,x,13.6-.08*x,'D1',0,label_at=.73,offset=(0,12));curve(ax,x,17-.2*x,'D2',1,label_at=.85)
for q,p,l,off in [(95,6,'A',(6,7)),(45,10,'B',(7,10)),(55,6,'C',(8,8)),(35,10,'D',(-20,10))]:guide(ax,q,p);point(ax,q,p,l,off)
ax.set_xticks([0,35,45,55,75,95]);ax.set_yticks([0,6,10,14,18]);save(fig,56,'D1=13.6−.08Q; D2=17−.2Q; all original bundles.')

fig,ax=chart(150,40,'Hundreds of warehouse workers','Hourly wage ($)');x=np.linspace(0,140,400)
curve(ax,x,30-.25*x,'Labor demand',0,label_at=.82);curve(ax,x,10+.25*x,'Labor supply',1,label_at=.75)
for q,p in [(40,20),(60,15),(60,25)]:guide(ax,q,p);point(ax,q,p)
ax.set_xticks([0,20,40,60,80,100,120,140]);ax.set_yticks([0,10,15,20,25,30,40]);save(fig,59,'Demand=30−.25L; supply=10+.25L; L is hundreds. Explicit 6000-worker readings15 and25.','Add faculty-requested numerical guides without changing economics.')

for idx in [68,69,70]:
    fig,ax=chart(104,104,'Cumulative population (%)','Cumulative income (%)');x=np.array([0,20,40,60,80,100])
    curve(ax,x,x,'Equality',0,label_at=.45,offset=(-42,20))
    ys=[[0,5,15,30,55,100]] if idx==68 else [[0,10,22,40,65,100],[0,2,7,17,40,100]] if idx==69 else [[0,5,15,30,55,100],[0,10,22,40,65,100]]
    names=['Lorenz'] if idx==68 else ['A','B'] if idx==69 else ['Before transfers','After transfers']
    for k,(y,name) in enumerate(zip(ys,names),1):
        curve(ax,x,np.array(y),name,k,label_at=.57,offset=((8,-24) if idx==69 or k==1 else (8,32)))
        for q,p in zip(x[1:-1],y[1:-1]):point(ax,q,p,str(p),(-18,6) if k==1 else (8,8))
    ax.set_xticks([0,20,40,60,80,100]);ax.set_yticks([0,20,40,60,80,100])
    if idx==70:ax.text(.02,.94,'Gini: before = 0.380; after = 0.252',transform=ax.transAxes,fontsize=12)
    save(fig,idx,'Piecewise-linear Lorenz coordinates: '+str(ys)+'; equality y=x.')

for idx in [92,95]:
    fig,ax=chart(85,95,'Quantity','Price ($)');x=np.linspace(0,80,300)
    curve(ax,x,80-x,'D',0,label_at=.86);curve(ax,x,20+x,'S',1,label_at=.84)
    curve(ax,x,np.full_like(x,30),'Pw',2,label_at=.94,offset=(0,-19));curve(ax,x,np.full_like(x,40),'Pq' if idx==92 else 'Pt',3,label_at=.94)
    for q,p in [(10,30),(20,40),(40,40),(50,30)]:guide(ax,q,p)
    if idx==95:
        ax.fill([10,20,20],[30,30,40],facecolor='#e5e5e5',hatch='///',edgecolor='#888888',lw=.5)
        ax.fill([20,40,40,20],[30,30,40,40],facecolor='#eeeeee',hatch='..',edgecolor='#888888',lw=.5)
        ax.fill([40,40,50],[30,40,30],facecolor='#e5e5e5',hatch='\\\\',edgecolor='#888888',lw=.5)
        for q,p,l in [(17,33,'A'),(30,35,'B'),(43,33,'C')]:ax.text(q,p,l,ha='center',va='center',weight='bold',fontsize=12)
    ax.set_xticks([0,10,20,30,40,50,80]);ax.set_yticks([0,20,30,40,50,80]);save(fig,idx,'D=80−Q; S=20+Q; Pw30; policy price40. Regions A(10,30)-(20,40), B rectangle20..40, C(40,40)-(50,30).','Remove answer-revealing quota caption; place region letters inside hatched regions.')

for idx in [121,122]:
    xmax=12 if idx==121 else 120;fig,ax=chart(xmax,100,'Community fireworks displays per summer' if idx==121 else 'Hours of local public radio per week','$ thousands per display' if idx==121 else 'Marginal benefit / cost ($ hundreds per hour)')
    if idx==122:ax.set_ylabel('Marginal benefit / cost\n($ hundreds per hour)',fontsize=14)
    x=np.linspace(0,xmax,400)
    a=np.maximum(0,50-(5 if idx==121 else .5)*x);b=np.maximum(0,(40 if idx==121 else 30)-(5 if idx==121 else .5)*x)
    curve(ax,x,a,'North MB' if idx==121 else 'Group A MB',0,label_at=.4,offset=(10,10));curve(ax,x,b,'South MB' if idx==121 else 'Group B MB',1,label_at=.55,offset=(15,-21))
    curve(ax,x,a+b,'MSB',2,label_at=.25,offset=(8,8));mc=50 if idx==121 else 30
    curve(ax,x,np.full_like(x,mc),'MC',3,label_at=.9)
    q=4 if idx==121 else 40
    for p in [mc,30,20] if idx==121 else [40,30,10]:guide(ax,q,p);point(ax,q,p)
    save(fig,idx,f'Individual MB=max(0,50−kQ), max(0,{40 if idx==121 else 30}−kQ); k={5 if idx==121 else .5}; MSB=sum; MC={mc}.')

for idx,(q1,p1,mc1) in enumerate([(20,70,50),(24,76,49.6),(18,64,47.8),(28,82,48.4),(22,68,50.4)],126):
    d=.5;F=q1*(p1-mc1+d*q1);c=mc1-q1;b=(p1-mc1)/q1;a=p1+b*q1;q2=math.sqrt(F/d);xmax=q2*1.48
    fig,ax=chart(xmax,a*1.15);x=np.linspace(2,xmax,600)
    for k,(y,name) in enumerate([(a-b*x,'D = AR'),(a-2*b*x,'MR'),(F/x+c+d*x,'ATC'),(c+x,'MC')]):curve(ax,x,y,name,k,label_at=.92)
    for q,p in [(q1,p1),(q1,mc1),(q2,F/q2+c+d*q2)]:guide(ax,q,p);point(ax,q,p)
    ax.set_xticks([0,q1,q2]);ax.set_xticklabels(['0',f'Q1 = {q1:g}',f'Q2 = {q2:.2f}']);ax.set_yticks(sorted({0,p1,mc1,round(a)}))
    assert abs(a-2*b*q1-(c+q1))<1e-8
    save(fig,idx,f'TC={F}+{c}Q+.5Q²; D={a}−{b}Q; Q1={q1}; Q2={q2}.')

for idx in [131,133,135]:
    xmax=90 if idx<135 else 120;fig,ax=chart(xmax,70 if idx<135 else 80);x=np.linspace(3,xmax,500)
    if idx==131:models=[(60-.5*x,'D'),(60-x,'MR'),(15+.25*x,'MC')];pts=[(36,42),(36,24),(48,36),(48,27),(60,30)];xt=[0,20,36,48,60,80];yt=[0,15,24,30,36,42,60]
    elif idx==133:models=[(60-.5*x,'D'),(60-x,'MR'),(10+.25*x,'MC'),(10+.125*x+1200/x,'ATC'),(10+.125*x,'AVC')];pts=[(40,40),(40,45),(40,20),(40,15)];xt=[0,20,40,60,80];yt=[0,15,20,30,40,45,60]
    else:models=[(74-.6*x,'D'),(74-1.2*x,'MR'),(np.full_like(x,20),'MC'),(20+180/x,'LRAC')];pts=[(45,47),(90,20)];xt=[0,30,45,60,90,120];yt=[0,20,40,47,60,80]
    for k,(y,name) in enumerate(models):curve(ax,x,y,name,k,label_at=.6 if name in ['D','MR'] else .92,offset=(3,-18 if name in ['MC','AVC'] else 12))
    for q,p in pts:guide(ax,q,p);point(ax,q,p)
    if idx==131:point(ax,48,27,'$27',(8,-17))
    ax.set_xticks(xt);ax.set_yticks(yt)
    if idx==135:fig.text(.5,-.01,'Long-run costs for identical firms using the same technology',ha='center',fontsize=12)
    save(fig,idx,{131:'D60−.5Q; MR60−Q; MC15+.25Q',133:'D60−.5Q; MR60−Q; MC10+.25Q; ATC10+.125Q+1200/Q; AVC10+.125Q',135:'D74−.6Q; MR74−1.2Q; MC20; LRAC20+180/Q'}[idx])

for idx,A,b,mc in [(140,100,2,20),(141,120,2,24),(142,90,1.5,18),(143,140,2.5,30),(144,110,1,30),(145,150,3,24)]:
    fig,ax=chart(A/b,A*1.12);x=np.linspace(0,A/b,400)
    curve(ax,x,A-b*x,'D',0,label_at=.65);curve(ax,x,A-2*b*x,'MR',1,label_at=.58);curve(ax,x,np.full_like(x,mc),'MC',2,label_at=.91)
    qm=(A-mc)/(2*b);qe=2*qm;p=(A+mc)/2
    for q,v in [(qm,p),(qm,mc),(qe,mc)]:guide(ax,q,v);point(ax,q,v)
    ax.set_xticks(sorted({0,qm,qe,A/b}));ax.set_yticks(sorted({0,mc,p,A}))
    save(fig,idx,f'D={A}−{b}Q; MR={A}−{2*b}Q; MC={mc}; cartel Q={qm}, P={p}, efficient Q={qe}; operating profit={(p-mc)*qm}; DWL={.5*(qe-qm)*(p-mc)}.','Direct curve labels and exact cartel/competitive coordinate guides for arithmetic.')

for idx,(qk,pk,upper,lower,cost) in enumerate([(20,60,.5,1.5,40),(30,72,.4,1.2,48)],146):
    au=pk+upper*qk;al=pk+lower*qk;fig,ax=chart(qk*2,al*1.12)
    xu=np.linspace(0,qk,300);xl=np.linspace(qk,qk*2,300)
    ax.plot(xu,au-upper*xu,color=COLORS[0]);curve(ax,xl,al-lower*xl,'D',0,label_at=.78)
    curve(ax,xu,au-2*upper*xu,'MR',1,label_at=.35,offset=(0,-20));curve(ax,xl,al-2*lower*xl,'MR',1,label_at=.75,offset=(6,8))
    curve(ax,np.array([0,qk*2]),np.array([cost,cost]),'MC',2,label_at=.1,offset=(10,10))
    ax.vlines(qk,pk-lower*qk,pk-upper*qk,color='#555555',ls=':',lw=1.5)
    for p,l,off in [(pk,f'Kink ({qk}, {pk})',(8,12)),(pk-upper*qk,f'{pk-upper*qk:g}',(8,0)),(pk-lower*qk,f'{pk-lower*qk:g}',(8,-12))]:point(ax,qk,p,l,off)
    ax.set_xticks([0,qk,2*qk]);save(fig,idx,f'Kink Q{qk}, P{pk}; upper slope{upper}, lower slope{lower}; MC{cost}.')

for idx in [216]:
    fig,ax=chart(250,21,'Quantity of movies (thousands)','Price of a movie ($)');x=np.linspace(0,240,400)
    curve(ax,x,18-.075*x,'D0',0,label_at=.84);curve(ax,x,3+.075*x,'S0',1,label_at=.84);curve(ax,x,12-.075*x,'Demand with tax',2,label_at=.45,offset=(12,-25))
    for q,p in [(100,10.5),(60,13.5),(60,7.5)]:guide(ax,q,p);point(ax,q,p,'e' if q==100 else None)
    ax.set_xticks([0,60,100,160,200,240]);ax.set_yticks([0,3,7.5,10.5,13.5,18]);save(fig,idx,'D18−.075Q; S3+.075Q; demand with tax12−.075Q; E100,10.5; tax Q60 buyer13.5 seller7.5.')

(OUT/'asset-changes.json').write_text(json.dumps(LEDGER,indent=2,ensure_ascii=False),encoding='utf-8')
print(f'Staged {len(LEDGER)} equation-based accessible graphs')
