import {GAME_CONFIG} from './config.js';
import {renderHero} from './hero-scene.js';
const canvas=document.querySelector('#growth-realms-art');
if(canvas)renderHero(canvas);

const title=document.querySelector('#growth-realms-title');
if(title){title.textContent=GAME_CONFIG.title;title.closest('article').querySelector('a').setAttribute('aria-label',`PLAY GAME: ${GAME_CONFIG.title}`);}
