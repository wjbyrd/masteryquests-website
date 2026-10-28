(function(root, factory){
  const api = factory();
  if(typeof module === 'object' && module.exports) module.exports = api;
  else root.MQDeployment = api;
})(globalThis, function(){
  'use strict';
  const ID_PATTERN = /^mq[gb]-[a-f0-9]{32}$/;
  function newId(kind){
    const bytes = new Uint8Array(16);
    globalThis.crypto.getRandomValues(bytes);
    return `mq${kind === 'game' ? 'g' : 'b'}-${Array.from(bytes, n => n.toString(16).padStart(2, '0')).join('')}`;
  }
  function validGameId(value){ return typeof value === 'string' && /^mqg-[a-f0-9]{32}$/.test(value); }
  function filename(buildId){
    if(!ID_PATTERN.test(buildId) || !buildId.startsWith('mqb-')) throw new Error('Invalid package build ID.');
    return `game-${buildId}.html`;
  }
  function escapeHtml(value){
    return String(value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }
  function createEmbed(publicUrl, build){
    const url = new URL(String(publicUrl).trim());
    if(!['https:', 'http:'].includes(url.protocol) || url.username || url.password){
      throw new Error('Enter a public HTTP or HTTPS game URL. Use HTTPS for Canvas.');
    }
    // A folder URL (with or without its trailing slash), index.html, or a game
    // filename all identify the containing publication folder. Preserve query/hash.
    if(/\.html?$/i.test(url.pathname)) url.pathname = url.pathname.slice(0, url.pathname.lastIndexOf('/') + 1);
    else if(!url.pathname.endsWith('/')) url.pathname += '/';
    url.pathname += filename(build.buildId);
    url.searchParams.set('v', build.buildId);
    const gameUrl = url.href;
    const html = `<p>\n  <iframe\n    title="${escapeHtml(build.title || 'Mastery Quest game')}"\n    src="${escapeHtml(gameUrl)}"\n    width="100%"\n    height="900"\n    style="border:0;"\n    loading="lazy"\n    allowfullscreen>\n  </iframe>\n</p>`;
    return {gameUrl, html};
  }
  function panel(){
    return `<label class="field">Published folder or game URL <input data-public-url type="url" placeholder="https://wjbyrd.github.io/test/" style="width:100%;box-sizing:border-box"></label>
<p data-build-label></p>
<label class="field">Versioned game URL <input data-game-url readonly style="width:100%;box-sizing:border-box"></label>
<p><a data-open-game target="_blank" rel="noopener" hidden>Verify this build in a new tab</a></p>
<label class="field">Canvas embed HTML <textarea data-embed rows="13" readonly style="width:100%;box-sizing:border-box"></textarea></label>
<button type="button" class="secondary" data-copy disabled>Copy Canvas embed HTML</button>
<p data-embed-status role="status" aria-live="polite"></p>
<p>After publishing a new package, verify the game above and replace the iframe in Canvas with its new code. Keep earlier game files if earlier assignments still use them.</p>`;
  }
  function bindPanel(container, build){
    const find = selector => container.querySelector(selector);
    const input = find('[data-public-url]'), output = find('[data-embed]'), status = find('[data-embed-status]');
    find('[data-build-label]').textContent = `Downloaded build: ${build.buildId}`;
    function update(){
      output.value = ''; find('[data-game-url]').value = ''; find('[data-copy]').disabled = true;
      const link = find('[data-open-game]'); link.hidden = true; link.removeAttribute('href');
      status.textContent = '';
      if(!input.value.trim()) return;
      try{
        const embed = createEmbed(input.value, build);
        output.value = embed.html; find('[data-game-url]').value = embed.gameUrl;
        link.href = embed.gameUrl; link.hidden = false; find('[data-copy]').disabled = false;
        if(new URL(embed.gameUrl).protocol !== 'https:') status.textContent = 'Use an HTTPS address when embedding in Canvas.';
      } catch(error){ status.textContent = error.message; }
    }
    input.addEventListener('input', update);
    find('[data-copy]').addEventListener('click', async () => {
      try{
        if(!navigator.clipboard?.writeText) throw new Error('Clipboard unavailable');
        await navigator.clipboard.writeText(output.value);
        status.textContent = 'Canvas embed HTML copied.';
      } catch(_){
        output.focus(); output.select();
        status.textContent = 'Code selected. Press Ctrl+C (Command+C on Mac) to copy.';
      }
    });
    update();
  }
  function json(value){ return JSON.stringify(value).replace(/</g, '\\u003c'); }
  function publishingPage(build){
    // The downloaded helper works offline, with no sibling script dependencies.
    const source = [filename, escapeHtml, createEmbed, bindPanel].map(fn => fn.toString()).join('\n');
    const identity = {title:build.title,gameId:build.gameId,buildId:build.buildId};
    return `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Publish your Mastery Quest</title>
<body style="max-width:55rem;margin:2rem auto;padding:1rem;font:1rem/1.5 system-ui"><h1>Publish your Mastery Quest</h1>
<p>Upload index.html and ${escapeHtml(filename(build.buildId))} together, keeping their filenames. Enable GitHub Pages for that folder, then enter its public URL here.</p>
<main id="embed-panel">${panel()}</main>
<p>To update this game later, import composition_recipe.json in the Composer. For a different game, choose Start a different game and use a separate folder such as /test/game-two/.</p>
<p>An unchanged iframe or cached index page may keep showing an older build. This helper links directly to the exact downloaded build. No Canvas course is updated automatically.</p>
<script>const ID_PATTERN = ${ID_PATTERN};\n${source}\nbindPanel(document.getElementById('embed-panel'), ${json(identity)});</script></body></html>`;
  }
  function launcher(build){
    const target = filename(build.buildId);
    return `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(build.title)}</title>
<body><p><a id="game" href="${target}?v=${build.buildId}">Open ${escapeHtml(build.title)}</a></p>
<script>const requested = new URLSearchParams(location.search).get('v');
const buildId = /^mqb-[a-f0-9]{32}$/.test(requested || '') ? requested : ${json(build.buildId)};
const url = new URL('game-' + buildId + '.html', location.href);
url.search = location.search; url.searchParams.set('v', buildId); url.hash = location.hash;
document.getElementById('game').href = url.href; location.replace(url.href);</script></body></html>`;
  }
  return {newId, validGameId, filename, createEmbed, panel, bindPanel, publishingPage, launcher};
});
