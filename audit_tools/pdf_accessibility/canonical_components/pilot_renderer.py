"""Canonical GEN-ECON-01 components; content-dependent card interiors only."""
from qa_renderer import canvas, contained, Image, ImageReader, wrap
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont
from reportlab.lib.colors import Color,white
from repo_guard import read_json,sha
import hashlib
from functools import lru_cache
ASSETS='audit_tools/pdf_accessibility/canonical_components'
SPEC=read_json(ASSETS+'/specification.json');TOKENS=SPEC['tokens'];FONTS={}
for f in SPEC['fonts']:
    p=contained(ASSETS+'/'+f['path']);assert sha(p)==f['sha256']
    name='MQCanonical-'+f['role'];font=TTFont(name,str(p));m={int(k):v for k,v in f['map'].items()}
    font.face.charToGlyph={k:v['glyph'] for k,v in m.items()};font.face.charWidths={k:v['width'] for k,v in m.items()}
    font.face.glyphToChar={v['glyph']:k for k,v in m.items()};font.face.name=('Arimo-'+f['role']).encode()
    pdfmetrics.registerFont(font);FONTS[f['role']]=(name,set(m))

# Preserve the canonical Arimo text, with a small, embedded Unicode extension
# for mathematical epsilon, multiplication and punctuation used by final QA.
for role in ['regular','bold']:
    name='MQCanonicalMath-'+role
    font=TTFont(name,str(contained(ASSETS+'/'+role+'-math.ttf')))
    pdfmetrics.registerFont(font);FONTS['math-'+role]=(name,set(font.face.charToGlyph))
@lru_cache(maxsize=8192)
def font_for(t,bold=False):
    needed=set(map(ord,t))-{10,13}
    for r in (['bold'] if bold else ['regular',*[r for r in FONTS if r.startswith('quotes')]]):
        if needed<=FONTS[r][1]:return FONTS[r][0]
    r='math-bold' if bold else 'math-regular'
    if needed<=FONTS[r][1]:return FONTS[r][0]
    raise ValueError('Canonical glyph coverage: '+repr(t))
@lru_cache(maxsize=16384)
def lines(t,w,s,b=False):return wrap(t,w,font_for(t,b),s)
def canonical_table(table,dense=False):
    from PIL import ImageDraw,ImageFont
    narrow=len(table['rowHeaders'])>=7 and len(table['columnHeaders'])==2
    width=1439 if dense else 906 if narrow else 1439;pad=2 if dense else 5;fs=29;lead=32 if dense else 35
    fonts=[ImageFont.truetype(str(contained(ASSETS+'/'+r+'-unicode.ttf')),fs) for r in ['regular','bold']]
    rows=[['',*table['columnHeaders']]]+[[h,*v] for h,v in zip(table['rowHeaders'],table['cells'])]
    weights=table.get('columnWidths',[1/len(rows[0])]*len(rows[0]));xs=[0]
    for w in weights:xs.append(xs[-1]+round(width*w))
    xs[-1]=width
    def wrapped(t,w,font):
        result=[];line=''
        for word in str(t).split():
            trial=(line+' '+word).strip()
            if font.getlength(trial)>w and line:result.append(line);line=word
            else:line=trial
            if font.getlength(line)>w:raise ValueError('Canonical table column too narrow')
        return result+[line]
    cap=wrapped(table['caption'],width-2*pad,fonts[1]);capH=lead*len(cap)+2*pad;ys=[capH]
    content=[[wrapped(t,xs[j+1]-xs[j]-2*pad,fonts[int(i==0 or j==0)]) for j,t in enumerate(row)] for i,row in enumerate(rows)]
    for row in content:ys.append(ys[-1]+lead*max(map(len,row))+2*pad)
    im=Image.new('RGB',(width,ys[-1]),'white');d=ImageDraw.Draw(im)
    navy=tuple(round(v*255) for v in TOKENS['navy']);pale=tuple(round(v*255) for v in TOKENS['pale']);ink=tuple(round(v*255) for v in TOKENS['ink'])
    for i,line in enumerate(cap):d.text((pad,pad+i*lead),line,font=fonts[1],fill=navy)
    for i,row in enumerate(content):
        for j,ls in enumerate(row):
            total=i>0 and (rows[i][0].lower().startswith('total') or rows[i][0].lower()=='capital')
            d.rectangle((xs[j],ys[i],xs[j+1],ys[i+1]),fill=navy if i==0 else pale if j==0 or total else 'white')
            d.line((xs[j],ys[i+1]-1,xs[j+1],ys[i+1]-1),fill='#DCE3EA',width=2)
            for k,line in enumerate(ls):
                color='white' if i==0 else ink
                if line=='\u2014':
                    # The retained Arimo subset omits the em dash. Paint its
                    # one-em horizontal glyph; keep the original semantic cell.
                    x=xs[j]+pad;y=ys[i]+pad+k*lead+round(fs*.55)
                    d.line((x,y,x+fs,y),fill=color,width=2)
                else:d.text((xs[j]+pad,ys[i]+pad+k*lead),line,font=fonts[int(i==0 or j==0)],fill=color)
    return im,{'imageWidth':width,'imageHeight':im.height,'captionBottom':capH,'xEdges':xs,'yEdges':ys}
def draw(source,destination,meta):
    from qa_renderer import table_image
    path=contained(destination)
    if not path.is_relative_to(contained('tmp/pdf_accessibility')):raise ValueError('Staged output only')
    path.parent.mkdir(parents=True,exist_ok=True);con=source['content'];im=None;mode='TEXT';dense=meta.get('canonicalDense')
    flow=meta.get('canonicalFlow',False)
    finalCompact=meta.get('qaRemediation',{}).get('authorization')=='CONCEPT_REVIEW_FINAL_QA_20260919'
    leadingRatio=1.18 if flow=='CANONICAL_COMPACT_FLOW_TIGHT' else 1.20 if flow else 1.28
    panelBodyGap=16 if flow else 22.6979
    if finalCompact:panelBodyGap=12
    if meta.get('tableRequired'):
        im,regions=canonical_table(con['table'],dense=bool(dense));assert regions==meta['tableRegions'];mode='CANONICAL_TABLE_DENSE' if dense else 'TABLE + TEXT' if im.width==906 else 'FULL-WIDTH TABLE'
    elif con.get('graph'):
        im=Image.open(contained(meta['assetSourcePath'])).convert('RGB');mode='GRAPH + TEXT'
    if im is not None:assert hashlib.sha256(im.tobytes()).hexdigest()==meta['graphDecodedSha256']
    c=canvas.Canvas(str(path),pagesize=(612,792),invariant=1,pageCompression=1);c.setTitle(source['title']);c.setAuthor('Mastery Quests')
    bounds=[];components=[];exceptions=[];panelBounds=[];navy=TOKENS['navy'];teal=TOKENS['teal'];ink=TOKENS['ink']
    def txt(t,x,y,w,fs=10.45,bold=False,col=ink,lead=None):
        ls=lines(t,w,fs,bold);lead=lead or fs*1.28;o=c.beginText(x,y);o.setFont(font_for(t,bold),fs);o.setLeading(lead);o.setFillColor(Color(*col))
        for line in ls:o.textLine(line)
        c.drawText(o);bounds.append([x,y-(len(ls)-1)*lead-fs*.22,x+w,y+fs*.91]);return y-(len(ls)-1)*lead
    def curve(index,name):
        v=SPEC['curves'][index];p=c.beginPath()
        for op,*points in v['path']:
            xy=[z for a in points for z in (a[0],792-a[1])]
            if op=='m':p.moveTo(*xy)
            elif op=='l':p.lineTo(*xy)
            elif op=='c':p.curveTo(*xy)
            elif op=='h':p.close()
        c.setFillColor(Color(*v['non_stroking_color']));stroke=index in [2,3,4,5,6,11]
        if stroke:c.setStrokeColor(Color(*v['stroking_color']))
        c.setLineWidth(v['linewidth']);c.drawPath(p,fill=1,stroke=stroke)
        components.append({'name':name,'bounds':[v['x0'],v['y0'],v['x1'],v['y1']],'sourceCurve':index})
    def art(role,top=None):
        a=next(a for a in SPEC['images'] if a['role']==role);x,y,x1,y1=a['bounds'];w=x1-x;h=y1-y
        if top is not None:y=top-h
        c.drawImage(str(contained(ASSETS+'/'+role+'.png')),x,y,w,h,mask='auto');components.append({'name':'icon-'+role,'bounds':[x,y,x+w,y+h],'assetSHA256':a['sha256']})
    def card(name,top,height):
        fill=[1,1,1] if name=='worked' else TOKENS['pale'];stroke=navy if name=='worked' else teal
        c.setFillColor(Color(*fill));c.setStrokeColor(Color(*stroke));c.setLineWidth(1.05);c.roundRect(79.92,top-height,503.28,height,8,fill=1,stroke=1)
        components.append({'name':name,'bounds':[79.92,top-height,583.2,top],'fill':fill,'stroke':stroke,'strokeWidth':1.05,'radius':8})
    curve(0,'header');curve(1,'logo-card');art('logo');txt(source['disciplineLabel'],105.12,727.1973,339,27,True,[1,1,1]);curve(2,'resource-card')
    cw=pdfmetrics.stringWidth(source['code'],font_for(source['code'],True),13.9995);txt(source['code'],(1024.521-cw)/2,731.7059,cw+.01,13.9995,True,[1,1,1])
    curve(3,'metadata');c.setStrokeColor(Color(.863,.89,.918));c.setLineWidth(.75)
    for x in [167.82,397.47]:c.line(x,642.99,x,686.85)
    art('hourglass');txt('Time:',64.47,660.0951,29.88,10.3995,True,navy);txt(con['time'],94.35,660.0951,68,10.3995)
    ls=lines('Outcome: '+con['outcome'],186.5,8.55);o=c.beginText(202.02,661.37+(len(ls)-1)*5);o.setLeading(10);o.setFillColor(Color(*ink))
    for i,line in enumerate(ls):
        if i==0:
            o.setFont(font_for('Outcome:',True),8.55);o.textOut('Outcome:');o.setFont(font_for(line[8:]),8.55);o.textLine(line[8:])
        else:o.setFont(font_for(line),8.55);o.textLine(line)
    c.drawText(o);art('target');txt('Difficulty:',405.42,660.3278,54,9.89925,True,navy)
    diff={'foundational':1,'beginner':1,'intermediate':2,'advanced':3}.get(con['difficulty'].lower(),2)
    for i,x in enumerate([465,473.2,481.4]):
        c.setLineWidth(.8);c.setStrokeColor(Color(*teal));c.setFillColor(Color(*teal) if i<diff else white);c.circle(x,663.6,3.05,fill=1,stroke=1)
    components.append({'name':'difficulty-dots','centers':[[465,663.6],[473.2,663.6],[481.4,663.6]],'radius':3.05,'active':diff});txt(con['difficulty'],489.7,660.6439,84,9.55)
    ts=32
    while pdfmetrics.stringWidth(source['title'],font_for(source['title'],True),ts)>552.96:ts-=.5
    twoTitle=ts<22
    if twoTitle:ts=25
    if ts!=32:exceptions.append({'component':'title','reason':'Long resource title','size':ts})
    tw=pdfmetrics.stringWidth(source['title'],font_for(source['title'],True),ts)
    if twoTitle:
        tls=lines(source['title'],552.96,ts,True)
        if len(tls)>2:raise ValueError('Title exceeds canonical two-line exception')
        for i,line in enumerate(tls):
            w=pdfmetrics.stringWidth(line,font_for(line,True),ts);txt(line,(612-w)/2,613.3574-i*28,w+.01,ts,True,navy)
        exceptions.append({'component':'title','reason':'Two-line long title','size':ts});tw=552.96
    else:txt(source['title'],(612-tw)/2,599.3574,tw+.01,ts,True,navy)
    components.append({'name':'title','baseline':599.3574,'fontSize':ts,'longMode':twoTitle,'bounds':[(612-tw)/2,579 if twoTitle else 592,(612+tw)/2,636 if twoTitle else 628]})
    iw=479.573;ih=iw*im.height/im.width if im is not None else 0;side=im is not None and ((not meta.get('tableRequired') and not con.get('graphSpec')) or im.width==906)
    proseX=363;proseW=207
    if side:
        if meta.get('tableRequired'):iw=302;ih=im.height/3;proseX=405;proseW=166.4
        else:iw=260;ih=min(153,iw*im.height/im.width);iw=ih*im.width/im.height
    if dense and not meta.get('tableRequired'):
        mode='CANONICAL_GRAPH_DENSE';iw=dense['width'];ih=dense['height'];side=True;proseX=91.77365+iw+12;proseW=479.573-iw-12
        if dense.get('stacked'):side=False;mode='CANONICAL_GRAPH_TEXT_STACKED'
    label='WORKED EXAMPLE: '+con['workedLabel']
    def measure(s):
        lead=s*leadingRatio
        core=38.82+(len(lines(con['core'],503.28,s))-1)*lead+2.3
        recog=37.49+sum(len(lines(t,488.4,s))*lead+1.49 for t in con['recognition'])-lead-1.49+2.3
        if finalCompact:core-=6;recog-=6
        watch=47.09+(len(lines(con['watch'],479.573,s))-1)*lead+8.1
        worked=47.09+(len(lines(label,479.573,16,True))-1)*19.2
        if im is None:worked+=(len(lines(con['worked'],479.573,s))-1)*lead+8.1
        elif side:worked+=max(ih,(len(lines(con['worked'],proseW,s))-1)*lead+s)+8.1
        else:worked+=ih+8+(len(lines(con['worked'],479.573,s))-1)*lead+8.1
        if dense:
            head=24.3921+(len(lines(label,479.573,16,True))-1)*19.2+6
            if side:worked=head+max(ih,(len(lines(con['worked'],proseW,s))-1)*lead+s*1.13)+8
            else:worked=head+ih+5+s*1.13+(len(lines(con['worked'],479.573,s))-1)*lead+8
        check=47.09+(len(lines(con['check'],479.573,s))-1)*lead+8.1
        if flow:
            watch-=22.6979-panelBodyGap;check-=22.6979-panelBodyGap
        return [core,recog,watch,worked,check]
    size=10.45;gap=24
    available=491 if twoTitle else 505
    if dense or flow:available=(568.326 if twoTitle else 582.326)-70
    if sum(measure(size))+4*gap>available:gap=10;exceptions.append({'component':'spacing','reason':'Dense frozen content','gap':gap})
    if (dense or flow) and sum(measure(9.5))+4*gap>available:gap=8
    if flow=='CANONICAL_COMPACT_FLOW_TIGHT' and sum(measure(9.5))+4*gap>available:gap=7.5
    while sum(measure(size))+4*gap>available and size>9.5:size=round(size-.05,2)
    if size!=10.45:exceptions.append({'component':'body','reason':'Dense frozen content','size':size})
    heights=measure(size)
    budget={'available':available,'required':sum(heights)+4*gap,'header':82.08,'metadata':45.36,'titleMode':'CANONICAL_LONG_TITLE' if twoTitle else 'STANDARD','sectionHeights':dict(zip(['core','recognition','watch','worked','check'],heights)),'gaps':4*gap,'footer':41,'bodyFont':size,'interiorMode':mode}
    if sum(heights)+4*gap>available:raise ValueError('Canonical readable layout does not fit '+source['code']+': '+str(budget))
    top=568.326 if twoTitle else 582.326;lead=size*leadingRatio
    for n,(name,heading,body) in enumerate([('core','THE CORE IDEA',con['core']),('recognition','HOW TO RECOGNIZE IT',None),('watch','WATCH OUT',con['watch']),('worked',label,con['worked']),('check','CHECK YOURSELF',con['check'])]):
        startBounds=len(bounds)
        height=heights[n];bottom=top-height;isCard=n>=2
        if isCard:card(name,top,height)
        else:components.append({'name':name,'bounds':[79.92,bottom,583.2,top]})
        art(name,top)
        if not isCard:
            txt(heading,80.44425,top-15.6284,503.28,16.2,True,navy);c.setFillColor(Color(*teal));c.rect(80.44365,top-20.3534,503.28,.9,fill=1,stroke=0);y=top-(37.49 if name=='recognition' else 38.82)+(6 if finalCompact else 0)
        else:y=txt(heading,91.77075,top-24.3921,479.573,16,True,TOKENS['headingTeal'] if name!='worked' else navy,19.2)-(panelBodyGap if name in ['watch','check'] else 22.6979)
        if name=='recognition':
            for item in con['recognition']:txt('\u2022',87.6249,y,7,size);y=txt(item,94.8,y,488.4,size,lead=lead)-lead-1.49
        elif name=='worked' and im is not None:
            imageTop=y+16.6979 if dense else y+size
            c.drawImage(ImageReader(im),91.77365,imageTop-ih,iw,ih,mask='auto');components.append({'name':'table' if meta.get('tableRequired') else 'figure','bounds':[91.77365,imageTop-ih,91.77365+iw,imageTop],'pixelWidth':im.width,'pixelHeight':im.height})
            if side:txt(body,proseX,imageTop-size*.91 if dense else y,proseW,size,lead=lead)
            else:txt(body,91.77365,imageTop-ih-5-size*.91 if dense else y-ih-8,479.573,size,lead=lead)
        else:txt(body,91.77365 if isCard else 80.44365,y,479.573 if isCard else 503.28,size,lead=lead)
        if isCard:panelBounds.extend({'panel':name,'bounds':b} for b in bounds[startBounds:])
        top=bottom-gap
    curve(10,'footer');curve(11,'footer-arrow-circle');c.setStrokeColor(white);c.setLineWidth(1.4);c.line(90.2,39.5,94.5,35.5);c.line(94.5,35.5,90.2,31.5)
    txt('READY?',109,28.5,90,16,True,[.094,.816,.78]);txt('Return to the game and master this concept.',207,30.3,375,11.5,True,[1,1,1])
    if any(b[0]<15.84 or b[1]<15 or b[2]>596.16 or b[3]>777.6 for b in bounds):raise ValueError('Page text bounds')
    c.showPage();c.save()
    return {'template':'GEN-ECON-01','referenceSHA256':SPEC['sha256'],'specificationSHA256':sha(ASSETS+'/specification.json'),'bodyFontSize':size,'page':[612,792],'contentBottom':bottom,'components':components,'textBounds':bounds,'panelTextBounds':panelBounds,'layoutMode':mode,'exceptions':exceptions,'budget':budget,'denseEvidence':dense,'tableTextPt':29*iw/im.width if im is not None and meta.get('tableRequired') else None,'clipping':'PENDING_RENDER_REVIEW','styleAuthority':'GEN-ECON-01','contentAuthority':'v2/v3'}
