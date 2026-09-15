# Composer pattern attribute hotfix

Deployment status: **NOT DEPLOYED**.

## Root cause and canonical correction

Chromium's HTML constraint validation compiles pattern attributes with the Unicode Sets (`v`) flag. The unescaped literal hyphen at the end of `[a-z0-9-]+` is invalid in that mode. Browser regression on Edge 153.0.4234.32 confirms the old expression throws.

The sole public implementation change is `build/faculty-build-composer/index.html`, line 48, input `gameSlug`:

```html
<!-- Before -->
<input id="gameSlug" value="my-faculty-mastery-quest" pattern="[a-z0-9-]+">
<!-- After -->
<input id="gameSlug" value="my-faculty-mastery-quest" pattern="[a-z0-9\-]+">
```

The user-supplied before/after strings rendered identically; escaping only the literal hyphen implements the stated fix. Letter and digit ranges remain unchanged. No broad regex rewrite was performed.

## Duplicate search

The public Composer/template HTML search found one genuine active occurrence, in the canonical file above. Eight additional tracked HTML occurrences are archived under `legacy/`, excluded from controlled publication and left unchanged:

- `legacy/index.html`
- `legacy/phase4.4-faculty-concept-composer/index.html`
- `legacy/phase4.4a-faculty-concept-composer/index.html`
- `legacy/phase4.5a-faculty-concept-composer/index.html`
- `legacy/phase4.5b-faculty-concept-composer/index.html`
- `legacy/phase5.2b-faculty-concept-composer/index.html`
- `legacy/phase5.2b-stage2-faculty-concept-composer/index.html`
- `legacy/phase5.2b-stage4-faculty-concept-composer/index.html`

## Regression results

The existing `audit_tools/telemetry_governance/stage3-browser-check.mjs` now enumerates every Composer `[pattern]`, compiles it with `new RegExp(pattern, 'v')` inside Edge, and exercises native constraint validation. It verifies lowercase letters, digits, and hyphens are accepted, while uppercase letters, spaces, underscores, slashes, and accented letters produce pattern mismatches. It also asserts the original broken regex throws, preventing a browser without the relevant semantics from silently passing.

Console pattern errors and page errors are captured. The existing Generate/Download test must produce its game ZIP with no such errors. Local browser tests use an injected verifier and intercepted local fixtures; no real Turnstile interaction or production call occurs.

| Check | Result |
|---|---:|
| Composer active regression runners | 27/27 PASS |
| Stage 3 Composer | 11/11 PASS |
| Stage 3 browser, including new pattern regression | 17/17 PASS |
| git diff --check | PASS |

## Controlled dist

Rebuilt using `node audit_tools/public_site_publication/build-dist.mjs`. The rebuilt Composer contains the corrected pattern.

| Field | Result |
|---|---:|
| ok | true |
| composerConceptReviewPdfCount | 151 |
| forbiddenFileCount | 0 |
| incomingQuestionAssetCount | 0 |
| fileCount | 1793 |

The controlled dist is an ignored local build artifact. No production or staging deployment was performed. Telemetry architecture, capability logic, verifier, contracts, and production configuration remain unchanged.

Changed tracked sources: canonical Composer HTML and the Stage 3 browser regression. Additional artifacts: this report and sanitized logs/results under `validation_artifacts/composer_pattern_hotfix/`.
