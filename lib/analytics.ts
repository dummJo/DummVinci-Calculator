// Plausible analytics — privacy-first, cookieless (no consent banner needed).
//
// Activation is env-gated: set NEXT_PUBLIC_PLAUSIBLE_DOMAIN to the domain you
// registered in the Plausible dashboard (e.g. "dummvinci-calc.vercel.app" or a
// custom apex). When unset, the <PlausibleScript /> renders nothing and track()
// is a silent no-op, so this is safe to ship before the account is configured.
//
// Self-hosting: also set NEXT_PUBLIC_PLAUSIBLE_SRC to your instance's script URL.

export const PLAUSIBLE_DOMAIN = process.env.NEXT_PUBLIC_PLAUSIBLE_DOMAIN ?? "";
export const PLAUSIBLE_SRC =
  process.env.NEXT_PUBLIC_PLAUSIBLE_SRC ?? "https://plausible.io/js/script.tagged-events.js";

type PlausibleFn = (event: string, opts?: { props?: Record<string, string | number | boolean> }) => void;

/**
 * Fire a custom Plausible goal. Safe to call anywhere — no-ops when the
 * script isn't loaded (env unset, blocked, or SSR).
 *
 * Standard events used across the app:
 *   calc-run · share-link-created · share-link-opened · sign-off · quick-calc
 */
export function track(
  event: string,
  props?: Record<string, string | number | boolean>,
): void {
  if (typeof window === "undefined") return;
  const w = window as unknown as { plausible?: PlausibleFn };
  try {
    w.plausible?.(event, props ? { props } : undefined);
  } catch {
    /* analytics must never throw into product code */
  }
}
