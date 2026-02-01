import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/api-proxy";

// Handle GET requests for dashboard stats
async function handler(request: NextRequest) {
  // Pass "dashboard" as endpoint, empty path parts
  return proxyRequest(request, "dashboard", []);
}

export const GET = handler;
