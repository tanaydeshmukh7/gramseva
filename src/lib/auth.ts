import bcrypt from "bcryptjs";

export const SESSION_COOKIE_NAME = "gramseva_session";

// Server-side environment credentials with secure defaults
export function getAdminUsername(): string {
  return process.env.ADMIN_USERNAME || "kalyugkadevta";
}

export function getAdminPasswordHash(): string {
  // Salted bcrypt hash of 'kalyug@77' (cost factor 12)
  return (
    process.env.ADMIN_PASSWORD_HASH ||
    "$2b$12$r8..cQFt/EZ422ezeTXIuuS0vN1UYj5zb6FsNT5lEF76MlpWTU.v."
  );
}

export function getSessionSecret(): string {
  return (
    process.env.SESSION_SECRET ||
    "gramseva_secure_admin_session_secret_gohgaon_2026_auth"
  );
}

export interface SessionPayload {
  username: string;
  iat: number;
  exp: number;
  rememberMe: boolean;
}

// Universal Base64URL encoding/decoding compatible with Node.js and Edge runtimes
export function toBase64Url(bytes: Uint8Array): string {
  if (typeof Buffer !== "undefined") {
    return Buffer.from(bytes).toString("base64url");
  }
  let binary = "";
  for (let i = 0; i < bytes.byteLength; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

export function fromBase64Url(str: string): Uint8Array {
  if (typeof Buffer !== "undefined") {
    return new Uint8Array(Buffer.from(str, "base64url"));
  }
  let base64 = str.replace(/-/g, "+").replace(/_/g, "/");
  while (base64.length % 4) {
    base64 += "=";
  }
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes;
}

// Import CryptoKey for HMAC-SHA256
async function getCryptoKey(secret: string): Promise<CryptoKey> {
  const encoder = new TextEncoder();
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"]
  );
}

/**
 * Creates a cryptographically signed session token.
 */
export async function createSessionToken(
  username: string,
  rememberMe: boolean = false
): Promise<{ token: string; maxAge: number }> {
  const now = Date.now();
  // 30 days if rememberMe, otherwise 24 hours
  const durationMs = rememberMe ? 30 * 24 * 60 * 60 * 1000 : 24 * 60 * 60 * 1000;
  const maxAgeSeconds = Math.floor(durationMs / 1000);

  const payload: SessionPayload = {
    username,
    iat: now,
    exp: now + durationMs,
    rememberMe,
  };

  const encoder = new TextEncoder();
  const payloadStr = JSON.stringify(payload);
  const payloadB64 = toBase64Url(encoder.encode(payloadStr));

  const key = await getCryptoKey(getSessionSecret());
  const signatureBytes = await crypto.subtle.sign("HMAC", key, encoder.encode(payloadB64));
  const signatureB64 = toBase64Url(new Uint8Array(signatureBytes));

  const token = `${payloadB64}.${signatureB64}`;
  return { token, maxAge: maxAgeSeconds };
}

/**
 * Verifies and decodes a signed session token.
 * Returns null if token is missing, tampered, expired, or invalid.
 */
export async function verifySessionToken(token: string | undefined | null): Promise<SessionPayload | null> {
  if (!token || typeof token !== "string") {
    return null;
  }

  const parts = token.split(".");
  if (parts.length !== 2) {
    return null;
  }

  const [payloadB64, signatureB64] = parts;

  try {
    const key = await getCryptoKey(getSessionSecret());
    const encoder = new TextEncoder();
    const sigBytes = fromBase64Url(signatureB64);

    const isValidSig = await crypto.subtle.verify(
      "HMAC",
      key,
      sigBytes as BufferSource,
      encoder.encode(payloadB64)
    );

    if (!isValidSig) {
      return null;
    }

    const payloadBytes = fromBase64Url(payloadB64);
    const decoder = new TextDecoder();
    const payloadStr = decoder.decode(payloadBytes);
    const payload: SessionPayload = JSON.parse(payloadStr);

    // Check expiration
    if (!payload.exp || Date.now() > payload.exp) {
      return null;
    }

    // Verify username matches expected admin
    if (
      !payload.username ||
      payload.username.toLowerCase() !== getAdminUsername().toLowerCase()
    ) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

/**
 * Verifies username and password using bcrypt on the server.
 */
export async function verifyCredentials(
  usernameInput: string,
  passwordInput: string
): Promise<boolean> {
  if (!usernameInput || !passwordInput) {
    return false;
  }

  const cleanUser = usernameInput.trim();
  const expectedUser = getAdminUsername();

  // Case-insensitive comparison for username
  if (cleanUser.toLowerCase() !== expectedUser.toLowerCase()) {
    return false;
  }

  const expectedHash = getAdminPasswordHash();
  try {
    return await bcrypt.compare(passwordInput, expectedHash);
  } catch (err) {
    console.error("Password verification error:", err);
    return false;
  }
}

// In-Memory Rate Limiting for Brute Force Protection
interface AttemptRecord {
  failures: number;
  firstFailure: number;
  lockoutUntil: number;
}

const rateLimitStore = new Map<string, AttemptRecord>();

const MAX_FAILURES = 5;
const WINDOW_MS = 15 * 60 * 1000; // 15 minutes window
const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes lockout

export function checkRateLimit(identifier: string): {
  allowed: boolean;
  remainingSeconds: number;
  attemptsLeft: number;
} {
  const now = Date.now();
  const record = rateLimitStore.get(identifier);

  if (!record) {
    return { allowed: true, remainingSeconds: 0, attemptsLeft: MAX_FAILURES };
  }

  // Check if currently locked out
  if (record.lockoutUntil > now) {
    const remainingSeconds = Math.ceil((record.lockoutUntil - now) / 1000);
    return { allowed: false, remainingSeconds, attemptsLeft: 0 };
  }

  // Reset if window has expired
  if (now - record.firstFailure > WINDOW_MS) {
    rateLimitStore.delete(identifier);
    return { allowed: true, remainingSeconds: 0, attemptsLeft: MAX_FAILURES };
  }

  const attemptsLeft = Math.max(0, MAX_FAILURES - record.failures);
  return { allowed: true, remainingSeconds: 0, attemptsLeft };
}

export function recordFailedAttempt(identifier: string): {
  lockedOut: boolean;
  remainingSeconds: number;
  attemptsLeft: number;
} {
  const now = Date.now();
  let record = rateLimitStore.get(identifier);

  if (!record || now - record.firstFailure > WINDOW_MS) {
    record = { failures: 1, firstFailure: now, lockoutUntil: 0 };
  } else {
    record.failures += 1;
  }

  if (record.failures >= MAX_FAILURES) {
    record.lockoutUntil = now + LOCKOUT_MS;
    rateLimitStore.set(identifier, record);
    return {
      lockedOut: true,
      remainingSeconds: Math.ceil(LOCKOUT_MS / 1000),
      attemptsLeft: 0,
    };
  }

  rateLimitStore.set(identifier, record);
  return {
    lockedOut: false,
    remainingSeconds: 0,
    attemptsLeft: MAX_FAILURES - record.failures,
  };
}

export function recordSuccessfulLogin(identifier: string): void {
  rateLimitStore.delete(identifier);
}
