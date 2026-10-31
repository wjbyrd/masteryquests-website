'use strict';
const http=require('node:http'),fs=require('node:fs'),path=require('node:path');
const root=path.resolve(__dirname,'../../../..');
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript','.css':'text/css','.json':'application/json','.csv':'text/csv','.png':'image/png','.webp':'image/webp','.svg':'image/svg+xml'};
function server(){return http.createServer((req,res)=>{
  let name;try{name=decodeURIComponent(new URL(req.url,'http://localhost').pathname);}catch{res.writeHead(400).end();return;}
  if(name.endsWith('/'))name+='index.html';
  const file=path.resolve(root,'.'+name);
  if(!file.startsWith(root+path.sep)||name.split('/').some(s=>s.startsWith('.'))){res.writeHead(403).end();return;}
  fs.readFile(file,(error,data)=>{if(error){res.writeHead(404).end();return;}res.writeHead(200,{'Content-Type':mime[path.extname(file)]||'application/octet-stream','Cache-Control':'no-store'});res.end(data);});
});}
if(require.main===module){const app=server();app.listen(Number(process.argv[2]||8765),'127.0.0.1',()=>console.log(`Private Build preview: http://127.0.0.1:${app.address().port}/build/faculty-build-composer/authoring/hybrid/build-preview.html`));}
module.exports=server;
