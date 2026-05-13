# Problem Backlog

> Last reviewed: 2026-05-13 — P004 fix shipped (Known Error → Verification Pending): added `## How It Works` section to README naming the proxy model + on-demand-fetch contract; architect + JTBD reviewed; awaiting first-time-adopter re-read.
> Run `/wr-itil:review-problems` to refresh WSJF rankings.

## WSJF Rankings

Dev-work queue only. Verification Pending (`.verifying.md`, WSJF multiplier 0) and Parked (`.parked.md`, multiplier 0) tickets are excluded per ADR-022 — surfaced in their own sections below. Rows sort by `(WSJF desc, Known-Error-first, Effort-divisor asc, Reported-date asc, ID asc)` so top-to-bottom order matches `/wr-itil:work-problems` Step 3 tie-break selection 1:1 (P138).

| WSJF | ID | Title | Severity | Status | Effort | Reported |
|------|-----|-------|----------|--------|--------|----------|
| 6.0 | P002 | Addressr Link Relations Not Resolvable | 12 | Open | M | 2026-04-23 |

## Verification Queue

Fix released, awaiting user verification (driven off `docs/problems/*.verifying.md` via glob per ADR-022). Sorted by `Released date ASC` (oldest at row 1; same-day releases tiebreak by ID ASC). <!-- VQ-SORT-DIRECTION: oldest-first per ADR-022 --> `Likely verified?` column marks tickets ≥14 days old (P048 Candidate 4 default).

| ID | Title | Released | Fix summary | Likely verified? |
|----|-------|----------|-------------|------------------|
| P004 | MCP context model not surfaced in user docs | 2026-05-13 (this commit) | Added `## How It Works` section to README naming the proxy model + on-demand-fetch contract; architect + JTBD reviewed | no (0 days) |

## Parked

| ID | Title | Reason | Parked since |
|----|-------|--------|-------------|

_No parked tickets._

## Notes

- **P002** is a candidate for parking — root cause confirmed and reported upstream (addressr#456), and the local workaround (static `REL_TO_TOOL` mapping in `src/server.mjs`) is already shipped. The ticket now functions as an upstream tracker rather than active dev work. Park manually when ready.
