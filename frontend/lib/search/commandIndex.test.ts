import { describe, expect, it } from "vitest";
import {
  buildCommandIndex,
  getFeaturedEntries,
  groupResults,
  searchCommands,
} from "./commandIndex";

const jefe = buildCommandIndex({ role: "JEFE", businessId: "biz-1" });

/** Ids de los resultados de buscar `query` como jefe de negocio. */
function idsFor(query: string): string[] {
  return searchCommands(jefe, query).map((result) => result.entry.id);
}

describe("buildCommandIndex", () => {
  it("oculta al empleado lo que solo puede tocar el jefe", () => {
    const empleado = buildCommandIndex({ role: "EMPLEADO", businessId: "biz-1" });
    const ids = empleado.map((entry) => entry.id);

    expect(ids).not.toContain("negocio-servicios");
    expect(ids).not.toContain("facturacion-facturas");
    expect(ids).toContain("nav-agenda");
    expect(ids).toContain("mensajeria-qr");
  });

  it("da al admin su panel global y no la agenda del negocio", () => {
    const ids = buildCommandIndex({ role: "ADMIN", businessId: null }).map((e) => e.id);

    expect(ids).toContain("nav-admin");
    expect(ids).toContain("nav-sedes");
    expect(ids).not.toContain("nav-agenda");
  });

  it("resuelve el enlace de la página pública con el negocio actual", () => {
    const publica = jefe.find((entry) => entry.id === "negocio-pagina-publica");
    expect(publica?.href).toBe("/booking/biz-1");
  });

  it("omite la página pública si no hay negocio asociado", () => {
    const ids = buildCommandIndex({ role: "JEFE", businessId: null }).map((e) => e.id);
    expect(ids).not.toContain("negocio-pagina-publica");
  });

  it("en la demo efímera no ofrece nada de Ajustes, que está bloqueado", () => {
    const demo = buildCommandIndex({
      role: "JEFE",
      businessId: "biz-1",
      subscriptionStatus: "DEMO_SANDBOX",
    });
    const ids = demo.map((entry) => entry.id);

    expect(demo.every((entry) => !entry.href?.startsWith("/ajustes"))).toBe(true);
    expect(ids).toContain("nav-agenda");
    expect(ids).toContain("action-nueva-cita");
  });
});

describe("searchCommands", () => {
  it("sin consulta no devuelve resultados", () => {
    expect(searchCommands(jefe, "  ")).toEqual([]);
  });

  it("encuentra los ajustes de WhatsApp escribiendo 'wasap'", () => {
    expect(idsFor("wasap")).toContain("mensajeria-general");
  });

  it("encuentra el catálogo buscando 'precios', que no está en el título", () => {
    expect(idsFor("precios")[0]).toBe("negocio-servicios");
  });

  it("encuentra los horarios de apertura buscando 'cerrar'", () => {
    expect(idsFor("cerrar")).toContain("negocio-horarios");
  });

  it("lleva a la descarga de facturas buscando 'facturas'", () => {
    expect(idsFor("facturas")).toContain("facturacion-facturas");
  });

  it("encuentra el cambio de contraseña sin escribir la eñe ni el acento", () => {
    expect(idsFor("contrasena")).toContain("cuenta-password");
  });

  it("encuentra crear una cita con vocabulario coloquial", () => {
    expect(idsFor("dar hora")).toContain("action-nueva-cita");
    expect(idsFor("agendar")).toContain("action-nueva-cita");
  });

  it("prioriza la coincidencia exacta de título sobre las parciales", () => {
    expect(idsFor("clientes")[0]).toBe("nav-clientes");
  });

  it("estrecha el resultado al añadir palabras", () => {
    const soloWhatsapp = idsFor("whatsapp");
    const conPlantilla = idsFor("plantilla whatsapp");

    expect(conPlantilla.length).toBeLessThan(soloWhatsapp.length);
    expect(conPlantilla).toContain("mensajeria-plantillas");
  });

  it("deja lo que aún no existe por debajo de lo que ya funciona", () => {
    const ids = idsFor("informes");
    expect(ids).toContain("soon-reportes");

    const analitica = searchCommands(jefe, "metricas");
    const primero = analitica[0];
    expect(primero.entry.comingSoon).not.toBe(true);
  });

  it("no devuelve nada para una consulta sin sentido", () => {
    expect(searchCommands(jefe, "zzzzqqq")).toEqual([]);
  });
});

describe("groupResults", () => {
  it("agrupa por sección y respeta el orden del catálogo", () => {
    const grupos = groupResults(searchCommands(jefe, "cliente"));

    expect(grupos.length).toBeGreaterThan(0);
    expect(grupos[0].id).toBe("navegacion");
    expect(grupos.every((grupo) => grupo.results.length > 0)).toBe(true);
  });
});

describe("getFeaturedEntries", () => {
  it("propone accesos rápidos cuando el buscador está vacío", () => {
    const destacados = getFeaturedEntries(jefe).map((entry) => entry.id);

    expect(destacados).toContain("action-nueva-cita");
    expect(destacados.length).toBeGreaterThanOrEqual(4);
  });
});
