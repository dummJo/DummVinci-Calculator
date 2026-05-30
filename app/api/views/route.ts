import { NextResponse } from "next/server";
import { checkRateLimit, clientIp, rateLimitHeaders } from "@/lib/rate-limit";

const COUNTER_READ = "https://api.counterapi.dev/v1/dummvinci_tools/views";
const COUNTER_INC  = "https://api.counterapi.dev/v1/dummvinci_tools/views/up";

async function fetchCount(endpoint: string): Promise<number> {
  try {
    const res = await fetch(endpoint, {
      cache: "no-store",
      signal: AbortSignal.timeout(3000),
    });
    if (!res.ok) return 0;
    const data = await res.json();
    return typeof data?.count === "number" ? data.count : 0;
  } catch (e) {
    console.warn("Counter fetch failed:", e);
    return 0;
  }
}

// Read-only count. Generous limit — pages call this on every mount.
export async function GET() {
  const ip = await clientIp();
  const rl = checkRateLimit(`views:read:${ip}`, 60, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ count: 0 }, { status: 429, headers: rateLimitHeaders(rl) });
  }
  const count = await fetchCount(COUNTER_READ);
  return NextResponse.json({ count }, { headers: rateLimitHeaders(rl) });
}

// Increment counter. Mutation moved off GET so prefetchers, link-preview bots
// and accidental img-tag GETs can't inflate the count. Stricter per-IP limit.
export async function POST() {
  const ip = await clientIp();
  const rl = checkRateLimit(`views:inc:${ip}`, 10, 60_000);
  if (!rl.allowed) {
    return NextResponse.json({ count: 0, error: "rate_limited" }, { status: 429, headers: rateLimitHeaders(rl) });
  }
  const count = await fetchCount(COUNTER_INC);
  return NextResponse.json({ count }, { headers: rateLimitHeaders(rl) });
}
