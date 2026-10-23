# Faculty Resources Audit and Cleanup

October 22, 2026. Repository: `wjbyrd/masteryquests-website`. Branch: `faculty-resources-cleanup`.

## A. Executive summary

Faculty Resources now distinguishes guidance for choosing assignments and interpreting results from references for particular game families. The main issue was scope: a Managerial field dictionary appeared among general resources, and the LMS guide directed Composer users to it without explaining the schema difference. The dictionary was already accurate about its Managerial focus inside the document; replacing that focus with a platform-wide claim would have made it less accurate.

The page now calls it **Managerial Telemetry Data Dictionary**, retains its existing URL and all 88 field definitions, and links separately to short assignment/results guidance. Cards identify the supported collections or Composer workflow. Practice-mode, Mastery Report, and portable-game explanations are qualified so they do not imply that simulations and RPG-style decision experiences use the same instructional model. The linked Class Answer Analysis introduction now identifies compatible question-response exports and distinguishes them from simulation trial tables and journey JSON.

Downloads retains every functional resource. Its teaching-guide descriptions now identify practice-game scope, and ten generic Download buttons have resource-specific accessible names including file formats. A keyboard accessibility issue discovered in the LMS guide's horizontally scrolling iframe example was fixed with a focusable, named region. No new styling, imagery, navigation system, or download was introduced.

### Verified baseline

- Initial branch: `accessibility-preview`, HEAD `6bd0facf16439c8e7e4a1f97ba7a2d656b2ad0a9`.
- Initial working tree: no tracked edits; unrelated untracked `FEEDBACK_ACCESSIBILITY_LIFECYCLE_AUDIT.md` retained.
- Fetched `origin`; remote `main` advanced from `5e1d5644` to `b40dd3ba930ec637d47742e3060db03a138dbd81`.
- GitHub confirms [PR #2, Accessibility Improvements and Standard Campaign Restoration](https://github.com/wjbyrd/masteryquests-website/pull/2), is merged. Both accessibility commit `90f12687` and Standard Campaign restoration `2125c364` are ancestors of that remote main.
- Created the requested branch from `origin/main`. Local `main` was not switched to or modified. No push, merge, or deployment was performed.
- Authoritative page: `how-to/index.html`; the publication builder copies it to `dist/how-to/index.html`.
- Remote main is the source baseline, not proof of current production. Direct HTTP retrieval of the live page returned 403. The web reader returned an older indexed version with an 87-field description and draft-guide links absent from current remote main. That cached result is not treated as current production evidence or used to restore retired links.

## B. Resource inventory

Classification: **A** correctly specific; **B** unnecessarily specific; **C** too general; **D** historical context. Mixed cases identify the distinction. “Accurate” below describes the reviewed destination and final description, not a claim that every feature applies everywhere.

### Main page and linked guides

| Display title / section | Destination | Intended audience and actual scope | Accuracy and changes |
| --- | --- | --- | --- |
| Assign activities and read results | `/how-to/#game-data` | Instructors selecting any activity; evidence requirements depend on its controls | New short general guidance, not a new dictionary. Separates task completion, deliberate submission, available exports, and interpretation limits. |
| Class Answer Analysis | `/tools/answer-analysis/` | Instructors combining supported question-response CSVs from the four practice collections and Composer | C corrected. Main card and tool introduction identify supported families and missing-snapshot limits; analysis functionality unchanged. |
| Faculty Pedagogy Guide | `/how-to/pedagogy/` | Instructors; creator's experience with the four main collections plus Composer suggestions | D retained. Card clarifies provenance. First-person teaching history, acknowledgement, and cautions remain intact. No claims of causal learning gains added. |
| Request Faculty Question Banks | `/how-to/question-banks/` | Verified faculty requesting General Economics, Microeconomics, Macroeconomics Composer banks | A accurate; retained. Private manual review and email delivery, not a public bank download. No email sent and no form submitted. |
| Learning Outcome Coverage | `/how-to/learning-outcomes/` | Instructors planning the three Composer course areas | A clarified in card. Outcomes are available coverage, not guaranteed sampling in a short run. Generated guide and policies unchanged; generator mismatch recorded below. |
| Managerial Telemetry Data Dictionary | `/how-to/telemetry-data-dictionary/` | Instructors interpreting local Managerial Intelligence Directorate CSVs | A/C corrected at entry points. Title/H1, introduction, main-card and related link labels now agree on Managerial scope. Retains version comparison for other formats. |
| Faculty Build Composer guide | `/how-to/composer/` | Faculty building practice games from General Economics, Microeconomics and Macroeconomics | A accurate. Main card states those course areas. Seven-step guide already matches current UI; unchanged. |
| Using Mastery Quests in your LMS | `/how-to/canvas/` | Faculty hosting Composer-generated HTML games | C corrected. Main card clarifies workflow; evidence paragraph points to general results guidance and export comparison. Scrollable iframe example is keyboard focusable and named. |
| Practice modes and mastery evidence | `/how-to/#adaptive-engine` | Instructors using supported question-based practice modes | C corrected. Scope expressly excludes assumptions about RPG decision and simulation rules. Existing mode table, numerical thresholds, and rules unchanged. |
| Mastery Reports | `/how-to/#mastery-reports` | Instructors using practice games that provide this report | C corrected. Opening states this condition. CSV link is labeled Managerial; other users get general guidance. Completion and performance distinctions retained. |
| Answer-key hardening | `/how-to/#answer-hardening` | Faculty publishing Composer-generated practice games | C corrected. Opening identifies Composer rather than implying every Mastery Quests activity uses this portable architecture. Existing limitations retained. |
| Prepare the file / Create the repository / Turn on Pages / Add it to your LMS | `/how-to/#prepare`, `#repository`, `#pages`, `#lms` | Faculty publishing a generated game HTML file | A accurate; instructions and anchors retained. Four external GitHub images checked. These steps do not require instructors to republish an existing hosted collection. |
| Teaching guides and authoring downloads | `/resources/#faculty-guides` | Faculty using practice games or authoring their own questions | Added a card to an existing destination. Specific resources inventoried below. |
| Responsible Telemetry Use | `/how-to/responsible-telemetry-use/` | Faculty interpreting available interaction records and handling submitted files | C corrected. Added field-availability caveat and separated Managerial definitions from general interpretation guidance. Collection/custody policies unchanged. |
| A report example / See It in Action | `/evidence/#mastery`, `/evidence/` | Faculty inspecting demonstration reports and workflow | D accurate; retained. Page qualifies screenshots and sample CSV as demonstrations, not evidence of learning improvement. |
| Build a Quest | `/build/` | Faculty selecting Composer, manual authoring, validation, or deployment workflows | A accurate overall; retained. Manual authoring supports other subjects within the practice engine; it is not a universal simulation builder. Minor old term in an email draft noted below. |
| Latest Mastery Quests Updates | `/about/updates/` | Faculty reviewing dated changes | D retained. No historical development claims rewritten. |

Shared navigation destinations (`/`, `/games/`, `/evidence/`, `/build/`, `/how-to/`, `/about/`, `/resources/`, `/about/subscribe/`, `/privacy/`, `/about/updates/`) were included in link checks. Header/footer markup, menu behavior, and shared styles/scripts remain unchanged.

### Downloads and immediate authoring resources

Paths below are under `/downloads/resources/` unless stated otherwise. Existing binaries were inspected for content/scope and archive integrity where applicable; none was rewritten or regenerated. This was not a new visual-layout audit of the Word or Excel files.

| Display title | Destination | Audience and scope | Accuracy and changes |
| --- | --- | --- | --- |
| Composer + LMS Quick Start | `faculty-composer-quick-start-guide.docx` | Faculty using the economics Composer and HTTPS/LMS workflow | A accurate; retained; descriptive download name added. |
| Faculty Game Overview | `faculty-game-overview-guide.docx` | Faculty using the Composer practice model, ten modes and Mastery Reports | C card narrowed to that model. Document already introduces Composer architecture; retained. |
| Faculty Implementation Guide | `faculty-implementation-guide.docx` | Faculty planning and launching Composer practice assignments | C card clarified. Guide itself follows Composer workflow; retained. |
| Student Instructions + Faculty Launch Checklist | `student-instructions-and-faculty-customization-checklist.docx` | Faculty adapting directions for supported practice modes; students receive adapted Part I | C card clarified: preview the assigned game and adapt directions. No promise that its ten-mode instructions fit simulations. |
| Blank Faculty Template | `mastery-quests-faculty-template.html` | Advanced faculty writing their own subject questions for the maintained practice engine | A accurate; asset-free, empty question banks, supported modes contingent on content. Resource-specific download name added. |
| Manual authoring guide | `manual-faculty-guide.html` | Advanced faculty configuring that template and validating question packages | A accurate; retained. Custom objectives do not automatically receive Composer Concept Review integration. |
| Working starter game | `mastery-quests-faculty-starter.html` | Faculty testing authoring workflow with synthetic examples | A accurate; retained as demonstration, not ready course content. |
| Example Question Generation Prompt | `example-question-generation-prompt.docx` | Faculty drafting manual practice-engine JSON banks for their subject | A accurate; retained. Includes faculty review and validator steps; no Managerial-only restriction. |
| Example Question Architecture | `example-question-architecture.docx` | Manual-template authors checking fields, assets and adaptive routing | A accurate; retained. Examples are technical schema guidance, not universal game formats. |
| Faculty Question Bank Helper | `faculty-question-bank-helper.docx` | Manual-template authors | A accurate; retained. No unnecessary Managerial references found. |
| Question Drafting Workbook | `faculty-question-bank-validator.xlsx` | Faculty drafting rows for the browser validator | A accurate; retained. Five sheets inspected: Question_Bank, Lists, Validator_Summary, Examples, Instructions. Not represented as automatically validating instructional quality. |
| Validate questions | `/tools/question-bank-validator/` | Faculty checking manual question structure and supported-mode readiness | A accurate; destination exists in source and build. Functionality unchanged. |
| Example / blank question package | `faculty-question-package-example.json`, `faculty-question-package-blank.json` | Manual authors following the authoring guide | A retained; actual files and guide links verified. |
| Multi-Game Hub Template | `mastery-quests-multi-game-hub-template.html` | Faculty organizing links to several games | B/general resource already collection-neutral; retained. Descriptive download name added. |
| The Market Gate Starter Asset Pack | `/downloads/faculty-assets/mastery-quests-market-gate-starter-asset-pack.zip` | Faculty reusing the permitted Market Gate media in their own Mastery Quests games | A retained. ZIP has 20 images and eight audio files, matching the card; does not include engine/banks/reviews. |
| Download Sample CSV | `/downloads/evidence/mastery-quests-sample-unlimited-results.csv` | Faculty inspecting a historical demonstration run | D retained. Verified 41 columns and 34 event rows; not promoted as the current schema or real class evidence. |

The main page does not directly link a PDF or Word download; these are reached through its linked guides and Downloads. Private question-bank PDF/CSV files remain request-only. Draft game-specific Word guides and the retired quiz converter are already excluded by the current publication builder; they were not restored or deleted by this task.

### Export and dictionary findings

| Implementation | Download and schema | Verification / interpretation |
| --- | --- | --- |
| Managerial Intelligence Directorate: all four public games; corresponding classroom and telemetry-POC copies | Local Download Game Data, **88 columns** | Existing checker evaluates each game's base array plus the actual adapter installer: 12 exports match all dictionary fields. |
| Economic Realm: all five maintained game routes | Local Download Game Data, **117 columns** | Extracted actual TELEMETRY_COLUMNS arrays. |
| Macro Command System: all four maintained game routes | Local Download Game Data, **117 columns** | Extracted actual TELEMETRY_COLUMNS arrays. |
| Composer template | Local Download Game Data, **117 columns** | Actual template array is identical, including ordering, to all nine Economic Realm/Macro arrays. This is shared structure, not a promise of equal populated values. |
| Micro Domains: Labyrinth of Choice | Local Download Game Data, **70 columns** | Actual playable game's array; do not extend this claim to unreleased worlds. |
| Takeout Taco: Counting the Cost, instructor preview | Trial CSV, **15 columns** | `audit_tools/econ_rpg/game/games/takeout-taco-counting-the-cost/app.js` explicitly serializes trial, staffing, output and cost fields. Not a Managerial export. |
| The Road Ahead, instructor preview | Journey **JSON** | `audit_tools/econ_rpg/game/games/the-road-ahead/app.js` exports character, decisions/history, telemetry and review. Not a question-response CSV. |
| Other decision experiences, simulations, Growth Realms preview and Econ-nections | Activity-specific results; no shared Download Game Data contract established | Source review found no basis to promise the Managerial schema or universal CSV availability. Public page directs faculty to preview each activity. Preview-only games are not newly advertised or linked. |

Sources: `play/managerial-intelligence-directorate/local-telemetry.js`, the two private Managerial adapters, each maintained game's `index.html`, `build/faculty-build-composer/template/mastery-quests-faculty-template-composer-ready.html`, and `tools/answer-analysis/analysis.js`. The analysis tool accepts local `question` events and supported private `answer_evaluated` records; saved answer snapshots control available wording/choice detail. A filename ending in CSV alone does not establish compatibility.

The dictionary defines Managerial's local 88-field export. Its existing version comparison includes older files and a separate private admin format, but those rows are not comprehensive field dictionaries. Local event filtering is distinct from the optional anonymous collection envelope. No export schemas, field definitions, telemetry collection, retention policy, student reports, or serialization were changed.

## C. Terminology corrections

| Before | After / reason |
| --- | --- |
| “Telemetry Data Dictionary” presented as a general resource | “Managerial Telemetry Data Dictionary”; the full Managerial Intelligence Directorate name appears in its description. |
| “Make sense of Download Game Data CSVs … explore the 88-column local Managerial schema” | “Look up fields in Managerial Intelligence Directorate’s local game-data CSV and compare export versions.” Keeps the true scope rather than substituting an unsupported universal claim. |
| Composer LMS evidence instructions refer simply to the Telemetry Data Dictionary | General assignment/results guidance plus an explicit comparison explaining why Composer exports differ. |
| “Add a whole class’s game-data files” | Supported question-response CSV families named; available objectives/answers depend on saved fields. |
| “Understand the engine” | “Compare question selection, remediation, and reporting in the supported practice-game modes.” |
| General “Mastery Quests is designed to stay portable” architecture statement | “Composer-generated practice games are designed to stay portable.” |
| “The learning model, ten modes, Mastery Report 2.0…” on Downloads | “The Composer practice-game model, ten supported modes, Mastery Reports…” |
| Ten identical “Download” accessible names | Resource-specific names such as “Download Faculty Implementation Guide (Word)”; visible button layout retained. |

No blind replacement was performed. The audit did not find that the currently linked general teaching guides were written exclusively for Managerial. Most residual risk was the reverse: generic entry-point descriptions obscuring a narrower resource. The historical Managerial schema and creator's teaching history were preserved.

## D. Link validation

- Public documentation checker: **22 pages, 762 internal page/asset/anchor links, 90 unique targets, zero broken links**, with two negative controls.
- Focused source and production-output check: **13 pages in each tree, 930 combined link/asset/fragment checks**. Included the complete Faculty Resources page, its instructional destinations, Downloads, Build, demonstration page and manual authoring guide. All resolved to actual files/anchors.
- Existing URL paths and anchors remain available. New `#game-data` links resolve in source and build. No invented replacements, unexpected local redirects, or deleted resources.
- Existing repeated links (jump links, cards, footer, next-step links) are useful alternate entry points, not conflicting duplicates. Edited descriptions consistently identify scope.
- Four externally hosted GitHub instructional images returned **HTTP 200** with unchanged final URLs. Their alternative text and captions remain.
- Live `https://masteryquests.org/how-to/` returned **403** to direct automated retrieval. This is a verification limitation, not a finding that the public page is broken. Production deployment contents and redirects could not be independently confirmed.
- Email links were inspected as destinations; no messages were sent. The main page has no external action links other than its image dependencies.

## E. Remaining issues and follow-up

1. **Existing learning-outcome generator mismatch.** `node audit_tools/faculty_lo/validate-guide.cjs` validates rendered coverage against the stored policy, then fails its `build-policy.cjs --check` generation step. Every input under `audit_tools/faculty_lo`, `build/faculty-build-composer`, and `how-to/learning-outcomes` is unchanged from the verified baseline. Generating to an ignored temporary directory finds the same library SHA but differences in six concepts: aggregate demand, binding price ceilings, demand and supply shocks, integrated economic analysis, scarcity and tradeoffs, and supply. Review the intended grouping/policy in a separate task; do not silently regenerate protected coverage in this content cleanup.
2. **No complete cross-collection field dictionary.** A separately scoped documentation project could define the 117- and 70-field formats and activity-specific simulation/journey records from their actual producers. This cleanup supplies honest scope labels and general interpretation guidance instead.
3. **Teaching-guide breadth.** The existing Word guides describe practice engines and Composer. Broadening them to RPG decisions and simulations would require new instructional substance, not replacing collection names. Their corrected download descriptions now make the limitation clear; no Word/PDF modifications were necessary.
4. **Historical helper wording.** A pre-existing email-draft body on `/build/` still says “Faculty Concept Composer.” Its visible page uses current terminology and no message is sent automatically. This low-impact encoded draft string was recorded rather than expanding edits to another page.
5. **Production and assistive-technology review.** Owner browser review remains appropriate before any deployment. Edge viewport and automated checks do not establish physical-device, Safari/Firefox, or real screen-reader coverage.

## F. Testing and modified files

| Check | Result |
| --- | --- |
| `node audit_tools/public_site_publication/build-dist.mjs` | PASS: 2,408 published files; 151 Composer review PDFs; zero forbidden or incoming files. |
| `node audit_tools/public_documentation/check.cjs` | PASS: link/anchor checks, terminology, Composer workflow order, privacy framing. |
| `python audit_tools/public_documentation/check-downloads.py` | PASS: all four teaching-guide content checks. |
| `node audit_tools/telemetry_data_dictionary/check.mjs` | PASS: all 88 fields match 12 Managerial exports; drift negative control passes. |
| `node audit_tools/telemetry_data_dictionary/render.mjs --check` | PASS after using the existing renderer to restore generated-region line endings. Definitions and field markup remain unchanged from baseline. |
| `node audit_tools/faculty_lo/validate-guide.cjs` | FAIL, pre-existing generation mismatch described above. No outcome files changed. |
| `node --test audit_tools/october_update/publication.test.mjs` | Six PASS, one SKIP: private export byte-hash comparison cannot read existing restricted private files. Publication path exclusions and protected-source checks pass; no permissions changed. |
| Focused link/download checks | PASS in source and `dist`; archive integrity checks for asset ZIP and workbook; historical CSV dimensions confirmed. |
| Edge desktop/mobile browser QA | Six edited pages checked at 1440×1000 and 390×1000; no page overflow, one H1 each, valid heading progression and named links. |
| Keyboard and accessibility | Main skip link, Tab reachability, visible focus, mobile menu/Enter/Escape checked. LMS iframe example made focusable. Dictionary search/no-results/reset and all 88 definitions without JavaScript checked. Final axe-core scan: zero violations across all 12 page/viewport combinations. |
| Scope / whitespace | `git diff --check`; only six related HTML pages plus this report intended for commit. No shared templates, engines, banks, schema inventories, scripts, CSS or configuration changed. |

Local browser captures, link manifests, external status results and diagnostic files are under ignored `tmp/accessibility_cleanup/faculty-resources/`; they are review evidence, not publication assets. The focused browser runner uses existing Playwright/Edge and axe-core. The legacy dictionary browser runner hard-codes 87 fields; this task's check uses the verified current 88-field inventory without changing that historical runner. Gameplay regression suites were not run because gameplay sources were untouched.

Modified files:

- `how-to/index.html`
- `how-to/telemetry-data-dictionary/index.html`
- `how-to/canvas/index.html`
- `how-to/responsible-telemetry-use/index.html`
- `tools/answer-analysis/index.html` (faculty-facing introduction only)
- `resources/index.html`
- `FACULTY_RESOURCES_CLEANUP_REPORT.md`

Requested local commit message: `Clarify faculty resources and collection-specific guidance`.
