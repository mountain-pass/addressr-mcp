# Ask Hygiene Trail — 2026-06-02 (run-retro orchestrator main turn)

Persisted per Step 2d of `/wr-retrospective:run-retro` (ADR-044 lazy-AskUserQuestion regression metric). This trail records AskUserQuestion calls in the orchestrator main turn AFTER the AFK loop halted and through the retro itself. Distinct from `2026-06-02-ask-hygiene-iter-p007.md` (iter subprocess scope) and `2026-06-02-ask-hygiene-work-problems-halt.md` (immediate halt-summary scope).

## Calls

| Call # | Header | Classification | Citation |
|--------|--------|----------------|----------|
| 1 | Pre-loop state | direction | Gap: Step 0 session-continuity routing extension — user direction-set bootstrap-catalog scaffolding + tree-clean commit. Per ADR-044 cat-1 direction (additions to project not derivable from existing framework). |
| 2 | JTBD AFK gap | direction | Gap: Step 2.5b accumulated user-answerable surface — iter-1's outstanding_questions entry. Per ADR-044 cat-1 direction. |
| 3 | JTBD-102 ratify | direction | Gap: lifecycle ratification of a born-proposed JTBD per ADR-068 — user chose Confirm vs Defer vs Retire. Per ADR-044 cat-1 direction. |
| 4 | P011 fix path | direction | Gap: 6-option fix-strategy choice on the structural concern; user pushed back ("Are you sure?") prompting verification + corrected diagnosis. Per ADR-044 cat-1 direction (substance-confirm-before-build on a genuine multi-option decision). |
| 5 | Next move | direction | Gap: halt-state routing — push docs-only / continue work / wrap. Per ADR-044 cat-1 direction. |

**Lazy count: 0**
**Direction count: 5**
**Deviation-approval count: 0**
**Override count: 0**
**Silent-framework count: 0**
**Taste count: 0**
**Correction-followup count: 0**

## Notes

- All 5 calls fired at framework-prescribed surfaces or for substance-confirm-before-build on genuine direction-setting decisions. None sub-contracted framework-resolved decisions.
- The user pushback on call 4 ("Are you sure? Which API are you checking? Also check against ../addressr") was an authentic-correction signal (P078 surface, ADR-044 cat-6) that exposed a Step-2-class diagnosis gap (extrapolating from error messages rather than ground-truth probing). Not classified as a separate "correction-followup" entry here because the correction was triggered IN-CALL rather than as a separate AskUserQuestion ordinal; instead, the lesson is captured in the briefing under `governance-workflow.md` ("Diagnose by ground-truth probe, not error-message extrapolation").
- Trend across this session: 3 ask-hygiene trail files total (iter-p007 = 0/0; work-problems-halt = 0/2 direction; retro = 0/5 direction). Cross-session lazy count remains flat-zero.
