# Unlisted 12-game hub

Hub: https://masteryquests.org/beta-testing/october-games-b9021b0dcb5f/games/

Deployed September 29, 2026 to the existing `masteryquests-website` Worker, version `69e7c1f5-13ff-47bf-936c-4d32416f89a6`. Existing Worker bindings and variables were preserved.

This area contains Takeout Taco: Lunch Rush, GDP Live, CPI Live, Labor Force Files, Room to Stay, The Main Attraction, The Economy’s Edge, Megastar Mania, Gameday Rivals, The Long Run, Money in Motion, and Signal House (both missions).

## Publication

- `games-preview.json` defines the unlisted namespace and seven standalone game directories. Five additional games use the shared scenario runtime.
- `publish-games-preview.mjs` copies the existing `game/` runtime into that namespace during the complete website build. Source artwork, reports, package files, tests, and development tools are excluded.
- Navigation URLs are rebased at build time. Every game opened from this hub returns to this same hub. JavaScript-configured CPI and labor card routes are also rebased. Relative asset paths remain intact.
- Signal House uses the canonical `games/signal-house/` name within the collection; its historical source directory and save key stay unchanged. The earlier standalone Signal House preview remains available and retains its Return to Games destination on the normal public website.
- No gameplay or economic model files are edited. Saves retain their existing storage keys on the same website origin.
- All HTML pages have `noindex,nofollow`; the entire namespace also receives `X-Robots-Tag: noindex, nofollow`. The public website has no links to the namespace, and the public Signal House release flag remains disabled. This is an unlisted testing area, not password-protected access.

## Verification

`node --test audit_tools/econ_rpg/publication.test.mjs` verifies that only runtime formats ship, all preview HTML carries robots metadata, and no preview links or private game material escape into public pages. Existing standalone Signal House release checks also pass.

`node audit_tools/econ_rpg/tests/games-preview.cjs` exercises all 12 real hub links, an interactive gameplay action in each game, and every Return to Games link at desktop 1440px and phone 390px widths. It verifies card artwork, all 233 runtime file responses, and the absence of a preview link on the normal public Games page. The live run uses `GAMES_PREVIEW_ORIGIN=https://masteryquests.org` and additionally checks the live indexing header.

Screenshots and machine-readable results are kept in ignored `tmp/games-preview/local/` and `tmp/games-preview/live/`. Desktop and phone hub layouts were visually inspected.

Local and live results: **24/24 game launch, interaction, and return checks passed** (12 games at each width); **233/233 runtime files returned HTTP 200**. The live indexing header and absence of a collection link on the public Games page were verified. No captured page errors or failed asset responses occurred. These are navigation/playability smoke checks, not new full completion playthroughs of every game.

## September 29 access restoration

A later deployment, `582e34f5-16a3-4c2b-b130-728830b62600`, replaced the staged asset set with repository-root files. Both unlisted preview areas returned 404 while the public Games page remained available. Root-only report files were reachable, confirming that this was the wrong publication directory.

Redeployed the complete generated site as version `378d4b80-b358-4253-8baf-29be50c1a682`, preserving Worker bindings and variables. Live checks again passed all 24 game launch/interaction/return cases and all 233 runtime asset requests. The separate Signal House preview returned HTTP 200; the collection hub and Signal House title screen were also verified in the in-app browser.

`wrangler.jsonc` now runs `node audit_tools/public_site_publication/build-dist.mjs` before deployment and retains `assets.directory: "./dist"`. Publication tests verify these settings and that other runtime configuration remains unchanged.

The separate Cloudflare automatic-build configuration could not yet be inspected: the CLI credentials return 403 for Workers Builds settings and the dashboard requires sign-in. Ensure its deployment command respects this configuration, for example `npx wrangler deploy --config wrangler.jsonc --keep-vars`, with no `--assets .` override. The repository build hook does not override a conflicting command-line asset directory. Dashboard verification remains pending sign-in.
