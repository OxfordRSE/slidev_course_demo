#!/usr/bin/env bash

pushd $(dirname "$0")

dir="$1"
if [ -z "$dir" ]; then
    echo "Usage: $0 <presentation_directory>"
    exit 1
fi

repo_root="$2"

presentation_name=$(basename "$dir")
echo "Presentation name: $presentation_name"

mkdir -p build/${presentation_name}

cp -r common/* build/${presentation_name}/
cp -r presentations/${presentation_name}/* build/${presentation_name}/

npx slidev build --out dist --base /${repo_root}/${presentation_name}/ build/${presentation_name}/slides.md

# Remove all except 'dist' folder
mv build/${presentation_name}/dist dist/${presentation_name}
rm -rf build/${presentation_name}

popd
