'use strict';
const displayTime=value=>value==null?'Not available':MQAnswerAnalysis.responseDuration(value);
const runTime=value=>value==null?'Not available':MQAnswerAnalysis.duration(value);
const outcomeLabel={successful:'Successful completion',early:'Ended early',unsuccessful:'Unsuccessful ending',unknown:'Unknown'};
let questionScope=null,questionPage=0;
const questionPageSize=25;
function note(text){return el('p',text,'meta');}
function unavailable(text){return el('p',text,'not-available');}
function bar(value,total){const track=el('span','','bar-track'),fill=el('span','','bar-fill');track.setAttribute('aria-hidden','true');fill.style.width=(total?Math.min(100,100*value/total):0)+'%';track.append(fill);return track;}
function accuracyCell(g){const node=el('div',g.knownCorrectness?`${percent(g.correct,g.knownCorrectness)} · ${g.correct}/${g.knownCorrectness}`:'Not available','rate');if(g.knownCorrectness)node.append(bar(g.correct,g.knownCorrectness));return node;}
function metric(label,value,detail='',primary=false){const node=el('div','','metric'+(primary?' primary':''));node.append(el('strong',String(value)),el('span',label));if(detail)node.append(el('small',detail));return node;}
function panel(id,title){const node=byId(id);node.replaceChildren(el('h2',title));return node;}
function fold(label,...children){const node=el('details','');node.append(el('summary',label),...children);return node;}
function smallTable(headers,rows){const node=table(headers,rows);node.classList.add('compact-table');return node;}
function renderDashboard(){
  const o=summary.overview,p=summary.progression,coverage=summary.coverage;
  const node=panel('overview','How is the class performing?'),metrics=el('div','','metrics');
  metrics.append(metric('Overall accuracy',percent(o.correct,o.knownCorrectness),`${o.correct} / ${o.knownCorrectness} graded responses`,true),
    metric('Answered responses',summary.stats.included,'Accepted responses in this selection'),metric('Question versions',o.questions,'Distinct saved versions'),metric('Represented runs',o.runs,'Runs are not unique students'),
    metric('Median response time',displayTime(o.medianResponseTimeMs),`Mean ${displayTime(o.averageResponseTimeMs)} · ${o.timedResponses} timed`,true),
    metric('Successful completion',p.successfulRate===null?'Not available':percent(p.successful,p.represented),`${p.successful} / ${p.represented} runs · ${p.unknown} unknown`));
  node.append(metrics);
  if(!summary.stats.included)node.append(unavailable('No usable responses match this selection. Reset filters or add exports with saved question details.'));
  const difficulty=panel('difficulty','Performance by difficulty');
  const reliable=summary.difficulties.filter(g=>g.label!=='Unknown').reduce((n,g)=>n+g.count,0);
  difficulty.append(note(`${reliable} of ${summary.stats.included} responses have verifiable authored difficulty. Mode is never used to classify a question.`),
    table(['Authored difficulty','Responses','Unique questions','Runs','Accuracy','Median response time'],summary.difficulties.map(g=>[g.label,g.count||'No observed responses',g.count?g.questionCount:'—',g.count?g.runCount:'—',accuracyCell(g),displayTime(g.medianResponseTimeMs)])));
  if(summary.reportedDifficulties.some(g=>g.label!=='Unknown'))difficulty.append(fold('Recorded difficulty labels — provenance may be unverified',note('These exported labels may reflect game mode. They are context only and are not evidence of authored question difficulty.'),table(['Recorded label','Responses','Accuracy','Median time'],summary.reportedDifficulties.map(g=>[g.label,g.count,accuracyCell(g),displayTime(g.medianResponseTimeMs)]))));
  const encounter=panel('encounters','First and repeat encounters');
  encounter.append(note('Exact question version within a run. Retained history only; unknown ordering stays unavailable.'),smallTable(['Question encounter','Responses','Accuracy'],summary.encounters.question.map(g=>[g.label,g.count,accuracyCell(g)])),
    unavailable('Skill first/repeat performance: Not available. These exports do not provide a consistent skill identifier and reliable skill-encounter history.'),
    fold('Original exposure-counter results',note('Used by the Attempts filter. This question-ID counter also includes earlier rapid guesses and may span revisions.'),smallTable(['Recorded exposure','Responses','Accuracy'],summary.encounters.recorded.map(g=>[g.label,g.count,accuracyCell(g)]))));
  const remediation=panel('remediation','Instructional support');
  remediation.append(note('Immediate support responses are separate from subsequent retests.'),smallTable(['Recorded role','Responses','Accuracy'],summary.remediation.roles.map(g=>[g.label[0].toUpperCase()+g.label.slice(1),g.count||'Not available',accuracyCell(g)])));
  const linked=summary.remediation.linkedRetests;
  remediation.append(note(`Post-remediation retest accuracy: ${linked.count?percent(linked.correct,linked.knownCorrectness)+` (${linked.correct}/${linked.knownCorrectness} graded; ${linked.count} linked responses)`:'Not available — no reliably linked retests in this selection'}.`),
    fold('Sequence support and limits',note(`${summary.remediation.linkedGroups||'No'} linked remediation groups observed. A group is not proof of a complete sequence.`),unavailable('Sequences initiated, completed, and abandoned: Not available. The current exports do not consistently mark those lifecycle events.'),note('Correct repair answers and retests do not establish mastery or a causal learning gain.')));
  const progression=panel('progression','Game completion and progression'),runMetrics=el('div','','metrics run-metrics');
  runMetrics.append(metric('Successful completions',p.successful,`${p.represented} represented runs`),metric('Ended early',p.early),metric('Unsuccessful endings',p.unsuccessful),metric('Unknown status',p.unknown));
  progression.append(runMetrics,note('Whole-run context for the runs represented above. Response filters do not shorten these runs. A successful ending means normal mode completion, not mastery.'));
  progression.append(table(['Whole-run measure','Value','Coverage / denominator'],[
    ['Successful completion rate',p.successfulRate===null?'Not available':percent(p.successful,p.represented),`${p.successful} successful / ${p.represented} represented; ${p.unknown} unknown included in denominator`],
    ['Median successful completion time',runTime(p.medianSuccessfulTimeMs),`${p.successfulTimedRuns} of ${p.successful} successful runs have end times`],
    ['Median answered questions per success',p.medianAnswersPerSuccess??'Not available',`${p.successfulCountedRuns} of ${p.successful} successful runs have valid exported attempt totals`],
    ['Median overall run duration',runTime(o.medianRunTimeMs),`${o.timedRuns} of ${o.runs} runs; partial clocks may understate duration`],
    ['Mean ended-run duration',runTime(o.averageCompletionTimeMs),`${o.completionRuns} recorded endings, including early / unsuccessful endings`],
    ['Recorded run time',runTime(o.recordedTimeMs),'Total of one maximum clock per represented run'],
    ['Longest correct-answer streak',o.bestStreak??'Not available',`${o.streakRuns} of ${o.runs} runs have recorded streaks`],
    ['Checkpoint / boss retry rate','Not available','Explicit, consistently identified retry attempts are not available']
  ]));
  progression.append(fold('Review individual runs',table(['Run','Game','Status','Recorded duration','Observed answers','Inspect'],summary.runs.map(r=>{
    const button=el('button','Inspect run');button.type='button';button.addEventListener('click',()=>{byId('run').value=r.key;refresh();byId('overview').scrollIntoView();});
    return [r.runID,r.gameID,outcomeLabel[r.status]+(r.conflict?' (conflicting endings)':''),runTime(r.time),r.answerCount,button];
  }))));
  const timing=panel('timing','Response-time distribution'),bins=el('ul','','distribution');
  for(const bin of summary.distribution){const row=el('li','');row.append(el('span',bin.label),bar(bin.count,o.timedResponses),el('span',`${bin.count} · ${o.timedResponses?percent(bin.count,o.timedResponses):'—'}`,'bin-value'));bins.append(row);}
  timing.append(note(`Median ${displayTime(o.medianResponseTimeMs)} · Mean ${displayTime(o.averageResponseTimeMs)} · ${o.timedResponses}/${summary.stats.included} timed responses`),bins,note('All positive recorded times are retained. Times can include idle periods, accommodations, and interruptions.'));
  const cov=panel('coverage','Question-bank coverage'),depth=el('div','','mini-stats');
  for(const [value,label] of [[coverage.encountered,'versions encountered'],[coverage.atLeastFive,'with ≥5 graded responses'],[coverage.atLeastTen,'with ≥10 graded responses']]){const item=el('div','');item.append(el('strong',value),el('span',label));depth.append(item);}
  cov.append(depth,note('Breadth shows how much content was encountered. Depth shows how many versions have enough responses to review.'),unavailable('Percentage of the bank: Not available. No authoritative complete inventory was supplied.'),el('a','See coverage by topic or learning objective'));
  cov.lastChild.href='#topics';renderTopics();renderReview();
}
function topicLabel(g){return byId('grouping').value==='objectives'?MQAnswerAnalysis.objectiveLabel(g):g.topic.replaceAll('_',' ').replaceAll('-',' ');}
function renderTopics(){
  const objective=byId('grouping').value==='objectives',groups=[...(objective?summary.objectives:summary.topics)],sort=byId('topic-sort').value;
  const tie=(a,b)=>topicLabel(a).localeCompare(topicLabel(b))||a.gameID.localeCompare(b.gameID);
  const compare={accuracy:(a,b)=>(a.knownCorrectness?a.correct/a.knownCorrectness:2)-(b.knownCorrectness?b.correct/b.knownCorrectness:2),responses:(a,b)=>b.count-a.count,runs:(a,b)=>b.runCount-a.runCount,name:tie,time:(a,b)=>(b.medianResponseTimeMs??-1)-(a.medianResponseTimeMs??-1)}[sort];
  groups.sort((a,b)=>compare(a,b)||tie(a,b));
  byId('topics-heading').textContent=objective?'Results by learning objective':'Results by topic';
  const node=byId('topic-results');node.replaceChildren(note('Select a topic to browse its questions. Review signals use the selected minimum and retain limited-evidence labels.'));
  const min=Number(byId('minimum').value),multiple=new Set(groups.map(g=>g.gameID)).size>1;
  node.append(table([objective?'Learning objective':'Topic',...(multiple?['Game']:[]),'Responses','Runs','Accuracy','Median time','Versions (≥5 / ≥10)','Evidence'],groups.map(g=>{
    const link=el('button',topicLabel(g),'cell-link');link.type='button';link.addEventListener('click',()=>{
      questionScope={gameID:g.gameID,type:objective?'objective':'topic',value:objective?g.objective:g.topic,label:topicLabel(g)};questionPage=0;byId('question-search').value='';renderQuestions();byId('questions-heading').tabIndex=-1;byId('questions-heading').focus();
    });
    const enough=MQAnswerAnalysis.sufficient(g,Math.max(5,min)),review=g.knownCorrectness>=min&&g.correct<g.knownCorrectness;
    const evidence=el('div',enough?'Broader sample':'Limited evidence','evidence');if(review)evidence.prepend(el('span',enough?'Review candidate · ':'Explore cautiously · ',enough?'review-tag':''));
    return [link,...(multiple?[g.game]:[]),g.count,g.runCount,accuracyCell(g),displayTime(g.medianResponseTimeMs),`${g.questionCount} (${g.atLeastFive} / ${g.atLeastTen})`,evidence];
  })));
}
function renderReview(){
  const groups=MQAnswerAnalysis.reviewQuestions(summary,Number(byId('minimum').value)),node=byId('review-results');node.replaceChildren();
  byId('review-note').textContent=`Up to five questions with at least ${plural(Number(byId('minimum').value),'graded response')}, lowest accuracy first. Select a question to open its choices. Fewer than five responses or two runs is limited evidence.`;
  if(!groups.length){node.append(note('No questions meet the current review threshold. All imported question results remain available below.'));return;}
  node.append(table(['Question','Responses','Runs','Accuracy','Most common choice marked incorrect'],groups.map((g,i)=>{
    const wrong=g.options.filter(o=>o.knownCorrectness>o.correct),max=Math.max(...wrong.map(o=>o.knownCorrectness-o.correct));
    const cell=el('div','');cell.append(reviewLink(g,i),note(MQAnswerAnalysis.sufficient(g)?'Broader sample':'Limited evidence'));
    return [cell,g.count,g.runCount,accuracyCell(g),wrong.filter(o=>o.knownCorrectness-o.correct===max).map(o=>`${o.text} (${max})`).join(' / ')];
  })),note('These are observed answer patterns, not proven misconceptions. Review the wording and reasoning before deciding on a classroom intervention.'));
}
function openQuestion(g){
  questionScope=null;byId('question-search').value='';questionPage=Math.floor(orderedQuestions().indexOf(g)/questionPageSize);renderQuestions();
  const card=byId(questionAnchor(g));if(!card)return;card.open=true;card.querySelector('summary').focus({preventScroll:true});card.scrollIntoView({block:'start'});
}
function orderedQuestions(){
  const review=MQAnswerAnalysis.reviewQuestions(summary,Number(byId('minimum').value)),ranks=new Map(review.map((g,i)=>[g,i+1]));
  const others=summary.groups.filter(g=>!ranks.has(g)).sort((a,b)=>(a.knownCorrectness?a.correct/a.knownCorrectness:2)-(b.knownCorrectness?b.correct/b.knownCorrectness:2)||a.prompt.localeCompare(b.prompt));
  return [...review,...others];
}
function renderQuestions(){
  const node=byId('results');node.replaceChildren();
  const review=MQAnswerAnalysis.reviewQuestions(summary,Number(byId('minimum').value)),ranks=new Map(review.map((g,i)=>[g,i+1]));
  const search=byId('question-search').value.trim().toLocaleLowerCase();
  const groups=orderedQuestions().filter(g=>(!search||(g.prompt+' '+g.questionID).toLocaleLowerCase().includes(search))&&(!questionScope||g.gameID===questionScope.gameID&&(questionScope.type==='topic'?(g.topics.length?g.topics:['Topic unavailable']).includes(questionScope.value):(g.objectiveIDs.length?g.objectiveIDs:['']).includes(questionScope.value))));
  questionPage=Math.max(0,Math.min(questionPage,Math.ceil(groups.length/questionPageSize)-1));
  const start=questionPage*questionPageSize,end=Math.min(groups.length,start+questionPageSize);
  byId('question-context').textContent=`Showing ${groups.length?start+1:0}–${end} of ${groups.length} matching question versions (${summary.groups.length} total)${questionScope?' · '+questionScope.label:''}${search?' · search: '+byId('question-search').value:''}. Browsing does not change dashboard totals.`;
  if(groups.length>questionPageSize){const pagination=el('nav','','actions');pagination.setAttribute('aria-label','Question pages');for(const [label,change,disabled] of [['Previous page',-1,questionPage===0],['Next page',1,end===groups.length]]){const button=el('button',label);button.disabled=disabled;button.addEventListener('click',()=>{questionPage+=change;renderQuestions();byId('question-context').tabIndex=-1;byId('question-context').focus();});pagination.append(button);}pagination.append(el('span',`Page ${questionPage+1} of ${Math.ceil(groups.length/questionPageSize)}`));node.append(pagination);}
  for(const g of groups.slice(start,end)){
    const card=el('details','','question'+(ranks.has(g)?' review-question':'')),heading=el('summary','');card.id=questionAnchor(g);
    if(ranks.has(g))heading.append(el('span','Review '+ranks.get(g),'review-badge'));
    heading.append(el('h3',g.prompt),note(`${plural(g.count,'answer')} · ${percent(g.correct,g.knownCorrectness)} correct (${g.correct}/${g.knownCorrectness}) · ${plural(g.runCount,'run')} · Median ${displayTime(g.medianResponseTimeMs)}`));card.append(heading);
    const legacy=el('span','');legacy.id='question-'+summary.groups.indexOf(g);card.append(legacy);
    const metadata=el('dl','','question-meta');
    for(const [label,value] of [['Question ID',g.questionID],['Game',g.games.join(', ')],['Topic',g.topics.join(' / ')||'Not supplied'],['Learning objective',g.objectives.join(' / ')||'Not supplied'],['Authored difficulty',g.difficulty],['Question type',g.types.join(' / ')||'Not supplied'],['Gameplay role',[...g.roles,...g.bossStages].join(' / ')||'Not supplied'],['Saved version',g.revision]]){const pair=el('div','');pair.append(el('dt',label),el('dd',String(value)));metadata.append(pair);}card.append(metadata);
    card.append(note(`Exact-version encounters: ${g.encounters.map(e=>`${e.count} ${e.label.toLowerCase()}`).join(' · ')}. ${g.assisted} responses with choices removed.`),note(`Time per answer: median ${displayTime(g.medianResponseTimeMs)} · mean ${displayTime(g.averageResponseTimeMs)} · ${g.timedResponses}/${g.count} timed.`));
    if(g.reportedDifficulties.length&&g.difficulty==='Unknown')card.append(note('Recorded difficulty label (unverified): '+g.reportedDifficulties.join(' / ')));
    if(g.optionOrder==='displayed')card.append(note('Original answer order was unavailable. Choices are grouped by the order shown.'));
    if(g.keyStatus!=='known')card.append(el('p',g.keyStatus==='conflict'?'Conflicting answer-key or grading information; correct answers are withheld.':'Correct answer unavailable',g.keyStatus==='conflict'?'integrity-note':'meta'));
    card.append(table(['Answer choice','Selected','Share','Correct answer','Selections marked correct'],g.options.map(o=>{
      const share=el('div',percent(o.count,g.count));share.append(bar(o.count,g.count));
      return [o.text,o.count,share,g.keyStatus==='conflict'?'Conflicting key':o.isCorrect===null?'Unavailable':o.isCorrect?'Yes':'No',o.knownCorrectness?`${o.correct} of ${o.knownCorrectness}`:'No recorded result'];
    })));
    if(ranks.has(g)){
      const actions=el('div','','actions'),next=review[ranks.get(g)],back=el('a','Back to review questions');back.href='#questions-to-review';
      if(next){const button=el('button',`Review next: ${ranks.get(g)+1}`);button.type='button';button.addEventListener('click',()=>openQuestion(next));actions.append(button);}actions.append(back);card.append(actions);
    }
    node.append(card);
  }
}
