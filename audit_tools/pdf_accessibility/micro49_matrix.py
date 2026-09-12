"""Deterministic MICRO-49-only digit replacement inside the retained image.

The original shared graph stays untouched. Two reviewed digit boxes are rebuilt
from a pinned font at the original 23-pixel glyph height; no OCR or PDF overlay.
"""
from repo_guard import *
from PIL import Image, ImageDraw, ImageFont
from pypdf import PdfReader
from pypdf.generic import DecodedStreamObject

ORIGINAL='c2d2eedc9b2cd9826655aa1b6cdc237b2271bf83621e2aecbb351c6db5eda6e1'
FONT_SHA='c4c45690b345435b2cba52ecabe275f05e49b389b39fe68ad03afbb551288d3d'
BOXES=((554,352,574,378),(593,352,613,378))
CELLS=[['(9, 9)','(2, 3)'],['(3, 2)','(1, 1)']]

def derive(data):
    import reportlab
    if hashlib.sha256(data).hexdigest()!=ORIGINAL:
        raise ValueError('MICRO49_MATRIX_ORIGINAL_DRIFT')
    path=Path(reportlab.__file__).parent/'fonts/Vera.ttf'
    if hashlib.sha256(path.read_bytes()).hexdigest()!=FONT_SHA:
        raise ValueError('MICRO49_MATRIX_FONT_DRIFT')
    font=ImageFont.truetype(str(path),32)
    image=Image.frombytes('RGB',(728,471),data)
    glyph=Image.new('RGB',(20,26),'white')
    # Font top bearing 7; original digit top is y=354. Match glyph height 23.
    ImageDraw.Draw(glyph).text((-1,-5),'1',font=font,fill='black')
    for box in BOXES:image.paste(glyph,box)
    return image.tobytes()

def validate(meta):
    correction=meta['matrixCorrection']
    if correction['status']!='owner_authorized' or correction['originalDecodedSha256']!=ORIGINAL:
        raise ValueError('MICRO49_MATRIX_AUTHORIZATION_DRIFT')
    if meta['tableSource']['cells']!=CELLS or correction['newCell']!='(1, 1)' or correction['cell']!='B/Y':
        raise ValueError('MICRO49_MATRIX_SEMANTIC_MISMATCH')
    reader=PdfReader(contained(meta['visualSourcePath']))
    objects=[o.get_object() for o in reader.pages[0]['/Resources']['/XObject'].values()]
    matches=[o for o in objects if hashlib.sha256(o.get_data()).hexdigest()==ORIGINAL]
    if len(matches)!=1:raise ValueError('MICRO49_MATRIX_ORIGINAL_MISSING')
    data=derive(matches[0].get_data())
    if hashlib.sha256(data).hexdigest()!=meta['graphDecodedSha256'] or meta['graphDecodedSha256']!=correction['derivedDecodedSha256']:
        raise ValueError('MICRO49_MATRIX_DERIVATION_DRIFT')
    return data

def apply(reader,meta):
    data=validate(meta)
    objects=reader.pages[0]['/Resources']['/XObject'];found=0
    for key,ref in list(objects.items()):
        obj=ref.get_object()
        if hashlib.sha256(obj.get_data()).hexdigest()!=ORIGINAL:continue
        if obj.get('/ColorSpace')!='/DeviceRGB' or obj.get('/BitsPerComponent')!=8:
            raise ValueError('MICRO49_MATRIX_COLOR_MODEL_DRIFT')
        replacement=DecodedStreamObject()
        for k,v in obj.items():
            if k not in ('/Filter','/DecodeParms','/Length'):replacement[k]=v
        replacement.set_data(data);objects[key]=replacement.flate_encode();found+=1
    if found!=1:raise ValueError('MICRO49_MATRIX_AMBIGUOUS_USE')
