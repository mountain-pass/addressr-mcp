# Problem 004: MCP context model not surfaced in user docs

**Status**: Verification Pending
**Reported**: 2026-05-13
**Priority**: 8 (Medium) — Impact: Minor (2) x Likelihood: Likely (4)
**Effort**: S
**WSJF**: 16.0
**Type**: user-business

## Description

This information is not adequately surfaced in the user docs (like the README).

Context: prospective adopters ask how the MCP server handles the 13M-row G-NAF dataset without loading it into the AI client's context window. The answer — that the MCP is a thin proxy exposing narrow `search-*` and `get-*` tools, and that addresses are fetched on demand from the Addressr API — is not explained in the README's user-facing material. The README jumps from "Quick Start" / config snippets into "Key Safety" without explaining the context model that makes the MCP cheap to use.

Adopters end up asking the maintainer directly (e.g. via inbound enquiries) instead of finding the answer in the README. That is wasted maintainer time and a friction signal for adoption.

## Symptoms

- Prospective adopters ask the maintainer directly how the MCP server avoids loading 13M G-NAF addresses into the AI client's context.
- Readers of the README cannot answer "how does this stay cheap?" without inspecting `src/server.mjs` or running the tools.
- The README's existing sections (Quick Start, Key Safety, Available Tools, HATEOAS Workflow, Response Format) describe *what* the tools do but never name the proxy / on-demand-fetch design that makes the cost model work.

## Workaround

None for adopters — they ask the maintainer or read the source. The cost is borne by the maintainer (inbound enquiries) and by lost adoption signal from prospects who don't bother to ask.

## Impact Assessment

- **Who is affected**: Prospective and new adopters of `@mountainpass/addressr-mcp`; the maintainer (inbound enquiry load).
- **Frequency**: Likely once per prospective adopter who reads the README — the question is the natural first concern for anyone weighing a large-dataset MCP.
- **Severity**: Minor (2) — onboarding friction; no service or published-feature impact.
- **Analytics**: N/A (no instrumentation on README readership).

## Root Cause Analysis

### Confirmed Root Cause

The README documents the tool surface (`Available Tools`, parameters, response shape) and the navigation pattern (`HATEOAS Workflow`), but never states the **context model** explicitly. A reader can deduce it by reading carefully, but the design's headline property — that addresses stay on the Addressr API and only matched results enter context — is not surfaced as a first-class concept.

Two contributing factors:

1. **Missing "How it works" framing.** There is no section between the lead paragraph and `Quick Start` (or between `Available Tools` and `HATEOAS Workflow`) that names the proxy / on-demand-fetch model. Existing sections answer "what does this expose?" but not "how does this stay cheap?".
2. **Implicit-vs-explicit framing.** The fact that search-tools return paginated results and detail-tools fetch one record at a time is structurally obvious from the schemas, but the *consequence* — that the AI client's context footprint is tool-schemas + per-call results, never the dataset — is never named.

### Fix Strategy

Add a `## How It Works` section to the README (placement: between the lead paragraph at line 5 and `## Quick Start` at line 7) that:

- Names the proxy model in one sentence.
- States explicitly: addresses live in the Addressr API, not in the MCP server or the AI client's context.
- Names the per-call cost: tool schemas at session start + matched results per call.
- Walks through one concrete flow (search → get) showing what enters context at each step.

Keep it short — one screenful, ~30-50 lines, no code. Link out to the existing `HATEOAS Workflow` and `Response Format` sections for the mechanical details.

### Investigation Tasks

- [x] Re-rate Priority and Effort at next /wr-itil:review-problems (2026-05-13: Impact 2 × Likelihood 4 = 8 Medium; Effort S; WSJF 8.0)
- [x] Investigate root cause (2026-05-13)
- [x] Document workaround (2026-05-13 — none for adopters)
- [x] Define fix strategy (2026-05-13 — add `## How It Works` section)
- [x] Implement fix in README.md (2026-05-13 — folded into this commit per ADR-022)
- [ ] Verify by re-reading the README as a first-time adopter

## Fix Released

Released 2026-05-13 — added `## How It Works` section to `README.md` between the lead paragraph and `## Quick Start`. The section names:

- The proxy model in one paragraph ("thin proxy; G-NAF dataset stays on the Addressr API").
- What enters context: tool schemas at session start (few hundred tokens) + matched results per call.
- One concrete `search-addresses` → `get-address` flow showing the per-step context footprint.
- Outbound links to existing `Response Format` and `HATEOAS Workflow` sections for mechanics.

Architect review (wr-architect:agent) — PASS WITH NOTES; verified against ADR-001 (thin proxy), ADR-002 (dynamic discovery), ADR-003 (HATEOAS-native), ADR-005 (live API integration testing). No new ADR required — pure prose documentation of existing decisions. Editorial nits incorporated (softened "13M-row" to "roughly 13 million" with provenance link, replaced ellipsis with explicit tool taxonomy `search-*`/`get-*`/`health`, renamed "Context cost" to "Context footprint").

JTBD review (wr-jtbd:agent) — PASS WITH NOTES; serves JTBD-001 and JTBD-002 by side-effect. Non-blocking follow-up: the adopter-evaluation job ("decide whether to adopt this MCP without asking the maintainer how it handles 13M rows") is not yet a documented job. Recommend capturing as a new `JTBD-010 (Evaluate Addressr MCP for Adoption)` under the developer persona.

Awaiting user verification: re-read the README from the top as a first-time adopter and confirm the `## How It Works` section answers "how does this stay cheap?" without needing to inspect `src/server.mjs`.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: (none)

## Related

(captured via /wr-itil:capture-problem; expand at next investigation)
