#!/usr/bin/env bash
# Builds the Tesserow Flatpak from source.
#
#   flatpak/build.sh generate   regenerate the offline npm/cargo source lists
#                               from the lockfiles and check the metainfo version
#   flatpak/build.sh [build]    generate, then build and export a .flatpak bundle
#                               to flatpak/dist/
#
# CI runs `generate` and then builds with the flatpak-builder GitHub action;
# see .github/workflows/release.yml.
set -euo pipefail

APP_ID=com.deiussum.tesserow
# flatpak-builder-tools commit providing the cargo and node source generators.
FBT_COMMIT=41c20aa10819cdb2a4f3ca171758a96d1955c018

FLATPAK_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(dirname "$FLATPAK_DIR")"
BUILD="$FLATPAK_DIR/.build"
GENERATED="$FLATPAK_DIR/generated"
MANIFEST="$FLATPAK_DIR/$APP_ID.yml"
METAINFO="$FLATPAK_DIR/$APP_ID.metainfo.xml"

app_version() {
    python3 -c 'import json, sys; print(json.load(open(sys.argv[1]))["version"])' \
        "$ROOT/src-tauri/tauri.conf.json"
}

check_version() {
    local version
    version="$(app_version)"
    if ! grep -q "<release version=\"$version\"" "$METAINFO"; then
        echo "error: $METAINFO has no <release version=\"$version\"> entry." >&2
        echo "Add one for the version in src-tauri/tauri.conf.json (see the release steps in CONTRIBUTING.md)." >&2
        exit 1
    fi
}

setup_generators() {
    local tools="$BUILD/flatpak-builder-tools"
    if [[ "$(cat "$tools/.commit" 2>/dev/null)" != "$FBT_COMMIT" ]]; then
        rm -rf "$tools" "$BUILD/venv"
        mkdir -p "$tools"
        curl -fsSL "https://github.com/flatpak/flatpak-builder-tools/archive/$FBT_COMMIT.tar.gz" \
            | tar -xz -C "$tools" --strip-components=1
        python3 -m venv "$BUILD/venv"
        "$BUILD/venv/bin/pip" install --quiet \
            "aiohttp>=3.9.5,<4" "PyYAML>=6.0.2,<7" "tomlkit>=0.13.3,<1" "$tools/node"
        echo "$FBT_COMMIT" > "$tools/.commit"
    fi
}

generate() {
    check_version
    setup_generators
    mkdir -p "$GENERATED"

    "$BUILD/venv/bin/python" "$BUILD/flatpak-builder-tools/cargo/flatpak-cargo-generator.py" \
        "$ROOT/src-tauri/Cargo.lock" -o "$GENERATED/cargo-sources.json"

    # The node generator must not see a node_modules directory next to the
    # lockfile, so run it against a copy.
    local npm_dir="$BUILD/npm-lockfile"
    rm -rf "$npm_dir"
    mkdir -p "$npm_dir"
    cp "$ROOT/package.json" "$ROOT/package-lock.json" "$npm_dir/"
    (cd "$npm_dir" && "$BUILD/venv/bin/flatpak-node-generator" npm package-lock.json \
        -o "$GENERATED/node-sources.json")
}

flatpak_builder() {
    if command -v flatpak-builder >/dev/null; then
        flatpak-builder "$@"
    else
        flatpak run org.flatpak.Builder "$@"
    fi
}

build() {
    generate
    local bundle
    bundle="$FLATPAK_DIR/dist/Tesserow_$(app_version)_x86_64.flatpak"
    flatpak_builder --user --install-deps-from=flathub --force-clean \
        --state-dir="$BUILD/state" --repo="$BUILD/repo" \
        "$BUILD/build-dir" "$MANIFEST"
    mkdir -p "$(dirname "$bundle")"
    flatpak build-bundle --runtime-repo=https://flathub.org/repo/flathub.flatpakrepo \
        "$BUILD/repo" "$bundle" "$APP_ID"
    echo "Built $bundle"
}

case "${1:-build}" in
    generate) generate ;;
    build) build ;;
    *)
        echo "usage: $0 [generate|build]" >&2
        exit 1
        ;;
esac
