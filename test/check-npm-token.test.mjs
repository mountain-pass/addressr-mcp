import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { spawnSync } from 'node:child_process';

// @jtbd JTBD-101, JTBD-102
// Behavioural test for scripts/check-npm-token.sh - the fail-fast guard wired
// into .github/workflows/release.yml ahead of changesets/action@v1 so that a
// missing or empty NPM_TOKEN secret surfaces as a clear CI error instead of a
// confusing E404 from npx changeset publish running unauthenticated.
// See: docs/problems/.../015-npm-publish-fails-with-e404-no-npm-token-in-gha.md

const SCRIPT = new URL('../scripts/check-npm-token.sh', import.meta.url).pathname;

function run(env) {
  return spawnSync('bash', [SCRIPT], {
    encoding: 'utf8',
    env: { PATH: process.env.PATH, ...env },
  });
}

describe('scripts/check-npm-token.sh', () => {
  it('exits 1 with a GHA ::error:: diagnostic when NODE_AUTH_TOKEN is unset', () => {
    const result = run({});

    assert.equal(result.status, 1, `expected exit 1, got ${result.status}; stderr=${result.stderr}`);
    assert.match(result.stderr, /::error::/, 'stderr should carry a GHA error annotation');
    assert.match(result.stderr, /NPM_TOKEN/, 'stderr should name the NPM_TOKEN secret');
  });

  it('exits 1 with a GHA ::error:: diagnostic when NODE_AUTH_TOKEN is empty', () => {
    const result = run({ NODE_AUTH_TOKEN: '' });

    assert.equal(result.status, 1, `expected exit 1, got ${result.status}; stderr=${result.stderr}`);
    assert.match(result.stderr, /::error::/, 'stderr should carry a GHA error annotation');
    assert.match(result.stderr, /NPM_TOKEN/, 'stderr should name the NPM_TOKEN secret');
  });

  it('exits 0 silently when NODE_AUTH_TOKEN is present', () => {
    const result = run({ NODE_AUTH_TOKEN: 'npm_FAKEvalueForTestOnlyDoNotUse' });

    assert.equal(result.status, 0, `expected exit 0, got ${result.status}; stderr=${result.stderr}`);
    assert.equal(result.stderr, '', 'stderr should be empty on the success path');
  });

  it('does not leak the token value in stderr or stdout on the failure path', () => {
    const result = run({});

    assert.doesNotMatch(result.stdout, /npm_/, 'stdout must not echo any token-like content');
    assert.doesNotMatch(result.stderr, /npm_/, 'stderr must not echo any token-like content');
  });
});
