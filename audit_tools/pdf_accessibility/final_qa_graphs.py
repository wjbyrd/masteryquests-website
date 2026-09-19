"""Readable, proportion-preserving plots from explicit economic models.

Build dependencies: matplotlib==3.11.2, fonttools==4.65.0; runtime only needs Pillow.
Original source assets stay intact. New graphs are review-sheet-specific.
"""
import hashlib,json,io,copy
import numpy as np
from PIL import Image
from canonical_components.dense_modes import graph_model

TICKS={
 'GEN-ECON-17':([0,100,150,200,300],[0,2,3,4,6]),
 'GEN-ECON-08':([0,5,10,15,20,25],[0,20,35,50]),
 'GEN-ECON-25':([0,75,150,200,275,350],[0,3,6,14]),
 'MICRO-08':([0,30,60,90,120,150],[0,4,8,12,16,20]),
 'MICRO-31':([0,22,44,66,88],[0,10,20,30,41,50,60]),
 'MICRO-02':([0,80,100,160],[0,12,15,18,30]),
 'MICRO-16':([0,100,175,250,350],[0,7,10,14]),
 'MICRO-22':([100,200,300,400,450],[0,10,12,20,25]),
 'MICRO-40':([0,45,90,120],[0,20,47,74]),
 'MICRO-44':([0,20,36,60,80],[0,15,27,39,50]),
 'MICRO-45':([0,20,36,60,80],[0,15,27,39,50]),
 'MACRO-37':([0,3,5,7,10],[0,2.5,5,7.5]),
 'MACRO-57':([0,50,100,150,200],[0,.5,1,1.5,2]),
 'equilibrium':([0,150,300],[0,5,10]),
 'tax_incidence':([0,80,100,150],[0,13,19,35]),
 'fixed_cost':([0,20,40,60,80],[0,10,30,50,70]),
 'kinked_demand':([0,20,40],[0,20,40,50,60,80]),
 'minimum_wage':([50,90,120,150],[0,12,15,24]),
 'median_voter':([10,20,30,40,50],[]),
}

def model_for(code,kind):
    from canonical_components.retained_models import CODES,model as retained
    from repo_guard import read_json
    old=read_json('tmp/pdf_accessibility/final_qa_20260919/baseline/accessibility_semantics.json')
    meta=old['pilot'][code];alt=meta.get('graphAlternative') or old.get('descriptions',{}).get(meta.get('descriptionKey'),'')
    if kind in CODES:p=retained(kind)
    elif kind==code:p=original_model(code)
    else:p,alt,_=graph_model(kind)
    p=copy.deepcopy(p)
    if kind in TICKS:p.limits.update(xticks=TICKS[kind][0],yticks=TICKS[kind][1])
    if code=='GEN-ECON-17':
        p.plot([150],[3],marker='o');p.annotate('E',(150,3),xytext=(7,7),textcoords='offset points')
        for q in [100,200]:p.plot([q,q],[0,2],color='#87929D',ls=':')
        p.plot([0,200],[2,2],color='#87929D',ls=':')
        p.xlabel='Quantity of gas (thousand gallons)';p.ylabel='Price ($ per gallon)'
        alt='Gas quantity in thousands of gallons is horizontal; price per gallon is vertical. Demand slopes down, supply slopes up. Equilibrium E is at 150 thousand gallons and $3. At $2, demand is 200 thousand and supply 100 thousand: a shortage of 100 thousand, pushing price upward. At $4, demand is 100 thousand and supply 200 thousand: a surplus of 100 thousand, pushing price downward.'
    if code=='MICRO-02':
        p.series=[s for s in p.series if s[3]]
        for q,v in [(80,12),(80,18),(100,15)]:p.plot([0,q,q],[v,v,0],color='#87929D',ls=':')
        p.limits.update(xlim=(0,160),ylim=(0,32))
    if code=='MICRO-22':
        p.series=[(a,b,'--' if label=='AVC' else '-.' if label=='AC' else style,'ATC' if label=='AC' else label,mark) for a,b,style,label,mark in p.series]
        p.limits.update(ylim=(6,27));p.limits['yticks']=[10,20,25]
        p.annotate('AVC = 12',(400,12),xytext=(-54,7),textcoords='offset points')
        alt='Quantity is horizontal and cost per unit is vertical. MC is solid, ATC dash-dot, and AVC thick dashed; thin dotted lines are reading guides. At Q 200, MC crosses minimum AVC at $10. At Q 400, ATC is $20 and AVC $12, so AFC is $8. MC crosses ATC at its minimum at Q 400.'
    if code in ('MICRO-44','MICRO-45'):
        # Consistent TC derivatives: D and ATC are tangent at (36,27), MR=MC=15.
        from qa_plot import Plot
        p=Plot();q=np.linspace(8,80,500)
        p.plot(q,39-q/3,label='D = AR',color='#145A86')
        p.plot(q,39-2*q/3,label='MR',color='#67429A',ls='--')
        p.plot(q,.012*q*q-.4*q+13.848,label='MC',color='#9C3324',ls='-.')
        p.plot(q,.004*q*q-.2*q+13.848+546.048/q,label='ATC',color='#27652D',ls=':')
        for v in [15,27]:p.plot([0,36,36],[v,v,0],color='#87929D',ls=':');p.plot([36],[v],marker='o')
        p.set(xlim=(0,80),ylim=(0,50),xticks=TICKS[code][0],yticks=TICKS[code][1]);p.xlabel='Quantity';p.ylabel='Price / cost ($)'
        alt='Quantity is horizontal; price and cost are vertical. Downward demand D = AR is tangent to ATC at Q 36 and P $27. MR crosses MC from above at Q 36 and $15. Price equals ATC, so economic profit is zero. Price exceeds MC and output is below the ATC-minimizing quantity, illustrating markup and excess capacity.'
    if code=='MACRO-37':
        p.series=[s for s in p.series if s[3]!='LRPC'];p.limits.update(ylim=(0,8))
        alt='Unemployment rate is horizontal and inflation rate vertical. One downward short-run Phillips curve, SRPC0, passes through A at 5% unemployment and 2.5% inflation. With expected inflation and supply conditions fixed, stronger aggregate demand moves up and left along this curve; weaker demand moves down and right. No long-run curve is needed for this comparison.'
    if code=='MACRO-30':alt='Price level P is vertical; real output demanded Y is horizontal. AD2 lies right of AD1. At price level 100, Y1 is 100 and Y2 is 150. The figure compares quantities demanded at a fixed price level after expansionary fiscal policy; aggregate supply is not shown, so it does not determine the new equilibrium output.'
    if code=='MICRO-68':
        p.notes=[x for x in p.notes if x[0]=='Median'];p.series=[(a,b,st,{'Majority for 30 over higher proposals':'30 beats higher proposals','Majority for 30 over lower proposals':'30 beats lower proposals'}.get(l,l),m) for a,b,st,l,m in p.series]
    if code=='MACRO-57':p.ylabel='Foreign currency per U.S. dollar'
    if code in ('MACRO-35','MACRO-50','MACRO-51'):
        p.limits['yticks']={'MACRO-35':[0,100,150,250],'MACRO-50':[0,125,250],'MACRO-51':[0,125,175,250]}[code]
    if code=='MACRO-50':
        p.notes=[('B (115,110)' if t=='B' else t,point,(-65,-17) if t=='B' else offset,coords,arrow) for t,point,offset,coords,arrow in p.notes]
    return p,alt

def original_model(code):
    """Transcribed original assets: visible anchors, units and curve roles.

    Curved cost illustrations use cost functions consistent with the stated
    marginal/average intersections. These are illustrative models, not estimates.
    """
    from qa_plot import Plot
    p=Plot();blue='#145A86';red='#9C3324';green='#27652D';purple='#67429A'
    def line(name,x,y,color=blue,style='-'):p.plot(x,y,label=name,color=color,ls=style)
    def point(x,y,label=''):
        p.plot([x],[y],marker='o')
        if label:p.annotate(label,(x,y),xytext=(5,7),textcoords='offset points')
    def guide(x,y):p.plot([0,x,x],[y,y,0],color='#87929D',ls=':')
    def config(xlim,ylim,xt,yt,xlabel='Quantity',ylabel='Price ($)'):
        p.set(xlim=xlim,ylim=ylim,xticks=xt,yticks=yt);p.xlabel=xlabel;p.ylabel=ylabel
    if code in ['GEN-ECON-12','GEN-ECON-13','GEN-ECON-14','GEN-ECON-15']:
        q=np.linspace(0,375,250)
        if code=='GEN-ECON-12':line('Demand',q,14-.04*q);point(100,10,'A');point(225,5,'B');xt=[0,100,225,350];yt=[0,5,10,14]
        elif code=='GEN-ECON-13':line('D0',q,12-.04*q);line('D1',q,15-.04*q,blue,'--');xt=[0,100,200,300,375];yt=[0,5,10,15]
        elif code=='GEN-ECON-14':line('Supply',q,2+.04*q,red);point(100,6,'A');point(225,11,'B');xt=[0,100,225,300];yt=[0,2,6,11,14]
        else:line('S0',q,1+.04*q,red);line('S1',q,5+.04*q,red,'--');xt=[0,100,200,300];yt=[0,5,10,15]
        noun={'GEN-ECON-12':'gourmet donuts','GEN-ECON-13':'coffee','GEN-ECON-14':'coffee','GEN-ECON-15':'hamburgers'}[code]
        config((0,375),(0,17),xt,yt,f'Quantity of {noun} (thousands)')
    elif code=='GEN-ECON-18':
        q=np.linspace(0,350,200);line('D0',q,6-.02*q);line('D1',q,8-.02*q,blue,'--');line('S0',q,.02*q,red);line('S1',q,2+.02*q,red,'--');config((0,350),(0,7),[0,100,150,200,300],[0,2,3,4,5,6],'Gas (thousand gallons)')
    elif code in ['GEN-ECON-19','GEN-ECON-20']:
        q=np.linspace(50,350,200);line('Demand',q,70-.2*q);line('Supply',q,-10+.2*q,red,'--')
        for x,y in [(100,50),(150,40),(200,30),(250,20),(300,10)]:guide(x,y)
        config((50,350),(0,65),[100,150,200,250,300],[10,20,30,40,50])
    elif code=='GEN-ECON-21':
        q=np.linspace(0,240,300);line('D0',q,18-.075*q);line('S0',q,3+.075*q,red,'--');line('Demand less $6 tax',q,12-.075*q,purple,'-.')
        for x,y in [(100,10.5),(60,7.5),(60,13.5)]:guide(x,y);point(x,y)
        config((0,240),(0,20),[0,60,100,160,240],[0,3,7.5,10.5,13.5,18],'Movies (thousands)')
    elif code in ['GEN-ECON-23','GEN-ECON-24']:
        q=np.linspace(0,350,200);line('Domestic demand',q,14-.04*q);line('Domestic supply',q,(0 if code.endswith('23') else 2)+.04*q,red,'--')
        if code.endswith('23'):
            p.axhline(5,label='World price = 5',color=green,ls='-.');point(175,7,'A');xt=[0,125,175,225,350];yt=[0,5,7,14]
        else:
            p.axhline(4,label='World price = 4',color=green,ls='-.');p.axhline(6,label='With tariff = 6',color=purple,ls=':');point(150,8,'E');xt=[0,50,100,150,200,250,350];yt=[0,4,6,8,14]
            for x,y in [(50,4),(100,6),(200,6),(250,4)]:guide(x,y)
        config((0,350),(0,17),xt,yt,'Quantity (thousands)')
    elif code in ['MICRO-04','MICRO-05']:
        if code=='MICRO-04':
            line('Demand',[0,120],[16,0]);pts=[(30,12,'C'),(60,8,'B'),(90,4,'A')];config((0,150),(0,20),[0,30,60,90,120],[0,4,8,12,16])
        else:
            line('Short-run supply',[40,75],[-4,10],red);line('Long-run supply',[10,110],[-1,9],blue,'--');pts=[(60,4,''),(70,8,'A'),(100,8,'B')];config((0,115),(0,10),[0,40,60,70,100],[0,4,8,10])
        for x,y,l in pts:guide(x,y);point(x,y,l)
    elif code=='MICRO-10':
        line('Demand',[0,15],[30,0]);line('Supply',[0,15],[6,21],red,'--');guide(8,14);point(8,14,'E');config((0,15),(0,32),[0,4,8,12],[0,6,14,22,30])
    elif code=='MICRO-17':
        line('Demand',[0,80],[80,0]);line('Supply',[0,70],[20,90],red,'--');p.axhline(30,label='World price',color=green,ls='-.');point(30,50,'Autarky');guide(10,30);guide(50,30)
        p.fills=[([(10,30),(30,30),(30,50)],'#9C3324','//'), ([(30,30),(30,50),(50,30)],'#145A86','..')]
        config((0,85),(0,90),[0,10,30,50,80],[0,20,30,50,80])
    elif code=='MICRO-26':
        q=np.linspace(0,120,300);line('LRAC',q,12+.008888889*(q-60)**2);config((0,120),(0,50),[0,30,60,90,120],[0,12,20,40],'Quantity','Long-run average cost ($)')
    elif code in ['MICRO-29','MICRO-31']:
        if code=='MICRO-31':
            from canonical_components.retained_models import model
            return model('MICRO-32')
        q=np.linspace(4,85,350);avc=.004*q*q-.2*q+15
        line('MC',q,.012*q*q-.4*q+15,red);line('ATC',q,avc+500/q,blue,'--');line('AVC',q,avc,green,'-.');p.axhline(25,label='P = MR = AR',color=purple,ls=':');guide(50,25);guide(50,15)
        config((0,90),(0,60),[0,25,50,75],[0,15,25,40,60],'Firm quantity','Cost / revenue ($)')
    elif code=='MICRO-34':line('Long-run supply',[0,105],[18,51.6]);config((0,110),(0,70),[0,25,50,75,100],[0,20,40,60],'Industry quantity')
    elif code in ['MICRO-37','MICRO-38','MICRO-39','MICRO-41']:
        q=np.linspace(3,200,400)
        if code=='MICRO-41':
            line('Demand',q,45-.25*q);line('MR',q,45-.5*q,purple,'--');p.axhline(10,label='MC',color=red,ls='-.');line('ATC',q,10+700/q,green,':')
            for x,y in [(70,27.5),(115,16.25),(140,10),(140,15)]:guide(x,y);point(x,y)
            config((0,185),(0,60),[0,70,115,140,180],[0,10,15,27.5,45])
        else:
            line('Demand',q,60-.5*q);line('MR',q,60-q,purple,'--');a=15 if code=='MICRO-39' else 10;F=270 if code=='MICRO-39' else 1200
            line('MC',q,a+.25*q,red,'-.');line('ATC',q,a+.125*q+F/q,green,':')
            for x,y in ([(36,24),(36,42),(36,27),(60,30)] if code=='MICRO-39' else [(40,20),(40,40),(40,45),(66.6667,26.6667)]):guide(x,y);point(x,y)
            config((0,122),(0,65),[0,36,60,90,120] if code=='MICRO-39' else [0,40,67,90,120],[0,24,42,60] if code=='MICRO-39' else [0,20,40,60])
            p.annotate('ATC = 27' if code=='MICRO-39' else 'ATC = 45',(36,27) if code=='MICRO-39' else (40,45),xytext=(6,7),textcoords='offset points')
        p.ylabel='Price / cost ($)'
    elif code=='MICRO-54':
        q=np.linspace(0,320,300);line('MPB = MSB',q,21-.0375*q);line('MPC',q,3+.0375*q,red,'--');line('MSC',q,9+.0375*q,green,'-.');guide(160,15);guide(240,12);point(160,15);point(240,12)
        config((0,320),(0,24),[0,80,160,240,320],[0,3,9,12,15,21],'Garments (millions)','Marginal benefit / cost ($)')
    elif code=='MICRO-55':
        q=np.linspace(0,12,250);north=np.maximum(0,50-5*q);south=np.maximum(0,40-5*q)
        line('North MB',q,north,blue,'--');line('South MB',q,south,red,'-.');line('MSB',q,north+south,blue);p.axhline(50,label='MC',color=green,ls=':');point(4,50);guide(4,30);guide(4,20)
        config((0,12),(0,100),[0,4,8,10,12],[0,20,30,50,90],'Community fireworks displays','Benefit / cost ($ thousands)')
    elif code=='MICRO-59':
        q=[0,20,40,60,80,100];before=[0,5,15,30,55,100];after=[0,10,22,40,65,100]
        line('Equality',q,q,'#687787','--');line('Before: Gini 0.380',q,before);line('After: Gini 0.252',q,after,red,'-.');guide(40,15);guide(40,22)
        config((0,100),(0,100),[0,20,40,60,80,100],[0,25,50,75,100],'Cumulative households (%)','Cumulative income (%)')
    elif code=='MACRO-12':
        q=np.linspace(0,90,350);line('Output per worker',q,10*q**.35);point(20,28.53,'A');point(40,36.37,'B');guide(20,28.53);guide(40,36.37)
        config((0,100),(0,60),[0,20,40,60,80,100],[0,28.53,36.37,60],'Capital per worker','Output per worker')
    elif code=='MACRO-28':
        line('Money demand',[0,150],[12,0]);p.axvline(100,label='MS0',color=red);p.axvline(125,label='MS1',color=red,ls='--');guide(100,4);guide(125,2);config((0,180),(0,13),[0,50,100,125,150],[0,2,4,8,12],'Quantity of money','Nominal interest rate (%)')
    elif code in ['MACRO-33','MACRO-34','MACRO-35','MACRO-50','MACRO-51']:
        q=np.linspace(0,300,350)
        if code=='MACRO-33':line('AD0',q,120-.5*q);line('AD1',q,95-.5*q,blue,'--');config((0,260),(0,145),[0,70,120,190,240],[0,60,95,120],'Real GDP','Price level')
        elif code=='MACRO-34':line('AS0',q,70+.533333*q,red);line('AS1',q,110+.533333*q,red,'--');config((0,250),(0,250),[0,50,150,250],[0,70,150,190,250],'Real GDP','Price level')
        else:
            if code=='MACRO-35':line('AD0',q,175-q);line('AD1',q,225-q,blue,'--');line('AS0',q,25+q,red);line('AS1',q,75+q,red,'--');pts=[(75,100,'A'),(100,125,'B'),(75,150,'C'),(50,125,'D')]
            else:
                line('AD0',q,225-q);line('SRAS0',q,25+q,red);p.axvline(100,label='LRAS0',color=green,ls='-.')
                if code=='MACRO-50':line('SRAS1',q,-5+q,red,'--');p.axvline(115,label='LRAS1',color=green,ls=':');pts=[(100,125,'A'),(115,110,'B')]
                else:line('AD1',q,275-q,blue,'--');line('SRAS1',q,75+q,red,'--');pts=[(100,125,'C'),(125,150,'D'),(100,175,'B'),(75,150,'A')]
            for x,y,l in pts:point(x,y,l)
            config((0,180),(0,280),[0,50,75,100,125,175],[0,100,125,150,175,250],'Real GDP','Price level')
    elif code=='MACRO-36':
        q=np.linspace(0,4,200)
        line('AD1',q,3-q);line('AD2',q,5-q,blue,'--')
        line('AS1',q,q+1,red);line('AS2',q,q-1,red,'--')
        p.axvline(2,label='LRAS',color=green,ls='-.')
        for x,y in [(1,2),(2,1),(2,3),(3,2)]:guide(x,y);point(x,y)
        config((0,4),(0,4),[1,2,3],[1,2,3],'Real output (Y)','Price level')
        p.limits.update(xticklabels=['Y3','Y1','Y2'],yticklabels=['P1','P2','P3'])
    elif code in ['MACRO-43','MACRO-44','MACRO-45']:
        q=np.linspace(0,400,300)
        if code=='MACRO-43':line('D0: investment',q,15-.05*q);line('S0: saving',q,1+.05*q,red,'--');pts=[(140,8,'A')];xt=[0,70,140,210,280,350];yt=[0,4,8,12,16];xlim=(0,370)
        elif code=='MACRO-44':line('D0',q,12-.05*q);line('S0',q,4+.05*q,red);line('S1',q,.05*q,red,'--');pts=[(80,8,'A'),(120,6,'B')];xt=[0,80,120,240,320];yt=[0,4,6,8,12,20];xlim=(0,330)
        else:line('D0',q,12-.05*q);line('S0',q,2+.05*q,red);line('S1',q,4+.05*q,red,'--');pts=[(100,7,'A'),(80,8,'B')];xt=[0,80,100,160,240];yt=[0,2,4,7,8,12];xlim=(0,260)
        for x,y,l in pts:point(x,y,l);guide(x,y)
        config(xlim,(0,max(yt)+1),xt,yt,'Quantity of loanable funds','Real interest rate (%)')
    elif code=='MACRO-56':
        q=np.linspace(0,450,300);line('D0',q,1.4-.004*q);line('D1',q,1.8-.004*q,blue,'--');line('S0',q,.6+.004*q,red,'-.');point(100,1,'A');point(150,1.2,'B');guide(100,1);guide(150,1.2)
        config((0,450),(0,2.2),[0,100,150,300,450],[0,.6,1,1.2,1.8,2],'U.S. dollars exchanged','Foreign currency per U.S. dollar')
    else:raise ValueError('No original model: '+code)
    return p

ORIGINAL_CODES=('GEN-ECON-12','GEN-ECON-13','GEN-ECON-14','GEN-ECON-15','GEN-ECON-18','GEN-ECON-19','GEN-ECON-20','GEN-ECON-21','GEN-ECON-23','GEN-ECON-24','MICRO-04','MICRO-05','MICRO-10','MICRO-17','MICRO-26','MICRO-29','MICRO-31','MICRO-34','MICRO-37','MICRO-39','MICRO-41','MICRO-54','MICRO-55','MICRO-59','MACRO-12','MACRO-28','MACRO-33','MACRO-34','MACRO-35','MACRO-43','MACRO-44','MACRO-45','MACRO-50','MACRO-51','MACRO-56')

ORIGINAL_CODES=(*ORIGINAL_CODES,'MACRO-36')

FACTS={
 'GEN-ECON-12':'A is 100 thousand donuts at $10; B is 225 thousand at $5. Both lie on one downward demand curve, so A to B increases quantity demanded by 125 thousand.',
 'GEN-ECON-13':'At $10, D0 gives 50 thousand and D1 gives 125 thousand. D1 is a rightward demand shift at unchanged price.',
 'GEN-ECON-14':'A is 100 thousand at $6; B is 225 thousand at $11. Both lie on one upward supply curve, so this is movement along supply.',
 'GEN-ECON-15':'At $9, S0 gives 200 thousand and S1 gives 100 thousand. S1 is a leftward supply shift.',
 'GEN-ECON-18':'D0 and S0 meet at quantity 150 and price 3. Demand right to D1 and supply left to S1 both raise price; in this equal-sized illustration the new intersection is quantity 150, price 5. Quantity need not be unchanged for other relative shift sizes.',
 'GEN-ECON-19':'Demand and supply meet at quantity 200, price $30. At $20 demand is 250 and supply 150, a shortage of 100. At $40 demand is 150 and supply 250, a surplus of 100.',
 'GEN-ECON-20':'Demand and supply meet at quantity 200, price $30. At $40 supply is 250 and demand 150, a surplus of 100. At $20 demand is 250 and supply 150, a shortage of 100.',
 'GEN-ECON-21':'Before tax, equilibrium is 100 thousand movies at $10.50. A $6 tax remitted by buyers shifts their net-of-tax demand down. At 60 thousand, sellers receive $7.50 and buyers pay $13.50; each bears $3.',
 'GEN-ECON-23':'Without trade, quantity is 175 thousand and price $7. At the $5 world price, domestic supply is 125 thousand and demand 225 thousand, so imports are 100 thousand.',
 'GEN-ECON-24':'Without trade, quantity is 150 thousand and price $8. At world price $4, domestic supply is 50 thousand and demand 250 thousand. With the $2 tariff, price is $6, supply 100 thousand and demand 200 thousand. Imports fall from 200 thousand to 100 thousand.',
 'MICRO-04':'One straight demand curve contains C at quantity 30, price $12; B at 60, $8; and A at 90, $4. Equal absolute changes along the line do not imply equal percentage responsiveness.',
 'MICRO-05':'Both supply curves pass through quantity 60, price $4. At $8 the short-run curve gives 70 and the long-run curve 100. The long-run quantity response is greater.',
 'MICRO-10':'Demand intercepts price at $30. Supply and demand meet at quantity 8, price $14. Consumer surplus is the triangle below demand and above $14 up to quantity 8, with area $64.',
 'MICRO-17':'Autarky is quantity 30, price $50. At world price $30, production is 10 and consumption 50. Two differently hatched gain-from-trade triangles each have height $20 and base 20; combined gain is $400.',
 'MICRO-26':'Long-run average cost falls from about $20 at quantity 30 to minimum $12 at 60, then rises to about $20 at 90. Falling and rising segments show economies and diseconomies of scale.',
 'MICRO-29':'The firm price line is $25. At quantity 50 it meets marginal cost and minimum ATC. AVC is $15 there. Price equals marginal and average revenue for this competitive firm.',
 'MICRO-31':'The price line is $10, below minimum AVC of $20 at point A, quantity 22, so the firm shuts down. Points B, C and D lie farther up the rising marginal-cost curve; C is at about quantity 44 and minimum ATC $41.',
 'MICRO-34':'The long-run industry supply curve slopes upward. Industry expansion raises input costs, so sustaining a larger long-run quantity requires a higher price.',
 'MICRO-37':'MR crosses MC at quantity 40 and $20. Demand gives price $40 at that quantity; ATC is $45. The demand-MC intersection near quantity 67 and $27 is not the monopoly output choice.',
 'MICRO-39':'MR crosses MC at quantity 36 and $24. At that quantity demand gives price $42 and ATC is $27. Economic profit is ($42 minus $27) times 36, or $540.',
 'MICRO-41':'Constant MC is $10. Marginal-cost pricing gives quantity 140 and price $10, below ATC of $15, so a subsidy of about $700 is required to cover costs. Average-cost pricing near quantity 115 and price $16 covers cost but leaves price above MC.',
 'MICRO-54':'Private benefit equals social benefit here. MPB intersects MPC at quantity 240 million and $12. With external production cost, MSC is $6 above MPC; MSC intersects benefit at the efficient quantity 160 million and $15. The market overproduces.',
 'MICRO-55':'At four shared displays, North marginal benefit is $30 thousand and South marginal benefit $20 thousand. Their vertical sum, MSB $50 thousand, equals MC $50 thousand, making four displays efficient.',
 'MICRO-59':'At the bottom 40% of households, cumulative income share rises from 15% before transfers to 22% after transfers. The after-transfer Lorenz curve lies closer to equality, and Gini falls from 0.380 to 0.252. This does not establish a change in average income.',
 'MACRO-12':'An increasing, flattening production function contains A at capital per worker 20 and output 28.53, and B at capital 40 and output 36.37. Capital deepening raises output by 7.84; equal further capital increases add progressively less output.',
 'MACRO-28':'Vertical money supply rises from MS0 at 100 to MS1 at 125. With downward money demand unchanged, the nominal interest rate falls from 4% to 2%.',
 'MACRO-33':'AD1 lies left of AD0. At price level 60, output demanded falls from about 120 to 70. A spending change shifts demand at every price level.',
 'MACRO-34':'AS1 lies above and left of AS0. At real GDP 150, the associated price level rises from about 150 to 190. Higher production costs shift short-run supply; a current-price change alone moves along a curve.',
 'MACRO-35':'Initial A is output 75, price level 100. A demand increase alone reaches B at 100,125. An adverse supply shift alone reaches D at 50,125. Both shifts together reach C at 75,150 in this illustration.',
 'MACRO-43':'Upward saving supply and downward investment demand meet at A: quantity 140 and real interest rate 8%. Below 8%, desired investment exceeds desired saving; above it, desired saving exceeds investment.',
 'MACRO-44':'Saving supply shifts right from S0 to S1. With D0 unchanged, equilibrium moves from A at quantity 80 and real rate 8% to B at quantity 120 and rate 6%.',
 'MACRO-45':'Saving supply shifts left from S0 to S1. Equilibrium moves from A at investment 100 and real rate 7% to B at investment 80 and rate 8%, illustrating crowding out.',
 'MACRO-50':'A productivity improvement moves potential output from LRAS0 at 100 to LRAS1 at 115 and shifts short-run supply right. With AD0 fixed, equilibrium moves from A at output 100, price 125 to B at output 115, price 110.',
 'MACRO-51':'Initial long-run C is output 100, price 125. AD0 shifts right to AD1, reaching short-run D at output 125, price 150. Later SRAS shifts left to SRAS1, reaching B on LRAS at output 100, price 175. A at 75,150 is another labeled intersection, not the adjustment endpoint.',
 'MACRO-56':'Dollar demand shifts right from D0 to D1 with S0 fixed. Equilibrium moves from A at quantity 100 and rate 1.0 to B at quantity 150 and rate 1.2 foreign units per dollar. The dollar appreciates.',
}

def paired(code):
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    fig=plt.figure(figsize=(6.66,2.4),dpi=216)
    market=fig.add_axes([.09,.24,.34,.48]);firm=fig.add_axes([.58,.24,.37,.48])
    loss=code=='MICRO-30';price=15 if loss else 25;Q=75 if loss else 100
    x=np.linspace(0,150,300);market.plot(x,(25 if loss else 40)-(2/15 if loss else .15)*x,label='D',lw=1.5,color='#145A86');market.plot(x,(4 if loss else 7)+(11/75 if loss else .18)*x,label='S',ls='--',lw=1.5,color='#9C3324')
    market.plot(Q,price,'ko',ms=3);market.set(xlim=(0,150),ylim=(0,45),xticks=[0,Q,150],yticks=[0,price,40],xlabel='Market quantity');market.set_title('Market: price ($)',fontsize=9.2)
    q=np.linspace(5,90,350);avc=(.002*q*q-.1*q+10) if loss else (.004*q*q-.24*q+19);mc=(.006*q*q-.2*q+10) if loss else (.012*q*q-.48*q+19);atc=avc+400/q
    for v,label,col,ls in [(mc,'MC','#9C3324','-'),(atc,'ATC','#145A86','--'),(avc,'AVC','#27652D','-.')]:firm.plot(q,v,label=label,color=col,ls=ls,lw=1.5)
    firm.axhline(price,label='P = MR = AR',color='#67429A',ls=':',lw=1.6);firm.plot([50]*3,[price,18 if loss else 25,10 if loss else 17],'ko',ms=3)
    firm.set(xlim=(0,90),ylim=(0,60),xticks=[0,50,90],yticks=[0,10,18,30,60] if loss else [0,17,25,40,60],xlabel='Firm quantity');firm.set_title('Firm: cost / revenue ($)',fontsize=9.2)
    for ax in [market,firm]:
        ax.tick_params(labelsize=8.8,pad=2);ax.xaxis.label.set_size(9.2)
        for edge in ['top','right']:ax.spines[edge].set_visible(False)
    market.legend(frameon=False,loc='upper right',fontsize=8.8,handlelength=1.5)
    handles,labels=firm.get_legend_handles_labels()
    fig.legend(handles,labels,frameon=False,loc='upper center',bbox_to_anchor=(.77,1.02),ncol=2,fontsize=8.8,handlelength=1.7,columnspacing=.7)
    out=io.BytesIO();fig.savefig(out,format='png',dpi=216);plt.close(fig);out.seek(0);im=Image.open(out).convert('RGB')
    alt=('Market supply and demand meet at quantity 75 and price $15. The representative firm chooses quantity 50 where price equals marginal cost. ATC is $18 and AVC $10, so the firm loses $150 but covers variable cost.' if loss else 'Market supply and demand meet at quantity 100 and price $25. At firm quantity 50, price equals MR, AR, MC and minimum ATC at $25; AVC is $17. Economic profit is zero and the normal return is covered.')+' Each curve has a labeled line sample; the price line is dotted and average-cost curves have different dash patterns.'
    return im,alt,{'minimumLabelPt':8.8,'width':479.573,'height':479.573*im.height/im.width,'stacked':True,'renderer':'matplotlib 3.11.2','recipe':'paired-loss' if loss else 'paired-zero-profit'}

def render(code,kind,wide=False):
    import matplotlib
    matplotlib.use('Agg')
    import matplotlib.pyplot as plt
    p,alt=model_for(code,kind)
    if code in FACTS:alt=p.ylabel+' is vertical; '+p.xlabel+' is horizontal. '+FACTS[code]
    payload={k:getattr(p,k) for k in ['series','notes','fills','xlabel','ylabel','limits']}
    fig=plt.figure(figsize=(6.66 if wide else 4.445,2.4),dpi=216)
    ax=fig.add_axes([.11,.22,.84,.60] if wide else [.16,.23,.79,.49]);ax.tick_params(labelsize=8.8,pad=2,length=3)
    for edge in ['top','right']:ax.spines[edge].set_visible(False)
    ax.set_xlim(*p.limits.get('xlim',(0,100)));ax.set_ylim(*p.limits.get('ylim',(0,100)))
    if 'xticks' in p.limits:ax.set_xticks(p.limits['xticks'])
    if 'yticks' in p.limits:ax.set_yticks(p.limits['yticks'])
    if 'xticklabels' in p.limits:ax.set_xticklabels(p.limits['xticklabels'])
    if 'yticklabels' in p.limits:ax.set_yticklabels(p.limits['yticklabels'])
    ax.set_xlabel(p.xlabel,fontsize=9.2,labelpad=3)
    ax.text(0,1.04,p.ylabel,transform=ax.transAxes,fontsize=9.2,va='bottom')
    def xy(points):
        xlo,xhi=ax.get_xlim();ylo,yhi=ax.get_ylim()
        return [({'xmin':xlo,'xmax':xhi}.get(x,x) if isinstance(x,str) else x,{'ymin':ylo,'ymax':yhi}.get(y,y) if isinstance(y,str) else y) for x,y in points]
    for pts,color,hatch in p.fills:
        from matplotlib.patches import Polygon
        ax.add_patch(Polygon(xy(pts),facecolor='none',edgecolor=color,hatch=hatch,linewidth=.6,zorder=1))
    seen=set()
    for pts,color,style,label,marker in p.series:
        pts=xy(pts);xs,ys=zip(*pts)
        aliases={'Ddomestic':'Domestic D','Sdomestic':'Domestic S','Domestic Price under quota':'Quota price','ATC: higher fixed cost':'ATC: higher FC','ATC: original':'ATC: original','Labor Demand':'Labor D','Labor Supply':'Labor S','Binding minimum wage':'Minimum wage','Supply + $6 tax':'S + $6 tax','30 beats higher proposals':'Against higher','30 beats lower proposals':'Against lower','Short-run supply':'Short run','Long-run supply':'Long run','Domestic demand':'Domestic D','Domestic supply':'Domestic S','Before: Gini 0.380':'Before (0.380)','After: Gini 0.252':'After (0.252)'}
        label_=aliases.get(label,label) if label and label not in seen else '_nolegend_';seen.add(label)
        main_curve=bool(label) or (kind=='kinked_demand' and len(set(xs))>1 and color in ('#145A86','#9C3324'))
        ax.plot(xs,ys,color=color or '#172538',linestyle=style,linewidth=1.65 if main_curve else .65,marker='o' if marker else None,markersize=3,label=label_,zorder=3 if main_curve else 2)
    # Each note has a point anchor; use its authored offset with bounded adjustments.
    notes={
      'tax_incidence':{'Buyers pay 19':(-67,18),'Sellers receive 13':(-77,-17),'Before (100, 15)':(5,-24)},
      'minimum_wage':{'Equilibrium':(7,-16),'QD = 90':(-49,8),'QS = 120':(8,8),'Surplus = 30 workers':(0,0)},
      'phillips_return':{'B (3%, 5%)':(-69,10),'A (5%, 3%)':(6,-17),'C (5%, 5%)':(7,7)},
      'flat_lrac':{'MES = 60':(-22,10),'End of flat range':(-15,10)},
    }
    for t,point,offset,coords,arrow in p.notes:
        if arrow:
            ax.annotate('',xy=point,xytext=offset,arrowprops={'arrowstyle':arrow.get('arrowstyle','->'),'color':'#344356','lw':.8});continue
        off=notes.get(kind,{}).get(t,offset if coords else (0,0))
        if kind=='flat_lrac' and t=='End of flat range':t='End = 90'
        ax.annotate(t,point,xytext=off,textcoords='offset points',fontsize=8.8,bbox={'facecolor':'white','edgecolor':'none','pad':.7},annotation_clip=True)
    handles,labels=ax.get_legend_handles_labels()
    if handles:fig.legend(handles,labels,loc='upper center',bbox_to_anchor=(.53,1.02),frameon=False,ncol=min(4 if wide else 3 if len(labels)>4 else 2,len(labels)),fontsize=8.8,handlelength=2.2,columnspacing=1)
    out=io.BytesIO();fig.savefig(out,format='png',dpi=216,facecolor='white');plt.close(fig);out.seek(0)
    im=Image.open(out).convert('RGB')
    width=479.573 if wide else 320
    return im,alt,{'model':payload,'modelSha256':hashlib.sha256(json.dumps(payload,sort_keys=True).encode()).hexdigest(),'minimumLabelPt':8.8,'width':width,'height':width*im.height/im.width,'stacked':wide,'renderer':'matplotlib 3.11.2','recipe':kind}
