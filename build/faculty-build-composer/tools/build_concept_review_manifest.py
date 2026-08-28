from __future__ import annotations

import argparse
import hashlib
import json
import re
from collections import Counter, defaultdict
from pathlib import Path
from typing import Any

from pypdf import PdfReader


ALLOWED_DISPOSITIONS = {
    "REVIEW_SHEET",
    "COVERED_BY_CHILD_CONCEPT",
    "NO_SHEET_INTEGRATION_META",
    "HIDDEN_SUPPLEMENTAL",
}
REVIEW_CODE_RE = re.compile(r"^(GEN-ECON|MICRO|MACRO)-(\d{2})$")


def load_json(path: Path) -> dict[str, Any]:
    return json.loads(path.read_text(encoding="utf-8"))


def write_json(path: Path, value: dict[str, Any]) -> None:
    with path.open("w", encoding="utf-8", newline="\n") as stream:
        stream.write(json.dumps(value, indent=2, ensure_ascii=False) + "\n")


def load_library(path: Path) -> dict[str, Any]:
    text = path.read_text(encoding="utf-8").strip()
    prefix = "window.MQ_COMPOSER_LIBRARY="
    if not text.startswith(prefix) or not text.endswith(";"):
        raise ValueError(f"Unexpected Composer library wrapper: {path}")
    return json.loads(text[len(prefix) : -1])


def parse_id_set(composer_js: str, variable_name: str) -> set[str]:
    match = re.search(
        rf"const\s+{re.escape(variable_name)}\s*=\s*new\s+Set\s*\(\s*\[(.*?)\]\s*\)\s*;",
        composer_js,
        re.DOTALL,
    )
    if not match:
        raise ValueError(f"Could not locate {variable_name} in composer.js")
    return set(re.findall(r"['\"]([^'\"]+)['\"]", match.group(1)))


def sha256(path: Path) -> str:
    digest = hashlib.sha256()
    with path.open("rb") as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b""):
            digest.update(chunk)
    return digest.hexdigest()


def pdf_language(reader: PdfReader) -> str | None:
    try:
        root = reader.trailer["/Root"]
        value = root.get("/Lang")
        return str(value) if value else None
    except Exception:
        return None


def inspect_pdf(path: Path) -> dict[str, Any]:
    record: dict[str, Any] = {
        "filename": path.name,
        "relativePath": path.name,
        "sizeBytes": path.stat().st_size,
        "sha256": sha256(path),
        "malformed": False,
        "pageCount": None,
        "hasSelectableText": False,
        "documentLanguage": None,
    }
    try:
        reader = PdfReader(str(path), strict=True)
        record["pageCount"] = len(reader.pages)
        text = "\n".join((page.extract_text() or "") for page in reader.pages)
        record["hasSelectableText"] = bool(text.strip())
        record["documentLanguage"] = pdf_language(reader)
    except Exception as exc:
        record["malformed"] = True
        record["error"] = f"{type(exc).__name__}: {exc}"
    return record


def module_has_questions(concept_id: str, concept: dict[str, Any], concepts: dict[str, Any]) -> bool:
    if concept.get("supplementType") == "checkpoint-challenge":
        return False
    if concept.get("derivedFromConceptId"):
        parent = concepts.get(concept["derivedFromConceptId"], {})
        filter_id = concept.get("subtopicFilterId") or concept_id
        question_groups = list((parent.get("questions") or {}).values())
        question_groups += [
            parent.get("repairQuestions") or [],
            parent.get("repairSeedQuestions") or [],
            parent.get("bridgeQuestions") or [],
        ]
        return any(filter_id in (question.get("subtopicIds") or []) for group in question_groups for question in group)
    return any(concept.get("questions", {}).get(pool) for pool in concept.get("questions", {}))


def concept_areas(concept_id: str, general_ids: set[str], micro_ids: set[str], all_ids: set[str]) -> list[str]:
    macro_ids = (all_ids - general_ids - micro_ids) | general_ids
    return [
        area
        for area, members in (("general", general_ids), ("micro", micro_ids), ("macro", macro_ids))
        if concept_id in members
    ]


def primary_discipline(
    concept_id: str,
    review_codes: list[str],
    review_by_code: dict[str, dict[str, Any]],
    meta: dict[str, Any],
) -> str:
    disciplines = {review_by_code[code]["discipline"] for code in review_codes if code in review_by_code}
    if len(disciplines) == 1:
        return next(iter(disciplines))
    if meta.get("selectionRole") in {"family-parent", "family-child"}:
        return "micro"
    if concept_id == "integrated-economic-analysis":
        return "general"
    if concept_id == "integrated-macroeconomic-analysis":
        return "macro"
    if disciplines:
        raise ValueError(f"Conflicting review disciplines for {concept_id}: {sorted(disciplines)}")
    raise ValueError(f"Cannot determine discipline for {concept_id}")


def build_manifest(composer_root: Path) -> tuple[dict[str, Any], dict[str, Any]]:
    review_root = composer_root / "data" / "concept-reviews"
    source_content = load_json(review_root / "concept_review_source.json")
    source_manifest = source_content
    source_validation = load_json(review_root / "concept_review_validation.json")
    disposition_overrides = source_manifest.get("conceptDispositionOverrides") or {}
    library = load_library(composer_root / "data" / "composer_library.js")
    course_area_js = (composer_root / "course-area-model.js").read_text(encoding="utf-8")
    general_ids = parse_id_set(course_area_js, "GENERAL_AREA_IDS")
    micro_ids = parse_id_set(course_area_js, "MICRO_AREA_IDS")
    concepts = library["concepts"]
    registry = library["registry"]["concepts"]
    meta_by_id = {item["canonicalConceptId"]: item for item in registry}
    for parent_id in parse_id_set(course_area_js, "MICRO_FAMILY_PARENT_IDS"):
        micro_ids.update(meta_by_id.get(parent_id, {}).get("childConceptIds") or [])
    all_ids = set(concepts)
    if set(meta_by_id) != all_ids:
        raise ValueError("Composer registry and library concept IDs differ")

    source_review_by_code: dict[str, dict[str, Any]] = {}
    duplicate_source_codes: list[str] = []
    for review in source_manifest.get("reviews", []):
        code = review.get("code")
        if code in source_review_by_code:
            duplicate_source_codes.append(code)
        source_review_by_code[code] = review
    content_by_code = {review["code"]: review for review in source_content.get("reviews", [])}

    pdf_records: list[dict[str, Any]] = []
    pdf_by_code: dict[str, dict[str, Any]] = {}
    duplicate_pdf_codes: list[str] = []
    for path in sorted(review_root.glob("*.pdf"), key=lambda item: item.name.casefold()):
        record = inspect_pdf(path)
        record["reviewCode"] = path.stem
        code_match = REVIEW_CODE_RE.fullmatch(path.stem)
        record["discipline"] = (
            {"GEN-ECON": "general", "MICRO": "micro", "MACRO": "macro"}[code_match.group(1)]
            if code_match
            else None
        )
        record["filenameCodeMatches"] = bool(code_match and path.name == f"{path.stem}.pdf")
        pdf_records.append(record)
        if path.stem in pdf_by_code:
            duplicate_pdf_codes.append(path.stem)
        pdf_by_code[path.stem] = record

    missing_asset_codes = sorted(set(source_review_by_code) - set(pdf_by_code))
    orphan_pdf_codes = sorted(set(pdf_by_code) - set(source_review_by_code))
    content_missing_codes = sorted(set(source_review_by_code) - set(content_by_code))

    numbers_by_prefix: dict[str, list[int]] = defaultdict(list)
    for code in pdf_by_code:
        match = REVIEW_CODE_RE.fullmatch(code)
        if match:
            numbers_by_prefix[match.group(1)].append(int(match.group(2)))
    missing_sequence_codes: list[str] = []
    for prefix, numbers in numbers_by_prefix.items():
        if not numbers:
            continue
        for number in range(1, max(numbers) + 1):
            code = f"{prefix}-{number:02d}"
            if code not in pdf_by_code:
                missing_sequence_codes.append(code)

    reviews: list[dict[str, Any]] = []
    for code in sorted(source_review_by_code):
        source = source_review_by_code[code]
        asset = pdf_by_code.get(code)
        content = content_by_code.get(code, {}).get("content", {})
        uses_graph = bool(source.get("usesGraph", content.get("graph", False)))
        record = {
            "code": code,
            "canonicalConceptIds": sorted(set(source.get("canonicalConceptIds") or [])),
            "title": source.get("title"),
            "discipline": source.get("discipline"),
            "disposition": "REVIEW_SHEET",
            "pdfPath": source.get("pdfPath") or f"{code}.pdf",
            "runtimeFilename": f"{code}.pdf",
            "hasGraph": uses_graph,
            "hasCalculation": bool(content.get("calculation", False)),
            "sha256": asset.get("sha256") if asset else source.get("pdfSha256"),
            "sizeBytes": asset.get("sizeBytes") if asset else None,
            "pageCount": asset.get("pageCount") if asset else None,
            "hasSelectableText": asset.get("hasSelectableText") if asset else False,
            "documentLanguage": asset.get("documentLanguage") if asset else None,
            "sourceAltTextStatus": (
                "retained-in-authoritative-source;pdf-figure-not-tagged"
                if uses_graph
                and source_validation.get("accessibility", {}).get("sourceAltRequired")
                and not source_validation.get("accessibility", {}).get("taggedFigureAltImplemented")
                else "not-applicable"
            ),
        }
        reviews.append(record)

    review_by_code = {review["code"]: review for review in reviews}
    codes_by_concept: dict[str, list[str]] = defaultdict(list)
    for review in reviews:
        for concept_id in review["canonicalConceptIds"]:
            codes_by_concept[concept_id].append(review["code"])

    concept_records: list[dict[str, Any]] = []
    parent_only_diagnostic_concerns: list[dict[str, Any]] = []
    for concept_id in sorted(all_ids):
        meta = meta_by_id[concept_id]
        library_concept = concepts[concept_id]
        parent_id = meta.get("parentConceptId") or library_concept.get("derivedFromConceptId")
        child_ids = list(meta.get("childConceptIds") or [])
        review_codes = sorted(set(codes_by_concept.get(concept_id, [])))
        override = disposition_overrides.get(concept_id) or {}
        diagnosable = module_has_questions(concept_id, library_concept, concepts)
        selectable_card = meta.get("status") == "active" and meta.get("supplementType") != "checkpoint-challenge"
        selectable = meta.get("status") == "active"

        if meta.get("supplementType") == "checkpoint-challenge":
            disposition = "HIDDEN_SUPPLEMENTAL"
            reason = (
                "Checkpoint challenge questions inherit a selected normal concept at runtime; "
                "the supplement is not a standalone mastery diagnosis."
            )
        elif concept_id == "integrated-economic-analysis":
            disposition = "NO_SHEET_INTEGRATION_META"
            reason = (
                "Cross-concept integration is a meta-level diagnosis spanning multiple canonical concepts; "
                "no single immutable review PDF is authoritative."
            )
        elif meta.get("selectionRole") == "family-parent":
            disposition = "COVERED_BY_CHILD_CONCEPT"
            reason = (
                "The broad family has no synthetic parent sheet. Its explicit child concepts provide review coverage."
            )
        elif review_codes:
            disposition = "REVIEW_SHEET"
            reason = None
        elif override:
            disposition = override.get("disposition")
            reason = override.get("reason")
            if disposition not in {"NO_SHEET_INTEGRATION_META", "HIDDEN_SUPPLEMENTAL"}:
                raise ValueError(f"Invalid explicit Concept Review disposition for {concept_id}: {disposition}")
            if not str(reason or "").strip():
                raise ValueError(f"Explicit Concept Review disposition for {concept_id} requires a reason")
        else:
            raise ValueError(f"Diagnosable concept lacks an explicit disposition: {concept_id}")

        if disposition == "HIDDEN_SUPPLEMENTAL":
            diagnosable = False

        discipline = override.get("discipline") or primary_discipline(concept_id, review_codes, review_by_code, meta)
        record: dict[str, Any] = {
            "canonicalConceptId": concept_id,
            "displayName": meta.get("title") or library_concept.get("title") or concept_id,
            "discipline": discipline,
            "areas": concept_areas(concept_id, general_ids, micro_ids, all_ids),
            "parentId": parent_id,
            "childIds": child_ids,
            "selectable": selectable,
            "selectableCard": selectable_card,
            "diagnosable": diagnosable,
            "selectionRole": meta.get("selectionRole") or (
                "supplement-control" if meta.get("supplementType") else "standalone"
            ),
            "disposition": disposition,
        }
        if disposition == "REVIEW_SHEET":
            record["reviewCodes"] = review_codes
            record["primaryReviewCode"] = review_codes[0]
        elif disposition == "COVERED_BY_CHILD_CONCEPT":
            record["coveredByConceptIds"] = child_ids
            record["coveredByReviewCodes"] = sorted(
                {
                    code
                    for child_id in child_ids
                    for code in codes_by_concept.get(child_id, [])
                }
            )
            record["reason"] = reason
            parent_only_diagnostic_concerns.append(
                {
                    "canonicalConceptId": concept_id,
                    "displayName": record["displayName"],
                    "currentDiagnosisBehavior": "PARENT_ID_ONLY_WHEN_PARENT_CARD_IS_SELECTED",
                    "coveredByConceptIds": child_ids,
                    "step2Concern": (
                        "Mastery Report 2.0 currently groups the parent selection under the parent tag; "
                        "Step 2 needs an explicit child/fallback presentation strategy."
                    ),
                }
            )
        else:
            record["reason"] = reason
        concept_records.append(record)

    disposition_counts = Counter(record["disposition"] for record in concept_records)
    if set(disposition_counts) - ALLOWED_DISPOSITIONS:
        raise ValueError("Unexpected disposition generated")

    reachable_review_codes: set[str] = set()
    for record in concept_records:
        if not record["selectable"]:
            continue
        reachable_review_codes.update(record.get("reviewCodes", []))
        reachable_review_codes.update(record.get("coveredByReviewCodes", []))

    review_reference_counts = Counter(
        code for record in concept_records for code in record.get("reviewCodes", [])
    )
    orphan_review_codes = sorted(code for code in review_by_code if not review_reference_counts[code])
    unreachable_review_codes = sorted(set(review_by_code) - reachable_review_codes)
    multi_review_concepts = [
        {
            "canonicalConceptId": record["canonicalConceptId"],
            "reviewCodes": record.get("reviewCodes", []),
            "mappingKind": "EXPLICIT_ORDERED_REVIEW_BUNDLE",
        }
        for record in concept_records
        if len(record.get("reviewCodes", [])) > 1
    ]

    filename_code_mismatches = sorted(
        record["filename"] for record in pdf_records if not record["filenameCodeMatches"]
    )
    manifest_filename_mismatches = sorted(
        review["code"]
        for review in reviews
        if review["pdfPath"] != f"{review['code']}.pdf"
    )
    malformed_pdfs = [record["filename"] for record in pdf_records if record["malformed"]]
    multi_page_pdfs = [record["filename"] for record in pdf_records if record["pageCount"] != 1]
    no_selectable_text = [record["filename"] for record in pdf_records if not record["hasSelectableText"]]

    hard_failures: list[str] = []
    if duplicate_source_codes:
        hard_failures.append(f"Duplicate source review codes: {sorted(set(duplicate_source_codes))}")
    if duplicate_pdf_codes:
        hard_failures.append(f"Duplicate PDF review codes: {sorted(set(duplicate_pdf_codes))}")
    if missing_asset_codes:
        hard_failures.append(f"Manifest reviews missing PDFs: {missing_asset_codes}")
    if content_missing_codes:
        hard_failures.append(f"Manifest reviews missing content metadata: {content_missing_codes}")
    if filename_code_mismatches or manifest_filename_mismatches:
        hard_failures.append(
            f"Filename/code mismatches: files={filename_code_mismatches}, manifest={manifest_filename_mismatches}"
        )
    if malformed_pdfs:
        hard_failures.append(f"Malformed PDFs: {malformed_pdfs}")
    if multi_page_pdfs:
        hard_failures.append(f"PDFs not exactly one page: {multi_page_pdfs}")
    if no_selectable_text:
        hard_failures.append(f"PDFs without selectable text: {no_selectable_text}")

    warnings: list[dict[str, Any]] = []
    if orphan_pdf_codes:
        warnings.append({"type": "orphan-pdf", "reviewCodes": orphan_pdf_codes})
    if orphan_review_codes:
        warnings.append({"type": "orphan-review", "reviewCodes": orphan_review_codes})
    if unreachable_review_codes:
        warnings.append({"type": "unreachable-review", "reviewCodes": unreachable_review_codes})
    no_sheet_diagnosable = [
        record["canonicalConceptId"]
        for record in concept_records
        if record["diagnosable"] and record["disposition"] == "NO_SHEET_INTEGRATION_META"
    ]
    if no_sheet_diagnosable:
        warnings.append({"type": "diagnosable-no-sheet-meta", "canonicalConceptIds": no_sheet_diagnosable})
    if parent_only_diagnostic_concerns:
        warnings.append(
            {
                "type": "diagnosable-parent-covered-by-children",
                "canonicalConceptIds": [item["canonicalConceptId"] for item in parent_only_diagnostic_concerns],
            }
        )

    summary_by_discipline = Counter(review["discipline"] for review in reviews)
    source_total_size = sum(record["sizeBytes"] for record in pdf_records)
    manifest: dict[str, Any] = {
        "schemaVersion": "8.0.0-composer-integration",
        "generatedAt": source_manifest.get("generatedAt"),
        "sourceAuthoringSchemaVersion": source_manifest.get(
            "sourceAuthoringSchemaVersion", source_manifest.get("schemaVersion")
        ),
        "composerLibraryVersion": library.get("libraryVersion"),
        "contract": {
            "canonicalKey": "canonicalConceptId",
            "runtimeIndexPath": "concept-reviews/manifest.json",
            "runtimeAssetDirectory": "concept-reviews/",
            "allowedDispositions": sorted(ALLOWED_DISPOSITIONS),
            "displayNameLookupAllowed": False,
            "sourcePdfPolicy": "immutable-copy-with-sha256-verification",
        },
        "summary": {
            "totalPdfCount": len(pdf_records),
            "generalPdfCount": summary_by_discipline["general"],
            "microPdfCount": summary_by_discipline["micro"],
            "macroPdfCount": summary_by_discipline["macro"],
            "totalPdfSizeBytes": source_total_size,
            "canonicalConceptCount": len(concept_records),
            "directlyMappedCanonicalConceptCount": disposition_counts["REVIEW_SHEET"],
            "dispositionCounts": dict(sorted(disposition_counts.items())),
            "hardFailureCount": len(hard_failures),
            "warningCount": len(warnings),
        },
        "standardizedBenchmark": source_manifest.get("standardizedBenchmark"),
        "renumberingMap": source_manifest.get("renumberingMap", {}),
        "demandSupplySplit": source_manifest.get("demandSupplySplit", {}),
        "reviews": reviews,
        "concepts": concept_records,
    }

    audit = {
        "schemaVersion": "1.0.0",
        "generatedAt": source_manifest.get("generatedAt"),
        "composerLibraryVersion": library.get("libraryVersion"),
        "libraryAudit": {
            "canonicalConceptCount": len(concept_records),
            "selectableConceptCount": sum(record["selectable"] for record in concept_records),
            "selectableCardCount": sum(record["selectableCard"] for record in concept_records),
            "diagnosableConceptCount": sum(record["diagnosable"] for record in concept_records),
            "concepts": concept_records,
        },
        "pdfAudit": {
            "totalPdfCount": len(pdf_records),
            "countByDiscipline": dict(sorted(summary_by_discipline.items())),
            "totalSizeBytes": source_total_size,
            "files": pdf_records,
            "duplicateReviewCodes": sorted(set(duplicate_source_codes + duplicate_pdf_codes)),
            "duplicateFilenames": [],
            "missingSequenceCodes": sorted(missing_sequence_codes),
            "orphanPdfCodes": orphan_pdf_codes,
            "malformedPdfs": malformed_pdfs,
            "multiPagePdfs": multi_page_pdfs,
            "noSelectableTextPdfs": no_selectable_text,
            "filenameCodeMismatches": filename_code_mismatches,
            "manifestFilenameCodeMismatches": manifest_filename_mismatches,
        },
        "mappingAudit": {
            "directlyMappedCanonicalConceptCount": disposition_counts["REVIEW_SHEET"],
            "allConceptsHaveDisposition": len(concept_records) == len(all_ids),
            "dispositionCounts": dict(sorted(disposition_counts.items())),
            "unmappedDiagnosableConceptIds": [],
            "conflictingMappings": [],
            "multiReviewConcepts": multi_review_concepts,
            "orphanReviewCodes": orphan_review_codes,
            "unreachableReviewCodes": unreachable_review_codes,
            "diagnosisBehaviorClassification": "C_MIXED",
            "diagnosisBehaviorExplanation": (
                "Granular child selections are diagnosed by child canonical IDs, while broad family-parent "
                "selections are currently diagnosed only by the parent ID/tag."
            ),
            "parentOnlyDiagnosticConcerns": parent_only_diagnostic_concerns,
        },
        "validation": {
            "passed": not hard_failures,
            "hardFailures": hard_failures,
            "warnings": warnings,
        },
    }
    return manifest, audit


def main() -> None:
    parser = argparse.ArgumentParser(description="Freeze and audit the Concept Review manifest.")
    parser.add_argument("--composer-root", type=Path, required=True)
    parser.add_argument("--manifest-output", type=Path, required=True)
    parser.add_argument("--audit-output", type=Path, required=True)
    args = parser.parse_args()

    manifest, audit = build_manifest(args.composer_root.resolve())
    args.manifest_output.parent.mkdir(parents=True, exist_ok=True)
    args.audit_output.parent.mkdir(parents=True, exist_ok=True)
    write_json(args.manifest_output, manifest)
    write_json(args.audit_output, audit)
    if not audit["validation"]["passed"]:
        raise SystemExit("Concept Review audit failed: " + "; ".join(audit["validation"]["hardFailures"]))
    print(json.dumps({"summary": manifest["summary"], "warnings": audit["validation"]["warnings"]}, indent=2))


if __name__ == "__main__":
    main()
