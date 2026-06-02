---
status: proposed
job-id: diagnose-red-ci-quickly
persona: maintainer
date-created: 2026-06-02
screens:
  - test/server.test.mjs
  - GitHub Actions
---

# JTBD-102: Diagnose Red CI Quickly

## Job Statement
When integration tests fail in CI, I want the failure message to name the upstream-API state, so that I can distinguish upstream subscription / rate-limit drift from a test or proxy bug without local reproduction.

## Desired Outcomes
- Test failures surface the upstream HTTP status (403, 429, 5xx) and response body verbatim.
- The maintainer can decide "rotate the GitHub Actions secret" vs "investigate the proxy" from the CI log alone.
- Failures inside the MCP SDK's response-unpacking path do not mask the upstream cause.

## Persona Constraints
- Live RapidAPI calls per ADR-005 (no upstream mocking in this test suite).
- Pure ESM, Node 18+, node:test runner.

## Current Solutions
- Reproduce locally with the suspect key in `.env` and the assistant's MCP integration to read the envelope's status field directly.

## Motivating Evidence
- P007 (CI integration test cryptic JSON parse on upstream error) — observed at least twice; tied to upstream API state changes after RapidAPI key rotation or subscription lapse.
