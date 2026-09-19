#!/usr/bin/env python3
"""Build browser school directory from official NCES datasets.

This script supports two modes:
1) Download official NCES files from configured URLs (`--download`).
2) Read already-downloaded local CSV/ZIP files.

When network access is unavailable, run tests with fixtures in
`scripts/school_directory/fixtures/`.
"""

from __future__ import annotations

import argparse
import csv
import io
import json
import re
import unicodedata
import urllib.request
import zipfile
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from tempfile import TemporaryDirectory
from typing import Callable, Iterable

ROOT = Path(__file__).resolve().parents[2]
DEFAULT_OUTPUT = ROOT / "docs" / "data" / "school-directory.json"

DEFAULT_SOURCES = {
    "public": {
        "url": "https://nces.ed.gov/programs/edge/data/EDGE_GEOCODE_PUBLICSCH_2425.zip",
        "dataset": "NCES CCD Public School Locations",
        "release": "2024-25",
    },
    "private": {
        "url": "https://data-nces.opendata.arcgis.com/datasets/nces::private-school-locations-2023-24.csv",
        "dataset": "NCES PSS Private School Locations",
        "release": "2023-24",
    },
    "college": {
        "url": "https://ncesedgis.maps.arcgis.com/sharing/rest/content/items/c09067e617894cbca0798c53967c795b/data",
        "dataset": "NCES Postsecondary School Locations",
        "release": "2024-25",
    },
}

REQUIRED_STATE_CODES = {
    "AL", "AK", "AZ", "AR", "CA", "CO", "CT", "DE", "FL", "GA",
    "HI", "ID", "IL", "IN", "IA", "KS", "KY", "LA", "ME", "MD",
    "MA", "MI", "MN", "MS", "MO", "MT", "NE", "NV", "NH", "NJ",
    "NM", "NY", "NC", "ND", "OH", "OK", "OR", "PA", "RI", "SC",
    "SD", "TN", "TX", "UT", "VT", "VA", "WA", "WV", "WI", "WY",
    "DC",
}
ALLOWED_STATE_CODES = REQUIRED_STATE_CODES | {"AS", "FM", "GU", "MH", "MP", "PR", "PW", "VI", "AA", "AE", "AP"}
MINIMUM_RECORD_COUNTS = {
    "highSchools": 20000,
    "colleges": 5000,
    "total": 26000,
}

HIGH_SCHOOL_SUFFIXES = {
    "high school",
    "secondary school",
    "preparatory school",
    "prep school",
    "collegiate",
    "christian school",
    "charter school",
}

LEGAL_SUFFIXES = {
    "inc",
    "incorporated",
    "llc",
    "ltd",
    "limited",
    "co",
    "company",
    "corp",
    "corporation",
    "university",
    "college",
    "school",
}


def normalize_space(value: str) -> str:
    return re.sub(r"\s+", " ", value or "").strip()


def strip_accents(value: str) -> str:
    return "".join(ch for ch in unicodedata.normalize("NFKD", value) if not unicodedata.combining(ch))


def normalize_for_search(value: str) -> str:
    value = strip_accents(value)
    value = value.lower()
    value = re.sub(r"[&@]", " and ", value)
    value = re.sub(r"[^a-z0-9]+", " ", value)
    return normalize_space(value)


def canonical_name(value: str) -> str:
    tokens = normalize_for_search(value).split()
    while tokens and tokens[-1] in LEGAL_SUFFIXES:
        tokens.pop()
    return " ".join(tokens)


def grade_number(value: str) -> int:
    cleaned = normalize_for_search(value)
    if not cleaned:
        return -1
    if cleaned in {"pk", "k", "kg", "kindergarten"}:
        return 0
    if cleaned.startswith("0") and cleaned[1:].isdigit():
        return int(cleaned)
    if cleaned.isdigit():
        return int(cleaned)
    return -1


def pick_field(row: dict[str, str], names: Iterable[str]) -> str:
    for name in names:
        if name in row and normalize_space(str(row[name])):
            return normalize_space(str(row[name]))
    return ""


def is_high_school_public(row: dict[str, str]) -> bool:
    high_grade = grade_number(pick_field(row, ["GSHI", "HIGH_GRADE", "GSHI", "HIGHGRADE"]))
    if high_grade >= 9:
        return True
    school_name = normalize_for_search(pick_field(row, ["SCH_NAME", "SCHOOL_NAME", "NAME"]))
    return any(school_name.endswith(suffix) or f" {suffix} " in f" {school_name} " for suffix in HIGH_SCHOOL_SUFFIXES)


def is_high_school_private(row: dict[str, str]) -> bool:
    level = normalize_for_search(pick_field(row, ["LEVEL", "LEVEL_", "SCHOOL_LEVEL", "LEVEL_NAME"]))
    if any(token in level for token in ("secondary", "high")):
        return True
    high_grade = grade_number(pick_field(row, ["G_HIGH", "HIGH_GRADE", "GSHI", "HIGHGRADE"]))
    if high_grade >= 9:
        return True
    school_name = normalize_for_search(pick_field(row, ["NAME", "SCHOOL_NAME", "SCH_NAME"]))
    return any(school_name.endswith(suffix) or f" {suffix} " in f" {school_name} " for suffix in HIGH_SCHOOL_SUFFIXES)


def is_valid_postsecondary(row: dict[str, str]) -> bool:
    institution_name = normalize_for_search(pick_field(row, ["INSTNM", "NAME", "INSTITUTION"]))
    if not institution_name:
        return False

    status = normalize_for_search(
        pick_field(
            row,
            (
                "STATUS",
                "OPERATING_STATUS",
                "OPERSTAT",
                "INSTSTAT",
                "OPENSTAT",
                "ACT",
                "ACTIVE",
            ),
        )
    )
    if status and any(token in status for token in ("closed", "inactive", "not open", "ceased")):
        return False
    if status in {"0", "false", "n", "no"}:
        return False

    return True


@dataclass
class SourceSpec:
    key: str
    institution_type: str
    source_label: str
    url: str
    release: str
    id_fields: tuple[str, ...]
    name_fields: tuple[str, ...]
    city_fields: tuple[str, ...]
    state_fields: tuple[str, ...]
    include_row: Callable[[dict[str, str]], bool]


SPECS = [
    SourceSpec(
        key="public",
        institution_type="high-school",
        source_label="ccd-public",
        url=DEFAULT_SOURCES["public"]["url"],
        release=DEFAULT_SOURCES["public"]["release"],
        id_fields=("NCESSCH", "LEAID", "OBJECTID"),
        name_fields=("SCH_NAME", "SCHOOL_NAME", "NAME"),
        city_fields=("LCITY", "CITY", "SCH_CITY"),
        state_fields=("LSTATE", "STATE", "STABBR"),
        include_row=is_high_school_public,
    ),
    SourceSpec(
        key="private",
        institution_type="high-school",
        source_label="pss-private",
        url=DEFAULT_SOURCES["private"]["url"],
        release=DEFAULT_SOURCES["private"]["release"],
        id_fields=("PPIN", "PSS_SCHOOL_ID", "NCESSCH", "OBJECTID"),
        name_fields=("NAME", "SCHOOL_NAME", "SCH_NAME"),
        city_fields=("CITY", "LCITY"),
        state_fields=("STABBR", "STATE", "LSTATE"),
        include_row=is_high_school_private,
    ),
    SourceSpec(
        key="college",
        institution_type="college",
        source_label="ipeds-postsecondary",
        url=DEFAULT_SOURCES["college"]["url"],
        release=DEFAULT_SOURCES["college"]["release"],
        id_fields=("UNITID", "IPEDS_ID", "OBJECTID"),
        name_fields=("INSTNM", "NAME", "INSTITUTION"),
        city_fields=("CITY", "LCITY"),
        state_fields=("STABBR", "STATE", "LSTATE"),
        include_row=is_valid_postsecondary,
    ),
]


def read_rows(path: Path) -> list[dict[str, str]]:
    if path.suffix.lower() == ".zip":
        with zipfile.ZipFile(path) as archive:
            csv_candidates = [name for name in archive.namelist() if name.lower().endswith(".csv")]
            if not csv_candidates:
                raise ValueError(f"No CSV found inside archive: {path}")
            chosen = sorted(csv_candidates)[0]
            with archive.open(chosen) as handle:
                text = io.TextIOWrapper(handle, encoding="utf-8-sig", newline="")
                return list(csv.DictReader(text))

    with path.open("r", encoding="utf-8-sig", newline="") as handle:
        return list(csv.DictReader(handle))


def download_to(url: str, destination: Path) -> Path:
    destination.parent.mkdir(parents=True, exist_ok=True)
    try:
        urllib.request.urlretrieve(url, destination)
    except Exception as exc:  # pragma: no cover - exercised in networked environments
        raise SystemExit(
            f"Failed to download required official school-directory source: {url}\n"
            "Do not ship the checked-in fixture as the national directory. Retry in a network-enabled environment "
            "or provide already-downloaded official source files with --public-file/--private-file/--college-file."
        ) from exc
    return destination


def build_records(source_rows: dict[str, list[dict[str, str]]]) -> list[dict[str, object]]:
    records: list[dict[str, object]] = []
    seen: set[tuple[str, str, str, str]] = set()

    for spec in SPECS:
        for row in source_rows[spec.key]:
            if not spec.include_row(row):
                continue

            source_id = pick_field(row, spec.id_fields)
            name = pick_field(row, spec.name_fields)
            city = pick_field(row, spec.city_fields)
            state = pick_field(row, spec.state_fields).upper()

            if not source_id or not name or not city or not state:
                continue

            search_text = normalize_for_search(f"{name} {city} {state}")
            dedupe_key = (spec.institution_type, canonical_name(name), normalize_for_search(city), state)
            if dedupe_key in seen:
                continue
            seen.add(dedupe_key)

            records.append(
                {
                    "id": f"{spec.source_label}:{source_id}",
                    "name": normalize_space(name),
                    "type": spec.institution_type,
                    "city": normalize_space(city),
                    "state": state,
                    "searchText": search_text,
                    "source": {
                        "dataset": spec.source_label,
                        "release": spec.release,
                        "url": spec.url,
                        "sourceId": source_id,
                    },
                }
            )

    records.sort(key=lambda item: (item["name"], item["city"], item["state"]))
    return records


def build_integrity_report(
    records: list[dict[str, object]],
    fixture_mode: bool,
    source_row_counts: dict[str, int] | None = None,
) -> dict[str, object]:
    type_counts = {"highSchools": 0, "colleges": 0}
    states_by_type = {"high-school": set(), "college": set()}
    source_counts = {spec.source_label: 0 for spec in SPECS}
    parsed_source_counts = {spec.source_label: int((source_row_counts or {}).get(spec.source_label, 0)) for spec in SPECS}
    failures: list[str] = []
    warnings: list[str] = []

    for record in records:
        missing_fields = [field for field in ("id", "name", "type", "city", "state", "searchText") if not record.get(field)]
        if missing_fields:
            failures.append(f"Record missing required fields ({', '.join(missing_fields)}): {record!r}")
            continue

        record_type = str(record["type"])
        state = str(record["state"]).upper()
        source = record.get("source") if isinstance(record.get("source"), dict) else {}
        dataset = str(source.get("dataset") or "")

        if record_type == "high-school":
            type_counts["highSchools"] += 1
        elif record_type == "college":
            type_counts["colleges"] += 1
        else:
            failures.append(f"Unexpected school type '{record_type}' for record {record['id']}")
            continue

        if state not in ALLOWED_STATE_CODES:
            failures.append(f"Unexpected state code '{state}' for record {record['id']}")
            continue

        states_by_type[record_type].add(state)
        if dataset in source_counts:
            source_counts[dataset] += 1

    type_counts["total"] = len(records)
    high_school_states = states_by_type["high-school"]
    college_states = states_by_type["college"]
    missing_high_school_states = sorted(REQUIRED_STATE_CODES - high_school_states)
    missing_college_states = sorted(REQUIRED_STATE_CODES - college_states)

    if fixture_mode:
        warnings.append("Development fixture only; production-ready nationwide coverage checks were skipped.")
    else:
        if type_counts["highSchools"] < MINIMUM_RECORD_COUNTS["highSchools"]:
            failures.append(
                f"High-school coverage is too small for a nationwide directory ({type_counts['highSchools']} < {MINIMUM_RECORD_COUNTS['highSchools']})."
            )
        if type_counts["colleges"] < MINIMUM_RECORD_COUNTS["colleges"]:
            failures.append(
                f"College coverage is too small for a nationwide directory ({type_counts['colleges']} < {MINIMUM_RECORD_COUNTS['colleges']})."
            )
        if type_counts["total"] < MINIMUM_RECORD_COUNTS["total"]:
            failures.append(
                f"Total coverage is too small for a nationwide directory ({type_counts['total']} < {MINIMUM_RECORD_COUNTS['total']})."
            )
        if missing_high_school_states:
            failures.append(
                "High-school coverage is missing state or DC records for: " + ", ".join(missing_high_school_states)
            )
        if missing_college_states:
            failures.append(
                "College coverage is missing state or DC records for: " + ", ".join(missing_college_states)
            )
        for spec in SPECS:
            if parsed_source_counts[spec.source_label] <= 0:
                failures.append(f"Required source dataset '{spec.source_label}' was not successfully parsed.")
            if source_counts[spec.source_label] <= 0:
                failures.append(
                    f"Required source dataset '{spec.source_label}' contributed no emitted directory records after filtering."
                )

    return {
        "productionReady": not fixture_mode and not failures,
        "requiredFieldsValidated": not any(message.startswith("Record missing required fields") for message in failures),
        "minimumRecordCounts": MINIMUM_RECORD_COUNTS,
        "requiredStateCoverage": sorted(REQUIRED_STATE_CODES),
        "recordCounts": type_counts,
        "stateCoverage": {
            "highSchools": sorted(high_school_states),
            "colleges": sorted(college_states),
        },
        "sourceRowCounts": parsed_source_counts,
        "sourceRecordCounts": source_counts,
        "failures": failures,
        "warnings": warnings,
    }


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Generate school directory asset from NCES sources.")
    parser.add_argument("--output", type=Path, default=DEFAULT_OUTPUT, help="Output JSON path")
    parser.add_argument("--download", action="store_true", help="Download source files from official URLs")
    parser.add_argument("--public-file", type=Path, help="Local public-school source CSV/ZIP")
    parser.add_argument("--private-file", type=Path, help="Local private-school source CSV/ZIP")
    parser.add_argument("--college-file", type=Path, help="Local postsecondary source CSV/ZIP")
    parser.add_argument("--fixtures", action="store_true", help="Use local test fixtures")
    return parser.parse_args()


def fixture_paths() -> dict[str, Path]:
    fixtures_dir = ROOT / "scripts" / "school_directory" / "fixtures"
    return {
        "public": fixtures_dir / "public_school_locations_fixture.csv",
        "private": fixtures_dir / "private_school_locations_fixture.csv",
        "college": fixtures_dir / "postsecondary_school_locations_fixture.csv",
    }


def resolve_inputs(args: argparse.Namespace) -> dict[str, Path]:
    if args.fixtures:
        return fixture_paths()

    provided = {
        "public": args.public_file,
        "private": args.private_file,
        "college": args.college_file,
    }

    missing = [key for key, value in provided.items() if value is None]
    if missing:
        joined = ", ".join(missing)
        raise SystemExit(f"Missing required inputs: {joined}. Provide files or use --download/--fixtures.")

    return {key: path.resolve() for key, path in provided.items()}


def emit_output(
    source_rows: dict[str, list[dict[str, str]]],
    output_path: Path,
    retrieved_at: str | None = None,
    fixture_mode: bool = False,
) -> dict[str, Path]:
    records = build_records(source_rows)
    high_school_count = sum(1 for record in records if record["type"] == "high-school")
    college_count = sum(1 for record in records if record["type"] == "college")
    integrity = build_integrity_report(
        records,
        fixture_mode=fixture_mode,
        source_row_counts={spec.source_label: len(source_rows[spec.key]) for spec in SPECS},
    )
    production_ready = bool(integrity["productionReady"])
    payload = {
        "generatedAt": datetime.now(timezone.utc).isoformat(),
        "coverage": (
            "Development fixture only. This file is not the complete U.S. directory; use manual entry or run the documented NCES/IPEDS refresh for authoritative coverage."
            if fixture_mode
            else (
                "Authoritative nationwide directory generated from current official NCES EDGE/IPEDS source files."
                if production_ready
                else "Official-source directory build is incomplete, so this file must not be presented as the full U.S. directory."
            )
        ),
        "directoryStatus": (
            "development-fixture"
            if fixture_mode
            else ("authoritative-national" if production_ready else "limited-official")
        ),
        "fixtureMode": fixture_mode,
        "productionReady": production_ready,
        "sources": [
            {
                "dataset": spec.source_label,
                "release": spec.release,
                "url": spec.url,
            }
            for spec in SPECS
        ],
        "recordCounts": {
            "total": len(records),
            "highSchools": high_school_count,
            "colleges": college_count,
        },
        "integrity": integrity,
        "records": records,
    }
    if retrieved_at:
        payload["retrievedAt"] = retrieved_at

    if not fixture_mode and not production_ready:
        failures = "\n- ".join(str(message) for message in integrity["failures"])
        raise SystemExit(
            "Refusing to write a non-production school directory because integrity checks failed:\n- " + failures
        )

    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(payload, ensure_ascii=False, separators=(",", ":")), encoding="utf-8")
    print(f"Wrote {len(records)} records to {output_path}")

    return {"output": output_path.resolve()}


def main() -> None:
    args = parse_args()

    if args.download:
        # Download mode is handled separately so temporary files are not persisted.
        with TemporaryDirectory(prefix="nextpath-school-data-") as temp_dir:
            temp = Path(temp_dir)
            downloaded_paths = {}
            for key in ("public", "private", "college"):
                url = DEFAULT_SOURCES[key]["url"]
                suffix = ".zip" if url.lower().endswith(".zip") else ".csv"
                downloaded_paths[key] = download_to(url, temp / f"{key}{suffix}")
            source_rows = {key: read_rows(path) for key, path in downloaded_paths.items()}
            emit_output(
                source_rows,
                args.output,
                retrieved_at=datetime.now(timezone.utc).isoformat(),
                fixture_mode=False,
            )
        return

    paths = resolve_inputs(args)
    source_rows = {key: read_rows(path) for key, path in paths.items()}
    latest_mtime = max(path.stat().st_mtime for path in paths.values())
    retrieved_at = datetime.fromtimestamp(latest_mtime, tz=timezone.utc).isoformat()
    emit_output(source_rows, args.output, retrieved_at=retrieved_at, fixture_mode=args.fixtures)


if __name__ == "__main__":
    main()
