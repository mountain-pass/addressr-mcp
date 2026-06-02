# Problem 009: MCP Missing Postcode, State, And Locality Endpoints

**Status**: Open
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
