/** Builds ISO timestamps relative to the seeding time, so the demo always looks recent. */
export interface Timeline {
  now: Date;
  hoursAgo(hours: number): string;
  daysAgo(days: number): string;
  hoursFromNow(hours: number): string;
}

const HOUR_MS = 60 * 60 * 1000;

export function createTimeline(now: Date): Timeline {
  const at = (offsetMs: number) => new Date(now.getTime() + offsetMs).toISOString();
  return {
    now,
    hoursAgo: (hours) => at(-hours * HOUR_MS),
    daysAgo: (days) => at(-days * 24 * HOUR_MS),
    hoursFromNow: (hours) => at(hours * HOUR_MS),
  };
}

export function addMinutes(iso: string, minutes: number): string {
  return new Date(new Date(iso).getTime() + minutes * 60 * 1000).toISOString();
}
