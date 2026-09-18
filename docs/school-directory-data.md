# School directory maintainer guide

This file documents how NextPath refreshes the signup school/college directory from authoritative federal sources. It is maintainer-facing source documentation, not end-user help text.

## Authoritative source files

1. **NCES CCD Public School Locations (EDGE, CCD-derived)**
   - Release configured in the builder: `2024-25`
   - URL: `https://data-nces.opendata.arcgis.com/api/download/v1/items/5cd68dad64f641f6b847367493e92657/csv?layers=3`
   - Used for: public U.S. high schools

2. **NCES PSS Private School Locations (EDGE, PSS-derived)**
   - Release configured in the builder: `2023-24`
   - URL: `https://nces.ed.gov/programs/edge/data/EDGE_GEOCODE_PRIVATESCHOOL_2324.csv`
   - Used for: private U.S. high schools

3. **NCES Postsecondary School Locations (IPEDS-derived)**
   - Release configured in the builder: `2024-25`
   - URL: `https://ncesedgis.maps.arcgis.com/sharing/rest/content/items/c09067e617894cbca0798c53967c795b/data`
   - Used for: U.S. postsecondary institutions

Only those official NCES/EDGE/IPEDS-derived datasets are used. The refresh pipeline does not scrape arbitrary institution websites or add manual non-authoritative records.

## Build and deploy model

- The checked-in `docs/data/school-directory.json` is intentionally allowed to be a **development fixture** for local/offline work.
- GitHub Pages deploys rebuild the production artifact from the official NCES/IPEDS URLs before upload.
- If the official refresh or validation fails, the deploy job fails instead of shipping a truncated or fixture-sized national directory.

## Exact refresh commands

Run from the repository root:

### Refresh from the official NCES/IPEDS URLs

```bash
python scripts/school_directory/build_school_directory.py --download --output docs/data/school-directory.json
python -m scripts.school_directory.validate_school_directory --directory docs/data/school-directory.json --require-production-ready
```

### Refresh from already-downloaded official files

```bash
python scripts/school_directory/build_school_directory.py \
  --public-file /absolute/path/to/public-school-source.csv \
  --private-file /absolute/path/to/private-school-source.csv \
  --college-file /absolute/path/to/postsecondary-source.csv \
  --output docs/data/school-directory.json
python -m scripts.school_directory.validate_school_directory --directory docs/data/school-directory.json --require-production-ready
```

### Local offline fixture build

```bash
python scripts/school_directory/build_school_directory.py --fixtures --output docs/data/school-directory.json
python -m scripts.school_directory.validate_school_directory --directory docs/data/school-directory.json
```

## Normalization, filtering, and safeguards

- Public and private K-12 source rows are filtered to high schools using official grade/level fields first, with name-based fallback only when those fields are missing.
- Postsecondary rows with closed/inactive operating status are excluded when the official source supplies that status.
- Records are deduplicated by normalized institution type, canonicalized name, city, and state.
- Records missing required fields (`id`, `name`, `type`, `city`, `state`, `searchText`) are rejected.
- Non-fixture builds must pass integrity checks before the JSON is written:
  - minimum nationwide counts for high schools, colleges, and total records
  - coverage across all 50 states plus DC for both high schools and colleges
  - at least one emitted record from each required official source dataset

## Unavoidable limitation

The directory depends on the current official NCES/EDGE/IPEDS releases. NextPath can honestly present nationwide authoritative coverage only when those sources are reachable and the production-ready validation passes. If they are unavailable, the app must keep manual school entry available rather than claim the checked-in fixture is complete.
