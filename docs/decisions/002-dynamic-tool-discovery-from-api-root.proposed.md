# ADR-002: Dynamic Tool Discovery from API Root

## Status

proposed

## Context

The Addressr MCP server currently registers three hardcoded MCP tools (`search-addresses`, `get-address`, `health`) that proxy to specific Addressr API endpoints. The Addressr API exposes additional endpoints (localities, postcodes, states) that are not available through the MCP server.

The Addressr API uses HATEOAS Link headers on its root response (`/`) to advertise available capabilities. Each link has a `rel` attribute (e.g., `https://addressr.io/rels/address-search`). The server already uses `@windyroad/fetch-link` to follow these links.

## Decision

We will make the MCP server dynamically discover and register tools based on the link relations advertised by the Addressr API root response.

### Approach

1. **Static mapping table** (`REL_TO_TOOL`): A mapping from known `rel` URIs to `{name, description, zodSchema}` that defines how each link relation becomes an MCP tool.

2. **Startup discovery**: At server startup, fetch the API root and parse its Link headers.

3. **Dynamic registration**: For each discovered rel that exists in `REL_TO_TOOL`, register an MCP tool via `server.tool()`.

4. **Unknown rels**: If the API advertises a rel not in `REL_TO_TOOL`, log a warning and skip it. The server does not crash.

### Why not fully dynamic?

The Addressr API does not provide machine-readable metadata (OpenAPI, JSON-LD) at its link relation URIs or at `/api-docs` (requires auth, 403 for this project). Without metadata, we cannot derive human-friendly tool names, descriptions, or Zod schemas from bare rel URIs. A static mapping is the pragmatic workaround.

### Failure handling

- If the API root is unreachable at startup, the server retries once after 2 seconds, then falls back to registering only the `health` tool.
- If the API root returns an error, the same fallback applies.
- This ensures the MCP server starts even when RapidAPI is flaky.

## Consequences

- **Positive**: New Addressr endpoints are automatically exposed as MCP tools when their rel is added to `REL_TO_TOOL`. No server code changes needed for new endpoints.
- **Positive**: The MCP server stays thin — it proxies whatever the API exposes.
- **Negative**: Adding support for a new Addressr endpoint still requires updating `REL_TO_TOOL` (but not the tool registration logic).
- **Negative**: Startup now depends on an external HTTP call. Mitigated by retry + fallback.

## Related

- P001 (Unsupported Addressr API Endpoints)
- P002 (Addressr Link Relations Not Resolvable)
- JTBD-001 through JTBD-006
