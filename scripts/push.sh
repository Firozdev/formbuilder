#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<USAGE
Usage: $(basename "$0") <remote-url> [branch]

Adds <remote-url> as the "origin" remote (if not already set) and pushes the
current branch or the optional [branch] argument to that remote. The script also
configures upstream tracking so subsequent `git push` invocations work without
extra arguments.
USAGE
}

if [[ $# -lt 1 || $# -gt 2 ]]; then
  usage
  exit 1
fi

REMOTE_URL=$1
BRANCH=${2:-$(git rev-parse --abbrev-ref HEAD)}

if ! git rev-parse --git-dir >/dev/null 2>&1; then
  echo "Error: this script must be run from within a git repository" >&2
  exit 1
fi

if git remote get-url origin >/dev/null 2>&1; then
  CURRENT_URL=$(git remote get-url origin)
  if [[ "$CURRENT_URL" != "$REMOTE_URL" ]]; then
    echo "Updating existing 'origin' remote from $CURRENT_URL to $REMOTE_URL"
    git remote set-url origin "$REMOTE_URL"
  else
    echo "Remote 'origin' already set to $REMOTE_URL"
  fi
else
  echo "Adding 'origin' remote pointing to $REMOTE_URL"
  git remote add origin "$REMOTE_URL"
fi

echo "Pushing branch $BRANCH to $REMOTE_URL"
git push -u origin "$BRANCH"
