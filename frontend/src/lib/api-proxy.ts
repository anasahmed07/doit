import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";

const BACKEND_URL = process.env.BACKEND_URL || process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const API_PREFIX = "/api/v1";

export async function proxyRequest(
  request: NextRequest,
  endpoint: string, // e.g., "notes", "projects"
  pathParts: string[] = [] // e.g., ["1", "media"]
) {
  const cookieStore = await cookies();
  // Try to find the token in cookies. better-auth typically uses "better-auth.session_token"
  // or checks for a token in the session.
  // The client side api.ts was doing `authClient.token()`.
  // We'll try to get the session token from cookies.
  // We can also forward all cookies to be safe, or specific ones.
  // But the backend expects "Authorization: Bearer <token>".

  // Attempt to get token from cookies
  // In production (HTTPS), cookies may have "__Secure-" prefix added by the browser
  const token = cookieStore.get("__Secure-better-auth.session_token")?.value ||
                cookieStore.get("better-auth.session_token")?.value ||
                cookieStore.get("session_token")?.value;

  // Debug: log all available cookies (names only)
  const allCookies = cookieStore.getAll();
  console.log("[api-proxy] Available cookies:", allCookies.map(c => c.name));
  console.log("[api-proxy] Token found:", token ? `${token.substring(0, 10)}...` : "NONE");

  const path = pathParts.join("/");
  // Construct URL: BACKEND_URL/api/v1/endpoint/path
  // Avoid double slashes if path is empty
  const url = path
    ? `${BACKEND_URL}${API_PREFIX}/${endpoint}/${path}`
    : `${BACKEND_URL}${API_PREFIX}/${endpoint}/`;

  // Copy search params
  const searchParams = request.nextUrl.searchParams.toString();
  const finalUrl = searchParams ? `${url}?${searchParams}` : url;

  const headers = new Headers(request.headers);
  // Remove host header to avoid issues
  headers.delete("host");
  headers.delete("connection");
  headers.delete("content-length");

  // Set Authorization header if token exists
  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  // Forward the request
  console.log(`[api-proxy] ${request.method} ${finalUrl} (auth: ${token ? "yes" : "no"})`);

  try {
    const body = request.method !== "GET" && request.method !== "HEAD"
      ? await request.blob()
      : undefined;

    const response = await fetch(finalUrl, {
      method: request.method,
      headers: headers,
      body: body,
      // redirect: "manual", // Don't follow redirects automatically if not desired
    });

    console.log(`[api-proxy] Response: ${response.status} ${response.statusText}`);

    // Create response to return to frontend
    const responseBody = await response.blob();
    const responseHeaders = new Headers(response.headers);

    // Clean up headers that might cause issues
    responseHeaders.delete("content-encoding");
    responseHeaders.delete("content-length");

    return new NextResponse(responseBody, {
      status: response.status,
      statusText: response.statusText,
      headers: responseHeaders,
    });
  } catch (error) {
    console.error("Proxy error:", error);
    return NextResponse.json(
      { error: "Internal Server Error", details: String(error) },
      { status: 500 }
    );
  }
}
