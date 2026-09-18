#!/usr/bin/env python3
"""Lightweight validation for generated school directory payload and match behavior."""

from __future__ import annotations

import argparse
import json
import re
import unicodedata
from pathlib import Path

ROOT = Path(__file__).resolve().parents[2]

from scripts.school_directory.build_school_directory import build_integrity_report

DIRECTORY_PATH = ROOT / "docs" / "data" / "school-directory.json"
SCRIPT_PATH = ROOT / "docs" / "script.js"
DOCS_INDEX_PATH = ROOT / "docs" / "index.html"
ROOT_INDEX_PATH = ROOT / "index.html"


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Validate generated school directory payload and signup UI messaging.")
    parser.add_argument("--directory", type=Path, default=DIRECTORY_PATH, help="Directory JSON path to validate")
    parser.add_argument(
        "--require-production-ready",
        action="store_true",
        help="Fail unless the payload is explicitly marked productionReady and passes nationwide integrity checks.",
    )
    return parser.parse_args()


def normalize(text: str) -> str:
    text = "".join(ch for ch in unicodedata.normalize("NFKD", text) if not unicodedata.combining(ch))
    text = text.lower()
    text = re.sub(r"[&@]", " and ", text)
    text = re.sub(r"[^a-z0-9]+", " ", text)
    return re.sub(r"\s+", " ", text).strip()


def score(record: dict[str, str], query: str) -> int:
    query_tokens = [token for token in query.split(" ") if token]
    search = normalize(record.get("searchText") or f"{record['name']} {record['city']} {record['state']}")
    name = normalize(record["name"])
    tokens = search.split(" ")
    if search == query:
        return 0
    if search.startswith(query):
        return 1
    if name.startswith(query):
        return 2
    if query_tokens and all(any(token.startswith(q) for token in tokens) for q in query_tokens):
        return 3
    if query in search:
        return 4
    if query_tokens and all(q in search for q in query_tokens):
        return 5
    return 999


def expect_match(records: list[dict[str, str]], query: str, expected_name_fragment: str) -> None:
    normalized_query = normalize(query)
    ranked = sorted(
        (
            (score(record, normalized_query), record)
            for record in records
            if score(record, normalized_query) < 999
        ),
        key=lambda item: (item[0], item[1]["name"], item[1]["state"], item[1]["city"]),
    )
    if not ranked:
        raise AssertionError(f"No matches found for query '{query}'")
    if expected_name_fragment.lower() not in ranked[0][1]["name"].lower():
        raise AssertionError(f"Top match for '{query}' was '{ranked[0][1]['name']}', expected fragment '{expected_name_fragment}'")


def main() -> None:
    args = parse_args()
    payload = json.loads(args.directory.read_text(encoding="utf-8"))
    records = payload.get("records", [])
    if not records:
        raise AssertionError("Generated directory has no records")

    if not any(record.get("type") == "high-school" for record in records):
        raise AssertionError("No high-school records present")
    if not any(record.get("type") == "college" for record in records):
        raise AssertionError("No college records present")
    if any(not record.get("id") for record in records):
        raise AssertionError("Found records with empty id")

    expect_match(records, "lincoln", "Lincoln")
    expect_match(records, "stan", "Stanford")
    expect_match(records, "community college", "Community College")
    expect_match(records, "portland or", "Lincoln")

    record_counts = payload.get("recordCounts") or {}
    if record_counts.get("total") != len(records):
        raise AssertionError("recordCounts.total does not match records length")
    integrity = build_integrity_report(records, fixture_mode=payload.get("fixtureMode") is True)
    if payload.get("integrity", {}).get("sourceRecordCounts") and payload["integrity"]["sourceRecordCounts"] != integrity["sourceRecordCounts"]:
        raise AssertionError("integrity.sourceRecordCounts does not match the computed directory contents")
    if payload.get("productionReady") is True and payload.get("fixtureMode") is True:
        raise AssertionError("Fixture payload cannot be productionReady")
    if payload.get("fixtureMode") is True and payload.get("directoryStatus") != "development-fixture":
        raise AssertionError("Fixture payload must set directoryStatus=development-fixture")
    if payload.get("fixtureMode") is True and "not the complete u.s. directory" not in str(payload.get("coverage", "")).lower():
        raise AssertionError("Fixture payload must clearly disclose that it is not the complete U.S. directory")
    if payload.get("productionReady") is True and payload.get("directoryStatus") != "authoritative-national":
        raise AssertionError("Production-ready payload must set directoryStatus=authoritative-national")
    if args.require_production_ready:
        if payload.get("productionReady") is not True:
            raise AssertionError("Production validation requires productionReady=true")
        if integrity["productionReady"] is not True:
            raise AssertionError("Production validation failed integrity checks: " + "; ".join(integrity["failures"]))

    script_text = SCRIPT_PATH.read_text(encoding="utf-8")
    if "School directory unavailable right now. Type your school manually below." not in script_text:
        raise AssertionError("Missing manual fallback message for unavailable directory asset")
    if "Development preview directory loaded" not in script_text:
        raise AssertionError("Missing preview-directory status message for fixture-limited assets")
    if "School directory suggestions are only partially available right now." not in script_text:
        raise AssertionError("Missing partial-directory status message for non-production payloads")
    if "Official U.S. school directory loaded" not in script_text:
        raise AssertionError("Missing authoritative-directory success status message")

    docs_index = DOCS_INDEX_PATH.read_text(encoding="utf-8")
    if "school-directory-data.md" in docs_index:
        raise AssertionError("docs/index.html should not link end users to developer-facing school-directory documentation")

    normalized_root_index = (
        ROOT_INDEX_PATH.read_text(encoding="utf-8")
        .replace('href="docs/styles.css"', 'href="styles.css"')
        .replace('src="docs/script.js"', 'src="script.js"')
    )
    if normalized_root_index != docs_index:
        raise AssertionError("Root index.html is out of sync with docs/index.html")

    print("School directory validation passed")


if __name__ == "__main__":
    main()
