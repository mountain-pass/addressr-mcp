# Claude Code

Follow the instructions in [AGENTS.md](AGENTS.md).

Use the planning tool and AskQuestions too liberally.

Use test driven development. i.e. write the failing test first.

## Decision Management

Architectural and technical decisions must be documented per [DECISION-MANAGEMENT.md](DECISION-MANAGEMENT.md). Designs and implementations should align with the existing decision records in [docs/decisions/](docs/decisions/). When proposing changes that conflict with an existing decision, either follow the supersession process or discuss the deviation with the user first.

## Project Context

This is an MCP (Model Context Protocol) server for the Addressr Australian address API. It is a thin proxy that forwards MCP tool calls to the Addressr API via RapidAPI.

- **Pure ESM** (`type: module`) — no Babel, no CJS
- **Node 18+** required (Node 22 in CI)
- **Three tools**: `search-addresses`, `get-address`, `health`
- **Companion to** the main [addressr](https://github.com/mountain-pass/addressr) repo
- **No web UI** — accessibility requirements do not apply

## Non-Negotiable

- Never commit API keys or secrets
- Keep the server thin — it proxies to RapidAPI, not to OpenSearch directly
- Business metrics (revenue, user counts, pricing) are confidential
