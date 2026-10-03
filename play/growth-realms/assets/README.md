# Growth Realms sprite contract

`../visual-config.js` centralizes `ASSETS`, `SUPPORT`, `BUILDING_VISUALS`, `SPRITE_ROUTES`, `DIAGNOSTICS`, palette, scale and anchors. Raster filenames occur only in this manifest. All seven RGBA PNGs were made with the built-in image generation tool and copied unchanged into `sprites/`. Exact prompts: `sprites/generation-prompts.json` and `sprites/directional-prompts.json`. All are marked `temporary: true` pending curated release sprites.

## Actual sheets

| Sheet | Pixels | Layout |
| --- | --- | --- |
| capital.png | 1536 × 1024 | Six 512 × 512 frames, 3 columns × 2 rows, levels 0–5 |
| resources.png | 1536 × 1024 | Same |
| research.png | 1536 × 1024 | Same |
| education.png | 1536 × 1024 | Same |
| support.png | 1254 × 1254 | Sixteen irregular source rectangles in ASSETS.support.rects |
| vehicles-directional.png | 1536 × 1024 | Eight 384 × 512 cells, 4 columns × 2 rows; rear/front pairs |
| people-directional.png | 1254 × 1254 | Four 627 × 627 cells, 2 columns × 2 rows; rear/front pairs |

Support order: house, apartments, warehouse, power facility, broadleaf tree, pine, truck, bus, tractor, van, workers, students, site prep, foundation, frame/crane, finishing/scaffold. The support generator did not honor the requested 1024-square uniform grid. Measured source rectangles fix uneven gutters and row bleed at draw time. The original source PNG is preserved; do not use a uniform crop on this sheet.

## Exact recommended replacement dimensions

- Map: **768 × 512 logical pixels**, 2:1 isometric southeast view, top-left sunlight. Tile: **64 × 32**.
- District master: **256 × 256**, nominal footprint **192 × 96**, anchor **(128,218)**. Six-level sheet: **768 × 512** (3 × 2). Current 512-square frames display at **238 × 238** with normalized `(0.5,0.85)` anchor.
- Housing/warehouse/power masters: **128 × 128**, bottom center; current display maximum dimension **88–111**. Tree master **64 × 96**, current maximum dimension **66**.
- Truck/tractor/van masters **48 × 48**, current display **49/43/43** maximum dimension. Bus master **64 × 48**, current display **57**. People masters **32 × 48**, current display **29/32** maximum dimension.
- Construction masters **256 × 256**, four stages in a **1024 × 256** horizontal sheet. Activity size varies by allocation intensity; completed building tier never does.
- Optional future effect sheets: smoke **6 × (32 × 48) = 192 × 48**; dust **6 × (64 × 64) = 384 × 64**; river **6 × (64 × 32) = 384 × 32**; crane hook **4 × (32 × 64) = 128 × 64**. These proposed files do not currently exist.

## Current animation specifications

| System | Frames / states | Timing |
| --- | --- | --- |
| Construction | Four support sprites + final district sprite | Five 480 ms phases; 2400 ms total |
| Smoke | Six pixel states; three phase offsets | 750 ms loop |
| Dust | Six pixel states; 1–4 puffs by intensity | 750 ms loop |
| River | Six pixel ripple states | 750 ms loop |
| Irrigation | Three line states | 375 ms loop |
| Equipment/lab/campus lights | Four ticks, two colors | 500 ms loop |
| Crane hook | Four vertical positions | 500 ms; major/push projects |
| Vehicles/people | Two authored front/rear poses each + horizontal mirroring for four facings | Discrete route positions every 125 ms |
| Resolution labels | Stepped alpha | 1500 ms, then cleared |

The shared clock runs at **8 FPS**. Vehicle/people sprites now have distinct front/rear poses and four directional views; they still use route movement rather than authored walk or wheel-cycle sheets. Terrain, roads, materials, selection and small effects are code-native pixel art with centralized palette entries; future raster replacements for these effects would require a drawing adapter. Building/vehicle/people replacements need only the manifest if they keep the documented layout.

## Directional-unit update

`vehicles-directional.png`: **1536 × 1024 RGBA**, **4 × 2** cells of **384 × 512**. Row-major order: truck NE/rear, truck SW/front, bus NE/rear, bus SW/front, tractor NE/rear, tractor SW/front, van NE/rear, van SW/front. File size: **1,785,780 bytes**.

`people-directional.png`: **1254 × 1254 RGBA**, **2 × 2** cells of **627 × 627**. Order: worker pair NE/rear, worker pair SW/front, student pair NE/rear, student pair SW/front. File size: **639,603 bytes**.

`UNIT_VISUALS` maps each of the six moving unit types to NE/NW/SE/SW. NE is the rear pose; NW mirrors it. SW is the distinct front pose; SE mirrors it. No arbitrary rotation. At asset load, alpha bounds within each regular cell are cached as source rectangles to remove padding, preserve aspect ratio and anchor at bottom center. This is runtime sprite cropping; source PNGs remain unchanged. The route sampler derives facing from the same segment vector used for position.

Logical maximum dimensions: truck **49**, bus **57**, tractor/van **43**, worker group **29**, student group **32** pixels. Camera magnification is **1.255×** relative to the previous view. Directional sheets add approximately **12 MiB decoded**, bringing all seven atlases to about **42 MiB decoded**. The 8 FPS shared scheduler is unchanged.

The two new sheets were created with the built-in image generation tool. Exact prompts are in `sprites/directional-prompts.json`. They are marked temporary; no additional directional assets are required for current moving units. Optional future art: authored walking/wheel frames and independently drawn mirrored details. Static cars/vehicles painted into district sprites are parked scenery.

See `../VISUAL_OVERHAUL.md` for building levels, architecture, state semantics, routes, acceptance results and screenshots.
