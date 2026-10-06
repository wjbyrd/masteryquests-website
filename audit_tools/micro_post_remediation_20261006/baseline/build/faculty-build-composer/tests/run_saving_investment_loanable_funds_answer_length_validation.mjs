import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { productionQuestions } from "../authoring/saving_investment_loanable_funds_question_pool_author.mjs";

const here=path.dirname(fileURLToPath(import.meta.url));
const wordCount=value=>(String(value).trim().match(/[\p{L}\p{N}$%]+(?:[-'’][\p{L}\p{N}]+)*/gu)||[]).length;
const qualifiers=/\b(?:always|never|necessarily|must|only|all|every|exactly|unambiguously|otherwise|all else equal)\b/gi;
const rankCounts={first:0,second:0,third:0,fourth:0,tiedLongest:0};
let longest=0,uniqueLongest=0,extreme=0,correctWords=0,distractorWords=0,correctQualifiers=0,distractorQualifiers=0;
const extremes=[];
for(const question of productionQuestions){
  const options=[question.answer,...question.distractors],lengths=options.map(wordCount),correct=lengths[0],distractorAverage=lengths.slice(1).reduce((sum,value)=>sum+value,0)/3,max=Math.max(...lengths);
  correctWords+=correct;distractorWords+=lengths.slice(1).reduce((sum,value)=>sum+value,0);
  correctQualifiers+=(question.answer.match(qualifiers)||[]).length;
  distractorQualifiers+=question.distractors.reduce((sum,option)=>sum+(option.match(qualifiers)||[]).length,0);
  if(correct===max){longest+=1;if(lengths.filter(value=>value===max).length===1)uniqueLongest+=1;else rankCounts.tiedLongest+=1;}
  const ordered=[...lengths].sort((a,b)=>b-a),rank=ordered.indexOf(correct);rankCounts[["first","second","third","fourth"][rank]]+=1;
  const ratio=correct/Math.max(1,distractorAverage);if(ratio>=1.8){extreme+=1;extremes.push({id:question.id,ratio:Number(ratio.toFixed(2))});}
}
const total=productionQuestions.length;
const metrics={
  total,
  longestCorrectPercent:Number((100*longest/total).toFixed(2)),
  uniquelyLongestCorrectPercent:Number((100*uniqueLongest/total).toFixed(2)),
  averageCorrectWords:Number((correctWords/total).toFixed(2)),
  averageDistractorWords:Number((distractorWords/(total*3)).toFixed(2)),
  averageLengthRatio:Number(((correctWords/total)/(distractorWords/(total*3))).toFixed(3)),
  rankDistribution:rankCounts,
  qualifierRates:{correctPerOption:Number((correctQualifiers/total).toFixed(3)),distractorPerOption:Number((distractorQualifiers/(total*3)).toFixed(3))},
  extremeRatioPercent:Number((100*extreme/total).toFixed(2)),
  extremeRecords:extremes
};
const errors=[];
if(metrics.uniquelyLongestCorrectPercent>30)errors.push("Uniquely-longest correct answers exceed 30%.");
if(metrics.averageLengthRatio<0.8||metrics.averageLengthRatio>1.25)errors.push("Average correct/distractor length ratio is outside 0.80–1.25.");
if(metrics.extremeRatioPercent>5)errors.push("Extreme correct/distractor length ratios exceed 5%.");
if(Math.abs(metrics.qualifierRates.correctPerOption-metrics.qualifierRates.distractorPerOption)>0.2)errors.push("Qualifier asymmetry exceeds 0.20 per option.");
const result={status:errors.length?"FAIL":"PASS",errors,metrics,note:"Longest-correct includes ties; uniquely-longest and ratio measures carry the cueing threshold."};
const outputRoot=process.env.MQ_COMPOSER_TEST_OUTPUT_DIR||here,outputPath=process.env.MQ_COMPOSER_TEST_OUTPUT_DIR?path.join(outputRoot,"tests","saving-investment-loanable-funds-answer-length-results.json"):path.join(here,"saving-investment-loanable-funds-answer-length-results.json");
fs.mkdirSync(path.dirname(outputPath),{recursive:true});fs.writeFileSync(outputPath,`${JSON.stringify(result,null,2)}\n`);
console.log(JSON.stringify(result,null,2));
if(errors.length)process.exit(1);
