import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { glowUpFetchWithLinks } from '@windyroad/fetch-link';
import { z } from 'zod';

const API_URL =
  process.env.ADDRESSR_API_URL || 'https://addressr.p.rapidapi.com/';
const API_HOST = process.env.RAPIDAPI_HOST || 'addressr.p.rapidapi.com';

const SEARCH_REL = 'https://addressr.io/rels/address-search';
const HEALTH_REL = 'https://addressr.io/rels/health';

export function createServer() {
  const key = process.env.RAPIDAPI_KEY;
  if (!key) {
    console.error(
      'RAPIDAPI_KEY environment variable is required. Get one at https://rapidapi.com/addressr-addressr-default/api/addressr',
    );
    process.exit(1);
  }

  const headers = {
    'x-rapidapi-key': key,
    'x-rapidapi-host': API_HOST,
  };

  // Create a fetch-link instance with RapidAPI auth headers baked in
  const fetchLink = glowUpFetchWithLinks((url, init) =>
    fetch(url, { ...init, headers: { ...headers, ...init?.headers } }),
  );

  // Cache the API root discovery (1 week cache-control)
  let rootPromise;
  function getRoot() {
    if (!rootPromise) {
      rootPromise = fetchLink(API_URL).catch((err) => {
        rootPromise = undefined;
        throw err;
      });
    }
    return rootPromise;
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
      const root = await getRoot();
      const params = { q };
      if (page !== undefined) params.page = String(page);
      const searchLinks = root.links(SEARCH_REL, params);
      if (!searchLinks.length) {
        throw new Error('Search link relation not found in API root');
      }
      const response = await fetchLink(searchLinks[0]);
      const data = await response.json();
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
      // Follow the canonical link pattern from search results
      // The search response includes canonical links: </addresses/{pid}>; rel=canonical
      // We construct the same URL and follow it via fetchLink
      const root = await getRoot();
      const baseUrl = new URL(root.url);
      const addressUrl = new URL(
        `/addresses/${encodeURIComponent(addressId)}`,
        baseUrl,
      );
      const response = await fetchLink(addressUrl.toString());
      const data = await response.json();
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );

  server.tool(
    'health',
    'Check API service status. Returns version, timestamp, and health status.',
    {},
    async () => {
      const root = await getRoot();
      const healthLinks = root.links(HEALTH_REL);
      if (healthLinks.length && healthLinks[0].uri !== 'undefined') {
        const response = await fetchLink(healthLinks[0]);
        const data = await response.json();
        return {
          content: [{ type: 'text', text: JSON.stringify(data, null, 2) }],
        };
      }
      // Fallback: health link URI is currently broken in production (returns "undefined")
      const baseUrl = new URL(root.url);
      const healthUrl = new URL('/health', baseUrl);
      const response = await fetchLink(healthUrl.toString());
      const data = await response.json();
      return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] };
    },
  );

  return server;
}

// Start server when run directly
const server = createServer();
const transport = new StdioServerTransport();
await server.connect(transport);
