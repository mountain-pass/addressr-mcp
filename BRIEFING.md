# Project Briefing

This file is injected into every Claude Code session. Maintained by the `/retrospective` skill.

## What You Need to Know

- **This is an MCP server** that proxies tool calls to the Addressr API via RapidAPI
- **Companion repo** to [addressr](https://github.com/mountain-pass/addressr) — the main API server
- **Pure ESM** package with `type: module` — no Babel, no CJS
- **Three tools**: `search-addresses`, `get-address`, `health`
- **Published to npm** as `@mountainpass/addressr-mcp`
- **Customers run it via** `npx @mountainpass/addressr-mcp` with their RAPIDAPI_KEY
- **RapidAPI auth uses** `x-rapidapi-key` and `x-rapidapi-host` headers (standard RapidAPI pattern)
- **Business metrics are confidential** — never commit user counts, revenue, pricing
