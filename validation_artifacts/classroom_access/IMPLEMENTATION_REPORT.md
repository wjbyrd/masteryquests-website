# Classroom access gate implementation report

Implemented in `C:\Users\Jennings\Documents\GitHub\masteryquests-website`. Nothing was committed, deployed, or provisioned. No real access code or signing secret was requested, read, generated, or configured.

## Architecture inspection

Repository inspection found:

- Root `wrangler.jsonc` names `masteryquests-website`, compatibility date `2026-08-07`, originally static assets at `./dist` without a main handler.
- `server/anonymous-telemetry-poc/wrangler.jsonc` names the separate `masteryquests-anonymous-telemetry-poc` Worker and routes `masteryquests.org/api/anonymous-telemetry-poc/*` to its existing D1-backed service.
- No Pages Functions, `functions/` entry, `_routes.json`, `_headers`, `_redirects`, Pages output configuration, or tracked CI deployment pipeline was found.
- The classroom pages use an authoritative public `<base>` for Managerial artwork and parity JS/CSS; those assets must remain public.

Read-only Cloudflare inspection confirmed the hosting model rather than relying on prior report terminology:

```powershell
npx --no-install wrangler deployments list --config wrangler.jsonc
npx --no-install wrangler versions view 5e52c738-525b-4ffa-9664-53929481e895 --config wrangler.jsonc --json
npx --no-install wrangler pages project list --json
```

The active version inspected was `5e52c738-525b-4ffa-9664-53929481e895`, created September 5, 2026 at 19:56:04 UTC. Its resources showed no script handlers or bindings, with static assets `serve_directly: true` and `raw_run_worker_first: false`. Pages project listing returned an empty array. The actual service is **Workers Static Assets**, not a Pages-only site. No secret values or author/account details are copied into this report.

## Chosen implementation

The existing website Worker receives a small module and an `ASSETS` binding. No new Worker or Cloudflare route is introduced. The separate telemetry Worker configuration and route remain byte-identical.

`assets.run_worker_first` is limited to `/play/managerial-directorate-classroom` and `/play/managerial-directorate-classroom/*`. Cloudflare redirects encoded aliases to their canonical protected paths before exposing content; the actual runtime tests verify this for HTML and scripts. The handler checks only the classroom subtree; all other requests immediately return the existing asset handler's response. The existing telemetry route remains outside the gate and retains its more specific routing. No network proxy or cross-Worker fetch architecture was added.

Public assets retain their existing direct-serving behavior. Classroom requests incur ordinary Worker invocation usage. It does not introduce Zero Trust, accounts, email authentication or seat-based authorization. Cloudflare documents Worker-first asset handling for authentication middleware. [Routing reference](https://developers.cloudflare.com/workers/static-assets/routing/worker-script/)

## Exact implementation files

Modified:

- `wrangler.jsonc` — adds main handler, asset binding, classroom-only Worker-first execution and native login-rate-limit binding; retains original Worker name, compatibility date and asset directory.

Added:

- `server/classroom-access/worker.mjs`
- `server/classroom-access/README.md` — exact setup, deployment, rotation and shutdown commands.
- `.gitignore` — excludes local secret files and Cloudflare caches from Git.
- `.assetsignore` — excludes local secret files/caches, stale dist and gate-only source/test/evidence paths from direct repository asset deployment.
- `audit_tools/classroom_access/run_validation.mjs`
- `audit_tools/classroom_access/run_browser.mjs`
- `audit_tools/classroom_access/evidence-redirect.cjs`
- `audit_tools/classroom_access/run_preservation.mjs`
- `audit_tools/classroom_access/run_secret_scan.cjs`
- Evidence, screenshots and this report under `validation_artifacts/classroom_access/`; the exact recursive file inventory is `FILES_ADDED.txt`.

All **4,046 other pre-existing tracked files** match their captured hashes. Classroom build `2026.09.05-classroom1`, public Managerial games, the POC, telemetry Worker/D1, Composer and historical validation files are unchanged. New preservation screenshots are stored under the gate evidence directory.

## Gate behavior and threat model

Every classroom page and descendant asset requires authorization, including the four direct title paths, `index.html` aliases, classroom client scripts and unknown descendant paths. The slashless classroom root canonicalizes to the scoped root. Encoded and repeated-slash aliases were tested in Cloudflare's local runtime. Shared public assets stay public.

The form asks only for the class code. It posts to the current classroom URL, verifies the code server-side, sets a signed cookie, and redirects to the requested classroom path. There is no user-controlled external return URL. An incorrect code returns a generic accessible error without reflecting the input or issuing a cookie. Unsupported, oversized, cross-origin and malformed submissions are rejected. The `same-origin` referrer policy permits native browser origin checking while suppressing cross-site referrers; a stricter initial policy was corrected when the real-browser test exposed its effect on the Origin header.

This deters casual unauthorized entry. Shared-code redistribution remains an accepted risk. It does not authenticate telemetry ingestion, prevent a code-holder from sharing access, or revoke copies already downloaded. The telemetry API is intentionally left under its existing independent controls.

## Secrets, cookie and privacy

Required server-side secret names:

- `CLASSROOM_ACCESS_CODE`
- `CLASSROOM_SESSION_SECRET`

No values are in source or artifacts. The code must have at least 12 characters, and the independent signing secret at least 32. Use generated high-entropy values rather than a guessable class name. Test credentials are random, ephemeral, in-memory fixtures; screenshots are taken with the input empty. The sole literal incorrect test value is explicitly labeled synthetic.

The cookie is named `__Secure-MQClassroom`, is host-only, and is scoped to `/play/managerial-directorate-classroom/`. Attributes are `HttpOnly; Secure; SameSite=Lax; Max-Age=36000`. Its HMAC-SHA-256 authenticated payload is only `{v, iat, exp}`. No access code, telemetry UUID, run ID, identity, IP or device data is stored in it. Web Crypto signs/verifies domain-separated MACs for sessions and code comparison. Tampering, malformed tokens, duplicate cookies, expiration, future issuance and unexpected token fields are rejected.

The access session is not joined to telemetry. The gate neither reads telemetry state nor emits telemetry events. Browser checks prove that the gate cookie is absent from successful telemetry POSTs, which continue using the existing `credentials: omit`. Payloads remain synthetic=false with their original anonymous client/run/source mappings.

Gate and authorized classroom responses are private/no-store and noindex. Missing secrets, unavailable rate limiting and the pilot-close flag fail closed for the classroom only. No raw input, cookies or IPs are logged by application code.

## Rate limiting

The existing website Worker gains one Cloudflare-native `CLASSROOM_LOGIN_LIMIT` binding: namespace `2026090501`, limit 120 attempts per 60 seconds. It uses the constant key `managerial-classroom-login`, so no student, cookie, IP or telemetry identifier is stored. The limit is checked before verifying a submitted code. Successful existing sessions do not consume this bucket. It is a modest class-wide deterrent, with enough capacity for roughly 60 initial correct logins.

The tradeoff is that excessive attempts can temporarily delay other new logins in the same Cloudflare location. Native counters are local and eventually consistent; this is not a global brute-force accounting database. No D1/KV table or IP record was added. [Rate-limit reference](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/)

## Validation

Commands from the canonical repository:

```powershell
node audit_tools/classroom_access/run_validation.mjs .
$env:PLAYWRIGHT_MODULE='C:\Users\Jennings\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\node_modules\playwright'
$env:MINIFLARE_MODULE='C:\Users\Jennings\AppData\Local\npm-cache\_npx\32026684e21afda6\node_modules\miniflare'
node audit_tools/classroom_access/run_browser.mjs .
node audit_tools/classroom_access/run_preservation.mjs .
node audit_tools/classroom_access/run_secret_scan.cjs
npx --no-install wrangler deploy --dry-run --config wrangler.jsonc --assets . --outdir validation_artifacts/classroom_access/dry-run
git diff --check
```

The installed Miniflare exports a compatibility converter, used by the browser harness to configure the actual Worker, asset router and native rate limiter. Browser requests use a local/intercepted HTTPS test origin. The unchanged telemetry Worker runs against a disposable local SQLite database using the established D1 test adapter. No test traffic reached the live API.

| Final suite | Passed | Failed |
| --- | ---: | ---: |
| Gate/security/configuration/preservation | 27 | 0 |
| Actual Cloudflare runtime + Edge browser integration | 11 | 0 |
| Existing classroom browser parity and telemetry suite | 80 | 0 |
| Existing telemetry stabilization regressions | 21 | 0 |
| Existing Worker/backend integration | 18 | 0 |
| Final credential/privacy/ignore scans | 3 | 0 |
| Total | **160** | **0** |

Wrangler 4.129.0 dry run passed and produced an approximately 8.56 KiB Worker bundle with ASSETS and the 120/60s rate-limit binding. It explicitly exited without deployment. `git diff --check` passes. The security scan covers added source, logs, reports and bundle/source map for literal credential assignments and bearer values, and confirms no telemetry identity or IP handling in gate code. No real credentials were used.

The original suites run through an evidence redirect; their existing files and historical outputs remain intact. Gate tests exercise all requested hub/direct-title, wrong/correct code, cookie flags, forgery/expiry, navigation, preservation, native rate-limit, mobile and telemetry-separation conditions. The new browser tests have zero runtime errors.

## Screenshots

Seven gate/authenticated snapshots:

- `gate-desktop.png`
- `gate-mobile.png`
- `gate-error-mobile.png`
- `cost-directive-authorized-menu-mobile.png`
- `market-signal-authorized-menu-mobile.png`
- `strategy-desk-authorized-menu-mobile.png`
- `agency-protocol-authorized-menu-mobile.png`

They are under `validation_artifacts/classroom_access/`. The mobile gate was visually reviewed at 390x844 with visible input focus and no overflow. The existing classroom preservation run also generated its 26 screenshots, retained under `existing/managerial_classroom/`.

## Deployment, rotation and shutdown

Full exact commands and their order are in `server/classroom-access/README.md`. In brief: set both secrets interactively on `masteryquests-website`, then deploy the new handler and complete current static assets together. The tested direct-repository command uses `--assets .` and the new `.assetsignore`; the existing `dist` workflow remains available if populated correctly.

- Static Pages deployment: **not required**; the actual deployment is Workers Static Assets.
- Existing website Worker deployment: **required**, together with its asset configuration.
- New Worker or route: **not required**.
- Telemetry Worker redeployment: **not required**.
- D1 migration: **not required**.
- New server-side secrets: **both required**.

Code rotation preserves existing 10-hour sessions; signing-secret rotation invalidates them. Rotation uses interactive secret updates, with no source edit or asset rebuild. Cloudflare secret updates themselves create/deploy a new Worker version. [Secret-operation reference](https://developers.cloudflare.com/workers/configuration/secrets/)

Set `CLASSROOM_CLOSED` to `true` as a server-side secret to close all classroom access after the pilot, including existing sessions. Removing the access-code secret also closes it. Neither action removes files or telemetry. Do not remove the gate or disable Worker-first execution as a shutdown method, because that would reopen static access.

## Post-deployment manual QA

1. In a private browser window, open `https://masteryquests.org/play/managerial-directorate-classroom/` and each direct title URL. Confirm the gate appears before any classroom HTML, including explicit `index.html` paths.
2. Enter an incorrect code: expect the generic error and no cookie. Enter the real code privately: expect return to the originally requested title. Inspect only cookie attributes, not its value in shared evidence.
3. Navigate among all four games without re-entering the code. Verify the menu, Daily, guide/checkpoint intros and mobile layout. Confirm an expired/tampered session requires the code again.
4. Confirm public Managerial/Principles pages and shared assets remain ungated. Confirm the diagnostic POC retains its debug/synthetic controls.
5. Start a classroom run and inspect successful POSTs to `/api/anonymous-telemetry-poc/v1/events`. Confirm synthetic=false, original run/source mapping, no Cookie header and no access-session fields. Check refresh/Continue and queue retry.
6. Confirm modest repeated invalid submissions return 429/Retry-After without interrupting valid sessions. Avoid exhausting the shared login bucket during student arrival.
7. After the pilot, set the closed flag and verify the subtree closes even with an existing valid cookie. Confirm public pages, the API, POC, source files and stored telemetry remain available as before.
