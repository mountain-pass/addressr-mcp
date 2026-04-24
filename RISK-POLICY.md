# Risk Policy

**Last reviewed**: 2026-04-24

This project follows ISO 31000 risk management principles. Risk scoring is enforced via Claude Code hooks.

## Business Context

`@mountainpass/addressr-mcp` is a Model Context Protocol (MCP) server that proxies the Addressr Australian address API (distributed via RapidAPI) to LLM-based AI clients (Claude Desktop, Cursor, Claude Code, VS Code, etc.). It is a thin stateless HTTP proxy — no database, no user accounts, no web UI.

Users:

- **Developers** using an MCP client who want to search, validate, or geocode Australian addresses from inside their AI assistant.
- **Maintainers** of the MCP server package and its companion [addressr](https://github.com/mountain-pass/addressr) repository.

Dependencies the project cannot control:

- RapidAPI marketplace availability.
- Upstream Addressr API availability and contract stability.
- `@modelcontextprotocol/sdk` (upstream MCP protocol SDK).
- Node.js runtime (≥18).

## Confidential Information

This repository is **public** on GitHub (github.com/mountain-pass/addressr-mcp). Business metrics must never appear in committed files, including:

- Revenue or margin figures for the Addressr service.
- User or subscriber counts for the MCP server or the upstream API.
- Pricing outside what is already public on RapidAPI listing pages.
- API request volumes, traffic patterns, or customer lists.

When referring to such metrics in code comments, commit messages, or docs, use generic descriptions ("a production user", "high-volume tier") rather than concrete numbers.

## Risk Appetite

- **Release risk appetite**: 4/25 (Low)
- **Commit risk appetite**: 4/25 (Low)

Pipeline actions (commit, push, release) with cumulative residual risk above appetite are blocked by the scorer gate and require risk-reducing remediations before proceeding.

## Impact Levels

| Level | Label | Description |
|-------|-------|-------------|
| 1 | Negligible | No user impact. Internal dev-tool edit (hook config, local script) with no effect on installed users. |
| 2 | Minor | Developer or build workflow disrupted. CI green, published package unaffected. Example: lint rule change. |
| 3 | Moderate | Publishing or release flow disrupted — changesets broken, npm publish blocked, or new versions cannot be cut. Installed users unaffected until the next update. Also: confidential information disclosure (revenue, user counts, traffic figures) committed to the public repo — requires immediate remediation even if service is unaffected. |
| 4 | Significant | User-facing features degraded. MCP tool calls fail, return wrong data, or crash the server. Published versions must be pulled or patched quickly. |
| 5 | Severe | RapidAPI key leak, data integrity failure, or trust-destroying incident. Credentials exposed in git history; users silently served malformed data; or the MCP server abused to exfiltrate data. |

## Likelihood Levels

| Level | Label | Description |
|-------|-------|-------------|
| 1 | Rare | Requires unusual conditions. Architectural safeguards and tests make occurrence very unlikely. |
| 2 | Unlikely | Could happen but CI gates, review hooks, and tests significantly reduce probability. |
| 3 | Possible | Moderate complexity or limited test coverage. Could occur under normal conditions. |
| 4 | Likely | Complex change, many code paths, or limited controls. Expected to occur without intervention. |
| 5 | Almost certain | Known gap, no controls in place, or previously observed failure mode. |

## Risk Matrix

| Impact \ Likelihood | 1 Rare | 2 Unlikely | 3 Possible | 4 Likely | 5 Almost certain |
|---|---|---|---|---|---|
| 1 Negligible | 1 | 2 | 3 | 4 | 5 |
| 2 Minor | 2 | 4 | 6 | 8 | 10 |
| 3 Moderate | 3 | 6 | 9 | 12 | 15 |
| 4 Significant | 4 | 8 | 12 | 16 | 20 |
| 5 Severe | 5 | 10 | 15 | 20 | 25 |

**Label bands**: 1-2 Very Low · 3-4 Low · 5-9 Medium · 10-16 High · 17-25 Very High.

Used by the risk-scorer agent (pipeline risk assessment) and the problem management process (ticket severity via `/wr-itil:manage-problem`).

## Key Risks

1. **API key exposure** — `RAPIDAPI_KEY` / `ADDRESSR_RAPIDAPI_KEY` must never be committed. Mitigated by the secret-leak-gate hook and the `.env` / `.env.*` gitignore allowlist.
2. **RapidAPI dependency** — service availability depends on RapidAPI uptime and the upstream Addressr API. Mitigated by the `health` tool and graceful error handling in `src/server.mjs`.
3. **MCP SDK breaking changes** — upstream `@modelcontextprotocol/sdk` updates could break the server. Mitigated by pinned dependency ranges and CI tests.
4. **Confidential information disclosure** (public repo) — revenue, user counts, pricing, and traffic figures must not be committed. Mitigated by the Confidential Information section above and reviewer awareness.

## Scoring Guidance

### MCP tool contract changes

Consumers of this server are LLMs, not compiled clients. They call `listTools` every session and read the current schema — tool names, parameter names, descriptions, response shape. They do not cache parameter names or response shapes across versions.

When scoring a breaking change to tool names, parameter names, or response shape, do **not** apply generic "breaking API contract" likelihood modifiers. The LLM absorbs the new schema from the updated `description` fields on the next session, without any migration code. Deprecation shims for renamed parameters are usually redundant — the schema is the contract.

Score the residual impact on non-LLM callers only: hardcoded JSON-RPC scripts, published playbooks or prompt templates that embed parameter names in instruction text, and mid-flight conversations where the LLM constructed a call before the server upgraded (transient, self-correcting on the next turn). At pre-1.0, this surface is typically Low.
