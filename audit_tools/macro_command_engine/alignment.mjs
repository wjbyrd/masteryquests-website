import fs from 'node:fs';
import assert from 'node:assert/strict';
import {restoreMacroPalette} from './visual-identity.mjs';

// Macro-only presentation adapter. Shared Composer/accessibility sources stay read-only.
export function alignMacroPresentation(html){
  assert(html.includes('</head>') && html.includes('</body>'), 'Macro document boundaries missing');
  const css=fs.readFileSync(new URL('./alignment.css',import.meta.url),'utf8').replace(/\r\n/g,'\n');
  const visualCss=fs.readFileSync(new URL('./visual-identity.css',import.meta.url),'utf8').replace(/\r\n/g,'\n');
  const script=fs.readFileSync(new URL('./alignment.js',import.meta.url),'utf8').replace(/\r\n/g,'\n');
  return restoreMacroPalette(html.replace('</head>',`<!-- Macro Managerial presentation alignment -->\n<style>\n${css}${visualCss}</style>\n</head>`)
    .replace('</body>',`<script>\n${script}</script>\n</body>`));
}
