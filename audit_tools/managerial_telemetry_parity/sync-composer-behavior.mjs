import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {fileURLToPath} from 'node:url';
import {classroomClient} from '../managerial_classroom/build.mjs';

const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'../..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8').replace(/\r\n/g,'\n');
const template=read('build/faculty-build-composer/template/mastery-quests-faculty-template-composer-ready.html');
const start='function createQuestionVisibilityTimingState(){',end='function getQuestionBehaviorData(';
assert(template.includes(start)&&template.includes(end),'Composer reference boundaries changed; review before syncing.');
const helpers=template.slice(template.indexOf(start),template.indexOf(end));
const clientPath=path.join(root,'play/managerial-directorate-telemetry-poc/telemetry-client.js');
const client=fs.readFileSync(clientPath,'utf8').replace(/\r\n/g,'\n');
const first=client.indexOf(start),last=client.indexOf('    return {reset:resetQuestionVisibilityTiming');
assert(first>0&&last>first,'Missing generated region');
const next=client.slice(0,first)+helpers+client.slice(last);
if(process.argv.includes('--check')){
  assert.equal(client,next,'Composer behavior changed; review parity and regenerate');
  assert.equal(read('play/managerial-directorate-classroom/telemetry-client.js'),classroomClient(root),'Classroom client is stale');
}else{
  fs.writeFileSync(clientPath,next);
  fs.writeFileSync(path.join(root,'play/managerial-directorate-classroom/telemetry-client.js'),classroomClient(root));
}
console.log('PASS: Composer behavioral helpers and derived classroom client are synchronized.');
