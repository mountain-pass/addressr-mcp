# Releases and CI

## What You Need to Know

- CI workflow `.github/workflows/release.yml` uses `${{ secrets.RAPIDAPI_KEY }}` for the integration test job. Local `.env` uses `ADDRESSR_RAPIDAPI_KEY`. `src/server.mjs` falls back to either env var (line 90: `process.env.ADDRESSR_RAPIDAPI_KEY || process.env.RAPIDAPI_KEY`).
  <!-- signal-score: 3 | last-classified: 2026-05-13 | first-written: 2026-05-13 -->
- The 1Password vault path for the key is `op://Private/addressr-rapidapi/credential`. The `.env.tpl` template references it; `op inject -i .env.tpl -o .env --force` rehydrates the local `.env`.
  <!-- signal-score: 2 | last-classified: 2026-05-13 | first-written: 2026-05-13 -->
- Rotating the CI secret without shell-history exposure: `op read 'op://Private/addressr-rapidapi/credential' | gh secret set RAPIDAPI_KEY`. Verify with `gh secret list`. After rotation, re-run any failed integration jobs via `gh run rerun <run-id> --failed`.
  <!-- signal-score: 3 | last-classified: 2026-05-13 | first-written: 2026-05-13 -->
- `npm run push:watch` does `git push` + waits for the CI workflow to complete; `npm run release:watch` waits for the changesets release-PR to be created or merged, then waits for the publish job. Both are documented in `scripts/`.
  <!-- signal-score: 2 | last-classified: 2026-05-13 | first-written: 2026-05-13 -->

## What Will Surprise You

- The integration test suite (`test/server.test.mjs`) returns `Unexpected token 'M', "MCP error "... is not valid JSON` when the upstream RapidAPI returns 403 (subscription revoked) or 429 (rate limited). The test correctness contract (P003) is met (it does exercise the local server), but the failure surface buries the actual cause inside an MCP-error-wrapped JSON parse failure.
  <!-- signal-score: 2 | last-classified: 2026-05-13 | first-written: 2026-05-13 -->
- `npm` always publishes `README.md` to the package landing page regardless of the `files: ["src/", "bin/"]` allowlist. README changes ship to npm consumers on the next patch release whether or not they're explicitly enumerated.
  <!-- signal-score: 2 | last-classified: 2026-05-13 | first-written: 2026-05-13 -->
- `gh run rerun <run-id> --failed` re-runs just the failed jobs (not the whole workflow). The original run-id remains canonical; `gh run watch <run-id>` follows the rerun.
  <!-- signal-score: 1 | last-classified: 2026-05-13 | first-written: 2026-05-13 -->
