# Temporary Stage 3 staging

Status: AWAITING_OWNER_SECRET_INSTALLATION. Only the temporary Worker and D1 have been deployed.

The owner must run this interactive command in PowerShell and paste the secret only into Wrangler's secure prompt:

```powershell
npx --yes wrangler@4.72.0 secret put TURNSTILE_SECRET_KEY --name masteryquests-telemetry-stage3-staging --config "C:\Users\Jennings\Documents\GitHub\masteryquests-website\audit_tools\telemetry_governance\stage3-staging\wrangler.staging.json"
```

Do not place the secret in a command argument, pipe, file, configuration, evidence or report. The agent has not read or installed it. Continue real-provider testing only after the owner confirms installation.

Public Composer configuration is in composer.staging.json. The isolated browser harness must insert its public sitekey into the mq-turnstile-sitekey meta element and intercept only the two listed canonical API paths, forwarding them to workerOrigin. Block production telemetry calls. This configuration is not yet an executed browser proof. No public Composer files were changed.

The wrapper exports only fetch and allows POST/OPTIONS on issuance and ingest. It imports the canonical Worker with its real verifier, with no injected mock. No production routes, cron or admin interface are exposed.

After the first-party proof and redaction checks, close tails, delete this named Worker and its recorded D1, verify absence, and remove the temporary Wrangler configuration. The resources remain live solely to await manual secret installation and the authorized proof.
