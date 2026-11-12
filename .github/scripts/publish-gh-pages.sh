#!/usr/bin/env bash
# Commits a change to the gh-pages branch and pushes it, tolerating concurrent writers.
#
# Usage: publish-gh-pages.sh <commit-message> <apply-command> [args...]
#
# The apply command runs inside a fresh gh-pages working tree and must only touch the
# subtree it owns (storybook/ or the site root without storybook/). A rejected push
# re-applies the change on top of the latest gh-pages instead of rebasing, so concurrent
# writers never end up in a rebase conflict (e.g. on the generated storybook/index.html).
#
# Requires GITHUB_TOKEN and GITHUB_REPOSITORY (or GH_PAGES_REMOTE, e.g. for local tests);
# creates gh-pages if it does not exist.
set -euo pipefail

MESSAGE="$1"
shift

REMOTE="${GH_PAGES_REMOTE:-https://x-access-token:${GITHUB_TOKEN}@github.com/${GITHUB_REPOSITORY}.git}"
WORK_DIR="${RUNNER_TEMP:-/tmp}/gh-pages-$$"
git init -q "$WORK_DIR"
cd "$WORK_DIR"
git config user.name 'coremedia-ci'
git config user.email 'coremedia-ci@coremedia.com'
git remote add origin "$REMOTE"

for i in 1 2 3 4 5; do
  if git ls-remote --exit-code --heads origin gh-pages > /dev/null 2>&1; then
    git fetch -q --depth 1 origin gh-pages
    git checkout -q -f -B gh-pages FETCH_HEAD
  else
    echo "Creating new gh-pages branch"
    git checkout -q -f --orphan gh-pages
    git rm -rqf --cached . > /dev/null 2>&1 || true
    # Empty, so Jekyll does not render a placeholder as landing page.
    git commit -q --allow-empty -m "Initial gh-pages commit"
  fi
  git clean -qfdx

  "$@"

  git add -A
  if git diff --cached --quiet; then
    echo "No changes to deploy"
    exit 0
  fi
  git commit -q -m "$MESSAGE"

  if git push -q origin gh-pages; then
    echo "Successfully pushed to gh-pages"
    exit 0
  fi
  echo "Push rejected, re-applying on latest gh-pages ($i/5)..."
  sleep $((i * 2))
done

echo "::error::Failed to push to gh-pages after 5 attempts"
exit 1
