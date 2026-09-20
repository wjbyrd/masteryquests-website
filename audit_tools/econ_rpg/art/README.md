# Linden neighborhood artwork

`build-neighborhood.mjs` authors the original local 2D SVG in `../game/art/neighborhood.svg`. Run it with Node from any working directory. The output is deterministic and requires no packages, network, renderer or runtime script in the game.

The illustration was written specifically for this prototype. It includes no traced or embedded stock images, downloaded icons, fonts or externally licensed textures. The approved image is now available as the user-supplied `codex-clipboard-0b5009a6-5235-44d7-aaed-14bbb1fb83ec.png` and was visually inspected for the current pass. It informed edge hierarchy, architectural separation, useful street detail, color and framing. No building, street layout, mural, character, sign, trademark or distinctive reference element was traced or reproduced. The reference is not a runtime asset and has not been copied into the game.

This is vector artwork arranged on a flat SVG plane. The coordinate helper places drawn polygons at an elevated oblique angle; it is not a 3D scene, mesh renderer, camera system or interactive city simulation. Geometry remains crisp instead of using literal low-resolution pixels.

Common street ground, rear buildings, road traffic, foreground buildings, the existing service yard and waterfront details live in reusable SVG groups. Traffic is drawn before foreground facades to prevent vehicles appearing on buildings. Named views remain `baseline`, `pressure`, `maintenance`, `construction`, and `homes`. Each view reuses that structure; larger localized overlays alter the rental queue, repairs or service-yard development. The scene configuration carries explanatory alt text and labels outside the drawing. Tiny signs are atmosphere, never instructions.

## Comparison with the approved image

| Quality | Previous Linden | Approved reference | Targeted change |
|---|---|---|---|
| Crispness | Thin, low-contrast edges blended together at gameplay size | Strong silhouettes and recessed window shapes | Darker outlines with a hierarchy of weights; inset glazing, pale frames and projecting sills |
| Architecture | Repeated flat boxes with similar window bands | Individual facades, shopfronts and roofs | Brick, stone and modern treatments; projecting stone bay; two-level balconies; fuller storefronts; clock turret |
| Density | Sparse street props and broad empty margins | Continuous lived-in environmental detail | Produce tables, flower boxes, roof equipment, bus furniture, fuller trees and pavement activity; retained open crossings |
| Color | Dusty colors with weak roof/wall distinction | Bright controlled local color and clear shadow planes | Deeper slate roofs, blue glass, warm masonry, distinct shaded sides and two-tone foliage |
| Line definition | Almost every shape used the same fine outline | Major structures separate from fine detail | Main polygons about 1.35 SVG units, rails/structural outlines 1.5–2.8, detail lines 0.65–1.1; silhouette-specific heavier elements |
| Composition | Complete miniature board surrounded by light background | Close architectural framing with selective edge crops | Common viewBox tightened to `115 8 795 505` (offset per fragment), bounded cover framing in the actual card |
| Personality | Interchangeable buildings | Recognizable place with local character | Original Quay Books clock turret, projecting-bay lettings block, blue cafe and blue-roof transit shelter |

Linden now approaches the reference more closely in architectural definition and scene occupancy. It intentionally remains flatter, less painterly and less microscopically detailed. The reference is a dense portrait illustration; Linden is a short gameplay-card illustration that must keep two changing foreground areas recognizable at 320px. Its roads, buildings and landmarks remain its own.

## Mastery Quests RPG Art Bible — v1

**Viewpoint and shape.** Use a fixed elevated oblique **2D** view. Linden's drafting basis is `screen x = origin + 1.05(x − y)`, `screen y = origin + 0.5(x + y) − height`. This places vector shapes; it is not a 3D runtime. Future districts should keep the visual angle consistent while authoring their own layouts. Borrow pixel-art city maps' spatial clarity, not literal pixels, jagged sprites or image-rendering tricks.

**Line hierarchy and architecture.** Use a dark blue-charcoal structural outline. Silhouettes and major frames must survive the phone-size reduction; smaller masonry and mullions use thinner strokes. Favor recognizable facades with entrances, window recesses, cornices, balconies and roof edges over uniform cubes. Assign a deliberate identity to important buildings rather than randomly varying boxes.

**Shading and palette.** Limit each material to a base, shaded side and occasional light plane. Use local color: warm brick/stone, restrained cool painted facades, dark blue glazing, slate roofs, green foliage and warm paving. Architectural contrast comes from adjacent planes and drawn edges, not sharpening, saturation filters, dramatic lighting or upscaling. Avoid gradients and gloss in the scene art.

**Density and landmarks.** Include enough useful detail to imply daily life: shops, access points, transit, maintenance, vehicles, plants and people. Keep crossings and important entrances legible. Establish one or two original landmarks and retain them across all views. Do not fill every space or borrow the reference's distinctive buildings or composition.

**Scene conditions.** Reuse one shared neighborhood and small condition-specific replacements/overlays. Five views are enough here; author more only when they explain a genuinely distinct condition. Use geometry and objects, not city-wide recoloring: a queue for access pressure, repairs for deterioration, an exposed frame for construction, completed glazing/entrances for delivered housing. Construction must not look occupied. Do not multiply assets by decision path.

**No visual grading.** Keep palette, daylight and the neighborhood identity consistent. New housing can coexist with fiscal stress. Never use green/red city grades, victory glow, disaster lighting, happy/sad inhabitants or a pristine city as an economic score.

**Mobile composition and accessibility.** Test the actual game card at 320px, 390px and desktop. Use deliberate framing; foreground state changes must survive the crop. At phone widths the illustration is 200–240px high, preserving room for prose and choices. Judge distinctions with captions hidden, then restore meaningful captions and alt text. Tiny labels are flavor only. Text consequences, indicators and debrief remain authoritative; art supports rather than replaces economics. Keep keyboard order, focus and reduced-motion behavior unchanged.

**Future scenarios.** Reuse this visual grammar for independently authored port, financial, business or industrial districts. Share drafting helpers and condition-based composition, not Linden's specific buildings or economic assumptions. No additional scenario art is included in this pass.

Editing guidance:

- Change facades or props in shared drawing helpers to keep the neighborhood consistent across views.
- Keep three restrained tone levels per surface: facade, shaded side and roof. Avoid realism, gradients and gratuitous effects.
- Preserve recognizable landmarks across variants. Do not recolor the entire city into a red/green outcome grade.
- Keep construction and completed apartments distinct; a crane does not mean homes are already available.
- Rebuild the SVG after source changes, then run scene and browser tests. Review the generated `tmp/econ-rpg/scene-1280-*.png`, `scene-390-*.png`, and `scene-320-*.png` files. `art-only-*.png` removes captions for comparison.
- Do not introduce external references, scripts, fonts or embeds. The production publication guard excludes this entire development tree.

The September 20 visual-communication pass increases architectural brightness and darkens structural edges to 1.5 SVG units, keeping fine surface detail subordinate. A pale sky backdrop replaces green-gray; curved water marks, a short landing and one moored boat distinguish the water from roads. The larger rental queue and warm curtained windows strengthen the pressure scene; exposed masonry strengthens maintenance; blue site fencing and safety cones distinguish construction from the bright finished building and planted entrance. The existing red-car correction remains shared. No CSS image filters or extra scene states were introduced. See [VISUAL-CLARITY-REPORT.md](../VISUAL-CLARITY-REPORT.md) for current phone/desktop comparisons; [ART-QA-REPORT.md](../ART-QA-REPORT.md) records the earlier art pass. Remaining fine detail is polish; instructor observation should still confirm that students interpret the visual cues as intended.
