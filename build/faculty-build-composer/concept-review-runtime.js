(function(root, factory){
  const api = factory();
  if(typeof module === 'object' && module.exports) module.exports = api;
  if(root) root.MQConceptReviewRuntime = api;
})(typeof globalThis !== 'undefined' ? globalThis : this, function(){
  'use strict';

  const DEFAULT_MANIFEST_URL = 'concept-reviews/manifest.json';
  const PUBLIC_REVIEW_BASE_URL = 'https://masteryquests.org/concept-reviews/';
  const SAFE_RELATIVE_REVIEW_PATH = /^concept-reviews\/(?:GEN-ECON|MICRO|MACRO)-\d{2}\.pdf$/;
  const SAFE_PUBLIC_REVIEW_PATH = /^\/concept-reviews\/(?:GEN-ECON|MICRO|MACRO)-\d{2}\.pdf$/;
  let manifestPromise = null;

  function strings(value){
    return Array.isArray(value)
      ? [...new Set(value.map(item => String(item || '').trim()).filter(Boolean))]
      : [];
  }

  function safeReviewPath(path){
    const value = String(path || '').trim();
    if(!value || value.includes('..') || value.includes('\\')) return null;
    if(SAFE_RELATIVE_REVIEW_PATH.test(value)) return value;
    try{
      const url = new URL(value);
      if(url.protocol !== 'https:') return null;
      if(url.hostname !== 'masteryquests.org') return null;
      if(url.port || url.username || url.password || url.search || url.hash) return null;
      if(!SAFE_PUBLIC_REVIEW_PATH.test(url.pathname)) return null;
      return `${PUBLIC_REVIEW_BASE_URL}${url.pathname.split('/').pop()}`;
    }catch(error){
      return null;
    }
  }

  function getEmbeddedManifest(){
    const embedded = typeof globalThis !== 'undefined'
      ? globalThis.MQ_CONCEPT_REVIEW_MANIFEST
      : null;
    if(!embedded || typeof embedded !== 'object') return null;
    const validation = validateManifest(embedded);
    return validation.ok ? embedded : null;
  }

  function validateManifest(manifest){
    const errors = [];
    if(!manifest || typeof manifest !== 'object') return {ok:false, errors:['Manifest is not an object.']};
    if(!Array.isArray(manifest.assetInventory)) errors.push('assetInventory must be an array.');
    if(!manifest.concepts || typeof manifest.concepts !== 'object' || Array.isArray(manifest.concepts)) errors.push('concepts must be an object.');
    if(!manifest.reviews || typeof manifest.reviews !== 'object' || Array.isArray(manifest.reviews)) errors.push('reviews must be an object.');

    const inventory = new Set();
    for(const asset of manifest.assetInventory || []){
      const path = safeReviewPath(asset?.path);
      if(!path) errors.push(`Unsafe Concept Review asset path: ${String(asset?.path || '(missing)')}`);
      else if(inventory.has(path)) errors.push(`Duplicate Concept Review asset path: ${path}`);
      else inventory.add(path);
    }
    for(const [conceptId, record] of Object.entries(manifest.reviews || {})){
      if(!conceptId) errors.push('A review mapping has an empty canonical concept ID.');
      for(const asset of record?.assets || []){
        const path = safeReviewPath(asset?.path);
        if(!path) errors.push(`Unsafe review path for ${conceptId}.`);
        else if(!inventory.has(path)) errors.push(`Review path for ${conceptId} is absent from assetInventory: ${path}`);
      }
    }
    return {ok:errors.length === 0, errors};
  }

  function resetManifestCache(){
    manifestPromise = null;
  }

  function loadConceptReviewManifest(options = {}){
    if(manifestPromise) return manifestPromise;
    const embedded = options.manifest || getEmbeddedManifest();
    if(embedded){
      manifestPromise = Promise.resolve(embedded);
      return manifestPromise;
    }
    const fetchImpl = options.fetchImpl || (typeof fetch === 'function' ? fetch.bind(globalThis) : null);
    const url = options.url || DEFAULT_MANIFEST_URL;
    const logger = options.consoleImpl || (typeof console !== 'undefined' ? console : null);
    manifestPromise = (async () => {
      if(!fetchImpl) return null;
      try{
        const response = await fetchImpl(url, {cache:'no-store'});
        if(!response || !response.ok) throw new Error(`HTTP ${response?.status || 'error'}`);
        const manifest = await response.json();
        const validation = validateManifest(manifest);
        if(!validation.ok) throw new Error(validation.errors.join(' '));
        return manifest;
      }catch(error){
        logger?.warn?.(`Concept Reviews unavailable: ${error?.message || error}`);
        return null;
      }
    })();
    return manifestPromise;
  }

  function normalizeEvidence(input){
    if(Array.isArray(input)) return input;
    if(!input || typeof input !== 'object') return [];
    return Object.entries(input).map(([id, value]) => ({
      id,
      attempts:Number(value?.attempts || 0),
      correct:Number(value?.correct || 0),
      incorrect:Number(value?.incorrect ?? Math.max(0, Number(value?.attempts || 0) - Number(value?.correct || 0)))
    }));
  }

  function weakWeight(item){
    const attempts = Math.max(1, Number(item?.attempts || 1));
    const incorrect = Number(item?.incorrect ?? (item?.correct === false ? 1 : Math.max(0, attempts - Number(item?.correct || 0))));
    return Math.max(1, incorrect) + Math.min(2, attempts / 3);
  }

  function routeMap(manifest, key){
    const value = manifest?.evidenceRoutes?.[key];
    return value && typeof value === 'object' ? value : {};
  }

  function scoreConcept(scores, conceptId, weight){
    if(!conceptId) return;
    scores.set(conceptId, (scores.get(conceptId) || 0) + weight);
  }

  function scoreIds(scores, ids, weight, allowed){
    for(const id of strings(ids)) if(!allowed || allowed.has(id)) scoreConcept(scores, id, weight);
  }

  function evidenceScores(manifest, allowedConceptIds, attemptEvidence, objectiveEvidence, skillEvidence){
    const allowed = new Set(allowedConceptIds || []);
    const scores = new Map();
    const maps = {
      question:routeMap(manifest, 'questionToConceptIds'),
      repair:routeMap(manifest, 'repairSkillToConceptIds'),
      primary:routeMap(manifest, 'primarySkillToConceptIds'),
      secondary:routeMap(manifest, 'secondarySkillToConceptIds'),
      objective:routeMap(manifest, 'objectiveToConceptIds')
    };
    for(const attempt of attemptEvidence || []){
      const weight = weakWeight(attempt);
      const direct = [attempt?.canonicalConceptId, attempt?.primaryConceptId].filter(Boolean);
      scoreIds(scores, direct, weight * 5, allowed);
      scoreIds(scores, attempt?.subtopicIds, weight * 4, allowed);
      scoreIds(scores, maps.repair[String(attempt?.repairSkill || '')], weight * 3, allowed);
      scoreIds(scores, maps.primary[String(attempt?.primarySkill || '')], weight * 2.5, allowed);
      for(const skill of strings(attempt?.secondarySkills || attempt?.secondarySkillIds)){
        scoreIds(scores, maps.secondary[skill], weight * 1.5, allowed);
      }
      scoreIds(scores, maps.objective[String(attempt?.objective || '')], weight, allowed);
      scoreIds(scores, maps.question[String(attempt?.questionId || '')], weight * 2, allowed);
    }
    for(const item of normalizeEvidence(skillEvidence)){
      const id = String(item?.id || item?.skill || item?.key || '');
      const weight = weakWeight(item);
      scoreIds(scores, maps.repair[id], weight * 3, allowed);
      scoreIds(scores, maps.primary[id], weight * 2.5, allowed);
      scoreIds(scores, maps.secondary[id], weight * 1.5, allowed);
    }
    for(const item of normalizeEvidence(objectiveEvidence)){
      const id = String(item?.id || item?.objective || item?.key || '');
      scoreIds(scores, maps.objective[id], weakWeight(item), allowed);
    }
    return scores;
  }

  function reviewAssets(manifest, conceptId){
    const record = manifest?.reviews?.[conceptId];
    if(!record) return [];
    return (record.assets || []).map(asset => ({
      code:String(asset.code || ''),
      title:String(asset.title || manifest?.concepts?.[conceptId]?.title || 'Concept Review'),
      path:safeReviewPath(asset.path),
      conceptId
    })).filter(asset => asset.code && asset.path);
  }

  function rankReviews(manifest, conceptIds, scores){
    const byCode = new Map();
    conceptIds.forEach((conceptId, order) => {
      for(const asset of reviewAssets(manifest, conceptId)){
        const record = byCode.get(asset.code) || {...asset, score:0, order};
        record.score += scores.get(conceptId) || 0;
        record.order = Math.min(record.order, order);
        byCode.set(asset.code, record);
      }
    });
    return [...byCode.values()].sort((a,b) => b.score - a.score || a.order - b.order || a.code.localeCompare(b.code));
  }

  function reasonFor(manifest, conceptId, asset){
    return manifest?.bundleRoutes?.[conceptId]?.reasonByReviewCode?.[asset.code]
      || `Review ${manifest?.concepts?.[conceptId]?.title || asset.title}.`;
  }

  function resolveBundle(manifest, conceptId, options){
    const assets = reviewAssets(manifest, conceptId);
    if(assets.length <= 1) return {kind:'DIRECT', recommendations:assets.map(asset => ({...asset, reason:reasonFor(manifest, conceptId, asset)}))};
    const route = manifest?.bundleRoutes?.[conceptId] || {};
    const scores = new Map(assets.map(asset => [asset.code, 0]));
    const add = (signal, weight) => {
      const code = route.skillToReviewCode?.[signal] || route.objectiveToReviewCode?.[signal];
      if(scores.has(code)) scores.set(code, scores.get(code) + weight);
    };
    for(const attempt of options.attemptEvidence || []){
      const weight = weakWeight(attempt);
      add(String(attempt?.repairSkill || ''), weight * 3);
      add(String(attempt?.primarySkill || ''), weight * 2.5);
      strings(attempt?.secondarySkills || attempt?.secondarySkillIds).forEach(skill => add(skill, weight));
      add(String(attempt?.objective || ''), weight);
    }
    for(const item of normalizeEvidence(options.skillEvidence)) add(String(item?.id || item?.skill || item?.key || ''), weakWeight(item) * 2);
    for(const item of normalizeEvidence(options.objectiveEvidence)) add(String(item?.id || item?.objective || item?.key || ''), weakWeight(item));
    const ranked = assets.map((asset, order) => ({...asset, score:scores.get(asset.code) || 0, order})).sort((a,b) => b.score-a.score || a.order-b.order);
    const positive = ranked.filter(item => item.score > 0);
    const selected = positive.length ? positive.slice(0, positive.length > 1 ? 2 : 1) : ranked.slice(0, 1);
    const selectedCodes = new Set(selected.map(item => item.code));
    return {
      kind:'BUNDLE',
      recommendations:selected.map(asset => ({...asset, reason:reasonFor(manifest, conceptId, asset)})),
      more:ranked.filter(asset => !selectedCodes.has(asset.code)).map(asset => ({...asset, reason:reasonFor(manifest, conceptId, asset)}))
    };
  }

  function resolveMasteryConceptReviews(options = {}){
    const manifest = options.manifest;
    if(!manifest || !options.hasMeaningfulWeakness) return {kind:'NONE', recommendations:[]};
    const canonicalConceptId = String(options.canonicalConceptId || '');
    const concept = manifest.concepts?.[canonicalConceptId];
    if(!concept || concept.disposition === 'HIDDEN_SUPPLEMENTAL') return {kind:'NONE', recommendations:[]};
    if(concept.disposition === 'REVIEW_SHEET') return resolveBundle(manifest, canonicalConceptId, options);
    if(concept.disposition === 'COVERED_BY_CHILD_CONCEPT'){
      const children = strings(concept.coveredByConceptIds);
      const scores = evidenceScores(manifest, children, options.attemptEvidence, options.objectiveEvidence, options.skillEvidence);
      const rankedConcepts = children.map((id, order) => ({id, score:scores.get(id) || 0, order})).sort((a,b) => b.score-a.score || a.order-b.order);
      const positive = rankedConcepts.filter(item => item.score > 0);
      if(positive.length){
        const cutoff = positive[0].score * 0.45;
        const selected = positive.filter(item => item.score >= cutoff).slice(0, 3).map(item => item.id);
        return {
          kind:'FAMILY_ROUTED',
          recommendations:rankReviews(manifest, selected, scores).slice(0, 3).map(asset => ({...asset, reason:`Review the ${manifest.concepts?.[asset.conceptId]?.title || asset.title} evidence from this run.`}))
        };
      }
      return {
        kind:'FAMILY_CHOOSER',
        recommendations:[],
        choices:rankReviews(manifest, children, new Map()).map(asset => ({...asset, reason:`Choose ${manifest.concepts?.[asset.conceptId]?.title || asset.title} if that was the difficult part.`}))
      };
    }
    if(concept.disposition === 'NO_SHEET_INTEGRATION_META'){
      const candidates = strings(options.attemptEvidence?.flatMap?.(attempt => [attempt?.canonicalConceptId, attempt?.primaryConceptId, ...(attempt?.subtopicIds || [])]) || [])
        .filter(id => manifest.concepts?.[id]?.disposition === 'REVIEW_SHEET');
      const scores = evidenceScores(manifest, candidates, options.attemptEvidence, options.objectiveEvidence, options.skillEvidence);
      const recommendations = rankReviews(manifest, candidates, scores).slice(0, 3);
      return recommendations.length ? {kind:'CONTRIBUTING_CONCEPTS', recommendations} : {kind:'NONE', recommendations:[]};
    }
    return {kind:'NONE', recommendations:[]};
  }

  async function filterAvailableReviewResult(result){
    if(!result) return result;
    function safeItems(items){
      return (items || []).map(item => {
        const path = safeReviewPath(item?.path);
        return path ? {...item, path} : null;
      }).filter(Boolean);
    }
    return {
      ...result,
      recommendations:safeItems(result.recommendations),
      more:safeItems(result.more),
      choices:safeItems(result.choices)
    };
  }

  return {
    DEFAULT_MANIFEST_URL,
    PUBLIC_REVIEW_BASE_URL,
    safeReviewPath,
    validateManifest,
    loadConceptReviewManifest,
    resetManifestCache,
    resolveMasteryConceptReviews,
    filterAvailableReviewResult
  };
});
