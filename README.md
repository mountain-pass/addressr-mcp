# @mountainpass/addressr-mcp

MCP (Model Context Protocol) server for Australian address search and validation powered by [Addressr](https://addressr.io).

Search, validate, and retrieve detailed Australian address data from the Geocoded National Address File (G-NAF) — directly from your AI assistant.

## Quick Start

### 1. Get an API Key

Sign up at [RapidAPI](https://rapidapi.com/addressr-addressr-default/api/addressr) to get your API key.

### 2. Configure Your AI Client

#### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "addressr": {
      "command": "npx",
      "args": ["-y", "@mountainpass/addressr-mcp"],
      "env": {
        "RAPIDAPI_KEY": "your-rapidapi-key"
      }
    }
  }
}
```

#### Claude Code

```bash
claude mcp add addressr -- npx -y @mountainpass/addressr-mcp
```

Set `RAPIDAPI_KEY` in your environment.

#### Cursor

Add to `.cursor/mcp.json`:

```json
{
  "mcpServers": {
    "addressr": {
      "command": "npx",
      "args": ["-y", "@mountainpass/addressr-mcp"],
      "env": {
        "RAPIDAPI_KEY": "your-rapidapi-key"
      }
    }
  }
}
```

#### VS Code

Add to `.vscode/mcp.json`:

```json
{
  "servers": {
    "addressr": {
      "command": "npx",
      "args": ["-y", "@mountainpass/addressr-mcp"],
      "env": {
        "RAPIDAPI_KEY": "your-rapidapi-key"
      }
    }
  }
}
```

## Available Tools

### search-addresses

Search Australian addresses by street, suburb, or postcode. Returns up to 8 results per page with standard address format, relevance score, and property ID (PID).

**Parameters:**
- `q` (required) — Search query, e.g. "1 george st sydney", "2000", "pyrmont nsw"
- `page` (optional) — Page number for paginated results

### get-address

Get full address details by property ID (PID). Returns geocoding (lat/long), structured components (street, suburb, state, postcode, unit/flat), and confidence score.

**Parameters:**
- `addressId` (required) — G-NAF Property ID from search results, e.g. "GANSW710280564"

### health

Check API service status. Returns version, timestamp, and health status.

## Data Source

Address data is sourced from the [Geocoded National Address File (G-NAF)](https://data.gov.au/dataset/ds-dga-19432f89-dc3a-4ef3-b943-5326ef1dbecc), Australia's authoritative address database maintained by Geoscape Australia.

## License

Apache-2.0
