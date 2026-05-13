# Problem 007: CI integration test cryptic JSON parse on upstream error

**Status**: Open
**Reported**: 2026-05-14
**Priority**: 3 (Medium) - Impact: 3 x Likelihood: 1 (deferred - re-rate at next /wr-itil:review-problems)
**Effort**: M (deferred - re-rate at next /wr-itil:review-problems)
**Type**: technical

## Description

`test/server.test.mjs` integration subtests fail with `Unexpected token 'M', "MCP error "... is not valid JSON` when the upstream RapidAPI returns a non-200 status (observed: 403 "You are not subscribed to this API", 429 "Too many requests"). The error message buries the actual cause inside an MCP-error-wrapped JSON parse failure, making the CI red surface look like a test-code bug rather than an upstream-API state issue.

Reproduced 2026-05-13 in workflow run 25802567134 after the RapidAPI key in `secrets.RAPIDAPI_KEY` was rotated locally but the corresponding GitHub Actions secret was not updated. Three of four integration subtests failed (`searches for addresses`, `retrieves address details`, and via cascade the suite parent); only the `lists addressr tools` and `reports health` subtests passed because they do not hit the live upstream API (the former queries the local server's tool list; the latter has a fallback path per `src/server.mjs` lines 185-190).

The test correctness contract from P003 is met - the suite does exercise the local server end-to-end - but the failure surface is misleading. A maintainer reading the CI log would reasonably suspect the test or the local server before suspecting the upstream API state.

## Symptoms

- CI shows `not ok 2 - searches for addresses and returns {status, headers, body} envelope` with `Unexpected token 'M', "MCP error "... is not valid JSON`.
- The error stack points at `JSON.parse (<anonymous>)` and the test file line, not at the upstream HTTP status.
- The `health` subtest passes (it has a fallback) while `searches for addresses` and `retrieves address details` fail, which is itself a confusing signal.
- The actual upstream status (403, 429, etc.) is not surfaced in the test failure message.

## Workaround

When CI is red on integration tests, check the RapidAPI subscription state and the GitHub Actions secret freshness before suspecting test code. Reproduce locally with the suspect key set in `.env` and the assistant's MCP integration; the `mcp__addressr__*` tools will surface the upstream status directly in their response envelope (status 403 / 429 / etc.) which is more diagnostic than the test's JSON parse error.

## Impact Assessment

- **Who is affected**: maintainers debugging red CI runs after credential rotation, RapidAPI subscription changes, or upstream rate limiting.
- **Frequency**: every time the upstream API state changes without a corresponding CI secret update. Observed at least twice in this project's history.
- **Severity**: Medium. CI is red and the actual cause is non-obvious; the workaround requires knowing where to look.
- **Analytics**: N/A.

## Root Cause Analysis

### Confirmed Root Cause

`test/server.test.mjs` asserts on the response envelope shape (`status`, `headers`, `body`) but does not branch on the envelope's `status` field. When the local MCP server propagates an upstream error (the proxy contract works correctly - RapidAPI's 403 round-trips faithfully through `toEnvelope()`), the response envelope's `status` is 403 not 200, and the body is `{"message": "You are not subscribed to this API."}`. The test code then tries to extract a search-result list from the body and fails - but instead of failing with a "expected 200, got 403" message, it fails inside the MCP SDK's response-unpacking code, which throws the JSON parse error on an MCP-wrapped error string.

### Fix Strategy

Several options:

1. **Test-level**: branch in `test/server.test.mjs` on `response.status` before asserting on body shape. When status is 4xx/5xx, fail with a clear message naming the upstream status and message. Cheapest fix; preserves P003's local-server-exercise contract while making upstream-state failures diagnosable.

2. **Server-level**: have the local MCP server detect non-200 upstream responses and return a structured error envelope that the test (and any client) can match on, instead of relying on the test to introspect the envelope. Heavier; requires deciding on an error-envelope contract.

3. **CI-level**: pre-flight check the upstream API state before the integration test job runs (a single `curl` against `health` with the secret). When pre-flight fails, skip the suite with a clear "upstream unavailable" reason. Heaviest; adds CI complexity.

Option 1 is the natural fit - test code owns the assertion surface, and a single `if (response.status !== 200) throw new Error("...")` branch suffices.

### Investigation Tasks

- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems
- [ ] Confirm `response.status` is accessible to the test before the JSON parse path is taken (test framework specifics).
- [ ] Draft the test-level branch as option 1.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P003 (the rewritten test that exercises the local server end-to-end; this ticket extends P003's failure surface).

## Related

- captured via /wr-itil:capture-problem during /wr-retrospective:run-retro 2026-05-14
- workflow run 25802567134 (the red CI run from P004's release attempt)
- workflow run 25804611114 (the green re-run after the secret was rotated)
- test/server.test.mjs (the suite that produces the cryptic error)
- src/server.mjs lines 185-190 (the `health` fallback path that explains why health passes but search-addresses fails)
