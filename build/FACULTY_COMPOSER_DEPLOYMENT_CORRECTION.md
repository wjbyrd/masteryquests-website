# Faculty Concept Composer — Deployment Correction

## Root cause

The website wrapper already pointed to `/build/faculty-build-composer/`; the route was not the problem.

Two deployment issues explained the stale interface:

1. `build/index.html` still used the old iframe and full-page cache key:
   `20260804-p53a`
2. The earlier full replacement ZIP was rooted at:
   `build/faculty-build-composer/`

If that ZIP was extracted from inside the existing
`masteryquests-website/build/faculty-build-composer/` directory, it created:

`masteryquests-website/build/faculty-build-composer/build/faculty-build-composer/`

The browser continued serving the old files one level above.

## Correct deployment methods

### Method A — Repository-root patch

Extract `faculty-build-composer-micro-preset-v2-repo-root-patch.zip` directly into:

`C:\Users\Jennings\Documents\GitHub\masteryquests-website`

Allow it to replace existing files.

### Method B — Drop-in folder replacement

1. Delete the contents of:
   `masteryquests-website\build\faculty-build-composer`
2. Extract `faculty-build-composer-micro-preset-v2-drop-in-folder.zip`
   directly into that folder.
3. Replace `masteryquests-website\build\index.html` with the supplied corrected file.

## Expected result

- Starter combinations include **Microeconomics: firms and markets**
- Course area begins with **Choose a course area**
- Selecting Microeconomics reveals the new micro concept banks
- Website wrapper reports a 72-concept library
- Wrapper iframe cache key is `20260805-micro-preset-v2`
- Composer assets use `20260805-area-gated-concepts-v2`
