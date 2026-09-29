# Signal House — release preparation, September 29, 2026

## Deployment and publication

- Live unlisted device URL: https://masteryquests.org/beta-testing/signal-house-4e2ce7c23dc8/
- Eventual public route: `/games/signal-house/` (staged, not publicly released).
- Cloudflare Worker: `masteryquests-website`; deployed version `cd96a838-2690-4914-b372-064b788e433a`.
- Deployment used the complete allowlisted `dist/` website, the unchanged existing Worker/bindings, and `--keep-vars`. No private prototype directory was published wholesale.
- `signal-house-release.json` is the release configuration. `publicReleased: false` leaves Game #12 absent from the live public hub. `signal-house-card.html` supplies its staged card; the insertion point is the repository-root `games/index.html` marker `SIGNAL_HOUSE_RELEASE_CARD`.
- `publish-signal-house.mjs` copies the same runtime to the unlisted route and, when explicitly enabled in a future release, to the public route. The unlisted HTML alone adds the robots meta tag. All 86 non-HTML runtime files match the source byte for byte.
- The preview has `noindex,nofollow` in HTML and the live `X-Robots-Tag` header. A build-wide scan found no public HTML, navigation, JSON, JavaScript, XML, or text links to it. This is an unlisted URL, not authentication.
- Future public enablement also creates a static compatibility page at `/games/the-shock-house/`. Both old and canonical URLs work in the updated local development server.

## Names, navigation, and compatibility

Player-facing title: **Signal House — An Economic Escape**. Mission 1: **The Broken Signal**. Mission 2: **The Second Harvest**. Title metadata, appropriate start/unlock/result screens, card copy, and game documentation use the final names. The game has no existing Open Graph framework, so none was introduced. A source search found no remaining player-facing old title. Economic references to supply shocks remain intact; no puzzle/economic logic changed.

RETURN TO GAMES goes to **https://masteryquests.org/games/**. It appears on title/results screens and inside Case Menu during exploration. Targets are at least 44px high. Leaving through it preserves the investigation; the masthead also points at `/games/` rather than the route parent.

Intentionally retained legacy identifiers:

- Save key `mastery-quests.shock-house.v1` and existing version/migration logic.
- Source directory `audit_tools/econ_rpg/game/games/the-shock-house/`.
- Test directory `audit_tools/econ_rpg/tests/shock-house/`, screenshot paths under `tmp/shock-house/`, and `SHOCK_HOUSE_*` test environment variables.
- Legacy route `/games/the-shock-house/` for compatibility.

Saves remain browser-origin specific. Existing local saves still load locally; localhost storage does not automatically transfer to HTTPS. The live preview and eventual public route share the same save key on the live origin.

## Hub artwork

Signal House reuses the approved illustrated exit panorama, copied without regeneration to `assets/images/games/signal-house-card-20260929.webp` (768×512). The staged public card uses the existing public Games grid/card styles and four restrained topic labels. The private 12-game library also identifies Signal House as Game #12 and uses the canonical local route.

Long Run card only:

- Old image: `audit_tools/econ_rpg/game/art/scenes/the-long-run/the-long-run-hub.png` (840×474).
- Replacement: `audit_tools/econ_rpg/game/art/scenes/the-long-run/the-long-run-hub-canvas-20260929.png` (480×270).
- Markup: `audit_tools/econ_rpg/game/games/index.html`.
- Display rule: `audit_tools/econ_rpg/game/games/library.css`; contain the full native 16:9 city inside the established card frame, centered with crisp pixel rendering. No stretching or clipped buildings.
- Provenance: the current Canvas renderer approved in `THE-LONG-RUN-CANVAS-REPORT.md` and `THE-LONG-RUN-FIDELITY-REPORT.md`. The capture is an actual Year 4 scene after confidence, fiscal expansion, and rate-cut turns. No Long Run runtime files changed.
- Long Run currently exists in the private mini-game library, not the live public website hub. Its updated card remains in that existing library; unrelated games were not released by this pass.

## Verification

- Engine, household, branching, cost-rails, and recovery state suites passed; engine includes 54 assertions.
- Publication checks passed: unrelated private prototypes excluded; unrelated site/game/Worker source unchanged.
- `release.mjs` passed: runtime hashes, no public preview links, indexing metadata, disabled public route/card, enabled-route fixture, and legacy redirect.
- `release-hub.cjs` passed at 1440px, 390px, 844×390, and 768px: all 12 private cards, current Long Run image, canonical game link, and actual enabled public-card markup. Screenshots visually inspected, including desktop and phone card crops.
- Full Mission 1 seven-puzzle playthrough passed on the local built preview. Full Mission 2 passed locally at 1440px and 390px, including partial/completed reloads and preserved Mission 1 results.
- Both full playthroughs also passed against the deployed HTTPS preview: Mission 1 at 1440px (including its responsive checks) and Mission 2 at 390px.
- Interaction regression passed: actual touch swipe, camera translation, dragging, pointer tuning, reduced motion, optional outlines, legacy/partial saves, malformed-save handling, and denied storage.
- Live HTTPS release-browser checks passed at **1440×1000**, **390×844 portrait**, **844×390 landscape**, and **768×1024**. Verified title/subtitle/mission names, real touch events, clue discovery, satchel/hints/menu, new and valid legacy saves, Mission 2 unlock/reload, 44px Return control, no control overlap, actual public-hub return, and indexing headers. All **87** shipped files returned HTTP 200, with no captured page errors or failed asset responses.
- Live rendered title, close-ups, menu, and public hub were inspected. Portrait and short landscape close-ups retain vertical scrolling for tall documents.
- Browser automation uses Chrome touch-capable viewports; it is not a substitute for the requested hands-on phone test. The exact HTTPS URL above is ready for that test.

Release screenshots and machine-readable results are in ignored `tmp/signal-house-release/`. The repeatable checks live in `tests/shock-house/release.mjs`, `release-browser.cjs`, and `release-hub.cjs`.
