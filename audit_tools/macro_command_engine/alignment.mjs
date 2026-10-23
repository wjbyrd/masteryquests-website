import fs from 'node:fs';
import assert from 'node:assert/strict';

// Macro-only presentation adapter. Shared Composer/accessibility sources stay read-only.
export function alignMacroPresentation(html){
  assert(html.includes('</head>') && html.includes('</body>'), 'Macro document boundaries missing');
  const css=fs.readFileSync(new URL('./alignment.css',import.meta.url),'utf8').replace(/\r\n/g,'\n');
  const script=fs.readFileSync(new URL('./alignment.js',import.meta.url),'utf8').replace(/\r\n/g,'\n');
  return html.replace('</head>',`<!-- Macro Managerial presentation alignment -->\n<style>\n${css}</style>\n</head>`)
    .replace('</body>',`<script>\n${script}</script>\n</body>`);
}
