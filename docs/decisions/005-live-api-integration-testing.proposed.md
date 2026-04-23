---
status: proposed
date: 2026-04-24
decision-makers: [Tom Howard]
consulted: []
informed: []
---

# ADR-005: Live API Integration Testing with 1Password-Hydrated Secrets

## Context and Problem Statement

The addressr-mcp server is a thin proxy to the Addressr RapidAPI endpoint. Meaningful integration tests must exercise real HTTP semantics — status codes, Link headers, HATEOAS navigation, pagination, real-world error shapes — because the envelope contract from ADR-003 and the dynamic discovery from ADR-002 both depend on how the upstream API actually behaves over HTTP, not just on the shape of a mock.

Live tests require a valid RapidAPI key. The workflow for managing that key must:

- Keep the key out of the repository at all times.
- Be reproducible across contributors.
- Work in CI without human intervention.
- Avoid hard-coupling the project to a single secret manager.

## Decision Drivers

- Zero secrets committed to git (non-negotiable).
- Contributors can run integration tests without a bespoke onboarding document.
- CI runs the same tests deterministically.
- Key rotation and revocation have a single authoritative source.
- No critical path requires a paid tool subscription.

## Considered Options

1. **1Password `op inject` locally, GitHub Actions secrets in CI** — secret lives in 1Password; `op inject -i .env.tpl -o .env` materialises a gitignored `.env`; `scripts/run-mcp.sh` sources it. CI bypasses `.env.tpl` and injects `ADDRESSR_RAPIDAPI_KEY` from `secrets.ADDRESSR_RAPIDAPI_KEY`.
2. **Plain gitignored `.env` with each contributor pasting their own key** — zero tooling dependency; no single source of truth; rotation requires coordinating every contributor.
3. **macOS Keychain + wrapper script** — zero-cost on macOS; requires a parallel mechanism on Linux/Windows and on CI runners.
4. **Committed encrypted `.env.enc` (SOPS + age)** — secret-in-repo but encrypted; adds toolchain complexity, and a shared recipient key becomes its own secret.
5. **No live tests; rely entirely on mocks** — eliminates the secret problem; loses the signal that live tests provide (API drift, real Link header shapes, rate-limit behaviour).

## Decision Outcome

**Option 1: 1Password `op inject` locally, GitHub Actions secrets in CI.**

Rationale:

- 1Password is already the team's secret store — no new tool introduced.
- `.env.tpl` is safe to commit: it contains only `op://` references, not the secret.
- `scripts/run-mcp.sh` sources `.env` if present and does nothing otherwise, which means contributors without 1Password are not blocked — they can drop a locally-authored `.env` in place and run the same tests. Option 2 (plain gitignored `.env`) is an explicitly supported fallback, not a deviation.
- GitHub Actions secrets provide the same substitution surface in CI without requiring the 1Password CLI on runners.

## Pros and Cons of the Options

### Option 1: 1Password op inject + GitHub Actions secrets (chosen)

- Good: Single source of truth for the team; rotation happens in one place.
- Good: `.env.tpl` is readable, reviewable, and safe to commit.
- Good: No secret ever touches git history.
- Good: Contributors without 1Password use Option 2 as a documented fallback.
- Bad: Two injection paths (local `op inject`, CI secret) must be kept aligned.
- Bad: `.env.tpl` reveals the 1Password item path — a low-sensitivity disclosure.

### Option 2: Plain gitignored `.env`

- Good: No tooling dependency beyond git.
- Good: Works identically on every OS.
- Bad: No single source of truth; key rotation is a broadcast problem.
- Bad: Easier to leak via backups, screen sharing, or editor plugins that index the project directory.

### Option 3: macOS Keychain + wrapper

- Good: Native, no subscription.
- Bad: Not portable to Linux/Windows contributors.
- Bad: Requires a separate mechanism for CI.

### Option 4: Committed encrypted `.env.enc` (SOPS + age)

- Good: Secret travels with the repo; one file, one source of truth.
- Bad: Shared recipient key is itself a secret that must be distributed out-of-band.
- Bad: Adds a toolchain (SOPS, age) to every contributor's setup.

### Option 5: Mocks only

- Good: Zero secrets needed anywhere.
- Bad: Loses the signal live tests provide — API drift, real Link header shapes, rate-limit behaviour, auth rejection paths.

## Consequences

### Good

- No secret ever committed; `.gitignore` matches `.env` and `.env.*` with an explicit allowlist for `.env.tpl`.
- Single source of truth in 1Password for the team.
- The same `scripts/run-mcp.sh` works locally and under CI.
- Contributors without 1Password are not blocked.

### Neutral

- Contributors choosing Option 1 must install the 1Password CLI (`op`).
- CI requires `ADDRESSR_RAPIDAPI_KEY` to be configured as a repository secret.

### Bad

- Two injection paths must be kept in sync. A CI failure referencing a missing env var can masquerade as a broken test.
- `.env.tpl` reveals the 1Password vault path (`Private/addressr-rapidapi/credential`). Low risk — paths are not secrets — but worth noting.

## Confirmation

- `git ls-files | grep -Ex '\\.env(\\..+)?'` returns only `.env.tpl` (and `.env.example` if present).
- `.env.tpl` contains only `op://` references, no literal secret values.
- `scripts/run-mcp.sh` sources `.env` when present and degrades gracefully when absent.
- CI workflow injects `ADDRESSR_RAPIDAPI_KEY` via `secrets.ADDRESSR_RAPIDAPI_KEY`.
- Live integration tests pass locally after `op inject -i .env.tpl -o .env`.

## Reassessment Criteria

- If the team moves off 1Password, re-evaluate against Keychain + wrapper or a committed encrypted store.
- If contributor onboarding friction exceeds the benefit, promote Option 2 (plain gitignored `.env`) as the primary documented path.
- If live tests begin to flake due to RapidAPI rate limits, consider a dedicated CI-only RapidAPI account.
- If `.env.tpl` grows to reference more than the single credential, revisit whether a per-contributor config file is still the right shape.

## Related

- ADR-002 (Dynamic Tool Discovery from API Root) — live tests verify discovered tools.
- ADR-003 (HATEOAS-Native Tool Design) — live tests verify the envelope contract against real responses.
- P001 (Unsupported Addressr API Endpoints) — live tests would catch regressions.
- P002 (Addressr Link Relations Not Resolvable) — live tests would catch regressions.
