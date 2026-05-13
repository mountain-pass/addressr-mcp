---
"@mountainpass/addressr-mcp": patch
---

docs: add "How It Works" section to README explaining the proxy / on-demand-fetch context model

Adopters can now answer "how does this stay cheap with 13 million addresses?" from the README alone, without needing to inspect `src/server.mjs`. The new section names the proxy model, lists what enters the AI client's context (tool schemas at session start plus matched results per call), and walks one concrete `search-addresses` to `get-address` flow.

Closes P004.
