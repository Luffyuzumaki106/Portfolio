export const ADMIN_CREDENTIALS_KEY = 'fs_admin_credentials_v1';
export const ADMIN_SESSION_KEY = 'fs_admin_session_v1';
export const ADMIN_USERNAME = 'Faizmaster';

const PBKDF2_ITERATIONS = 100000;

function bytesToHex(bytes) {
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

function hexToBytes(hex) {
  const clean = String(hex || '').trim();
  const len = Math.floor(clean.length / 2);
  const out = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    out[i] = parseInt(clean.slice(i * 2, i * 2 + 2), 16);
  }
  return out;
}

async function derivePasswordHash(password, saltHex) {
  if (!globalThis.crypto?.subtle) {
    throw new Error('Web Crypto API is unavailable in this context.');
  }
  const encoder = new TextEncoder();
  const keyMaterial = await globalThis.crypto.subtle.importKey(
    'raw',
    encoder.encode(String(password)),
    'PBKDF2',
    false,
    ['deriveBits']
  );
  const bits = await globalThis.crypto.subtle.deriveBits(
    {
      name: 'PBKDF2',
      salt: hexToBytes(saltHex),
      iterations: PBKDF2_ITERATIONS,
      hash: 'SHA-256',
    },
    keyMaterial,
    256
  );
  return bytesToHex(new Uint8Array(bits));
}

function constantTimeEqual(a, b) {
  if (typeof a !== 'string' || typeof b !== 'string' || a.length !== b.length) {
    return false;
  }
  let diff = 0;
  for (let i = 0; i < a.length; i++) {
    diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return diff === 0;
}

export async function createAdminCredentials(username, password) {
  const cleanUsername = String(username || '').trim() || ADMIN_USERNAME;
  const cleanPassword = String(password || '');
  if (!cleanPassword) {
    throw new Error('Password is required.');
  }
  const saltBytes = new Uint8Array(16);
  globalThis.crypto.getRandomValues(saltBytes);
  const salt = bytesToHex(saltBytes);
  const passwordHash = await derivePasswordHash(cleanPassword, salt);
  return {
    username: cleanUsername,
    salt,
    passwordHash,
  };
}

export async function verifyAdminPassword(credentials, password) {
  if (!credentials?.salt || !credentials?.passwordHash) return false;
  const candidate = await derivePasswordHash(String(password || ''), credentials.salt);
  return constantTimeEqual(candidate, credentials.passwordHash);
}
