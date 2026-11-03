'use strict';
const {finish}=require('./helpers.cjs');
module.exports=({items,edit,keep})=>{for(const item of items.filter(r=>/^(Income Inequality|Information Asymmetry)/.test(r.topic))){
 const old=item.question;let q=old.q,options=[...old.options];
 const choice=(right,wrong)=>{options=[...wrong];options.splice(item.correctIndex,0,right);};
 if(/official threshold for a household/.test(q)){
  const amounts=q.match(/\$[\d,]+/g);const threshold=amounts[0],income=amounts[1];
  q=`A household has ${income} in measured money income. The poverty threshold that applies to it is ${threshold}. How is the household classified under this income-based rule?`;
  choice('Below the poverty threshold.',['Above the poverty threshold.','Exactly at the poverty threshold.','Its wealth must also be known before this rule can be applied.']);
 }
 if(/Workers with scarce training earn more/.test(q))choice('Demand has increased for workers with scarce skills.',['Workers receive extra pay for taking more dangerous jobs.','An increase in the supply of trained workers pushes their wages up.','Employers pay more because training makes workers less productive.']);
 if(/Two otherwise similar jobs pay differently/.test(q))choice('Workers require extra pay to accept the more dangerous job.',['The more dangerous job necessarily requires more training.','The safer job pays less because its workers are more productive.','The danger makes workers willing to accept a lower wage.']);
 if(q.includes('What is the central policy evaluation?'))q=q.replace('What is the central policy evaluation?','What tradeoff should policymakers consider?');
 if(item.id==='42811')options[2]='It rises because the job now attracts more applicants.';
 if(item.id==='42817')options[item.correctIndex]='It raises the household’s wealth without changing its annual wage income.';
 if(item.id==='42857'){
  q='A voluntary gift and a compulsory transfer would produce the same wealth distribution. Why might someone who emphasizes property rights judge them differently?';
  choice('Consent and how the property was acquired matter, even when the final distributions match.',['Equal final distributions show that both transfers were voluntary.','A voluntary gift cannot change the distribution of wealth.','Property rights are judged solely by the resulting level of inequality.']);
 }
 if(['42947','42963','42969'].includes(item.id))choice('Screening: the insurer designs choices that help reveal customers’ risk.',['Signaling: customers independently supply evidence of their risk.','Moral hazard: customers change their care after receiving coverage.','Adverse selection: the insurer attracts only lower-risk customers.']);
 if(item.id==='42949')options[item.correctIndex]='Borrowers’ willingness and ability to risk collateral can help the lender distinguish among them.';
 if(item.id==='42935')options[item.correctIndex]='No; an accident alone does not show that insurance changed the driver’s behavior.';
 if(item.id==='42951'){
  q='An employer offers two contracts so applicants with different productivity choose different terms. The applicants know their own productivity, but the employer does not. Who is using information to distinguish among applicants, and how?';
  choice('The employer uses screening by designing the contract choices.',['The applicants use screening by accepting the employer’s terms.','The employer signals each applicant’s productivity by offering a job.','The applicants reveal moral hazard simply by choosing different contracts.']);
 }
 if(item.id==='42960')options[item.correctIndex]='No; improving everyone’s skills does not by itself reveal their earlier productivity.';
 if(item.id==='42968')q='A job applicant obtains a certificate before applying. An employer separately offers trial contracts to help distinguish applicants’ abilities. Which action is signaling?';
 if(item.id==='42945')options[item.correctIndex]='The customer pays part of a loss and has more reason to prevent it.';
 finish(item,{q,options},'Read the complete income-distribution and information-asymmetry families; use natural prose and economically relevant alternatives while preserving the tested relationship.',edit,keep);
}};
