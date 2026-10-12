"use strict";
const subscription=document.querySelector('#subscription-form');
if(subscription){
  const status=document.querySelector('#subscription-status'),fields=document.querySelector('#subscription-fields');
  const unavailable='Email sign-up is not available yet. Please check the Updates page or contact wjbyrd@troy.edu.';
  fetch('/api/subscriptions',{headers:{accept:'application/json'},cache:'no-store',signal:AbortSignal.timeout(10000)}).then(async response=>{
    if(!response.ok)throw Error();const data=await response.json();
    if(data.available!==true)throw Error();fields.disabled=false;status.textContent='Enter your email, opt in, and confirm using the link sent to your inbox.';
  }).catch(()=>{status.textContent=unavailable});
  subscription.addEventListener('submit',async event=>{
    event.preventDefault();if(fields.disabled||!subscription.reportValidity())return;
    const data=new FormData(subscription),button=subscription.querySelector('button[type=submit]');button.disabled=true;status.dataset.error='false';status.textContent='Sending your confirmation request…';
    try{
      const response=await fetch('/api/subscriptions',{method:'POST',headers:{'content-type':'application/json',accept:'application/json'},body:JSON.stringify({email:data.get('email'),consent:data.get('consent')==='yes',website:data.get('website')}),signal:AbortSignal.timeout(20000)});
      const result=await response.json();if(!response.ok||result.ok!==true)throw Error(result.message||'Sign-up could not be completed. Please try later.');
      status.textContent=result.message;subscription.reset();
    }catch(error){status.dataset.error='true';status.textContent=error.name==='TimeoutError'?'The request timed out. Check your inbox before trying again.':error.message==='Failed to fetch'?'The service could not be reached. Please try later.':error.message}
    finally{button.disabled=false;status.focus()}
  });
}
const requestForm=document.querySelector('#bank-request-form');
if(requestForm){
  requestForm.hidden=false;
  const collections=[...requestForm.querySelectorAll('[name=collection]')];
  function validateCollections(){collections[0].setCustomValidity(collections.some(box=>box.checked)?'':'Select at least one collection.');}
  collections.forEach(box=>box.addEventListener('change',validateCollections));
  requestForm.addEventListener('input',()=>{document.querySelector('#request-ready').hidden=true;document.querySelector('#request-status').textContent='';});
  requestForm.addEventListener('submit',event=>{
    event.preventDefault();validateCollections();if(!requestForm.reportValidity())return;
    const data=new FormData(requestForm),status=document.querySelector('#request-status');
    const text=['Faculty question-bank request','',`Name: ${data.get('name').trim()}`,`Institution: ${data.get('institution').trim()}`,`Institutional email: ${data.get('email').trim()}`,`Collections: ${data.getAll('collection').join(', ')}`,'Formats: PDF and CSV',`Intended instructional use: ${data.get('use').trim()||'Not specified'}`,'','I understand that faculty eligibility is verified manually before materials are shared.'].join('\n');
    document.querySelector('#request-draft').value=text;
    document.querySelector('#request-email').href='mailto:wjbyrd@troy.edu?subject='+encodeURIComponent('Mastery Quests faculty question-bank request')+'&body='+encodeURIComponent(text);
    document.querySelector('#request-ready').hidden=false;
    status.textContent='Your email draft is ready. Nothing has been sent. Open the draft in your email app, or copy the text into webmail and send it to wjbyrd@troy.edu.';status.focus();
  });
}
