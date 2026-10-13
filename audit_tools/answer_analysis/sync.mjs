import fs from 'node:fs';
import {fn} from '../economic_realm_engine/source.mjs';
const runtime=fs.readFileSync('audit_tools/telemetry_contract/runtime.js','utf8');
const registry=JSON.parse(fs.readFileSync('audit_tools/telemetry_contract/registry.json','utf8'));
const block='  // BEGIN MEASUREMENT CONTRACT\n'+runtime+'\n  const MQContract=createTelemetryContract((name,fallback)=>{try{return eval(name);}catch(_){return fallback;}}, /* RELEASE REGISTRY */ '+JSON.stringify(registry)+');\n  // END MEASUREMENT CONTRACT';
// The one active Micro game retains its original engine. Install only measurement hooks.
const file='play/micro-domains/labyrinth-of-choice/index.html';
let source=fs.readFileSync(file,'utf8');
if(source.includes('// BEGIN MEASUREMENT CONTRACT'))source=source.replace(/  \/\/ BEGIN MEASUREMENT CONTRACT[\s\S]*?  \/\/ END MEASUREMENT CONTRACT/,block);
else {
  source=source.replace('const TELEMETRY_COLUMNS = [',block+'\nconst TELEMETRY_COLUMNS = [');
  source=source.replace(/const TELEMETRY_COLUMNS = \[([\s\S]*?)\n\];/,(_,body)=>'const TELEMETRY_COLUMNS = ['+body+',\n    '+JSON.stringify(['contractID','manifestID','provenanceStatus','presentationID','attemptID','canonicalSelectedIndex','localSequence','manifestJSON','deliveryQuality','supportJSON','originAttemptID','resourceID','answerSnapshotJSON']).slice(1,-1)+'\n];');
  source=source.replaceAll('        records.push(record);','        MQContract.stamp(record,data);\n        records.push(record);');
  source=source.replace('...records.map(record => TELEMETRY_COLUMNS.map','...MQContract.exportRows(records,resolvedRunID).map(record => TELEMETRY_COLUMNS.map');
  const shuffle=fn(source,'shuffleOptions');
  const updated=shuffle.replace('    // Faculty source questions',
    '    q.telemetryOptionIndices=Array.isArray(question.telemetryOptionIndices)?[...question.telemetryOptionIndices]:q.options.map((_,i)=>i);\n    q.telemetryContentRevision=question.telemetryContentRevision||MQContract.build().contentRevision;\n    // Faculty source questions')
    .replace('[q.options[i], q.options[j]] = [q.options[j], q.options[i]];',
      '[q.options[i], q.options[j]] = [q.options[j], q.options[i]];\n        [q.telemetryOptionIndices[i],q.telemetryOptionIndices[j]]=[q.telemetryOptionIndices[j],q.telemetryOptionIndices[i]];');
  source=source.replace(shuffle,updated);
  const end=source.lastIndexOf('</script>');
  source=source.slice(0,end)+`\n// Answer-analysis presentation IDs; gameplay remains in the original function.
const displayQuestionBeforeAnswerTelemetry=displayQuestion;
displayQuestion=function(...args){const result=displayQuestionBeforeAnswerTelemetry.apply(this,args);try{MQContract.show();}catch(_){}return result;};
MQContract.build();
`+source.slice(end);
}
fs.writeFileSync(file,source);
// Public Managerial adapters use a separate registry to retain explicit release identity.
fs.writeFileSync('audit_tools/telemetry_contract/public-release-registry.json',JSON.stringify(registry,null,2)+'\n');
console.log('PASS: Micro measurement hooks and public answer-data release registry.');
