import { BUSINESS_RULES } from './config/business-rules';

/**
 * Calendar helpers in the Africa/Douala time zone. Cameroon uses UTC+1 all year round
 * (no daylight saving time), so a fixed offset is exact and avoids depending on the
 * Intl time-zone data, which is incomplete on some Android JavaScript engines.
 */
const OFFSET_MS = BUSINESS_RULES.quiz.utcOffsetMinutes * 60 * 1000;
const DAY_MS = 24 * 60 * 60 * 1000;

function toLocalParts(date: Date): { year: string; month: string; day: string } {
  const shifted = new Date(date.getTime() + OFFSET_MS);
  return {
    year: String(shifted.getUTCFullYear()).padStart(4, '0'),
    month: String(shifted.getUTCMonth() + 1).padStart(2, '0'),
    day: String(shifted.getUTCDate()).padStart(2, '0'),
  };
}

/** "YYYY-MM-DD" — reference day of the daily quiz limit (F5.2). */
export function localDayKey(date: Date): string {
  const { year, month, day } = toLocalParts(date);
  return `${year}-${month}-${day}`;
}

/** "YYYY-MM" — monthly leaderboard key (F5.4). */
export function monthKey(date: Date): string {
  const { year, month } = toLocalParts(date);
  return `${year}-${month}`;
}

/** "YYYY" — annual leaderboard key (F5.4). */
export function yearKey(date: Date): string {
  return toLocalParts(date).year;
}

/**
 * Anti-abuse rating period (F6.3). Provisional: fixed windows of `periodDays` days
 * counted from 1970-01-01 in local time, so that the (passenger, driver, period)
 * uniqueness constraint of the data model can be enforced by the database.
 */
export function ratingPeriodKey(date: Date): string {
  const localDays = Math.floor((date.getTime() + OFFSET_MS) / DAY_MS);
  return `P${BUSINESS_RULES.ratings.periodDays}-${Math.floor(localDays / BUSINESS_RULES.ratings.periodDays)}`;
}
