import { fr, type Dictionary } from './fr';

export { fr, type Dictionary };

/** Only French for the MVP; the hook keeps the door open for other languages. */
export function useT(): Dictionary {
  return fr;
}

/** Replaces `{name}` placeholders: format('Phase {n}', { n: 2 }) → 'Phase 2'. */
export function format(template: string, values: Record<string, string | number>): string {
  return template.replace(/\{(\w+)\}/g, (match, key: string) =>
    key in values ? String(values[key]) : match,
  );
}

export interface PluralForms {
  one: string;
  other: string;
}

/** French plural rule (0 and 1 are singular), without Intl.PluralRules for older engines. */
export function plural(count: number, forms: PluralForms): string {
  return Math.abs(count) < 2 ? forms.one : forms.other;
}

const TIME_ZONE = 'Africa/Douala';

export function formatDate(iso: string): string {
  return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeZone: TIME_ZONE }).format(
    new Date(iso),
  );
}

export function formatDateTime(iso: string): string {
  return new Intl.DateTimeFormat('fr-FR', {
    dateStyle: 'long',
    timeStyle: 'short',
    timeZone: TIME_ZONE,
  }).format(new Date(iso));
}
