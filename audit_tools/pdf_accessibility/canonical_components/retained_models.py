"""Label-aware presentation of retained reviewed economic diagrams.

Coordinates marked approximate in the existing alternatives stay approximate.
Intermediate samples are curve geometry, never new printed economic values.
Original assets and alternatives remain the binding review references.
"""
import numpy as np
from qa_plot import Plot
CODES=('GEN-ECON-08','GEN-ECON-17','GEN-ECON-25','MICRO-02','MICRO-08','MICRO-11','MICRO-12','MICRO-13','MICRO-16','MICRO-22','MICRO-32','MICRO-38','MICRO-40','MICRO-44','MICRO-45','MICRO-57','MICRO-58','MACRO-37','MACRO-39','MACRO-57')

def model(code):
    p=Plot();blue='#145A86';red='#9C3324';green='#27652D';purple='#67429A'
    p.set_xlabel('Quantity');p.set_ylabel('Price')
    def curve(xs,ys,name,color=blue,style='-'):p.plot(xs,ys,label=name,color=color,ls=style)
    def point(x,y,label='',dx=6,dy=10):
        p.plot(x,y,'o',color='#171D2B')
        if label:p.annotate(label,(x,y),xytext=(dx,dy),textcoords='offset points')
    def guides(x,y):p.plot([0,x,x],[y,y,0],color='#59636B',ls=':')
    def config(xlim,ylim,xt,yt,xlabel=None,ylabel=None):
        p.set(xlim=xlim,ylim=ylim,xticks=xt,yticks=yt)
        if xlabel:p.set_xlabel(xlabel)
        if ylabel:p.set_ylabel(ylabel)
    def smooth(points,name,color,style='-'):
        # Shape-preserving cubic Hermite interpolation through reviewed anchors.
        xs=np.array([a for a,b in points],float);ys=np.array([b for a,b in points],float);h=np.diff(xs);delta=np.diff(ys)/h;d=np.zeros(len(xs));d[0]=delta[0];d[-1]=delta[-1]
        for i in range(1,len(xs)-1):
            if delta[i-1]*delta[i]>0:d[i]=3*(h[i-1]+h[i])/((2*h[i]+h[i-1])/delta[i-1]+(h[i]+2*h[i-1])/delta[i])
        xx=[];yy=[]
        for i in range(len(h)):
            for t in np.linspace(0,1,30):
                xx.append(xs[i]+t*h[i]);yy.append((2*t**3-3*t**2+1)*ys[i]+(t**3-2*t**2+t)*h[i]*d[i]+(-2*t**3+3*t**2)*ys[i+1]+(t**3-t**2)*h[i]*d[i+1])
        curve(xx,yy,name,color,style)
    if code=='GEN-ECON-08':
        smooth([(0,50),(8,45),(15,35),(21,20),(25,0)],'',blue)
        for x,y,t in [(0,50,'A'),(8,45,'B'),(15,35,'C'),(21,20,'D'),(25,0,'E'),(8,20,'F'),(21,48,'G')]:point(x,y,t)
        config((0,30),(0,60),[0,8,15,21,25],[0,20,35,45,50],'Good X','Good Y')
    elif code=='GEN-ECON-17':
        curve([0,300],[6,0],'D0');curve([0,300],[0,6],'S0',red,'--')
        config((0,325),(0,6),list(range(25,326,25)),list(np.arange(.5,6.01,.5)),'Quantity of gas (in thousands of gallons)','Price of gas per gallon')
    elif code in ('GEN-ECON-25','MICRO-16'):
        curve([0,350],[14,0],'Ddomestic');curve([0,350],[0,14],'Sdomestic',red,'--')
        if code=='GEN-ECON-25':
            p.axhline(3,color=green,ls=':',label='World Price');p.axhline(6,color=purple,ls='-.',label='Domestic Price under quota')
            for x,y in [(75,3),(275,3),(150,6),(200,6),(175,7)]:guides(x,y)
            point(175,7);noun='phone cases'
        else:
            p.axhline(10,color=green,ls=':',label='Pw=$10');point(175,7,'A')
            for x,y in [(100,10),(250,10),(175,7)]:guides(x,y)
            noun='avocados'
        config((0,350),(0,16),list(range(25,351,25)),list(range(1,17)),f'Quantity of {noun} (in thousands)',f'Price of {noun}')
    elif code=='MICRO-02':
        curve([40,155],[24,6.75],'Demand');curve([0,150],[0,22.5],'Supply',red,'--');curve([0,125],[6,24.75],'Supply + tax',green,':')
        for x,y in [(65,20),(80,18),(100,15),(120,12),(150,20)]:guides(x,y)
        config((35,165),(0,26),[65,80,100,120,150],[10,12,15,18,20],ylabel='Price')
    elif code=='MICRO-08':
        curve([0,120],[16,0],'Demand')
        for x,y,t in [(30,12,'C'),(60,8,'B'),(90,4,'A')]:guides(x,y);point(x,y,t)
        config((0,150),(0,20),list(range(0,151,30)),list(range(0,21,2)))
    elif code in ('MICRO-11','MICRO-12','MICRO-13'):
        if code=='MICRO-13':curve([0,16],[18,2],'D');curve([0,16],[2,18],'S',red,'--');y=10;xt=[0,4,8,12,16];yt=[2,6,10,14,18];lim=20
        else:curve([0,14],[30,2],'D');curve([0,14],[6,20],'S',red,'--');y=14;xt=[0,4,8,12];yt=[0,6,14,22,30];lim=32
        guides(8,y);point(8,y,'E');config((0,17 if code=='MICRO-13' else 14.5),(0,lim),xt,yt)
    elif code=='MICRO-22':
        x=np.linspace(100,450,200);avc=10+.00005*(x-200)**2;mc=avc+x*.0001*(x-200);ac=avc+3200/x
        curve(x,mc,'MC',red);curve(x,ac,'AC',blue,'--');curve(x,avc,'AVC',purple,':')
        for a,b in [(200,10),(400,20),(400,12)]:guides(a,b);point(a,b)
        config((100,450),(6,25),list(range(120,441,20)),list(range(8,25,2)),ylabel='Costs')
    elif code=='MICRO-32':
        smooth([(0,24),(14,18),(22,20),(36,30),(44,41),(50,50),(55,60)],'MC',red)
        smooth([(19,59),(30,45),(44,41),(55,44),(73,53)],'ATC',blue,'--')
        smooth([(0,24),(22,20),(40,22),(55,29),(73,42)],'AVC',green,':');p.axhline(10,color=purple,ls='-.',label='P = MR = AR')
        for x,y,t in [(22,20,'A'),(36,30,'B'),(44,41,'C'),(50,50,'D')]:point(x,y,t,dx=-18)
        config((0,99),(0,60),list(range(0,100,11)),list(range(0,61,5)),'Firm quantity','Cost / revenue')
    elif code=='MICRO-38':
        curve([0,120],[60,0],'D');curve([0,60],[60,0],'MR',purple,'--');curve([0,120],[10,40],'MC',red,':')
        smooth([(26,60),(40,45),(67,36),(90,34),(120,35)],'ATC',green,'-.')
        for x,y in [(40,20),(40,40),(40,45),(67,27)]:guides(x,y);point(x,y)
        config((0,122),(0,60),[0,10,20,30,40,50,60,67,70,80,90,100,110,120],[0,10,20,27,30,40,45,50,60],ylabel='Price / cost')
    elif code=='MICRO-40':
        curve([0,123.333],[74,0],'D');curve([0,61.666],[74,0],'MR',purple,'--');p.axhline(20,color=red,ls=':',label='MC')
        x=np.linspace(8,125,200);curve(x,20+180/x,'ATC',green,'-.')
        for x,y in [(45,47),(45,24),(45,20),(90,20)]:guides(x,y);point(x,y)
        config((0,125),(0,80),list(range(0,121,15)),[0,10,20,24,30,40,47,50,60,70,80],ylabel='Price / cost')
    elif code in ('MICRO-44','MICRO-45'):
        curve([0,78],[37.5,14.1],'D = AR');curve([0,60],[37.5,0],'MR',purple,'--')
        smooth([(0,14),(17,10.5),(36,15),(50,26),(70,48)],'MC',red,':')
        smooth([(14,50),(25,33),(36,27),(50,25),(64,27),(78,31)],'ATC',green,'-.')
        for x,y in [(36,15),(36,27)]:guides(x,y);point(x,y)
        config((0,80),(0,50),[0,10,20,30,36,40,50,60,70,80],[0,9,15,18,27,36,45],ylabel='Price / cost')
    elif code=='MICRO-57':
        curve([0,120],[30,0],'Labor Demand');curve([0,120],[10,40],'Labor Supply',red,'--');guides(40,20);point(40,20)
        config((0,150),(0,40),list(range(0,141,20)),list(range(0,41,10)),'Hundreds of warehouse workers','Hourly wage ($)')
    elif code=='MICRO-58':
        curve([0,20],[40,0],'Budget');x=np.linspace(1.6,24,200)
        for value,name,style in [(80,'IC1','--'),(200,'IC2','-'),(400,'IC3','-.')]:curve(x,value/x,name,purple,style)
        guides(10,20);point(10,20,'A');config((0,25),(0,50),list(range(0,26,5)),list(range(0,51,10)),'Good X','Good Y')
    elif code=='MACRO-37':
        curve([0,10],[6.5,-1.5],'SRPC0');p.axvline(5,color=green,ls='--',label='LRPC');guides(5,2.5);point(5,2.5,'A')
        config((0,10),(-2.5,10),list(range(0,11)),[-2.5,0,2.5,5,7.5,10],'Unemployment rate (%)','Inflation rate (%)')
    elif code=='MACRO-57':
        curve([0,200],[2,0],'D0 = NX0');p.axvline(100,color=red,ls='-',label='S0 = NCO0');p.axvline(50,color=red,ls='--',label='S1 = NCO1')
        for x,y,t in [(100,1,'A'),(50,1.5,'B')]:guides(x,y);point(x,y,t)
        config((0,250),(0,2),list(range(0,251,25)),[0,.3,.5,.8,1,1.3,1.5,1.8,2],'Quantity of U.S. dollars exchanged','Exchange rate (foreign currency per U.S. dollar)')
    else:raise ValueError('Symbolic diagram requires symbolic renderer: '+code)
    if code in ('GEN-ECON-17','GEN-ECON-25','MICRO-16','MICRO-22','MICRO-02'):p.limits['ytickprefix']='$'
    return p
