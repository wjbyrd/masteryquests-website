# Portable telemetry Stage 2 HTTP follow-up

**Stage 2 remains NOT COMPLETE. Stage 3: NO-GO. NOT DEPLOYED.**

The malformed Content-Length assertion is corrected and stronger at the application level. The two readable-response failures remain reproducible through actual local HTTP, including Edge. No server implementation, body limit, CORS rule, transaction, or security assertion was weakened. Local evidence isolates the failure from telemetry/D1 logic, but does not establish a complete runtime-safe response fix or prove Cloudflare production behavior.

## Baseline and scope

Repository: `C:\Users\Jennings\Documents\GitHub\masteryquests-website`.
Branch: `main`. Starting HEAD: `a248c116c66ab509686e9234b8d343c93c12ef1e`.

Captured `git status --short`, branch, HEAD and SHA-256 hashes before edits. All accepted uncommitted Stage 1, Stage 2, governance wording work, reports and prior evidence were preserved. The unmodified direct-runtime suite reproduced **36/39**, with the same three failures. Evidence is under `validation_artifacts/portable_telemetry_stage2_http_followup/`; `baseline/source.json` contains the starting status and hashes.

The design, Stage 1, governance wording-sync and Stage 2 reports remain historical records. This follow-up records the latest result.

## Reproduction and minimal Worker

Runtime: cached Miniflare `5.20260910.0-alpha`, workerd `1.20260910.1`, compatibility date `2026-08-07`. No packages were downloaded. All final runtime conclusions use actual loopback HTTP, not `dispatchFetch`. The minimal Worker has no telemetry imports or D1 dependency.

The final minimal matrix contains **810 trials**. For each of six strategies, Node HTTP and undici each ran 60 trials: three repetitions of 100 bytes, 128 KiB, 128 KiB + 1, 512 KiB and 2 MiB, using ASCII or multibyte UTF-8, with Content-Length or chunked framing. Edge ran another 15 trials per strategy. For missing Content-Length, the minimal fixture counts actual bytes before classifying the request. It returns controlled JSON with `Cache-Control: no-store`; oversized responses use status 413 and `{"error":"request_too_large"}`.

| Minimal strategy | Node HTTP unreadable / 60 | undici unreadable / 60 | Edge unreadable / 15 |
| --- | --- | --- | --- |
| Immediate response | 0 | 35 | 12 |
| Cancel body before response | 0 | 33 | 10 |
| Discard at most 1 MiB, then cancel remainder | 0 | 8 | 3 |
| Read exactly threshold + 1, then stop | 0 | 19 | 6 |
| Read exactly threshold + 1, then cancel | 0 | 10 | 5 |
| Immediate response with Content-Encoding: identity | 0 | 0 | 6 |

These are observations from a repeated local run, not failure probabilities. The Node HTTP comparison uses explicit connection closure and does not request compression. undici uses its normal transport behavior. Edge uses its normal HTTP stack. Node HTTP records status line, headers, response completion and socket closure/error; undici and Edge record status/headers when exposed, body readability and exceptions. The runtime log is captured separately in the same JSON artifact. Client APIs do not expose identical socket details.

The stream experiments use BYOB buffers of at most 16 KiB. Threshold reads stop at exactly 131,073 bytes. The diagnostic drain discards at most 1 MiB and never buffers an arbitrary upload. Requests exceeding that drain still fail in some clients. Cancellation alone is insufficient. No diagnostic draining strategy was copied into the canonical helper.

## Root-cause classification

The supported classification is an **interaction between unread upload data, early local runtime responses, response compression and client/socket behavior**:

- The minimal Worker reproduces the failure without authorization, telemetry validation, SQL or D1.
- Settling the entire small upload improves delivery; bounded draining does not guarantee delivery for larger uploads.
- Cancelling an unread request does not reliably settle response delivery.
- Disabling response compression makes the sampled undici responses readable, but Edge still fails for the 512 KiB and 2 MiB immediate-response trials. Compression is a contributor, not a complete explanation or fix.
- Node HTTP, undici and Edge expose different outcomes. This is not solely an exact undici exception-name issue.

The installed Miniflare source was inspected around its logger and auxiliary loopback server (`dist/src/index.js`, including `#startLoopbackServer`). Its auxiliary HTTP/2 server sets a keep-alive timeout; this is not proof about the workerd ingress socket. No local source comment established a guaranteed early-response cancellation recipe. The evidence does not pinpoint one defective internal runtime function, prove that every possible safe implementation must fail, or attribute the behavior to Cloudflare production.

A header-only workaround or bounded drain that leaves larger browser uploads failing would not meet acceptance. Server implementation therefore remains unchanged.

## Canonical bounded reader

`server/anonymous-telemetry-poc/capabilities.mjs` was inspected and remains byte-identical:

- The application ceiling remains **131,072 actual bytes**.
- A declared larger Content-Length rejects before body reads.
- Missing or misleading smaller Content-Length still goes through streaming byte accounting.
- The first chunk taking the count above the ceiling is not retained; the reader cancels and rejects before JSON parsing or persistence.
- Retained chunks total at most the configured ceiling; their final concatenation is also bounded by that ceiling. Decoding and parsing operate only on this bounded content.
- UTF-8 accounting uses `byteLength`, with fatal UTF-8 decoding, not JavaScript character count.

The application cannot control the allocation of an incoming runtime-provided chunk; it does not retain or copy an oversized chunk into its accumulated content. No unbounded request buffer or unbounded drain was added.

Nine additional canonical-reader checks pass: exact boundary and boundary + 1, ASCII/multibyte data, absent and false-small Content-Length, plus an infinite producer. The latter cancels after the first excess 4 KiB chunk, with exactly 33 pulls, rather than draining indefinitely. Evidence: `body-reader-results.json`.

## Content-Length correction

The previous assertion required `UND_ERR_REQ_CONTENT_LENGTH_MISMATCH`. The baseline actual HTTP run instead produced `UND_ERR_SOCKET`. Additional malformed framing trials produced a timeout or a mismatch exception, with no usable Worker response. An invalid transport frame cannot reliably provide an application response, and its exact library error name is not the admission invariant.

The revised grouped test seeds valid existing work, attempts the malformed request, permits a transport TypeError or an observable HTTP 413, compares the entire local D1 snapshot, checks redaction/logs and then requires a valid request to succeed. Snapshot equality covers existing telemetry, summaries, receipts and all capability/build/window/lifetime accounting. The replacement does not permit successful admission, an arbitrary application error, mutated counters, or an unhealthy runtime.

The readable-body requirement for ordinary, correctly framed oversized requests remains unchanged. Those two grouped tests still fail; failures are not suppressed. Per-request no-write snapshots were also added around their oversized requests.

## Browser comparison and no-write evidence

Headless Microsoft Edge `153.0.4234.32` used an in-memory document at the approved first-party origin `https://masteryquests.org`. Only that origin received local-network-access permission. API requests went through the real browser network stack to loopback workerd, with normal CORS enabled. The document was fulfilled locally; all other external requests were blocked. No public page or game code was changed or loaded from production.

The real Worker matrix ran **92 trials**, including Node declared-length, Node chunked and Edge requests, plus two deliberately malformed Content-Length cases. Each client covered small valid JSON, exact boundary, boundary + 1, 512 KiB and 2 MiB, with ASCII/multibyte content and repeated trials. Existing accepted work was seeded before the rejection snapshots.

| Ordinary oversized real-Worker trials | Trials | Status 413 exposed | Body readable |
| --- | --- | --- | --- |
| undici, Content-Length | 18 | 18 | 6 |
| undici, chunked | 18 | 18 | 9 |
| Edge | 18 | 6 | 2 |

All **54 ordinary oversized plus 2 malformed framing cases** have equal before/after snapshot hashes. The snapshot covers `telemetry_events`, `telemetry_runs`, `telemetry_ingest_batches`, `telemetry_rate_limits`, `telemetry_build_policies`, `telemetry_build_capabilities` and `telemetry_scope_windows`, including lifetime rows. No rejected case committed accepted work. A valid request after malformed transport succeeded.

All 17 delivered oversized bodies were verified as the controlled `request_too_large` error. Available Node 413 headers and all six browser-observed 413 header sets passed ACAO, Vary and no-store checks. Edge's CORS-filtered JavaScript headers and browser network observations are recorded separately. Many Edge trials exposed only `Failed to fetch` / `net::ERR_FAILED`; reliable status/header observability cannot be claimed for every browser request.

The browser fixture catches fetch/read failures and recorded zero unhandled page errors. This is a fixture-level client observation, not a claim that unchanged public game code was exercised against the new capability path. Runtime logs and published evidence were checked against the in-memory credentials; raw capabilities were not published.

## Final validation

| Suite | Final result |
| --- | --- |
| Stage 2 SQLite HTTP | **39/39 PASS** |
| Stage 2 actual HTTP workerd/D1 | **37/39; 2 FAIL** |
| Canonical bounded reader | 9/9 PASS |
| Stage 1 capabilities | 56/56 PASS |
| Governance | 14/14 PASS |
| Readiness/remediation | 27/27 PASS |
| Scheduled retention | 11/11 PASS |
| Backend integration | 18/18 PASS |
| Client/backend regressions | 21/21 PASS |
| Measurement contract | 16/16 PASS |
| Private refresh | 33 cases PASS |
| Published Managerial/local-only | 103/103 PASS |
| git diff --check | PASS |

The remaining runtime failures are controlled oversized-response readability and UTF-8/body-boundary response readability. They retain their original product assertions and now include additional no-write checks.

Readiness initially passed 26/27 because its new output directory lacked the required `preflight.json`. That first attempt is retained. The preflight was populated from this task's starting source hashes, and the unchanged suite reran 27/27. No assertion or production source was altered to resolve this harness setup omission. Disposable generated readiness builder copies were removed only from this task's evidence directory after validation.

## Exact changes and preserved boundaries

Modified pre-existing files:

- `audit_tools/telemetry_governance/capability-http-check.mjs`: transport-level rejection/state/health correction and per-oversized-request no-write snapshots.
- `audit_tools/telemetry_governance/capability-http-fixture.mjs`: expose the disposable runtime's loopback URL to the browser fixture.

New test tools:

- `audit_tools/telemetry_governance/capability-body-diagnostic.mjs`
- `audit_tools/telemetry_governance/capability-body-runtime-check.mjs`
- `audit_tools/telemetry_governance/capability-body-reader-check.mjs`

New reporting: this file and `validation_artifacts/portable_telemetry_stage2_http_followup/`, including `followup.json`, the local regression runner, baseline, diagnostic records, source verification and final results.

A SHA-256 comparison of **10,900 pre-existing files** found only the two expected test files changed, with no missing files. All server implementation/configuration, Composer, clients, beta HTML, public games, National Engine, public docs, contracts, retention, migration 0003 and prior evidence remain unchanged. `mq-measurement/1`, `mq-governance/2` and `mq-disclosure/2` remain unchanged.

`CAPABILITY_ISSUANCE_ENABLED`, `CAPABILITY_INGEST_ENABLED` and `CAPABILITY_LEGACY_GRACE_ENABLED` remain string `false`. No production D1 or telemetry endpoint was accessed, no remote migration was applied, no Stage 3 work was performed and nothing was deployed.

## Required evidence before reconsidering Stage 3

The current local runtime cannot satisfy the readable-error acceptance gate. This is an unresolved local transport limitation with a browser-visible consequence; production product behavior remains unproven. It is not grounds to upgrade Stage 2 or waive either failure.

A separately authorized follow-up must resolve the local runtime behavior while retaining bounded resource use and obtain 39/39. If staging is needed to separate local emulation from deployed behavior, it must use an isolated Worker and synthetic D1 under an already approved first-party origin, without broadening CORS or accessing production data. Required staging evidence is:

1. Repeated real-browser and Node requests at 128 KiB, +1 byte, 512 KiB and 2 MiB, including multibyte, chunked and slow uploads, with normal compression/connection behavior.
2. Readable controlled JSON 413, approved ACAO, `Vary: Origin` and no-store for ordinary oversized requests; separately record status, headers, body, socket/client errors and runtime logs.
3. Before/after equality of all telemetry, run, receipt, capability, build and window/lifetime counters for every rejected or malformed request; successful subsequent valid requests.
4. Bounded memory and time under slow or unending uploads, with no unbounded buffering/draining, credential leakage or relaxed admission rules.

No staging operation is authorized or performed by this report. **Stage 3 recommendation remains NO-GO.**
