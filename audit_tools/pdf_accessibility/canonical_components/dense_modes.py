"""Interior-only layout contracts; canonical outer tokens are never written."""
import hashlib,json,math
from PIL import Image,ImageDraw,ImageFont
from repo_guard import contained
from canonical_components.retained_models import CODES as RETAINED_CODES

BODY_FLOOR=9.5
TABLE_FLOOR=9.5
GRAPH_FLOOR=8.5
LONG_TITLE_FLOOR=25
GRAPH_WIDTH=280
GRAPH_HEIGHT={'minimum_wage':120,'kinked_demand':127}
GENERAL_KINDS=('equilibrium','tax_incidence','consumer_surplus','fixed_cost','flat_lrac','median_voter','fiscal_ad','phillips_return')
GENERAL_KINDS+=tuple(c for c in RETAINED_CODES if c!='MACRO-39')
GRAPH_HEIGHT.update({kind:145 for kind in GENERAL_KINDS})
MODES={
    'CANONICAL_GRAPH_DENSE':['worked interior columns','graph proportion','graph label placement','worked interior padding'],
    'CANONICAL_TABLE_DENSE':['worked full-width table','table row padding','worked explanation strip'],
    'CANONICAL_LONG_TITLE':['bounded two-line Arimo Bold title','flexible title-to-core gap'],
}

def validate_layout(layout):
    errors=[];components={c['name']:c for c in layout['components']}
    if layout['bodyFontSize']<BODY_FLOOR:errors.append('BODY_FLOOR')
    if layout.get('tableTextPt') is not None and layout['tableTextPt']<TABLE_FLOOR:errors.append('TABLE_FLOOR')
    dense=layout.get('denseEvidence') or {}
    if dense.get('minimumLabelPt',GRAPH_FLOOR)<GRAPH_FLOOR:errors.append('GRAPH_LABEL_FLOOR')
    for name in ['watch','worked','check']:
        c=components[name]
        if abs(c['bounds'][0]-79.92)>.002 or abs(c['bounds'][2]-583.2)>.002 or c['radius']!=8 or c['strokeWidth']!=1.05:errors.append('CARD_GEOMETRY')
    if components['check']['bounds'][1]<70:errors.append('CHECK_FOOTER_COLLISION')
    for entry in layout.get('panelTextBounds',[]):
        x0,y0,x1,y1=entry['bounds'];panel=components[entry['panel']]['bounds']
        if y0<panel[1]+2 or y1>panel[3] or x0<panel[0] or x1>panel[2]+.6:errors.append('PANEL_TEXT_OVERFLOW')
    for name in ['figure','table']:
        if name in components:
            b=components[name]['bounds'];p=components['worked']['bounds']
            if b[0]<p[0]+8 or b[2]>p[2]-8 or b[1]<p[1]+4 or b[3]>p[3]-28:errors.append('VISUAL_CLIPPED')
            if name=='figure' and dense.get('sourceKind'):
                rendered=26*min((b[2]-b[0])/dense.get('pixelWidth',840),(b[3]-b[1])/(GRAPH_HEIGHT[dense['sourceKind']]*3))
                if rendered<GRAPH_FLOOR:errors.append('GRAPH_LABEL_FLOOR')
            if name=='figure' and dense.get('retainedDiagram'):
                rendered=dense['minimumLabelPt']*min((b[2]-b[0])/dense['width'],(b[3]-b[1])/dense['height'])
                if rendered<GRAPH_FLOOR:errors.append('GRAPH_LABEL_FLOOR')
            if name=='figure' and dense.get('renderer','').startswith('matplotlib'):
                rendered=dense['minimumLabelPt']*min((b[2]-b[0])/dense['width'],(b[3]-b[1])/dense['height'])
                if rendered<GRAPH_FLOOR:errors.append('GRAPH_LABEL_FLOOR')
                if abs((b[2]-b[0])/(b[3]-b[1])-components[name]['pixelWidth']/components[name]['pixelHeight'])>.002:errors.append('GRAPH_ASPECT_DISTORTION')
            if name=='table' and components[name].get('pixelWidth'):
                if 29*(b[2]-b[0])/components[name]['pixelWidth']<TABLE_FLOOR:errors.append('TABLE_FLOOR')
            for entry in layout.get('panelTextBounds',[]):
                t=entry['bounds']
                if entry['panel']=='worked' and min(b[2],t[2])>max(b[0],t[0]) and min(b[3],t[3])>max(b[1],t[1]):errors.append('TEXT_VISUAL_OVERLAP')
    title=components['title']
    if title.get('longMode'):
        if title['fontSize']<LONG_TITLE_FLOOR or title['bounds'][1]<578 or title['bounds'][3]>636:errors.append('LONG_TITLE_OVERFLOW')
    expected={'header':[15.84,695.52,596.16,777.6],'metadata':[29.52,642.24,582.48,687.6],'footer':[16,15,596,56]}
    for name,bounds in expected.items():
        if any(abs(x-y)>.002 for x,y in zip(components[name]['bounds'],bounds)):errors.append('CANONICAL_'+name.upper())
    return sorted(set(errors))

def graph_model(kind):
    import qa_plot
    from qa_renderer import graph_image
    if kind in RETAINED_CODES:
        from canonical_components.retained_models import model as retained_model
        from repo_guard import read_json
        model=retained_model(kind)
        alternative=read_json('build/faculty-build-composer/data/concept-reviews/accessibility_semantics.json')['pilot'][kind]['graphAlternative']
        payload={k:getattr(model,k) for k in ['series','notes','fills','xlabel','ylabel','limits']}
        return model,alternative,hashlib.sha256(json.dumps(payload,sort_keys=True).encode()).hexdigest()
    original=qa_plot.Plot;captured=[]
    class Capture(original):
        def render(self):captured.append(self);return Image.new('RGB',(1,1),'white')
    try:
        qa_plot.Plot=Capture
        _,alternative=graph_image(kind)
    finally:qa_plot.Plot=original
    model=captured[0]
    payload={k:getattr(model,k) for k in ['series','notes','fills','xlabel','ylabel','limits']}
    return model,alternative,hashlib.sha256(json.dumps(payload,sort_keys=True).encode()).hexdigest()

def graph_image_dense(kind):
    model,alternative,model_hash=graph_model(kind)
    general=kind in GENERAL_KINDS
    width=960 if general else 840;height=GRAPH_HEIGHT[kind]*3
    im=Image.new('RGB',(width,height),'white');d=ImageDraw.Draw(im)
    font=ImageFont.truetype(str(contained('audit_tools/pdf_accessibility/canonical_components/regular-unicode.ttf')),26)
    ink='#171D2B';left,top,right,bottom=160 if kind in RETAINED_CODES else 110 if general else 66,120 if kind in RETAINED_CODES else 146 if general else 96,width-14,height-66
    xlo,xhi=model.limits['xlim'];ylo,yhi=model.limits['ylim']
    tickValues=model.limits.get('xticks',[])
    xCrowded=kind in RETAINED_CODES and any((b-a)/(xhi-xlo)*(right-left)<(font.getlength(f'{a:g}')+font.getlength(f'{b:g}'))/2+6 for a,b in zip(tickValues,tickValues[1:]))
    if xCrowded:bottom=height-96
    def xy(p):
        x,y=p
        if isinstance(x,str):x={'xmin':xlo,'xmax':xhi}[x]
        if isinstance(y,str):y={'ymin':ylo,'ymax':yhi}[y]
        return left+(x-xlo)/(xhi-xlo)*(right-left),bottom-(y-ylo)/(yhi-ylo)*(bottom-top)
    def stroke(points,color,style,width=2):
        distance=0
        for a,b in zip(points,points[1:]):
            length=math.dist(a,b);steps=max(1,math.ceil(length/2))
            for i in range(steps):
                phase=(distance+length*i/steps)%({'--':18,':':7,'-.':24}.get(style,1))
                if style=='-' or style=='--' and phase<11 or style==':' and phase<2 or style=='-.' and (phase<12 or 17<phase<20):
                    d.line([(a[0]+(b[0]-a[0])*i/steps,a[1]+(b[1]-a[1])*i/steps),(a[0]+(b[0]-a[0])*(i+1)/steps,a[1]+(b[1]-a[1])*(i+1)/steps)],fill=color,width=width)
            distance+=length
    labels=[]
    def label(t,x,y,anchor='lt',background=False):
        box=d.textbbox((x,y),t,font=font,anchor=anchor)
        if box[0]<0 or box[1]<0 or box[2]>width or box[3]>height:raise ValueError('Dense graph label clipped: '+t)
        if background:d.rectangle((box[0]-2,box[1]-1,box[2]+2,box[3]+1),fill='white')
        d.text((x,y),t,font=font,fill=ink,anchor=anchor);labels.append({'text':t,'bounds':list(box),'fontSize':26/3})
    legend=[(s[3],s[1],s[2]) for s in model.series if s[3]]
    x=4;legendY=3
    for text,color,style in legend:
        if general and x+28+font.getlength(text)>width:x=4;legendY+=32
        stroke([(x,legendY+14),(x+22,legendY+14)],color,style);label(text,x+28,legendY);x+=28+font.getlength(text)+16
    if x>width:raise ValueError('Dense graph legend exceeds width')
    label(model.ylabel,left,top-38 if general else 43)
    d.line([(left,top),(left,bottom),(right,bottom)],fill=ink,width=2)
    xt=model.limits.get('xticks',[xlo+(xhi-xlo)*i/4 for i in range(5)] if general else [])
    xpos=[]
    for value in xt:
        actual=xy((value,ylo))[0];half=font.getlength(f'{value:g}')/2
        shown=max(actual,(xpos[-1][1]+xpos[-1][2]+half+6) if xpos else left)
        xpos.append((actual,shown,half,value))
    shift=max(0,xpos[-1][1]+xpos[-1][2]-width+2) if xpos else 0
    for index,(actual,shown,half,value) in enumerate(xpos):
        x,y=xy((value,ylo));d.line([(x,y),(x,y+4)],fill=ink,width=2)
        if kind in RETAINED_CODES:
            if xCrowded:
                d.line([(x,y+4),(x,y+8+(index%2)*28)],fill=ink,width=1)
                label(f'{value:g}',min(width-half-2,max(half+2,x)),y+9+(index%2)*28,'mt')
            else:
                if abs(shown-shift-x)>1:d.line([(x,y+4),(shown-shift,y+8)],fill=ink,width=1)
                label(f'{value:g}',shown-shift,y+9,'mt')
        else:label(f'{value:g}',min(right-13,max(left,x)),y+8,'mt')
    ticks=model.limits.get('yticks',[ylo+(yhi-ylo)*i/4 for i in range(5)])
    ordered=sorted([(xy((xlo,v))[1],v) for v in ticks]);positions=[]
    for y,v in ordered:positions.append(max(y,positions[-1]+29 if positions else top))
    excess=max(0,positions[-1]-bottom) if positions else 0
    if excess:positions=[p-excess for p in positions]
    lanes=math.ceil(len(ordered)*29/(bottom-top)) if kind in RETAINED_CODES else 1
    for index,((actual,v),shown) in enumerate(zip(ordered,positions)):
        if lanes>1:shown=actual
        d.line([(left-3,actual),(left,actual)],fill=ink,width=1)
        if abs(shown-actual)>1:d.line([(left-4,actual),(left-12,shown)],fill=ink,width=1)
        tx=left-16-(index%lanes)*60
        if lanes>1:d.line([(left-4,actual),(tx+3,shown)],fill=ink,width=1)
        label(model.limits.get('ytickprefix','')+f'{v:g}',tx,shown,'rm')
    label(model.xlabel,(left+right)/2,height-29,'mt')
    # All series use the same immutable source coordinates and non-color styles.
    if general:
        from PIL import ImageChops
        for pts,color,hatch in model.fills:
            mask=Image.new('1',(width,height));ImageDraw.Draw(mask).polygon([xy(p) for p in pts],fill=1)
            pattern=Image.new('1',(width,height));pd=ImageDraw.Draw(pattern)
            if hatch=='//':
                for off in range(-height,width,16):pd.line([(off,0),(off+height,height)],fill=1,width=1)
            else:
                for xx in range(0,width,16):
                    for yy in range(0,height,16):pd.ellipse((xx,yy,xx+2,yy+2),fill=1)
            im.paste(color,(0,0,width,height),ImageChops.logical_and(mask,pattern));d=ImageDraw.Draw(im)
    before=im.copy()
    for pts,color,style,text,marker in model.series:
        points=[xy(p) for p in pts]
        if len(points)>1:stroke(points,color,style)
        if marker:
            for x,y in points:d.ellipse((x-3,y-3,x+3,y+3),fill=color)
    before.paste(im.crop((left,top,right+1,bottom+1)),(left,top));im=before;d=ImageDraw.Draw(im)
    for text,p,offset,coords,arrow in model.notes:
        x,y=xy(p)
        if arrow:
            a=xy(offset);d.line([a,(x,y)],fill=ink,width=2)
            for end,start in [((x,y),a)]+([(a,(x,y))] if arrow.get('arrowstyle')=='<->' else []):
                angle=math.atan2(end[1]-start[1],end[0]-start[0]);d.polygon([end,(end[0]-7*math.cos(angle-.4),end[1]-7*math.sin(angle-.4)),(end[0]-7*math.cos(angle+.4),end[1]-7*math.sin(angle+.4))],fill=ink)
        if text:
            if text.startswith('Surplus'):tx=(xy((90,0))[0]+xy((120,0))[0])/2;ty=top+4;anchor='mt'
            elif text.startswith('QD'):tx=x-8;ty=y-22;anchor='rt'
            elif text.startswith('QS'):tx=x+8;ty=y-22;anchor='lt'
            elif text=='Equilibrium':tx=x+4;ty=y+14;anchor='lt'
            else:tx=x+9;ty=y-31;anchor='lt'
            if general:
                dx,dy=offset if coords else (0,0)
                tx=max(4,min(width-font.getlength(text)-4,x+dx));ty=max(top,min(bottom-28,y-dy-(26 if dy>=0 else 0)));anchor='lt'
            label(text,tx,ty,anchor,True)
    return im,alternative,{'mode':'CANONICAL_GRAPH_DENSE','width':width/3,'pixelWidth':width,'height':GRAPH_HEIGHT[kind],
        'minimumLabelPt':26/3,'modelSha256':model_hash,'labels':labels,'sourceKind':kind}
