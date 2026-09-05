# Anonymous telemetry POC backend

This is a standalone Cloudflare Worker + D1 service for the private Managerial Directorate telemetry proof of concept. It does not alter the public site's existing static deployment.

## Provision and deploy

1. Create a D1 database named `masteryquests-anonymous-telemetry-poc`.
2. Replace the all-zero `database_id` in `wrangler.jsonc` with the created database ID.
3. Apply migrations: `npx wrangler d1 migrations apply masteryquests-anonymous-telemetry-poc --remote`.
4. Create an admin secret: `npx wrangler secret put ADMIN_TOKEN`.
5. Set `ALLOWED_ORIGINS` to the exact private-build origin(s).
6. Route `/api/anonymous-telemetry-poc/*` to this Worker, or pass its URL to the private build as `?telemetryEndpoint=https://.../v1/events` during QA.
7. Deploy with `npx wrangler deploy` from this directory.

The ingestion endpoint is `POST /v1/events` (also available at `/api/anonymous-telemetry-poc/v1/events`). Health is public and contains no records. Every `/v1/admin/*` route requires `Authorization: Bearer <ADMIN_TOKEN>` and returns `no-store`/`noindex` headers.

## Private QA and cleanup

- `GET /v1/admin/summary` — counts and recent runs.
- `GET /v1/admin/runs/{runId}` — ordered raw events for one run.
- `GET /v1/admin/runs/{runId}/reconstruct` — deterministic run summary and timeline.
- `GET /v1/admin/anomalies` — sequence gaps/out-of-order indicators, duplicate batches, and incomplete runs.
- `GET /v1/admin/export.csv?buildId=managerial-directorate-telemetry-poc` — normalized export; add `includeSynthetic=1` to include QA fixtures.
- `POST /v1/admin/cleanup` with `{ "scope": "synthetic", "confirm": "DELETE" }` — delete all synthetic QA rows.
- `POST /v1/admin/cleanup` with `{ "scope": "build", "buildId": "managerial-directorate-telemetry-poc", "confirm": "DELETE" }` — delete all rows for this build.

The Worker rejects direct identifiers and free-response fields, caps request/batch size, validates UUIDs and ranges, accepts one anonymous client per batch, rate-limits by opaque client ID, and uses `INSERT OR IGNORE` plus unique event and run-sequence constraints for idempotency. JSON extras are limited to `selectionReason`, a five-row `weaknessEstimate`, `sourceEvent`, and the additive QA fields `sourceRunId`, `lifecycleReason`, `acceptedAttempt`, `artifactName`, `artifactSource`, `artifactAlreadyOwned`, `artifactOwnedBeforeRun`, and `artifactNewlyEarned`; arbitrary extra fields are rejected.

## Stabilization patch (2026.09.05-poc2)

Deploy the updated Worker before the static private build, then apply `0002_completion_semantics.sql` to the existing database (`managerial-telemetry-poc` in the current configuration). This migration repairs historical lifecycle/completion data; it makes no schema changes. New fields use the existing validated `extras_json` storage.

Reconstruction retains raw `answerCount`, `correctAnswers`, and `accuracy` and adds explicit raw/accepted attempt metrics. Historical source events classify acceptance; missing evidence is reported as `unclassifiedAttempts`. Run completion is durable; lifecycle and adaptive reasons are separate. CSV exposes the additive QA fields alongside the original event columns.

See [the stabilization report](../../validation_artifacts/anonymous_telemetry_poc/STABILIZATION_REPORT.md) for root causes, changed files, 93 passing checks, deployment order, timing/ownership semantics, historical-data limits, and the exact manual QA sequence. No deployment was performed as part of this patch.