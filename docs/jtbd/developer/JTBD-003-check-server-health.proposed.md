---
status: proposed
job-id: check-server-health
persona: developer
date-created: 2026-04-23
screens:
  - MCP tool call
---

# JTBD-003: Check Server Health

## Job Statement
When my application depends on address lookup, I want to verify the MCP server is operational, so I can gracefully handle outages.

## Desired Outcomes
- Quick health check endpoint/tool
- Clear indication of upstream API connectivity

## Persona Constraints
- Uses MCP client; no direct API integration

## Current Solutions
- Manual testing of address search
- Monitoring upstream API directly
