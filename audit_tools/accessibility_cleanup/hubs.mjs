import fs from 'node:fs';
const files=['economic-realm','macro-command-system','micro-domains','managerial-intelligence-directorate','managerial-directorate-classroom','managerial-directorate-telemetry-poc'].map(g=>`play/${g}/index.html`);
const css=`.mq-motion-setting{display:flex;flex-wrap:wrap;align-items:center;gap:8px;font:inherit;color:inherit;margin:8px 0}
.mq-motion-setting select{font:inherit;max-width:100%;padding:8px;border:1px solid currentColor;border-radius:6px;background:#07111e;color:#eef6ff}
:focus-visible{outline:3px solid #8bdcff;outline-offset:4px}
[role=dialog]{overflow:auto;box-sizing:border-box;max-height:100dvh}
html.mq-motion-paused *,html.mq-motion-paused *::before,html.mq-motion-paused *::after{animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.001ms!important;scroll-behavior:auto!important}`;
const block=`<!-- MQ HUB ACCESSIBILITY START -->\n<style>${css}</style>\n<script>${fs.readFileSync('build/faculty-build-composer/template/motion-preference.js','utf8')}\n${fs.readFileSync('audit_tools/accessibility_cleanup/hub-runtime.js','utf8')}</script>\n<!-- MQ HUB ACCESSIBILITY END -->`;
for(const file of files){
 const original=fs.readFileSync(file,'utf8');
 const a=original.indexOf('<!-- MQ HUB ACCESSIBILITY START -->'),b=original.indexOf('<!-- MQ HUB ACCESSIBILITY END -->');
 const html=a<0?original.replace('</body>',block+'\n</body>'):original.slice(0,a)+block+original.slice(b+'<!-- MQ HUB ACCESSIBILITY END -->'.length);
 if(html!==original){const temporary=file+'.a11y-tmp';fs.writeFileSync(temporary,html);fs.renameSync(temporary,file);}
}
console.log('Synchronized six collection hubs.');
