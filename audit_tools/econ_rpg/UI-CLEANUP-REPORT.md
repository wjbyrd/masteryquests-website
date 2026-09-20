# Room to Stay — UI cleanup QA

Completed September 19, 2026. Changes are confined to the private `audit_tools/econ_rpg/` prototype. No push or deployment was performed.

## Visible copy and status display

Removed the intro duration/decision-count/multiple-endings line and the entire paragraph below Begin. Also removed the development badge and browser-title suffix, branching-scenario subtitle, redundant visible intro heading/role label, repeated privacy footer, and the paragraph asking students to replay. The intro retains its semantic heading for assistive technology. Its second setup paragraph now states only the task and two-year horizon; the explanation that choices change conditions and reveal benefits/costs was removed. The housing situation paragraph is unchanged.

The status panel now has five compact rows: indicator name, eight-step bar, numeric level, and a signed arrow delta when the latest decision moved that indicator. Visible qualitative descriptors and the five persistent definitions are gone. Equal-width bars reserve space for deltas, so an unchanged indicator never appears to have a longer scale. Deltas use the actual bounded before/after values from the latest history entry, persist into the next decision and on resume, and disappear on a fresh run. For example, the first rent ceiling shows affordability `5 / 8` and `↑ +3`, availability `2 / 8` and `↓ -1`; unchanged quality/budget have no delta.

One native details control, **What do these indicators mean?**, starts collapsed at the bottom. It contains all five concise definitions and the existing model caveat. The caveat is retained because ordinal steps, current-renter affordability versus access, and exhausted budget capacity affect interpretation of the economics.

## Vehicle correction

The red car previously crossed the side street's axis and was painted after the nearer repair shop, making it overlap the roof/tree area. It now follows the side-street lane, with its footprint moved to `(195, 105)` and its length along the street's y-axis. Its drawing is placed before the nearer shop row, so building occlusion is correct. The shared car geometry keeps its wheels/shadow on the same street plane as the other cars.

All five rendered scene variants were inspected: baseline, limited vacancies, deferred maintenance, construction, and completed homes. The correction appears in every variant. The other two cars, bus shelter, benches, trees, people and construction props received a quick alignment review; no additional obvious floating prop required a change. No broader art redesign or scene-selection change was made. [Five-scene review sheet](../../tmp/econ-rpg/ui-cleanup-scene-review.png).

## Layout and accessibility

Desktop 1280px, phone 390px and narrow phone 320px were exercised and screens captured. Indicator names fit on single lines, bars remain readable, and numeric levels/deltas align. The collapsed status panel is below 420px high at every tested width. Phones use one column of five rows below the scenario/actions, avoiding the previous cramped definition columns. No horizontal overflow occurred, including with help expanded and during long debriefs. Scene height remains bounded on phones.

Keyboard Tab/Enter/Space, heading focus after transitions, restart Escape cancellation and visible gold focus outlines passed. Indicator help opens with Enter and closes with Space; its target remains at least 44px high. Semantic definition lists associate names with numeric levels; decorative bars are hidden from screen readers, and arrow deltas have explicit hidden increased/decreased wording that identifies the latest decision. Existing polite live announcements remain intact. Direction is conveyed through arrows and signs, not just color. Reduced-motion CSS is unchanged and the browser run used reduced-motion preference. These are DOM/keyboard/browser checks, not a claim of testing with NVDA or VoiceOver.

## Regression results

| Check | Result |
|---|---|
| RPG engine, storage, scenes and publication suites | 13 tests passed |
| All legal runs | 200 unchanged completed paths, six decisions each |
| Frozen serialized-path SHA-256 | `f5eb10bba272b655a3253ba355b801b0aa7e445147ee4a0bed5ad4ec77cb1d6e` unchanged |
| Endings | All five remain reachable |
| Saves | Exact replay/resume in every phase; browser consequence/decision resume and version/storage failure checks pass |
| Scenes | All five reachable, visually distinct without captions, decoded and restored after reload at all three widths |
| Browser gameplay | 41 complete runs: 13 opening-policy/ending combinations at each width, plus two funded-construction routes |
| New UI checks | Removed copy, numeric levels/bars, signed latest movement, reset, collapsed definitions, keyboard help and compact panel pass at all three widths |
| Network/runtime | Zero external requests, CSP violations, console errors or page errors |
| Existing neighboring game suites | 36 tests passed |
| Existing classroom publication check | Passed |
| Actual production build | RPG absent by path/content; protected production files and publication guards untouched |

The decision tree, all choices and their economic detail, effects, conditional consequences, mechanisms, tradeoffs, ending logic and instructional debrief are unchanged. The only scenario-data edit is the non-saved introductory presentation sentence. Save/privacy/controller logic and scene architecture/selection are unchanged. Browser tests use an isolated context and do not clear the user's preview save.

## Captures

Each linked image is a full-page browser screenshot. Long debriefs were also reviewed in adjacent strips for legibility. Local screenshots and browser results remain in ignored `tmp/econ-rpg/`.

| Screen | Desktop 1280px | 390px | 320px |
|---|---|---|---|
| Intro | [Desktop](../../tmp/econ-rpg/intro-1280.png) | [390](../../tmp/econ-rpg/intro-390.png) | [320](../../tmp/econ-rpg/intro-320.png) |
| First decision | [Desktop](../../tmp/econ-rpg/first-decision-1280.png) | [390](../../tmp/econ-rpg/first-decision-390.png) | [320](../../tmp/econ-rpg/first-decision-320.png) |
| Consequence and changes | [Desktop](../../tmp/econ-rpg/consequence-1280.png) | [390](../../tmp/econ-rpg/consequence-390.png) | [320](../../tmp/econ-rpg/consequence-320.png) |
| Indicator help expanded | [Desktop](../../tmp/econ-rpg/state-help-1280.png) | [390](../../tmp/econ-rpg/state-help-390.png) | [320](../../tmp/econ-rpg/state-help-320.png) |
| Ending/debrief | [Desktop](../../tmp/econ-rpg/debrief-1280.png) | [390](../../tmp/econ-rpg/debrief-390.png) | [320](../../tmp/econ-rpg/debrief-320.png) |

## Requested review answers

1. **Is the intro focused on setup and starting play?** Yes. Title, retained neighborhood illustration, short housing setup and Begin/resume are the opening content; there is no metadata line or interaction tutorial.
2. **Is the state panel a quick status display rather than a glossary?** Yes. Names, bars, numbers and recent movement remain visible; definitions are optional.
3. **Can movement be understood without Moderate/Limited/Strong?** Yes. Numeric levels and signed arrows show the amount/direction; explicit screen-reader wording and existing consequence/live-announcement text provide equivalent meaning.
4. **Is all substantive economics present?** Yes. Direct and second-order effects, distribution/efficiency, path dependence, fiscal limits and supply timing remain in the unchanged decisions, consequences and debrief.
5. **Was necessary text retained?** The requested removals all stayed removed. The model caveat moved into optional help; save-failure warnings, restart confirmation, decision/time progress, unavailable-choice explanations and economic prose were retained because they aid interpretation or prevent loss of progress.
6. **Any remaining prototype or AI filler?** None identified in visible gameplay. Remaining headings, scene captions, progress labels and controls communicate scenario state, navigation or economics. Private-development documentation remains outside gameplay.

Work stops at this focused cleanup. The RPG remains private and unpublished.
