import fs from 'node:fs';
import assert from 'node:assert/strict';

const themes=JSON.parse(fs.readFileSync(new URL('./themes.json',import.meta.url),'utf8'));
const shared=fs.readFileSync(new URL('./visual-identity.css',import.meta.url),'utf8').replace(/\r\n/g,'\n');
const paint=/^(color|background-color|background-image|border-(?:color|(?:top|right|bottom|left)-color)|outline-color|box-shadow|text-shadow|filter)$/;
const declarations=(values,animation=false)=>Object.entries(values).map(([property,value])=>{
  assert(paint.test(property)||(animation&&['transform','opacity'].includes(property)),`Non-presentation theme property: ${property}`);
  assert(!/[{};]|url\(/i.test(value),`Invalid theme value: ${property}`);
  return `${property}:${value};`;
}).join('');

// Explicit per-game recipes, not a color-token replacement across generated HTML.
// Historical paint is layered over common layout. Modern components use that
// same game's variables. Scripts, artwork URLs and functional selectors stay put.
export function macroThemeCss(game){
  const theme=themes.games[game];
  assert(theme,`Missing individual Macro theme: ${game}`);
  let css=`\n/* ${game}: ${theme.name}; historical reference ${themes.reference}. */\n:root{`;
  for(const [key,value] of Object.entries(theme.variables)){
    assert(!/[{};]/.test(value),`Invalid theme variable: ${key}`);
    css+=`--mq-${key}:${value};`;
  }
  css+='}\n'+shared+'\n';
  for(const rule of theme.historicalPaint){
    let output=`${rule.selector}{${declarations(rule.declarations)}}`;
    for(const media of [...(rule.media||[])].reverse())output=`${media}{${output}}`;
    css+=output+'\n';
  }
  // Geometry/opacity are frozen from the approved alignment; only paint comes
  // from the corresponding historical animation. Timing remains in shared CSS.
  for(const animation of theme.animations)css+=`${animation.group}{${animation.rules.map(frame=>`${frame.selector}{${declarations(frame.declarations,true)}}`).join('')}}\n`;
  css+='body :focus-visible{outline-color:var(--mq-focus)}\n';
  return css;
}
