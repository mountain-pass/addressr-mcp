# Problem 012: getRoot() silent-degradation on non-200 or empty-_links response

**Status**: Closed
**Reported**: 2026-06-02
**Closed**: 2026-06-03 (verified at /wr-itil:review-problems 2026-06-03: in-session unit-test `surfaces upstream cause when API root returns 4xx + JSON error body (P012)` in test/dynamic-tools.test.mjs confirmed RED -> GREEN with diagnostic vocabulary `RAPIDAPI_KEY` + `subscription` in stderr; all 11 unit tests pass)
**Priority**: 6 (Medium) - Impact: 2 (silent failure of upstream auth/subscription state cascades to cryptic test failures and wasted diagnosis time) x Likelihood: 3 (recurs whenever an auth/subscription/rate-limit-state change happens between deploys)
**Origin**: internal
**Effort**: S (single function change in `src/server.mjs:127-130` + 1-2 unit test cases stubbing the upstream-root response shape)
**WSJF**: 6.0
**Type**: technical

## Description

`src/server.mjs:127-130` `getRoot()` silently succeeds with `advertisedRels = Set([])` when the upstream response is HTTP 4xx with a valid-JSON body that lacks a `_links` array (e.g. `{"message":"Invalid API key"}` or `{"message":"You are not subscribed to this API."}`). The dynamic tool registration then skips every `search-*` tool that depends on a missing rel, the integration test's tool-list assertion fails with the cryptic shape `Expected tool 'search-addresses' in [...]`, and the actual cause (auth/subscription degraded) is buried beneath a categorical symptom that doesn't name the upstream HTTP status.

This is the defense-in-depth concern preserved in P011's Fix Strategy section after the immediate P011 remediation (GHA secret rotation) shipped. P011 verification is on the secret rotation, not on this structural guard. Split into its own ticket per concern-boundary (the silent-degradation bug is a separate concern from "this session's CI red on subscription lapse").

## Symptoms

- `getRoot()` returns successfully with `root.links()` -> `[]` when upstream returned 4xx + JSON error body.
- `console.warn("API root does not advertise <rel>; skipping <tool>")` fires for every rel in `REL_TO_TOOL` (per `src/server.mjs:145-148`), filling the test log with apparent rel-drift signal that misdirects diagnosis.
- Integration test `test/server.test.mjs` subtest 1 fails with `Expected tool 'search-addresses' in ["health","get-address","get-locality","get-postcode","get-state"]`, naming a test-code symptom rather than the upstream HTTP status.
- 4 diagnosis iterations were spent against falsified hypotheses (upstream dropped rels / stale key / subscription lapsed / Link-header parsing broken) before iter-4 curl probe surfaced the actual response shape — three CI red cycles before resolution.

## Workaround

Until the structural guard ships: cross-reference the upstream behaviour by curling the API root with the current `RAPIDAPI_KEY`:

```bash
curl -isS -H "x-rapidapi-key: $RAPIDAPI_KEY" -H "x-rapidapi-host: addressr.p.rapidapi.com" https://addressr.p.rapidapi.com/ | head
```

A 200 with an empty body and rels in the `Link` header is healthy. A 4xx with a `{"message":"..."}` body and no `Link` header is the silent-degradation case this ticket addresses.

## Impact Assessment

- **Who is affected**: maintainers and CI when the upstream key state changes (subscription lapse, rate limit, key invalidation).
- **Frequency**: observed once this session (P011); will recur whenever the upstream auth/subscription state degrades unobserved.
- **Severity**: Medium. Wastes diagnosis cycles (4 iterations + 3 CI red cycles this session). Doesn't corrupt or risk production behaviour — the proxy degrades gracefully to "health + get-address only", which is correct degraded behaviour given the ambiguous input; the failure is in NOT surfacing the upstream cause.

## Root Cause Analysis

### Confirmed Root Cause

`src/server.mjs:127-130`:

```js
let root;
let advertisedRels = new Set();
try {
  root = await getRoot();
  const allLinks = root.links();
  advertisedRels = new Set(allLinks.map((l) => l.rel));
} catch (err) {
  console.warn(`Warning: Could not fetch Addressr API root (${err.message}). Falling back to registering only health and get-address tools.`);
}
```

`fetchLink(API_URL)` (called from `getRoot()`) returns a parsed response object regardless of HTTP status — it only throws on transport-layer errors (network unreachable, malformed response). When the upstream returns 4xx with a parseable JSON error body, `getRoot()` succeeds, `root.links()` returns `[]` (no `_links` in body, no `Link` header from the auth-error proxy response), and `advertisedRels` is populated as an empty `Set`. The `try/catch` cannot distinguish "fetch failed entirely" from "fetched a 4xx error response" because the upstream's error responses are themselves valid JSON.

### Fix Strategy

**Option 1 (recommended, from P011)**: in `getRoot()` (or immediately after the call in the dynamic registration block), assert that the response has at least one rel — checking BOTH `root.links()` length AND the underlying HTTP response status / Link header. If `links.length === 0` AND the response was 4xx/5xx OR the body lacks `_links` AND the response has no `Link` header, throw `"Addressr API root returned no rels; check RAPIDAPI_KEY subscription state (response body: <body>, status: <status>)"`. The existing `try/catch` at lines 131-136 catches the throw and logs the diagnostic message. Falls back to "health + get-address only" as today, but the warning names the cause.

**Option 2**: detect non-200 HTTP status before parsing body. Cleaner separation from rel-detection but requires reaching into the `waycharter-client` fetch layer to surface status to the caller.

**Option 1** is preferred — it lives at the call site (`src/server.mjs:128`) without modifying the client library, and it surfaces a clear error message that names the likely cause (subscription state).

### TDD shape

1. Write a unit test in `test/dynamic-tools.test.mjs` (or new `test/get-root.test.mjs`): stub `fetchLink(API_URL)` to return a `root` whose `links()` returns `[]`. Assert `getRoot()` (or the dynamic-registration block) throws an error whose message contains `"RAPIDAPI_KEY"` and `"subscription"` (or equivalent diagnostic vocabulary).
2. Add the throw at `src/server.mjs:128-129` (after `root.links()` returns empty).
3. Verify the existing `try/catch` at lines 131-136 catches it and logs the diagnostic warning.
4. Update the warning template at line 132 to include the response body / status when available.

### Investigation Tasks

- [x] Re-rate Priority and Effort at next /wr-itil:review-problems (held at 6.0 / S)
- [x] Decide between options 1 and 2 (option 1 chosen — guard at call site surfaces RAPIDAPI_KEY + subscription vocabulary via existing catch + console.warn)
- [x] Write the failing test against the empty-links case (`test/dynamic-tools.test.mjs` — `surfaces upstream cause when API root returns 4xx + JSON error body (P012)`)
- [x] Implement the throw + diagnostic warning (`src/server.mjs` — throws on `allLinks.length === 0`, existing catch surfaces the message)
- [ ] Confirm P007 status-branches still fire on the search-addresses subtest after the guard is in place (the guard only fires when registration produces zero search rels; subtests 2/3 still need P007's per-call status-branches for the running case)

## Fix Released

Awaiting release. Fix committed in this iteration; release deferred to orchestrator Step 6.5. Pre-release exercise evidence:

- `node --test test/dynamic-tools.test.mjs` — all 11 tests pass, including the new `surfaces upstream cause when API root returns 4xx + JSON error body (P012)` case which asserts both fallback semantics (health + get-address registered, search-* skipped) and diagnostic vocabulary (`RAPIDAPI_KEY` + `subscription` in stderr).
- Test confirmed RED before implementation, GREEN after — TDD discipline satisfied.
- Architect review: PASS (no new ADR required; change clarifies ADR-002's stated failure handling).

## Related

- **P011** (`docs/problems/verifying/011-...md`) — parent ticket; immediate fix (GHA secret rotation) shipped; this ticket carries forward the structural concern that was deferred there. Splitting per P016 concern-boundary: P011 verifies "key rotation unblocked CI"; P012 verifies "getRoot guard surfaces cause of empty-rels".
- **P007** (`docs/problems/verifying/007-...md`) — sibling diagnostic-clarity ticket. P007 added status-branches in `test/server.test.mjs` for subtests 2/3 (per-call status); P012 adds a status-branch in `src/server.mjs` for the registration-time case. Both surfaces complement: P007 catches "tool was registered but call returns non-200"; P012 catches "tool was silently NOT registered because root response had no rels".
- **Surfaced via**: `/wr-retrospective:run-retro` after `/wr-itil:work-problems` halt + P011 4-iteration diagnosis cycle (2026-06-02).
