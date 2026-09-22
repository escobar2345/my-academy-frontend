// schoolAuth.js — shared credential + session helpers for the school portal.
// Hashing matches boirsu._hash_password exactly (PBKDF2-SHA256, 120k
// iterations, 16-byte random salt, hex) so teacher/partner logins can be
// verified the same way the backend verifies students.

export async function hashPassword(password) {
  const enc = new TextEncoder()
  const salt = crypto.getRandomValues(new Uint8Array(16))
  return { saltHex: toHex(salt), hashHex: await pbkdf2(password, salt) }
}

export async function verifyPassword(password, saltHex, expectedHex) {
  if (!saltHex || !expectedHex) return false
  try {
    const salt = new Uint8Array((saltHex.match(/.{2}/g) || []).map((h) => parseInt(h, 16)))
    return (await pbkdf2(password, salt)) === expectedHex
  } catch {
    return false
  }
}

// One device per session: every sign-in mints a fresh token that is stored on
// the account row; older devices holding a previous token lose their session.
export function newSessionToken() {
  return (typeof crypto !== 'undefined' && crypto.randomUUID)
    ? crypto.randomUUID()
    : 's-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 10)
}

async function pbkdf2(password, saltBytes) {
  const enc = new TextEncoder()
  const key = await crypto.subtle.importKey('raw', enc.encode(String(password)), 'PBKDF2', false, ['deriveBits'])
  const bits = await crypto.subtle.deriveBits(
    { name: 'PBKDF2', hash: 'SHA-256', iterations: 120000, salt: saltBytes },
    key,
    256,
  )
  return toHex(new Uint8Array(bits))
}

function toHex(bytes) {
  return [...bytes].map((b) => b.toString(16).padStart(2, '0')).join('')
}