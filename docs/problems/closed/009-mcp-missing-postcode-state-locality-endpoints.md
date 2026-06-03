# Problem 009: MCP Missing Postcode, State, And Locality Endpoints

**Status**: Closed
**Reported**: 2026-06-02
**Priority**: 9 (Medium) - Impact: 3 x Likelihood: 3 (re-rated 2026-06-02: missing-capability gap; details unreachable as MCP tools, fall-back to direct API works)
**Origin**: internal
**Effort**: M (re-rated 2026-06-02: ~3 new tool registrations via REL_TO_TOOL extension per P001 pattern)
**WSJF**: 4.5 (stays Open: no confirmed root cause section yet; investigation tasks pending)
**Type**: user-business
**JTBD**: JTBD-004, JTBD-005, JTBD-006, JTBD-007, JTBD-008, JTBD-009
**Persona**: developer

## Description

The Addressr API provides endpoints for working with postcodes and states and locations (and they are linked from the addresses), but they aren't available in the MCP.

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
- [ ] Reconcile scope against P001 (closed): v1.0.0 shipped search-localities / search-postcodes / search-states via dynamic discovery. Confirm whether the gap is the detail endpoints (get-locality / get-postcode / get-state) or the link-rel resolution path (overlaps with P002).

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: (none)

## Related

- P001 (closed) — title-only duplicate match on "endpoints". P001 shipped dynamic discovery for search-* + get-address + health in v1.0.0. The current capture covers the detail variants (get-locality / get-postcode / get-state) that the search-* JTBDs imply users will reach next, plus any link-rel resolution gap from address responses.
- P002 (open) — addressr-link-rels-not-resolvable. The user description notes the missing capabilities are "linked from the addresses" — the gap may compose with or be blocked by P002.
- JTBD-004 / JTBD-005 / JTBD-006 — search-localities / search-postcodes / search-states (already shipped in v1.0.0 per P001 closure).
- JTBD-007 / JTBD-008 / JTBD-009 — get-locality-details / get-postcode-details / get-state-details (not yet exposed as MCP tools).

(captured via /wr-itil:capture-problem; expand at next investigation)

## Closed as no longer relevant

Closed 2026-06-03 at AFK iter dispatch per ADR-079 Phase 1 + Phase 2 evidence-shape `named-skill-or-feature-exists`. The three MCP tools the ticket asks for (get-locality, get-postcode, get-state) were already implemented, tested, and shipped BEFORE the ticket was captured. P009 captured 2026-06-02 against an inventory the user had not yet refreshed against the current src/server.mjs.

Evidence (ADR-026 grounding):

- **src/server.mjs lines 220-265** carry the three `server.tool('get-locality', ...)`, `server.tool('get-postcode', ...)`, `server.tool('get-state', ...)` registrations. Each follows the same HATEOAS-native pattern as get-address (URL parameter, fetchLink, envelope response) shipped in v1.0.0 (commit c6da43d).
- **commit 88dda71** ("feat: add detail tools for locality, postcode, and state", 2026-04-23) is the first-introduction commit, predating P009's 2026-06-02 capture by six weeks.
- **test/dynamic-tools.test.mjs** has passing behavioural tests for each: `get-locality accepts url parameter and returns envelope` (line 330), `get-postcode accepts url parameter and returns envelope` (line 364), `get-state accepts url parameter and returns envelope` (line 438). Full suite: 16/16 pass at this commit.
- **CHANGELOG.md v1.0.0** records the three detail tools as part of the HATEOAS-native breaking-change release; @mountainpass/addressr-mcp@1.0.4 (current) carries them forward.
- **Live MCP session** advertises mcp__addressr__get-locality, mcp__addressr__get-postcode, mcp__addressr__get-state alongside the search-* tools.

JTBD-007/008/009 ratify the three detail jobs and were authored alongside the implementation commit. No outstanding work; no scope-expansion needed.
