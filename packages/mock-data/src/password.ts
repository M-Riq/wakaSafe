/**
 * DEMO ONLY — NOT A SECURE PASSWORD HASH.
 * The mock layer runs entirely in the browser or on the phone, so nothing here can
 * protect a password. It only avoids storing the typed value as-is in local storage.
 * Real authentication (Argon2id/bcrypt or Supabase Auth) arrives with the backend in phase 12.
 */
export function demoPasswordHash(password: string, salt: string): string {
  let hash = 0x811c9dc5;
  const input = `${salt}:${password}`;
  for (let round = 0; round < 3; round += 1) {
    for (let i = 0; i < input.length; i += 1) {
      hash ^= input.charCodeAt(i);
      hash = Math.imul(hash, 0x01000193) >>> 0;
    }
  }
  return `demo-fnv1a:${hash.toString(16).padStart(8, '0')}`;
}
