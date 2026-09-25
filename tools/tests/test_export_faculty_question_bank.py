"""Focused integrity checks for faculty exports; never edit the real library."""
import copy
import csv
import hashlib
import importlib.util
from pathlib import Path
import shutil
import sys
import tempfile
import unittest

sys.dont_write_bytecode = True
SCRIPT = Path(__file__).resolve().parents[1] / "export_faculty_question_bank.py"
spec = importlib.util.spec_from_file_location("faculty_export", SCRIPT)
export = importlib.util.module_from_spec(spec)
spec.loader.exec_module(export)


def question(**changes):
    q = dict(id="Q1", q="Choose the stored answer.\nSecond line, unchanged.",
        options=["wrong", "correct", "other", "none"], a=1, tag="test_topic",
        objective="LO2.10", difficulty="easy", feedback="Complete feedback, with punctuation.")
    q.update(changes)
    return q


def library(q):
    return {"concepts": {"test": {"questions": {"easy": [q]}, "objectiveLabels": {"LO2.10": "Test objective"}}}}


class ExportIntegrity(unittest.TestCase):
    def audit(self, lib):
        records, count = export.collect(lib)
        export.audit_answers_and_routes(lib, records, export.ROOT, shutil.which("node"))
        return records, count

    def test_identical_duplicates_merge_all_memberships(self):
        lib = library(question())
        lib["concepts"]["test"]["repairSeedQuestions"] = [question()]
        lib["concepts"]["test"]["microSkillRepairPools"] = {"skill": ["Q1"]}
        before = copy.deepcopy(lib)
        records, count = self.audit(lib)
        self.assertEqual((len(records), count), (1, 2))
        self.assertEqual(len(records["Q1"]["pools"]), 3)
        self.assertEqual(lib, before)

    def test_metadata_conflict_stops_export(self):
        lib = library(question())
        lib["concepts"]["test"]["bridgeQuestions"] = [question(difficulty="hard")]
        with self.assertRaisesRegex(export.ValidationError, "Q1.*",):
            export.collect(lib)

    def test_numeric_answer_precedes_hash(self):
        records, _ = self.audit(library(question(aHash="0" * 64)))
        self.assertEqual(records["Q1"]["answer"], 1)
        self.assertEqual(records["Q1"]["answer_source"], "numeric_index")

    def test_exact_javascript_hash_normalization(self):
        q = question(options=["wrong", " \ufeffＦＯＯ\u00a0 BAR \n", "other", "none"])
        del q["a"]
        q["aHash"] = hashlib.sha256(b"foo bar").hexdigest()
        records, _ = self.audit(library(q))
        self.assertEqual(records["Q1"]["answer_source"], "hash_match")
        self.assertEqual(records["Q1"]["answer"], 1)

    def test_zero_or_multiple_hash_matches_fail(self):
        for options, digest in [(["a", "b"], "0" * 64), (["A", " a "], hashlib.sha256(b"a").hexdigest())]:
            q = question(options=options, aHash=digest)
            del q["a"]
            with self.assertRaisesRegex(export.ValidationError, "aHash matches"):
                self.audit(library(q))

    def test_dangling_reference_fails(self):
        lib = library(question())
        lib["concepts"]["test"]["microSkillBridgePools"] = {"skill": ["missing"]}
        with self.assertRaisesRegex(export.ValidationError, "Dangling question reference"):
            self.audit(lib)

    def test_csv_roundtrip_all_choices_and_nested_metadata(self):
        q = question(options=["a", "b", "c", "d", "e"], a=4, scenario={"rule": "Keep, exactly", "bounds": [1, 2]})
        records, _ = self.audit(library(q))
        rows = export.make_rows(records, export.ROOT)
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "test.csv"
            export.csv_export(path, rows)
            self.assertTrue(path.read_bytes().startswith(b"\xef\xbb\xbf"))
            with path.open(encoding="utf-8-sig", newline="") as handle:
                actual = next(csv.DictReader(handle))
        self.assertEqual(actual["question_text"], q["q"])
        self.assertEqual(actual["option_e"], "e")
        self.assertEqual(actual["metadata.scenario.rule"], "Keep, exactly")
        self.assertEqual(actual["metadata.scenario.bounds"], "1; 2")
        self.assertEqual(actual["correct_answer_letter"], "E")

    def test_sort_and_literal_economic_comparison(self):
        self.assertLess(export.natural("LO2.9"), export.natural("LO2.10"))
        self.assertEqual(export.visible_text("P<ATC and Q>0"), "P<ATC and Q>0")

    def test_missing_image_uses_only_verified_own_concept_asset(self):
        with tempfile.TemporaryDirectory() as tmp:
            data = Path(tmp).resolve()
            image = data / "own" / "graph.webp"
            image.parent.mkdir()
            image.write_bytes(b"test graph bytes")
            q = question(image="graph.webp", primaryConceptId="own")
            asset = {"filename": "graph.webp", "conceptId": "own", "runtimePath": "own/graph.webp", "sha256": hashlib.sha256(image.read_bytes()).hexdigest()}
            lib = {"concepts": {"own": {}}, "assetInventory": [asset]}
            self.assertEqual(export.resolve_image(q, data, lib), (image, "registered_concept_asset"))
            asset["sha256"] = "0" * 64
            self.assertEqual(export.resolve_image(q, data, lib), (None, "missing_or_ambiguous"))
            asset["conceptId"] = "another_concept"
            self.assertEqual(export.resolve_image(q, data, lib), (None, "missing_or_ambiguous"))

    def test_pdf_preserves_symbol_and_table_text(self):
        fonts = Path("C:/Windows/Fonts")
        if not (fonts / "seguisym.ttf").is_file():
            self.skipTest("Windows font set is not installed")
        q = question(q='<table><caption>Stored table</caption><tr><th>A</th><th>B</th></tr><tr><td>1</td><td>2</td></tr></table> Which stored option?', feedback="Stored preference symbol: A ≻ B.")
        records, _ = self.audit(library(q))
        rows = export.make_rows(records, export.ROOT)
        summary = dict(generated_at="2026-09-25", pools_represented=1, questions_with_images=0,
            missing_images=0, missing_feedback=0, missing_topic=0, missing_objective=0,
            duplicate_occurrences_merged=0, conflicting_ids=0, dynamic_generators=0)
        with tempfile.TemporaryDirectory() as tmp:
            pdf = Path(tmp) / "check.pdf"
            pages, count = export.build_pdf(pdf, rows, records, summary, fonts)
            self.assertIn("Q1", pages)
            export.verify_pdf(pdf, rows, records)


if __name__ == "__main__":
    unittest.main()
