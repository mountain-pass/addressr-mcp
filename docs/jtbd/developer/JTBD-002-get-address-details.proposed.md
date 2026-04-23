---
status: proposed
job-id: get-address-details
persona: developer
date-created: 2026-04-23
screens:
  - MCP tool call
---

# JTBD-002: Get Address Details

## Job Statement
When I have selected an address from search results, I want to retrieve the full address record, so I can store or display complete address information.

## Desired Outcomes
- Retrieve structured address components (street, suburb, state, postcode, coordinates)
- Consistent, canonical address format
- Follow canonical link URL obtained from search results

## Persona Constraints
- Uses MCP client; no direct API integration

## Current Solutions
- Storing partial address data from search results
- Direct RapidAPI integration to Addressr
