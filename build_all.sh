#!/usr/bin/env bash

repo_root="$1"

script_dir="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
if [ ! -d "${script_dir}/common" ]; then
  >&2 echo "Error: 'common' directory not found."
  >&2 echo "Remember to checkout submodules:"
  >&2 echo "  git submodule update --init --recursive"
  exit 1
fi

pushd $(dirname "$0")

rm -rf build dist
mkdir -p build dist

for dir in presentations/*/; do
    ./build.sh "$dir" "$repo_root"
done

node ./scripts/build-index.mjs

popd
