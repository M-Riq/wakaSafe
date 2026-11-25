import { z } from 'zod';

const CAMEROON_PREFIX = '+237';
/** Cameroon national numbers have 9 digits: 6XXXXXXXX (mobile) or 2XXXXXXXX (fixed). */
const NATIONAL_NUMBER = /^[26]\d{8}$/;

/** Canonical storage format: E.164, e.g. "+237600000001". */
export const PhoneSchema = z
  .string()
  .regex(/^\+237[26]\d{8}$/, 'Numéro camerounais attendu au format +237XXXXXXXXX');
export type Phone = z.infer<typeof PhoneSchema>;

/**
 * Normalises user input ("6 00 00 00 01", "00237600000001", "+237 600-000-001"...)
 * to E.164. Returns null when the input is not a valid Cameroonian number.
 */
export function normalizeCameroonPhone(input: string): Phone | null {
  let digits = input.replace(/[\s.\-()]/g, '');
  if (digits.startsWith('+')) {
    if (!digits.startsWith(CAMEROON_PREFIX)) return null;
    digits = digits.slice(CAMEROON_PREFIX.length);
  } else if (digits.startsWith('00237')) {
    digits = digits.slice(5);
  } else if (digits.startsWith('237') && digits.length === 12) {
    digits = digits.slice(3);
  }
  return NATIONAL_NUMBER.test(digits) ? `${CAMEROON_PREFIX}${digits}` : null;
}

/** Display format: "+237 600 00 00 01". Returns the input unchanged if it is not canonical. */
export function formatCameroonPhone(phone: string): string {
  const match = /^\+237(\d{3})(\d{2})(\d{2})(\d{2})$/.exec(phone);
  return match ? `+237 ${match.slice(1).join(' ')}` : phone;
}
