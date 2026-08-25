(function(){
'use strict';

const Core = window.MQComposerCore;
const Library = window.MQ_COMPOSER_LIBRARY;
const CourseAreaModel = window.MQCourseAreaModel;
const ThemeLibrary = window.MQOfficialThemeLibrary;
const CustomAssets = window.MQFacultyCustomAssets;
const MODE_LABELS = {
  standard: 'Standard Campaign',
  timed: 'Timed Trial',
  exam: 'Exam Drill',
  quiz: 'Quiz',
  unlimited: 'Unlimited Practice',
  legendary: 'Legendary Mode',
  score: 'Score Attack',
  trialGraph: 'Trial by Graph',
  fadingFortune: 'Fading Fortune',
  riskReward: 'Risk & Reward'
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
  graph: 'Graph questions',
  graphSafe: 'Trial by Graph-safe questions',
  fadingFortuneEligible: 'Fading Fortune-eligible questions',
  riskRewardEligible: 'Risk & Reward-eligible questions'
};

const AREA_LABELS = {
  general: 'General economics',
  micro: 'Microeconomics',
  macro: 'Macroeconomics'
};

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
  appearance: {presetId:'default', overrides:{}, customOverrides:{}},
  customAssets: {},
  customStatus: {},
  importWarnings: [],
  step: 1,
  templateText: '',
  templateSha256: '',
  conceptReviewManifest: null,
  conceptReviewRuntimeSource: '',
  composition: null
};

const $ = id => document.getElementById(id);
const registry = Library.registry.concepts;
const metaById = new Map(registry.map(concept => [concept.canonicalConceptId, concept]));
const courseAreas = CourseAreaModel.create(registry);
const GENERAL_IDS = new Set(courseAreas.conceptsForArea('general').map(concept => concept.canonicalConceptId));
const MICRO_IDS = new Set(courseAreas.conceptsForArea('micro').map(concept => concept.canonicalConceptId));
const MACRO_IDS = new Set(courseAreas.conceptsForArea('macro').map(concept => concept.canonicalConceptId));

function conceptAreas(id){
  return courseAreas.areasFor(id);
}

function conceptDiscipline(id){
  return courseAreas.disciplineFor(id) || 'general';
}

function isConceptVisibleForArea(concept, activeArea){
  const record = courseAreas.get(concept?.canonicalConceptId);
  return CourseAreaModel.isConceptVisibleForArea({...concept, ...record}, activeArea);
}


function setActiveArea(area){
  const normalized = AREA_LABELS[area] ? area : '';
  $('areaFilter').value = normalized;
  $('conceptSearch').disabled = !normalized;
  $('selectionFilter').disabled = !normalized;
  document.querySelectorAll('[data-selection-filter]').forEach(button => {
    button.disabled = !normalized;
  });
}

function changeActiveCourseArea(area){
  const normalized = AREA_LABELS[area] ? area : '';
  if(normalized){
    const compatibleIds = state.selectedConceptIds.filter(id => {
      if(isCheckpointSupplement(id)) return normalized === 'macro';
      return conceptAreas(id).includes(normalized);
    });
    const removedCount = state.selectedConceptIds.length - compatibleIds.length;
    if(removedCount){
      state.selectedConceptIds = compatibleIds;
      state.checkpointFocus = Object.fromEntries(Core.CHECKPOINT_ORDER.map(checkpointKey => [
        checkpointKey,
        state.checkpointFocus[checkpointKey] == null
          ? null
          : state.checkpointFocus[checkpointKey].filter(id => compatibleIds.includes(id))
      ]));
      announce(`${removedCount} selection${removedCount === 1 ? '' : 's'} outside ${AREA_LABELS[normalized]} were removed.`);
    }
  }
  setActiveArea(normalized);
  renderConcepts();
  renderCheckpointBoard();
  recalculate();
}

function conceptMatchesSearch(concept, search){
  const haystack = [
    concept.title,
    concept.description,
    ...(concept.includedSkills || [])
  ].join(' ').toLowerCase();
  return !search || haystack.includes(search);
}

function conceptBrowseCategory(concept){
  return CourseAreaModel.browseCategory(concept);
}

function matchesCurrentSubfilter(concept, filter){
  if(!filter || filter === 'all') return true;
  if(filter === 'selected') return state.selectedConceptIds.includes(concept.canonicalConceptId);
  return conceptBrowseCategory(concept) === filter;
}

function updateBrowseFilterControls(area, search){
  const filter = $('selectionFilter').value || 'all';
  const candidates = area ? registry.filter(concept => {
    if(!isConceptVisibleForArea(concept, area)) return false;
    return conceptMatchesSearch(concept, search);
  }) : [];
  const counts = {
    all: candidates.length,
    selected: candidates.filter(concept => state.selectedConceptIds.includes(concept.canonicalConceptId)).length,
    ready: candidates.filter(concept => conceptBrowseCategory(concept) === 'ready').length,
    supporting: candidates.filter(concept => conceptBrowseCategory(concept) === 'supporting').length
  };

  document.querySelectorAll('[data-selection-filter]').forEach(button => {
    const key = button.dataset.selectionFilter;
    const active = key === filter;
    button.classList.toggle('active', active);
    button.setAttribute('aria-pressed', active ? 'true' : 'false');
    const count = button.querySelector(`[data-filter-count="${key}"]`);
    if(count) count.textContent = counts[key] ?? 0;
  });
}

function facultyCoverageDisplay(concept){
  const rawLabel = String(concept.coverageStatusLabel || '');
  if(rawLabel.startsWith('Engine-safe')){
    let planningText = rawLabel.includes(';') ? rawLabel.split(';').slice(1).join(';').trim() : '';
    const facultyTerms = [
      [/F2 family/gi, 'Inflation and Real Values family'],
      [/F3 family/gi, 'Growth and Productivity family'],
      [/F4 family/gi, 'Unemployment and Labor Markets family'],
      [/F5 family sequence/gi, 'Money, Banking, and Federal Reserve sequence'],
      [/F6 long-run monetary sequence/gi, 'Money Growth, Inflation, and Monetary Neutrality sequence'],
      [/Phillips family/gi, 'Phillips Curve and Disinflation family'],
      [/GDP family/gi, 'GDP and National Output family']
    ];
    for(const [pattern, replacement] of facultyTerms) planningText = planningText.replace(pattern, replacement);
    return {
      status: 'ready-focused',
      label: 'Ready for focused use',
      planningNote: planningText ? planningText.charAt(0).toUpperCase() + planningText.slice(1) : ''
    };
  }
  return {
    status: concept.coverageStatus || 'insufficient',
    label: concept.coverageStatusLabel || 'Insufficient depth — expansion underway',
    planningNote: ''
  };
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
              ? 'Adaptive 30-room practice without checkpoints. Students may end early and generate a Mastery Report.'
              : mode === 'quiz'
                ? 'Fixed-length classroom quiz. Students choose 1–15 questions; faculty-selected concepts stay locked.'
                : mode === 'unlimited'
                  ? 'Exam Drill-style adaptive practice in repeating 30-room cycles. Students decide when to end and generate a Mastery Report.'
                  : mode === 'legendary'
                  ? 'Mastery-level questions and mastery checkpoints only.'
                  : mode === 'score'
                    ? 'Arcade scoring with three checkpoints.'
                    : mode === 'trialGraph'
                      ? 'Graph-required questions only. Students choose 10, 15, or 20 when enough audited graph-safe inventory is available.'
                      : mode === 'fadingFortune'
                        ? 'Every question begins at 100 points. Incorrect choices fade over time and reduce the available value to 75, 50, then 25. Students choose 10, 15, or 20 questions.'
                        : 'Students choose 10, 15, or 20 questions and risk 10%, 25%, 50%, or their entire bankroll before each question is revealed.'
      }</p>
    </div>
  `).join('');

  container.querySelectorAll('input[data-mode]').forEach(input => {
    input.addEventListener('change', () => {
      state.supportedModes = Core.MODE_ORDER.filter(mode =>
        container.querySelector(`[data-mode="${mode}"]`)?.checked
      );
      renderThemeSlots();
      recalculate();
    });
  });
}

function currentResolvedTheme(){
  return Core.resolveThemeSelection(state.appearance, ThemeLibrary, state.customAssets);
}

function themeAssetOptions(slotId){
  return (ThemeLibrary?.assets || [])
    .filter(asset => asset.category === 'theme' && asset.compatibleSlots.includes(slotId))
    .sort((a, b) => a.label.localeCompare(b.label));
}

function themeThumbnail(asset, fallbackLabel){
  if(!asset){
    return `<div class="theme-fallback-preview" aria-label="${esc(fallbackLabel)}">MQ</div>`;
  }
  return `<img loading="lazy" src="${esc(asset.dataUrl || asset.previewUrl)}" alt="${esc(asset.alt || asset.description || asset.label)}">`;
}

function formatImageBytes(bytes){
  const value = Number(bytes) || 0;
  return value >= 1048576 ? `${(value / 1048576).toFixed(1)} MB` : `${Math.max(1, Math.round(value / 1024))} KB`;
}

function cleanCustomAssetState(){
  state.appearance = Core.canonicalThemeSelection(state.appearance, ThemeLibrary, state.customAssets);
  state.customAssets = Core.pruneCustomAssets(state.customAssets, state.appearance, ThemeLibrary);
}

async function useCustomImage(slotId, file){
  const definition = ThemeLibrary.slots[slotId];
  if(!definition || !file) return;
  state.customStatus[slotId] = {type:'processing', message:'Preparing your image...'};
  renderThemeSlots();
  try{
    const result = await CustomAssets.processFile(file, slotId, definition);
    const prior = state.customAssets[result.record.id];
    const record = prior ? {
      ...prior,
      compatibleSlots:[...new Set([...(prior.compatibleSlots || []), slotId])],
      originalName:result.record.originalName || prior.originalName
    } : result.record;
    const nextAppearance = {
      ...state.appearance,
      overrides:{...state.appearance.overrides},
      customOverrides:{...(state.appearance.customOverrides || {}), [slotId]:record.id}
    };
    delete nextAppearance.overrides[slotId];
    const nextAssets = {...state.customAssets, [record.id]:record};
    const retained = Core.pruneCustomAssets(nextAssets, nextAppearance, ThemeLibrary);
    if(CustomAssets.totalBytes(retained) > Core.CUSTOM_ASSET_POLICY.maxTotalBytes){
      throw new Error(`Your custom artwork is over the ${Math.round(Core.CUSTOM_ASSET_POLICY.maxTotalBytes / 1048576)} MB game budget. Reset or replace another custom image first.`);
    }
    state.appearance = nextAppearance;
    state.customAssets = retained;
    state.customStatus[slotId] = {type:result.warnings.length ? 'warning' : 'valid', message:result.warnings.length ? result.warnings.join(' ') : 'Custom image ready.'};
    renderThemeSlots();
    recalculate();
    announce(`${definition.label} custom image is ready.`);
  } catch(error){
    state.customStatus[slotId] = {type:'error', message:error.facultyMessage || error.message || 'This image could not be used.'};
    renderThemeSlots();
    announce(`${definition.label} custom image was not accepted.`);
  }
}

function renderThemePresets(){
  const container = $('themePresetOptions');
  if(!container || !ThemeLibrary) return;
  const assets = new Map(ThemeLibrary.assets.map(asset => [asset.id, asset]));
  container.innerHTML = Object.values(ThemeLibrary.presets).map(preset => {
    const preview = assets.get(preset.previewAssetId) || null;
    const active = preset.id === state.appearance.presetId;
    return `<button type="button" class="theme-preset-card${active ? ' selected' : ''}" data-theme-preset="${esc(preset.id)}" aria-pressed="${active}">
      <span class="theme-preset-preview">${themeThumbnail(preview, preset.label)}</span>
      <span class="theme-preset-copy"><strong>${esc(preset.label)}</strong><small>${esc(preset.description || '')}</small></span>
    </button>`;
  }).join('');
  container.querySelectorAll('[data-theme-preset]').forEach(button => {
    button.addEventListener('click', () => {
      state.appearance.presetId = button.dataset.themePreset;
      renderThemePresets();
      renderThemeSlots();
      recalculate();
      announce(`${ThemeLibrary.presets[state.appearance.presetId].label} selected. Existing artwork overrides were kept.`);
    });
  });
}

function renderThemeSlots(){
  const container = $('themeSlotGroups');
  if(!container || !ThemeLibrary) return;
  const resolved = currentResolvedTheme();
  const groups = new Map();
  for(const [slotId, definition] of Object.entries(ThemeLibrary.slots)){
    if(definition.mode && !state.supportedModes.includes(definition.mode)) continue;
    const list = groups.get(definition.group) || [];
    list.push([slotId, definition]);
    groups.set(definition.group, list);
  }
  container.innerHTML = [...groups.entries()].map(([group, entries], groupIndex) => `
    <details class="theme-slot-group" ${groupIndex === 0 ? 'open' : ''}>
      <summary>${esc(group)} <span>${entries.length}</span></summary>
      <div class="theme-slot-grid">${entries.map(([slotId, definition]) => {
        const current = resolved.slots[slotId];
        const selectedOverride = state.appearance.overrides[slotId] || '';
        const customId = state.appearance.customOverrides?.[slotId] || '';
        const customAsset = customId ? state.customAssets[customId] : null;
        const options = themeAssetOptions(slotId);
        const sourceLabel = current.source === 'custom' ? 'Custom image' : current.source === 'override' ? 'Official selection' : current.source === 'preset' ? resolved.presetLabel : 'Default shell fallback';
        const status = state.customStatus[slotId];
        const fitWarnings = customAsset ? CustomAssets.slotFitWarnings(customAsset.width, customAsset.height, definition) : [];
        const customDetails = customAsset ? `${customAsset.width} x ${customAsset.height} - ${formatImageBytes(customAsset.sizeBytes)}` : '';
        const message = status?.message || fitWarnings.join(' ');
        const messageType = status?.type || (fitWarnings.length ? 'warning' : '');
        return `<div class="theme-slot-row" data-theme-slot="${esc(slotId)}">
          <div class="theme-slot-thumbnail">${themeThumbnail(current.asset, `${definition.label} default`)}</div>
          <div class="theme-slot-control">
            <label for="theme-slot-${esc(slotId)}">${esc(definition.label)}</label>
            <small>${esc(sourceLabel)}</small>
            <select id="theme-slot-${esc(slotId)}" data-theme-slot-select="${esc(slotId)}">
              <option value="">Use selected theme</option>
              ${options.map(asset => `<option value="${esc(asset.id)}" ${selectedOverride === asset.id ? 'selected' : ''}>${esc(asset.label)}</option>`).join('')}
            </select>
            <div class="custom-image-actions">
              <button type="button" class="custom-upload" data-custom-upload-button="${esc(slotId)}">${customAsset ? 'Replace' : 'Upload My Image'}</button>
              <input class="hidden" type="file" data-custom-upload-input="${esc(slotId)}" accept="image/webp,image/png,image/jpeg,.webp,.png,.jpg,.jpeg">
              ${customDetails ? `<span class="custom-image-meta">${esc(customDetails)}</span>` : ''}
            </div>
            ${message ? `<div class="custom-image-message ${esc(messageType)}" role="status">${esc(message)}</div>` : ''}
          </div>
          <button type="button" class="theme-reset" data-theme-reset="${esc(slotId)}" title="Reset ${esc(definition.label)} to selected theme" aria-label="Reset ${esc(definition.label)} to selected theme" ${selectedOverride || customId ? '' : 'disabled'}>Reset to Theme</button>
        </div>`;
      }).join('')}</div>
    </details>`).join('');

  container.querySelectorAll('[data-theme-slot-select]').forEach(select => {
    select.addEventListener('change', () => {
      const slotId = select.dataset.themeSlotSelect;
      if(select.value) state.appearance.overrides[slotId] = select.value;
      else delete state.appearance.overrides[slotId];
      delete state.appearance.customOverrides[slotId];
      delete state.customStatus[slotId];
      cleanCustomAssetState();
      renderThemeSlots();
      recalculate();
    });
  });
  container.querySelectorAll('[data-custom-upload-button]').forEach(button => {
    button.addEventListener('click', () => container.querySelector(`[data-custom-upload-input="${button.dataset.customUploadButton}"]`)?.click());
  });
  container.querySelectorAll('[data-custom-upload-input]').forEach(input => {
    input.addEventListener('change', async () => {
      const file = input.files?.[0];
      input.value = '';
      if(file) await useCustomImage(input.dataset.customUploadInput, file);
    });
  });
  container.querySelectorAll('[data-theme-reset]').forEach(button => {
    button.addEventListener('click', () => {
      const slotId = button.dataset.themeReset;
      delete state.appearance.overrides[slotId];
      delete state.appearance.customOverrides[slotId];
      delete state.customStatus[slotId];
      cleanCustomAssetState();
      renderThemeSlots();
      recalculate();
      announce('Artwork reset to the selected theme.');
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
  $('conceptSearch').value = '';
  $('selectionFilter').value = 'all';
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
    updateBrowseFilterControls('', '');
    $('conceptGrid').innerHTML = `
      <div class="empty" role="status">
        <strong>Choose a course area to view concepts.</strong>
        <span>Select General economics, Microeconomics, or Macroeconomics above. Your selections remain saved when you switch areas.</span>
      </div>
    `;
    $('conceptRecommendations').innerHTML = '';
    if($('browseConceptCount')) $('browseConceptCount').textContent = 'Choose an area to view its concept inventory.';
    return;
  }

  const search = $('conceptSearch').value.trim().toLowerCase();
  const filter = $('selectionFilter').value;
  updateBrowseFilterControls(area, search);
  const visible = registry.filter(concept => {
    if(!isConceptVisibleForArea(concept, area)) return false;
    if(!conceptMatchesSearch(concept, search)) return false;
    return matchesCurrentSubfilter(concept, filter);
  });
  const browseCount = $('browseConceptCount');
  if(browseCount) browseCount.textContent = `Showing ${visible.length} ${AREA_LABELS[area]} concept card${visible.length === 1 ? '' : 's'}.`;

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
    const coverageDisplay = facultyCoverageDisplay(concept);
    const coverageStatus = coverageDisplay.status;
    const coverageStatusLabel = coverageDisplay.label;
    const coveragePlanningNote = coverageDisplay.planningNote;

    return `
      <article class="concept-card ${selected ? 'selected' : ''} ${concept.parentConceptId ? 'family-child' : ''} depth-${coverageStatus}" data-concept-id="${id}" data-discipline="${conceptDiscipline(id)}" data-areas="${conceptAreas(id).join(' ')}" data-browse-category="${conceptBrowseCategory(concept)}">
        <div class="concept-card-kickers">
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
        ${concept.parentConceptId ? `<p class="concept-description"><strong>${esc(concept.familyTitle || 'Family')} subtopic.</strong> Selecting this removes the full ${esc(concept.familyTitle || 'parent')} family so only this slice (plus any sibling subtopics you select) enters the build.${String(concept.standaloneRecommendation || '').startsWith('supporting') ? ` Best used with related ${esc(concept.familyTitle || 'family')} topics rather than as a standalone assessment.` : ''}</p>` : ''}
        <div class="card-summary">
          <span><strong>${practiceTotal}</strong> practice</span>
          <span><strong>${checkpointTotal}</strong> checkpoint</span>
          <span><strong>${Number(roles.repair || 0) + Number(roles.bridge || 0)}</strong> adaptive support</span>
        </div>
        <details class="concept-details">
          <summary>Question coverage details</summary>
          ${coveragePlanningNote ? `<p class="coverage-planning-note"><strong>Planning note:</strong> ${esc(coveragePlanningNote)}</p>` : ''}
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
    <article class="concept-card supplement-card ${selected ? 'selected' : ''}" data-concept-id="${id}" data-discipline="macro" data-areas="macro">
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
  cleanCustomAssetState();
  return {
    schemaVersion: Core.RECIPE_SCHEMA_VERSION,
    title: state.title.trim(),
    slug: state.slug.trim(),
    supportedModes: [...state.supportedModes],
    selectedConceptIds: [...state.selectedConceptIds],
    appearance: Core.canonicalThemeSelection(state.appearance, ThemeLibrary, state.customAssets),
    customAssets: Core.pruneCustomAssets(state.customAssets, state.appearance, ThemeLibrary),
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
    ['Special-format uses', specialTotal],
    ['Trial by Graph-safe', counts.graphSafe || 0],
    ['Fading Fortune-eligible', counts.fadingFortuneEligible || 0],
    ['Risk & Reward-eligible', counts.riskRewardEligible || 0]
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
    ['Graph questions', counts.graph || 0], ['Trial by Graph-safe', counts.graphSafe || 0], ['Fading Fortune-eligible', counts.fadingFortuneEligible || 0], ['Risk & Reward-eligible', counts.riskRewardEligible || 0], ['Embedded visuals', counts.assets || 0],
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
    `Visual theme: ${currentResolvedTheme().presetLabel}`,
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
  state.step = Math.max(1, Math.min(7, Number(step)));
  document.querySelectorAll('[data-step-panel]').forEach(panel => {
    panel.classList.toggle('active', Number(panel.dataset.stepPanel) === state.step);
  });
  document.querySelectorAll('.step-nav [data-step]').forEach(button => {
    button.classList.toggle('active', Number(button.dataset.step) === state.step);
  });
  $('prevStep').disabled = state.step === 1;
  $('nextStep').disabled = state.step === 7;
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
  return Core.stableStringify(Core.canonicalRecipe(recipe(), Library, ThemeLibrary), 2) + '\n';
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

async function loadEmbeddedThemeAssets(assets){
  const embedded = {};
  for(const asset of assets || []){
    const response = await fetch(asset.sourceUrl);
    if(!response.ok) throw new Error(`Could not load official theme artwork: ${asset.label}`);
    const bytes = new Uint8Array(await response.arrayBuffer());
    const actualSha = await Core.sha256Hex(bytes);
    if(asset.sha256 && actualSha !== asset.sha256){
      throw new Error(`Official theme artwork failed its integrity check: ${asset.label}`);
    }
    embedded[asset.id] = `data:${asset.fileType || mimeTypeForAsset(asset.sourceUrl)};base64,${bytesToBase64(bytes)}`;
  }
  return embedded;
}

async function verifyCurrentCustomAssets(){
  const accepted = {};
  const rejected = new Map();
  let total = 0;
  for(const [id, record] of Object.entries(state.customAssets || {})){
    const verification = await CustomAssets.verifyRecord(record);
    if(!verification.ok){
      rejected.set(id, verification.error);
      continue;
    }
    if(total + record.sizeBytes > Core.CUSTOM_ASSET_POLICY.maxTotalBytes){
      rejected.set(id, `This image exceeds the ${Math.round(Core.CUSTOM_ASSET_POLICY.maxTotalBytes / 1048576)} MB custom-artwork budget.`);
      continue;
    }
    total += record.sizeBytes;
    accepted[id] = record;
  }
  const warnings = [];
  for(const [slotId, assetId] of Object.entries(state.appearance.customOverrides || {})){
    if(accepted[assetId]) continue;
    delete state.appearance.customOverrides[slotId];
    const label = ThemeLibrary.slots[slotId]?.label || slotId;
    warnings.push({type:'custom-asset-fallback', message:`${label}: ${rejected.get(assetId) || 'The saved custom image is missing.'} The selected theme was restored.`});
  }
  state.customAssets = Core.pruneCustomAssets(accepted, state.appearance, ThemeLibrary);
  if(warnings.length){
    state.importWarnings.push(...warnings);
    renderThemeSlots();
    recalculate();
  }
  return warnings;
}

async function generateGameDownload(){
  const customWarnings = await verifyCurrentCustomAssets();
  if(customWarnings.length) announce(`${customWarnings.length} invalid custom image selection${customWarnings.length === 1 ? ' was' : 's were'} restored to the selected theme.`);
  const activeRecipe = recipe();
  const composition = Core.compose(Library, activeRecipe);
  if(composition.errors.length) throw new Error(composition.errors.join('\n'));
  if(!state.conceptReviewManifest) throw new Error('Concept Review manifest is unavailable.');
  const conceptReviews = Core.resolveConceptReviews(
    Library,
    state.conceptReviewManifest,
    activeRecipe.selectedConceptIds
  );
  if(conceptReviews.errors.length) throw new Error(conceptReviews.errors.join('\n'));

  announce('Verifying answer hashes.');
  const answerCheck = await Core.verifyAnswers(composition);
  if(!answerCheck.ok){
    throw new Error(`Answer verification failed for ${answerCheck.issues.length} questions.`);
  }

  announce(conceptReviews.reviewCodes.length ? 'Embedding Concept Review routing for the centralized review library.' : 'No Concept Review routing is required for this build.');
  const conceptReviewRuntimeManifest = Core.stableStringify(conceptReviews.runtimeIndex, 2) + '\n';
  const conceptReviewRuntimeManifestBytes = new TextEncoder().encode(conceptReviewRuntimeManifest).length;

  const resolvedTheme = Core.resolveThemeSelection(activeRecipe.appearance, ThemeLibrary, activeRecipe.customAssets);
  const selectedThemeAssets = Core.themeAssetsForSelection(resolvedTheme, activeRecipe.supportedModes);
  const selectedCustomAssets = Core.customAssetsForSelection(resolvedTheme, activeRecipe.supportedModes);
  const config = await Core.createConfig(activeRecipe, Library, state.templateSha256, ThemeLibrary);
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
    templateSha256: state.templateSha256,
    conceptReviewDelivery: 'central-https',
    conceptReviewBaseUrl: Core.CONCEPT_REVIEW_PUBLIC_BASE_URL
  };
  announce(selectedThemeAssets.length ? 'Embedding selected official theme artwork.' : 'Using the default Mastery Quest presentation.');
  const embeddedThemeAssets = await loadEmbeddedThemeAssets(selectedThemeAssets);
  for(const asset of selectedCustomAssets) embeddedThemeAssets[asset.id] = asset.dataUrl;
  config.visualTheme = Core.createRuntimeThemeConfig(resolvedTheme, embeddedThemeAssets, activeRecipe.supportedModes);
  metadata.themePreset = resolvedTheme.presetId;
  metadata.themeLibraryVersion = ThemeLibrary.libraryVersion;
  announce(composition.assets.length ? 'Embedding selected graph images.' : 'Preparing self-contained game file.');
  composition.embeddedQuestionAssets = await loadEmbeddedQuestionAssets(composition.assets);
  composition.conceptReviewRuntimeSource = state.conceptReviewRuntimeSource;
  composition.conceptReviewRuntimeIndex = conceptReviews.runtimeIndex;
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
    themePreset: resolvedTheme.presetId,
    themeLibraryVersion: ThemeLibrary.libraryVersion,
    themeAssetInventory: selectedThemeAssets.map(asset => ({
      id:asset.id,
      path:asset.sourceUrl,
      sha256:asset.sha256,
      sizeBytes:asset.sizeBytes,
      embedded:true
    })),
    customThemeAssetInventory: selectedCustomAssets.map(asset => ({
      id:asset.id,
      sha256:asset.sha256,
      sizeBytes:asset.sizeBytes,
      width:asset.width,
      height:asset.height,
      embedded:true
    })),
    conceptReviewDelivery: 'central-https',
    conceptReviewBaseUrl: Core.CONCEPT_REVIEW_PUBLIC_BASE_URL,
    conceptReviewPdfCount: 0,
    conceptReviewMappedPdfCount: conceptReviews.reviewCodes.length,
    conceptReviewCodes: conceptReviews.reviewCodes,
    conceptReviewRuntimeManifestBytes,
    conceptReviewAddedBytes: conceptReviewRuntimeManifestBytes,
    conceptReviewAssetInventory: conceptReviews.assets.map(asset => ({
      code: asset.code,
      path: asset.publicUrl,
      sha256: asset.sha256,
      sizeBytes: asset.sizeBytes,
      bundled: false
    })),
    conceptReviewWarnings: conceptReviews.warnings,
    preflight: composition.validation,
    warnings: [...state.importWarnings, ...composition.warnings],
    answerVerification: {passed: true, questionCount: answerCheck.questionCount},
    generationTimestamp: '1980-01-01T00:00:00.000Z',
    timestampPolicy: 'Fixed for deterministic ZIP output'
  };
  const readme = `${config.title}

Open ${config.slug}.html directly in a modern browser. The game HTML is self-contained; graph images and Concept Review routing are embedded, so no sibling asset or concept-reviews folder is required.

Concept Review PDFs open from ${Core.CONCEPT_REVIEW_PUBLIC_BASE_URL} and require internet access only when a learner opens a recommended review. The game itself can still run from the downloaded HTML file.

To deploy, upload the HTML to GitHub Pages or another public HTTPS static host, then link or embed that URL in your LMS when the LMS permits external iframe content. Progress and game data stay in the learner's browser. The game does not collect email addresses or transmit gameplay data to a server.

Enabled modes: ${config.supportedModes.map(mode => MODE_LABELS[mode]).join(', ')}

Checkpoint questions are assigned by their published difficulty. Optional checkpoint focus only narrows which eligible concepts supply a checkpoint; it never changes ordinary-question availability or question difficulty.
`;
  const entries = [
    {name: `${config.slug}.html`, data: html},
    {name: 'composition_recipe.json', data: Core.stableStringify(Core.canonicalRecipe(activeRecipe, Library, ThemeLibrary), 2) + '\n'},
    {name: 'composition_manifest.json', data: Core.stableStringify(manifest, 2) + '\n'},
    {name: 'README.txt', data: readme}
  ];


  const zip = deterministicZip(entries);
  downloadBlob(zip, `${config.slug}.zip`);
  announce('Game download ready.');
}

async function importRecipe(file){
  const imported = JSON.parse(await file.text());
  const migrated = Core.migrateRecipe(imported, Library, ThemeLibrary);
  const next = migrated.recipe;
  const verifiedCustomAssets = {};
  const customWarnings = [];
  const rejectedCustomAssets = new Map();
  let customTotal = 0;
  for(const [id, record] of Object.entries(next.customAssets || {})){
    const verification = await CustomAssets.verifyRecord(record);
    if(!verification.ok){
      rejectedCustomAssets.set(id, verification.error);
      continue;
    }
    if(customTotal + record.sizeBytes > Core.CUSTOM_ASSET_POLICY.maxTotalBytes){
      rejectedCustomAssets.set(id, `This image exceeds the ${Math.round(Core.CUSTOM_ASSET_POLICY.maxTotalBytes / 1048576)} MB custom-artwork budget.`);
      continue;
    }
    customTotal += record.sizeBytes;
    verifiedCustomAssets[id] = record;
  }
  state.title = next.title || 'Imported Faculty Quest';
  state.slug = Core.safeSlug(next.slug || state.title);
  state.slugTouched = true;
  state.supportedModes = [...next.supportedModes];
  state.customAssets = verifiedCustomAssets;
  state.customStatus = {};
  state.appearance = Core.canonicalThemeSelection(next.appearance, ThemeLibrary, state.customAssets);
  state.selectedConceptIds = next.selectedConceptIds.filter(id => Library.concepts[id]);
  state.checkpointFocus = Object.fromEntries(Core.CHECKPOINT_ORDER.map(checkpointKey => [
    checkpointKey,
    next.checkpointFocus[checkpointKey] == null
      ? null
      : next.checkpointFocus[checkpointKey].filter(id => state.selectedConceptIds.includes(id))
  ]));
  const requestedCustomSlots = Object.keys(next.appearance?.customOverrides || {});
  for(const slotId of requestedCustomSlots){
    if(state.appearance.customOverrides[slotId]) continue;
    const label = ThemeLibrary.slots[slotId]?.label || slotId;
    const assetId = next.appearance.customOverrides[slotId];
    const reason = rejectedCustomAssets.get(assetId) || 'The saved custom image was missing or invalid.';
    const message = `${label}: ${reason} The selected theme was restored.`;
    state.customStatus[slotId] = {type:'error', message};
    customWarnings.push({type:'custom-asset-fallback', message});
  }
  state.importWarnings = [...migrated.migrationWarnings, ...customWarnings];

  $('gameTitle').value = state.title;
  $('gameSlug').value = state.slug;
  setActiveArea(inferAreaForConceptIds(state.selectedConceptIds));
  renderModeOptions();
  renderThemePresets();
  renderThemeSlots();
  renderConcepts();
  renderCheckpointBoard();
  recalculate();
  announce(customWarnings.length
    ? `${customWarnings.length} custom image selection${customWarnings.length === 1 ? ' was' : 's were'} invalid and restored to the selected theme.`
    : migrated.migrationWarnings.length
    ? 'Legacy recipe imported, migrated, and revalidated.'
    : 'Composition recipe imported and revalidated.');
}

async function init(){
  renderModeOptions();
  renderThemePresets();
  renderThemeSlots();
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

  $('conceptSearch').addEventListener('input', renderConcepts);
  $('areaFilter').addEventListener('change', event => changeActiveCourseArea(event.target.value));
  document.querySelectorAll('[data-selection-filter]').forEach(button => {
    button.addEventListener('click', () => {
      $('selectionFilter').value = button.dataset.selectionFilter || 'all';
      renderConcepts();
    });
  });

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
    state.appearance = {presetId:'default', overrides:{}, customOverrides:{}};
    state.customAssets = {};
    state.customStatus = {};
    state.importWarnings = [];
    $('conceptSearch').value = '';
    $('selectionFilter').value = 'all';
    setActiveArea('');
    renderConcepts();
    renderCheckpointBoard();
    renderThemePresets();
    renderThemeSlots();
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
    const [templateResponse, conceptReviewResponse, conceptReviewRuntimeResponse] = await Promise.all([
      fetch('template/mastery-quests-faculty-template-composer-ready.html'),
      fetch('data/concept-reviews/manifest.json'),
      fetch('concept-review-runtime.js')
    ]);
    if(!templateResponse.ok) throw new Error(`Template HTTP ${templateResponse.status}`);
    if(!conceptReviewResponse.ok) throw new Error(`Concept Review manifest HTTP ${conceptReviewResponse.status}`);
    if(!conceptReviewRuntimeResponse.ok) throw new Error(`Concept Review runtime HTTP ${conceptReviewRuntimeResponse.status}`);
    state.templateText = await templateResponse.text();
    state.templateSha256 = await Core.sha256Hex(state.templateText);
    state.conceptReviewManifest = await conceptReviewResponse.json();
    state.conceptReviewRuntimeSource = await conceptReviewRuntimeResponse.text();
    if(!state.conceptReviewRuntimeSource.trim() || /<\/script/i.test(state.conceptReviewRuntimeSource)){
      throw new Error('Concept Review runtime source is missing or unsafe to embed.');
    }
    const conceptReviewValidation = Core.validateConceptReviewManifest(Library, state.conceptReviewManifest);
    if(!conceptReviewValidation.ok) throw new Error(conceptReviewValidation.errors.join('\n'));
  } catch(error){
    console.error(error);
    $('protocolWarning').classList.add('show');
  }

  recalculate();
  switchStep(1);
}

init();
})();
