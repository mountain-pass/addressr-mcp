# Problem 004: MCP context model not surfaced in user docs

**Status**: Open
**Reported**: 2026-05-13
**Priority**: 8 (Medium) — Impact: Minor (2) x Likelihood: Likely (4)
**Effort**: S
**WSJF**: 8.0
**Type**: user-business

## Description

This information is not adequately surfaced in the user docs (like the README).

Context: prospective adopters ask how the MCP server handles the 13M-row G-NAF dataset without loading it into the AI client's context window. The answer — that the MCP is a thin proxy exposing narrow `search-*` and `get-*` tools, and that addresses are fetched on demand from the Addressr API — is not explained in the README's user-facing material. The README jumps from "Quick Start" / config snippets into "Key Safety" without explaining the context model that makes the MCP cheap to use.

Adopters end up asking the maintainer directly (e.g. via inbound enquiries) instead of finding the answer in the README. That is wasted maintainer time and a friction signal for adoption.

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

- [x] Re-rate Priority and Effort at next /wr-itil:review-problems (2026-05-13: Impact 2 × Likelihood 4 = 8 Medium; Effort S; WSJF 8.0)
- [ ] Investigate root cause
- [ ] Create reproduction test

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: (none)

## Related

(captured via /wr-itil:capture-problem; expand at next investigation)
