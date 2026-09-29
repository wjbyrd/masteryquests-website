# Home-opener artwork: moped removal

The hub card uses `game/art/scenes/gameday-rivals/round-01-home-opener.webp`, derived from `art/source/gameday-rivals/round-01-home-opener.png`.

The same runtime asset appears during Game Day 1 (Big Home Opener), both when choosing an offer and when viewing the revealed result, including a resumed first round. The other five game days have their own images. The removed moped and rider were part of the painted background, with no interactive or economic behavior.

Both master PNG and runtime WebP were replaced with the user-requested edit at their original 1448 × 1086 dimensions. Asset-manifest sizes and SHA-256 hashes were updated. No game logic changed.

Validation: all 15 Gameday Rivals tests and both publication tests passed. Deployed to the existing unlisted collection in Worker version `5596356c-4c26-49d3-9892-e5f8a36c2d67`. The live WebP SHA-256 matched the updated manifest, and the first-round scene was visually verified in the in-app browser.

Tool: built-in image generation, edit mode. Final prompt:

> Use case: precise-object-edit. Edit target: the attached original Gameday Rivals town illustration. Remove ONLY the small green delivery moped/scooter AND the person riding it in the lower-right street, just above the diagonal zebra crossing and immediately left of the black lamp post and blue U banner (approximately x=1190–1265, y=760–844 in the 1448x1086 original). Remove their shadow too and seamlessly reconstruct the gray asphalt and any white lane marking behind them. Preserve the full original composition, 4:3 framing, illustrated style, dimensions if possible, all buildings, signs, text, other people, other vehicles, green delivery van, crosswalks, trees, colors and lighting. Do not remove any other vehicle or pedestrian. This is a surgical object removal, not a redesign.
