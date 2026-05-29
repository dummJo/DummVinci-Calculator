import { NextResponse } from "next/server";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

// Strict IPv4/IPv6 syntactic validator. We never embed an unvalidated header
// value into an outbound URL (SSRF defence).
function isValidIp(s: string): boolean {
  if (!s) return false;
  // IPv4
  const v4 = s.match(/^(\d{1,3})\.(\d{1,3})\.(\d{1,3})\.(\d{1,3})$/);
  if (v4) return v4.slice(1).every(o => { const n = +o; return n >= 0 && n <= 255; });
  // IPv6 (loose — hex groups + colons only)
  return /^[0-9a-f:]+$/i.test(s) && s.includes(":");
}

// RFC1918 + link-local + loopback + ULA. 172.x is /12 (16–31), not the whole /8.
function isPrivateIp(s: string): boolean {
  if (!s) return true;
  if (s === "127.0.0.1" || s === "::1" || s === "localhost") return true;
  if (s.startsWith("192.168.")) return true;
  if (s.startsWith("10.")) return true;
  if (s.startsWith("169.254.")) return true;       // IPv4 link-local
  if (s.startsWith("100.64.")) return true;        // CGNAT
  if (/^f[cd]/i.test(s)) return true;              // IPv6 ULA (fc00::/7)
  if (/^fe[89ab]/i.test(s)) return true;           // IPv6 link-local
  const m = s.match(/^172\.(\d+)\./);
  if (m) { const o = +m[1]; return o >= 16 && o <= 31; }
  return false;
}

const COUNTRY_NAMES: Record<string, string> = {
  ID: "Indonesia", MY: "Malaysia", SG: "Singapore", PH: "Philippines",
  TH: "Thailand",  VN: "Vietnam",  US: "United States", JP: "Japan",
  CN: "China",     AU: "Australia", GB: "United Kingdom", DE: "Germany",
  IN: "India",     KR: "South Korea", TW: "Taiwan", HK: "Hong Kong",
  NL: "Netherlands", FR: "France", CA: "Canada", BR: "Brazil",
};

export async function GET() {
  try {
    const h = await headers();

    // Client IP from edge headers. Vercel appends the real client IP to x-forwarded-for.
    let ip = h.get("x-forwarded-for")?.split(",")[0]?.trim()
          || h.get("x-real-ip")?.trim()
          || "";
    if (ip.startsWith("::ffff:")) ip = ip.substring(7);          // IPv4-mapped IPv6
    if (!isValidIp(ip)) ip = "";                                  // reject garbage

    // Vercel edge geo headers are authoritative when present — use them first.
    let city    = h.get("x-vercel-ip-city") || "";
    const cc    = (h.get("x-vercel-ip-country") || "").toUpperCase();
    try { city = city ? decodeURIComponent(city) : ""; } catch { /* keep raw */ }

    let country_name = cc ? (COUNTRY_NAMES[cc] || cc) : "";
    let org = "";

    // Enrich with ISP/org via ip-api — ONLY when we have a real public IP.
    // Crucially, we never overwrite `ip` with the response: ip-api called without
    // a path returns whichever IP made the request (i.e. the serverless function's
    // own IP), which previously leaked the Vercel datacentre IP to users.
    if (ip && !isPrivateIp(ip) && isValidIp(ip)) {
      try {
        const url = `http://ip-api.com/json/${encodeURIComponent(ip)}?fields=status,isp,org,city,country,countryCode`;
        const res = await fetch(url, {
          cache: "no-store",
          signal: AbortSignal.timeout(2500),
        });
        if (res.ok) {
          const data = await res.json();
          if (data?.status === "success") {
            org = data.isp || data.org || "";
            if (!city) city = data.city || "";
            if (!country_name && data.country) country_name = data.country;
          }
        }
      } catch {
        // ip-api unreachable / rate-limited / timeout — fall through with Vercel-only data.
      }
    }

    return NextResponse.json({
      ip:           ip || "0.0.0.0",
      city:         city || "Unknown",
      country:      cc || "ID",
      country_name: country_name || "Indonesia",
      org:          org || "Unknown ISP",
    }, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma":        "no-cache",
        "Expires":       "0",
      },
    });
  } catch (error) {
    console.error("IP route handler error:", error);
    return NextResponse.json({
      ip: "0.0.0.0",
      city: "Offline",
      country: "ID",
      country_name: "Indonesia",
      org: "Fallback Connection",
    }, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma":        "no-cache",
        "Expires":       "0",
      },
    });
  }
}
