# Problem Backlog

> Last reviewed: 2026-06-02 (retro) **P012 captured (Known Error, WSJF 6.0)** — split from P011 per concern-boundary: structural getRoot() silent-degradation guard against 4xx/no-_links upstream responses (option 1 fix-strategy from P011, defense-in-depth). Briefing entries added per `releases-and-ci.md` (Link header upstream behaviour, `../addressr/.env` key rotation source) and `governance-workflow.md` (ground-truth-probe diagnosis pattern). Critical Points updated. Earlier same-session: P011 fix released (key rotation, CI green run 26808770054); JTBD-102 ratified (human-oversight: confirmed); P007 stays Verification Pending.
> Run `/wr-itil:review-problems` to refresh WSJF rankings.

## WSJF Rankings

Dev-work queue only. Verification Pending (`.verifying.md`, WSJF multiplier 0) and Parked (`.parked.md`, multiplier 0) tickets are excluded per ADR-022, surfaced in their own sections below. Rows render tier-first (Tier 0 Critical-bypass [Severity Very High >=17 OR security-classified OR incident-linked] -> Tier 1 Inbound-reported [`**Origin**: inbound-reported`] -> Tier 2 Internal), then within each tier by `(WSJF desc, Known-Error-first, Effort-divisor asc, Reported-date asc, ID asc)` so top-to-bottom order matches `/wr-itil:work-problems` Step 3 selection 1:1 (P138 + ADR-076). <!-- REPORTED-FIRST-TIER-SOURCE: /wr-itil:work-problems SKILL.md Step 3 (ADR-076) -->

| WSJF | ID | Title | Severity | Status | Effort | Reported | Origin |
|------|-----|-------|----------|--------|--------|----------|--------|
| 16.0 | P008 | no automated em-dash detection | 8 | Known Error | S | 2026-05-14 | internal |
| 10.0 | P005 | external-comms marker fails on empty session_id | 10 | Known Error | M | 2026-05-14 | internal |
| 10.0 | P006 | capture-problem deferred refresh causes downstream halt | 10 | Known Error | M | 2026-05-14 | internal |
| 9.0 | P002 | Addressr Link Relations Not Resolvable | 9 | Known Error | M | 2026-04-23 | internal |
| 6.0 | P012 | getRoot() silent-degradation on non-200 or empty-_links response | 6 | Known Error | S | 2026-06-02 | internal |
| 4.5 | P009 | MCP Missing Postcode, State, And Locality Endpoints | 9 | Open | M | 2026-06-02 | internal |
| 2.0 | P010 | relevance evaluator false-positive on upstream-plugin paths | 4 | Open | M | 2026-06-02 | internal |

## Verification Queue

Fix released, awaiting user verification (driven off the dual-tolerant glob `docs/problems/*.verifying.md docs/problems/verifying/*.md` per ADR-022 + RFC-002 migration window). Sorted by `Released date ASC` (oldest at row 1; same-day releases tiebreak by ID ASC). <!-- VQ-SORT-DIRECTION: oldest-first per ADR-022 --> `Likely verified?` column carries an evidence-first cell per P186, three canonical values: `yes - observed: <evidence>`, `no - not observed` (default for newly-released tickets), `no - observed regression`. <!-- LIKELY-VERIFIED-CELL-SHAPE: evidence-based per P186 --> Age is preserved separately via the `Released` column.

| ID | Title | Released | Fix summary | Likely verified? |
|----|-------|----------|-------------|------------------|
| P007 | CI integration test cryptic JSON parse on upstream error | 2026-06-02 | test/server.test.mjs branches on envelope.status before body-shape assertions; non-200 throws name the upstream tool + status + body verbatim. | no — not observed |
| P011 | CI integration test tool-list assertion breaks when upstream drops search-* rels | 2026-06-02 | GHA secrets.RAPIDAPI_KEY rotated to active-subscription key from ../addressr/.env; CI workflow run 26808770054 rerun green (build-and-test + release both success). Structural option-1 (server-level guard against silent empty-rels in getRoot()) deferred — candidate for split. | yes — observed: CI run 26808770054 rerun success post-rotation; local integration test 4/4 pass with the rotated key |

## Parked

| ID | Title | Reason | Parked since |
|----|-------|--------|-------------|

_No parked tickets._

## Notes

- **P005 + P006** are upstream `@windyroad/itil` plugin bugs (not local code bugs). User direction at 2026-06-02 review: keep both Known Error in this repo's backlog AND report upstream via `/wr-itil:report-upstream`. The relevance evaluator's CLOSE-CANDIDATE-WITH-CAVEAT verdicts were false-positives (paths referenced live in the plugin source tree at `~/.claude/plugins/marketplaces/windyroad/`, not this repo). Both bugs fired again in this session: P005 blocked the P009 capture commit's external-comms gate; P006 is the deferred-README-refresh halt class that this review skill itself sidesteps because it owns the refresh.
- **P002** root cause confirmed and reported upstream (addressr#456); the local static `REL_TO_TOOL` mapping in `src/server.mjs` is the documented workaround. Likelihood dropped 4 -> 3 at this review because the workaround is now shipped. Still a candidate for parking once the upstream issue is acknowledged; park manually when ready.
- **P007** fix released 2026-06-02 (Known Error -> Verification Pending) — fix-strategy option 1 applied: both live-RapidAPI subtests in `test/server.test.mjs` now branch on `envelope.status` before body-shape assertions and throw `Error("Expected 200 from upstream <tool> but got <status>: <body>")` on non-200, surfacing the actual upstream HTTP status verbatim instead of the cryptic MCP-SDK JSON-parse stack. JTBD-102 (Diagnose Red CI Quickly) captured as proposed to document the motivating maintainer job. Awaiting CI verification next time the upstream returns non-200.
- **P008** effort dropped M -> S after re-reading the fix-strategy body; a single pre-commit `grep` hook. Auto-transitioned to Known Error and now top of the dev-work queue after P007 moved to verification.
- **P009** is fresh-captured (2026-06-02); deferred placeholders re-rated to honest values (Severity 9 / Effort M / WSJF 4.5). Investigation tasks pending: re-frame against P001's shipped search-* + the missing get-*-details, decide whether to extend `REL_TO_TOOL` for detail rels or build a separate get-tool pattern.
