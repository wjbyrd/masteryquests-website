# Faculty Learning-Outcome Guide and Wording Audit

## Executive Summary

**PASS.** Reviewed 222 existing records: all 220 public selectable outcomes plus two hidden technical records. Revised 47 public labels; retained 175 labels (173 public and two hidden); zero HUMAN REVIEW cases. No curricular restructuring or metadata correction was necessary.

The generated Learning Outcome Coverage guide is ready at `/how-to/learning-outcomes/`, with 147 public concepts and 220 outcomes. The existing active Composer suite remains **27/27 PASS**, matching the clean baseline. Guide validation and seven negative controls pass. 39 files added or modified, including this report and 26 evidence files; exact list below. **No deployment occurred.**

## Verb Audit

Every outcome was reviewed against its mapped skills and representative eligible selected-response questions. The complete internal audit includes course areas, concept IDs/names, outcome IDs, old/new labels, all mapped skills, sample question IDs/stems/options, task behaviors, recommended leading verb, decision, and rationale in `validation_artifacts/faculty_lo_guide/wording-audit.json`. The hidden records were reviewed as technical records and excluded from public guide entries.

Replacements remove prose-implying Explain/Describe wording, replace Construct/Derive where students use supplied graphs or schedules, and tighten vague Work with wording. Apply is used for economic rules; Interpret for supplied representations; Calculate for numeric results; Identify/Classify/Distinguish for recognition and separation; Analyze/Evaluate remain where actual multi-condition or policy evidence supports them. No blanket Explain-to-Identify substitution was used. Revised labels average 66.7 characters versus 83.4 before, with none over 95 characters. Some still occupy several lines in narrow Composer cards; visual checks confirm complete, readable text without clipping.

Counts by the revised label’s leading verb (mutually exclusive; compatible secondary verbs remain):

| Leading verb | Revised labels |
| --- | --- |
| Interpret | 5 |
| Identify | 11 |
| Determine | 2 |
| Apply | 6 |
| Use | 3 |
| Calculate | 5 |
| Trace | 3 |
| Classify | 2 |
| Analyze | 6 |
| Evaluate | 2 |
| Compare | 2 |

The source remains `audit_tools/faculty_lo/outcome-groups.cjs` plus the unchanged approved merges. Changes use its supported label override map. The established `build-policy.cjs` pipeline regenerated `data/faculty-outcomes.js`; generated labels were not hand-edited. Registry descriptions and internal skill names are unchanged.

## Representative Revisions

The following 14 concepts received additional review, including a higher-difficulty eligible item per outcome as well as the basic/type-varied samples. KEEP entries intentionally show the same old/new wording. Complete question evidence is in `deep-review.json`.

### Scarcity and Tradeoffs

The core slice identifies scarce resources and forgone alternatives in concrete cases. The policy slice asks students to weigh competing efficiency and distribution effects, so Evaluate remains appropriate there.

| Old label | New label | Actual assessed task |
| --- | --- | --- |
| Explain scarcity, tradeoffs, and opportunity cost | Identify scarcity, tradeoffs, and opportunity cost | P52A-SCAR-L-002: A government can increase disaster preparedness by diverting engineers from current infrastructure repairs. The preparedness program is highly valuable. What still follows? |
| Evaluate efficiency, equity, and policy tradeoffs | Evaluate efficiency, equity, and policy tradeoffs | ECON-MG-LEGENDARY-9051: A wage floor raises pay for workers who keep jobs but reduces entry-level openings. Which economic idea best frames the policy debate? |

### Demand

Apply fits price–quantity responses with other determinants held fixed; Distinguish fits diagnosing movements versus shifts. Analyze is retained for related-good and competing-shifter cases rather than reducing them to identification.

| Old label | New label | Actual assessed task |
| --- | --- | --- |
| Explain the law of demand and distinguish movements from shifts | Apply the law of demand and distinguish movements from shifts | ECON-MG-LEGENDARY-9023: The price of tablets falls, and consumers buy more tablets. No non-price determinant changed. What happened? |
| Analyze income effects, substitutes, and complements | Analyze income effects, substitutes, and complements | ECON-MG-HARD-216: A consumer's income rises, and meal delivery is a normal good. At every price, consumers now want more meal delivery. What happened? |
| Analyze demand shifters and combined market effects | Analyze demand shifters and combined market effects | P52B-S3-DEM-L-001: Coffee is a normal good. Consumer income rises, buyers expect coffee prices to fall next month, and the current price of tea, a substitute, rises. What can be concluded about current coffee demand? |

### Supply

Apply and Distinguish match the chosen price response and the diagnosis of a movement. The second outcome retains Analyze because students aggregate sellers and reason across cost, technology, and timing changes.

| Old label | New label | Actual assessed task |
| --- | --- | --- |
| Explain the law of supply and distinguish movements from shifts | Apply the law of supply and distinguish movements from shifts | PG1-SUP-L-001: Refer to the graph. A producer says the move from A to B proves that supply increased by 125 thousand units. What is the correct diagnosis? |
| Analyze supply shifters, aggregation, and combined market effects | Analyze supply shifters, aggregation, and combined market effects | P52B-S2-SUP-L-001: At $30, three sellers offer 12, 18, and 25 units; at $35 they offer 16, 24, and 30 units. Calculate both market quantities and infer what the comparison represents. |

### Market Equilibrium

Determine covers locating or computing an intersection. Predict describes selecting the shortage/surplus adjustment. Simultaneous-shift cases still warrant Analyze because general ambiguity must be separated from a particular graph.

| Old label | New label | Actual assessed task |
| --- | --- | --- |
| Determine equilibrium and explain shortage and surplus adjustment | Determine equilibrium and predict shortage and surplus adjustment | ECON-MG-LEGENDARY-9028: A market price is above equilibrium. What pressure does the market create and why? |
| Predict equilibrium effects of demand or supply changes | Predict equilibrium effects of demand or supply changes | ECON-MG-LEGENDARY-9015: Refer to the graph. Tastes shift demand from D1 to D2 while supply remains S1. Which explanation uses both intersections to distinguish the demand shift from the market's movement along supply? |
| Analyze simultaneous demand and supply changes | Analyze simultaneous demand and supply changes | ECON-MG-LEGENDARY-9019: Refer to the graph. Demand and supply both increase from D1/S1 to D2/S2. What does economic theory predict in general, and what does this particular graph show? |

### Consumer Choice

Students read supplied budget lines and calculate feasible bundles rather than draw a constraint. They interpret curve ranks and ordinal utility; optimal-choice questions require marginal comparisons, so that Analyze label is retained.

| Old label | New label | Actual assessed task |
| --- | --- | --- |
| Construct budget constraints and identify affordable bundles | Interpret budget constraints and calculate affordable bundles | 42581: Refer to the graph above. What is maximum yogurt after income falls? |
| Analyze how changing budgets affect optimal consumer choices | Analyze how changing budgets affect optimal consumer choices | 42701: In hypothetical consumer-choice case C, an affordable interior bundle has MRS greater than Px/Py. Which move can raise utility? |
| Explain preferences, indifference curves, and ordinal utility | Interpret preferences, indifference curves, and ordinal utility | 42647: In hypothetical consumer-choice case G, bundle D contains at least as much of both desirable goods as bundle E and more of one. Under more-is-better, how are they ranked? |

### Monopoly

Students identify monopoly conditions and distinguish entry barriers from offered cases. The other labels remain: numerical revenue decisions, policy/welfare comparisons, and profit/shutdown diagnoses are actually assessed.

| Old label | New label | Actual assessed task |
| --- | --- | --- |
| Explain monopoly power and barriers to entry | Identify monopoly power and distinguish barriers to entry | P62G-MON-H-025: Which statement best describes the natural-monopoly policy problem? |
| Use demand and revenue to choose output and price | Use demand and revenue to choose output and price | P62G-MON-L-001: Mesa Water faces demand P=100−2Q. At Q=15, what are price and marginal revenue? |
| Evaluate monopoly regulation and price discrimination | Evaluate monopoly regulation and price discrimination | P62G-MON-L-045: Suppose Aurora Port spends $125 lobbying to preserve its exclusive franchise. How should that spending enter welfare analysis? |
| Compare monopoly and competitive welfare | Compare monopoly and competitive welfare | P62G-MON-L-043: Aurora Port would produce Qc=36.36 under the P=MC benchmark but chooses Qm=19.05 as a monopoly. Which units generate the standard DWL? |
| Analyze monopoly profit, loss, and shutdown | Analyze monopoly profit, loss, and shutdown | P62G-MON-L-020: At Summit Utility’s optimum, Q=20.71, P=$66.59, ATC=$36.11, and AVC=$22.59. What is the correct short-run result? |

### Real versus Nominal GDP

KEEP. Distinguish and Calculate already match base-year/current-price comparisons, real-output calculations, and deflator reconciliation. No more sophisticated verb is needed.

| Old label | New label | Actual assessed task |
| --- | --- | --- |
| Distinguish nominal and real GDP and calculate the GDP deflator. | Distinguish nominal and real GDP and calculate the GDP deflator. | ECON-NL-LEGENDARY-9005: A country’s nominal GDP is $468 billion and its deflator is 130. Next year real GDP rises 10%, but nominal GDP is $475.2 billion. Which new deflator and interpretation reconcile these facts? |

### Unemployment Measurement

KEEP. Classify matches search/availability and employment status; Calculate matches unemployment and participation rates after several labor-force transitions.

| Old label | New label | Actual assessed task |
| --- | --- | --- |
| Classify labor-force status and calculate unemployment and participation rates. | Classify labor-force status and calculate unemployment and participation rates. | ECON-NL-LEGENDARY-9067: A labor survey starts with 132 employed, 12 unemployed and 56 other adults. Then 4 unemployed find jobs, 3 stop searching, 5 outsiders start searching without finding work, and 2 employed retire. All job seekers are available. What are the new unemployment and participation rates? |

### Quantity Theory of Money

KEEP. Apply and Interpret cover the quantity equation, inverse money value, and graph adjustment. Connect covers reasoning across money, velocity, output, and inflation, including exact multiplicative changes.

| Old label | New label | Actual assessed task |
| --- | --- | --- |
| Apply the quantity equation and interpret money-market adjustment | Apply the quantity equation and interpret money-market adjustment | LG-Q-9025: Money supply shifts from MS1 to MS2. If the value of money falls from 1/2 to 1/4, which price-level change and interpretation are correct? |
| Connect money growth, output growth, velocity, and inflation | Connect money growth, output growth, velocity, and inflation | LG-Q-9031: An economy plans for real output to grow 4 percent and the price level to grow 2 percent over one year. A payments change is expected to reduce velocity by 3 percent. Using the exact multiplicative quantity equation, approximately what money-growth rate meets both targets, and why would simply adding 2 and 4 be insufficient? |

### Monetary-Policy Transmission

KEEP. Trace accurately describes the chain from money supply through interest and investment to aggregate demand, including multiplier calculations. Students select the correct chain/effect rather than write an explanation.

| Old label | New label | Actual assessed task |
| --- | --- | --- |
| Trace monetary policy through interest rates, investment, aggregate demand, and output. | Trace monetary policy through interest rates, investment, aggregate demand, and output. | LG-Q-9053: Refer to the graph. The Fed moves the money supply from MS1 to MS2. If the resulting investment change is $60 billion and MPC = 0.75, what is the correct full effect on AD? |

### AD-AS Equilibrium and Output Gaps

Interpret is more direct than Read for selecting a graph diagnosis; Distinguish retains gap classification relative to potential output. No new dynamic-policy territory is added.

| Old label | New label | Actual assessed task |
| --- | --- | --- |
| Read static AD-AS equilibrium and distinguish recessionary and inflationary gaps relative to potential output. | Interpret AD-AS equilibrium and distinguish recessionary and inflationary output gaps | PG3-MEQ-L-002: A student says point B can only be explained by higher aggregate demand because real GDP is larger there. Which correction best fits the graph? |

### Capital Flows and Net Capital Outflow

KEEP. The first outcome requires asset-flow classification and net-flow arithmetic. The second traces competing interest and risk forces; advanced questions require separating observed NCO changes from a causal interest-rate effect.

| Old label | New label | Actual assessed task |
| --- | --- | --- |
| Classify asset transactions and calculate net capital outflow | Classify asset transactions and calculate net capital outflow | PMOE-NCO-L-001: Residents initially buy $220 billion abroad and foreigners buy $260 billion domestically. Resident purchases later rise 25 percent. What range of growth in foreign purchases would leave a net inflow that is smaller than the initial net inflow? |
| Trace interest rates, risk, and capital flight into investment flows | Trace interest rates, risk, and capital flight into investment flows | PMOE-NCO-L-002: Domestic real returns rise while perceived domestic political risk also rises. An analyst observes that NCO increased and concludes that higher interest rates caused capital flight. Holding other determinants fixed, which inference separates the observed change from the interest-rate effect? |

### Tariffs, Revenue & Deadweight Loss

KEEP. Analyze covers distinguishing revenue transfers from true welfare loss. Trace fits following a tariff through domestic prices, production, consumption, and imports.

| Old label | New label | Actual assessed task |
| --- | --- | --- |
| Analyze tariff revenue, surplus, and deadweight loss | Analyze tariff revenue, surplus, and deadweight loss | P62D-ITP-L-062: In Arden, a small-country tariff cuts imports from 40 to 24. Straight domestic supply and demand each change by one unit for every $1 price change. A report calls all $368 of consumer loss deadweight loss. What is the correct correction? |
| Trace tariffs into domestic prices and traded quantities | Trace tariffs into domestic prices and traded quantities | P62D-ITP-L-095: Which welfare package correctly describes the tariff in the displayed trade graph relative to free trade? |

### Competitive Markets

KEEP; explicitly reviewed as the additional single-outcome concept. Questions identify price-taking conditions and distinguish effective competition from seller count when switching costs differ. One coherent outcome is appropriate; all three presets remain identical.

| Old label | New label | Actual assessed task |
| --- | --- | --- |
| Identify competitive markets and price-taking behavior. | Identify competitive markets and price-taking behavior. | P52B-COMP-L-001: Two exchanges each list hundreds of sellers of standardized grain. On X, buyers can immediately compare prices and switch suppliers. On Y, contracts impose large switching charges. Which claim best separates seller count from effective competition? |

## Mapping Integrity

**ZERO changes** to outcome IDs, concept associations, skill mappings, outcome-level preset tags, or Brief/Standard/Full membership. A deep comparison of the complete policy objects, excluding only labels and their derived policy hash, is identical across all 149 concepts and 222 outcomes. Coverage metadata, hidden flags, warnings, and unmapped IDs are also identical.

Actual composition snapshots before and after match across **716 combinations**: every Brief/Standard/Full preset, every individual outcome selected as Custom, and an alternating-outcome Custom combination for each multi-outcome concept. Sorted ordinary/checkpoint bank, repair, and bridge question-ID sets have identical hashes. The 536-combination Faculty LO validator also passes.

4774 baseline tracked files were checked by SHA-256: only the five expected existing files changed; all 4769 other tracked files are byte-identical. This includes question libraries, registry, approved merges, engines, adaptive logic, mode definitions, telemetry, resource sheets, and runtime templates. Recipe schema remains 1.6.0 and library SHA-256 remains `530ce41689bf83126ccde2d7d0fd236ca0c34761042455323ce7d3f99e97bbab`.

The derived faculty-policy hash changes because it includes display labels. Existing recipe/fingerprint logic therefore sees the new policy version when generating future packages; that existing behavior was not changed. Previously generated games remain untouched.

## Faculty Guide

Public path: `/how-to/learning-outcomes/`. The page explains Concept → Learning outcomes → Question coverage, broad subskill groupings, the intentional single-outcome design, and Brief/Standard/Full/Custom semantics. Newly selected UI concepts start at Standard; matching manual combinations can display a preset name. Standard and Full can coincide.

Current navigation taxonomy determines General Economics/shared foundations (22 entries), Microeconomics (68), and Macroeconomics (57). Each concept appears once under its primary discipline and lists all actual eligible course areas. Shared-foundation links preserve cross-area discoverability. Alphabetical concepts use native details/summary disclosures. Search matches concepts, outcome labels, and area text, announces result counts, and restores unfiltered content when cleared or using area anchors.

Discoverability: Faculty Resources landing-page card and jump link; natural link in the existing Composer quick-start documentation; small help link beside Composer concept selection, opening the guide in a labeled new tab to preserve work in progress. Existing navigation remains intact.

`build-guide.cjs` derives both static HTML and coverage JSON from the generated Composer policy and current registry/course-area model. `guide-template.html` holds explanatory copy, not duplicated labels. The guide works without JavaScript; search progressively enhances the fully generated content.

Maintenance commands from the repository root:

```powershell
node audit_tools/faculty_lo/build-policy.cjs
node audit_tools/faculty_lo/build-guide.cjs
node audit_tools/faculty_lo/validate-guide.cjs
```

Set `MQ_LO_OUTPUT_DIR` to stage the policy together with its detailed audit output when desired. Guide generation supports `MQ_LO_GUIDE_OUTPUT_DIR`; `--check` verifies deterministic output. `MQ_LO_REPO_ROOT` supports an alternate repository root. The new guide validator is standalone; the existing active-suite denominator remains 27.

## Guide Coverage

| Check | Result |
| --- | --- |
| Canonical concepts, including technical records | 149 |
| Current public selectable concepts / documented | 147 / 147 |
| Total outcomes, including technical records | 222 |
| Current public outcomes / documented | 220 / 220 |
| Hidden technical outcomes published | 0 |
| Missing concepts or outcomes | 0 |
| Stale entries | 0 |
| Duplicate outcome IDs | 0 |
| Label mismatches | 0 |

`validate-guide.cjs` independently compares the current public concept set, names, areas, outcome IDs/labels, and presets with generated JSON and the actual rendered HTML entries. It also checks both generators for drift. Negative controls prove rejection of a missing concept, missing outcome, stale outcome, duplicate outcome, changed label, hidden concept, and stale rendered label: **7/7 rejected**.

## Regression

| Validation | Result |
| --- | --- |
| Clean baseline active suite | 27/27 PASS |
| Final active suite | 27/27 PASS |
| Faculty LO validation, separately rerun | 193,775 assertions; 149 concepts; 222 outcomes; 536 combinations; PASS |
| Content-scope validation, separately rerun | 31,269 assertions; 148 instructional concepts; 13 presets; 10 modes; PASS |
| Generated package/runtime telemetry smoke, separately rerun | PASS |
| Public guide drift + deterministic generation | PASS; 7 negative controls; 2 generation checks |
| Before/after question eligibility | 716/716 identical |
| Protected tracked files | No unexpected changes |

Runner output is retained in the evidence directory. No existing runner or test expectation was weakened or changed.

## Browser / Accessibility QA

Local HTTP preview tested in headless Microsoft Edge via Playwright at 1440×1000 and 390×1000, with an additional no-JavaScript 390×844 check. Saved screenshots were visually inspected. Both the guide and Composer show complete revised labels, multi-outcome Consumer Choice and single-outcome AD-AS coverage; all three presets and Custom were exercised. Consumer Choice counts were Brief 1, Standard 3, Full 3, Custom 2. AD-AS retained one selected outcome across every preset.

Guide search, no-results message, clear/reset, and area navigation pass. Native disclosures toggle with Enter, checkboxes with Space, and clear-search with Enter; focus is visible and search regains focus after clearing. Native details/summary provides expanded state semantics without redundant scripted ARIA. Search status uses a polite live region. Headings, field labels, and link names are semantic and readable. Area headings remain below the sticky header after anchor navigation.

Both pages have zero horizontal overflow at both widths, including all guide disclosures open. New guide text/background and focus color pairs exceed 4.5:1 contrast. No page JavaScript errors occurred. No-JavaScript checks confirm all 147 concepts remain present and outcomes open with native disclosures; the unavailable search controls stay hidden. This was targeted browser/accessibility QA, not a full screen-reader certification. See `browser-qa.json`, `final-accessibility.json`, and screenshots.

## Files Changed

Exact repository-relative list (39 files):

- `FINAL_REPORT_faculty_lo_guide.md`
- `assets/css/learning-outcomes.css`
- `assets/js/learning-outcomes.js`
- `audit_tools/faculty_lo/build-guide.cjs`
- `audit_tools/faculty_lo/guide-template.html`
- `audit_tools/faculty_lo/outcome-groups.cjs`
- `audit_tools/faculty_lo/validate-guide.cjs`
- `build/faculty-build-composer/data/faculty-outcomes.js`
- `build/faculty-build-composer/index.html`
- `how-to/composer/index.html`
- `how-to/index.html`
- `how-to/learning-outcomes/coverage.json`
- `how-to/learning-outcomes/index.html`
- `validation_artifacts/faculty_lo_guide/baseline-suite.txt`
- `validation_artifacts/faculty_lo_guide/browser-qa.json`
- `validation_artifacts/faculty_lo_guide/composer-1440-label-card.png`
- `validation_artifacts/faculty_lo_guide/composer-1440-single.png`
- `validation_artifacts/faculty_lo_guide/composer-390-label-card.png`
- `validation_artifacts/faculty_lo_guide/composer-390-single.png`
- `validation_artifacts/faculty_lo_guide/deep-review.json`
- `validation_artifacts/faculty_lo_guide/eligibility-after.json`
- `validation_artifacts/faculty_lo_guide/eligibility-before.json`
- `validation_artifacts/faculty_lo_guide/final-accessibility.json`
- `validation_artifacts/faculty_lo_guide/final-suite.txt`
- `validation_artifacts/faculty_lo_guide/guide-1440-outcomes.png`
- `validation_artifacts/faculty_lo_guide/guide-1440-search.png`
- `validation_artifacts/faculty_lo_guide/guide-1440-top.png`
- `validation_artifacts/faculty_lo_guide/guide-390-outcomes.png`
- `validation_artifacts/faculty_lo_guide/guide-390-search.png`
- `validation_artifacts/faculty_lo_guide/guide-390-top.png`
- `validation_artifacts/faculty_lo_guide/mapping-integrity.json`
- `validation_artifacts/faculty_lo_guide/policy-before.json`
- `validation_artifacts/faculty_lo_guide/protected-files.json`
- `validation_artifacts/faculty_lo_guide/run_content_scope_validation.js.txt`
- `validation_artifacts/faculty_lo_guide/run_faculty_outcome_validation.js.txt`
- `validation_artifacts/faculty_lo_guide/run_generated_telemetry_smoke.js.txt`
- `validation_artifacts/faculty_lo_guide/targeted-checks.json`
- `validation_artifacts/faculty_lo_guide/validate-guide.cjs.txt`
- `validation_artifacts/faculty_lo_guide/wording-audit.json`

## Deployment

**Not deployed.** No production publishing, commit, or push occurred. All work is local and reviewable.

## Final Verdict

**PASS.** Assessment-aligned labels and a synchronized public faculty guide are complete, with unchanged curricular mappings and question eligibility and a fully green Composer suite.

