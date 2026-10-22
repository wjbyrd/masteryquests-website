import fs from 'node:fs';
const files=['economic-realm','macro-command-system','micro-domains','managerial-intelligence-directorate','managerial-directorate-classroom','managerial-directorate-telemetry-poc'].map(g=>`play/${g}/index.html`);
const css=`#hubMotionControl{position:relative;display:block;margin:12px auto;z-index:10000;padding:9px 12px;border:1px solid #8bdcff;border-radius:8px;background:#07111e;color:#eef6ff;font:inherit;font-size:12px;max-width:calc(100% - 16px);white-space:normal;cursor:pointer}
#hubMotionControl.hub-splash-motion{position:fixed;top:8px;left:8px;margin:0}
:focus-visible{outline:3px solid #8bdcff;outline-offset:4px}
[role=dialog]{overflow:auto;box-sizing:border-box;max-height:100dvh}
html.hub-motion-paused *,html.hub-motion-paused *::before,html.hub-motion-paused *::after{animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.001ms!important;scroll-behavior:auto!important}
@media(prefers-reduced-motion:reduce){*,*::before,*::after{animation-duration:.001ms!important;animation-iteration-count:1!important;transition-duration:.001ms!important;scroll-behavior:auto!important}}`;
const block=`<!-- MQ HUB ACCESSIBILITY START -->\n<style>${css}</style>\n<script>${fs.readFileSync('audit_tools/accessibility_cleanup/hub-runtime.js','utf8')}</script>\n<!-- MQ HUB ACCESSIBILITY END -->`;
for(const file of files){
 const original=fs.readFileSync(file,'utf8');
 const a=original.indexOf('<!-- MQ HUB ACCESSIBILITY START -->'),b=original.indexOf('<!-- MQ HUB ACCESSIBILITY END -->');
 const html=a<0?original.replace('</body>',block+'\n</body>'):original.slice(0,a)+block+original.slice(b+'<!-- MQ HUB ACCESSIBILITY END -->'.length);
 if(html!==original){const temporary=file+'.a11y-tmp';fs.writeFileSync(temporary,html);fs.renameSync(temporary,file);}
}
console.log('Synchronized six collection hubs.');
