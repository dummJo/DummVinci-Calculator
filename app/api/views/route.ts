import { NextResponse, type NextRequest } from "next/server";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const inc = searchParams.get("inc") === "true";
    
    // Use api.counterapi.dev to store universal views
    const endpoint = inc 
      ? "https://api.counterapi.dev/v1/dummvinci_tools/views/up"
      : "https://api.counterapi.dev/v1/dummvinci_tools/views";
      
    const res = await fetch(endpoint, {
      cache: "no-store",
    });
    
    if (!res.ok) {
      throw new Error(`CounterAPI returned status ${res.status}`);
    }
    
    const data = await res.json();
    return NextResponse.json({ count: data.count || 0 });
  } catch (error) {
    console.error("View counter API error:", error);
    return NextResponse.json({ count: 0 });
  }
}
