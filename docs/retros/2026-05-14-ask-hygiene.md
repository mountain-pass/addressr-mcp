# Ask Hygiene Trail: 2026-05-14

Session-wide classification of every `AskUserQuestion` call per ADR-044 6-class authority taxonomy. Trail file consumed by `packages/retrospective/scripts/check-ask-hygiene.sh` for cross-session trend.

## Calls

| Call # | Header | Classification | Citation |
|--------|--------|----------------|----------|
| 1 | Problem type | taste | Framework: capture-problem SKILL.md Step 1.5 (ADR-060 item 8c type classifier; ADR-044 category 5 taste authority) |
| 2 | Verify P003 | silent-framework | Framework: review-problems SKILL.md Step 4 (verification mandate per ADR-022; user owns verification decision) |
| 3 | Close P003? | direction | Gap: re-asked after gathering new in-session evidence (live MCP integration); user judgment required on new evidence the prior turn did not have |
| 4 | 403/429 status | direction | Gap: user-knowledge required (is RapidAPI subscription state expected); information not in agent context |
| 5 | Next step (continue P004 / stop) | direction | Gap: workflow choice with multiple legitimate paths after side-conversation about the key rotation interrupted the P004 flow |
| 6 | Verify P004? | silent-framework | Framework: ADR-022 verification semantics (user owns Verification Pending to Closed transition); the prompt presents the close-on-evidence option per manage-problem Step 9d |
| 7 | Release? | direction | Gap: release cadence decision is user-owned per JTBD-101 maintainer persona |
| 8 | Rotate old key | direction | Gap: user-knowledge required (whether prior rotation was performed); information not in agent context |
| 9 | Update CI secret how | direction | Gap: user choice among legitimate action surfaces (UI / CLI / capture) |

**Lazy count: 0**
**Direction count: 6**
**Override count: 0**
**Silent-framework count: 2**
**Taste count: 1**
**Correction-followup count: 0**

## Notes

- Q1 (problem type) was the only taste call; mandated by the capture-problem skill's classification-only AskUserQuestion at Step 1.5. The remaining 8 calls were either direction (user choice / user knowledge) or silent-framework (verification ADRs that explicitly mandate user-owned decisions).
- Q3 was re-asked after Q2 received "Not sure / not yet" because in-session live MCP integration produced new concrete evidence. The re-ask incorporates information not previously available; classified as direction rather than lazy.
- Zero lazy classifications this session. Below the R6 numeric-gate threshold (lazy >= 2 across 3 consecutive retros).
