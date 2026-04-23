---
status: proposed
job-id: search-postcodes
persona: developer
date-created: 2026-04-23
screens:
  - MCP tool call
---

# JTBD-005: Search Australian Postcodes

## Job Statement
When I need to validate or find an Australian postcode, I want to search postcodes by partial text or number, so I can confirm the correct postal area and its associated localities.

## Desired Outcomes
- Receive relevant postcode suggestions from partial input
- Results include postcode and associated localities
- Search works for full or partial postcodes

## Persona Constraints
- Uses MCP client; no direct API integration
- Expects fast, synchronous response

## Current Solutions
- Manual postcode lookup via Australia Post
- Direct RapidAPI integration to Addressr
