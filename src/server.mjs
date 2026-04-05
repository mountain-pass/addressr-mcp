import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { z } from 'zod';

const API_HOST = process.env.RAPIDAPI_HOST || 'addressr.p.rapidapi.com';
const API_BASE = `https://${API_HOST}`;

async function apiCall(path, key) {
  const response = await fetch(`${API_BASE}${path}`, {
    headers: {
      'x-rapidapi-key': key,
      'x-rapidapi-host': API_HOST,
    },
  });
  if (!response.ok) {
    throw new Error(`API error: ${response.status} ${response.statusText}`);
  }
  return response.json();
}

export function createServer() {
  const key = process.env.RAPIDAPI_KEY;
  if (!key) {
    console.error(
      'RAPIDAPI_KEY environment variable is required. Get one at https://rapidapi.com/addressr-addressr-default/api/addressr',
    );
    process.exit(1);
  }

  const server = new McpServer({
    name: 'addressr',
    version: '0.1.0',
  });

  server.tool(
    'search-addresses',
    'Search Australian addresses by street, suburb, or postcode. Returns up to 8 results per page with standard address format, relevance score, and property ID (PID). Data sourced from the Geocoded National Address File (G-NAF).',
    {
      q: z
        .string()
        .describe(
          'Australian address search query (min 3 chars). e.g. "1 george st sydney", "2000", "pyrmont nsw"',
        ),
      page: z
        .number()
        .optional()
        .describe('Page number for paginated results (default: first page)'),
    },
    async ({ q, page }) => {
      const params = new URLSearchParams({ q });
      if (page !== undefined) params.set('page', String(page));
      const data = await apiCall(`/addresses?${params}`, key);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    'get-address',
    'Get full address details by property ID (PID). Returns geocoding (lat/long), structured components (street, suburb, state, postcode, unit/flat), and confidence score. PIDs are obtained from search results.',
    {
      addressId: z
        .string()
        .describe(
          "G-NAF Property ID (PID), e.g. 'GANSW710280564'. Obtained from search results.",
        ),
    },
    async ({ addressId }) => {
      const data = await apiCall(`/addresses/${encodeURIComponent(addressId)}`, key);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    'health',
    'Check API service status. Returns version, timestamp, and health status.',
    {},
    async () => {
      const data = await apiCall('/health', key);
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );

  return server;
}

// Start server when run directly
const server = createServer();
const transport = new StdioServerTransport();
await server.connect(transport);
