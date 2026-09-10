import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const directory=path.join(root,'how-to/telemetry-data-dictionary');
const {fields}=JSON.parse(fs.readFileSync(path.join(directory,'fields.json'),'utf8'));
const esc=s=>s.replaceAll('&','&amp;').replaceAll('<','&lt;').replaceAll('"','&quot;');
const categories=[...new Set(fields.map(f=>f.category))];const slug=s=>s.toLowerCase().replace(/[^a-z]+/g,'-');
const tables=categories.map(c=>`<section class="dictionary-category" id="${slug(c)}"><h2>${esc(c)}</h2><div class="table-scroll" role="region" aria-label="${esc(c)} fields" tabindex="0"><table><caption>${esc(c)} — ${fields.filter(f=>f.category===c).length} fields</caption><thead><tr><th scope="col">Field / type</th><th scope="col">Meaning / when populated</th><th scope="col">Interpretation / caution</th></tr></thead><tbody>${fields.filter(f=>f.category===c).map(f=>`<tr data-field="${f.name}" id="field-${f.name}"><th scope="row"><code>${f.name}</code><span>${esc(f.type)}</span>${f.technical?'<small>Technical / QA</small>':''}</th><td>${esc(f.definition)}<p><strong>When:</strong> ${esc(f.events)}</p><p><strong>Values:</strong> ${esc(f.possibleValues)}</p></td><td>${esc(f.notes)}<p><strong>Blank:</strong> ${esc(f.blankMeaning)}</p><p><strong>Zero:</strong> ${esc(f.zeroMeaning)}</p><p class="caution">${esc(f.caution)}</p></td></tr>`).join('')}</tbody></table></div></section>`).join('\n');

const pagePath=path.join(directory,'index.html');
const page=fs.readFileSync(pagePath,'utf8');
const start=page.indexOf('<div id="field-categories">')+'<div id="field-categories">'.length;
const end=page.indexOf('</div></section></div></main>',start);
if(start<26||end<0)throw new Error('Dictionary render boundary changed');
const next=page.slice(0,start)+tables+page.slice(end);
if(process.argv.includes('--check')){if(next!==page)throw new Error('Rendered fields are stale. Run render.mjs.');console.log('Rendered inventory: PASS');}else fs.writeFileSync(pagePath,next);
