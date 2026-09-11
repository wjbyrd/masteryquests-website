"""Pinned, embeddable fonts and the shared later-layout heading colour.

Bitstream Vera is supplied by ReportLab 4.4.9 under its redistribution licence.
No Windows font lookup or silent fallback is permitted. Hashes bind the actual
font programs and accompanying copyright notice, not a machine installation.
"""
from pathlib import Path
import hashlib
import reportlab
from reportlab.pdfbase import pdfmetrics
from reportlab.pdfbase.ttfonts import TTFont

REGULAR = 'MQVera'
BOLD = 'MQVera-Bold'
HEADING_COLOR = '#007C82'
FONT_HASHES = {
    'Vera.ttf': 'c4c45690b345435b2cba52ecabe275f05e49b389b39fe68ad03afbb551288d3d',
    'VeraBd.ttf': 'cc037385e4d55bfde89b13e03091ee93bf40c0c52ddd391ff031ab276f13b8e9',
    'bitstream-vera-license.txt': '3361d054759a2fc686a2c058be82deaf9c2e6fe549be9004d7935a6c1736315d',
}

def register_fonts():
    if reportlab.Version != '4.4.9':
        raise ValueError('Review font/layout validation before changing ReportLab 4.4.9')
    directory = Path(reportlab.__file__).parent / 'fonts'
    for name, expected in FONT_HASHES.items():
        if hashlib.sha256((directory / name).read_bytes()).hexdigest() != expected:
            raise ValueError('Unreviewed font dependency: ' + name)
    for name, filename in ((REGULAR, 'Vera.ttf'), (BOLD, 'VeraBd.ttf')):
        if name not in pdfmetrics.getRegisteredFontNames():
            pdfmetrics.registerFont(TTFont(name, str(directory / filename)))
    return directory

def contrast(foreground, background):
    def luminance(value):
        rgb = [int(value[i:i+2], 16)/255 for i in (1, 3, 5)]
        linear = [x/12.92 if x <= .04045 else ((x+.055)/1.055)**2.4 for x in rgb]
        return sum(a*b for a,b in zip(linear, (.2126,.7152,.0722)))
    a,b = sorted((luminance(foreground), luminance(background)))
    return (b+.05)/(a+.05)
