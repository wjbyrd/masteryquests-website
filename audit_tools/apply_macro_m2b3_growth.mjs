import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const repo=path.resolve(process.argv[2]||process.cwd());
const dryRun=process.argv.includes('--dry-run');
const PHASE='phaseM2b3-growth-productivity-family-maturation-v1';
const STAMP=new Date().toISOString();
const SOURCE='macro-m2b3-growth-productivity-family';
const familyIds=['living-standards-and-growth','productivity-measurement','sources-of-productivity','economic-growth-policy'];
const modifiedIds=['productivity-measurement','sources-of-productivity','economic-growth-policy'];
const modifiedSet=new Set(modifiedIds);
const protectedContentId='living-standards-and-growth';
const composer=path.join(repo,'build','faculty-build-composer');
const dataDir=path.join(composer,'data');
const libraryPath=path.join(dataDir,'composer_library.js');
const registryPath=path.join(dataDir,'composer_registry.json');
const manifestPath=path.join(dataDir,'composer_library_manifest.json');

const sha=value=>crypto.createHash('sha256').update(value).digest('hex');
const stable=value=>Array.isArray(value)?value.map(stable):value&&typeof value==='object'?Object.fromEntries(Object.keys(value).sort().map(k=>[k,stable(value[k])])):value;
const answerHash=answer=>sha(String(answer).trim().replace(/\s+/g,' ').toLowerCase());
const qid=q=>String(q?.canonicalId||q?.id||q?.questionId||'');
const questionHash=q=>sha(JSON.stringify(stable({q:q.q,options:q.options,aHash:q.aHash,primaryConceptId:q.primaryConceptId,primarySkill:q.primarySkill,difficulty:q.difficulty,secondaryConceptIds:q.secondaryConceptIds||[],bossStage:q.bossStage||null,image:q.image||null})));
const contentHash=q=>sha(JSON.stringify(stable({q:q.q,options:q.options,aHash:q.aHash,feedback:q.feedback,commonError:q.commonError,primaryConceptId:q.primaryConceptId,primarySkill:q.primarySkill,difficulty:q.difficulty,secondaryConceptIds:q.secondaryConceptIds||[],image:q.image||null})));
const loadLibrary=raw=>{const sandbox={window:{}};vm.createContext(sandbox);vm.runInContext(raw,sandbox,{filename:libraryPath});return sandbox.window.MQ_COMPOSER_LIBRARY;};
const rawBefore=fs.readFileSync(libraryPath,'utf8');
const library=loadLibrary(rawBefore);
const registry=JSON.parse(fs.readFileSync(registryPath,'utf8'));
const manifest=JSON.parse(fs.readFileSync(manifestPath,'utf8'));
if(!String(library.libraryVersion).endsWith('phaseM2b2-inflation-real-values-family-maturation-v1'))throw new Error('Unexpected baseline: completed M2b-2 library required.');
for(const id of familyIds)if(!library.concepts[id])throw new Error(`Missing F3 concept ${id}`);

function tagged(module){return [...Object.entries(module.questions||{}).flatMap(([pool,list])=>(list||[]).map(question=>({pool,question}))),...(module.repairQuestions||[]).map(question=>({pool:'repair',question})),...(module.repairSeedQuestions||[]).map(question=>({pool:'repairSeed',question})),...(module.bridgeQuestions||[]).map(question=>({pool:'bridge',question}))];}
function unique(module){const seen=new Set();return tagged(module).filter(({question})=>{const id=qid(question);if(seen.has(id))return false;seen.add(id);return true;});}
function bankSnapshot(module){return unique(module).map(({pool,question})=>({pool,id:qid(question),question:stable(question)})).sort((a,b)=>a.id.localeCompare(b.id));}
function bankHash(module){return sha(JSON.stringify(stable(bankSnapshot(module))));}
function contentBankHash(module){return sha(JSON.stringify(unique(module).map(({pool,question})=>({pool,id:qid(question),hash:contentHash(question)})).sort((a,b)=>a.id.localeCompare(b.id))));}
function countModule(module){
  const out={easy:0,medium:0,hard:0,elite:0,legendary:0,calculation:(module.questions?.calculation||[]).length,integration:(module.questions?.integration||[]).length,easyBoss:0,mediumBoss:0,finalBoss:0,legendaryBoss:(module.questions?.legendaryBoss||[]).length,repair:(module.repairQuestions||[]).length,repairSeed:(module.repairSeedQuestions||[]).length,bridge:(module.bridgeQuestions||[]).length,total:unique(module).length};
  for(const pool of ['easy','medium','hard','elite','legendary'])out[pool]=(module.questions?.[pool]||[]).length;
  for(const q of module.questions?.boss||[])out[q.difficulty]=(out[q.difficulty]||0)+1;
  return out;
}
const protectedIds=Object.keys(library.concepts).filter(id=>!modifiedSet.has(id));
const protectedBefore=Object.fromEntries(protectedIds.map(id=>[id,bankHash(library.concepts[id])]));
const lsgContentBefore=contentBankHash(library.concepts[protectedContentId]);
const beforeCounts=Object.fromEntries(familyIds.map(id=>[id,countModule(library.concepts[id])]));
const beforeTotal=library.canonicalQuestionCount;
const previousVersion=library.libraryVersion;
const changes=[];
let serial=8500000;

const lessons={
  productivity_calculation:['Confuses total output with output per unit of labor.','Productivity compares output with the labor input used to produce it, so changes in both output and labor matter.'],
  physical_capital:['Treats every increase in capital as producing the same output gain.','More capital per worker can raise output per worker, but the production function becomes flatter as capital deepens.'],
  human_capital:['Treats worker knowledge and skills as physical equipment.','Human capital is the education, training, health, and skills embodied in workers.'],
  natural_resources:['Treats natural resources as the only determinant of productivity.','Natural resources can support production, but productivity also depends on capital, human capital, technology, and institutions.'],
  technological_knowledge:['Confuses technological knowledge with merely owning more machines.','Technology raises the efficiency with which available inputs are transformed into output.'],
  growth_policy:['Treats a one-time demand boost as a substitute for policies that raise productive capacity.','Long-run growth policy works through productivity, capital formation, human capital, technology, and institutions.']
};
function lesson(skill){return lessons[skill]||['Uses a surface cue instead of the relevant growth mechanism.','Identify the productivity or growth mechanism required by the scenario.'];}
function rotate(options,answer,index){const n=index%options.length;const out=options.slice(n).concat(options.slice(0,n));if(!out.includes(answer))throw new Error(`Answer missing: ${answer}`);return out;}
function spec(stem,answer,wrong,skill,extra={}){return{stem,answer,options:[answer,...wrong],skill,...extra};}
const codeById={'productivity-measurement':'PROD','sources-of-productivity':'SRC','economic-growth-policy':'POL'};
const chapterById={'productivity-measurement':[26,2],'sources-of-productivity':[26,3],'economic-growth-policy':[26,4]};
const objectiveById={'productivity-measurement':'LO26.2','sources-of-productivity':'LO26.3','economic-growth-policy':'LO26.4'};
const GRAPH='question-assets/GROWTH-01.webp';

function addQuestion(conceptId,pool,s,index){
  const module=library.concepts[conceptId],boss=pool==='boss',lb=pool==='legendaryBoss',tier=boss?s.tier:null;
  const canonicalDifficulty=boss?({easyBoss:'easy',mediumBoss:'medium',finalBoss:'hard'})[tier]:lb?'legendary':pool;
  const marker=boss?({easyBoss:'EB',mediumBoss:'MB',finalBoss:'FB'})[tier]:({easy:'E',medium:'M',hard:'H',legendary:'L',legendaryBoss:'LB'})[pool];
  const id=`PM2B3-${codeById[conceptId]}-${marker}-${String(index+1).padStart(3,'0')}`;
  const [commonError,feedback]=lesson(s.skill);
  const q={id,sourceGame:SOURCE,q:s.stem,options:rotate(s.options,s.answer,index),tag:conceptId.replaceAll('-','_'),type:s.type||'application',objective:objectiveById[conceptId],difficulty:boss?tier:lb?'legendaryBoss':pool,conceptCluster:'growth_productivity',primarySkill:s.skill,secondarySkills:s.secondarySkills||[],repairSkill:s.skill,commonError:s.commonError||commonError,feedback:s.feedback||feedback,aHash:answerHash(s.answer),canonicalId:id,sourceId:++serial,sourceChapter:chapterById[conceptId],sourcePool:boss?tier:s.skill,primaryConceptId:conceptId,secondaryConceptIds:s.secondaryConceptIds||[],instructionalRole:boss?'boss':lb?'legendaryBoss':pool,canonicalDifficulty,originalSourcePool:boss?tier:s.skill,originalBossTier:boss?tier:lb?'legendaryBoss':null,sourceCurationPhase:PHASE};
  if(s.image)q.image=s.image;
  if(s.roundingRule)q.roundingRule=s.roundingRule;
  if(boss)q.boss=({easyBoss:'Checkpoint One',mediumBoss:'Checkpoint Two',finalBoss:'Final Checkpoint'})[tier];
  if(lb)q.bossStage=s.bossStage;
  q.sourceHash=questionHash(q);
  q.sourceOccurrences=[{sourceGame:SOURCE,sourceFile:`${PHASE}_questions.json`,sourceGlobal:'questions',sourcePool:q.sourcePool,routeKey:q.primarySkill,sourceRecordOrder:index,sourceId:q.sourceId,sourceHash:q.sourceHash,sourceCurationPhase:PHASE}];
  module.questions[pool].push(q);
  changes.push({questionId:id,canonicalConceptId:conceptId,action:'ADD',oldPool:null,newPool:boss?tier:pool,reason:s.reason||'Closes a verified F3 engine or instructional gap.'});
}

function setBossStage(conceptId,questionId,bossStage){
  const q=library.concepts[conceptId].questions.legendaryBoss.find(item=>qid(item)===questionId);if(!q)throw new Error(`Missing Legendary Boss ${questionId}`);
  const beforeHash=questionHash(q),before=q.bossStage??null;q.bossStage=bossStage;q.sourceHash=questionHash(q);
  changes.push({questionId,canonicalConceptId:conceptId,action:'BOSS_STAGE_FIX',oldPool:'legendaryBoss',newPool:'legendaryBoss',reason:`Assigns semantically appropriate ${bossStage} stage without changing question content.`,beforeBossStage:before,afterBossStage:bossStage,beforeHash,afterHash:q.sourceHash});
}

// Existing F3 Legendary Boss stage repair.
setBossStage('living-standards-and-growth','ECON-NL-LEGENDARYBOSS-9116','opening');
setBossStage('living-standards-and-growth','ECON-NL-LEGENDARYBOSS-9117','middle');
setBossStage('living-standards-and-growth','P52B-S2-LSG-LB-001','final');
setBossStage('productivity-measurement','ECON-NL-LEGENDARYBOSS-9118','opening');
setBossStage('sources-of-productivity','ECON-NL-LEGENDARYBOSS-9120','opening');
setBossStage('sources-of-productivity','ECON-NL-LEGENDARYBOSS-9121','middle');
setBossStage('sources-of-productivity','ECON-NL-LEGENDARYBOSS-9119','final');
setBossStage('economic-growth-policy','ECON-NL-LEGENDARYBOSS-9122','opening');
setBossStage('economic-growth-policy','ECON-NL-LEGENDARYBOSS-9123','middle');

const prod={
 easy:[
  spec('In GROWTH-01, point A is located at capital per worker of 20. What output per worker is shown at A?','28.53',['20','36.37','40'],'productivity_calculation',{image:GRAPH,type:'graph'}),
  spec('Two factories produce 1,000 units. Factory A uses 100 labor hours and Factory B uses 125. Which factory has higher labor productivity?','Factory A',['Factory B','They have equal productivity because output is equal','Productivity cannot be compared without the product price'],'productivity_calculation'),
  spec('A plant produces 10 percent more output with the same labor hours. What happens to output per labor hour?','It rises 10 percent',['It falls 10 percent','It is unchanged','It rises only if the number of workers also rises'],'productivity_calculation'),
  spec('A business uses more labor hours but produces the same amount of output. What happens to labor productivity?','It falls',['It rises','It stays the same','It becomes equal to total output'],'productivity_calculation')
 ],
 medium:[
  spec('Using GROWTH-01, moving from point A to point B raises output per worker by approximately how much?','7.84',['8.53','16.37','20.00'],'productivity_calculation',{image:GRAPH,type:'graph'}),
  spec('A firm produces 1,200 units in 100 hours, then 1,320 units in the same 100 hours. What is the productivity increase?','10 percent',['20 percent','1.2 percent','No change'],'productivity_calculation'),
  spec('Two economies have the same output per person, but workers in Economy X work fewer hours per person. What is the strongest inference?','Economy X has higher output per hour worked',['Economy X must have lower output per worker','The economies must have identical technology','Economy X necessarily has more natural resources'],'productivity_calculation'),
  spec('Output grows 12 percent while total labor hours grow 4 percent. What happens to labor productivity?','It rises',['It falls','It is unchanged','It cannot change unless population changes'],'productivity_calculation')
 ],
 hard:[
  spec('GROWTH-01 becomes flatter as capital per worker rises. After moving from A to B, what should be expected from another equal increase in capital per worker, holding other factors constant?','A smaller additional gain in output per worker than the A-to-B gain',['The same 7.84-unit gain by definition','A larger gain because the economy is richer','No further output gain is possible'],'productivity_calculation',{image:GRAPH,type:'graph'}),
  spec('Output rises 30 percent while labor hours rise 20 percent. To one decimal place, what is the exact increase in output per labor hour?','8.3 percent',['10.0 percent','25.0 percent','50.0 percent'],'productivity_calculation',{roundingRule:'Compute 1.30 ÷ 1.20 − 1 and round to one decimal place.'}),
  spec('Output per worker rises, but output per labor hour is unchanged. Which explanation is consistent with both facts?','Average hours worked per worker increased',['Every worker became more productive per hour','Total output must have fallen','The labor force must have shrunk to zero'],'productivity_calculation'),
  spec('Total output falls 2 percent while labor hours fall 5 percent. To one decimal place, what happens to labor productivity?','It rises about 3.2 percent',['It falls 7.0 percent','It falls 3.0 percent','It rises 7.0 percent'],'productivity_calculation',{roundingRule:'Compute 0.98 ÷ 0.95 − 1 and round to one decimal place.'})
 ],
 legendary:[
  spec('In GROWTH-01, two otherwise similar economies begin at A and B. Each receives the same small addition to capital per worker. Which conclusion is best supported by the graph?','Point A has the larger marginal output gain; convergence is not guaranteed',['Point B must gain more because its current output per worker is already higher','Both economies must receive exactly the same output gain whenever capital increases by the same amount','Point A is guaranteed to overtake point B even if institutions and technology differ'],'productivity_calculation',{image:GRAPH,type:'graph',secondaryConceptIds:['sources-of-productivity']}),
  spec('A plant automates part of production. Output rises 18 percent while labor hours fall 5 percent. To one decimal place, what happens to output per labor hour?','It rises about 24.2 percent',['It rises 13.0 percent','It rises 23.0 percent','It falls about 13.0 percent'],'productivity_calculation',{roundingRule:'Compute 1.18 ÷ 0.95 − 1 and round to one decimal place.'})
 ],
 boss:[
  {...spec('A factory produces 900 units in 90 labor hours. What is labor productivity?','10 units per labor hour',['9 units per labor hour','90 units per labor hour','810 units per labor hour'],'productivity_calculation'),tier:'easyBoss'},
  {...spec('In GROWTH-01, which point has both lower capital per worker and lower output per worker?','Point A',['Point B','Both points have the same capital per worker','Neither point lies on the production curve'],'productivity_calculation',{image:GRAPH,type:'graph'}),tier:'easyBoss'},
  {...spec('A company hires more workers and total output rises, but output per labor hour does not change. What happened to labor productivity?','It stayed the same',['It rose because total output rose','It fell because employment rose','It became equal to output per worker automatically'],'productivity_calculation'),tier:'easyBoss'},
  {...spec('From A to B in GROWTH-01, capital per worker doubles from 20 to 40 while output per worker rises from 28.53 to 36.37. What does this comparison show?','Output per worker rises by less than 100 percent',['Output per worker also doubles because capital per worker doubled','Output per worker falls even though capital per worker doubled','Capital per worker has no relationship to the output shown on the curve'],'productivity_calculation',{image:GRAPH,type:'graph',secondaryConceptIds:['sources-of-productivity']}),tier:'finalBoss'},
  {...spec('A factory targets 300,000 units of output and productivity of 12.5 units per labor hour. How many labor hours can it use and still meet that productivity target?','24,000 labor hours',['20,000 labor hours','25,000 labor hours','37,500 labor hours'],'productivity_calculation'),tier:'finalBoss'},
  {...spec('Economy A produces 480 billion units with 24 billion labor hours; Economy B produces 420 billion units with 20 billion labor hours. Which has higher labor productivity?','Economy B, at 21 units per hour versus 20 for Economy A',['Economy A, because its total output is larger','They have equal productivity because both use billions of hours','Economy B, because it uses more labor hours'],'productivity_calculation'),tier:'finalBoss'}
 ],
 legendaryBoss:[
  spec('Output grows 25 percent while labor hours grow 20 percent. To one decimal place, what is the exact productivity growth rate?','4.2 percent',['5.0 percent','20.8 percent','45.0 percent'],'productivity_calculation',{bossStage:'middle',roundingRule:'Compute 1.25 ÷ 1.20 − 1 and round to one decimal place.'}),
  spec('GROWTH-01 shows A at lower capital per worker on the steeper portion of the curve and B farther to the right where the curve is flatter. What is the strongest productivity interpretation?','Equal new capital likely adds more output near A than near B',['Equal capital additions must create identical output gains at every point on the curve','Output per worker is higher at A than at B even though A has less capital','The graph proves that every low-capital economy must eventually converge regardless of its other conditions'],'productivity_calculation',{bossStage:'final',image:GRAPH,type:'graph',secondaryConceptIds:['sources-of-productivity']})
 ]
};

const src={
 boss:[
  {...spec('A worker receives a new machine that raises output with the same labor time. Which productivity input increased most directly?','Physical capital per worker',['Human capital only','Natural resources only','Population growth'],'physical_capital'),tier:'easyBoss'},
  {...spec('In GROWTH-01, why does an equal small addition to capital have greater output potential near point A than near point B?','The curve is steeper near A',['Point A has more output per worker than B','The curve is vertical near B','Capital has no relationship to output near A'],'physical_capital',{image:GRAPH,type:'graph'}),tier:'easyBoss'},
  {...spec('A new production method lets the same workers and machines produce more output. Which source of productivity improved?','Technological knowledge',['Physical capital per worker only','Natural resources only','The unemployment rate'],'technological_knowledge'),tier:'easyBoss'},
  {...spec('GROWTH-01 is upward sloping but becomes flatter as capital per worker rises. Which concept is represented by that shape?','Diminishing returns to capital',['Increasing marginal returns to capital','The Rule of 70','A fixed level of productivity at all capital levels'],'productivity_calculation',{image:GRAPH,type:'graph',secondaryConceptIds:['productivity-measurement']}),tier:'finalBoss'},
  {...spec('A low-capital country buys machinery, but workers lack training and firms cannot reliably obtain electricity. Why might catch-up remain limited?','Physical capital works with human capital, infrastructure, and other complementary inputs',['Catch-up requires natural resources and nothing else','More machines always guarantee convergence regardless of other conditions','Human capital matters only after a country becomes rich'],'physical_capital',{secondaryConceptIds:['economic-growth-policy']}),tier:'finalBoss'},
  {...spec('Two countries add the same number of machines. One also improves worker training and production methods. Why can its productivity gain be larger?','Capital can complement human capital and technological knowledge',['Machines reduce productivity whenever training also rises','Human capital and technology affect only total population','Natural resources must fall when technology improves'],'human_capital',{secondaryConceptIds:['technological-knowledge']}),tier:'finalBoss'}
 ]
};

const policy={
 easy:[
  spec('Which policy most directly supports technological progress over the long run?','Protecting incentives for research, innovation, and technology adoption',['Restricting all new production methods','Discouraging education and training','Making investment rules unpredictable'],'growth_policy'),
  spec('Why can reliable courts and secure property rights support economic growth?','They make productive investment less risky',['They guarantee that every investment succeeds','They eliminate diminishing returns to capital','They raise real GDP by redefining the price level'],'growth_policy')
 ],
 medium:[
  spec('A low-income country has little capital per worker but weak courts and frequent asset seizure. What is the best catch-up diagnosis?','Catch-up is possible, but weak institutions can block productive investment',['Low income guarantees rapid convergence even when investment incentives and institutions remain weak','Weak institutions automatically increase capital productivity enough to overcome poor investment incentives','Catch-up depends only on population growth rather than capital formation or productivity'],'growth_policy',{secondaryConceptIds:['sources-of-productivity']}),
  spec('Households save more, but firms cannot obtain financing for productive projects. What is missing from the growth channel?','Financial and institutional channels that turn saving into productive investment',['A higher inflation rate that reduces the real value of accumulated household saving','A larger government transfer program that does not finance productive investment projects','A lower level of worker education that prevents any saving from reaching firms'],'growth_policy')
 ],
 hard:[
  spec('GROWTH-01 shows that capital deepening can move an economy from A toward B, but the curve becomes flatter. Which policy implication is strongest?','Capital raises output, while sustained growth also needs broader productivity gains',['Capital accumulation becomes completely useless as soon as the economy reaches point B on the graph','The graph implies that low-capital economies should stop investment before they approach point B','Long-run growth can rely on repeated physical-capital accumulation forever without complementary productivity improvements'],'growth_policy',{image:GRAPH,type:'graph',secondaryConceptIds:['sources-of-productivity']}),
  spec('A government uses a temporary spending surge that raises current output but does not change capital, worker skills, technology, or institutions. What is the main long-run limitation?','It does not directly strengthen long-run productivity fundamentals',['It permanently doubles output per worker even though productive capacity is unchanged','It guarantees a permanently lower natural unemployment rate without changing labor-market institutions','It eliminates diminishing returns to capital even though the capital stock is unchanged'],'growth_policy')
 ],
 legendary:[
  spec('A country saves heavily and imports machinery, yet productivity barely rises because schools are weak, power is unreliable, and contracts are insecure. Which conclusion is strongest?','Capital alone may not deliver catch-up when complementary conditions are weak',['High saving guarantees convergence even when schools, infrastructure, and institutions remain persistently weak','The country should restrict technological adoption so scarce capital continues to have a high marginal product','The catch-up effect requires poorer economies to have lower productivity growth than richer economies'],'growth_policy',{secondaryConceptIds:['sources-of-productivity','productivity-measurement']}),
  spec('A government subsidizes investment for five years, raising capital per worker, but it makes no lasting change to research, education, or institutions. Which long-run caution is most appropriate?','The capital increase can raise the output level, but sustained productivity growth needs broader continuing sources',['The temporary subsidy guarantees a permanently higher growth rate even after capital deepening slows','Research and education matter only for short-run aggregate demand','Institutions become irrelevant once the capital stock has increased'],'growth_policy',{secondaryConceptIds:['sources-of-productivity']})
 ],
 boss:[
  {...spec('Which policy most directly strengthens incentives for private long-term investment?','Secure property rights with predictable contract enforcement',['Frequent asset seizure that makes long-term investment returns highly uncertain','Unpredictable contract enforcement that raises risk for firms making long-term investments','Bans on productive capital formation that prevent firms from expanding productive capacity'],'growth_policy'),tier:'easyBoss'},
  {...spec('Which policy most directly builds human capital?','Improving education, job training, and basic health',['Reducing access to schooling and limiting opportunities for workers to acquire new skills','Making private research illegal and restricting firms from adopting outside technologies','Replacing productive investment with longer workweeks while worker skills remain unchanged'],'growth_policy'),tier:'easyBoss'},
  {...spec('Which policy most directly supports technological knowledge?','Research, innovation, and diffusion of better production methods',['Discouraging adoption of new methods','Increasing transfer payments without changing productive capacity','Restricting all business investment'],'growth_policy'),tier:'easyBoss'},
  {...spec('A policy raises current consumer spending but leaves physical capital, human capital, technology, and institutions unchanged. Why is it not a complete long-run growth strategy?','It does not directly raise productivity fundamentals',['Consumer spending can never affect measured GDP','Long-run growth is determined only by population','Productivity falls whenever consumption rises'],'growth_policy'),tier:'finalBoss'},
  {...spec('A poor economy has little capital but weak schools, unreliable infrastructure, and insecure property rights. Which policy package best supports conditional catch-up?','Improve institutions and human capital while enabling productive investment and technology adoption',['Rely only on its low starting income to guarantee convergence','Block new technology so existing capital remains scarce','Raise population growth without expanding capital or skills'],'growth_policy',{secondaryConceptIds:['sources-of-productivity']}),tier:'finalBoss'},
  {...spec('In GROWTH-01, moving from A toward B through capital accumulation raises output per worker, but the curve flattens. Which policy best complements continued capital deepening?','Policies that improve skills, innovation, and productive institutions',['A policy that prevents workers from learning new methods','A ban on technology adoption','A policy that makes investment returns less secure'],'growth_policy',{image:GRAPH,type:'graph',secondaryConceptIds:['sources-of-productivity']}),tier:'finalBoss'}
 ],
 legendaryBoss:[
  spec('GROWTH-01 shows a low-capital economy at A with catch-up potential. Its government wants that potential to become sustained growth rather than remain a possibility. Which strategy is strongest?','Support productive investment while strengthening human capital, technology adoption, infrastructure, and institutions',['Assume low initial capital alone guarantees convergence','Rely only on repeated additions of physical capital with no complementary improvements','Discourage investment so the marginal product of capital stays high'],'growth_policy',{bossStage:'final',image:GRAPH,type:'graph',secondaryConceptIds:['sources-of-productivity','productivity-measurement']})
 ]
};

for(const [conceptId,groups] of Object.entries({'productivity-measurement':prod,'sources-of-productivity':src,'economic-growth-policy':policy}))
  for(const [pool,specs] of Object.entries(groups))specs.forEach((item,index)=>addQuestion(conceptId,pool,item,index));

const afterCounts=Object.fromEntries(familyIds.map(id=>[id,countModule(library.concepts[id])]));
const expected={
 'living-standards-and-growth':{total:56,easy:6,medium:6,hard:6,legendary:6,easyBoss:3,mediumBoss:6,finalBoss:3,legendaryBoss:3},
 'productivity-measurement':{total:53,easy:6,medium:6,hard:6,legendary:7,easyBoss:3,mediumBoss:6,finalBoss:3,legendaryBoss:3},
 'sources-of-productivity':{total:72,easy:8,medium:7,hard:7,legendary:7,easyBoss:3,mediumBoss:15,finalBoss:3,legendaryBoss:3},
 'economic-growth-policy':{total:50,easy:6,medium:6,hard:6,legendary:7,easyBoss:3,mediumBoss:9,finalBoss:3,legendaryBoss:3}
};
for(const [conceptId,target] of Object.entries(expected))for(const [key,value] of Object.entries(target))if(afterCounts[conceptId][key]!==value)throw new Error(`Count mismatch ${conceptId} ${key}: ${afterCounts[conceptId][key]} != ${value}`);
const added=changes.filter(c=>c.action==='ADD').length;
if(added!==43)throw new Error(`Expected 43 additions; got ${added}`);

// Add one unique GROWTH-01 asset, copied into every concept that references it.
const graphSource=path.join(repo,'GROWTH-01.webp');
if(!fs.existsSync(graphSource))throw new Error(`Missing converted graph source ${graphSource}`);
const imageBytes=fs.readFileSync(graphSource);
const graphSha=sha(imageBytes);
const imageAlt='Concave production-function graph with labeled points A and B.';
const graphDescription='The horizontal axis is Capital per worker from 0 to 100 and the vertical axis is Output per worker from 0 to 60. A smooth upward-sloping blue curve becomes flatter as capital per worker increases. Point A is at capital per worker 20 and output per worker 28.53. Point B is at capital per worker 40 and output per worker 36.37. Dashed horizontal and vertical guides connect each point to its axis values.';
for(const conceptId of modifiedIds){
  const module=library.concepts[conceptId];
  const destDir=path.join(dataDir,'question-assets',conceptId);fs.mkdirSync(destDir,{recursive:true});
  const dest=path.join(destDir,'GROWTH-01.webp');if(!dryRun)fs.writeFileSync(dest,imageBytes);
  const runtimePath=`question-assets/${conceptId}/GROWTH-01.webp`;
  const meta={conceptId,filename:'GROWTH-01.webp',sourceAssetPath:'question-assets/GROWTH-01.webp',sourceUrl:`data/${runtimePath}`,runtimePath,sha256:graphSha,sizeBytes:imageBytes.length,imageAlt,graphDescription};
  module.assets=module.assets||[];if(!module.assets.includes(runtimePath))module.assets.push(runtimePath);
  module.assetPaths=module.assetPaths||[];if(!module.assetPaths.includes(runtimePath))module.assetPaths.push(runtimePath);
  module.assetMetadata=module.assetMetadata||[];module.assetMetadata=module.assetMetadata.filter(a=>a.filename!=='GROWTH-01.webp');module.assetMetadata.push(meta);
  manifest.assets=manifest.assets||[];manifest.assets=manifest.assets.filter(a=>!(a.conceptId===conceptId&&a.filename==='GROWTH-01.webp'));manifest.assets.push(meta);
}

// Validate graph linkage: every GROWTH-01 question is in a concept with the asset.
const graphQuestionIds=[];
for(const conceptId of familyIds)for(const {question} of unique(library.concepts[conceptId]))if(question.image){if(String(question.image).endsWith('GROWTH-01.webp'))graphQuestionIds.push(qid(question));}
if(graphQuestionIds.length<10)throw new Error(`Expected robust graph use; only ${graphQuestionIds.length} GROWTH-01 questions found.`);

// No exact duplicate stems among F3, and no introduced number-only stem templates.
const allF3=familyIds.flatMap(conceptId=>unique(library.concepts[conceptId]).map(({pool,question})=>({conceptId,pool,question})));
const stemMap=new Map(),templateMap=new Map(),introducedIds=new Set(changes.filter(c=>c.action==='ADD').map(c=>c.questionId));
const introducedExact=[],introducedNumberSwaps=[];
for(const row of allF3){
 const stem=String(row.question.q||'').toLowerCase().replace(/\s+/g,' ').trim();
 const tpl=stem.replace(/\b\d+(?:[.,]\d+)?%?\b/g,'#');
 if(stemMap.has(stem)&&(introducedIds.has(qid(row.question))||introducedIds.has(stemMap.get(stem))))introducedExact.push([stemMap.get(stem),qid(row.question)]); else if(!stemMap.has(stem))stemMap.set(stem,qid(row.question));
 if(templateMap.has(tpl)&&(introducedIds.has(qid(row.question))||introducedIds.has(templateMap.get(tpl))))introducedNumberSwaps.push([templateMap.get(tpl),qid(row.question)]); else if(!templateMap.has(tpl))templateMap.set(tpl,qid(row.question));
}
if(introducedExact.length)throw new Error(`Introduced exact duplicates: ${JSON.stringify(introducedExact)}`);
// Number-template pairs are allowed only if cognitive task differs; keep a report instead of hard-failing.

// Answer-length audit for introduced questions.
function wordCount(text){return String(text||'').trim().split(/\s+/).filter(Boolean).length;}
const lengthIssues=[];
for(const conceptId of modifiedIds){
 const groups={};
 for(const {pool,question} of unique(library.concepts[conceptId]))if(introducedIds.has(qid(question))){
  const group=pool==='boss'?question.difficulty:pool;
  const correct=(question.options||[]).find(option=>answerHash(option)===question.aHash);const dist=(question.options||[]).filter(option=>option!==correct);
  (groups[group]||=[]).push({correct:wordCount(correct),dist:dist.map(wordCount)});
 }
 for(const [group,rows] of Object.entries(groups)){
  const longest=rows.filter(r=>r.dist.every(n=>r.correct>n)).length/rows.length;
  const cm=rows.reduce((a,r)=>a+r.correct,0)/rows.length;
  const dm=rows.reduce((a,r)=>a+r.dist.reduce((x,y)=>x+y,0)/r.dist.length,0)/rows.length;
  if(longest>.5||cm/dm>1.35)lengthIssues.push({conceptId,group,longest,ratio:Number((cm/dm).toFixed(3))});
 }
}
if(lengthIssues.length)throw new Error(`Answer-length issue: ${JSON.stringify(lengthIssues)}`);

function calcLinked(q){return q.type==='calculation'||q.primarySkill==='productivity_calculation'||q.primarySkill==='rule_of_70'||q.primarySkill==='real_gdp_per_person'||q.primarySkill==='real_gdp_per_person_growth'||q.primarySkill==='real_gdp_per_person_comparison';}
function graphLinked(q){return Boolean(q.image);}
function updateRegistryEntry(entry,module,role){
 const records=unique(module).map(item=>item.question),ordinary=['easy','medium','hard'].flatMap(pool=>module.questions[pool]||[]);
 const roleCounts={boss:(module.questions.boss||[]).length,bridge:(module.bridgeQuestions||[]).length,calculation:(module.questions.calculation||[]).length,elite:(module.questions.elite||[]).length,integration:(module.questions.integration||[]).length,legendary:(module.questions.legendary||[]).length,legendaryBoss:(module.questions.legendaryBoss||[]).length,main:ordinary.length,repair:(module.repairQuestions||[]).length,repairSeed:(module.repairSeedQuestions||[]).length};
 const diff={easy:(module.questions.easy||[]).length+(module.questions.boss||[]).filter(q=>q.difficulty==='easyBoss').length,medium:(module.questions.medium||[]).length+(module.questions.boss||[]).filter(q=>q.difficulty==='mediumBoss').length,hard:(module.questions.hard||[]).length+(module.questions.boss||[]).filter(q=>q.difficulty==='finalBoss').length,elite:(module.questions.elite||[]).length,legendary:(module.questions.legendary||[]).length+(module.questions.legendaryBoss||[]).length,unknown:(module.repairQuestions||[]).length+(module.repairSeedQuestions||[]).length+(module.bridgeQuestions||[]).length};
 Object.assign(entry,{includedSkills:[...new Set(records.map(q=>q.primarySkill).filter(Boolean))].sort(),questionCountByRole:roleCounts,questionCountByDifficulty:diff,repairCoverage:{directSkillMatches:(module.repairQuestions||[]).length,mainWithUsableSkill:records.length},bridgeCoverage:{directSkillMatches:(module.bridgeQuestions||[]).length,mainWithUsableSkill:records.length},calculationCoverage:records.filter(calcLinked).length,graphCoverage:records.filter(graphLinked).length,instructionalClassification:role==='protected'?'Deep family component; engine-safe alone':'Engine-safe growth/productivity family slice',coverageStatus:'ready-family-slice',coverageStatusLabel:'Engine-safe alone; deepest in F3 family',coverageStatusNote:'Phase M2b-3 supplies solo floors with controlled reuse and family-first progression, including GROWTH-01 catch-up analysis.',coverageFloorVersion:PHASE,notes:'Growth and Productivity family slice. GROWTH-01 supports catch-up, diminishing-return, and productivity-transfer questions without requiring additional graph assets.'});
}
for(const conceptId of familyIds)for(const list of [library.registry.concepts,registry.concepts]){const entry=list.find(item=>item.canonicalConceptId===conceptId);if(!entry)throw new Error(`Registry entry missing ${conceptId}`);updateRegistryEntry(entry,library.concepts[conceptId],conceptId===protectedContentId?'protected':'modified');}

const lsgContentAfter=contentBankHash(library.concepts[protectedContentId]);
if(lsgContentAfter!==lsgContentBefore)throw new Error('Living Standards question content changed; only bossStage metadata was authorized.');
for(const [id,hash] of Object.entries(protectedBefore))if(id!==protectedContentId&&bankHash(library.concepts[id])!==hash)throw new Error(`Protected bank changed ${id}`);
const protectedAfter=Object.fromEntries(protectedIds.map(id=>[id,bankHash(library.concepts[id])]));
const protectedMismatches=protectedIds.filter(id=>id!==protectedContentId&&protectedAfter[id]!==protectedBefore[id]);

library.libraryVersion=`${previousVersion}-${PHASE}`;library.sourceCurationPhase=PHASE;library.generatedAt=STAMP;library.canonicalQuestionCount=Object.values(library.concepts).reduce((sum,module)=>sum+unique(module).length,0);
Object.assign(library.registry,{libraryVersion:library.libraryVersion,generatedAt:STAMP,canonicalQuestionCount:library.canonicalQuestionCount});
Object.assign(registry,{libraryVersion:library.libraryVersion,generatedAt:STAMP,canonicalQuestionCount:library.canonicalQuestionCount});
delete library.librarySha256;library.librarySha256=sha(JSON.stringify(stable(library)));registry.librarySha256=library.librarySha256;
Object.assign(manifest,{assetCount:manifest.assets.length,canonicalQuestionCount:library.canonicalQuestionCount,libraryVersion:library.libraryVersion,librarySha256:library.librarySha256,generatedAt:STAMP});

const familyBefore=Object.values(beforeCounts).reduce((out,count)=>{for(const [key,value] of Object.entries(count))out[key]=(out[key]||0)+value;return out;},{});
const familyAfter=Object.values(afterCounts).reduce((out,count)=>{for(const [key,value] of Object.entries(count))out[key]=(out[key]||0)+value;return out;},{});
const provenance={phase:PHASE,generatedAt:STAMP,scope:{family:'F3 — Growth and Productivity',protectedQuestionContent:[protectedContentId],modifiedCanonicalConceptIds:modifiedIds,metadataOnlyConceptIds:[protectedContentId]},before:{libraryVersion:previousVersion,canonicalQuestionCount:beforeTotal,counts:beforeCounts,familyCounts:familyBefore,livingStandardsContentSha256:lsgContentBefore},after:{libraryVersion:library.libraryVersion,canonicalQuestionCount:library.canonicalQuestionCount,librarySha256:library.librarySha256,counts:afterCounts,familyCounts:familyAfter,protectedMismatchCount:protectedMismatches.length,livingStandardsContentSha256:lsgContentAfter},protectedSummary:{canonicalBanksChecked:protectedIds.length,nonF3Mismatches:protectedMismatches,livingStandardsQuestionContentUnchanged:lsgContentBefore===lsgContentAfter},graph:{filename:'GROWTH-01.webp',sha256:graphSha,sizeBytes:imageBytes.length,conceptCopies:modifiedIds,questionCount:graphQuestionIds.length,imageAlt,graphDescription},quality:{introducedExact,introducedNumberSwaps,answerLengthIssues:lengthIssues}};
const sourceData={phase:PHASE,generatedAt:STAMP,scope:modifiedIds,changes,summary:{added,bossStageFixed:changes.filter(c=>c.action==='BOSS_STAGE_FIX').length,removed:0,relocated:0,graphQuestions:graphQuestionIds.length},authoringPolicy:{soloFloors:{easy:6,medium:6,hard:6,easyBoss:3,mediumBoss:3,finalBoss:3,legendary:6,legendaryBoss:3,repair:1,bridge:1},maximumAdditions:47,actualAdditions:added,protectedQuestionContent:[protectedContentId],graphAsset:'GROWTH-01.webp'},quality:provenance.quality};

if(!dryRun){
 fs.writeFileSync(libraryPath,`window.MQ_COMPOSER_LIBRARY=${JSON.stringify(library)};\n`);
 fs.writeFileSync(registryPath,JSON.stringify(registry,null,2)+'\n');
 fs.writeFileSync(manifestPath,JSON.stringify(manifest,null,2)+'\n');
 fs.writeFileSync(path.join(composer,`${PHASE}_questions.json`),JSON.stringify(sourceData,null,2)+'\n');
 fs.writeFileSync(path.join(composer,`${PHASE}.json`),JSON.stringify(provenance,null,2)+'\n');
 for(const file of [path.join(repo,'build','index.html'),path.join(composer,'index.html')]){const text=fs.readFileSync(file,'utf8').replaceAll('20260810-macro-m2b2-inflation-v1','20260810-macro-m2b3-growth-v1');fs.writeFileSync(file,text);}
}
console.log(JSON.stringify({dryRun,phase:PHASE,beforeTotal,afterTotal:library.canonicalQuestionCount,added,bossStageFixed:changes.filter(c=>c.action==='BOSS_STAGE_FIX').length,beforeCounts,afterCounts,familyBefore,familyAfter,graphQuestions:graphQuestionIds.length,graphSha,protectedMismatches,livingStandardsQuestionContentUnchanged:lsgContentBefore===lsgContentAfter,introducedExact,introducedNumberSwaps,lengthIssues},null,2));
