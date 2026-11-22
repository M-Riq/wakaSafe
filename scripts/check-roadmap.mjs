// Checks that roadmap.json (read by the "Avancement du projet" page) matches ROADMAP.md.
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const roadmap = JSON.parse(readFileSync(join(root, 'roadmap.json'), 'utf8'));
const markdown = readFileSync(join(root, 'ROADMAP.md'), 'utf8');

const STATUS_BY_EMOJI = {
  '✅': 'done',
  '🔵': 'in_review',
  '🟡': 'in_progress',
  '⬜': 'planned',
  '⏸️': 'optional',
};
const ROW = /^\|\s*(\d+)\s*\|\s*`([^`]+)`\s*\|.*\|\s*(✅|🔵|🟡|⬜|⏸️)[^|]*\|\s*$/gmu;

const fromMarkdown = [...markdown.matchAll(ROW)].map(([, number, branch, emoji]) => ({
  number: Number(number),
  branch,
  status: STATUS_BY_EMOJI[emoji],
}));

const errors = [];
if (fromMarkdown.length !== roadmap.phases.length) {
  errors.push(
    `ROADMAP.md lists ${fromMarkdown.length} phases, roadmap.json lists ${roadmap.phases.length}.`,
  );
}
for (const phase of roadmap.phases) {
  const row = fromMarkdown.find((candidate) => candidate.number === phase.number);
  if (!row) {
    errors.push(`Phase ${phase.number} is missing from ROADMAP.md.`);
    continue;
  }
  for (const key of ['branch', 'status']) {
    if (row[key] !== phase[key]) {
      errors.push(
        `Phase ${phase.number}: ${key} is "${row[key]}" in ROADMAP.md but "${phase[key]}" in roadmap.json.`,
      );
    }
  }
}

if (errors.length > 0) {
  console.error(errors.join('\n'));
  process.exit(1);
}
console.log(`roadmap.json and ROADMAP.md agree on ${roadmap.phases.length} phases.`);
