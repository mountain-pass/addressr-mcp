---
status: proposed
job-id: get-locality-details
persona: developer
date-created: 2026-04-23
screens:
  - MCP tool call
---

# JTBD-007: Get Locality Details

## Job Statement
When I have identified a locality from search results, I want to retrieve its full details, so I can validate or display suburb-level information.

## Desired Outcomes
- Retrieve locality details by PID (obtained from search results)
- Results include structured locality data (name, state, postcode, class)
- Simple lookup from search result to detail view

## Persona Constraints
- Uses MCP client; no direct API integration
- Expects fast, synchronous response

## Current Solutions
- Direct RapidAPI integration to Addressr
- Manual locality data lookup
