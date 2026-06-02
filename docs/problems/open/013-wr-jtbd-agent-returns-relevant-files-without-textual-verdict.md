# Problem 013: wr-jtbd:agent returns "Relevant files:" output without textual verdict

**Status**: Open
**Reported**: 2026-06-03
**Priority**: 3 (Medium) — Impact: 3 x Likelihood: 1 (deferred — re-rate at next /wr-itil:review-problems)
**Origin**: internal
**Effort**: M (deferred — re-rate at next /wr-itil:review-problems)
**Type**: technical

## Description

`wr-jtbd:agent` subagent has been observed returning only a "Relevant files:" or "Relevant paths:" list with no textual review verdict, no PASS/ISSUES analysis, and (intermittently) no PostToolUse marker write. The companion `wr-architect:agent` invoked in the same parallel-tool-call block returns a full 250-word analytical review. The asymmetry forces re-delegation each time the JTBD verdict is needed, costing a turn + Agent-tool roundtrip per occurrence; when the marker also fails to write, the next gated Edit is blocked until the agent is re-invoked.

Observed during the P012 work-problems AFK iter (2026-06-03). Specific citations:

1. First delegation, description "JTBD review for P012 fix" (parallel call with wr-architect:agent on the same change scope): returned `Relevant files: docs/jtbd/maintainer/JTBD-102-...md (ratified, aligned); docs/jtbd/maintainer/persona.md (unratified — blocking); src/server.mjs (change site); docs/problems/known-error/012-...md`. NO PASS/ISSUES verdict text. NO analysis body. Architect agent in the same parallel call returned ~250 words of detailed analysis covering ADR-001/002/003/005. The first delegation ALSO failed to write the JTBD PostToolUse marker — the subsequent `test/dynamic-tools.test.mjs` Edit was blocked with: `BLOCKED: Cannot edit 'dynamic-tools.test.mjs' without JTBD review. ... No jtbd review marker found. The jtbd agent must review first.`

2. Re-delegation, description "JTBD review for test file edit" (sequential, single-target prompt with the specific test edits inlined): returned `Relevant paths: docs/jtbd/maintainer/JTBD-102-...md; docs/problems/known-error/012-...md; docs/jtbd/maintainer/persona.md (unratified, separate workstream)`. Same pattern — no analytical text. This invocation DID write the marker (Edit unblocked).

## Symptoms

- Two consecutive `wr-jtbd:agent` invocations in one iter both emit only a "Relevant files/paths" list with no analytical body text.
- Marker-write behaviour appears non-deterministic between the two invocations (first failed, second succeeded — same project, same session, same context shape).
- Re-delegation is the only observed workaround; the alternative is to bypass the JTBD gate (not policy-authorised).
- Architect agent on identical-shape parallel calls emits full analytical body; the asymmetry suggests a JTBD-side response-template issue, not a shared agent-infrastructure failure.

## Workaround

Re-delegate `wr-jtbd:agent` with the same prompt. The second invocation has been observed to emit the marker correctly even when its body is still files-only. Each re-delegation costs ~30s + tool-call ceremony.

## Impact Assessment

- **Who is affected**: maintainers running architect+JTBD parallel review on project-file edits; AFK orchestrator iters that invoke gated edits after JTBD review.
- **Frequency**: 2/2 invocations this iter. Cross-session prevalence unknown; observed pattern in this single iter is the data point.
- **Severity**: Medium. Wastes a turn per occurrence; AFK iters can stall on the marker-not-written branch until re-delegation; analytical body absence means the verdict's reasoning isn't visible for audit (ADR-026 grounding requirement on agent outputs).

## Root Cause Analysis

### Investigation Tasks

- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems
- [ ] Inspect `wr-jtbd:agent` definition (likely at `@windyroad/agent-plugins` upstream — packages/jtbd/agents/jtbd-lead.md or similar) for early-return paths after "Relevant files:" emission
- [ ] Compare side-by-side to `wr-architect:agent`'s response-template structure to identify the divergence
- [ ] Determine whether the marker-write inconsistency between invocation 1 (no marker) and invocation 2 (marker) correlates with the body-emission shape, or is independent
- [ ] Decide whether to add a contract test for the JTBD verdict shape (PASS/ISSUES + relevant files + analytical body)
- [ ] Report upstream to `@windyroad/agent-plugins` once root cause is confirmed

### Suspected Root Cause

Hypothesis: `wr-jtbd:agent`'s response template may terminate after emitting the "Relevant files:" block when the triage state is mixed — for example, JTBD-102 confirmed AND maintainer persona unratified (the actual state observed both times this iter). Under "single clean signal" alignment cases the agent may emit the full body; under mixed-signal cases it may bail to the files-only summary. This is a hypothesis only; needs verification by inspecting the agent definition.

### Fix Strategy

Free-text capture per `/wr-retrospective:run-retro` Step 4b Stage 2 Option 3 (Other codification shape):

- **Shape**: agent improvement (existing `wr-jtbd:agent` template fix). The fix is upstream at `@windyroad/agent-plugins`; this ticket tracks the local observation and ships when the upstream patch lands.
- **Routing target**: `/wr-itil:report-upstream` once root cause is confirmed and the agent definition has been inspected.
- **Evidence**: 2 in-session citations (above) plus the marker-blocked Edit log line. The architect-agent parallel call gives a clean control case for what the JTBD output SHOULD look like.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P005 (external-comms marker fails on empty session_id — same agent-marker-protocol family) for the marker-write half of this ticket. The body-emission half is independent.

## Related

- Captured via `/wr-itil:capture-problem` during P012 work-problems iter retro (2026-06-03).
- Companion signal: ADR-026 grounding requirement — agents MUST cite reasoning, not just enumerate files. The files-only verdict shape silently violates this.
- See also: `~/.claude/projects/-Users-tomhoward-Projects-addressr-mcp/memory/feedback_skill_separation_not_scope_exclusion.md` (separate-agent-tool surfaces are usable; the contract issue is the agent's output, not its discoverability).
