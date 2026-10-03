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

- Current world: **1216 × 736 logical pixels**, responsive **1184 × 704** camera, 18 × 18 tile landscape, 2:1 isometric southeast view. Tile: **64 × 32**.
- Suggested replacement district master: **256 × 256**, nominal footprint **192 × 96**, anchor **(128,218)**. Six-level replacement sheet: **768 × 512** (3 × 2). Current art uses the measured rectangles and ground anchors in `../district-layout.js`, retaining the native **238/512** scale. Image width/height vary by frame; a uniform image-center anchor is no longer used in the playable map. Replacements must supply their measured lot corners and image bounds.
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

## Implemented ground footprints

These are conservative map-space width × height envelopes of the measured lot corners, including a .125-tile edge tolerance. They include the lot's fences, planting and parked equipment. Towers and transparent image padding do not enlarge the ground collision box. Values below are rounded to three decimals; the runtime retains full precision. The largest footprint is not always the last level.

| Level | Industry | Resources | Research | Education |
| --- | --- | --- | --- | --- |
| 0 | 3.430 × 3.386 | 3.422 × 3.422 | 3.655 × 3.357 | 2.464 × 2.478 |
| 1 | 3.357 × 3.372 | 3.662 × 3.619 | 3.524 × 3.495 | 3.924 × 3.735 |
| 2 | 3.502 × 3.495 | 3.873 × 3.873 | 3.713 × 3.437 | 4.178 × 3.916 |
| 3 | 4.156 × 3.938 | 3.742 × 3.749 | 4.425 × 3.444 | 4.287 × 4.011 |
| 4 | 4.134 × 3.960 | 3.924 × 3.880 | 4.512 × 3.713 | 4.381 × 4.149 |
| 5 | 4.207 × 4.120 | 4.134 × 4.134 | 4.418 × 3.924 | 4.352 × 4.149 |

Both cities use the same 6.5 × 6.5 parcel sizes and measured art. Structural expansion stops at ±2.95 tiles; the outer .3 tile is reserved for service access. Beyond level 5, up to four separately checked annex lots use the level-1 footprint at 48/238 scale, centered at offsets (-1.8, 2.5), (-.6, 2.5), (.6, 2.5), (1.8, 2.5). Their footprint therefore remains below .8 × .8 tiles. The main lot stays at level 5.

Construction stages have independently measured ground corners and anchors in `CONSTRUCTION_VISUALS`; their ground envelope fits inside 4.6 × 4.3 tiles at maximum intensity. Pallets and crane bases have separate service rectangles. The .4 × .4 worker footprint follows the rear/left service walk, clear of annexes. Progress bars, dust and resolution labels have additional road/parcel checks. Crane booms and building height may extend above their lots.

`PROTECTED_ROADS` is both the collision geometry and the source of the actual road drawing. Vehicles use its centerlines. Public pedestrians use the separate .7-tile `SIDEWALKS` network, and construction workers use paved service walks. `UNIT_GROUND` supplies direction-dependent vehicle length/width and ground contacts; tests check full bodies through complete route loops, rather than checking center points alone. Decorative props are filtered against land, roads, actual occupied lots and active construction parcels before rendering.

## Directional-unit update

`vehicles-directional.png`: **1536 × 1024 RGBA**, **4 × 2** cells of **384 × 512**. Row-major order: truck NE/rear, truck SW/front, bus NE/rear, bus SW/front, tractor NE/rear, tractor SW/front, van NE/rear, van SW/front. File size: **1,785,780 bytes**.

`people-directional.png`: **1254 × 1254 RGBA**, **2 × 2** cells of **627 × 627**. Order: worker pair NE/rear, worker pair SW/front, student pair NE/rear, student pair SW/front. File size: **639,603 bytes**.

`UNIT_VISUALS` maps each of the six moving unit types to NE/NW/SE/SW. NE is the rear pose; NW mirrors it. SW is the distinct front pose; SE mirrors it. No arbitrary rotation. At asset load, alpha bounds within each regular cell are cached as source rectangles to remove padding, preserve aspect ratio and anchor at bottom center. This is runtime sprite cropping; source PNGs remain unchanged. The route sampler derives facing from the same segment vector used for position.

Logical maximum dimensions: truck **49**, bus **57**, tractor/van **43**, worker group **29**, student group **32** pixels. Camera magnification is **1.255×** relative to the previous view. Directional sheets add approximately **12 MiB decoded**, bringing all seven atlases to about **42 MiB decoded**. The 8 FPS shared scheduler is unchanged.

The two new sheets were created with the built-in image generation tool. Exact prompts are in `sprites/directional-prompts.json`. They are marked temporary; no additional directional assets are required for current moving units. Optional future art: authored walking/wheel frames and independently drawn mirrored details. Static cars/vehicles painted into district sprites are parked scenery.

See `../VISUAL_OVERHAUL.md` for building levels, architecture, state semantics, routes, acceptance results and screenshots.
