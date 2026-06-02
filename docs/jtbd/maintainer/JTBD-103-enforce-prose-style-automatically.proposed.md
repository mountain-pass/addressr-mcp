---
status: proposed
job-id: enforce-prose-style-automatically
persona: maintainer
date-created: 2026-06-03
human-oversight: pending
screens:
  - scripts/check-em-dashes.sh
  - package.json (lint-staged block)
  - .husky/pre-commit
  - test/check-em-dashes.test.mjs
---

# JTBD-103: Enforce Prose Style Automatically

## Job Statement
When authoring or editing user-facing markdown (README, ADRs, problem tickets, changeset bodies), I want documented prose-style preferences enforced deterministically at commit time, so that style slips do not silently land in main and force a session-bridging cleanup interrupt later.

## Desired Outcomes
- Em-dashes (U+2014) in staged `*.md` files fail the commit with a line-numbered report, so the author can replace the character before the change lands.
- The check runs only on staged files, so unstaged or unrelated em-dashes do not block the commit.
- An escape hatch exists for the rare legitimate U+2014 case (quoted external text, code-block content): `git commit --no-verify` is the documented bypass.
- Future stylistic policies (e.g. straight vs curly quotes) can be added to the same surface without re-architecting.

## Persona Constraints
- Husky 9 + lint-staged already wired; new gates compose into that surface rather than introducing a new one.
- Pure ESM, Node 18+, node:test runner. Bash scripts called from npm scripts are acceptable per the existing `scripts/push-and-watch.sh` precedent.
- Deterministic controls are enforced via package.json scripts, git hooks, and CI (per AGENTS.md).

## Current Solutions
- The user has a documented preference against em-dashes captured in project memory at `feedback_no_em_dashes.md`.
- Enforcement is currently fallible LLM session-start memory plus manual `grep -nP '\x{2014}'` cleanup. Each slip costs a context-switch interrupt (see P008 Impact Assessment).

## Motivating Evidence
- P008 (no automated em-dash detection): 17 em-dashes accumulated in `README.md` across one session before being caught manually; the prose-style preference was implicit until the slip surfaced it.
- The em-dash is an LLM-authoring tell, so any assistant-authored markdown is a likely source; frequency is at least once per non-trivial doc edit.
