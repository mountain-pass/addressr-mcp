# Problem 006: capture-problem deferred refresh causes downstream halt

**Status**: Open
**Reported**: 2026-05-14
**Priority**: 3 (Medium) - Impact: 3 x Likelihood: 1 (deferred - re-rate at next /wr-itil:review-problems)
**Effort**: M (deferred - re-rate at next /wr-itil:review-problems)
**Type**: technical

## Description

`/wr-itil:capture-problem` deliberately defers the `docs/problems/README.md` refresh per its ADR-032 lightweight-capture contract (skill Step 6: "Stage list: ONLY the new ticket file. Do NOT stage docs/problems/README.md"). This is intentional and the speed of capture depends on it.

However, the very next governance skill invoked in the same session, including `/wr-itil:work-problem`, `/wr-itil:list-problems`, and `/wr-itil:review-problems`, halts on its Step 0 P118 preflight with `HALT_ROUTE_RECONCILE` because the captured ticket's ID is missing from the README's WSJF Rankings (`MISSING P<NNN> wsjf-rankings: actual=open`). The user has to either:

1. Route through `/wr-itil:reconcile-readme` (lighter, but still a separate skill invocation), or
2. Wait for `/wr-itil:review-problems` (heavier, also re-rates and runs verification queue prompt), or
3. Inline-edit `docs/problems/README.md` themselves.

Reproduced 2026-05-13 during P004's `/wr-itil:work-problem P004` flow: capture-problem ran with the trailing pointer "Run /wr-itil:review-problems next..."; work-problem was invoked within 30 seconds; manage-problem Step 0 preflight halted on the very drift the prior capture introduced. The user had to wait through a full review-problems cycle (including a verification prompt for P003) before work-problem could resume.

Reproduced again 2026-05-14 during `/wr-retrospective:run-retro` batch ticketing: P005 captured, then P006 capture attempted and halted on `MISSING P005 wsjf-rankings: actual=open`. Inline README edit was applied to clear the drift.

## Symptoms

- Within seconds of `/wr-itil:capture-problem` completing, any subsequent governance skill halts at Step 0 with `HALT_ROUTE_RECONCILE uncovered=N`.
- The halt message directs to `/wr-itil:reconcile-readme`, which the user may not realise exists as a separate skill (it is not in the standard "create-ticket-and-work-it" path).
- Retro-batch flows (multiple captures in succession) hit the same halt after every capture, requiring repeated drift-clearing.

## Workaround

Manually refresh `docs/problems/README.md` after each `/wr-itil:capture-problem` invocation. The refresh is mechanical: add the new ticket's row to the WSJF Rankings table with deferred placeholders, update the line-3 "Last reviewed" line, and archive the displaced fragment per P134. This is what `/wr-itil:review-problems` Step 5 does in bulk; the inline single-ticket version is short.

Alternative: always pair `/wr-itil:capture-problem` with `/wr-itil:review-problems` immediately afterwards. But this defeats the point of the lightweight capture path - the user wanted to capture-and-continue, and the review-problems cycle is heavy.

## Impact Assessment

- **Who is affected**: any user who captures a problem and then invokes another governance skill in the same session.
- **Frequency**: extremely high. Capture is usually a prelude to either working the problem or batching more captures, both of which immediately hit the halt. In a `/wr-retrospective:run-retro` session that captures N pipeline-instability tickets, the halt fires N-1 times.
- **Severity**: Medium. The halt is recoverable but introduces a non-obvious required step that erases the "lightweight aside" benefit capture-problem was designed for.
- **Analytics**: N/A.

## Root Cause Analysis

### Confirmed Root Cause

Two design contracts collide:

1. `/wr-itil:capture-problem` Step 6 explicitly does NOT refresh `docs/problems/README.md` ("deferred-README-refresh contract"). The skill commits only the new ticket file.
2. `/wr-itil:manage-problem` (and `/wr-itil:work-problem` via delegation, and any other Step-0-preflight-bearing skill) requires `docs/problems/README.md` to be in sync with the ticket inventory before proceeding. Per the P118 preflight + P149 classifier, committed cross-session drift halts execution.

In a single-session capture-then-work flow, the "cross-session drift" is in fact "drift introduced by the same session's last capture". The classifier cannot distinguish "drift the user caused minutes ago and forgot about" from "drift a prior session caused and never reconciled". Both look the same on disk; both correctly trip HALT_ROUTE_RECONCILE.

### Fix Strategy

Several options, in order of intrusiveness:

1. **In-flow auto-reconcile (preferred)**: `/wr-itil:capture-problem` Step 6 makes a single targeted edit to `docs/problems/README.md` (just add the new row to the WSJF Rankings table; defer ranking + line-3 + archive to next review-problems). This is a 5-line surgical render, not the full P062 refresh. Keeps capture lightweight but eliminates the downstream halt.

2. **Auto-route on halt (medium)**: the manage-problem Step 0 preflight classifier, when it detects HALT_ROUTE_RECONCILE caused by uncommitted same-session-captured tickets, auto-routes through `/wr-itil:reconcile-readme` instead of halting. This is the "INLINE_REFRESH carve-out (P149)" extended to cover the same-session-capture case as well as the staged-rename case.

3. **Documented warning (lightest)**: capture-problem skill prose flags the halt as expected and instructs the user to either run review-problems or accept the friction. This is the current state, but the trailing-pointer mention is insufficient signal - users see "Run /wr-itil:review-problems next" as advisory, not as mandatory-before-next-skill.

### Investigation Tasks

- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems
- [ ] Validate fix option 1 (in-flow auto-reconcile) does not break the ADR-032 lightweight-contract design.
- [ ] Evaluate whether the classifier can distinguish same-session capture drift from cross-session committed drift.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P118 (README reconcile preflight), P149 (drift classifier with INLINE_REFRESH carve-out), ADR-032 (governance skill invocation patterns; deferred-refresh contract).

## Related

- captured via /wr-itil:capture-problem during /wr-retrospective:run-retro 2026-05-14
- reproduction sessions: 2026-05-13 (P004 work flow), 2026-05-14 (retro batch ticketing)
- packages/itil/skills/capture-problem/SKILL.md (Step 6 deferred-refresh contract)
- packages/itil/skills/manage-problem/SKILL.md (Step 0 preflight + P149 carve-out)
