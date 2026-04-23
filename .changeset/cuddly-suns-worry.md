---
"@mountainpass/addressr-mcp": minor
---

feat: dynamic tool discovery from Addressr API root

The MCP server now dynamically discovers and registers tools based on the link relations advertised by the Addressr API root response. This exposes three new MCP tools:

- `search-localities` — search Australian suburbs/localities
- `search-postcodes` — search Australian postcodes
- `search-states` — search Australian states and territories

A static `REL_TO_TOOL` mapping maps known link relation URIs to tool definitions. The server fetches the API root at startup and registers a tool for each advertised relation. If the API root is unreachable, the server falls back to registering only `health` and `get-address`.

See ADR-002 for the architectural decision.
