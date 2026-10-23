import fs from 'node:fs';
import assert from 'node:assert/strict';
import {macroThemeCss} from './visual-identity.mjs';

// Macro-only presentation adapter. Shared Composer/accessibility sources stay read-only.
export function alignMacroPresentation(html,game){
  assert(html.includes('</head>') && html.includes('</body>'), 'Macro document boundaries missing');
  const css=fs.readFileSync(new URL('./alignment.css',import.meta.url),'utf8').replace(/\r\n/g,'\n');
  const visualCss=macroThemeCss(game);
  assert(html.includes('<body class="blank-builder-template">'), 'Macro theme body missing');
  html=html.replace('<body class="blank-builder-template">',`<body class="blank-builder-template ${game}">`);
  const script=fs.readFileSync(new URL('./alignment.js',import.meta.url),'utf8').replace(/\r\n/g,'\n');
  return html.replace('</head>',`<!-- Macro Managerial presentation alignment -->\n<style>\n${css}${visualCss}</style>\n</head>`)
    .replace('</body>',`<script>\n${script}</script>\n</body>`);
}
