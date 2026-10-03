# Growth Realms — interaction cues, spacing and beta integration

This correction pass preserves the economic model, progression, allocation, six-cycle flow, commit animation, floating allocation feedback, title copy and final report.

## Implementation

- **One circular cue system:** hover is a 24% white circular fill; selected/focused districts use a 3px white ring at the same position. The circle sits over the building, centered in its actual interaction target. Removed the detached ground ring and unused planned-allocation badge markup. The transparent target is elliptical; it no longer paints a diamond/square background. See `cleanup.css` 12–16, `map-engine.js` targeting markup and ownership layer, and `game.js` allocation updates.
- **More room:** district separation grows from 4 to 5.5 ground tiles, while building sprites remain 238 native pixels. The canvas grows from 768×512 to 896×576 and the camera to 864×552. The desktop panel widens to 1280px, keeping the existing 295px district sidebar. Camera dimensions now drive canvas sizing, pointer targets, feedback placement and responsive map proportions. Roads move with the districts. See `visual-config.js`, `map-engine.js`, `game.js`, and `cleanup.css`.
- **Scenery:** moved trees to outer verges, removed trees from the riverfront road area, and separated housing and service props from major lots. Props and vehicles now use consistent ground-contact offsets. Trees are included in collision checks, alongside district and support-building footprints. Tests include a half-tile road surface plus margin rather than checking only a centerline. See `scene-layout.js` and `tests/cleanup.test.js`.
- **Preserved feedback:** clicking still spends +1 and updates budget, sidebar, upgrade preview and floating `+1 CAPITAL`. Commit still locks plans, shows the existing progress bar and construction sequence, then resolves both economies. The sole load-time adjustment disables Start Game until its event handlers are ready, preventing an early mobile tap from being lost.
- **Beta hub:** added Growth Realms to the existing card grid, increasing the count from 13 to 14. Its card reuses the production river illustration through `card.js`. The publisher copies the authoritative game into `beta-testing/october-games-b9021b0dcb5f/games/growth-realms/`, adds noindex metadata and Return to Games navigation, and excludes tests, reports and authoring files. The normal public Games page is unchanged; the public build excludes the source `play/growth-realms/` route.

## Files changed in this pass

Production game files: `index.html`, `game.js`, `map-engine.js`, `visual-config.js`, `scene-layout.js`, `cleanup.css`; added `card.js`.

Beta integration: `audit_tools/econ_rpg/game/games/index.html`, `audit_tools/econ_rpg/game/games/library.css`, `audit_tools/econ_rpg/games-preview.json`, `audit_tools/econ_rpg/publish-games-preview.mjs`, `audit_tools/public_site_publication/build-dist.mjs`.

Verification/documentation: `tests/interaction.test.js`, `tests/cleanup.test.js`, `tests/cleanup-browser.test.mjs`, `audit_tools/econ_rpg/tests/games-preview.cjs`, `package.json`, `README.md`; added `tests/cues-browser.test.mjs`, `tests/beta-build.test.js`, and this report. Existing changes from the earlier presentation/cleanup pass remain in the working tree.

## Verification

- 30 pure/model/build test groups pass. The frozen model/configuration contract passes; economic and report calculations are unchanged.
- At 1366×768 and 100% zoom, the full map is approximately **850×543px**, ending at y=750 beneath the HUD. District targets are **181×157px**, with no overlap between their elliptical interaction areas.
- Phone targets are about **77×67px at 390px** and **62×54px at 320px**. Both phone widths launch from the beta card, load the game and allocate a point by touch without horizontal overflow.
- The real commit progress bar advances between 0 and 100, both cities resolve, and six cycles reach the unchanged report, transfer question and replay. Starting and upgraded views of both cities were captured and inspected.
- Route sampling covers full ambient loops, correct directional poses, ground-contact draw order and scenery/building clearance. The prior gameplay suite also completes both city choices through six cycles.
- The beta smoke suite checks all 14 launch/interaction/return paths at desktop and phone widths, plus all staged beta runtime assets.

## Live deployment

Live hub: https://masteryquests.org/beta-testing/october-games-b9021b0dcb5f/games/

Direct game: https://masteryquests.org/beta-testing/october-games-b9021b0dcb5f/games/growth-realms/

Deployed October 3, 2026 as Worker version `fc842f67-325e-49fa-85de-465e3cf8d130`. Live cue/mobile/full-run tests pass, as do 28 launch/interaction/return checks for all 14 beta games and 286 asset requests. A further 312 checks confirm the deployed game bytes and preservation of unrelated live content. The namespace retains noindex headers and metadata.

The first full-build deployment (`90ed7058-db14-4c66-bf51-3abed2c88e62`) briefly included unrelated committed files that differed from production. It was rolled back to the prior version (`f0e4201f-2b1f-4b59-ab64-eb60bbfa7aca`). The final upload was isolated by comparing public asset fingerprints and preserving live HTML/content outside this beta change. The seven gated classroom assets and Worker code remain unchanged in source; bindings and variables were preserved. Unrelated working faculty-guide edits were neither changed nor included in the final release. Deployment evidence is in the ignored `cue-pass/isolated-assets.json` and `cue-pass/live/deployment-verification.json` files.

## Captures

Live captures are recorded under `tmp/games-preview/growth-realms/cue-pass/live/`; local captures use the sibling `local/` directory. Images are test evidence and are not loaded by the game.

| Requested view | Capture |
| --- | --- |
| Hover circle | [01-hover.png](../../tmp/games-preview/growth-realms/cue-pass/live/01-hover.png) |
| Selected ring | [02-selected.png](../../tmp/games-preview/growth-realms/cue-pass/live/02-selected.png) |
| +1 allocation feedback | [03-plus-one.png](../../tmp/games-preview/growth-realms/cue-pass/live/03-plus-one.png) |
| Corrected Meridian roads/scenery | [04-clear-roads-meridian.png](../../tmp/games-preview/growth-realms/cue-pass/live/04-clear-roads-meridian.png) |
| Desktop beta entry | [05-beta-entry.png](../../tmp/games-preview/growth-realms/cue-pass/live/05-beta-entry.png) |
| Phone beta entry | [06-mobile-beta-entry.png](../../tmp/games-preview/growth-realms/cue-pass/live/06-mobile-beta-entry.png) |
| Existing commit progress | [07-commit-progress.png](../../tmp/games-preview/growth-realms/cue-pass/live/07-commit-progress.png) |
| Upgraded Meridian / Rivermark | [Meridian](../../tmp/games-preview/growth-realms/cue-pass/live/08-upgraded-meridian.png), [Rivermark](../../tmp/games-preview/growth-realms/cue-pass/live/09-upgraded-rivermark.png) |
| Starting Rivermark | [10-clear-roads-rivermark.png](../../tmp/games-preview/growth-realms/cue-pass/live/10-clear-roads-rivermark.png) |
| Phone game | [11-mobile-game.png](../../tmp/games-preview/growth-realms/cue-pass/live/11-mobile-game.png) |

## Remaining oddities

This is not a finished visual release. Existing sprites contain baked-in trees, parked vehicles and lot details; these remain part of the district artwork. Moving sprites still make abrupt turns at the retained 8 FPS cadence. Vehicles do not avoid each other. Late-level annex art and some road junctions remain visually simple. Phones still use the existing vertically stacked map and controls, rather than a new mobile layout.
