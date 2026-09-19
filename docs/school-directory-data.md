# School directory data provenance

This project builds the signup school/college autocomplete directory from official NCES/IES sources.

## Official source URLs configured in the refresh script

Retrieval attempted: **2026-09-18** (UTC) from the cloud-agent environment.

> Note: DNS/network policy in this sandbox blocked direct access to the official NCES/IES hosts during this PR, so a full nationwide refresh could not be executed here. The committed `docs/data/school-directory.json` is intentionally marked as a **fixture-limited development preview** so the UI never presents it as the complete national directory.

1. **Public schools (high school filter source)**
   - Dataset: NCES CCD Public School Locations (EDGE, CCD-derived)
   - Release: 2024-25 (current)
   - URL: `https://public-nces.opendata.arcgis.com/datasets/NCES::public-school-locations-current.csv`
   - Fields used: `NCESSCH` (id), `SCH_NAME`/`SCHOOL_NAME`/`NAME`, `LCITY`/`CITY`, `LSTATE`/`STATE`/`STABBR`, `GSHI`/`HIGH_GRADE`

2. **Private schools (high school filter source)**
   - Dataset: NCES PSS Private School Locations (EDGE, PSS-derived)
   - Release: 2023-24
   - URL: `https://nces.ed.gov/programs/edge/data/EDGE_GEOCODE_PRIVATESCHOOL_2324.csv`
   - Fields used: `PPIN`/`PSS_SCHOOL_ID`/`NCESSCH` (id), `NAME`/`SCHOOL_NAME`/`SCH_NAME`, `CITY`/`LCITY`, `STABBR`/`STATE`, `LEVEL`/`SCHOOL_LEVEL`, `G_HIGH`/`HIGH_GRADE`

3. **Postsecondary schools (college/university source)**
   - Dataset: NCES Postsecondary School Locations (IPEDS-derived)
   - Release: 2024-25 (current)
   - URL: `https://ncesedgis.maps.arcgis.com/sharing/rest/content/items/c09067e617894cbca0798c53967c795b/data`
   - Fields used: `UNITID`/`IPEDS_ID` (id), `INSTNM`/`NAME`/`INSTITUTION`, `CITY`/`LCITY`, `STABBR`/`STATE`

## Refresh process

Run from repository root:

```bash
python scripts/school_directory/build_school_directory.py --download --output docs/data/school-directory.json
```

If you already downloaded the official source files yourself, pass them explicitly:

```bash
python scripts/school_directory/build_school_directory.py \
  --public-file /absolute/path/to/public-school-source.csv \
  --private-file /absolute/path/to/private-school-source.csv \
  --college-file /absolute/path/to/postsecondary-source.csv \
  --output docs/data/school-directory.json
```

Offline fixture build (development-only preview used in this PR):

```bash
python scripts/school_directory/build_school_directory.py --fixtures --output docs/data/school-directory.json
```

## Known coverage limitations

- The committed JSON in this PR is fixture-limited and not nationwide.
- Full national coverage requires running the refresh script against the official NCES URLs above in an environment with network access.
- High-school classification is based on official grade/level fields when present, with name-based fallback when grade metadata is missing.
- Postsecondary filtering keeps only rows with valid institution names and excludes records explicitly marked closed or inactive when those official status fields are present.
