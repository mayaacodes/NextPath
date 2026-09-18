# NextPath Website

This repository contains a small C++ project structure for the [NextPath website](https://nextpath.example.com).

## School directory data

The signup school/college autocomplete is built only from authoritative NCES/EDGE/IPEDS-derived federal datasets. The checked-in `docs/data/school-directory.json` may be either an authoritative refreshed asset or a development fixture for local/offline work, and the GitHub Pages workflow validates the committed artifact before deploy. Refresh details and integrity checks are documented in `docs/school-directory-data.md`.

## Layout

- `include/nextpath/` - public application headers
- `src/` - implementation files
- `web/public/` - static frontend files served by the site
- `web/assets/` - CSS, scripts, and images
- `CMakeLists.txt` - build configuration

## Build

```bash
cmake -S . -B build
cmake --build build
```

## Run

```bash
./build/bin/nextpath_web
```

This starter keeps the structure organized for future expansion into routing, templating, and a real HTTP layer.
