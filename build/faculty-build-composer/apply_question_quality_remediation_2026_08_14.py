import json, re, hashlib, unicodedata, copy
from pathlib import Path

ROOT = Path(__file__).resolve().parent
LIB = ROOT / 'data/composer_library.js'
REG = ROOT / 'data/composer_registry.json'
MAN = ROOT / 'data/composer_library_manifest.json'
PHASE = 'phaseQH2-question-quality-remediation-v1'
GEN = '2026-08-14T21:32:00.000Z'


def norm(s):
    return re.sub(r'\s+', ' ', unicodedata.normalize('NFKC', str(s or '')).strip()).lower()

def ah(s):
    return hashlib.sha256(norm(s).encode()).hexdigest()

def th(s):
    return hashlib.sha256(s.encode()).hexdigest()

def load_lib():
    raw = LIB.read_text(encoding='utf-8')
    return json.loads(raw.split('=', 1)[1].strip().rstrip(';'))

def save_lib(lib):
    LIB.write_text('window.MQ_COMPOSER_LIBRARY=' + json.dumps(lib, separators=(',', ':'), ensure_ascii=False) + ';\n', encoding='utf-8')

def iter_all(lib):
    for cid, c in lib['concepts'].items():
        for pool, arr in (c.get('questions') or {}).items():
            for q in arr:
                yield cid, f'questions.{pool}', q
        for key in ['repairQuestions', 'bridgeQuestions', 'repairSeedQuestions']:
            for q in c.get(key, []):
                yield cid, key, q

def source_hash(q):
    payload = {k: q.get(k) for k in ['id','q','options','image','primarySkill','primaryConceptId','difficulty','objective']}
    return th(json.dumps(payload, sort_keys=True, ensure_ascii=False, separators=(',', ':')))

def resolve_correct(q):
    expected = str(q.get('aHash') or '').replace('sha256:', '').lower()
    hits = [o for o in q.get('options', []) if ah(o) == expected]
    if len(hits) == 1:
        return hits[0]
    if isinstance(q.get('a'), int) and 0 <= q['a'] < len(q.get('options', [])):
        return q['options'][q['a']]
    raise RuntimeError(f"Cannot resolve correct answer for {q.get('id')}: {hits}")

def finalize(q, correct=None):
    if correct is None:
        correct = resolve_correct(q)
    if correct not in q['options']:
        raise RuntimeError(f"Correct option missing after edit: {q['id']} -> {correct}")
    q['aHash'] = ah(correct)
    q['sourceHash'] = source_hash(q)
    for occ in q.get('sourceOccurrences') or []:
        occ['sourceHash'] = q['sourceHash']

lib = load_lib()
idx = {}
for cid, route, q in iter_all(lib):
    idx.setdefault(q['id'], []).append((cid, route, q))

changed = {}
def mutate(qid, fn, reason):
    if qid not in idx:
        raise KeyError(qid)
    for cid, route, q in idx[qid]:
        before = copy.deepcopy(q)
        correct_before = resolve_correct(q)
        new_correct = fn(q, correct_before)
        finalize(q, new_correct if new_correct is not None else (correct_before if correct_before in q['options'] else None))
        changed.setdefault(qid, {'reason': reason, 'locations': [], 'before': before, 'after': copy.deepcopy(q)})
        changed[qid]['locations'].append({'concept': cid, 'route': route})

# -----------------------------------------------------------------------------
# 1) Confirmed calculation defects: repair semantics and displayed-number math.
# -----------------------------------------------------------------------------
calc_replacements = {
    'P62G-MON-C-018': 'Economic profit of $341.66',
    'P62G-MON-C-019': 'Economic profit of $97.46',
    'P62G-MON-C-022': '$436.35',
    'P62G-MON-C-024': '$386.37',
    'P62G-MON-C-025': '$375.10',
    'P62H-MCMP-C-013': '$792.91',
    'P62H-MCMP-C-014': '$759.86',
    'P62H-MCMP-C-015': '$800.71',
    'P62H-MCMP-C-016': '$804.61',
    'P62H-MCMP-C-018': '$17.33',
}

def replace_correct_option(new_correct):
    def _fn(q, old_correct):
        ci = q['options'].index(old_correct)
        q['options'][ci] = new_correct
        return new_correct
    return _fn

for qid, ans in calc_replacements.items():
    mutate(qid, replace_correct_option(ans), 'Displayed-number calculation correction')


def fix_mcmp_c017(q, old_correct):
    q['q'] = 'A firm produces 18.14 units at price $61.72 with ATC $61.31. What is its economic profit?'
    q['options'] = ['$7.44', '$0.41', '$700.00', '$658.09']
    q['primarySkill'] = 'short_run_profit'
    q['repairSkill'] = 'short_run_profit'
    q['commonError'] = 'uses_price_minus_mc'
    q['feedback'] = 'Profit equals (P−ATC)Q because price exceeds ATC.'
    return '$7.44'
mutate('P62H-MCMP-C-017', fix_mcmp_c017, 'Correct profit/loss framing and answer')


def fix_mcmp_c019(q, old_correct):
    q['q'] = 'A firm produces 19.47 units at price $58.89 with ATC $55.27. What is its economic profit?'
    q['options'] = ['$3.62', '$650.00', '$70.48', '$644.68']
    q['primarySkill'] = 'short_run_profit'
    q['repairSkill'] = 'short_run_profit'
    q['commonError'] = 'uses_price_minus_mc'
    q['feedback'] = 'Profit equals (P−ATC)Q because price exceeds ATC.'
    return '$70.48'
mutate('P62H-MCMP-C-019', fix_mcmp_c019, 'Correct profit/loss framing and answer')


def fix_mcmp_c020(q, old_correct):
    q['q'] = q['q'].replace('ATC is $12', 'ATC is $62')
    return old_correct
mutate('P62H-MCMP-C-020', fix_mcmp_c020, 'Repair impossible ATC < AVC data')


def fix_mcmp_c021(q, old_correct):
    q['q'] = q['q'].replace('ATC is $16', 'ATC is $66')
    return old_correct
mutate('P62H-MCMP-C-021', fix_mcmp_c021, 'Repair impossible ATC < AVC data')

# -----------------------------------------------------------------------------
# 2) Mechanical wording artifacts.
# -----------------------------------------------------------------------------
wording_ids = {
    'P62G-MON-C-001','P62G-MON-C-005','P62C-CPS-LB-017','P62C-CPS-LB-019','P62C-CPS-LB-021',
    'P62C-CPS-C-002','P62H-MCMP-H-036','P62H-MCMP-EL-036','P62G-MON-EL-036','P62G-MON-EL-040',
    'P62G-MON-L-091','P62G-MON-L-092','P62G-MON-L-095'
}

def fix_wording(q, old_correct):
    q['q'] = q.get('q','').replace('3th', '3rd').replace('for a art print', 'for an art print').replace('the the displayed graph', 'the displayed graph')
    q['feedback'] = q.get('feedback','').replace('3th', '3rd').replace('for a art print', 'for an art print').replace('the the displayed graph', 'the displayed graph')
    return old_correct
for qid in sorted(wording_ids):
    mutate(qid, fix_wording, 'Mechanical wording cleanup')

# -----------------------------------------------------------------------------
# 3) Exact-stem/full-duplicate diversification. Keep the economics and key;
#    rewrite one presentation in each pair so valid broad builds do not recycle.
# -----------------------------------------------------------------------------
stem_rewrites = {
    'ECON-SP-EASYBOSS-2008': "A banking system receives a fresh $5,000 deposit and requires banks to hold 20 percent as reserves. Using the simple multiplier model, identify the first bank's loan and the maximum total deposit expansion.",
    'ECON-EC-ELITE-13011': 'In a city housing market, a binding rent ceiling leaves 80,000 units demanded but only 52,000 supplied. Tenants who secure units save $300 each, while 28,000 households are rationed out. Which conclusion best captures the welfare tradeoff?',
    'ECON-EC-ELITE-13024': 'Suppose a city simultaneously subsidizes new apartment construction and caps rent below equilibrium. What combined market effect is most plausible?',
    'ECON-EC-LEGENDARY-14050': 'After a binding rent ceiling is imposed, some landlords move units into unregulated short-term rentals. Which lesson about price controls follows?',
    'ECON-SP-EASYBOSS-2005': 'Election-year pressure pushes the central bank toward an expansionary money policy for political reasons. What role does central bank independence play in this situation?',
    'P62F-PC-E-010': 'For a competitive firm, economic profit is calculated as:',
    'ECON-EC-LEGENDARY-14088': 'A transit policy cuts bus fares and initially boosts ridership, but crowding later pushes some passengers back to cars. What broader lesson about incentives and feedback effects is strongest?',
    'ECON-EC-ELITE-13026': 'A tax on luxury goods sharply reduces sales, and the government collects much less revenue than expected. What most likely explains the disappointing revenue?',
    'ECON-EC-LEGENDARY-14063': 'Suppose an equal per-unit tax could legally be collected from either buyers or sellers. In the standard supply-demand model, why is the equilibrium incidence similar either way?',
    'ECON-EC-LEGENDARY-14089': 'A price-ceiling model predicts a shortage. In practice, the city also sees black markets, quality cuts, and favoritism. What does that comparison reveal about economic models?',
    'ECON-SP-EASYBOSS-2002': 'The public holds $900 in currency and $1,100 in checkable deposits; savings deposits are $1,500 and small time deposits are $500. Based on these balances, calculate M1 and M2.',
    'ECON-SP-EASYBOSS-2011': 'Under a simple money-multiplier model of 5, the Fed sells $20 million of bonds. What is the maximum resulting contraction in the money supply?',
    'ECON-SP-EASYBOSS-2014': 'After the Fed buys bonds, banks choose to hold some added reserves and households keep part of the proceeds as currency. What conclusion should you draw about the money-supply effect?',
    'ECON-MG-MEDIUMBOSS-3011': 'At a market checkpoint, demand shifts right while supply shifts left at the same time. Which equilibrium change can be predicted with certainty?',
    'P62F-PC-E-012': 'For the next unit of output, marginal cost is greater than marginal revenue. Producing that unit would:',
    'P62F-PC-R-011': 'For a competitive firm, earning zero economic profit means:',
}
# These rewrites diversify every exact-stem duplicate group identified by the full sweep.

def rewrite_stem(new_stem):
    def _fn(q, old_correct):
        q['q'] = new_stem
        return old_correct
    return _fn
for qid, stem in stem_rewrites.items():
    mutate(qid, rewrite_stem(stem), 'Diversify exact duplicate/recycled stem')

# -----------------------------------------------------------------------------
# 4) Diversify the specific Monopolistic Competition conceptual clone family
#    called out by the audit. Numerical parameterized practice is preserved.
# -----------------------------------------------------------------------------
clone_rewrites = {
    'P62H-MCMP-L-036': "A restaurant's lease renewal raises fixed rent enough that ATC lies above its demand curve at the former long-run position, while demand and marginal cost are unchanged. What adjustment follows?",
    'P62H-MCMP-L-039': 'A recurring licensing fee raises fixed cost and pushes ATC above demand without changing marginal cost. What long-run market adjustment restores the zero-profit condition?',
    'P62H-MCMP-L-042': "An annual insurance premium raises a firm's fixed cost but leaves marginal cost unchanged. Its former long-run output now generates an economic loss. What response follows?",
    'P62H-MCMP-L-045': 'A fixed platform subscription fee rises permanently. At the old long-run output, price no longer covers ATC even though marginal cost is unchanged. What adjustment should occur?',
    'P62H-MCMP-L-048': "A recurring fixed compliance cost lifts ATC above demand at a firm's previous long-run equilibrium. Which entry-or-exit response is consistent with monopolistic competition?",
}
for qid, stem in clone_rewrites.items():
    mutate(qid, rewrite_stem(stem), 'Diversify repetitive conceptual clone')

# -----------------------------------------------------------------------------
# 5) Diversify Monopolistic Competition checkpoint clones and repair one newly
#    confirmed semantic/key mismatch discovered during remediation review.
# -----------------------------------------------------------------------------
checkpoint_clone_rewrites = {
    'P62H-MCMP-B2-022': 'A profitable salon attracts new differentiated rivals. What market adjustment is created by those positive economic profits?',
    'P62H-MCMP-B2-025': 'A fitness studio earns positive economic profit and entry barriers are low. What long-run market pressure should begin?',
    'P62H-MCMP-B2-028': 'A clothing boutique is incurring a short-run economic loss and firms can leave the market. What adjustment pressure follows?',
    'P62H-MCMP-B2-031': 'A dental practice is earning negative economic profit in a market with relatively easy exit. What market response should occur?',
    'P62H-MCMP-B2-034': 'A tutoring firm faces sustained economic losses. What long-run market pressure is expected as firms respond?',
    'P62H-MCMP-B2-020': 'As entry erodes short-run profit, what zero-profit geometry characterizes the standard long-run equilibrium?',
    'P62H-MCMP-B2-023': "Once entry has fully adjusted the representative firm's demand, which condition indicates long-run equilibrium?",
    'P62H-MCMP-B2-026': 'In the standard long-run monopolistic-competition equilibrium after profitable entry, how do demand and ATC relate?',
    'P62H-MCMP-B2-029': 'After losses induce exit and surviving firms regain demand, what condition stops further exit?',
    'P62H-MCMP-B2-032': 'Which condition signals that exit has restored long-run equilibrium for the representative firm?',
    'P62H-MCMP-B2-035': 'When the exit process is complete, what firm-level condition must hold in the standard model?',
}
for qid, stem in checkpoint_clone_rewrites.items():
    mutate(qid, rewrite_stem(stem), 'Diversify repetitive checkpoint clone')

def fix_mcmp_b2_019(q, old_correct):
    q['q'] = 'A differentiated restaurant is earning positive economic profit in the short run. With relatively easy entry, what adjustment pressure follows?'
    q['options'] = ['Entry', 'Exit', 'No entry or exit', 'A government price ceiling']
    q['feedback'] = 'Short-run economic profit attracts entry, which shifts the incumbent firm’s demand left until economic profit is eliminated.'
    return 'Entry'
mutate('P62H-MCMP-B2-019', fix_mcmp_b2_019, 'Repair semantic/key mismatch and diversify checkpoint')

# -----------------------------------------------------------------------------
# 6) Highest-risk distractor cue cleanup: the 18 items that simultaneously hit
#    strong-correct-length, extreme-length-spread, and absolute-distractor flags.
#    Correct choices are intentionally preserved; only distractors are strengthened.
# -----------------------------------------------------------------------------
distractor_sets = {
'ECON-NL-LEGENDARY-9016': [
    None,
    'Profits are excluded from GDP because GDP measures wage income rather than business income earned by firms',
    'Foreign production enters U.S. GDP when the resulting goods or services are eventually sold to U.S. consumers',
    "GDP assigns production to the owner's home country rather than to the country where the production occurs",
],
'LG-Q-9023': [
    None,
    'Commodity-money holdings rise because bond purchases convert financial assets into physical commodity money',
    'Real GDP rises immediately while the quantity of bank deposits is unaffected by the lending and redeposit process',
    'M1 falls because additional bank lending reduces the checkable deposits held by households and businesses',
],
'P62B-ELAS-LB-036': [
    'Long-run elasticity should be smaller because consumers exhaust their easiest adjustments during the first month',
    None,
    'The policy changes supply responsiveness but leaves household demand responsiveness essentially unchanged over time',
    'The first-month estimate remains the best long-run measure because later innovation and relocation are separate effects',
],
'P62D-ITP-E-020': [
    'Tariff revenue is retained by domestic firms, so it remains part of producer surplus rather than a social loss',
    'Deadweight loss is the portion of consumer surplus transferred to producers and the government after the tariff',
    'Tariff revenue offsets the production distortion, leaving the consumption distortion as the remaining deadweight loss',
    None,
],
'P62D-ITP-E-026': [
    'The statement is sufficient because preserving employment in the protected sector captures the main national welfare effect',
    None,
    'Employment effects can be evaluated from the protected industry because tariff costs are unlikely to spill into other sectors',
    'The key missing issue is the effect on foreign workers; domestic consumer and input costs are secondary to that effect',
],
'P62D-ITP-EL-002': [
    'Imports can lower domestic production, and that loss of domestic output by itself establishes that national welfare falls',
    'Domestic production creates value for the country, whereas imported consumption contributes little to domestic consumer surplus',
    'Imports create net value when the imported quantity is smaller than the domestic production displaced by trade',
    None,
],
'P62D-ITP-EL-003': [
    None,
    'Exports raise the domestic price, so producer gains are offset dollar-for-dollar by losses to domestic consumers',
    'Exports shift goods abroad without changing domestic willingness to pay or opportunity cost, leaving welfare unchanged',
    "Because residents consume fewer units after trade, the country's welfare falls despite the higher world price",
],
'P62D-ITP-EL-013': [
    'The protected-sector employment effect should be compared with consumer costs, while downstream employment can be treated as secondary',
    'Tariff revenue and protected-sector payroll provide enough information to determine whether the policy raises national welfare',
    None,
    'The job count settles the welfare question once the preserved positions are valued at their current wage payments',
],
'P62D-ITP-EL-026': [
    'Producer surplus sits outside total surplus, so producer gains and national welfare can move in opposite directions',
    'Consumer losses are fully captured by producer gains, leaving tariff revenue as the source of deadweight loss',
    'Government revenue reduces total surplus dollar-for-dollar even when the revenue is transferred within the country',
    None,
],
'P62F-PC-LB-032': [
    'The firm is both allocatively and productively efficient because P=MC is enough to satisfy both efficiency conditions',
    None,
    'The firm should shut down because price above minimum ATC indicates that output is beyond the efficient scale',
    'The firm earns zero accounting profit because P=MC determines the relationship between price and total cost',
],
'P62F-PC-LB-033': [
    'The firm is allocatively efficient because producing at minimum ATC also implies that P=MC at this output',
    'The firm should shut down because P>MC means the chosen output fails the short-run operating test',
    None,
    'The firm earns zero accounting profit because price equals minimum ATC at the chosen output',
],
'P62I-OLI-B3-043': [
    None,
    'Higher research spending is enough evidence to infer that increased concentration improves consumer welfare over time',
    'Lower concentration should be preferred based on current prices alone, without considering effects on risky investment incentives',
    'Innovation concerns can be separated from concentration policy because future product quality lies outside consumer welfare analysis',
],
'P62I-OLI-EL-028': [
    'Concentration provides enough evidence to infer durable market power even when users can switch among several networks',
    None,
    'Network effects establish anticompetitive conduct whenever a platform becomes the largest firm in its market',
    'Easy multi-homing removes the strategic importance of network effects because users face little reason to coordinate',
],
'PM5-PC-R-070': [
    "Price-taking means the market price is given, so input-cost changes affect profit but not the firm's marginal cost curve",
    'A higher wage changes average fixed cost because labor payments become fixed after the firm hires its workers',
    "A wage increase changes the firm's demand curve by raising the price required to cover its labor costs",
    None,
],
'PMC-COP-BR-029': [
    None,
    'Marginal analysis compares total revenue with total explicit costs, while economic profit isolates the value of the next unit',
    'Economic profit evaluates the next incremental action, while marginal analysis measures the return on the entire project',
    'Both methods compare total revenue and total cost, but marginal analysis reports the result per unit of output',
],
'PMC-COP-BR-071': [
    'It tends to raise AVC because a worker producing more output increases total wage cost faster than output',
    'It leaves AVC unchanged because a constant wage fixes variable cost per unit regardless of worker productivity',
    None,
    'It lowers average fixed cost rather than AVC because labor productivity affects the spreading of fixed cost',
],
'PMC-COP-BR-122': [
    'Continuing can convert past spending into a relevant marginal benefit if enough future revenue is earned',
    'Past spending should be added to expected future benefits because the project needs to recover its historical cost',
    'A project should continue when accounting profit remains positive, even if future incremental costs exceed benefits',
    None,
],
'PMS-ITP-R-001': [
    None,
    'The world price should be treated as the domestic equilibrium price after trade, so the two prices coincide by definition',
    'The world price measures domestic producer surplus, while the no-trade price measures domestic consumer surplus',
    'The no-trade price is determined by foreign supply conditions, while the world price comes from domestic supply and demand',
],
}

def replace_distractors(new_opts):
    def _fn(q, old_correct):
        if len(new_opts) != 4:
            raise RuntimeError(q['id'])
        ci = q['options'].index(old_correct)
        built = []
        for i, repl in enumerate(new_opts):
            built.append(old_correct if i == ci and repl is None else repl)
        if built[ci] != old_correct:
            raise RuntimeError(f"Correct answer moved/changed in {q['id']}")
        if any(x is None for x in built):
            raise RuntimeError(f"Missing distractor replacement in {q['id']}: {built}")
        if len(set(built)) != 4:
            raise RuntimeError(f"Duplicate replacement options in {q['id']}")
        q['options'] = built
        return old_correct
    return _fn

for qid, opts in distractor_sets.items():
    mutate(qid, replace_distractors(opts), 'Strengthen highest-risk distractors and remove test-wiseness cue')

# -----------------------------------------------------------------------------
# 5) Library metadata and integrity hashes.
# -----------------------------------------------------------------------------
all_ids = []
for cid, c in lib['concepts'].items():
    for pool, arr in (c.get('questions') or {}).items():
        all_ids.extend(q.get('canonicalId') or q.get('id') for q in arr)
    for key in ['repairQuestions','bridgeQuestions','repairSeedQuestions']:
        all_ids.extend(q.get('canonicalId') or q.get('id') for q in c.get(key, []))
lib['canonicalQuestionCount'] = len(set(all_ids))
lib['sourceCurationPhase'] = PHASE
lib['sourceGeneratedAt'] = GEN
lib['generatedAt'] = GEN
if not str(lib.get('libraryVersion','')).endswith('-' + PHASE):
    lib['libraryVersion'] = str(lib.get('libraryVersion','')) + '-' + PHASE
lib_nohash = {k:v for k,v in lib.items() if k != 'librarySha256'}
lib['librarySha256'] = th(json.dumps(lib_nohash, separators=(',', ':'), ensure_ascii=False, sort_keys=True))
save_lib(lib)

reg = json.loads(REG.read_text(encoding='utf-8'))
reg['generatedAt'] = GEN
reg['curationPhase'] = PHASE
reg['curationSummary'] = ('Question-quality remediation: fixes confirmed Monopoly/Monopolistic Competition calculation semantics and displayed-number arithmetic, '
                          'removes mechanical wording defects, diversifies exact duplicate stems, and strengthens the 18 highest-risk distractor-cue items.')
reg['libraryVersion'] = lib['libraryVersion']
reg['canonicalQuestionCount'] = lib['canonicalQuestionCount']
reg['librarySha256'] = lib['librarySha256']
REG.write_text(json.dumps(reg, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')

man = json.loads(MAN.read_text(encoding='utf-8'))
man['assetCount'] = len(lib.get('assetInventory', []))
man['assets'] = lib.get('assetInventory', [])
man['conceptCount'] = lib.get('conceptCount', len(lib.get('concepts', {})))
man['canonicalQuestionCount'] = lib['canonicalQuestionCount']
man['libraryVersion'] = lib['libraryVersion']
man['librarySha256'] = lib['librarySha256']
man['generatedAt'] = GEN
MAN.write_text(json.dumps(man, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')

# Machine-readable remediation record.
summary = {
    'phase': PHASE,
    'generatedAt': GEN,
    'composerVersion': lib.get('composerVersion'),
    'canonicalQuestionCount': lib['canonicalQuestionCount'],
    'libraryVersion': lib['libraryVersion'],
    'librarySha256': lib['librarySha256'],
    'changedQuestionIds': sorted(changed),
    'changedQuestionCount': len(changed),
    'categories': {
        'calculationDefects': 14,
        'wordingArtifacts': 13,
        'duplicateStemDiversifications': len(stem_rewrites),
        'highestRiskDistractorCueItems': len(distractor_sets),
        'conceptualCloneDiversifications': len(clone_rewrites),
        'checkpointCloneDiversifications': len(checkpoint_clone_rewrites) + 1,
        'additionalSemanticKeyDefects': 1,
    },
    'changes': {qid: {'reason': v['reason'], 'locations': v['locations']} for qid,v in sorted(changed.items())}
}
(ROOT/'question_quality_remediation_2026_08_14.json').write_text(json.dumps(summary, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')

print(json.dumps(summary, indent=2, ensure_ascii=False))
