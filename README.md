# NextPath Website

This repository contains a small C++ project structure for the NextPath website.

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
