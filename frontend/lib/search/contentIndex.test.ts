import { beforeEach, describe, expect, it, vi } from "vitest";
import {
  fetchContentItems,
  groupContentResults,
  searchContent,
  type ContentItem,
} from "./contentIndex";
import { apiClient } from "@/lib/apiClient";

/** Devuelve una fecha ISO desplazada `days` días respecto a ahora. */
function isoInDays(days: number): string {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000).toISOString();
}

const clients = [
  { id: "c1", name: "María", surname: "López", email: "maria@mail.com", phone: "666111222" },
  { id: "c2", name: "Andrés", surname: "Gil", email: null, phone: "600999888", frequentService: "Tinte" },
];

const services = [
  { id: "s1", name: "Corte de caballero", duration: 30, price: "15.00", isActive: true },
  { id: "s2", name: "Mechas balayage", duration: 90, price: 75, description: "Con tratamiento" },
  { id: "s3", name: "Servicio retirado", duration: 30, price: 10, isActive: false },
];

const team = [
  { id: "u1", name: "Lucía Vera", email: "lucia@salon.com", role: "EMPLEADO" },
];

const appointments = [
  {
    id: "a1",
    clientName: "María López",
    clientPhone: "666111222",
    appointmentDate: isoInDays(3),
    service: { name: "Mechas balayage" },
  },
  {
    id: "a2",
    clientName: "Cita antigua",
    appointmentDate: isoInDays(-400),
    serviceName: "Corte",
  },
];

async function loadItems(canManageCatalog = true): Promise<ContentItem[]> {
  vi.spyOn(apiClient.clients, "getAll").mockResolvedValue({ data: clients, status: 200 } as never);
  vi.spyOn(apiClient.services, "getAll").mockResolvedValue({ data: services, status: 200 } as never);
  vi.spyOn(apiClient.team, "getAll").mockResolvedValue({ data: team, status: 200 } as never);
  vi.spyOn(apiClient.appointments, "getAll").mockResolvedValue({
    data: appointments,
    status: 200,
  } as never);

  return fetchContentItems({ businessId: "biz-1", canManageCatalog });
}

beforeEach(() => {
  vi.restoreAllMocks();
});

describe("fetchContentItems", () => {
  it("normaliza clientes, servicios, equipo y citas", async () => {
    const items = await loadItems();
    const kinds = new Set(items.map((item) => item.kind));

    expect(kinds).toEqual(new Set(["cliente", "servicio", "profesional", "cita"]));
  });

  it("compone el nombre completo del cliente y su enlace filtrado", async () => {
    const items = await loadItems();
    const maria = items.find((item) => item.id === "cliente-c1")!;

    expect(maria.title).toBe("María López");
    expect(maria.description).toContain("666111222");
    expect(maria.href).toBe(`/clientes?buscar=${encodeURIComponent("María López")}`);
  });

  it("muestra duración y precio del servicio", async () => {
    const items = await loadItems();
    const corte = items.find((item) => item.id === "servicio-s1")!;

    expect(corte.description).toBe("30 min · 15 €");
  });

  it("deja fuera los servicios desactivados", async () => {
    const items = await loadItems();
    expect(items.find((item) => item.id === "servicio-s3")).toBeUndefined();
  });

  it("lleva el servicio al catálogo solo si el usuario puede gestionarlo", async () => {
    const conCatalogo = await loadItems(true);
    expect(conCatalogo.find((i) => i.id === "servicio-s1")!.href).toBe("/ajustes?tab=gestion");

    const sinCatalogo = await loadItems(false);
    expect(sinCatalogo.find((i) => i.id === "servicio-s1")!.href).toBe("/agenda");
  });

  it("descarta las citas fuera de la ventana temporal", async () => {
    const items = await loadItems();

    expect(items.find((item) => item.id === "cita-a1")).toBeDefined();
    expect(items.find((item) => item.id === "cita-a2")).toBeUndefined();
  });

  it("enlaza la cita con el día de la agenda", async () => {
    const items = await loadItems();
    const cita = items.find((item) => item.id === "cita-a1")!;

    expect(cita.title).toBe("Cita de María López");
    expect(cita.href).toMatch(/^\/agenda\?fecha=\d{4}-\d{2}-\d{2}$/);
  });

  it("sigue devolviendo el resto si un listado falla", async () => {
    vi.spyOn(apiClient.clients, "getAll").mockRejectedValue(new Error("500"));
    vi.spyOn(apiClient.services, "getAll").mockResolvedValue({ data: services, status: 200 } as never);
    vi.spyOn(apiClient.team, "getAll").mockResolvedValue({ data: team, status: 200 } as never);
    vi.spyOn(apiClient.appointments, "getAll").mockResolvedValue({ data: [], status: 200 } as never);

    const items = await fetchContentItems({ businessId: "biz-1", canManageCatalog: true });

    expect(items.some((item) => item.kind === "cliente")).toBe(false);
    expect(items.some((item) => item.kind === "servicio")).toBe(true);
  });
});

describe("searchContent", () => {
  it("sin consulta no devuelve nada", async () => {
    expect(searchContent(await loadItems(), "  ")).toEqual([]);
  });

  it("encuentra al cliente por su nombre sin acentos", async () => {
    const ids = searchContent(await loadItems(), "maria").map((r) => r.item.id);
    expect(ids).toContain("cliente-c1");
  });

  it("encuentra al cliente por su teléfono", async () => {
    const ids = searchContent(await loadItems(), "600999888").map((r) => r.item.id);
    expect(ids).toContain("cliente-c2");
  });

  it("encuentra al cliente por su email", async () => {
    const ids = searchContent(await loadItems(), "maria@mail.com").map((r) => r.item.id);
    expect(ids).toContain("cliente-c1");
  });

  it("encuentra un servicio del catálogo", async () => {
    const ids = searchContent(await loadItems(), "balayage").map((r) => r.item.id);
    expect(ids).toContain("servicio-s2");
  });

  it("encuentra a un miembro del equipo", async () => {
    const ids = searchContent(await loadItems(), "lucia").map((r) => r.item.id);
    expect(ids).toContain("profesional-u1");
  });

  it("pone la ficha del cliente por delante de su cita", async () => {
    const results = searchContent(await loadItems(), "maria lopez");
    expect(results[0].item.kind).toBe("cliente");
    expect(results.map((r) => r.item.id)).toContain("cita-a1");
  });
});

describe("groupContentResults", () => {
  it("agrupa por tipo en el orden previsto", async () => {
    const grupos = groupContentResults(searchContent(await loadItems(), "maria"));
    expect(grupos.map((grupo) => grupo.kind)).toEqual(["cliente", "cita"]);
  });

  it("limita cuántos resultados aporta cada tipo", async () => {
    const muchos: ContentItem[] = Array.from({ length: 12 }, (_, i) => ({
      id: `cliente-${i}`,
      kind: "cliente" as const,
      title: `Ana Prueba ${i}`,
      description: "",
      keywords: [],
      href: "/clientes",
      icon: () => null,
    }));

    const grupos = groupContentResults(searchContent(muchos, "ana"));
    expect(grupos[0].results).toHaveLength(5);
  });
});
