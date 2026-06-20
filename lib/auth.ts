// Minimal single-admin auth: a signed cookie value verified with HMAC-SHA256.
// Uses Web Crypto so it runs in both the Node and Edge (middleware) runtimes.

export const SESSION_COOKIE = "askfes_session";

const encoder = new TextEncoder();

function getSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not set");
  return secret;
}

async function hmac(message: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(getSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const sig = await crypto.subtle.sign("HMAC", key, encoder.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

// Token format: "<issuedAtMs>.<hexSignature>". We sign the timestamp so the
// cookie can't be forged without AUTH_SECRET.
export async function createSessionToken(): Promise<string> {
  const issued = Date.now().toString();
  const sig = await hmac(issued);
  return `${issued}.${sig}`;
}

const MAX_AGE_MS = 30 * 24 * 60 * 60 * 1000; // 30 days

export async function verifySessionToken(token: string | undefined): Promise<boolean> {
  if (!token) return false;
  const [issued, sig] = token.split(".");
  if (!issued || !sig) return false;
  const expected = await hmac(issued);
  // Constant-time-ish compare via length + value check.
  if (sig.length !== expected.length || sig !== expected) return false;
  const age = Date.now() - Number(issued);
  return Number.isFinite(age) && age >= 0 && age < MAX_AGE_MS;
}
