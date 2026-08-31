import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { useBookingSession, type BookingSession } from "./useBookingSession";

const BUSINESS_ID = "biz-1";
const KEY = `volta:booking:${BUSINESS_ID}`;

const session = (overrides: Partial<BookingSession> = {}): BookingSession => ({
  token: "token-abc",
  expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(),
  identity: { phone: "600112233", name: "Ana García" },
  ...overrides,
});

describe("useBookingSession", () => {
  beforeEach(() => {
    window.sessionStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("starts unverified when there is nothing stored", async () => {
    const { result } = renderHook(() => useBookingSession(BUSINESS_ID));

    await waitFor(() => expect(result.current.isRestoring).toBe(false));
    expect(result.current.isVerified).toBe(false);
    expect(result.current.identity).toBeNull();
  });

  it("keeps the session across remounts of the page", async () => {
    const { result, unmount } = renderHook(() => useBookingSession(BUSINESS_ID));
    await waitFor(() => expect(result.current.isRestoring).toBe(false));

    act(() => result.current.startSession(session()));
    unmount();

    const remounted = renderHook(() => useBookingSession(BUSINESS_ID));
    await waitFor(() => expect(remounted.result.current.isRestoring).toBe(false));

    expect(remounted.result.current.isVerified).toBe(true);
    expect(remounted.result.current.identity).toEqual({ phone: "600112233", name: "Ana García" });
  });

  it("ignores a stored session that has already expired", async () => {
    window.sessionStorage.setItem(
      KEY,
      JSON.stringify(session({ expiresAt: new Date(Date.now() - 1000).toISOString() }))
    );

    const { result } = renderHook(() => useBookingSession(BUSINESS_ID));
    await waitFor(() => expect(result.current.isRestoring).toBe(false));

    expect(result.current.isVerified).toBe(false);
  });

  it("ignores a corrupted stored value instead of crashing the portal", async () => {
    window.sessionStorage.setItem(KEY, "{no-es-json");

    const { result } = renderHook(() => useBookingSession(BUSINESS_ID));
    await waitFor(() => expect(result.current.isRestoring).toBe(false));

    expect(result.current.isVerified).toBe(false);
  });

  it("does not read the session of another business", async () => {
    window.sessionStorage.setItem(KEY, JSON.stringify(session()));

    const { result } = renderHook(() => useBookingSession("otro-negocio"));
    await waitFor(() => expect(result.current.isRestoring).toBe(false));

    expect(result.current.isVerified).toBe(false);
  });

  it("sends the token on every authenticated request", async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response("{}", { status: 200 }));
    vi.stubGlobal("fetch", fetchMock);

    const { result } = renderHook(() => useBookingSession(BUSINESS_ID));
    await waitFor(() => expect(result.current.isRestoring).toBe(false));
    act(() => result.current.startSession(session()));

    await act(async () => {
      await result.current.authFetch("/api/backend/public/booking/biz-1");
    });

    const [, init] = fetchMock.mock.calls[0];
    expect((init.headers as Headers).get("x-booking-token")).toBe("token-abc");
  });

  it("drops the session when the backend answers 401", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(new Response("{}", { status: 401 })));

    const { result } = renderHook(() => useBookingSession(BUSINESS_ID));
    await waitFor(() => expect(result.current.isRestoring).toBe(false));
    act(() => result.current.startSession(session()));
    expect(result.current.isVerified).toBe(true);

    await act(async () => {
      await result.current.authFetch("/api/backend/public/booking/biz-1");
    });

    expect(result.current.isVerified).toBe(false);
    expect(window.sessionStorage.getItem(KEY)).toBeNull();
  });

  it("survives a browser that blocks storage", async () => {
    vi.spyOn(Storage.prototype, "setItem").mockImplementation(() => {
      throw new DOMException("denied");
    });

    const { result } = renderHook(() => useBookingSession(BUSINESS_ID));
    await waitFor(() => expect(result.current.isRestoring).toBe(false));

    act(() => result.current.startSession(session()));

    // La sesión sigue viva en memoria aunque no se haya podido persistir.
    expect(result.current.isVerified).toBe(true);
  });
});
