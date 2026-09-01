import { render, screen, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BusinessScheduleCard } from "./BusinessScheduleCard";

const getHours = vi.fn();
const getHolidays = vi.fn();

vi.mock("@/lib/apiClient", () => ({
  apiClient: {
    business: {
      getHours: (...args: unknown[]) => getHours(...args),
      getHolidays: (...args: unknown[]) => getHolidays(...args),
      updateHours: vi.fn(),
      updateHolidays: vi.fn(),
    },
  },
}));

const HOURS = [
  { dayOfWeek: 1, openTime: "09:00", closeTime: "20:00", isClosed: false },
  { dayOfWeek: 0, openTime: "09:00", closeTime: "20:00", isClosed: true },
];

const CATALOGUE = [
  {
    key: "NAVIDAD",
    name: "Navidad",
    scope: "NATIONAL" as const,
    note: null,
    date: "2026-12-25",
    isObserved: true,
    isDefault: true,
  },
  {
    key: "SAN_JUAN",
    name: "San Juan",
    scope: "REGIONAL" as const,
    note: "Cataluña, Comunidad Valenciana, Galicia y Baleares.",
    date: "2026-06-24",
    isObserved: false,
    isDefault: true,
  },
];

beforeEach(() => {
  vi.clearAllMocks();
  getHours.mockResolvedValue({ data: HOURS });
  getHolidays.mockResolvedValue({ data: { catalogue: CATALOGUE } });
});

describe("BusinessScheduleCard", () => {
  it("reúne horario y festivos en un solo contenedor", async () => {
    render(<BusinessScheduleCard businessId="biz-1" setToast={vi.fn()} />);

    expect(screen.getByText("Disponibilidad")).toBeInTheDocument();
    expect(await screen.findByText("Horario de Apertura")).toBeInTheDocument();
    expect(screen.getByText("Festivos")).toBeInTheDocument();
  });

  it("coloca los dos paneles en columnas separadas", async () => {
    const { container } = render(<BusinessScheduleCard businessId="biz-1" setToast={vi.fn()} />);

    const grid = container.querySelector(".lg\\:grid-cols-2");
    expect(grid).not.toBeNull();
    // Un panel por columna, cada uno con su propio formulario y su botón.
    expect(grid!.children).toHaveLength(2);
    await waitFor(() => expect(container.querySelectorAll("form")).toHaveLength(2));
  });

  it("cada lado guarda por su cuenta", async () => {
    render(<BusinessScheduleCard businessId="biz-1" setToast={vi.fn()} />);

    expect(await screen.findByRole("button", { name: /Guardar Horarios/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Guardar Festivos/i })).toBeInTheDocument();
  });

  it("muestra los días de la semana y los festivos agrupados por ámbito", async () => {
    render(<BusinessScheduleCard businessId="biz-1" setToast={vi.fn()} />);

    expect(await screen.findByText("Lunes")).toBeInTheDocument();
    expect(screen.getByText("Domingo")).toBeInTheDocument();

    expect(screen.getByText("Nacionales")).toBeInTheDocument();
    expect(screen.getByText("Autonómicos")).toBeInTheDocument();
    expect(screen.getByText("Navidad")).toBeInTheDocument();
    expect(screen.getByText("San Juan")).toBeInTheDocument();
  });

  it("pide los datos de cada panel al negocio indicado", async () => {
    render(<BusinessScheduleCard businessId="biz-1" setToast={vi.fn()} />);

    await waitFor(() => expect(getHours).toHaveBeenCalledWith("biz-1"));
    expect(getHolidays).toHaveBeenCalledWith("biz-1");
  });
});
