# Accessibility PR cleanup

22 October 2026. Repository: `wjbyrd/masteryquests-website`. Branch: `accessibility-preview`. PR: [#2](https://github.com/wjbyrd/masteryquests-website/pull/2).

## Baseline and scope

- Initial HEAD: `2125c3641985a545071855c2925a9b883ccec910`, including the Standard Campaign boss setback and duplicate-Continue correction.
- GitHub PR base: `5e1d5644cc4dffcf60a614c7dd12c568238e0e14` on remote `main`. The local `main` ref is `599b1301`, one implementation commit ahead of that base; it was neither switched to nor modified. PR counts use the actual GitHub base.
- Initial worktree: no tracked changes; unrelated untracked `FEEDBACK_ACCESSIBILITY_LIFECYCLE_AUDIT.md` preserved unchanged.
- GitHub's complete 652-file list matches the local PR comparison: 381,327 additions and 967 deletions before cleanup.

## Removed outputs and retained inputs

Removed **552 generated files from the index only** with `git rm --cached`, retaining all local copies (141,484,193 bytes). None existed at the PR's remote-main base. Categories: 292 JSON results, 196 PNG captures, 35 logs, 27 synthetic CSVs, one generated HTML export, and one generated ZIP. These include intermediate failures, repeated runs, screenshots and disposable exported test games.

| Output family | Files excluded | Inputs retained |
| --- | ---: | ---: |
| `validation_artifacts/accessibility_cleanup/` | 407 | 0 |
| `validation_artifacts/accessibility_refinements/` | 30 | 0 |
| `validation_artifacts/feedback_progression/` | 19 | 0 |
| `validation_artifacts/final_feedback_refinement/` | 67 | 0 |
| `validation_artifacts/boss_checkpoint_regression/` | 29 | 3 |

Three captured **public production input fixtures** remain tracked in the boss directory, unchanged:

- `production-market-gate.html` (646,410 bytes).
- `production-market_gate_questions_student.js` (1,324,893 bytes).
- `production-instructional_resources.js` (11,318 bytes).

These are read by `boss-checkpoint-source-audit.mjs` and `boss-checkpoint-regression.mjs` to reproduce the historical production comparison without contacting production. They total 1,982,621 bytes; retaining them avoids altering the existing test infrastructure. No other generated evidence is intentionally retained in the PR tree. Existing validation fixtures outside these five output families remain tracked.

All test definitions, runners, synchronization tools, authoritative sources, implementation reports and relevant documentation remain. Six reports/docs have an evidence-path note identifying ignored local outputs; their historical conclusions are unchanged. Referenced screenshots/results are available in the owner's local checkout, not through the PR's current tree. Prior commits still contain the evidence because history was not rewritten.

## Ignore rules and source preservation

Added rules only for the five generated evidence families, with explicit exceptions for the three boss input fixtures. Added `/tmp/boss-checkpoint-regression/` for generated portable games and `/tmp/answer-release/` for synthetic answer-analysis exports. The existing `/tmp/accessibility_cleanup/` rule covers this cleanup's logs, manifests and temporary fixtures. No general `validation_artifacts/` ignore was added.

SHA-256 comparisons passed for 2,938 tracked HTML/JavaScript/CSS/JSON/configuration files outside the evidence tree, plus the unrelated untracked audit. All 552 excluded evidence files still exist locally and match ignore rules. Git's complete cleanup diff contains only cached removals, `.gitignore`, the six evidence notes and this report; no application, test, bank, asset or build source changed.

`wrangler.jsonc` is byte-identical to initial HEAD (SHA-256 `9ef433714b33acd4f22a45830e69d66359c8080ae5d4e88114710dfc978a0698`). Production routes, bindings, subscription settings and rate-limit namespaces remain unchanged, as do the isolated preview settings. No additional Cloudflare configuration is required for this cleanup.

## Validation

Run from the repository root with Node and installed Playwright/Edge. Local logs and integrity manifests are under ignored `tmp/accessibility_cleanup/cleanup-*`; accessibility browser results are under `tmp/accessibility_cleanup/pr-cleanup/`. The boss browser runner writes its regenerated results to the now-ignored boss evidence directory.

| Check | Result |
| --- | --- |
| Accessibility, Economic Realm and Macro Command `sync.mjs --check` | PASS |
| Existing `sync-check.mjs` propagation/idempotence | PASS; supplemented by the full source hash comparison because its own changed-HTML list is empty for this cleanup |
| `run_standard_boss_progression_validation.mjs` | PASS, 42 cases |
| `progression-unit.mjs` | PASS, all 10 runners; regenerates portable game fixtures |
| `final-feedback-focused.mjs` | PASS, 19 recovery/motion/focus checks |
| `boss-checkpoint-source-audit.mjs` | PASS, 31 maintained sources and all three retained production inputs; regenerated portable boss game |
| `boss-checkpoint-regression.mjs --fixed` | All 99 cases validated: 95 passed initially; 4 page-load timeouts passed a focused retry using the original scenario functions/assertions unchanged |
| `progression-deep.mjs` / `progression-compatibility.mjs` | Sequential rerun: 22 deep checks PASS, 2 browsers UNAVAILABLE; all 11 compatibility checks PASS |
| `run_active_composer_suite.js` | PASS, all 40 runners in one complete run |
| `audit_tools/public_site_publication/build-dist.mjs` | PASS, 2,408 files, 151 concept-review PDFs, zero forbidden/incoming files |
| `git diff --check` / `git diff --cached --check` | PASS |

The first deep run compared against its historical default `aa74a1e2` and rejected the deliberately restored Standard boss setback. That expectation predates `2125c364`; no source was changed to satisfy it. The cleanup comparison rerun uses the runner's existing `MQ_FEEDBACK_BASELINE=2125c3641985a545071855c2925a9b883ccec910` option. Initial browser runs also encountered local 7-second navigation timeouts; their results are preserved separately from successful sequential/focused reruns. Boss results are `current.json` and `cleanup-timeout-retry.json` in the ignored boss evidence directory. Firefox and WebKit are unavailable in this environment.

## Final PR review

Final PR size: **101 files, 59,752 additions and 967 deletions** against the GitHub base (652 minus 552 generated outputs plus this report).

No unexpectedly large new source change was introduced by cleanup. The largest existing application diffs are the five Economic Realm HTML files (523 added / 34 removed lines each), reflecting propagated shared implementation. The retained production fixtures account for 43,734 added lines; they are historical test inputs, not new application logic.

All six original implementation commits remain ancestors, unchanged: `599b1301`, `7edf5434`, `aa74a1e2`, `90f12687`, `a4b247fd`, `2125c364`. The latest boss correction remains present. No rebase, history rewrite, push, merge or deployment was performed.

Review of additions in the remaining PR diff found no credential/private-key/token patterns, absolute user-machine paths, or unintended temporary files. A whole-file scan also identified older machine-path metadata in unchanged portions of the beta export and a test; those lines were already present at the PR base and were not edited. This is a targeted review, not a comprehensive secret-scanning certification.

Existing manual screen-reader and cross-browser/device coverage limitations in the implementation reports are not resolved by repository cleanup. The historical default boss comparison in `progression-deep.mjs` needs a separately scoped test-maintenance decision; this cleanup retains it unchanged and records the applicable pre-cleanup baseline explicitly. No evidence-removal dependency failure has been found.
