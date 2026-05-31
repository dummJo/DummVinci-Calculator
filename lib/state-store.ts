// Tool-agnostic snapshot history + per-field histogram store.
// Backed by localStorage. SSR-safe (all accessors guarded).
//
// Concepts:
//   - CalcSnapshot: one calculation run (inputs + optional result preview).
//     Stored as a rolling list of MAX_HISTORY entries per tool, newest first.
//   - Histogram: per-field value frequency, used by getSmartDefaults() to
//     pre-fill forms with the value the engineer has used most often in the
//     last 30 days. Entries older than HISTOGRAM_TTL_MS are evicted on read.
//
// Storage keys:
//   dummv:history:<tool>     →  CalcSnapshot[]
//   dummv:histogram:<tool>   →  Histogram
//
// The API is designed so a tool can opt in with three calls: pushSnapshot
// on calc, getSmartDefaults on mount, listSnapshots for a Recent dropdown.

export type ToolId =
  | "cable" | "vsd" | "breaker" | "busbar" | "br" | "starter"
  | "plc" | "pid" | "panel" | "panel-layout" | "convert" | "unified";

export type CalcSnapshot = {
  id: string;
  tool: ToolId;
  inputs: Record<string, unknown>;
  /** Lightweight preview shown in Recent rows; falls back to JSON if absent. */
  label?: string;
  createdAt: number;
};

type HistogramEntry = { value: unknown; count: number; lastUsed: number };
type Histogram = Record<string, HistogramEntry[]>;

const MAX_HISTORY = 50;
const HISTOGRAM_TTL_MS = 30 * 24 * 60 * 60 * 1000;
const PREVIEW_LIMIT   = 10;

const historyKey   = (tool: ToolId) => `dummv:history:${tool}`;
const histogramKey = (tool: ToolId) => `dummv:histogram:${tool}`;

// Stable-reference cache for snapshot reads — required so consumers using
// useSyncExternalStore get a referentially-equal value when nothing has
// changed (otherwise React 19 throws "getSnapshot should be cached" and
// the render crashes, leaving the page blank).
let _snapshotVersion = 0;
const _snapshotCache = new Map<string, CalcSnapshot[]>();
const EMPTY_SNAPSHOTS: CalcSnapshot[] = [];

export function bumpSnapshotVersion(): void {
  _snapshotVersion += 1;
}

function isClient(): boolean {
  return typeof window !== "undefined" && typeof localStorage !== "undefined";
}

function readJSON<T>(key: string, fallback: T): T {
  if (!isClient()) return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function writeJSON(key: string, value: unknown): void {
  if (!isClient()) return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* quota exceeded or storage disabled — degrade silently */
  }
}

function newId(): string {
  return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 8)}`;
}

/** Persist a snapshot and bump the per-field histogram in one call. */
export function pushSnapshot(snap: Omit<CalcSnapshot, "id" | "createdAt">): CalcSnapshot {
  const full: CalcSnapshot = { ...snap, id: newId(), createdAt: Date.now() };
  const list = readJSON<CalcSnapshot[]>(historyKey(snap.tool), []);
  const next = [full, ...list].slice(0, MAX_HISTORY);
  writeJSON(historyKey(snap.tool), next);
  bumpHistogram(snap.tool, snap.inputs);
  bumpSnapshotVersion();
  // Notify same-tab subscribers (storage event only fires cross-tab).
  if (isClient()) {
    window.dispatchEvent(new CustomEvent("calc-snapshot-saved", { detail: { tool: snap.tool } }));
  }
  return full;
}

/** Most recent snapshots for a tool. Returns a NEW array on every call. */
export function listSnapshots(tool: ToolId, limit = PREVIEW_LIMIT): CalcSnapshot[] {
  return readJSON<CalcSnapshot[]>(historyKey(tool), []).slice(0, limit);
}

/**
 * Stable-reference variant for use inside React `useSyncExternalStore`.
 * Returns the SAME array instance on repeated calls until something
 * mutates the store (pushSnapshot/clearHistory/external storage event
 * that bumps the version). Empty results return a shared frozen array.
 */
export function listSnapshotsStable(tool: ToolId, limit = PREVIEW_LIMIT): CalcSnapshot[] {
  const cacheKey = `${tool}:${limit}:${_snapshotVersion}`;
  const cached = _snapshotCache.get(cacheKey);
  if (cached) return cached;
  // Evict stale entries for this (tool,limit) — keeps the map bounded.
  for (const k of _snapshotCache.keys()) {
    if (k.startsWith(`${tool}:${limit}:`) && k !== cacheKey) _snapshotCache.delete(k);
  }
  const fresh = listSnapshots(tool, limit);
  const stable = fresh.length === 0 ? EMPTY_SNAPSHOTS : fresh;
  _snapshotCache.set(cacheKey, stable);
  return stable;
}

export function clearHistory(tool: ToolId): void {
  if (!isClient()) return;
  localStorage.removeItem(historyKey(tool));
  localStorage.removeItem(histogramKey(tool));
  bumpSnapshotVersion();
}

function bumpHistogram(tool: ToolId, inputs: Record<string, unknown>): void {
  const histo = readJSON<Histogram>(histogramKey(tool), {});
  const now = Date.now();
  for (const [field, value] of Object.entries(inputs)) {
    if (value === undefined || value === null || value === "") continue;
    const bucket = histo[field] ?? [];
    const match = bucket.find(e => valueKey(e.value) === valueKey(value));
    if (match) {
      match.count += 1;
      match.lastUsed = now;
    } else {
      bucket.push({ value, count: 1, lastUsed: now });
    }
    histo[field] = bucket;
  }
  writeJSON(histogramKey(tool), histo);
}

/**
 * Returns the most-frequent value per field over the trailing 30 days.
 * Ties on count → prefer the most-recently-used.
 * Fields not present in history are omitted (caller falls back to its own defaults).
 */
export function getSmartDefaults(tool: ToolId): Record<string, unknown> {
  const histo = readJSON<Histogram>(histogramKey(tool), {});
  const cutoff = Date.now() - HISTOGRAM_TTL_MS;
  const out: Record<string, unknown> = {};
  for (const [field, bucket] of Object.entries(histo)) {
    const fresh = bucket.filter(e => e.lastUsed >= cutoff);
    if (!fresh.length) continue;
    fresh.sort((a, b) =>
      b.count !== a.count ? b.count - a.count : b.lastUsed - a.lastUsed
    );
    out[field] = fresh[0].value;
  }
  return out;
}

/** Stable key for a value (so 7 vs "7" map to the same bucket). */
function valueKey(v: unknown): string {
  if (v === null || v === undefined) return "";
  if (typeof v === "object") {
    try { return JSON.stringify(v); } catch { return String(v); }
  }
  return String(v);
}
