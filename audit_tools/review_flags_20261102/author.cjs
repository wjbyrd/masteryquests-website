'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict'),crypto=require('crypto');
const root=path.resolve(__dirname,'../..'),core=require(path.join(root,'build/faculty-build-composer/composer-core.js'));
const inventory=require('./inventory.json'),sha=s=>crypto.createHash('sha256').update(s).digest('hex');
const content={
 'ECON-SP-EASYBOSS-2011':{
  q:'A central bank sells bonds and removes $20 million of bank reserves. In the simple deposit-expansion model, the money multiplier is 5. What is the maximum change in bank deposits?',
  options:['Deposits decrease by $100 million.','Deposits decrease by $20 million.','Deposits decrease by $4 million.','Deposits increase by $100 million.'],
  feedback:'Multiply the reserve change by the multiplier: $20 million × 5 = $100 million. Removing reserves reduces the deposits the banking system can support, so deposits decrease. This simple model assumes banks lend all available excess reserves and the money is redeposited.',
  reason:'Keep the Easy boss at Easy: use one direct multiplication and the direction of the reserve change, with a shorter stem and choices.'
 },
 '42196':{
  q:'The graph shows the North and South neighborhoods’ marginal benefits and their combined marginal benefit (MSB), before a third neighborhood is counted. The third neighborhood gains $10,000 from each additional fireworks display. Marginal cost stays at $50,000 per display. Treat quantity as continuous. What is the new efficient quantity, and how should the third neighborhood’s benefit be added?',
  feedback:'At five displays, North’s marginal benefit is $25,000 and South’s is $15,000, so their combined benefit is $40,000. Adding the third neighborhood’s $10,000 brings marginal social benefit to the $50,000 marginal cost. Total marginal benefit exceeds cost below five displays and falls below cost above five. Add benefits vertically because all neighborhoods enjoy the same displays.',
  image:'question-assets/market-failures/PUBLIC-04-ELITE-20261102.webp',
  imageAlt:'Baseline fireworks graph with North and South marginal benefits, their combined MSB, and marginal cost. Quantity is labeled every display and dollar values every $10,000.',
  graphDescription:'The horizontal axis is community fireworks displays per summer, from zero to ten with every whole number labeled. The vertical axis is marginal benefit and cost in thousands of dollars per display, from zero to 100 with every ten labeled. North MB equals max(0, 50−5Q); South MB equals max(0, 40−5Q). The baseline MSB curve adds these vertically. MC is constant at 50. The third neighborhood is not included in the plotted MSB.',
  reason:'Clarify that the graph is the two-neighborhood baseline and provide a dedicated graph with explicit one-display and $10,000 ticks. Preserve the original graph for other questions.'
 },
 'LG-Q-336':{
  q:'The graph shows the value of money (1/P) falling from point a to point b. Nominal wages rise by the same percentage as the implied price level. Technology and labor supply are unchanged. Which change in prices and wages is consistent with monetary neutrality?',
  feedback:'The value of money is 2 at a and 1.5 at b. The corresponding price levels are 1/2 and 2/3, so prices rise by one-third. Nominal wages also rise by one-third, leaving the real wage unchanged. These nominal changes do not increase real productive capacity.',
  reason:'Remove the distracting velocity premise and discussion while retaining the reciprocal-price calculation and nominal-versus-real interpretation.'
 },
 'P62G-MON-EL-038':{
  q:'For the monopolist in the graph, identify the price under each arrangement, in this order: no regulation, average-cost pricing, and marginal-cost pricing. Which answer gives those three prices and correctly explains the difference between the two regulatory rules?',
  reason:'Rewrite the stem as one explicit question with the required ordering. Preserve the approved graph, choices, answer, and explanation.'
 },
 'P62I-OLI-EL-029':{
  q:'An oligopolistic industry is dominated by a few large firms. A policy encouraging their research partnerships is expected to generate $500 million in innovation benefits, but also to increase deadweight loss from market power by $80 million per year for four years. The additional research uses $100 million in real resources. Ignore discounting and other effects. Which welfare comparison and evidentiary limit follow?',
  reason:'Keep the innovation-versus-competition tradeoff in its Oligopoly topic and make the few-firm context explicit. Replace the misleading monopoly-specific wording.'
 }
};
const dispositions=[],changes=[];
for(const item of inventory.items){
 const id=item.id,before=item.question,after=structuredClone(before),note=item.review.notes.trim().toLowerCase();let target=null,reason='';
 if(note.includes('legendary')){target='legendary';reason='Instructor places this mathematical workload in Legendary; includes the ten tentative monopolistic-competition recommendations in the authorized outstanding-flag pass.';}
 else if(note==='medium'||note==='hard'){target=note;reason='Apply the instructor’s explicit difficulty classification.';}
 else {assert(content[id],'Unaddressed flag '+id);reason=content[id].reason;}
 if(target){after.canonicalDifficulty=target;if(before.instructionalRole==='boss'&&!before.isCheckpointChallenge){after.checkpointPool=before.checkpointPool||({easy:'easyBoss',medium:'mediumBoss',hard:'finalBoss',legendary:'legendaryBoss'}[before.canonicalDifficulty]);assert(after.checkpointPool,id);}}
 if(content[id])for(const [k,v]of Object.entries(content[id]))if(k!=='reason')after[k]=v;
 const correctIndex=before.options.findIndex(o=>sha(core.normalizeAnswerText(o))===before.aHash);assert(correctIndex>=0,id);
 after.aHash=sha(core.normalizeAnswerText(after.options[correctIndex]));assert.equal(new Set(after.options.map(core.normalizeAnswerText)).size,4);
 const fields=Object.keys(after).filter(k=>core.stableStringify(after[k])!==core.stableStringify(before[k]));assert(fields.length,id);
 changes.push({id,beforeRecord:before,afterRecord:after,correctIndex,fields,reason});dispositions.push({id,topic:item.topic,note:item.review.notes,targetDifficulty:target,reason});
}
assert.equal(changes.length,54);assert.equal(dispositions.filter(d=>d.targetDifficulty==='legendary').length,41);assert.equal(dispositions.filter(d=>d.targetDifficulty==='medium').length,6);assert.equal(dispositions.filter(d=>d.targetDifficulty==='hard').length,2);assert.equal(Object.keys(content).length,5);
fs.writeFileSync(path.join(__dirname,'content-edits.json'),JSON.stringify({schemaVersion:1,beforeLibrarySha256:inventory.beforeLibrarySha256,dispositions,changes},null,2)+'\n');
console.log(JSON.stringify({changes:changes.length,reclassifications:49,contentFixes:5}));
