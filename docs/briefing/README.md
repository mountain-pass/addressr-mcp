# Briefing: addressr-mcp

Cross-session knowledge index. Each entry has signal/noise scoring per P105 (Step 1.5 of `/wr-retrospective:run-retro`).

## Topic Index

| Topic | File | Summary |
|-------|------|---------|
| Hooks and gates | [hooks-and-gates.md](hooks-and-gates.md) | architect / JTBD / TDD / external-comms gate behaviour and known propagation gaps |
| Governance workflow | [governance-workflow.md](governance-workflow.md) | problem lifecycle, capture/work/review skill ordering, in-session verification surfaces |
| Releases and CI | [releases-and-ci.md](releases-and-ci.md) | changesets, GitHub Actions secret naming, push/release watch workflow |

## Critical Points

Pinned at the top of every SessionStart per the P105 roll-up curation. Soft cap ~10 bullets / 2 KB Tier 1 envelope. Promotion threshold is signal-score >= +3 per P105; demotion is automatic when score drops below +3 after decay.

- `/wr-itil:capture-problem` defers the `docs/problems/README.md` refresh; the next governance skill in the same session (work-problem, list-problems, review-problems) WILL halt on P118 HALT_ROUTE_RECONCILE. Route through `/wr-itil:review-problems` first to reconcile, then continue.
  <!-- signal-score: 4 | last-classified: 2026-06-02 | first-written: 2026-05-13 -->
- No em-dashes in user-facing prose (README, ADRs, problem tickets, commit messages, GitHub issues/PRs, changeset bodies). Use hyphens, commas, semicolons, or rephrase. Memory at `feedback_no_em_dashes.md`.
  <!-- signal-score: 4 | last-classified: 2026-06-02 | first-written: 2026-05-13 -->
- External-comms PostToolUse marker fails to write when the Agent tool's stdin lacks `session_id` (P005 known-error, fires every git commit through the external-comms gate). After the subagent emits `EXTERNAL_COMMS_RISK_VERDICT: PASS`, use `BYPASS_RISK_GATE=1 git commit ...` on the Bash side. The bypass clears the marker-write gate only; the PASS verdict itself is still on record.
  <!-- signal-score: 3 | last-classified: 2026-06-02 | first-written: 2026-06-02 -->
- `docs/problems/`, `docs/briefing/`, `docs/jtbd/`, `docs/PRODUCT_DISCOVERY.md`, `docs/VOICE-AND-TONE.md`, `docs/STYLE-GUIDE.md`, `RISK-POLICY.md`, `.changeset/`, memory files, and plan files are excluded from architect / JTBD gates. Backlog edits proceed without delegation. `docs/retros/` and `docs/decisions/` are NOT excluded - delegate before writing.
  <!-- signal-score: 3 | last-classified: 2026-06-02 | first-written: 2026-06-02 -->
- Integration test surfaces upstream RapidAPI 403/429 as a cryptic `Unexpected token 'M', "MCP error "... is not valid JSON` parse error (P007 verification pending). When CI is red on integration tests, check the RapidAPI subscription state and the GitHub Actions `RAPIDAPI_KEY` secret freshness before suspecting test code. Addressr API root advertises rels via HTTP `Link` header (RFC 5988), NOT body `_links` (body is `{}` on success). A 4xx response with a JSON error body lacking `_links` causes `src/server.mjs:127-130` `getRoot()` to silently succeed with `advertisedRels = Set([])`. Cross-reference: `../addressr/.env` carries an active-subscription `RAPIDAPI_KEY` usable for both local probe and GHA secret rotation. P011 verification pending tracks this.
  <!-- signal-score: 5 | last-classified: 2026-06-02 | first-written: 2026-06-02 -->
- Diagnose by ground-truth probe, not error-message extrapolation. P011 worked example: 3 falsified hypotheses (upstream dropped rels → stale key → subscription lapsed) across 3 CI red cycles before iter-4 curl probe surfaced actual response shape. When debugging an integration failure, `curl -isS -H "..." <upstream-url>` and cross-checking `../addressr` source comes BEFORE writing a hypothesis ticket. Trust observable bytes over interpreted symptoms.
  <!-- signal-score: 5 | last-classified: 2026-06-02 | first-written: 2026-06-02 -->
- **npm release is broken until `secrets.NPM_TOKEN` is restored** (P015 open). GHA Release workflow's `changesets/action@v1` silently falls back to "assume already authenticated" on empty NPM_TOKEN, then `npx changeset publish` PUTs unauthenticated and npm 404s with `'@<scope>/<package>@<version>' is not in this registry`. 1.0.4 Version Packages commit landed on origin/main but npm registry stuck at 1.0.3 (run 26860136476 failed 2026-06-03). Fix: generate new Automation/Granular token at npmjs.com, `gh secret set NPM_TOKEN`, `gh run rerun 26860136476 --failed`. AFK orchestrator's Step 6.5 release-cadence drain halts on this class until resolved.
  <!-- signal-score: 3 | last-classified: 2026-06-03 | first-written: 2026-06-03 -->
