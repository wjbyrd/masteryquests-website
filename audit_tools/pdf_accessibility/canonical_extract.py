"""Read-only extraction of the accepted GEN-ECON-01 component authority."""
import json, re, struct, io
from pathlib import Path
from pypdf import PdfReader
import pdfplumber
from repo_guard import contained, read_json, write_json, sha

REFERENCE='validation_artifacts/concept_review_owner_review/v3/GEN-ECON/GEN-ECON-01.pdf'
HASH='3901424bba74d606a1ead9e6d271e110fdfbd4e13015cb99e0e97b400892f2e0'
DEST='audit_tools/pdf_accessibility/canonical_components'

def unicode_font(data,mapping):
    """Normalize only the retained subset's cmap; preserve outlines and metrics."""
    chars=sorted(k for k in mapping if 31<k<65535)+[65535];n=len(chars)
    power=2**(n.bit_length()-1)
    sub=struct.pack('>7H',4,16+8*n,0,2*n,2*power,power.bit_length()-1,2*n-2*power)
    sub+=struct.pack('>'+str(n)+'H',*chars)+b'\0\0'+struct.pack('>'+str(n)+'H',*chars)
    sub+=struct.pack('>'+str(n)+'H',*[(mapping[k]['glyph']-k)&65535 if k!=65535 else 1 for k in chars])+b'\0\0'*n
    cmap=struct.pack('>HHHHI',0,1,3,1,12)+sub
    tables={}
    for i in range(struct.unpack_from('>H',data,4)[0]):
        tag,_,o,l=struct.unpack_from('>4sIII',data,12+16*i);tables[tag]=data[o:o+l]
    tables[b'cmap']=cmap;tables[b'head']=tables[b'head'][:8]+b'\0'*4+tables[b'head'][12:]
    count=len(tables);power=2**(count.bit_length()-1);header=struct.pack('>I4H',0x10000,count,power*16,power.bit_length()-1,count*16-power*16)
    def checksum(b):
        b+=b'\0'*((-len(b))%4);return sum(struct.unpack('>'+str(len(b)//4)+'I',b))&0xffffffff
    offset=12+count*16;directory=b'';body=b'';headOffset=0
    for tag,b in sorted(tables.items()):
        if tag==b'head':headOffset=offset
        directory+=struct.pack('>4sIII',tag,checksum(b),offset,len(b));pad=b'\0'*((-len(b))%4);body+=b+pad;offset+=len(b)+len(pad)
    result=bytearray(header+directory+body);struct.pack_into('>I',result,headOffset+8,(0xB1B0AFBA-checksum(bytes(result)))&0xffffffff)
    return bytes(result)

def font_map(obj):
    data=obj['/FontDescriptor']['/FontFile2'].get_data()
    for i in range(struct.unpack_from('>H',data,4)[0]):
        tag,_,offset,length=struct.unpack_from('>4sIII',data,12+16*i)
        if tag==b'cmap': cmap=data[offset:offset+length];break
    _,_,offset=struct.unpack_from('>HHI',cmap,4)
    fmt,_,_,first,count=struct.unpack_from('>5H',cmap,offset)
    if fmt!=6:raise ValueError('Review unsupported retained subset cmap')
    glyphs=struct.unpack_from('>'+str(count)+'H',cmap,offset+10)
    mapping={}
    for block in re.findall(r'beginbfchar(.*?)endbfchar',obj['/ToUnicode'].get_data().decode(),re.S):
        for a,b in re.findall(r'<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>',block):
            code=int(a,16);unicode=int(b,16)
            if first<=code<first+count and glyphs[code-first]!=1:
                mapping[unicode]={'glyph':glyphs[code-first],'width':float(obj['/Widths'][code-int(obj['/FirstChar'])])}
    return data,mapping

def extract():
    assert sha(REFERENCE)==HASH
    output=contained(DEST);output.mkdir(exist_ok=True)
    reader=PdfReader(contained(REFERENCE));page=reader.pages[0]
    with pdfplumber.open(contained(REFERENCE)) as pdf:
        p=pdf.pages[0]
        curves=[{k:c[k] for k in ['x0','y0','x1','y1','linewidth','stroking_color','non_stroking_color','path']} for c in p.curves]
        images=[]
        for name,c in zip(['logo','hourglass','target','core','recognition','watch','worked','check'],p.images):
            image=page.images['/'+c['name']];image.image.save(output/(name+'.png'))
            images.append({'role':name,'bounds':[c['x0'],c['y0'],c['x1'],c['y1']],'sha256':sha(output/(name+'.png'))})
        typography=[]
        for line in p.extract_text_lines():
            chars=line['chars'];typography.append({'text':line['text'],'x':line['x0'],'top':line['top'],'fonts':sorted(set((c['fontname'],c['size']) for c in chars))})
    # Retain native subset programs and their actual PDF-code-to-Unicode maps.
    # ReportLab's subset reader misreads format-6 offsets; the explicit map avoids that.
    fonts=[]
    for role,key in [('regular','/F3+0'),('bold','/F2+0')]:
        data,mapping=font_map(page['/Resources']['/Font'][key])
        (output/(role+'.ttf')).write_bytes(data)
        (output/(role+'-unicode.ttf')).write_bytes(unicode_font(data,mapping))
        fonts.append({'role':role,'path':role+'.ttf','sha256':sha(output/(role+'.ttf')),'map':mapping,'source':REFERENCE})
    # Quotes used by frozen corrected content require retained same-family glyphs.
    wanted={0x2019,0x201c,0x201d}
    for record in read_json('validation_artifacts/concept_review_owner_review/v1/candidate_manifest.json').get('records',[]):
        path='validation_artifacts/concept_review_owner_review/v1/'+record['reviewCopyPath']
        if not path:continue
        for obj in PdfReader(contained(path)).pages[0]['/Resources']['/Font'].values():
            obj=obj.get_object()
            if 'Arimo-Regular' not in str(obj.get('/BaseFont')):continue
            data,mapping=font_map(obj)
            if wanted & mapping.keys():
                role='quotes'+str(len(fonts));filename=role+'.ttf'
                (output/filename).write_bytes(data)
                fonts.append({'role':role,'path':filename,'sha256':sha(output/filename),'map':mapping,'source':path});wanted-=mapping.keys();break
        if not wanted:break
    write_json(DEST+'/specification.json',{'reference':REFERENCE,'sha256':HASH,'page':[612,792],
        'curves':curves,'images':images,'typography':typography,'fonts':fonts,
        'tokens':{'header':[15.84,695.52,580.32,82.08],'metadata':[29.52,642.24,552.96,45.36],
        'dividers':[167.82,397.47],'footer':[16,15,580,41],'rail':50.76,'iconHeight':38.16,
        'panelX':79.92,'panelWidth':503.28,'textX':91.77365,'mainX':80.44365,'ruleWidth':503.28,
        'radius':8,'panelStroke':1.05,'titleSize':32,'titleBaseline':599.3574,'coreTop':582.326,
        'sectionSize':16.2,'panelHeadingSize':16,'bodySize':10.45,'bodyLeading':13.376,
        'workedSize':10.35,'workedLeading':13.065,'sectionGap':24,'navy':[.031,.157,.373],
        'teal':[.071,.686,.663],'headingTeal':[.027451,.560784,.564706],
        'pale':[.918,.973,.973],'ink':[.09,.114,.169],'footerFill':[.043137,.180392,.403922]}})
    print('Extracted canonical paths, images, fonts; missing quote glyphs:',wanted)

if __name__=='__main__':extract()
