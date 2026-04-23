---
status: accepted
date: 2026-04-24
accepted-date: 2026-04-24
decision-makers: [Tom Howard]
consulted: []
informed: []
---

# ADR-003: HATEOAS-Native Tool Design

## Context and Problem Statement

The Addressr MCP server initially returned raw JSON response bodies from upstream API calls. The Addressr API advertises canonical URLs and pagination via RFC 8288 Link headers — for example `</addresses/{pid}>; rel=canonical`, and `rel=next` / `rel=prev` on paginated results. That metadata was invisible to MCP consumers because only the JSON body was forwarded.

The detail tools (`get-address`, `get-locality`, `get-postcode`, `get-state`) accepted resource IDs and constructed URLs internally. That coupled the MCP server to specific URL patterns and prevented the LLM from following arbitrary canonical links — defeating the point of the HATEOAS model the API uses.

## Decision Drivers

- Expose HTTP status and Link headers to LLM consumers so they can navigate the API.
- Decouple MCP tool contracts from internal URL structure.
- Let LLMs follow any canonical link, including resources the MCP server does not explicitly model.
- Preserve HTTP response semantics that raw-body responses discard (status codes, content negotiation, pagination).

## Considered Options

1. **URL-based detail tools + response envelope** — detail tools accept a `url` parameter; all tools return `{status, headers, body}` with `headers.link` parsed into `[{uri, rel, anchor?, title?}]`.
2. **Keep ID-based detail tools, add envelope** — preserves existing tool contracts but still couples to URL patterns.
3. **Keep raw JSON, add a separate `follow-link` tool** — adds a navigation primitive without changing the existing tools.
4. **Status quo (ID-based params + raw body)** — simplest; loses all HATEOAS metadata.

## Decision Outcome

**Option 1: URL-based detail tools + response envelope.**

Detail tools accept a `url` parameter and fetch it directly:

- `get-address` — takes `url`
- `get-locality` — takes `url`
- `get-postcode` — takes `url`
- `get-state` — takes `url`

All tool responses return an envelope:

- `status` — HTTP status code
- `headers` — response headers; the `link` field is parsed into `[{uri, rel, anchor?, title?}]` via `@windyroad/link-header`
- `body` — the JSON response body

Example:

```json
{
  "status": 200,
  "headers": {
    "content-type": "application/json; charset=utf-8",
    "link": [
      { "uri": "/addresses/GANSW710280564", "rel": "canonical", "anchor": "#/0" },
      { "uri": "/addresses?page=1&q=...", "rel": "next" }
    ]
  },
  "body": { }
}
```

Rationale:

- Letting the LLM navigate by canonical URL is the point of HATEOAS. ID-based tools undermine it.
- Parsed link arrays are machine-readable without requiring the LLM to parse RFC 8288 text.
- The envelope is a minimal, stable contract. Consumers ignore fields they do not need.

## Pros and Cons of the Options

### Option 1: URL-based detail tools + envelope (chosen)

- Good: LLM navigates the API via hypermedia.
- Good: Detail tools decoupled from URL patterns.
- Good: Pagination and canonical links visible.
- Good: Future Addressr endpoints can be navigated without MCP server changes.
- Bad: Breaking change to existing tool contracts — requires a major version bump.
- Bad: Response payload is ~100-200 bytes larger per call.

### Option 2: ID-based detail tools + envelope

- Good: Preserves existing contracts; no major bump.
- Good: Still exposes HATEOAS metadata.
- Bad: Detail tools still coupled to URL patterns.
- Bad: LLM cannot follow arbitrary canonical links.

### Option 3: Separate `follow-link` tool

- Good: No changes to existing tools.
- Good: Composable — any URL becomes followable.
- Bad: Two paths to fetch the same resource (by ID or by link) — ambiguous for the LLM.
- Bad: Does not solve the envelope-metadata problem; existing tools still return raw JSON.

### Option 4: Status quo

- Good: Simplest.
- Bad: HATEOAS metadata invisible.
- Bad: LLM cannot distinguish 200/204 or follow canonical links.

## Consequences

### Good

- LLM can navigate the Addressr API via hypermedia links.
- Detail tools decoupled from URL patterns.
- Pagination links visible to the consumer.
- Status codes preserved.

### Bad

- **Breaking change**: detail-tool parameters renamed — `addressId` → `url`, `localityId` → `url`, `postcode` → `url`, `stateAbbreviation` → `url`. Requires a major version bump and a changeset entry.
- Response payload grows by ~100-200 bytes per call.
- MCP consumers must understand the envelope structure (`status`, `headers`, `body`).

## Confirmation

- `src/server.mjs` returns `{status, headers, body}` for every tool via the `toEnvelope` helper.
- `headers.link` is parsed into a structured array using `@windyroad/link-header`.
- Detail tools (`get-address`, `get-locality`, `get-postcode`, `get-state`) accept only a `url` parameter.
- Tests in `test/dynamic-tools.test.mjs` assert the envelope shape: `envelope.status === 200`, `envelope.headers` present, `envelope.body` present with expected content.
- JTBD-002, JTBD-007, JTBD-008, JTBD-009 describe URL-based detail retrieval and reflect the shipped contract.
- A changeset marks the next release as major.

## Reassessment Criteria

- If the MCP protocol introduces first-class response metadata (status, headers), the envelope becomes redundant and can be flattened.
- If LLM consumers report confusion about the envelope, reconsider a flatter shape (e.g. lifting `body` fields to the top level with `_meta` for status/headers).
- If the Addressr API moves away from HTTP Link headers to a JSON-embedded `_links` field, reassess the parsing step.
- If LLMs consistently pass malformed URLs into detail tools, consider adding a validation layer.

## Related

- ADR-002 (Dynamic Tool Discovery from API Root) — the discovery layer this envelope format rides on.
- ADR-005 (Live API Integration Testing) — live tests verify this envelope contract against the real API.
- P001 (Unsupported Addressr API Endpoints).
- P002 (Addressr Link Relations Not Resolvable).
- JTBD-001 through JTBD-009.
