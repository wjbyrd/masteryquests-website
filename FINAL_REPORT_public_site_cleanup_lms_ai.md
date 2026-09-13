# Public site cleanup report

**Completed locally. NOT DEPLOYED.**

## Baseline and scope

- Repository: `C:\Users\Jennings\Documents\GitHub\masteryquests-website`
- Branch: `main`
- Starting HEAD: `1334ec5d04fdc25548aaacb8ab0f1b920d5c4721`
- Starting working tree: clean.

Canonical authored HTML pages and the controlled publication builder were edited. `dist/` was rebuilt from those sources. No game engine, question schema, Composer behavior, telemetry architecture, Cloudflare configuration, D1 or production service was modified. No commit or deployment was made.

## Files changed

Modified files, relative to the repository root:

```text
about/index.html
audit_tools/public_site_publication/build-dist.mjs
build/index.html
downloads/resources/README.txt
evidence/index.html
how-to/responsible-telemetry-use/index.html
privacy/index.html
resources/index.html
```

New audit/QA sources:

```text
audit_tools/public_site_cleanup/audit.py
audit_tools/public_site_cleanup/browser.mjs
FINAL_REPORT_public_site_cleanup_lms_ai.md
```

Evidence and screenshots are under `validation_artifacts/public_site_cleanup_lms_ai/`; the ignored local publication artifact is `dist/`.

## Generic Canvas wording changed

| Page | Before | After |
|---|---|---|
| Evidence | “For hosting, Canvas embedding,” | “For hosting, LMS embedding,” |
| Responsible Telemetry Use | “Submission through Canvas or another system” | “Submission through your LMS or another system” |
| Privacy | “submit it through Canvas, email,” | “submit it through their LMS, email,” |

The download README's statement that “the multi-game hub and Canvas tools remain available” was removed as part of retiring the converter. It now says the multi-game hub remains available for organizing course games and only current website-linked resources are published. Converter-specific copy was removed rather than inaccurately generalized.

## Every remaining public-facing Canvas reference

The rendered HTML text and public metadata scan found **13 remaining copy occurrences**. Each is either in the dedicated Canvas-specific embedding guide or explicitly labels a link to that guide. That material was retained because its page-editing, HTML-editor, theme, Student View and embedding instructions are intentionally Canvas-specific.

| Location | Retained wording | Reason |
|---|---|---|
| `how-to/index.html`, jump link | “Canvas guide” | Accurately identifies the specific destination guide. |
| `how-to/index.html`, guide card | “Using Mastery Quests in Canvas” | Accurately identifies that guide. |
| `how-to/composer/index.html`, next-step link | “Next: Put the Game in Canvas” | Explicit link to the existing Canvas technical guide, not generic LMS instructions. |
| `how-to/canvas/index.html`, description metadata | “Publish a self-contained Mastery Quests game to GitHub Pages and embed the public URL directly in Canvas with an iframe.” | Describes the platform-specific guide. |
| Same page, title | “Canvas Deployment \| Mastery Quests” | Identifies the guide. |
| Same page, eyebrow | “Canvas deployment” | Identifies the guide. |
| Same page, introduction | “Publish the game at a public HTTPS URL, then point Canvas directly at that URL.” | Describes this guide's specific embedding workflow. |
| Same page, Step 2 heading | “Point Canvas directly at the public game URL” | Platform-specific technical step. |
| Same page, page-editing instruction | “Create or edit a Canvas page, switch to the HTML editor, and paste an iframe using your hosted URL.” | Canvas-specific page/editor operation. |
| Same page, height guidance | “Increase it if your Canvas theme creates unnecessary internal scrolling.” | Canvas-specific theme behavior. |
| Same page, fallback link | “use the same public HTTPS URL as an external Canvas link” | Alternative within that specific platform. |
| Same page, wrapper explanation | “The Canvas `<iframe>` embeds that game.” | Explains the specific guide's embedding chain. |
| Same page, evidence guidance | “state that requirement explicitly in Canvas” | Course instructions within the Canvas guide. |

The existing `/how-to/canvas/` URL is retained in three link attributes: two on `how-to/index.html` and one on `how-to/composer/index.html`. The guide also retains its `#canvas-embed` link and matching section ID. Historical source filenames and HTML canvas/code identifiers were not renamed or treated as generic LMS prose.

All eight published DOCX/XLSX resources were inspected for Canvas, Quiz Converter and QTI text; none contained those terms. The exact copy/path inventory is recorded in [publication-audit.json](C:/Users/Jennings/Documents/GitHub/masteryquests-website/validation_artifacts/public_site_cleanup_lms_ai/publication-audit.json).

## Quiz Converter removal

Seven source files were found and are now excluded from controlled publication:

```text
tools/canvas-quiz-converter/index.html
downloads/resources/Canvas Quiz Converter v1.1.html
downloads/resources/canvas-quiz-converter-v1.1.html
downloads/resources/canvas-quiz-converter-v1.2.html
downloads/resources/canvas-quiz-converter-instructions-v1.1.docx
downloads/resources/canvas-quiz-converter-instructions-v1.2.docx
downloads/resources/Canvas_Quiz_Converter_Instructions_v1.1.docx
```

Removed from the public experience:

- Build's “Convert questions into a Canvas quiz” goal and its QTI-converter explanation.
- Build's conversion section, launch link and instruction download.
- Resources' converter launch card and instruction-download card.
- README wording that continued to advertise the retired tools.

The publication filter covers the tool directory and hyphenated, underscored and space-separated filename variants. The final forbidden-file guard also rejects converter paths if they reach the publication set. Source/history is retained in the repository; it is excluded from website publication, not claimed to be in a private Git repository.

The dist inventory contains **zero converter files**, and no published HTML text or link directs users to the converter. The old tool URL returns **404** when serving the controlled artifact locally. The Question Bank Validator, its runtime and workbook, the blank faculty template, working starter, question packages and manual guide remain public.

## About note

Added a modest heading and paragraph within the existing creator section, using its established styling:

**AI as a co-creator**

> Mastery Quests has been developed through a human-led, AI-assisted co-creation process. AI tools have supported coding, testing, content refinement, accessibility work, and design iteration. Instructional decisions, validation, quality control, and final responsibility remain human.

No vendor/model claims or suggestion of autonomous AI authorship were added.

## Validation results

| Check | Result |
|---|---|
| Existing public documentation/link validation | PASS: 17 pages, 552 links, 79 unique targets, zero broken links; both negative controls passed. |
| Existing downloadable teaching-guide guards | PASS: all four guides. |
| Publication/content inventory | PASS: zero converter files/links; only documented Canvas-specific references remain; eight DOCX/XLSX files checked. |
| Validator and faculty package preservation | PASS: current HTML, JSON, workbook and validator runtime present in dist. |
| About statement | PASS: present in source and dist. |
| Protected implementation paths | No changes to server, Composer, games or shared site JavaScript. |
| `git diff --check` | PASS. |

`node audit_tools/public_site_publication/build-dist.mjs .` returned:

```json
{
  "ok": true,
  "fileCount": 1789,
  "composerConceptReviewPdfCount": 151,
  "forbiddenFileCount": 0,
  "incomingQuestionAssetCount": 0
}
```

The count decreased from 1,796 to **1,789**, exactly the seven intentionally excluded converter files. No audit or QA sources entered dist.

## Local browser and visual QA

Served the controlled dist locally and tested Home, About, Resources, Build and Question Bank Validator at **1440px and 390px**: all ten page/viewport checks passed, with no browser exceptions or horizontal overflow.

Verified navigation links, mobile menu opening and Escape closing, Build's remaining goal filtering, absence of the converter option/cards/links, and the validator's working sample load/validation. The 78-question sample still reports no structural errors. Screenshots were reviewed for natural wording, usable narrow layouts and the modest About-note placement. The note fits the existing creator section at both widths without overlap or awkward wrapping.

Evidence: [browser.json](C:/Users/Jennings/Documents/GitHub/masteryquests-website/validation_artifacts/public_site_cleanup_lms_ai/browser.json), [links.json](C:/Users/Jennings/Documents/GitHub/masteryquests-website/validation_artifacts/public_site_cleanup_lms_ai/links.json), [dist.json](C:/Users/Jennings/Documents/GitHub/masteryquests-website/validation_artifacts/public_site_cleanup_lms_ai/dist.json).

**Deployment status: NOT DEPLOYED.** Changes affect the local authored site and controlled publication artifact only. No remaining issue was found within this cleanup's scope.
