# Problem 001: Unsupported Addressr API Endpoints

**Status**: Open
**Reported**: 2026-04-23
**Priority**: 12 (Medium-High) — Impact: Moderate (3) x Likelihood: Likely (4)
**Effort**: M
**WSJF**: 6.0

## Description

The Addressr API has added new endpoints that are not currently supported by the MCP server. Users of the MCP cannot access these new capabilities, limiting the utility of the integration.

## Symptoms

- MCP tool calls fail or return errors when targeting new Addressr API endpoints
- Users report missing functionality compared to the native Addressr API
- Documentation discrepancies between Addressr API and MCP tool offerings

## Workaround

None identified yet.

## Impact Assessment

- **Who is affected**: Users of the Addressr MCP server who need access to newer API features
- **Frequency**: Whenever users attempt to use new endpoints through the MCP
- **Severity**: Medium — core functionality works, but newer features are unavailable
- **Analytics**: N/A

## Root Cause Analysis

### Investigation Tasks

- [ ] Investigate root cause
- [ ] Create reproduction test
- [ ] Create INVEST story for permanent fix

## Related

- [Addressr API documentation](https://github.com/mountain-pass/addressr)
- [RISK-POLICY.md](../RISK-POLICY.md)
