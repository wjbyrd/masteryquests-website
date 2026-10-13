const fs=require('fs');
function edit(file,fn){const old=fs.readFileSync(file,'utf8'),next=fn(old);if(next===old)throw Error('No change: '+file);fs.writeFileSync(file,next);}
edit('how-to/index.html',s=>s.replace(/<\/div><p><a href="\/how-to\/responsible-telemetry-use\/">Responsible Telemetry Use<\/a>:[\s\S]*?<\/p><div class="adaptive-rule-grid">/,'').replaceAll('Canvas guide','LMS guide').replaceAll('Using Mastery Quests in Canvas','Using Mastery Quests in your LMS'));
edit('how-to/composer/index.html',s=>s.replaceAll('Put the Game in Canvas','Put the Game in Your LMS'));
edit('how-to/pedagogy/index.html',s=>s.replaceAll('Canvas guide','LMS guide'));
edit('how-to/canvas/index.html',s=>s.replaceAll('Canvas Deployment','LMS Deployment').replaceAll('Canvas deployment','LMS deployment').replaceAll('directly in Canvas','directly in your learning management system (LMS)').replaceAll('point Canvas directly','point your LMS directly').replaceAll('Point Canvas directly','Point your LMS directly').replaceAll('Create or edit a Canvas page, switch to the HTML editor, and paste an iframe using your hosted URL.','Create or edit a course page in your LMS. If its editor supports HTML embeds, paste an iframe using your hosted URL. Otherwise, add the URL as an external course link.').replaceAll('your Canvas theme','your LMS theme').replaceAll('Use Student View','Preview as a student').replaceAll('external Canvas link','external LMS link').replaceAll('The Canvas <code>','The LMS <code>').replaceAll('explicitly in Canvas','explicitly in your LMS'));
edit('assets/css/site.css',s=>s.replace(/\.primary-navigation a\.nav-subscribe \{[\s\S]*?\.primary-navigation a\.nav-subscribe::after \{ display: none; \}\r?\n/,''));
edit('privacy/index.html',s=>{
 const moved=[];
 for(const [id,label] of [['portable-telemetry','Optional telemetry'],['faculty-communications','Email updates and faculty requests']]){
  const pattern=new RegExp('<section class="section" id="'+id+'"><div class="site-container">([\\s\\S]*?)</div></section>');
  const match=s.match(pattern);if(!match)throw Error('Missing section '+id);
  moved.push('<section id="'+id+'">\n<p class="eyebrow">'+label+'</p>\n'+match[1]+'\n</section>\n');
  s=s.replace(pattern,'');
 }
 s=s.replace('<a href="#scope">Scope</a><a href="#faculty-communications">Email updates and faculty requests</a>','<a href="#scope">Scope</a>');
 s=s.replace('<a href="#contact">Contact</a>','<a href="#portable-telemetry">Optional telemetry</a>\n<a href="#faculty-communications">Email updates and faculty requests</a>\n<a href="#contact">Contact</a>');
 return s.replace('<section id="contact">',moved.join('')+'<section id="contact">');
});
