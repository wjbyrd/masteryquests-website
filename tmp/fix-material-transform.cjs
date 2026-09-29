const fs=require('fs'),p='audit_tools/econ_rpg/game/games/the-shock-house/';
let s=fs.readFileSync(p+'recovery-view.js','utf8');
s=s.replace("caption:'DOLLARS'})+'<strong>,'r-cost'",()=>"caption:'DOLLARS'})+'<strong>$'+r.cost+'</strong>','r-cost'");
fs.writeFileSync(p+'recovery-view.js',s);
s=fs.readFileSync(p+'tactile.js','utf8').replace("sprite('spools',15,55,23,33)+sprite('spools',38,55,23,33)+sprite('spools',61,55,23,33)","steelBlanks(6,'stock-blanks')");fs.writeFileSync(p+'tactile.js',s);
