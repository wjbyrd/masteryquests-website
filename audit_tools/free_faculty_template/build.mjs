import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const require=createRequire(import.meta.url);
const root=fileURLToPath(new URL('../..',import.meta.url));
const dir=path.join(root,'audit_tools/free_faculty_template');
const target=path.join(root,'downloads/resources');
const core=require(path.join(root,'build/faculty-build-composer/composer-core.js'));
const template=fs.readFileSync(path.join(root,'build/faculty-build-composer/template/mastery-quests-faculty-template-composer-ready.html'),'utf8');
const readConst=name=>vm.runInNewContext('('+template.match(new RegExp(`const ${name} = (\\{[\\s\\S]*?\\n\\});`))[1]+')');
const requirements={pools:readConst('FACULTY_POOL_REQUIREMENTS'),modes:readConst('FACULTY_MODE_REQUIREMENTS'),overrides:readConst('FACULTY_MODE_POOL_MINIMUMS')};
const pools=Object.keys(requirements.pools).filter(x=>!['repair','bridge'].includes(x));
const empty=()=>({banks:Object.fromEntries(pools.map(p=>[p,[]])),repairQuestions:[],bridgeQuestions:[],objectiveLabels:{},embeddedQuestionAssets:{},questionAssetMetadata:{}});
const blank=empty(),sample=empty();
sample.objectiveLabels={NUM1:'Interpret addition and quantities on a bar chart'};
let id=1;
for(const pool of Object.keys(requirements.pools)){
  const dest=pool==='repair'?sample.repairQuestions:pool==='bridge'?sample.bridgeQuestions:sample.banks[pool];
  const difficulty=pool==='easyBoss'?'easy':pool==='mediumBoss'?'medium':pool==='finalBoss'?'hard':pool==='legendaryBoss'?'legendary':['repair','bridge'].includes(pool)?'easy':pool;
  for(let i=0;i<Math.max(requirements.pools[pool],['easy','medium','hard','elite','legendary'].includes(pool)?12:3);i++){
    const n=id++;
    dest.push({id:`demo-${n}`,q:`Practice ${n}: What is ${n} + 2?`,options:[String(n+2),String(n+1),String(n+3),String(n)],a:0,tag:'numeracy',type:'calculation',objective:'NUM1',difficulty,primarySkill:'addition',repairSkill:'addition',feedback:`Add two to ${n} to get ${n+2}. This starter demonstrates the workflow; replace it with your course content.`});
  }
}
const svg='<svg xmlns="http://www.w3.org/2000/svg" width="640" height="360" viewBox="0 0 640 360"><rect width="640" height="360" fill="white"/><g font-family="Arial" font-size="24" fill="#142d49"><text x="30" y="40">Items in two groups</text><path d="M80 80V280H590" stroke="#142d49" stroke-width="3" fill="none"/><rect x="150" y="180" width="100" height="100" fill="#116877"/><rect x="350" y="80" width="100" height="200" fill="#4338a6"/><text x="170" y="170">2</text><text x="370" y="70">4</text><text x="145" y="320">Group A</text><text x="345" y="320">Group B</text></g></svg>';
sample.embeddedQuestionAssets['sample-bars.svg']='data:image/svg+xml;base64,'+Buffer.from(svg).toString('base64');
sample.questionAssetMetadata['sample-bars.svg']={imageAlt:'Bar chart comparing two groups of items.',graphDescription:'Group A contains 2 items. Group B contains 4 items. The vertical axis starts at zero. Group B has twice as many items.'};
for(let i=0;i<12;i++)Object.assign(sample.banks.easy[i],{q:`Graph practice ${i+1}: How many items do groups A and B contain altogether?`,options:['6','2','4','8'],a:0,type:'graph',image:'sample-bars.svg',graphRequired:true,feedback:'Group A has 2 items and group B has 4. Together they contain 6 items.'});
const serialize=value=>JSON.stringify(value,null,2).replace(/</g,'\\u003c');
function generate(data,title,namespace){
  let result=template.replace('// This region is replaced by the Faculty Concept Composer.','// MANUAL SETTINGS — edit title, slug, compositionId, saveKeyNamespace and supportedModes here.\n// Keep a unique saveKeyNamespace for each distinct game. Keep all other engine code unchanged.\n// See manual-faculty-guide.html for assets, settings and the pre-release checklist.');
  const config=readConst('FACULTY_COMPOSITION_CONFIG');Object.assign(config,{title,slug:namespace,compositionId:namespace,saveKeyNamespace:namespace,allowAnonymousDataCollection:false});
  result=result.replace(/const FACULTY_COMPOSITION_CONFIG = \{[\s\S]*?\n\};/,`const FACULTY_COMPOSITION_CONFIG = ${serialize(config)};`);
  const start=result.indexOf('// FACULTY QUESTION BANKS — SAFE TO EDIT'),end=result.indexOf('// END FACULTY QUESTION BANKS',start);
  result=result.slice(0,start)+`// FACULTY QUESTION BANKS — SAFE TO EDIT
// Replace ONLY the JSON between MANUAL PACKAGE START and MANUAL PACKAGE END.
// Validate it with tools/question-bank-validator first. No JavaScript, comments or trailing commas.
// Use the sample JSON to learn the structure. Blank mode launch blocks are intentional.
const MANUAL_QUESTION_PACKAGE =
// MANUAL PACKAGE START
${serialize(data)}
// MANUAL PACKAGE END
;
// PROTECTED MANUAL ADAPTER — regenerated from the maintained Composer source.
const questionBanks = MANUAL_QUESTION_PACKAGE.banks;
const objectiveLabels = MANUAL_QUESTION_PACKAGE.objectiveLabels || {};
const embeddedQuestionAssets = MANUAL_QUESTION_PACKAGE.embeddedQuestionAssets || {};
const questionAssetMetadata = MANUAL_QUESTION_PACKAGE.questionAssetMetadata || {};
const manualMainQuestions = ['easy','medium','hard','elite','legendary'].flatMap(pool => questionBanks[pool] || []);
const trialGraphQuestionIds = manualMainQuestions.filter(q => q.graphRequired === true && q.image).map(q => q.id ?? q.questionId);
const fadingFortuneQuestionIds = manualMainQuestions.filter(q => Array.isArray(q.options) && q.options.length === 4).map(q => q.id ?? q.questionId);
const riskRewardQuestionIds = [...fadingFortuneQuestionIds];
const facultyQuestionValidator = ${core.validateFacultyQuestionRecord.toString()};
const repairQuestions = MANUAL_QUESTION_PACKAGE.repairQuestions || [];
const bridgeQuestions = MANUAL_QUESTION_PACKAGE.bridgeQuestions || [];
const microSkillRepairPools = MANUAL_QUESTION_PACKAGE.microSkillRepairPools || {};
const skillRepairSeedPools = MANUAL_QUESTION_PACKAGE.skillRepairSeedPools || {};
const microSkillBridgePools = MANUAL_QUESTION_PACKAGE.microSkillBridgePools || {};
// =====================================================
`+result.slice(end);
  return result.replace(/^[\t ]+$/gm,'');
}
fs.writeFileSync(path.join(target,'mastery-quests-faculty-template.html'),generate(blank,'Blank Faculty Quest','manual-faculty-quest'));
fs.writeFileSync(path.join(target,'mastery-quests-faculty-starter.html'),generate(sample,'Faculty Starter Practice','manual-starter-demo'));
fs.writeFileSync(path.join(target,'faculty-question-package-blank.json'),serialize(blank)+'\n');
fs.writeFileSync(path.join(target,'faculty-question-package-example.json'),serialize(sample)+'\n');
fs.writeFileSync(path.join(target,'sample-bars.svg'),svg);
const validator=`/* Generated by audit_tools/free_faculty_template/build.mjs; do not edit this copy. */\nglobalThis.MQFacultyRecordValidator = ${core.validateFacultyQuestionRecord.toString()};\nglobalThis.MQFacultyRequirements = ${JSON.stringify(requirements)};\n`+fs.readFileSync(path.join(dir,'package-validator.js'),'utf8');
fs.mkdirSync(path.join(root,'tools/question-bank-validator'),{recursive:true});
fs.writeFileSync(path.join(root,'tools/question-bank-validator/validator.js'),validator);
console.log('Generated manual blank, working starter, JSON packages and canonical validator. Shared engine source unchanged.');
