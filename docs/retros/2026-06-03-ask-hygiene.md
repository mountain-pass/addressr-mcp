# Ask Hygiene - 2026-06-03 (session-level retro: interactive review-problems + AFK work-problems halt)

Retro context: orchestrator main turn from `/wr-itil:work-problems` halt path. Interactive `/wr-itil:review-problems` ran first this session, then AFK loop iter 1 (P008) shipped successfully, then Step 6.5 release-cadence drain hit npm publish E404 halt (P015 captured).

| Call # | Header | Classification | Citation |
|--------|--------|----------------|----------|
| 1 | Verify P007 | direction | Gap: substance-confirm-before-build (ADR-074) - only the user knows whether the diagnostic message has been observed in a real CI red cycle |
| 2 | Verify P012 | direction | Gap: substance-confirm-before-build (ADR-074) - verification disposition is user authority over close decision |
| 3 | P002 disposition | direction | Gap: genuine 2-option direction-setting on disposition (Keep KE / Park / Close) - framework cannot resolve user's stance on local-workaround-vs-upstream-fix balance |

**Lazy count: 0**
**Direction count: 3**
**Override count: 0**
**Silent-framework count: 0**
**Taste count: 0**
**Correction-followup count: 0**

All 3 questions were direction-setting substance-confirm asks per ADR-074 exclusion (NOT lazy). The /wr-itil:review-problems Step 4 verification prompt is the canonical surface where user authority over verification disposition fires. Single AskUserQuestion call containing all 3 questions (ADR-013 Rule 1 batched cap respected).

---

# Ask Hygiene - 2026-06-03 (AFK iter on P008)

Retro context: AFK `/wr-itil:work-problems` iteration on P008 (no automated em-dash detection).

| Call # | Header | Classification | Citation |
|--------|--------|----------------|----------|

**Lazy count: 0**
**Direction count: 0**
**Override count: 0**
**Silent-framework count: 0**
**Taste count: 0**
**Correction-followup count: 0**

No `AskUserQuestion` calls were issued this iteration. AFK orchestrator constraint Rule 4 forbids mid-iter asks; direction-setting and deviation-approval observations are routed to `ITERATION_SUMMARY.outstanding_questions` for loop-end batched presentation.

---

# Ask Hygiene - 2026-06-03 iter 2 (P012 — getRoot empty-rels guard)

Retro context: AFK `/wr-itil:work-problems` iteration on P012 (getRoot() silent-degradation on non-200 or empty-_links response).

| Call # | Header | Classification | Citation |
|--------|--------|----------------|----------|

**Lazy count: 0**
**Direction count: 0**
**Override count: 0**
**Silent-framework count: 0**
**Taste count: 0**
**Correction-followup count: 0**

No `AskUserQuestion` calls were issued this iteration. AFK Rule 4 (constraint from orchestrator brief) forbids mid-iter asks. P012's Fix Strategy referenced no ADRs, so ADR-074 substance-confirm-before-build guard did not fire (no candidate to queue). The maintainer persona's unratified status was already queued by iter-1 as an outstanding_question; no duplicate queue added.

---

# Ask Hygiene - 2026-06-03 orchestrator-main-turn (session-level retro)

Retro context: session-level run-retro at orchestrator-main-turn for /wr-itil:work-problems Step 2.4 gate (b) before ALL_DONE. Scope: orchestrator-main-turn AskUserQuestion calls only (per-iter calls already covered in the two sections above).

| Call # | Header | Classification | Citation |
|--------|--------|----------------|----------|
| 1 | JTBD ratification | direction | Gap: substance-confirm-before-build per ADR-074 — user must own ratification of maintainer persona + JTBD-103 (genuine ≥2-option direction-setting decision; iter 1 queued the substance-confirm for loop-end surfacing; the surface is the load-bearing P135 Phase 3 outstanding_questions flow at Step 2.5; ADR-074 explicitly excludes this from lazy classification) |

**Lazy count: 0**
**Direction count: 1**
**Override count: 0**
**Silent-framework count: 0**
**Taste count: 0**
**Correction-followup count: 0**

The session's only orchestrator-main-turn AskUserQuestion was the loop-end surface of 2 outstanding_questions queued by iter 1 (P008 substance gate). Both questions resolved to a single batched binary choice: "Run /wr-jtbd:confirm-jobs-and-personas now / Defer / Reject JTBD-103". User chose "Run /wr-jtbd:confirm-jobs-and-personas now" - the resolution action of the queued questions. This is the canonical Phase 3 batched-AskUserQuestion-at-loop-end shape per work-problems Step 2.5b and ADR-074 substance-confirm-before-build trust boundary.
