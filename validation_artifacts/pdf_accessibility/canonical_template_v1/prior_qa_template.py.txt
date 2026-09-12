"""Established Concept Review components, applied without changing source words."""
from qa_renderer import (canvas, contained, HexColor, white, Image, ImageReader,
                         wrap, REGULAR, BOLD, NAVY, TEAL, INK, PALE, contrast)
from reportlab.pdfbase.pdfmetrics import stringWidth
import hashlib

TOKENS={'page':[612,792], 'rail':50, 'panelX':79, 'panelWidth':503,
        'textX':91, 'textWidth':479, 'radius':8, 'minimumBody':8.5,
        'header':[16,704,580,72], 'metadata':[29,650,554,45],
        'footer':[16,16,580,42], 'pale':PALE, 'navy':NAVY, 'teal':TEAL}

def draw(source,destination,meta):
    from qa_renderer import table_image
    path=contained(destination)
    if not path.is_relative_to(contained('tmp/pdf_accessibility')):raise ValueError('Staged output only')
    path.parent.mkdir(parents=True,exist_ok=True)
    con=source['content']; image=None; mode='text / calculation'
    if meta.get('tableRequired'):
        image,regions=table_image(con['table'],styled=True);mode='full-width table'
        assert regions==meta['tableRegions']
    elif con.get('graph'):
        image=Image.open(contained(meta['assetSourcePath'])).convert('RGB');mode='graph + text'
    if image is not None:assert hashlib.sha256(image.tobytes()).hexdigest()==meta['graphDecodedSha256']
    iw=479; ih=iw*image.height/image.width if image is not None else 0
    # Retained tall figures keep the proven side-by-side composition.
    side=image is not None and not meta.get('tableRequired') and not con.get('graphSpec')
    if side:iw=260;ih=min(177,iw*image.height/image.width);iw=ih*image.width/image.height
    compact=False
    def measure(size):
        lead=size*(1.16 if compact else 1.23)
        def h(t,w=479):return len(wrap(t,w,REGULAR,size))*lead
        head=30 if compact else 36;card=24 if compact else 39
        heights=[head+h(con['core']),head+sum(h(t,465)+2 for t in con['recognition']),
                 card+h(con['watch']),card+max(ih,h(con['worked'],207)) if side else card+ih+h(con['worked']),
                 card+h(con['check'])]
        # Worked label may wrap without abbreviating approved wording.
        heights[3]+=(len(wrap('WORKED EXAMPLE: '+con['workedLabel'],479,BOLD,12))-1)*14
        if meta.get('tableRequired'):heights[3]+=size+3
        return heights,lead
    size=11
    while size>9.5 and sum(measure(size)[0])+24>528:size=round(size-.25,2)
    if sum(measure(size)[0])+24>528:
        compact=True
        while size>8.5 and sum(measure(size)[0])+8>528:size=round(size-.25,2)
    heights,leading=measure(size)
    if sum(heights)+8>528:raise ValueError(f'Readable template does not fit {source["code"]}: {sum(heights)+8:.1f}')
    gap=min(18,(528-sum(heights))/4)
    extra=528-sum(heights)-4*gap
    # A short example receives breathing room; cards remain evenly distributed.
    heights[3]+=extra
    c=canvas.Canvas(str(path),pagesize=(612,792),invariant=1,pageCompression=1)
    c.setTitle(source['title']);c.setAuthor('Mastery Quests')
    bounds=[];components=[]
    def text(t,x,y,w=479,fs=None,font=REGULAR,color=INK,lead=None):
        fs=fs or size;lead=lead or (leading if fs==size else fs*1.23);ls=wrap(t,w,font,fs)
        ob=c.beginText(x,y);ob.setFont(font,fs);ob.setLeading(lead);ob.setFillColor(HexColor(color))
        for line in ls:ob.textLine(line)
        c.drawText(ob);bounds.append([x,y-(len(ls)-1)*lead-fs*.25,x+w,y+fs])
        return y-len(ls)*lead
    def box(name,x,y,w,h,fill=None,stroke=None,radius=8):
        c.setLineWidth(1)
        if fill:c.setFillColor(HexColor(fill))
        if stroke:c.setStrokeColor(HexColor(stroke))
        c.roundRect(x,y,w,h,radius,fill=bool(fill),stroke=bool(stroke))
        components.append({'name':name,'bounds':[x,y,x+w,y+h],'fill':fill,'stroke':stroke})
    def icon(kind,y,color=TEAL):
        c.setFillColor(HexColor(color));c.circle(50,y,14,fill=1,stroke=0)
        c.setStrokeColor(white);c.setLineWidth(1.6)
        if kind=='core':c.line(43,y,57,y);c.line(50,y-7,50,y+7)
        elif kind=='recognition':c.circle(48,y+2,5,fill=0,stroke=1);c.line(52,y-2,57,y-7)
        elif kind=='watch':
            p=c.beginPath();p.moveTo(50,y+8);p.lineTo(42,y-6);p.lineTo(58,y-6);p.close();c.drawPath(p,stroke=1)
            c.line(50,y+3,50,y-1);c.circle(50,y-3.5,.5,stroke=1)
        elif kind=='worked':c.rect(44,y-7,12,14,stroke=1,fill=0);c.line(47,y+3,53,y+3);c.line(47,y-1,53,y-1)
        else:
            p=c.beginPath();p.moveTo(46,y+5);p.curveTo(46,y+10,56,y+10,55,y+4);p.curveTo(55,y+1,50,y+1,50,y-3);c.drawPath(p,stroke=1);c.circle(50,y-7,.7,stroke=1)
        components.append({'name':'icon-'+kind,'bounds':[36,y-14,64,y+14]})
    box('header',*TOKENS['header'],fill=NAVY,radius=10)
    box('logo-card',34,717,52,46,fill='#FFFFFF')
    c.drawImage(str(contained('assets/images/mastery-quests-logo-standalone.png')),38,720,44,40,preserveAspectRatio=True,mask='auto')
    text(source['disciplineLabel'],99,735,344,23,BOLD,'#FFFFFF')
    box('resource-card',452,724,124,39,stroke=TEAL)
    text(source['code'],462,738,106,12,BOLD,'#FFFFFF')
    box('metadata',*TOKENS['metadata'],fill='#F3F7FA',stroke='#D7E4EA')
    c.setStrokeColor(HexColor('#D7E4EA'));c.line(171,657,171,688);c.line(407,657,407,688)
    text('Time: '+con['time'],43,676,120,8.7)
    text('Outcome: '+con['outcome'],183,676,212,8.7)
    text('Difficulty: '+con['difficulty'],420,676,153,8.4)
    # Small vector metadata markers are decorative, never redundant accessible text.
    c.setStrokeColor(HexColor(TEAL));c.setLineWidth(.7)
    for x in [36,176,413]:
        c.circle(x,679,4,fill=0,stroke=1);c.line(x,679,x,682);c.line(x,679,x+2,678)
    title_size=26
    while stringWidth(source['title'],BOLD,title_size)>550 and title_size>14:title_size-=.5
    lines=wrap(source['title'],550,BOLD,title_size)
    if len(lines)>1:raise ValueError('Title requires deliberate layout review: '+source['code'])
    tw=stringWidth(source['title'],BOLD,title_size)
    text(source['title'],(612-tw)/2,619,tw+.2,title_size,BOLD,NAVY)
    components.append({'name':'title','bounds':[(612-tw)/2,613,(612+tw)/2,619+title_size]})
    top=605
    for n,(name,label,body) in enumerate([('core','THE CORE IDEA',con['core']),('recognition','HOW TO RECOGNIZE IT',None),('watch','WATCH OUT',con['watch']),('worked','WORKED EXAMPLE: '+con['workedLabel'],con['worked']),('check','CHECK YOURSELF',con['check'])]):
        height=heights[n];bottom=top-height;card=name in ['watch','worked','check']
        if card:box(name,79,bottom,503,height,fill=PALE if name!='worked' else '#FFFFFF',stroke=NAVY if name=='worked' else TEAL)
        else:components.append({'name':name,'bounds':[79,bottom,582,top]})
        icon(name,top-14,NAVY if name=='worked' else TEAL)
        y=text(label,91 if card else 80,top-16,479 if card else 502,12 if name=='worked' else 13,BOLD,TEAL if name in ['watch','check'] else NAVY,14)+(4 if compact else -5)
        if not card:
            c.setStrokeColor(HexColor(TEAL));c.setLineWidth(.8);c.line(80,top-21,582,top-21)
            if compact:y-=6
        if name=='recognition':
            for item in con['recognition']:
                text('\u2022',81,y,10);y=text(item,96,y,465)-2
        elif name=='worked' and image is not None:
            c.drawImage(ImageReader(image),91,y-ih+size,iw,ih,preserveAspectRatio=False)
            components.append({'name':'table' if meta.get('tableRequired') else 'figure','bounds':[91,y-ih+size,91+iw,y+size]})
            y=text(body,363,y,207) if side else text(body,91,y-ih-4 if meta.get('tableRequired') else y-ih+size-5)
        else:y=text(body,91 if card else 80,y,479 if card else 502)
        if y+leading-size*.25<bottom+3:raise ValueError(f'Panel overflow {source["code"]} {name}')
        top=bottom-gap
    box('footer',*TOKENS['footer'],fill=NAVY)
    c.setStrokeColor(HexColor('#54D7D5'));c.setLineWidth(2);c.circle(42,37,10,stroke=1);c.line(36,37,48,37);c.line(44,41,48,37);c.line(44,33,48,37)
    text('READY?',65,32,95,12,BOLD,'#FFFFFF');text('Return to the game and master this concept.',169,33,405,10,BOLD,'#FFFFFF')
    if any(b[1]<16 or b[3]>776 or b[0]<16 or b[2]>596 for b in bounds):raise ValueError('Page text bounds')
    c.showPage();c.save()
    return {'bodyFontSize':size,'tableFontSizeAtLeast':29*479/1512,'page':[612,792], 'contentBottom':bottom,
            'textBounds':bounds,'components':components,'layoutMode':mode,'clipping':'PASS',
            'contrast':{color:contrast(color,'#FFFFFF') for color in [NAVY,TEAL,INK]},
            'styleAuthority':'v1','contentAuthority':'v2','balance':{'footerGap':bottom-58,'interSectionGap':gap},'template':'established-concept-review-v1'}
