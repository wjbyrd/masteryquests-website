(function(root){
  'use strict';
  const active=new Map();let generation=0;
  function cancel(){generation++;for(const stop of [...active.values()])stop();}
  async function read(file){
    const started=generation;
    const extension=file.name.split('.').pop().toLowerCase();
    if(!['csv','xlsx','numbers'].includes(extension))throw Error('Unsupported format. Choose CSV (.csv), Excel (.xlsx), or Apple Numbers (.numbers).');
    if(file.size>25*1024*1024)throw Error('This file exceeds the 25 MB local import limit.');
    if(file.size===0)throw Error('This file is empty.');
    if(extension==='csv')return {text:await file.text(),format:'CSV',tables:[]};
    const buffer=await file.arrayBuffer();
    if(started!==generation)throw Error('Import cancelled.');
    return new Promise((resolve,reject)=>{
      const worker=new Worker(new URL('import-worker.js',document.baseURI));
      const finish=(error,result)=>{clearTimeout(timer);active.delete(worker);worker.terminate();if(error)reject(Error(error));else resolve({...result,format:extension==='numbers'?'Apple Numbers':'Excel'});};
      const timer=setTimeout(()=>finish('Parsing exceeded 30 seconds. Try a smaller document or the original game CSV.'),30000);
      active.set(worker,()=>finish('Import cancelled.'));
      worker.onmessage=({data})=>finish(data.error,data.result);
      worker.onerror=()=>finish('The local spreadsheet parser could not start. Reload the page and try again.');
      worker.postMessage({buffer,extension},[buffer]);
    });
  }
  root.MQFileImport={read,cancel};
})(globalThis);
