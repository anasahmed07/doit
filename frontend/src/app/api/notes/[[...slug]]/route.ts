import { NextRequest } from "next/server";
import { proxyRequest } from "@/lib/api-proxy";

// Handle all methods (GET, POST, PUT, DELETE, PATCH, etc.)
async function handler(
  request: NextRequest,
  { params }: { params: Promise<{ slug?: string[] }> }
) {
  const { slug } = await params;
  return proxyRequest(request, "notes", slug);
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const PATCH = handler;
export const DELETE = handler;
