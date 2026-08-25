'use strict';

const fs = require('fs');
const os = require('os');
const path = require('path');
const {spawnSync} = require('child_process');

const ACTIVE_RUNNERS = [
  'run_phase1_targeted_repair_validation.js',
  'run_phase15_production_hardening_validation.js',
  'run_phase3a_official_theme_validation.js',
  'run_concept_review_integration.js',
  'run_mastery_report_concept_reviews.js',
  'run_mastery_report_2_validation.js',
  'run_mastery_report_state_leak_hotfix.js',
  'run_mode_availability_fix.js',
  'run_quiz_mode_validation.js',
  'run_unlimited_practice_validation.js',
  'run_trial_by_graph_validation.js',
  'run_fading_fortune_validation.js',
  'run_risk_reward_validation.js',
  'run_risk_reward_state_validation.js'
];

function run(){
  const outputRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'mq-active-composer-tests-'));
  const results = [];
  try{
    for(const runner of ACTIVE_RUNNERS){
      const started = Date.now();
      const child = spawnSync(process.execPath, [path.join(__dirname, runner)], {
        cwd:path.resolve(__dirname, '..', '..', '..'),
        encoding:'utf8',
        env:{...process.env, MQ_COMPOSER_TEST_OUTPUT_DIR:outputRoot},
        maxBuffer:32 * 1024 * 1024
      });
      const passed = child.status === 0;
      results.push({runner, passed, durationMs:Date.now() - started});
      console.log(`${passed ? 'PASS' : 'FAIL'} ${runner}`);
      if(!passed){
        if(child.stdout) process.stdout.write(child.stdout);
        if(child.stderr) process.stderr.write(child.stderr);
      }
    }
  } finally {
    fs.rmSync(outputRoot, {recursive:true, force:true});
  }
  const failed = results.filter(result => !result.passed);
  console.log(JSON.stringify({ok:failed.length === 0, total:results.length, passed:results.length - failed.length, failed}, null, 2));
  if(failed.length) process.exitCode = 1;
}

run();
