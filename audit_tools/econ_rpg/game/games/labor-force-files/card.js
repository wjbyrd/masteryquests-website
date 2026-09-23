import {CONFIG} from './config.js';
const card=document.querySelector('[data-game="labor-force-files"]');
if(card){card.querySelector('h2').textContent=CONFIG.title;card.querySelector('p').textContent=CONFIG.description;const link=card.querySelector('a');link.href=CONFIG.route;link.setAttribute('aria-label',`PLAY GAME: ${CONFIG.title}`);}
