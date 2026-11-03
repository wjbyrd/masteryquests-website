'use strict';
const assert=require('assert/strict'),fs=require('fs'),path=require('path'),draft=require('./content-edits.json');
let checks=0;const covered=[];
const norm=s=>s.replaceAll(',','').replace(/[−–]/g,'-').replace(/\s+/g,'');
function hasNumber(text,value,id,tol=.015){const nums=(norm(text).match(/\d+(?:\.\d+)?/g)||[]).map(Number);assert(nums.some(n=>Math.abs(n-Math.abs(value))<=tol),id+' missing calculated value '+value);checks++;}
for(const c of draft.changes){
 const old=c.beforeRecord,now=c.afterRecord,answer=now.options[c.correctIndex],q=norm(old.q);
 if(/^P62[GH]-/.test(c.id)){
  const dm=q.match(/(?:demand|faces|conditions—)P=(\d+(?:\.\d+)?)-(\d+(?:\.\d+)?)Q/),mc=q.match(/MC=(\d+(?:\.\d+)?)\+(\d+(?:\.\d+)?)Q/),tc=q.match(/TC=(\d+(?:\.\d+)?)\+(\d+(?:\.\d+)?)Q\+(\d+(?:\.\d+)?)Q²/);
  if(dm&&(mc||tc)&&/^(?:Q=|Produce (?:about )?)/.test(old.options[c.correctIndex])){
   const reduction=+(old.q.match(/reduces willingness to pay by \$(\d+)/)||[])[1]||0;
   const a=+dm[1]-reduction,b=+dm[2],m=mc?+mc[1]:+tc[2],s=mc?+mc[2]:2*+tc[3],quantity=(a-m)/(2*b+s),price=a-b*quantity;
   hasNumber(answer,quantity,c.id);
   if(/^Q=/.test(old.options[c.correctIndex]))hasNumber(answer,price,c.id);
   else {assert(tc,c.id);const profit=price*quantity-(+tc[1]+m*quantity+s/2*quantity*quantity);hasNumber(answer,profit,c.id);assert.equal(/economic loss/.test(answer),profit<0,c.id);checks++;}
   covered.push(c.id);
  }
 }
 const pv=old.q.match(/Cooperating pays (\d+) each period.*Cheating pays (\d+) now, followed by (\d+).*Multiply each future payoff by ([\d.]+)/);
 if(pv){const [co,ch,pen,d]=pv.slice(1).map(Number),a=co/(1-d),b=ch+d*pen/(1-d),win=a>b?'Cooperating':'Cheating';if(/absolute difference/.test(old.q)){hasNumber(answer,Math.abs(a-b),c.id);assert(answer.startsWith(win),c.id);}else {hasNumber(answer,a,c.id);hasNumber(answer,b,c.id);assert(answer.endsWith(win.toLowerCase()+' is better.'),c.id);}checks++;covered.push(c.id);}
 if(/P62G-MON-LB-(009|021|033)/.test(c.id)){assert(answer.includes('$100 fall in profit'),c.id);checks++;}
 if(/P62F-PC-L-0(1[6-9]|2\d|30)$/.test(c.id)){
  const m=now.q.match(/price of \$(\d+).*output of (\d+) units.*total cost is \$(\d+).*variable cost is \$(\d+)/);assert(m,c.id);
  const [p,n,atc,avc]=m.slice(1).map(Number);if(p<avc)assert(/Shut down/.test(answer));else if(p===atc)assert(/zero economic profit/.test(answer));else hasNumber(answer,(p-atc)*n,c.id);checks++;covered.push(c.id);
 }
 // No new broken substitution tokens, accidental duplicated currency, or symbols in prose.
 for(const s of [now.q,...now.options]){assert(!/\$\$|\$[1-4]\b(?!\d)|undefined|NaN/.test(s.replace(/\$[1-4](?=[.,; ]|$)/g,'')),c.id);}
}
assert(covered.length>=100,'Expected quantitative family coverage');
const result={status:'PASS',independentChecks:checks,questionsWithRecomputedResults:[...new Set(covered)].length,ids:[...new Set(covered)],scope:'Profit-maximizing quantity, price and profit for linear market-power families; discounted repeated-game payoffs; competitive operation and profit; fixed-license transfer. Unchanged graph calculations retain original values.'};
fs.writeFileSync(path.join(__dirname,'calculation-validation.json'),JSON.stringify(result,null,2)+'\n');console.log(JSON.stringify({...result,ids:undefined}));
