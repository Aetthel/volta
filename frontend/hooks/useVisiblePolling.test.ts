import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import { renderHook } from "@testing-library/react";
import { useVisiblePolling } from "./useVisiblePolling";

/** Cambia `document.visibilityState` y dispara el evento, como haría el navegador. */
const setVisibilidad = (estado: DocumentVisibilityState) => {
  Object.defineProperty(document, "visibilityState", {
    configurable: true,
    get: () => estado,
  });
  document.dispatchEvent(new Event("visibilitychange"));
};

describe("useVisiblePolling", () => {
  beforeEach(() => {
    vi.useFakeTimers();
    setVisibilidad("visible");
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("ejecuta al montar y luego en cada intervalo", () => {
    const cb = vi.fn();
    renderHook(() => useVisiblePolling(cb, 1000));

    expect(cb).toHaveBeenCalledTimes(1); // inmediata
    vi.advanceTimersByTime(3000);
    expect(cb).toHaveBeenCalledTimes(4);
  });

  it("deja de sondear mientras la pestaña está oculta", () => {
    const cb = vi.fn();
    renderHook(() => useVisiblePolling(cb, 1000));
    cb.mockClear();

    setVisibilidad("hidden");
    vi.advanceTimersByTime(10_000);

    expect(cb).not.toHaveBeenCalled();
  });

  it("al volver a la pestaña ejecuta de inmediato, sin esperar al siguiente tick", () => {
    const cb = vi.fn();
    renderHook(() => useVisiblePolling(cb, 1000));
    setVisibilidad("hidden");
    vi.advanceTimersByTime(5000);
    cb.mockClear();

    setVisibilidad("visible");

    expect(cb).toHaveBeenCalledTimes(1);
  });

  it("reanuda el intervalo al volver", () => {
    const cb = vi.fn();
    renderHook(() => useVisiblePolling(cb, 1000));
    setVisibilidad("hidden");
    setVisibilidad("visible");
    cb.mockClear();

    vi.advanceTimersByTime(2000);

    expect(cb).toHaveBeenCalledTimes(2);
  });

  it("no duplica el intervalo si se vuelve visible dos veces", () => {
    const cb = vi.fn();
    renderHook(() => useVisiblePolling(cb, 1000));
    setVisibilidad("visible");
    setVisibilidad("visible");
    cb.mockClear();

    vi.advanceTimersByTime(1000);

    expect(cb).toHaveBeenCalledTimes(1);
  });

  it("no hace nada cuando está deshabilitado", () => {
    const cb = vi.fn();
    renderHook(() => useVisiblePolling(cb, 1000, false));

    vi.advanceTimersByTime(5000);

    expect(cb).not.toHaveBeenCalled();
  });

  it("limpia el intervalo y el listener al desmontar", () => {
    const cb = vi.fn();
    const { unmount } = renderHook(() => useVisiblePolling(cb, 1000));
    unmount();
    cb.mockClear();

    vi.advanceTimersByTime(5000);
    setVisibilidad("visible");

    expect(cb).not.toHaveBeenCalled();
  });

  it("cambiar la identidad del callback no reinicia el intervalo", () => {
    let actual = vi.fn();
    const { rerender } = renderHook(({ fn }) => useVisiblePolling(fn, 1000), {
      initialProps: { fn: actual },
    });

    vi.advanceTimersByTime(900);
    const siguiente = vi.fn();
    actual = siguiente;
    rerender({ fn: siguiente });

    // Si el efecto se hubiera reiniciado, el temporizador volvería a empezar y
    // este avance de 100 ms no dispararía nada.
    vi.advanceTimersByTime(100);
    expect(siguiente).toHaveBeenCalledTimes(1);
  });
});
