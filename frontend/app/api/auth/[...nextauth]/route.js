import { handlers } from "@/auth";
import { checkRateLimit, resetRateLimit } from "@/lib/rateLimit";

async function rateLimitedPost(request) {
  const forwarded = request.headers.get("x-forwarded-for");
  const ip = forwarded?.split(",")[0]?.trim() || "unknown";

  const { allowed, remaining, retryAfter } = checkRateLimit(`login:${ip}`);

  if (!allowed) {
    return new Response(
      JSON.stringify({ error: `Demasiados intentos. Inténtalo de nuevo en ${retryAfter} segundos.` }),
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

  let loginSuccess = false;
  if (response.status === 302) {
    const location = response.headers.get("Location");
    const isErrorRedirect = location && (location.includes("error=") || location.includes("/login?"));
    if (!isErrorRedirect) {
      loginSuccess = true;
    }
  } else if (response.status === 200) {
    const contentType = response.headers.get("content-type");
    if (contentType && contentType.includes("application/json")) {
      try {
        const data = await response.clone().json();
        if (data && !data.error && data.ok !== false) {
          loginSuccess = true;
        }
      } catch (e) {
        // Ignored: fallback or ignore JSON parse errors
      }
    } else {
      loginSuccess = true;
    }
  }

  if (loginSuccess) {
    resetRateLimit(`login:${ip}`);
  }

  return response;
}

export const GET = handlers.GET;
export const POST = rateLimitedPost;
