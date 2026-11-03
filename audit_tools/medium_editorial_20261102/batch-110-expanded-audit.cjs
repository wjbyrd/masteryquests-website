'use strict';
module.exports=({edit,byId})=>{
 const stems={
 'ECON-SP-MEDIUM-143':'Use the money-market graph. Where does equilibrium move when money demand shifts from MD1 to MD2 while money supply remains at MS1?',
 'ECON-SP-MEDIUM-145':'Real income rises, increasing money demand. With the money supply fixed, what happens in the liquidity-preference model?',
 'LG-Q-150':'According to liquidity-preference theory, which two quantities does the interest rate bring into balance?',
 'LG-Q-153':'Money demand shifts right while the money supply stays fixed. What happens to the equilibrium interest rate?',
 'LG-Q-154':'Why does higher real income usually increase the demand for money?',
 'LG-Q-155':'The price level rises while real output stays unchanged. Why does the demand for money increase?',
 'ECON-SP-HARD-224':'Use the money-market graph. Where does equilibrium move when money demand shifts from MD1 to MD2 while money supply stays at MS2?',
 'P52B-S2-LSG-M-001':'A country’s real GDP grows by 4% while its population grows by 1%. Approximately how much does real GDP per person grow?',
 'ECON-NL-MEDIUM-141':'Using the Rule of 70, about how long does income take to double if it grows by 5% each year?',
 'ECON-NL-MEDIUM-142':'Using the Rule of 70, about how long does income take to double if it grows by 1% each year?',
 'ECON-NL-MEDIUMBOSS-3001':'Country A starts with real GDP per person of $40,160 and grows by 2% annually. Country B starts at half that level and grows by 7%. Using the Rule of 70, why is it incorrect to conclude that B catches A in ten years?',
 'P52A-AS-B2-002':'A disaster destroys capital and reduces potential output from its initial level of 30. Rebuilding raises aggregate demand. Why does the extra spending not establish that productive capacity has recovered?',
 'ECON-SP-MEDIUM-135':'A lasting foreign economic boom raises net exports and pushes domestic output above potential. With no policy response, how do expected prices and short-run aggregate supply adjust over time?',
 'ECON-SP-MEDIUM-136':'A lasting fall in aggregate demand pushes output below unchanged potential. With no policy response, how does the economy tend to adjust over time?',
 'P52A-MARG-M-001':'The fourth unit provides a marginal benefit of $18 and has a marginal cost of $14. Should it be produced or consumed?',
 'P52A-MARG-M-002':'A firm has spent a nonrefundable $50,000 developing a product. Finishing it will cost another $12,000 and is expected to bring in $18,000. What should the firm do?',
 'P52A-MARG-M-003':'Staying open an extra hour would bring a museum $900 in admissions revenue and add $1,100 in staffing and utility costs. What does marginal analysis recommend?',
 'P52A-MARG-M-005':'A student values the grade benefit of another hour of study at 9 points and its fatigue cost at 6 points. What is the net marginal benefit?',
 'P73-MARG-M-007':'A warehouse’s average handling cost is $9 per box. The next box costs $13 to handle and brings in $15 after all other variable costs. What should the warehouse do?',
 'P52B-MVM-M-001':'A study examines how a minimum wage affects employment in one local industry. Is this primarily microeconomic or macroeconomic analysis?',
 'ECON-SP-MEDIUM-106':'Banks choose to hold more excess reserves instead of making loans. How does this affect deposit creation?',
 'LG-Q-122':'Households hold more currency and fewer bank deposits. How does this affect banks’ ability to support lending?',
 'LG-Q-216':'Why can a higher interest rate on reserves tighten monetary policy?',
 'ECON-SP-MEDIUM-107':'A bank has $1,000,000 in assets and $80,000 in capital. Its assets lose $40,000 in value while its liabilities stay unchanged. What is its remaining capital?',
 'ECON-SP-MEDIUM-113':'All nominal prices and wages double while relative prices and real activity stay unchanged. Which concept does this illustrate?',
 'LG-Q-135':'All nominal prices double while relative prices and real activity stay unchanged. Which concept does this illustrate?',
 'LG-Q-134':'A worker earns $20 per hour, and a unit of output costs $5. What is the worker’s real wage?',
 'LG-Q-136':'Pizza rises from $10 to $20 while soda rises from $2 to $4. How does the price of pizza measured in sodas change?',
 'ECON-SP-MEDIUM-105':'In the scarce-reserves model, which open-market operation would the Fed use to reduce the money supply?',
 'ECON-SP-MEDIUM-109':'How does a higher interest rate on reserves directly affect banks’ incentive to hold reserves?',
 'LG-Q-111':'In a banking model with binding reserve requirements, how does a higher required reserve ratio affect deposit creation?',
 'LG-Q-112':'How might banks respond to a higher interest rate paid on reserves?',
 'ECON-SP-MEDIUM-140':'Use the money-market graph. What kind of policy is the Fed pursuing when it moves money supply from MS1 to MS2?',
 'ECON-SP-MEDIUM-141':'Use the money-market and aggregate-demand graph. How does the move from MS1 to MS2 affect the interest rate and aggregate demand?',
 'LG-Q-159':'Through the usual monetary-policy transmission mechanism, which spending change follows most directly from a lower interest rate?',
 'LG-Q-160':'In the standard scarce-reserves model, how does an increase in the money supply affect aggregate demand?',
 'LG-Q-161':'Why can a liquidity trap limit the effect of conventional monetary policy?',
 };
 const options={
 'P52A-AS-B2-002':['Higher aggregate demand immediately restores all the capital lost in the disaster.','Capital destruction affects only demand, leaving productive capacity unchanged.','The two shocks must exactly offset their effects on both prices and output.','Demand can raise short-run output while the lost capital still limits productive capacity.'],
 'PM2C2-NEUT-M-001':['It can return to about its previous level.','It rises with the nominal wage even though prices rise proportionately.','It falls to zero because money growth raises prices.','It becomes equal to the rate of money-supply growth.'],
 'ECON-SP-MEDIUM-141':['Interest rates fall and aggregate demand increases.','Interest rates rise and aggregate demand decreases.','Interest rates rise and aggregate demand increases.','Interest rates fall and aggregate demand decreases.'],
 'LG-Q-155':['More dollars are needed to buy the same goods.','Fewer dollars are needed to buy the same goods.','Households no longer earn any income.','Households permanently stop buying bonds.'],
 };
 for(const id of ['P52B-S1-LRADJ-B2-001','PM2D1-LRADJ-MB-003']){
  const amount=id.startsWith('P52')?20:60;
  stems[id]=`After a fall in demand, output is ${amount} below potential. Aggregate demand and productive capacity stay unchanged, while wages and price expectations gradually adjust. Which adjustment closes the gap under these assumptions?`;
  options[id]=byId.get(id).question.options.map(o=>o.startsWith('SRAS shifts right')?'Lower wages shift short-run aggregate supply right, returning output to unchanged potential.':o.startsWith('SRAS shifts left')?'Higher wages shift short-run aggregate supply left, increasing output at unchanged demand.':o.startsWith('AD shifts right')?'Aggregate demand shifts right automatically, without any wage adjustment.':'Long-run aggregate supply shifts left to meet actual output, despite unchanged productive capacity.');
 }
 for(const id of new Set([...Object.keys(stems),...Object.keys(options)]))edit(id,{...(stems[id]?{q:stems[id]}:{}),...(options[id]?{options:options[id]}:{})},'Read the expanded candidate; replace sentence fragments and compressed causal labels with a clear question, stating the model’s necessary assumptions.');
};
