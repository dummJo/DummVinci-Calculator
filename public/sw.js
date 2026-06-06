// PTTS Praxis — Service Worker (offline-first)
// Strategy:
//   - Static assets (JS/CSS/fonts/images): cache-first with background refresh
//   - Navigation (HTML pages): network-first with offline fallback
//   - External CDN resources: stale-while-revalidate

const CACHE_NAME = "ptts-praxis-v1";
const OFFLINE_PAGE = "/";

// Assets to pre-cache on install (filled by Next.js build hashes at runtime
// via the SW fetch handler; we just warm the shell here).
const PRECACHE_URLS = ["/", "/manifest.webmanifest"];

// ─── Install: pre-cache shell ──────────────────────────────────────────────

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(PRECACHE_URLS))
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

  // Next.js API routes, RSC payloads: network-only (no caching).
  if (
    url.pathname.startsWith("/api/") ||
    url.searchParams.has("_rsc") ||
    url.pathname.includes("/_next/data/")
  ) {
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
    const cache = await caches.open(CACHE_NAME);
    fetch(request).then((res) => {
      if (res && res.ok) cache.put(request, res);
    }).catch(() => {});
    return cached;
  }
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response("Offline", { status: 503 });
  }
}

async function networkFirstWithFallback(request) {
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
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
  const cache = await caches.open(CACHE_NAME);
  const cached = await cache.match(request);
  const fetchPromise = fetch(request).then((res) => {
    if (res && res.ok) cache.put(request, res.clone());
    return res;
  }).catch(() => null);
  return cached ?? (await fetchPromise) ?? new Response("Offline", { status: 503 });
}
