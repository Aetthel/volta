import { describe, it, expect } from "vitest";
import { gunzipSync } from "node:zlib";
import { jsonResponseComprimida } from "./httpCompression";

const filas = (n: number) =>
  Array.from({ length: n }, (_, i) => ({
    id: `appt-${i}`,
    clientName: "Ana García",
    serviceName: "Corte y peinado",
  }));

describe("jsonResponseComprimida", () => {
  it("comprime cuando el cliente lo admite y el cuerpo lo justifica", async () => {
    const datos = filas(200);
    const res = await jsonResponseComprimida(datos, 200, "gzip, deflate, br");

    expect(res.headers.get("content-encoding")).toBe("gzip");
    expect(res.headers.get("vary")).toBe("Accept-Encoding");

    const comprimido = Buffer.from(await res.arrayBuffer());
    expect(comprimido.byteLength).toBeLessThan(JSON.stringify(datos).length / 4);

    // El cuerpo debe reconstruirse exactamente, acentos incluidos.
    expect(JSON.parse(gunzipSync(comprimido).toString("utf8"))).toEqual(datos);
  });

  it("no comprime si el cliente no lo admite", async () => {
    const res = await jsonResponseComprimida(filas(200), 200, null);

    expect(res.headers.get("content-encoding")).toBeNull();
    expect(await res.json()).toEqual(filas(200));
  });

  it("no comprime cuerpos por debajo del umbral", async () => {
    const res = await jsonResponseComprimida({ ok: true }, 200, "gzip");

    expect(res.headers.get("content-encoding")).toBeNull();
    expect(await res.json()).toEqual({ ok: true });
  });

  it("conserva el status del backend", async () => {
    const res = await jsonResponseComprimida({ error: "No autorizado" }, 401, "gzip");
    expect(res.status).toBe(401);
  });

  it("anuncia Vary incluso sin comprimir, para no envenenar cachés intermedias", async () => {
    const res = await jsonResponseComprimida({ ok: true }, 200, null);
    expect(res.headers.get("vary")).toBe("Accept-Encoding");
  });
});
