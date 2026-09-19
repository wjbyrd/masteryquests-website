"""Extend existing Arimo subsets; preserve all existing glyphs and metrics.

Only missing Unicode glyph outlines are adapted from the openly licensed
DejaVu Sans distribution. No system font or complete third-party font is copied.
"""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.ttGlyphPen import TTGlyphPen
from fontTools.pens.transformPen import TransformPen
from fontTools.pens.recordingPen import DecomposingRecordingPen
import matplotlib,shutil

def build():
    base=Path('audit_tools/pdf_accessibility/canonical_components')
    fonts=Path(matplotlib.get_data_path())/'fonts/ttf';donor=TTFont(fonts/'DejaVuSans.ttf')
    for role in ['regular','bold']:
        f=TTFont(base/(role+'-unicode.ttf'));cmap=f.getBestCmap();order=list(f.getGlyphOrder())
        for cp in [215,233,949,8211,8212,8216,8217,8220,8221,8722]:
            if cp in cmap:continue
            name='finalQA'+str(cp);pen=TTGlyphPen(None);ratio=f['head'].unitsPerEm/donor['head'].unitsPerEm
            recording=DecomposingRecordingPen(donor.getGlyphSet());donor.getGlyphSet()[donor.getBestCmap()[cp]].draw(recording)
            recording.replay(TransformPen(pen,(ratio,0,0,ratio,0,0)))
            f['glyf'].glyphs[name]=pen.glyph();f['hmtx'][name]=tuple(round(v*ratio) for v in donor['hmtx'][donor.getBestCmap()[cp]]);order.append(name)
            for table in f['cmap'].tables:
                if table.isUnicode():table.cmap[cp]=name
        f.setGlyphOrder(order);f.save(base/(role+'-math.ttf'))
    shutil.copyfile(fonts/'LICENSE_DEJAVU',base/'LICENSE_DEJAVU.txt')

if __name__=='__main__':build()
