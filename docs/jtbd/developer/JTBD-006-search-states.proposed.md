---
status: proposed
job-id: search-states
persona: developer
date-created: 2026-04-23
screens:
  - MCP tool call
---

# JTBD-006: Search Australian States

## Job Statement
When I need to reference Australian states or territories, I want to search states by name or abbreviation, so I can use the correct canonical identifier.

## Desired Outcomes
- Receive all Australian states and territories
- Results include state name and abbreviation
- Simple lookup for state validation

## Persona Constraints
- Uses MCP client; no direct API integration
- Expects fast, synchronous response

## Current Solutions
- Hardcoded state lists in applications
- Direct RapidAPI integration to Addressr
