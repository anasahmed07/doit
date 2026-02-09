import { NextRequest } from "next/server";
import { cookies } from "next/headers";

const MCP_URL = process.env.MCP_URL || process.env.NEXT_PUBLIC_MCP_URL || "http://localhost:8080";

export async function POST(request: NextRequest) {
  const cookieStore = await cookies();
  const token =
    cookieStore.get("__Secure-better-auth.session_token")?.value ||
    cookieStore.get("better-auth.session_token")?.value ||
    cookieStore.get("session_token")?.value;

  if (!token) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), {
      status: 401,
      headers: { "Content-Type": "application/json" },
    });
  }

  const body = await request.json();

  let response: Response;
  try {
    response = await fetch(`${MCP_URL}/api/chat`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(body),
    });
  } catch {
    return new Response(
      JSON.stringify({ error: "Chat service unavailable" }),
      { status: 503, headers: { "Content-Type": "application/json" } }
    );
  }

  if (response.status === 401) {
    return new Response(
      JSON.stringify({ error: "Session expired. Please sign in again." }),
      { status: 401, headers: { "Content-Type": "application/json" } }
    );
  }

  if (!response.ok) {
    return new Response(
      JSON.stringify({ error: "MCP service error", status: response.status }),
      { status: response.status, headers: { "Content-Type": "application/json" } }
    );
  }

  // Stream the SSE response back to the client
  return new Response(response.body, {
    status: 200,
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
