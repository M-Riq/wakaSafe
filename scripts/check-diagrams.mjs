// Keeps the Mermaid copies in README.md identical to their source in docs/diagrams/.
// Usage: node scripts/check-diagrams.mjs [--write]
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const write = process.argv.includes('--write');
const readmePath = join(root, 'README.md');
const readme = readFileSync(readmePath, 'utf8');

const MARKER = /(<!-- diagram:([^#\n]+)#(\d+) -->\n)([\s\S]*?)(<!-- \/diagram -->)/g;
const MERMAID_BLOCK = /^```mermaid\n[\s\S]*?^```\n/gm;
const sources = new Map();

function blocksOf(path) {
  if (!sources.has(path)) {
    sources.set(path, readFileSync(join(root, path), 'utf8').match(MERMAID_BLOCK) ?? []);
  }
  return sources.get(path);
}

const errors = [];
let count = 0;
const synced = readme.replace(MARKER, (match, open, path, index, _body, close) => {
  const block = blocksOf(path)[Number(index) - 1];
  if (!block) {
    errors.push(`${path}#${index}: no such Mermaid block`);
    return match;
  }
  count += 1;
  return `${open}\n${block}\n${close}`;
});

if (errors.length > 0) {
  console.error(errors.join('\n'));
  process.exit(1);
}
if (count === 0) {
  console.error('No <!-- diagram:... --> marker found in README.md');
  process.exit(1);
}
if (write) {
  writeFileSync(readmePath, synced);
  console.log(`README.md: ${count} diagrams synced.`);
} else if (synced !== readme) {
  console.error(
    'README.md diagrams are out of sync with docs/diagrams/. Run: npm run sync:diagrams',
  );
  process.exit(1);
} else {
  console.log(`README.md: ${count} diagrams in sync.`);
}
