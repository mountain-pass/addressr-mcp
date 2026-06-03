# Problem 015: npm publish fails with E404 - no NPM_TOKEN in GHA

**Status**: Open
**Reported**: 2026-06-03
**Priority**: 3 (Medium) - Impact: 3 x Likelihood: 1 (deferred - re-rate at next /wr-itil:review-problems)
**Origin**: internal
**Effort**: M (deferred - re-rate at next /wr-itil:review-problems)
**Type**: technical

## Description

npm publish fails with E404 - secrets.NPM_TOKEN absent in GHA Release workflow. /wr-itil:work-problems Step 6.5 release-cadence drain after iter 1 (P008 fix) hit a halt at release:watch. GHA workflow run 26860136476 release job logs: 'No NPM_TOKEN or OIDC available - assuming npm is already authenticated' then 'E404 Not Found - PUT https://registry.npmjs.org/@mountainpass%2faddressr-mcp - Not found / @mountainpass/addressr-mcp@1.0.4 is not in this registry'. Prior release PR #6 successfully published 1.0.3, so the change happened between PR #6 and PR #7. Origin/main advanced (b77000a Merge PR #7, 2d6bafd Version Packages bumping 1.0.3 -> 1.0.4) but npm registry stuck at 1.0.3. Workaround: Generate npm Automation/Granular token at npmjs.com; gh secret set NPM_TOKEN; gh run rerun 26860136476 --failed. Structural fix options: (A) workflow-level fail-fast guard when NODE_AUTH_TOKEN empty (3 lines in release.yml); (B) migrate to npm OIDC trusted-publishing (eliminates secret entirely); (C) document rotation cadence in briefing. Category 3 release-path instability per Step 2b Pipeline Instability scan. Severity 12 (Impact 4 Significant - release path blocked x Likelihood 3 Possible - token rotation cadence). Effort S. WSJF 12.0 Open. Type technical.

## Symptoms

(deferred to investigation)

## Workaround

(deferred to investigation)

## Impact Assessment

- **Who is affected**: (deferred to investigation)
- **Frequency**: (deferred to investigation)
- **Severity**: (deferred to investigation)
- **Analytics**: (deferred to investigation)

## Root Cause Analysis

### Investigation Tasks

- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems
- [ ] Investigate root cause
- [ ] Create reproduction test
- [ ] Decide token type (Automation vs Granular Access) and rotation cadence
- [ ] Evaluate npm OIDC trusted-publishing as structural alternative (eliminates the stored-secret rotation surface)
- [ ] Consider workflow-level fail-fast guard when NODE_AUTH_TOKEN empty (3-line stop-gap)

## Dependencies

- **Blocks**: every future release of @mountainpass/addressr-mcp until resolved
- **Blocked by**: (none - purely a secret-management task)
- **Composes with**: (none in local backlog)

## Related

(captured via /wr-itil:capture-problem during /wr-retrospective:run-retro session-level retro inside /wr-itil:work-problems Step 6.5 halt; hang-off-check verdict PROCEED_NEW against P014 candidate - shared /wr-itil:work-problems signal was incidental provenance, not scope overlap; rationale: classifier-intelligence root cause vs npm-token CI root cause are distinct surfaces.)

- Failed CI run: https://github.com/mountain-pass/addressr-mcp/actions/runs/26860136476
- Prior successful release (PR #6, v1.0.3): https://github.com/mountain-pass/addressr-mcp/pull/6
- GHA workflow file: `.github/workflows/release.yml` line 32 (`NODE_AUTH_TOKEN: ${{ secrets.NPM_TOKEN }}`)
- expand at next investigation
