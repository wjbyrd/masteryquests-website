const fs=require('fs'),root='audit_tools/econ_rpg/game/games/the-shock-house/';
function edit(file,fn){const original=fs.readFileSync(root+file,'utf8');fs.writeFileSync(root+file,fn(original));}
for(const file of ['content.js','objects.js','tactile.js','discovery.js','game.js','engine.js'])edit(file,s=>s.replaceAll('material measures','steel blanks').replaceAll('measures','steel blanks').replaceAll('per measure','per blank').replace('one measure of energy/input','one steel blank').replace('Six steel blanks of expensive input remain.','Six standardized steel blanks remain. A blank is a piece of raw steel ready to be shaped.'));
edit('tactile.js',s=>{
 s="import {steelBlanks} from './workshop-materials.js';\n"+s;
 s=s.replace("prop('spools','Remaining input','open','stock',20,18, 60, 60)","'<div class=\"bin-materials\">'+steelBlanks(solved('orders')?2:6)+'</div>'+hit('Inspect steel blanks','open','stock',15,15,70,75)");
 s=s.replace("sprite('spools',38,55,23,33)+", "steelBlanks(2,'stock-blanks')+");
 s=s.replace("sprite('spools',15,55,23,33)+steelBlanks(2,'stock-blanks')+sprite('spools',61,55,23,33)+", "steelBlanks(6,'stock-blanks')+");
 s=s.replace('<h3>Input bin · 6 steel blanks</h3>','<header>ALDER WORKS · MATERIAL STORE</header><h3>6 steel blanks</h3><p class="stock-definition">Standard pieces of raw steel, ready to be shaped.</p>');
 s=s.replace("coin:7,spools:8", "coin:7");
 return s;
});
edit('objects.js',s=>{
 s="import {steelBlanks} from './workshop-materials.js';\n"+s;
 s=s.replace('<span>INPUT STORE</span><div class="material-pieces">${Array.from({length:6-s.jobs.length*2},()=>\'<i class="material-token"></i>\').join(\'\')}</div>','<span>STEEL BLANKS · INPUT STORE</span>${steelBlanks(6-s.jobs.length*2)}');
 s=s.replace('2 × $18 input + $18 other','2 blanks × $18 + $18 other');
 s=s.replace("'<span>'+label+'</span><strong>'+(['↓','—','↑'][s.householdPattern[i]+1])+'</strong>'", "'<span>'+label+'</span>'+gaugeFace(s.householdPattern[i])+'<strong>'+(['↓','—','↑'][s.householdPattern[i]+1])+'</strong>'");
 s=s.replace('<div class="lever-labels">','<div class="lever-detents" aria-hidden="true"><i></i><i></i><i></i><i></i><i></i><i></i><i></i></div><div class="lever-labels">');
 return s;
});
edit('instruments.js',s=>s.replace("id='',labels:customLabels", "id='',labels:customLabels,caption").replace("point(-60+i*60,49)", "point(-60+i*120/((customLabels?.length||3)-1),49)").replace("${numeric?'INDEX':'DIRECTION'}", "${caption||(numeric?'INDEX':'DIRECTION')}") );
edit('recovery-view.js',s=>{
 s=s.replace("'<span>UNIT COST</span><strong>$'+r.cost+'</strong>'", "'<span>UNIT COST</span>'+gaugeFace([9,15,21,27].indexOf(r.cost)*2/3-1,{labels:['9','15','21','27'],caption:'DOLLARS'})+'<strong>$'+r.cost+'</strong>'");
 s=s.replace("'<span class=\"connector-label\">INSTALLED DESIGN</span><strong>'+['—','V1','V2'][r.adoption[i]]+'</strong>'", "'<span class=\"connector-label\">INSTALLED DESIGN</span>'+gaugeFace(r.adoption[i]-1,{labels:['—','V1','V2'],caption:'DESIGN'})+'<strong>'+['—','V1','V2'][r.adoption[i]]+'</strong>'");
 return s;
});
