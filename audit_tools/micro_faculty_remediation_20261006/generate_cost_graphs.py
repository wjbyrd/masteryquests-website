"""Accessible firm graphs with explicit, internally consistent cost models.

TC=F+aQ+bQ²+cQ³. The selected readings and all referenced economic
comparisons are retained; faculty-directed new coordinates are recorded.
"""
from generate_graphs import *

def firm(target,F,a,b,c,price,qstar,show=('MC','ATC','AVC'),q1=False,yticks=None,reason=None):
    fig,ax=chart(100,65);x=np.linspace(2,88,800)
    values={'MC':a+2*b*x+3*c*x*x,'ATC':F/x+a+b*x+c*x*x,'AVC':a+b*x+c*x*x}
    for k,name in enumerate(show):curve(ax,x,values[name],name,k,label_at=.86 if name=='MC' else .80 if name=='ATC' else .94,offset=(4,12 if name!='AVC' else -20))
    avc=a+b*qstar+c*qstar*qstar;atc=avc+F/qstar
    if price is not None:
        ax.plot([0,95],[price,price],color='#333333',ls='--',lw=2)
        ax.annotate('D = AR = MR',(95,price),xytext=(5,0),textcoords='offset points',fontsize=13,va='center',clip_on=False)
        for p in [price]+([atc,avc] if 'AVC' in show else [atc] if 'ATC' in show else []):guide(ax,qstar,p);point(ax,qstar,p)
        if q1:ax.text(qstar,2,'Q1',ha='center',fontsize=12,bbox=dict(facecolor='white',edgecolor='none',pad=1))
        if target in [207,208]:
            qm=-b/(2*c);v=a-b*b/(4*c);guide(ax,qm,v);point(ax,qm,v)
    else:
        minimum=-b/(2*c);threshold=a-b*b/(4*c);guide(ax,minimum,threshold);point(ax,minimum,threshold)
        ax.set_yticks(sorted({0,10,round(threshold,5),30,40,50,60}))
    if yticks is not None:ax.set_yticks(yticks)
    elif price is not None:ax.set_yticks(sorted({0,10,round(price,5),round(avc,5),round(atc,5),40,50,60}))
    ax.set_xticks(range(0,101,10))
    save(fig,target,f'TC={F}+{a}Q+{b}Q²+{c}Q³; P={price}; marked Q={qstar}; AVC={avc}; ATC={atc}.',reason or 'Rebuild legible cost curves with direct labels, ten-unit quantity ticks and exact required readings; preserve the keyed comparison.')

# Faculty requests P40/Q60. Separate P37/Q60 version keeps the other
# explicitly requested original-price calculation on the shared old image.
firm(204,360,24,-7/15,1/150,40,60)
firm(205,360,24,-7/15,1/150,40,60)
# Derive a and b from the target readings, with c=.006.
# AVC60=18, MC60=37 => b=(19−2*.006*3600)/60; a=18−60b−.006*3600.
b=(19-2*.006*3600)/60;a=18-60*b-.006*3600
firm('question-assets/perfect-competition/pc_profit_a-original-price.webp',360,a,b,.006,37,60)
for idx in [195,196]:firm(idx,450,27,-.52,.006,20,50)
firm(197,375,25,-.44,.005,18.5,50,q1=True)
firm(206,300,27,-.72,.01,30,50,yticks=list(range(0,61,10)))
for idx,p,minimum,qm in [(207,14,19,42),(208,12,17,40)]:
    c=.014;b=-2*c*qm;a=minimum+c*qm*qm
    roots=np.roots([3*c,2*b,a-p]);qstar=max(float(r.real) for r in roots if abs(r.imag)<1e-7)
    firm(idx,450,a,b,c,p,qstar,yticks=sorted({0,10,p,minimum,30,40,50,60}))
for idx,minimum,qm in [(209,16,40),(210,18,44),(211,14,38)]:
    c=.006;b=-2*c*qm;a=minimum+c*qm*qm
    firm(idx,0,a,b,c,None,qm,show=('MC','AVC'))
for idx,p in [(192,24),(212,23)]:firm(idx,400,p,-.48,.0064,p,50,show=('MC','ATC') if idx==192 else ('MC','ATC','AVC'),q1=True)

def integration(target,price,marketq,F,a,b,c,firmq,marketmax,firmmax,show_mr=False,market_only=False,firm_only=False):
    if market_only or firm_only:fig,axs=plt.subplots(figsize=(9,6));axs=[axs]
    else:fig,axs=plt.subplots(1,2,figsize=(13,5.6));fig.subplots_adjust(wspace=.36)
    def setup(ax,xlim,ylim,xlabel,ylabel,title):
        ax.set(xlim=xlim,ylim=ylim,xlabel=xlabel,ylabel=ylabel,title=title);ax.spines[['top','right']].set_visible(False);ax.grid(color='#e5e5e5',lw=.6);ax.set_axisbelow(True)
    if not firm_only:
        ax=axs[0];setup(ax,(0,marketmax),(0,price*1.8),'Market quantity (000s)','Price ($)','Market')
        x=np.linspace(0,marketmax,400);slope=price*.6/marketq
        curve(ax,x,price+slope*(marketq-x),'D',0,label_at=.9);curve(ax,x,price+slope*(x-marketq),'S',1,label_at=.9)
        guide(ax,marketq,price);point(ax,marketq,price,'E');ax.set_xticks([0,marketq,marketmax]);ax.set_yticks([0,price/2,price,price*1.5])
    if not market_only:
        ax=axs[-1];setup(ax,(0,firmmax),(0,price*1.8),'Firm quantity','Cost / revenue ($)' if show_mr else 'Cost ($)','Representative firm')
        x=np.linspace(3,firmmax*.92,700)
        for k,(y,name) in enumerate([(a+2*b*x+3*c*x*x,'MC'),(F/x+a+b*x+c*x*x,'ATC'),(a+b*x+c*x*x,'AVC')]):curve(ax,x,y,name,k,label_at=.90,offset=(3,12 if name!='AVC' else -20))
        if show_mr:
            ax.plot([0,firmmax*.94],[price,price],color='#222222',ls='--');ax.text(firmmax*.24,price+price*.035,'D = AR = MR',fontsize=12,ha='center',bbox=dict(facecolor='white',edgecolor='none',pad=1))
            for p in [price,F/firmq+a+b*firmq+c*firmq*firmq,a+b*firmq+c*firmq*firmq]:guide(ax,firmq,p);point(ax,firmq,p)
        ax.set_xticks([0,firmq/2,firmq,firmmax]);ax.set_yticks([0,price/4,price/2,price*.75,price,price*1.5] if not str(target).endswith('price-transfer.webp') else [0,5,10,20,25])
    save(fig,target,f'Market E=({marketq},{price}); S/D slope±{price*.6/marketq}. Firm TC={F}+{a}Q+{b}Q²+{c}Q³; Q*={firmq}; price line shown={show_mr}.','Direct labels in both panels; preserve integration task by omitting the firm MR line where students must transfer market price.')

params=[(186,40,75,450,8,-11/90,1/450,90,125,120),(189,25,100,400,17,-.16,.0032,50,160,90),(201,45,75,400,35,-.7,96.8/(3*62**2),62,110,100),(202,42,80,500,36,-.65,85.3/(3*61**2),61,110,100)]
for args in params:integration(*args)
# These faculty-only variants remove the extraneous panel without changing
# the shared PC06/07/08 assets used by faculty PASS questions.
integration('question-assets/perfect-competition/PC-06-market-only.webp',*params[0][1:],market_only=True)
integration('question-assets/perfect-competition/PC-08-market-only.webp',*params[1][1:],market_only=True)
integration('question-assets/perfect-competition/PC-07-firm-only.webp',15,75,400,13,-.22,.0032,50,125,100,show_mr=True,firm_only=True)
# PC07 paired price-transfer task: retain cost curves and remove firm-side
# price tick / label via an explicit model, so market reading remains necessary.
integration('question-assets/perfect-competition/PC-07-price-transfer.webp',15,75,400,13,-.22,.0032,50,125,100)
integration(203,40,80,500,36,-.65,(40-36+1.3*60)/(3*60**2),60,110,100,show_mr=True)

# The productivity-shift question needs exact MC readings at Q20.
fig,ax=chart(80,120,'Quantity','Cost per unit ($)');x=np.linspace(2,80,600)
for k,(y,name,at,off) in enumerate([(30-1.6*x+.04*x*x,'MC1',.68,(-30,12)),(20-1.6*x+.04*x*x,'MC2',.93,(6,-17)),(240/x+30-.8*x+x*x/75,'ATC1',.9,(5,12)),(240/x+20-.8*x+x*x/75,'ATC2',.9,(5,-18))]):curve(ax,x,y,name,k,label_at=at,offset=off)
for p in [14,4]:guide(ax,20,p);point(ax,20,p)
ax.set_xticks(range(0,81,10));ax.set_yticks([0,4,14,30,60,90,120]);save(fig,46,'TC1=240+30Q−.8Q²+Q³/75; TC2=TC1−10Q. MC1(20)=14; MC2(20)=4.','Separate the crowded MC labels and expose the numerical readings requested in the existing flagged task.')

(OUT/'asset-changes.json').write_text(json.dumps(LEDGER,indent=2,ensure_ascii=False),encoding='utf-8')

(OUT/'asset-changes.json').write_text(json.dumps(LEDGER,indent=2,ensure_ascii=False),encoding='utf-8')
print(f'Staged {len(LEDGER)} graph sources including firm diagrams')
