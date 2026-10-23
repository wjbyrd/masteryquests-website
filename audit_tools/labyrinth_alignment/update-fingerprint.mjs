// Refresh only this edited artifact's existing engine fingerprint, without regenerating
// any other collection or changing the measurement release, tracker, or CSV schema.
import fs from 'node:fs';
import {createHash} from 'node:crypto';
import assert from 'node:assert/strict';
const file='play/micro-domains/labyrinth-of-choice/index.html';
const html=fs.readFileSync(file,'utf8').replace(/\r\n/g,'\n');
const stripped=html.replace(/  \/\/ BEGIN MEASUREMENT CONTRACT[\s\S]*?  \/\/ END MEASUREMENT CONTRACT/g,'');
const revision=createHash('sha256').update(stripped).digest('hex');
const pattern=/(\/\* RELEASE REGISTRY \*\/ )(\{[^\n]+\})(\);)/;
const match=html.match(pattern);assert(match,'Missing embedded release registry');
const registry=JSON.parse(match[2]);
for(const key of ['labyrinth-of-choice','labyrinth-choice']){
    assert(registry.games[key],key);
    if(process.argv.includes('--check'))assert.equal(registry.games[key].engineRevision,revision,key);
    registry.games[key].engineRevision=revision;
}
if(!process.argv.includes('--check'))fs.writeFileSync(file,html.replace(pattern,(_,before,_json,after)=>before+JSON.stringify(registry)+after));
console.log('PASS: Labyrinth artifact fingerprint '+revision);
