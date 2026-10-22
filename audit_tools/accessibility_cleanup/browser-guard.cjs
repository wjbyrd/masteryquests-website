// Test-only network isolation for reused suites. Never loaded by public games.
const path=require('node:path');
const modulePath=process.env.PLAYWRIGHT_MODULE||path.join(process.env.USERPROFILE,'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright');
const pw=require(modulePath);
const block=route=>{const u=new URL(route.request().url());return ['127.0.0.1','localhost','[::1]'].includes(u.hostname)||['data:','blob:','file:'].includes(u.protocol)?route.continue():route.abort();};
for(const type of ['chromium','firefox','webkit']){
 const launch=pw[type].launch.bind(pw[type]);
 pw[type].launch=async(...args)=>{if(process.env.MQ_TEST_CHANNEL&&type==='chromium')args[0]={...args[0],channel:process.env.MQ_TEST_CHANNEL,timeout:60000};const browser=await launch(...args);
  const newContext=browser.newContext.bind(browser),newPage=browser.newPage.bind(browser);
  browser.newContext=async(...args)=>{const context=await newContext(...args);await context.route('**/*',block);return context;};
  browser.newPage=async(...args)=>{const page=await newPage(...args);await page.route('**/*',block);return page;};
  return browser;
 };
 const persistent=pw[type].launchPersistentContext.bind(pw[type]);
 pw[type].launchPersistentContext=async(...args)=>{if(process.env.MQ_TEST_CHANNEL&&type==='chromium')args[1]={...args[1],channel:process.env.MQ_TEST_CHANNEL,timeout:60000};const context=await persistent(...args);await context.route('**/*',block);return context;};
}
