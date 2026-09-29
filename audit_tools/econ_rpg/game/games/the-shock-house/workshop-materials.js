// One visible blank is one standardized piece of raw steel, never a pair.
export function storedBlanks(state) {
 return state.solvedPuzzles.includes('orders')?2:6-state.jobs.length*2;
}
export function steelBlanks(count, className='material-pieces') {
 return `<div class="${className}" role="img" aria-label="${count} steel blanks">${Array.from({length:count},()=>'<i class="material-token" aria-hidden="true"></i>').join('')}</div>`;
}
