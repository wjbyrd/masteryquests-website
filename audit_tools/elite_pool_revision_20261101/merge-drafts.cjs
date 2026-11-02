'use strict';
const fs=require('fs'),path=require('path'),assert=require('assert/strict');
const dir=path.join(__dirname,'drafts'),out={},decisions=JSON.parse(fs.readFileSync(path.join(__dirname,'decisions.json'),'utf8')),inventory=require('./inventory.json'),by=new Map(inventory.items.map(r=>[r.id,r]));
for(const file of fs.readdirSync(dir).filter(f=>f.endsWith('.json')).sort())for(const [id,edit] of Object.entries(JSON.parse(fs.readFileSync(path.join(dir,file),'utf8')))){
 assert(!out[id],'Duplicate edit '+id);assert(by.has(id));assert.notEqual(by.get(id).group,'approved','Preserve approved Elite '+id);assert(edit.reason&&Number.isInteger(edit.correctIndex));
 const before=by.get(id).question;assert((edit.options||before.options).length===4);out[id]=edit;decisions[id]={action:'revise',group:by.get(id).group,reason:edit.reason,batch:file};
}
fs.writeFileSync(path.join(__dirname,'content-edits.json'),JSON.stringify(out,null,2)+'\n');fs.writeFileSync(path.join(__dirname,'decisions.json'),JSON.stringify(decisions,null,2)+'\n');console.log(JSON.stringify({drafted:Object.keys(out).length,decisions:Object.keys(decisions).length}));
