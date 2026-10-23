import assert from 'node:assert/strict';

// Macro-only palette adapter. Map complete color tokens in stylesheet blocks,
// including hover/focus and animated glows; never rewrite scripts, SVGs or assets.
// Gold/bronze and charcoal references come from the pre-alignment National Engine
// and Mint presentations at a0f1dea1889ce9ccfa4c27e57fd3c82d225c85c5.
const colors = new Map(Object.entries({
  '38bdf8':'d6b15c', '0ea5e9':'b98242', '8bdcff':'f4d58d',
  'f7d982':'f4d58d', 'c7ecff':'d8c7a0', 'eef6ff':'f3ead2',
  'e0f2fe':'eadfc5', 'bae6fd':'e2c286', 'f8fbff':'fff5df',
  'eaf7ff':'f3ead2', 'f7fbff':'fff5df', 'e5e7eb':'e9e2d2',
  '020617':'080907', '0b2238':'24291f', '0f2a40':'2b2a21',
  '030a18':'0b0c09', '06101d':'0d0e0b', '17324d':'342b20',
  '1d4d73':'61472b', '133956':'443b29', '0f172a':'171711',
  '04101f':'10120f', '040e1c':'10110d', '07111f':'11120e',
  '020812':'080a07', '020814':'090b08', '12304f':'382e21',
  '08182a':'1c1d15', '020a18':'0b0d09', '343870':'655033',
  '0e1234':'241c12', 'a5b4fc':'d8b981', '1e3a58':'393629',
  '1e4e6e':'695232', '082138':'24241b',
  '24628f':'78582f', '061426':'14160f', '111827':'191b14',
  '0d3642':'303f2f', '102a43':'282c20', '143853':'3a3325',
  '030c19':'0c0e09', '051122':'13160f', '020712':'090b07',
  '091f33':'23291d', '041223':'171b12', '07111e':'11130e',
  '100a1c':'1c130c', '2dd4bf':'bba365', '5eead4':'d9c189'
}).map(([from,to])=>[from.toLowerCase(),to]));
const rgb = hex => hex.match(/../g).map(channel=>parseInt(channel,16));
const rgbColors = new Map([...colors].map(([from,to])=>[rgb(from).join(','),rgb(to).join(',')]));

export function restoreMacroPalette(html){
  let blocks = 0;
  const restored = html.replace(/(<style\b[^>]*>)([\s\S]*?)(<\/style>)/gi,(_,open,css,close)=>{
    blocks++;
    const warm = css.replace(/#[\da-f]{6}\b|rgba?\(\s*\d+\s*,\s*\d+\s*,\s*\d+(?:\s*,\s*[\d.]+)?\s*\)/gi,token=>{
      if(token.startsWith('#')) return colors.has(token.slice(1).toLowerCase()) ? '#'+colors.get(token.slice(1).toLowerCase()) : token;
      const channels = token.match(/[\d.]+/g);
      const replacement = rgbColors.get(channels.slice(0,3).join(','));
      return replacement ? `${token.startsWith('rgba')?'rgba':'rgb'}(${replacement}${channels.length===4?','+channels[3]:''})` : token;
    });
    return open+warm+close;
  });
  assert(blocks>=4, 'Macro stylesheets missing; visual palette was not applied');
  return restored;
}
