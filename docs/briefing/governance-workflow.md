# Governance Workflow

## What You Need to Know

- Skill ordering for typical problem flow: `/wr-itil:capture-problem <description>` (lightweight, defers index refresh) → `/wr-itil:review-problems` (refresh ranking, re-rate) → `/wr-itil:work-problem <NNN>` (delegates to manage-problem). Skipping review-problems between capture and work always triggers the P118 README-drift halt.
  <!-- signal-score: 3 | last-classified: 2026-05-13 | first-written: 2026-05-13 -->
- Closing a `.verifying.md` ticket on in-session evidence (live MCP tool calls, test runs, observable behaviour) is documented in manage-problem Step 9d and review-problems Step 4. The evidence must be specific (tool invocation + observable outcome per ADR-026). Bare "I think it's verified" does not qualify.
  <!-- signal-score: 2 | last-classified: 2026-05-13 | first-written: 2026-05-13 -->
- Live MCP tool exercise via the Claude Code session is the canonical verification surface for any change to `src/server.mjs` tool registration, envelope shape, or upstream-API integration. Call `mcp__addressr__health`, `mcp__addressr__search-addresses`, etc. and observe the response envelope and tool-name resolution. Upstream API errors (403, 429) round-trip faithfully through the proxy and are not a verification failure as long as the envelope shape and tool names are correct.
  <!-- signal-score: 3 | last-classified: 2026-05-13 | first-written: 2026-05-13 -->
- Stylistic feedback (em-dashes, voice/tone) is captured as project-level feedback memory at `~/.claude/projects/-Users-tomhoward-Projects-addressr-mcp/memory/`. The memory is loaded on every session start; new sessions apply it without re-prompting.
  <!-- signal-score: 2 | last-classified: 2026-05-13 | first-written: 2026-05-13 -->

## What Will Surprise You

- A ticket can be "Verified by user" but still need a follow-up commit. P004 was verified on the README content but the user immediately flagged em-dashes in the same content, and the closure commit folded the cleanup with the `.verifying.md` to `.closed.md` transition. The verification was conditional; the closure landed both in one commit.
  <!-- signal-score: 2 | last-classified: 2026-05-13 | first-written: 2026-05-13 -->
- Architect and JTBD agents can run in parallel via a single tool-call block for review of proposed project-file edits. Each runs in its own context. Both returning PASS WITH NOTES in parallel is the common case for stylistic-but-content-bearing edits like README sections.
  <!-- signal-score: 2 | last-classified: 2026-05-13 | first-written: 2026-05-13 -->
