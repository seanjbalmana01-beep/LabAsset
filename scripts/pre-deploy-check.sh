#!/bin/sh
set -eu

echo "Running LabAsset pre-deployment checks..."

required_files="
docker-compose.yml
Jenkinsfile
.env.example
"

for file in $required_files; do
    if [ ! -f "$file" ]; then
        echo "ERROR: Required file is missing: $file"
        exit 1
    fi
    echo "OK: Found $file"
done

echo "All pre-deployment file checks passed."