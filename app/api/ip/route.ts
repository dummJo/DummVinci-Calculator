import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function GET() {
  try {
    const headersList = await headers();
    
    // Extract client IP (supported by Vercel and standard proxies)
    const ip = headersList.get("x-forwarded-for")?.split(",")[0].trim() || 
               headersList.get("x-real-ip") || 
               "127.0.0.1";
               
    const country = headersList.get("x-vercel-ip-country") || "ID";
    const country_name = headersList.get("x-vercel-ip-country-name") || "Indonesia";
    const city = headersList.get("x-vercel-ip-city") || "Local Dev";
    const org = headersList.get("x-vercel-ip-org") || "PTTS Local Network";
    
    return NextResponse.json({
      ip,
      city,
      country,
      country_name,
      org
    });
  } catch (error) {
    console.error("IP route handler error:", error);
    return NextResponse.json({
      ip: "127.0.0.1",
      city: "Offline",
      country: "ID",
      country_name: "Indonesia",
      org: "Fallback Connection"
    });
  }
}
