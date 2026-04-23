---
status: proposed
job-id: get-postcode-details
persona: developer
date-created: 2026-04-23
screens:
  - MCP tool call
---

# JTBD-008: Get Postcode Details

## Job Statement
When I have identified a postcode from search results, I want to retrieve its full details, so I can validate the postal area or find associated localities.

## Desired Outcomes
- Retrieve postcode details by postcode value (obtained from search results)
- Results include postcode and associated localities
- Simple lookup from search result to detail view

## Persona Constraints
- Uses MCP client; no direct API integration
- Expects fast, synchronous response

## Current Solutions
- Direct RapidAPI integration to Addressr
- Manual postcode lookup via Australia Post
