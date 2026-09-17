import json
import tempfile
import unittest
from pathlib import Path

from scripts.school_directory.build_school_directory import (
    ROOT,
    build_records,
    fixture_paths,
    normalize_for_search,
    read_rows,
)


class SchoolDirectoryTests(unittest.TestCase):
    def test_normalization_strips_accents_and_punctuation(self):
        self.assertEqual(normalize_for_search("St. José's & Academy"), "st jose s and academy")

    def test_fixture_build_filters_and_dedupes(self):
        rows = {key: read_rows(path) for key, path in fixture_paths().items()}
        records = build_records(rows)

        names = {(record["name"], record["type"]) for record in records}
        self.assertIn(("Lincoln High School", "high-school"), names)
        self.assertIn(("Stanford University", "college"), names)
        self.assertNotIn(("Roosevelt Middle School", "high-school"), names)
        self.assertNotIn(("Happy Kids Academy", "high-school"), names)

        lincoln_entries = [record for record in records if record["name"] == "Lincoln High School" and record["city"] == "Portland"]
        self.assertEqual(len(lincoln_entries), 1)

    def test_generated_payload_has_required_fields(self):
        with tempfile.TemporaryDirectory() as tmp:
            output_path = Path(tmp) / "school-directory.json"
            rows = {key: read_rows(path) for key, path in fixture_paths().items()}
            payload = {
                "records": build_records(rows),
            }
            output_path.write_text(json.dumps(payload), encoding="utf-8")

            parsed = json.loads(output_path.read_text(encoding="utf-8"))
            records = parsed["records"]
            self.assertTrue(any(record["type"] == "high-school" for record in records))
            self.assertTrue(any(record["type"] == "college" for record in records))
            self.assertTrue(all(record.get("id") for record in records))


if __name__ == "__main__":
    unittest.main()
