import { handlers } from "@/auth";
import { checkRateLimit, resetRateLimit } from "@/lib/rateLimit";
import { NextRequest } from "next/server";

async function rateLimitedPost(request: NextRequest) {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "unknown";

  const { allowed, retryAfter } = checkRateLimit(`login:${ip}`);

  if (!allowed) {
    return new Response(
      JSON.stringify({
        error: `Demasiados intentos. Inténtalo de nuevo en ${retryAfter} segundos.`,
      }),
      {
        status: 429,
        headers: {
          "Content-Type": "application/json",
          "Retry-After": String(retryAfter),
          "X-RateLimit-Limit": "5",
          "X-RateLimit-Remaining": "0",
        },
      }
    );
  }

  const response = await handlers.POST(request);

  // Check if a new valid session cookie was actually assigned (ignore deletion/invalidation cookies)
  const setCookieHeader = response.headers.get("set-cookie") || "";
  const setCookies = typeof response.headers.getSetCookie === "function"
    ? response.headers.getSetCookie()
    : [setCookieHeader];

  const isValidSessionCreated = setCookies.some((cookie: string) => {
    const lower = cookie.toLowerCase();
    const isSession = lower.includes("session-token=");
    const isCleared =
      lower.includes("max-age=0") ||
      lower.includes("expires=thu, 01 jan 1970") ||
      lower.includes("session-token=;");
    return isSession && !isCleared;
  });

  if ((response.status === 200 || response.status === 302) && isValidSessionCreated) {
    resetRateLimit(`login:${ip}`);
  }

  return response;
}

export const GET = handlers.GET;
export const POST = rateLimitedPost;
