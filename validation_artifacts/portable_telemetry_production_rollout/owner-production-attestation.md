# Owner-operated production rollout evidence

Recorded for closeout on 2026-09-15. Source: the owner-supplied “MASTERY QUESTS — PORTABLE TELEMETRY PRODUCTION ROLLOUT CLOSEOUT + OPERATOR DOCUMENTATION” request. This is a transcription of the owner’s production observations, not a new test run. Earlier repository reports cover implementation, isolated staging and rehearsal; they do not independently establish these later production results. No raw request headers, tokens, screenshots or D1 row dumps were supplied with this closeout request.

- bounded intake pause returned expected 503;
- health remained 200;
- migration 0003 applied successfully;
- capability-era tables created;
- telemetry_ingest_batches gained:
  capability_id
  admission_valid
- initial capability/policy/scope-window tables were empty;
- capability-aware Worker deployed with flags OFF;
- legacy production beta continued returning 202;
- D1 legacy counts increased consistently;
- capability ingest then enabled;
- arbitrary valid HTTPS capability preflight returned 204;
- external issuance remained blocked;
- malformed capability returned 403;
- exact grandfathered beta remained 202;
- production capability issuance enabled;
- official Composer activation preflight returned 204;
- GitHub activation origin returned 403;
- production sitekey deployed to public Composer;
- telemetry-OFF Composer generation caused no activation traffic;
- telemetry-ON Composer generation successfully issued capability;
- unchanged GitHub-hosted production-generated game:
  OPTIONS 204
  POST 202;
- production D1 attributed receipts/events to exact capability;
- browser opt-out stopped further remote requests;
- exact duplicate replay:
  HTTP 202
  accepted=0
  duplicates=1
  no change to:
    run event count
    run last_received_at
    capability accepted events/bytes
    build accepted events/bytes
    global accepted events/bytes;
- capability revocation produced terminal 403;
- subsequent remote sends stopped;
- gameplay continued;
- local CSV remained downloadable;
- live tail exposed no raw X-MQ-Ingest-Token;
- a second freshly generated production Composer game hosted on GitHub Pages also returned 204/202;
- final production active capability count = 0.

The owner also reports that the local file/null-origin case preserved gameplay and CSV, and that live build/faculty-build-composer/anonymous-telemetry-source.js was hash-verified against canonical repository source after rollout. The actual release hash and individual smoke timestamps were not supplied; none are invented here. Final state and deployment identifiers are transcribed in production.json.
