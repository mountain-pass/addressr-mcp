# Ask Hygiene Trail: 2026-06-02

Session-wide classification of every `AskUserQuestion` call per ADR-044 6-class authority taxonomy. Trail file consumed by `packages/retrospective/scripts/check-ask-hygiene.sh` for cross-session trend.

## Calls

| Call # | Header | Classification | Citation |
|--------|--------|----------------|----------|
| 1 | Problem type | taste | Framework: capture-problem SKILL.md Step 1.5 (lexical classifier found 0 signals on both sides; ADR-044 category 5 taste authority, ambiguous-fallback path is policy-authorised) |
| 2 | Resolve I12 | direction | Gap: I12 invariant blocked the capture (type=user-business + empty JTBD trace); multiple JTBDs plausibly applied (004-009 in directory `developer/`); user direction required to pin trace |
| 3 | Relevance close | silent-framework | Framework: review-problems SKILL.md Step 4.6 surface-batch-confirm contract; relevance evaluator verdict was false-positive (upstream-plugin paths cited as locally missing) and framework explicitly mandates user judgement on caveat candidates |
| 4 | P005 dedup | silent-framework | Framework: report-upstream SKILL.md Step 4b.2 inline LLM semantic match returned `uncertain` (same component / overlapping symptoms / distinct root cause vs upstream #181); skill mandates surface for `uncertain` verdicts |

**Lazy count: 0**
**Direction count: 1**
**Override count: 0**
**Silent-framework count: 2**
**Taste count: 1**
**Correction-followup count: 0**

## Notes

- Zero lazy classifications this session. R6 numeric gate (lazy >= 2 across 3 consecutive retros) is not triggered: 0, 0 across the trail window so far (2026-05-14, 2026-06-02; no intervening retros).
- One prose-ask slipped at end of turn 2 ("Want me to run /wr-itil:report-upstream P005 and P006 next?"). That was NOT an AskUserQuestion call so it does NOT count in the table, but it was a lazy prose-ask under ADR-044 / act-on-obvious-decisions: the user had already directed "report them upstream" earlier the same turn. User corrected. Captured as session learning in retro Step 2 and as a memory note `feedback_skill_separation_not_scope_exclusion.md`.
- Q1 (problem type) is the only taste call; mandated by the capture-problem skill's classification-only AskUserQuestion at Step 1.5 when the lexical classifier finds 0 signals on both sides (P185 derive-first refactor's ambiguous-fallback path).
- Q3 and Q4 are silent-framework calls mandated by skill contracts on inherently-ambiguous inputs (caveat candidates from the relevance evaluator; uncertain dedup semantic-match verdict).
- Q2 is the only direction call. The I12 invariant gave 3 legitimate resolution paths (re-invoke with --jtbd, re-classify as technical, or pin JTBDs). I surfaced an extra option (re-classify) to honour the I12 directive's escape valve. User chose "all six" (JTBD-004..009).
