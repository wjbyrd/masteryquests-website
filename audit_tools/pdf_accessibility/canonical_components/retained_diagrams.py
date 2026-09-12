"""Label-aware interiors transcribed from the retained reviewed diagrams.

No instructional strings are changed. The original bitmap hash remains bound
in metadata, as does the exact diagram data. These profiles never paint a page.
"""
import hashlib,json,math
from PIL import Image,ImageDraw,ImageFont
from repo_guard import contained

DATA={
 'MICRO-48':{'kind':'BAR','labels':['A','B','C','D','Other'],'values':[38,32,12,9,9],'xlabel':'Firm or fringe','ylabel':'Market share (%)','ticks':[0,10,20,30,40]},
 'MICRO-51':{'kind':'TREE','caption':'Payoff order: (Entrant, Incumbent)','players':['Entrant','Incumbent'],'actions':['Stay out','Enter','Accommodate','Fight'],'payoffs':['(0, 12)','(6, 7)','(-3, 3)']},
 'MACRO-23':{'kind':'MONEY','xlabel':'Money supply (M)','ylabel':'Value of money (1/P)','points':[[2500,2],[5000,1]],'labels':['MS1','MS2','MD','a','b']},
 'MACRO-39':{'kind':'PHILLIPS_SYMBOLIC','xlabel':'Unemployment rate','ylabel':'Inflation rate','points':[['U1','I2','a'],['U2','I2','b'],['U2','I1','c'],['U3','I1','d']],'curves':['SRPC1','SRPC2','LRPC']},
 'MICRO-33':{'kind':'TWO_PANEL','panels':['Market','Representative firm'],'equilibrium':[100,25],'firm':[50,25,17],'curves':['S','D','MC','ATC','AVC','P = MR = AR']},
}

def render(code):
    if code=='MICRO-33':return paired_market()
    data=DATA[code];im=Image.new('RGB',(960,435 if code=='MACRO-39' else 390),'white');d=ImageDraw.Draw(im)
    f=ImageFont.truetype(str(contained('audit_tools/pdf_accessibility/canonical_components/regular-unicode.ttf')),26)
    ink='#171D2B';blue='#145A86';red='#9C3324';labels=[]
    def text(t,x,y,anchor='lt'):
        b=d.textbbox((x,y),t,font=f,anchor=anchor)
        if b[0]<0 or b[1]<0 or b[2]>960 or b[3]>im.height:raise ValueError('Diagram label clipped '+t)
        d.text((x,y),t,font=f,fill=ink,anchor=anchor);labels.append({'text':t,'bounds':list(b),'fontSize':26/3})
    def line(points,color=ink):d.line(points,fill=color,width=3)
    def dot(x,y):d.ellipse((x-5,y-5,x+5,y+5),fill=ink)
    if data['kind']=='BAR':
        left,right,top,bottom=110,945,50,320
        text(data['ylabel'],left,5);line([(left,top),(left,bottom),(right,bottom)])
        for v in data['ticks']:text(str(v),left-12,bottom-v/45*270,'rm')
        for i,(name,v) in enumerate(zip(data['labels'],data['values'])):
            x=145+i*155;y=bottom-v/45*270;d.rectangle((x,y,x+105,bottom),fill=blue)
            text(str(v)+'%',x+52,y-7,'mb');text(name,x+52,bottom+9,'mt')
        text(data['xlabel'],525,360,'mt')
    elif data['kind']=='TREE':
        text(data['caption'],8,5)
        line([(40,205),(355,80)]);line([(40,205),(460,205),(780,115)]);line([(460,205),(780,330)])
        dot(40,205);dot(460,205)
        text('Entrant',8,240);text('Incumbent',385,240)
        text('Stay out',105,88);text('Enter',210,220)
        text('Accommodate',505,110);text('Fight',600,310)
        text('(0, 12)',365,60);text('(6, 7)',795,97);text('(-3, 3)',795,315)
    elif data['kind']=='PHILLIPS_SYMBOLIC':
        text('Inflation rate',85,5);text('Unemployment rate',520,400,'mt');line([(85,50),(85,360),(945,360)])
        line([(450,50),(450,360)],red);text('LRPC',450,45,'mb')
        line([(x,344-34440/(x-40)) for x in range(155,901,5)],blue)
        line([(x,391.2-86592/(x-40)) for x in range(295,901,5)],blue)
        text('SRPC1',780,320);text('SRPC2',820,253)
        for x,y,t in [(250,180,'a'),(450,180,'b'),(450,260,'c'),(700,260,'d')]:
            dot(x,y);text(t,x+9,y-29)
            for xx in range(85,x,12):line([(xx,y),(min(xx+5,x),y)],'#59636B')
            for yy in range(y,360,12):line([(x,yy),(x,min(yy+5,360))],'#59636B')
        for x,t in [(250,'U1'),(450,'U2'),(700,'U3')]:text(t,x,370,'mt')
        text('I2',73,180,'rm');text('I1',73,260,'rm')
    else:
        left,right,top,bottom=85,945,60,320
        text(data['ylabel'],left,5)
        def xy(x,y):return left+x/6500*(right-left),bottom-y/3*(bottom-top)
        line([(left,top),(left,bottom),(right,bottom)])
        pts=[xy(x,5000/x) for x in range(1700,6201,20)];line(pts,blue)
        for i,(x,y) in enumerate(data['points']):
            px,py=xy(x,y);line([(px,top),(px,bottom)],blue if i==0 else red);dot(px,py)
            for xx in range(left,int(px),12):line([(xx,py),(min(xx+6,px),py)],blue)
            text(str(y),left-10,py,'rm');text(f'{x:,}',px,bottom+8,'mt');text('MS'+str(i+1),px,top-8,'mb');text('a' if i==0 else 'b',px+10,py-30)
        text('MD',910,xy(6000,5000/6000)[1]-5);text(data['xlabel'],520,360,'mt')
    evidence={'mode':'CANONICAL_LABEL_AWARE_DIAGRAM','width':320,'height':im.height/3,'minimumLabelPt':26/3,'labels':labels,'retainedDiagram':code,'dataSha256':hashlib.sha256(json.dumps(data,sort_keys=True).encode()).hexdigest()}
    return im,evidence

def paired_market():
    """Two native-sized plots within one full-width worked-example interior."""
    import numpy as np
    im=Image.new('RGB',(1440,420),'white');d=ImageDraw.Draw(im);labels=[]
    f=ImageFont.truetype(str(contained('audit_tools/pdf_accessibility/canonical_components/regular-unicode.ttf')),26)
    ink='#171D2B';colors=['#9C3324','#145A86','#27652D','#67429A']
    def text(t,x,y,anchor='lt'):
        b=d.textbbox((x,y),t,font=f,anchor=anchor)
        if b[0]<0 or b[1]<0 or b[2]>1440 or b[3]>420:raise ValueError('Paired diagram label clipped '+t)
        d.text((x,y),t,font=f,fill=ink,anchor=anchor);labels.append({'text':t,'bounds':list(b),'fontSize':26*479.573/1440})
    for panel in [0,1]:
        off=panel*720;left=off+110;right=off+704;top=135;bottom=350;xmax=150 if panel==0 else 100;ymax=50 if panel==0 else 60
        text('Market' if panel==0 else 'Representative firm',off+360,3,'mt')
        text('Price' if panel==0 else 'Cost / revenue',left,42)
        text('S    D' if panel==0 else 'MC    ATC    AVC    P = MR = AR',left,77)
        if panel:text('AVC=17',left,105)
        def xy(x,y):return left+x/xmax*(right-left),bottom-y/ymax*(bottom-top)
        d.line([(left,top),(left,bottom),(right,bottom)],fill=ink,width=2)
        for x in (range(0,151,50) if panel==0 else range(0,101,10)):
            px,py=xy(x,0);text(str(x),min(right-12,max(left,px)),bottom+9,'mt')
        for i,y in enumerate(range(0,ymax+1,10 if panel==0 else 5)):
            px,py=xy(0,y);tx=left-12-(i%2)*50 if panel else left-12
            text(str(y),tx,py,'rm');d.line([(tx+3,py),(left,py)],fill='#59636B',width=1)
        def line(xs,ys,color):
            points=[xy(float(x),float(y)) for x,y in zip(xs,ys) if 0<=y<=ymax]
            d.line(points,fill=color,width=3)
        if not panel:
            line([0,150],[7,34],colors[0]);line([0,150],[40,17.5],colors[1]);marks=[(100,25)]
        else:
            x=np.linspace(4,80,250);avc=14.2+(.08/35)*(x-15)**2;mc=avc+x*(.16/35)*(x-15);atc=avc+400/x
            line(x,mc,colors[0]);line(x,atc,colors[1]);line(x,avc,colors[2]);line([0,80],[25,25],colors[3]);marks=[(50,25),(50,17)]
        for x,y in marks:
            px,py=xy(x,y);d.ellipse((px-4,py-4,px+4,py+4),fill=ink)
            for xx in range(left,int(px),12):d.line([(xx,py),(min(xx+5,px),py)],fill='#59636B',width=1)
            for yy in range(int(py),bottom,12):d.line([(px,yy),(px,min(yy+5,bottom))],fill='#59636B',width=1)
        text('Market quantity' if not panel else 'Firm quantity',off+395,390,'mt')
    return im,{'mode':'CANONICAL_GRAPH_TEXT_STACKED','width':479.573,'height':420*479.573/1440,'minimumLabelPt':26*479.573/1440,'labels':labels,'retainedDiagram':'MICRO-33','stacked':True,'dataSha256':hashlib.sha256(json.dumps(DATA['MICRO-33'],sort_keys=True).encode()).hexdigest()}
