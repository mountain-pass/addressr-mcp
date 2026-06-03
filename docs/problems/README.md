# Problem Backlog

> Last reviewed: 2026-06-03 **/wr-itil:review-problems** - P012 closed (verified in-session unit test); P010 auto-transition Open -> Known Error (root cause + workaround documented, WSJF 2.0 -> 4.0); P013 re-rated from deferred placeholders (Severity 3 -> 8, Effort M, WSJF 1.5 -> 4.0); P014 re-rated from deferred placeholders (Severity 3 -> 6, Effort M, WSJF 1.5 -> 3.0); P007 stays Verification Pending (no non-200 CI cycle since fix shipped); P002 / P005 kept after relevance-close caveat surface (upstream issues open, workarounds live).
> Run `/wr-itil:review-problems` to refresh WSJF rankings.

## WSJF Rankings

Dev-work queue only. Verification Pending (`.verifying.md`, WSJF multiplier 0) and Parked (`.parked.md`, multiplier 0) tickets are excluded per ADR-022, surfaced in their own sections below. Rows render tier-first (Tier 0 Critical-bypass [Severity Very High >=17 OR security-classified OR incident-linked] -> Tier 1 Inbound-reported [`**Origin**: inbound-reported`] -> Tier 2 Internal), then within each tier by `(WSJF desc, Known-Error-first, Effort-divisor asc, Reported-date asc, ID asc)` so top-to-bottom order matches `/wr-itil:work-problems` Step 3 selection 1:1 (P138 + ADR-076). <!-- REPORTED-FIRST-TIER-SOURCE: /wr-itil:work-problems SKILL.md Step 3 (ADR-076) -->

| WSJF | ID | Title | Severity | Status | Effort | Reported | Origin |
|------|-----|-------|----------|--------|--------|----------|--------|
| 16.0 | P008 | no automated em-dash detection | 8 | Known Error | S | 2026-05-14 | internal |
| 10.0 | P005 | external-comms marker fails on empty session_id | 10 | Known Error | M | 2026-05-14 | internal |
| 10.0 | P006 | capture-problem deferred refresh causes downstream halt | 10 | Known Error | M | 2026-05-14 | internal |
| 9.0 | P002 | Addressr Link Relations Not Resolvable | 9 | Known Error | M | 2026-04-23 | internal |
| 4.5 | P009 | MCP Missing Postcode, State, And Locality Endpoints | 9 | Open | M | 2026-06-02 | internal |
| 4.0 | P010 | relevance evaluator false-positive on upstream-plugin paths | 4 | Known Error | M | 2026-06-02 | internal |
| 4.0 | P013 | wr-jtbd:agent returns "Relevant files:" output without textual verdict | 8 | Open | M | 2026-06-03 | internal |
| 3.0 | P014 | work-problems Step 4 classifier does not pre-detect ADR-074 substance-gate likelihood | 6 | Open | M | 2026-06-03 | internal |

## Verification Queue

Fix released, awaiting user verification (driven off the dual-tolerant glob `docs/problems/*.verifying.md docs/problems/verifying/*.md` per ADR-022 + RFC-002 migration window). Sorted by `Released date ASC` (oldest at row 1; same-day releases tiebreak by ID ASC). <!-- VQ-SORT-DIRECTION: oldest-first per ADR-022 --> `Likely verified?` column carries an evidence-first cell per P186, three canonical values: `yes - observed: <evidence>`, `no - not observed` (default for newly-released tickets), `no - observed regression`. <!-- LIKELY-VERIFIED-CELL-SHAPE: evidence-based per P186 --> Age is preserved separately via the `Released` column.

| ID | Title | Released | Fix summary | Likely verified? |
|----|-------|----------|-------------|------------------|
| P007 | CI integration test cryptic JSON parse on upstream error | 2026-06-02 | test/server.test.mjs branches on envelope.status before body-shape assertions; non-200 throws name the upstream tool + status + body verbatim. | no - not observed (verified at 2026-06-03 review: no non-200 CI cycle has run since fix shipped in commit 0fbdb97; all subsequent runs green) |

## Parked

| ID | Title | Reason | Parked since |
|----|-------|--------|-------------|

_No parked tickets._

## Notes

- **P012** closed at 2026-06-03 review on user confirmation: in-session unit test `surfaces upstream cause when API root returns 4xx + JSON error body (P012)` in `test/dynamic-tools.test.mjs` confirms RED -> GREEN with diagnostic vocabulary (`RAPIDAPI_KEY` + `subscription`) in stderr; all 11 unit tests pass. ADR-026 grounding: in-session test invocation + observable outcome.
- **P010** auto-transitioned Open -> Known Error at 2026-06-03 review per skill Step 2 rule (confirmed root cause section documented: `evaluate-relevance.sh` `file-no-longer-exists` regex has no awareness of upstream-plugin source-tree paths under `~/.claude/plugins/marketplaces/...`; workaround documented: surface-batch-confirm flow catches false-positives, per-ticket user disposition). WSJF 2.0 -> 4.0 on the Known Error multiplier.
- **P013** re-rated from deferred placeholders (Impact 3 -> 2, Likelihood 1 -> 4). Honest call: developer workflow disruption (level 2 Minor: re-delegation wastes a turn, AFK iters stall on marker-not-written branch, CI/published package unaffected); 2/2 invocations in single iter show consistent files-only body shape suggesting a structural agent-template defect (level 4 Likely on the in-iter rate; cross-iter prevalence still unknown). Severity 3 -> 8; WSJF 1.5 -> 4.0.
- **P014** re-rated from deferred placeholders (Impact 3 -> 2, Likelihood 1 -> 3). Honest call: developer workflow disruption (level 2 Minor: wasted AFK iter cost $7.48 / 948s observed, CI/published package unaffected); subclass-conditional Likelihood 3 Possible - structurally guaranteed for AFK iters dispatched on JTBD-anchored tickets where referenced JTBDs/personas/ADRs all lack `human-oversight: confirmed`, but commit c7cdbf9 confirmed 13 jobs and personas (reducing the unconfirmed-artefact population). Severity 3 -> 6; WSJF 1.5 -> 3.0.
- **P007** stays Verification Pending. CI run history since fix commit `0fbdb97` (2026-06-02): all green; no upstream non-200 has been observed in the workflow log since the new diagnostic message shipped. Verification fires on the next CI cycle that catches an actual upstream 4xx/5xx.
- **P002** surfaced as CLOSE-CANDIDATE-WITH-CAVEAT at relevance-close pass (driver-child-ticket P001 closed). User direction at 2026-06-03 review: keep as Known Error. Upstream Addressr issue #456 is still open; the local `REL_TO_TOOL` mapping in `src/server.mjs` is the load-bearing workaround.
- **P005 + P006** are upstream `@windyroad/itil` plugin bugs (not local code bugs). Prior user direction at 2026-06-02 review (verbatim memory): keep both Known Error in this repo's backlog AND report upstream via `/wr-itil:report-upstream`. Both upstream comments shipped 2026-06-02 (windyroad/agent-plugins#181 for P005, #126 for P006). The 2026-06-03 relevance-close pass routed P005 to CLOSE-CANDIDATE-WITH-CAVEAT (file-no-longer-exists false-positive class documented in P010) and P006 to KEEP-WITH-NOTE (closed driver P004 plus unbuilt SKILL/agent disambiguation); both stay Known Error per prior direction.
- **P008** stays top of the dev-work queue at WSJF 16.0 (Severity 8 / Effort S / Known Error multiplier 2.0). Fix-strategy option 1 (pre-commit hook + `grep -P '\x{2014}'`) is the small surface; ship next.
- **P009** investigation tasks still pending (re-frame against P001's shipped search-* dynamic discovery, decide whether to extend `REL_TO_TOOL` for detail rels or build a separate get-tool pattern). Severity 9 / Effort M / Open / WSJF 4.5 stable from 2026-06-02 review.
