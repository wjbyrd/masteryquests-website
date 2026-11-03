'use strict';
const {expandedIds,sampleIds}=require('./read-selection.json'),read=new Set([...expandedIds,...sampleIds]);
module.exports=({items,decisions,keep})=>{for(const item of items)if(!decisions.has(item.id))keep([item.id],read.has(item.id)?'Read the question and all choices as an expanded screening candidate or deterministic topic sample; retain its current wording.':'Passed the full-pool editorial screen. Related topic samples and repeated families were reviewed; no targeted wording change was indicated.');};
