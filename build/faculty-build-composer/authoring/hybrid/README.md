# Hybrid Composer — unreleased staging extension

Release is on hold. No merge, push, publication, deployment, manuscript edit, or public activation is part of this work. This capability is separate from the version evaluated in the submitted manuscript. Technical checks do not establish faculty usability, instructional effectiveness, or learning gains.

Branch: `codex/hybrid-composer-staging`.
Integration baseline: `becd0f66926ffa0c58b13c3832570efbdc0e4150`.

## Open locally

From the repository root with Node.js available:

```powershell
node build/faculty-build-composer/authoring/hybrid/prepare.cjs
node build/faculty-build-composer/authoring/hybrid/serve.cjs 8765
```

Open <http://127.0.0.1:8765/build/faculty-build-composer/authoring/hybrid/>. Keep the terminal running; Ctrl+C stops it. Use localhost or HTTPS, not a `file:` URL. This loopback server is a development server and must not be exposed to the internet.

`prepare.cjs` reads the current public Composer and generates an ignored staging `index.html` and `generated-composer.js`. It fails if an integration seam changes, rather than silently applying a stale patch. Run it after updating the baseline. No public Composer source is rewritten.

## Instructor walkthrough

1. Choose supplied questions, only your questions, or both. Switching sources preserves all custom drafts and remembered supplied selections. In own-only mode those supplied selections are inactive.
2. Paste labeled text, import CSV, or write an individual question. The example and format instructions sit beside the controls. CSV supports quoted commas, doubled quotes, embedded newlines, BOM, CRLF, LF, and CR. Use exactly the template's headers. Unrecognized headers, malformed quotes, invalid answer letters, and missing fields produce actionable messages. Incomplete records are valid drafts; original paste remains visible after import.
3. Type or reuse topic and learning-outcome names in the editor, or select questions and apply bulk assignments. Exact repeated names within this instructor bank intentionally share that assignment. Names are never matched to supplied taxonomy. Difficulty labels are instructor judgments, not empirical calibrations.
4. Inspect all fields, try an answer and its feedback, include/exclude questions, and acknowledge review for each complete included question. Edits to question text, choices, correct answer, explanation, topic, outcome, or difficulty invalidate that acknowledgement. Inclusion/source changes preserve it. A structural pass does not certify content quality.
5. Continue to the existing game details, modes, checkpoints, appearance, Readiness, and Generate controls. The guide lists exact validation problems, and the existing mode cards expose actual pool minimums. Save the authoring project separately before sharing the student package.

`demo-biology.csv` contains 15 non-economics questions: five each at easy, medium, and hard. Import it, inspect/review each question, select Quiz, and generate. It starts unreviewed intentionally. Topics cover cell biology, transport, and energetics. This is demonstration content, not an externally validated curriculum or assessment.

## Runtime contract and boundaries

The inspected engine requires exactly four text choices and supports easy, medium, hard, elite, and legendary ordinary pools. Included custom questions need question text, four distinct usable choices, answer A–D, explanation, topic, explicit learning outcome, supported difficulty, and a current review acknowledgement. Excluded or inactive-source drafts do not block export. Included incomplete/unreviewed custom questions block export and never enter runtime banks.

The adapter uses `MQComposerCore.compose`, the current mode validator, answer verification, template generation, artwork/graph integrity checks, game identity, save compatibility, activation, and the existing stored-ZIP writer. Supplied library data, taxonomy, outcome policy, public UI, and canonical template remain unchanged. Custom records have UUID identities within a project namespace; imported project collisions are rejected instead of overwritten. Correct answers are converted internally to the existing SHA-256 representation. No explicit answer letter/index or review acknowledgement is emitted in custom runtime records. Hashes are integrity machinery, not a claim of secure exam secrecy.

Custom topics/outcomes have private identifiers and readable report labels. A required runtime `repairSkill` field identifies the same custom outcome; it does not create a repair relationship. No custom checkpoints, repair pools, bridges, graphs, or concept-review resources are fabricated. Staged template generation adds explicit guards to both remediation eligibility and planning for custom records. Existing supplied adaptive routes remain intact. Ordinary engine sampling applies, with no adjustable source weighting or promise of equal proportions.

Actual initial mode minimums:

| Mode | Minimum content |
| --- | --- |
| Quiz | 5 easy + 5 medium + 5 hard |
| Fading Fortune / Risk & Reward | 10 eligible ordinary questions each |
| Timed Trial / Unlimited Practice | 6 easy + 6 medium + 6 hard + 1 repair + 1 bridge |
| Standard / Exam / Score Attack | Above, plus 3 each opening/middle/final checkpoint questions |
| Legendary | 6 legendary + 3 legendary checkpoint questions |
| Trial by Graph | 10 graph-safe questions |

Consequently a text-only instructor bank can currently support Quiz, Fading Fortune, and Risk & Reward when sufficient. A mixed bank can support additional modes using eligible selected supplied content. No filler is added. A one-question draft can always be saved and previewed.

## Saved work and student packages

The existing recipe schema remains `1.6.0`; staged authoring projects add a versioned `hybrid` object (`version: 1`). It stores project/question identity, source, all question fields, inclusion, and review signatures/timestamps. Ordinary recipe fields retain game settings, supplied selections/scopes, checkpoint settings, theme/artwork, and game identity. The staged interface accepts ordinary recipes too. Use the staged interface to reopen Hybrid projects; the public Composer does not implement this extension.

The browser key is `mq-hybrid-authoring-v1`, scoped to the origin. On reload the saved draft is protected until Restore or Replace is chosen. A download of the protected draft is available before replacement, including if recovery encounters invalid data. Imported content and saved records persist; unsaved editor keystrokes and the paste box are not a separate recovery log. Explicitly add/save a draft to retain them. Storage failure prompts a project download; clearing browser data can remove drafts. Keep durable project files.

Staged ZIPs contain the self-contained versioned game, launcher, publishing helper, deployment manifest, and README. They omit `composition_recipe.json`, any Hybrid authoring project, explicit answer keys, and excluded/incomplete questions. The separate Save Authoring Project controls preserve the editable copy. Public Composer ZIP behavior is unchanged.

## Validation

Run core checks after preparing:

```powershell
node build/faculty-build-composer/authoring/hybrid/prepare.cjs
node build/faculty-build-composer/authoring/hybrid/test.cjs
```

Run browser checks with Playwright installed or `MQ_PLAYWRIGHT_MODULE` pointing to its package. Microsoft Edge is used, all external browser requests are blocked, and a temporary localhost server is started/stopped automatically. Optionally set `MQ_AXE_MODULE` to an installed `axe-core/axe.min.js` to include WCAG checks.

```powershell
node build/faculty-build-composer/authoring/hybrid/browser-test.cjs
node build/faculty-build-composer/tests/run_active_composer_suite.js
node audit_tools/public_site_publication/build-dist.mjs
```

Core results: **24 checks passed**. Browser results: **9 checks passed**, including the optional axe scan with zero WCAG 2 A/AA and 2.1 AA violations in the guide. Browser checks cover paste errors/completion, CSV file input, editing/review, preview, bulk assignment, source preservation, browser recovery, project download/restoration, actual ZIP generation, hash validation, package isolation, instructor-only Quiz answer/feedback/advance, mixed gameplay, 390px layout, keyboard source selection/focus, and the original public Composer download workflow. Edge ran against localhost. Screenshots and machine-readable run results are local under `tmp/hybrid-composer/` (ignored and excluded from publication).

The curated publication build passed: 2,420 files, 151 review PDFs, 14 Composer runtime files, zero forbidden files. The generated public artifact contains no Hybrid staging files. Git comparison confirms the six public Composer UI/core/library/template files are unchanged.

The existing active Composer suite finished with **40 of 41 runners passing**. Its baseline failure is in `run_phase15_production_hardening_validation.js`: the untouched `play/micro-domains/labyrinth-of-choice/index.html` version string fails its old version-pattern assertion. This is unrelated to Hybrid; both files match the integration baseline. See `verification.json` for the final regression tally.

Remaining verification: faculty usability sessions; screen-reader and full keyboard task walkthroughs; Firefox/Safari/mobile-device checks; complete-run/report checks across every supported mode/theme; real HTTPS hosting and LMS Student View; remote telemetry activation/ingestion with owner-approved staging credentials; an actual GitHub Pages/Jekyll build; and resolution/triage of the baseline regression. No live activation request, LMS deployment, or public publication was performed. Existing activation checks were retained, not bypassed.

## Publication isolation

The staging tree lives under `authoring/`, already forbidden by the curated publisher and excluded by GitHub Pages. `_config.yml` adds an explicit Hybrid path exclusion. Both `.assetsignore` files now explicitly exclude it as well. The Cloudflare builder uses an explicit Composer runtime allowlist and a post-build assertion against `/authoring/`; it never copies these generated files. No public link points here. Merely switching branches or accidentally building this branch does not activate the feature through these configured publication paths. Do not manually upload the source repository or bypass the curated build.

Changed files are limited to this directory (core adapter, guide, CSS, preparation/server helpers, tests, CSV demo, and documentation) plus `.gitignore`, `.assetsignore`, `.assetsignore.txt`, and `_config.yml`. The ignored generated entry and local test artifacts are reproducible and are not release sources.

## Later activation — requires a new owner instruction

These are future release steps, not actions taken in this change:

1. Resolve the review/release decision with the owner and preserve the manuscript's historical evaluation boundary. Update this feature branch to the then-current integration baseline; rerun preparation and all checks, including the remaining release checks above. Review each preparation seam against the new baseline.
2. Keep the existing Composer route as the rollback path. For an explicit opt-in release, create `build/faculty-build-composer/hybrid/` and copy only these six prepared runtime files from `authoring/hybrid/`: `index.html`, `generated-composer.js`, `hybrid-core.js`, `hybrid-ui.js`, `hybrid.css`, and `demo-biology.csv`. Do not copy projects, tests, README, or verification artifacts.
3. In the copied index change `<base href="../../">` to `<base href="../">`. In the copied index and UI replace `authoring/hybrid/` resource paths with `hybrid/`. Keep the original authoring path exclusions. Change the unreleased UI wording only after the owner authorizes release.
4. Add those six exact paths to the curated publisher's explicit copy list; do not replace it with a recursive source-tree copy. Add publication verification for the new entry's scripts/styles and absence of projects/keys. Generate `dist`, inspect it, and run browser tests against the release route and public fallback.
5. Add the approved Hybrid link in `build/index.html` and any owner-approved navigation. Keep `/build/faculty-build-composer/` working. Review the final diff and release notes, merge only on the later instruction, then use the owner's normal deployment process. Verify the HTTPS route, telemetry setting, downloadable package, and LMS embed before announcing availability.

## Disable / rollback

Before release: stop the local server with Ctrl+C and return to the public branch. No production rollback is necessary because nothing was deployed. Keep this feature branch and exported authoring projects for later consideration.

After a later opt-in release: remove the Hybrid navigation link and six-file publication allowlist entry, remove the public Hybrid directory from the release source, rebuild the curated artifact, and redeploy using the owner's process. Keep all authoring exclusions. Redirect the retired Hybrid route to the original Composer only if the owner chooses; explain that Hybrid authoring files need the staged interface. Previously distributed self-contained games and their immutable URLs are separate artifacts—retain them while assignments depend on them. Archive projects before deleting browser drafts. Reverting the eventual activation commit is the equivalent Git rollback; do not revert unrelated content.
