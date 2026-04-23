---
"@mountainpass/addressr-mcp": major
---

feat!: HATEOAS-native tool contracts (breaking change)

Detail tools now accept a canonical `url` parameter instead of a resource ID, and all tools return a `{status, headers, body}` envelope. The `headers.link` field is parsed into `[{uri, rel, anchor?, title?}]` so MCP consumers can follow canonical and pagination links directly.

Breaking changes:

- `get-address` parameter renamed from `addressId` to `url` — pass the full canonical URL, e.g. `https://addressr.p.rapidapi.com/addresses/GANSW710280564`.
- `get-locality` parameter renamed from `localityId` to `url`.
- `get-postcode` parameter renamed from `postcode` to `url`.
- `get-state` parameter renamed from `stateAbbreviation` to `url`.
- All tool responses are now `{status, headers, body}` envelopes. The raw upstream JSON is on `body`; callers that used to consume the response as the JSON object directly must now read `.body`.

Migration: after a `search-*` call, read a `rel=canonical` link from `headers.link` and pass its `uri` to the matching `get-*` tool.

Also in this release:

- `ADDRESSR_RAPIDAPI_KEY` is now the preferred environment variable name; `RAPIDAPI_KEY` continues to work as a fallback.
- New README "Key Safety" section covering safer alternatives to pasting the raw key into MCP client configs.

See ADR-003 for the architectural decision.
