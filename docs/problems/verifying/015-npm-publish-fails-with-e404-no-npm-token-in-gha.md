# Problem 015: npm publish fails with E404 - no NPM_TOKEN in GHA

**Status**: Verification Pending
**Reported**: 2026-06-03
**Priority**: 12 (Significant) - Impact: 4 x Likelihood: 3
**Origin**: internal
**Effort**: S
**Type**: technical

## Description

npm publish fails with E404 - secrets.NPM_TOKEN absent in GHA Release workflow. /wr-itil:work-problems Step 6.5 release-cadence drain after iter 1 (P008 fix) hit a halt at release:watch. GHA workflow run 26860136476 release job logs: 'No NPM_TOKEN or OIDC available - assuming npm is already authenticated' then 'E404 Not Found - PUT https://registry.npmjs.org/@mountainpass%2faddressr-mcp - Not found / @mountainpass/addressr-mcp@1.0.4 is not in this registry'. Prior release PR #6 successfully published 1.0.3, so the change happened between PR #6 and PR #7. Origin/main advanced (b77000a Merge PR #7, 2d6bafd Version Packages bumping 1.0.3 -> 1.0.4) but npm registry stuck at 1.0.3 until the secret was set this session and the failed run was re-run.

## Symptoms

- `npm publish` in the GHA `release` job exits non-zero with `E404 Not Found - PUT https://registry.npmjs.org/@mountainpass%2faddressr-mcp - Not found`.
- The releasing job log carries the diagnostic line `No NPM_TOKEN or OIDC available - assuming npm is already authenticated` from `changesets/action@v1` immediately before the failed PUT.
- The "Version Packages" merge commit is on `main` but the npm registry still serves the prior version, so `npm view @mountainpass/addressr-mcp version` lags `package.json` by one release.
- `release:watch` polling halts at the failed run.

## Workaround

1. Generate an npm Automation or Granular Access token at npmjs.com.
2. `gh secret set NPM_TOKEN` (or set via the GitHub UI under repo Settings -> Secrets and variables -> Actions).
3. `gh run rerun <failed-run-id> --failed` to retry only the failed release job.

This session applied the workaround and the 1.0.4 publish landed successfully.

## Impact Assessment

- **Who is affected**: maintainer persona (release flow blocked); downstream MCP-client users see stale npm registry until the secret is rotated.
- **Frequency**: triggered every time `secrets.NPM_TOKEN` is empty or expired (token rotation cadence + initial-setup misconfiguration are the realistic trigger surfaces).
- **Severity**: Significant. Release path blocked; the symptom (E404) misdirects diagnosis toward registry/scope issues rather than the actual auth failure.
- **Analytics**: GHA workflow run logs (Actions tab) carry the diagnostic chain. No additional analytics surface.

## Root Cause Analysis

### Two-layer root cause

**Layer 1 (acute - resolved this session):** `secrets.NPM_TOKEN` was empty in the repository's Actions secrets. This was the immediate cause of the 1.0.4 publish failure. The user generated and set a new npm token this session; the re-run published 1.0.4 successfully.

**Layer 2 (structural - addressed by this fix):** when `secrets.NPM_TOKEN` is empty, `changesets/action@v1` does NOT fail; it silently logs `No NPM_TOKEN or OIDC available - assuming npm is already authenticated` and proceeds to run `npx changeset publish`. The unauthenticated PUT to the registry then returns `E404 Not Found`, which looks like a scope/registry-config bug rather than an auth bug. A maintainer who has not seen this failure mode before will burn time chasing the wrong root cause.

The fix targets Layer 2: a workflow-level guard step that runs BEFORE `changesets/action@v1` and exits non-zero with a clear `::error::` GitHub Actions annotation when `NODE_AUTH_TOKEN` (mapped from `secrets.NPM_TOKEN`) is empty. The maintainer sees a single, unambiguous, actionable CI error naming both `NPM_TOKEN` and the remediation command instead of a confusing E404.

### Investigation Tasks

- [x] Investigate root cause (two-layer: empty secret + silent changesets/action fallback)
- [x] Create reproduction test (`test/check-npm-token.test.mjs` covers both branches)
- [x] Decide token type and rotation cadence (Automation token chosen this session; cadence to be documented separately if friction recurs)
- [x] Decide on workflow-level fail-fast guard (Option A) - shipped this iter
- [ ] Evaluate npm OIDC trusted-publishing (Option B) as structural alternative (eliminates the stored-secret rotation surface). Deferred: warrants its own ADR conversation.

## Fix Strategy

**Option A - Fail-fast guard (this fix, shipped):** add a tiny `scripts/check-npm-token.sh` that exits 1 with a clear `::error::` diagnostic on stderr when `NODE_AUTH_TOKEN` is empty, exits 0 when present. Cover both branches with `test/check-npm-token.test.mjs`. Add a workflow step in the `release` job BEFORE `changesets/action@v1` that runs the script with `env: NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}`. Effect: the next time the secret is missing or empty, CI fails loudly at a named step with a remediation hint instead of falling through to E404.

**Option B - npm OIDC trusted-publishing (deferred, separate ADR):** migrate from a stored long-lived `NPM_TOKEN` to npm's OIDC trusted-publishing flow (short-lived tokens minted per release via GitHub's OIDC provider). This eliminates the stored-secret rotation surface entirely. Per architect verdict on this fix: this is a meaningful auth-model change worth recording via `/wr-architect:create-adr` when pursued. Not in scope for this iter.

## Fix Released

Shipped in this commit. Awaiting user verification.

- `scripts/check-npm-token.sh`: fail-fast guard reading `NODE_AUTH_TOKEN`, emitting `::error::` GHA annotations naming `NPM_TOKEN` and remediation steps when empty/unset.
- `test/check-npm-token.test.mjs`: node:test coverage for empty / unset / present branches and a no-token-leak assertion.
- `.github/workflows/release.yml`: new `Check NPM_TOKEN is present` step in the `release` job, wired BEFORE the existing `changesets/action@v1` step.

**Verification path** (when the user is back): the next release will exercise the present-token branch silently (current `secrets.NPM_TOKEN` is set, so the guard exits 0). The empty-token branch is exercised by the unit test (`npm run test:unit`) and can be smoke-verified in CI by temporarily unsetting `secrets.NPM_TOKEN` and observing the named step fail loudly with the `::error::` annotation rather than the E404. Closure trigger: any future release cycle that confirms the guard does not regress the happy path, OR an explicit confirm from the user.

## Dependencies

- **Blocks**: (none - the acute issue is resolved; structural guard is additive)
- **Blocked by**: (none)
- **Composes with**: (none in local backlog)

## Related

(captured via /wr-itil:capture-problem during /wr-retrospective:run-retro session-level retro inside /wr-itil:work-problems Step 6.5 halt; hang-off-check verdict PROCEED_NEW against P014 candidate.)

- Failed CI run (since recovered): https://github.com/mountain-pass/addressr-mcp/actions/runs/26860136476
- Prior successful release (PR #6, v1.0.3): https://github.com/mountain-pass/addressr-mcp/pull/6
- Successful 1.0.4 release this session via workaround.
- GHA workflow file: `.github/workflows/release.yml`
- Guard script: `scripts/check-npm-token.sh`
- Guard test: `test/check-npm-token.test.mjs`
- Architect verdict 2026-06-03: Option A no ADR required; Option B (OIDC) warrants its own ADR if pursued.
- JTBD trace: serves JTBD-101 (Release New Version) and JTBD-102 (Diagnose Red CI Quickly).
