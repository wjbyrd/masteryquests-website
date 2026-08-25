# Phase 3C Repository Hygiene Audit

## Scope and method

Read-only inventory of all 3,566 tracked files. File sizes came from the current checkout; `.git` was measured separately. WebP, PNG, JPEG, GIF, MP4, WebM, WAV, PDF, DOCX, XLSX, ZIP, font, and icon files were hashed with SHA-256. No file was deleted, moved, recompressed, or rewritten.

## Size summary

| Measure | Bytes | MiB |
| --- | ---: | ---: |
| Current checkout, excluding `.git` | 977,275,324 | 932.0 |
| `.git` object/history storage | 883,459,830 | 842.5 |
| Tracked WebP/PNG/JPEG images | 289,653,216 | 276.2 |
| WebP: 1,551 files | 213,781,688 | 203.9 |
| PNG: 102 files | 75,871,528 | 72.4 |
| JPEG/JPG | 0 | 0.0 |

Checkout and `.git` totals measure different things and must not be added together as a cleanup estimate.

## Largest tracked files

| Path | Bytes | Recommendation |
| --- | ---: | --- |
| `play/managerial-intelligence-directorate/menu_mist.mp4` | 26,137,728 | KEEP: live collection media |
| `downloads/faculty-assets/mastery-quests-market-gate-starter-asset-pack.zip` | 20,195,701 | KEEP: current faculty download |
| `build/faculty-build-composer/data/composer_library.js` | 15,623,727 | KEEP: canonical production library |
| `play/micro-domains/labyrinth-of-choice/boss_battle_music.wav` | 15,621,288 | KEEP: live game audio |
| `play/micro-domains/labyrinth-of-choice/chamber.wav` | 9,596,332 | KEEP: live game audio |
| `validation_artifacts/general_economics_final_maturation/generated_packages/integrated-economic-analysis/index.html` | 8,163,957 | REVIEW: retained validation output |
| `build/faculty-build-composer/tests/monopoly-sample.html` | 6,343,811 | KEEP: active generated fixture |
| `legacy/phase5.2b-stage4-faculty-concept-composer/data/composer_library.js` | 6,145,701 | REVIEW under archive policy |
| `legacy/phase5.2b-stage2-faculty-concept-composer/data/composer_library.js` | 5,951,990 | REVIEW under archive policy |
| `legacy/phase5.2b-faculty-concept-composer/data/composer_library.js` | 5,819,320 | REVIEW under archive policy |
| `play/economic-realm/menu_music.mp3` | 5,605,894 | KEEP: live collection audio |
| `play/macro-command-system/menu_mist.mp4` | 5,351,115 | REVIEW: exact copy also used by Micro hub |
| `play/micro-domains/menu_mist.mp4` | 5,351,115 | REVIEW: exact copy also used by Macro hub |

## Largest tracked images

The 15 largest images are Micro achievement PNGs, from `quizinator.png` (3,501,586 bytes) through `trial-by-clock.png` (1,540,186 bytes), totaling 39,665,000 bytes. They are not safe deletion candidates: the live hub requests same-stem `.webp` names that are absent. This is a reference defect, not evidence that the PNG artwork is obsolete.

Other large images include the three Mastery Report 2.0 evidence PNGs (1.87-2.20 MiB each), the Monopoly graph contact sheet (1.95 MiB), and concept-review contact sheets. These are evidence/audit assets rather than runtime theme slots.

## Exact duplicate groups

The complete 252-group, 1,249-file inventory with every SHA-256 and path is stored at `C:\Users\Jennings\AppData\Local\Temp\mq-phase3c-duplicates.json`. Highest-impact groups are summarized below.

| SHA-256 | File bytes | Copies | Theoretical savings | Paths / interpretation |
| --- | ---: | ---: | ---: | --- |
| `f6de18ef2d70b6902e43021e2a311e2fdc09fcb89cbac74411478d49e4548aa2` | 540,966 | 14 | 7,032,558 | `streak.wav` in five Economic Realm games, four Macro Command games, four Managerial games, and Labyrinth of Choice. Intentional path-local runtime dependency; REVIEW, not safe delete. |
| `fe3d363e28a4d8142fb4244a93259c40455cd4146377001b7128d38cdd7e4c3b` | 77,908 | 76 | 5,843,100 | `lrpc.webp` across active concept-scoped Composer media, legacy snapshots, generated fixtures, and Stabilization Protocol. Architecture/path intentional; KEEP. |
| `92a1cec009ee3be278764aa2a75713c1c0a096b0deb3c1264051f9d5fbd8f5be` | 5,351,115 | 2 | 5,351,115 | `play/macro-command-system/menu_mist.mp4`, `play/micro-domains/menu_mist.mp4`. REVIEW for future shared-hub asset path. |
| `0e6036cb18656e910c724df79e081f822836d4e4207033fcafcdcded5c122389` | 95,910 | 49 | 4,603,680 | `supplydemand1.webp` across active concept scopes, legacy snapshots, generated fixtures, Equilibrium Crisis, and Market Gate. KEEP under current path contract. |
| `7f06a964e72a1661aa4778395042ea189181654d59d996721a86979b086af1ed` | 110,816 | 41 | 4,432,640 | `taxincidence.webp` across active concept scopes, legacy snapshots, generated fixtures, Equilibrium Crisis, and Market Gate. KEEP under current path contract. |
| `d70ef13ab6a98967e9695cc8d50b707ac8ccfaf3a913527b04ca1485a8e047a4` | 74,646 | 58 | 4,254,822 | `ad_ms_md.webp` across concept scopes, snapshots, fixtures, and macro games. KEEP under current path contract. |
| `b5f3ec0ec53b70123462a648998264c781b25f252279fedc48b37592c10fc7ab` | 822,628 | 5 | 3,290,512 | `unlimited-mode.webp` in all five Economic Realm game directories; also the canonical official-theme source hash. Intentional deployed copies; KEEP. |
| `bb8505793975bf11e9a9d7d47d56631e1792163de8ab0b7a18a2d093ec24d2fe` | 176,608 | 14 | 2,295,904 | `victory.wav` across the same 14 deployed games. Intentional path-local dependency; REVIEW only. |
| `a434c5a0a6d8bd1580edefb1c49f4d3936b685e30f71ab7397e1e7f657113fb2` | 496,596 | 5 | 1,986,384 | `scoreattack.webp` in five Economic Realm game directories. Intentional deployed mode card; KEEP. |

Repeated Macro and Managerial mode cards form additional four-copy groups of roughly 0.37-0.46 MiB per source image. Consolidating them would require broad deployed path changes and could reduce directory portability.

## Candidate assessment

| Candidate | Current references | Possible savings | Recommendation |
| --- | --- | ---: | --- |
| Duplicate Macro/Micro hub video | Both hubs load local `menu_mist.mp4` | 5,351,115 | REVIEW: easiest consolidation, but requires deployed path changes |
| Shared game SFX | Every game loads sibling `streak.wav` / `victory.wav` | 9,328,462 combined | REVIEW: retain while game folders are independently portable |
| Repeated family mode cards | Sibling game HTML and official-theme manifests | Multiple MiB | KEEP under current deployment contract |
| Concept-scoped graph copies | Composer manifests and question records | Tens of MiB theoretical | KEEP: dynamically resolved instructional media |
| `legacy/` Composer snapshots | Historical reports, checksum records, and fixtures | Substantial | REVIEW only under an explicit archive-retention phase |
| `validation_artifacts/` generated packages | Validation evidence and regression baselines | Substantial | REVIEW only with test-owner approval |
| Micro achievement PNGs | Intended counterparts to missing `.webp` references | 39,665,000 | KEEP; repair references in a separate deployed-hub phase |

## Savings interpretation

`169,765,769` bytes is a mathematical one-copy-per-hash ceiling, not a safe cleanup number. Exact duplicates often exist because every deployed game directory is self-contained or because the Composer addresses question media by concept-specific paths. Immediate safe savings established in Phase 3C: 0 bytes.

## Final recommendation

KEEP current runtime and instructional assets. Schedule a separate repository-hygiene phase only if it can define archive retention and whether deployed collections may share central asset paths. The first low-risk investigation should be the two identical hub videos; the first correctness task should be the Micro achievement extension mismatch. Do not rewrite Git history as part of either task.
