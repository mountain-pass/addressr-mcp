---
"@mountainpass/addressr-mcp": patch
---

Upgrade `eslint` and `@eslint/js` from v9 → v10 (major). Existing flat-config in `eslint.config.js` (uses `js.configs.recommended` + `eslint-config-prettier`) is fully compatible with no changes; lint and tests pass clean. Dev-dep only — no impact on the published package or runtime behaviour.
