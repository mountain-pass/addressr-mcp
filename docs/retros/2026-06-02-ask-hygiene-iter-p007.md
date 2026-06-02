# Ask Hygiene — 2026-06-02 (iter-scoped: P007 fix in /wr-itil:work-problems AFK loop)

Iter context: single iter of /wr-itil:work-problems orchestrating the P007 (CI integration test cryptic JSON parse on upstream error) fix. AFK constraint per P135 / ADR-044 forbade AskUserQuestion mid-iter.

| Call # | Header | Classification | Citation |
|--------|--------|----------------|----------|

**Lazy count: 0**
**Direction count: 0**
**Override count: 0**
**Silent-framework count: 0**
**Taste count: 0**
**Correction-followup count: 0**

## Notes

- Zero AskUserQuestion calls in this iter — AFK constraint per the iter brief ("NEVER call AskUserQuestion mid-iter — direction / deviation-approval queue at ITERATION_SUMMARY.outstanding_questions for loop-end batched presentation"). All direction-setting observations route to outstanding_questions; mechanical-stage classifications run silent per ADR-044.
- R6 numeric gate (lazy >= 2 across 3 consecutive retros) is not triggered: 0, 0, 0 across the trail window so far (2026-05-14, 2026-06-02 main, 2026-06-02 iter).
- One observation surfaces as a direction-setting candidate (JTBD recommend-and-cite vs ADR-068 unratified-dependency stuck state under AFK) — routed to ITERATION_SUMMARY.outstanding_questions per the iter brief's classification taxonomy (ambiguous-leaning-direction; user authority on wr-jtbd plugin path).
