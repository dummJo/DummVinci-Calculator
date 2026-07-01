// PTTS Praxis — Service Worker (offline-first)
// Strategy:
//   - Static assets (JS/CSS/fonts/images): cache-first with background refresh
//   - Navigation (HTML pages): network-first with offline fallback
//   - External CDN resources: stale-while-revalidate

const CACHE_NAME = "ptts-praxis-v2";
const OFFLINE_PAGE = "/";

// Eviction cap — without it the cache grows monotonically (every hashed
// _next/static chunk from every deploy accumulates) until the browser hits
// storage quota. FIFO trim is enough here: hot assets get re-cached on next use.
// Raised to 300 now that RSC navigation payloads are cached too (see below):
// a field tech browsing several tools offline pulls many hashed chunks + one
// RSC payload per route, so a tighter cap would FIFO-evict earlier tools before
// they can be revisited offline. 300 hashed entries stays well within quota.
const MAX_CACHE_ENTRIES = 300;

async function trimCache(cache) {
  const keys = await cache.keys();
  if (keys.length > MAX_CACHE_ENTRIES) {
    await Promise.all(keys.slice(0, keys.length - MAX_CACHE_ENTRIES).map((k) => cache.delete(k)));
  }
}

// Assets to pre-cache on install (filled by Next.js build hashes at runtime
// via the SW fetch handler; we just warm the shell here).
const PRECACHE_URLS = [
  "/",
  "/manifest.webmanifest",
  "/work-order",
  "/capacitor-kvar",
  "/abb-support",
];

// ─── Install: pre-cache shell ──────────────────────────────────────────────

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      // Resilient precache: cache.addAll() rejects the WHOLE install if any
      // single URL fails (redirect, transient 5xx). Cache each entry
      // independently so one bad fetch never blocks SW activation.
      Promise.allSettled(PRECACHE_URLS.map((u) => cache.add(u)))
    )
  );
  // Activate immediately — don't wait for old tabs to close.
  self.skipWaiting();
});

// ─── Activate: delete old caches ──────────────────────────────────────────

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((k) => k !== CACHE_NAME)
          .map((k) => caches.delete(k))
      )
    )
  );
  // Take control of all open clients immediately.
  self.clients.claim();
});

// ─── Fetch strategy ───────────────────────────────────────────────────────

self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Only handle same-origin + HTTPS requests.
  if (
    request.method !== "GET" ||
    (url.origin !== self.location.origin && !url.hostname.includes("fonts."))
  ) {
    return;
  }

  // API routes: network-only (data must always be fresh, never served stale).
  if (url.pathname.startsWith("/api/")) {
    return;
  }

  // RSC payloads & Next.js data: network-first, cached for offline fallback.
  // App Router fetches an RSC payload on every client-side <Link> navigation;
  // if these are network-only, navigating between tools breaks offline. Caching
  // them (network wins when online) lets prefetched/visited routes navigate
  // offline — this is the "interconnection" that makes the PWA usable offline.
  if (url.searchParams.has("_rsc") || url.pathname.includes("/_next/data/")) {
    event.respondWith(rscNetworkFirst(request));
    return;
  }

  // Static assets (_next/static/**): cache-first, background refresh.
  if (url.pathname.startsWith("/_next/static/")) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Static files in /public (images, fonts, icons): cache-first.
  if (
    url.pathname.match(/\.(png|jpg|jpeg|webp|svg|ico|woff2?|ttf|otf)$/)
  ) {
    event.respondWith(cacheFirst(request));
    return;
  }

  // Navigation / HTML pages: network-first with offline fallback.
  if (request.mode === "navigate" || request.headers.get("accept")?.includes("text/html")) {
    event.respondWith(networkFirstWithFallback(request));
    return;
  }

  // Everything else: stale-while-revalidate.
  event.respondWith(staleWhileRevalidate(request));
});

// ─── Strategy helpers ──────────────────────────────────────────────────────

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) {
    // Refresh in background so next visit gets fresh asset.
    // No clone needed: this response is consumed only by cache.put.
    const cache = await caches.open(CACHE_NAME);
    fetch(request).then((res) => {
      if (res && res.ok) cache.put(request, res).then(() => trimCache(cache));
    }).catch(() => {});
    return cached;
  }
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone()).then(() => trimCache(cache));
    }
    return response;
  } catch {
    return new Response("Offline", { status: 503 });
  }
}

// RSC / data payloads: network-first, fall back to cached payload offline.
// Critically it must NOT fall back to the HTML shell like the navigation
// strategy does — the App Router parser expects an RSC/flight payload, and
// handing it HTML would corrupt client-side navigation. A 504 lets the router
// fail gracefully (it keeps the user on the current page) when nothing cached.
async function rscNetworkFirst(request) {
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone()).then(() => trimCache(cache));
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    return cached ?? new Response("", { status: 504 });
  }
}

async function networkFirstWithFallback(request) {
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone()).then(() => trimCache(cache));
    }
    return response;
  } catch {
    const cached = await caches.match(request);
    if (cached) return cached;
    // Last resort: return the root shell.
    const fallback = await caches.match(OFFLINE_PAGE);
    return fallback ?? new Response("Offline — open the app while connected first.", { status: 503, headers: { "Content-Type": "text/plain" } });
  }
}

async function staleWhileRevalidate(request) {
  // Defense-in-depth: the fetch handler already filters non-GET, but this
  // strategy caches whatever reaches it — keep the invariant local too.
  if (request.method !== "GET") return fetch(request);
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request).then((res) => {
    if (res && res.ok) cache.put(request, res.clone()).then(() => trimCache(cache));
    return res;
  }).catch(() => null);
  return cached ?? (await fetchPromise) ?? new Response("Offline", { status: 503 });
}
