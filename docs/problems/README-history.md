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

Last reviewed: 2026-06-03 **P011 closed** — prior-session evidence drain (run-retro Step 4a Sub-step 9 / P282): README cell `yes — observed: CI run 26808770054 rerun success post-rotation; local integration test 4/4 pass with the rotated key` (written 2026-06-02) consumed at session-level retro. Earlier same-session: P012 fixed (Known Error → Verification Pending — getRoot() guard ships option-1 throw on empty rels); P013 captured (wr-jtbd:agent returns Relevant-files-only output, internal).

Last reviewed: 2026-06-03 **README reconciled** - 1 drift entry corrected: P013 added to WSJF Rankings (deferred placeholders Priority 3, Effort M, WSJF 1.5; pending re-rate at next /wr-itil:review-problems). Reconciliation contract per P118 + ADR-014 amended.

Last reviewed: 2026-06-03 **/wr-itil:review-problems** - P012 closed (verified in-session unit test); P010 auto-transition Open -> Known Error (root cause + workaround documented, WSJF 2.0 -> 4.0); P013 re-rated from deferred placeholders (Severity 3 -> 8, Effort M, WSJF 1.5 -> 4.0); P014 re-rated from deferred placeholders (Severity 3 -> 6, Effort M, WSJF 1.5 -> 3.0); P007 stays Verification Pending (no non-200 CI cycle since fix shipped); P002 / P005 kept after relevance-close caveat surface (upstream issues open, workarounds live).

Last reviewed: 2026-06-03 **P008 verification pending** - fix-strategy option 1 shipped: `scripts/check-em-dashes.sh` greps staged `*.md` for U+2014 via lint-staged `*.md` block, node:test suite covers 4 cases (clean / dirty / no-args / mixed-multi), `--no-verify` escape hatch preserved per JTBD-103 maintainer persona.

Last reviewed: 2026-06-03 **README reconciled** - 1 drift entry corrected: P015 added to WSJF Rankings (deferred placeholders Priority 3, Effort M, WSJF 1.5; pending re-rate at next /wr-itil:review-problems). Reconciliation contract per P118 + ADR-014 amended.

Last reviewed: 2026-06-03 **P009 closed as no longer relevant** - get-locality / get-postcode / get-state MCP tools already shipped in v1.0.0 (commit 88dda71, 2026-04-23; six weeks before P009 captured); ADR-079 Phase 1 evidence-shape `named-skill-or-feature-exists` cites src/server.mjs:220-265 + test/dynamic-tools.test.mjs (16/16 pass).

Last reviewed: 2026-06-03 **P015 verification pending** - structural Layer-2 fix shipped (acute Layer-1 already resolved this session via secret rotation): `scripts/check-npm-token.sh` exits 1 with `::error::` GHA annotation naming NPM_TOKEN + remediation when `NODE_AUTH_TOKEN` empty; wired into `.github/workflows/release.yml` BEFORE `changesets/action@v1`; `test/check-npm-token.test.mjs` covers empty / unset / present / no-token-leak (4/4 pass). Architect verdict: no ADR for Option A; OIDC trusted-publishing (Option B) warrants its own ADR if pursued.

Last reviewed: 2026-06-03 **P008 closed** - em-dash detection hook verified + closed on evidence (prior-session README cell `yes - observed` + iter-3 re-ran 5/5 tests green + exercised the hook live via lint-staged during commit 2f9edd2). Also this session: RAPIDAPI_KEY GHA secret rotated to active sibling key (P011 recovery), build-and-test CI green.

Last reviewed: 2026-06-03 **P016 captured** (session-retro gate b) - em-dash hook (P008) conflicts with /wr-architect:capture-adr template + decisions-compendium generator, both of which emit U+2014. ADR-006 commit hit it; reconciled here. AFK loop closing: P009 closed, P015 shipped (verifying), P008 closed, ADR-006 captured, npm 1.0.4 + RAPIDAPI_KEY recovered.
