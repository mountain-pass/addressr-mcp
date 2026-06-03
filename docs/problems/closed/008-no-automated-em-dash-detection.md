# Problem 008: no automated em-dash detection

**Status**: Closed
**Reported**: 2026-05-14
**Closed**: 2026-06-03 (user-confirmed at /wr-itil:work-problems Step 6.5 halt batch. Evidence: prior-session README cell `yes - observed: 4/4 node:test pass + smoke /tmp/hook-smoke/ exits 1 on dirty.md with line-numbered stderr`; iter-3 (2026-06-03) additionally re-ran 5/5 em-dash tests green AND exercised the hook live via lint-staged on staged docs/problems/*.md during commit 2f9edd2. Fix shipped in commit 4da99ff: scripts/check-em-dashes.sh + lint-staged `*.md` block + node:test suite, `--no-verify` escape hatch preserved.)
**Priority**: 8 (Medium) - Impact: 2 x Likelihood: 4 (re-rated 2026-06-02: fires per non-trivial doc edit; LLM-authoring tell)
**Origin**: internal
**Effort**: S (re-rated 2026-06-02: M -> S; pre-commit hook + `grep -rP '\x{2014}'` is a small surface per body)
**WSJF**: 16.0 (auto-transition Open -> Known Error; Effort M -> S)
**Type**: technical

## Description

The user has a documented stylistic preference against em-dashes (U+2014) in user-facing prose (README, ADRs, problem tickets, commit messages, GitHub issue/PR bodies, changeset bodies). The preference is captured as a project-level feedback memory at `~/.claude/projects/-Users-tomhoward-Projects-addressr-mcp/memory/feedback_no_em_dashes.md` after the user flagged em-dashes during P004's verification.

The memory is loaded on every assistant session start, so future assistant-authored prose should avoid em-dashes by default. But there is no automated detection for em-dashes that slip through (assistant-authored or human-edited), and there is no pre-commit or CI gate that surfaces them.

This session demonstrated the cost: 17 em-dashes accumulated in `README.md` (some from the user's prior edits, some from the assistant's new `## How It Works` section authored earlier in the same session before the preference was made explicit). Cleanup was manual: identify each line via `grep -nP '\x{2014}'`, decide the appropriate replacement per occurrence (hyphen, comma, semicolon, parentheses, or rephrase), apply the edits.

## Symptoms

- Em-dashes silently land in committed prose. No CI surface, no pre-commit hook, no lint.
- The assistant memory catches future authoring but not retroactive cleanup or text from external sources (pasted content, prior contributors).
- Identification is manual: `grep -nP '\x{2014}'` per file, then per-occurrence judgement.

## Workaround

After authoring or editing user-facing prose, run `grep -rnP '\x{2014}' README.md docs/` (or wherever the change lands) and replace each occurrence. The Edit tool's `replace_all` with U+2014-surrounded-by-spaces to hyphen-surrounded-by-spaces covers ~80% of cases mechanically; the remainder need per-occurrence judgement to read naturally.

## Impact Assessment

- **Who is affected**: the user (every time em-dashes accumulate, they have to flag them; cleanup is a session-bridging interrupt to the actual work).
- **Frequency**: at least once per non-trivial doc edit. Em-dashes are an LLM-authoring tell, so any assistant-authored prose is a likely source.
- **Severity**: Low-Medium. Stylistic only; no service impact. But each occurrence triggers a context-switch interrupt mid-flow.
- **Analytics**: N/A.

## Root Cause Analysis

### Confirmed Root Cause

Two contributing factors:

1. No automation. The em-dash policy is in user memory + project memory, but the only enforcement is the assistant reading the memory at session start and remembering to apply it. There is no `markdownlint` rule, no CI step, no pre-commit hook scanning for U+2014 in committed prose.

2. The assistant default. LLM-authored prose is statistically more likely to use em-dashes than human-authored prose, so the assistant is the most common source of new em-dashes. Memory loaded at session start helps but is fallible (the assistant authored 4 em-dashes in `README.md`'s new section this session, despite the preference being implicit from the user's writing style; the preference was only made explicit AFTER the em-dashes shipped).

### Fix Strategy

Several options:

1. **Pre-commit hook (lightest)**: a Husky / lefthook / native git hook that runs `grep -rP '\x{2014}' --include='*.md' README.md docs/` and fails the commit when a match is found. Allows the user to override with `--no-verify` if needed. Zero CI cost.

2. **`markdown-a11y-assistant` skill enhancement**: add an em-dash detection pass to the existing markdown assistant skill. Already in scope (em-dash is canonically a markdown accessibility concern for screen readers and translation tools).

3. **CI lint step (heaviest)**: a workflow step that fails on em-dash detection. Adds CI duration; harder to override; surfaces the issue after push rather than at commit time.

4. **Auto-fix on save (Cursor/VSCode integration)**: an editor-time replacement. Out of scope for this project's tooling.

Option 1 is the natural fit: zero CI cost, surfaces at the moment the em-dash would be committed, easy to override when needed (some technical contexts genuinely want en-dashes or em-dashes - code blocks, quoted external text).

### Investigation Tasks

- [ ] Re-rate Priority and Effort at next /wr-itil:review-problems
- [ ] Confirm option 1's scope: which paths to scan (README.md, docs/, .changeset/) and which to exclude (CHANGELOG.md auto-generated, node_modules/, .git/, code-block contents within markdown if practical).
- [ ] Evaluate composition with option 2: the `markdown-a11y-assistant` skill may already cover this, in which case the pre-commit hook just delegates to it.

## Dependencies

- **Blocks**: (none)
- **Blocked by**: (none)
- **Composes with**: feedback_no_em_dashes.md (project memory) - the policy this ticket automates.

## Related

- captured via /wr-itil:capture-problem during /wr-retrospective:run-retro 2026-05-14
- ~/.claude/projects/-Users-tomhoward-Projects-addressr-mcp/memory/feedback_no_em_dashes.md
- commit `e271601` (the 17-em-dash cleanup that triggered this capture)

## Fix Released

Released 2026-06-03 in the AFK work-problems iter for P008. Fix strategy option 1 (pre-commit hook) shipped:

- `scripts/check-em-dashes.sh` greps each passed file for U+2014 via the literal UTF-8 byte sequence (BSD-grep compatible, no `-P` flag dependency); prints `<file>:<lineno>:<content>` to stderr on match; exits 1 if any match, 0 if all clean, 0 if zero args.
- `package.json` lint-staged block extended: `"*.md": "bash scripts/check-em-dashes.sh"` runs alongside the existing `prettier --write` on staged markdown.
- `test/check-em-dashes.test.mjs` covers the happy path (clean file -> 0), the failure path (em-dash -> 1 + line-numbered stderr), the no-args path (lint-staged glob matched nothing -> 0), the mixed-multi-file path (only dirty files surface in stderr), and the `README-history.md` skip path (forward-chronology archive of pre-hook prose is preserved verbatim per P134).
- `package.json` `test:unit` widened to glob both unit test files so the new test runs under `npm test` and CI.
- Override: `git commit --no-verify` per JTBD-103 persona escape hatch.

Exercised successfully in-session: ran `node --test test/check-em-dashes.test.mjs` -> 5/5 pass. Smoke test in `/tmp/hook-smoke/` confirms clean.md exits 0 and dirty.md exits 1 with `dirty.md:3:Has em-dash: U+2014` on stderr. Full unit suite (`npm run test:unit`) green at 15/15.

Awaiting user verification.
