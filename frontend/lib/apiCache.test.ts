import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { leerConCache, invalidarCache, _resetCache } from "./apiCache";

describe("apiCache", () => {
  beforeEach(() => {
    _resetCache();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("sirve de caché la segunda lectura dentro del TTL", async () => {
    const ejecutar = vi.fn().mockResolvedValue({ data: [1, 2], status: 200 });

    const a = await leerConCache("k", ejecutar);
    const b = await leerConCache("k", ejecutar);

    expect(ejecutar).toHaveBeenCalledTimes(1);
    expect(b).toBe(a);
  });

  it("vuelve a la red pasado el TTL", async () => {
    const ejecutar = vi.fn().mockResolvedValue({ data: [1], status: 200 });

    await leerConCache("k", ejecutar);
    vi.advanceTimersByTime(10_001);
    await leerConCache("k", ejecutar);

    expect(ejecutar).toHaveBeenCalledTimes(2);
  });

  it("comparte una petición ya en vuelo en lugar de lanzar dos", async () => {
    // Es el caso de Sidebar y la página pidiendo el negocio en el mismo tick.
    let resolver: (v: unknown) => void = () => {};
    const ejecutar = vi.fn(() => new Promise((r) => (resolver = r)));

    const p1 = leerConCache("k", ejecutar);
    const p2 = leerConCache("k", ejecutar);
    resolver({ data: "x", status: 200 });

    expect(ejecutar).toHaveBeenCalledTimes(1);
    expect(await p1).toEqual(await p2);
  });

  it("no cachea respuestas con error: repetirlo durante 10 s dejaría la pantalla clavada", async () => {
    const ejecutar = vi
      .fn()
      .mockResolvedValueOnce({ error: "Error de conexión", status: 500 })
      .mockResolvedValueOnce({ data: [1], status: 200 });

    const primera = await leerConCache("k", ejecutar);
    const segunda = await leerConCache("k", ejecutar);

    expect(primera).toEqual({ error: "Error de conexión", status: 500 });
    expect(segunda).toEqual({ data: [1], status: 200 });
    expect(ejecutar).toHaveBeenCalledTimes(2);
  });

  it("invalidarCache fuerza a releer", async () => {
    const ejecutar = vi.fn().mockResolvedValue({ data: [1], status: 200 });

    await leerConCache("k", ejecutar);
    invalidarCache();
    await leerConCache("k", ejecutar);

    expect(ejecutar).toHaveBeenCalledTimes(2);
  });

  it("distingue claves distintas", async () => {
    const a = vi.fn().mockResolvedValue({ data: "a", status: 200 });
    const b = vi.fn().mockResolvedValue({ data: "b", status: 200 });

    expect(await leerConCache("k1", a)).toEqual({ data: "a", status: 200 });
    expect(await leerConCache("k2", b)).toEqual({ data: "b", status: 200 });
    expect(a).toHaveBeenCalledTimes(1);
    expect(b).toHaveBeenCalledTimes(1);
  });

  it("libera la petición en vuelo aunque falle, para no dejar la clave bloqueada", async () => {
    const falla = vi.fn().mockRejectedValue(new Error("boom"));
    await expect(leerConCache("k", falla)).rejects.toThrow("boom");

    const ok = vi.fn().mockResolvedValue({ data: [1], status: 200 });
    await leerConCache("k", ok);

    expect(ok).toHaveBeenCalledTimes(1);
  });
});
