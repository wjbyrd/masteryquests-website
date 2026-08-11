# Faculty Composer UI Flow Upgrade — 4.5s.2

## Scope

Targeted faculty-facing UI surgery only. Built directly on the authoritative 4.5s.1 Mastery Report 2.0 hotfix package. No question production, question selection, mode logic, mastery logic, or game-template behavior was intentionally changed.

## Four requested fixes

### 1. Macro status pills normalized

The library contains **39** Macro concepts whose source metadata uses the internal `ready-family-slice` / `Engine-safe...` wording. The source metadata remains intact for audit history, but the faculty UI now renders these cards as:

- **Ready for focused use**

The sequencing portion of the old label is moved into **Question coverage details** as a faculty-facing Planning note. Internal family codes such as F2/F3/F4/F5/F6 are translated into plain-language family names.

### 2. False 1-2-3 workflow removed

Removed the visible labels:

- `1. Course area`
- `2. Search within area`
- `3. Show`

Course area remains the true first decision. Search and card visibility are presented as optional browsing tools rather than mandatory steps.

### 3. Browse controls moved to the point of need

The visible search/filter controls now sit in a **Browse concepts** toolbar immediately above the concept-card library and after the selected-concepts summary/reading guide. The toolbar explicitly says that browsing controls do **not** change faculty selections.

### 4. Show dropdown replaced

The hidden `Show` dropdown is replaced visually by three always-visible choices with live counts:

- **All (n)**
- **Selected (n)**
- **Not selected (n)**

Counts respond to both the selected course area and the current search term, so area + search + visibility can be combined to reduce clutter.

## Browser validation

The actual composer HTML/CSS/JavaScript was loaded into Chromium through an in-memory Playwright page. The sandbox blocks normal `file://` and localhost browser navigation, so the same production sources were inlined for the browser check.

Validated behavior:

- Macro preset view: `All 90 / Selected 17 / Not selected 73`
- Visible `Engine-safe` pills: **0**
- Selected-only view: **17 cards shown / 17 checked**
- Search `aggregate`: `All 6 / Selected 0 / Not selected 6`
- Planning note rendered correctly for converted Macro cards
- No unexpected JavaScript/page errors

## Regression and source integrity

- Quiz Mode: PASS
- Unlimited Practice behavior: PASS
- Mastery Report 2.0 logic: PASS
- 4.5s.1 state-leak hotfix: PASS
- Seven-mode availability behavior: PASS

Historical test scripts that hard-code 4.5s.1 report only a composer-version mismatch after the bump to 4.5s.2; their functional checks pass.

Protected content remains untouched:

- **7,977 canonical questions**
- **399 question assets**
- `data/composer_library.js`: byte-identical to 4.5s.1
- `data/composer_registry.json`: byte-identical to 4.5s.1
- `data/composer_library_manifest.json`: byte-identical to 4.5s.1

## Verdict

**PASS — ready for browser/faculty use testing.**
