# Linden neighborhood artwork

`build-neighborhood.mjs` authors the original local 2D SVG in `../game/art/neighborhood.svg`. Run it with Node from any working directory. The output is deterministic and requires no packages, network, renderer or runtime script in the game.

The illustration was written specifically for this prototype. It includes no traced or embedded stock images, downloaded icons, fonts or externally licensed textures. The requested PNG at `/mnt/data/colorful_isometric_waterfront_neighborhood.png` was unavailable; the written reference description guided the oblique viewpoint, urban density, facade details, crisp simplified geometry, flat shading and controlled color palette. Exact reference matching is unverified.

This is vector artwork arranged on a flat SVG plane. The coordinate helper places drawn polygons at an elevated oblique angle; it is not a 3D scene, mesh renderer, camera system or interactive city simulation. Geometry remains crisp instead of using literal low-resolution pixels.

Common street ground, rear buildings, foreground buildings and street details live in reusable SVG groups. Named views are `baseline`, `pressure`, `maintenance`, `construction`, and `homes`. Each view reuses that structure; small overlays alter the rental queue, repairs or service-yard development. The scene configuration carries explanatory alt text and labels outside the drawing. Tiny signs are atmosphere, never instructions.

Editing guidance:

- Change facades or props in shared drawing helpers to keep the neighborhood consistent across views.
- Keep three restrained tone levels per surface: facade, shaded side and roof. Avoid realism, gradients and gratuitous effects.
- Preserve recognizable landmarks across variants. Do not recolor the entire city into a red/green outcome grade.
- Keep construction and completed apartments distinct; a crane does not mean homes are already available.
- Rebuild the SVG after source changes, then run scene and browser tests. Review the generated `tmp/econ-rpg/scene-1280-*.png` and `scene-320-*.png` files.
- Do not introduce external references, scripts, fonts or embeds. The production publication guard excludes this entire development tree.

The current art is an authored first pass, not the old skyline placeholder. A later art review would usefully compare it to the actual reference image, refine mobile silhouettes/contrast and consider whether additional location-specific facades would strengthen Linden's identity. No more assets are required for the current five scene states.
