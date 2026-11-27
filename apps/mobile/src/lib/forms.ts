import { collectFieldErrors, fieldErrorsOf, type ValidationCode } from '@wakasafe/domain';
import type { z } from 'zod';

import { fr } from './i18n';

/** Checks that exist only in the forms (they never reach a repository). */
export type FormOnlyCode = 'PASSWORDS_DO_NOT_MATCH' | 'TERMS_REQUIRED';
export type FormErrorCode = ValidationCode | FormOnlyCode;
export type FormErrors = Partial<Record<string, FormErrorCode>>;

export type ValidationResult<T> =
  | { success: true; data: T; errors: FormErrors }
  | { success: false; data: null; errors: FormErrors };

/** Validates form values with a domain input schema, before calling a repository. */
export function validateForm<S extends z.ZodType>(
  schema: S,
  values: unknown,
): ValidationResult<z.output<S>> {
  const result = schema.safeParse(values);
  return result.success
    ? { success: true, data: result.data, errors: {} }
    : { success: false, data: null, errors: collectFieldErrors(result.error) };
}

/** Field errors returned by a repository (VALIDATION_FAILED, CONFLICT…). */
export function serverFieldErrors(error: unknown): FormErrors {
  return fieldErrorsOf(error);
}

/** French message of a field, or undefined when the field is valid. */
export function fieldMessage(errors: FormErrors, field: string): string | undefined {
  const code = errors[field];
  return code ? fr.validation[code] : undefined;
}
