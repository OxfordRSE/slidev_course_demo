#!/usr/bin/env bash

pushd $(dirname "$0")

rm -rf build out
mkdir -p build out

echo "<html><h1>Presentations</h1>" > out/index.html

for dir in presentations/*/; do
    ./build.sh "$dir"
    presentation_name=$(basename "$dir")
    echo "<li><a href=\"${presentation_name%/}/index.html\">${presentation_name%/}</a></li>" >> out/index.html
done

echo "</html>" >> out/index.html

popd
