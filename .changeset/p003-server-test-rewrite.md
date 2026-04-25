---
"@mountainpass/addressr-mcp": patch
---

Fix integration test target: `test/server.test.mjs` now exercises the local MCP server end-to-end via `StdioClientTransport` (spawning `node src/server.mjs`) instead of the upstream RapidAPI-hosted aggregator. Assertions cover our kebab-case tool surface (`search-addresses`, `get-address`, `search-localities`, `get-locality`, `search-postcodes`, `get-postcode`, `search-states`, `get-state`, `health`) and our `{status, headers, body}` envelope shape. The suite skips cleanly when neither `RAPIDAPI_KEY` nor `ADDRESSR_RAPIDAPI_KEY` is set. Default `npm test` is restored to run unit + integration (`npm run test:unit && npm run test:integration`); keyless runs (CI without secrets, contributors without 1Password) still get full unit-suite signal, and keyed runs add live-API verification of the proxy.
