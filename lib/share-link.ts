// URL-hash–based shareable calculation state.
//
// Encoded as base64url(JSON({ t: tool, i: inputs })) in the URL hash
// (so it never hits the server, never appears in referrer headers, never
// triggers a page reload). The decode helper is idempotent.
//
// Watermark gating: callers can check isSharedView() to display the
// DummVinci share-attribution overlay only when the page was opened
// from a share link.

import type { ToolId } from "@/lib/state-store";

export const SHARE_HASH_PREFIX = "#s=";

type SharePayload = { t: ToolId; i: Record<string, unknown> };

function base64urlEncode(s: string): string {
  return btoa(unescape(encodeURIComponent(s)))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

function base64urlDecode(s: string): string {
  const pad = s.length % 4 === 0 ? "" : "=".repeat(4 - (s.length % 4));
  const b64 = (s + pad).replace(/-/g, "+").replace(/_/g, "/");
  return decodeURIComponent(escape(atob(b64)));
}

/** Build a shareable URL for the given tool + form inputs. */
export function buildShareUrl(tool: ToolId, inputs: Record<string, unknown>): string {
  if (typeof window === "undefined") return "";
  const payload: SharePayload = { t: tool, i: inputs };
  const encoded = base64urlEncode(JSON.stringify(payload));
  const { origin, pathname } = window.location;
  return `${origin}${pathname}${SHARE_HASH_PREFIX}${encoded}`;
}

/** Parse the current URL hash and return the encoded payload if any. */
export function readShareFromHash(): SharePayload | null {
  if (typeof window === "undefined") return null;
  const hash = window.location.hash;
  if (!hash.startsWith(SHARE_HASH_PREFIX)) return null;
  try {
    const encoded = hash.slice(SHARE_HASH_PREFIX.length);
    const raw = base64urlDecode(encoded);
    const parsed = JSON.parse(raw) as SharePayload;
    if (typeof parsed?.t !== "string" || typeof parsed?.i !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
}

export function isSharedView(): boolean {
  if (typeof window === "undefined") return false;
  return window.location.hash.startsWith(SHARE_HASH_PREFIX);
}

/** Strip the share hash from the URL without reloading (after user dismisses watermark). */
export function clearShareHash(): void {
  if (typeof window === "undefined") return;
  const { pathname, search } = window.location;
  history.replaceState(null, "", `${pathname}${search}`);
}
