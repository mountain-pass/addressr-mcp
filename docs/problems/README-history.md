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
