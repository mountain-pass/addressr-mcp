import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import { createServer as createHttpServer } from 'node:http';
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

function startMockApi() {
  return new Promise((resolve) => {
    const server = createHttpServer((req, res) => {
      if (req.url === '/' || req.url === '/?_rapidapi-cache-bust=1') {
        res.writeHead(200, {
          'Content-Type': 'application/json',
          Link: [
            '</addresses?q={q}>; rel="https://addressr.io/rels/address-search"',
            '</localities?q={q}>; rel="https://addressr.io/rels/locality-search"',
            '</postcodes?q={q}>; rel="https://addressr.io/rels/postcode-search"',
            '</states?q={q}>; rel="https://addressr.io/rels/state-search"',
            '</health>; rel="https://addressr.io/rels/health"',
          ].join(', '),
        });
        res.end(JSON.stringify({}));
        return;
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify([{ pid: 'test-pid', name: 'Test' }]));
    });
    server.listen(0, '127.0.0.1', () => {
      const addr = server.address();
      resolve({ server, url: `http://127.0.0.1:${addr.port}/` });
    });
  });
}

describe('dynamic tool registration', () => {
  it('exports a REL_TO_TOOL mapping for known link relations', async () => {
    const source = await readFile('src/server.mjs', 'utf8');
    assert.ok(source.includes('REL_TO_TOOL'), 'REL_TO_TOOL mapping should exist in source');
    assert.ok(
      source.includes('https://addressr.io/rels/locality-search'),
      'locality-search rel should be mapped',
    );
    assert.ok(
      source.includes('https://addressr.io/rels/postcode-search'),
      'postcode-search rel should be mapped',
    );
    assert.ok(
      source.includes('https://addressr.io/rels/state-search'),
      'state-search rel should be mapped',
    );
  });

  it('falls back to health and get-address when API root is unreachable', async () => {
    const mockApi = await startMockApi();
    mockApi.server.close(); // Immediately close so the server gets connection refused

    const client = new Client({ name: 'addressr-mcp-test', version: '1.0.0' });
    const transport = new StdioClientTransport({
      command: 'node',
      args: ['src/server.mjs'],
      env: {
        ...process.env,
        RAPIDAPI_KEY: 'dummy',
        ADDRESSR_API_URL: mockApi.url,
        ADDRESSR_API_HOST: 'addressr.p.rapidapi.com',
      },
    });

    await client.connect(transport);

    try {
      const { tools } = await client.listTools();
      const toolNames = tools.map((t) => t.name);

      assert.ok(toolNames.includes('health'), 'Should always register health tool');
      assert.ok(toolNames.includes('get-address'), 'Should always register get-address tool');
      assert.ok(
        !toolNames.includes('search-localities'),
        'Should NOT register search-localities when API is down',
      );
    } finally {
      await client.close();
      transport.close();
    }
  });

  it('dynamically registers tools based on API root link relations', async () => {
    const mockApi = await startMockApi();

    const client = new Client({ name: 'addressr-mcp-test', version: '1.0.0' });
    const transport = new StdioClientTransport({
      command: 'node',
      args: ['src/server.mjs'],
      env: {
        ...process.env,
        RAPIDAPI_KEY: 'dummy',
        ADDRESSR_API_URL: mockApi.url,
        ADDRESSR_API_HOST: 'addressr.p.rapidapi.com',
      },
    });

    await client.connect(transport);

    try {
      const { tools } = await client.listTools();
      const toolNames = tools.map((t) => t.name);

      assert.ok(
        toolNames.includes('search-localities'),
        'Should register search-localities tool',
      );
      assert.ok(
        toolNames.includes('search-postcodes'),
        'Should register search-postcodes tool',
      );
      assert.ok(
        toolNames.includes('search-states'),
        'Should register search-states tool',
      );
    } finally {
      await client.close();
      transport.close();
      mockApi.server.close();
    }
  });
});
