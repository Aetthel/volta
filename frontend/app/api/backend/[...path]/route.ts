import { NextRequest, NextResponse } from "next/server";

// Use db service name for backend inside Docker container, fallback to localhost for host development
const BACKEND_URL = process.env.BACKEND_INTERNAL_URL || "http://localhost:3001";

async function proxyRequest(request: NextRequest, { params }: { params: Promise<{ path: string[] }> }) {
  // Validate API_KEY at request-time (not module-level) so Next.js build doesn't fail
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("[Proxy] FATAL: API_KEY environment variable is not set.");
    return NextResponse.json({ error: "Proxy misconfiguration: API_KEY not set." }, { status: 503 });
  }

  const resolvedParams = await params;
  const path = resolvedParams.path.join("/");
  const { searchParams } = new URL(request.url);

  const destinationUrl = `${BACKEND_URL}/api/${path}?${searchParams.toString()}`;

  const method = request.method;
  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  headers.set("x-api-key", apiKey);

  let body: any = undefined;
  if (method !== "GET" && method !== "HEAD") {
    try {
      body = await request.text();
    } catch (e) {
      // No body or error reading it
    }
  }

  try {
    const backendResponse = await fetch(destinationUrl, {
      method,
      headers,
      body,
    });

    const contentType = backendResponse.headers.get("content-type");
    let responseData: any;
    if (contentType && contentType.includes("application/json")) {
      responseData = await backendResponse.json();
      return NextResponse.json(responseData, { status: backendResponse.status });
    } else {
      responseData = await backendResponse.text();
      return new Response(responseData, {
        status: backendResponse.status,
        headers: { "Content-Type": contentType || "text/plain" },
      });
    }
  } catch (error) {
    console.error(`[Proxy Error] Failed to proxy ${method} to ${destinationUrl}:`, error);
    return NextResponse.json({ error: "Internal Server Error in Frontend Proxy" }, { status: 500 });
  }
}

export async function GET(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(request, context);
}

export async function POST(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(request, context);
}

export async function PUT(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(request, context);
}

export async function DELETE(request: NextRequest, context: { params: Promise<{ path: string[] }> }) {
  return proxyRequest(request, context);
}
