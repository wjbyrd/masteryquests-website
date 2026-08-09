import crypto from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import vm from 'node:vm';

const repoRoot = process.cwd();
const composerRoot = path.join(repoRoot, 'build', 'faculty-build-composer');
const libraryPath = path.join(composerRoot, 'data', 'composer_library.js');
const manifestPath = path.join(composerRoot, 'data', 'composer_library_manifest.json');
const ocrPath = path.join(repoRoot, 'verification_tools', 'graph_ocr_work.json');
const auditPath = path.join(repoRoot, 'graph_accessibility_audit.json');
const provenancePath = path.join(composerRoot, 'phase6.4-graph-accessibility-v1.json');
const generatedAt = '2026-08-09T21:00:00.000Z';
const releaseSuffix = 'phase6.4-graph-accessibility-v1';

function sha256(value) {
  return crypto.createHash('sha256').update(value).digest('hex');
}

function stableObject(value) {
  if (Array.isArray(value)) return value.map(stableObject);
  if (value && typeof value === 'object') {
    return Object.fromEntries(Object.keys(value).sort().map(key => [key, stableObject(value[key])]));
  }
  return value;
}

function loadLibrary() {
  const raw = fs.readFileSync(libraryPath, 'utf8');
  const context = { window: {} };
  vm.createContext(context);
  vm.runInContext(raw, context);
  return { raw, library: context.window.MQ_COMPOSER_LIBRARY };
}

function normalizedAssetPath(value) {
  return String(value || '').replace(/^data\//, '').replaceAll('\\', '/');
}

function numericMarks(record) {
  const values = record.ocr.join(' ').match(/\$?\d+(?:\.\d+)?%?/g) || [];
  const unique = [...new Set(values.map(value => value.replace(/^0+(?=\d)/, '')))];
  return unique.slice(0, 44).join(', ');
}

function cleanVisibleText(record) {
  return record.ocr
    .map(line => line
      .replace(/[|!]+/g, ' ')
      .replace(/[-_=]{3,}/g, ' ')
      .replace(/[^\p{L}\p{N}$%(),.+\-/= ]/gu, ' ')
      .replace(/\s+/g, ' ')
      .trim())
    .filter(line => /[A-Za-z0-9]/.test(line))
    .join('; ')
    .replace(/\s+/g, ' ')
    .slice(0, 760);
}

function graphAxes(conceptId, filename) {
  const lower = filename.toLowerCase();
  if (lower.startsWith('matrix_') || lower.startsWith('tree_')) return '';
  if (lower.startsWith('shares_')) return 'The horizontal axis lists firms A, B, C, D, and Other; the vertical axis is market share in percent.';
  if (lower === 'ppf.webp') return 'The horizontal axis is Good X and the vertical axis is Good Y.';
  if (lower.includes('supplydemand') || lower.includes('ceilingfloor') || lower.includes('taxincidence')) return 'The horizontal axis is quantity and the vertical axis is price.';
  if (conceptId === 'elasticity') return 'The horizontal axis is quantity and the vertical axis is price.';
  if (conceptId === 'consumer-and-producer-surplus') return 'The horizontal axis is quantity and the vertical axis is price.';
  if (conceptId === 'international-trade-and-trade-policy') {
    const units = /^TRD-/i.test(filename) ? ' Quantity is measured in thousands as printed on the axis.' : '';
    return `The horizontal axis is quantity and the vertical axis is price.${units}`;
  }
  if (conceptId === 'costs-of-production') {
    if (/COST-04|cop_tp_/i.test(filename)) return 'The horizontal axis is labor or workers and the vertical axis is total product or output.';
    if (/COST-05|cop_mp_|cop_mp_ap/i.test(filename)) return 'The horizontal axis is labor or workers and the vertical axis is product per worker.';
    if (/COST-03|cop_total_costs/i.test(filename)) return 'The horizontal axis is quantity and the vertical axis is total cost.';
    return 'The horizontal axis is quantity and the vertical axis is cost per unit.';
  }
  if (conceptId === 'perfect-competition') return 'The horizontal axis is firm or market quantity and the vertical axis is price or cost per unit.';
  if (conceptId === 'monopoly' || conceptId === 'monopolistic-competition') return 'The horizontal axis is quantity and the vertical axis is price or cost per unit.';
  if (conceptId === 'oligopoly') return 'The horizontal axis is market quantity and the vertical axis is price or cost per unit.';
  return 'The graph labels its horizontal and vertical economic variables.';
}

function graphGeometry(conceptId, filename) {
  const lower = filename.toLowerCase();
  if (lower === 'ppf.webp') return 'A bowed-out frontier passes through A at (0, 50), B at (8, 45), C at (15, 35), D at (21, 20), and E at (25, 0). F is inside the frontier near (8, 20), and G is outside it near (21, 48).';
  if (lower === 'supplydemand1.webp') return 'Two upward-sloping curves are labeled S1 and S2, and two downward-sloping curves are labeled D1 and D2. Dashed guides mark prices P1, P2, and P3 and quantities Q1, Q2, and Q3 at the displayed intersections.';
  if (lower === 'ceilingfloor.webp') return 'An upward-sloping supply curve and downward-sloping demand curve intersect at price $30 and quantity 200. Dashed guides also show demand and supply quantities at prices $10, $20, $40, and $50: at $10, supply is 100 and demand is 300; at $20, supply is 150 and demand is 250; at $40, supply is 250 and demand is 150; at $50, supply is 300 and demand is 100.';
  if (lower === 'taxincidence.webp') return 'A downward-sloping demand curve intersects the original upward-sloping supply curve at price $15 and quantity 100. A parallel curve labeled Supply plus tax lies above supply and intersects demand at price $18 and quantity 80. At quantity 80 the original supply curve is at $12; dashed guides also mark quantities 65, 120, and 150 and prices $10 and $20.';
  if (filename === 'ELAS-01.webp') return 'One downward-sloping demand line contains point C at price $12 and quantity 30, point B at price $8 and quantity 60, and point A at price $4 and quantity 90.';
  if (filename === 'ELAS-02.webp') return 'Two downward-sloping demand curves are labeled D1 and D2. D1 is flatter than D2. At price $10, D1 has quantity 45 and D2 has quantity 35; at price $6, D1 has quantity 95 and D2 has quantity 55. The plotted points are labeled A, B, C, and D.';
  if (filename === 'ELAS-03.webp') return 'Demand curve D1 is horizontal at price 5, while demand curve D2 is vertical at quantity 50. They cross at labeled point A, quantity 50 and price 5.';
  if (filename === 'ELAS-05.webp') return 'Two upward-sloping supply curves are labeled SR supply and LR supply. Both pass through quantity 60 and price 4. At price 8, point A on SR supply is at quantity 70 and point B on LR supply is at quantity 100. The SR curve is steeper and the LR curve is flatter.';
  if (conceptId === 'consumer-and-producer-surplus') {
    if (lower.includes('step_buyers')) return 'A downward staircase curve labeled D shows successive buyer values at quantities 1 through 5.';
    if (lower.includes('step_sellers')) return 'An upward staircase curve labeled S shows successive seller values at quantities 1 through 5.';
    if (lower.includes('demand_shift')) return 'An upward-sloping supply curve is crossed by downward-sloping demand curves D1 and D2; intersections E1 and E2 and their dashed price and quantity guides are labeled.';
    if (lower.includes('supply_shift')) return 'A downward-sloping demand curve is crossed by upward-sloping supply curves S1 and S2; intersections E1 and E2 and their dashed price and quantity guides are labeled.';
    if (lower.includes('horizontal_supply')) return 'A horizontal supply curve labeled S crosses a downward-sloping demand curve at point E; the axes show the corresponding price and quantity.';
    if (lower.includes('consumer_prices')) return 'A downward-sloping demand curve has horizontal reference lines P1 and P2 with vertical quantity guides, showing two price-quantity positions.';
    if (lower.includes('producer_prices')) return 'An upward-sloping supply curve has horizontal reference lines P1 and P2 with vertical quantity guides, showing two price-quantity positions.';
    if (lower.includes('underproduction')) return 'Upward-sloping supply and downward-sloping demand cross at E. Point A lies left of E and point B is marked below the demand curve at the smaller quantity; dashed guides show the labeled quantities and prices.';
    if (lower.includes('overproduction')) return 'Upward-sloping supply and downward-sloping demand cross at E. Points A and B lie to the right of E at the larger quantity; dashed guides show the labeled quantities and prices.';
    return 'An upward-sloping supply curve and downward-sloping demand curve cross at labeled point E, with dashed guides to its price and quantity.';
  }
  if (conceptId === 'international-trade-and-trade-policy') {
    if (filename === 'TRD-01.webp') return 'Domestic demand slopes down and domestic supply slopes up, crossing at point A, price $7 and quantity 175 thousand. A horizontal world-price line at $5 crosses supply at 125 thousand and demand at 225 thousand.';
    if (filename === 'TRD-02.webp') return 'Domestic demand slopes down and domestic supply slopes up, crossing at point A, price $7 and quantity 175 thousand. A horizontal world-price line at $10 crosses demand at 100 thousand and supply at 250 thousand.';
    if (filename === 'TRD-03.webp') return 'Domestic demand slopes down and domestic supply slopes up, crossing at point e, price $8 and quantity 150 thousand. Horizontal lines mark world price $4 and domestic price with tariff $6. At $4, supply is 50 thousand and demand is 250 thousand; at $6, supply is 100 thousand and demand is 200 thousand.';
    if (filename === 'TRD-04.webp') return 'Domestic demand slopes down and domestic supply slopes up, crossing at price $7 and quantity 175 thousand. Horizontal lines mark world price $3 and domestic price under quota $6. At $3, supply is 75 thousand and demand is 275 thousand; at $6, supply is 150 thousand and demand is 200 thousand.';
    if (lower.includes('tariff_regions')) return 'Upward-sloping supply and downward-sloping demand are crossed by horizontal world-price and tariff-price lines. The visible regions are labeled A, B, and C, with vertical guides to the corresponding quantities.';
    if (lower.includes('quota_rent')) return 'Upward-sloping supply and downward-sloping demand are crossed by horizontal world-price and quota-price lines, with vertical guides to the corresponding quantities.';
    if (lower.includes('tariff')) return 'Upward-sloping supply and downward-sloping demand are crossed by lower world-price and higher tariff-price lines; vertical guides mark domestic supply and demand at both prices.';
    if (lower.includes('quota')) return 'Upward-sloping supply and downward-sloping demand are crossed by lower world-price and higher quota-price lines; vertical guides mark the displayed domestic quantities.';
    if (lower.includes('export')) return 'Upward-sloping supply and downward-sloping demand are crossed by a horizontal world-price line above their domestic intersection; vertical guides mark domestic demand and supply at that price.';
    if (lower.includes('import')) return 'Upward-sloping supply and downward-sloping demand are crossed by a horizontal world-price line below their domestic intersection; vertical guides mark domestic supply and demand at that price.';
    return 'An upward-sloping supply curve and downward-sloping demand curve cross at the displayed domestic price and quantity.';
  }
  if (conceptId === 'costs-of-production') {
    if (/COST-04|cop_tp_/i.test(filename)) return 'A total-product curve rises with labor, changes curvature, and then either flattens or turns downward as shown.';
    if (/COST-05|cop_mp_ap/i.test(filename)) return 'Curves labeled MP and AP vary with labor and cross where shown.';
    if (/cop_mp_/i.test(filename)) return 'A curve labeled MP varies with the worker added, with positive and negative ranges shown on the vertical scale.';
    if (/COST-03|cop_total_costs/i.test(filename)) return 'Total-cost curves are plotted against output; the visible curve labels and vertical intercepts distinguish them.';
    if (/COST-06|cop_lratc|cop_mes/i.test(filename)) return 'A U-shaped long-run average-cost curve is plotted against quantity, with labeled regions or quantity guides where shown.';
    if (lower.includes('plant_envelope')) return 'Three U-shaped short-run average-total-cost curves, SRATC1 through SRATC3, lie around a lower envelope labeled LRATC.';
    if (lower.includes('productivity_shift')) return 'Two sets of upward-sloping MC curves and U-shaped ATC curves are labeled MC1, MC2, ATC1, and ATC2.';
    return 'The graph shows upward-sloping MC and U-shaped average-cost curves labeled AC or ATC and AVC, with their crossings and any reference lines visible.';
  }
  if (conceptId === 'perfect-competition') {
    if (lower.includes('lrs_') || lower.includes('demand_shift')) return 'An industry curve labeled LRS is drawn against industry quantity; its slope and any demand curves are visible.';
    if (lower.includes('market_firm') || lower.includes('entry_') || lower.includes('exit_') || /^PC-0[678]/i.test(filename)) return 'A two-panel figure pairs a market supply-and-demand graph with a representative-firm graph. The firm panel shows MC, ATC, AVC, and a horizontal P equals MR equals AR line; dashed guides connect the displayed market price and quantities.';
    if (lower.includes('supply_')) return 'An upward-sloping MC curve and U-shaped AVC curve are shown against quantity.';
    return 'The firm graph shows an upward-sloping MC curve, U-shaped ATC and AVC curves, and a horizontal line labeled D equals AR equals MR or P equals MR equals AR, with the marked quantity and price or cost levels.';
  }
  if (conceptId === 'monopoly') return 'A downward-sloping demand curve labeled D equals AR and a steeper downward-sloping MR curve are shown with MC and, where present, ATC and AVC. Dashed guides mark labeled prices and quantities.';
  if (conceptId === 'monopolistic-competition') return 'A downward-sloping demand curve labeled D equals AR and a steeper MR curve are shown with MC and a U-shaped ATC curve. Dashed guides mark labeled prices and quantities.';
  if (conceptId === 'oligopoly') {
    if (lower.startsWith('cartel_')) return 'A downward-sloping demand curve and steeper downward-sloping MR curve are shown with an MC curve against market quantity.';
    if (lower.startsWith('kinked_')) return 'A demand curve labeled D changes slope at a visible kink; the MR curve has a vertical gap, and MC passes through the displayed range.';
  }
  return 'The figure shows the labeled curves, points, reference lines, and visible scale values.';
}

function conciseAlt(conceptId, filename) {
  const lower = filename.toLowerCase();
  if (lower.startsWith('matrix_')) return 'Two-by-two payoff matrix with row and column actions.';
  if (lower.startsWith('tree_')) return 'Sequential entry game tree with branch payoffs.';
  if (lower.startsWith('shares_')) return 'Bar chart of market shares for four firms and the remaining fringe.';
  if (lower === 'ppf.webp') return 'Production possibilities graph with points A through G.';
  if (lower.includes('supplydemand')) return 'Supply-and-demand shift graph with labeled prices and quantities.';
  if (lower.includes('ceilingfloor')) return 'Supply-and-demand graph with price and quantity guides.';
  if (lower.includes('taxincidence')) return 'Demand, supply, and shifted-supply graph with price and quantity guides.';
  if (conceptId === 'elasticity') return 'Demand or supply curve graph with labeled points and price-quantity guides.';
  if (conceptId === 'consumer-and-producer-surplus') return 'Supply-and-demand graph with labeled points and price-quantity guides.';
  if (conceptId === 'international-trade-and-trade-policy') return 'Domestic supply-and-demand graph with world-price or trade-policy reference lines.';
  if (conceptId === 'costs-of-production') return 'Production or cost-curve graph with labeled inputs, output, quantity, and costs.';
  if (conceptId === 'perfect-competition') return 'Competitive market or firm graph with labeled price, revenue, and cost curves.';
  if (conceptId === 'monopoly') return 'Market demand, marginal-revenue, and cost-curve graph.';
  if (conceptId === 'monopolistic-competition') return 'Firm demand, marginal-revenue, and cost-curve graph.';
  if (conceptId === 'oligopoly') return 'Market demand, marginal-revenue, and marginal-cost graph.';
  return 'Economics graph with labeled axes, curves, points, and values.';
}

function descriptionFor(record) {
  const lower = record.filename.toLowerCase();
  if (lower.startsWith('matrix_')) {
    return `A two-by-two payoff matrix. ${cleanVisibleText(record).replace(/^Payoff order:/, 'Payoff order:')}.`;
  }
  if (lower.startsWith('tree_')) {
    return `A sequential game tree. ${cleanVisibleText(record)}.`;
  }
  if (lower.startsWith('shares_')) {
    return `${graphAxes(record.conceptId, record.filename)} The bars and their printed values are: ${cleanVisibleText(record)}.`;
  }
  const completeManualValues = new Set([
    'ppf.webp', 'supplydemand1.webp', 'ceilingfloor.webp', 'taxincidence.webp',
    'ELAS-01.webp', 'ELAS-02.webp', 'ELAS-03.webp', 'ELAS-05.webp',
    'TRD-01.webp', 'TRD-02.webp', 'TRD-03.webp', 'TRD-04.webp'
  ]);
  const marks = completeManualValues.has(record.filename) ? '' : numericMarks(record);
  return [
    graphAxes(record.conceptId, record.filename),
    graphGeometry(record.conceptId, record.filename),
    marks ? `Visible numeric scale markings include ${marks}.` : ''
  ].filter(Boolean).join(' ');
}

const { raw: beforeRaw, library } = loadLibrary();
const ocr = JSON.parse(fs.readFileSync(ocrPath, 'utf8'));
const records = [];
const seenAssetKeys = new Set();

for (const ocrRecord of ocr.records) {
  const module = library.concepts[ocrRecord.conceptId];
  const metadata = (module.assetMetadata || []).find(asset => normalizedAssetPath(asset.runtimePath) === normalizedAssetPath(ocrRecord.runtimePath));
  if (!metadata) throw new Error(`Metadata disappeared for ${ocrRecord.key}`);
  const imageAlt = conciseAlt(ocrRecord.conceptId, ocrRecord.filename);
  const graphDescription = descriptionFor(ocrRecord);
  metadata.imageAlt = imageAlt;
  metadata.graphDescription = graphDescription;
  const inventoryRecord = library.assetInventory.find(asset => asset.conceptId === ocrRecord.conceptId && normalizedAssetPath(asset.runtimePath) === normalizedAssetPath(ocrRecord.runtimePath));
  if (!inventoryRecord) throw new Error(`Inventory record missing for ${ocrRecord.key}`);
  inventoryRecord.imageAlt = imageAlt;
  inventoryRecord.graphDescription = graphDescription;

  const key = `${ocrRecord.conceptId}|${normalizedAssetPath(ocrRecord.runtimePath)}`;
  if (seenAssetKeys.has(key)) continue;
  seenAssetKeys.add(key);
  const leakageTerms = [
    'elastic', 'inelastic', 'profit-maximizing', 'allocatively efficient',
    'productive efficiency', 'economic profit', 'shutdown point',
    'excess capacity', 'deadweight loss', 'consumer gains', 'producer loses'
  ];
  const combined = `${imageAlt} ${graphDescription}`.toLowerCase();
  const leakageMatches = leakageTerms.filter(term => combined.includes(term));
  records.push({
    asset: normalizedAssetPath(ocrRecord.runtimePath),
    filename: ocrRecord.filename,
    concept: ocrRecord.conceptId,
    altText: imageAlt,
    longDescription: graphDescription,
    describesAxes: /axis|matrix|game tree/.test(graphDescription.toLowerCase()),
    describesCurves: /curve|supply|demand|frontier|bars|matrix|game tree/.test(graphDescription.toLowerCase()),
    describesVisibleValues: /\d/.test(graphDescription),
    revealsAnswer: leakageMatches.length > 0,
    leakageMatches,
    questionCountUsingAsset: ocrRecord.questionIds.length,
    questionIds: ocrRecord.questionIds,
    status: leakageMatches.length ? 'REVIEW' : 'PASS'
  });
}

library.composerVersion = '4.5d.0';
if (!library.libraryVersion.endsWith(`-${releaseSuffix}`)) {
  library.libraryVersion = `${library.libraryVersion}-${releaseSuffix}`;
}
library.sourceCurationPhase = releaseSuffix;
library.sourceGeneratedAt = generatedAt;
library.registry.generatedAt = generatedAt;
delete library.librarySha256;
library.librarySha256 = sha256(JSON.stringify(stableObject(library)));

const libraryText = `window.MQ_COMPOSER_LIBRARY = ${JSON.stringify(library)};\n`;
fs.writeFileSync(libraryPath, libraryText);

const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
manifest.assets = library.assetInventory;
manifest.assetCount = library.assetInventory.length;
manifest.conceptCount = library.conceptCount;
manifest.canonicalQuestionCount = library.canonicalQuestionCount;
manifest.libraryVersion = library.libraryVersion;
manifest.librarySha256 = library.librarySha256;
manifest.generatedAt = generatedAt;
fs.writeFileSync(manifestPath, `${JSON.stringify(manifest, null, 2)}\n`);

records.sort((a, b) => a.asset.localeCompare(b.asset));
const graphLinkedQuestionCount = records.reduce((sum, record) => sum + record.questionCountUsingAsset, 0);
const visualHashes = new Set(records.map(record => {
  const asset = library.assetInventory.find(item => item.conceptId === record.concept && normalizedAssetPath(item.runtimePath) === record.asset);
  return asset.sha256;
}));
const conflictingDescriptions = [];
const bySha = new Map();
for (const record of records) {
  const asset = library.assetInventory.find(item => item.conceptId === record.concept && normalizedAssetPath(item.runtimePath) === record.asset);
  const signature = `${record.altText}\n${record.longDescription}`;
  if (bySha.has(asset.sha256) && bySha.get(asset.sha256).signature !== signature) {
    conflictingDescriptions.push({ sha256: asset.sha256, first: bySha.get(asset.sha256).asset, second: record.asset });
  } else if (!bySha.has(asset.sha256)) {
    bySha.set(asset.sha256, { asset: record.asset, signature });
  }
}

const audit = {
  generatedAt,
  scope: 'Current executable Micro graph questions in the authorized GitHub repository',
  repository: repoRoot,
  libraryVersion: library.libraryVersion,
  librarySha256: library.librarySha256,
  graphLinkedQuestionCount,
  uniqueProductionAssetRecords: records.length,
  uniqueVisualAssetHashes: visualHashes.size,
  assetsWithDescriptiveAltText: records.filter(record => record.altText.length >= 20).length,
  assetsWithLongDescriptions: records.filter(record => record.longDescription.length >= 80).length,
  graphLinkedQuestionsResolvingDescriptions: graphLinkedQuestionCount,
  missingDescriptions: records.filter(record => !record.altText || !record.longDescription).length,
  answerLeakageFindings: records.filter(record => record.revealsAnswer).length,
  conflictingDescriptions,
  duplicateConflictingDescriptions: conflictingDescriptions.length,
  records
};
fs.writeFileSync(auditPath, `${JSON.stringify(audit, null, 2)}\n`);

const provenance = {
  phase: releaseSuffix,
  generatedAt,
  repository: repoRoot,
  before: {
    libraryVersion: library.libraryVersion.replace(`-${releaseSuffix}`, ''),
    librarySha256: '0fbd9a8ce1e1a5b3a0d35ad927b057804137953d552b43ad88f7bd8affdd65b4',
    libraryFileSha256: '0e880122100373e10346b38ea3d013e16c34a4c5a14aad4de18266a5f33c1d6a'
  },
  after: {
    libraryVersion: library.libraryVersion,
    librarySha256: library.librarySha256,
    libraryFileSha256: sha256(libraryText)
  },
  graphLinkedQuestionCount,
  uniqueProductionAssetRecords: records.length,
  uniqueVisualAssetHashes: visualHashes.size,
  assetsWithAltText: audit.assetsWithDescriptiveAltText,
  assetsWithLongDescriptions: audit.assetsWithLongDescriptions,
  answerLeakageFindings: audit.answerLeakageFindings,
  conflictingDescriptions: audit.duplicateConflictingDescriptions,
  questionContentChanged: false,
  answerHashesChanged: false,
  graphPixelsChanged: false
};
fs.writeFileSync(provenancePath, `${JSON.stringify(provenance, null, 2)}\n`);
console.log(JSON.stringify({ audit: auditPath, provenance: provenancePath, ...provenance.after, summary: {
  graphLinkedQuestionCount,
  uniqueProductionAssetRecords: records.length,
  uniqueVisualAssetHashes: visualHashes.size,
  missingDescriptions: audit.missingDescriptions,
  answerLeakageFindings: audit.answerLeakageFindings,
  conflictingDescriptions: audit.duplicateConflictingDescriptions
} }, null, 2));
