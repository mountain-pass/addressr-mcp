# Briefing: addressr-mcp

Cross-session knowledge index. Each entry has signal/noise scoring per P105 (Step 1.5 of `/wr-retrospective:run-retro`).

## Topic Index

| Topic | File | Summary |
|-------|------|---------|
| Hooks and gates | [hooks-and-gates.md](hooks-and-gates.md) | architect / JTBD / TDD / external-comms gate behaviour and known propagation gaps |
| Governance workflow | [governance-workflow.md](governance-workflow.md) | problem lifecycle, capture/work/review skill ordering, in-session verification surfaces |
| Releases and CI | [releases-and-ci.md](releases-and-ci.md) | changesets, GitHub Actions secret naming, push/release watch workflow |

## Critical Points

Pinned at the top of every SessionStart per the P105 roll-up curation. Soft cap ~10 bullets / 2 KB Tier 1 envelope.

- `/wr-itil:capture-problem` defers the `docs/problems/README.md` refresh; the next governance skill in the same session (work-problem, list-problems, review-problems) WILL halt on P118 HALT_ROUTE_RECONCILE. Route through `/wr-itil:review-problems` first to reconcile, then continue.
  <!-- signal-score: 3 | last-classified: 2026-05-13 | first-written: 2026-05-13 -->
- CI secret name is `RAPIDAPI_KEY` (no `ADDRESSR_` prefix). The Node code falls back to either, but `.github/workflows/release.yml` references `secrets.RAPIDAPI_KEY`. Local `.env` uses `ADDRESSR_RAPIDAPI_KEY`.
  <!-- signal-score: 3 | last-classified: 2026-05-13 | first-written: 2026-05-13 -->
- Live MCP integration in the Claude Code session is the cheapest verification surface for any change to `src/server.mjs` envelope shape or tool-name contract. Exercise `mcp__addressr__*` tools and observe `{status, headers, body}` shape + kebab-case tool names; closes verification-pending tickets on evidence.
  <!-- signal-score: 3 | last-classified: 2026-05-13 | first-written: 2026-05-13 -->
- No em-dashes in user-facing prose (README, ADRs, problem tickets, commit messages, GitHub issues/PRs, changeset bodies). Use hyphens, commas, semicolons, or rephrase. Memory at `feedback_no_em_dashes.md`.
  <!-- signal-score: 3 | last-classified: 2026-05-13 | first-written: 2026-05-13 -->
