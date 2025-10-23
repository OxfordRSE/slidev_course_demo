#!/usr/bin/env bash

repo_root="$1"

pushd $(dirname "$0")

rm -rf build dist
mkdir -p build dist

echo "<html><h1>Presentations</h1>" > dist/index.html

for dir in presentations/*/; do
    ./build.sh "$dir" "$repo_root"
    presentation_name=$(basename "$dir")
    echo "<li><a href=\"${presentation_name%/}/index.html\">${presentation_name%/}</a></li>" >> dist/index.html
done

echo "</html>" >> dist/index.html

popd
