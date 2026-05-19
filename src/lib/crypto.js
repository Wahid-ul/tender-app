const SALT = new TextEncoder().encode("tender-circle-v1");
const keyCache = new Map();

async function deriveKey(inviteCode) {
  if (keyCache.has(inviteCode)) return keyCache.get(inviteCode);

  const raw = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(inviteCode),
    "PBKDF2",
    false,
    ["deriveKey"]
  );
  const key = await crypto.subtle.deriveKey(
    { name: "PBKDF2", salt: SALT, iterations: 100_000, hash: "SHA-256" },
    raw,
    { name: "AES-GCM", length: 256 },
    false,
    ["encrypt", "decrypt"]
  );
  keyCache.set(inviteCode, key);
  return key;
}

const toB64 = (buf) => btoa(String.fromCharCode(...new Uint8Array(buf)));
const fromB64 = (b64) => Uint8Array.from(atob(b64), (c) => c.charCodeAt(0));

export async function encrypt(plaintext, inviteCode) {
  if (!plaintext || !inviteCode) return plaintext;
  const iv  = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(inviteCode);
  const ct  = await crypto.subtle.encrypt({ name: "AES-GCM", iv }, key, new TextEncoder().encode(plaintext));
  return `enc:${toB64(iv.buffer)}:${toB64(ct)}`;
}

export async function decrypt(value, inviteCode) {
  if (!value || !inviteCode || !value.startsWith("enc:")) return value;
  try {
    const [, ivB64, ctB64] = value.split(":");
    const key   = await deriveKey(inviteCode);
    const plain = await crypto.subtle.decrypt(
      { name: "AES-GCM", iv: fromB64(ivB64) },
      key,
      fromB64(ctB64)
    );
    return new TextDecoder().decode(plain);
  } catch {
    return value;
  }
}
