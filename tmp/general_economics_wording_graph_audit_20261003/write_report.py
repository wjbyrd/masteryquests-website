import json, hashlib, re
from pathlib import Path
from collections import Counter

root=Path.cwd()
scratch=root/'tmp/general_economics_wording_graph_audit_20261003'
rows=json.loads((scratch/'records.json').read_text(encoding='utf-8'))
byid={r['id']:r for r in rows}
out=root/'faculty_exports/audits'
base='general_economics_wording_graph_audit_20261003'
words=[]
def W(code,priority,ids,title,quote,why,suggestion):
    ids=ids.split() if isinstance(ids,str) else ids
    assert all(i in byid for i in ids),ids
    words.append(dict(code=code,priority=priority,ids=ids,title=title,quote=quote,why=why,suggestion=suggestion))

W('W01','Clear correction','P62D-ITP-L-003 P62D-ITP-L-015 P62D-ITP-L-027 P62D-ITP-L-033 P62D-ITP-L-045 P62D-ITP-L-057','Wrong article before country names','A Arden report / A Estara report / A Ilyria report','The article is grammatically wrong; the country-name substitution is conspicuous. The plural product modifiers also sound stiff.','Use “A report in Arden opposes opening the market for solar panels to international trade because domestic producers would lose.” Use the corresponding country, good, and losing group in each item. Retain the equations and compensation assumptions.')
W('W02','Clear correction','P62D-ITP-H-018 P62D-ITP-H-024 P62D-ITP-H-030 P62D-ITP-LB-003 P62D-ITP-LB-021','Wrong article before eight dollars','a $8 tariff / a $8 per-unit tariff','Eight starts with a vowel sound.','Use “an $8 tariff” or “an $8 per-unit tariff.”')
W('W03','Clear correction',[f'P62D-ITP-L-{n:03}' for n in range(62,81,2)],'Repetitive correction prompt and imprecise curve language','Straight domestic supply and demand each change by one unit ... What is the correct correction?','The closing phrase is tautological. Quantities supplied and demanded change as price changes; the sentence loosely says supply and demand themselves change. Keyed choices also end in “leaving $64 destroyed,” which sounds unnatural.','For L-062: “For each $1 increase in price, quantity supplied rises by one unit and quantity demanded falls by one unit. A report describes the entire $368 loss of consumer surplus as deadweight loss. Which statement correctly separates transfers from deadweight loss?” In the key use “... and $112 is a gain in producer surplus, leaving $64 in deadweight loss.” Preserve each item’s numbers.')
W('W04','Recommended polish',[f'P62D-ITP-L-{n:03}' for n in range(61,80,2)],'Ledger and imports used as shorthand','A tariff is chosen to leave 24 imports. Which ledger follows ...?','“Leave 24 imports” omits units; “which ledger follows” sounds like an internal accounting instruction instead of a question.','“The government sets a tariff that reduces imports to 24 units. With the world price unchanged, which option correctly gives the tariff per unit, government revenue, and deadweight loss?” Adapt the import target for each item.')
W('W05','Recommended polish','P62D-ITP-LB-003 P62D-ITP-LB-006 P62D-ITP-LB-009 P62D-ITP-LB-018 P62D-ITP-LB-021 P62D-ITP-LB-024 P62D-ITP-LB-027 P62D-ITP-LB-036','Welfare ledger wording','Which complete import, revenue and distortion ledger is correct? / Which welfare ledger is correct?','The calculation is appropriate; “complete ... ledger” adds unnecessary accounting language.','“Which option correctly reports imports, tariff revenue, and the production and consumption losses?” Where total deadweight loss is listed, mention that total as well. Use “market for coffee beans,” “market for medical gloves,” etc., instead of plural nouns stacked before “market.”')
W('W06','Clear correction','P62D-ITP-EL-012','Reversed attribution wording','before crediting protection to infant-industry learning','The intended question is whether protection caused additional learning and justified its costs. The phrase reverses the attribution.','“What additional evidence is needed to show that protection encouraged learning and that the resulting benefits justified its costs?” Keep the comparison with unprotected firms and new machinery.')
W('W07','Recommended polish','P62D-ITP-EL-030 P62D-ITP-B3-041 P62D-ITP-L-096 P62D-ITP-L-100','Incomplete description of linear curves','unchanged and straight / straight domestic curves / straight curves','“Linear demand and supply curves” is the familiar economic description. The word “curves” should not be omitted when describing their shape.','Use “The domestic demand and supply curves are linear and remain unchanged.” Keep the unchanged world-price assumption wherever present.')
W('W08','Recommended polish','P75-TRADE-H-007 P75-TRADE-M-009 P52B-TRADE-EL-001','Reciprocal terminology foregrounded instead of the economic task','reciprocal costs of 1 Y / reciprocal opportunity cost / reciprocal-rate assessment','Reciprocals are the arithmetic method. The natural task is to calculate opportunity cost or evaluate the terms of trade in the requested units.','H-007: “What is each producer’s opportunity cost of one unit of Y, measured in units of X?” M-009: “What is the opportunity cost of one bowl, measured in mugs?” EL-001: “Express the offered exchange rate in signs per badge. Which producer should export badges, and would both gain?”')
W('W09','Recommended polish','P75-TRADE-H-010 P75-TRADE-L-007 P75-TRADE-L-014','Compressed strict-gains phrasing','strict mutual-gain rates / strict price range / which strict range is equivalent?','The strict inequalities matter, but the noun phrases are awkward. L-014 also uses count-like “1 cocoa” and “3 tea,” and does not identify what the range is equivalent to.','Ask for “the range of trading prices that makes both producers better off than producing the good themselves,” excluding break-even endpoints. For L-014 specify units of cocoa and tea and ask directly for the mutually beneficial range in units of cocoa per unit of tea. Preserve the shipping cost in L-007 and the reciprocal units.')
W('W10','Recommended polish','P52B-TRADE-LB-003 P62D-ITP-B3-052','Ledger metaphor in prose','Within the gross ledger / not included in the first ledger','The metaphor makes the welfare accounting harder to follow than naming the estimate.','LB-003: “Before adjustment costs, consumers gain $160 million and displaced workers lose $60 million.” B3-052: “These export losses are additional to the gains and losses already listed.” In LB-003’s key replace “feasible in this ledger” with “feasible under the stated estimates.” Preserve the distinction between domestic transfers and real costs.')
W('W11','Clear correction','P77-EPOL-MEDIUMB-027','Missing antecedent and awkward fairness phrase','They agree on effects but rank fairness differently. What differs?','A standalone question never identifies “they.” “Rank fairness” does not clearly describe the value disagreement.','“Two economists agree on a policy’s effects but place different weight on fairness when judging the policy. What explains their different recommendations?”')
W('W12','Recommended polish','P77-EPOL-M-007 P77-EPOL-R-039 P77-EPOL-BR-041','Telegraphic policy-analysis prompts','rank equity differently / Must economist disagreement be political? / What should advice report?','These are understandable but read like compressed notes.','M-007: “Two advisers agree on the predicted effects but place different weight on equity. What explains their disagreement?” R-039: “Must disagreement between economists reflect different political views?” BR-041: “A model’s conclusion depends on a particular assumption. What should an economist explain when using the model to advise policymakers?”')
W('W13','Optional style','P77-EPOL-EASYB-024','Vague uncertainty terminology','confidence range','This is less precise than “confidence interval,” but the item tests uncertainty rather than statistical interval construction.','“A forecast gives a range of possible effects rather than a single estimate. What does the range acknowledge?” Use “confidence interval” only if that statistical concept is intended and taught.')
W('W14','Recommended polish','ECON-MG-EQUILIBRIUM-PREDICTION-5008','Assessment-writing language inside the question','Which paired equilibrium prediction completes the reasoning?','The phrase describes the assessment design rather than asking the economics question directly.','“Demand shifts to the right while supply remains unchanged. What happens to equilibrium price and quantity?”')
W('W15','Recommended polish','P74-INC-EL-003 P74-INC-M-008','Compressed incentive language in stem and answer','limiting selection / poor-fit jobs / substitution into a different undesirable action','The concrete problem is providers choosing easy clients or drivers accepting unsuitable deliveries and canceling. The abstract phrasing obscures it.','EL-003: “Which redesign would reward successful placements without encouraging providers to avoid clients who need more support?” M-008: use “delivery requests they are unlikely to complete.” Key: “The reward encourages drivers to accept requests to improve their rating, then cancel them later.”')
W('W16','Optional style','P74-INC-M-010 P74-INC-L-021','Undefined decision margin','Which margin does the rule most directly target? / Which margin is most directly affected?','“Margin” is legitimate economics language, but here “decision” is clearer and loses none of the intended incentive analysis.','“Which decision does the rule most directly influence?” Retain the cancellation deadline and the twelve-month loyalty threshold.')
W('W17','Recommended polish','P73-MARG-H-007 P73-MARG-L-007','Unnatural airline phrasing','displaces cargo margin of $170 / next flight frequency','Both compress the actual action into business shorthand.','H-007: “Carrying the passenger means giving up $170 in net earnings from cargo.” L-007: “Adding one more flight would generate $80,000 in revenue...” Retain the operating costs and delay costs imposed on other flights.')
W('W18','Recommended polish','P73-MARG-L-006','Unexplained common scoring units','supplies costing 42 points / leaving staff in readiness','Supplies normally have money costs. A points-based comparison can work, but the common valuation scale and standby alternative should be explicit.','Introduce: “A hospital evaluates all benefits and costs using the same points scale.” Refer to “a 42-point supply cost” and “keeping staff available for emergencies, valued at 35 points.” Preserve 88, 42, 35, the 8-point saving, and the 12-point benefit reduction; do not silently convert the units to dollars.')
W('W19','Recommended polish','P52A-MARG-L-003','Unnatural marginal-analysis closing','The marginal social decision is:','Marginal social benefit and cost are standard terms; “the marginal social decision” is not a natural question.','“Taking all the listed benefits and costs into account, should the hospital add the test?” Preserve the inclusion of expected false-positive follow-up costs.')
W('W20','Recommended polish','P72-OPPC-L-010','Strict comparison expressed awkwardly','begin to set the opportunity cost strictly instead of B','The question concerns which alternative has greater net value. Expressing that directly preserves the strict inequality.','“For what values of x would C have a higher net value than B and therefore determine A’s opportunity cost?” Keep the tie at x = 15 distinct from x > 15.')
W('W21','Optional style','P75-TRADE-L-021 P77-PVN-LB-034','Vague evaluative closings','Which claim is safest? / Which assessment is exact?','These ask students to infer what “safest” or “exact” means.','Use “Which conclusion is supported?” and “Which statement correctly distinguishes the predictions from the board’s value judgment?” In TRADE-L-021’s key, “Both can gain through specialization without either producer specializing completely” is more natural than “without universal complete specialization.”')
W('W22','Recommended polish','ECON-MG-ELITE-318 ECON-MG-HARD-276 ECON-MG-HARD-277 ECON-MG-HARD-279','Dense tax-burden language','seller-burden rectangle / combined buyer- and seller-burden rectangle / tax burden per continuing unit','The distinction between tax payments and lost gains from trade is important, but the wording stacks several abstractions. ELITE-318 has no image, making “rectangle” especially unnecessary.','ELITE-318 and HARD-276: “On the units still sold after the tax, what is the sellers’ total loss from receiving a lower price? Exclude surplus lost on sales that no longer occur.” HARD-277: ask for “total tax revenue,” retaining the link to the combined burden if that is the objective. HARD-279: use “tax burden per unit still sold” and “total sales revenue after paying the tax.” Keep all welfare exclusions; do not replace the question with total producer-surplus loss.')

graphs=[]
def G(code,category,ids,reason,action):
    ids=ids.split()
    for i in ids:
        assert byid[i]['imagePath'],i
        assert not any(i in g['ids'] for g in graphs),i
    graphs.append(dict(code=code,category=category,ids=ids,reason=reason,action=action))

G('G01','Directly optional','40001 ECON-MG-MEDIUM-157 ECON-MG-LEGENDARY-9004','The first two stems already identify the bowed shape; the third states that opportunity cost rises and asks why. Increasing opportunity cost and resource suitability answer these questions without reading a plotted point.','Either keep as conceptual questions with optional illustrations, or remove the stated shape/direction and ask students to compare opportunity costs between labeled segments.')
G('G02','Directly optional','ECON-MG-LEGENDARY-9017 40008','9017 explicitly contrasts a move between demand curves with a move along one curve. 40008 already names a decrease in supply. Their keyed conceptual distinctions require no coordinates or visible geometry.','Ask which labeled movement is a shift, without naming it in the stem; alternatively retain the concept question and treat the graph as illustrative.')
G('G03','Directly optional','40002','The choices themselves say “along PPF0,” “on PPF0,” or “beyond PPF0.” Only the beyond-frontier choice requires greater capacity. No plotted location must be read.','Offer labeled points only, so the student must identify the point outside the frontier.')
G('G04','Directly optional','P62D-ITP-M-032 P62D-ITP-M-034','The stems explicitly disclose that the country imports or exports. In the intended competitive trade model, that already determines whether the world price is below or above the no-trade price.','Ask students to read the no-trade price and compare it with the world price, without disclosing the resulting trade direction.')
G('G05','Directly optional','PG1-EQ-L-001','The stem gives the $3 equilibrium and asks about $2 and $4. Standard shortage/surplus price adjustment identifies the key without the image.','Ask for the size of each imbalance, with plausible numerical distractors, or keep the qualitative question with an optional graph.')
G('G06','Directly optional','ECON-MG-FINALBOSS-4018','The stem gives both after-tax prices and quantity; statutory tax equivalence answers the question without the image. Indeed the qualitative no-change answer requires none of those numbers.','Retain as a conceptual tax-equivalence question without a required graph, or require students to read the prices and quantity and select among internally consistent numerical outcomes.')
G('G07','Directly optional','ECON-MG-LEGENDARY-9039','“Beyond the lower posted price” already describes an effective ceiling. The key asks only about nonprice rationing following excess demand; no plotted number is used.','If graph reasoning is intended, ask for the shortage or another graph-derived quantity before the rationing inference.')

G('G08','Answer-choice shortcut','40021 40027 ECON-MG-MEDIUM-171 ECON-MG-MEDIUM-175 PG2-CEIL-E-001 PG2-FLR-E-001','Only the key correctly combines a ceiling below equilibrium with binding status, or a floor above equilibrium with binding status. The other choices contradict the definition or misidentify a legal maximum/minimum. In 40021/40027 the stem additionally announces “binding.” The graph-specific distance or price relation can be accepted from the key without being verified.','Provide at least two logically valid policy/price explanations, such as “binding because below equilibrium” and “nonbinding because above equilibrium” for a ceiling. Use the graph to distinguish them; do not announce binding status when that is being tested.')
G('G09','Answer-choice shortcut','ECON-MG-HARD-261 ECON-MG-HARD-262 ECON-MG-MEDIUM-167','The determinant in each stem establishes the direction of demand change with supply fixed. Only the key describes that change; the other choices invoke the opposite demand change or a supply shift. The keyed P/Q labels need not be read.','Keep the stated determinant, but make at least two choices agree on the correct demand direction and differ in plotted starting or ending coordinates.')
G('G10','Answer-choice shortcut','ECON-MG-HARD-258 ECON-MG-HARD-259 ECON-MG-HARD-265','258 and 259 have only one choice with the correct general comparative-static prediction; the specific unchanged coordinate is bundled into it. In 265 only the key has the required price rise when demand rises and supply falls.','Give plausible alternatives with the same theoretically certain direction but different graph-specific outcomes for the ambiguous variable.')
G('G11','Answer-choice shortcut','PG1-DMD-EL-001 PG1-DMD-H-001 PG1-DMD-L-001','Only the key combines unchanged demand with quantity demanded rising when price falls. In L-001 the survey rules out a shift and one of the remaining alternatives violates the law of demand. Students need not calculate the 125-thousand change or 25-thousand rate.','Make competing choices agree on movement along demand and increasing quantity demanded, but offer different graph-derived magnitudes.')
G('G12','Answer-choice shortcut','PG1-DMD-M-001 PG1-SUP-M-001 PG1-SUP-M-005','Only one option describes a theoretically valid movement along the named curve; alternatives incorrectly call it a curve shift or reverse the law of demand/supply.','Include both valid directions of movement along the same curve, so A and B must be located on the graph.')
G('G13','Answer-choice shortcut','PG1-DMD-M-004 PG1-DMD-M-006','Only one option is a demand shifter: consumer income. The other choices concern own-price movements or producers. The student can choose income without seeing whether the demand curve moved left or right.','Offer both higher and lower consumer income, plus other plausible demand shifters, so the displayed direction matters.')
G('G14','Answer-choice shortcut','PG1-DMD-EL-003 PG1-DMD-L-003 PG1-SUP-EL-002 PG1-SUP-EL-003 PG1-SUP-H-001','Wrong choices confuse shifts and movements or give a quantity response opposite to the law of demand/supply. Only the key survives that conceptual check; its final quantity or slope can be selected without measurement.','Use alternatives that preserve the correct shift/movement distinction and price-response direction but differ in quantities, slopes, or how much the later movement offsets the shift.')
G('G15','Answer-choice shortcut','P62D-ITP-B3-054 P62D-ITP-H-015 P62D-ITP-L-099','B3-054 has only one choice treating domestic auction proceeds as a domestic gain without removing unchanged distortions. H-015 is answered by the general rule that government auctions of import rights generate revenue; rectangle R adds no tested numerical information. In L-099 the distractors deny the foreign rent transfer, call it destroyed world surplus, or explicitly double-count it.','For B3-054 and L-099 keep the same correct welfare logic in at least two options and vary graph-derived rent/loss amounts. H-015 can be a conceptual question, or can ask for both auction revenue and the remaining deadweight loss.')
G('G16','Answer-choice shortcut','40007 40010 40011 40014 40016','40007 offers only one valid determinant/shift relationship. 40010 offers only one valid demand-increase explanation consistent with unchanged production conditions. 40011 already asks about a demand shift along supply and only the key describes that. In 40014/40016 the stated determinants eliminate the other explanations before the endpoint values are checked.','Use economically coherent distractors and make their distinguishing features depend on labeled endpoints or the plotted sizes of changes.')
G('G17','Answer-choice shortcut','ECON-MG-LEGENDARY-9003 ECON-MG-MEDIUM-150 40004','9003 practically discloses that the first move raises output without a tradeoff; the alternatives confuse resource use, growth, and attainability. In MEDIUM-150, the distractors explicitly label an inside point efficient, treat greater output as proof of efficiency, or wrongly exclude frontier endpoints. In 40004, the alternatives incorrectly equate a frontier movement with capacity growth or a shift with unemployment.','Use choices with plausible point classifications or comparable explanations that differ in what the graph actually shows. For MEDIUM-150, lists of point labels would require inspection without the false explanatory cues.')
G('G18','Answer-choice shortcut','ECON-MG-LEGENDARY-9037 ECON-MG-LEGENDARY-9038','The options disclose the $30 equilibrium. Comparing the $50 ceiling or $10 floor with that supplied value identifies the key.','Remove the equilibrium value from the choices or give competing internally consistent numerical outcomes that must be checked against the graph.')
G('G19','Answer-choice shortcut','40038 40044 40047','40038 has only one internally correct elasticity/burden relationship. 40044 has only one defensible explanation of shared tax incidence; other options claim no wedge or automatic all-or-nothing burdens. 40047 has only one option consistent with both buyer remittance and the less-elastic side bearing more. The plotted burden split is not needed to select these keys.','Use at least two economically consistent burden/elasticity statements, one matching the graph and one not. Keep legal remittance the same across options where it is supplied in the stem.')
G('G20','Answer-choice shortcut','ECON-MG-HARD-278 ECON-MG-HARD-281 PG2-STX-EL-001','HARD-278’s other options use original quantity, the entire tax instead of the buyer share, or sellers’ receipts. HARD-281’s other explanations conflate legal incidence or full prices with burden. STX-EL-001 supplies $7.50 + $6 in the stem and the $10.50 reference price in every option; $13.50 including tax and a $3/$3 split follow without the graph.','Give multiple internally consistent calculations using plausible graph readings. For STX-EL-001, keep the pre-tax benchmark out of the options if students are meant to read it from the image.')

word_ids={i for w in words for i in w['ids']}
graph_ids={i for g in graphs for i in g['ids']}
graph_map={i:g for g in graphs for i in g['ids']}
direct={i for g in graphs if g['category']=='Directly optional' for i in g['ids']}
shortcut=graph_ids-direct
allgraph={r['id'] for r in rows if r['imagePath']}
source=root/'build/faculty-build-composer/data/composer_library.js'
source_hash=hashlib.sha256(source.read_bytes()).hexdigest()
baseline=json.loads((scratch/'baseline_hashes.json').read_text(encoding='utf-8'))
changed=[p for p,h in baseline.items() if not (root/p).exists() or hashlib.sha256((root/p).read_bytes()).hexdigest()!=h]
assert not changed,changed
assert len(rows)==len(byid)==1589
assert len(allgraph)==242
assert len(set(r['imagePath'] for r in rows if r['imagePath']))==49
summary=dict(records=1589,graph_records=242,image_paths=49,wording_groups=len(words),wording_records=len(word_ids),directly_optional_graph_records=len(direct),answer_choice_shortcut_records=len(shortcut),other_graph_records=len(allgraph-graph_ids),all_flagged_unique_records=len(word_ids|graph_ids),protected_files_checked=len(baseline),protected_files_changed=changed,canonical_sha256=source_hash)

coverage=[]
for r in rows:
    i=r['id']; g=graph_map.get(i)
    coverage.append(dict(id=i,stem_screened=True,wording_findings=[w['code'] for w in words if i in w['ids']],graph_status=g['category'] if g else ('No demonstrated graph-removal shortcut flagged' if r['imagePath'] else 'No image attached'),graph_finding=g['code'] if g else None,pools=r['pools']))
evidence=[]
for i in sorted(word_ids|graph_ids):
    r=byid[i]
    evidence.append(dict(id=i,stem=r['q']['q'],options=r['q']['options'],correct_option=r['key'],feedback=r['q'].get('feedback'),image=r['q'].get('image'),image_path=r['imagePath'],graph_required=r['q'].get('graphRequired'),pools=r['pools'],wording_findings=[w['code'] for w in words if i in w['ids']],graph_finding=graph_map[i]['code'] if i in graph_map else None))
payload=dict(date='2026-10-03',scope='Read-only editorial and graph-necessity audit; canonical Composer General Economics membership only',summary=summary,wording_findings=words,graph_findings=graphs,evidence=evidence,coverage=coverage)
(out/(base+'.json')).write_text(json.dumps(payload,ensure_ascii=False,indent=2)+'\n',encoding='utf-8')

def ids_text(ids): return ', '.join('`'+i+'`' for i in ids)
lines=[
'# General Economics wording and graph-necessity audit',
'',
'Reviewed October 3, 2026. **Read-only: no questions, answer keys, metadata, graphs, or existing faculty exports changed.**',
'',
'## Findings at a glance',
'',
'The bank contains clear editorial issues and graph questions that can be answered without reading their figures. The strongest concerns are repeated trade-policy wording, a few incomplete or compressed prompts, and answer choices that reveal the graph answer through conceptual elimination. These are editorial and assessment-design findings; awkward wording does not establish who or what wrote a question.',
'',
'| Review result | Count |',
'| --- | ---: |',
f'| General Economics question stems screened | {len(rows):,} |',
'| Graph-bearing questions: stems, choices, and resolved keys reviewed | 242 |',
'| Referenced image files visually inspected | 49 |',
f'| Wording finding groups / distinct affected records | {len(words)} / {len(word_ids)} |',
f'| Graph questions directly answerable from the stem and course concepts | {len(direct)} |',
f'| Additional graph questions answerable through choice-based shortcuts | {len(shortcut)} |',
f'| Other graph questions without a demonstrated shortcut flagged in this review | {len(allgraph-graph_ids)} |',
f'| Unique records with at least one wording or graph finding | {len(word_ids|graph_ids)} |',
'',
'Counts overlap between wording and graph findings. Repeated wording is grouped so a ten-question template problem is not presented as ten unrelated findings. “Other graph questions” is not a certification of flawless distractors or economic correctness.',
'',
'## Scope and review standard',
'',
'The source is `build/faculty-build-composer/data/composer_library.js`. Membership follows the existing faculty exporter and Composer course-area model, including stored pools, repair/bridge routes, and derived memberships. The 1,589 IDs are unique canonical General Economics records, not duplicate route appearances. Records with inherited ECON-MG or ECON-EC IDs were reviewed only where they belong to this canonical Composer bank; no polished-game bank was separately included.',
'',
'All stems were read. All 242 image-bearing records were read with their four choices and resolved key; their 49 referenced image files were inspected in contact sheets. Wording candidates were checked against their choices and feedback. A targeted text search supplemented the stem review across options and feedback; every option and feedback field on every non-graph record was not independently reread. This is not a new exhaustive answer-key, numerical, difficulty, routing, or publication audit.',
'',
'The graph test removes both the image and its equivalent accessible description. A student who uses an accurate text description of a graph is still using graph information; accessibility text is not treated as leakage. A graph is directly optional when the stem and ordinary course concepts supply the answer. A choice-based shortcut occurs when the correct choice can be selected without verifying its graph-specific claim, because the other choices contradict the stem or basic economics. Such a shortcut does not mean the image’s numbers can be independently calculated from the stem.',
'',
'## Wording findings and proposed revisions',
'',
'“Clear correction” identifies grammar, missing context, reversed wording, or a misleading expression. “Recommended polish” identifies a concrete readability improvement. “Optional style” is an instructor preference, not a defect that invalidates the question. Suggested text is for review and has not been applied.',
'']
for w in words:
    lines += [f"### {w['code']} — {w['title']} ({w['priority']})",'', '**IDs:** '+ids_text(w['ids']), '', '**Current wording:** '+w['quote'], '', '**Finding:** '+w['why'], '', '**Suggested direction:** '+w['suggestion'], '']
lines += ['## Graphs that the current question does not require','','The direct cases below can remain useful conceptual questions. If the intended objective is graph interpretation, revise the task to require information that the figure supplies. Do not delete a shared image asset merely because one question does not need it.','']
for g in graphs:
    if g['category']!='Directly optional': continue
    lines += [f"### {g['code']} — {g['category']}",'','**IDs:** '+ids_text(g['ids']),'','**Why the graph can be hidden:** '+g['reason'],'','**Recommended action:** '+g['action'],'']
lines += ['## Graph-specific content bypassed by the answer choices','','These questions often have a legitimate graph task underneath, but the choices let a student select the key without doing it. The preferred repair is usually to keep the graph and improve the distractors. A correct option containing a number or point label is not, by itself, evidence that reading the graph is necessary.','']
for g in graphs:
    if g['category']!='Answer-choice shortcut': continue
    lines += [f"### {g['code']} — {g['category']}",'','**IDs:** '+ids_text(g['ids']),'','**Demonstrated route around the graph:** '+g['reason'],'','**Recommended action:** '+g['action'],'']
lines += [
'## Useful graphs retained and limits of the findings','',
'Several superficially similar items do need their figures. Examples:',
'',
'- `PG1-DMD-H-002`: two options correctly name higher income but give different quantity changes; the plot distinguishes 75 thousand from 100 thousand.',
'- `ECON-MG-HARD-264`: several choices correctly predict increased quantity, but differ in price; the graph shows the unchanged-price case.',
'- `ECON-MG-MEDIUM-163`: two choices correctly describe falling price and rising quantity, but give different labeled endpoints; the graph identifies the applicable demand curve.',
'- `P62D-ITP-LB-009` and `P62D-ITP-LB-027`: the text gives enough to calculate tariff revenue, but the graph is still needed to distinguish the distortion-loss calculations. Do not remove their images just because some numbers are repeated in the stem.',
'- `P62D-ITP-B3-041`, `P62D-ITP-L-096`, and `P62D-ITP-L-100`: the plotted baseline and linear curves are needed for the counterfactual calculations.',
'- `PG2-STX-H-001` and `PG2-STX-L-001`: more than one option has sensible tax-equivalence logic; the plotted quantity distinguishes the numerical outcomes.',
'',
'Standard terms such as opportunity cost, marginal benefit, consumer surplus, comparative advantage, deadweight loss, elasticity, and ceteris paribus are not flagged merely because they are technical. Strict inequalities, unchanged-world-price assumptions, and exclusions of lost-trade surplus should remain wherever they are needed for the intended answer. The recommendation is to express the task naturally while preserving those distinctions.',
'',
'The prior instructor decisions, repair/bridge relationships, and difficulty assignments were not reopened. This audit identifies a different dimension of quality from a structurally correct bank or a resolved answer hash. No global rewrite or broad graph deletion is recommended.',
'',
'## Recommended order of work','',
'1. Correct the clear language problems first: W01–W03, W06, and W11. Read each corrected question with all four options to preserve the intended key.',
'2. Repair graph-choice shortcuts, prioritizing conceptual-only distractors paired with numerical or labeled answers. Hide the graph during review: at least two choices should remain plausible until its information is read.',
'3. Decide whether the directly optional images are instructional illustrations or whether those questions should assess graph interpretation. If retained as illustrations, do not count them as graph-required assessments.',
'4. Apply the remaining language polish selectively. Keep legitimate economic terminology and prior instructor-adjudicated assumptions.',
'',
'## Evidence and preservation','',
f'The companion `{base}.json` contains all finding groups, full current stems/options/keys/feedback for the {len(word_ids|graph_ids)} flagged records, source-pool paths, image references, and a coverage entry for all 1,589 IDs.',
'',
f'Canonical source SHA-256: `{source_hash}`.',
'',
f'A before/after SHA-256 comparison of {len(baseline):,} protected existing files found **zero changes**. The protected set includes the canonical source, Composer core/course-area model, existing faculty-export artifacts and audit files, and the referenced General Economics images. Only new audit/scratch artifacts were written. Exports were not regenerated and no application test suite was run for this read-only review.',
'']
(out/(base+'.md')).write_text('\n'.join(lines),encoding='utf-8')
print(json.dumps(summary,indent=2))
