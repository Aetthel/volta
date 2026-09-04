import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { BusinessScheduleCard } from "./BusinessScheduleCard";

const getHours = vi.fn();
const getHolidays = vi.fn();
const updateHours = vi.fn();
const updateHolidays = vi.fn();

vi.mock("@/lib/apiClient", () => ({
  apiClient: {
    business: {
      getHours: (...args: unknown[]) => getHours(...args),
      getHolidays: (...args: unknown[]) => getHolidays(...args),
      updateHours: (...args: unknown[]) => updateHours(...args),
      updateHolidays: (...args: unknown[]) => updateHolidays(...args),
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
    render(<BusinessScheduleCard businessId="biz-1" />);

    expect(await screen.findByText("Horario de Apertura")).toBeInTheDocument();
    expect(screen.getByText("Festivos")).toBeInTheDocument();
  });

  it("coloca los dos paneles en columnas separadas", async () => {
    const { container } = render(<BusinessScheduleCard businessId="biz-1" />);

    expect(await screen.findByText("Horario de Apertura")).toBeInTheDocument();
    const grid = container.querySelector(".lg\\:grid-cols-2");
    expect(grid).not.toBeNull();
    // Un panel por columna
    expect(grid!.children).toHaveLength(2);
  });

  it("cada lado guarda por su cuenta de forma automática", async () => {
    updateHolidays.mockResolvedValue({ data: { catalogue: CATALOGUE } });
    updateHours.mockResolvedValue({ data: HOURS });

    render(<BusinessScheduleCard businessId="biz-1" />);

    expect(await screen.findByText("Horario de Apertura")).toBeInTheDocument();
    expect(screen.getByText("Festivos")).toBeInTheDocument();

    // Guardado de festivos al marcar checkbox
    const sanJuanCheckbox = screen.getByRole("checkbox", { name: /Cerrar por San Juan/i });
    fireEvent.click(sanJuanCheckbox);
    expect(updateHolidays).toHaveBeenCalledWith(
      "biz-1",
      expect.arrayContaining([
        expect.objectContaining({ holidayKey: "SAN_JUAN", isObserved: true }),
      ])
    );

    // Guardado de horario al cambiar estado de apertura
    const abrirButtons = screen.getAllByRole("button", { name: "Abrir" });
    fireEvent.click(abrirButtons[0]);
    expect(updateHours).toHaveBeenCalledWith(
      "biz-1",
      expect.arrayContaining([expect.objectContaining({ dayOfWeek: 0, isClosed: false })])
    );
  });

  it("muestra los días de la semana y los festivos agrupados por ámbito", async () => {
    render(<BusinessScheduleCard businessId="biz-1" />);

    expect(await screen.findByText("Lunes")).toBeInTheDocument();
    expect(screen.getByText("Domingo")).toBeInTheDocument();

    expect(screen.getByText("Nacionales")).toBeInTheDocument();
    expect(screen.getByText("Autonómicos")).toBeInTheDocument();
    expect(screen.getByText("Navidad")).toBeInTheDocument();
    expect(screen.getByText("San Juan")).toBeInTheDocument();
  });

  it("pide los datos de cada panel al negocio indicado", async () => {
    render(<BusinessScheduleCard businessId="biz-1" />);

    await waitFor(() => expect(getHours).toHaveBeenCalledWith("biz-1"));
    expect(getHolidays).toHaveBeenCalledWith("biz-1");
  });
});
