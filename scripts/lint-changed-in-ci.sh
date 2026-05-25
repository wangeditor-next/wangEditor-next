#!/usr/bin/env bash

set -euo pipefail

event_name="${GITHUB_EVENT_NAME:-}"
base_ref="${GITHUB_BASE_REF:-}"
before_sha="${GITHUB_EVENT_BEFORE:-}"
sha="${GITHUB_SHA:-HEAD}"
diff_range="${LINT_DIFF_RANGE:-}"

if [ -z "$diff_range" ]; then
  if [ "$event_name" = "pull_request" ] && [ -n "$base_ref" ]; then
    git fetch --no-tags --depth=1 origin "$base_ref"
    diff_range="origin/$base_ref...HEAD"
  elif [ -n "$before_sha" ] && [ "$before_sha" != "0000000000000000000000000000000000000000" ]; then
    diff_range="$before_sha...$sha"
  else
    diff_range="HEAD~1...HEAD"
  fi
fi

echo "Lint diff range: $diff_range"

mapfile -t files < <(
  git diff --name-only --diff-filter=ACMR "$diff_range" \
    | rg -N '\.(ts|tsx|js|jsx|vue|cjs|mjs)$' || true
)

if [ "${#files[@]}" -eq 0 ]; then
  echo 'No lintable changed files detected. Skip ESLint.'
  exit 0
fi

echo 'Lint changed files:'
printf ' - %s\n' "${files[@]}"

pnpm exec eslint --cache --quiet --no-error-on-unmatched-pattern "${files[@]}"
