import {fs,path,chromium,out,server,origin,games,settle} from './closeout-support.mjs';
const browser=await chromium.launch({channel:'msedge',headless:true}),results=[];
try{for(const game of games){
 const page=await browser.newPage({viewport:{width:390,height:844}});await page.clock.install();await page.route('**/*',r=>new URL(r.request().url()).origin===origin?r.continue():r.fulfill({status:204,body:''}));await page.goto(`${origin}/play/managerial-intelligence-directorate/${game}/`);
 await page.evaluate(()=>openQuizSetup());const modal=page.locator('#quizSetupModal');
 await page.locator('#quizQuestionCountSelect').focus();await page.keyboard.press('Home');await page.keyboard.press('ArrowDown');
 const selected=await page.locator('#quizQuestionCountSelect').inputValue();
 const launch=modal.locator('button').filter({hasText:'Launch Quiz'});await launch.focus();await page.keyboard.press('Enter');await settle(page);
 const buttons=await page.locator('#answers button').evaluateAll(bs=>bs.map(b=>({text:!!b.textContent,tabIndex:b.tabIndex,disabled:b.disabled,width:b.getBoundingClientRect().width,height:b.getBoundingClientRect().height})));
 if(!buttons.length||buttons.some(b=>!b.text||b.tabIndex<0||b.disabled||b.height<24))throw Error('Answer keyboard/tap regression');
 await page.locator('#answers button').first().focus();await page.clock.fastForward(60000);await page.keyboard.press('Enter');await settle(page);
 const attempts=await page.evaluate(()=>totalAttempts);if(attempts!==1)throw Error('Keyboard answer failed');
 await page.evaluate(()=>showGameModal({title:'Keyboard regression check',text:'Close this test modal.',confirmText:'Return to question'}));await page.locator('#gameModalConfirm').focus();await page.keyboard.press('Enter');
 if(await page.locator('#gameModal').isVisible())throw Error('Keyboard modal close failed');
 results.push({game,viewport:{width:390,height:844},quizSetupKeyboardValue:selected,quizKeyboardLaunched:true,answerButtons:buttons,keyboardAnswerAccepted:true,modalKeyboardClosed:true});await page.close();
}fs.writeFileSync(path.join(out,'accessibility.json'),JSON.stringify(results,null,2));console.log(JSON.stringify(results.map(({game,...r})=>({game,pass:true}))));}finally{await browser.close();await new Promise(r=>server.close(r));}
