# Problem 003: server.test.mjs tests the wrong target and has drifted upstream

**Status**: Open
**Reported**: 2026-04-24
**Priority**: 12 (High) — Impact: Moderate (3) x Likelihood: Likely (4)
**Effort**: M
**WSJF**: 6.0

## Description

`test/server.test.mjs` was intended as a live integration test but it connects to `https://mcp.rapidapi.com` (the RapidAPI-hosted MCP aggregator that auto-generates tools from the Addressr OpenAPI spec), **not** to the local MCP server built by this package. Its name implies it tests "the server" but it actually exercises the upstream RapidAPI aggregator.

Two compounding problems make the suite red:

1. The hosted aggregator's auto-generated tool names drifted upstream between 2026-04-07 (last green CI at commit `99e0b5b`) and 2026-04-24. Old names: `addresses`, `addressesaddressId`. Current names: `searchAddresses`, `getAddress`, `searchLocalities`, `getPostcode`, `searchStates`, `getState`, `searchPostcodes`, `healthCheck` — all camelCase.
2. The HATEOAS refactor in commit `c6da43d` changed the test's assertions to our **local** MCP server's kebab-case names (`search-addresses`, `get-address`) and our new `{status, headers, body}` envelope shape. The hosted aggregator returns raw JSON and never adopted our naming.

All three sub-tests (`lists addressr tools`, `searches for addresses`, `retrieves address details`) now fail in multiple independent ways.

## Symptoms

- `npm run test:integration` fails against live RapidAPI when a valid `RAPIDAPI_KEY` is present.
- `lists addressr tools` asserts `search-addresses` / `get-address`; hosted aggregator returns `searchAddresses` / `getAddress`.
- `searches for addresses` throws `MCP error -32603: Internal error` because the tool name `search-addresses` does not exist on the hosted aggregator.
- `retrieves address details` fails for the same tool-name reason and would also fail envelope-shape assertions if it got past tool discovery.
- Default `npm test` was narrowed at commit `7d35469` to unit tests only (`test:unit`) so CI stays green while this ticket is open.

## Workaround

`npm test` now runs `test:unit` only (commit `7d35469`). The broken suite remains invokable via `npm run test:integration` for anyone exercising the RapidAPI path by hand.

## Impact Assessment

- **Who is affected**: maintainers of this package. The v1.0.0 release attempt on 2026-04-24 produced two failed pipeline runs (workflow IDs `24871083513` and `24871155125`) before the test script was narrowed.
- **Frequency**: every time the hosted aggregator's auto-generated names drift (history suggests at least once per minor Addressr API change). The broken envelope-shape assumption is permanent until the test is rewritten.
- **Severity**: Medium. Release flow is already sidelined via `test:unit` and the suite is preserved for manual use; no live consumer is affected.
- **Analytics**: N/A.

## Root Cause Analysis

The `test/server.test.mjs` file is semantically ambiguous. Its filename suggests it tests "the server" (implicitly, this package's local MCP server), but the code uses `StreamableHTTPClientTransport` pointing at `https://mcp.rapidapi.com`. Two distinct bugs compounded:

- **Wrong target.** The test should exercise our local MCP server end-to-end (spawn it, let it forward to RapidAPI, assert on its response envelope and tool names). Instead it hits the upstream aggregator that has no relationship to our code at all — it's auto-generated from the Addressr OpenAPI spec by RapidAPI.
- **Mismatched assertions.** The HATEOAS refactor assumed the test exercised our server and updated assertions accordingly (kebab-case names, envelope shape). The change was consistent with the rest of the refactor but wrong about what this specific test was testing.

### Two fix directions

a. **Rewrite to test our local server** — use `StdioClientTransport` spawning `node src/server.mjs`, set `RAPIDAPI_KEY` on the child env, hit the real Addressr API through our server, assert on our tool names and envelope shape. This is the proper integration test for this package.

b. **Keep testing the RapidAPI aggregator, decouple assertions** — update assertions to match the current hosted tool names (`searchAddresses`, `getAddress`, etc.) and raw-JSON response shape. Reinterpret the test as a smoke test that our RapidAPI key still works and the hosted aggregator is reachable. Accept recurring maintenance when the aggregator drifts.

Option (a) is the structurally right choice for a package named `server.test.mjs`. Option (b) is lower effort and preserves the upstream-health smoke-test signal.

### Direction Decision

**Chosen: (a)** — rewrite the test to exercise our local MCP server end-to-end via `StdioClientTransport` spawning `node src/server.mjs`. Decision recorded by user 2026-04-25.

Rationale: a file named `server.test.mjs` should test our server, not an upstream aggregator the package has no relationship with. The recurring drift maintenance under (b) is not worth preserving when the test name actively misleads readers about what is being exercised.

Implications:
- The hosted-aggregator drift signal is dropped. The optional `scripts/fetch-hosted-mcp-tool-names.mjs` CI probe (an early-warning probe for hosted-aggregator drift) is therefore **out of scope** under (a) — drift in the hosted aggregator no longer affects this package's tests.
- The test will spawn a child `node src/server.mjs` process per test run with `RAPIDAPI_KEY` injected on the child env. Tests skip cleanly when `RAPIDAPI_KEY` is absent.

### Investigation Tasks

- [x] Decide between fix direction (a) or (b). → **(a)** chosen 2026-04-25.
- [ ] Write the `StdioClientTransport`-based test that spawns `node src/server.mjs`, asserts on our kebab-case tool names (`search-addresses`, `get-address`, …) and the `{status, headers, body}` envelope shape; skip the suite when `RAPIDAPI_KEY` is absent.
- [ ] Restore default `npm test` to run the integration suite once it's green (revert the narrowing from commit `7d35469`).
- [ ] (Out of scope, see Direction Decision) ~~Consider whether a `scripts/fetch-hosted-mcp-tool-names.mjs` check belongs in CI as early warning for future aggregator drift.~~

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: (none)

## Related

- ADR-005 (Live API Integration Testing) — defines the testing workflow this suite was meant to fulfil.
- Commit `c6da43d` — HATEOAS refactor that made the test's assertions worse.
- Commit `7d35469` — pipeline-fix commit that narrowed default `npm test` to `test:unit`.
- Workflow runs `24871083513` and `24871155125` — the two red CI runs during the v1.0.0 release attempt.
