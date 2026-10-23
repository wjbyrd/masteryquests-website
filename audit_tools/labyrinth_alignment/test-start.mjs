// Launch published test engines through their real preflight/guide lifecycle.
export async function start(page,mode='standard'){
 const name=page.locator('#playerNameInput');if(await name.isVisible())await name.fill('Accessibility QA');
 await page.evaluate(()=>showModeSelect());
 await page.evaluate(mode=>startSelectedMode(mode,{quizConfirmed:true,trialGraphConfirmed:true,fadingFortuneConfirmed:true,riskRewardConfirmed:true}),mode);
 for(const id of ['guideIntroProceed','labyrinthIntroProceed'])if(await page.locator('#'+id).isVisible())await page.locator('#'+id).click();
 await page.waitForFunction(()=>Boolean(currentQuestion));
 if(mode==='riskReward')await page.evaluate(()=>lockRiskRewardWager(.1));
 await page.waitForFunction(()=>document.querySelectorAll('#answers button').length===4);
}

// Permit only the explicitly reviewed guide presentation and three launch gates.
export function withoutIntroductionIntegration(text){
 return text.replace(/    if\(window\.MQLabyrinthIntroduction\?\.offer\(\(\)=>startSelectedMode\(requestedMode,options\)\)\) return;\n/,'')
  .replace(/    if\(!shouldResume && window\.MQLabyrinthIntroduction\?\.offer\(\(\)=>startGame\(false,requestedMode\)\)\) return;\n/,'')
  .replace(/    if\(window\.MQLabyrinthIntroduction\?\.offer\(\(\)=>startNewRun\(\)\)\) return;\n/,'')
  .replace(/#labyrinthIntroduction \{[\s\S]*?(?=\.labyrinth-menu-open \.game-modal-actions)/,'INTRODUCTION CSS\n')
  .replace(/    \/\/ Authored Arcane Archive guide:[^\n]*\n    \/\/ Portrait\/alternative:[^\n]*\n/,'')
  .replace(/    const introduction=document\.createElement\('dialog'\);[\s\S]*?(?=    const openMenu = opener.onclick;)/,'INTRODUCTION LIFECYCLE\n');
}
