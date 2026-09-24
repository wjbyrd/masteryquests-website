const fs=require('node:fs');
const game='audit_tools/econ_rpg/game/games/the-long-run/index.html';
const hub='audit_tools/econ_rpg/game/games/index.html';
for(const [file,backup] of [[game,'tmp/the-long-run-pre-instructional-ux.html'],[hub,'tmp/the-long-run-hub-before.html']]){if(fs.existsSync(backup))throw Error('Backup already exists');fs.copyFileSync(file,backup);}
let s=fs.readFileSync(game,'utf8');
function replace(a,b){if(!s.includes(a))throw Error('Missing '+a);s=s.replace(a,b);}
replace('background:#2c4351;border-top:1px solid #a0b4af','background:#243e50;border-top:1px solid #a0b4af');
replace('background:#3c5569;border:1px solid #819b9d;border-radius:0;padding:10px 12px;color:#dce5da','background:#405e75;border:1px solid #8ba7ba;border-radius:0;padding:14px 15px;color:#f5f8fb');
replace('.callout p{font-size:.75rem;line-height:1.5;margin:0}', '.callout p{font-family:system-ui,-apple-system,"Segoe UI",sans-serif;font-size:.9375rem;line-height:1.5;margin:0}');
replace('.callout{padding:8px;max-width:none}.callout p{font-size:.68rem}', '.callout{max-width:none}');
replace('.callout strong{font-size:.61rem}.callout p{font-size:.69rem}', '.callout strong{font-size:.69rem}');
replace('.transfer{margin-top:24px;padding:18px;border:1px solid var(--line);border-radius:12px;background:var(--panel)}.transfer h3{margin-top:0}.transfer p{line-height:1.5}.transfer-options{display:flex;gap:9px}.transfer-options button{flex:1;text-align:left;font-size:.84rem}', '.concept-year{display:block;color:var(--accent);font-size:.75rem;font-weight:850;letter-spacing:.1em;margin-bottom:8px}.transfer{margin-top:28px;padding:22px;border:2px solid #719eae;border-radius:12px;background:#142f47}.transfer-kicker{display:block;color:var(--accent);font-size:.75rem;font-weight:850;letter-spacing:.12em;margin-bottom:9px}.transfer h3{margin-top:0}.transfer p{line-height:1.55}.transfer .transfer-question{font-size:1.0625rem;max-width:850px;margin-bottom:20px}.transfer-options{display:flex;gap:12px}.transfer-options button{flex:1;text-align:left;font-size:.9375rem;line-height:1.5;padding:14px;background:#183a55}.transfer-options button:hover:not(:disabled){background:#254e6c}.transfer-options button[aria-pressed="true"]{border-color:var(--accent)}');
replace('.model-note{font-size:.75rem;line-height:1.5;color:var(--muted);margin:17px 0 0}', '');
const start=s.indexOf('function economicExplanations()'),end=s.indexOf('function transferQuestion()',start);
const old=s.slice(start,end);
// Keep the existing explanation wording; attach one record per actual initiating choice.
let changed=old.replace('const f=economy.flags,items=[];', `const f=economy.flags,items=[];
  const add=(ids,title,text,includeLags=false)=>{
    for(const entry of economy.history.filter(entry=>ids.includes(entry.choice?.id))){
      const affected=includeLags?economy.history.filter(year=>year.events.some(event=>event.sourceYear===entry.year&&event.id===entry.choice.id)).map(year=>year.year):[];
      items.push({yearStart:entry.year,yearEnd:Math.max(entry.year,...affected),title,text,order:items.length});
    }
  };
  `);
const mappings=[['Demand shocks',"['confidence','housing-boom']"],['Short-run aggregate supply',"['energy','commodities']"],['Fiscal expansion and crowding out',"['fiscal-expand']"],['Fiscal contraction',"['fiscal-contract']"],['Monetary policy and lags',"['rate-cut','rate-hike']"],['Productivity and long-run supply',"['breakthrough','infrastructure']"],['Stabilization tradeoffs',"['support','control']"]];
for(const [title,ids] of mappings){const re=new RegExp("items\\.push\\(\\['"+title+"',([\\s\\S]*?)\\]\\);");if(!re.test(changed))throw Error('Missing explanation '+title);changed=changed.replace(re,(_,text)=>`add(${ids},'${title}',${text}${['Monetary policy and lags','Productivity and long-run supply'].includes(title)?',true':''});`);}
changed=changed.replace("items.push(['Long-run adjustment',", "items.push({yearStart:6,yearEnd:6,through:true,order:items.length,title:'Long-run adjustment',text:").replace("new policy.']);return items;}","new policy.'});return items.sort((a,b)=>a.yearStart-b.yearStart||a.yearEnd-b.yearEnd||a.order-b.order);}\n");
if(changed.includes('items.push(['))throw Error('Unconverted explanation');
s=s.slice(0,start)+changed+s.slice(end);
replace('economicExplanations().map(([title,text])=>`<article><h4>${title}</h4><p>${esc(text)}</p></article>`)', 'economicExplanations().map(({yearStart,yearEnd,through,title,text})=>`<article><span class="concept-year">${through?`THROUGH YEAR ${yearEnd}`:yearStart===yearEnd?`YEAR ${yearStart}`:`YEARS ${yearStart}–${yearEnd}`}</span><h4>${title}</h4><p>${esc(text)}</p></article>`)');
replace('<section class="transfer"><h3>Can you use it somewhere else?</h3><p>${transfer.prompt}</p>', '<section class="transfer" aria-labelledby="transfer-title"><span class="transfer-kicker">TRANSFER CHALLENGE</span><h3 id="transfer-title">Can you use it somewhere else?</h3><p class="transfer-question">${transfer.prompt}</p>');
replace('<div class="end-actions">','<div id="end-actions" class="end-actions" hidden>');
replace('<p class="model-note">This deterministic teaching model illustrates introductory relationships. Its indices and rates are not forecasts. Inflation is the yearly change in the price level; the graph shows the cumulative price level.</p>', '');
replace("feedback.focus();$('#announcement').textContent=feedback.textContent;", "$('#end-actions').hidden=false;feedback.focus();$('#announcement').textContent=feedback.textContent;");
fs.writeFileSync(game,s);
let h=fs.readFileSync(hub,'utf8');
const card=`      <article class="game-card" data-game="the-long-run" aria-labelledby="the-long-run-title">
        <img src="../art/scenes/the-long-run/the-long-run.webp" alt="Pixel-art city with a factory, bank, shops, pedestrians and cars." width="960" height="720" loading="lazy">
        <div class="game-card-copy"><h2 id="the-long-run-title">The Long Run</h2><p>Shape economic shocks and policy responses across six years, then watch output, inflation, employment, investment, and the city itself respond to the choices you set in motion.</p><a href="./the-long-run/" aria-label="PLAY GAME: The Long Run">PLAY GAME</a></div>
      </article>
`;
h=h.replace('    </div>\n    <footer>',card+'    </div>\n    <footer>').replace('    </div>\r\n    <footer>',card.replaceAll('\n','\r\n')+'    </div>\r\n    <footer>');
if(!h.includes('data-game="the-long-run"'))throw Error('Hub insertion failed');
fs.writeFileSync(hub,h);
