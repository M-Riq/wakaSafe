import { plural } from '..';

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
