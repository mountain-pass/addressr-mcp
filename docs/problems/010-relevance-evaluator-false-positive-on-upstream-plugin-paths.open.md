# Problem 010: relevance evaluator false-positive on upstream-plugin paths

**Status**: Open
**Reported**: 2026-06-02
**Priority**: 4 (Low) - Impact: 2 x Likelihood: 2 (re-rated 2026-06-02 capture: surface-batch-confirm catches the false-positives, user dispositions per batch)
**Origin**: internal
**Effort**: M
**WSJF**: 2.0
**Type**: technical

## Description

The `wr-itil:review-problems` Step 4.6 relevance-close pass invokes the `wr-itil-evaluate-relevance` script against each aged ticket. The script's `file-no-longer-exists` shape (ADR-079 Phase 1) extracts paths from the ticket body via regex and verifies each via `git ls-files --error-unmatch` against the current repo. Paths that don't resolve are cited as `file-no-longer-exists` evidence and the ticket routes to CLOSE-CANDIDATE or CLOSE-CANDIDATE-WITH-CAVEAT.

For tickets that track upstream-plugin bugs (e.g. P005, P006), the cited paths live in the upstream plugin source tree at `~/.claude/plugins/marketplaces/<marketplace>/packages/<plugin>/...`, NOT in this repo's tree. The evaluator correctly observes "these paths are not in `git ls-files`" but incorrectly classifies them as "file no longer exists" rather than "file is upstream and not expected to be local".

Reproduced 2026-06-02 during `/wr-itil:review-problems`:

```
--- docs/problems/005-external-comms-marker-fails-on-empty-session-id.open.md ---
CLOSE-CANDIDATE-WITH-CAVEAT 005-external-comms-marker-fails-on-empty-session-id.open.md - shapes: file-no-longer-exists - caveat: multi-phase-mixed-progress: 0 task(s) done, 3 outstanding - confirm umbrella scope before close - cites: all 3 file paths absent: .changeset/p004-how-it-works-readme.md;packages/itil/hooks/lib/session-id.sh;packages/retrospective/.../risk-score-mark.sh
exit=0

--- docs/problems/006-capture-problem-deferred-refresh-causes-downstream-halt.open.md ---
CLOSE-CANDIDATE-WITH-CAVEAT 006-capture-problem-deferred-refresh-causes-downstream-halt.open.md - shapes: file-no-longer-exists - caveat: multi-phase-mixed-progress: 0 task(s) done, 3 outstanding - confirm umbrella scope before close - cites: all 2 file paths absent: packages/itil/skills/capture-problem/SKILL.md;packages/itil/skills/manage-problem/SKILL.md
exit=0
```

Both tickets track active upstream bugs (P005 in `risk-score-mark.sh`; P006 in capture/manage-problem skills). Both were correctly kept open after the user disambiguated via the surface-batch-confirm contract.

## Symptoms

- `wr-itil-evaluate-relevance` emits `CLOSE-CANDIDATE` (no caveat) or `CLOSE-CANDIDATE-WITH-CAVEAT` on tickets whose `## Description` or `## Root Cause Analysis` cites paths beginning with `packages/<plugin>/`, `.changeset/`, or any other path that conventionally lives in an upstream plugin's source tree.
- The `cites:` field in the verdict line names each plugin path verbatim, presenting them as "absent from this repo" when they're authoritatively expected to be absent (the plugin lives upstream).
- The surface-batch-confirm flow in `wr-itil:review-problems` Step 4.6 catches these and routes to the user's AskUserQuestion, but the false-positive verdict adds disposition cost on every retro / review pass.

## Workaround

The surface-batch-confirm flow already catches the false-positives:
- The user reviews each CLOSE-CANDIDATE-WITH-CAVEAT entry and dispositions it (keep / close / defer).
- For plugin-tracking tickets, the answer is always "keep" and (per user direction 2026-06-02) "report upstream".
- No silent auto-close — the caveat shape is itself the safety net.

This means the bug is non-blocking but adds friction every review cycle.

## Impact Assessment

- **Who is affected**: any plugin-consumer repo (like this one) whose problem backlog tracks bugs in `@windyroad/*` plugins. The friction scales with the number of plugin-tracking tickets (currently P005, P006; potentially this ticket and any future captures).
- **Frequency**: every `/wr-itil:review-problems` invocation, every retro, every relevance-close pass.
- **Severity**: Low. The user has to disposition false-positives on each pass. Not blocking; not a correctness failure.
- **Analytics**: N/A.

## Root Cause Analysis

### Confirmed Root Cause

The `evaluate-relevance.sh` script's `file-no-longer-exists` shape regex matches paths under `(packages|docs|.github|bin|scripts)/[a-zA-Z0-9_./-]+\.(md|sh|...)`. The verification uses `git ls-files --error-unmatch <path>` against the current repo. The script has no awareness of plugin source-tree paths that conventionally live OUTSIDE the current repo (under `~/.claude/plugins/marketplaces/<marketplace>/packages/<plugin>/`).

The architect's Phase 1 false-positive remediations (P180 state-suffix detection, P244 sibling-file detection, P251 rename detection) address local-file false-positives. They do NOT address the upstream-plugin path class because the script architecture assumes "all matched paths SHOULD be in this repo".

### Fix Strategy

Several options at the upstream plugin level:

1. **Path-class allowlist (lightest)**: when a cited path matches `packages/<plugin>/` AND the same path resolves under `~/.claude/plugins/marketplaces/*/packages/<plugin>/`, suppress the `file-no-longer-exists` cite for that path. The script checks the standard plugin install location after the local-repo check.

2. **Ticket-frontmatter opt-out (medium)**: add a `tracks-upstream: true` frontmatter field that the relevance evaluator reads and skips the `file-no-longer-exists` shape on those tickets. Explicit per-ticket; requires authoring discipline.

3. **Path-prefix exclusion env var (heaviest)**: a `WR_ITIL_EVALUATE_RELEVANCE_UPSTREAM_PREFIXES` env var enumerating path prefixes the script should treat as upstream-expected. Adds configuration surface; harder to discover.

Option 1 is the natural fit: zero configuration, infers correctly from the installed plugin set.

### Investigation Tasks

- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems
- [ ] Confirm option 1 detects the upstream install location reliably across Claude Code versions / marketplaces.
- [ ] Report upstream against `windyroad/agent-plugins` once an existing-issue dedup search is run.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: P005, P006 (the two tickets that surfaced the false-positive); ADR-079 (relevance-close design; Phase 2 added shape vocabulary but did not address the upstream-plugin path class).

## Related

- captured via /wr-retrospective:run-retro 2026-06-02 (Step 2b pipeline-instability scan)
- relevance evaluator: `~/.claude/plugins/marketplaces/windyroad/packages/itil/bin/wr-itil-evaluate-relevance`
- canonical script body: `~/.claude/plugins/marketplaces/windyroad/packages/itil/scripts/evaluate-relevance.sh`
- ADR-079 (Relevance-close design, Phase 1 + Phase 2)
- P005 + P006 — the two false-positive observations from this session
