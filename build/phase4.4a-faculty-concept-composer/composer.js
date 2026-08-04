(function(){
'use strict';

const Core = window.MQComposerCore;
const Library = window.MQ_COMPOSER_LIBRARY;
const MODE_LABELS = {
  standard: 'Standard Campaign',
  timed: 'Timed Trial',
  exam: 'Exam Drill',
  legendary: 'Legendary Mode',
  score: 'Score Attack'
};
const POOL_LABELS = {
  easy: 'Easy questions',
  medium: 'Medium questions',
  hard: 'Hard questions',
  elite: 'Elite questions',
  legendary: 'Legendary questions',
  easyBoss: 'Checkpoint One boss',
  mediumBoss: 'Checkpoint Two boss',
  finalBoss: 'Final checkpoint boss',
  legendaryBoss: 'Legendary boss',
  repair: 'Repair questions',
  bridge: 'Bridge questions'
};

const state = {
  title: 'My Faculty Mastery Quest',
  slug: 'my-faculty-mastery-quest',
  slugTouched: false,
  supportedModes: [...Core.MODE_ORDER],
  selectedConceptIds: [],
  checkpointFocus: {
    checkpointOne: null,
    checkpointTwo: null,
    finalCheckpoint: null
  },
  importWarnings: [],
  step: 1,
  templateText: '',
  templateSha256: '',
  composition: null
};

const $ = id => document.getElementById(id);
const registry = Library.registry.concepts;
const metaById = new Map(registry.map(concept => [concept.canonicalConceptId, concept]));

function esc(value){
  return String(value ?? '').replace(/[&<>"']/g, character => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
  }[character]));
}

function announce(text){
  $('liveRegion').textContent = '';
  setTimeout(() => { $('liveRegion').textContent = text; }, 20);
}

function emptyCheckpointFocus(){
  return {
    checkpointOne: null,
    checkpointTwo: null,
    finalCheckpoint: null
  };
}

function bossCountForConcept(id, checkpointKey){
  return Core.bossQuestionsForCheckpoint(Library.concepts[id], checkpointKey).length;
}

function selectedEligibleConceptIds(checkpointKey){
  return state.selectedConceptIds.filter(id => bossCountForConcept(id, checkpointKey) > 0);
}

function removeConceptFromFocus(id){
  for(const checkpointKey of Core.CHECKPOINT_ORDER){
    if(Array.isArray(state.checkpointFocus[checkpointKey])){
      state.checkpointFocus[checkpointKey] = state.checkpointFocus[checkpointKey].filter(value => value !== id);
    }
  }
}

function setSelected(id, selected){
  if(selected && !state.selectedConceptIds.includes(id)) state.selectedConceptIds.push(id);
  if(!selected){
    state.selectedConceptIds = state.selectedConceptIds.filter(value => value !== id);
    removeConceptFromFocus(id);
  }
  state.importWarnings = [];
  renderConcepts();
  renderCheckpointBoard();
  recalculate();
}

function setCheckpointAutomatic(checkpointKey, automatic){
  if(automatic){
    state.checkpointFocus[checkpointKey] = null;
  } else {
    state.checkpointFocus[checkpointKey] = selectedEligibleConceptIds(checkpointKey);
  }
  state.importWarnings = [];
  renderCheckpointBoard();
  recalculate();
  announce(`${Core.CHECKPOINTS[checkpointKey].label} focus set to ${automatic ? 'automatic' : 'custom'}.`);
}

function toggleCheckpointConcept(checkpointKey, id, checked){
  if(!Array.isArray(state.checkpointFocus[checkpointKey])){
    state.checkpointFocus[checkpointKey] = selectedEligibleConceptIds(checkpointKey);
  }
  const focus = state.checkpointFocus[checkpointKey];
  if(checked && !focus.includes(id)) focus.push(id);
  if(!checked) state.checkpointFocus[checkpointKey] = focus.filter(value => value !== id);
  state.importWarnings = [];
  renderCheckpointBoard();
  recalculate();
}

function renderModeOptions(){
  const container = $('modeOptions');
  container.innerHTML = Core.MODE_ORDER.map(mode => `
    <div class="mode-option">
      <label>
        <input type="checkbox" data-mode="${mode}" ${state.supportedModes.includes(mode) ? 'checked' : ''}>
        ${MODE_LABELS[mode]}
      </label>
      <p>${
        mode === 'standard'
          ? 'Full campaign with three checkpoint bosses and save/resume.'
          : mode === 'timed'
            ? 'Ten-minute adaptive run without checkpoint boss minimums.'
            : mode === 'exam'
              ? 'Bossless adaptive practice.'
              : mode === 'legendary'
                ? 'Legendary questions and legendary bosses only.'
                : 'Arcade scoring with checkpoint bosses.'
      }</p>
    </div>
  `).join('');

  container.querySelectorAll('input[data-mode]').forEach(input => {
    input.addEventListener('change', () => {
      state.supportedModes = Core.MODE_ORDER.filter(mode =>
        container.querySelector(`[data-mode="${mode}"]`)?.checked
      );
      recalculate();
    });
  });
}

function renderChapterOptions(){
  const chapters = [...new Set(registry.flatMap(concept => concept.sourceChapters || []))].sort((a, b) => a - b);
  $('chapterFilter').innerHTML = '<option value="">All chapters</option>'
    + chapters.map(chapter => `<option value="${chapter}">Chapter ${chapter}</option>`).join('');
}

function renderConcepts(){
  const search = $('conceptSearch').value.trim().toLowerCase();
  const chapter = $('chapterFilter').value;
  const filter = $('selectionFilter').value;
  const visible = registry.filter(concept => {
    const selected = state.selectedConceptIds.includes(concept.canonicalConceptId);
    if(filter === 'selected' && !selected) return false;
    if(filter === 'unselected' && selected) return false;
    if(chapter && !concept.sourceChapters.map(String).includes(chapter)) return false;
    const haystack = [
      concept.title,
      concept.description,
      ...(concept.sourceObjectives || []),
      ...(concept.includedSkills || [])
    ].join(' ').toLowerCase();
    return !search || haystack.includes(search);
  });

  $('conceptGrid').innerHTML = visible.map(concept => {
    const selected = state.selectedConceptIds.includes(concept.canonicalConceptId);
    const roles = concept.questionCountByRole || {};
    const difficulties = concept.questionCountByDifficulty || {};
    const checkpointCounts = Core.CHECKPOINT_ORDER.map(checkpointKey =>
      bossCountForConcept(concept.canonicalConceptId, checkpointKey)
    );
    return `
      <article class="concept-card ${selected ? 'selected' : ''}">
        <div class="concept-head">
          <input type="checkbox" aria-label="Select ${esc(concept.title)}" data-concept="${concept.canonicalConceptId}" ${selected ? 'checked' : ''}>
          <div>
            <h3>${esc(concept.title)}</h3>
            <div class="chips">
              ${(concept.sourceChapters || []).map(chapterNumber => `<span class="chip">Ch ${chapterNumber}</span>`).join('')}
              ${concept.graphCoverage ? '<span class="chip">Graph</span>' : ''}
              ${concept.calculationCoverage ? '<span class="chip">Calculation</span>' : ''}
            </div>
          </div>
        </div>
        <p>${esc(concept.description)}</p>
        <div class="counts">
          <span>E ${difficulties.easy || 0}</span>
          <span>M ${difficulties.medium || 0}</span>
          <span>H ${difficulties.hard || 0}</span>
          <span>CP1 ${checkpointCounts[0]}</span>
          <span>CP2 ${checkpointCounts[1]}</span>
          <span>Final ${checkpointCounts[2]}</span>
          <span>Legend ${roles.legendary || 0}</span>
          <span>L Boss ${roles.legendaryBoss || 0}</span>
          <span>Repair ${roles.repair || 0}</span>
          <span>Bridge ${roles.bridge || 0}</span>
        </div>
        <details>
          <summary>Relationships</summary>
          <p><strong>Prerequisites:</strong> ${(concept.prerequisiteConceptIds || []).map(id => esc(metaById.get(id)?.title || id)).join(', ') || 'None'}</p>
          <p><strong>Related:</strong> ${(concept.relatedConceptIds || []).map(id => esc(metaById.get(id)?.title || id)).join(', ') || 'None'}</p>
        </details>
      </article>
    `;
  }).join('') || '<p>No concepts match the filters.</p>';

  $('conceptGrid').querySelectorAll('[data-concept]').forEach(input => {
    input.addEventListener('change', () => setSelected(input.dataset.concept, input.checked));
  });
}

function renderCheckpointBoard(){
  if(!state.selectedConceptIds.length){
    $('checkpointBoard').innerHTML = '<p class="empty">Select concepts first. Checkpoint boss pools will populate automatically from published difficulty metadata.</p>';
    return;
  }

  $('checkpointBoard').innerHTML = Core.CHECKPOINT_ORDER.map(checkpointKey => {
    const checkpoint = Core.CHECKPOINTS[checkpointKey];
    const automatic = state.checkpointFocus[checkpointKey] == null;
    const customFocus = Array.isArray(state.checkpointFocus[checkpointKey])
      ? state.checkpointFocus[checkpointKey]
      : [];
    const eligible = selectedEligibleConceptIds(checkpointKey);
    const activeCount = automatic ? eligible.length : customFocus.length;

    const rows = state.selectedConceptIds.map(id => {
      const concept = metaById.get(id);
      const count = bossCountForConcept(id, checkpointKey);
      const checked = automatic ? count > 0 : customFocus.includes(id);
      const disabled = automatic || count === 0;
      return `
        <label class="focus-item ${count ? '' : 'ineligible'}">
          <input
            type="checkbox"
            data-checkpoint-concept="${id}"
            data-checkpoint="${checkpointKey}"
            ${checked ? 'checked' : ''}
            ${disabled ? 'disabled' : ''}
          >
          <span class="focus-item-copy">
            <strong>${esc(concept?.title || id)}</strong>
            <small>${count ? `${count} ${checkpoint.difficulty} boss question${count === 1 ? '' : 's'}` : `No ${checkpoint.difficulty} boss questions`}</small>
          </span>
        </label>
      `;
    }).join('');

    return `
      <section class="checkpoint-column" data-checkpoint="${checkpointKey}">
        <h3>${checkpoint.label}</h3>
        <p class="checkpoint-difficulty">${checkpoint.difficulty[0].toUpperCase() + checkpoint.difficulty.slice(1)} boss questions only</p>
        <label class="auto-focus-toggle">
          <input type="checkbox" data-checkpoint-auto="${checkpointKey}" ${automatic ? 'checked' : ''}>
          Automatic focus
        </label>
        <p class="checkpoint-help">
          ${automatic
            ? `Using all ${eligible.length} selected concept${eligible.length === 1 ? '' : 's'} with eligible boss questions.`
            : `Custom focus uses ${activeCount} concept${activeCount === 1 ? '' : 's'}. Ordinary questions remain global.`}
        </p>
        <div class="focus-list">${rows}</div>
      </section>
    `;
  }).join('');

  $('checkpointBoard').querySelectorAll('[data-checkpoint-auto]').forEach(input => {
    input.addEventListener('change', () => setCheckpointAutomatic(input.dataset.checkpointAuto, input.checked));
  });
  $('checkpointBoard').querySelectorAll('[data-checkpoint-concept]').forEach(input => {
    input.addEventListener('change', () =>
      toggleCheckpointConcept(input.dataset.checkpoint, input.dataset.checkpointConcept, input.checked)
    );
  });
}

function recipe(){
  return {
    schemaVersion: Core.RECIPE_SCHEMA_VERSION,
    title: state.title.trim(),
    slug: state.slug.trim(),
    supportedModes: [...state.supportedModes],
    selectedConceptIds: [...state.selectedConceptIds],
    checkpointFocus: Object.fromEntries(Core.CHECKPOINT_ORDER.map(checkpointKey => [
      checkpointKey,
      state.checkpointFocus[checkpointKey] == null
        ? null
        : [...state.checkpointFocus[checkpointKey]]
    ]))
  };
}

function recalculate(){
  state.title = $('gameTitle').value;
  state.slug = $('gameSlug').value;
  state.composition = Core.compose(Library, recipe());
  renderCoverage();
  renderFinal();
}

function renderCoverage(){
  const composition = state.composition;
  const counts = composition.counts || {};
  const metrics = [
    ['Concepts', state.selectedConceptIds.length],
    ['Canonical questions', counts.totalCanonical || 0],
    ['Easy', counts.easy || 0],
    ['Medium', counts.medium || 0],
    ['Hard', counts.hard || 0],
    ['Elite', counts.elite || 0],
    ['Legendary', counts.legendary || 0],
    ['Checkpoint One boss', counts.easyBoss || 0],
    ['Checkpoint Two boss', counts.mediumBoss || 0],
    ['Final checkpoint boss', counts.finalBoss || 0],
    ['Legendary boss', counts.legendaryBoss || 0],
    ['Repair', counts.repair || 0],
    ['Repair seed', counts.repairSeed || 0],
    ['Bridge', counts.bridge || 0],
    ['Calculation', counts.calculation || 0],
    ['Integration', counts.integration || 0],
    ['Graph questions', counts.graph || 0],
    ['Assets', counts.assets || 0]
  ];

  $('summaryGrid').innerHTML = metrics.map(([label, value]) => `
    <div class="metric"><span>${label}</span><strong>${value}</strong></div>
  `).join('');

  $('modeValidation').innerHTML = (composition.validation?.modes || []).map(mode => `
    <div class="validation-card ${mode.ok ? '' : 'fail'}">
      <div class="status ${mode.ok ? 'ok' : 'fail'}">${mode.ok ? 'PASS' : 'NEEDS MORE COVERAGE'}</div>
      <h3>${mode.label}</h3>
      ${mode.requirements.map(requirement => `
        <div>${POOL_LABELS[requirement.pool] || requirement.pool}: ${requirement.count}/${requirement.minimum}</div>
      `).join('')}
    </div>
  `).join('') || '<p>Select at least one mode.</p>';

  const warnings = [...state.importWarnings, ...(composition.warnings || [])];
  $('warnings').innerHTML = warnings.length
    ? `<h3>Guidance and migration notes</h3><ul class="warning-list">${warnings.map(warning => `<li>${esc(warning.message)}</li>`).join('')}</ul>`
    : '<p>No nonblocking warnings.</p>';
}

function renderFinal(){
  const composition = state.composition;
  const errors = [...(composition?.errors || [])];
  if(location.protocol === 'file:'){
    errors.push('Open the composer from a hosted site or local HTTP server before generating a ZIP.');
  }
  const okay = errors.length === 0;
  const focusSummary = Core.CHECKPOINT_ORDER.map(checkpointKey => {
    const checkpoint = Core.CHECKPOINTS[checkpointKey];
    const focus = state.checkpointFocus[checkpointKey];
    return `${checkpoint.label}: ${focus == null ? 'Automatic' : `Custom (${focus.length})`}`;
  }).join(' · ');
  const lines = [
    `Title: ${state.title || '—'}`,
    `Slug: ${state.slug || '—'}`,
    `Modes: ${state.supportedModes.map(mode => MODE_LABELS[mode]).join(', ') || 'None'}`,
    `Selected concepts: ${state.selectedConceptIds.length}`,
    `Checkpoint focus: ${focusSummary}`,
    `Question count: ${composition?.counts?.totalCanonical || 0}`,
    okay ? 'Status: READY TO GENERATE' : 'Status: NOT READY',
    ...errors.map(error => `• ${error}`)
  ];

  $('finalSummary').textContent = lines.join('\n');
  $('downloadPackage').disabled = !okay;
  $('downloadRecipe').disabled = !state.selectedConceptIds.length;
  $('technicalDetails').textContent = JSON.stringify({
    composerVersion: Core.COMPOSER_VERSION,
    recipeSchemaVersion: Core.RECIPE_SCHEMA_VERSION,
    libraryVersion: Library.libraryVersion,
    librarySha256: Library.librarySha256,
    templateSha256: state.templateSha256,
    checkpointFocus: recipe().checkpointFocus,
    bossCoverage: composition?.bossCoverage,
    poolCounts: composition?.counts,
    routeCounts: {
      repair: Object.keys(composition?.microSkillRepairPools || {}).length,
      repairSeed: Object.keys(composition?.skillRepairSeedPools || {}).length,
      bridge: Object.keys(composition?.microSkillBridgePools || {}).length
    },
    errors,
    warnings: [...state.importWarnings, ...(composition?.warnings || [])]
  }, null, 2);
}

function switchStep(step){
  state.step = Math.max(1, Math.min(6, Number(step)));
  document.querySelectorAll('[data-step-panel]').forEach(panel => {
    panel.classList.toggle('active', Number(panel.dataset.stepPanel) === state.step);
  });
  document.querySelectorAll('.step-nav [data-step]').forEach(button => {
    button.classList.toggle('active', Number(button.dataset.step) === state.step);
  });
  $('prevStep').disabled = state.step === 1;
  $('nextStep').disabled = state.step === 6;
  window.scrollTo({top: 0, behavior: 'smooth'});
}

function downloadBlob(blob, name){
  const anchor = document.createElement('a');
  anchor.href = URL.createObjectURL(blob);
  anchor.download = name;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  setTimeout(() => URL.revokeObjectURL(anchor.href), 1000);
}

function recipeText(){
  return Core.stableStringify(Core.canonicalRecipe(recipe(), Library), 2) + '\n';
}

function crc32(bytes){
  let checksum = 0xffffffff;
  for(const byte of bytes){
    checksum ^= byte;
    for(let index = 0; index < 8; index++){
      checksum = (checksum >>> 1) ^ ((checksum & 1) ? 0xedb88320 : 0);
    }
  }
  return (checksum ^ 0xffffffff) >>> 0;
}

function u16(number){
  return new Uint8Array([number & 255, (number >>> 8) & 255]);
}

function u32(number){
  return new Uint8Array([
    number & 255,
    (number >>> 8) & 255,
    (number >>> 16) & 255,
    (number >>> 24) & 255
  ]);
}

function concat(parts){
  const size = parts.reduce((total, part) => total + part.length, 0);
  const output = new Uint8Array(size);
  let offset = 0;
  for(const part of parts){
    output.set(part, offset);
    offset += part.length;
  }
  return output;
}

function deterministicZip(entries){
  const encoder = new TextEncoder();
  const locals = [];
  const centrals = [];
  let offset = 0;
  const ordered = [...entries].sort((a, b) => a.name.localeCompare(b.name));

  for(const entry of ordered){
    const name = encoder.encode(entry.name);
    const data = entry.data instanceof Uint8Array ? entry.data : encoder.encode(entry.data);
    const checksum = crc32(data);
    const flags = 0x0800;
    const time = 0;
    const date = 0x0021;
    const local = concat([
      u32(0x04034b50), u16(20), u16(flags), u16(0), u16(time), u16(date),
      u32(checksum), u32(data.length), u32(data.length), u16(name.length), u16(0), name, data
    ]);
    locals.push(local);
    const central = concat([
      u32(0x02014b50), u16(20), u16(20), u16(flags), u16(0), u16(time), u16(date),
      u32(checksum), u32(data.length), u32(data.length), u16(name.length), u16(0),
      u16(0), u16(0), u16(0), u32(0), u32(offset), name
    ]);
    centrals.push(central);
    offset += local.length;
  }

  const centralBlob = concat(centrals);
  const localBlob = concat(locals);
  const endOfCentralDirectory = concat([
    u32(0x06054b50), u16(0), u16(0), u16(ordered.length), u16(ordered.length),
    u32(centralBlob.length), u32(localBlob.length), u16(0)
  ]);
  return new Blob([localBlob, centralBlob, endOfCentralDirectory], {type: 'application/zip'});
}

async function generatePackage(){
  const activeRecipe = recipe();
  const composition = Core.compose(Library, activeRecipe);
  if(composition.errors.length) throw new Error(composition.errors.join('\n'));

  announce('Verifying answer hashes.');
  const answerCheck = await Core.verifyAnswers(composition);
  if(!answerCheck.ok){
    throw new Error(`Answer verification failed for ${answerCheck.issues.length} questions.`);
  }

  const config = await Core.createConfig(activeRecipe, Library, state.templateSha256);
  const metadata = {
    schemaVersion: Core.RECIPE_SCHEMA_VERSION,
    composerVersion: Core.COMPOSER_VERSION,
    title: config.title,
    slug: config.slug,
    selectedConceptIds: config.selectedConceptIds,
    checkpointFocus: config.checkpointFocus,
    bossCoverage: composition.bossCoverage,
    supportedModes: config.supportedModes,
    saveKeyNamespace: config.saveKeyNamespace,
    compositionFingerprint: config.compositionFingerprint,
    libraryVersion: Library.libraryVersion,
    librarySha256: Library.librarySha256,
    templateSha256: state.templateSha256
  };
  const html = Core.buildHtml(state.templateText, composition, config, metadata);
  const manifest = {
    ...metadata,
    generatedFilename: `${config.slug}.html`,
    poolCounts: composition.counts,
    routeCounts: {
      repair: Object.keys(composition.microSkillRepairPools).length,
      repairSeed: Object.keys(composition.skillRepairSeedPools).length,
      bridge: Object.keys(composition.microSkillBridgePools).length
    },
    assetInventory: composition.assets.map(asset => ({
      path: asset.runtimePath,
      sha256: asset.sha256,
      sizeBytes: asset.sizeBytes
    })),
    preflight: composition.validation,
    warnings: [...state.importWarnings, ...composition.warnings],
    answerVerification: {passed: true, questionCount: answerCheck.questionCount},
    generationTimestamp: '1980-01-01T00:00:00.000Z',
    timestampPolicy: 'Fixed for deterministic package output'
  };
  const readme = `${config.title}\n\nOpen ${config.slug}.html in a modern browser. Keep the HTML file and question-assets folder together.\n\nTo deploy, upload the entire extracted folder to GitHub Pages or another static host. Progress and game data stay in the learner's browser. The package does not collect email addresses or transmit gameplay data to a server.\n\nEnabled modes: ${config.supportedModes.map(mode => MODE_LABELS[mode]).join(', ')}\n\nCheckpoint boss questions are assigned by their published difficulty. Optional checkpoint focus only narrows which eligible concepts supply a checkpoint; it never changes ordinary-question availability or question difficulty.\n`;
  const entries = [
    {name: `${config.slug}.html`, data: html},
    {name: 'composition_recipe.json', data: Core.stableStringify(Core.canonicalRecipe(activeRecipe, Library), 2) + '\n'},
    {name: 'composition_manifest.json', data: Core.stableStringify(manifest, 2) + '\n'},
    {name: 'README.txt', data: readme}
  ];

  announce('Loading selected question assets.');
  for(const asset of composition.assets){
    const response = await fetch(asset.sourceUrl);
    if(!response.ok) throw new Error(`Could not load ${asset.sourceUrl}`);
    entries.push({name: asset.runtimePath, data: new Uint8Array(await response.arrayBuffer())});
  }

  const zip = deterministicZip(entries);
  downloadBlob(zip, `${config.slug}.zip`);
  announce('Game package generated.');
}

async function importRecipe(file){
  const imported = JSON.parse(await file.text());
  const migrated = Core.migrateRecipe(imported, Library);
  const next = migrated.recipe;
  state.title = next.title || 'Imported Faculty Quest';
  state.slug = Core.safeSlug(next.slug || state.title);
  state.slugTouched = true;
  state.supportedModes = [...next.supportedModes];
  state.selectedConceptIds = next.selectedConceptIds.filter(id => Library.concepts[id]);
  state.checkpointFocus = Object.fromEntries(Core.CHECKPOINT_ORDER.map(checkpointKey => [
    checkpointKey,
    next.checkpointFocus[checkpointKey] == null
      ? null
      : next.checkpointFocus[checkpointKey].filter(id => state.selectedConceptIds.includes(id))
  ]));
  state.importWarnings = migrated.migrationWarnings;

  $('gameTitle').value = state.title;
  $('gameSlug').value = state.slug;
  renderModeOptions();
  renderConcepts();
  renderCheckpointBoard();
  recalculate();
  announce(migrated.migrationWarnings.length
    ? 'Legacy recipe imported, migrated, and revalidated.'
    : 'Composition recipe imported and revalidated.');
}

async function init(){
  renderModeOptions();
  renderChapterOptions();
  renderConcepts();
  renderCheckpointBoard();

  document.querySelectorAll('.step-nav [data-step]').forEach(button => {
    button.addEventListener('click', () => switchStep(button.dataset.step));
  });
  $('prevStep').addEventListener('click', () => switchStep(state.step - 1));
  $('nextStep').addEventListener('click', () => switchStep(state.step + 1));
  $('gameTitle').addEventListener('input', event => {
    state.title = event.target.value;
    if(!state.slugTouched){
      state.slug = Core.safeSlug(state.title);
      $('gameSlug').value = state.slug;
    }
    recalculate();
  });
  $('gameSlug').addEventListener('input', event => {
    state.slugTouched = true;
    state.slug = event.target.value;
    recalculate();
  });

  for(const id of ['conceptSearch', 'chapterFilter', 'selectionFilter']){
    $(id).addEventListener(id === 'conceptSearch' ? 'input' : 'change', renderConcepts);
  }

  $('downloadRecipe').addEventListener('click', () => {
    downloadBlob(new Blob([recipeText()], {type: 'application/json'}), `${state.slug || 'composition'}-recipe.json`);
  });
  $('importRecipeBtn').addEventListener('click', () => $('importRecipe').click());
  $('importRecipe').addEventListener('change', async event => {
    try{
      if(event.target.files[0]) await importRecipe(event.target.files[0]);
    } catch(error){
      alert(`Recipe import failed: ${error.message}`);
    } finally {
      event.target.value = '';
    }
  });
  $('clearComposition').addEventListener('click', () => {
    if(!confirm('Clear the current composition?')) return;
    state.selectedConceptIds = [];
    state.checkpointFocus = emptyCheckpointFocus();
    state.importWarnings = [];
    renderConcepts();
    renderCheckpointBoard();
    recalculate();
  });
  $('downloadPackage').addEventListener('click', () => {
    generatePackage().catch(error => {
      console.error(error);
      alert(`Package generation failed: ${error.message}`);
      announce('Package generation failed.');
    });
  });

  if(location.protocol === 'file:') $('protocolWarning').classList.add('show');
  try{
    const response = await fetch('template/mastery-quests-faculty-template-composer-ready.html');
    if(!response.ok) throw new Error(`HTTP ${response.status}`);
    state.templateText = await response.text();
    state.templateSha256 = await Core.sha256Hex(state.templateText);
  } catch(error){
    console.error(error);
    $('protocolWarning').classList.add('show');
  }

  recalculate();
  switchStep(1);
}

init();
})();
