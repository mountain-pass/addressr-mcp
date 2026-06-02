# Problem 011: CI integration test tool-list assertion breaks when upstream Addressr API drops search-* link relations

**Status**: Open
**Reported**: 2026-06-02
**Priority**: 9 (Medium) - Impact: 3 (CI red blocks releases) x Likelihood: 3 (upstream rel set drifts independently)
**Origin**: internal
**Effort**: M (decision required: rewrite test to use registered-tool subset, mock upstream, or skip when rels missing)
**WSJF**: 4.5
**Type**: technical

## Description

The integration test `test/server.test.mjs` subtest 1 "lists kebab-case addressr tools" asserts that `search-addresses` (plus `search-localities` / `search-postcodes` / `search-states`) appear in the dynamically-registered tool list. The list is built from the Addressr API root's advertised link relations (HATEOAS). When the upstream root drops a rel, the corresponding `search-*` tool is silently skipped (per `src/server.mjs` dynamic registration), and the test fails with `Expected tool 'search-addresses' in ["health","get-address","get-locality","get-postcode","get-state"]`.

Observed 2026-06-02 push:watch on CI run `26800948615`. Previous green run was `25805639642` on 2026-05-13. Between those two pushes, no test code change touched subtest 1 (last edit: 2026-04-25 in commit `0da3803`); the failure root cause is upstream link-rel drift. The runner-side warnings (`# Warning: API root does not advertise https://addressr.io/rels/address-search; skipping search-addresses`) name the missing rels explicitly, but only as TAP comments — the test assertion fires before the warnings are surfaced as actionable signal.

Distinct from P007 (cryptic JSON parse on upstream non-200): P007's status branches only fire in the search-addresses / get-address subtests, which CI never reaches because subtest 1 fails first.

## Symptoms

- CI subtest 1 fails with `Expected tool '<search-tool>' in [...registered tools...]`.
- Runner emits warning lines naming the missing rels but the assertion shape doesn't consume them.
- Subsequent subtests (search-addresses, get-address) are skipped because subtest 1's failure cascades.
- The fix in P007 (status-branches in search/get subtests) is not exercised in CI runs where subtest 1 fails first; P007 verification is blocked.

## Workaround

When CI is red on subtest 1, check the upstream Addressr API root via `curl https://addressr.p.rapidapi.com/` and inspect the advertised `_links`. If `address-search` / `postcode-search` / `locality-search` / `state-search` rels are missing, the upstream is in a degraded state. The test cannot pass without all four rels in the upstream root.

## Impact Assessment

- **Who is affected**: maintainers shipping any change through CI when the upstream API rel set drifts.
- **Frequency**: every push during a degraded-upstream window.
- **Severity**: Medium. CI red blocks all push:watch / release:watch drains. The actual upstream state is observable but the test assertion shape doesn't surface it as the primary error.
- **Analytics**: N/A.

## Root Cause Analysis

### Confirmed Root Cause

The assertion in `test/server.test.mjs:51` hard-codes the expected tool list against the union of all possible dynamic registrations (search + get + health). When the upstream advertises a strict subset of the canonical rel set, the dynamic-registration code (correctly) skips the missing rels, but the test assertion (incorrectly) treats the union as mandatory. The test contract assumes the upstream advertises every rel the proxy knows how to map, which is not guaranteed by the HATEOAS contract.

### Fix Strategy

Several options:

1. **Test-level: assert minimum tool subset** — change the assertion from `expected.every(name => names.includes(name))` to `assert.ok(names.includes('health') && names.includes('get-address'))` (the rels we know are always advertised by the upstream's baseline). Cheapest fix; preserves end-to-end coverage of the proxy's HATEOAS registration without coupling to the upstream's optional rels.

2. **Test-level: skip subtest when rels missing** — pre-check the registered tool list against expected and skip the assertion with a TAP "skip" reason when the upstream is in a degraded state. Preserves the test as a regression check for when the upstream is fully advertising; doesn't flag drift.

3. **Mock the upstream** — give subtest 1 a static API-root fixture so the test is decoupled from live upstream state. Heaviest; trades real-world coverage for determinism.

4. **CI-level: pre-flight upstream rel check** — pre-flight check the upstream rels before running the integration suite. When degraded, skip the suite with a clear "upstream rel set degraded" reason.

Option 1 is the natural fit. The proxy contract holds: when the upstream advertises a rel, we register the tool; the test verifies that the baseline rels result in registered tools, not that every possible rel is present. Recommendation pending user direction.

### Investigation Tasks

- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems
- [ ] Confirm baseline-always-advertised rel set with the addressr core repo maintainers
- [ ] Decide between options 1-4 above
- [ ] Verify P007 status-branches once subtest 1 is fixed (currently blocked by subtest 1 cascade)

## Related

- **P007** (`docs/problems/verifying/007-ci-integration-test-cryptic-json-parse-on-upstream-error.md`) — sibling CI-integration-test failure mode (cryptic JSON parse). P007's fix only fires in subtest 2+ which CI never reaches because P011 fails subtest 1 first; P007 verification is blocked by P011.
- **P009** (`docs/problems/open/009-mcp-missing-postcode-state-locality-endpoints.md`) — sibling upstream-API-coverage ticket. P009 is about missing get-* endpoints; P011 is about missing search-* link relations. Both expose drift in the upstream rel surface.
- **Surfaced via**: `/wr-itil:work-problems` Step 6.5 push:watch halt on CI run 26800948615 (2026-06-02).
