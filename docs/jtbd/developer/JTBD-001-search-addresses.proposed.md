---
status: proposed
job-id: search-addresses
persona: developer
date-created: 2026-04-23
screens:
  - MCP tool call
---

# JTBD-001: Search Australian Addresses

## Job Statement
When I need to validate or autocomplete an Australian address, I want to search by partial text, so I can find the correct canonical address.

## Desired Outcomes
- Receive relevant address suggestions from partial input
- Results include Addressr ID for detail retrieval
- Search works for street, suburb, state, and postcode

## Persona Constraints
- Uses MCP client; no direct API integration
- Expects fast, synchronous response

## Current Solutions
- Manual address entry with validation
- Direct RapidAPI integration to Addressr
