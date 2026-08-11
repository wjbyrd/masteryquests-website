(function(root, factory){
  const api = factory();
  if(typeof module === 'object' && module.exports) module.exports = api;
  else root.MQComposerCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function(){
'use strict';

const COMPOSER_VERSION = '4.5m.0';
const RECIPE_SCHEMA_VERSION = '1.2.0';
const MODE_ORDER = ['standard', 'timed', 'exam', 'legendary', 'score'];
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
  legendary: ['legendary', 'legendaryBoss'],
  score: ['easy', 'medium', 'hard', 'easyBoss', 'mediumBoss', 'finalBoss', 'repair', 'bridge']
};
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

function migrateRecipe(recipe, library){
  const source = recipe && typeof recipe === 'object' ? recipe : {};
  const selectedConceptIds = uniqueStrings(source.selectedConceptIds || source.concepts || []);
  const migrationWarnings = [];
  const checkpointFocus = {
    checkpointOne: null,
    checkpointTwo: null,
    finalCheckpoint: null
  };

  if(source.checkpointFocus && typeof source.checkpointFocus === 'object'){
    for(const checkpointKey of CHECKPOINT_ORDER){
      const value = source.checkpointFocus[checkpointKey];
      checkpointFocus[checkpointKey] = value == null ? null : uniqueStrings(Array.isArray(value) ? value : []);
    }
  } else if(source.stages && typeof source.stages === 'object'){
    migrationWarnings.push({
      type: 'recipe-migration',
      message: 'Legacy stage assignments were retired and replaced with automatic checkpoint mapping. Checkpoint questions now remain in their published easy, medium, or hard checkpoint pools.'
    });

    for(const checkpointKey of CHECKPOINT_ORDER){
      const checkpoint = CHECKPOINTS[checkpointKey];
      const assigned = uniqueStrings(source.stages[checkpoint.legacyStage] || [])
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
      checkpointFocus
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
    if(parentId && selectedSet.has(parentId)){
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
    assets
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
    legendary: 'Legendary Mode',
    score: 'Score Attack'
  };
  return {
    modes: MODE_ORDER.filter(mode => modes.includes(mode)).map(mode => {
      const requirements = MODE_REQUIREMENTS[mode].map(pool => ({
        pool,
        minimum: POOL_MINIMUMS[pool],
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
            : detail.banks?.[pool];
        if(!questions) continue;
        if(!Array.isArray(questions)){
          issues.push({pool, id: '—', issue: 'Pool is not an array'});
          continue;
        }
        questions.forEach((question, index) => {
          const fields = validateFacultyQuestionRecord(question, pool, detail.assets);
          const id = question?.id ?? question?.questionId ?? `index ${index}`;
          if(fields.length) issues.push({pool, id, issue: `Invalid: ${fields.join(', ')}`});
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
  return `// =====================================================\n// FACULTY QUESTION BANKS — SAFE TO EDIT\n// Generated by the Faculty Concept Composer.\n// =====================================================\nconst questionBanks = ${js(composition.banks)};\nconst challengeQuestionBanks = ${js(composition.challengeQuestionBanks || {easyBoss:[],mediumBoss:[],finalBoss:[],legendaryBoss:[]})};\nconst objectiveLabels = ${js(composition.objectiveLabels)};\nconst embeddedQuestionAssets = ${js(composition.embeddedQuestionAssets || {})};\nconst questionAssetMetadata = ${js(questionAssetMetadata)};\nconst facultyCompositionMetadata = ${js(metadata)};\nconst facultyQuestionValidator = ${validateFacultyQuestionRecord.toString()};\nconst repairQuestions = ${js(composition.repairQuestions)};\nconst bridgeQuestions = ${js(composition.bridgeQuestions)};\nconst microSkillRepairPools = ${js(composition.microSkillRepairPools)};\nconst skillRepairSeedPools = ${js(composition.skillRepairSeedPools)};\nconst microSkillBridgePools = ${js(composition.microSkillBridgePools)};\n// =====================================================\n// END FACULTY QUESTION BANKS\n// PROTECTED ENGINE BELOW\n// =====================================================`;
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
    questionMarkerRegion(composition, metadata)
  );
  return output;
}

function canonicalRecipe(inputRecipe, library){
  const migrated = migrateRecipe(inputRecipe, library).recipe;
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
    libraryVersion: library.libraryVersion,
    templateVersion: 'phase4.5h-micro-granularity'
  };
}

async function createConfig(recipe, library, templateSha){
  const canonical = canonicalRecipe(recipe, library);
  const fingerprint = await sha256Hex(stableStringify(canonical));
  return {
    ...canonical,
    composerVersion: COMPOSER_VERSION,
    compositionId: canonical.slug,
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
  MODE_ORDER,
  POOL_MINIMUMS,
  MODE_REQUIREMENTS,
  CHECKPOINT_ORDER,
  CHECKPOINTS,
  stableStringify,
  normalizeAnswerText,
  sha256Hex,
  safeSlug,
  bossDifficulty,
  bossQuestionsForCheckpoint,
  resolveConceptModule,
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
