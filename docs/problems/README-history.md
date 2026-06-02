# Problem Backlog — Last-reviewed history

Forward-chronology archive of displaced `docs/problems/README.md` line 3 fragments per P134. Newest at the bottom.

## 2026-05-13

Last reviewed: 2026-04-25 — P001 closed — Unsupported Addressr API Endpoints (verified in-session via test/server.test.mjs assertions on kebab-case tools, 4/4 green against live RapidAPI)

Last reviewed: 2026-05-13 — P003 closed on in-session evidence (live MCP integration via Claude Code session — kebab-case tool names + `{status, headers, body}` envelope confirmed); P004 re-rated (deferred → WSJF 8.0, Effort S, Severity 8). P002 flagged as parking candidate — upstream-blocked on addressr#456, local workaround already shipped.

Last reviewed: 2026-05-13 — P004 transitioned Open → Known Error (root cause + fix strategy documented for the missing `## How It Works` README section; WSJF 8.0 → 16.0 via Known-Error multiplier; fix to land in subsequent commit).

Last reviewed: 2026-05-13 — P004 fix shipped (Known Error → Verification Pending): added `## How It Works` section to README naming the proxy model + on-demand-fetch contract; architect + JTBD reviewed; awaiting first-time-adopter re-read.

Last reviewed: 2026-05-13. P004 closed on user verification (Verification Pending to Closed). User confirmed the new `## How It Works` section answers the adopter onboarding question, with the em-dash cleanup landing in the same closure commit.

## 2026-05-14

Last reviewed: 2026-05-14. Inline reconcile: P005 captured (external-comms marker fails on empty session_id; deferred placeholders pending next review). Retro batch in progress; more captures may follow before the next `/wr-itil:review-problems` re-rates the deferred set.

Last reviewed: 2026-05-14. Inline reconcile during `/wr-retrospective:run-retro`: P005, P006, P007, P008 captured (external-comms marker, capture-problem downstream halt, CI cryptic JSON error, em-dash detection). All four carry deferred placeholders awaiting next `/wr-itil:review-problems` re-rating.

## 2026-06-02

Last reviewed: 2026-06-02. Five auto-transitions Open -> Known Error (P002, P005, P006, P007, P008 all carry confirmed root cause + workaround). Effort re-rates: P007 M -> S (single `if (status !== 200)` branch); P008 M -> S (pre-commit `grep -P '\x{2014}'` hook). Likelihood re-rates: P002 4 -> 3 (local workaround shipped, upstream reported addressr#456); P005 + P006 -> 5 (previously observed failure mode, both fired again this session). P009 captured today, stays Open pending root-cause investigation. Relevance pass surfaced P005 + P006 as CLOSE-CANDIDATE-WITH-CAVEAT; user direction: keep both, report upstream.

Last reviewed: 2026-06-02 (retro pass). P010 captured (relevance-evaluator false-positive on upstream-plugin paths; Open, Severity 4, Effort M, WSJF 2.0). Symptom append on P005 with 4 in-session reproductions. P005 + P006 reported upstream as comments on `windyroad/agent-plugins#181` and `#126`. Earlier same-session refresh covered the 5 auto-transitions and re-rates for P002 / P005 / P006 / P007 / P008.

## 2026-06-02 (2)

Last reviewed: 2026-06-02 **P007 verification pending** — fix-strategy option 1 applied in `test/server.test.mjs` (status-not-200 throw branches before body-shape assertions); JTBD-102 captured (proposed). P011 captured (`/wr-itil:work-problems` Step 6.5 push:watch halted on CI run 26800948615 — subtest 1 "lists kebab-case addressr tools" fails when upstream Addressr API root drops `search-*` rels; distinct from P007's status-branch surface).

## 2026-06-02 (3)

Last reviewed: 2026-06-02 **P011 fix released, verification pending** — root cause was lapsed RapidAPI subscription on the GHA RAPIDAPI_KEY; rotated to active key from ../addressr/.env; CI run 26808770054 rerun green. JTBD-102 ratified (human-oversight: confirmed). P007 stays Verification Pending (status-branch path now exercisable; awaits a future non-200 reproduction).

## 2026-06-03

Last reviewed: 2026-06-02 (retro) **P012 captured (Known Error, WSJF 6.0)** — split from P011 per concern-boundary: structural getRoot() silent-degradation guard against 4xx/no-_links upstream responses (option 1 fix-strategy from P011, defense-in-depth). Briefing entries added per `releases-and-ci.md` (Link header upstream behaviour, `../addressr/.env` key rotation source) and `governance-workflow.md` (ground-truth-probe diagnosis pattern). Critical Points updated. Earlier same-session: P011 fix released (key rotation, CI green run 26808770054); JTBD-102 ratified (human-oversight: confirmed); P007 stays Verification Pending.

Last reviewed: 2026-06-03 **P012 verification pending** — getRoot() guard ships option-1 fix-strategy: throws when `allLinks.length === 0`, existing catch surfaces RAPIDAPI_KEY + subscription vocabulary via console.warn. New unit test in `test/dynamic-tools.test.mjs` (`surfaces upstream cause when API root returns 4xx + JSON error body (P012)`) asserts fallback semantics + diagnostic vocabulary on stderr; all 11 unit tests pass. Architect PASS (no new ADR; clarifies ADR-002 stated failure handling).
