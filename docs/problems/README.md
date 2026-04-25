# Problem Backlog

> Last reviewed: 2026-04-25 — P001 verification pending — released in v1.0.0
> Run `/wr-itil:review-problems` to refresh WSJF rankings.

## WSJF Rankings

Dev-work queue only. Verification Pending (`.verifying.md`, WSJF multiplier 0) and Parked (`.parked.md`, multiplier 0) tickets are excluded per ADR-022 — surfaced in their own sections below.

| WSJF | ID | Title | Severity | Status | Effort |
|------|-----|-------|----------|--------|--------|
| 6.0 | P002 | Addressr Link Relations Not Resolvable | 12 | Open | M |
| 6.0 | P003 | server.test.mjs tests the wrong target and has drifted upstream | 12 | Open | M |

## Verification Queue

Fix released, awaiting user verification (driven off `docs/problems/*.verifying.md` via glob per ADR-022). Ranked by release age, oldest first. `Likely verified?` column marks tickets ≥14 days old (P048 Candidate 4 default).

| ID | Title | Released | Fix summary | Likely verified? |
|----|-------|----------|-------------|------------------|
| P001 | Unsupported Addressr API Endpoints | v1.0.0 (commit d344a6a) | Dynamic tool discovery via `REL_TO_TOOL` mapping in `src/server.mjs` registers tools for all link relations advertised by the Addressr API root | no (0 days) |

## Parked

_No parked tickets._
