# Necessity, granularity and privacy of contract-1 additions

All twelve fields appear in current Managerial local (public/private), Composer local and private admin exports. Private ingestion stores them as typed extras_json and flattens them on export. Applicability is event-specific; fields are blank/null on legacy or inapplicable rows. Blank is never a manufactured measured zero. Schema details are in schema.json and the stricter private validators in server/anonymous-telemetry-poc/measurement-contract.mjs.

| Field | Purpose and why existing evidence was insufficient | Granularity/type/unit | Null/zero rule and privacy boundary |
|---|---|---|---|
| contractID | Select the semantics; old label conflated 57/75 schemas | Record; controlled version string | Legacy blank; no identity/content |
| manifestID | Resolve immutable configuration/build; latest file or gameVersion insufficient | Segment reference; SHA-256 | Missing reference is reported; artifact digest, not device fingerprint |
| provenanceStatus | Distinguish current observation/resume/unresolved saved content | Record; measured-segment/resume-segment/unresolved | Legacy blank; not a performance measure |
| presentationID | Distinguish repeated views of the same question | View; random ID | Unknown saved view blank; run-local linkage, no new person ID |
| attemptID | Join local/private events and exam drafts/commit without counting transport twice | Attempt; random ID | Historical missing linkage blank; no lifetime learner identity |
| canonicalSelectedIndex | Recover selection despite random display order | Submission; zero-based integer | Zero is first authored option; unknown saved mapping blank; no answer text/key |
| localSequence | Detect duplicate/missing local records; timestamp/UUID alone cannot order gaps | Local run; integer count assigned before save | Starts at 1; legacy blank; independent of existing remote sequence |
| manifestJSON | Recover sanitized analytical configuration in one offline download | One metadata row per referenced segment; bounded JSON | Blank on ordinary rows; no raw config/text/URLs, no extra network lookup |
| deliveryQuality | Expose observed storage/queue loss without inferring intent | Local export and private browser queue; JSON nonnegative counts | Zero means no observed failure, not proof of total completeness |
| supportJSON | Freeze actual relevant assistance before an answer | Submission/draft snapshot; JSON booleans, index arrays, count | Inapplicable/legacy blank; unknown canonical entries null; no help text |
| originAttemptID | Connect remediation to an observed miss despite repeated question IDs | Response/remediation chain; random attempt ID | Unobserved historical origin blank; no fabricated join |
| resourceID | Distinguish existing recommendation offers/activations | Resource action; controlled authored ID | Inapplicable blank; omit URL, query, PDF content, reading claims |

New event destinations: local question_presented marks a view and maps to the private stream's existing question_shown; local/private resource_offered and resource_activated observe existing report actions. Private run_manifest is transmitted metadata, emitted once per referenced segment while enabled. Local export_manifest exists only in the CSV and is not a gameplay response. These avoid new raw browser-event streams, duplicate feedback records and repeated large per-event configuration.

Manifest components are allowlisted before hashing:

| Component | Meaning, type/unit and necessity | Absence/privacy |
|---|---|---|
| manifestSchema, contractID, measurementRevision | Controlled strings selecting manifest and measurement rules | Required; independent of recipe/envelope |
| engineRevision | SHA-256 of actual engine/rule source; initial educational-model baseline | Required; source archive needed for interpretation; no invented historical model number |
| trackerSourceRevision | SHA-256 of maintained tracker/integration source | Required; distinct from measurement semantic label |
| contentRevision | SHA-256 of available bank/repair/bridge pools, computed once | Required; contains no bank text; saved unversioned questions may remain unresolved |
| assetRevision | SHA-256 inventory of graph/image/audio bytes | Required; no custom URL or local path exported |
| configurationRevision, buildRevision | SHA-256 analytical config / complete build descriptor | Required; not browser fingerprints or Git-only claims |
| configuration.recipeSchema | Actual recipe schema string | Null for hand-authored games; no false Composer provenance |
| selectedConceptIds, contentScopes, checkpoints | Controlled concept/outcome ID lists and scope preset | Empty/null when unavailable; no faculty free text |
| policyFingerprint | Existing faculty outcome policy SHA-256 | Null if absent; no new policy model |
| supportedModes, samplingStrategies | Controlled mode IDs and balanced/adaptive settings | Null strategy if absent; availability does not imply mode was played |
| dailyChallengesEnabled | Boolean effective daily feature setting | Null when source does not supply it |
| fadingIntervals | Per-difficulty configured interval numbers, milliseconds | Null for missing/inapplicable intervals |
| startingBankroll, wagerRatios | Gameplay points and fractional wager ratios | Null/empty when absent; no financial/personal data |
| mode, modeParameters | Mode ID, target question counts and timedLimitMs milliseconds frozen for segment | Null when unavailable; preserve existing mode eligibility |

supportJSON contains hintDisplayed and artifactApplied booleans, artifactRemovedCanonical and modeRemovedCanonical arrays, and remainingOptionCount. Empty arrays mean no recorded removal; null entries mean unknown mapping. Mode removal is distinct from requested artifact support. It records what the runtime displays/applies, not whether the learner read or benefited from it. Exam commit uses the saved draft support snapshot.

deliveryQuality contains allowlisted integer counters: storageFailures, localLastSequence, localRetainedRows and knownMissingPrefix locally; overflow, permanentlyRejected and cancelled for the private queue; private local exports add remoteOverflow, remoteCancelled, remotePermanentlyRejected, remoteStorageFailures and remotePending. Private queue counters span that browser queue across runs. They do not count a student's behavior or server-side accepted/deleted data.
