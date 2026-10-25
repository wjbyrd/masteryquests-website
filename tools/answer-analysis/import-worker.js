'use strict';
importScripts('vendor/xlsx.full.min.js','workbook-import.js');
self.onmessage=({data})=>{
  try{self.postMessage({result:MQWorkbookImport.parse(data.buffer,data.extension,XLSX)});}
  catch(error){self.postMessage({error:error.message});}
};
