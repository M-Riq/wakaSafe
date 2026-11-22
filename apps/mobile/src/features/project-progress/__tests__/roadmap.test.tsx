import { render, screen } from '@testing-library/react-native';

import { plural } from '@/lib/i18n';
import { roadmap, summarizeRoadmap, type Roadmap } from '../roadmap';
import { ProjectProgressScreen } from '../screens/ProjectProgressScreen';

const sample: Roadmap = {
  updatedAt: '2026-01-15',
  phases: [
    {
      number: 0,
      branch: 'phase/00-a',
      title: 'A',
      summary: 'a',
      app: 'docs',
      requirements: [],
      status: 'done',
    },
    {
      number: 1,
      branch: 'phase/01-b',
      title: 'B',
      summary: 'b',
      app: 'mobile',
      requirements: ['F1.1'],
      status: 'in_review',
    },
    {
      number: 2,
      branch: 'phase/02-c',
      title: 'C',
      summary: 'c',
      app: 'mobile',
      requirements: [],
      status: 'planned',
    },
    {
      number: 3,
      branch: 'phase/03-d',
      title: 'D',
      summary: 'd',
      app: 'both',
      requirements: [],
      status: 'optional',
    },
  ],
};

describe('roadmap.json', () => {
  it('lists phases 0 to 13 in order, with a single current phase', () => {
    expect(roadmap.phases.map((phase) => phase.number)).toEqual(
      Array.from({ length: 14 }, (_, index) => index),
    );
    const current = roadmap.phases.filter(
      (phase) => phase.status === 'in_progress' || phase.status === 'in_review',
    );
    expect(current.length).toBeLessThanOrEqual(1);
  });
});

describe('summarizeRoadmap', () => {
  it('excludes optional phases from the total and finds the current phase', () => {
    expect(summarizeRoadmap(sample)).toEqual({
      done: 1,
      total: 3,
      current: sample.phases[1],
    });
  });
});

describe('plural', () => {
  it('uses the French singular for 0 and 1 and the plural from 2', () => {
    const forms = { one: 'phase', other: 'phases' };
    expect([0, 1, 2, 13].map((count) => plural(count, forms))).toEqual([
      'phase',
      'phase',
      'phases',
      'phases',
    ]);
  });
});

describe('ProjectProgressScreen', () => {
  it('renders every phase of the roadmap', async () => {
    await render(<ProjectProgressScreen roadmap={sample} />);
    for (const phase of sample.phases) {
      expect(screen.getByTestId(`phase-${phase.number}`)).toBeOnTheScreen();
    }
    expect(screen.getByText('1 phase terminée sur 3')).toBeOnTheScreen();
  });
});
