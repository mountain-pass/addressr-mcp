#!/usr/bin/env bash
# @jtbd JTBD-101, JTBD-102
# Fail-fast guard: assert that NODE_AUTH_TOKEN is set and non-empty before
# the release job hands off to changesets/action@v1.
#
# Without this guard, an empty/missing secrets.NPM_TOKEN causes
# changesets/action@v1 to silently fall back to "No NPM_TOKEN or OIDC
# available - assuming npm is already authenticated", and the subsequent
# `npx changeset publish` PUTs unauthenticated, producing a confusing E404
# Not Found error instead of a clear auth failure.
#
# See: docs/problems/.../015-npm-publish-fails-with-e404-no-npm-token-in-gha.md

set -u

if [ -z "${NODE_AUTH_TOKEN:-}" ]; then
  printf '::error::NPM_TOKEN secret is missing or empty.\n' >&2
  printf '::error::The release job maps secrets.NPM_TOKEN to NODE_AUTH_TOKEN; both are empty.\n' >&2
  printf '::error::Remediate: create an npm Automation or Granular Access token at npmjs.com, then `gh secret set NPM_TOKEN` and re-run the release.\n' >&2
  exit 1
fi

exit 0
