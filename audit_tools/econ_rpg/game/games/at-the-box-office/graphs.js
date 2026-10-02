/* Economic observations, not time-series bars. Every SVG has a visible numerical equivalent. */
(() => {
  'use strict';
  const money=n=>'$'+n.toLocaleString('en-US'),num=n=>n.toLocaleString('en-US');
  const escape=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  function graphData(e) {
    const own=e.kind==='price';
    const points=own?[[e.q1,e.x1],[e.q2,e.x2]]:[[e.x1,e.q1],[e.x2,e.q2]];
    const xMin=e.kind==='income'?Math.min(e.x1,e.x2)-4:0;
    const xStep=own?200:2,yStep=own?2:e.kind==='income'?100:200;
    const xMax=e.kind==='income'?Math.max(e.x1,e.x2)+4:Math.ceil(Math.max(...points.map(p=>p[0]))*1.18/xStep)*xStep;
    const yMax=Math.ceil(Math.max(...points.map(p=>p[1]))*1.22/yStep)*yStep;
    const map=([x,y])=>[60+(x-xMin)/(xMax-xMin)*290,246-y/yMax*192];
    return {points,positions:points.map(map),xMin,xMax,yMax};
  }
  function graph(e,id) {
    const own=e.kind==='price',d=graphData(e),[[ax,ay],[bx,by]]=d.positions;
    const xTitle=own?'Attendance / quantity':e.xLabel,yTitle=own?'Ticket price':'Ticket demand / attendance';
    const title=`${e.title}: ${e.label}`;
    const tick=(n,price)=>price?money(n):num(n);
    const xTicks=[d.xMin,(d.xMin+d.xMax)/2,d.xMax].map(n=>Math.round(n));
    const yTicks=[0,Math.round(d.yMax/2),Math.round(d.yMax)];
    const grid=yTicks.map(n=>{const y=246-n/d.yMax*192;return `<line class="gridline" x1="60" y1="${y}" x2="350" y2="${y}"/><text x="51" y="${y+6}" text-anchor="end">${tick(n,own)}</text>`;}).join('');
    const ticks=xTicks.map(n=>`<text x="${60+(n-d.xMin)/(d.xMax-d.xMin)*290}" y="273" text-anchor="middle">${tick(n,!own&&e.kind!=='income')}</text>`).join('');
    return `<figure class="economic-graph" data-kind="${e.kind}"><figcaption id="${id}-caption">${escape(title)}</figcaption><svg viewBox="0 0 400 318" role="img" aria-labelledby="${id}-title ${id}-desc"><title id="${id}-title">${escape(title)}</title><desc id="${id}-desc">${escape(yTitle)} on the vertical axis; ${escape(xTitle)} on the horizontal axis. A is before; B is after. Exact values appear below.${own?' Outlined rectangles show ticket price times attendance: total ticket revenue.':''}</desc><text class="axis-title" x="60" y="25">${yTitle}</text>${grid}${own?`<rect class="revenue-before" x="60" y="${ay}" width="${ax-60}" height="${246-ay}"/><rect class="revenue-after" x="60" y="${by}" width="${bx-60}" height="${246-by}"/>`:''}<path class="axes" d="M60 45V246H354"/>${ticks}<text class="axis-title" x="205" y="307" text-anchor="middle">${escape(xTitle)}</text><path class="relationship" d="M${ax} ${ay}L${bx} ${by}"/><circle class="point-before" cx="${ax}" cy="${ay}" r="7"/><rect class="point-after" x="${bx-7}" y="${by-7}" width="14" height="14"/><text class="point-label" x="${ax}" y="${ay-16}" text-anchor="middle">A</text><text class="point-label" x="${bx}" y="${by-16}" text-anchor="middle">B</text></svg>
      <dl class="observations"><div><dt>${escape(e.xLabel)}</dt><dd>${e.kind==='income'?num(e.x1):money(e.x1)} → ${e.kind==='income'?num(e.x2):money(e.x2)}</dd></div><div><dt>Attendance</dt><dd>${num(e.q1)} → ${num(e.q2)}</dd></div>${own?`<div><dt>Total ticket revenue</dt><dd>${money(e.x1*e.q1)} → ${money(e.x2*e.q2)}</dd></div>`:`<div><dt>Ticket price held fixed</dt><dd>${money(e.ticketPrice)}</dd></div>`}</dl><p class="graph-key">A ○ Before · B ■ After${own?' · Outlined areas = total ticket revenue':''}</p><p>${escape(e.interpretation)}</p><details><summary>Elasticity calculation</summary><p>Midpoint ${own?'price elasticity (absolute value)':e.kind==='cross'?'cross-price elasticity':'income elasticity'}: <strong>${(own?Math.abs(e.elasticity):e.elasticity).toFixed(2)}</strong>. Percentage changes use the average of the before and after values.${own?' The line joins these observations; it does not forecast untested prices.':''}</p></details></figure>`;
  }
  const api={graph,graphData};
  if(typeof module!=='undefined'&&module.exports)module.exports=api;else Object.assign(window.BoxOffice,api);
})();
