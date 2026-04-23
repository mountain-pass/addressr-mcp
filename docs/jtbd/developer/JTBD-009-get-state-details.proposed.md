---
status: proposed
job-id: get-state-details
persona: developer
date-created: 2026-04-23
screens:
  - MCP tool call
---

# JTBD-009: Get State Details

## Job Statement
When I have selected a state from search results, I want to retrieve its full details, so I can validate or display state-level information.

## Desired Outcomes
- Retrieve state details by following the canonical link URL from search results
- Results include state name and abbreviation
- Simple lookup from search result to detail view

## Persona Constraints
- Uses MCP client; no direct API integration
- Expects fast, synchronous response

## Current Solutions
- Direct RapidAPI integration to Addressr
- Hardcoded state lists in applications
