# Linden market artwork

Generated with the built-in image-generation tool. The user's original examples informed the broad technique: warm colors, fine dark outlines, detailed foliage, and an inviting adventure-game atmosphere. At the user's request, the setting was redesigned to give Linden its own visual identity. The replacement base image was generated from the written brief below, without attaching the original examples or the previous market art. Each variant edits that new base image.

## Art direction

Linden is a civic market square with asymmetrical red-brick and honey-colored stone shops, slate roofs, a copper-roofed clock tower, a teal-roofed timber produce pavilion, a large linden tree, and a stone fountain. All ten illustrations retain those landmarks. Crowds, stock, weather, and deliveries provide context, not numerical evidence for an answer. The vendor stays behind the counter and is distinct from the shoppers; the delivery worker is also not a buyer.

Final assets are `linden-*.webp` in this folder. They replace the previous set and are losslessly re-encoded from generated PNGs; decoded pixels were checked for exact equality. Original generated PNGs remain in the tool's generated-images folder. Price-control notices remain live HTML so every mission's legal price stays accurate. The graph itself stays vector-based and white.

## Scene use

- `market`: ordinary market and price controls.
- `busy` / `quiet`: more or fewer buyers; also used where buyer attendance is the dominant cue.
- `storm`: storm-damaged harvest, with ordinary buyer attendance.
- `harvest`: abundant produce, with ordinary buyer attendance.
- `delivery`: fuel-cost or storage/delivery stories.
- `busy-harvest` / `quiet-harvest`: simultaneous buyer and supply changes.
- `busy-storm` / `quiet-storm`: simultaneous buyer and storm changes.

Exact shopper and crate counts do not encode model quantities. The base image depicts two customers and a vendor; the base prompt requested three customers. Variants preserve that ordinary attendance or change it to a larger crowd or a single customer. The intended busy/ordinary/quiet comparison is preserved. The artwork does not specify the size of a curve shift.

## Setting generation prompts

### market

Use case: illustration-story.
Asset: replacement background illustration for the original economics mini-game Market Shift, in the fictional town of Linden.
Create a NEW, distinctive setting: a welcoming small-town civic market square with asymmetrical red-brick and honey-colored stone shopfronts, rectangular sash windows, slate roofs, one recognisable slender copper-roofed market clock tower behind a covered timber produce pavilion, and a modest stone fountain at the side. The pavilion sells red and purple berries from wooden crates, and has a muted teal metal roof (no striped canvas awning). Flower boxes with meadow flowers, a spreading linden tree, simple benches and cobblestone paving give the square character. Leave one side lane visible for a future delivery van.
Art technique: elegant hand-drawn 2D point-and-click adventure-game background, fine confident dark outlines and internal architectural detail, mostly flat warm colors, restrained clean shading, detailed foliage, crisp calm illustration. Natural adult proportions. Muted brick red, warm stone, dusty teal, sage leaves, soft blue sky. A new civic market identity, NOT a Mediterranean villa setting: no terracotta barrel roof tiles, peach stucco facades, arched doors/windows, palm trees, bougainvillea, green shutters or house-logo composition.
Composition: standalone wide landscape image, 2:1 aspect ratio, ideally 1774 by 887 pixels. Street-level view with mild perspective, full clock tower, pavilion, people and foreground inside the frame. The central berry pavilion is the focal point, with clear open paving for changing shopper attendance. Rich architectural detail but readable at small sizes. Three adult SHOPPERS total, casually dressed and carrying baskets, separated silhouettes, plus no other people; moderate ordinary berry stock, sunny fair weather. No text, lettering, logos, numerals, UI, captions or border. The clock uses unnumbered tick marks. Opaque background.

### busy

Use case: precise-object-edit / illustration-story. Edit this exact Linden market illustration into another day in the SAME place. Preserve the exact wide 2:1 dimensions and framing, detailed hand-drawn dark-outline art technique, brick and stone shopfronts, rectangular sash windows, slate roofs, copper-roofed clock tower, teal-roofed timber berry pavilion, linden tree, side lane, fountain, benches, flower boxes, and cobblestone paving. Preserve the vendor woman behind the counter; she is a seller, not one of the shoppers. Keep natural adult proportions and legible separated silhouettes. Change only the conditions below. No captions, letters, logos, price signs, UI or added numerals.
Increased buyer attendance: show SIX shopping customers total in front of and around the pavilion, including the two original customers and four additional adults browsing, waiting or approaching with baskets. Keep the vendor. Moderate berry stock identical to the base image. Preserve the same sunny fair sky. No additional produce crates, vehicles or festival flags.

### quiet

Use case: precise-object-edit / illustration-story. Edit this exact Linden market illustration into another day in the SAME place. Preserve the exact wide 2:1 dimensions and framing, detailed hand-drawn dark-outline art technique, brick and stone shopfronts, rectangular sash windows, slate roofs, copper-roofed clock tower, teal-roofed timber berry pavilion, linden tree, side lane, fountain, benches, flower boxes, and cobblestone paving. Preserve the vendor woman behind the counter; she is a seller, not one of the shoppers. Keep natural adult proportions and legible separated silhouettes. Change only the conditions below. No captions, letters, logos, price signs, UI or added numerals.
Reduced buyer attendance: keep only ONE customer, the straw-hatted woman in the blue blouse and long green skirt at the right of the stall. Remove the man in the green shirt cleanly, revealing paving. Keep the vendor behind the counter. All berry crates stay at the original moderate stock level. Preserve the same sunny fair sky. No vehicles.

### storm

Use case: precise-object-edit / illustration-story. Edit this exact Linden market illustration into another day in the SAME place. Preserve the exact wide 2:1 dimensions and framing, detailed hand-drawn dark-outline art technique, brick and stone shopfronts, rectangular sash windows, slate roofs, copper-roofed clock tower, teal-roofed timber berry pavilion, linden tree, side lane, fountain, benches, flower boxes, and cobblestone paving. Preserve the vendor woman behind the counter; she is a seller, not one of the shoppers. Keep natural adult proportions and legible separated silhouettes. Change only the conditions below. No captions, letters, logos, price signs, UI or added numerals.
A storm has reduced the berry harvest. Keep both original shopping customers and the vendor, with the customers now wearing muted raincoats or carrying umbrellas. Most wooden berry crates are visibly empty: only two partly filled crates. Gray rain clouds, fine rain strokes, wet reflective cobblestones and a few fallen leaves. Keep the architecture and tree intact. Remain clear and readable rather than very dark. No vehicles or additional shoppers.

### harvest

Use case: precise-object-edit / illustration-story. Edit this exact Linden market illustration into another day in the SAME place. Preserve the exact wide 2:1 dimensions and framing, detailed hand-drawn dark-outline art technique, brick and stone shopfronts, rectangular sash windows, slate roofs, copper-roofed clock tower, teal-roofed timber berry pavilion, linden tree, side lane, fountain, benches, flower boxes, and cobblestone paving. Preserve the vendor woman behind the counter; she is a seller, not one of the shoppers. Keep natural adult proportions and legible separated silhouettes. Change only the conditions below. No captions, letters, logos, price signs, UI or added numerals.
An abundant berry harvest: keep exactly the TWO original shopping customers and the woman vendor. Fill all berry crates generously with red and purple berries and add plentiful full wooden berry crates and baskets at ground level beside the pavilion, clearly more stock than the original ordinary day. Preserve sunny fair weather and the same architecture and plants. No extra people or vehicles.

### delivery

Use case: precise-object-edit / illustration-story. Edit this exact Linden market illustration into another day in the SAME place. Preserve the exact wide 2:1 dimensions and framing, detailed hand-drawn dark-outline art technique, brick and stone shopfronts, rectangular sash windows, slate roofs, copper-roofed clock tower, teal-roofed timber berry pavilion, linden tree, side lane, fountain, benches, flower boxes, and cobblestone paving. Preserve the vendor woman behind the counter; she is a seller, not one of the shoppers. Keep natural adult proportions and legible separated silhouettes. Change only the conditions below. No captions, letters, logos, price signs, UI or added numerals.
A produce delivery: keep the TWO original customers and woman vendor and the original moderate berry stock unchanged. Add a compact muted cream delivery van parked in the open left side lane, with its rear door open. One delivery worker unloads plain insulated produce boxes using a small hand trolley. The worker is clearly doing deliveries, not shopping. Keep the tree and bench visible and all the architecture in place. Preserve sunny fair weather. No written text or logos on the van or boxes.

### busy-harvest

Use case: precise-object-edit / illustration-story. Edit this exact Linden market illustration into another day in the SAME place. Preserve the exact wide 2:1 dimensions and framing, detailed hand-drawn dark-outline art technique, brick and stone shopfronts, rectangular sash windows, slate roofs, copper-roofed clock tower, teal-roofed timber berry pavilion, linden tree, side lane, fountain, benches, flower boxes, and cobblestone paving. Preserve the vendor woman behind the counter; she is a seller, not one of the shoppers. Keep natural adult proportions and legible separated silhouettes. Change only the conditions below. No captions, letters, logos, price signs, UI or added numerals.
Simultaneous increased buyer attendance and abundant berry stock: show SIX shopping customers total around the pavilion, including the original two and four others with baskets, plus the original vendor behind the counter. Fill all crates generously with red and purple berries and add plentiful full wooden berry crates and baskets at ground level beside the pavilion. Both the increased crowd and extra stock must be visible. Preserve sunny fair weather, buildings and plants. No vehicles or festival flags.

### quiet-harvest

Use case: precise-object-edit / illustration-story. Edit this exact Linden market illustration into another day in the SAME place. Preserve the exact wide 2:1 dimensions and framing, detailed hand-drawn dark-outline art technique, brick and stone shopfronts, rectangular sash windows, slate roofs, copper-roofed clock tower, teal-roofed timber berry pavilion, linden tree, side lane, fountain, benches, flower boxes, and cobblestone paving. Preserve the vendor woman behind the counter; she is a seller, not one of the shoppers. Keep natural adult proportions and legible separated silhouettes. Change only the conditions below. No captions, letters, logos, price signs, UI or added numerals.
Simultaneous reduced buyer attendance and abundant berry stock: keep only ONE customer, the straw-hatted woman in the blue blouse and long green skirt on the right, plus the original woman vendor behind the counter. Remove the man in the green shirt. Fill all berry crates generously and add plentiful full wooden berry crates and baskets at ground level around the pavilion, clearly more stock than an ordinary day. Preserve sunny fair weather, buildings and plants. No vehicles or other shoppers.

### busy-storm

Use case: precise-object-edit / illustration-story. Edit this exact Linden market illustration into another day in the SAME place. Preserve the exact wide 2:1 dimensions and framing, detailed hand-drawn dark-outline art technique, brick and stone shopfronts, rectangular sash windows, slate roofs, copper-roofed clock tower, teal-roofed timber berry pavilion, linden tree, side lane, fountain, benches, flower boxes, and cobblestone paving. Preserve the vendor woman behind the counter; she is a seller, not one of the shoppers. Keep natural adult proportions and legible separated silhouettes. Change only the conditions below. No captions, letters, logos, price signs, UI or added numerals.
Simultaneous increased buyer attendance and storm-reduced harvest: show SIX shopping customers total around the pavilion, including the original two and four others with baskets, wearing raincoats or carrying umbrellas. Keep the original woman vendor. Most berry crates are visibly empty; only two partly filled crates. Gray rain clouds, fine rain strokes, wet reflective cobblestones and fallen leaves. Keep the architecture and tree intact. The increased crowd and scarce stock must both be readable. Clear and moderately lit rather than very dark. No vehicles.

### quiet-storm

Use case: precise-object-edit / illustration-story. Edit this exact Linden market illustration into another day in the SAME place. Preserve the exact wide 2:1 dimensions and framing, detailed hand-drawn dark-outline art technique, brick and stone shopfronts, rectangular sash windows, slate roofs, copper-roofed clock tower, teal-roofed timber berry pavilion, linden tree, side lane, fountain, benches, flower boxes, and cobblestone paving. Preserve the vendor woman behind the counter; she is a seller, not one of the shoppers. Keep natural adult proportions and legible separated silhouettes. Change only the conditions below. No captions, letters, logos, price signs, UI or added numerals.
Simultaneous reduced buyer attendance and storm-reduced harvest: keep only ONE customer, the straw-hatted woman in the blue blouse and long green skirt on the right, now in a muted raincoat or with an umbrella, plus the original woman vendor behind the counter. Remove the man in the green shirt. Most berry crates are visibly empty; only two partly filled crates. Gray rain clouds, fine rain strokes, wet reflective cobblestones and a few fallen leaves. Keep architecture and tree intact. Remain clear and readable rather than very dark. No vehicles or other shoppers.


## Character refinement prompts

A subsequent built-in image edit added a modest mix of skin tones, hairstyles, and ages. The ordinary market was updated first. Each other scene then used its existing illustration as the edit target and the updated ordinary market as a character appearance reference. Architecture, composition, customer counts, stock and weather remained the invariants. These are the final edits used in the current assets.

### market

Use case: precise-object-edit.
Edit this exact illustrated Linden market scene. Change only the people to introduce modest, natural diversity of skin tone and age.
Keep exactly the same TWO customers and ONE vendor, in the same poses and locations, wearing the same everyday clothing. The woman vendor behind the counter now has deep brown skin and black curly hair gathered into a bun. The man customer at the left in the olive shirt and blue jeans now has medium brown skin and short black hair. The woman customer at the right in the blue blouse, green skirt and straw hat is now visibly older, around her sixties, with a little silver hair showing beneath the hat. Use subtle, natural facial features in the existing illustration technique; no caricature.
Preserve the exact 1774 by 887 wide composition, hand-drawn outlines, warm coloring, architecture, clock tower, teal pavilion roof, tree, fountain, flowers, paving, moderate berry stock, lighting and sunny weather. Do not add or remove people, change the setting, or add symbols, flags, lettering or text.

### busy

Use case: precise-object-edit.
Image 1 is the EDIT TARGET: keep its exact setting, weather, berry-stock level, crowd count, outfits, poses and framing.
Image 2 is a CHARACTER APPEARANCE REFERENCE only: use it to update the recurring people in image 1.
Change only people's skin tones, hair and subtle age details. Match the vendor behind the counter to the deep-brown-skinned woman with black curly hair in a bun in image 2. If present, match the olive-shirted male customer to the medium-brown-skinned man with short black hair in image 2. Match the blue-bloused, green-skirted, straw-hatted woman customer to the older woman with silver hair beneath her hat in image 2. Retain the target's raincoats, umbrellas or other weather clothing as applicable. Preserve hand-drawn outlines, natural facial features, warm colors, exact 1774 by 887 dimensions, clock tower, pavilion, tree, fountain, all architecture, paving and plant details. Do not add/remove people or change any market conditions. No caricature, text, symbols, flags or UI.
For the four additional shoppers, introduce a natural mix of complexions and ages: the pink-dressed woman has East Asian features and straight black hair; the man in a light shirt and cap has deep brown skin and a neat dark beard; the central blue-shirted man has some gray hair. Keep the exact six customers and one vendor.

### quiet

Use case: precise-object-edit.
Image 1 is the EDIT TARGET: keep its exact setting, weather, berry-stock level, crowd count, outfits, poses and framing.
Image 2 is a CHARACTER APPEARANCE REFERENCE only: use it to update the recurring people in image 1.
Change only people's skin tones, hair and subtle age details. Match the vendor behind the counter to the deep-brown-skinned woman with black curly hair in a bun in image 2. If present, match the olive-shirted male customer to the medium-brown-skinned man with short black hair in image 2. Match the blue-bloused, green-skirted, straw-hatted woman customer to the older woman with silver hair beneath her hat in image 2. Retain the target's raincoats, umbrellas or other weather clothing as applicable. Preserve hand-drawn outlines, natural facial features, warm colors, exact 1774 by 887 dimensions, clock tower, pavilion, tree, fountain, all architecture, paving and plant details. Do not add/remove people or change any market conditions. No caricature, text, symbols, flags or UI.
Keep the target's ONE customer plus the vendor. Only adjust their appearance to match image 2. Preserve the quiet square and ordinary berry stock.

### storm

Use case: precise-object-edit.
Image 1 is the EDIT TARGET: keep its exact setting, weather, berry-stock level, crowd count, outfits, poses and framing.
Image 2 is a CHARACTER APPEARANCE REFERENCE only: use it to update the recurring people in image 1.
Change only people's skin tones, hair and subtle age details. Match the vendor behind the counter to the deep-brown-skinned woman with black curly hair in a bun in image 2. If present, match the olive-shirted male customer to the medium-brown-skinned man with short black hair in image 2. Match the blue-bloused, green-skirted, straw-hatted woman customer to the older woman with silver hair beneath her hat in image 2. Retain the target's raincoats, umbrellas or other weather clothing as applicable. Preserve hand-drawn outlines, natural facial features, warm colors, exact 1774 by 887 dimensions, clock tower, pavilion, tree, fountain, all architecture, paving and plant details. Do not add/remove people or change any market conditions. No caricature, text, symbols, flags or UI.
Keep the target's TWO shopping customers plus the vendor. Preserve its sparse berry crates, rain, umbrellas and wet paving; change only those people's appearance to match image 2.

### harvest

Use case: precise-object-edit.
Image 1 is the EDIT TARGET: keep its exact setting, weather, berry-stock level, crowd count, outfits, poses and framing.
Image 2 is a CHARACTER APPEARANCE REFERENCE only: use it to update the recurring people in image 1.
Change only people's skin tones, hair and subtle age details. Match the vendor behind the counter to the deep-brown-skinned woman with black curly hair in a bun in image 2. If present, match the olive-shirted male customer to the medium-brown-skinned man with short black hair in image 2. Match the blue-bloused, green-skirted, straw-hatted woman customer to the older woman with silver hair beneath her hat in image 2. Retain the target's raincoats, umbrellas or other weather clothing as applicable. Preserve hand-drawn outlines, natural facial features, warm colors, exact 1774 by 887 dimensions, clock tower, pavilion, tree, fountain, all architecture, paving and plant details. Do not add/remove people or change any market conditions. No caricature, text, symbols, flags or UI.
Keep the target's TWO shopping customers and vendor, its overflowing harvest crates and sunny sky. Only update the three recurring characters to match image 2.

### delivery

Use case: precise-object-edit.
Image 1 is the EDIT TARGET: keep its exact setting, weather, berry-stock level, crowd count, outfits, poses and framing.
Image 2 is a CHARACTER APPEARANCE REFERENCE only: use it to update the recurring people in image 1.
Change only people's skin tones, hair and subtle age details. Match the vendor behind the counter to the deep-brown-skinned woman with black curly hair in a bun in image 2. If present, match the olive-shirted male customer to the medium-brown-skinned man with short black hair in image 2. Match the blue-bloused, green-skirted, straw-hatted woman customer to the older woman with silver hair beneath her hat in image 2. Retain the target's raincoats, umbrellas or other weather clothing as applicable. Preserve hand-drawn outlines, natural facial features, warm colors, exact 1774 by 887 dimensions, clock tower, pavilion, tree, fountain, all architecture, paving and plant details. Do not add/remove people or change any market conditions. No caricature, text, symbols, flags or UI.
Keep the target's TWO shopping customers, vendor and ONE delivery worker, plus its van, trolley, insulated boxes and normal berry stock. Update the recurring three characters to match image 2. Give the delivery worker a medium tan complexion. Preserve the driver's uniform, task and position.

### busy-harvest

Use case: precise-object-edit.
Image 1 is the EDIT TARGET: keep its exact setting, weather, berry-stock level, crowd count, outfits, poses and framing.
Image 2 is a CHARACTER APPEARANCE REFERENCE only: use it to update the recurring people in image 1.
Change only people's skin tones, hair and subtle age details. Match the vendor behind the counter to the deep-brown-skinned woman with black curly hair in a bun in image 2. If present, match the olive-shirted male customer to the medium-brown-skinned man with short black hair in image 2. Match the blue-bloused, green-skirted, straw-hatted woman customer to the older woman with silver hair beneath her hat in image 2. Retain the target's raincoats, umbrellas or other weather clothing as applicable. Preserve hand-drawn outlines, natural facial features, warm colors, exact 1774 by 887 dimensions, clock tower, pavilion, tree, fountain, all architecture, paving and plant details. Do not add/remove people or change any market conditions. No caricature, text, symbols, flags or UI.
Keep the SIX shopping customers plus vendor and the abundant berry stock. Update the recurring characters to match image 2. Among the additional four shoppers, the woman in the blue patterned dress has East Asian features and straight black hair, the man in the light shirt and cap has deep brown skin, and the central woman in lavender is older with silver hair. Preserve clothes, poses and existing locations.

### quiet-harvest

Use case: precise-object-edit.
Image 1 is the EDIT TARGET: keep its exact setting, weather, berry-stock level, crowd count, outfits, poses and framing.
Image 2 is a CHARACTER APPEARANCE REFERENCE only: use it to update the recurring people in image 1.
Change only people's skin tones, hair and subtle age details. Match the vendor behind the counter to the deep-brown-skinned woman with black curly hair in a bun in image 2. If present, match the olive-shirted male customer to the medium-brown-skinned man with short black hair in image 2. Match the blue-bloused, green-skirted, straw-hatted woman customer to the older woman with silver hair beneath her hat in image 2. Retain the target's raincoats, umbrellas or other weather clothing as applicable. Preserve hand-drawn outlines, natural facial features, warm colors, exact 1774 by 887 dimensions, clock tower, pavilion, tree, fountain, all architecture, paving and plant details. Do not add/remove people or change any market conditions. No caricature, text, symbols, flags or UI.
Keep only the target's ONE customer plus the vendor, surrounded by abundant berry stock. Match the older straw-hatted customer and deep-brown-skinned vendor to image 2, preserving all clothing and poses.

### busy-storm

Use case: precise-object-edit.
Image 1 is the EDIT TARGET: keep its exact setting, weather, berry-stock level, crowd count, outfits, poses and framing.
Image 2 is a CHARACTER APPEARANCE REFERENCE only: use it to update the recurring people in image 1.
Change only people's skin tones, hair and subtle age details. Match the vendor behind the counter to the deep-brown-skinned woman with black curly hair in a bun in image 2. If present, match the olive-shirted male customer to the medium-brown-skinned man with short black hair in image 2. Match the blue-bloused, green-skirted, straw-hatted woman customer to the older woman with silver hair beneath her hat in image 2. Retain the target's raincoats, umbrellas or other weather clothing as applicable. Preserve hand-drawn outlines, natural facial features, warm colors, exact 1774 by 887 dimensions, clock tower, pavilion, tree, fountain, all architecture, paving and plant details. Do not add/remove people or change any market conditions. No caricature, text, symbols, flags or UI.
Keep the target's SIX shopping customers plus the vendor, its raincoats, umbrellas, rain and mostly empty crates. Match the recurring characters to image 2. Give the rightmost burgundy-coated customer a deep brown complexion, and introduce a little silver hair and a mix of light and medium skin tones among other additional shoppers. Keep the crowd count, weather outfits and positions.

### quiet-storm

Use case: precise-object-edit.
Image 1 is the EDIT TARGET: keep its exact setting, weather, berry-stock level, crowd count, outfits, poses and framing.
Image 2 is a CHARACTER APPEARANCE REFERENCE only: use it to update the recurring people in image 1.
Change only people's skin tones, hair and subtle age details. Match the vendor behind the counter to the deep-brown-skinned woman with black curly hair in a bun in image 2. If present, match the olive-shirted male customer to the medium-brown-skinned man with short black hair in image 2. Match the blue-bloused, green-skirted, straw-hatted woman customer to the older woman with silver hair beneath her hat in image 2. Retain the target's raincoats, umbrellas or other weather clothing as applicable. Preserve hand-drawn outlines, natural facial features, warm colors, exact 1774 by 887 dimensions, clock tower, pavilion, tree, fountain, all architecture, paving and plant details. Do not add/remove people or change any market conditions. No caricature, text, symbols, flags or UI.
Keep only the target's ONE customer plus the vendor. Match the older straw-hatted customer and deep-brown-skinned vendor to image 2, preserving the customer's raincoat and umbrella, mostly empty crates and rain.

