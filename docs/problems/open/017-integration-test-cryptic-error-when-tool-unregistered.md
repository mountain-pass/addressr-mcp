# Problem 017: integration test cryptic error when search tool unregistered (getRoot-degraded path)

**Status**: Open
**Reported**: 2026-06-03
**Priority**: 6 (Medium) - Impact: 3 x Likelihood: 2 (sibling of P007; fires only when getRoot degrades AND a search-* tool is then called - narrower than P007's registered-tool path but same misleading-surface class)
**Origin**: internal
**Effort**: S (test-file-only diagnostic guard)
**Type**: technical
**JTBD**: JTBD-102

## Description

The integration suite (`test/server.test.mjs`) subtests 2/3 ("searches for addresses", "retrieves address details") throw the cryptic `Unexpected token 'M', "MCP error "... is not valid JSON` when a `search-*` tool is NOT registered. This is a distinct path from P007: P007's `envelope.status !== 200` branch (lines 85/110/133) only fires when the tool IS registered and the upstream returns a non-200 envelope. When `getRoot()` degrades (e.g. upstream API root returns 403 -> no `search-*` rels advertised -> dynamic discovery skips the tool), the tool is never registered; `client.callTool({name:'search-addresses'})` returns an MCP "tool not found" error STRING, and `JSON.parse("MCP error ...")` throws the cryptic `Unexpected token 'M'` BEFORE P007's status-branch is ever reached.

Observed live 2026-06-03: during a RAPIDAPI_KEY subscription lapse this session, CI run 26862011106 showed subtest 1 failing with `Expected tool 'search-addresses' in ["health","get-address","get-locality","get-postcode","get-state"]` (the getRoot-degraded P012 case) AND subtests 2/3 failing with the cryptic `Unexpected token 'M', "MCP error"`. The actual cause (RAPIDAPI_KEY unsubscribed -> getRoot degraded -> tools unregistered) was buried.

## Symptoms

- Subtests 2/3 throw `Unexpected token 'M', "MCP error "... is not valid JSON` at the `JSON.parse(text)` call when the upstream API root is degraded (403/no rels).
- The error stack points at `JSON.parse (<anonymous>)`, not at the upstream subscription state or the unregistered tool.
- P007's diagnostic branch cannot fire because there is no JSON envelope to inspect - the failure is upstream of the envelope, at the MCP-SDK tool-not-found response.

## Workaround

When CI is red with `Unexpected token 'M', "MCP error"`, check whether the search-* tools are registered (subtest 1 "lists kebab-case addressr tools" will also be red) and probe the upstream API root with the current RAPIDAPI_KEY (a 403 confirms the getRoot-degraded cause). Cross-reference P012 (server-side getRoot guard) + the briefing entry on RAPIDAPI_KEY subscription lapse.

## Impact Assessment

- **Who is affected**: maintainers diagnosing red CI after a RAPIDAPI subscription lapse or upstream rel drop.
- **Frequency**: every time getRoot degrades AND the live subtests run (less frequent than P007's path, which fires on any registered-tool non-200).
- **Severity**: Medium. Same misleading-surface class as P007; complements it. Not a correctness bug.
- **Analytics**: N/A.

## Root Cause Analysis

### Confirmed Root Cause

`test/server.test.mjs` subtests 2/3 call `JSON.parse(text)` on the MCP tool-call result content. When the tool is unregistered, the MCP SDK returns an error result whose text content is a human-readable "MCP error ..." string, not a JSON envelope. `JSON.parse` on a non-JSON string throws `Unexpected token 'M'`. P007's status-branch is downstream of this `JSON.parse` and never executes. The test has no guard for "the result is an MCP error string, not an envelope".

### Fix Strategy

Test-level diagnostic guard (extends P007's pattern to the unregistered-tool path): before `JSON.parse`, detect the non-JSON shape (text does not start with `{` or `[`) and throw a clear message naming the likely cause - the tool was not registered because getRoot advertised no rels (check RAPIDAPI_KEY subscription state; see P012). Extract a small `parseEnvelopeOrExplain(text, toolName)` helper to a testable module so the diagnostic logic carries a unit test.

### Investigation Tasks

- [x] Confirm the failure is upstream of P007's status-branch (it is - `JSON.parse` throws before line 85)
- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P007 (registered-tool non-200 path - this is the unregistered-tool sibling), P012 (server-side getRoot guard that produces the degraded state).

## Related

- captured + fixed in the same session (2026-06-03) during the post-AFK-loop interactive work; surfaced from CI run 26862011106's failure shape during the RAPIDAPI_KEY recovery.
- P007 (`docs/problems/verifying/007-...md`) - sibling diagnostic-clarity ticket; covers the registered-tool path.
- P012 (`docs/problems/closed/012-...md`) - the server-side getRoot guard whose degraded-state output this test now names.
