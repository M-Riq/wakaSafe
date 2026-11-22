import { z } from 'zod';

import rawRoadmap from '../../../../../roadmap.json';

export const PHASE_STATUSES = ['done', 'in_review', 'in_progress', 'planned', 'optional'] as const;
export type PhaseStatus = (typeof PHASE_STATUSES)[number];

export const PhaseSchema = z.object({
  number: z.number().int().min(0),
  branch: z.string().regex(/^phase\/\d{2}-[a-z0-9-]+$/),
  title: z.string().min(1),
  summary: z.string().min(1),
  app: z.enum(['docs', 'mobile', 'admin', 'both']),
  requirements: z.array(z.string().regex(/^F\d+\.\d+$/)),
  status: z.enum(PHASE_STATUSES),
});
export type Phase = z.infer<typeof PhaseSchema>;

/** Shape of the root `roadmap.json`, kept in sync with ROADMAP.md (checked in CI). */
export const RoadmapSchema = z.object({
  updatedAt: z.iso.date(),
  phases: z.array(PhaseSchema).min(1),
});
export type Roadmap = z.infer<typeof RoadmapSchema>;

export const roadmap: Roadmap = RoadmapSchema.parse(rawRoadmap);

export function summarizeRoadmap({ phases }: Roadmap) {
  const committed = phases.filter((phase) => phase.status !== 'optional');
  return {
    done: committed.filter((phase) => phase.status === 'done').length,
    total: committed.length,
    current:
      phases.find((phase) => phase.status === 'in_progress' || phase.status === 'in_review') ??
      null,
  };
}

export function getPhase(number: number): Phase | undefined {
  return roadmap.phases.find((phase) => phase.number === number);
}
