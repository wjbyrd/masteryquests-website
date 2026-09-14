# Manual provider gate ready

Open https://stage3.masteryquests.org/ in an ordinary desktop browser. Choose the content needed for a valid build, enable anonymous gameplay collection, click Generate, and manually complete Turnstile. In Developer Tools > Network, confirm POST https://stage3.masteryquests.org/v1/build-capabilities returns HTTP 201. Report the status and approximate time only; preserve the generated download privately for the next proof step. Do not share response bodies, request headers, HAR exports, Turnstile responses, capabilities, or secrets.

If unsuccessful, report the visible message, numeric provider code, whether the POST appeared, HTTP status if present, time and browser/version. Stop on provider rejection; do not weaken validation.

The surface uses the existing staging Worker/D1 and owner-installed secret. It is excluded from production navigation, sitemap and dist, with noindex headers and robots exclusion. Canonical source and production deployments are unchanged. Isolated copies pin the approved staging hostname and endpoint while retaining real provider validation, action/context, timestamp, tuple and policy checks. The transport adapter was regenerated from copied canonical sources with the staging endpoint.

12 HTTP delivery/preflight checks passed without invoking Turnstile or issuing a capability. Stage 4 remains blocked pending manual HTTP 201 and completion of the existing end-to-end proof. Do not delete staging yet.
