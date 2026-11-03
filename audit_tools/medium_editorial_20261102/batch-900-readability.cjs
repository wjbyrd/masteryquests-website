'use strict';
const {expandedIds,sampleIds}=require('./read-selection.json'),read=new Set([...expandedIds,...sampleIds]);
const terms={MPC:'marginal propensity to consume',NCO:'net capital outflow',NX:'net exports',AD:'aggregate demand',SRAS:'short-run aggregate supply',LRAS:'long-run aggregate supply',SRPC:'short-run Phillips curve',LRPC:'long-run Phillips curve'};
const expand=s=>{
 // Keep labeled equations and graph labels such as AD1, S0 and P = 42 intact.
 if(!/[=]/.test(s))s=s.replace(/\b(MPC|NCO|NX|AD|SRAS|LRAS|SRPC|LRPC)\b/g,m=>terms[m]);
 s=s.replace(/\ban marginal propensity/g,'a marginal propensity').replace(/\bMR=marginal cost\b/g,'marginal revenue equals marginal cost').replace(/\bP<ATC\b/g,'price is below average total cost').replace(/\bP<AVC\b/g,'price is below average variable cost').replace(/\bP>ATC\b/g,'price exceeds average total cost').replace(/\bP>AVC\b/g,'price exceeds average variable cost');
 return s.replace(/^[a-z]/,m=>m.toUpperCase());
};
module.exports=({items,decisions,refine})=>{for(const item of items){const d=decisions.get(item.id);if(!read.has(item.id)&&d?.action!=='revise')continue;const current={...item.question,...d?.patch};const patch={};const q=expand(current.q),options=current.options.map(expand);if(q!==current.q)patch.q=q;if(JSON.stringify(options)!==JSON.stringify(current.options))patch.options=options;if(Object.keys(patch).length)refine(item.id,patch,'Spell out economic abbreviations in prose while retaining equations and numbered graph labels.');}};
