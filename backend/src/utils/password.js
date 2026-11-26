import crypto from 'node:crypto';

const SCRYPT_KEY_LENGTH = 64;

/**
 * Generates a salted scrypt password hash record.
 */
export function createPasswordRecord(password) {
  const salt = crypto.randomBytes(16).toString('hex');
  const passwordHash = crypto.scryptSync(password, salt, SCRYPT_KEY_LENGTH).toString('hex');
  return { salt, passwordHash };
}

/**
 * Verifies a plaintext password against a stored salt and scrypt hash in constant time.
 */
export function verifyPassword(password, salt, expectedHash) {
  if (!password || !salt || !expectedHash) return false;
  const derived = crypto.scryptSync(password, salt, SCRYPT_KEY_LENGTH);
  const expected = Buffer.from(expectedHash, 'hex');
  if (derived.length !== expected.length) return false;
  return crypto.timingSafeEqual(derived, expected);
}

/**
 * Generates an opaque random bearer/cookie session token.
 */
export function generateSessionToken() {
  return crypto.randomBytes(32).toString('hex');
}

/**
 * Hashes a session token using HMAC-SHA256 before persistence/lookup.
 */
export function hashSessionToken(token, secret) {
  return crypto.createHmac('sha256', secret).update(String(token)).digest('hex');
}
