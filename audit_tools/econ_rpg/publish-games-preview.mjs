import fs from 'node:fs';
import path from 'node:path';

// Publish reviewed runtime assets only, inside a single unlisted namespace.
// Gameplay and storage identifiers are unchanged; only navigation is rebased.
export function publishGamesPreview(root, dist) {
  const config = JSON.parse(fs.readFileSync(path.join(root, 'audit_tools/econ_rpg/games-preview.json'), 'utf8'));
  if (!/^\/beta-testing\/[a-z0-9-]+\/$/.test(config.previewRoot) || config.hubPath !== 'games/') throw Error('Invalid games preview route');
  const source = path.join(root, config.source), target = path.join(dist, config.previewRoot.slice(1));
  const runtime = /\.(?:html|js|css|svg|webp|png|mp3|wav|ogg)$/i;
  const canonical = rel => rel.replace(/(^|\/)the-shock-house(?=\/)/, '$1signal-house');
  const visit = (relative = '') => {
    for (const entry of fs.readdirSync(path.join(source, relative), {withFileTypes: true})) {
      const rel = path.posix.join(relative, entry.name);
      if (entry.isDirectory()) {
        if (!relative && !['art', 'games', 'scenarios'].includes(entry.name)) continue;
        if (relative === 'art' && entry.name !== 'scenes') continue;
        if (relative === 'games' && !config.standaloneGames.includes(entry.name)) continue;
        if (['tests', 'authoring', 'node_modules'].includes(entry.name)) continue;
        visit(rel);
      } else if (entry.isFile() && runtime.test(entry.name)) {
        const dest = path.join(target, canonical(rel)); fs.mkdirSync(path.dirname(dest), {recursive: true});
        if (/\.(?:html|js)$/.test(entry.name)) {
          let text = fs.readFileSync(path.join(source, rel), 'utf8');
          // Covers HTML links and the CPI/labor card routes supplied by JS config.
          text = text.replace(/(["'])\/games\//g, '$1' + config.previewRoot + 'games/')
            .replace(/(["'])\/\?scenario=/g, '$1' + config.previewRoot + '?scenario=')
            .replaceAll('./the-shock-house/', './signal-house/');
          if (entry.name.endsWith('.html')) {
            text = text.replace(/<meta\s+name="robots"[^>]*>\s*/gi, '')
              .replace('</head>', '<meta name="robots" content="noindex,nofollow">\n</head>');
            if (rel === 'games/index.html') text = text.replace('Private instructor preview. These games have not been published.', `Unlisted instructor preview · All ${config.gameCount} games are available for testing.`);
          }
          fs.writeFileSync(dest, text);
        } else fs.copyFileSync(path.join(source, rel), dest);
      }
    }
  };
  visit();
  // Standalone games retain one authoritative source outside the older collection.
  // Copy only runtime assets into the same beta namespace and rebase navigation.
  for(const game of config.externalGames||[]){
    if(!/^[a-z0-9-]+$/.test(game.id)||!/^play\/[a-z0-9-]+$/.test(game.source))throw Error('Invalid external preview game');
    const copy=(relative='')=>{
      for(const entry of fs.readdirSync(path.join(root,game.source,relative),{withFileTypes:true})){
        if(['tests','authoring','node_modules'].includes(entry.name))continue;
        const rel=path.join(relative,entry.name),dest=path.join(target,'games',game.id,rel);
        if(entry.isDirectory()){copy(rel);continue;}
        if(!entry.isFile()||!runtime.test(entry.name))continue;
        fs.mkdirSync(path.dirname(dest),{recursive:true});
        if(entry.name.endsWith('.html')){
          let html=fs.readFileSync(path.join(root,game.source,rel),'utf8');
          html=html.replace(/<meta\s+name="robots"[^>]*>\s*/gi,'').replace('</head>','<meta name="robots" content="noindex,nofollow">\n</head>')
            .replace('<a href="/" class="brand">','<a href="../" class="brand" aria-label="Return to Games">')
            .replace('<footer>','<footer><a href="../">Return to Games</a>');
          fs.writeFileSync(dest,html);
        }else fs.copyFileSync(path.join(root,game.source,rel),dest);
      }
    };
    copy();
  }
  fs.appendFileSync(path.join(dist, '_headers'), `${config.previewRoot}*\n  X-Robots-Tag: noindex, nofollow\n  Cache-Control: no-cache\n`);
  return config;
}
