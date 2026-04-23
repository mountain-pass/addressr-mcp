---
status: proposed
job-id: search-localities
persona: developer
date-created: 2026-04-23
screens:
  - MCP tool call
---

# JTBD-004: Search Australian Localities

## Job Statement
When I need to find or validate an Australian suburb or locality name, I want to search localities by partial text, so I can confirm the correct locality exists.

## Desired Outcomes
- Receive relevant locality suggestions from partial input
- Results include locality name, state, and postcode
- Results include locality ID and canonical link URL (`_links`) for detail retrieval

## Persona Constraints
- Uses MCP client; no direct API integration
- Expects fast, synchronous response

## Current Solutions
- Manual locality entry with validation
- Direct RapidAPI integration to Addressr
