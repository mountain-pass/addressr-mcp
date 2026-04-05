---
status: proposed
date: 2026-04-05
decision-makers: [Tom Howard]
consulted: []
informed: []
---

# ADR 001: Standalone MCP Server Package

## Context and Problem Statement

The Addressr API is distributed via RapidAPI, which auto-generates an MCP server. However, the auto-generated server has poor tool names, minimal descriptions, and no HATEOAS awareness. A standalone MCP server package provides better tool naming, richer descriptions, and a marketing/discovery channel via npm.

## Decision Drivers

- Better tool names and descriptions for AI agent consumption
- npm discoverability (`npx @mountainpass/addressr-mcp`)
- Control over the MCP experience independent of RapidAPI's auto-generation
- Separation from the main addressr repo due to CJS/ESM friction (addressr uses Babel/CJS, MCP SDK is ESM-only)

## Considered Options

1. **Standalone package in separate repo** — pure ESM, independent release cycle
2. **Monorepo with addressr** — shared infrastructure, atomic changes
3. **Rely on RapidAPI auto-generated MCP** — zero maintenance

## Decision Outcome

**Option 1: Standalone package in separate repo.** The MCP server is a thin HTTP proxy to the RapidAPI endpoint. It has no source-level dependency on addressr internals, making a separate repo the pragmatic choice.

### Consequences

- Good: Clean ESM setup, no Babel baggage
- Good: Independent release cadence
- Good: Zero risk to addressr publish pipeline
- Good: npm discoverability for marketing
- Bad: Duplicated CI/tooling setup
- Bad: Version coordination with addressr is manual

### Confirmation

- `npx @mountainpass/addressr-mcp` starts a working MCP server
- All three tools (search, detail, health) return correct data
- Tests pass in CI

### Reassessment Criteria

- Addressr migrates to native ESM (ADR 005 superseded) — monorepo becomes viable
- Need for source-level sharing between packages
- MCP becomes primary distribution channel requiring tighter coupling
