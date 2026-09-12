"""Maintained source-aware one-page renderer for owner-QA corrected resources.

Uses the established ReportLab/Vera style and existing tagger. Tables are
deterministic source grids partitioned into semantic cells by that tagger.
No active PDF output; no source mutation here.
"""
from repo_guard import *
import sys,io,math,re
sys.path.insert(0,str(contained('build/faculty-build-composer/tools')))
from concept_review_style import register_fonts,REGULAR,BOLD,contrast
from reportlab.pdfgen import canvas
from reportlab.pdfbase.pdfmetrics import stringWidth
from reportlab.lib.colors import HexColor,white
from reportlab.lib.utils import ImageReader
from PIL import Image,ImageDraw,ImageFont
NAVY='#102E55';TEAL='#007C82';INK='#172538';PALE='#EFF8F8'
FONTDIR=register_fonts()
def wrap(text,width,font=REGULAR,size=9.5):
    lines=[];line=''
    for word in text.split():
        test=(line+' '+word).strip()
        if stringWidth(test,font,size)>width and line:lines.append(line);line=word
        else:line=test
        if stringWidth(line,font,size)>width:raise ValueError('Unbreakable text exceeds width: '+line)
    return lines+[line] if line else lines

def table_image(table,styled=False):
    cols=['',*table['columnHeaders']];rows=[cols]+[[h,*v] for h,v in zip(table['rowHeaders'],table['cells'])]
    if len(set(table['rowHeaders']))!=len(table['rowHeaders']) or len(set(cols))!=len(cols):raise ValueError('Unique table headers required')
    if any(len(r)!=len(cols) for r in rows):raise ValueError('Table dimensions')
    # Three pixels per PDF point at 504-point display width. Text is >=9.5pt.
    width=1512;fs=29;pad=15;reg=ImageFont.truetype(str(FONTDIR/'Vera.ttf'),fs);bold=ImageFont.truetype(str(FONTDIR/'VeraBd.ttf'),fs)
    weights=table.get('columnWidths',[1/len(cols)]*len(cols));assert len(weights)==len(cols) and abs(sum(weights)-1)<.001
    xs=[0]
    for w in weights:xs.append(xs[-1]+round(width*w))
    xs[-1]=width
    def lines(t,w,font):
        out=[];line=''
        for word in str(t).split():
            trial=(line+' '+word).strip()
            if font.getlength(trial)>w and line:out.append(line);line=word
            else:line=trial
            if font.getlength(line)>w:raise ValueError('Table text too wide: '+line)
        return out+[line]
    cell_lines=[[lines(t,xs[c+1]-xs[c]-2*pad,bold if r==0 or c==0 else reg) for c,t in enumerate(row)] for r,row in enumerate(rows)]
    captionlines=lines(table['caption'],width-2*pad,bold)
    caption_h=36*len(captionlines)+2*pad;ys=[caption_h]
    for row in cell_lines:ys.append(ys[-1]+max(1,max(len(x) for x in row))*36+2*pad)
    im=Image.new('RGB',(width,ys[-1]),'white');d=ImageDraw.Draw(im)
    for n,line in enumerate(captionlines):d.text((pad,pad+n*36),line,font=bold,fill=NAVY)
    for r,row in enumerate(rows):
        for c,t in enumerate(row):
            box=(xs[c],ys[r],xs[c+1],ys[r+1])
            if styled:
                total=r>0 and (str(row[0]).lower().startswith('total') or str(row[0]).lower()=='capital')
                d.rectangle(box,fill=NAVY if r==0 else PALE if total or c==0 else 'white')
                d.line((xs[c],ys[r+1]-1,xs[c+1],ys[r+1]-1),fill=TEAL if total else '#D7E4EA',width=2)
            else:d.rectangle(box,fill=PALE if r==0 or c==0 else 'white',outline=NAVY,width=2)
            for n,line in enumerate(cell_lines[r][c]):d.text((xs[c]+pad,ys[r]+pad+n*36),line,font=bold if r==0 or c==0 else reg,fill='white' if styled and r==0 else INK)
    regions={'imageWidth':width,'imageHeight':im.height,'captionBottom':caption_h,'xEdges':xs,'yEdges':ys}
    return im,regions

def graph_image(kind):
    import numpy as np
    from qa_plot import Plot
    ax=Plot()
    blue='#145A86';red='#9C3324';green='#27652D'
    def line(x,y,label,color=blue,ls='-'):ax.plot(x,y,label=label,color=color,ls=ls,lw=2.3)
    def point(x,y,label,dx=5,dy=5):ax.plot(x,y,'o',color=INK,ms=4);ax.annotate(label,(x,y),xytext=(dx,dy),textcoords='offset points',fontsize=12)
    ax.set_xlabel('Quantity');ax.set_ylabel('Price ($)')
    alt=''
    if kind=='equilibrium':
        q=np.linspace(0,300,301);line(q,10-q/30,'Demand');line(q,q/30,'Supply',red,'--');point(150,5,'E (150, 5)');ax.set(xlim=(0,300),ylim=(0,11),xticks=[0,150,300]);ax.set_xlabel('Quantity (thousands)');alt='Price in dollars is vertical; quantity in thousands is horizontal. Downward demand and upward supply intersect at E, quantity 150 and price 5. No curve shifts are shown. Above 5 supply exceeds demand; below 5 demand exceeds supply.'
    elif kind=='tax_incidence':
        q=np.linspace(0,150,301);line(q,35-.2*q,'Demand');line(q,5+.1*q,'Supply',red,'--');line(q,11+.1*q,'Supply + $6 tax',green,':');point(100,15,'Before (100, 15)',dx=8,dy=-18);point(80,19,'Buyers pay 19');point(80,13,'Sellers receive 13',dx=-120,dy=-20);ax.plot([80,80],[13,19],color=INK,lw=2);ax.set(xlim=(0,155),ylim=(0,37),xticks=[0,80,100,150]);alt='Price vertical and quantity horizontal. Demand is P = 35 minus 0.2 Q; supply is P = 5 plus 0.1 Q. Initially quantity 100 and price 15. A 6 dollar tax shifts supply up to P = 11 plus 0.1 Q. New quantity 80, buyer price 19, seller receipt 13. Buyers bear 4 and sellers 2 per unit; demand is less elastic at the initial equilibrium.'
    elif kind=='consumer_surplus':
        q=np.linspace(0,20,201);line(q,20-q,'Demand');ax.hlines([12,8],0,[8,12],colors=[red,green],linestyles=['--',':'],lw=2);ax.fill_between(q,12,20-q,where=q<=8,facecolor='none',edgecolor=blue,hatch='//',linewidth=0);ax.fill_between(q,8,20-q,where=q<=12,facecolor='none',edgecolor=green,hatch='..',linewidth=0);point(8,12,'P1: (8, 12)');point(12,8,'P2: (12, 8)');ax.set(xlim=(0,21),ylim=(0,22),xticks=[0,8,12,20],yticks=[0,8,12,20]);alt='Demand slopes from price 20 at zero quantity to zero at 20. At price 12 quantity is 8 and the consumer-surplus triangle is 32. At price 8 quantity is 12 and the larger consumer-surplus triangle is 72. Distinct hatching marks these overlapping areas. No supply curve, producer surplus or deadweight loss is claimed.'
    elif kind=='fixed_cost':
        q=np.linspace(8,70,350);avc=10+.008*(q-20)**2;mc=avc+q*.016*(q-20)
        line(q,avc,'AVC unchanged',green,':');line(q,mc,'MC unchanged',INK,'-.');line(q,avc+250/q,'ATC: original');line(q,avc+500/q,'ATC: higher fixed cost',red,'--');ax.set(xlim=(0,72),ylim=(0,65));ax.set_ylabel('Cost per unit ($)');alt='Quantity horizontal; cost per unit vertical. Original ATC equals AVC plus 250 divided by Q. Higher fixed cost makes ATC equal AVC plus 500 divided by Q, above original ATC at every positive output. AVC and MC remain unchanged. The ATC-AVC gap declines with Q for either fixed-cost amount.'
    elif kind=='flat_lrac':
        q=np.linspace(10,120,500);v=np.where(q<60,12+.01*(60-q)**2,np.where(q<=90,12,12+.02*(q-90)**2));line(q,v,'LRAC');ax.hlines(12,60,90,color=red,lw=4,ls='--');point(60,12,'MES = 60',dx=-70,dy=14);point(90,12,'End of flat range',dx=0,dy=14);ax.set(xlim=(0,125),ylim=(0,42),xticks=[0,30,60,90,120],yticks=[0,12,24,36]);ax.set_ylabel('Long-run cost per unit ($)');alt='Quantity horizontal and long-run average cost vertical. LRAC falls to 12 at quantity 60, stays flat at 12 from 60 through 90, then rises. Minimum efficient scale is 60, the first output at the flat minimum. The flat interval illustrates constant returns to scale.'
    elif kind=='minimum_wage':
        q=np.linspace(50,150,200);line(q,33-.2*q,'Labor Demand');line(q,.2*q-9,'Labor Supply',red,'--');ax.axhline(15,color=green,ls=':',lw=2,label='Binding minimum wage');point(105,12,'Equilibrium',dx=10,dy=-20);point(90,15,'QD = 90',dx=-78,dy=8);point(120,15,'QS = 120',dx=12,dy=8);ax.annotate('',xy=(120,19),xytext=(90,19),arrowprops={'arrowstyle':'<->','color':INK});ax.text(85,23,'Surplus = 30 workers',ha='center');ax.vlines([90,120],0,15,colors=INK,linestyles=':',lw=1);ax.set(xlim=(50,150),ylim=(0,24),xticks=[60,90,105,120,150]);ax.set_xlabel('Quantity of labor (workers)');ax.set_ylabel('Wage ($ per hour)');alt='Wage per hour vertical, quantity of labor in workers horizontal. Labor supply slopes up and demand down, meeting at wage 12 and 105 workers. A binding minimum wage of 15 is above equilibrium. At that wage QD is 90 and QS is 120; a bracket marks a labor surplus of 30 workers.'
    elif kind=='median_voter':
        ax.set_xlim(0,60);ax.set_ylim(-1,1.7);ax.set_yticks([]);ax.set_xlabel('Preferred policy level',labelpad=28);ax.set_ylabel('Majority coalitions')
        for q in [10,20,30,40,50]:point(q,0,str(q),dx=-9,dy=-25)
        ax.plot([10,20,30],[.7]*3,color=blue,marker='s',ls='--',label='Majority for 30 over higher proposals');ax.plot([30,40,50],[1.2]*3,color=red,marker='^',label='Majority for 30 over lower proposals');ax.text(30,.25,'Median',ha='center');alt='One policy axis marks ideal points 10, 20, 30, 40 and 50. Median is 30. Voters at 10, 20 and 30 form a majority for 30 against a higher proposal. Voters at 30, 40 and 50 form a majority for 30 against a lower proposal. The example assumes single-peaked preferences and pairwise majority rule.'
    elif kind=='fiscal_ad':
        q=np.linspace(0,250,251);line(q,200-q,'AD1');line(q,250-q,'AD2',red,'--');ax.hlines(100,0,150,colors=INK,linestyles=':');point(100,100,'Y1',dx=-24,dy=-22);point(150,100,'Y2');ax.set(xlim=(0,260),ylim=(0,250),xticks=[0,100,150,250],yticks=[0,100,200]);ax.set_xlabel('Real output demanded (Y)');ax.set_ylabel('Price level (P)');alt='Price level vertical and real output demanded horizontal. AD2 lies right of AD1. At the same price level P, quantity demanded rises from Y1 to Y2 after expansionary fiscal action. Only two AD curves are shown; the graph does not determine the new AD-AS equilibrium or a multiplier magnitude.'
    elif kind=='phillips_return':
        q=np.linspace(0,10,101);line(q,8-q,'SRPC0');line(q,10-q,'SRPC1',red,'--');ax.axvline(5,color=green,ls=':',lw=2,label='LRPC');point(5,3,'A (5%, 3%)',dx=10,dy=-20);point(3,5,'B (3%, 5%)',dx=-90,dy=8);point(5,5,'C (5%, 5%)');ax.annotate('',xy=(3,5),xytext=(5,3),arrowprops={'arrowstyle':'->','color':INK});ax.annotate('',xy=(5,5),xytext=(3,5),arrowprops={'arrowstyle':'->','color':INK});ax.set(xlim=(0,10),ylim=(0,10),xticks=[0,3,5,10],yticks=[0,3,5,10]);ax.set_xlabel('Unemployment rate (%)');ax.set_ylabel('Inflation rate (%)');alt='Unemployment horizontal, inflation vertical. LRPC is vertical at 5 percent unemployment. Initial A on SRPC0 is (5,3). Demand expansion moves along SRPC0 to B (3,5). Expected inflation adjustment shifts SRPC up to SRPC1; final C (5,5) is at its intersection with LRPC. Arrows show A to B to C.'
    elif kind=='kinked_demand':
        q1=np.linspace(0,20,101);q2=np.linspace(20,43,101)
        line(q1,60-.5*q1,'Demand');line(q2,80-1.5*q2,'',blue);line(q1,60-q1,'MR',red,'--');line(q2,80-3*q2,'',red,'--');ax.plot([20,20],[20,40],color=red,ls=':',lw=2,label='MR gap');ax.axhline(36,color=green,lw=2,ls='-.',label='MC = 36');point(20,50,'Kink (20, 50)');ax.set(xlim=(0,43),ylim=(0,85),xticks=[0,20,40],yticks=[0,20,36,40,50,60,80]);ax.set_ylabel('Price, cost and revenue ($)');alt='Quantity horizontal; price, cost and revenue vertical. Demand is flatter left of its kink at Q 20, P 50, and steeper right. Left demand is P = 60 minus 0.5 Q and right demand P = 80 minus 1.5 Q. MR branches end at 40 and start at 20 at Q 20. Horizontal MC 36 lies inside this downward MR gap. MR exceeds MC before the kink and is below MC after it.'
    else:raise ValueError('Unreviewed graph kind: '+kind)
    return ax.render(),alt

def draw(source,destination,meta):
    if meta.get('canonicalTemplate'):
        from canonical_components.pilot_renderer import draw as canonical_draw
        return canonical_draw(source,destination,meta)
    if meta.get('styleRestoration'):
        from qa_template import draw as draw_template
        return draw_template(source,destination,meta)
    path=contained(destination)
    if not path.is_relative_to(contained('tmp/pdf_accessibility')):raise ValueError('Staged visual output only')
    path.parent.mkdir(parents=True,exist_ok=True)
    c=canvas.Canvas(str(path),pagesize=(612,792),invariant=1,pageCompression=1);c.setTitle(source['title']);c.setAuthor('Mastery Quests')
    bounds=[]
    def para(t,x,y,w,size=9.5,font=REGULAR,color=INK,leading=None):
        leading=leading or size*1.18;ls=wrap(t,w,font,size);ob=c.beginText(x,y);ob.setFont(font,size);ob.setLeading(leading);ob.setFillColor(HexColor(color))
        for line in ls:ob.textLine(line)
        c.drawText(ob);bottom=y-(len(ls)-1)*leading-size*.25;bounds.append([x,bottom,x+w,y+size]);return y-len(ls)*leading
    def heading(t,y):return para(t,48,y,516,12,BOLD,NAVY)-3
    c.setFillColor(HexColor(NAVY));c.roundRect(20,704,572,68,10,fill=1,stroke=0)
    c.setFillColor(white);c.roundRect(29,712,50,50,7,fill=1,stroke=0)
    logo=contained('assets/images/mastery-quests-logo-standalone.png');c.drawImage(str(logo),32,715,44,44,preserveAspectRatio=True,mask='auto')
    para(source['disciplineLabel'],90,738,345,20,BOLD,'#FFFFFF');para(source['code'],478,738,100,12,BOLD,'#FFFFFF')
    con=source['content'];para('Time: '+con['time'],36,686,135,8.7);para('Outcome: '+con['outcome'],180,686,255,8.7);para('Difficulty: '+con['difficulty'],451,686,132,8.4)
    y=650;titlelines=wrap(source['title'],516,BOLD,18)
    y=para(source['title'],48,y,516,18,BOLD,NAVY)-7
    y=heading('THE CORE IDEA',y);y=para(con['core'],48,y,516)-8
    y=heading('HOW TO RECOGNIZE IT',y)
    for item in con['recognition']:
        para('•',49,y,10);y=para(item,62,y,502)-1
    y-=6;y=heading('WATCH OUT',y);y=para(con['watch'],48,y,516)-8
    y=heading('WORKED EXAMPLE: '+con['workedLabel'],y)
    if meta.get('tableRequired'):
        im,regions=table_image(con['table']);height=im.height/3
        if regions!=meta['tableRegions'] or hashlib.sha256(im.tobytes()).hexdigest()!=meta['graphDecodedSha256']:raise ValueError('Generated table/source fingerprint drift')
        c.drawImage(ImageReader(im),48,y-height+5,516,height,preserveAspectRatio=False);y-=height+6
        y=para(con['worked'],48,y,516)-8
    elif con.get('graph'):
        im=Image.open(contained(meta['assetSourcePath'])).convert('RGB')
        if hashlib.sha256(im.tobytes()).hexdigest()!=meta['graphDecodedSha256']:raise ValueError('Graph/source fingerprint drift')
        # The retained one-page pattern: graph left, explanation right.
        if con.get('graphSpec'):
            iw=516;ih=iw*im.height/im.width
            c.drawImage(ImageReader(im),48,y-ih+5,iw,ih,preserveAspectRatio=True)
            y=para(con['worked'],48,y-ih-5,516)-8
        else:
            iw=266;ih=min(173,iw*im.height/im.width);iw=ih*im.width/im.height
            c.drawImage(ImageReader(im),48,y-ih+5,iw,ih,preserveAspectRatio=True)
            textbottom=para(con['worked'],328,y-6,236,9.5)
            y=min(y-ih,textbottom)-8
    else:y=para(con['worked'],48,y,516)-8
    y=heading('CHECK YOURSELF',y);y=para(con['check'],48,y,516)
    if y<60:raise ValueError(f'One-page readable layout overflow: {source["code"]} bottom {y:.1f}')
    c.setFillColor(HexColor(NAVY));c.roundRect(20,20,572,34,8,stroke=0,fill=1)
    para('READY?',45,32,95,12,BOLD,'#FFFFFF');para('Return to the game and master this concept.',149,33,420,10,BOLD,'#FFFFFF')
    if any(b[1]<20 or b[3]>772 or b[0]<20 or b[2]>592 for b in bounds):raise ValueError('Text exceeds page content bounds')
    c.showPage();c.save()
    return {'bodyFontSize':9.5,'tableFontSizeAtLeast':9.5,'page':[612,792],'contentBottom':y,'textBounds':bounds,'contrast':{color:contrast(color,'#FFFFFF') for color in [NAVY,TEAL,INK]},'clipping':'PASS'}
