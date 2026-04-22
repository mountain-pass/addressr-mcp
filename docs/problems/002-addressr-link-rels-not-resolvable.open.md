# Problem 002: Addressr Link Relations Not Resolvable

**Status**: Open
**Reported**: 2026-04-23
**Priority**: 12 (Medium-High) — Impact: Moderate (3) x Likelihood: Likely (4)
**Effort**: M
**WSJF**: 6.0

## Description

Addressr API link relations (e.g., `https://addressr.io/rels/address-search`) are not resolvable to application documentation. A client that follows the relation URI gets no useful information about what the endpoint does, what parameters it accepts, or what schema it returns. This makes dynamic tool discovery impossible without a hardcoded mapping table.

## Symptoms

- Navigating to `https://addressr.io/rels/address-search` in a browser returns no documentation
- MCP servers cannot auto-discover tool schemas from the API surface
- Every new Addressr endpoint requires a manual code change in the MCP server
- Hardcoded mapping tables drift from the upstream API over time

## Workaround

Maintain a static mapping table in the MCP server from rel URI → {toolName, description, zodSchema}. This must be updated manually whenever Addressr adds new endpoints.

## Impact Assessment

- **Who is affected**: Users of the Addressr MCP server; developers maintaining the MCP proxy
- **Frequency**: Whenever Addressr adds new endpoints or the MCP server needs dynamic discovery
- **Severity**: Medium — core functionality works, but extensibility is limited and maintenance burden is higher
- **Analytics**: N/A

## Root Cause Analysis

### Investigation Tasks

- [x] Investigate root cause
- [ ] Create reproduction test
- [ ] Create INVEST story for permanent fix

### Confirmed Root Cause

The Addressr API emits link relations as full URIs (`https://addressr.io/rels/address-search`) but does not serve documentation at those URIs. This is a hypermedia anti-pattern — per RFC 8288, link relation types registered as URIs should be dereferenceable and provide useful context.

### Upstream Impact

This is an **upstream issue** in the Addressr API service (https://github.com/mountain-pass/addressr). The fix must be implemented in the Addressr API itself, not in this MCP proxy.

### Fix Strategy

1. **Report upstream**: File an issue against the Addressr repository requesting that link relation URIs serve machine-readable documentation (e.g., an HTML page, JSON-LD, or an OpenAPI fragment).
2. **Workaround (local)**: Maintain a static mapping table in `src/server.mjs` for known rels.
3. **Verification**: Once upstream resolves the issue, remove or deprecate the static mapping table.

## Dependencies

- **Blocks**: P001 (Unsupported Addressr API Endpoints) — dynamic tool discovery for P001 depends on this upstream fix
- **Blocked by**: (none)
- **Composes with**: (none)

## Related

- [Addressr API repository](https://github.com/mountain-pass/addressr)
- P001 (Unsupported Addressr API Endpoints)
- [RISK-POLICY.md](../RISK-POLICY.md)
