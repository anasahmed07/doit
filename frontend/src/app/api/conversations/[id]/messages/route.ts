import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const MCP_URL = process.env.NEXT_PUBLIC_MCP_URL || "http://localhost:8080";

async function getToken() {
  const cookieStore = await cookies();
  return (
    cookieStore.get("__Secure-better-auth.session_token")?.value ||
    cookieStore.get("better-auth.session_token")?.value ||
    cookieStore.get("session_token")?.value
  );
}

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const token = await getToken();
  if (!token) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const response = await fetch(
      `${MCP_URL}/api/conversations/${id}/messages`,
      { headers: { Authorization: `Bearer ${token}` } }
    );

    if (response.status === 401) {
      return NextResponse.json({ error: "Session expired" }, { status: 401 });
    }

    const data = await response.json();
    return NextResponse.json(data, { status: response.status });
  } catch {
    return NextResponse.json({ error: "Chat service unavailable" }, { status: 503 });
  }
}
