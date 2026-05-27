import { NextResponse } from "next/server";
import { headers } from "next/headers";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const headersList = await headers();
    
    // Extract client IP (supported by Vercel and standard proxies)
    let ip = headersList.get("x-forwarded-for")?.split(",")[0].trim() || 
             headersList.get("x-real-ip") || 
             "";

    // Clean IPv6 prefix for IPv4-mapped addresses (e.g. ::ffff:127.0.0.1)
    if (ip.startsWith("::ffff:")) {
      ip = ip.substring(7);
    }

    const isLocal = !ip || 
                    ip === "127.0.0.1" || 
                    ip === "::1" || 
                    ip === "localhost" || 
                    ip.startsWith("192.168.") || 
                    ip.startsWith("10.") || 
                    ip.startsWith("172.");

    // Define fallback geolocation values
    let city = headersList.get("x-vercel-ip-city") || "Local Dev";
    let country = headersList.get("x-vercel-ip-country") || "ID";
    let country_name = headersList.get("x-vercel-ip-country-name") || "Indonesia";
    let org = headersList.get("x-vercel-ip-org") || "Local Network";

    // Attempt to query free GeoIP API (ip-api.com) from server-side
    // This allows us to fetch the exact ISP provider (e.g., Indihome, Biznet, Telkomsel) 
    // and correctly resolves local development requests using the server's public gateway IP.
    try {
      const url = isLocal ? "http://ip-api.com/json/" : `http://ip-api.com/json/${ip}`;
      const res = await fetch(url, { 
        cache: "no-store",
        signal: AbortSignal.timeout(3000) 
      });
      if (res.ok) {
        const data = await res.json();
        if (data && data.status === "success") {
          ip = data.query || ip || "127.0.0.1";
          city = data.city || city;
          country = data.countryCode || country;
          country_name = data.country || country_name;
          org = data.isp || data.org || org;
        }
      }
    } catch (e) {
      console.warn("Could not fetch details from ip-api.com, falling back to headers:", e);
    }

    return NextResponse.json({
      ip: ip || "127.0.0.1",
      city,
      country,
      country_name,
      org
    }, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      }
    });
  } catch (error) {
    console.error("IP route handler error:", error);
    return NextResponse.json({
      ip: "127.0.0.1",
      city: "Offline",
      country: "ID",
      country_name: "Indonesia",
      org: "Fallback Connection"
    }, {
      headers: {
        "Cache-Control": "no-store, no-cache, must-revalidate, proxy-revalidate",
        "Pragma": "no-cache",
        "Expires": "0"
      }
    });
  }
}
