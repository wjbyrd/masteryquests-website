CREATE TABLE IF NOT EXISTS telemetry_events (
  event_id TEXT PRIMARY KEY,
  run_id TEXT NOT NULL,
  anonymous_client_id TEXT NOT NULL,
  build_id TEXT NOT NULL,
  build_version TEXT NOT NULL,
  schema_version INTEGER NOT NULL,
  phase TEXT NOT NULL,
  game_id TEXT NOT NULL,
  mode TEXT NOT NULL,
  event_type TEXT NOT NULL,
  sequence_number INTEGER NOT NULL,
  event_timestamp TEXT NOT NULL,
  received_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  elapsed_time_ms REAL NOT NULL DEFAULT 0,
  position INTEGER NOT NULL DEFAULT 0,
  question_id TEXT NOT NULL DEFAULT '',
  concept_id TEXT NOT NULL DEFAULT '',
  learning_objective TEXT NOT NULL DEFAULT '',
  question_type TEXT NOT NULL DEFAULT '',
  difficulty TEXT NOT NULL DEFAULT '',
  selected_response INTEGER,
  correct INTEGER,
  response_time_ms REAL NOT NULL DEFAULT 0,
  rapid_guess INTEGER NOT NULL DEFAULT 0,
  remediation_stage TEXT NOT NULL DEFAULT '',
  bridge_stage TEXT NOT NULL DEFAULT '',
  retest_stage TEXT NOT NULL DEFAULT '',
  boss_stage TEXT NOT NULL DEFAULT '',
  graph_question INTEGER NOT NULL DEFAULT 0,
  score REAL NOT NULL DEFAULT 0,
  streak INTEGER NOT NULL DEFAULT 0,
  daily_progress REAL NOT NULL DEFAULT 0,
  artifact TEXT NOT NULL DEFAULT '',
  completion_status TEXT NOT NULL DEFAULT '',
  mastery_attempts INTEGER NOT NULL DEFAULT 0,
  mastery_correct INTEGER NOT NULL DEFAULT 0,
  mastery_accuracy REAL NOT NULL DEFAULT 0,
  synthetic INTEGER NOT NULL DEFAULT 0,
  extras_json TEXT NOT NULL DEFAULT '{}',
  UNIQUE(run_id, sequence_number)
);

CREATE INDEX IF NOT EXISTS telemetry_events_run_sequence ON telemetry_events(run_id, sequence_number);
CREATE INDEX IF NOT EXISTS telemetry_events_client_time ON telemetry_events(anonymous_client_id, event_timestamp);
CREATE INDEX IF NOT EXISTS telemetry_events_build_time ON telemetry_events(build_id, event_timestamp);
CREATE INDEX IF NOT EXISTS telemetry_events_type_time ON telemetry_events(event_type, event_timestamp);
CREATE INDEX IF NOT EXISTS telemetry_events_synthetic ON telemetry_events(synthetic, received_at);

CREATE TABLE IF NOT EXISTS telemetry_runs (
  run_id TEXT PRIMARY KEY,
  anonymous_client_id TEXT NOT NULL,
  build_id TEXT NOT NULL,
  build_version TEXT NOT NULL,
  game_id TEXT NOT NULL,
  mode TEXT NOT NULL,
  first_event_at TEXT NOT NULL,
  last_event_at TEXT NOT NULL,
  first_received_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_received_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  event_count INTEGER NOT NULL DEFAULT 0,
  max_sequence INTEGER NOT NULL DEFAULT 0,
  completed INTEGER NOT NULL DEFAULT 0,
  completion_status TEXT NOT NULL DEFAULT '',
  synthetic INTEGER NOT NULL DEFAULT 0
);

CREATE INDEX IF NOT EXISTS telemetry_runs_client ON telemetry_runs(anonymous_client_id, last_event_at);
CREATE INDEX IF NOT EXISTS telemetry_runs_build ON telemetry_runs(build_id, last_event_at);

CREATE TABLE IF NOT EXISTS telemetry_ingest_batches (
  batch_id TEXT PRIMARY KEY,
  received_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  anonymous_client_id TEXT NOT NULL,
  event_count INTEGER NOT NULL,
  inserted_count INTEGER NOT NULL,
  duplicate_count INTEGER NOT NULL,
  synthetic INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS telemetry_rate_limits (
  anonymous_client_id TEXT NOT NULL,
  window_minute INTEGER NOT NULL,
  event_count INTEGER NOT NULL,
  PRIMARY KEY(anonymous_client_id, window_minute)
);
