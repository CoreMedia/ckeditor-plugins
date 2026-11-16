#!/usr/bin/env bash
# Prints the pending changesets that request a major bump, one per line.
# Runs in the repository root.
set -euo pipefail

for f in .changeset/*.md; do
  [ -e "$f" ] || continue
  [ "$(basename "$f")" = README.md ] && continue
  # Only the frontmatter holds bump types; no "grep -q", so awk never hits a closed pipe.
  if awk 'NR == 1 && $0 == "---" { fm = 1; next } fm && $0 == "---" { exit } fm' "$f" \
    | grep -E ":[[:space:]]*[\"']?major[\"']?[[:space:]]*$" > /dev/null; then
    echo "$f"
  fi
done
