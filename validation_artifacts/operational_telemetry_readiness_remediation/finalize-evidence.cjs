const fs = require('node:fs');
const cp = require('node:child_process');
const crypto = require('node:crypto');
const assert = require('node:assert/strict');
const dir = __dirname;
const root = process.cwd();
const read = name => JSON.parse(fs.readFileSync(`${dir}/${name}`, 'utf8'));
const git = args => cp.execFileSync('git', args, {encoding:'utf8'}).trim();
const pre = read('preflight.json');
assert.equal(root.toLowerCase(), pre.cwd.toLowerCase());
assert.equal(git(['rev-parse','--show-toplevel']).toLowerCase(), pre.root.toLowerCase());
assert.equal(git(['rev-parse','HEAD']), pre.head);
const inventory = read('field-inventory-diff.json');
assert.equal(inventory.before, inventory.after);
assert.deepEqual(inventory.added, []);
assert.deepEqual(inventory.removed, []);
const protectedPaths = Object.keys(pre.hashes).filter(p => /^(play\/(macro-command-system|micro-domains)\/|concept-reviews\/|games\/|build\/faculty-build-composer\/data\/|server\/anonymous-telemetry-poc\/migrations\/)/.test(p) || /nationalengine\.html$|question.bank|manuscript/i.test(p) || inventory.unchangedSources.includes(p) || ['TELEMETRY_CONTRACT.md','TELEMETRY_GOVERNANCE.md'].includes(p));
const checked = protectedPaths.map(path => {
  const hash = crypto.createHash('sha256').update(fs.readFileSync(path)).digest('hex');
  assert.equal(hash, pre.hashes[path], `Protected file changed: ${path}`);
  return {path, sha256:hash};
});
const privateHtml = Object.keys(pre.hashes).filter(p => /^play\/managerial-directorate-(classroom|telemetry-poc)\/[^/]+\/index\.html$/.test(p));
assert.equal(privateHtml.length, 8);
for (const path of privateHtml) {
  const before = cp.execFileSync('git',['show',`HEAD:${path}`],{encoding:'utf8'});
  const after = fs.readFileSync(path,'utf8');
  const normalize = text => text.replace(/\r\n/g,'\n').replace(/<meta name="anonymous-telemetry-collection" content="[^"]*">/g,'');
  assert.equal(normalize(before), normalize(after), path);
  assert.match(after, /<meta name="anonymous-telemetry-collection" content="disabled">/);
}
const suites = ['remediation-results.json','targeted-results.json','parity-results.json','governance-results.json','scheduled-results.json','existing-browser/browser-results.json','private-browser/browser-results.json','public-browser/results.json'].map(path => {
  const result=read(path); assert.equal(result.failed,0,path);
  return {path,passed:result.passed,failed:result.failed};
});
const composer = fs.readFileSync(`${dir}/composer-suite.log`,'utf8');
assert.match(composer,/"ok": true/); assert.match(composer,/"passed": 27/);
suites.push({path:'composer-suite.log',passed:27,failed:0});
const commands = [
 ['audit_tools/telemetry_data_dictionary/check.mjs'],
 ['audit_tools/telemetry_governance/render.mjs','--check'],
 ['audit_tools/telemetry_contract/generate.mjs','--check'],
 ['audit_tools/published_managerial_parity/sync.mjs','--check'],
 ['audit_tools/telemetry_governance/composer-transport.mjs','--check'],
 ['audit_tools/anonymous_telemetry_poc/create_private_build.mjs','.','--check']
].map(args => ({command:`node ${args.join(' ')}`,output:cp.execFileSync(process.execPath,args,{encoding:'utf8'}).trim(),status:'PASS'}));
git(['-c','core.safecrlf=false','diff','--check']);
const disposition = {B1:'CLOSED',I1:'CLOSED — build-scoped pseudonym implemented and documented',I2:'DOCUMENTED EXCEPTION / NON-BLOCKING FOR ANONYMOUS D1 ACTIVATION; National Engine unchanged',I3:'OWNER-ACCEPTED OPERATIONAL LIMITATION; CSV serialization and rate parsing hardened'};
fs.writeFileSync(`${dir}/disposition.json`,JSON.stringify(disposition,null,2)+'\n');
const evidence = {task:pre.task,root,head:pre.head,branch:git(['branch','--show-current']),verdict:'READY FOR CONTROLLED ACTIVATION',productionState:'NOT DEPLOYED / NOT MUTATED',scope:{forbiddenWorkspaceUsed:false,productionPost:false,productionD1Operation:false,productionSecretOrCronMutation:false,commitOrPush:false},fieldInventory:inventory,protectedFiles:{count:checked.length,files:checked},privateHtmlOnlyCollectionMetaChanged:privateHtml,suites,generatedAndPolicyChecks:commands,whitespace:'git diff --check PASS',disposition};
fs.writeFileSync(`${dir}/final-readiness-evidence.json`,JSON.stringify(evidence,null,2)+'\n');
console.log(JSON.stringify({verdict:evidence.verdict,protectedFiles:checked.length,suites,checks:commands.length},null,2));
