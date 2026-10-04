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
        export.resolve_faculty_outcomes(records, export.ROOT, shutil.which("node"), lib)
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

    def test_csv_roundtrip_all_choices_with_nested_metadata_hidden(self):
        q = question(options=["a", "b", "c", "d", "e"], a=4, scenario={"rule": "Keep, exactly", "bounds": [1, 2]})
        records, _ = self.audit(library(q))
        rows = export.make_rows(records, export.ROOT)
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "test.csv"
            export.csv_export(path, rows)
            self.assertTrue(path.read_bytes().startswith(b"\xef\xbb\xbf"))
            with path.open(encoding="utf-8-sig", newline="") as handle:
                actual = next(csv.DictReader(handle))
        self.assertEqual(actual["Question"], q["q"])
        self.assertEqual(actual["Choice E"], "e")
        self.assertNotIn("metadata.scenario.rule", actual)
        self.assertNotIn("Keep, exactly", str(actual))
        self.assertEqual(q['scenario'], {"rule": "Keep, exactly", "bounds": [1, 2]})
        self.assertEqual(actual["Correct Answer"], "E — e")
        self.assertEqual(list(actual), export.faculty_columns(rows))

    def test_faculty_header_formats_only_approved_metadata(self):
        q = question(tag="moral-hazard", objective="IBP.3", difficulty="legendaryBoss",
            canonicalDifficulty="legendary", type="integration", primarySkill='analyze_moral_hazard',
            commonError="confuses_observation_with_enforceable_incentives")
        lib = library(q)
        lib['concepts']['test']['objectiveLabels'] = {'IBP.3': 'Moral Hazard'}
        lib['concepts']['information-asymmetry-behavioral-and-political-economy'] = lib['concepts'].pop('test')
        before = copy.deepcopy(lib)
        records, _ = self.audit(lib)
        row = export.make_rows(records, export.ROOT)[0]
        self.assertEqual([(name, row[key]) for name, key in export.FACULTY_METADATA], [
            ('Topic', 'Moral Hazard'), ('Learning Objective', 'Analyze asymmetric information, incentives, and information remedies'),
            ('Difficulty', 'Legendary'), ('Question Type', 'Integration'),
            ('Common Misconception', 'Confuses observation with enforceable incentives')])
        self.assertNotIn('IBP.3', row['learning_objective'])
        self.assertEqual(export.faculty_misconception('internal_route_v3'), '')
        self.assertEqual(export.faculty_misconception('Confuses a shift with movement along a curve'),
            'Confuses a shift with movement along a curve')
        self.assertEqual(export.display_label('graph_interpretation'), 'Graph Interpretation')
        self.assertEqual(export.display_topic('real-gdp'), 'Real GDP')
        self.assertEqual(lib, before)

    def test_unknown_provenance_is_absent_from_pdf_and_csv(self):
        import pypdfium2 as pdfium
        q = question(id='42941', tag='moral-hazard', objective='IBP.3', difficulty='legendary', type='integration',
            primarySkill='analyze_moral_hazard',
            internal_test_provenance='should-never-appear', sourceChapter=6,
            sourceCurationPhase='phase-test-hidden', sourceGame='information-behavioral-political-authoring',
            sourcePool='legendaryBoss', originalSourcePool='legendaryBoss', originalBossTier='legendary',
            canonicalDifficulty='legendary', familyConceptId='hidden-family-id', primaryConceptId='hidden-primary-id',
            instructionalRole='main', futureMetadata={'arbitraryNewKey':'unknown-value-must-stay-hidden'})
        lib = library(q); lib['concepts']['test']['objectiveLabels'] = {'IBP.3':'Moral Hazard'}
        lib['concepts']['information-asymmetry-behavioral-and-political-economy'] = lib['concepts'].pop('test')
        before = copy.deepcopy(lib)
        records, _ = self.audit(lib); rows = export.make_rows(records, export.ROOT)
        # Even an unknown field added to a future internal row cannot become a column.
        rows[0]['future_row_metadata'] = 'row-value-must-stay-hidden'
        summary = dict(generated_at='2026-10-04', questions_with_images=0)
        with tempfile.TemporaryDirectory() as tmp:
            pdf, csv_path = Path(tmp)/'check.pdf', Path(tmp)/'check.csv'
            export.csv_export(csv_path, rows)
            export.build_pdf(pdf, rows, records, summary, Path('C:/Windows/Fonts'))
            export.verify_pdf(pdf, rows, records)
            with pdfium.PdfDocument(str(pdf)) as document:
                pdf_text = '\n'.join(page.get_textpage().get_text_range() for page in document)
            csv_text = csv_path.read_text(encoding='utf-8-sig')
        prohibited = ['Source Chapter','Source Curation Phase','Source Game','Source Pools','Source File',
            'Original Source Pool','Original Boss Tier','canonical difficulty','family concept id','primary concept id',
            'instructional role','phase-','Additional Metadata','legendaryBoss','composer_library.js',
            'information-behavioral-political-authoring','internal_test_provenance','should-never-appear',
            'unknown-value-must-stay-hidden','row-value-must-stay-hidden']
        for text in [pdf_text, csv_text]:
            for bad in prohibited:self.assertNotIn(bad.lower(), text.lower())
        self.assertIn('Topic: Moral Hazard', pdf_text)
        self.assertIn('Learning Objective: Analyze asymmetric information', pdf_text)
        self.assertIn('Difficulty: Legendary', pdf_text)
        self.assertIn('Question Type: Integration', pdf_text)
        self.assertNotIn('Learning Objective Label:', pdf_text)
        self.assertEqual(lib, before)
        with tempfile.TemporaryDirectory() as tmp:
            with self.assertRaisesRegex(export.ValidationError, 'allowlist'):
                export.csv_export(Path(tmp)/'bad.csv', rows, ['Question ID','Source Game'])

    def test_sort_and_literal_economic_comparison(self):
        self.assertLess(export.natural("LO2.9"), export.natural("LO2.10"))
        self.assertEqual(export.visible_text("P<ATC and Q>0"), "P<ATC and Q>0")

    def test_composer_outcomes_use_all_skills_and_render_multiple_labels(self):
        import pypdfium2 as pdfium
        q = question(objective='LO4.2', primarySkill='law_of_demand',
            secondarySkills=['movement_vs_shift', 'law_of_demand', 'normal_good_income', 'demand_shifters'])
        lib = library(q); lib['concepts']['demand'] = lib['concepts'].pop('test')
        before = copy.deepcopy(lib)
        records, _ = self.audit(lib)
        resolved = records['Q1']['faculty_outcomes']
        self.assertEqual(resolved['labels'], [
            'Apply the law of demand and distinguish movements from shifts',
            'Analyze income effects, substitutes, and complements',
            'Analyze demand shifters and combined market effects'])
        self.assertEqual(resolved['unresolvedSkills'], [])
        self.assertEqual({s for o in resolved['outcomes'] for s in o['matchedSkills']}, set([q['primarySkill'], *q['secondarySkills']]))
        rows = export.make_rows(records, export.ROOT)
        with tempfile.TemporaryDirectory() as tmp:
            pdf, csv_path = Path(tmp)/'multiple.pdf', Path(tmp)/'multiple.csv'
            export.csv_export(csv_path, rows)
            export.build_pdf(pdf, rows, records, dict(generated_at='2026-10-04',questions_with_images=0), Path('C:/Windows/Fonts'))
            export.verify_pdf(pdf, rows, records)
            with pdfium.PdfDocument(str(pdf)) as doc:
                text = '\n'.join(p.get_textpage().get_text_range() for p in doc)
            with csv_path.open(encoding='utf-8-sig',newline='') as handle:
                row = next(csv.DictReader(handle))
        self.assertIn('Learning Objectives:',text)
        self.assertNotIn('LO4.2',text)
        self.assertNotIn('Test objective',text)
        self.assertEqual(row['Learning Objective'], ' | '.join(resolved['labels']))
        self.assertEqual(export.outcome_counts(records)['multiple_outcomes'], 1)
        self.assertEqual(lib,before)

    def test_unresolved_outcomes_never_use_legacy_or_unrelated_concept_fallback(self):
        for skills in [{}, {'primarySkill':'unrecognized_skill'}, {'primarySkill':'law_of_demand'}]:
            q = question(objective='LO1.5', **skills)
            lib=library(q)
            records,_=self.audit(lib)
            row=export.make_rows(records,export.ROOT)[0]
            self.assertEqual(row['learning_objective'],'')
            self.assertEqual(export.outcome_counts(records)['unresolved_ids'], ['Q1'])
        for text in ['Learning Objective: LO1.5','LO4.2','LO6.3']:
            with self.assertRaisesRegex(export.ValidationError,'Legacy objective'):
                export.assert_faculty_presentation(text)

    def test_secondary_only_skills_deduplicate_and_keep_partial_resolution_evidence(self):
        q=question(secondarySkills=['law_of_demand','movement_vs_shift','unknown_skill'])
        lib=library(q); lib['concepts']['demand']=lib['concepts'].pop('test')
        records,_=self.audit(lib)
        resolved=records['Q1']['faculty_outcomes']
        self.assertEqual(len(resolved['labels']),1)
        self.assertEqual(resolved['unresolvedSkills'],['unknown_skill'])
        self.assertEqual(export.outcome_counts(records)['unresolved_skill_ids'], {'Q1':['unknown_skill']})

    def test_composer_hidden_compatibility_labels_are_not_faculty_outcomes(self):
        q=question(primarySkill='core_market_failure',objective='LO1.6')
        lib=library(q);lib['concepts']['market-failures']=lib['concepts'].pop('test')
        records,_=self.audit(lib)
        resolved=records['Q1']['faculty_outcomes']
        self.assertEqual(resolved['labels'],[])
        self.assertEqual(resolved['excludedConceptIds'],['market-failures'])
        self.assertEqual(resolved['unresolvedSkills'],['core_market_failure'])

    def test_scoped_macro_integration_uses_existing_concept_migration(self):
        q=question(id='ECON-SP-ELITE-332',primarySkill='trace_demand_shock',secondarySkills=['move_along_srpc'],
            requiredConceptIds=['macroeconomic-equilibrium-and-shocks','short-run-phillips-curve'],
            challengeFocusConceptIds=['short-run-phillips-curve'])
        lib=library(q);lib['concepts']['integrated-macroeconomic-analysis']=lib['concepts'].pop('test')
        before=copy.deepcopy(lib);records,_=self.audit(lib)
        result=records[q['id']]['faculty_outcomes']
        self.assertEqual(len(result['labels']),2)
        self.assertEqual({o['conceptId'] for o in result['outcomes']},{'demand-and-supply-shocks','short-run-phillips-curve'})
        self.assertEqual({s for o in result['outcomes'] for s in o['matchedSkills']},{'trace_demand_shock','move_along_srpc'})
        self.assertTrue(all(o['conceptEvidence'] for o in result['outcomes']))
        self.assertEqual(lib,before)
        # Identical metadata on an ID outside the authorized 132 stays untouched.
        lib['concepts']['integrated-macroeconomic-analysis']['questions']['easy'][0]['id']='NOT-IN-CLOSURE'
        records,_=self.audit(lib)
        self.assertEqual(records['NOT-IN-CLOSURE']['faculty_outcomes']['labels'],[])

    def test_scoped_support_uses_only_unanimous_recorded_route_focus(self):
        q=question(id='ECON-SP-MAP-AD-AS-TO-PC-5061',primarySkill='map_ad_as_to_pc')
        module={'questions':{'easy':[q,question(id='peer-one',primarySkill='map_ad_as_to_pc',isCheckpointChallenge=True,challengeFocusConceptIds=['short-run-phillips-curve']),question(id='peer-two',primarySkill='map_ad_as_to_pc',isCheckpointChallenge=True,challengeFocusConceptIds=['short-run-phillips-curve'])]},'microSkillRepairPools':{'map_ad_as_to_pc':[q['id']]}}
        module['questions']['easy'][1]['secondarySkills']=['move_along_srpc']
        lib={'concepts':{'integrated-macroeconomic-analysis':module}}
        records,_=self.audit(lib);result=records[q['id']]['faculty_outcomes']
        self.assertEqual(result['closure']['resolutionBasis'],'explicit-route-unanimous-challenge-focus')
        self.assertEqual(result['labels'],[])
        self.assertEqual(result['closure']['focusResolution'][0]['status'],'no-narrower-skill-match')
        self.assertEqual({x['sourceQuestionId'] for x in result['closure']['sources']},{'peer-one','peer-two'})
        # A narrow recorded route skill can select an outcome; the focus alone cannot.
        for item in module['questions']['easy']:item['primarySkill']='move_along_srpc'
        module['microSkillRepairPools']={'move_along_srpc':[q['id']]}
        records,_=self.audit(lib)
        self.assertEqual(len(records[q['id']]['faculty_outcomes']['labels']),1)
        self.assertEqual(records[q['id']]['faculty_outcomes']['outcomes'][0]['matchedSkills'],['move_along_srpc'])
        module['questions']['easy'][2]['challengeFocusConceptIds']=['long-run-phillips-curve']
        records,_=self.audit(lib)
        self.assertEqual(records[q['id']]['faculty_outcomes']['labels'],[])

    def test_integration_focus_and_required_concepts_never_select_without_skill(self):
        q=question(id='ECON-SP-ELITE-332',primarySkill='integrated_macro_review',
            requiredConceptIds=['macroeconomic-equilibrium-and-shocks'],
            challengeFocusConceptIds=['short-run-phillips-curve'])
        lib=library(q);lib['concepts']['integrated-macroeconomic-analysis']=lib['concepts'].pop('test')
        records,_=self.audit(lib);result=records[q['id']]['faculty_outcomes']
        self.assertEqual(result['labels'],[])
        self.assertIn('short-run-phillips-curve',result['closure']['unresolvedConceptIds'])
        self.assertEqual(result['closure']['focusResolution'][0]['status'],'no-narrower-skill-match')

    def test_integration_preserves_all_skill_matches_only_inside_bounds(self):
        q=question(id='ECON-SP-ELITE-332',primarySkill='trace_demand_shock',
            secondarySkills=['trace_supply_shock','classify_output_gap','move_along_srpc','trace_demand_shock'],
            requiredConceptIds=['macroeconomic-equilibrium-and-shocks'],
            challengeFocusConceptIds=['macroeconomic-equilibrium-and-shocks'])
        lib=library(q);lib['concepts']['integrated-macroeconomic-analysis']=lib['concepts'].pop('test')
        records,_=self.audit(lib);result=records[q['id']]['faculty_outcomes']
        self.assertEqual(len(result['labels']),3)
        self.assertEqual({s for o in result['outcomes'] for s in o['matchedSkills']},{'trace_demand_shock','trace_supply_shock','classify_output_gap'})
        self.assertEqual(result['unresolvedSkills'],['move_along_srpc'])
        self.assertNotIn('short-run-phillips-curve',result['closure']['eligibleConceptIds'])

    def test_scoped_market_failure_requires_unambiguous_policy_skill_evidence(self):
        q=question(id='ECON-MG-EASY-15',primarySkill='market_failure_identification',secondarySkills=['externality_identification'])
        lib=library(q);lib['concepts']['market-failures']=lib['concepts'].pop('test')
        records,_=self.audit(lib)
        result=records[q['id']]['faculty_outcomes']
        self.assertEqual([o['id'] for o in result['outcomes']],['externalities-external-effects'])
        self.assertEqual(result['outcomes'][0]['matchedSkills'],['externality_identification'])
        q['primarySkill']='intervention_limits';q['secondarySkills']=[]
        records,_=self.audit(lib);result=records[q['id']]['faculty_outcomes']
        self.assertEqual(result['labels'],[])
        self.assertGreater(len(result['closure']['ambiguousSkills'][0]['candidateOutcomeIds']),1)

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


    def test_shared_questions_are_retained_in_each_discipline(self):
        records, _ = self.audit(library(question()))
        groups = export.partition_disciplines(records, {"test": {"areas": ["general", "micro", "macro"]}})
        for area, (label, _) in export.DISCIPLINES.items():
            self.assertEqual(set(groups[area]), {"Q1"})
            row = export.make_rows(groups[area], export.ROOT)[0]
            self.assertEqual(row["discipline"], label)
            self.assertEqual(row["question_text"], question()["q"])

    def test_unmapped_discipline_is_an_error(self):
        records, _ = self.audit(library(question()))
        with self.assertRaisesRegex(export.ValidationError, "Q1: ambiguous/unmapped"):
            export.partition_disciplines(records, {})

    def test_derived_area_membership_does_not_include_entire_parent(self):
        lib = library(question())
        lib["concepts"]["test"]["questions"]["easy"].append(question(id="Q2"))
        records, _ = self.audit(lib)
        records["Q1"]["pools"].add("derived/shared_child/questions/easy")
        groups = export.partition_disciplines(records, {
            "test": {"areas": ["micro"]}, "shared_child": {"areas": ["general", "macro"]}})
        self.assertEqual(set(groups["micro"]), {"Q1", "Q2"})
        for area in ["general", "macro"]:
            self.assertEqual(set(groups[area]), {"Q1"})
            self.assertEqual(groups[area]["Q1"]["pools"], {"derived/shared_child/questions/easy"})

    def test_image_resize_caps_resolution_and_preserves_original(self):
        from PIL import Image
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / "graph.png"
            Image.new("RGB", (2400, 1200), "white").save(path)
            before = path.read_bytes()
            data, width, height, info = export.optimized_graph(path, 480, 260)
            self.assertEqual(info["target_dpi"], 180)
            self.assertEqual(info["palette_colors"], 256)
            self.assertEqual(info["embedded_pixels"], [1200, 600])
            self.assertEqual(width / height, 2)
            self.assertTrue(data.startswith(b"\x89PNG\r\n\x1a\n"))
            self.assertEqual(path.read_bytes(), before)


if __name__ == "__main__":
    unittest.main()
