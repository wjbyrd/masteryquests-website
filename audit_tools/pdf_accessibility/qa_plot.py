"""Small deterministic economics plotting surface using pinned existing Pillow.
Supports only the explicit line/point/area diagrams in qa_renderer.
"""
from PIL import Image,ImageDraw,ImageFont,ImageChops
from pathlib import Path
import reportlab,math
FONT=Path(reportlab.__file__).parent/'fonts/Vera.ttf'
class Plot:
    def __init__(self):
        self.series=[];self.notes=[];self.fills=[];self.xlabel='';self.ylabel='';self.limits={};self.name=''
    def set_xlabel(self,t,**kw):self.xlabel=t
    def set_ylabel(self,t,**kw):self.ylabel=t
    def set_xlim(self,a,b):self.limits['xlim']=(a,b)
    def set_ylim(self,a,b):self.limits['ylim']=(a,b)
    def set_yticks(self,a):self.limits['yticks']=a
    def set(self,**kw):self.limits.update(kw)
    def plot(self,x,y,*args,**kw):
        if not hasattr(x,'__len__'):x=[x];y=[y]
        marker=kw.get('marker',args[0] if args else None)
        self.series.append((list(zip(map(float,x),map(float,y))),kw.get('color','#172538'),kw.get('ls','-'),kw.get('label',''),marker))
    def hlines(self,y,xmin,xmax,**kw):
        if not hasattr(y,'__len__'):y=[y]
        if not hasattr(xmax,'__len__'):xmax=[xmax]*len(y)
        colors=kw.get('colors','#172538');styles=kw.get('linestyles','-')
        for i,v in enumerate(y):self.plot([xmin,xmax[i]],[v,v],color=colors[i] if isinstance(colors,list) else colors,ls=styles[i] if isinstance(styles,list) else styles)
    def vlines(self,x,ymin,ymax,**kw):
        for v in x:self.plot([v,v],[ymin,ymax],color=kw.get('colors','#172538'),ls=kw.get('linestyles','-'))
    def axhline(self,y,**kw):self.series.append(([('xmin',y),('xmax',y)],kw.get('color'),kw.get('ls','-'),kw.get('label',''),None))
    def axvline(self,x,**kw):self.series.append(([(x,'ymin'),(x,'ymax')],kw.get('color'),kw.get('ls','-'),kw.get('label',''),None))
    def annotate(self,t,xy,xytext=(5,5),textcoords=None,**kw):self.notes.append((t,xy,xytext,textcoords,kw.get('arrowprops')))
    def text(self,x,y,t,**kw):self.notes.append((t,(x,y),(0,0),'offset points',None))
    def fill_between(self,x,y1,y2,where,**kw):
        pts=[(float(a),float(b)) for a,b,ok in zip(x,y2,where) if ok]
        if pts:self.fills.append(([(pts[0][0],y1)]+pts+[(pts[-1][0],y1)],kw.get('edgecolor','#27652D'),kw.get('hatch','//')))
    def render(self):
        w,h=1600,650;im=Image.new('RGB',(w,h),'white');d=ImageDraw.Draw(im);font=ImageFont.truetype(str(FONT),32);small=ImageFont.truetype(str(FONT),28)
        left,top,right,bottom=155,150,1500,510
        xlo,xhi=self.limits.get('xlim',(0,100));ylo,yhi=self.limits.get('ylim',(0,100))
        def xy(p):
            x,y=p;x={'xmin':xlo,'xmax':xhi}.get(x,x) if isinstance(x,str) else x;y={'ymin':ylo,'ymax':yhi}.get(y,y) if isinstance(y,str) else y
            return (left+(x-xlo)/(xhi-xlo)*(right-left),bottom-(y-ylo)/(yhi-ylo)*(bottom-top))
        def stroke(points,color,style,width=4):
            # Dash distances are measured in rendered pixels, never sample count.
            distance=0
            for a,b in zip(points,points[1:]):
                length=math.dist(a,b);steps=max(1,math.ceil(length/3))
                for i in range(steps):
                    p=(a[0]+(b[0]-a[0])*i/steps,a[1]+(b[1]-a[1])*i/steps);q=(a[0]+(b[0]-a[0])*(i+1)/steps,a[1]+(b[1]-a[1])*(i+1)/steps)
                    phase=(distance+length*i/steps)%({':':14,'--':40,'-.':48}.get(style,1))
                    if style=='-' or style=='--' and phase<25 or style==':' and phase<4 or style=='-.' and (phase<24 or 34<phase<38):d.line([p,q],fill=color,width=width)
                distance+=length
        for pts,color,hatch in self.fills:
            mask=Image.new('1',(w,h));md=ImageDraw.Draw(mask);md.polygon([xy(p) for p in pts],fill=1)
            pattern=Image.new('1',(w,h));od=ImageDraw.Draw(pattern)
            if hatch=='//':
                for offset in range(-h,w,22):od.line([(offset,0),(offset+h,h)],fill=1,width=2)
            else:
                for x in range(0,w,22):
                    for y in range(0,h,22):od.ellipse((x,y,x+3,y+3),fill=1)
            im.paste(color,(0,0,w,h),ImageChops.logical_and(mask,pattern));d=ImageDraw.Draw(im)
        d.line([(left,top),(left,bottom),(right,bottom)],fill='#172538',width=3)
        for value in self.limits.get('xticks',[xlo+(xhi-xlo)*i/4 for i in range(5)]):
            x,y=xy((value,ylo));d.line([(x,y),(x,y+8)],fill='#172538',width=2);d.text((x,y+14),f'{value:g}',font=small,anchor='mt',fill='#172538')
        for value in self.limits.get('yticks',[ylo+(yhi-ylo)*i/4 for i in range(5)]):
            x,y=xy((xlo,value));d.line([(x-8,y),(x,y)],fill='#172538',width=2);d.text((x-16,y),f'{value:g}',font=small,anchor='rm',fill='#172538')
        d.text(((left+right)/2,610),self.xlabel,font=font,anchor='mm',fill='#172538')
        # Horizontal axis title at top-left avoids tiny rotated text.
        d.text((left,110),self.ylabel,font=small,anchor='ls',fill='#172538')
        legend=[];original=im;im=im.copy();d=ImageDraw.Draw(im)
        for pts,color,style,label,marker in self.series:
            points=[xy(p) for p in pts]
            if len(points)>1:stroke(points,color,style)
            if marker:
                for x,y in points:d.ellipse((x-7,y-7,x+7,y+7),fill=color)
            if label:legend.append((label,color,style))
        original.paste(im.crop((left,top,right+1,bottom+1)),(left,top));im=original;d=ImageDraw.Draw(im)
        for i,(label,color,style) in enumerate(legend):
            col=i%2;row=i//2;x=190+col*650;y=18+row*40;stroke([(x,y+16),(x+60,y+16)],color,style);d.text((x+78,y),label,font=small,fill='#172538')
        for t,p,offset,coords,arrow in self.notes:
            x,y=xy(p)
            if arrow:
                a=xy(offset);b=(x,y);d.line([a,b],fill='#172538',width=3)
                for end,start in [(b,a)]+([(a,b)] if arrow.get('arrowstyle')=='<->' else []):
                    angle=math.atan2(end[1]-start[1],end[0]-start[0]);head=[end,(end[0]-16*math.cos(angle-.4),end[1]-16*math.sin(angle-.4)),(end[0]-16*math.cos(angle+.4),end[1]-16*math.sin(angle+.4))];d.polygon(head,fill='#172538')
            if t:
                dx,dy=offset if coords else (0,0);tx=x+dx*2;ty=y-dy*2
                box=d.textbbox((0,0),t,font=small);tx=min(max(8,tx),w-(box[2]-box[0])-8);ty=min(max(top,ty),bottom-35)
                d.rectangle((tx-3,ty-3,tx+box[2]+3,ty+box[3]+3),fill='white');d.text((tx,ty),t,font=small,fill='#172538')
        return im
