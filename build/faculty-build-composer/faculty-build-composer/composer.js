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
  easy: 'Foundational practice',
  medium: 'Intermediate practice',
  hard: 'Advanced practice',
  elite: 'Challenge practice',
  legendary: 'Mastery practice',
  easyBoss: 'Checkpoint One questions',
  mediumBoss: 'Checkpoint Two questions',
  finalBoss: 'Final Checkpoint questions',
  legendaryBoss: 'Mastery checkpoint questions',
  repair: 'Repair questions',
  repairSeed: 'Repair routing',
  bridge: 'Bridge questions',
  calculation: 'Calculation questions',
  integration: 'Integrated-analysis questions',
  graph: 'Graph questions'
};

const AREA_LABELS = {
  general: 'General economics',
  micro: 'Microeconomics',
  macro: 'Macroeconomics'
};

const GENERAL_IDS = new Set([
  'scarcity-and-tradeoffs', 'opportunity-cost', 'marginal-analysis', 'incentives',
  'gains-from-trade', 'market-failures', 'models-and-assumptions',
  'production-possibilities-frontier', 'micro-versus-macro',
  'positive-versus-normative-analysis', 'economist-policy-role',
  'integrated-economic-analysis', 'elasticity'
]);

const MICRO_IDS = new Set([
  'marginal-analysis', 'incentives', 'gains-from-trade', 'market-failures',
  'production-possibilities-frontier', 'positive-versus-normative-analysis',
  'economist-policy-role', 'competitive-markets', 'demand', 'supply',
  'market-equilibrium', 'price-signals', 'binding-price-ceilings',
  'binding-price-floors', 'tax-wedges-and-revenue',
  'statutory-versus-economic-tax-incidence', 'tax-incidence',
  'integrated-economic-analysis', 'elasticity',
  'price-elasticity-of-demand', 'price-elasticity-of-supply',
  'income-elasticity-of-demand', 'cross-price-elasticity-of-demand',
  'elasticity-and-total-revenue', 'applications-of-elasticity',
  'consumer-and-producer-surplus', 'international-trade-and-trade-policy', 'costs-of-production',
  'perfect-competition', 'monopoly', 'monopolistic-competition', 'oligopoly'
]);

const MACRO_IDS = new Set();

const PRESETS = [
  {
    id: 'general-foundations',
    area: 'general',
    title: 'General economics foundations',
    description: 'Choice, tradeoffs, models, incentives, policy language, and production possibilities.',
    conceptIds: [
      'scarcity-and-tradeoffs', 'opportunity-cost', 'marginal-analysis', 'incentives',
      'gains-from-trade', 'models-and-assumptions', 'production-possibilities-frontier',
      'micro-versus-macro', 'positive-versus-normative-analysis', 'economist-policy-role'
    ]
  },
  {
    id: 'micro-market-foundations',
    area: 'micro',
    title: 'Market Foundations',
    description: 'Competitive markets, demand, supply, equilibrium, price signals, elasticity, and surplus.',
    conceptIds: [
      'competitive-markets', 'demand', 'supply', 'market-equilibrium',
      'price-signals', 'elasticity', 'consumer-and-producer-surplus'
    ]
  },
  {
    id: 'micro-market-policy',
    area: 'micro',
    title: 'Market Policy',
    description: 'Elasticity and surplus applied to price controls, tax wedges, and tax incidence.',
    conceptIds: [
      'elasticity', 'consumer-and-producer-surplus',
      'binding-price-ceilings', 'binding-price-floors', 'tax-wedges-and-revenue', 'tax-incidence'
    ]
  },
  {
    id: 'micro-trade-welfare',
    area: 'micro',
    title: 'Trade & Welfare',
    description: 'Gains from trade, elasticity, consumer and producer surplus, and international trade policy.',
    conceptIds: [
      'gains-from-trade', 'elasticity', 'consumer-and-producer-surplus',
      'international-trade-and-trade-policy'
    ]
  },
  {
    id: 'micro-firms-markets',
    area: 'micro',
    title: 'Firms & Market Structure',
    description: 'Production costs and firm behavior in perfect competition, monopoly, monopolistic competition, and oligopoly.',
    conceptIds: [
      'costs-of-production', 'perfect-competition', 'monopoly',
      'monopolistic-competition', 'oligopoly'
    ]
  },
  {
    id: 'micro-principles-core',
    area: 'micro',
    title: 'Principles Micro Core',
    description: 'A broad sequence from markets and elasticity through surplus, trade, costs, and the major market structures.',
    conceptIds: [
      'competitive-markets', 'demand', 'supply', 'market-equilibrium', 'price-signals',
      'elasticity', 'consumer-and-producer-surplus', 'international-trade-and-trade-policy',
      'costs-of-production', 'perfect-competition', 'monopoly',
      'monopolistic-competition', 'oligopoly'
    ]
  },
  {
    id: 'macro-measurement-growth',
    area: 'macro',
    title: 'Macro measurement and growth',
    description: 'GDP, inflation measures, real values, productivity, growth, and unemployment.',
    conceptIds: [
      'gdp-measurement', 'gdp-components', 'real-versus-nominal-gdp', 'limits-of-gdp',
      'cpi-and-inflation-measurement', 'cpi-bias', 'cpi-versus-gdp-deflator',
      'indexing-and-real-values', 'real-versus-nominal-interest-rates',
      'living-standards-and-growth', 'productivity-measurement', 'sources-of-productivity',
      'economic-growth-policy', 'unemployment-measurement', 'unemployment-types',
      'labor-market-institutions', 'natural-rate-of-unemployment'
    ]
  },
  {
    id: 'money-banking-inflation',
    area: 'macro',
    title: 'Money, banking, and inflation',
    description: 'Money creation, central banking, monetary tools, inflation, and the value of money.',
    conceptIds: [
      'money-functions-and-measures', 'central-bank-and-federal-reserve',
      'bank-money-creation', 'monetary-policy-tools', 'monetary-control-limits',
      'quantity-theory-of-money', 'monetary-neutrality', 'fisher-effect',
      'inflation-costs', 'inflation-tax-and-deflation'
    ]
  },
  {
    id: 'stabilization-policy',
    area: 'macro',
    title: 'Stabilization and policy',
    description: 'AD-AS, monetary and fiscal transmission, Phillips curves, and policy tradeoffs.',
    conceptIds: [
      'liquidity-preference-and-money-market', 'monetary-policy-transmission',
      'fiscal-policy-and-aggregate-demand', 'fiscal-multipliers-and-crowding-out',
      'stabilization-policy', 'aggregate-demand', 'aggregate-supply',
      'macroeconomic-equilibrium-and-shocks', 'long-run-macroeconomic-adjustment',
      'short-run-phillips-curve', 'long-run-phillips-curve',
      'phillips-curve-expectations', 'disinflation-and-policy', 'sacrifice-ratio',
    ]
  }
];

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

for(const concept of registry){
  const id = concept.canonicalConceptId;
  if(!GENERAL_IDS.has(id) && !MICRO_IDS.has(id)) MACRO_IDS.add(id);
}
for(const id of GENERAL_IDS) MACRO_IDS.add(id);

function conceptAreas(id){
  const areas = [];
  if(GENERAL_IDS.has(id)) areas.push('general');
  if(MICRO_IDS.has(id)) areas.push('micro');
  if(MACRO_IDS.has(id)) areas.push('macro');
  return areas;
}

function primaryAreaLabel(id){
  const meta = metaById.get(id);
  if(meta?.parentConceptId) return `${AREA_LABELS.micro} · ${meta.familyTitle || 'Family'} subtopic`;
  if(GENERAL_IDS.has(id)) return 'Shared economic foundation';
  if(MICRO_IDS.has(id)) return AREA_LABELS.micro;
  return AREA_LABELS.macro;
}

function setActiveArea(area){
  const normalized = AREA_LABELS[area] ? area : '';
  $('areaFilter').value = normalized;
  $('conceptSearch').disabled = !normalized;
  $('selectionFilter').disabled = !normalized;
}

function inferAreaForConceptIds(ids){
  const counts = {general: 0, micro: 0, macro: 0};
  for(const id of ids){
    if(GENERAL_IDS.has(id)) counts.general += 1;
    if(MICRO_IDS.has(id) && !GENERAL_IDS.has(id)) counts.micro += 1;
    if(MACRO_IDS.has(id) && !GENERAL_IDS.has(id)) counts.macro += 1;
  }
  if(counts.micro || counts.macro) return counts.micro >= counts.macro ? 'micro' : 'macro';
  return counts.general ? 'general' : '';
}

function conceptFormatBadges(concept){
  const badges = [];
  if(Number(concept.graphCoverage || 0) > 0) badges.push(`Graphs (${concept.graphCoverage})`);
  if(Number(concept.calculationCoverage || 0) > 0) badges.push(`Calculations (${concept.calculationCoverage})`);
  const integration = Number(concept.questionCountByRole?.integration || 0);
  if(integration > 0) badges.push(`Integrated analysis (${integration})`);
  if(!badges.length) badges.push('Conceptual questions');
  return badges;
}

function relatedConceptIds(concept){
  return [...new Set([
    ...(concept.relatedConceptIds || []),
    ...(concept.prerequisiteConceptIds || [])
  ])].filter(id => metaById.has(id));
}

function formatConceptList(ids, limit = 6){
  const names = ids.slice(0, limit).map(id => metaById.get(id)?.title || id);
  if(ids.length > limit) names.push(`and ${ids.length - limit} more`);
  return names.join(', ');
}

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

function isCheckpointSupplement(id){
  return metaById.get(id)?.supplementType === 'checkpoint-challenge';
}
function selectedInstructionConceptIds(){
  return state.selectedConceptIds.filter(id => !isCheckpointSupplement(id));
}
function selectedMacroInstructionIds(){
  return selectedInstructionConceptIds().filter(id => MACRO_IDS.has(id) && !GENERAL_IDS.has(id) && !MICRO_IDS.has(id));
}
function bossCountForConcept(id, checkpointKey){
  if(isCheckpointSupplement(id)) return 0;
  return Core.bossQuestionsForCheckpoint(Core.resolveConceptModule(Library, id), checkpointKey).length;
}

function removeSelectedConcept(id){
  state.selectedConceptIds = state.selectedConceptIds.filter(value => value !== id);
  removeConceptFromFocus(id);
}

function enforceFamilySelectionExclusivity(id){
  const meta = metaById.get(id);
  const parentId = meta?.parentConceptId;
  if(parentId){
    if(state.selectedConceptIds.includes(parentId)) removeSelectedConcept(parentId);
    return;
  }
  for(const childId of meta?.childConceptIds || []){
    if(state.selectedConceptIds.includes(childId)) removeSelectedConcept(childId);
  }
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
  if(selected && isCheckpointSupplement(id) && selectedMacroInstructionIds().length === 0){
    announce('Select at least one Macroeconomics concept before enabling the Advanced Macro Checkpoint Supplement.');
    renderConcepts();
    return;
  }
  if(selected && !state.selectedConceptIds.includes(id)){
    enforceFamilySelectionExclusivity(id);
    state.selectedConceptIds.push(id);
  }
  if(!selected){
    removeSelectedConcept(id);
    if(!isCheckpointSupplement(id) && selectedMacroInstructionIds().length === 0){
      state.selectedConceptIds = state.selectedConceptIds.filter(value => !isCheckpointSupplement(value));
    }
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
          ? 'Full campaign with three checkpoints and save/resume.'
          : mode === 'timed'
            ? 'Ten-minute adaptive run without checkpoint minimums.'
            : mode === 'exam'
              ? 'Adaptive practice without checkpoints.'
              : mode === 'legendary'
                ? 'Mastery-level questions and mastery checkpoints only.'
                : 'Arcade scoring with three checkpoints.'
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

function renderPresets(){
  const area = $('areaFilter').value;
  const help = $('presetHelp');
  const container = $('presetOptions');

  if(!area){
    if(help) help.textContent = 'Choose a course area to see relevant quick starts.';
    container.innerHTML = '<div class="preset-empty">Choose a course area above to show only the starter combinations that fit it.</div>';
    return;
  }

  const presets = PRESETS.filter(preset => preset.area === area);
  if(help) help.textContent = `Optional quick starts for ${AREA_LABELS[area]}. Apply one, then add or remove concepts as needed.`;

  container.innerHTML = presets.map(preset => `
    <button type="button" class="preset-card" data-preset="${preset.id}">
      <strong>${esc(preset.title)}</strong>
      <span>${esc(preset.description)}</span>
      <small>${preset.conceptIds.length} concepts</small>
    </button>
  `).join('') || '<div class="preset-empty">No starter combination is defined for this area yet. Choose concepts individually below.</div>';

  container.querySelectorAll('[data-preset]').forEach(button => {
    button.addEventListener('click', () => applyPreset(button.dataset.preset));
  });
}

function applyPreset(presetId){
  const preset = PRESETS.find(item => item.id === presetId);
  if(!preset) return;
  state.selectedConceptIds = preset.conceptIds.filter(id => Library.concepts[id]);
  state.checkpointFocus = emptyCheckpointFocus();
  state.importWarnings = [];
  setActiveArea(preset.area || inferAreaForConceptIds(state.selectedConceptIds));
  renderConcepts();
  renderCheckpointBoard();
  recalculate();
  announce(`${preset.title} preset applied. ${state.selectedConceptIds.length} concepts selected.`);
}

function renderSelectedSummary(){
  const container = $('selectedConceptSummary');
  if(!state.selectedConceptIds.length){
    container.innerHTML = '<strong>No concepts selected.</strong><span>Choose individual concepts or start with a combination above.</span>';
    return;
  }
  const instructionIds = selectedInstructionConceptIds();
  const supplementIds = state.selectedConceptIds.filter(isCheckpointSupplement);
  const chips = state.selectedConceptIds.map(id => `
    <button type="button" class="selected-chip" data-remove-concept="${id}" aria-label="Remove ${esc(metaById.get(id)?.title || id)}">
      ${esc(metaById.get(id)?.title || id)} <span aria-hidden="true">×</span>
    </button>
  `).join('');
  container.innerHTML = `
    <div class="selected-summary-heading"><strong>${instructionIds.length} concept${instructionIds.length === 1 ? '' : 's'} selected${supplementIds.length ? ' + challenge supplement' : ''}</strong><span>Normal concepts provide practice and checkpoints.${supplementIds.length ? ' The challenge supplement can replace only the third question of an eligible checkpoint.' : ''}</span></div>
    <div class="selected-chip-list">${chips}</div>
  `;
  container.querySelectorAll('[data-remove-concept]').forEach(button => {
    button.addEventListener('click', () => setSelected(button.dataset.removeConcept, false));
  });
}

function renderConceptRecommendations(){
  const container = $('conceptRecommendations');
  const area = $('areaFilter').value;
  if(!area || !state.selectedConceptIds.length){
    container.innerHTML = '';
    return;
  }
  const scores = new Map();
  for(const selectedId of state.selectedConceptIds){
    const concept = metaById.get(selectedId);
    for(const relatedId of relatedConceptIds(concept || {})){
      if(state.selectedConceptIds.includes(relatedId)) continue;
      if(!conceptAreas(relatedId).includes(area)) continue;
      scores.set(relatedId, (scores.get(relatedId) || 0) + 1);
    }
  }
  const suggestions = [...scores.entries()]
    .sort((a, b) => b[1] - a[1] || (metaById.get(a[0])?.title || '').localeCompare(metaById.get(b[0])?.title || ''))
    .slice(0, 5)
    .map(([id]) => id);

  if(!suggestions.length){
    container.innerHTML = '';
    return;
  }
  container.innerHTML = `
    <div class="recommendation-heading">
      <strong>Optional related concepts</strong>
      <span>These are common pairings, not prerequisites. Use only what fits your course.</span>
    </div>
    <div class="recommendation-actions">
      ${suggestions.map(id => `<button type="button" class="recommendation-button" data-add-related="${id}">+ ${esc(metaById.get(id)?.title || id)}</button>`).join('')}
    </div>
  `;
  container.querySelectorAll('[data-add-related]').forEach(button => {
    button.addEventListener('click', () => setSelected(button.dataset.addRelated, true));
  });
}

function renderConcepts(){
  const area = $('areaFilter').value;
  setActiveArea(area);
  renderPresets();
  renderSelectedSummary();

  if(!area){
    $('conceptGrid').innerHTML = `
      <div class="empty" role="status">
        <strong>Choose a course area to view concepts.</strong>
        <span>Select General economics, Microeconomics, or Macroeconomics above. Your selections remain saved when you switch areas.</span>
      </div>
    `;
    $('conceptRecommendations').innerHTML = '';
    return;
  }

  const search = $('conceptSearch').value.trim().toLowerCase();
  const filter = $('selectionFilter').value;
  const visible = registry.filter(concept => {
    if(concept.supplementType === 'checkpoint-challenge') return false;
    const selected = state.selectedConceptIds.includes(concept.canonicalConceptId);
    if(filter === 'selected' && !selected) return false;
    if(filter === 'unselected' && selected) return false;
    if(area && !conceptAreas(concept.canonicalConceptId).includes(area)) return false;
    const haystack = [
      concept.title,
      concept.description,
      ...(concept.includedSkills || [])
    ].join(' ').toLowerCase();
    return !search || haystack.includes(search);
  });

  $('conceptGrid').innerHTML = visible.map(concept => {
    const id = concept.canonicalConceptId;
    const selected = state.selectedConceptIds.includes(id);
    const roles = concept.questionCountByRole || {};
    const difficulties = concept.questionCountByDifficulty || {};
    const checkpointCounts = Core.CHECKPOINT_ORDER.map(checkpointKey => bossCountForConcept(id, checkpointKey));
    const practiceTotal = ['main', 'elite', 'legendary', 'calculation', 'integration']
      .reduce((total, role) => total + Number(roles[role] || 0), 0);
    const checkpointTotal = checkpointCounts.reduce((total, count) => total + count, 0)
      + Number(roles.legendaryBoss || 0);
    const related = relatedConceptIds(concept);
    const formatBadges = conceptFormatBadges(concept);
    const coverageStatus = concept.coverageStatus || 'insufficient';
    const coverageStatusLabel = concept.coverageStatusLabel || 'Insufficient depth — expansion underway';

    return `
      <article class="concept-card ${selected ? 'selected' : ''} ${concept.parentConceptId ? 'family-child' : ''} depth-${coverageStatus}">
        <div class="concept-card-kickers">
          <div class="concept-area">${esc(primaryAreaLabel(id))}</div>
          <div class="coverage-status ${coverageStatus}">${esc(coverageStatusLabel)}</div>
        </div>
        <div class="concept-head">
          <input type="checkbox" aria-label="Select ${esc(concept.title)}" data-concept="${id}" ${selected ? 'checked' : ''}>
          <div>
            <h3>${esc(concept.title)}</h3>
            <div class="format-badges">${formatBadges.map(label => `<span class="format-chip">${esc(label)}</span>`).join('')}</div>
          </div>
        </div>
        <p class="concept-description">${esc(concept.description)}</p>
        ${concept.parentConceptId ? `<p class="concept-description"><strong>Elasticity subtopic.</strong> Selecting this removes the full Elasticity family so only this slice (plus any sibling subtopics you select) enters the build.${concept.standaloneRecommendation === 'supporting-subtopic' ? ' Best used with related Elasticity topics rather than as a standalone assessment.' : ''}</p>` : ''}
        <div class="card-summary">
          <span><strong>${practiceTotal}</strong> practice</span>
          <span><strong>${checkpointTotal}</strong> checkpoint</span>
          <span><strong>${Number(roles.repair || 0) + Number(roles.bridge || 0)}</strong> adaptive support</span>
        </div>
        <details class="concept-details">
          <summary>Question coverage details</summary>
          <div class="coverage-groups">
            <div>
              <h4>Practice difficulty</h4>
              <dl>
                <div><dt>Foundational</dt><dd>${difficulties.easy || 0}</dd></div>
                <div><dt>Intermediate</dt><dd>${difficulties.medium || 0}</dd></div>
                <div><dt>Advanced</dt><dd>${difficulties.hard || 0}</dd></div>
                <div><dt>Challenge</dt><dd>${difficulties.elite || 0}</dd></div>
                <div><dt>Mastery</dt><dd>${roles.legendary || 0}</dd></div>
              </dl>
            </div>
            <div>
              <h4>Checkpoint questions</h4>
              <dl>
                <div><dt>Checkpoint One</dt><dd>${checkpointCounts[0]}</dd></div>
                <div><dt>Checkpoint Two</dt><dd>${checkpointCounts[1]}</dd></div>
                <div><dt>Final Checkpoint</dt><dd>${checkpointCounts[2]}</dd></div>
                <div><dt>Mastery checkpoint</dt><dd>${roles.legendaryBoss || 0}</dd></div>
              </dl>
            </div>
            <div>
              <h4>Adaptive support</h4>
              <dl>
                <div><dt>Repair</dt><dd>${roles.repair || 0}</dd></div>
                <div><dt>Bridge</dt><dd>${roles.bridge || 0}</dd></div>
              </dl>
            </div>
          </div>
        </details>
        <details class="concept-details relationships">
          <summary>Related concepts</summary>
          <p>${related.length ? esc(formatConceptList(related, 8)) : 'No related concepts are currently listed.'}</p>
          <small>These relationships are optional planning suggestions. They do not impose a teaching order.</small>
        </details>
      </article>
    `;
  }).join('') || '<p>No concepts match the current filters.</p>';

  $('conceptGrid').querySelectorAll('[data-concept]').forEach(input => {
    input.addEventListener('change', () => setSelected(input.dataset.concept, input.checked));
  });
  renderCheckpointSupplement(area);
  renderConceptRecommendations();
}


function renderCheckpointSupplement(area){
  const section = $('checkpointSupplementSection');
  const grid = $('checkpointSupplementGrid');
  if(!section || !grid) return;
  const concept = registry.find(item => item.supplementType === 'checkpoint-challenge');
  if(area !== 'macro' || !concept){
    section.hidden = true;
    grid.innerHTML = '';
    return;
  }
  section.hidden = false;
  const id = concept.canonicalConceptId;
  const selected = state.selectedConceptIds.includes(id);
  const canEnable = selectedMacroInstructionIds().length > 0;
  const stages = concept.challengeCountByStage || {};
  grid.innerHTML = `
    <article class="concept-card supplement-card ${selected ? 'selected' : ''}">
      <div class="concept-card-kickers">
        <div class="concept-area">Optional challenge layer</div>
        <div class="coverage-status checkpoint-supplement">${esc(concept.coverageStatusLabel || 'Optional — harder checkpoint questions')}</div>
      </div>
      <div class="concept-head">
        <input type="checkbox" aria-label="Enable ${esc(concept.title)}" data-supplement="${id}" ${selected ? 'checked' : ''} ${canEnable ? '' : 'disabled'}>
        <div><h3>${esc(concept.title)}</h3><div class="format-badges"><span class="format-chip">Checkpoint only</span><span class="format-chip">Advanced synthesis</span></div></div>
      </div>
      <p class="concept-description">${esc(concept.description)}</p>
      <div class="supplement-how"><strong>How it works:</strong> at most one eligible challenge can replace the third question of a checkpoint. The normal concept bank supplies questions one and two and remains the fallback. Timed Trial and Exam Drill are unchanged.</div>
      <div class="card-summary"><span><strong>${stages.opening || 0}</strong> opening</span><span><strong>${stages.middle || 0}</strong> middle</span><span><strong>${stages.final || 0}</strong> final</span><span><strong>${stages.legendary || 0}</strong> Legendary</span></div>
      <small>${canEnable ? 'Challenges appear only when their required Macro concepts are selected and the current checkpoint focus matches.' : 'Select at least one Macroeconomics concept above to enable this supplement.'}</small>
    </article>`;
  grid.querySelectorAll('[data-supplement]').forEach(input => input.addEventListener('change', () => setSelected(input.dataset.supplement, input.checked)));
}

function renderCheckpointBoard(){
  if(!state.selectedConceptIds.length){
    $('checkpointBoard').innerHTML = '<p class="empty">Select concepts first. Checkpoint questions will populate automatically from published difficulty metadata.</p>';
    return;
  }

  const summaries = Core.CHECKPOINT_ORDER.map(checkpointKey => {
    const checkpoint = Core.CHECKPOINTS[checkpointKey];
    const eligible = selectedEligibleConceptIds(checkpointKey);
    const focus = state.checkpointFocus[checkpointKey];
    const activeIds = focus == null ? eligible : focus.filter(id => eligible.includes(id));
    const questionCount = activeIds.reduce((total, id) => total + bossCountForConcept(id, checkpointKey), 0);
    return `
      <article class="checkpoint-summary-card ${questionCount ? 'ready' : 'empty'}">
        <span class="checkpoint-number">${checkpointKey === 'checkpointOne' ? '1' : checkpointKey === 'checkpointTwo' ? '2' : '3'}</span>
        <div>
          <h3>${checkpoint.label}</h3>
          <p>${checkpoint.difficulty[0].toUpperCase() + checkpoint.difficulty.slice(1)} checkpoint questions</p>
          <strong>${questionCount} question${questionCount === 1 ? '' : 's'} from ${activeIds.length} concept${activeIds.length === 1 ? '' : 's'}</strong>
          <small>${focus == null ? 'Automatic coverage' : 'Custom focus'}</small>
        </div>
      </article>
    `;
  }).join('');

  const columns = Core.CHECKPOINT_ORDER.map(checkpointKey => {
    const checkpoint = Core.CHECKPOINTS[checkpointKey];
    const automatic = state.checkpointFocus[checkpointKey] == null;
    const customFocus = Array.isArray(state.checkpointFocus[checkpointKey]) ? state.checkpointFocus[checkpointKey] : [];
    const eligible = selectedEligibleConceptIds(checkpointKey);
    const activeCount = automatic ? eligible.length : customFocus.length;
    const rows = state.selectedConceptIds.map(id => {
      const concept = metaById.get(id);
      const count = bossCountForConcept(id, checkpointKey);
      const checked = automatic ? count > 0 : customFocus.includes(id);
      const disabled = automatic || count === 0;
      return `
        <label class="focus-item ${count ? '' : 'ineligible'}">
          <input type="checkbox" data-checkpoint-concept="${id}" data-checkpoint="${checkpointKey}" ${checked ? 'checked' : ''} ${disabled ? 'disabled' : ''}>
          <span class="focus-item-copy">
            <strong>${esc(concept?.title || id)}</strong>
            <small>${count ? `${count} eligible question${count === 1 ? '' : 's'}` : `No eligible ${checkpoint.difficulty} checkpoint questions`}</small>
          </span>
        </label>
      `;
    }).join('');

    return `
      <section class="checkpoint-column" data-checkpoint="${checkpointKey}">
        <h3>${checkpoint.label}</h3>
        <p class="checkpoint-difficulty">${checkpoint.difficulty[0].toUpperCase() + checkpoint.difficulty.slice(1)} checkpoint questions only</p>
        <label class="auto-focus-toggle">
          <input type="checkbox" data-checkpoint-auto="${checkpointKey}" ${automatic ? 'checked' : ''}>
          Use automatic focus
        </label>
        <p class="checkpoint-help">${automatic
          ? `All ${eligible.length} selected concepts with eligible questions are included.`
          : `${activeCount} concepts are included in this custom focus. Ordinary questions remain global.`}</p>
        <div class="focus-list">${rows}</div>
      </section>
    `;
  }).join('');

  $('checkpointBoard').innerHTML = `
    <div class="checkpoint-summary-grid">${summaries}</div>
    <details class="checkpoint-customization">
      <summary>Optional: narrow which concepts supply each checkpoint</summary>
      <p>Leave automatic focus on unless you need a checkpoint to emphasize a smaller set of eligible concepts. This setting never removes ordinary questions from the game.</p>
      <div class="checkpoint-columns">${columns}</div>
    </details>
  `;

  $('checkpointBoard').querySelectorAll('[data-checkpoint-auto]').forEach(input => {
    input.addEventListener('change', () => setCheckpointAutomatic(input.dataset.checkpointAuto, input.checked));
  });
  $('checkpointBoard').querySelectorAll('[data-checkpoint-concept]').forEach(input => {
    input.addEventListener('change', () => toggleCheckpointConcept(input.dataset.checkpoint, input.dataset.checkpointConcept, input.checked));
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

function candidatePoolCount(concept, pool){
  const roles = concept.questionCountByRole || {};
  const difficulties = concept.questionCountByDifficulty || {};
  if(pool === 'easyBoss') return bossCountForConcept(concept.canonicalConceptId, 'checkpointOne');
  if(pool === 'mediumBoss') return bossCountForConcept(concept.canonicalConceptId, 'checkpointTwo');
  if(pool === 'finalBoss') return bossCountForConcept(concept.canonicalConceptId, 'finalCheckpoint');
  if(pool === 'legendaryBoss') return Number(roles.legendaryBoss || 0);
  if(pool === 'legendary') return Number(roles.legendary || 0);
  if(pool in difficulties) return Number(difficulties[pool] || 0);
  if(pool in roles) return Number(roles[pool] || 0);
  return 0;
}

function renderCoverageRecommendations(composition){
  const container = $('coverageRecommendations');
  const fieldIssues = (composition.validation?.modes || []).flatMap(mode => mode.issues || []);
  if(fieldIssues.length){
    container.innerHTML = '<div class="recommendation-heading"><strong>Repair invalid question records.</strong><span>Coverage additions cannot fix field-level validation errors. Correct the listed question IDs, then revalidate.</span></div>';
    return;
  }
  const deficiencies = (composition.validation?.modes || []).flatMap(mode => mode.deficiencies || []);
  const missingPools = [...new Set(deficiencies.map(item => item.pool))];
  if(!missingPools.length){
    const scores = new Map();
    for(const selectedId of state.selectedConceptIds){
      for(const relatedId of relatedConceptIds(metaById.get(selectedId) || {})){
        if(state.selectedConceptIds.includes(relatedId)) continue;
        scores.set(relatedId, (scores.get(relatedId) || 0) + 1);
      }
    }
    const suggestions = [...scores.entries()].sort((a,b) => b[1]-a[1]).slice(0,4).map(([id]) => id);
    if(!suggestions.length){ container.innerHTML = ''; return; }
    container.innerHTML = `
      <div class="recommendation-heading"><strong>Optional expansion</strong><span>Your selected modes are ready. These related concepts may broaden practice if they fit your course.</span></div>
      <div class="recommendation-actions">${suggestions.map(id => `<button type="button" class="recommendation-button" data-add-coverage="${id}">+ ${esc(metaById.get(id)?.title || id)}</button>`).join('')}</div>
    `;
  } else {
    const candidates = registry
      .filter(concept => !state.selectedConceptIds.includes(concept.canonicalConceptId))
      .map(concept => ({
        id: concept.canonicalConceptId,
        score: missingPools.reduce((total, pool) => total + candidatePoolCount(concept, pool), 0),
        pools: missingPools.filter(pool => candidatePoolCount(concept, pool) > 0)
      }))
      .filter(item => item.score > 0)
      .sort((a,b) => b.score-a.score || (metaById.get(a.id)?.title || '').localeCompare(metaById.get(b.id)?.title || ''))
      .slice(0,6);
    if(!candidates.length){
      container.innerHTML = '<div class="recommendation-heading"><strong>No direct concept recommendation is available.</strong><span>Disable the unsupported mode or expand the library with the missing question type.</span></div>';
      return;
    }
    container.innerHTML = `
      <div class="recommendation-heading"><strong>Concepts that may close the coverage gap</strong><span>Suggestions are based on the missing question pools, not on a required course sequence.</span></div>
      <div class="recommendation-actions">${candidates.map(item => `<button type="button" class="recommendation-button" data-add-coverage="${item.id}">+ ${esc(metaById.get(item.id)?.title || item.id)} <small>${item.pools.map(pool => POOL_LABELS[pool] || pool).join(', ')}</small></button>`).join('')}</div>
    `;
  }
  container.querySelectorAll('[data-add-coverage]').forEach(button => {
    button.addEventListener('click', () => setSelected(button.dataset.addCoverage, true));
  });
}

function renderCoverage(){
  const composition = state.composition;
  const counts = composition.counts || {};
  const selectedModes = composition.validation?.modes || [];
  const failedModes = selectedModes.filter(mode => !mode.ok);
  const thinSelected = state.selectedConceptIds
    .map(id => metaById.get(id))
    .filter(concept => concept && (concept.coverageStatus || 'insufficient') === 'insufficient');
  const practiceTotal = ['easy','medium','hard','elite','legendary'].reduce((total,pool)=>total+Number(counts[pool]||0),0);
  const checkpointTotal = ['easyBoss','mediumBoss','finalBoss','legendaryBoss'].reduce((total,pool)=>total+Number(counts[pool]||0),0);
  const adaptiveTotal = Number(counts.repair || 0) + Number(counts.repairSeed || 0) + Number(counts.bridge || 0);
  const specialTotal = Number(counts.calculation || 0) + Number(counts.integration || 0) + Number(counts.graph || 0);

  $('readinessMessage').className = `readiness-message ${failedModes.length ? 'not-ready' : thinSelected.length ? 'caution' : 'ready'}`;
  $('readinessMessage').innerHTML = failedModes.length
    ? `<strong>Not ready for every selected mode.</strong><span>${failedModes.map(mode => mode.label).join(', ')} ${failedModes.length === 1 ? 'has' : 'have'} coverage or field-level validation errors. Review the affected question IDs below.</span>`
    : thinSelected.length
      ? `<strong>Mode coverage passes, but some concepts remain thin.</strong><span>${thinSelected.map(concept => concept.title).join(', ')} ${thinSelected.length === 1 ? 'is' : 'are'} best used only as part of this broader mix until expansion is complete.</span>`
      : `<strong>Ready for all selected modes.</strong><span>The current concept mix meets the required question coverage.</span>`;

  const keyMetrics = [
    ['Selected concepts', state.selectedConceptIds.length],
    ['Practice questions', practiceTotal],
    ['Checkpoint questions', checkpointTotal],
    ['Adaptive-support questions', adaptiveTotal],
    ['Special-format uses', specialTotal]
  ];
  $('summaryGrid').innerHTML = keyMetrics.map(([label,value]) => `<div class="metric"><span>${label}</span><strong>${value}</strong></div>`).join('');

  $('modeValidation').innerHTML = selectedModes.map(mode => {
    const deficient = mode.requirements.filter(requirement => requirement.count < requirement.minimum);
    const fieldIssues = mode.issues || [];
    const failureSummary = [
      ...deficient.map(item => `${POOL_LABELS[item.pool] || item.pool}: ${item.count} available; ${item.minimum} required.`),
      ...fieldIssues.slice(0, 6).map(item => `${POOL_LABELS[item.pool] || item.pool}${item.id !== '—' ? ` (ID ${esc(item.id)})` : ''}: ${esc(item.issue)}.`)
    ].join(' ');
    const moreIssues = fieldIssues.length > 6 ? ` ${fieldIssues.length - 6} more field issue(s) are included in the generated validation details.` : '';
    return `
      <div class="validation-card ${mode.ok ? '' : 'fail'}">
        <div class="status ${mode.ok ? 'ok' : 'fail'}">${mode.ok ? 'READY' : fieldIssues.length ? 'VALIDATION ERRORS' : 'NEEDS MORE QUESTIONS'}</div>
        <h3>${mode.label}</h3>
        <p>${mode.ok
          ? 'This mode has the required question coverage and every required record passes runtime validation.'
          : `${failureSummary}${moreIssues}`}</p>
        <details><summary>View requirements and validation</summary>${mode.requirements.map(requirement => `<div>${POOL_LABELS[requirement.pool] || requirement.pool}: ${requirement.count}/${requirement.minimum}</div>`).join('')}${fieldIssues.map(item => `<div>${POOL_LABELS[item.pool] || item.pool}${item.id !== '—' ? ` (ID ${esc(item.id)})` : ''}: ${esc(item.issue)}</div>`).join('')}</details>
      </div>
    `;
  }).join('') || '<p>Select at least one mode.</p>';

  const detailedMetrics = [
    ['Foundational', counts.easy || 0], ['Intermediate', counts.medium || 0],
    ['Advanced', counts.hard || 0], ['Challenge', counts.elite || 0],
    ['Mastery', counts.legendary || 0], ['Checkpoint One', counts.easyBoss || 0],
    ['Checkpoint Two', counts.mediumBoss || 0], ['Final Checkpoint', counts.finalBoss || 0],
    ['Mastery checkpoint', counts.legendaryBoss || 0], ['Repair', counts.repair || 0],
    ['Repair routing', counts.repairSeed || 0], ['Bridge', counts.bridge || 0],
    ['Calculation', counts.calculation || 0], ['Integrated analysis', counts.integration || 0],
    ['Graph questions', counts.graph || 0], ['Embedded visuals', counts.assets || 0],
    ['Eligible checkpoint challenges', counts.challengeTotal || 0], ['Unique canonical questions', counts.totalCanonical || 0]
  ];
  $('detailedCoverage').innerHTML = detailedMetrics.map(([label,value]) => `<div class="metric"><span>${label}</span><strong>${value}</strong></div>`).join('');

  const optionalWarnings = [...state.importWarnings, ...(composition.warnings || [])]
    .filter(warning => warning.type !== 'prerequisite' && warning.type !== 'companion');
  $('warnings').innerHTML = optionalWarnings.length
    ? `<details class="advanced optional-notes"><summary>Optional adaptive-support notes (${optionalWarnings.length})</summary><ul class="warning-list">${optionalWarnings.map(warning => `<li>${esc(warning.message.replace(/boss/gi, 'checkpoint'))}</li>`).join('')}</ul></details>`
    : '';
  renderCoverageRecommendations(composition);
}

function renderFinal(){
  const composition = state.composition;
  const errors = [...(composition?.errors || [])];
  const instructionSelected = selectedInstructionConceptIds();
  if(instructionSelected.length === 1){
    const onlyConcept = metaById.get(instructionSelected[0]);
    if(onlyConcept && (onlyConcept.coverageStatus || 'insufficient') === 'insufficient'){
      errors.push(`${onlyConcept.title} does not yet have enough depth for an isolated game. Add related concepts or select a concept marked Ready for focused use.`);
    }
  }
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
    `Selected concepts: ${instructionSelected.length}${state.selectedConceptIds.some(isCheckpointSupplement) ? ' + Advanced Macro Checkpoint Supplement' : ''}`, 
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

function bytesToBase64(bytes){
  let binary = '';
  const chunkSize = 0x8000;
  for(let index = 0; index < bytes.length; index += chunkSize){
    binary += String.fromCharCode(...bytes.subarray(index, Math.min(index + chunkSize, bytes.length)));
  }
  return btoa(binary);
}

function mimeTypeForAsset(path){
  const lower = String(path || '').toLowerCase();
  if(lower.endsWith('.webp')) return 'image/webp';
  if(lower.endsWith('.png')) return 'image/png';
  if(lower.endsWith('.jpg') || lower.endsWith('.jpeg')) return 'image/jpeg';
  if(lower.endsWith('.gif')) return 'image/gif';
  if(lower.endsWith('.svg')) return 'image/svg+xml';
  return 'application/octet-stream';
}

async function sha256BytesHex(bytes){
  if(!globalThis.crypto?.subtle) return '';
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
}

async function loadEmbeddedQuestionAssets(assets){
  const embedded = {};
  for(const asset of assets || []){
    const response = await fetch(asset.sourceUrl);
    if(!response.ok) throw new Error(`Could not load ${asset.sourceUrl}`);
    const bytes = new Uint8Array(await response.arrayBuffer());
    const actualSha = await sha256BytesHex(bytes);
    if(actualSha && asset.sha256 && actualSha !== asset.sha256){
      throw new Error(`Asset integrity check failed for ${asset.runtimePath}`);
    }
    embedded[asset.runtimePath] = `data:${mimeTypeForAsset(asset.runtimePath)};base64,${bytesToBase64(bytes)}`;
  }
  return embedded;
}

async function generateGameDownload(){
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
  announce(composition.assets.length ? 'Embedding selected graph images.' : 'Preparing self-contained game file.');
  composition.embeddedQuestionAssets = await loadEmbeddedQuestionAssets(composition.assets);
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
    assetDelivery: 'embedded-data-uri',
    externalAssetFileCount: 0,
    assetInventory: composition.assets.map(asset => ({
      path: asset.runtimePath,
      sha256: asset.sha256,
      sizeBytes: asset.sizeBytes,
      embedded: true
    })),
    preflight: composition.validation,
    warnings: [...state.importWarnings, ...composition.warnings],
    answerVerification: {passed: true, questionCount: answerCheck.questionCount},
    generationTimestamp: '1980-01-01T00:00:00.000Z',
    timestampPolicy: 'Fixed for deterministic ZIP output'
  };
  const readme = `${config.title}\n\nOpen ${config.slug}.html in a modern browser. The game is self-contained; graph images are embedded in the HTML and no question-assets folder is required.\n\nTo deploy, upload the HTML file to GitHub Pages or another static host. Progress and game data stay in the learner's browser. The game does not collect email addresses or transmit gameplay data to a server.\n\nEnabled modes: ${config.supportedModes.map(mode => MODE_LABELS[mode]).join(', ')}\n\nCheckpoint questions are assigned by their published difficulty. Optional checkpoint focus only narrows which eligible concepts supply a checkpoint; it never changes ordinary-question availability or question difficulty.\n`;
  const entries = [
    {name: `${config.slug}.html`, data: html},
    {name: 'composition_recipe.json', data: Core.stableStringify(Core.canonicalRecipe(activeRecipe, Library), 2) + '\n'},
    {name: 'composition_manifest.json', data: Core.stableStringify(manifest, 2) + '\n'},
    {name: 'README.txt', data: readme}
  ];


  const zip = deterministicZip(entries);
  downloadBlob(zip, `${config.slug}.zip`);
  announce('Game download ready.');
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
  setActiveArea(inferAreaForConceptIds(state.selectedConceptIds));
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

  for(const id of ['conceptSearch', 'areaFilter', 'selectionFilter']){
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
    $('conceptSearch').value = '';
    $('selectionFilter').value = 'all';
    setActiveArea('');
    renderConcepts();
    renderCheckpointBoard();
    recalculate();
  });
  $('downloadPackage').addEventListener('click', () => {
    generateGameDownload().catch(error => {
      console.error(error);
      alert(`Game generation failed: ${error.message}`);
      announce('Game generation failed.');
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
