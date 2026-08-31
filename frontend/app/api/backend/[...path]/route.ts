import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { signToken } from "@/lib/crypto";
import type { Session } from "next-auth";

// Use db service name for backend inside Docker container, fallback to localhost for host development
const BACKEND_URL = process.env.BACKEND_INTERNAL_URL || "http://localhost:3001";

async function proxyRequest(
  request: NextRequest,
  { params }: { params: Promise<{ path: string[] }> }
) {
  const resolvedParams = await params;
  const pathParts = resolvedParams.path;

  // Validate path parts — only allow alphanumeric, hyphens, underscores
  for (const part of pathParts) {
    if (!/^[a-zA-Z0-9_\-]+$/.test(part)) {
      return NextResponse.json({ error: "Invalid path segment" }, { status: 400 });
    }
  }

  const path = pathParts.join("/");

  // Solo el flujo de consentimiento es público: GET /lopd/:id y las decisiones
  // del cliente (accept / reject). El resto de subrutas (p. ej. /lopd/:id/logs)
  // exigen sesión autenticada.
  const PUBLIC_LOPD_ACTIONS = ["accept", "reject"];
  const isPublicLopdRoute =
    pathParts[0] === "lopd" &&
    (pathParts.length === 2 || PUBLIC_LOPD_ACTIONS.includes(pathParts[2]));

  const isPublicRoute =
    isPublicLopdRoute ||
    pathParts[0] === "health" ||
    pathParts[0] === "demo" ||
    pathParts[0] === "public" ||
    pathParts[0] === "webhooks" ||
    (pathParts[0] === "users" && pathParts[1] === "register");

  let session: Session | null = null;
  if (!isPublicRoute) {
    session = await auth();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const isAdminRoute = pathParts[0] === "admin";
    if (isAdminRoute && session.user?.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden: Admin access required" }, { status: 403 });
    }
  }

  // Validate API_KEY and BACKEND_JWT_SECRET at request-time (not module-level) so Next.js build doesn't fail
  const apiKey = process.env.API_KEY;
  const jwtSecret = process.env.BACKEND_JWT_SECRET;
  if (!apiKey || !jwtSecret) {
    console.error("[Proxy] FATAL: API_KEY or BACKEND_JWT_SECRET environment variable is not set.");
    return NextResponse.json(
      { error: "Proxy misconfiguration: Secret keys not set." },
      { status: 503 }
    );
  }

  const { searchParams } = new URL(request.url);

  const destinationUrl = `${BACKEND_URL}/api/${path}?${searchParams.toString()}`;

  const method = request.method;
  const headers = new Headers();
  headers.set("Content-Type", "application/json");
  headers.set("x-api-key", apiKey);

  // El navegador nunca habla con el backend directamente: este proxy hace su
  // propio fetch. Sin reenviar estos dos valores, el backend registraría la IP
  // y el user-agent del servidor de Next en lugar de los del cliente, dejando
  // sin valor probatorio el log de consentimiento LOPD.
  // El backend solo los honra a través de su `trust proxy`, que cuenta con
  // exactamente este salto.
  const forwardedFor = request.headers.get("x-forwarded-for");
  if (forwardedFor) headers.set("x-forwarded-for", forwardedFor);

  const userAgent = request.headers.get("user-agent");
  if (userAgent) headers.set("user-agent", userAgent);

  // El portal público de reservas viaja con su propia credencial: el token que
  // el visitante recibe al verificar su teléfono por WhatsApp. Sin reenviarlo,
  // el backend vería todas las peticiones del portal como no verificadas.
  if (pathParts[0] === "public") {
    const bookingToken = request.headers.get("x-booking-token");
    if (bookingToken) headers.set("x-booking-token", bookingToken);
  }

  // Pass LOPD headers for consent routes
  if (pathParts[0] === "lopd") {
    const lopdToken = request.headers.get("x-lopd-token");
    const lopdExp = request.headers.get("x-lopd-exp");
    if (lopdToken) headers.set("x-lopd-token", lopdToken);
    if (lopdExp) headers.set("x-lopd-exp", lopdExp);
  }

  if (session?.user) {
    const payload = {
      id: session.user.id || null,
      role: session.user.role || null,
      businessId: session.user.businessId || null,
      email: session.user.email || null,
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 5 * 60, // 5 minutes expiration
    };
    const token = signToken(payload, jwtSecret);
    headers.set("Authorization", `Bearer ${token}`);
  }

  let body: string | undefined = undefined;
  if (method !== "GET" && method !== "HEAD") {
    try {
      body = await request.text();
    } catch (e) {
      // No body or error reading it
    }
  }

  // Tenant Isolation validation for non-admin users
  if (session && session.user?.role !== "ADMIN") {
    // 1. Check URL query params
    const queryBusinessId = searchParams.get("businessId");
    if (queryBusinessId && queryBusinessId !== session.user.businessId) {
      return NextResponse.json(
        { error: "Forbidden: Tenant isolation mismatch (query)" },
        { status: 403 }
      );
    }

    // 2. Check JSON request body
    if (body && typeof body === "string") {
      try {
        const parsedBody = JSON.parse(body);
        if (parsedBody?.businessId && parsedBody.businessId !== session.user.businessId) {
          return NextResponse.json(
            { error: "Forbidden: Tenant isolation mismatch (body)" },
            { status: 403 }
          );
        }
      } catch (e) {
        // Not JSON or parsing failed, ignore
      }
    }
  }

  let backendResponse: Response | null = null;
  let lastError: unknown = null;
  const maxRetries = 3;

  for (let attempt = 0; attempt < maxRetries; attempt++) {
    try {
      backendResponse = await fetch(destinationUrl, {
        method,
        headers,
        body,
      });

      // If backend returns 502, 503, or 504 (typical cold-start or gateway initialization), retry
      if (
        backendResponse.status === 502 ||
        backendResponse.status === 503 ||
        backendResponse.status === 504
      ) {
        if (attempt < maxRetries - 1) {
          await new Promise((resolve) => setTimeout(resolve, (attempt + 1) * 600));
          continue;
        }
      }

      break;
    } catch (error) {
      lastError = error;
      if (attempt < maxRetries - 1) {
        await new Promise((resolve) => setTimeout(resolve, (attempt + 1) * 600));
      }
    }
  }

  if (!backendResponse) {
    console.error(
      `[Proxy Error] Error al conectar con ${destinationUrl} tras ${maxRetries} intentos:`,
      lastError
    );
    return NextResponse.json({ error: "Error interno en el servidor proxy." }, { status: 500 });
  }

  try {
    const contentType = backendResponse.headers.get("content-type") || "application/json";
    if (contentType.includes("application/json")) {
      const responseData: Record<string, unknown> = await backendResponse.json();
      return NextResponse.json(responseData, { status: backendResponse.status });
    } else {
      const responseData = await backendResponse.text();
      return new Response(responseData, {
        status: backendResponse.status,
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "X-Content-Type-Options": "nosniff",
        },
      });
    }
  } catch (error) {
    console.error(`[Proxy Error] Error al procesar respuesta de ${destinationUrl}:`, error);
    return NextResponse.json(
      { error: "Error al procesar la respuesta del servidor." },
      { status: 500 }
    );
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

export async function DELETE(
  request: NextRequest,
  context: { params: Promise<{ path: string[] }> }
) {
  return proxyRequest(request, context);
}
