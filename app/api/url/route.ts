import { Resource } from "sst";
import { NextResponse } from "next/server";

export async function GET() {
  let apiUrl: string = "";
  let error: string | null = null;

  try {
    // Direct access to SST Resource - this should work in API routes
    apiUrl = Resource.AutopruneApi.url;
  } catch (err: any) {
    // If direct access fails, try environment variables
    // SST v3 might inject these differently
    const envVars = [
      process.env.SST_RESOURCE_AutopruneApi_url,
      process.env.NEXT_PUBLIC_AUTOPRUNE_API_URL,
      // Check all possible SST environment variable patterns
      ...Object.keys(process.env)
        .filter(key => key.includes("AutopruneApi") || key.includes("AUTOPRUNE"))
        .map(key => process.env[key])
    ].filter(Boolean);
    
    apiUrl = envVars[0] || "";
    
    if (!apiUrl) {
      error = `SST Resource not available. Error: ${err?.message || "Unknown error"}. Make sure you're running 'sst dev' and the resources are deployed.`;
      console.error("SST Resource access error:", err);
      console.log("Available env vars with 'SST' or 'AUTOPRUNE':", 
        Object.keys(process.env).filter(k => k.includes("SST") || k.includes("AUTOPRUNE")));
    }
  }

  return NextResponse.json({ 
    url: apiUrl,
    ...(error && { error }),
    debug: {
      hasResource: typeof Resource !== "undefined",
      hasAutopruneApi: typeof Resource !== "undefined" && typeof Resource.AutopruneApi !== "undefined"
    }
  });
}

