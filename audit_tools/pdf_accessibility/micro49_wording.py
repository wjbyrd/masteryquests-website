"""Maintained, source-bound MICRO-49 text reflow; retained artwork is unchanged."""
from pypdf.generic import ByteStringObject, ContentStream, NameObject, FloatObject


def apply(reader, source, edit):
    from tag_pilot import text_blocks
    from semantic_runs import decoded_shows
    from pypdf._cmap import get_encoding
    if source['code'] != 'MICRO-49' or edit['layout'] not in ('micro49_pure_strategy_v1','micro49_unique_nash_v2'):
        raise ValueError('Unreviewed wording layout')
    page = reader.pages[0]
    ops, blocks = text_blocks(page, reader)
    for i, (raw, _) in decoded_shows(page, ops).items():
        ops[i] = ([ByteStringObject(raw)], b'Tj')
    replacements = []
    specs = [(edit['oldText'], edit['newText'], 246, 11.7, [1,0,0,1,0,107.5], 12),
             (edit['heading']['oldText'], edit['heading']['newText'], 478, 16,
              [1,0,0,1,91.77075,313.2886], 2)]
    for old, new, limit, leading, matrix, max_lines in specs:
        matches = [b for b in blocks if b['text'] == old]
        if len(matches) != 1:
            raise ValueError('Retained MICRO-49 wording drift')
        block = matches[0]
        body = ops[block['start']:block['end']+1]
        fonts = [a for a,o in body if o == b'Tf']
        if len(fonts) != 1:
            raise ValueError('Unproven MICRO-49 font')
        name, size = fonts[0]
        font = page['/Resources']['/Font'][name].get_object()
        encoding, cmap = get_encoding(font)
        reverse = {}
        for byte in range(256):
            try:
                char = encoding.get(byte,chr(byte)) if isinstance(encoding,dict) else bytes([byte]).decode(encoding)
                char = cmap.get(char,char)
                if len(char) == 1: reverse[char] = byte
            except UnicodeError: pass
        def encode(text): return bytes(reverse[c] for c in text)
        def width(text):
            return sum(float(font['/Widths'][b-int(font['/FirstChar'])])*float(size)/1000 for b in encode(text))
        lines = []; line = ''
        for word in new.split():
            proposed = (line+' '+word).strip()
            if line and width(proposed) > limit:
                lines.append(line); line = word
            else: line = proposed
        lines.append(line)
        if old == edit['heading']['oldText'] and edit['layout']=='micro49_pure_strategy_v1':
            lines = ['WORKED EXAMPLE: FINDING', 'PURE-STRATEGY NASH EQUILIBRIA']
        if old == edit['heading']['oldText'] and edit['layout']=='micro49_unique_nash_v2':
            matrix=[1,0,0,1,91.77075,307.2886]
        if len(lines) > max_lines or any(width(line)>limit for line in lines):
            raise ValueError('MICRO-49 corrected wording exceeds reviewed layout')
        prefix = [(a,o) for a,o in body if o not in (b'BT',b'ET',b'Tm',b'TL',b'Tj',b'T*')]
        new_ops = [([],b'BT'),([FloatObject(v) for v in matrix],b'Tm')] + prefix
        new_ops.append(([FloatObject(leading)],b'TL'))
        for line in lines:
            new_ops.extend([([ByteStringObject(encode(line))],b'Tj'),([],b'T*')])
        new_ops.append(([],b'ET'))
        replacements.append((block['start'],block['end'],new_ops))
    for start,end,new_ops in sorted(replacements,reverse=True):
        ops[start:end+1] = new_ops
    stream = ContentStream(None,reader); stream.operations = ops
    page[NameObject('/Contents')] = stream
