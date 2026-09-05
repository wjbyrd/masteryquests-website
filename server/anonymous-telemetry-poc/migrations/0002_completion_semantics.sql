-- Data repair only; no schema changes. Retain historical transient reasons.
UPDATE telemetry_events
SET extras_json = json_set(extras_json, '$.lifecycleReason', COALESCE(json_extract(extras_json, '$.lifecycleReason'), completion_status)),
    completion_status = ''
WHERE event_type <> 'run_completed' AND completion_status <> '';

UPDATE telemetry_runs
SET completion_status = COALESCE((
    SELECT e.completion_status FROM telemetry_events e
    WHERE e.run_id = telemetry_runs.run_id AND e.event_type = 'run_completed'
    ORDER BY e.sequence_number DESC LIMIT 1
), '');
