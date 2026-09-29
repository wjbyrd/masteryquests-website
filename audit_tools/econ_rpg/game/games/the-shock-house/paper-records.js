import {GROCERY_RECEIPTS} from './physical-content.js';

// Both discoveries and the collected comparison use the same printed form.
export function groceryReceipt(index){
 const receipt=GROCERY_RECEIPTS[index];
 return `<article class="source-document grocery-receipt" aria-label="${receipt.date} grocery receipt"><header>ALDER GROCER · HOUSEHOLD ACCOUNT</header><h2>${receipt.date}</h2><p>Grain, milk, produce<br>Household goods</p><div class="grocery-total"><span>Monthly basket</span><strong>$${receipt.total}</strong></div><footer>Same goods. Same quantities.</footer></article>`;
}
