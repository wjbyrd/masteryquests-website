# Free faculty package audit before editing

Authoritative repository: C:/Users/Jennings/Documents/GitHub/masteryquests-website. Baseline: clean main at 8eb437bb47e005d9213ca50fa51b5071e9901d05.

The Build and Resources pages link their Blank Faculty Template directly to the maintained Composer template. That engine is current. The separately published downloads/resources/mastery-quests-faculty-template.html is an older duplicate, with no maintained generator. template-old.html is historical. The correct solution is a generated manual authoring layer over the maintained Composer source, not a forked engine.

| Capability | Before | Evidence and action |
|---|---|---|
| Room progression, rendering, evaluation, feedback, streaks | MATCHES | Actual linked download is Composer source. Preserve protected engine. |
| Adaptive selection, concept memory, non-repeat, weakness/coverage weighting, rapid guesses | MATCHES | Same implementation in linked download. |
| Repair → bridge → retest, checkpoints/bosses | MATCHES | Shared engine and compatibility adapter. Clarify explicit skill routing. |
| Save/resume, run state, completion, codes, achievements | MATCHES | Same current engine, including raw active-run UUID save repair. |
| Ten modes, labels, timing | MATCHES | supportedModes matches Composer. |
| Manual eligibility for Trial by Graph, Fading Fortune, Risk and Reward | MISSING / STALE | Empty eligibility ID arrays do not follow manually entered banks. Derive from manual banks. |
| Question schema guard | MISSING / STALE | Standalone facultyQuestionValidator falls back to a no-op; generated Composer embeds actual validator. Embed exact maintained validator. |
| Required and optional fields, answer hashes, assets | MISSING / STALE | Workbook requires obsolete boss difficulty, constrained types and numeric ID conventions; omits required main repairSkill and graph metadata export. Replace obsolete validation with canonical browser validation and aligned workbook drafting. |
| Title, identity, modes, theme, objectives | INTENTIONALLY DIFFERENT | Manual marked configuration replaces Composer authoring UI. Preserve current defaults and expose concise directions. |
| Concept Review manifest and Composer library selection | NOT APPLICABLE | Manual questions do not imply membership in curated LO/PDF library. Use Composer for curated integration. |
| Telemetry, local data download | MATCHES | No anonymous transport in raw blank. Explicit default false in manual config; preserve frozen contracts. |
| Keyboard/focus, labels, live regions, dialogs, reduced motion, responsive shell | MATCHES | Same maintained shell. Graph metadata instructions/tool need correction. |
| Launch, HUD, feedback, help, pause, completion | MATCHES | Same maintained shell. |
| Input safety and persistence | MISSING / STALE | Raw manual JS syntax errors lack authoring feedback; new JSON validator must not eval pasted input. Retain runtime safe rendering. |
| Independent legacy download | MISSING / STALE | Synchronize current filename through generator; exclude explicitly retired source copies from dist. |

## Supporting artifacts reviewed

| Artifact | Before | Action |
|---|---|---|
| build/index.html, resources/index.html | STALE | Point blank download to generated manual package and expose validation/guide/sample workflow. |
| faculty-question-bank-validator.xlsx | STALE | Preserve row drafting, remove obsolete validation and unsafe export formulas; use canonical validator for full acceptance. |
| faculty-question-bank-helper.docx | STALE | Required fields incorrectly called recommendations; replace with concise current manual guide. |
| example-question-architecture.docx | BROKEN | Poorly presented schema example; replace with valid current sample and asset structure. |
| example-question-generation-prompt.docx | STALE | Align required fields, modes, counts and accessibility output. |
| faculty-composer-quick-start-guide.docx | STALE | Retain teaching flow; update telemetry and manual workflow references. |
| faculty-game-overview-guide.docx | STALE | Update telemetry and manual workflow references. |
| faculty-implementation-guide.docx | STALE | Update telemetry and manual workflow references. |
| student-instructions-and-faculty-customization-checklist.docx | STALE | Update telemetry and manual workflow references. |
| README.txt, RESOURCE-CLEANUP.txt | STALE | Clarify current entry points and retired resources. |
| template-old.html | REDUNDANT | Retain historical source, exclude publication. |
| using-external-javascript-question-pools.docx, javascript-question-pool-code.txt | REDUNDANT | Already designated retired; exclude publication and state replacement. |
| mastery-quests-multi-game-hub-template.html | CURRENT | Independent course hub with intentional placeholders; no shared game runtime. |
| Canvas converter and its instructions | NOT APPLICABLE | Separate legitimate LMS workflow; preserve. |
| how-to pages, learning outcomes and privacy guidance | CURRENT | Maintained Composer/operational telemetry guidance; link manual-specific page. |

Read-only paragraph and workbook extraction evidence is in validation_artifacts/free_faculty_template_parity/*-before.json. This audit was recorded before production edits.
