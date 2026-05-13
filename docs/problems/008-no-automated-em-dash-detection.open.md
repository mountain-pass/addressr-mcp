# Problem 008: no automated em-dash detection

**Status**: Open
**Reported**: 2026-05-14
**Priority**: 3 (Medium) - Impact: 3 x Likelihood: 1 (deferred - re-rate at next /wr-itil:review-problems)
**Effort**: M (deferred - re-rate at next /wr-itil:review-problems)
**Type**: technical

## Description

The user has a documented stylistic preference against em-dashes (`—`, U+2014) in user-facing prose (README, ADRs, problem tickets, commit messages, GitHub issue/PR bodies, changeset bodies). The preference is captured as a project-level feedback memory at `~/.claude/projects/-Users-tomhoward-Projects-addressr-mcp/memory/feedback_no_em_dashes.md` after the user flagged em-dashes during P004's verification.

The memory is loaded on every assistant session start, so future assistant-authored prose should avoid em-dashes by default. But there is no automated detection for em-dashes that slip through (assistant-authored or human-edited), and there is no pre-commit or CI gate that surfaces them.

This session demonstrated the cost: 17 em-dashes accumulated in `README.md` (some from the user's prior edits, some from the assistant's new `## How It Works` section authored earlier in the same session before the preference was made explicit). Cleanup was manual: identify each line via `grep -nP '\x{2014}'`, decide the appropriate replacement per occurrence (hyphen, comma, semicolon, parentheses, or rephrase), apply the edits.

## Symptoms

- Em-dashes silently land in committed prose. No CI surface, no pre-commit hook, no lint.
- The assistant memory catches future authoring but not retroactive cleanup or text from external sources (pasted content, prior contributors).
- Identification is manual: `grep -nP '\x{2014}'` per file, then per-occurrence judgement.

## Workaround

After authoring or editing user-facing prose, run `grep -rnP '\x{2014}' README.md docs/` (or wherever the change lands) and replace each occurrence. The Edit tool's `replace_all` with ` — ` to ` - ` covers ~80% of cases mechanically; the remainder need per-occurrence judgement to read naturally.

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
