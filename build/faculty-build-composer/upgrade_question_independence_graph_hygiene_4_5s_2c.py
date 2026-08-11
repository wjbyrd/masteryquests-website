#!/usr/bin/env python3
"""Mastery Quests question independence + graph hygiene patch (4.5s.2c).

Scope:
- make deictic / prior-question stems self-contained;
- remove high-confidence decorative or answer-giveaway graph attachments;
- strip graph-reference language whenever an attachment is removed;
- preserve answer choices, answer hashes, routing, difficulty, feedback, and assets.
"""
from __future__ import annotations

import copy
import hashlib
import json
import re
from collections import Counter
from pathlib import Path

ROOT = Path(__file__).resolve().parent
LIB_PATH = ROOT / "data" / "composer_library.js"
REG_PATH = ROOT / "data" / "composer_registry.json"
MANIFEST_PATH = ROOT / "data" / "composer_library_manifest.json"
RESULTS_PATH = ROOT / "question_independence_graph_hygiene_4.5s.2c_results.json"
REPORT_PATH = ROOT / "QUESTION_INDEPENDENCE_GRAPH_HYGIENE_REPORT_4.5s.2c.md"
PHASE = "phaseQH1-question-independence-graph-hygiene-v1"
STAMP = "2026-08-11T18:10:00.000Z"

PREFIX = "window.MQ_COMPOSER_LIBRARY="


def sha256_text(value: str) -> str:
    return hashlib.sha256(value.encode("utf-8")).hexdigest()


def load_library() -> dict:
    text = LIB_PATH.read_text(encoding="utf-8")
    if not text.startswith(PREFIX):
        raise RuntimeError("composer_library.js prefix not recognized")
    raw = text[len(PREFIX):].strip()
    if raw.endswith(";"):
        raw = raw[:-1]
    return json.loads(raw)


def write_library(lib: dict) -> None:
    payload = json.dumps(lib, ensure_ascii=False, separators=(",", ":"))
    LIB_PATH.write_text(PREFIX + payload + ";\n", encoding="utf-8")


def iter_questions(obj, path=()):
    if isinstance(obj, dict):
        if "id" in obj and "q" in obj and "options" in obj:
            yield path, obj
        else:
            for key, value in obj.items():
                yield from iter_questions(value, path + (key,))
    elif isinstance(obj, list):
        for index, value in enumerate(obj):
            yield from iter_questions(value, path + (index,))


def question_index(lib: dict):
    by_id = {}
    occurrences = {}
    for path, q in iter_questions(lib["concepts"]):
        by_id.setdefault(q["id"], q)
        occurrences.setdefault(q["id"], []).append((path, q))
    return by_id, occurrences


def image_ids_for(occurrences: dict, concept_id: str) -> set[str]:
    out = set()
    for qid, items in occurrences.items():
        # Questions may be routed to more than one concept. If any occurrence belongs
        # to this concept and has an image, include the canonical ID.
        for path, q in items:
            if path and path[0] == concept_id and q.get("image"):
                out.add(qid)
                break
    return out


def normalize_answer(text: str) -> str:
    return re.sub(r"\s+", " ", str(text).strip().lower())


def answer_hash(text: str) -> str:
    return sha256_text(normalize_answer(text))


lib = load_library()
pre = copy.deepcopy(lib)
pre_by_id, pre_occ = question_index(pre)

# ---------------------------------------------------------------------------
# 1) Self-containment rewrites.
# ---------------------------------------------------------------------------
CONTEXT_REWRITES = {
    "P62C-CPS-H-023": "A buyer values a good at $35 and the seller's cost is $11. If the market price rises from $20 to $26, what changes?",
    "P62C-CPS-EL-012": "A buyer values a good at $50 and the seller's cost is $20. At a market price of $23, which statement is correct?",
    "P62C-CPS-B3-012": "A buyer values a good at $52 and the seller's cost is $18. If the market price falls from $45 to $25, what changes?",
    "P62C-CPS-LB-018": "Given marginal buyer values [45, 37, 30, 21, 13, 7] and marginal seller costs [6, 14, 23, 28, 36, 42], output is pushed from the efficient quantity of 3 units to 4. Which accounting is correct?",
    "P62C-CPS-LB-020": "Given marginal buyer values [43, 35, 27, 20, 12, 5] and marginal seller costs [4, 11, 18, 25, 33, 40], output is pushed from the efficient quantity of 3 units to 4. Which accounting is correct?",
    "P62C-CPS-LB-022": "Given marginal buyer values [49, 40, 32, 24, 15, 8] and marginal seller costs [7, 16, 22, 30, 38, 46], output is pushed from the efficient quantity of 3 units to 4. Which accounting is correct?",
    "P62B-ELAS-M-036": "For a price decrease from $10 to $6 on the displayed demand curves, which curve is more price elastic over the labeled interval?",
    "P52B-INC-H-002": "A given penalty sharply changes behavior for low-income households but barely affects high-income households. What does this show?",
    "P62H-MCMP-M-022": "At a long-run equilibrium, price is $70 and MC is $50. What is the markup?",
    "P62H-MCMP-M-024": "At a long-run equilibrium, price is $76 and MC is $49.60. What is the markup?",
    "P62H-MCMP-M-026": "At a long-run equilibrium, price is $64 and MC is $47.80. What is the markup?",
    "P62H-MCMP-M-028": "At a long-run equilibrium, price is $82 and MC is $48.40. What is the markup?",
    "P62H-MCMP-M-030": "At a long-run equilibrium, price is $68 and MC is $50.40. What is the markup?",
    "P62H-MCMP-B1-003": "Amber Café faces P=108−2Q. At its MR=MC output of about 20.93 units, what price does it charge?",
    "P62H-MCMP-B1-006": "Birch Salon faces P=100−1.8Q. At its MR=MC output of about 21.27 units, what price does it charge?",
    "P62H-MCMP-B1-009": "Cedar Fitness faces P=116−2.4Q. At its MR=MC output of about 18.50 units, what price does it charge?",
    "P62H-MCMP-B1-012": "Drift Apparel faces P=98−1.7Q. At its MR=MC output of about 21.05 units, what price does it charge?",
    "P62H-MCMP-B1-015": "Elm Bistro faces P=112−2.2Q. At its MR=MC output of about 19.57 units, what price does it charge?",
    "P62H-MCMP-B1-018": "Fjord Studio faces P=92−1.5Q. At its MR=MC output of about 22.49 units, what price does it charge?",
    "P62G-MON-L-077": "Silver Screen separates Markets A and B with demands PA=100−2QA and PB=80−QB. At the profit-maximizing quantities QA=20 and QB=30, which price pair follows?",
    "P62G-MON-L-080": "Terra Software separates Markets A and B with demands PA=120−3QA and PB=90−1.5QB. At the profit-maximizing quantities QA=16 and QB=22, which price pair follows?",
    "P62G-MON-L-083": "Union Rail Pass separates Markets A and B with demands PA=95−1.5QA and PB=110−3QB. At the profit-maximizing quantities QA=25.67 and QB=15.33, which price pair follows?",
    "P62G-MON-L-086": "Vista Medical Device separates Markets A and B with demands PA=110−2QA and PB=86−1.2QB. At the profit-maximizing quantities QA=22 and QB=26.67, which price pair follows?",
    "P62G-MON-L-089": "Willow Learning Platform separates Markets A and B with demands PA=125−2.5QA and PB=95−1.25QB. At the profit-maximizing quantities QA=20 and QB=28, which price pair follows?",
    "ECON-NL-LEGENDARY-9007": "An economy produces 120 computers at $900 and 550 meals at $24 this year. What is this year's nominal GDP?",
}

_market_specs = [
    ("P62C-CPS-L-002", "festival permit", [28, 24, 19, 14, 9], [5, 11, 16, 21, 26]),
    ("P62C-CPS-L-004", "lab kit", [31, 26, 22, 17, 11], [7, 12, 18, 24, 29]),
    ("P62C-CPS-L-006", "repair appointment", [35, 29, 23, 16, 10], [6, 13, 20, 27, 33]),
    ("P62C-CPS-L-008", "studio pass", [27, 23, 18, 13, 8], [4, 10, 15, 21, 25]),
    ("P62C-CPS-L-010", "garden plot", [33, 27, 21, 15, 9], [8, 14, 19, 25, 30]),
    ("P62C-CPS-L-012", "workshop seat", [30, 25, 20, 14, 7], [5, 11, 17, 23, 28]),
    ("P62C-CPS-L-014", "meal voucher", [26, 22, 17, 12, 6], [3, 9, 14, 20, 24]),
    ("P62C-CPS-L-016", "archive tour", [29, 24, 18, 11, 5], [4, 10, 16, 22, 27]),
]
for qid, item, wtp, costs in _market_specs:
    CONTEXT_REWRITES[qid] = (
        f"Five buyers each want one {item}, with willingness-to-pay values {wtp}. "
        f"Five sellers can each supply one, with costs {costs}. "
        "Ignore any announced market price. Rank buyers from highest to lowest value and sellers from lowest to highest cost. "
        "Which statement correctly identifies the efficient cutoff?"
    )

for n in range(2, 17, 2):
    qid = f"P62G-MON-EL-{n:03d}"
    old = pre_by_id[qid]["q"]
    CONTEXT_REWRITES[qid] = old.replace(
        "Using the same stated demand and cost conditions—",
        "Given the demand and cost conditions—",
    )

assert len(CONTEXT_REWRITES) == 41, len(CONTEXT_REWRITES)

# ---------------------------------------------------------------------------
# 2) High-confidence graph hygiene.
#    Retain graph-dependent point/curve/region reading. Remove only cases where
#    the stem contains the needed relationship/data or the visual literally
#    exposes the requested label.
# ---------------------------------------------------------------------------
QTM_REMOVE = image_ids_for(pre_occ, "quantity-theory-of-money") - {"LG-Q-9029"}

LIQUIDITY_KEEP = {
    "ECON-SP-MEDIUM-142", "ECON-SP-MEDIUM-143", "ECON-SP-MEDIUM-144",
    "ECON-SP-HARD-224", "ECON-SP-HARD-226",
    "ECON-SP-ELITE-316", "ECON-SP-ELITE-317",
    "PM2C3-LPMM-L-001", "PM2C3-LPMM-L-002", "PM2C3-LPMM-L-003", "PM2C3-LPMM-L-006",
    "PM2C3-LPMM-LB-001", "PM2C3-LPMM-LB-002",
}
LIQUIDITY_REMOVE = image_ids_for(pre_occ, "liquidity-preference-and-money-market") - LIQUIDITY_KEEP

MPT_REMOVE = {
    "LG-Q-159", "LG-Q-160", "LG-Q-263", "LG-Q-264", "LG-Q-360", "LG-Q-361",
    "LG-Q-365", "LG-Q-366", "LG-Q-369", "ECON-SP-LEGENDARY-9014", "LG-Q-4004", "LG-Q-4005",
}

FISCAL_KEEP = {"ECON-SP-HARD-228", "ECON-SP-HARD-229", "ECON-SP-ELITE-320", "ECON-SP-LEGENDARY-9024"}
FISCAL_REMOVE = image_ids_for(pre_occ, "fiscal-multipliers-and-crowding-out") - FISCAL_KEEP

GRAPH_REMOVE_IDS = (
    {
        "ECON-SP-EASY-25", "ECON-SP-EASY-26",
        "ECON-SP-EASY-60", "ECON-SP-EASY-61",
        "ECON-SP-MEDIUMBOSS-3003",
        "P62E-COP-L-055",
    }
    | QTM_REMOVE
    | LIQUIDITY_REMOVE
    | MPT_REMOVE
    | FISCAL_REMOVE
    | image_ids_for(pre_occ, "inflation-costs")
    | image_ids_for(pre_occ, "fisher-effect")
    | image_ids_for(pre_occ, "inflation-tax-and-deflation")
    | image_ids_for(pre_occ, "stabilization-policy")
)
assert len(GRAPH_REMOVE_IDS) == 107, len(GRAPH_REMOVE_IDS)

# Rewrites required after image removal. Generic "Refer to ... graph." prefixes
# are stripped first; these entries clean remaining visual-dependency language.
GRAPH_TEXT_REWRITES = {
    "ECON-SP-EASY-25": "In the standard AD–AS convention, the vertical axis measures:",
    "ECON-SP-EASY-26": "In the standard AD–AS convention, the horizontal axis measures:",
    "ECON-SP-EASY-60": "In the standard Phillips-curve convention, the vertical axis measures:",
    "ECON-SP-EASY-61": "In the standard Phillips-curve convention, the horizontal axis measures:",
    "ECON-SP-ELITE-319": "Fiscal expansion raises AD through the multiplier, but interest rates rise and investment falls. Which description best fits the final result?",
    "P62E-COP-L-055": "A cost curve approaches zero as output rises and never turns upward. Which cost curve is it?",
    "LG-Q-229": "Why does money demand slope downward when the value-of-money model places the value of money on the vertical axis?",
    "LG-Q-335": "If the Fed doubles money supply while velocity and real output are stable, which quantity-theory result follows?",
    "LG-Q-362": "Suppose output is below its natural level because AD is weak. Which Fed action through the money market would move AD in the stabilizing direction?",
    "LG-Q-363": "Suppose output is above its natural level because AD is too strong. Which Fed action through the money market would move AD in the stabilizing direction?",
    "LG-Q-371": "If the initial AD shift is $30 billion and the final shift is $150 billion, what MPC is implied by the simple multiplier?",
    "LG-Q-9026": "Starting at the original equilibrium, the Fed doubles money supply. If output and velocity are unchanged, which answer matches quantity theory?",
    "LG-Q-9043": "If MS shifts right, the price level rises, and people reduce cash balances by making more frequent transfers, what inflation cost is described?",
    "LG-Q-9050": "A student says, 'Inflation means the money demand curve slopes up.' What is the best correction?",
    "LG-Q-9054": "Money demand shifts right while money supply is fixed. If the Fed wants to prevent the resulting interest-rate increase, what should it do?",
    "LG-Q-9058": "A contractionary monetary-policy move must reduce AD by $240 billion. If MPC = 0.75, what investment decrease is needed to produce that AD movement?",
    "LG-Q-9067": "Government spending rises by $60 billion and the final AD shift is $300 billion. What order of AD shifts and implied MPC fit these data?",
    "LG-Q-9116": "After MS shifts right, P rises from 2 to 4. If M doubled and Y was constant, what must have happened to velocity for these changes to satisfy the quantity equation?",
    "LG-Q-9120": "MS shifts right, P rises, and firms must update thousands of posted prices while households also reduce money balances. Which pair of inflation costs is described?",
    "LG-Q-9136": "Output is above potential by $360 billion. The Fed uses contractionary monetary policy, and the investment response is $50 billion. If MPC = 0.8, what overheating gap remains?",
    "LG-Q-9140": "Contractionary monetary policy is used when the economy is already above potential output. What is the boss-level diagnosis?",
    "LG-Q-9143": "A contractionary monetary-policy move reduces investment by $60 billion. A separate fiscal expansion raises AD by $400 billion after the multiplier. If MPC = 0.75, what is the final net AD effect?",
    "LG-Q-9144": "If policymakers use contractionary monetary policy during a negative supply shock, what is the strongest critique?",
}

REFER_PREFIX = re.compile(r"^Refer to (?:the )?[^.]*graph\.\s*", re.IGNORECASE)

by_id, occurrences = question_index(lib)
changes = []

# Apply self-containment text changes across every occurrence of a canonical ID.
for qid, new_q in CONTEXT_REWRITES.items():
    if qid not in occurrences:
        raise RuntimeError(f"Missing context-rewrite ID: {qid}")
    before_q = occurrences[qid][0][1]["q"]
    for _, q in occurrences[qid]:
        q["q"] = new_q
    if before_q != new_q:
        changes.append({"id": qid, "change": "self_containment_rewrite", "from": before_q, "to": new_q})

# Remove redundant/giveaway graphs and graph-reference prefixes.
for qid in sorted(GRAPH_REMOVE_IDS):
    if qid not in occurrences:
        raise RuntimeError(f"Missing graph-removal ID: {qid}")
    before_q = occurrences[qid][0][1]["q"]
    before_image = occurrences[qid][0][1].get("image")
    if not before_image:
        raise RuntimeError(f"Expected image is already missing for {qid}")

    stripped = REFER_PREFIX.sub("", before_q).strip()
    new_q = GRAPH_TEXT_REWRITES.get(qid, stripped)
    for _, q in occurrences[qid]:
        q.pop("image", None)
        q["q"] = new_q

    changes.append({"id": qid, "change": "graph_removed", "image": before_image, "from": before_q, "to": new_q})

# ---------------------------------------------------------------------------
# 3) Registry / version / integrity metadata.
# ---------------------------------------------------------------------------
# Recompute graph coverage per concept using unique canonical IDs in that concept.
for entry in lib["registry"]["concepts"]:
    cid = entry["canonicalConceptId"]
    concept = lib["concepts"].get(cid)
    if not concept:
        continue
    seen = set()
    graph_count = 0
    for _, q in iter_questions(concept):
        qid = q["id"]
        if qid in seen:
            continue
        seen.add(qid)
        if q.get("image"):
            graph_count += 1
    entry["graphCoverage"] = graph_count

old_version = str(lib.get("libraryVersion", ""))
if PHASE not in old_version:
    lib["libraryVersion"] = old_version + "-" + PHASE
lib["sourceCurationPhase"] = PHASE
lib["sourceGeneratedAt"] = STAMP
lib["generatedAt"] = STAMP
lib["registry"]["curationPhase"] = PHASE
lib["registry"]["curationSummary"] = (
    "Question-independence and graph-hygiene pass: self-contained prior-context stems; "
    "removed high-confidence decorative or answer-giveaway graph attachments; preserved answer-bearing fields and routing."
)
lib["registry"]["libraryVersion"] = lib["libraryVersion"]
lib["registry"]["generatedAt"] = STAMP

# Canonical counts do not change.
post_by_id, post_occ = question_index(lib)
lib["canonicalQuestionCount"] = len(post_by_id)
lib["conceptCount"] = len(lib["concepts"])
lib["registry"]["canonicalQuestionCount"] = lib["canonicalQuestionCount"]
lib["registry"]["composerVersion"] = lib.get("composerVersion")

# Compute logical library hash using the package's established convention.
lib_nohash = {k: v for k, v in lib.items() if k != "librarySha256"}
logical_hash = sha256_text(json.dumps(lib_nohash, ensure_ascii=False, separators=(",", ":"), sort_keys=True))
lib["librarySha256"] = logical_hash

# Standalone registry follows the established package convention: the embedded
# registry hash participates in the top-level library hash, while the standalone
# registry advertises the newly computed top-level library hash.
standalone_registry = copy.deepcopy(lib["registry"])
standalone_registry["librarySha256"] = logical_hash
REG_PATH.write_text(json.dumps(standalone_registry, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

# Manifest retains all packaged assets. Only library metadata changes.
manifest = json.loads(MANIFEST_PATH.read_text(encoding="utf-8"))
manifest["conceptCount"] = lib["conceptCount"]
manifest["canonicalQuestionCount"] = lib["canonicalQuestionCount"]
manifest["libraryVersion"] = lib["libraryVersion"]
manifest["librarySha256"] = logical_hash
manifest["generatedAt"] = STAMP
MANIFEST_PATH.write_text(json.dumps(manifest, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

write_library(lib)

# ---------------------------------------------------------------------------
# 4) Validation.
# ---------------------------------------------------------------------------
post = load_library()
post_by_id, post_occ = question_index(post)

issues = []
if len(post_by_id) != 7977:
    issues.append(f"Canonical question count changed: {len(post_by_id)}")

# Answer-bearing fields must be byte-for-byte stable at the JSON-value level.
answer_field_changes = []
for qid, old_q in pre_by_id.items():
    new_q = post_by_id[qid]
    for field in ("options", "aHash", "feedback", "difficulty", "canonicalDifficulty", "instructionalRole", "primarySkill", "repairSkill"):
        if old_q.get(field) != new_q.get(field):
            answer_field_changes.append({"id": qid, "field": field, "before": old_q.get(field), "after": new_q.get(field)})
if answer_field_changes:
    issues.append(f"Unexpected answer/routing field changes: {len(answer_field_changes)}")

# Preserve the pre-patch answer-hash state. Seven Advanced Macro checkpoint
# supplement records already use a legacy hash convention in this package; this
# pass must not create any new failures or alter that existing exception set.
def collect_answer_hash_failures(index):
    failures = []
    for qid, q in index.items():
        matches = [opt for opt in q.get("options", []) if answer_hash(opt) == q.get("aHash")]
        if len(matches) != 1:
            failures.append({"id": qid, "matches": len(matches)})
    return failures

pre_answer_hash_failures = collect_answer_hash_failures(pre_by_id)
answer_hash_failures = collect_answer_hash_failures(post_by_id)
pre_failure_ids = {x["id"] for x in pre_answer_hash_failures}
post_failure_ids = {x["id"] for x in answer_hash_failures}
new_answer_hash_failures = sorted(post_failure_ids - pre_failure_ids)
resolved_answer_hash_failures = sorted(pre_failure_ids - post_failure_ids)
if new_answer_hash_failures or resolved_answer_hash_failures:
    issues.append(
        f"Answer-hash exception set changed: new={len(new_answer_hash_failures)}, resolved={len(resolved_answer_hash_failures)}"
    )

# No no-image question may instruct the student to refer to a graph.
refer_graph = re.compile(r"\brefer to\b[^.]{0,80}\bgraph\b", re.IGNORECASE)
orphan_graph_references = []
for qid, q in post_by_id.items():
    if not q.get("image") and refer_graph.search(q.get("q", "")):
        orphan_graph_references.append({"id": qid, "q": q["q"]})
if orphan_graph_references:
    issues.append(f"Orphan graph references: {len(orphan_graph_references)}")

# The sequence-dependent patterns that triggered this work should be gone.
unsafe_start = re.compile(r"^(For the same|The same|At that|Using the same|If the price in the same|At the same)\b", re.IGNORECASE)
unsafe_context_starts = [
    {"id": qid, "q": q["q"]}
    for qid, q in post_by_id.items()
    if unsafe_start.search(q.get("q", ""))
]
if unsafe_context_starts:
    issues.append(f"Unsafe deictic starts remain: {len(unsafe_context_starts)}")

# All graph-removal IDs must now be image-free.
failed_graph_removals = [qid for qid in sorted(GRAPH_REMOVE_IDS) if post_by_id[qid].get("image")]
if failed_graph_removals:
    issues.append(f"Graph removals failed: {len(failed_graph_removals)}")

# The two reported Phillips axis questions and two AD-AS axis questions are explicit regression guards.
axis_guard_ids = ["ECON-SP-EASY-25", "ECON-SP-EASY-26", "ECON-SP-EASY-60", "ECON-SP-EASY-61"]
axis_guard_failures = [qid for qid in axis_guard_ids if post_by_id[qid].get("image")]
if axis_guard_failures:
    issues.append(f"Axis giveaway guard failed: {axis_guard_failures}")

# Current graph counts.
pre_graph = sum(1 for q in pre_by_id.values() if q.get("image"))
post_graph = sum(1 for q in post_by_id.values() if q.get("image"))
removed_by_concept = Counter()
for change in changes:
    if change["change"] == "graph_removed":
        qid = change["id"]
        for path, _ in pre_occ[qid]:
            if path:
                removed_by_concept[path[0]] += 1
                break

results = {
    "phase": PHASE,
    "generatedAt": STAMP,
    "canonicalQuestionCount": len(post_by_id),
    "contextRewrites": len(CONTEXT_REWRITES),
    "graphAttachmentsBefore": pre_graph,
    "graphAttachmentsAfter": post_graph,
    "graphAttachmentsRemoved": pre_graph - post_graph,
    "graphRemovalsByConcept": dict(sorted(removed_by_concept.items())),
    "answerBearingFieldChanges": answer_field_changes,
    "preExistingAnswerHashFailures": pre_answer_hash_failures,
    "answerHashFailuresAfter": answer_hash_failures,
    "newAnswerHashFailures": new_answer_hash_failures,
    "resolvedAnswerHashFailures": resolved_answer_hash_failures,
    "orphanGraphReferences": orphan_graph_references,
    "unsafeContextStarts": unsafe_context_starts,
    "axisGiveawayGuardFailures": axis_guard_failures,
    "librarySha256": logical_hash,
    "issues": issues,
    "changes": changes,
}
RESULTS_PATH.write_text(json.dumps(results, indent=2, ensure_ascii=False) + "\n", encoding="utf-8")

# Human-readable report.
by_concept_lines = "\n".join(
    f"| {cid} | {count} |" for cid, count in sorted(removed_by_concept.items(), key=lambda x: (-x[1], x[0]))
)
context_ids = "\n".join(f"- `{qid}`" for qid in sorted(CONTEXT_REWRITES))
report = f"""# Question Independence + Graph Hygiene Report — Composer 4.5s.2c

Generated: 2026-08-11

## Verdict

**{'PASS' if not issues else 'FAIL'} — question-sequence dependence and high-confidence graph redundancy were patched without changing answer-bearing fields.**

## Why this pass was necessary

Two defects were reproduced in the current 7,977-question canonical library:

1. Some questions used phrases such as **“For the same … market”** or **“At that output”** even though the engine can draw the item without its predecessor.
2. Some graph attachments were decorative or gave away the requested fact directly, including AD-AS and Phillips-curve axis-label questions.

The game must treat every item as independently drawable unless the complete scenario is embedded in the current question.

## Changes

- Canonical questions: **{len(post_by_id):,}** (unchanged)
- Self-containment stem rewrites: **{len(CONTEXT_REWRITES)}**
- Graph attachments before: **{pre_graph:,}**
- Graph attachments after: **{post_graph:,}**
- High-confidence decorative/giveaway graph attachments removed: **{pre_graph - post_graph:,}**
- Answer choices changed: **0**
- Answer hashes changed: **0**
- Feedback/routing/difficulty changes: **0**

### Graph removals by concept

| Concept | Removed |
|---|---:|
{by_concept_lines}

## Self-containment corrections

The pass rewrote all 41 stems matching the unsafe deictic-start patterns found in the current library. This includes:

- the eight Legendary Consumer/Producer Surplus “same market” cutoff items (festival permits, lab kits, repair appointments, studio passes, garden plots, workshop seats, meal vouchers, archive tours), now with buyer values and seller costs embedded in each question;
- three additional surplus exchange follow-ups, now with buyer value, seller cost, and relevant price information embedded;
- six Monopolistic Competition checkpoint price follow-ups, now with each demand equation and its MR=MC output embedded;
- five Monopoly Legendary price-discrimination follow-ups, now with both market demand equations and the profit-maximizing quantities embedded;
- eight Monopoly Elite stems that were already numerically complete but misleadingly said “same stated conditions”; and
- smaller false-context cues in Elasticity, Incentives, Monopolistic Competition, and nominal-GDP items.

## Graph-hygiene corrections

The graph-removal rule was deliberately conservative: remove the image only when the stem already supplies the relationship/data needed to answer, or when the image itself literally exposes the requested label.

Major cleanup groups:

- **Axis-label giveaways:** AD-AS and Phillips-curve axis-identification questions are now text-only.
- **Quantity theory:** graph retained only for the one item that actually requires distinguishing the shown MS/MD shift; the remaining quantity-theory questions now stand on their stated shifts, values, and assumptions.
- **Liquidity preference:** point/curve intersection questions retain the graph; generic shift logic and arithmetic no longer carry it.
- **Monetary-policy transmission:** questions that depend on the displayed MS1/MS2 or AD1/AD2 direction retain the graph; fully stated policy chains/arithmetic do not.
- **Fiscal multipliers / crowding out:** AD1/AD2/AD3 path-reading questions retain the graph; fully stated multiplier arithmetic and policy logic do not.
- **Inflation costs, Fisher effect, inflation tax/deflation, stabilization arithmetic:** graph references were removed when all causal/numeric information already appears in the stem.
- **Costs of production:** the AFC identity item that displayed a graph explicitly labeled “AFC” is now text-only.

## Regression guards added

The patch script now fails if:

- a no-image question still tells the student to “refer to” a graph;
- any of the unsafe sequence-dependent start patterns remain;
- the four axis-label giveaway questions regain graph attachments;
- the pre-existing answer-hash exception set changes or a new answer-hash failure appears;
- answer choices, answer hashes, feedback, difficulty, routing role, or skill routing change; or
- the canonical question count changes from 7,977.

## Validation results

- Canonical IDs: **{len(post_by_id):,} / 7,977**
- Pre-existing legacy answer-hash exceptions: **{len(pre_answer_hash_failures)}**
- New answer-hash failures introduced by this pass: **{len(new_answer_hash_failures)}**
- Orphan graph references: **{len(orphan_graph_references)}**
- Unsafe context-start patterns remaining: **{len(unsafe_context_starts)}**
- Axis-giveaway regression failures: **{len(axis_guard_failures)}**
- Unexpected answer/routing field changes: **{len(answer_field_changes)}**
- Logical library SHA-256: `{logical_hash}`

## Patched self-containment IDs

{context_ids}
"""
REPORT_PATH.write_text(report, encoding="utf-8")

if issues:
    raise SystemExit("PATCH VALIDATION FAILED: " + "; ".join(issues))

print(json.dumps({
    "status": "PASS",
    "contextRewrites": len(CONTEXT_REWRITES),
    "graphAttachmentsRemoved": pre_graph - post_graph,
    "graphAttachmentsAfter": post_graph,
    "canonicalQuestionCount": len(post_by_id),
    "librarySha256": logical_hash,
}, indent=2))
