import { vi, describe, it, expect, afterEach } from "vitest";

/**
 * El cerrojo decide si una tarea programada corre o se omite. Un fallo aquí es
 * silencioso y grave en las dos direcciones: de más, recordatorios de WhatsApp
 * duplicados al mismo cliente; de menos, un sistema que deja de purgar y de avisar
 * sin que nadie se entere.
 */

const cargarConRedis = async (redis: unknown) => {
  vi.resetModules();
  vi.doMock("../config/redis.js", () => ({ default: redis, redisConnectionOptions: {} }));
  return (await import("../utils/cronLock.js")).ejecutarConLock;
};

afterEach(() => {
  vi.resetModules();
  vi.doUnmock("../config/redis.js");
});

describe("ejecutarConLock", () => {
  it("ejecuta la tarea cuando adquiere el cerrojo", async () => {
    const set = vi.fn().mockResolvedValue("OK");
    const ejecutarConLock = await cargarConRedis({ set });
    const tarea = vi.fn().mockResolvedValue(undefined);

    await ejecutarConLock("sentinel", 840, tarea);

    expect(tarea).toHaveBeenCalledTimes(1);
    expect(set).toHaveBeenCalledWith(
      "volta:cron:lock:sentinel",
      expect.any(String),
      "EX",
      840,
      "NX"
    );
  });

  it("omite la tarea si otra instancia tiene el cerrojo", async () => {
    // Redis devuelve null cuando NX no puede fijar la clave.
    const ejecutarConLock = await cargarConRedis({ set: vi.fn().mockResolvedValue(null) });
    const tarea = vi.fn();

    await ejecutarConLock("sentinel", 840, tarea);

    expect(tarea).not.toHaveBeenCalled();
  });

  it("ejecuta igualmente si Redis falla: no quedarse sin purgas ni avisos", async () => {
    const ejecutarConLock = await cargarConRedis({
      set: vi.fn().mockRejectedValue(new Error("Redis no disponible")),
    });
    const tarea = vi.fn().mockResolvedValue(undefined);

    await ejecutarConLock("lopd-purge", 82800, tarea);

    expect(tarea).toHaveBeenCalledTimes(1);
  });

  it("ejecuta sin Redis configurado, como en el despliegue de una sola instancia", async () => {
    const ejecutarConLock = await cargarConRedis(null);
    const tarea = vi.fn().mockResolvedValue(undefined);

    await ejecutarConLock("demo-cleanup", 240, tarea);

    expect(tarea).toHaveBeenCalledTimes(1);
  });

  it("cada tarea usa su propia clave", async () => {
    const set = vi.fn().mockResolvedValue("OK");
    const ejecutarConLock = await cargarConRedis({ set });

    await ejecutarConLock("sentinel", 840, vi.fn());
    await ejecutarConLock("demo-cleanup", 240, vi.fn());

    expect(set.mock.calls[0][0]).toBe("volta:cron:lock:sentinel");
    expect(set.mock.calls[1][0]).toBe("volta:cron:lock:demo-cleanup");
  });

  it("propaga el fallo de la tarea, para que el cron lo registre", async () => {
    const ejecutarConLock = await cargarConRedis({ set: vi.fn().mockResolvedValue("OK") });

    await expect(
      ejecutarConLock("sentinel", 840, () => Promise.reject(new Error("fallo del sentinel")))
    ).rejects.toThrow("fallo del sentinel");
  });
});
