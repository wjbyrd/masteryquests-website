// Narrow, idempotent lifecycle edits shared by canonical and frozen independent sources.
// No whole-engine substitution: independent question/scoring/boss logic stays authoritative.
export function applyFeedbackProgression(html){
  html=html.replaceAll('window.MQAccessibility?.resetFeedback();\n    runSessionId', 'window.MQFeedbackProgression?.cancel();\n    runSessionId');
  html=html.replace(/function resetRunStateForNewMode\(\)\{\n(?!    window.MQAccessibility)/g,'function resetRunStateForNewMode(){\n    window.MQAccessibility?.resetFeedback();\n');
  html=html.replace(/(function startGame\([^)]*\)\s*\{\n)(?!    window.MQAccessibility)/g,'$1    window.MQAccessibility?.resetFeedback();\n');
  html=html.replace(/(async function answer\(choice\)\s*\{\n)(?!    const resolvingRecovery)/g,'$1    const resolvingRecovery = remediationState.active;\n');
  html=html.replaceAll('    text: `Incorrect! You trip in the darkness and tumble back to Room ${room}.`,',
    '    text: window.MQFeedbackProgression.wrongTurn(`Incorrect! You trip in the darkness and tumble back to Room ${room}.`, currentQuestion, isBossRoom || resolvingRecovery),');
  html=html.replaceAll('Room ${room}.`, currentQuestion),','Room ${room}.`, currentQuestion, isBossRoom || resolvingRecovery),');
  html=html.replace(/(    remediationState = planRemediation\(currentQuestion, (?:activeResponseTime|responseTime)\) \|\| remediationState;\n)(?!    window.MQFeedbackProgression)/g,
    '$1    window.MQFeedbackProgression.rememberRecoveryOrigin(remediationState, currentQuestion);\n');
  html=html.replace(/(    const returnRoom = remediationState.returnRoom \?\? room;\n)(?!    const releasedRecoveryOrigin)/g,
    '$1    const releasedRecoveryOrigin = remediationState.mqOriginFeedback;\n');
  html=html.replace(/(room = returnRoom;[\s\S]{0,180}?)    scheduleForCurrentRun\(loadQuestion, TIMING.normal\);/g,
    '$1    window.MQFeedbackProgression.finishRecovery(releasedRecoveryOrigin, msgElement.innerText, () => loadQuestion(), TIMING.normal);');
  // Previously the canonical pre-boss branch skipped the explanation. Reuse the
  // already-selected guide line there: do not consume an extra random draw.
  if(html.includes('function getModeCapabilities(')){
    html=html.replace(/(?<!const resolvedGuideLine = msgElement.innerText;\n)   msgElement.innerHTML = "";\n   room\+\+;/g,
      '   const resolvedGuideLine = msgElement.innerText;\n   msgElement.innerHTML = "";\n   room++;');
    html=html.replace(/   if\(isBossRoomForMode\(room\)\)\{\n       loadQuestion\(\);\n       return;\n   \}\n\n/g,'');
    if(!html.includes('leadText:resolvedGuideLine'))html=html.replace('   showHallwayTransition(currentQuestion.feedback);',
      '   if(isBossRoomForMode(room)){\n       showHallwayTransition(currentQuestion.feedback, {leadText:resolvedGuideLine});\n       return;\n   }\n   showHallwayTransition(currentQuestion.feedback);');
  }
  // Preserve every engine's artwork and callback; only replace the presentation timer boundary.
  html=html.replace(/    scheduleForCurrentRun\(\(\) => \{\n        overlay.classList.remove\("active"\);([\s\S]*?)    \}, (presentationDuration|1800|3200)\);/g,(_all,body,duration)=>{
    const canonical=duration==='presentationDuration';
    return `    const advanceFeedback = () => {\n        overlay.classList.remove("active");${body}    };\n    if(!window.MQFeedbackProgression.holdHallway(advanceFeedback${canonical?', !options.announcement':''})){\n        scheduleForCurrentRun(advanceFeedback, ${duration});\n    }`;
  });
  // Labyrinth snapshots its initial surface before the accessibility helper runs.
  html=html.replaceAll('<p id="question"></p>','<p id="question" role="heading" aria-level="2" tabindex="-1"></p>');
  return html;
}
