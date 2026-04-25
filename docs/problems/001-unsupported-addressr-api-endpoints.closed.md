# Problem 001: Unsupported Addressr API Endpoints

**Status**: Closed
**Reported**: 2026-04-23
**Priority**: 12 (Medium-High) — Impact: Moderate (3) x Likelihood: Likely (4)
**Effort**: M
**WSJF**: 6.0

## Description

The Addressr API has added new endpoints that are not currently supported by the MCP server. Users of the MCP cannot access these new capabilities, limiting the utility of the integration.

## Symptoms

- MCP tool calls fail or return errors when targeting new Addressr API endpoints
- Users report missing functionality compared to the native Addressr API
- Documentation discrepancies between Addressr API and MCP tool offerings

## Workaround

Users must call the Addressr API directly (e.g., via curl or RapidAPI playground) for localities, postcodes, and states endpoints. No workaround exists within the MCP server.

## Impact Assessment

- **Who is affected**: Users of the Addressr MCP server who need access to newer API features
- **Frequency**: Whenever users attempt to use new endpoints through the MCP
- **Severity**: Medium — core functionality works, but newer features are unavailable
- **Analytics**: N/A

## Root Cause Analysis

### Confirmed Root Cause

The MCP server in `src/server.mjs` only registers 3 tools while the Addressr API exposes 8+ endpoints. The server follows link relations from the API root but only wires up tools for `search-addresses` (rel: `https://addressr.io/rels/address-search`), `get-address` (rel: `canonical` on address resources), and `health` (rel: `https://addressr.io/rels/health`).

Missing endpoints identified from the Addressr API surface:
- `GET /localities?q=` and `GET /localities/{pid}` — not exposed as MCP tools
- `GET /postcodes?q=` and `GET /postcodes/{postcode}` — not exposed as MCP tools
- `GET /states?q=` and `GET /states/{abbreviation}` — not exposed as MCP tools

### Fix Strategy (Revised)

Instead of statically adding 6 new tool registrations, make the MCP server **dynamically discover and register tools** based on the link relations provided by the Addressr API root (`/`). The server already uses `glowUpFetchWithLinks` to follow hypermedia links. The dynamic approach would:

1. Fetch the API root at startup
2. Parse available link relations (`rel` values in Link headers or HAL `_links`)
3. Map each discoverable relation to an MCP tool definition (name, description, Zod schema)
4. Register tools dynamically via `server.tool()` before connecting the transport

This automatically supports any future Addressr API endpoints without code changes, and keeps the MCP server truly thin — it proxies whatever the API exposes rather than hardcoding a subset.

**Open question**: How to derive Zod schemas and human-friendly tool names/descriptions from bare link relations. The API may need to embed machine-readable metadata (e.g., OpenAPI hints, schema links) or the server may need a static mapping table from rel → {name, description, schema}.

### Investigation Tasks

- [x] Investigate root cause
- [x] Create reproduction test
- [x] Implement fix

## Fix Released

Released in v1.0.0 (commit d344a6a — `feat: dynamic tool discovery from Addressr API root`). Implemented dynamic tool discovery via `REL_TO_TOOL` mapping in `src/server.mjs`. The server now registers tools for all link relations advertised by the Addressr API root: `search-addresses`, `search-localities`, `search-postcodes`, `search-states`, `get-address`, `health`.

- ADR-002 documents the dynamic discovery pattern
- `test/dynamic-tools.test.mjs` verifies dynamic registration
- Awaiting user verification before closing

## Dependencies

- **Blocks**: (none)
- **Blocked by**: P002
- **Composes with**: (none)

## Related

- [Addressr API documentation](https://github.com/mountain-pass/addressr)
- [RISK-POLICY.md](../RISK-POLICY.md)
