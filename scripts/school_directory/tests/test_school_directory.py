import json
import tempfile
import unittest
from pathlib import Path

from scripts.school_directory.build_school_directory import (
    build_records,
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
            self.assertTrue(parsed["fixtureMode"])
            self.assertTrue(parsed.get("sources"))
            self.assertEqual(parsed["recordCounts"]["total"], len(parsed["records"]))
            records = parsed["records"]
            self.assertTrue(any(record["type"] == "high-school" for record in records))
            self.assertTrue(any(record["type"] == "college" for record in records))
            self.assertTrue(all(record.get("id") for record in records))
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

    def test_root_index_mirrors_docs_index(self):
        docs_index = (ROOT / "docs" / "index.html").read_text(encoding="utf-8")
        root_index = (ROOT / "index.html").read_text(encoding="utf-8")
        normalized_root = root_index.replace('href="docs/styles.css"', 'href="styles.css"').replace(
            'src="docs/script.js"', 'src="script.js"'
        ).replace('href="docs/school-directory-data.md"', 'href="school-directory-data.md"')
        self.assertEqual(normalized_root, docs_index)


if __name__ == "__main__":
    unittest.main()
