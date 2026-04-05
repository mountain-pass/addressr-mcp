import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StreamableHTTPClientTransport } from '@modelcontextprotocol/sdk/client/streamableHttp.js';

const MCP_URL = 'https://mcp.rapidapi.com';
const API_HOST = 'addressr.p.rapidapi.com';

function hasKey() {
  return Boolean(process.env.RAPIDAPI_KEY);
}

async function createTestClient() {
  const client = new Client({ name: 'addressr-mcp-test', version: '1.0.0' });
  const transport = new StreamableHTTPClientTransport(new URL(MCP_URL), {
    requestInit: {
      headers: {
        'x-api-key': process.env.RAPIDAPI_KEY,
        'x-api-host': API_HOST,
      },
    },
  });
  await client.connect(transport);
  return client;
}

// Load .env if present
try {
  await import('dotenv/config');
} catch { /* dotenv optional */ }

describe('addressr-mcp server', { skip: !hasKey() && 'RAPIDAPI_KEY not set' }, () => {
  let client;

  before(async () => {
    client = await createTestClient();
  });

  after(async () => {
    if (client) await client.close();
  });

  it('connects successfully', () => {
    assert.ok(client);
  });

  it('lists addressr tools', async () => {
    const { tools } = await client.listTools();
    const names = tools.map((t) => t.name);
    console.log('Tools:', names);
    assert.ok(names.includes('addresses'), `Expected 'addresses' tool`);
    assert.ok(
      names.includes('addressesaddressId'),
      `Expected 'addressesaddressId' tool`,
    );
  });

  it('searches for addresses', async () => {
    const result = await client.callTool({
      name: 'addresses',
      arguments: { q: '1 george st sydney' },
    });
    const text = result.content.find((c) => c.type === 'text')?.text;
    assert.ok(text, 'Should have text content');
    const data = JSON.parse(text);
    const results = Array.isArray(data) ? data : [data];
    assert.ok(results.length > 0, 'Should return results');
    assert.ok(results[0].sla || results[0].pid, 'Results should have address data');
  });

  it('retrieves address details', async () => {
    // Search first to get a PID
    const searchResult = await client.callTool({
      name: 'addresses',
      arguments: { q: '1 george st sydney' },
    });
    const searchData = JSON.parse(
      searchResult.content.find((c) => c.type === 'text').text,
    );
    const results = Array.isArray(searchData) ? searchData : [searchData];
    const pid = results[0]?.pid;
    assert.ok(pid, 'Need a PID from search results');

    const detailResult = await client.callTool({
      name: 'addressesaddressId',
      arguments: { addressId: pid },
    });
    const detailText = detailResult.content.find((c) => c.type === 'text')?.text;
    assert.ok(detailText, 'Should have detail content');
  });
});
