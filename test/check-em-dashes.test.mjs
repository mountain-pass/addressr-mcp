import { describe, it, before, after } from 'node:test';
import assert from 'node:assert/strict';
import { mkdtempSync, mkdirSync, writeFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { spawnSync } from 'node:child_process';

const SCRIPT = new URL('../scripts/check-em-dashes.sh', import.meta.url).pathname;
// Construct U+2014 via code point so this test source can be committed
// through its own pre-commit hook without tripping its own detector.
const EM_DASH = String.fromCharCode(0x2014);

describe('scripts/check-em-dashes.sh', () => {
  let tmp;

  before(() => {
    tmp = mkdtempSync(join(tmpdir(), 'check-em-dashes-'));
  });

  after(() => {
    rmSync(tmp, { recursive: true, force: true });
  });

  it('exits 1 and reports the match line when a staged markdown file contains U+2014', () => {
    const file = join(tmp, 'has-em-dash.md');
    writeFileSync(file, `# Heading\n\nThis line has an em-dash ${EM_DASH} right here.\n`);

    const result = spawnSync('bash', [SCRIPT, file], { encoding: 'utf8' });

    assert.equal(result.status, 1, `expected exit 1, got ${result.status}; stderr=${result.stderr}`);
    assert.match(result.stderr, /em-dash/i, 'stderr should explain the failure');
    assert.match(result.stderr, /has-em-dash\.md/, 'stderr should name the offending file');
    assert.match(result.stderr, /:3:/, 'stderr should reference the offending line number');
  });

  it('exits 0 when a staged markdown file contains no U+2014', () => {
    const file = join(tmp, 'clean.md');
    writeFileSync(file, `# Heading\n\nThis line uses a hyphen - not an em-dash.\n`);

    const result = spawnSync('bash', [SCRIPT, file], { encoding: 'utf8' });

    assert.equal(result.status, 0, `expected exit 0, got ${result.status}; stderr=${result.stderr}`);
  });

  it('exits 0 when no files are passed (lint-staged glob matched nothing)', () => {
    const result = spawnSync('bash', [SCRIPT], { encoding: 'utf8' });

    assert.equal(result.status, 0, `expected exit 0, got ${result.status}; stderr=${result.stderr}`);
  });

  it('skips README-history.md (forward-chronology archive of pre-hook prose per P134)', () => {
    const file = join(tmp, 'README-history.md');
    writeFileSync(file, `# History\n\nLegacy entry: ${EM_DASH} from before the hook existed.\n`);

    const result = spawnSync('bash', [SCRIPT, file], { encoding: 'utf8' });

    assert.equal(result.status, 0, `archive file should be skipped; stderr=${result.stderr}`);
  });

  it('skips the auto-generated docs/decisions/README.md compendium (P016)', () => {
    const dir = join(tmp, 'docs', 'decisions');
    mkdirSync(dir, { recursive: true });
    const file = join(dir, 'README.md');
    // The architect compendium generator emits U+2014 mechanically (e.g. "5 ADRs total — 5 in-force").
    writeFileSync(file, `# Decisions\n\n5 ADRs total ${EM_DASH} 5 in-force\n`);

    const result = spawnSync('bash', [SCRIPT, file], { encoding: 'utf8' });

    assert.equal(result.status, 0, `auto-generated compendium should be skipped; stderr=${result.stderr}`);
  });

  it('still flags a hand-authored ADR body under docs/decisions/ (P016 boundary)', () => {
    const dir = join(tmp, 'docs', 'decisions');
    mkdirSync(dir, { recursive: true });
    const file = join(dir, '006-some-decision.proposed.md');
    writeFileSync(file, `# Decision\n\nHand-authored prose with an em-dash ${EM_DASH} here.\n`);

    const result = spawnSync('bash', [SCRIPT, file], { encoding: 'utf8' });

    assert.equal(result.status, 1, `ADR bodies must still be checked; stderr=${result.stderr}`);
    assert.match(result.stderr, /006-some-decision/, 'stderr should name the offending ADR body');
  });

  it('handles multiple files, failing the run when ANY file contains U+2014', () => {
    const clean = join(tmp, 'clean-2.md');
    const dirty = join(tmp, 'dirty-2.md');
    writeFileSync(clean, '# Clean\n\nAll hyphens here.\n');
    writeFileSync(dirty, `# Dirty\n\nEm-dash: ${EM_DASH}\n`);

    const result = spawnSync('bash', [SCRIPT, clean, dirty], { encoding: 'utf8' });

    assert.equal(result.status, 1);
    assert.match(result.stderr, /dirty-2\.md/);
    assert.doesNotMatch(result.stderr, /clean-2\.md/, 'clean file should not appear in match output');
  });
});
