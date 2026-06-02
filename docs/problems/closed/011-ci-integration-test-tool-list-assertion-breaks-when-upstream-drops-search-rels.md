# Problem 011: CI integration test tool-list assertion breaks when upstream Addressr API drops search-* link relations

**Status**: Closed
**Reported**: 2026-06-02
**Released**: 2026-06-02 (key rotation; CI run 26808770054 rerun green)
**Priority**: 9 (Medium) - Impact: 3 (CI red blocks releases) x Likelihood: 3 (subscription state can lapse independently of test code or upstream rel set)
**Origin**: internal
**Effort**: S (immediate remediation = key rotation; one secret-set + workflow rerun)
**WSJF**: 0 (Verification Pending — multiplier 0 per ADR-022)
**Type**: operational + technical

## Description

The integration test `test/server.test.mjs` subtest 1 "lists kebab-case addressr tools" asserts that `search-addresses` (plus `search-localities` / `search-postcodes` / `search-states`) appear in the dynamically-registered tool list. The list is built from the Addressr API root's advertised link relations (HATEOAS). When the response body lacks a `_links` array, the corresponding `search-*` tool is silently skipped (per `src/server.mjs` dynamic registration), and the test fails with `Expected tool 'search-addresses' in ["health","get-address","get-locality","get-postcode","get-state"]`.

Observed 2026-06-02 push:watch on CI run `26800948615`. Previous green run was `25805639642` on 2026-05-13. Between those two pushes, no test code change touched subtest 1 (last edit: 2026-04-25 in commit `0da3803`).

### Diagnosis correction 2026-06-02 (post-capture verification)

Initial capture diagnosed this as "upstream API root dropped search-* rels". Cross-check disconfirms:

- `../addressr` core repo source still advertises all 4 search-* rels (`src/waycharter-server.js:669,758,817,870` and `lib/src/waycharter-server.js`). Upstream has NOT retired the rels.
- Local probe of `https://addressr.p.rapidapi.com/` with a stale RAPIDAPI_KEY returned `{"message":"Invalid API key"}` (valid JSON, no `_links` array). Feeding that response into `src/server.mjs:127-130` produces `advertisedRels = Set([])` — identical observable to the CI failure.

**Most likely actual root cause: CI's `secrets.RAPIDAPI_KEY` is stale** (rotated locally without updating the GitHub Actions secret — same pattern P007 reproduced at workflow run 25802567134). The failure observable (tool-list assertion) is a downstream symptom; the structural bug is **`getRoot()` silently succeeds on auth-error responses** because RapidAPI returns those as valid JSON without `_links`.

Distinct from P007: P007's status branches fire in the search-addresses / get-address subtests AFTER tool registration. P011's failure fires earlier, during tool registration in the `before(...)` hook. P007 cannot fire because subtest 1 fails first. Both have the same upstream-state root cause when auth is stale.

## Symptoms

- CI subtest 1 fails with `Expected tool '<search-tool>' in [...registered tools...]`.
- Runner emits warning lines naming the missing rels but the assertion shape doesn't consume them.
- Subsequent subtests (search-addresses, get-address) are skipped because subtest 1's failure cascades.
- The fix in P007 (status-branches in search/get subtests) is not exercised in CI runs where subtest 1 fails first; P007 verification is blocked.

## Workaround

When CI is red on subtest 1, in order:

1. Probe the upstream from a local shell with the current `RAPIDAPI_KEY`: `curl -H "x-rapidapi-key: $RAPIDAPI_KEY" -H "x-rapidapi-host: addressr.p.rapidapi.com" https://addressr.p.rapidapi.com/ | jq`. If the response is `{"message":"Invalid API key"}` or similar auth error, the key is stale.
2. Rotate / refresh the GitHub Actions `secrets.RAPIDAPI_KEY` to a valid subscription key (RapidAPI dashboard → subscription → key).
3. Re-run the failing workflow; subtest 1 should pass once the upstream returns a valid root response with `_links`.

If the key is verified valid and the upstream is still missing rels in the local probe, the root cause is genuine upstream rel-drift (the original diagnosis). Cross-reference `../addressr` source to confirm which rels the deployed addressr instance actually serves, and report upstream to the addressr core repo if a rel was retired without notice.

## Impact Assessment

- **Who is affected**: maintainers shipping any change through CI when the upstream API rel set drifts.
- **Frequency**: every push during a degraded-upstream window.
- **Severity**: Medium. CI red blocks all push:watch / release:watch drains. The actual upstream state is observable but the test assertion shape doesn't surface it as the primary error.
- **Analytics**: N/A.

## Root Cause Analysis

### Confirmed Root Cause

The assertion in `test/server.test.mjs:51` hard-codes the expected tool list against the union of all possible dynamic registrations (search + get + health). When the upstream advertises a strict subset of the canonical rel set, the dynamic-registration code (correctly) skips the missing rels, but the test assertion (incorrectly) treats the union as mandatory. The test contract assumes the upstream advertises every rel the proxy knows how to map, which is not guaranteed by the HATEOAS contract.

### Fix Strategy

The corrected root-cause analysis (above) makes the immediate remediation distinct from the structural one.

**Immediate (unblock CI)**: rotate `secrets.RAPIDAPI_KEY` to a valid subscription key and re-run the workflow. CI green confirms the diagnosis.

**Structural (long-term)**: harden `getRoot()` in `src/server.mjs` so an auth-error response does not silently masquerade as "zero rels advertised". Options:

1. **Server-level: detect missing `_links` and throw** — in `getRoot()` after `fetchLink(API_URL)`, assert the response has a `_links` field (or HAL-equivalent). If absent, throw `"Addressr API root returned no _links; check RAPIDAPI_KEY validity (response body: ...)"`. The dynamic registration's `try/catch` catches it and falls back to "only health + get-address". The test surface (subtest 1) still fails on the missing tools, but the warning message names the cause (auth error vs genuine rel drop). **Recommended.**

2. **Server-level: detect non-200 status before parsing** — check HTTP status before relying on the body shape. RapidAPI returns 401/403 on invalid keys; the current code path silently parses the error body as JSON. Cleaner separation than (1) but requires reaching into the `waycharter-client` fetch layer.

3. **Test-level: assert minimum tool subset** — change subtest 1 to assert only the baseline (`health` + `get-address`). Decouples from optional rels. Caveat: defeats the test's regression check for when the upstream legitimately drops a rel. Cheapest but loses signal.

4. **Test-level: pre-check + skip with reason** — pre-fetch the upstream root; if `_links` missing OR auth error, skip subtest 1 with TAP `skip` and a clear reason. Preserves regression check when upstream is healthy; doesn't fail loudly on auth drift.

5. **Mock the upstream** — static API-root fixture for subtest 1. Decouples test from live upstream entirely. Heavier; against ADR-005 (live RapidAPI per JTBD-102 persona constraints).

6. **CI pre-flight** — separate workflow step that probes the upstream and fails with a clear "RAPIDAPI_KEY appears invalid" message before the test suite runs. Heaviest; adds CI complexity.

Option 1 (server-level detect-missing-_links-and-throw) is the natural fit. It addresses the structural silent-degradation bug, surfaces auth failure as a clear error in the test log, and preserves the test as a regression check for genuine upstream rel drops. Implementing it in `src/server.mjs` makes the fix benefit all callers of the dynamic registration code, not just this test.

### Recommendation

Pair option 1 (structural fix in `getRoot()`) with the immediate GHA secret rotation. The TDD shape: write a unit test for `getRoot()` that asserts on an auth-error response body shape, then implement the throw.

### Investigation Tasks

- [x] Cross-check upstream rel set against `../addressr` source — confirmed all 4 search-* rels still present
- [x] Reproduce locally — stale RAPIDAPI_KEY returns `{"message":"Invalid API key"}`, identical observable to CI
- [ ] Rotate `secrets.RAPIDAPI_KEY` in GitHub Actions; re-run CI to confirm immediate fix
- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems
- [ ] Decide between options 1-6 (recommendation: option 1 server-level detect-missing-_links-and-throw)
- [ ] Verify P007 status-branches once subtest 1 is fixed (currently blocked by subtest 1 cascade)
- [ ] Consider whether to report the silent-degradation behaviour to `../addressr` core (the upstream API serving auth-error bodies that look like empty-root HAL responses is a separable upstream concern)

## Fix Released

**Date**: 2026-06-02
**Mechanism**: GitHub Actions `secrets.RAPIDAPI_KEY` rotated to a key with an active RapidAPI subscription (source: `../addressr/.env` `RAPIDAPI_KEY` — owner key, verified active by direct curl probe returning HTTP 200 with rels in `Link` header and by local integration test 4/4 pass).
**Verification**: CI workflow run [`26808770054`](https://github.com/mountain-pass/addressr-mcp/actions/runs/26808770054) re-ran post-rotation: `build-and-test` success, `release` success.

**Final root cause** (the diagnosis went through four iterations — see Root Cause Analysis section above):

The real failure: the addressr-mcp project's RapidAPI subscription on the original GHA key had lapsed since 2026-05-13. The upstream returned **HTTP 4xx** with a JSON error body that lacked `_links`. `src/server.mjs:127-130` `getRoot()` then succeeded silently with `advertisedRels = Set([])`, causing the dynamic registration to skip all `search-*` tools and subtest 1's tool-list assertion to fail.

The earlier hypotheses (upstream rel drop, stale-but-valid key, broken `Link`-header parsing) all failed verification against direct evidence:
- `../addressr` source confirms rels are still advertised (in source code).
- Live probe with the owner-subscription key returns HTTP 200 with all 4 search-* rels in the HTTP `Link` header — `waycharter-client` parses them correctly (4/4 local integration test pass).
- The body `{}` shape is intentional; rels live in the header per RFC 5988.

**Outstanding structural concern (deferred, candidate for new ticket)**:

`getRoot()` silently masquerading a 4xx-with-error-body as "0 rels advertised" cost three rounds of misdirected diagnosis this session. The defense-in-depth fix is option 1 of the Fix Strategy section: detect missing `_links` (or non-200 status, or empty body) in `getRoot()` and throw a clear `"Addressr API root returned no _links / non-200 / empty body; check RAPIDAPI_KEY subscription state (response: ...)"`. Captured here as a deferred follow-up; consider splitting into its own ticket if/when picked up — the current verification is on the immediate remediation (key rotation), not on the structural guard.

## Related

- **P007** (`docs/problems/verifying/007-ci-integration-test-cryptic-json-parse-on-upstream-error.md`) — sibling CI-integration-test failure mode (cryptic JSON parse). P007's fix only fires in subtest 2+ which CI never reaches because P011 fails subtest 1 first; P007 verification is blocked by P011.
- **P009** (`docs/problems/open/009-mcp-missing-postcode-state-locality-endpoints.md`) — sibling upstream-API-coverage ticket. P009 is about missing get-* endpoints; P011 is about missing search-* link relations. Both expose drift in the upstream rel surface.
- **Surfaced via**: `/wr-itil:work-problems` Step 6.5 push:watch halt on CI run 26800948615 (2026-06-02).
