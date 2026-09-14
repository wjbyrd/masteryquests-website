-- Stage 1 additive foundation. Apply only to disposable LOCAL fixtures in this task.
-- CASE protects malformed historical JSON without modifying or excluding its rows.
CREATE TABLE telemetry_build_policies (
  game_id TEXT NOT NULL CHECK(length(game_id) BETWEEN 1 AND 100),
  build_id TEXT NOT NULL CHECK(length(build_id) BETWEEN 1 AND 100),
  created_at INTEGER NOT NULL CHECK(created_at > 0),
  blocked_at INTEGER CHECK(blocked_at IS NULL OR blocked_at >= created_at),
  accepted_event_count INTEGER NOT NULL DEFAULT 0 CHECK(accepted_event_count >= 0),
  accepted_bytes INTEGER NOT NULL DEFAULT 0 CHECK(accepted_bytes >= 0),
  PRIMARY KEY (game_id, build_id)
);

CREATE TABLE telemetry_build_capabilities (
  capability_id TEXT PRIMARY KEY NOT NULL CHECK(length(capability_id) = 36),
  capability_hash TEXT NOT NULL UNIQUE
    CHECK(length(capability_hash) = 64 AND capability_hash NOT GLOB '*[^0-9a-f]*'),
  game_id TEXT NOT NULL,
  build_id TEXT NOT NULL,
  build_version TEXT NOT NULL
    CHECK(length(build_version) = 64 AND build_version NOT GLOB '*[^0-9a-f]*'),
  schema_version INTEGER NOT NULL CHECK(schema_version = 3),
  issued_at INTEGER NOT NULL CHECK(issued_at > 0),
  expires_at INTEGER NOT NULL CHECK(expires_at > issued_at),
  revoked_at INTEGER CHECK(revoked_at IS NULL OR revoked_at >= issued_at),
  issuance_request_id TEXT NOT NULL UNIQUE CHECK(length(issuance_request_id) = 36),
  activation_digest TEXT NOT NULL
    CHECK(length(activation_digest) = 64 AND activation_digest NOT GLOB '*[^0-9a-f]*'),
  accepted_request_count INTEGER NOT NULL DEFAULT 0 CHECK(accepted_request_count >= 0),
  accepted_event_count INTEGER NOT NULL DEFAULT 0 CHECK(accepted_event_count >= 0),
  accepted_bytes INTEGER NOT NULL DEFAULT 0 CHECK(accepted_bytes >= 0),
  last_used_at INTEGER,
  FOREIGN KEY (game_id, build_id)
    REFERENCES telemetry_build_policies(game_id, build_id)
);

CREATE INDEX telemetry_capabilities_build
  ON telemetry_build_capabilities(game_id, build_id, build_version, expires_at);
CREATE INDEX telemetry_capabilities_unrevoked_expiry
  ON telemetry_build_capabilities(expires_at) WHERE revoked_at IS NULL;

CREATE TABLE telemetry_scope_windows (
  scope_type TEXT NOT NULL CHECK(scope_type IN (
    'activation-global', 'activation-build',
    'ingest-global', 'ingest-build', 'ingest-capability'
  )),
  scope_key TEXT NOT NULL CHECK(length(scope_key) BETWEEN 1 AND 160),
  window_seconds INTEGER NOT NULL CHECK(window_seconds IN (0, 60, 3600, 86400)),
  window_start INTEGER NOT NULL CHECK(window_start >= 0),
  request_count INTEGER NOT NULL DEFAULT 0 CHECK(request_count >= 0),
  event_count INTEGER NOT NULL DEFAULT 0 CHECK(event_count >= 0),
  byte_count INTEGER NOT NULL DEFAULT 0 CHECK(byte_count >= 0),
  expires_at INTEGER,
  PRIMARY KEY (scope_type, scope_key, window_seconds, window_start),
  CHECK((window_seconds = 0 AND scope_type = 'ingest-global'
         AND window_start = 0 AND expires_at IS NULL)
     OR (window_seconds > 0 AND expires_at IS NOT NULL
         AND expires_at >= window_start + window_seconds))
);
CREATE INDEX telemetry_scope_windows_expiry
  ON telemetry_scope_windows(expires_at) WHERE expires_at IS NOT NULL;

ALTER TABLE telemetry_ingest_batches ADD COLUMN capability_id TEXT;
ALTER TABLE telemetry_ingest_batches ADD COLUMN admission_valid INTEGER
  NOT NULL DEFAULT 1 CONSTRAINT mq_ingest_admission CHECK(admission_valid = 1);
CREATE INDEX telemetry_batches_capability_receipt
  ON telemetry_ingest_batches(capability_id, received_at)
  WHERE capability_id IS NOT NULL;

-- Reuse existing run_manifest events instead of creating a manifest-content table.
CREATE INDEX telemetry_run_manifest_reference
  ON telemetry_events(run_id, build_id, game_id, build_version,
                      CASE WHEN json_valid(extras_json) THEN json_extract(extras_json, '$.manifestID') END)
  WHERE event_type = 'run_manifest' AND schema_version = 3;
