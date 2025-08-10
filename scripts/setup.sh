#!/usr/bin/env bash
set -euo pipefail

# Move to repository root
dirname=$(dirname "$0")
cd "$dirname/.."

# Install dependencies in web without modifying lockfile
pushd web >/dev/null
npm ci --no-audit --no-fund
popd >/dev/null

# Ensure setup does not modify tracked files
if [[ -n "$(git status --porcelain)" ]]; then
  echo "Setup must not modify tracked files"
  git status --porcelain
  exit 1
fi
