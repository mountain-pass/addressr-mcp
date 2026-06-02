# Problem Backlog

> Last reviewed: 2026-06-02. Five auto-transitions Open -> Known Error (P002, P005, P006, P007, P008 all carry confirmed root cause + workaround). Effort re-rates: P007 M -> S (single `if (status !== 200)` branch); P008 M -> S (pre-commit `grep -P '\x{2014}'` hook). Likelihood re-rates: P002 4 -> 3 (local workaround shipped, upstream reported addressr#456); P005 + P006 -> 5 (previously observed failure mode, both fired again this session). P009 captured today, stays Open pending root-cause investigation. Relevance pass surfaced P005 + P006 as CLOSE-CANDIDATE-WITH-CAVEAT; user direction: keep both, report upstream.
> Run `/wr-itil:review-problems` to refresh WSJF rankings.

## WSJF Rankings

Dev-work queue only. Verification Pending (`.verifying.md`, WSJF multiplier 0) and Parked (`.parked.md`, multiplier 0) tickets are excluded per ADR-022, surfaced in their own sections below. Rows render tier-first (Tier 0 Critical-bypass [Severity Very High >=17 OR security-classified OR incident-linked] -> Tier 1 Inbound-reported [`**Origin**: inbound-reported`] -> Tier 2 Internal), then within each tier by `(WSJF desc, Known-Error-first, Effort-divisor asc, Reported-date asc, ID asc)` so top-to-bottom order matches `/wr-itil:work-problems` Step 3 selection 1:1 (P138 + ADR-076). <!-- REPORTED-FIRST-TIER-SOURCE: /wr-itil:work-problems SKILL.md Step 3 (ADR-076) -->

| WSJF | ID | Title | Severity | Status | Effort | Reported | Origin |
|------|-----|-------|----------|--------|--------|----------|--------|
| 18.0 | P007 | CI integration test cryptic JSON parse on upstream error | 9 | Known Error | S | 2026-05-14 | internal |
| 16.0 | P008 | no automated em-dash detection | 8 | Known Error | S | 2026-05-14 | internal |
| 10.0 | P005 | external-comms marker fails on empty session_id | 10 | Known Error | M | 2026-05-14 | internal |
| 10.0 | P006 | capture-problem deferred refresh causes downstream halt | 10 | Known Error | M | 2026-05-14 | internal |
| 9.0 | P002 | Addressr Link Relations Not Resolvable | 9 | Known Error | M | 2026-04-23 | internal |
| 4.5 | P009 | MCP Missing Postcode, State, And Locality Endpoints | 9 | Open | M | 2026-06-02 | internal |

## Verification Queue

Fix released, awaiting user verification (driven off the dual-tolerant glob `docs/problems/*.verifying.md docs/problems/verifying/*.md` per ADR-022 + RFC-002 migration window). Sorted by `Released date ASC` (oldest at row 1; same-day releases tiebreak by ID ASC). <!-- VQ-SORT-DIRECTION: oldest-first per ADR-022 --> `Likely verified?` column carries an evidence-first cell per P186, three canonical values: `yes - observed: <evidence>`, `no - not observed` (default for newly-released tickets), `no - observed regression`. <!-- LIKELY-VERIFIED-CELL-SHAPE: evidence-based per P186 --> Age is preserved separately via the `Released` column.

_Queue empty._

## Parked

| ID | Title | Reason | Parked since |
|----|-------|--------|-------------|

_No parked tickets._

## Notes

- **P005 + P006** are upstream `@windyroad/itil` plugin bugs (not local code bugs). User direction at 2026-06-02 review: keep both Known Error in this repo's backlog AND report upstream via `/wr-itil:report-upstream`. The relevance evaluator's CLOSE-CANDIDATE-WITH-CAVEAT verdicts were false-positives (paths referenced live in the plugin source tree at `~/.claude/plugins/marketplaces/windyroad/`, not this repo). Both bugs fired again in this session: P005 blocked the P009 capture commit's external-comms gate; P006 is the deferred-README-refresh halt class that this review skill itself sidesteps because it owns the refresh.
- **P002** root cause confirmed and reported upstream (addressr#456); the local static `REL_TO_TOOL` mapping in `src/server.mjs` is the documented workaround. Likelihood dropped 4 -> 3 at this review because the workaround is now shipped. Still a candidate for parking once the upstream issue is acknowledged; park manually when ready.
- **P007 + P008** effort dropped M -> S after re-reading the fix-strategy bodies; both are single-surface fixes (one `if` branch in `test/server.test.mjs` for P007; a pre-commit `grep` hook for P008). Both auto-transitioned to Known Error and now rank top of the queue.
- **P009** is fresh-captured (2026-06-02); deferred placeholders re-rated to honest values (Severity 9 / Effort M / WSJF 4.5). Investigation tasks pending: re-frame against P001's shipped search-* + the missing get-*-details, decide whether to extend `REL_TO_TOOL` for detail rels or build a separate get-tool pattern.
