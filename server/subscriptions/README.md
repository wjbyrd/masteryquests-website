# October 2026 update subscriptions — operator setup

Status: implementation prepared; **disabled and not live**. No Brevo account,
sender, list, template, API credential, or real delivery/unsubscribe test was
available for this task. Do not enable the public form until the acceptance steps
below pass. The faculty bank request email fallback works independently.

## Architecture

The existing Cloudflare site Worker dispatches only `/api/subscriptions` to
`server/subscriptions/worker.mjs`. All other requests keep the existing classroom
gate/assets behavior. No D1, KV, student identifiers, classroom database, or
telemetry endpoint is used. Subscriber records live in Brevo, not this repository.
The browser has no provider credentials. GET returns only availability; there is
no public list, lookup, export, or removal endpoint.

POST requires an exact approved HTTPS origin, JSON under 2 KiB, valid email,
affirmative consent, and an empty honeypot. Cloudflare rate bindings limit IPs,
email addresses and overall volume. IP/email rate keys are HMAC digests, not raw
identifiers. These are short-window abuse controls, not a durable global quota;
Cloudflare rate limiting is approximate and location-based. Monitor provider
quotas and disable sign-up if abuse exceeds these controls. No application body
logging is used; Worker observability is disabled. Check account-level hosting
log settings separately.

The backend checks Brevo privately for existing membership and suppression, then
uses **double opt-in**, never direct contact creation/list insertion. Already
subscribed and suppressed addresses get the same generic response as eligible
new addresses. Suppressed contacts are never automatically re-enrolled. Provider
failures return an error rather than a fictitious success. A provider-accepted
request means confirmation was requested, not that email was delivered.

## Required Brevo configuration

1. Create an owner-controlled Brevo account dedicated to Mastery Quests updates.
   Set its account identity and verified sender; complete sender/domain
   authentication using DNS records issued by Brevo. Do not assume the existing
   university contact address is authorized as a sending identity.
2. Create a dedicated **Mastery Quests updates** contact list. Record its real
   numeric ID as `BREVO_LIST_ID`. Do not reuse gameplay/roster lists or import
   student/faculty-request addresses.
3. Create and activate a Brevo DOI confirmation template. Use Brevo's supported
   DOI confirmation action, not a direct link to our return page. The API docs
   describe the `params.DOIurl` template parameter; verify the template actually
   completes DOI and records membership before redirecting. Include the exact
   opt-in purpose from `/about/subscribe/`, identify the sender, and state that
   ignoring the email leaves the person unconfirmed. Record its real numeric ID
   as `BREVO_DOI_TEMPLATE_ID`.
4. Prepare update campaigns using Brevo's native unsubscribe footer/link. Updates
   must be marketing campaigns to this confirmed list, not transactional blasts
   that bypass marketing suppression. Test unsubscribe on a real delivered
   campaign, not only a template preview. Avoid contact-level open/click tracking;
   the API sends `contactPixelTrackingConsent:false`, but account/template settings
   must also be checked because that option depends on account features.
5. Create the minimum necessary API credential in Brevo. Store it as the Worker
   secret `BREVO_API_KEY` (Cloudflare dashboard, or `wrangler secret put
   BREVO_API_KEY --config wrangler.jsonc`). Never paste it into source, client JS,
   documentation, screenshots, logs, chat or a command argument.
6. Add real `BREVO_LIST_ID` and `BREVO_DOI_TEMPLATE_ID` values to the site's Worker
   vars; IDs are not secrets, but no invented placeholder IDs are committed.
   Preserve all existing classroom secrets and rate bindings. GitHub Pages alone
   cannot run this backend; the official Cloudflare-hosted site is required.
7. Keep `SUBSCRIPTIONS_ENABLED=false` in production while configuring. Use a
   separate restricted staging environment with its own test list/templates and
   explicitly authorized origin (the production allowlist is fixed in the code),
   or schedule a brief owner-supervised activation on the official host. Enable
   only after the checks below pass, and set the same value in managed Wrangler
   configuration so a later deploy does not unintentionally undo it.

No provider action, secret creation, DNS edit, remote deploy, or email was sent by
the implementation task.

## End-to-end acceptance before calling this live

- Enter an owner-controlled test email with the checkbox off: no request/enrollment.
- Submit with opt-in on: provider accepts it; email arrives; membership is absent
  until the real confirmation link is followed. Verify list membership afterward.
- Try a duplicate: no duplicate record or re-enrollment. Use the same generic UI
  response; do not expose membership to visitors.
- Send an authorized test campaign with its native unsubscribe link; follow it,
  verify suppression, and confirm a later campaign excludes that address.
- Re-submit a suppressed email: no automatic unsuppression or update delivery.
- Verify provider outage/bad credentials leave a visible failure, not success.
- Verify rate limiting, mobile form labels, keyboard operation, and errors on the
  actual public origin. Remove the test contacts through the provider's process.
- Record date and outcomes privately without publishing addresses or credentials.

## Retention and removal

Keep confirmed email/preference records only for the update service, until the
person unsubscribes or asks for removal. Honor unsubscribe via the provider; retain
suppression information when needed to prevent inadvertent re-enrollment. Review
unconfirmed contacts monthly and remove pending records older than 30 days where
Brevo retains them. Handle contact removal requests sent to the established
`wjbyrd@troy.edu` address through Brevo's contact deletion tools after verifying
the request. Do not claim deletion also erases delivered messages or third-party
backups. Do not automatically resubscribe suppressed contacts or import old lists.

## Faculty bank fulfillment (separate manual process)

`/how-to/question-banks/` offers the established maintainer email and a client-only
draft helper. It never claims to submit a request; the sender must send the email.
Review institutional affiliation and intended use manually; an institutional
email alone is insufficient. Reuse the existing three pairs of faculty PDF/CSV
exports from the ignored `faculty_exports/` directory after checking their current
validation report. Share via direct email attachments or institution-approved
private access restricted to the verified faculty member. Do not put these files
in Downloads, Games, GitHub Pages, a public repository, or unlisted public URLs.

Do not collect student information or subscribe requesters. Keep request mail
restricted to the maintainer; aim to remove completed correspondence within 90
days. This is an operator action, not an automatic email-system deletion. Copies
in sent mail/backups remain governed by their respective services.

## Official provider references

- https://developers.brevo.com/reference/create-doi-contact
- https://developers.brevo.com/reference/get-contact-info
- https://help.brevo.com/hc/en-us/articles/208771869-Create-a-sign-up-form-in-Brevo
- https://help.brevo.com/hc/en-us/articles/5317448358034-Blocklist-unblock-or-resubscribe-contacts

These document provider behavior; mocked local tests do not prove production
email delivery, confirmation, unsubscribe or domain authentication.
