import fs from 'node:fs';
const base='build/faculty-build-composer/template/';
const file=base+'mastery-quests-faculty-template-composer-ready.html';
let html=fs.readFileSync(file,'utf8');
html=html.replace(/(<(?:div|section)[^>]*class="[^"]*mastery-section[^"]*"[^>]*>\s*)<h3([^>]*)>([\s\S]*?)<\/h3>/g,'$1<h2$2>$3</h2>');
for(const [kind,name] of [['style','accessibility.css'],['script','accessibility-runtime.js']]){
 const start=`<!-- MQ ACCESSIBILITY ${kind} START -->`,end=`<!-- MQ ACCESSIBILITY ${kind} END -->`;
 const block=`${start}\n<${kind}>\n${fs.readFileSync(base+name,'utf8')}</${kind}>\n${end}`;
 const a=html.indexOf(start),b=html.indexOf(end);
 if(a>=0)html=html.slice(0,a)+block+html.slice(b+end.length);
 else html=html.replace(kind==='style'?'</head>':'</body>',block+'\n'+(kind==='style'?'</head>':'</body>'));
}
if(process.argv.includes('--check')){if(html!==fs.readFileSync(file,'utf8'))throw Error('Stale embedded accessibility runtime');}
else if(html!==fs.readFileSync(file,'utf8')){const temporary=file+'.sync-tmp';fs.writeFileSync(temporary,html);fs.renameSync(temporary,file);}
