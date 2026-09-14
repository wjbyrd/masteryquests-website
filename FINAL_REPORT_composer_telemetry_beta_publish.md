# Composer telemetry beta publication

Deployment status: **DEPLOYED AND SMOKE-CHECKED** on 14 September 2026.

Public beta URL: https://masteryquests.org/beta-testing/composer-telemetry-live-test/

## Repository and baseline

- Repository: `C:\Users\Jennings\Documents\GitHub\masteryquests-website`
- Branch: `main`
- Starting HEAD: `18cbb943f79c28a3ea6b0530ed35d1eb8d4da826`
- Initial working-tree status: `?? beta-testing/`; no tracked modifications.
- Publication commit: `d933208e92203775177e84ad8f55b2d755f6fbb8`
- Commit message: `Publish Composer telemetry beta test`

## Generated artifact verification

There was exactly one HTML file in the original beta folder:
`beta-testing/my-faculty-mastery-quest-telemetry-test.html`.

- Original size: **5,174,781 bytes**.
- Build title: **My Faculty Mastery Quest Telemetry Test**.
- Composer version: `4.5s.3k`; configuration schema: `1.6.0`.
- Composition fingerprint: `ede71cd5d8134f4b3997592ae992e19f5014d27d17d6c5a626232fc5ef9c4a8a`.
- The generated `FACULTY_COMPOSITION_CONFIG` explicitly contained `allowAnonymousDataCollection: true` **before publication**. This setting was not changed.
- The generated configuration includes 11 selected economics concepts, populated question content and 10 supported practice modes. It is a configured Composer output, not an empty manual template.
- The embedded anonymous telemetry adapter matches the maintained `build/faculty-build-composer/anonymous-telemetry-source.js` payload exactly, excluding the surrounding script whitespace added by the Composer.
- Both embedded JavaScript blocks passed syntax parsing.
- Inspection found no populated learner-identifying fields, embedded email addresses, credentials, private keys, bearer tokens, secret assignments or private telemetry exports. The player-name input has no prefilled value, and the configuration has no custom guide identity or custom artwork overrides.

## Exact changes and artifact preservation

Only two files were committed for publication:

1. `beta-testing/composer-telemetry-live-test/index.html`: exact copy of the original generated HTML.
2. `audit_tools/public_site_publication/build-dist.mjs`: five added lines. An explicit single-file copy publishes that HTML. An additional forbidden-file condition rejects every other `beta-testing/` path. All existing publication guards remain intact.

The original generated file remains untouched and untracked in its original location. This final report was created separately and was not included in the publication commit or dist.

No game behavior, telemetry configuration, engine code, Worker source, D1, CORS, secrets, governance contracts, Cloudflare configuration or normal navigation was changed. Git staging preserved the generated HTML bytes without line-ending conversion. Existing whitespace in the generated file was intentionally preserved.

The original file, repository publication copy, committed Git blob, controlled dist copy and live HTTP response are byte-identical. SHA-256:

```text
6931b46906b8f1a047a0bc0890f70422702269ec4adb514c36f107a1fc7f0bb5
```

## Controlled dist validation

Command: `node audit_tools/public_site_publication/build-dist.mjs .`

| Check | Baseline | Final committed-state build |
| --- | ---: | ---: |
| ok | true | true |
| fileCount | 1789 | 1790 |
| composerConceptReviewPdfCount | 151 | 151 |
| forbiddenFileCount | 0 | 0 |
| incomingQuestionAssetCount | 0 | 0 |

The builder was rerun after the publication commit. The tracked working tree matched the commit, and the resulting game matched the committed blob exactly.

The only file under `dist/beta-testing/` is:
`dist/beta-testing/composer-telemetry-live-test/index.html`.

No original loose beta HTML, other beta files, reports, telemetry exports, audit evidence or test scripts entered dist. Wrangler's “Read 1926 files” log counts 1,790 files plus 136 directories; the independently enumerated publication file count is 1,790.

## Local browser check

The controlled dist was served by a temporary loopback HTTP server and opened in an isolated headless Microsoft Edge context.

- HTTP 200; the expected title and telemetry-ON build configuration loaded.
- The maintained adapter reported remote collection enabled.
- Normal Start Game, Standard Campaign and Proceed controls reached the first question with four answer buttons and a rendered graph.
- No JavaScript exceptions or unrelated failed asset requests occurred.
- No answers were submitted, no run was played through, and no telemetry API was manually invoked.
- The test harness blocked telemetry requests without changing the generated file or its build configuration. One normal launch POST was blocked, producing an expected network console message. No validation telemetry was transmitted.
- Local launch was not treated as proof of production telemetry transport.

## Wrangler dry run and deployment

Wrangler version: `4.131.0`.

Commands used the installed Wrangler CLI:

```text
wrangler deploy --dry-run --config wrangler.jsonc
wrangler deploy --config wrangler.jsonc
```

The unchanged `wrangler.jsonc` points its assets directory to `./dist`. `--assets .` was not used.

Dry run: **passed**, exit code 0. Expected bindings remained:

- `CLASSROOM_LOGIN_LIMIT`: rate limit, 120 requests per 60 seconds.
- `ASSETS`: controlled static assets.

Deployment: **passed**, exit code 0. Wrangler reported exactly one new or modified asset and uploaded only:
`/beta-testing/composer-telemetry-live-test/index.html`.
The other 1,789 assets were already uploaded.

Deployment version ID: `7cfc307c-aa6a-492f-a984-86e6f41b5d9d`.

## Production smoke check and navigation

The requested `masteryquests.org` URL returned **HTTP 200** with 5,174,781 bytes, matching the original HTML hash exactly.

An isolated production browser context confirmed:

- Expected generated title visible.
- Start Game button visible.
- Matching composition fingerprint.
- Build-level anonymous collection `true` and adapter `remoteEnabled()` returning `true`.
- No JavaScript exceptions, console errors or failed requests.
- No gameplay launch, answer submission or telemetry request during the production smoke check.

All controlled public HTML, JavaScript, JSON, XML and text files outside the beta subtree were scanned for references to the route or beta navigation links. **No matches** were found. Home, About, Resources, Build, Games, faculty documentation and normal public navigation remain unchanged. The route is intentionally unlinked.

## Final acceptance

The correct telemetry-ON Composer artifact is publicly accessible at the requested origin, only that beta file was published, the HTML remains unchanged, all controlled publication checks pass and the route is unlinked from normal navigation.

The real end-to-end gameplay and anonymous telemetry transport test remains for the human tester. Publication and title-screen validation do not establish event ingestion success.

Local validation screenshots and JSON results are stored outside the repository in `C:\Users\Jennings\Documents\Mastery Quests Website\beta-publish-support` and were not published.
