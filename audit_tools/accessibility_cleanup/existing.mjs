import fs from 'node:fs';import path from 'node:path';import {spawn} from 'node:child_process';
const runtime=path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules');
const groups={
 faculty:['build/faculty-build-composer/tests/run_content_scope_browser_validation.cjs','audit_tools/answer_analysis/class-browser.mjs','audit_tools/free_faculty_template/browser.mjs'],
 puzzle:['audit_tools/econnections/browser.test.mjs'],
 current:['audit_tools/econ_rpg/labor-force-files-ui.browser.test.mjs','audit_tools/econ_rpg/labor-force-files-summary.browser.test.mjs'],
 simulations:['audit_tools/econ_rpg/browser.test.mjs','audit_tools/econ_rpg/cpi-live.browser.test.mjs','audit_tools/econ_rpg/gdp-live.browser.test.mjs','audit_tools/econ_rpg/labor-force-files.browser.test.mjs','audit_tools/econ_rpg/takeout-taco.browser.test.mjs','audit_tools/econ_rpg/takeout-taco-cost.browser.test.mjs','audit_tools/econ_rpg/investment-desk.browser.test.mjs','audit_tools/econ_rpg/road-ahead.browser.test.mjs']
};
const group=process.argv[2]||'faculty',out=path.resolve('validation_artifacts/accessibility_cleanup/existing',process.argv[3]||group);fs.mkdirSync(out,{recursive:true});const results=[];
for(const file of groups[group].filter(file=>!process.argv[4]||file.includes(process.argv[4]))){
 const name=path.basename(file),testOut=path.join(out,name);fs.mkdirSync(testOut,{recursive:true});
 let source=fs.readFileSync(file,'utf8');
 // Preserve historical evidence. Only output destinations change in the temporary copy.
 source=source.replaceAll("'tmp/econ-rpg/","'tmp/accessibility_cleanup/existing/").replaceAll("'../../tmp/econ-rpg/","'../../tmp/accessibility_cleanup/existing/")
  .replace("path.join(sourceRoot, 'tmp', 'econnections')","path.join(sourceRoot, 'tmp', 'accessibility_cleanup', 'econnections')")
  .replace("path.join(root,'tmp/class-analysis-browser')","path.join(root,'tmp/accessibility_cleanup/class-analysis-browser')")
  .replace("path.resolve('validation_artifacts/free_faculty_template_parity/browser')","path.resolve('validation_artifacts/accessibility_cleanup/existing/manual-browser')");
 const temporary=path.join(path.dirname(file),'__accessibility_'+name);fs.writeFileSync(temporary,source);
 const log=fs.openSync(path.join(testOut,'output.log'),'w');
 const started=Date.now();let code;
 try{code=await new Promise(resolve=>{const child=spawn(process.execPath,['--require',path.resolve('audit_tools/accessibility_cleanup/browser-guard.cjs'),temporary],{env:{...process.env,PLAYWRIGHT_MODULE:path.join(runtime,'playwright'),MQ_PLAYWRIGHT_MODULE:path.join(runtime,'playwright'),MQ_COMPOSER_TEST_OUTPUT_DIR:testOut,NODE_PATH:runtime},stdio:['ignore',log,log],windowsHide:true});child.on('exit',resolve);});}
 finally{fs.closeSync(log);fs.unlinkSync(temporary);}
 results.push({file,exitCode:code,seconds:(Date.now()-started)/1000,log:path.relative(process.cwd(),path.join(testOut,'output.log'))});fs.writeFileSync(path.join(out,'results.json'),JSON.stringify(results,null,2));console.log(name,code===0?'PASS':'FAIL');
}
if(results.some(r=>r.exitCode!==0))process.exitCode=1;
