# Private RPG refinement — copy and neighborhood scenes

This report records the first scene-system pass, when the image reference was missing. The subsequent reference-informed drawing pass and its current screenshots/results are in [ART-QA-REPORT.md](ART-QA-REPORT.md).

The skyline has been replaced with an original, state-responsive 2D neighborhood diorama. Promotional taglines have been replaced with direct scenario labels. The six-decision game, all 200 paths, effects, endings and serialized saves are unchanged.

The requested reference PNG was **not available** at `/mnt/data/colorful_isometric_waterfront_neighborhood.png` or in the accessible attachment/workspace files. The result follows the written art direction; a claim of exact visual fidelity to that image would be unsupported. Reference comparison remains a manual QA item.

## Files

Added:

- `game/art/neighborhood.svg`: original local artwork with five named scene views.
- `art/build-neighborhood.mjs`: reproducible artwork source with shared buildings, roads and props.
- `art/README.md`: provenance, visual direction and editing instructions.
- `game/scenes.js`: read-only scene selection and accessible figure rendering.
- `game/scenarios/housing-scenes.js`: housing-specific conditions, labels and alternative text.
- `scenes.test.mjs`: visual selection, local assets, reachability and old-save compatibility tests.
- `REFINEMENT-REPORT.md`: this report.

Modified:

- `game/index.html`: removed slogan and CSS skyline markup.
- `game/rpg.css`: reduced hero height, removed skyline rules and added responsive figure/caption styling.
- `game/ui.js`: renders the selected neighborhood after the screen heading and uses direct action/debrief labels.
- `game/scenarios/housing-crisis.js`: imports the scene configuration and updates presentation copy only.
- `browser.test.mjs`: new labels and checks/screenshots for all five SVG views at desktop/mobile sizes.
- `README.md`, `IMPLEMENTATION-REPORT.md`: current visual documentation and link from the initial-build record.

No files outside `audit_tools/econ_rpg/` were modified in this pass.

## Copy changes

| Previous | Current |
|---|---|
| Economics in the making | Removed |
| Six decisions. One city. More than one way forward. | A branching housing-policy scenario |
| A city needs your advice | Housing policy brief |
| Take your seat | Begin scenario |
| The city responds | Policy consequences |
| What if you had… | Alternative decisions |

“Room to Stay” remains the scenario title. Decision wording, mechanisms, consequences, tradeoffs and ending eligibility were preserved.

## Visual system

The new art uses an elevated oblique view, apartment blocks with individual windows and balconies, mixed-use shops and awnings, pitched and flat roofs, rooftop equipment, a bus shelter, crossings, small vehicles, trees, pedestrians and a waterfront promenade. Crisp vector shapes and a restrained terracotta/ochre/teal palette interpret the requested pixel-inspired, cel-shaded direction without literal retro pixels or a 3D runtime.

One local SVG sheet reuses common groups across five named views. The selector only reads existing state/history. It changes the image fragment, descriptive alt text and visible caption; it has no state effects, additional save data or network hooks. The five scenes are:

1. **Existing neighborhood:** the initial apartment/shop district.
2. **Limited vacancies:** a viewing sign and a queue at the lettings office.
3. **Deferred maintenance:** boarded windows, worn plaster, materials and scaffolding on older apartments.
4. **Housing under construction:** a crane, exposed structural frame and fencing following an enabling supply decision.
5. **New homes completed:** apartments occupy the service-yard plot after the final review delivers sufficient additional housing.

The last scene is not a success score: completed homes can coexist with budget pressure. Maintenance has display priority when quality is low; every other outcome remains available in the textual consequences and indicators. The complete selection rules are in the README.

## Mobile and accessibility

The scene appears directly after the current heading and stays with its decision, consequence or debrief when focus advances. A smaller functional title area replaces the large promotional hero. On a 320px viewport the figure remains full-width within the card, with a minimum 180px image area and a wrapping text caption. It adds no interactive controls or tab stops. Scene details never carry instructions or data that must be read from tiny signs.

Native buttons, visible focus, Tab/Enter/Space operation, restart dialog/Escape handling, focus transfer, live state announcements, text directions, readable decision cards and reduced-motion handling remain intact. Alt text and visible captions describe the scene; existing consequence text explains every economic change independently. There is no motion or color-based answer grading.

## Verification

- **13 RPG tests passed:** eight engine/storage/schema, three scene/compatibility, two publication/protected-file checks.
- **200 complete legal paths unchanged**, with all five endings still reachable and six decisions per run.
- Compared all pre-refinement v1 serialized histories against the revised scenario. A frozen SHA-256 now guards that invariant; old saves reconstruct exactly and do not require a version bump.
- **28 complete browser runs passed**, plus focused keyboard, restart, save/resume, storage-denial and version-mismatch checks.
- All five scene states loaded and produced distinct screenshots at **1280px and 320px**. Additional layout checks at 390px and 640px passed. No horizontal overflow, failed images, external requests, CSP violations, console errors or runtime errors were observed.
- **36 existing Econ-nections regression tests passed** without changes to those files.
- The real local production builder completed and excluded the RPG. Protected production files remained unchanged.

Commands:

```powershell
node --test audit_tools/econ_rpg/engine.test.mjs audit_tools/econ_rpg/scenes.test.mjs audit_tools/econ_rpg/publication.test.mjs
# PLAYWRIGHT_MODULE points to the already-available local Playwright package.
node audit_tools/econ_rpg/browser.test.mjs
node --test audit_tools/econnections/engine.test.mjs audit_tools/econnections/calendar-date.test.mjs audit_tools/econnections/classroom.test.mjs audit_tools/econnections/classroom-tools.test.mjs
```

## Inspect first during QA

1. **Art and gameplay together at 320px:** open the first decision and its consequence. Check that the full scene is useful at phone size without making the decision tedious to reach.
2. **Supply sequence:** emergency grants → focused support → inspections → permit reform. Confirm the construction scene. Taper support → prioritize access; confirm completed apartments appear at the final review, not earlier.
3. **Maintenance sequence:** rent ceiling → vacancy lottery → phase in repairs. Confirm scaffolding/boarded windows and the “Deferred maintenance” caption, alongside the written quality decline.
4. **Housing pressure:** choose the ceiling, inspect the queue/caption, reload and resume. The correct scene and exact state should return without reapplying effects.
5. **Reference match:** compare the scene with the actual supplied PNG once available, particularly palette, density and viewpoint. That comparison could not be performed here.

**Does any scene still feel placeholder?** The old skyline is gone; all five states use complete authored neighborhood artwork. The small pedestrians, vehicles and signs remain deliberately stylized. The pressure and maintenance changes are subtler at phone size, so their text labels are important. Instructor visual approval is still needed.

**Would another art pass help before October?** Yes: compare against the missing reference and tune small-screen emphasis, facade variety and local character. This is a focused polish recommendation, not a need for more mechanics or a larger scene system.

No deployment, push, remote resources, public links, production configuration changes, telemetry changes or unrelated asset edits occurred. The prototype remains local-only and excluded from publication.
