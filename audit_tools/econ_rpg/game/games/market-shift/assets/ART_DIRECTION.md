# Linden market artwork

Generated with the built-in image-generation tool from the user's three style references: a terracotta house with botanical linework and two warm, illustrated interiors. The supplied reference images themselves are not bundled with the game.

The art direction uses fine dark outlines, tiled terracotta roofs, cream and peach stucco, arched openings, deep green shutters, detailed flowering plants, and naturally proportioned people. All scenes reuse the same square. Crowds, stock, weather, and deliveries provide context, not numerical evidence for an answer. Price-control notices remain live HTML so every mission's legal price stays accurate.

Final assets are `linden-*.webp` in this folder. They are losslessly re-encoded from generated PNGs; decoded pixels were checked for exact equality. Original generated PNGs remain in the tool's generated-images folder. The graph itself stays vector-based and white.

## Scene use

- `market`: ordinary market and price controls.
- `busy` / `quiet`: more or fewer buyers; also used where buyer attendance is the dominant cue.
- `storm`: storm-damaged harvest, with ordinary buyer attendance.
- `harvest`: abundant produce, with ordinary buyer attendance.
- `delivery`: fuel-cost or storage/delivery stories. The delivery worker is not a buyer.
- `busy-harvest` / `quiet-harvest`: simultaneous buyer and supply changes.
- `busy-storm` / `quiet-storm`: simultaneous buyer and storm changes.

Exact shopper and crate counts do not encode model quantities. Some generated counts differ slightly from the requested counts; the intended busy/ordinary/quiet comparison is preserved. The artwork does not specify the size of a curve shift.

## Final prompts

### market

Use case: style-transfer / illustration-story.
Create the replacement artwork for the market scene inside the fourth reference, using the FIRST THREE images as style references only. Output only a standalone wide landscape illustration, approximately 2:1, not a screenshot or a logo.
Subject: Linden's small berry market, seen nearly front-on at street level: two welcoming shopfronts, a central timber berry stall with a deep teal and cream striped canvas awning, wooden berry crates, a paved square, and three adult shoppers with shopping baskets.
Style: match the user's references closely: an elegant hand-drawn 2D point-and-click adventure game illustration. Fine, confident dark ink contours and internal architectural linework, mostly flat warm colors with restrained soft shading. Detailed terracotta barrel roof tiles, peach/terracotta stucco and cream plaster, tall arched windows and a rounded wooden door, dark green shutters, iron lanterns, lush individually drawn leaves, potted palms and flowering bougainvillea. Natural adult proportions and understated expressive poses, not tiny geometric stick figures. Cozy, calm, tasteful, crisp, gently nostalgic. Avoid painterly watercolor, blur, photorealism, 3D, or the primitive geometric/vector people in reference four.
Composition: preserve the idea of the fourth reference's central stall flanked by buildings, but substantially upgrade it to the architectural detail and outlined style of references one through three. Keep the whole market, rooflines and feet within the image, with some sky and paving margin. Same town will be reused across weather and crowd variants. Show a neutral ordinary market day: exactly three shoppers, moderate stock of red and purple berries, no festival flags, no rain, no delivery vehicle, no policy placard.
Text: no text, lettering, logos, numerals, interface, arrows, graphs, captions or border. Do not reproduce the Bloom House name or logo. Any stall sign should be a blank decorative wooden panel. Opaque background.

### busy

Edit this exact illustration into another moment at the SAME Linden berry market. Preserve the exact wide 2:1 composition, camera, buildings, arched openings, terracotta tiles, green shutters, foliage, striped stall, paving, fine dark outlines, colors and detailed hand-drawn adventure-game style. Do not redesign the architecture or crop it. No text, letters, numbers, logos, signs with writing, or interface. Change only the conditions described. Every person must be a naturally proportioned adult in this same illustration style, full body visible, with clean separated silhouettes. A lively market with increased buyer attendance: show SEVEN adult shoppers total, including the three existing shoppers plus four others around the stall and on the square. They browse, wait with baskets, or approach the berries. Keep the berry stock at exactly the same moderate level as the original. Keep the normal sunny sky. No festival flags or vehicles.

### quiet

Edit this exact illustration into another moment at the SAME Linden berry market. Preserve the exact wide 2:1 composition, camera, buildings, arched openings, terracotta tiles, green shutters, foliage, striped stall, paving, fine dark outlines, colors and detailed hand-drawn adventure-game style. Do not redesign the architecture or crop it. No text, letters, numbers, logos, signs with writing, or interface. Change only the conditions described. Every person must be a naturally proportioned adult in this same illustration style, full body visible, with clean separated silhouettes. A quiet market with reduced buyer attendance: leave only ONE adult shopper, the woman wearing the light dress and straw hat near the stall. Remove the other two shoppers cleanly. Preserve the original moderate berry stock and normal sunny sky. The emptier paving should feel calm and spacious. No vehicles.

### storm

Edit this exact illustration into another moment at the SAME Linden berry market. Preserve the exact wide 2:1 composition, camera, buildings, arched openings, terracotta tiles, green shutters, foliage, striped stall, paving, fine dark outlines, colors and detailed hand-drawn adventure-game style. Do not redesign the architecture or crop it. No text, letters, numbers, logos, signs with writing, or interface. Change only the conditions described. Every person must be a naturally proportioned adult in this same illustration style, full body visible, with clean separated silhouettes. A storm has reduced the berry harvest. Keep THREE adult shoppers total, at the same locations, now in muted raincoats or holding umbrellas, with faces and bodies unobscured enough to read. Leave only two partly filled berry crates; the other stall crates are empty. Add low gray rain clouds, a few thin slanted rain strokes, subtle wet paving and a small fallen leafy branch. Keep the buildings and plants intact. The image must remain clear and readable, not very dark. No vehicles.

### harvest

Edit this exact illustration into another moment at the SAME Linden berry market. Preserve the exact wide 2:1 composition, camera, buildings, arched openings, terracotta tiles, green shutters, foliage, striped stall, paving, fine dark outlines, colors and detailed hand-drawn adventure-game style. Do not redesign the architecture or crop it. No text, letters, numbers, logos, signs with writing, or interface. Change only the conditions described. Every person must be a naturally proportioned adult in this same illustration style, full body visible, with clean separated silhouettes. A bumper berry harvest. Keep the SAME three shoppers, same positions and normal sunny weather. Abundant fresh red and purple berries fill every stall tray and several additional stacked wooden crates and woven produce baskets beside the stall. Add a few leafy berry sprigs in the produce. The extra harvest should be unmistakable, without covering the shoppers or changing their number. No vehicles.

### delivery

Edit this exact illustration into another moment at the SAME Linden berry market. Preserve the exact wide 2:1 composition, camera, buildings, arched openings, terracotta tiles, green shutters, foliage, striped stall, paving, fine dark outlines, colors and detailed hand-drawn adventure-game style. Do not redesign the architecture or crop it. No text, letters, numbers, logos, signs with writing, or interface. Change only the conditions described. Every person must be a naturally proportioned adult in this same illustration style, full body visible, with clean separated silhouettes. A berry delivery day. Keep the same three shoppers and the same moderate amount of berries on the stall. Add a small cream-and-muted-green produce delivery van at the far LEFT edge of the square, in three-quarter side view, with a few closed insulated produce boxes by its open rear door. Keep it small enough not to block the central stall or any shopper. No logos, labels or writing on the van or boxes. Preserve normal sunny weather.

### busy-harvest

Edit this exact illustration into another moment at the SAME Linden berry market. Preserve the exact wide 2:1 composition, camera, buildings, arched openings, terracotta tiles, green shutters, foliage, striped stall, paving, fine dark outlines, colors and detailed hand-drawn adventure-game style. Do not redesign the architecture or crop it. No text, letters, numbers, logos, signs with writing, or interface. Change only the conditions described. Every person must be a naturally proportioned adult in this same illustration style, full body visible, with clean separated silhouettes. Keep this abundant harvest exactly as it is: the full berry display and all extra berry crates. Add three additional adult shoppers around the stall, for a clearly busier market of SIX shoppers total. Keep everyone separate and full-body, with wicker baskets and natural poses. Preserve sunny weather and the architectural details. Do not add vehicles, flags or text.

### quiet-harvest

Edit this exact illustration into another moment at the SAME Linden berry market. Preserve the exact wide 2:1 composition, camera, buildings, arched openings, terracotta tiles, green shutters, foliage, striped stall, paving, fine dark outlines, colors and detailed hand-drawn adventure-game style. Do not redesign the architecture or crop it. No text, letters, numbers, logos, signs with writing, or interface. Change only the conditions described. Every person must be a naturally proportioned adult in this same illustration style, full body visible, with clean separated silhouettes. Keep this abundant harvest exactly as it is: the full berry display and all extra berry crates. Reduce buyer attendance to just ONE shopper, the woman in the light dress and straw hat. Remove the other two shoppers cleanly. Preserve sunny weather and all architectural details. Do not add vehicles or text.

### busy-storm

Edit this exact illustration into another moment at the SAME Linden berry market. Preserve the exact wide 2:1 composition, camera, buildings, arched openings, terracotta tiles, green shutters, foliage, striped stall, paving, fine dark outlines, colors and detailed hand-drawn adventure-game style. Do not redesign the architecture or crop it. No text, letters, numbers, logos, signs with writing, or interface. Change only the conditions described. Every person must be a naturally proportioned adult in this same illustration style, full body visible, with clean separated silhouettes. Keep the rainy weather, wet paving, fallen branch, and sparse berry stock exactly as in this image. Add three extra adult shoppers with umbrellas or raincoats, making a clearly busy rainy market with SIX shoppers total. Keep bodies and umbrellas separated and the central stock visible. Preserve all architecture and foliage. Do not add stock, vehicles or text.

### quiet-storm

Edit this exact illustration into another moment at the SAME Linden berry market. Preserve the exact wide 2:1 composition, camera, buildings, arched openings, terracotta tiles, green shutters, foliage, striped stall, paving, fine dark outlines, colors and detailed hand-drawn adventure-game style. Do not redesign the architecture or crop it. No text, letters, numbers, logos, signs with writing, or interface. Change only the conditions described. Every person must be a naturally proportioned adult in this same illustration style, full body visible, with clean separated silhouettes. Keep the rainy weather, wet paving, fallen branch, and sparse berry stock exactly as in this image. Remove two shoppers so only the woman in the light raincoat and hat remains near the stall. Preserve all architecture and foliage. Do not add stock, vehicles or text.

