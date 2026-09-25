#!/usr/bin/env python3
"""Export ONLY the canonical Composer library, without mutating source content.

Requirements: Python 3.10+, reportlab, Pillow, Node.js, and pypdfium2 or pypdf.
Run from any directory: python tools/export_faculty_question_bank.py
See tools/export_faculty_question_bank.md for scope and validation details.
"""
from __future__ import annotations

import argparse
import collections
import csv
import hashlib
import html
from html.parser import HTMLParser
import json
import os
from pathlib import Path
import re
import shutil
import subprocess
import sys
import tempfile
from datetime import datetime

ROOT = Path(__file__).resolve().parents[1]
SOURCE = Path("build/faculty-build-composer/data/composer_library.js")
CORE = Path("build/faculty-build-composer/composer-core.js")
TITLE = "Mastery Quests Composer"
STEM = "mastery_quests_composer_question_bank"
ROUTES = ("directSkillRepairRoutes", "microSkillRepairPools", "skillRepairSeedPools", "microSkillBridgePools")
ORDER = ["repair", "bridge", "easy", "medium", "hard", "elite", "legendary", "easyBoss", "mediumBoss", "finalBoss", "legendaryBoss"]
ALIASES = {"microRepair": "repair", "microBridge": "bridge", "repairQuestions": "repair", "repairSeedQuestions": "repair", "bridgeQuestions": "bridge"}
FIELDS = {
    "id": "question_id", "tag": "topic", "sourceGame": "source_game", "difficulty": "difficulty",
    "type": "type", "objective": "objective", "conceptCluster": "concept_cluster",
    "primarySkill": "primary_skill", "secondarySkills": "secondary_skills", "repairSkill": "repair_skill",
    "commonError": "common_error", "bossStage": "boss_stage", "q": "question_text", "feedback": "feedback",
    "hint": "hint", "image": "image", "questionVersion": "question_version",
}
BASE_COLUMNS = ["game", "question_id", "topic", "topic_display", "source_pools", "source_game", "difficulty", "type",
    "objective", "objective_label", "concept_cluster", "primary_skill", "secondary_skills", "repair_skill",
    "common_error", "boss_stage", "question_text", "option_a", "option_b", "option_c", "option_d",
    "correct_answer_index_zero_based", "correct_answer_letter", "correct_answer_text", "answer_source",
    "feedback", "hint", "image", "image_exists", "question_version", "source_file", "source_kind"]


class ValidationError(Exception):
    pass


def unique_keys(pairs):
    out = {}
    for key, value in pairs:
        if key in out:
            raise ValidationError(f"Duplicate JSON property: {key}")
        out[key] = value
    return out


def load_library(path):
    text = path.read_text(encoding="utf-8-sig").strip()
    prefix = "window.MQ_COMPOSER_LIBRARY="
    if not text.startswith(prefix) or not text.endswith(";"):
        raise ValidationError("Unexpected Composer wrapper; refusing to execute arbitrary source JavaScript.")
    library = json.loads(text[len(prefix):-1], object_pairs_hook=unique_keys)
    if not isinstance(library.get("concepts"), dict):
        raise ValidationError("Composer concepts object is missing.")
    return library


def walk_questions(value, path=()):
    """Discover actual records recursively, including future additional pools."""
    if isinstance(value, dict):
        if "q" in value and "options" in value:
            yield path, value
            return
        for key, child in value.items():
            yield from walk_questions(child, path + (str(key),))
    elif isinstance(value, list):
        for index, child in enumerate(value):
            yield from walk_questions(child, path + (str(index),))


def pool_name(path):
    return "/".join(path[:-1] if path and path[-1].isdigit() else path)


def collect(library):
    records, conflicts, occurrences = {}, [], 0
    for path, question in walk_questions(library):
        occurrences += 1
        qid = question.get("id")
        if qid is None or str(qid).strip() == "":
            raise ValidationError(f"Question without ID at {'/'.join(path)}")
        qid = str(qid)
        if qid in records:
            previous = records[qid]["q"]
            if previous != question:
                differences = sorted(k for k in previous.keys() | question.keys() if previous.get(k) != question.get(k) or (k in previous) != (k in question))
                conflicts.append({"question_id": qid, "fields": differences, "first_pool": sorted(records[qid]["pools"])[0], "conflicting_pool": pool_name(path)})
        else:
            records[qid] = {"q": question, "pools": set(), "labels": set()}
        entry = records[qid]
        entry["pools"].add(pool_name(path))
        if len(path) > 1 and path[0] == "concepts":
            label = library["concepts"][path[1]].get("objectiveLabels", {}).get(str(question.get("objective", "")))
            if label:
                entry["labels"].add(label)
    if conflicts:
        raise ValidationError("Conflicting duplicate IDs; no exports written:\n" + json.dumps(conflicts, ensure_ascii=False, indent=2))
    if not records:
        raise ValidationError("No instructional question objects found.")
    return records, occurrences


# Call the repository's exported normalization function, rather than approximating
# JavaScript Unicode normalization/lowercasing/whitespace semantics in Python.
NODE_AUDIT = r"""
const fs=require('fs'), crypto=require('crypto');
const input=JSON.parse(fs.readFileSync(0,'utf8'));
const core=require(input.core), lib=input.library;
const answers={}, derived=[];
function walk(v,p,visit){
  if(!v||typeof v!=='object')return;
  if(Object.hasOwn(v,'q')&&Object.hasOwn(v,'options')){visit(v,p);return;}
  for(const [k,x]of Object.entries(v))walk(x,[...p,k],visit);
}
walk(lib,[],q=>{
  if(!Array.isArray(q.options))return;
  const expected=String(q.aHash||'').replace(/^sha256:/i,'').toLowerCase();
  answers[String(q.id)]=q.options.map((o,i)=>
    crypto.createHash('sha256').update(core.normalizeAnswerText(o)).digest('hex')===expected?i:-1
  ).filter(i=>i>=0);
});
for(const [id,raw]of Object.entries(lib.concepts)){
  if(!raw.derivedFromConceptId)continue;
  const resolved=core.resolveConceptModule(lib,id);
  if(!resolved)throw Error('Unresolved derived concept '+id);
  // Only export memberships from runtime views. Their remapped tag/metadata must
  // never replace canonical stored question content.
  walk(resolved,['derived',id],(q,p)=>derived.push([String(q.id),p.slice(0,-1).join('/')]));
  for(const name of input.routes)for(const [route,refs]of Object.entries(resolved[name]||{}))
    for(const ref of refs)derived.push([String(typeof ref==='object'?ref.id:ref),['derived',id,name,route].join('/')]);
}
process.stdout.write(JSON.stringify({answers,derived}));
"""


def audit_answers_and_routes(library, records, root, node):
    completed = subprocess.run([node, "-e", NODE_AUDIT], input=json.dumps({"core": str(root / CORE), "library": library, "routes": ROUTES}),
        text=True, encoding="utf-8", capture_output=True, check=False)
    if completed.returncode:
        raise ValidationError("Repository normalization/derived-pool audit failed: " + completed.stderr)
    result = json.loads(completed.stdout)
    errors = []
    for qid, record in records.items():
        q = record["q"]
        if not isinstance(q.get("q"), str) or not q["q"].strip():
            errors.append(f"{qid}: missing question stem")
        options = q.get("options")
        if not isinstance(options, list) or not options or any(not isinstance(o, str) or not o.strip() for o in options):
            errors.append(f"{qid}: invalid/empty stored choices")
            continue
        if "a" in q:
            if type(q["a"]) is not int or not 0 <= q["a"] < len(options):
                errors.append(f"{qid}: invalid numeric answer index {q['a']!r}")
                continue
            index, source = q["a"], "numeric_index"
        else:
            matches = result["answers"].get(qid, [])
            if len(matches) != 1:
                errors.append(f"{qid}: aHash matches {len(matches)} options; cannot resolve correct answer")
                continue
            index, source = matches[0], "hash_match"
        record.update(answer=index, answer_source=source)
    for concept, module in library["concepts"].items():
        for group in ROUTES:
            for route, refs in module.get(group, {}).items():
                for ref in refs:
                    qid = str(ref.get("id") if isinstance(ref, dict) else ref)
                    if qid not in records:
                        errors.append(f"Dangling question reference {qid}: {concept}/{group}/{route}")
                    else:
                        records[qid]["pools"].add(f"concepts/{concept}/{group}/{route}")
    for qid, pool in result["derived"]:
        if qid not in records:
            errors.append(f"Derived view references missing question {qid}: {pool}")
        else:
            records[qid]["pools"].add(pool)
    if errors:
        raise ValidationError("Export validation errors:\n" + "\n".join(errors))


def readable(value):
    if value is None:
        return ""
    if isinstance(value, bool):
        return "true" if value else "false"
    if isinstance(value, dict):
        return "; ".join(f"{key}: {readable(child)}" for key, child in value.items())
    if isinstance(value, list):
        return "; ".join(readable(child) for child in value)
    return str(value)


def snake(name):
    return re.sub(r"(?<!^)(?=[A-Z])", "_", name).lower()


def flatten(value, prefix=""):
    if isinstance(value, dict):
        for key, child in value.items():
            yield from flatten(child, prefix + ("." if prefix else "") + snake(key))
    else:
        yield prefix, readable(value)


def display_topic(tag):
    return re.sub(r"[_-]+", " ", tag).title() if tag else "Unclassified"


def natural(value):
    return tuple((1, int(part)) if part.isdigit() else (0, part.casefold()) for part in re.split(r"(\d+)", str(value)))


def difficulty_key(record):
    q = record["q"]
    diff = q.get("difficulty", "")
    diff = ALIASES.get(diff, diff)
    if diff in ORDER:
        return ORDER.index(diff), ""
    # Preserve unknown explicit difficulty; only use a pool when difficulty is absent.
    if not diff:
        found = [ALIASES.get(p.split("/")[-1], p.split("/")[-1]) for p in record["pools"]]
        known = [ORDER.index(p) for p in found if p in ORDER]
        if known:
            return min(known), ""
    return len(ORDER), str(diff)


def letter(index):
    result = ""
    index += 1
    while index:
        index, rem = divmod(index - 1, 26)
        result = chr(65 + rem) + result
    return result


def display_pools(pools):
    """Lossless display grouping; CSV retains the complete individual paths."""
    groups = collections.defaultdict(list)
    for pool in sorted(pools):
        parent, _, leaf = pool.rpartition("/")
        groups[parent].append(leaf)
    return "\n".join(f"{parent}: {'; '.join(leaves)}" for parent, leaves in groups.items())


def resolve_image(question, data_dir, library):
    """Use the literal path first, then an unambiguous registered concept asset."""
    image = question["image"]
    direct = (data_dir / image).resolve()
    if not direct.is_relative_to(data_dir):
        raise ValidationError(f"{question['id']}: image escapes composer data directory: {image}")
    if direct.is_file():
        return direct, "literal_path"
    concept = question.get("primaryConceptId")
    module = (library or {}).get("concepts", {}).get(concept, {})
    candidates = [a for a in (library or {}).get("assetInventory", [])
        if a.get("filename") == Path(image).name and
        (a.get("conceptId") == concept or a.get("runtimePath") in module.get("assetPaths", []))]
    hashes = {a.get("sha256") for a in candidates}
    if len(hashes) == 1 and None not in hashes:
        for candidate in candidates:
            path = (data_dir / candidate["runtimePath"]).resolve()
            if path.is_relative_to(data_dir) and path.is_file() and hashlib.sha256(path.read_bytes()).hexdigest() == candidate["sha256"]:
                return path, "registered_concept_asset"
    return None, "missing_or_ambiguous"


def make_rows(records, root, library=None):
    rows = []
    data_dir = (root / SOURCE).parent.resolve()
    for qid, entry in records.items():
        q = entry["q"]
        row = {key: "" for key in BASE_COLUMNS}
        row.update({target: readable(q.get(source)) for source, target in FIELDS.items()})
        row.update(game=TITLE, question_id=qid, topic_display=display_topic(row["topic"]),
            source_pools="; ".join(sorted(entry["pools"])), objective_label="; ".join(sorted(entry["labels"])),
            source_file=SOURCE.as_posix(), source_kind="fixed_question")
        for index, option in enumerate(q["options"]):
            row[f"option_{letter(index).lower()}"] = option
        index = entry["answer"]
        row.update(correct_answer_index_zero_based=str(index), correct_answer_letter=letter(index),
            correct_answer_text=q["options"][index], answer_source=entry["answer_source"])
        for key, value in q.items():
            if key in FIELDS or key in {"options", "a"}:
                continue
            for name, text in flatten(value, "metadata." + snake(key)):
                row[name] = text
        image = q.get("image")
        if image:
            image_path, resolution = resolve_image(q, data_dir, library)
            row["image_exists"] = "true" if image_path else "false"
            row["image_resolution"] = resolution
            row["resolved_image_file"] = image_path.relative_to(root).as_posix() if image_path else ""
            entry["image_path"] = image_path
        rows.append(row)
    rows.sort(key=lambda r: (r["topic_display"].casefold(), r["topic"], natural(r["objective"]), difficulty_key(records[r["question_id"]]), natural(r["question_id"])))
    return rows


def csv_export(path, rows):
    columns = BASE_COLUMNS + sorted(set().union(*(row.keys() for row in rows)) - set(BASE_COLUMNS))
    with path.open("w", encoding="utf-8-sig", newline="") as handle:
        writer = csv.DictWriter(handle, fieldnames=columns)
        writer.writeheader()
        writer.writerows(rows)
    with path.open(encoding="utf-8-sig", newline="") as handle:
        actual = list(csv.DictReader(handle))
    if len(actual) != len(rows) or any(any(actual[i][k] != v for k, v in row.items()) for i, row in enumerate(rows)):
        raise ValidationError("CSV round-trip differs from canonical source values.")
    if len({r['question_id'] for r in actual}) != len(rows):
        raise ValidationError("CSV has duplicate IDs.")


class TableParser(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.rows, self.current, self.cell, self.caption = [], None, None, ""
        self.in_caption = False

    def handle_starttag(self, tag, attrs):
        if tag == "tr": self.current = []
        if tag in {"th", "td"}: self.cell = ""
        if tag == "caption": self.in_caption = True

    def handle_endtag(self, tag):
        if tag in {"th", "td"}:
            self.current.append(self.cell)
            self.cell = None
        if tag == "tr": self.rows.append(self.current)
        if tag == "caption": self.in_caption = False

    def handle_data(self, data):
        if self.cell is not None: self.cell += data
        if self.in_caption: self.caption += data


def visible_text(text):
    # Only known, actual table markup is interpreted. Economic comparisons such
    # as P<ATC must remain literal text, not be treated as HTML tags.
    return html.unescape(re.sub(r"</?(?:table|caption|thead|tbody|tr|th|td)\b[^>]*>", " ", str(text)))


def build_pdf(path, rows, records, summary, font_dir):
    from reportlab.lib import colors
    from reportlab.lib.styles import ParagraphStyle
    from reportlab.lib.enums import TA_CENTER
    from reportlab.lib.pagesizes import A4
    from reportlab.pdfbase import pdfmetrics
    from reportlab.pdfbase.ttfonts import TTFont
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, PageBreak, KeepTogether, Table, TableStyle, Image
    for name, filename in [("Faculty", "arial.ttf"), ("FacultyBold", "arialbd.ttf"), ("FacultyItalic", "ariali.ttf")]:
        pdfmetrics.registerFont(TTFont(name, str(font_dir / filename)))
    pdfmetrics.registerFont(TTFont("FacultySymbols", str(font_dir / "seguisym.ttf")))
    pdfmetrics.registerFontFamily("Faculty", normal="Faculty", bold="FacultyBold", italic="FacultyItalic", boldItalic="FacultyBold")
    primary_glyphs = pdfmetrics.getFont("Faculty").face.charToGlyph
    symbol_glyphs = pdfmetrics.getFont("FacultySymbols").face.charToGlyph
    def markup(text):
        result = []
        for char in str(text):
            if char == "\n":
                result.append("<br/>")
            elif char.isspace() or ord(char) in primary_glyphs:
                result.append(html.escape(char))
            elif ord(char) in symbol_glyphs:
                result.append('<font name="FacultySymbols">' + html.escape(char) + '</font>')
            else:
                raise ValidationError(f"No font glyph for U+{ord(char):04X}; refusing to omit source content.")
        return "".join(result)
    ink, muted = colors.HexColor("#172b3a"), colors.HexColor("#4c5963")
    styles = {
        "body": ParagraphStyle("body", fontName="Faculty", fontSize=10, leading=14, spaceAfter=5, textColor=ink),
        "meta": ParagraphStyle("meta", fontName="Faculty", fontSize=8, leading=11, spaceAfter=3, textColor=muted, allowWidows=0, allowOrphans=0),
        "small": ParagraphStyle("small", fontName="Faculty", fontSize=7, leading=9, spaceAfter=3, textColor=muted, allowWidows=0, allowOrphans=0),
        "id": ParagraphStyle("id", fontName="FacultyBold", fontSize=10, leading=13, spaceBefore=10, spaceAfter=6, keepWithNext=True, textColor=ink),
        "topic": ParagraphStyle("topic", fontName="FacultyBold", fontSize=19, leading=24, spaceAfter=14, keepWithNext=True, textColor=ink),
        "cover": ParagraphStyle("cover", fontName="FacultyBold", fontSize=29, leading=35, spaceAfter=20, textColor=ink),
    }
    def p(text, style="body"):
        return Paragraph(markup(text), styles[style])
    def labeled(label, text, style="body"):
        return Paragraph(f"<b>{markup(label)}:</b> " + markup(text), styles[style])
    def content(text):
        result = []
        for part in re.split(r"(<table\b.*?</table>)", text, flags=re.S | re.I):
            if part.lower().startswith("<table"):
                parser = TableParser(); parser.feed(part)
                if parser.caption: result.append(p(parser.caption))
                table = Table([[p(cell) for cell in row] for row in parser.rows], colWidths=[width / len(parser.rows[0])] * len(parser.rows[0]), hAlign="LEFT")
                table.setStyle(TableStyle([("GRID", (0, 0), (-1, -1), .4, colors.HexColor("#b9c3cb")), ("BACKGROUND", (0, 0), (-1, 0), colors.HexColor("#eef2f5")), ("VALIGN", (0, 0), (-1, -1), "TOP"), ("LEFTPADDING", (0, 0), (-1, -1), 7), ("TOPPADDING", (0, 0), (-1, -1), 6)]))
                result.extend([table, Spacer(1, 6)])
            elif part.strip(): result.append(p(part))
        return result
    page_width, page_height = A4
    width = page_width - 88
    topic_counts = collections.Counter(row["topic"] for row in rows)
    generated = summary["generated_at"]
    story = [Spacer(1, 65), p(TITLE, "cover"), p("Faculty Question Bank", "cover"), p(generated[:10]), Spacer(1, 24),
        p(f"{len(rows):,} unique questions  |  {len(topic_counts):,} topics  |  {summary['pools_represented']:,} pools", "body"), Spacer(1, 20),
        p("For faculty/reviewer inspection. Question content reproduced from the canonical game bank."),
        p("Scope: Composer library only. Historical source-game names are retained as provenance; polished game banks are excluded."),
        p("Topics use the stored raw tag. Derived composer views contribute pool memberships only; their runtime tag remapping is not applied."),
        Spacer(1, 20), p("Validation", "topic")]
    for label, key in [("Questions with images", "questions_with_images"), ("Missing images", "missing_images"), ("Questions missing feedback", "missing_feedback"), ("Questions missing topic/tag", "missing_topic"), ("Questions missing objective", "missing_objective"), ("Duplicate occurrences merged", "duplicate_occurrences_merged"), ("Conflicting IDs", "conflicting_ids"), ("Dynamic generators", "dynamic_generators")]:
        story.append(labeled(label, summary[key], "meta"))
    if summary.get("image_path_fallbacks"):
        story.append(labeled("Graph paths resolved through registered concept assets", summary["image_path_fallbacks"], "meta"))
    story.extend([PageBreak(), p("Topic index", "topic")])
    topics = list(dict.fromkeys(row["topic"] for row in rows))
    for index, tag in enumerate(topics):
        story.append(Paragraph(f'<link href="#topic-{index}" color="#172b3a">{html.escape(display_topic(tag))}</link> <font color="#4c5963">({topic_counts[tag]:,})</font>', styles["body"]))
    story.append(PageBreak())
    current = None
    pdf_ids, anchors = [], {}
    image_cache = {}
    from PIL import Image as PILImage
    import io
    display_fields = [
        ("Topic / raw tag", "topic"), ("Learning Objective", "objective"), ("Learning Objective Label", "objective_label"),
        ("Difficulty", "difficulty"), ("Question Type", "type"), ("Concept Cluster", "concept_cluster"),
        ("Primary Skill", "primary_skill"), ("Secondary Skills", "secondary_skills"), ("Repair Skill", "repair_skill"),
        ("Common Error", "common_error"), ("Boss Stage", "boss_stage"), ("Source Game", "source_game"), ("Question Version", "question_version")]
    # Provenance checksums and long historical file paths belong in the CSV.
    # All pedagogical metadata, including additional scenario fields, is in PDF.
    provenance = {"a_hash", "source_hash", "source_occurrences", "source_id", "canonical_id", "question_id", "original_legacy_id", "source_record_order"}
    for number, row in enumerate(rows, 1):
        new_topic = row["topic"] != current
        if new_topic:
            if current is not None: story.append(PageBreak())
            current = row["topic"]
            topic_index = topics.index(current)
            heading = p(f"{row['topic_display']}  ({topic_counts[current]:,})", "topic")
            heading.topic_anchor = f"topic-{topic_index}"
            story.append(heading)
        qid = row["question_id"]
        entry = records[qid]
        header = p("Question ID: " + qid, "id")
        header.question_id = qid
        block = [header]
        metadata = [(label, row[key]) for label, key in display_fields if row[key] != ""]
        # Pair short metadata fields; retain complete values.
        for i in range(0, len(metadata), 2):
            pair = metadata[i:i+2]
            text = "<br/>".join(f"<b>{markup(label)}:</b> {markup(value)}" for label, value in pair)
            block.append(Paragraph(text, styles["meta"]))
        pools_display = display_pools(entry["pools"])
        if len(pools_display) < 700:
            block.append(labeled("Source Pools", pools_display, "small"))
        core = content(row["question_text"])
        if row["image"]:
            image_path = entry.get("image_path")
            if image_path:
                if image_path not in image_cache:
                    with PILImage.open(image_path) as im:
                        out = io.BytesIO(); im.save(out, format="PNG")
                        image_cache[image_path] = (out.getvalue(), im.size)
                data, (iw, ih) = image_cache[image_path]
                scale = min(width / iw, 260 / ih)
                graphic = Image(io.BytesIO(data), width=iw * scale, height=ih * scale)
                core.extend([graphic, p(Path(row["image"]).name, "small")])
            else:
                core.append(p(f"[Referenced image missing: {row['image']}]"))
        for i, option in enumerate(entry["q"]["options"]):
            core.append(p(f"{letter(i)}. {option}"))
        core.append(labeled("Correct Answer", f"{row['correct_answer_letter']} — {row['correct_answer_text']}"))
        if row["feedback"]: core.append(labeled("Feedback", row["feedback"]))
        if row["hint"]: core.append(labeled("Hint", row["hint"]))
        core_start = len(block)
        block.extend(core)
        core_end = len(block)
        if len(pools_display) >= 700:
            block.append(labeled("Source Pools", pools_display, "small"))
        extras = []
        for key in sorted(row):
            if key.startswith("metadata.") and row[key] != "":
                raw = key[len("metadata."):]
                if raw in provenance or raw.startswith(("provenance.", "source.", "resource_matching.")):
                    continue
                extras.append(f"{raw.replace('_', ' ')}: {row[key]}")
        if extras: block.append(labeled("Additional Metadata", " · ".join(extras), "small"))
        # Do not nest KeepTogether: its sentinel height can orphan topic headings.
        # Keep entire fitting blocks together, otherwise protect just the stem,
        # graph, choices, answer and feedback as one unit when they fit a page.
        usable_height = page_height - 48 - 43 - 12
        block_height = sum(f.wrap(width - 12, usable_height)[1] + f.getSpaceBefore() + f.getSpaceAfter() for f in block)
        topic_height = 42 if new_topic else 0
        if block_height + topic_height <= usable_height:
            story.append(KeepTogether(block))
        else:
            story.extend(block[:core_start])
            tail = block[core_start:]
            tail_height = sum(f.wrap(width - 12, usable_height)[1] + f.getSpaceBefore() + f.getSpaceAfter() for f in tail)
            if tail_height <= usable_height:
                story.append(KeepTogether(tail))
            else:
                story.append(KeepTogether(core))
                story.extend(block[core_end:])
        if number % 2000 == 0: print(f"Prepared {number:,} PDF questions", flush=True)

    class FacultyDoc(SimpleDocTemplate):
        def afterFlowable(self, flowable):
            if hasattr(flowable, "question_id"):
                pending = getattr(self, "pending_topic_page", None)
                if pending is not None and pending != self.page:
                    raise ValidationError(f"Orphan topic heading before {flowable.question_id}")
                self.pending_topic_page = None
                pdf_ids.append(flowable.question_id)
                anchors[flowable.question_id] = self.page
                if len(pdf_ids) % 2000 == 0:
                    print(f"Laid out {len(pdf_ids):,} PDF questions", flush=True)
            if hasattr(flowable, "topic_anchor"):
                self.pending_topic_page = self.page
                self.canv.bookmarkPage(flowable.topic_anchor)
                self.canv.addOutlineEntry(flowable.getPlainText(), flowable.topic_anchor, level=0)

    def footer(canvas, doc):
        canvas.saveState()
        canvas.setFont("Faculty", 8); canvas.setFillColor(muted)
        canvas.drawString(44, page_height - 28, "MASTERY QUESTS COMPOSER  /  FACULTY INSPECTION")
        canvas.drawString(44, 25, generated[:10])
        canvas.drawRightString(page_width - 44, 25, str(doc.page))
        canvas.restoreState()
    doc = FacultyDoc(str(path), pagesize=A4, rightMargin=44, leftMargin=44, topMargin=48, bottomMargin=43,
        title=TITLE + " — Faculty Question Bank", author="Mastery Quests", pageCompression=1)
    doc.build(story, onFirstPage=footer, onLaterPages=footer)
    if pdf_ids != [row["question_id"] for row in rows]:
        raise ValidationError("PDF layout did not emit each question ID exactly once and in topic order.")
    return anchors, doc.page


def compact(text):
    return re.sub(r"\s+", "", visible_text(text))


def verify_pdf(pdf, rows, records):
    try:
        import pypdfium2 as pdfium
    except ImportError:
        from pypdf import PdfReader
        pages = [page.extract_text() for page in PdfReader(pdf).pages]
    else:
        pages = []
        with pdfium.PdfDocument(str(pdf)) as document:
            for i in range(len(document)):
                page = document[i]
                textpage = page.get_textpage()
                pages.append(textpage.get_text_bounded())
                textpage.close(); page.close()
    # Remove page furniture separately so paragraphs split across pages still
    # compare continuously with the canonical text.
    clean_pages = []
    for page_number, text in enumerate(pages, 1):
        text = re.sub(r"MASTERY QUESTS COMPOSER\s*/\s*FACULTY INSPECTION", "", text)
        # PDFium may return footer text before body text on sparse pages.
        text = re.sub(r"\d{4}-\d{2}-\d{2}\s+" + str(page_number) + r"(?:\s|$)", "", text)
        if not text.strip():
            raise ValidationError(f"Blank PDF page {page_number}")
        clean_pages.append(text)
    text = "\n".join(clean_pages)
    parts = re.split(r"Question ID:\s*([^\s]+)", text)
    actual_ids = parts[1::2]
    expected_ids = [r["question_id"] for r in rows]
    if actual_ids != expected_ids:
        raise ValidationError(f"PDF text question IDs/order differs: expected {len(rows)}, found {len(actual_ids)}")
    errors = []
    for row, body in zip(rows, parts[2::2]):
        body = compact(body)
        checks = {"stem": row["question_text"], "correct answer": row["correct_answer_text"], "feedback": row["feedback"], "hint": row["hint"]}
        checks.update({f"option {i}": o for i, o in enumerate(records[row["question_id"]]["q"]["options"])})
        for field, expected in checks.items():
            if expected and compact(expected) not in body:
                errors.append(f"{row['question_id']}: complete {field} not found in emitted PDF text")
    if errors:
        raise ValidationError("PDF content verification failed:\n" + "\n".join(errors))


def main(argv=None):
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--root", type=Path, default=ROOT)
    parser.add_argument("--node", default=shutil.which("node"))
    parser.add_argument("--font-dir", type=Path, default=Path(os.environ.get("WINDIR", "C:/Windows")) / "Fonts")
    args = parser.parse_args(argv)
    root = args.root.resolve()
    output = root / "faculty_exports"
    output.mkdir(parents=True, exist_ok=True)
    if not args.node:
        parser.error("Node.js is required; use --node if not on PATH.")
    import importlib.util
    for dependency in ("reportlab", "PIL"):
        if not importlib.util.find_spec(dependency):
            parser.error(f"Missing Python dependency: {dependency}")
    if not any(importlib.util.find_spec(name) for name in ("pypdfium2", "pypdf")):
        parser.error("Install pypdfium2 or pypdf for emitted-PDF verification.")
    for filename in ("arial.ttf", "arialbd.ttf", "ariali.ttf", "seguisym.ttf"):
        if not (args.font_dir / filename).is_file():
            parser.error(f"Missing font {filename}; use --font-dir.")
    source = root / SOURCE
    before = hashlib.sha256(source.read_bytes()).hexdigest()
    try:
        library = load_library(source)
        records, occurrences = collect(library)
        audit_answers_and_routes(library, records, root, args.node)
        rows = make_rows(records, root, library)
        warnings = {"missing_images": [r['question_id'] for r in rows if r['image_exists'] == 'false'],
            "missing_feedback": [r['question_id'] for r in rows if not r['feedback']],
            "missing_topic": [r['question_id'] for r in rows if not r['topic']],
            "missing_objective": [r['question_id'] for r in rows if not r['objective']],
            "image_path_fallbacks": [r['question_id'] for r in rows if r.get('image_resolution') == 'registered_concept_asset']}
        summary = {"generated_at": datetime.now().astimezone().isoformat(timespec="seconds"),
            "source_file": SOURCE.as_posix(), "source_sha256": before, "unique_questions": len(rows),
            "topics": len({r['topic'] for r in rows}), "pools_represented": len(set().union(*(v['pools'] for v in records.values()))),
            "questions_with_images": sum(bool(r['image']) for r in rows), **{k: len(v) for k, v in warnings.items()},
            "duplicate_occurrences_merged": occurrences - len(rows), "conflicting_ids": 0, "dynamic_generators": 0,
            "csv_rows": len(rows), "pdf_questions": len(rows), "warning_ids": warnings,
            "scope": "Only canonical composer_library.js question objects and their stored/derived pool memberships. No polished game bank inputs."}
        # The library is JSON data, with no functions or executable generators.
        # Reject newly introduced generator definitions until explicitly supported.
        def generators(value, path=()):
            if isinstance(value, dict):
                for key, child in value.items():
                    if re.search(r'(?:question.*generator|generator.*question|calculationGenerators)', key, re.I) and child:
                        yield '/'.join(path + (key,))
                    yield from generators(child, path + (key,))
            elif isinstance(value, list):
                for child in value: yield from generators(child, path)
        new_generators = list(generators(library))
        if new_generators:
            raise ValidationError("New dynamic generator definitions require an exporter adapter: " + "; ".join(new_generators))
        with tempfile.TemporaryDirectory(prefix=".export-", dir=output) as temporary:
            stage = Path(temporary)
            csv_path, pdf_path = stage / (STEM + ".csv"), stage / (STEM + ".pdf")
            csv_export(csv_path, rows)
            anchors, pages = build_pdf(pdf_path, rows, records, summary, args.font_dir)
            print(f"Checking all {len(rows):,} questions in {pages:,} emitted PDF pages...", flush=True)
            try:
                verify_pdf(pdf_path, rows, records)
            except ValidationError:
                shutil.copy2(pdf_path, output / ".failed-verification.pdf")
                raise
            if hashlib.sha256(source.read_bytes()).hexdigest() != before:
                raise ValidationError("Canonical library changed during export; rerun with a stable source.")
            summary.update(status="complete", pdf_pages=pages, question_pages=anchors)
            (stage / "validation_summary.json").write_text(json.dumps(summary, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
            for path in (csv_path, pdf_path, stage / "validation_summary.json"):
                os.replace(path, output / path.name)
        (output / "last_export_error.txt").unlink(missing_ok=True)
        (output / ".failed-verification.pdf").unlink(missing_ok=True)
        print("\nFaculty Question Bank Export Complete")
        for label, key in [("Unique questions", "unique_questions"), ("Topics", "topics"), ("Pools represented", "pools_represented"), ("Questions with images", "questions_with_images"), ("Missing images", "missing_images"), ("Questions missing feedback", "missing_feedback"), ("Questions missing topic/tag", "missing_topic"), ("Questions missing objective", "missing_objective"), ("Duplicate IDs merged (extra occurrences)", "duplicate_occurrences_merged"), ("Conflicting IDs", "conflicting_ids"), ("Dynamic generators", "dynamic_generators"), ("CSV rows", "csv_rows"), ("PDF questions", "pdf_questions")]:
            print(f"{label}: {summary[key]}")
        print(f"Graph paths resolved through registered concept assets: {summary['image_path_fallbacks']}")
        print(output / (STEM + ".pdf")); print(output / (STEM + ".csv"))
        return 0
    except (ValidationError, ValueError) as exc:
        message = "Faculty export FAILED. No new PDF/CSV published. Any previous exports are stale.\n" + str(exc)
        (output / "last_export_error.txt").write_text(message + "\n", encoding="utf-8")
        print(message, file=sys.stderr)
        return 1


if __name__ == "__main__":
    sys.exit(main())
