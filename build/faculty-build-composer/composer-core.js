(function(root, factory){
  const api = factory();
  if(typeof module === 'object' && module.exports) module.exports = api;
  else root.MQComposerCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function(){
'use strict';

const COMPOSER_VERSION = '4.5s.3k';
const RECIPE_SCHEMA_VERSION = '1.4.0';
const CUSTOM_ASSET_POLICY = Object.freeze({
  allowedSourceTypes:['image/webp','image/png','image/jpeg'],
  maxSourceBytes:12 * 1024 * 1024,
  maxNormalizedBytes:6 * 1024 * 1024,
  maxTotalBytes:24 * 1024 * 1024,
  maxDimension:8192,
  maxPixels:40 * 1000 * 1000,
  sceneLongEdge:2560,
  objectLongEdge:2048,
  webpQuality:0.9
});
const MODE_ORDER = ['standard', 'timed', 'exam', 'quiz', 'unlimited', 'legendary', 'score', 'trialGraph', 'fadingFortune', 'riskReward'];
const POOL_MINIMUMS = {
  easy: 6,
  medium: 6,
  hard: 6,
  elite: 4,
  legendary: 6,
  easyBoss: 3,
  mediumBoss: 3,
  finalBoss: 3,
  legendaryBoss: 3,
  repair: 1,
  bridge: 1
};
const MODE_REQUIREMENTS = {
  standard: ['easy', 'medium', 'hard', 'easyBoss', 'mediumBoss', 'finalBoss', 'repair', 'bridge'],
  timed: ['easy', 'medium', 'hard', 'repair', 'bridge'],
  exam: ['easy', 'medium', 'hard', 'repair', 'bridge'],
  quiz: ['easy', 'medium', 'hard'],
  unlimited: ['easy', 'medium', 'hard', 'repair', 'bridge'],
  legendary: ['legendary', 'legendaryBoss'],
  score: ['easy', 'medium', 'hard', 'easyBoss', 'mediumBoss', 'finalBoss', 'repair', 'bridge'],
  trialGraph: [],
  fadingFortune: [],
  riskReward: []
};
const MODE_POOL_MINIMUMS = {
  quiz: { easy: 5, medium: 5, hard: 5 }
};

function getModePoolMinimum(mode, pool){
  return MODE_POOL_MINIMUMS[mode]?.[pool] ?? POOL_MINIMUMS[pool] ?? 0;
}
const CHECKPOINT_ORDER = ['checkpointOne', 'checkpointTwo', 'finalCheckpoint'];
const CHECKPOINTS = {
  checkpointOne: {
    label: 'Checkpoint One',
    pool: 'easyBoss',
    difficulty: 'easy',
    legacyStage: 'stageOne'
  },
  checkpointTwo: {
    label: 'Checkpoint Two',
    pool: 'mediumBoss',
    difficulty: 'medium',
    legacyStage: 'stageTwo'
  },
  finalCheckpoint: {
    label: 'Final Checkpoint',
    pool: 'finalBoss',
    difficulty: 'hard',
    legacyStage: 'stageThree'
  }
};
const CONCEPT_REVIEW_RUNTIME_SCHEMA_VERSION = '2.1.0';
const CONCEPT_REVIEW_PUBLIC_BASE_URL = 'https://masteryquests.org/concept-reviews/';
const CONCEPT_REVIEW_DISPOSITIONS = new Set([
  'REVIEW_SHEET',
  'COVERED_BY_CHILD_CONCEPT',
  'NO_SHEET_INTEGRATION_META',
  'HIDDEN_SUPPLEMENTAL'
]);
const CONCEPT_REVIEW_BUNDLE_ROUTES = {
  demand: {
    skillToReviewCode: Object.fromEntries([
      ...['law_of_demand','demand_schedule_interpretation','movement_vs_demand_shift','movement_vs_shift','quantity_demanded'].map(skill => [skill, 'GEN-ECON-12']),
      ...['complement_demand_shift','complement_good_definition','demand_shift_analysis','demand_shift_direction','demand_shifters','demand_shifters_expectations','demand_shifters_income','demand_shifters_related_goods','demand_shifters_tastes','multiple_demand_shifters','normal_good_income','normal_inferior_good_analysis','related_goods','related_goods_demand','related_goods_demand_shift','substitute_good_definition','substitutes'].map(skill => [skill, 'GEN-ECON-13'])
    ]),
    reasonByReviewCode: {
      'GEN-ECON-12':'Review the law of demand and the difference between movement along a curve and a curve shift.',
      'GEN-ECON-13':'Review demand shifters, including income, expectations, tastes, substitutes, and complements.'
    }
  },
  supply: {
    skillToReviewCode: Object.fromEntries([
      ...['law_of_supply','movement_vs_supply_shift'].map(skill => [skill, 'GEN-ECON-14']),
      ...['market_supply_aggregation','market_supply_multiple_shifters','multiple_supply_shifters','net_marginal_cost_supply_shift','number_of_sellers_calculation','short_run_long_run_supply_response','subsidy_as_supply_shifter','supply_expectations_timing','supply_shift_analysis','supply_shift_and_movement','supply_shift_direction','supply_shifters','supply_shifters_expectations','supply_shifters_input_costs','supply_shifters_number_of_sellers','supply_shifters_technology','tax_as_supply_shifter'].map(skill => [skill, 'GEN-ECON-15'])
    ]),
    reasonByReviewCode: {
      'GEN-ECON-14':'Review the law of supply and the difference between movement along a curve and a curve shift.',
      'GEN-ECON-15':'Review the causes and directions of supply shifts.'
    }
  },
  'market-equilibrium': {
    skillToReviewCode: Object.fromEntries([
      ...['algebraic_equilibrium_price','algebraic_equilibrium_quantity','curve_pairing','demand_decrease','demand_decrease_market_effect','demand_increase','demand_increase_market_effect','demand_shift_equilibrium_prediction','demand_shift_equilibrium_price','equilibrium_calculation','equilibrium_comparison','equilibrium_definition','equilibrium_identification','equilibrium_prediction','graph_reading','input_costs','market_change_prediction','market_shift_analysis','normal_good','quantity_demanded','quantity_supplied','supply_decrease','supply_decrease_market_effect','supply_increase','supply_increase_market_effect','supply_shift_analysis','supply_shift_equilibrium_prediction','supply_shift_equilibrium_price'].map(skill => [skill, 'GEN-ECON-16']),
      ...['shortage_identification','shortage_market_adjustment','shortage_price_pressure','surplus_identification','surplus_market_adjustment','surplus_price_pressure','surplus_shortage_adjustment','surplus_shortage_calculation','surplus_shortage_identification'].map(skill => [skill, 'GEN-ECON-17']),
      ...['demand_decrease_supply_increase','demand_increase_supply_decrease','double_shift_ambiguous_price','double_shift_ambiguous_quantity','expectations_and_supply_shock','multi_shift_sequence','simultaneous_shift_comparison','simultaneous_shift_sequence','simultaneous_shifts'].map(skill => [skill, 'GEN-ECON-18'])
    ]),
    reasonByReviewCode: {
      'GEN-ECON-16':'Review equilibrium and how a single demand or supply shift changes price and quantity.',
      'GEN-ECON-17':'Review shortages, surpluses, and market adjustment toward equilibrium.',
      'GEN-ECON-18':'Review simultaneous demand-and-supply shifts and which outcome may be ambiguous.'
    }
  }
};

function deepClone(value){
  return JSON.parse(JSON.stringify(value));
}

function idOf(question){
  return String(question?.canonicalId ?? question?.id ?? '');
}

function uniqueStrings(items){
  const seen = new Set();
  const out = [];
  for(const item of items || []){
    const value = String(item || '');
    if(!value || seen.has(value)) continue;
    seen.add(value);
    out.push(value);
  }
  return out;
}

function themeAssetIndex(themeLibrary){
  return new Map((themeLibrary?.assets || []).map(asset => [String(asset.id || ''), asset]));
}

function isThemeAssetCompatible(asset, slotId){
  return Boolean(asset && Array.isArray(asset.compatibleSlots) && asset.compatibleSlots.includes(slotId));
}

function canonicalCustomAssets(input, themeLibrary){
  const slots = themeLibrary?.slots || {};
  const records = Array.isArray(input) ? input : Object.values(input && typeof input === 'object' ? input : {});
  const out = {};
  for(const record of records){
    const source = record && typeof record === 'object' ? record : {};
    const id = String(source.id || '');
    const fileType = String(source.fileType || source.mimeType || '').toLowerCase();
    const width = Math.round(Number(source.width) || 0);
    const height = Math.round(Number(source.height) || 0);
    const sizeBytes = Math.round(Number(source.sizeBytes) || 0);
    const originalWidth = Math.round(Number(source.originalWidth) || width);
    const originalHeight = Math.round(Number(source.originalHeight) || height);
    const originalSizeBytes = Math.round(Number(source.originalSizeBytes) || sizeBytes);
    const sha256 = String(source.sha256 || '').toLowerCase();
    const dataUrl = String(source.dataUrl || '');
    const compatibleSlots = uniqueStrings(source.compatibleSlots).filter(slotId => Boolean(slots[slotId]));
    if(!/^faculty-[a-f0-9]{16,64}$/.test(id)) continue;
    if(!CUSTOM_ASSET_POLICY.allowedSourceTypes.includes(fileType)) continue;
    if(width < 1 || height < 1 || sizeBytes < 1 || sizeBytes > CUSTOM_ASSET_POLICY.maxNormalizedBytes) continue;
    if(width > CUSTOM_ASSET_POLICY.maxDimension || height > CUSTOM_ASSET_POLICY.maxDimension || width * height > CUSTOM_ASSET_POLICY.maxPixels) continue;
    if(!/^[a-f0-9]{64}$/.test(sha256) || !dataUrl.startsWith(`data:${fileType};base64,`) || !compatibleSlots.length) continue;
    out[id] = {
      id,
      label:String(source.label || 'Custom image').slice(0, 120),
      originalName:String(source.originalName || '').slice(0, 180),
      category:'theme-custom',
      fileType,
      width,
      height,
      originalWidth,
      originalHeight,
      originalSizeBytes,
      sizeBytes,
      sha256,
      dataUrl,
      compatibleSlots,
      normalized:true
    };
  }
  return out;
}

function canonicalThemeSelection(input, themeLibrary, customAssets = {}){
  const source = input && typeof input === 'object' ? input : {};
  const presets = themeLibrary?.presets || {};
  const slots = themeLibrary?.slots || {};
  const assets = themeAssetIndex(themeLibrary);
  const custom = canonicalCustomAssets(customAssets, themeLibrary);
  const presetId = presets[source.presetId] ? source.presetId : 'default';
  const overrides = {};
  for(const [slotId, assetId] of Object.entries(source.overrides || {})){
    if(!slots[slotId]) continue;
    const asset = assets.get(String(assetId || ''));
    if(isThemeAssetCompatible(asset, slotId)) overrides[slotId] = asset.id;
  }
  const customOverrides = {};
  for(const [slotId, assetId] of Object.entries(source.customOverrides || {})){
    const asset = custom[String(assetId || '')];
    if(slots[slotId] && isThemeAssetCompatible(asset, slotId)) customOverrides[slotId] = asset.id;
  }
  return {presetId, overrides, customOverrides};
}

function resolveThemeSelection(input, themeLibrary, customAssets = {}){
  const custom = canonicalCustomAssets(customAssets, themeLibrary);
  const selection = canonicalThemeSelection(input, themeLibrary, custom);
  const presets = themeLibrary?.presets || {};
  const slotDefinitions = themeLibrary?.slots || {};
  const assets = themeAssetIndex(themeLibrary);
  const preset = presets[selection.presetId] || presets.default || {id:'default', label:'Default Mastery Quest', values:{}};
  const resolvedSlots = {};
  for(const [slotId, definition] of Object.entries(slotDefinitions)){
    const customAsset = custom[selection.customOverrides[slotId]];
    const overrideId = selection.overrides[slotId];
    const presetId = preset.values?.[slotId];
    const overrideAsset = assets.get(overrideId);
    const presetAsset = assets.get(presetId);
    const officialAsset = isThemeAssetCompatible(overrideAsset, slotId)
      ? overrideAsset
      : isThemeAssetCompatible(presetAsset, slotId) ? presetAsset : null;
    const asset = isThemeAssetCompatible(customAsset, slotId) ? customAsset : officialAsset;
    const semantic = definition.group === 'Characters' || definition.group === 'Rewards';
    const resolvedAsset = asset ? deepClone(asset) : null;
    if(resolvedAsset && asset === customAsset){
      resolvedAsset.label = `Custom ${definition.label} image`;
      resolvedAsset.displayName = semantic ? definition.label : '';
      resolvedAsset.alt = semantic ? definition.label : '';
    }
    resolvedSlots[slotId] = {
      slotId,
      source: asset ? (asset === customAsset ? 'custom' : asset === overrideAsset ? 'override' : 'preset') : 'fallback',
      fallback: definition.fallback || 'shell-default',
      asset: resolvedAsset
    };
  }
  return {
    schemaVersion: String(themeLibrary?.schemaVersion || '1.0.0'),
    libraryVersion: String(themeLibrary?.libraryVersion || ''),
    presetId: preset.id || selection.presetId,
    presetLabel: preset.label || 'Default Mastery Quest',
    overrides: selection.overrides,
    customOverrides: selection.customOverrides,
    slots: resolvedSlots
  };
}

function themeAssetsForSelection(resolvedTheme, supportedModes = MODE_ORDER){
  const enabledModes = new Set(supportedModes || []);
  const unique = new Map();
  for(const resolved of Object.values(resolvedTheme?.slots || {})){
    const mode = resolved?.slotId?.startsWith('mode')
      ? Object.entries({modeStandard:'standard',modeTimed:'timed',modeExam:'exam',modeQuiz:'quiz',modeUnlimited:'unlimited',modeLegendary:'legendary',modeScore:'score',modeTrialGraph:'trialGraph',modeFadingFortune:'fadingFortune',modeRiskReward:'riskReward'})
        .find(([slotId]) => slotId === resolved.slotId)?.[1]
      : null;
    if(mode && !enabledModes.has(mode)) continue;
    if(resolved?.source !== 'custom' && resolved?.asset?.id && !unique.has(resolved.asset.id)) unique.set(resolved.asset.id, resolved.asset);
  }
  return [...unique.values()];
}

function customAssetsForSelection(resolvedTheme, supportedModes = MODE_ORDER){
  const enabledModes = new Set(supportedModes || []);
  const unique = new Map();
  for(const resolved of Object.values(resolvedTheme?.slots || {})){
    const definitionMode = resolved?.slotId?.startsWith('mode')
      ? {modeStandard:'standard',modeTimed:'timed',modeExam:'exam',modeQuiz:'quiz',modeUnlimited:'unlimited',modeLegendary:'legendary',modeScore:'score',modeTrialGraph:'trialGraph',modeFadingFortune:'fadingFortune',modeRiskReward:'riskReward'}[resolved.slotId]
      : null;
    if(definitionMode && !enabledModes.has(definitionMode)) continue;
    if(resolved?.source === 'custom' && resolved?.asset?.id && !unique.has(resolved.asset.id)) unique.set(resolved.asset.id, resolved.asset);
  }
  return [...unique.values()];
}

function pruneCustomAssets(customAssets, appearance, themeLibrary){
  const canonical = canonicalCustomAssets(customAssets, themeLibrary);
  const referenced = new Set(Object.values(appearance?.customOverrides || {}).map(String));
  return Object.fromEntries(Object.entries(canonical).filter(([id]) => referenced.has(id)));
}

function createRuntimeThemeConfig(resolvedTheme, embeddedAssets = {}, supportedModes = MODE_ORDER){
  const enabledModes = new Set(supportedModes || []);
  const modeBySlot = {modeStandard:'standard',modeTimed:'timed',modeExam:'exam',modeQuiz:'quiz',modeUnlimited:'unlimited',modeLegendary:'legendary',modeScore:'score',modeTrialGraph:'trialGraph',modeFadingFortune:'fadingFortune',modeRiskReward:'riskReward'};
  const slots = {};
  const customAssetData = {};
  for(const [slotId, resolved] of Object.entries(resolvedTheme?.slots || {})){
    const mode = modeBySlot[slotId];
    const asset = mode && !enabledModes.has(mode) ? null : resolved?.asset;
    const embedded = asset ? String(embeddedAssets[asset.id] || '') : '';
    if(asset && resolved.source === 'custom' && embedded) customAssetData[asset.id] = embedded;
    slots[slotId] = asset ? {
      id:asset.id,
      label:asset.label || '',
      displayName:asset.displayName || asset.label || '',
      alt:asset.alt || '',
      source:resolved.source,
      src:resolved.source === 'custom' ? '' : embedded
    } : {
      id:null,
      label:'',
      displayName:'',
      alt:'',
      source:'fallback',
      src:''
    };
  }
  return {
    schemaVersion:resolvedTheme?.schemaVersion || '1.0.0',
    libraryVersion:resolvedTheme?.libraryVersion || '',
    presetId:resolvedTheme?.presetId || 'default',
    presetLabel:resolvedTheme?.presetLabel || 'Default Mastery Quest',
    overrides:deepClone(resolvedTheme?.overrides || {}),
    customOverrides:deepClone(resolvedTheme?.customOverrides || {}),
    customAssetData,
    slots
  };
}

function uniqueById(items){
  const seen = new Set();
  const out = [];
  for(const item of items || []){
    const id = idOf(item);
    if(!id || seen.has(id)) continue;
    seen.add(id);
    out.push(item);
  }
  return out;
}

function stableObject(value){
  if(Array.isArray(value)) return value.map(stableObject);
  if(value && typeof value === 'object'){
    const out = {};
    for(const key of Object.keys(value).sort()) out[key] = stableObject(value[key]);
    return out;
  }
  return value;
}

function stableStringify(value, space = 0){
  return JSON.stringify(stableObject(value), null, space);
}

function normalizeAnswerText(value){
  return String(value ?? '').normalize('NFKC').trim().replace(/\s+/g, ' ').toLowerCase();
}

function sha256Fallback(text){
  text = unescape(encodeURIComponent(String(text)));
  function rr(value, amount){ return (value >>> amount) | (value << (32 - amount)); }
  const maxWord = Math.pow(2, 32);
  const lengthProperty = 'length';
  let i;
  let j;
  let result = '';
  const words = [];
  const asciiBitLength = text[lengthProperty] * 8;
  let hash = sha256Fallback.h = sha256Fallback.h || [];
  const k = sha256Fallback.k = sha256Fallback.k || [];
  let primeCounter = k[lengthProperty];
  const isComposite = {};

  for(let candidate = 2; primeCounter < 64; candidate++){
    if(!isComposite[candidate]){
      for(i = 0; i < 313; i += candidate) isComposite[i] = candidate;
      hash[primeCounter] = (Math.pow(candidate, .5) * maxWord) | 0;
      k[primeCounter++] = (Math.pow(candidate, 1 / 3) * maxWord) | 0;
    }
  }

  text += '\x80';
  while(text[lengthProperty] % 64 - 56) text += '\x00';
  for(i = 0; i < text[lengthProperty]; i++){
    j = text.charCodeAt(i);
    words[i >> 2] |= j << ((3 - i) % 4) * 8;
  }
  words[words[lengthProperty]] = (asciiBitLength / maxWord) | 0;
  words[words[lengthProperty]] = asciiBitLength;

  for(j = 0; j < words[lengthProperty];){
    const w = words.slice(j, j += 16);
    const oldHash = hash;
    hash = hash.slice(0, 8);
    for(i = 0; i < 64; i++){
      const w15 = w[i - 15];
      const w2 = w[i - 2];
      const a = hash[0];
      const e = hash[4];
      const temp1 = hash[7]
        + (rr(e, 6) ^ rr(e, 11) ^ rr(e, 25))
        + ((e & hash[5]) ^ ((~e) & hash[6]))
        + k[i]
        + (w[i] = i < 16 ? w[i] : (
          w[i - 16]
          + (rr(w15, 7) ^ rr(w15, 18) ^ (w15 >>> 3))
          + w[i - 7]
          + (rr(w2, 17) ^ rr(w2, 19) ^ (w2 >>> 10))
        ) | 0);
      const temp2 = (rr(a, 2) ^ rr(a, 13) ^ rr(a, 22))
        + ((a & hash[1]) ^ (a & hash[2]) ^ (hash[1] & hash[2]));
      hash = [(temp1 + temp2) | 0].concat(hash);
      hash[4] = (hash[4] + temp1) | 0;
      hash.pop();
    }
    for(i = 0; i < 8; i++) hash[i] = (hash[i] + oldHash[i]) | 0;
  }

  for(i = 0; i < 8; i++){
    for(j = 3; j + 1; j--){
      const byte = (hash[i] >> (j * 8)) & 255;
      result += (byte < 16 ? '0' : '') + byte.toString(16);
    }
  }
  return result;
}
async function sha256Hex(text){
  if(globalThis.crypto?.subtle){
    const bytes = new TextEncoder().encode(String(text));
    const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
  }
  return sha256Fallback(text);
}

async function sha256BytesHex(input){
  if(!globalThis.crypto?.subtle) throw new Error('This browser cannot verify official artwork integrity.');
  const bytes = input instanceof Uint8Array
    ? input
    : input instanceof ArrayBuffer
      ? new Uint8Array(input)
      : ArrayBuffer.isView(input)
        ? new Uint8Array(input.buffer, input.byteOffset, input.byteLength)
        : null;
  if(!bytes) throw new TypeError('Official artwork integrity requires binary bytes.');
  const digest = await globalThis.crypto.subtle.digest('SHA-256', bytes);
  return Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, '0')).join('');
}

function byteArrayToBase64(bytes){
  let binary = '';
  const chunkSize = 0x8000;
  for(let index = 0; index < bytes.length; index += chunkSize){
    binary += String.fromCharCode(...bytes.subarray(index, Math.min(index + chunkSize, bytes.length)));
  }
  return btoa(binary);
}

async function loadEmbeddedThemeAssets(assets, fetchAsset = globalThis.fetch?.bind(globalThis)){
  if(typeof fetchAsset !== 'function') throw new Error('Official theme artwork cannot be loaded in this environment.');
  const embedded = {};
  for(const asset of assets || []){
    const response = await fetchAsset(asset.sourceUrl);
    if(!response.ok) throw new Error(`Could not load official theme artwork: ${asset.label}`);
    const bytes = new Uint8Array(await response.arrayBuffer());
    const actualSha = await sha256BytesHex(bytes);
    if(asset.sha256 && actualSha !== asset.sha256){
      throw new Error(`Official theme artwork failed its integrity check: ${asset.label}`);
    }
    embedded[asset.id] = `data:${asset.fileType || 'application/octet-stream'};base64,${byteArrayToBase64(bytes)}`;
  }
  return embedded;
}

// Canonical field-level question contract. The composer calls this function
// directly and embeds this exact function source into each generated game.
function validateFacultyQuestionRecord(question, poolName, availableAssets){
  const invalidFields = [];
  if(!question || typeof question !== 'object') return ['question'];

  const questionIdentity = question.id ?? question.questionId;
  if(questionIdentity === undefined || questionIdentity === null || String(questionIdentity).trim() === ''){
    invalidFields.push('id/questionId');
  }
  if(typeof question.q !== 'string' || !question.q.trim()) invalidFields.push('q');
  if(!Array.isArray(question.options) || question.options.length !== 4 || question.options.some(option => typeof option !== 'string' || !option.trim())){
    invalidFields.push('options');
  }

  const numericAnswerValid = Number.isInteger(question.a) && question.a >= 0 && question.a <= 3;
  const publishedHash = typeof question.aHash === 'string'
    ? question.aHash.trim().replace(/^sha256:/i, '')
    : '';
  const publishedHashValid = /^[a-f0-9]{64}$/i.test(publishedHash) || /^[A-Za-z0-9+/]{43}=?$/.test(publishedHash);
  if(!numericAnswerValid && !publishedHashValid) invalidFields.push('a/aHash');

  const requiredTextFields = [
    ['tag', question.tag],
    ['type/questionType', question.type || question.questionType],
    ['objective/outcomeIds/conceptId', question.objective || (Array.isArray(question.outcomeIds) ? question.outcomeIds[0] : '') || question.conceptId],
    ['primarySkill/skillId', question.primarySkill || question.skillId],
    ['repairSkill/repairSkillId', question.repairSkill || question.repairSkillId],
    ['feedback', question.feedback]
  ];
  requiredTextFields.forEach(([label, value]) => {
    if(typeof value !== 'string' || !value.trim()) invalidFields.push(label);
  });

  const normalizedPool = String(poolName || '');
  const effectiveDifficulty = String(question.canonicalDifficulty || question.difficulty || '').trim().toLowerCase();
  const validDifficulties = ['easy', 'medium', 'hard', 'elite', 'legendary'];
  const difficultyOptional = normalizedPool === 'repair' || normalizedPool === 'bridge';
  if(!difficultyOptional && !validDifficulties.includes(effectiveDifficulty)) invalidFields.push('difficulty');
  const poolDifficulty = {
    easy: 'easy', medium: 'medium', hard: 'hard', elite: 'elite', legendary: 'legendary',
    easyBoss: 'easy', mediumBoss: 'medium', finalBoss: 'hard', legendaryBoss: 'legendary'
  }[normalizedPool];
  if(poolDifficulty && effectiveDifficulty && effectiveDifficulty !== poolDifficulty){
    invalidFields.push('pool/difficulty');
  }

  if(normalizedPool.toLowerCase().includes('boss')){
    const rawStage = question.bossStage;
    if(rawStage !== undefined && rawStage !== null && rawStage !== ''){
      const normalizedStage = String(rawStage).trim().toLowerCase();
      if(!['1', '2', '3', 'opening', 'middle', 'final'].includes(normalizedStage)) invalidFields.push('bossStage');
    }
  }

  if(question.image !== undefined && question.image !== null && question.image !== ''){
    if(typeof question.image !== 'string' || !question.image.trim()){
      invalidFields.push('image');
    } else if(availableAssets){
      const imagePath = question.image.trim().replace(/^data\//, '');
      const imageFilename = imagePath.split('/').pop();
      let assetFound = false;
      let assetRecord = null;
      if(availableAssets instanceof Set){
        assetFound = availableAssets.has(imagePath) || availableAssets.has(`data/${imagePath}`);
      } else if(Array.isArray(availableAssets)){
        assetRecord = availableAssets.find(asset => {
          const candidates = typeof asset === 'string'
            ? [asset]
            : [asset?.runtimePath, asset?.sourceUrl, asset?.sourceAssetPath, asset?.filename];
          return candidates.filter(Boolean).some(candidate => {
            const normalized = String(candidate).replace(/^data\//, '');
            return normalized === imagePath || normalized.split('/').pop() === imageFilename;
          });
        });
        assetFound = Boolean(assetRecord);
      } else if(typeof availableAssets === 'object'){
        const assetKey = Object.keys(availableAssets).find(candidate => {
          const normalized = String(candidate).replace(/^data\//, '');
          return normalized === imagePath || normalized.split('/').pop() === imageFilename;
        });
        assetFound = Boolean(assetKey);
        if(assetKey && availableAssets[assetKey] && typeof availableAssets[assetKey] === 'object'){
          assetRecord = availableAssets[assetKey];
        }
      }
      if(!assetFound) invalidFields.push('image asset');
    }
  }

  return invalidFields;
}

function safeSlug(value){
  return String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function cloneQuestion(question, conceptId, assetConceptId = conceptId){
  const copy = deepClone(question);
  if(copy.image){
    const filename = String(copy.image).split(/[\\/]/).pop();
    copy.image = `question-assets/${assetConceptId || conceptId}/${filename}`;
  }
  return copy;
}

function allModuleQuestions(module){
  return [
    ...Object.values(module.questions || {}).flat(),
    ...(module.repairQuestions || []),
    ...(module.repairSeedQuestions || []),
    ...(module.bridgeQuestions || [])
  ];
}

function conceptReviewManifestMaps(manifest){
  return {
    reviewByCode: new Map((manifest?.reviews || []).map(review => [String(review?.code || ''), review])),
    conceptById: new Map((manifest?.concepts || []).map(concept => [String(concept?.canonicalConceptId || ''), concept]))
  };
}

function validateConceptReviewManifest(library, manifest){
  const errors = [];
  const warnings = [];
  if(!manifest || typeof manifest !== 'object'){
    return {ok:false, errors:['Concept Review manifest is missing or invalid.'], warnings};
  }
  if(!Array.isArray(manifest.reviews)) errors.push('Concept Review manifest reviews must be an array.');
  if(!Array.isArray(manifest.concepts)) errors.push('Concept Review manifest concepts must be an array.');
  if(manifest.composerLibraryVersion !== library?.libraryVersion){
    errors.push('Concept Review manifest Composer library version does not match the active library.');
  }

  const {reviewByCode, conceptById} = conceptReviewManifestMaps(manifest);
  const reviewCodes = (manifest.reviews || []).map(review => String(review?.code || ''));
  const conceptIds = (manifest.concepts || []).map(concept => String(concept?.canonicalConceptId || ''));
  if(reviewByCode.size !== reviewCodes.length) errors.push('Concept Review manifest contains duplicate review codes.');
  if(conceptById.size !== conceptIds.length) errors.push('Concept Review manifest contains duplicate canonical concept mappings.');

  const destinationOwners = new Map();
  for(const review of manifest.reviews || []){
    const code = String(review?.code || '');
    const pdfPath = String(review?.pdfPath || '');
    const runtimeFilename = String(review?.runtimeFilename || '');
    if(!code) errors.push('Concept Review entry is missing a code.');
    if(pdfPath.split(/[\\/]/).pop() !== `${code}.pdf`){
      errors.push(`Concept Review ${code || '(missing code)'} has a filename/code mismatch.`);
    }
    if(runtimeFilename !== `${code}.pdf`){
      errors.push(`Concept Review ${code || '(missing code)'} has an invalid runtime filename.`);
    }
    if(!/^[a-f0-9]{64}$/i.test(String(review?.sha256 || ''))){
      errors.push(`Concept Review ${code || '(missing code)'} has an invalid SHA-256.`);
    }
    if(!Number.isInteger(review?.sizeBytes) || review.sizeBytes <= 0){
      errors.push(`Concept Review ${code || '(missing code)'} has an invalid file size.`);
    }
    if(review?.pageCount !== 1) errors.push(`Concept Review ${code || '(missing code)'} is not exactly one page.`);
    if(review?.hasSelectableText !== true) errors.push(`Concept Review ${code || '(missing code)'} lacks selectable text.`);
    const destinationKey = runtimeFilename.toLowerCase();
    if(destinationOwners.has(destinationKey) && destinationOwners.get(destinationKey) !== code){
      errors.push(`Concept Reviews ${destinationOwners.get(destinationKey)} and ${code} produce the same destination filename.`);
    } else if(destinationKey){
      destinationOwners.set(destinationKey, code);
    }
  }

  const libraryIds = new Set(Object.keys(library?.concepts || {}));
  for(const id of libraryIds){
    if(!conceptById.has(id)) errors.push(`Concept Review disposition is missing for canonical concept ${id}.`);
  }
  for(const id of conceptById.keys()){
    if(!libraryIds.has(id)) errors.push(`Concept Review manifest references unknown canonical concept ${id}.`);
  }

  const referencedReviewCodes = new Set();
  for(const concept of manifest.concepts || []){
    const id = String(concept?.canonicalConceptId || '');
    const disposition = String(concept?.disposition || '');
    if(!CONCEPT_REVIEW_DISPOSITIONS.has(disposition)){
      errors.push(`Concept Review disposition for ${id || '(missing concept ID)'} is invalid.`);
      continue;
    }
    if(disposition === 'REVIEW_SHEET'){
      const codes = uniqueStrings(concept.reviewCodes || []);
      if(!codes.length) errors.push(`REVIEW_SHEET concept ${id} has no review code.`);
      for(const code of codes){
        referencedReviewCodes.add(code);
        const review = reviewByCode.get(code);
        if(!review){
          errors.push(`REVIEW_SHEET concept ${id} references missing review ${code}.`);
          continue;
        }
        if(!(review.canonicalConceptIds || []).includes(id)){
          errors.push(`Conflicting Concept Review mapping: ${id} references ${code}, but the review does not reference ${id}.`);
        }
      }
    } else if(disposition === 'COVERED_BY_CHILD_CONCEPT'){
      const childIds = uniqueStrings(concept.coveredByConceptIds || []);
      if(!childIds.length) errors.push(`COVERED_BY_CHILD_CONCEPT ${id} has no explicit child coverage.`);
      for(const childId of childIds){
        if(!conceptById.has(childId)) errors.push(`${id} is covered by unknown child concept ${childId}.`);
      }
      if((concept.reviewCodes || []).length) errors.push(`${id} cannot have direct review codes when covered by children.`);
      if(concept.diagnosable) warnings.push({type:'diagnosable-parent-covered-by-children', canonicalConceptId:id});
    } else {
      if(!String(concept.reason || '').trim()) errors.push(`${disposition} concept ${id} must record a reason.`);
      if((concept.reviewCodes || []).length) errors.push(`${disposition} concept ${id} cannot have review codes.`);
      if(disposition === 'NO_SHEET_INTEGRATION_META' && concept.diagnosable){
        warnings.push({type:'diagnosable-no-sheet-meta', canonicalConceptId:id});
      }
    }
  }

  for(const review of manifest.reviews || []){
    const code = String(review?.code || '');
    for(const id of uniqueStrings(review?.canonicalConceptIds || [])){
      const concept = conceptById.get(id);
      if(!concept){
        errors.push(`Concept Review ${code} maps unknown canonical concept ${id}.`);
      } else if(concept.disposition !== 'REVIEW_SHEET' || !(concept.reviewCodes || []).includes(code)){
        errors.push(`Conflicting Concept Review mapping: ${code} maps ${id}, but its concept disposition disagrees.`);
      }
    }
    if(!referencedReviewCodes.has(code)) warnings.push({type:'orphan-review', reviewCode:code});
  }

  const reachableReviewCodes = new Set();
  const visit = (id, seen = new Set()) => {
    if(seen.has(id)) return;
    seen.add(id);
    const concept = conceptById.get(id);
    if(!concept) return;
    for(const code of concept.reviewCodes || []) reachableReviewCodes.add(code);
    for(const childId of concept.coveredByConceptIds || []) visit(childId, seen);
  };
  for(const concept of manifest.concepts || []){
    if(concept.selectable) visit(concept.canonicalConceptId);
  }
  for(const code of reviewByCode.keys()){
    if(!reachableReviewCodes.has(code)) warnings.push({type:'unreachable-review', reviewCode:code});
  }

  return {ok:errors.length === 0, errors, warnings};
}

function resolveConceptReviews(library, manifest, selectedConceptIds){
  const validation = validateConceptReviewManifest(library, manifest);
  const errors = [...validation.errors];
  const warnings = [...validation.warnings];
  const {reviewByCode, conceptById} = conceptReviewManifestMaps(manifest);
  const selectedIds = uniqueStrings(selectedConceptIds || []);
  const diagnosticSet = new Set();

  const addDiagnostic = id => {
    const concept = conceptById.get(id);
    if(!concept){
      errors.push(`Required diagnostic concept ${id} is missing from the Concept Review manifest.`);
      return;
    }
    if(concept.disposition === 'HIDDEN_SUPPLEMENTAL' || concept.diagnosable === false) return;
    diagnosticSet.add(id);
  };

  for(const id of selectedIds){
    const concept = conceptById.get(id);
    if(!library?.concepts?.[id]){
      errors.push(`Unknown selected concept ${id} cannot be resolved to Concept Reviews.`);
      continue;
    }
    if(!concept){
      errors.push(`Selected concept ${id} has no Concept Review disposition.`);
      continue;
    }
    addDiagnostic(id);
    const module = resolveConceptModule(library, id);
    for(const question of allModuleQuestions(module || {})){
      const primaryConceptId = String(question?.primaryConceptId || '');
      if(primaryConceptId) addDiagnostic(primaryConceptId);
    }
  }

  const expandCoverage = (id, stack = new Set()) => {
    if(stack.has(id)){
      errors.push(`Concept Review child coverage contains a cycle at ${id}.`);
      return;
    }
    const concept = conceptById.get(id);
    if(!concept || concept.disposition !== 'COVERED_BY_CHILD_CONCEPT') return;
    const nextStack = new Set(stack);
    nextStack.add(id);
    for(const childId of uniqueStrings(concept.coveredByConceptIds || [])){
      addDiagnostic(childId);
      expandCoverage(childId, nextStack);
    }
  };
  for(const id of [...diagnosticSet]) expandCoverage(id);

  const diagnosticConceptIds = [...diagnosticSet].sort();
  const requiredCodes = new Set();
  for(const id of diagnosticConceptIds){
    const concept = conceptById.get(id);
    if(concept?.disposition === 'REVIEW_SHEET'){
      for(const code of uniqueStrings(concept.reviewCodes || [])) requiredCodes.add(code);
    } else if(concept?.disposition === 'NO_SHEET_INTEGRATION_META'){
      warnings.push({type:'diagnosable-no-sheet-meta-selected', canonicalConceptId:id, reason:concept.reason});
    }
  }

  const reviewCodes = [...requiredCodes].sort();
  const assets = reviewCodes.map(code => {
    const review = reviewByCode.get(code);
    if(!review){
      errors.push(`Required Concept Review ${code} is missing from the manifest.`);
      return null;
    }
    return {
      code,
      title: review.title,
      discipline: review.discipline,
      sourcePath: `data/concept-reviews/${review.pdfPath}`,
      publicUrl: `${CONCEPT_REVIEW_PUBLIC_BASE_URL}${review.runtimeFilename}`,
      sha256: review.sha256,
      sizeBytes: review.sizeBytes
    };
  }).filter(Boolean);

  const runtimeConcepts = {};
  const runtimeReviews = {};
  for(const id of diagnosticConceptIds){
    const concept = conceptById.get(id);
    if(!concept) continue;
    const runtimeConcept = {
      title: concept.displayName,
      discipline: concept.discipline,
      disposition: concept.disposition
    };
    if(concept.disposition === 'REVIEW_SHEET'){
      const conceptAssets = uniqueStrings(concept.reviewCodes || []).map(code => {
        const review = reviewByCode.get(code);
        return review ? {
          code,
          title: review.title,
          path: `${CONCEPT_REVIEW_PUBLIC_BASE_URL}${review.runtimeFilename}`,
          sha256: review.sha256
        } : null;
      }).filter(Boolean);
      runtimeConcept.reviewCodes = conceptAssets.map(asset => asset.code);
      runtimeConcept.primaryReviewCode = concept.primaryReviewCode || conceptAssets[0]?.code || null;
      runtimeConcept.assets = conceptAssets;
      runtimeReviews[id] = {
        reviewCodes: runtimeConcept.reviewCodes,
        primaryReviewCode: runtimeConcept.primaryReviewCode,
        assets: conceptAssets
      };
      if(conceptAssets.length === 1){
        runtimeReviews[id].code = conceptAssets[0].code;
        runtimeReviews[id].title = conceptAssets[0].title;
        runtimeReviews[id].path = conceptAssets[0].path;
      }
    } else if(concept.disposition === 'COVERED_BY_CHILD_CONCEPT'){
      runtimeConcept.coveredByConceptIds = uniqueStrings(concept.coveredByConceptIds || []);
      runtimeConcept.reason = concept.reason;
    } else {
      runtimeConcept.reason = concept.reason;
    }
    runtimeConcepts[id] = runtimeConcept;
  }

  const evidenceRoutes = {
    questionToConceptIds:{},
    repairSkillToConceptIds:{},
    primarySkillToConceptIds:{},
    secondarySkillToConceptIds:{},
    objectiveToConceptIds:{}
  };
  const diagnosticIds = new Set(diagnosticConceptIds);
  const addEvidenceRoute = (route, key, ids) => {
    const routeKey = String(key || '');
    const targets = uniqueStrings(ids || []).filter(id => diagnosticIds.has(id));
    if(!routeKey || !targets.length) return;
    route[routeKey] = uniqueStrings([...(route[routeKey] || []), ...targets]);
  };
  for(const selectedId of selectedIds){
    const module = resolveConceptModule(library, selectedId);
    for(const question of allModuleQuestions(module || {})){
      const primaryId = String(question?.primaryConceptId || '');
      const familyId = String(question?.familyConceptId || '');
      const subtopicIds = uniqueStrings(question?.subtopicIds || []).filter(id => diagnosticIds.has(id));
      const targets = uniqueStrings([
        ...(subtopicIds.length ? subtopicIds : []),
        ...(diagnosticIds.has(primaryId) && primaryId !== familyId ? [primaryId] : [])
      ]);
      if(!targets.length) continue;
      addEvidenceRoute(evidenceRoutes.questionToConceptIds, idOf(question), targets);
      addEvidenceRoute(evidenceRoutes.repairSkillToConceptIds, question?.repairSkill || question?.repairSkillId, targets);
      addEvidenceRoute(evidenceRoutes.primarySkillToConceptIds, question?.primarySkill || question?.skillId, targets);
      for(const skill of uniqueStrings([...(question?.secondarySkills || []), ...(question?.secondarySkillIds || [])])){
        addEvidenceRoute(evidenceRoutes.secondarySkillToConceptIds, skill, targets);
      }
      addEvidenceRoute(evidenceRoutes.objectiveToConceptIds, question?.objective || question?.resourceMatching?.objectiveKey, targets);
    }
  }

  const bundleRoutes = {};
  for(const id of diagnosticConceptIds){
    if(CONCEPT_REVIEW_BUNDLE_ROUTES[id] && (runtimeReviews[id]?.assets || []).length > 1){
      const allowedCodes = new Set(runtimeReviews[id].assets.map(asset => asset.code));
      const source = CONCEPT_REVIEW_BUNDLE_ROUTES[id];
      bundleRoutes[id] = {
        skillToReviewCode:Object.fromEntries(Object.entries(source.skillToReviewCode).filter(([, code]) => allowedCodes.has(code))),
        objectiveToReviewCode:{},
        reasonByReviewCode:Object.fromEntries(Object.entries(source.reasonByReviewCode).filter(([code]) => allowedCodes.has(code)))
      };
    }
  }

  const runtimeIndex = {
    schemaVersion: CONCEPT_REVIEW_RUNTIME_SCHEMA_VERSION,
    sourceManifestSchemaVersion: manifest?.schemaVersion || '',
    delivery: 'central-https',
    baseUrl: CONCEPT_REVIEW_PUBLIC_BASE_URL,
    selectedConceptIds: [...selectedIds].sort(),
    diagnosticConceptIds,
    reviewCodes,
    assetInventory: assets.map(asset => ({
      code: asset.code,
      path: asset.publicUrl,
      sha256: asset.sha256,
      sizeBytes: asset.sizeBytes
    })),
    concepts: runtimeConcepts,
    reviews: runtimeReviews,
    evidenceRoutes,
    bundleRoutes
  };

  return {
    errors: uniqueStrings(errors),
    warnings,
    diagnosticConceptIds,
    reviewCodes,
    assets,
    runtimeIndex,
    validation
  };
}

function resolveConceptModule(library, conceptId){
  const raw = library?.concepts?.[conceptId];
  if(!raw || !raw.derivedFromConceptId) return raw;

  const parent = library?.concepts?.[raw.derivedFromConceptId];
  if(!parent) return null;

  const filterId = raw.subtopicFilterId || conceptId;
  const belongs = question => Array.isArray(question?.subtopicIds) && question.subtopicIds.includes(filterId);
  const remap = question => {
    const copy = deepClone(question);
    copy.familyConceptId = raw.familyConceptId || raw.derivedFromConceptId;
    copy.sourcePrimaryConceptId = copy.sourcePrimaryConceptId || copy.primaryConceptId || raw.derivedFromConceptId;
    copy.primaryConceptId = conceptId;
    copy.tag = conceptId;
    copy.composerSubtopicId = conceptId;
    return copy;
  };

  const questions = {};
  for(const [pool, items] of Object.entries(parent.questions || {})){
    questions[pool] = (items || []).filter(belongs).map(remap);
  }
  const repairQuestions = (parent.repairQuestions || []).filter(belongs).map(remap);
  const repairSeedQuestions = (parent.repairSeedQuestions || []).filter(belongs).map(remap);
  const bridgeQuestions = (parent.bridgeQuestions || []).filter(belongs).map(remap);
  const selectedQuestions = [
    ...Object.values(questions).flat(),
    ...repairQuestions,
    ...repairSeedQuestions,
    ...bridgeQuestions
  ];
  const allowedIds = new Set(selectedQuestions.map(idOf));

  const filterRouteMap = source => {
    const out = {};
    for(const [key, refs] of Object.entries(source || {})){
      const filtered = (refs || []).filter(ref => allowedIds.has(typeof ref === 'string' ? ref : idOf(ref)));
      if(filtered.length) out[key] = deepClone(filtered);
    }
    return out;
  };

  const usedObjectives = new Set();
  for(const question of selectedQuestions){
    if(question?.objective) usedObjectives.add(String(question.objective));
    for(const outcome of question?.outcomeIds || []) usedObjectives.add(String(outcome));
  }
  const objectiveLabels = {};
  for(const [key, label] of Object.entries(parent.objectiveLabels || {})){
    if(usedObjectives.has(key)) objectiveLabels[key] = label;
  }
  objectiveLabels[conceptId] = raw.title || conceptId;

  const usedAssetNames = new Set(selectedQuestions
    .filter(question => question?.image)
    .map(question => String(question.image).split(/[\\/]/).pop()));
  const assetMetadata = (parent.assetMetadata || []).filter(asset => usedAssetNames.has(asset.filename));
  const assets = (parent.assets || []).filter(asset => usedAssetNames.has(String(asset).split(/[\\/]/).pop()));
  const assetPaths = (parent.assetPaths || []).filter(asset => usedAssetNames.has(String(asset).split(/[\\/]/).pop()));

  return {
    ...deepClone(parent),
    ...deepClone(raw),
    canonicalConceptId: conceptId,
    derivedFromConceptId: raw.derivedFromConceptId,
    familyConceptId: raw.familyConceptId || raw.derivedFromConceptId,
    assetConceptId: raw.assetConceptId || raw.derivedFromConceptId,
    questions,
    repairQuestions,
    repairSeedQuestions,
    bridgeQuestions,
    directSkillRepairRoutes: filterRouteMap(parent.directSkillRepairRoutes),
    skillRepairSeedPools: filterRouteMap(parent.skillRepairSeedPools),
    microSkillRepairPools: filterRouteMap(parent.microSkillRepairPools),
    microSkillBridgePools: filterRouteMap(parent.microSkillBridgePools),
    objectiveLabels,
    legacyObjectives: (parent.legacyObjectives || []).filter(value => usedObjectives.has(String(value))),
    assets,
    assetMetadata,
    assetPaths
  };
}

function routeMapInto(target, source, index, conceptId, assetConceptId = conceptId){
  for(const [key, ids] of Object.entries(source || {})){
    target[key] ??= [];
    for(const ref of ids || []){
      const id = typeof ref === 'string' ? ref : idOf(ref);
      const base = index.get(id);
      if(!base) continue;
      const question = cloneQuestion(base.question, base.conceptId || conceptId, base.assetConceptId || assetConceptId);
      if(!target[key].some(existing => idOf(existing) === idOf(question))) target[key].push(question);
    }
  }
}

function bossDifficulty(question){
  const raw = String(question?.canonicalDifficulty ?? question?.difficulty ?? '').toLowerCase();
  if(raw === 'easy' || raw === 'easyboss') return 'easy';
  if(raw === 'medium' || raw === 'mediumboss') return 'medium';
  if(raw === 'hard' || raw === 'finalboss' || raw === 'hardboss') return 'hard';
  return '';
}

function bossQuestionsForCheckpoint(module, checkpointKey){
  const expected = CHECKPOINTS[checkpointKey]?.difficulty;
  if(!expected) return [];
  return (module?.questions?.boss || []).filter(question => bossDifficulty(question) === expected);
}

const LEGACY_CONCEPT_SELECTION_MIGRATIONS = Object.freeze({
  'market-failures':Object.freeze([
    'externalities',
    'public-goods-and-common-resources',
    'market-power',
    'market-failures'
  ])
});

function migrateConceptSelectionIds(ids){
  return uniqueStrings(uniqueStrings(ids || []).flatMap(id => LEGACY_CONCEPT_SELECTION_MIGRATIONS[id] || [id]));
}

function migrateRecipe(recipe, library, themeLibrary){
  const source = recipe && typeof recipe === 'object' ? recipe : {};
  const sourceSelectedConceptIds = uniqueStrings(source.selectedConceptIds || source.concepts || []);
  const selectedConceptIds = migrateConceptSelectionIds(sourceSelectedConceptIds);
  const migrationWarnings = [];
  if(sourceSelectedConceptIds.some(id => LEGACY_CONCEPT_SELECTION_MIGRATIONS[id])){
    migrationWarnings.push({
      type:'concept-taxonomy-migration',
      message:'The legacy Market Failures selection was expanded into Externalities, Public Goods and Common Resources, and Market Power while retaining hidden compatibility support for its remaining general questions.'
    });
  }
  const customAssets = canonicalCustomAssets(source.customAssets, themeLibrary);
  const checkpointFocus = {
    checkpointOne: null,
    checkpointTwo: null,
    finalCheckpoint: null
  };

  if(source.checkpointFocus && typeof source.checkpointFocus === 'object'){
    for(const checkpointKey of CHECKPOINT_ORDER){
      const value = source.checkpointFocus[checkpointKey];
      checkpointFocus[checkpointKey] = value == null ? null : migrateConceptSelectionIds(Array.isArray(value) ? value : []);
    }
  } else if(source.stages && typeof source.stages === 'object'){
    migrationWarnings.push({
      type: 'recipe-migration',
      message: 'Legacy stage assignments were retired and replaced with automatic checkpoint mapping. Checkpoint questions now remain in their published easy, medium, or hard checkpoint pools.'
    });

    for(const checkpointKey of CHECKPOINT_ORDER){
      const checkpoint = CHECKPOINTS[checkpointKey];
      const assigned = migrateConceptSelectionIds(source.stages[checkpoint.legacyStage] || [])
        .filter(id => selectedConceptIds.includes(id));
      const mismatched = assigned.filter(id => {
        const module = library?.concepts?.[id];
        return !module || bossQuestionsForCheckpoint(module, checkpointKey).length === 0;
      });

      // Legacy stage placement was mandatory, so it is not treated as an intentional
      // custom focus. Old recipes reopen in automatic mode and can be narrowed later.
      checkpointFocus[checkpointKey] = null;

      if(mismatched.length){
        const names = mismatched.map(id => library?.concepts?.[id]?.title || id);
        migrationWarnings.push({
          type: 'legacy-boss-mismatch',
          checkpoint: checkpointKey,
          message: `${checkpoint.label}: ${mismatched.length} legacy assignment${mismatched.length === 1 ? '' : 's'} ${mismatched.length === 1 ? 'had' : 'had'} no ${checkpoint.difficulty} checkpoint questions and ${mismatched.length === 1 ? 'was' : 'were'} retired (${names.join(', ')}).`
        });
      }
    }
  }

  return {
    recipe: {
      schemaVersion: RECIPE_SCHEMA_VERSION,
      title: String(source.title || ''),
      slug: String(source.slug || ''),
      supportedModes: MODE_ORDER.filter(mode => (source.supportedModes || []).includes(mode)),
      selectedConceptIds,
      checkpointFocus,
      appearance: canonicalThemeSelection(source.appearance, themeLibrary, customAssets),
      customAssets: pruneCustomAssets(customAssets, source.appearance, themeLibrary)
    },
    migrationWarnings
  };
}

function validateRecipeShape(library, recipe){
  const errors = [];
  const source = recipe && typeof recipe === 'object' ? recipe : {};
  const rawSelected = Array.isArray(source.selectedConceptIds)
    ? source.selectedConceptIds.map(value => String(value || ''))
    : Array.isArray(source.concepts)
      ? source.concepts.map(value => String(value || ''))
      : [];
  const selected = uniqueStrings(rawSelected);

  if(!String(source.title || '').trim()) errors.push('Game title is required.');
  if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(String(source.slug || ''))){
    errors.push('Slug must use lowercase letters, numbers, and hyphens.');
  }
  if(!selected.length) errors.push('Select at least one concept.');
  if(rawSelected.filter(Boolean).length !== selected.length) errors.push('Selected concepts contain duplicate IDs.');

  const modes = (source.supportedModes || []).filter(mode => MODE_ORDER.includes(mode));
  if(!modes.length) errors.push('Select at least one supported mode.');

  for(const id of selected){
    if(!library?.concepts?.[id]) errors.push(`Unknown concept: ${id}`);
  }

  const selectedSet = new Set(selected);
  for(const id of selected){
    const module = library?.concepts?.[id];
    const parentId = module?.derivedFromConceptId;
    const parentStatus = library?.registry?.concepts?.find(entry => (entry.canonicalConceptId || entry.id) === parentId)?.status;
    if(parentId && selectedSet.has(parentId) && parentStatus !== 'legacy'){
      errors.push(`${id} cannot be selected together with its parent family ${parentId}. Choose the full family or granular subtopics, not both.`);
    }
  }

  if(source.checkpointFocus != null && typeof source.checkpointFocus !== 'object'){
    errors.push('checkpointFocus must be an object when provided.');
  }

  if(source.checkpointFocus && typeof source.checkpointFocus === 'object'){
    for(const checkpointKey of CHECKPOINT_ORDER){
      const value = source.checkpointFocus[checkpointKey];
      if(value == null) continue;
      if(!Array.isArray(value)){
        errors.push(`${checkpointKey} focus must be an array or null.`);
        continue;
      }
      const ids = value.map(item => String(item || '')).filter(Boolean);
      if(uniqueStrings(ids).length !== ids.length) errors.push(`${checkpointKey} focus contains duplicate concept IDs.`);
      for(const id of uniqueStrings(ids)){
        if(!selected.includes(id)) errors.push(`${id} is in ${checkpointKey} focus but is not selected.`);
      }
    }
  }

  return errors;
}

function compose(library, inputRecipe){
  const sourceErrors = validateRecipeShape(library, inputRecipe);
  const migrated = migrateRecipe(inputRecipe, library);
  const recipe = migrated.recipe;
  const errors = [...sourceErrors];
  const warnings = [...migrated.migrationWarnings];
  const selectedIds = [...recipe.selectedConceptIds];
  const modules = selectedIds.map(id => resolveConceptModule(library, id)).filter(Boolean);
  const supplementModules = modules.filter(module => module.supplementType === 'checkpoint-challenge');
  const instructionModules = modules.filter(module => module.supplementType !== 'checkpoint-challenge');
  const instructionIds = instructionModules.map(module => module.canonicalConceptId);
  const selectedInstructionSet = new Set(instructionIds);
  if(supplementModules.length && instructionModules.length === 0){
    errors.push('Advanced Macro Checkpoint Supplement requires at least one normal Macro concept. It adds harder checkpoint questions and is not a standalone question bank.');
  }

  const index = new Map();
  for(const module of modules){
    for(const question of allModuleQuestions(module)){
      index.set(idOf(question), {question, conceptId: module.canonicalConceptId, assetConceptId: module.assetConceptId || module.canonicalConceptId});
    }
  }

  const banks = {
    easy: [],
    medium: [],
    hard: [],
    elite: [],
    legendary: [],
    easyBoss: [],
    mediumBoss: [],
    finalBoss: [],
    legendaryBoss: []
  };
  const difficultyPool = {easy: 'easy', medium: 'medium', hard: 'hard', elite: 'elite', legendary: 'legendary'};

  for(const module of instructionModules){
    for(const pool of ['easy', 'medium', 'hard', 'elite', 'legendary']){
      for(const question of module.questions?.[pool] || []){
        banks[pool].push(cloneQuestion(question, module.canonicalConceptId, module.assetConceptId || module.canonicalConceptId));
      }
    }

    for(const pool of ['calculation', 'integration']){
      for(const question of module.questions?.[pool] || []){
        const target = difficultyPool[question.canonicalDifficulty]
          || difficultyPool[question.difficulty]
          || 'hard';
        banks[target].push(cloneQuestion(question, module.canonicalConceptId, module.assetConceptId || module.canonicalConceptId));
      }
    }

    for(const question of module.questions?.legendaryBoss || []){
      banks.legendaryBoss.push(cloneQuestion(question, module.canonicalConceptId, module.assetConceptId || module.canonicalConceptId));
    }
  }

  const challengeQuestionBanks = {easyBoss: [], mediumBoss: [], finalBoss: [], legendaryBoss: []};
  const challengeStagePool = {opening:'easyBoss', middle:'mediumBoss', final:'finalBoss', legendary:'legendaryBoss'};
  for(const module of supplementModules){
    const candidates = [
      ...(module.questions?.boss || []),
      ...(module.questions?.elite || []),
      ...(module.questions?.legendary || []),
      ...(module.questions?.integration || []),
      ...(module.questions?.legendaryBoss || [])
    ];
    for(const question of candidates){
      if(!question?.isCheckpointChallenge) continue;
      const required = Array.isArray(question.requiredConceptIds) ? question.requiredConceptIds : [];
      if(required.length && !required.every(id => selectedInstructionSet.has(id))) continue;
      const pool = challengeStagePool[question.challengeStage];
      if(!pool) continue;
      challengeQuestionBanks[pool].push(cloneQuestion(question, module.canonicalConceptId, module.assetConceptId || module.canonicalConceptId));
    }
  }
  for(const pool of Object.keys(challengeQuestionBanks)) challengeQuestionBanks[pool] = uniqueById(challengeQuestionBanks[pool]);
  const eligibleChallengeCount = Object.values(challengeQuestionBanks).reduce((n, list) => n + list.length, 0);
  if(supplementModules.length && instructionModules.length && eligibleChallengeCount === 0){
    warnings.push({
      type: 'supplement',
      conceptId: supplementModules[0].canonicalConceptId,
      message: 'Advanced Macro Checkpoint Supplement has no eligible challenges for the selected concept combination. Normal checkpoint questions will be used.'
    });
  }

  const bossCoverage = {};
  for(const checkpointKey of CHECKPOINT_ORDER){
    const checkpoint = CHECKPOINTS[checkpointKey];
    const eligibleConceptIds = instructionModules
      .filter(module => bossQuestionsForCheckpoint(module, checkpointKey).length > 0)
      .map(module => module.canonicalConceptId);
    const requestedFocus = recipe.checkpointFocus[checkpointKey];
    const automatic = requestedFocus == null;
    const activeConceptIds = automatic ? eligibleConceptIds : requestedFocus.filter(id => selectedIds.includes(id));
    const activeSet = new Set(activeConceptIds);

    for(const module of instructionModules){
      if(!activeSet.has(module.canonicalConceptId)) continue;
      for(const question of bossQuestionsForCheckpoint(module, checkpointKey)){
        banks[checkpoint.pool].push(cloneQuestion(question, module.canonicalConceptId, module.assetConceptId || module.canonicalConceptId));
      }
    }

    if(!automatic){
      for(const id of activeConceptIds){
        const module = resolveConceptModule(library, id);
        if(!module || bossQuestionsForCheckpoint(module, checkpointKey).length) continue;
        warnings.push({
          type: 'boss-focus',
          conceptId: id,
          checkpoint: checkpointKey,
          message: `${module.title || id} is in ${checkpoint.label} focus but has no ${checkpoint.difficulty} checkpoint questions.`
        });
      }
    }

    bossCoverage[checkpointKey] = {
      label: checkpoint.label,
      pool: checkpoint.pool,
      difficulty: checkpoint.difficulty,
      automatic,
      eligibleConceptIds,
      activeConceptIds,
      questionCount: 0
    };
  }

  for(const pool of Object.keys(banks)) banks[pool] = uniqueById(banks[pool]);
  for(const checkpointKey of CHECKPOINT_ORDER){
    bossCoverage[checkpointKey].questionCount = banks[CHECKPOINTS[checkpointKey].pool].length;
  }

  const allMain = Object.entries(banks).flatMap(([pool, questions]) => questions.map(question => ({pool, id: idOf(question)})));
  const mainSeen = new Map();
  for(const item of allMain){
    if(mainSeen.has(item.id)) errors.push(`Canonical ID ${item.id} appears in both ${mainSeen.get(item.id)} and ${item.pool}.`);
    else mainSeen.set(item.id, item.pool);
  }

  const objectiveLabels = {};
  const objectiveSources = {};
  for(const module of modules){
    for(const [key, label] of Object.entries(module.objectiveLabels || {})){
      if(key in objectiveLabels && objectiveLabels[key] !== label){
        errors.push(`Objective label conflict for ${key}: ${objectiveLabels[key]} versus ${label}.`);
      } else {
        objectiveLabels[key] = label;
        (objectiveSources[key] ??= []).push(module.canonicalConceptId);
      }
    }
  }

  const repairQuestions = uniqueById(instructionModules.flatMap(module =>
    (module.repairQuestions || []).map(question => cloneQuestion(question, module.canonicalConceptId, module.assetConceptId || module.canonicalConceptId))
  ));
  const bridgeQuestions = uniqueById(instructionModules.flatMap(module =>
    (module.bridgeQuestions || []).map(question => cloneQuestion(question, module.canonicalConceptId, module.assetConceptId || module.canonicalConceptId))
  ));
  const microSkillRepairPools = {};
  const skillRepairSeedPools = {};
  const microSkillBridgePools = {};

  for(const module of instructionModules) routeMapInto(microSkillRepairPools, module.directSkillRepairRoutes, index, module.canonicalConceptId, module.assetConceptId || module.canonicalConceptId);
  for(const module of instructionModules) routeMapInto(microSkillRepairPools, module.microSkillRepairPools, index, module.canonicalConceptId, module.assetConceptId || module.canonicalConceptId);
  for(const module of instructionModules) routeMapInto(skillRepairSeedPools, module.skillRepairSeedPools, index, module.canonicalConceptId, module.assetConceptId || module.canonicalConceptId);
  for(const module of instructionModules) routeMapInto(microSkillBridgePools, module.microSkillBridgePools, index, module.canonicalConceptId, module.assetConceptId || module.canonicalConceptId);

  const assetMap = new Map();
  for(const module of modules){
    for(const asset of module.assetMetadata || []){
      const key = asset?.runtimePath || asset?.sourceUrl || asset?.filename;
      if(key && !assetMap.has(key)) assetMap.set(key, deepClone(asset));
    }
  }
  const assets = [...assetMap.values()];

  const counts = Object.fromEntries(Object.entries(banks).map(([key, value]) => [key, value.length]));
  counts.repair = repairQuestions.length;
  counts.repairSeed = uniqueById(Object.values(skillRepairSeedPools).flat()).length;
  counts.bridge = bridgeQuestions.length;
  counts.calculation = instructionModules.reduce((total, module) => total + (module.questions?.calculation?.length || 0), 0);
  counts.integration = instructionModules.reduce((total, module) => total + (module.questions?.integration?.length || 0), 0);
  counts.challengeOpening = challengeQuestionBanks.easyBoss.length;
  counts.challengeMiddle = challengeQuestionBanks.mediumBoss.length;
  counts.challengeFinal = challengeQuestionBanks.finalBoss.length;
  counts.challengeLegendary = challengeQuestionBanks.legendaryBoss.length;
  counts.challengeTotal = Object.values(challengeQuestionBanks).reduce((n, list) => n + list.length, 0);
  counts.graph = [...Object.values(banks).flat(), ...Object.values(challengeQuestionBanks).flat()].filter(question => question.image).length;
  const trialGraphQuestions = uniqueById(['easy','medium','hard','elite','legendary']
    .flatMap(pool => (banks[pool] || []).filter(question => question?.graphRequired === true && Boolean(question?.image))));
  counts.graphSafe = trialGraphQuestions.length;
  counts.graphSafeByDifficulty = Object.fromEntries(['easy','medium','hard','elite','legendary'].map(pool => [
    pool,
    (banks[pool] || []).filter(question => question?.graphRequired === true && Boolean(question?.image)).length
  ]));
  const fadingFortuneQuestions = uniqueById(['easy','medium','hard','elite','legendary']
    .flatMap(pool => (banks[pool] || []).filter(question => Array.isArray(question?.options) && question.options.length === 4)));
  counts.fadingFortuneEligible = fadingFortuneQuestions.length;
  counts.fadingFortuneByDifficulty = Object.fromEntries(['easy','medium','hard','elite','legendary'].map(pool => [
    pool,
    (banks[pool] || []).filter(question => Array.isArray(question?.options) && question.options.length === 4).length
  ]));
  const riskRewardQuestions = uniqueById(['easy','medium','hard','elite','legendary']
    .flatMap(pool => banks[pool] || []));
  counts.riskRewardEligible = riskRewardQuestions.length;
  counts.riskRewardByDifficulty = Object.fromEntries(['easy','medium','hard','elite','legendary'].map(pool => [
    pool,
    (banks[pool] || []).length
  ]));
  counts.assets = assets.length;
  counts.totalCanonical = uniqueById([
    ...Object.values(banks).flat(),
    ...Object.values(challengeQuestionBanks).flat(),
    ...repairQuestions,
    ...uniqueById(Object.values(skillRepairSeedPools).flat()),
    ...bridgeQuestions
  ]).length;


  for(const module of instructionModules){
    if(!Object.keys(module.directSkillRepairRoutes || {}).length && !Object.keys(module.microSkillRepairPools || {}).length){
      warnings.push({
        type: 'repair',
        conceptId: module.canonicalConceptId,
        message: `${module.title} has no direct repair route.`
      });
    }
    if(!Object.keys(module.microSkillBridgePools || {}).length){
      warnings.push({
        type: 'bridge',
        conceptId: module.canonicalConceptId,
        message: `${module.title} has no direct bridge route.`
      });
    }
  }

  const validation = validateModes(counts, recipe.supportedModes || [], {
    banks,
    repairQuestions,
    bridgeQuestions,
    assets,
    trialGraphQuestions,
    fadingFortuneQuestions,
    riskRewardQuestions
  });
  for(const mode of validation.modes){
    if(!mode.ok){
      if(mode.deficiencies.length){
        errors.push(`${mode.label}: ${mode.deficiencies.map(deficiency =>
          `${deficiency.pool} needs ${deficiency.minimum}, found ${deficiency.count}`
        ).join('; ')}`);
      }
      for(const issue of mode.issues || []){
        errors.push(`${mode.label}: ${issue.pool} ${issue.id}: ${issue.issue}`);
      }
    }
  }

  return {
    recipe,
    errors,
    warnings,
    banks,
    challengeQuestionBanks,
    challengeSupplement: {
      enabled: supplementModules.length > 0,
      selectedSupplementIds: supplementModules.map(module => module.canonicalConceptId),
      eligibleChallengeCount,
      behavior: supplementModules[0]?.supplementBehavior || null
    },
    bossCoverage,
    objectiveLabels,
    objectiveSources,
    repairQuestions,
    bridgeQuestions,
    microSkillRepairPools,
    skillRepairSeedPools,
    microSkillBridgePools,
    assets: assets.sort((a, b) => a.runtimePath.localeCompare(b.runtimePath)),
    trialGraphQuestionIds: trialGraphQuestions.map(idOf),
    fadingFortuneQuestionIds: fadingFortuneQuestions.map(idOf),
    riskRewardQuestionIds: riskRewardQuestions.map(idOf),
    counts,
    validation,
    selectedModules: modules
  };
}

function validateModes(counts, modes, detail = {}){
  const labels = {
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
  return {
    modes: MODE_ORDER.filter(mode => modes.includes(mode)).map(mode => {
      const requirements = mode === 'trialGraph'
        ? [{pool:'graphSafe', minimum:10, count:counts.graphSafe || 0}]
        : mode === 'fadingFortune'
          ? [{pool:'fadingFortuneEligible', minimum:10, count:counts.fadingFortuneEligible || 0}]
          : mode === 'riskReward'
            ? [{pool:'riskRewardEligible', minimum:10, count:counts.riskRewardEligible || 0}]
            : MODE_REQUIREMENTS[mode].map(pool => ({
            pool,
            minimum: getModePoolMinimum(mode, pool),
            count: counts[pool] || 0
          }));
      const deficiencies = requirements.filter(requirement => requirement.count < requirement.minimum);
      const issues = [];
      const seenIds = new Map();
      for(const {pool} of requirements){
        const questions = pool === 'repair'
          ? detail.repairQuestions
          : pool === 'bridge'
            ? detail.bridgeQuestions
            : pool === 'graphSafe'
              ? detail.trialGraphQuestions
              : pool === 'fadingFortuneEligible'
                ? detail.fadingFortuneQuestions
                : pool === 'riskRewardEligible'
                  ? detail.riskRewardQuestions
                  : detail.banks?.[pool];
        if(!questions) continue;
        if(!Array.isArray(questions)){
          issues.push({pool, id: '—', issue: 'Pool is not an array'});
          continue;
        }
        questions.forEach((question, index) => {
          const validationPool = (pool === 'graphSafe' || pool === 'fadingFortuneEligible' || pool === 'riskRewardEligible')
            ? String(question?.canonicalDifficulty || question?.difficulty || 'hard').toLowerCase()
            : pool;
          const fields = validateFacultyQuestionRecord(question, validationPool, detail.assets);
          const id = question?.id ?? question?.questionId ?? `index ${index}`;
          if(fields.length) issues.push({pool, id, issue: `Invalid: ${fields.join(', ')}`});
          if(pool === 'fadingFortuneEligible'){
            if(!Array.isArray(question?.options) || question.options.length !== 4) issues.push({pool, id, issue: 'Fading Fortune requires exactly four answer choices'});
          }
          if(pool === 'graphSafe'){
            if(question?.graphRequired !== true) issues.push({pool, id, issue: 'Missing graphRequired eligibility flag'});
            if(!question?.image) issues.push({pool, id, issue: 'Missing required graph image'});
            const imageFilename = String(question?.image || '').split('/').pop();
            const asset = (detail.assets || []).find(candidate => [candidate?.runtimePath,candidate?.sourceUrl,candidate?.sourceAssetPath,candidate?.filename]
              .filter(Boolean).some(path => String(path).split('/').pop() === imageFilename));
            if(!asset?.imageAlt || !asset?.graphDescription) issues.push({pool, id, issue: 'Graph asset is missing accessibility metadata'});
          }
          const key = String(id);
          if(key && !key.startsWith('index ')){
            if(seenIds.has(key)) issues.push({pool, id: key, issue: `Duplicate ID also used in ${seenIds.get(key)}`});
            else seenIds.set(key, pool);
          }
        });
      }
      return {
        mode,
        label: labels[mode],
        requirements,
        deficiencies,
        issues,
        ok: deficiencies.length === 0 && issues.length === 0
      };
    })
  };
}

function configMarkerRegion(config){
  return `// =====================================================\n// FACULTY COMPOSITION CONFIG — GENERATED\n// This region is replaced by the Faculty Concept Composer.\n// =====================================================\nconst FACULTY_COMPOSITION_CONFIG = ${JSON.stringify(config, null, 4).replace(/<\/script/gi, '<\\/script')};\n// =====================================================\n// END FACULTY COMPOSITION CONFIG\n// =====================================================`;
}

function questionMarkerRegion(composition, metadata){
  const js = value => JSON.stringify(value, null, 2).replace(/<\/script/gi, '<\\/script');
  const questionAssetMetadata = {};
  for(const asset of composition.assets || []){
    if(!asset || typeof asset !== 'object') continue;
    const record = {
      imageAlt: asset.imageAlt || '',
      graphDescription: asset.graphDescription || ''
    };
    for(const candidate of [asset.runtimePath, asset.sourceUrl, asset.sourceAssetPath, asset.filename]){
      if(!candidate) continue;
      const normalized = String(candidate).replace(/^data\//, '');
      questionAssetMetadata[normalized] = record;
      questionAssetMetadata[normalized.split('/').pop()] = record;
    }
  }
  return `// =====================================================\n// FACULTY QUESTION BANKS — SAFE TO EDIT\n// Generated by the Faculty Concept Composer.\n// =====================================================\nconst questionBanks = ${js(composition.banks)};\nconst challengeQuestionBanks = ${js(composition.challengeQuestionBanks || {easyBoss:[],mediumBoss:[],finalBoss:[],legendaryBoss:[]})};\nconst objectiveLabels = ${js(composition.objectiveLabels)};\nconst embeddedQuestionAssets = ${js(composition.embeddedQuestionAssets || {})};\nconst questionAssetMetadata = ${js(questionAssetMetadata)};\nconst trialGraphQuestionIds = ${js(composition.trialGraphQuestionIds || [])};\nconst fadingFortuneQuestionIds = ${js(composition.fadingFortuneQuestionIds || [])};\nconst riskRewardQuestionIds = ${js(composition.riskRewardQuestionIds || [])};\nconst facultyCompositionMetadata = ${js(metadata)};\nconst facultyQuestionValidator = ${validateFacultyQuestionRecord.toString()};\nconst repairQuestions = ${js(composition.repairQuestions)};\nconst bridgeQuestions = ${js(composition.bridgeQuestions)};\nconst microSkillRepairPools = ${js(composition.microSkillRepairPools)};\nconst skillRepairSeedPools = ${js(composition.skillRepairSeedPools)};\nconst microSkillBridgePools = ${js(composition.microSkillBridgePools)};\n// =====================================================\n// END FACULTY QUESTION BANKS\n// PROTECTED ENGINE BELOW\n// =====================================================`;
}

function replaceMarkedRegion(template, startLabel, endLabel, replacement){
  const startCore = template.indexOf(startLabel);
  if(startCore < 0) throw new Error(`Missing marker: ${startLabel}`);
  const start = template.lastIndexOf('// =====================================================', startCore);
  const endCore = template.indexOf(endLabel, startCore);
  if(endCore < 0) throw new Error(`Missing marker: ${endLabel}`);
  const end = template.indexOf('// =====================================================', endCore) + '// ====================================================='.length;
  return template.slice(0, start) + replacement + template.slice(end);
}

function conceptReviewRuntimeRegion(composition){
  const runtimeManifest = composition.conceptReviewRuntimeIndex || null;
  if(!runtimeManifest) throw new Error('Concept Review runtime manifest is missing from the composition.');
  const embeddedManifest = stableStringify(runtimeManifest, 2).replace(/<\/script/gi, '<\\/script');
  const runtimeSource = String(composition.conceptReviewRuntimeSource || '').replace(/<\/script/gi, '<\\/script');
  return `// =====================================================\n// CONCEPT REVIEW ROUTING — GENERATED\n// Routing data is embedded so locally opened games do not fetch a sibling manifest.\n// Review PDFs are served from ${CONCEPT_REVIEW_PUBLIC_BASE_URL}\n// =====================================================\nglobalThis.MQ_CONCEPT_REVIEW_MANIFEST = ${embeddedManifest};\n${runtimeSource}`;
}

function buildHtml(template, composition, config, metadata){
  let output = replaceMarkedRegion(
    template,
    '// FACULTY COMPOSITION CONFIG — GENERATED',
    '// END FACULTY COMPOSITION CONFIG',
    configMarkerRegion(config)
  );
  output = replaceMarkedRegion(
    output,
    '// FACULTY QUESTION BANKS — SAFE TO EDIT',
    '// END FACULTY QUESTION BANKS',
    `${conceptReviewRuntimeRegion(composition)}\n${questionMarkerRegion(composition, metadata)}`
  );
  return output;
}

function canonicalRecipe(inputRecipe, library, themeLibrary){
  const migrated = migrateRecipe(inputRecipe, library, themeLibrary).recipe;
  const customAssets = pruneCustomAssets(migrated.customAssets, migrated.appearance, themeLibrary);
  return {
    schemaVersion: RECIPE_SCHEMA_VERSION,
    title: String(migrated.title).trim(),
    slug: safeSlug(migrated.slug),
    supportedModes: MODE_ORDER.filter(mode => migrated.supportedModes.includes(mode)),
    selectedConceptIds: [...migrated.selectedConceptIds],
    checkpointFocus: Object.fromEntries(CHECKPOINT_ORDER.map(checkpointKey => [
      checkpointKey,
      migrated.checkpointFocus[checkpointKey] == null
        ? null
        : [...migrated.checkpointFocus[checkpointKey]]
    ])),
    appearance: canonicalThemeSelection(migrated.appearance, themeLibrary, customAssets),
    customAssets,
    libraryVersion: library.libraryVersion,
    templateVersion: 'phase4.5s.3e-market-gate-graph-sync-visual-ux-polish-phase3b-custom-assets-phase3a-official-themes-phase1.5-hardening'
  };
}

async function createConfig(recipe, library, templateSha, themeLibrary){
  const canonical = canonicalRecipe(recipe, library, themeLibrary);
  const fingerprint = await sha256Hex(stableStringify(canonical));
  const resolvedTheme = resolveThemeSelection(canonical.appearance, themeLibrary, canonical.customAssets);
  const {customAssets:authoringCustomAssets, ...runtimeCanonical} = canonical;
  return {
    ...runtimeCanonical,
    composerVersion: COMPOSER_VERSION,
    compositionId: canonical.slug,
    fadingFortune: {
      enabled: canonical.supportedModes.includes('fadingFortune'),
      allowedTargets: [10, 15, 20],
      intervals: {easy:8000, medium:10000, hard:12000, elite:15000, legendary:18000}
    },
    riskReward: {
      enabled: canonical.supportedModes.includes('riskReward'),
      startingBankroll: 1000,
      wagerOptions: [
        {label:'10%', ratio:0.10},
        {label:'25%', ratio:0.25},
        {label:'50%', ratio:0.50},
        {label:'ALL IN', ratio:1.00}
      ],
      allowedTargets: [10, 15, 20]
    },
    limitedRunSampling: {
      quiz: {strategy:'balanced'},
      trialGraph: {strategy:'adaptive'},
      fadingFortune: {strategy:'adaptive'},
      riskReward: {strategy:'adaptive'}
    },
    visualTheme: createRuntimeThemeConfig(resolvedTheme, {}, canonical.supportedModes),
    saveKeyNamespace: `mq-econ:${canonical.slug}:${fingerprint.slice(0, 12)}`,
    librarySha256: library.librarySha256,
    templateSha256: templateSha,
    compositionFingerprint: fingerprint
  };
}

async function verifyAnswers(composition){
  const questions = uniqueById([
    ...Object.values(composition.banks).flat(),
    ...Object.values(composition.challengeQuestionBanks || {}).flat(),
    ...composition.repairQuestions,
    ...Object.values(composition.skillRepairSeedPools).flat(),
    ...composition.bridgeQuestions
  ]);
  const cache = new Map();
  const issues = [];

  for(const question of questions){
    if(Number.isInteger(question.a) && question.a >= 0 && question.a < 4) continue;
    const expected = String(question.aHash || '').replace(/^sha256:/i, '').toLowerCase();
    if(!/^[a-f0-9]{64}$/.test(expected)){
      issues.push({id: idOf(question), issue: 'Invalid answer representation'});
      continue;
    }
    let matches = 0;
    for(const option of question.options || []){
      const normalized = normalizeAnswerText(option);
      if(!cache.has(normalized)) cache.set(normalized, await sha256Hex(normalized));
      if(cache.get(normalized) === expected) matches++;
    }
    if(matches !== 1) issues.push({id: idOf(question), issue: `Published answer hash matched ${matches} options`});
  }

  return {ok: issues.length === 0, questionCount: questions.length, issues};
}

return {
  COMPOSER_VERSION,
  RECIPE_SCHEMA_VERSION,
  CUSTOM_ASSET_POLICY,
  MODE_ORDER,
  POOL_MINIMUMS,
  MODE_REQUIREMENTS,
  CHECKPOINT_ORDER,
  CHECKPOINTS,
  CONCEPT_REVIEW_RUNTIME_SCHEMA_VERSION,
  CONCEPT_REVIEW_PUBLIC_BASE_URL,
  stableStringify,
  normalizeAnswerText,
  sha256Hex,
  sha256BytesHex,
  loadEmbeddedThemeAssets,
  safeSlug,
  bossDifficulty,
  bossQuestionsForCheckpoint,
  canonicalThemeSelection,
  canonicalCustomAssets,
  resolveThemeSelection,
  themeAssetsForSelection,
  customAssetsForSelection,
  pruneCustomAssets,
  createRuntimeThemeConfig,
  resolveConceptModule,
  validateConceptReviewManifest,
  resolveConceptReviews,
  migrateRecipe,
  validateRecipeShape,
  validateFacultyQuestionRecord,
  compose,
  validateModes,
  buildHtml,
  canonicalRecipe,
  createConfig,
  verifyAnswers,
  uniqueById,
  idOf
};
});
