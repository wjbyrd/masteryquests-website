# Mastery Quests Evidence Page + Homepage Mastery Path Fix

## Package target
Website patch built from the current uploaded Mastery Quests homepage, Faculty Resources page shell, and site stylesheet. The patch is structured for the website root.

## Files changed or added
- `index.html` — homepage with the adaptive mastery-path labels moved directly beside their numbered SVG nodes.
- `evidence/index.html` — new faculty evidence gallery at `/evidence/`.
- `assets/css/site.css` — existing site stylesheet plus the homepage SVG-label and evidence-gallery styles.
- `assets/images/evidence/` — 18 optimized WebP screenshots used by the gallery.
- `previews/` — quick visual previews for review only; these do not need to be deployed.

## Evidence page organization
The page uses the existing Mastery Quests site header/footer and adds a sticky in-page jump menu with six sections:
1. Modes
2. Question types
3. Adaptive support
4. Challenge & progression
5. Mastery reports
6. Review & mobile

Screenshot cards are arranged in three columns for most sections and four columns for the challenge/progression section, then collapse responsively on narrower screens. Each screenshot has a descriptive heading, faculty-facing explanation, and full-size link.

## Screenshot set
The gallery includes:
- Seven-mode selection
- Quiz length selector
- Unlimited Practice
- Conceptual question
- Graph question
- Calculation question
- Repair question
- Bridge question
- Checkpoint question
- Legendary Mode
- Timed Trial
- Score Attack
- Campaign milestones/progression
- Expert Mastery Report 2.0 profile
- Average Mastery Report 2.0 profile
- Weak Mastery Report 2.0 profile
- Recommended review materials
- Responsive mobile gameplay

## Screenshot provenance
Most screenshots were captured from the current composer-generated generic faculty quest so the engine is visible without a custom theme obscuring it. Question screens use records from the production question banks. Repair and Bridge views use the actual remediation pools. Mode, challenge, HUD, and progression screens use the production game UI/state.

The three Mastery Report 2.0 images use the previously validated controlled expert, average, and weak profiles:
- Expert: 92%, `Mastery Demonstrated`
- Average: 75%, `Strong Evidence`
- Weak: 42%, `Strong Evidence`

The recommended-review screenshot uses the finished Market Gate resource mapping so faculty can see an actual post-diagnostic review pathway.

## Homepage fix
The old detached four-item legend under the adaptive mastery-path SVG has been removed from the homepage markup. The stage names are now SVG text labels anchored directly beside the matching numbered circles:
- 1 Practice
- 2 Repair
- 3 Bridge
- 4 Master

This keeps each label visually attached to the stage it describes and eliminates the disconnected legend effect.

## Validation
- Evidence page contains 18 screenshot cards across six jump-linked sections.
- All screenshot references resolve to files included in the patch.
- Homepage detached `.model-legend` markup is removed.
- All four SVG stage labels are present.
- Desktop previews were rendered successfully in Chromium.
- Existing `/assets/images/mastery-quests-logo.png` and `/assets/js/site.js` are referenced but intentionally not duplicated in this patch because they are existing site assets.

## Deployment
Copy the contents of this patch into the website root, preserving paths. Existing files that will be replaced are `index.html` and `assets/css/site.css`. The `/evidence/` page and `/assets/images/evidence/` folder are new.
