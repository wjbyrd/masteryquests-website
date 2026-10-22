import fs from 'node:fs';
const files=['economic-realm','macro-command-system','micro-domains','managerial-intelligence-directorate','managerial-directorate-classroom','managerial-directorate-telemetry-poc'].map(g=>`play/${g}/index.html`);
const css=`.mq-motion-setting{display:flex;flex-direction:column;align-items:stretch;gap:6px;font:inherit;color:inherit;width:100%;grid-column:1/-1;margin:8px 0}
.mq-motion-setting .game-menu-option{width:100%;font:inherit;color:inherit;background:rgba(0,0,0,.25);border:1px solid currentColor;border-radius:8px;padding:12px;cursor:pointer}
.mq-motion-default{align-self:center;font:inherit;font-size:.85em;color:inherit;background:transparent;border:0;text-decoration:underline;min-height:28px;padding:4px 8px;cursor:pointer}
.mq-motion-default:disabled{cursor:default;text-decoration:none}
.mq-motion-setting .sr-only{position:absolute;width:1px;height:1px;padding:0;overflow:hidden;clip-path:inset(50%);white-space:nowrap}
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
