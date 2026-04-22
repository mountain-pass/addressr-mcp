---
status: proposed
job-id: release-new-version
persona: maintainer
date-created: 2026-04-23
screens:
  - GitHub Actions
---

# JTBD-101: Release New Version

## Job Statement
When I have merged fixes or features, I want to publish a new package version, so that developers receive updates via npm.

## Desired Outcomes
- Automated versioning via changesets
- Clean release PR workflow
- No secrets committed to repository

## Persona Constraints
- Uses changesets for release management
- Node 18+ pure ESM project

## Current Solutions
- Manual npm publish
- Automated CI release pipeline
