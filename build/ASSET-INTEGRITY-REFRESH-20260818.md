# Asset Integrity Refresh — 2026-08-18

## Result

Composer asset integrity metadata was refreshed against the actual files in `data/question-assets`. No question text, answer keys, graph images, or engine logic were changed.

## Stale asset records corrected

- `question-assets/aggregate-demand/AD-01.webp`
  - old: `44122` bytes / `2c2be9aea996339ac888b1d0f0d1b75e62a11067a7d8653a80c222aaa68c45ea`
  - new: `61902` bytes / `16be188b9429e3722f7f6c93d4539d199e1ea5e28cb3803def7f9c3bb96f0938`
- `question-assets/aggregate-demand/AD-02.webp`
  - old: `43170` bytes / `1b23e95de217b5521d827d0d59471e9deb6fc5ec782cb2c421d25b540d736f81`
  - new: `63604` bytes / `56dc8f0e2484a3220f53da4a0fee1fc31130a42475dde27fcdbe7147c63297d1`
- `question-assets/aggregate-supply/AS-01.webp`
  - old: `43790` bytes / `34a54f4e29ed509fd11a38740efc961a4bbe8e908567723ab2fdf594f6f268f6`
  - new: `66044` bytes / `b02d5ad9f040498d059dedd7508aff0fb9b74c779118144dab897a2f7675f70c`
- `question-assets/aggregate-supply/AS-02.webp`
  - old: `43750` bytes / `281dc90fdd2ac8e0a3c0c5d9e23f577e9d79f5b1dca0a81f87cf8623d8a28be1`
  - new: `64026` bytes / `7ff067a22d8b75c7be59cd5e925933fb125bb157489a6bd0960ea1cc1ca8d81c`
- `question-assets/binding-price-ceilings/CEILING-01.webp`
  - old: `68980` bytes / `ea398f249a8e1c7b6def1e0553249fbd18c134061d4d11c277937cf93a7e8a00`
  - new: `104738` bytes / `13882c3db06900367a4c3978b25e58719b09f0fcfbf2377668d25e1e038020f3`
- `question-assets/binding-price-floors/FLOOR-01.webp`
  - old: `69756` bytes / `2e135767d7b0e8a7220c030561bb0ba5594f6c8e05be455c02fb9ff094bfe3ee`
  - new: `134236` bytes / `933a323461f00bc3bf0d91c293272221c11f9b580d3cddf3da554f1a981276f4`

## Files changed

- `data/composer_library.js` — refreshed concept-level asset metadata, top-level asset inventory, generation timestamp, and `librarySha256`.
- `data/composer_library_manifest.json` — synchronized asset sizes/hashes and `librarySha256`.

## Scope notes

- The production manifest remains at 427 assets; no assets were added or removed.
- Three existing `GROWTH-01.webp` concept assets remain concept-level metadata and were already internally consistent.
- Two `ADASLRAS-01.webp` / `ADASLRAS-02.webp` files are present on disk but are not referenced by the current composer library; they were left untouched.
- The refresh corrected six stale production fingerprints: AD-01, AD-02, AS-01, AS-02, CEILING-01, and FLOOR-01.

## New library SHA-256

`727373b6c557d171ac0244f83ac65502494a5a3790073b3e645d73c58ada8816`
## Validation

- Concept-level asset metadata: 436 records checked, 0 hash/size mismatches after refresh.
- Top-level production asset inventory: 427 records checked, 0 hash/size mismatches after refresh.
- `composer_library_manifest.json` and `composer_library.js` asset fingerprints are synchronized.
- Recomputed `librarySha256` verifies against the refreshed library content.
- `tests/run_phaseGraph2_price_controls_taxes_validation.js`: PASS.
- `tests/run_full_graph_question_audit_remediation_validation.js`: PASS.
- Direct composition checks for the affected AD, AS, ceiling, floor, and combined policy/macro concept sets found 0 asset hash mismatches.
