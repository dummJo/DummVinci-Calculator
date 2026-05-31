// ISO 9001 §7.5 / §8.5.2 traceability layer.
//
// Two pieces:
//   1. Auto fingerprint — a SHA-256 over the normalised inputs, shown on every
//      result so a value is reproducible and tamper-evident (re-enter the
//      inputs → same hash). No engineer action required.
//   2. Manual sign-off — an explicit "Sign & Lock" that records who reviewed
//      the calculation and when, keyed by the fingerprint. Stored locally.
//
// This is an internal QA aid, not a legal certification.

const SIGNOFF_PREFIX = "dummv:signoff:";

export interface SignOff {
  name: string;
  role: string;
  signedAt: number;     // epoch ms
  signature: string;    // sha256(fingerprint + name + role) short hex
}

function isClient(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

/** Stable, order-independent JSON of the inputs for hashing. */
function normalise(inputs: Record<string, unknown>): string {
  const keys = Object.keys(inputs).sort();
  const obj: Record<string, unknown> = {};
  for (const k of keys) {
    const v = Reflect.get(inputs, k);
    if (v === undefined || v === null || v === "") continue;
    Reflect.set(obj, k, v);
  }
  return JSON.stringify(obj);
}

async function sha256Hex(input: string): Promise<string> {
  // Secure-context SubtleCrypto (https / localhost). Fall back to a cheap
  // non-crypto hash if unavailable so the UI still shows *something* stable.
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(input));
    return Array.from(new Uint8Array(buf))
      .map(b => b.toString(16).padStart(2, "0"))
      .join("");
  }
  let h = 0;
  for (let i = 0; i < input.length; i++) {
    h = (Math.imul(31, h) + input.charCodeAt(i)) | 0;
  }
  return (h >>> 0).toString(16).padStart(8, "0");
}

/** Short (8-char) fingerprint of a calculation's inputs. */
export async function fingerprintInputs(inputs: Record<string, unknown>): Promise<string> {
  const hex = await sha256Hex(normalise(inputs));
  return hex.slice(0, 8);
}

/** Record a sign-off keyed by fingerprint. Returns the stored record. */
export async function signOff(fingerprint: string, name: string, role: string): Promise<SignOff> {
  const signature = (await sha256Hex(`${fingerprint}:${name}:${role}`)).slice(0, 12);
  const rec: SignOff = { name, role, signedAt: Date.now(), signature };
  if (isClient()) {
    try {
      localStorage.setItem(SIGNOFF_PREFIX + fingerprint, JSON.stringify(rec));
    } catch {
      /* storage disabled — sign-off is best-effort */
    }
  }
  return rec;
}

export function getSignOff(fingerprint: string): SignOff | null {
  if (!isClient() || !fingerprint) return null;
  try {
    const raw = localStorage.getItem(SIGNOFF_PREFIX + fingerprint);
    return raw ? (JSON.parse(raw) as SignOff) : null;
  } catch {
    return null;
  }
}
