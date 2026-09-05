# Anonymous classroom access gate

This gate runs in the existing `masteryquests-website` Worker. It protects `/play/managerial-directorate-classroom/` and every descendant, including direct game HTML and classroom scripts. It does not gate the public Managerial assets or the separate `/api/anonymous-telemetry-poc/*` Worker route.

## Deployment — not executed by this task

Run from `C:\Users\Jennings\Documents\GitHub\masteryquests-website`.

1. Choose a randomly generated shared code (at least 12 characters; recommend 16 or more) and an independent random signing secret (at least 32 characters). Keep both in a password manager. Do not put either in source, command arguments, query strings, screenshots or reports.
2. Set the two secrets using the interactive prompts:

```powershell
npx wrangler secret put CLASSROOM_ACCESS_CODE --config wrangler.jsonc
npx wrangler secret put CLASSROOM_SESSION_SECRET --config wrangler.jsonc
```

3. Deploy this Worker and the current static repository together:

```powershell
npx wrangler deploy --config wrangler.jsonc --assets .
```

This explicit `--assets .` uses the current repository as the static source, with the new `.assetsignore` excluding local secret files, Git/Cloudflare caches, stale `dist`, and gate-only source/tests/evidence. A non-deploying dry run of this exact configuration passed. The root configuration still retains its original `./dist` directory for an existing staging workflow; if using that workflow instead, populate it with the complete current static site and preserve equivalent secret/artifact exclusions before running `npx wrangler deploy --config wrangler.jsonc`. Do not deploy an empty or partial `dist` directory.

4. Test `https://masteryquests.org/play/managerial-directorate-classroom/` and all four direct game URLs in a fresh browser session. Check the existing telemetry endpoint separately.

No new Worker, route, Pages deployment or D1 migration is needed. The **existing website Worker must be deployed**. The telemetry Worker must not be redeployed for this change. Missing secrets close classroom access with a generic message, including for old sessions; public assets still pass through.

Cloudflare's `secret put` command creates and immediately deploys a new version of the existing Worker. Thus secret setup/rotation requires no source edit or separate asset rebuild, but is still a Cloudflare deployment operation. It was not executed here. Dashboard equivalent: Workers & Pages → `masteryquests-website` → Settings → Variables and Secrets → Add/Edit, choose **Secret**, enter the name/value, then Deploy. [Cloudflare secret documentation](https://developers.cloudflare.com/workers/configuration/secrets/)

## Rotation and shutdown

Rotate the shared code with the first `secret put` command above. Existing 10-hour sessions remain valid. Rotate the signing secret with the second command to invalidate all old sessions immediately.

To close access after the pilot, run:

```powershell
npx wrangler secret put CLASSROOM_CLOSED --config wrangler.jsonc
```

Enter `true` at the prompt. This closes the entire classroom subtree, even for valid cookies. Reopen with:

```powershell
npx wrangler secret delete CLASSROOM_CLOSED --config wrangler.jsonc
```

Removing `CLASSROOM_ACCESS_CODE` also closes access. Do not disable `run_worker_first` or remove the gate to shut down the pilot: that would expose the static classroom build. Do not remove the existing website Worker. No shutdown command deletes telemetry or classroom files.

## Security and privacy

The HMAC-SHA-256 signed cookie contains only version, issued time and expiry. Lifetime is 10 hours, with `HttpOnly; Secure; SameSite=Lax`, no Domain attribute, and Path `/play/managerial-directorate-classroom/`. It contains neither the code nor a random access/session identifier. Rotated signing keys, tampering, expiry and future-issued tokens are rejected.

Login uses a same-origin POST body and constant-time Web Crypto MAC verification. The code is never echoed or logged. Gate HTML and authenticated classroom responses are `private, no-store`. The gate uses no database, student identifiers, IP reads, telemetry client IDs or telemetry calls. The cookie path excludes the API, and the existing telemetry client's `credentials: omit` remains unchanged.

`CLASSROOM_LOGIN_LIMIT` uses the native Cloudflare rate-limit binding, namespace `2026090501`, at 120 login POST attempts per 60 seconds with one constant class-wide key. This accommodates approximately 60 students without per-student records. Valid existing sessions bypass login throttling. A busy/attacked bucket can temporarily delay all new logins in that location. Cloudflare counters are location-local and eventually consistent, not a strict global limit. [Cloudflare rate-limit documentation](https://developers.cloudflare.com/workers/runtime-apis/bindings/rate-limit/)

Classroom-only Worker-first patterns cover the slashless root and every descendant. Cloudflare canonicalizes encoded asset aliases with a redirect to the protected path; the runtime tests verify that no classroom content is served before authorization. Public assets retain their direct-serving behavior. Any outside request reaching the handler returns `ASSETS.fetch(request)` unchanged. Classroom requests incur ordinary Worker usage without an identity service or per-student account system. [Cloudflare Worker-first asset routing](https://developers.cloudflare.com/workers/static-assets/routing/worker-script/)

This is a casual-access gate, not an authentication layer for telemetry ingestion. Code sharing is accepted, and the ingestion API retains its existing independent validation and admin controls.

See `validation_artifacts/classroom_access/IMPLEMENTATION_REPORT.md` for inspection evidence, exact files, tests and the post-deployment checklist.
