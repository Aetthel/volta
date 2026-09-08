import { describe, it, expect, beforeEach, vi, afterEach } from "vitest";
import { apiClient } from "./apiClient";
import { _resetCache } from "./apiCache";

const respuesta = (body: unknown) =>
  new Response(JSON.stringify(body), {
    status: 200,
    headers: { "content-type": "application/json" },
  });

describe("apiClient: integración con la caché", () => {
  beforeEach(() => {
    _resetCache();
    vi.stubGlobal("fetch", vi.fn(async () => respuesta([{ id: "s1" }])));
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("una segunda lectura del mismo conjunto no vuelve a la red", async () => {
    await apiClient.services.getAll("b-1");
    await apiClient.services.getAll("b-1");

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("dos componentes pidiendo a la vez comparten una sola petición", async () => {
    // Sidebar y la página de inicio piden el negocio en la misma carga.
    await Promise.all([apiClient.business.getById("b-1"), apiClient.business.getById("b-1")]);

    expect(fetch).toHaveBeenCalledTimes(1);
  });

  it("negocios distintos no comparten entrada", async () => {
    await apiClient.services.getAll("b-1");
    await apiClient.services.getAll("b-2");

    expect(fetch).toHaveBeenCalledTimes(2);
  });

  it("una escritura invalida las lecturas cacheadas", async () => {
    await apiClient.services.getAll("b-1");
    await apiClient.services.create({ name: "Corte" });
    await apiClient.services.getAll("b-1");

    // lectura + escritura + relectura
    expect(fetch).toHaveBeenCalledTimes(3);
  });

  it("los sondeos quedan fuera de la caché", async () => {
    await apiClient.whatsapp.getStatus("b-1");
    await apiClient.whatsapp.getStatus("b-1");
    await apiClient.get("/alerts");
    await apiClient.get("/alerts");

    expect(fetch).toHaveBeenCalledTimes(4);
  });
});
