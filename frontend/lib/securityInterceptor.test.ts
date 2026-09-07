import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

const { mockSignOut } = vi.hoisted(() => ({
  mockSignOut: vi.fn(),
}));

vi.mock("next-auth/react", () => ({
  signOut: mockSignOut,
  useSession: vi.fn(),
}));

import { setupSecurityInterceptor, resetSecurityInterceptorForTesting } from "./securityInterceptor";

describe("securityInterceptor", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    mockSignOut.mockClear();
    if (typeof resetSecurityInterceptorForTesting === "function") {
      resetSecurityInterceptorForTesting();
    }
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("should trigger signOut when a protected endpoint responds with 401 Unauthorized", async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: "Unauthorized", code: "UNAUTHORIZED" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    );
    window.fetch = mockFetch;

    setupSecurityInterceptor();

    const res = await window.fetch("/api/backend/alerts");
    expect(res.status).toBe(401);
    expect(mockSignOut).toHaveBeenCalledWith({ callbackUrl: "/login" });
  });

  it("should trigger signOut when response code is SESSION_ORPHANED", async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      new Response(
        JSON.stringify({
          error: "Negocio no encontrado o sesión expirada.",
          code: "SESSION_ORPHANED",
          redirect: "/",
        }),
        {
          status: 401,
          headers: { "Content-Type": "application/json" },
        }
      )
    );
    window.fetch = mockFetch;

    setupSecurityInterceptor();

    await window.fetch("/api/backend/appointments");
    expect(mockSignOut).toHaveBeenCalledWith({ callbackUrl: "/login" });
  });

  it("should trigger signOut when response code is TRIAL_EXPIRED or PERMISSIONS_REVOKED", async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: "Prueba expirada", code: "TRIAL_EXPIRED" }), {
        status: 403,
        headers: { "Content-Type": "application/json" },
      })
    );
    window.fetch = mockFetch;

    setupSecurityInterceptor();

    await window.fetch("/api/backend/services");
    expect(mockSignOut).toHaveBeenCalledWith({ callbackUrl: "/login" });
  });

  it("should NOT trigger signOut on public endpoints like /api/backend/public or /api/auth", async () => {
    const mockFetch = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ error: "Not authorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    );
    window.fetch = mockFetch;

    setupSecurityInterceptor();

    await window.fetch("/api/backend/public/booking/biz-1");
    expect(mockSignOut).not.toHaveBeenCalled();

    await window.fetch("/api/auth/session");
    expect(mockSignOut).not.toHaveBeenCalled();
  });
});
