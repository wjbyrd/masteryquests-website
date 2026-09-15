# Portable telemetry quota boundary fix

**Stage 5 engineering blocker: CLEARED. Actual production rollout: NO-GO. Deployment status: NOT DEPLOYED.**

The reproduced minute-boundary defect is eliminated by bounded reclassification with all transactional quota and freshness guards retained. Ordinary short-window throttling now uses bounded client retry; lifetime exhaustion remains terminal. Production provisioning and owner release decisions remain outstanding.

## Baseline and original reproduction

Repository: `C:\Users\Jennings\Documents\GitHub\masteryquests-website`. Branch: `main`. Starting HEAD: `e8f5ac78588dce28049d3170124bc0d7fb61d09d`. Initial `git status --short` was empty. No commit or push was performed.

Before editing, the existing Stage 5 diagnostic reproduced HTTP 429 with counters below quota and zero accepted writes; its normal-clock control returned 202. The result is preserved in `validation_artifacts/portable_telemetry_quota_boundary_fix/before.json`. The Stage 5 report, command runbook and machine-readable rehearsal were consulted; their historical evidence remains intact.

The root cause was two effective instants within one admission attempt. `databaseTime()` supplied minute N, then a preliminary `windowPredicate()` query evaluated its `unixepoch()` freshness clause in minute N+1. `checkWindows()` interpreted every false predicate as exhausted quota. The per-client preliminary predicate had the same ambiguity. Transactional freshness failures already caused rollback/retry, but preliminary failures escaped that retry path as 429. Lifetime ceilings also incorrectly shared the rate-limit response.

## Authoritative clock and transaction model

| Path | Time authority and derived identity |
|---|---|
| Capability lookup / attempt classification | D1 `SELECT unixepoch() AS now`, validated integer seconds |
| Capability, build and global minute windows | `scopeWindow(...,60,now,...)`: floor of that database timestamp, in seconds |
| Additional anonymous-client limiter in capability/grace mode | `Math.floor(now/60)` from the same database timestamp |
| Preliminary admission quota checks | One SELECT returns both predicate result and database `unixepoch()`; mismatched minute means reclassify, not 429 |
| Transactional freshness / quota predicates | Existing live SQL `unixepoch()` checks and bound counter ceilings remain enforced |
| Window increments | Bound window identities classified for this attempt; upserts add to existing counters, never reset them |
| Revocation / block / expiry / grace sunset | Live database predicates remain authoritative, including final authorization guard |
| Retry-After | Remaining seconds in the database minute observed by the rejection query |
| Original flags-OFF legacy per-client route | Existing Worker `Date.now()/60000` path in worker.mjs remains unchanged |
| Issuance hour/day windows | Existing shared scopeWindow/checkWindows issuance path remains unchanged; this fix makes no new hour/day issuance-boundary claim |
| Deterministic tests | Disposable SQLite overrides `unixepoch()` from an injected millisecond clock, rounded down to seconds; barriers advance it without sleeps |
| Generated browser retry / descriptor expiry | Browser Date.now for scheduling and local expiry checks; never trusted as server quota authority |

Each ingest attempt classifies from current database time. A preliminary stale minute restarts classification; a transactional race rolls back the entire D1 batch before reclassification. The existing maximum of three total attempts remains. Repeated stale transitions exhaust as controlled HTTP 503 `ingest_unavailable`, not a false quota 429. Other unresolved ownership/content races retain their controlled conflict behavior.

No freshness guard was removed, no limit widened, no client timestamp trusted, and no migration changed. Receipts, events, run updates, accepted-event/byte accounting and window increments remain in one transaction. Retry recomputes novel events and ownership rather than reusing stale deduplication decisions. Lifetime budgets are checked before minute ceilings so a permanently exhausted build is not mislabeled transient when both are full.

## Canonical changes and generated outputs

Canonical behavior changed in:

- `server/anonymous-telemetry-poc/capability-admission.mjs`: same-statement clock/quota classification, bounded stale-window handling, terminal lifetime budgets and calculated retry delay.
- `server/anonymous-telemetry-poc/dual-mode-ingest.mjs`: map lifetime exhaustion to 403 and expose the calculated Retry-After for genuine 429.
- `play/managerial-directorate-telemetry-poc/telemetry-client.js`: Composer descriptor transport distinguishes short-window throttling from terminal rejection and bounds recovery.

Existing generators synchronized `audit_tools/telemetry_contract/registry.json`, the Composer template's embedded registry, `build/faculty-build-composer/measurement-build.js`, `build/faculty-build-composer/anonymous-telemetry-source.js`, and the derived classroom telemetry client. Provenance source/build hashes change because transport source changed; measurement fields, contract versions and measurement calculations do not. Public polished game HTML and the public local-only telemetry source have no substantive diff.

Added audit helpers: `quota-boundary-check.mjs`, `client-429-check.mjs`, `quota-fix-production-readonly.mjs`, and `quota-fix-finalize.mjs`. The SQLite fixture gained an optional deterministic clock. Existing capability/HTTP/CORS/browser tests were updated only where they encoded obsolete all-429-terminal, lifetime-429, or fixed-60 expectations. Exact ceiling and no-write assertions remain. Short-window HTTP/CORS fixtures now actually exhaust minute quotas; new HTTP tests separately verify all five lifetime event/byte budgets as 403. Precise Retry-After boundary tests replace reliance on a fixed value at arbitrary wall-clock times. The regression runner accepts a separate evidence directory, preserving Stage 5 historical outputs.

## Deterministic boundary and concurrency evidence

**34/34 checks passed**, including:

- Entirely within a minute; exactly at the boundary; one millisecond/second before and after.
- Preliminary query crossing and transaction crossing, both below quota: 202 after safe reclassification.
- Exhausted new capability/build/global/client windows: genuine 429 and unchanged database snapshots.
- Exhausted old windows followed by available new windows: successful admission.
- All scopes crossing together; duplicate across a boundary with unchanged accepted bytes/events and one run event.
- Concurrent contenders with room for one or two requests; separate build/global/client boundary ceilings. No overshoot, double reservation, partial receipt or run-count inflation; accepted byte accounting reconciles with global accounting.
- Three forced preliminary or transactional transitions: bounded 503 with no writes.
- Alternating trusted fixture timestamps: previously consumed windows never reset or become free.
- Capability/build event budgets and capability/build/global byte budgets: terminal 403 even after entering a fresh minute. Lifetime exhaustion takes priority when minute capacity is also exhausted.

The fixture controls database time and transaction barriers; event timestamps never choose admission windows. Existing adversarial tests additionally retain revocation/block/expiry races, immutable run ownership, manifest dependencies, deduplication, exact concurrency ceilings and rollback on injected database failures.

For a genuine short-window rejection, Retry-After is `max(1,60-(database_seconds % 60))`. It is 60 at the exact boundary and 1 throughout the final database second. Tests cover 0, 1, 59,000 and 59,999 milliseconds after the boundary. No Retry-After is attached to terminal lifetime 403.

## Resolved client contract and end-to-end proof

The accepted design's response table specifies bounded jittered retry for `429 ingest_rate_limited`, terminal `403 ingest_budget_exhausted`, and bounded transient recovery for 503. Stage 2 implemented fixed-60 429 even for budgets; Stage 3 documented and tested terminal 401/403/429. This change explicitly reconciles those implementations to the design distinction, rather than silently choosing one historical behavior.

The generated Composer client retries only the recognized `ingest_rate_limited` 429 code. It honors Retry-After seconds or HTTP-date, with a one-second minimum, 60-second malformed/missing fallback, and 0–1 second jitter above the greater of server delay and exponential backoff. At most three retries follow the initial request, within a five-minute horizon. An excessive server delay stops recovery rather than being shortened. Network/503 recovery shares the bounded Composer budget.

New events and manual flushes cannot bypass cooldown. The queue stays bounded at 2,000 events and retry retains original IDs/sequences. Browser/faculty opt-out and expiry cancel pending transport. A subsequent server revocation/authorization 403 or budget 403 terminates the descriptor. Unknown 429 codes remain fail-closed. Retry exhaustion cancels queued work and pauses this page's transport without persisting a terminal marker against a healthy capability; automatic transport does not resume on that page. A later page load can use an otherwise valid descriptor, but cancelled events are not replayed.

**22/22 client checks passed**, using the complete canonical generated adapter with controlled browser primitives and disposable SQLite. One end-to-end test crosses a transaction boundary and accepts exactly one event/receipt/run update. Another fills the real SQLite per-client minute window, receives genuine 429, waits by deterministic timer advancement, retries identical event IDs, accepts once in the next minute, and clears the queue. Additional tests cover cooldown replacement by new events, overflow, late background wake, retry-count/time exhaustion, opt-out while a response body is pending, expiry, revocation, lifetime failure, unknown 429 and 503 recovery.

The actual Stage 3 Edge browser suite also passed 17/17, including generated gameplay and local CSV continuity under 403, retryable 429 and 503. Real-provider Turnstile was not automated or invoked.

## Full regression and publication checks

All **45 release-critical suite/runner entries passed**:

| Suite | Result |
|---|---:|
| Stage 1 capabilities | 56/56 |
| Governance | 14/14 |
| Readiness/remediation | 27/27 |
| Scheduled retention | 11/11 |
| Backend integration | 18/18 |
| Client/backend regressions | 21/21 |
| Measurement contract | 16/16 |
| Private refresh | 33/33 |
| Published Managerial/local-only | 103/103 |
| Stage 2 SQLite HTTP | 39/39 |
| Header SQLite / Workers runtime | 8/8 each |
| Stage 3 issuance / Composer / browser | 24/24; 11/11; 17/17 |
| Canonical verifier | 19/19 |
| Composer active runners | 27/27 |
| Stage 4 CORS SQLite / Workers runtime | 24/24 each |
| New boundary / client checks | 34/34; 22/22 |

After finalizing lifetime-error precedence, admission-specific capabilities 56/56, HTTP 39/39 and Workers-runtime CORS 24/24 were rerun successfully. Existing quota assertions were not bypassed or relaxed; changed response expectations are explicitly covered by the stronger boundary/client matrix above.

Controlled dist: **ok=true**, 1,793 files, **151 Concept Review PDFs**, forbiddenFileCount=0, incomingQuestionAssetCount=0. `git diff --check` passed. Generated contract/adapter parity checks passed. No production publication occurred.

## Staging and production protection

No staging deployment or real-time/provider boundary attempt was needed: deterministic local concurrency proof supplies the reliable evidence permitted by the request. Read-only retained-staging verification found five capabilities total, **zero active**, and **zero tails**. No capability was minted or staging record written by this task. The existing Worker/D1/domain remain retained.

Production operations were read-only metadata and aggregate queries. Telemetry version remains `afaa4ada-d6cf-48a5-bdde-13cc35f52f80`. Production website version was already `e0cff283-c818-4524-9a35-489933a3b74a` at this task's first read-only observation, differing from the earlier rehearsal's `edebb0d2-6ecd-4b82-860d-233ed6b4e37d`; its provenance was not established here. Two task observations matched. Do not represent the website as unchanged since the rehearsal or assume the old rollback target is current.

Production D1 remains `16b248ff-20cb-429c-a4a1-dd50d17c1fd0` with only migrations 0001/0002. Migration 0003 was **not applied**. Capability flags remain absent/OFF; first-party production CORS configuration is unchanged. No production Turnstile binding was created or altered; no secret value was inspected. No production Worker/site/D1/configuration writes or deployments were performed. Measurement/governance/disclosure versions and 730-day retention remain unchanged.

## Runbook and release decision

The runbook now documents retryable short-window 429, terminal lifetime-budget 403, three retries/five-minute horizon, cooldown enforcement, cancellation and operator diagnostics. Production mutation commands remain unexecuted. The newer website baseline is explicitly flagged for release review.

**Engineering blocker: CLEARED.** The reproduced minute-boundary defect is a plausible mechanism consistent with the historical Stage 3 symptom; the original incident is not definitively explained. That reproduced mechanism no longer creates a false terminal 429: available capacity is reclassified safely, pathological repeated transitions stop as bounded 503, and genuine transient 429 does not permanently suspend a healthy descriptor.

**Actual production rollout: NO-GO** until the owner provisions the dedicated production Turnstile widget/public key/secret, approves the pilot quota/account-tier capacity assumptions and exact bounded legacy sunset, reconciles the current website release/rollback target, accepts the candidate commit and evidence, and gives explicit GO at the existing production hold points. No production deployment is authorized by this report.

Machine-readable evidence: `validation_artifacts/portable_telemetry_quota_boundary_fix/fix.json`.
