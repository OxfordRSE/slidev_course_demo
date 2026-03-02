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

# compute base path correctly whether repo_root is empty or not
if [ -n "$repo_root" ]; then
  base="/${repo_root}/${presentation_name}/"
else
  base="/${presentation_name}/"
fi

npx slidev build --out dist --base "${base}" build/${presentation_name}/slides.md

# Remove all except 'dist' folder
mv build/${presentation_name}/dist dist/${presentation_name}
rm -rf build/${presentation_name}

popd
