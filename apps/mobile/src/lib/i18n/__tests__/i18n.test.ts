import { fr, plural } from '..';

function allStrings(value: unknown): string[] {
  if (typeof value === 'string') return [value];
  if (value && typeof value === 'object') return Object.values(value).flatMap(allStrings);
  return [];
}

describe('plural', () => {
  it('uses the French singular for 0 and 1 and the plural from 2', () => {
    const forms = { one: 'évaluation', other: 'évaluations' };
    expect([0, 1, 2, 13].map((count) => plural(count, forms))).toEqual([
      'évaluation',
      'évaluation',
      'évaluations',
      'évaluations',
    ]);
  });
});

describe('French dictionary', () => {
  it('puts a non-breaking space, never a regular one, before « : ; ? ! »', () => {
    const offenders = allStrings(fr).filter((text) => / [:;?!]/.test(text));
    expect(offenders).toEqual([]);
  });

  it('never shows project phases to users', () => {
    expect(allStrings(fr).filter((text) => /phase/i.test(text))).toEqual([]);
  });
});
