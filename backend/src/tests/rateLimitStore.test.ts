import { vi, describe, it, expect, afterEach } from "vitest";
import request from "supertest";

/**
 * El limitador pasó de un contador en memoria del proceso a uno en Redis. Redis se
 * configura con `offlineQueue: false`, así que cuando no está disponible los
 * comandos fallan de inmediato en lugar de esperar. Sin `passOnStoreError`, ese
 * fallo se propagaría y cada petición acabaría en 500: el limitador dejaría de
 * proteger Y tumbaría la API entera.
 *
 * Estos tests montan la app con un Redis roto para fijar que eso no ocurre.
 */

afterEach(() => {
  vi.resetModules();
  vi.unstubAllEnvs();
  vi.doUnmock("../config/redis.js");
});

const montarAppConRedis = async (call: () => Promise<unknown>) => {
  vi.resetModules();
  vi.doMock("../config/redis.js", () => ({
    default: { call, on: () => {}, quit: async () => {} },
    redisConnectionOptions: {},
  }));
  const { default: app } = await import("../index.js");
  return app;
};

describe("limitador con almacén en Redis", () => {
  it("deja pasar la petición si Redis falla, en lugar de responder 500", async () => {
    const call = vi.fn().mockRejectedValue(new Error("Redis no disponible"));
    const app = await montarAppConRedis(call);

    const res = await request(app).get("/api/public/booking/biz-1/profile");

    // Puede ser 404 o el que devuelva el controlador, pero nunca un 500 provocado
    // por el almacén del limitador.
    expect(res.statusCode).not.toBe(500);
    expect(call).toHaveBeenCalled();
  });

  it("usa Redis para contar cuando está disponible", async () => {
    // La respuesta que espera rate-limit-redis del script: [contador, ttl].
    const call = vi.fn().mockResolvedValue([1, 900000]);
    const app = await montarAppConRedis(call);

    const res = await request(app).get("/api/public/booking/biz-1/profile");

    expect(call).toHaveBeenCalled();
    expect(res.statusCode).not.toBe(500);
  });

  it("sin Redis cae al almacén en memoria y la app sigue sirviendo", async () => {
    vi.resetModules();
    vi.doMock("../config/redis.js", () => ({
      default: null,
      redisConnectionOptions: {},
    }));
    const { default: app } = await import("../index.js");
    const { default: prisma } = await import("../config/db.js");
    vi.spyOn(prisma, "$queryRaw").mockResolvedValue([{ 1: 1 }] as never);

    const res = await request(app).get("/health");

    expect(res.statusCode).toBe(200);
    expect(res.body.services.database).toBe("connected");
  });
});
