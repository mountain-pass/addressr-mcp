# Problem 014: work-problems Step 4 classifier does not pre-detect ADR-074 substance-gate likelihood before dispatch

**Status**: Open
**Reported**: 2026-06-03
**Priority**: 6 (Medium) - Impact: 2 x Likelihood: 3 (re-rated 2026-06-03 review: developer workflow disruption (level 2 Minor: wasted AFK iter cost $7.48 / 948s observed, CI/published package unaffected); subclass-conditional Likelihood 3 Possible - structurally guaranteed for AFK iters dispatched on JTBD-anchored tickets where referenced JTBDs/personas/ADRs all lack `human-oversight: confirmed`, but the recent JTBD confirmation pass (commit c7cdbf9) reduced the unconfirmed-artefact population)
**Origin**: internal
**Effort**: M (orchestrator-side pre-dispatch grep classifier in /wr-itil:work-problems Step 4 + report upstream; canonical fix lives in @windyroad/itil work-problems SKILL.md)
**WSJF**: 3.0
**Type**: technical

## Description

Recurring class-of-behaviour observation, surfaced at session-level retro (run-retro Step 4b Stage 1 / P342 mechanical-stage carve-out).

The `/wr-itil:work-problems` orchestrator Step 4 classification table reads the top-WSJF ticket and applies deterministic rules ("known-error with fix → work it", etc.) before dispatching the iter subprocess. The table does NOT include a "dependent JTBDs / personas / ADRs all lack `human-oversight: confirmed`" pre-check. When such a ticket reaches the dispatch step, the iter subprocess invokes manage-problem, propose-fix step hits ADR-074 substance-confirm-before-build, queues an outstanding_question, and skips - costing one full iter (observed cost $7.48 / 948s wall-clock for P008 iter 1) with zero progress on the ticket.

Observed this session 2026-06-03 in `/wr-itil:work-problems` loop. Iter 1 dispatched for P008 (WSJF 16.0, em-dash detection): hit ADR-074 substance gate on maintainer persona + JTBD-103 (both authored or pending oversight). 2 docs commits (JTBD-103 authoring + retro), 1 ticket skipped, 2 direction-class outstanding questions queued. Orchestrator main-turn manually applied the same pre-check before dispatching iter 2 (saw that P009 would hit the same gate on developer persona + JTBD-007/008/009, all lacking human-oversight) and routed iter 2 to P012 instead - which had no JTBD anchor so didn't trigger ADR-074. Iter 2 shipped a real fix in $10.10.

Pattern is structurally guaranteed: any AFK iter dispatched for a JTBD-anchored ticket whose referenced JTBDs/personas/ADRs all lack `human-oversight: confirmed` will halt at the substance gate. Pre-classifying at orchestrator level (Step 4) saves the wasted-iter cost.

Suggested fix shape: extend `/wr-itil:work-problems` Step 4 classifier with a pre-dispatch check - for each ticket file, grep its JTBD / Persona / ADR fields, resolve each referenced artefact, check its `human-oversight:` field. If ALL referenced artefacts lack `human-oversight: confirmed`, classify the ticket as `Skip - surface substance-confirm at stop (Step 2.5)` with `skip_reason_category: user-answerable`, queue the substance-confirm questions at orchestrator level without dispatching the iter. Composes with the existing "Problem previously attempted twice without progress in this session → Skip" rule by catching the structurally-guaranteed skip at attempt 1 instead of attempt 3.

This is an upstream @windyroad/itil plugin improvement (the SKILL.md lives at packages/itil/skills/work-problems/SKILL.md in the windyroad marketplace); captured locally with eventual /wr-itil:report-upstream routing once the fix shape is concrete.

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
- [ ] Decide between pre-dispatch grep approach (cheap, orchestrator-side) vs deeper integration with manage-problem's ADR-074 guard (canonical, but adds Step 4 → Step 5 round-trip)

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: ADR-074 substance-confirm-before-build guard; ADR-068 substance-confirm surface for JTBDs

## Related

- **Upstream report pending** - external dependency identified (@windyroad/itil plugin SKILL.md at `packages/itil/skills/work-problems/SKILL.md` in the windyroad marketplace); invoke /wr-itil:report-upstream when ready
- captured via /wr-itil:capture-problem during /wr-retrospective:run-retro 2026-06-03 (session-level retro at end of AFK /wr-itil:work-problems loop); P342 mechanical-stage carve-out for recurring class-of-behaviour
- This session's iter 1 (P008 skipped on substance gate) and orchestrator's iter 2 routing decision (P009 deferred, P012 picked instead) are the motivating observations

## Reported Upstream

- **URL**: https://github.com/windyroad/agent-plugins/issues/222
- **Reported**: 2026-06-03
- **Template used**: structured default (problem-shaped per ADR-033; upstream has problem-report.yml)
- **Disclosure path**: public issue
- **Cross-reference confirmed**: yes (issue body cites the downstream ticket path)
- **Notes**: filed via /wr-itil:report-upstream; no dedup match on gh issue search. Batch of 4 (P010 #220, P013 #221, P014 #222, P016 #223).
