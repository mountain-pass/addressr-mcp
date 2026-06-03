---
status: "proposed"
date: 2026-06-03
decision-makers: [unspecified - fill at canonical review]
consulted: []
informed: []
reassessment-date: 2026-09-03
---

# npm release authentication: stored NPM_TOKEN secret vs OIDC trusted-publishing

> Captured via /wr-architect:capture-adr (foreground-lightweight aside-invocation per ADR-032 P156 amendment). Run /wr-architect:create-adr on this ID to expand the deferred sections canonically. **Decision is genuinely deferred** (not pre-pinned) pending the single-workflow verification named in the Context.

## Context and Problem Statement

`.github/workflows/release.yml` publishes `@mountainpass/addressr-mcp` to npm via `changesets/action@v1` using `NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}`. P015 surfaced that an empty or expired `secrets.NPM_TOKEN` causes a silent failure: the changesets action falls back to "No NPM_TOKEN or OIDC available - assuming npm is already authenticated", then `npx changeset publish` PUTs unauthenticated and npm returns a confusing E404 ("package not in this registry") rather than a clear auth error. The stored-secret model also carries ongoing rotation toil - the same lapsed-credential class produced both P015 (NPM_TOKEN) and P011 (RAPIDAPI_KEY); credentials silently expire and the failure only surfaces at release time.

Option A (a fail-fast guard, `scripts/check-npm-token.sh` wired into the release job before the publish step) shipped in commit 2f9edd2 as a stop-gap. It makes the empty-token failure LOUD but does not eliminate the stored-secret rotation surface. This ADR weighs whether to go further and adopt npm OIDC trusted-publishing.

**Open verification gating the decision (user-flagged):** npm trusted-publisher configuration binds to a specific workflow filename, so OIDC covers only the configured workflow. The user recalls "OIDC only works with a single workflow and we have multiple." A repo-state check during this capture found only ONE workflow file at `.github/workflows/release.yml` (confirmed `ls .github/workflows/*.yml`), so the single-workflow constraint may NOT block adoption here. The canonical review MUST verify the publish surface is genuinely single-workflow (and confirm no second publish path exists in any branch / reusable-workflow / matrix) before concluding.

## Decision Drivers

- Eliminate the silent-404 failure class and the credential-rotation toil (P015 + P011 both stem from stale stored credentials).
- Supply-chain trust posture: short-lived per-release OIDC tokens vs a long-lived stored secret with broad scope.
- Migration cost: OIDC needs `permissions: id-token: write` on the release job + an npm-side trusted-publisher config bound to the workflow filename.
- The single-workflow constraint (verify): does this repo have exactly one publish workflow? (Capture-time finding: yes, one `release.yml` - needs canonical confirmation.)
- (further drivers deferred to /wr-architect:create-adr canonical review)

## Considered Options

1. **Option A - stored `NPM_TOKEN` secret + fail-fast guard (status quo, already shipped in 2f9edd2)** - keep the stored-secret model; the `scripts/check-npm-token.sh` guard makes an empty/missing token a loud early CI failure instead of a silent E404. Rotation toil remains.
2. **Option B - migrate to npm OIDC trusted-publishing** - issue short-lived per-release tokens via GitHub Actions `id-token`; no stored `NPM_TOKEN` secret to lapse. Requires `id-token: write` permission + npm trusted-publisher config bound to `release.yml`. Gated on the single-workflow verification.

## Decision Outcome

**Deferred.** No option chosen yet. Option A is the shipped stop-gap; Option B is the candidate structural fix. The decision is held pending the single-workflow verification in the Context - if the publish surface is genuinely a single `release.yml`, the user-recalled OIDC constraint does not block Option B and the trust/toil drivers favour it. Canonical review (`/wr-architect:create-adr 006`) should perform the verification, expand the options' pros/cons, and pin the outcome.

## Consequences

### Good

- (deferred to /wr-architect:create-adr canonical review)

### Neutral

- (deferred to /wr-architect:create-adr canonical review)

### Bad

- (deferred to /wr-architect:create-adr canonical review)

## Confirmation

(deferred to /wr-architect:create-adr canonical review)

## Pros and Cons of the Options

### Option A - stored NPM_TOKEN + guard

- Good: zero migration cost; guard already shipped; no npm-side config.
- Bad: rotation toil persists; long-lived secret is a broader supply-chain surface.
- (further pros/cons deferred to /wr-architect:create-adr canonical review)

### Option B - OIDC trusted-publishing

- Good: no stored secret to lapse; short-lived per-release tokens; eliminates the P015/P011 stale-credential class for npm.
- Bad / open: gated on single-workflow verification; needs npm-side trusted-publisher config + `id-token: write` permission.
- (further pros/cons deferred to /wr-architect:create-adr canonical review)

## Reassessment Criteria

(deferred to /wr-architect:create-adr canonical review - default reassessment-date 2026-09-03)

## Related

- P015 (`docs/problems/verifying/015-npm-publish-fails-with-e404-no-npm-token-in-gha.md`) - the silent-E404 failure that motivated this ADR; Option A guard shipped in 2f9edd2.
- P011 - sibling stale-credential class (RAPIDAPI_KEY GHA secret); same "credential silently expires, surfaces only at use time" pattern.
- `.github/workflows/release.yml` - the single publish workflow; the migration target for Option B.
