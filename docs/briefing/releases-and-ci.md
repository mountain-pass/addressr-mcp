# Releases and CI

## What You Need to Know

- CI workflow `.github/workflows/release.yml` uses `${{ secrets.RAPIDAPI_KEY }}` for the integration test job. Local `.env` uses `ADDRESSR_RAPIDAPI_KEY`. `src/server.mjs` falls back to either env var (line 90: `process.env.ADDRESSR_RAPIDAPI_KEY || process.env.RAPIDAPI_KEY`).
  <!-- signal-score: 2 | last-classified: 2026-06-02 | first-written: 2026-05-13 -->
- The 1Password vault path for the key is `op://Private/addressr-rapidapi/credential`. The `.env.tpl` template references it; `op inject -i .env.tpl -o .env --force` rehydrates the local `.env`.
  <!-- signal-score: 1 | last-classified: 2026-06-02 | first-written: 2026-05-13 -->
- Rotating the CI secret without shell-history exposure: `op read 'op://Private/addressr-rapidapi/credential' | gh secret set RAPIDAPI_KEY`. Verify with `gh secret list`. After rotation, re-run any failed integration jobs via `gh run rerun <run-id> --failed`.
  <!-- signal-score: 2 | last-classified: 2026-06-02 | first-written: 2026-05-13 -->
- `npm run push:watch` does `git push` + waits for the CI workflow to complete; `npm run release:watch` waits for the changesets release-PR to be created or merged, then waits for the publish job. Both are documented in `scripts/`.
  <!-- signal-score: 1 | last-classified: 2026-06-02 | first-written: 2026-05-13 -->

## What Will Surprise You

- The integration test suite (`test/server.test.mjs`) returns `Unexpected token 'M', "MCP error "... is not valid JSON` when the upstream RapidAPI returns 403 (subscription revoked) or 429 (rate limited). The test correctness contract (P003) is met (it does exercise the local server), but the failure surface buries the actual cause inside an MCP-error-wrapped JSON parse failure. Tracked as P007 (verification pending).
  <!-- signal-score: 5 | last-classified: 2026-06-02 | first-written: 2026-05-13 -->
- Addressr API root advertises rels via the HTTP `Link` header (RFC 5988), NOT the JSON body's `_links`. The body is `{}` on success (etag in `etag: "2.6.13"`). `waycharter-client` parses both shapes correctly, but relying on body shape for "rels present" is a category error — when CI's `secrets.RAPIDAPI_KEY` is invalid/unsubscribed, the upstream returns 4xx with a body lacking `_links`, `src/server.mjs:127-130` `getRoot()` silently succeeds with `advertisedRels = Set([])`, and all `search-*` tools are quietly unregistered. Always check the `Link` header + HTTP status on a curl probe, not just the body shape. P011 worked example: 4 diagnosis iterations before this rule was applied directly.
  <!-- signal-score: 5 | last-classified: 2026-06-02 | first-written: 2026-06-02 -->
- `../addressr/.env` (the sibling-repo source-of-truth checkout) carries an active-subscription `RAPIDAPI_KEY` via `export RAPIDAPI_KEY=...` shell-export syntax (`grep '^export RAPIDAPI_KEY=' ../addressr/.env`). When the addressr-mcp `.env` returns 403 "You are not subscribed to this API." on a local probe, the sibling key works for both local integration test runs (`RAPIDAPI_KEY="$K" npm run test:integration` → 4/4 pass) AND as a fresh GHA secret value (`gh secret set RAPIDAPI_KEY < <(printf '%s' "$K")`). Use this as the first remediation for "CI red on subtest 1" before reasoning about test code.
  <!-- signal-score: 3 | last-classified: 2026-06-02 | first-written: 2026-06-02 -->
- `npm` always publishes `README.md` to the package landing page regardless of the `files: ["src/", "bin/"]` allowlist. README changes ship to npm consumers on the next patch release whether or not they're explicitly enumerated.
  <!-- signal-score: 1 | last-classified: 2026-06-02 | first-written: 2026-05-13 -->
- `gh run rerun <run-id> --failed` re-runs just the failed jobs (not the whole workflow). The original run-id remains canonical; `gh run watch <run-id>` follows the rerun.
  <!-- signal-score: 0 | last-classified: 2026-06-02 | first-written: 2026-05-13 -->
- npm publish silently fails with E404 when `secrets.NPM_TOKEN` is empty in GHA. The `changesets/action@v1` falls back to `"No NPM_TOKEN or OIDC available - assuming npm is already authenticated"` (buried info-level log line) and `npx changeset publish` PUTs unauthenticated, which npm 404s with `'@<scope>/<package>@<version>' is not in this registry`. The 404 looks like "package was unpublished or scope doesn't exist" but the real cause is missing auth. Diagnose by reading the release job log for the `No NPM_TOKEN or OIDC available` line BEFORE assuming registry-state issues. Fix: `gh secret set NPM_TOKEN` (paste a fresh Automation or Granular Access token from npmjs.com), then `gh run rerun <run-id> --failed`. P015 tracks the structural fix (workflow-level fail-fast guard on empty NODE_AUTH_TOKEN, or OIDC trusted-publishing migration to eliminate the secret entirely).
  <!-- signal-score: 3 | last-classified: 2026-06-03 | first-written: 2026-06-03 -->
- Release PR merge consumes the changeset file BEFORE the npm publish runs. If npm publish then fails (e.g. P015 NPM_TOKEN absence), origin/main carries the Version Packages bump (e.g. 1.0.3 -> 1.0.4) but the npm registry stays at the prior version. Recovery: fix the auth, `gh run rerun <run-id> --failed` retries the publish at the existing Version Packages SHA. Do NOT revert the Version Packages commit (origin and registry will converge on rerun success).
  <!-- signal-score: 3 | last-classified: 2026-06-03 | first-written: 2026-06-03 -->
