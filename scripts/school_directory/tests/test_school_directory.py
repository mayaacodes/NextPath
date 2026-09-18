import json
import tempfile
import unittest
from unittest.mock import patch
from pathlib import Path

from scripts.school_directory.build_school_directory import (
    DEFAULT_SOURCES,
    build_records,
    build_integrity_report,
    download_to,
    emit_output,
    fixture_paths,
    normalize_for_search,
    read_rows,
)


ROOT = Path(__file__).resolve().parents[3]


def score(record, query):
    query_tokens = [token for token in query.split(" ") if token]
    search_text = record.get("searchText") or normalize_for_search(f"{record['name']} {record['city']} {record['state']}")
    name_search = normalize_for_search(record["name"])
    tokens = search_text.split(" ")
    if search_text == query:
        return 0
    if search_text.startswith(query):
        return 1
    if name_search.startswith(query):
        return 2
    if query_tokens and all(any(token.startswith(part) for token in tokens) for part in query_tokens):
        return 3
    if query in search_text:
        return 4
    if query_tokens and all(part in search_text for part in query_tokens):
        return 5
    return 999


def top_match(records, query):
    normalized_query = normalize_for_search(query)
    ranked = sorted(
        (record for record in records if score(record, normalized_query) < 999),
        key=lambda record: (score(record, normalized_query), record["name"], record["state"], record["city"]),
    )
    return ranked[0] if ranked else None


class SchoolDirectoryTests(unittest.TestCase):
    def test_normalization_strips_accents_and_punctuation(self):
        self.assertEqual(normalize_for_search("St. José's & Academy"), "st jose s and academy")

    def test_fixture_build_filters_and_dedupes(self):
        rows = {key: read_rows(path) for key, path in fixture_paths().items()}
        records = build_records(rows)

        names = {(record["name"], record["type"]) for record in records}
        self.assertIn(("Lincoln High School", "high-school"), names)
        self.assertIn(("Stanford University", "college"), names)
        self.assertIn(("Portland Community College", "college"), names)
        self.assertNotIn(("Roosevelt Middle School", "high-school"), names)
        self.assertNotIn(("Happy Kids Academy", "high-school"), names)
        self.assertNotIn(("Closed Career Institute", "college"), names)

        lincoln_entries = [record for record in records if record["name"] == "Lincoln High School" and record["city"] == "Portland"]
        self.assertEqual(len(lincoln_entries), 1)

    def test_ranking_prefers_prefix_and_token_matches(self):
        rows = {key: read_rows(path) for key, path in fixture_paths().items()}
        records = build_records(rows)

        self.assertEqual(top_match(records, "lincoln")["name"], "Lincoln High School")
        self.assertEqual(top_match(records, "stan")["name"], "Stanford University")
        self.assertEqual(top_match(records, "community college")["name"], "Monroe Community College")
        self.assertEqual(top_match(records, "portland or")["name"], "Lincoln High School")

    def test_generated_payload_has_required_fields(self):
        with tempfile.TemporaryDirectory() as tmp:
            output_path = Path(tmp) / "school-directory.json"
            rows = {key: read_rows(path) for key, path in fixture_paths().items()}
            emit_output(rows, output_path, retrieved_at="2026-09-17T00:00:00+00:00", fixture_mode=True)

            parsed = json.loads(output_path.read_text(encoding="utf-8"))
            self.assertIn("generatedAt", parsed)
            self.assertIn("retrievedAt", parsed)
            self.assertIn("coverage", parsed)
            self.assertEqual(parsed["directoryStatus"], "development-fixture")
            self.assertTrue(parsed["fixtureMode"])
            self.assertFalse(parsed["productionReady"])
            self.assertTrue(parsed.get("sources"))
            self.assertIn("integrity", parsed)
            self.assertEqual(
                {source["dataset"]: source["url"] for source in parsed["sources"]},
                {
                    "ccd-public": DEFAULT_SOURCES["public"]["url"],
                    "pss-private": DEFAULT_SOURCES["private"]["url"],
                    "ipeds-postsecondary": DEFAULT_SOURCES["college"]["url"],
                },
            )
            self.assertEqual(parsed["recordCounts"]["total"], len(parsed["records"]))
            records = parsed["records"]
            self.assertTrue(any(record["type"] == "high-school" for record in records))
            self.assertTrue(any(record["type"] == "college" for record in records))
            self.assertTrue(all(record.get("id") for record in records))
            self.assertFalse(parsed["integrity"]["productionReady"])
            self.assertGreater(parsed["integrity"]["sourceRowCounts"]["ccd-public"], 0)
            for record in records:
                self.assertTrue(record.get("city"))
                self.assertTrue(record.get("state"))
                self.assertTrue(record.get("searchText"))
                source = record.get("source")
                self.assertIsInstance(source, dict)
                self.assertTrue(source.get("dataset"))
                self.assertTrue(source.get("release"))
                self.assertTrue(source.get("url"))
                self.assertTrue(source.get("sourceId"))

    def test_integrity_report_marks_fixture_as_non_production(self):
        rows = {key: read_rows(path) for key, path in fixture_paths().items()}
        report = build_integrity_report(build_records(rows), fixture_mode=True)

        self.assertFalse(report["productionReady"])
        self.assertTrue(report["warnings"])
        self.assertIn("Development fixture only", report["warnings"][0])

    def test_non_fixture_build_refuses_incomplete_fixture_sized_output(self):
        with tempfile.TemporaryDirectory() as tmp:
            output_path = Path(tmp) / "school-directory.json"
            rows = {key: read_rows(path) for key, path in fixture_paths().items()}

            with self.assertRaises(SystemExit) as error:
                emit_output(rows, output_path, retrieved_at="2026-09-17T00:00:00+00:00", fixture_mode=False)

            self.assertIn("Refusing to write a non-production school directory", str(error.exception))
            self.assertFalse(output_path.exists())

    def test_integrity_report_rejects_unrecognized_state_codes(self):
        rows = {key: read_rows(path) for key, path in fixture_paths().items()}
        records = build_records(rows)
        records[0] = {**records[0], "state": "ZZ"}

        report = build_integrity_report(records, fixture_mode=True)

        self.assertIn("Unexpected state code 'ZZ'", report["failures"][0])

    def test_download_failure_explains_that_fixture_cannot_ship(self):
        with tempfile.TemporaryDirectory() as tmp:
            destination = Path(tmp) / "public.csv"
            with patch("scripts.school_directory.build_school_directory.urllib.request.urlretrieve", side_effect=OSError("dns failed")):
                with self.assertRaises(SystemExit) as error:
                    download_to("https://example.invalid/public.csv", destination)

            self.assertIn("Do not ship the checked-in fixture as the national directory", str(error.exception))

    def test_root_index_mirrors_docs_index(self):
        docs_index = (ROOT / "docs" / "index.html").read_text(encoding="utf-8")
        root_index = (ROOT / "index.html").read_text(encoding="utf-8")
        normalized_root = root_index.replace('href="docs/styles.css"', 'href="styles.css"').replace(
            'src="docs/script.js"', 'src="script.js"'
        )
        self.assertEqual(normalized_root, docs_index)

    def test_signup_ui_does_not_link_to_developer_school_directory_doc(self):
        docs_index = (ROOT / "docs" / "index.html").read_text(encoding="utf-8")
        self.assertNotIn("school-directory-data.md", docs_index)


if __name__ == "__main__":
    unittest.main()
