import { CONFIG } from './config.js';
// Keep the working title and route in the game configuration, including its library card.
const card = document.querySelector('[data-game="cpi-live"]');
card.querySelector('h2').textContent = CONFIG.title;
card.querySelector('p').textContent = CONFIG.description;
const link = card.querySelector('a');
link.href = CONFIG.route;
link.setAttribute('aria-label', `PLAY GAME: ${CONFIG.title}`);
