(function(root, factory){
  const api = factory();
  if(typeof module === 'object' && module.exports) module.exports = api;
  else root.MQComposerCore = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function(){
'use strict';

const COMPOSER_VERSION = '4.4a.0';
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

function safeSlug(value){
  return String(value || '')
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 80);
}

function cloneQuestion(question, conceptId){
  const copy = deepClone(question);
  if(copy.image){
    const filename = String(copy.image).split(/[\\/]/).pop();
    copy.image = `question-assets/${conceptId}/${filename}`;
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

function routeMapInto(target, source, index, conceptId){
  for(const [key, ids] of Object.entries(source || {})){
    target[key] ??= [];
    for(const ref of ids || []){
      const id = typeof ref === 'string' ? ref : idOf(ref);
      const base = index.get(id);
      if(!base) continue;
      const question = cloneQuestion(base.question, base.conceptId || conceptId);
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
      message: 'Legacy stage assignments were retired and replaced with automatic checkpoint boss mapping. Boss questions now remain in their published easy, medium, or hard checkpoint pools.'
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
          message: `${checkpoint.label}: ${mismatched.length} legacy assignment${mismatched.length === 1 ? '' : 's'} ${mismatched.length === 1 ? 'had' : 'had'} no ${checkpoint.difficulty} boss questions and ${mismatched.length === 1 ? 'was' : 'were'} retired (${names.join(', ')}).`
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
  const modules = selectedIds.map(id => library.concepts[id]).filter(Boolean);

  const index = new Map();
  for(const module of modules){
    for(const question of allModuleQuestions(module)){
      index.set(idOf(question), {question, conceptId: module.canonicalConceptId});
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

  for(const module of modules){
    for(const pool of ['easy', 'medium', 'hard', 'elite', 'legendary']){
      for(const question of module.questions?.[pool] || []){
        banks[pool].push(cloneQuestion(question, module.canonicalConceptId));
      }
    }

    for(const pool of ['calculation', 'integration']){
      for(const question of module.questions?.[pool] || []){
        const target = difficultyPool[question.canonicalDifficulty]
          || difficultyPool[question.difficulty]
          || 'hard';
        banks[target].push(cloneQuestion(question, module.canonicalConceptId));
      }
    }

    for(const question of module.questions?.legendaryBoss || []){
      banks.legendaryBoss.push(cloneQuestion(question, module.canonicalConceptId));
    }
  }

  const bossCoverage = {};
  for(const checkpointKey of CHECKPOINT_ORDER){
    const checkpoint = CHECKPOINTS[checkpointKey];
    const eligibleConceptIds = modules
      .filter(module => bossQuestionsForCheckpoint(module, checkpointKey).length > 0)
      .map(module => module.canonicalConceptId);
    const requestedFocus = recipe.checkpointFocus[checkpointKey];
    const automatic = requestedFocus == null;
    const activeConceptIds = automatic ? eligibleConceptIds : requestedFocus.filter(id => selectedIds.includes(id));
    const activeSet = new Set(activeConceptIds);

    for(const module of modules){
      if(!activeSet.has(module.canonicalConceptId)) continue;
      for(const question of bossQuestionsForCheckpoint(module, checkpointKey)){
        banks[checkpoint.pool].push(cloneQuestion(question, module.canonicalConceptId));
      }
    }

    if(!automatic){
      for(const id of activeConceptIds){
        const module = library.concepts[id];
        if(!module || bossQuestionsForCheckpoint(module, checkpointKey).length) continue;
        warnings.push({
          type: 'boss-focus',
          conceptId: id,
          checkpoint: checkpointKey,
          message: `${module.title || id} is in ${checkpoint.label} focus but has no ${checkpoint.difficulty} boss questions.`
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

  const repairQuestions = uniqueById(modules.flatMap(module =>
    (module.repairQuestions || []).map(question => cloneQuestion(question, module.canonicalConceptId))
  ));
  const bridgeQuestions = uniqueById(modules.flatMap(module =>
    (module.bridgeQuestions || []).map(question => cloneQuestion(question, module.canonicalConceptId))
  ));
  const microSkillRepairPools = {};
  const skillRepairSeedPools = {};
  const microSkillBridgePools = {};

  for(const module of modules) routeMapInto(microSkillRepairPools, module.directSkillRepairRoutes, index, module.canonicalConceptId);
  for(const module of modules) routeMapInto(microSkillRepairPools, module.microSkillRepairPools, index, module.canonicalConceptId);
  for(const module of modules) routeMapInto(skillRepairSeedPools, module.skillRepairSeedPools, index, module.canonicalConceptId);
  for(const module of modules) routeMapInto(microSkillBridgePools, module.microSkillBridgePools, index, module.canonicalConceptId);

  const assets = [];
  for(const module of modules){
    for(const asset of module.assetMetadata || []) assets.push(deepClone(asset));
  }

  const counts = Object.fromEntries(Object.entries(banks).map(([key, value]) => [key, value.length]));
  counts.repair = repairQuestions.length;
  counts.repairSeed = uniqueById(Object.values(skillRepairSeedPools).flat()).length;
  counts.bridge = bridgeQuestions.length;
  counts.calculation = modules.reduce((total, module) => total + (module.questions?.calculation?.length || 0), 0);
  counts.integration = modules.reduce((total, module) => total + (module.questions?.integration?.length || 0), 0);
  counts.graph = Object.values(banks).flat().filter(question => question.image).length;
  counts.assets = assets.length;
  counts.totalCanonical = uniqueById([
    ...Object.values(banks).flat(),
    ...repairQuestions,
    ...uniqueById(Object.values(skillRepairSeedPools).flat()),
    ...bridgeQuestions
  ]).length;

  for(const id of selectedIds){
    const meta = library.registry.concepts.find(concept => concept.canonicalConceptId === id);
    for(const prereq of meta?.prerequisiteConceptIds || []){
      if(!selectedIds.includes(prereq)){
        warnings.push({
          type: 'prerequisite',
          conceptId: id,
          message: `${meta.title} lists ${prereq} as a prerequisite.`
        });
      }
    }
  }

  for(const module of modules){
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

  const validation = validateModes(counts, recipe.supportedModes || []);
  for(const mode of validation.modes){
    if(!mode.ok){
      errors.push(`${mode.label}: ${mode.deficiencies.map(deficiency =>
        `${deficiency.pool} needs ${deficiency.minimum}, found ${deficiency.count}`
      ).join('; ')}`);
    }
  }

  return {
    recipe,
    errors,
    warnings,
    banks,
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

function validateModes(counts, modes){
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
      return {
        mode,
        label: labels[mode],
        requirements,
        deficiencies,
        ok: deficiencies.length === 0
      };
    })
  };
}

function configMarkerRegion(config){
  return `// =====================================================\n// FACULTY COMPOSITION CONFIG — GENERATED\n// This region is replaced by the Faculty Concept Composer.\n// =====================================================\nconst FACULTY_COMPOSITION_CONFIG = ${JSON.stringify(config, null, 4).replace(/<\/script/gi, '<\\/script')};\n// =====================================================\n// END FACULTY COMPOSITION CONFIG\n// =====================================================`;
}

function questionMarkerRegion(composition, metadata){
  const js = value => JSON.stringify(value, null, 2).replace(/<\/script/gi, '<\\/script');
  return `// =====================================================\n// FACULTY QUESTION BANKS — SAFE TO EDIT\n// Generated by the Phase 4.4a Faculty Concept Composer.\n// =====================================================\nconst questionBanks = ${js(composition.banks)};\nconst objectiveLabels = ${js(composition.objectiveLabels)};\nconst facultyCompositionMetadata = ${js(metadata)};\nconst repairQuestions = ${js(composition.repairQuestions)};\nconst bridgeQuestions = ${js(composition.bridgeQuestions)};\nconst microSkillRepairPools = ${js(composition.microSkillRepairPools)};\nconst skillRepairSeedPools = ${js(composition.skillRepairSeedPools)};\nconst microSkillBridgePools = ${js(composition.microSkillBridgePools)};\n// =====================================================\n// END FACULTY QUESTION BANKS\n// PROTECTED ENGINE BELOW\n// =====================================================`;
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
    templateVersion: 'phase4.4-composer-ready'
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
  migrateRecipe,
  validateRecipeShape,
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
