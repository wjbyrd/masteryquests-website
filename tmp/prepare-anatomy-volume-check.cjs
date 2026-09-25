const fs=require('node:fs');let s=fs.readFileSync('tmp/the-long-run-anatomy-anchor-check.cjs','utf8');
s=s.replaceAll('pre-anatomy-anchor','pre-anatomy-volume').replaceAll('long-run-anatomy-anchor-','long-run-anatomy-volume-');
s=s.replace("assert.equal(section(now,'function vehicleFrames(','const sprites='),section(old,'function vehicleFrames(','const sprites='));",'');
s=s.replace('[44,22]','[46,28]').replace('[50,22]','[52,28]').replace('[56,24]','[58,31]').replace('contact-6<196','contact-7<196');
fs.writeFileSync('tmp/the-long-run-anatomy-volume-check.cjs',s);
