import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { EventManager } from "../EventManager";

vi.mock("next-auth/react", () => ({
  useSession: () => ({
    data: { user: { id: "user-1", name: "Test", email: "t@volta.com", businessId: "biz-1" } },
    update: vi.fn(),
  }),
}));

// EventManager siempre abre por la fecha de hoy, así que las vistas se sitúan
// fijando el reloj en lugar de pasarle una fecha.
const WEDNESDAY = new Date(2026, 7, 26, 10, 0, 0, 0); // mié 26 ago 2026
const SUNDAY = new Date(2026, 7, 30, 10, 0, 0, 0); // dom 30 ago 2026

/** El negocio cierra los domingos, como se marcaría en Ajustes. */
const isSundayClosed = (date: Date) => date.getDay() === 0;

const renderView = (
  view: "month" | "week" | "day",
  today: Date,
  { closed = true }: { closed?: boolean } = {}
) => {
  vi.setSystemTime(today);
  const onOpenNewModal = vi.fn();
  const utils = render(
    <EventManager
      events={[]}
      defaultView={view}
      isDayClosed={closed ? isSundayClosed : undefined}
      onOpenNewModal={onOpenNewModal}
    />
  );
  return { ...utils, onOpenNewModal };
};

const slots = (container: HTMLElement, { closed }: { closed: boolean }) =>
  Array.from(
    container.querySelectorAll<HTMLElement>(
      closed ? "[data-day-slot][data-closed]" : "[data-day-slot]:not([data-closed])"
    )
  );

const monthCells = (container: HTMLElement, { closed }: { closed: boolean }) =>
  Array.from(
    container.querySelectorAll<HTMLElement>(
      closed ? "[data-day-cell][data-closed]" : "[data-day-cell]:not([data-closed])"
    )
  );

beforeEach(() => {
  vi.useFakeTimers({ shouldAdvanceTime: true });
});

afterEach(() => {
  vi.useRealTimers();
});

describe("Días cerrados en el calendario", () => {
  describe("vista semanal", () => {
    it("pinta en gris la columna del día cerrado y la marca deshabilitada", () => {
      const { container } = renderView("week", WEDNESDAY);

      const disabled = container.querySelectorAll('[aria-disabled="true"]');
      // De los siete días de la semana solo cierra el domingo.
      expect(disabled).toHaveLength(1);
      expect(disabled[0].className).toContain("bg-surface-container-high/40");
    });

    it("etiqueta como Cerrado el día en la cabecera", () => {
      renderView("week", WEDNESDAY);
      expect(screen.getAllByText("Cerrado").length).toBeGreaterThan(0);
    });

    it("no abre el modal de nueva cita al pulsar un hueco cerrado", () => {
      const { container, onOpenNewModal } = renderView("week", WEDNESDAY);

      const cerrados = slots(container, { closed: true });
      expect(cerrados.length).toBeGreaterThan(0);
      fireEvent.click(cerrados[0]);

      expect(onOpenNewModal).not.toHaveBeenCalled();
    });

    it("sigue permitiendo crear cita en un día abierto", () => {
      const { container, onOpenNewModal } = renderView("week", WEDNESDAY);

      fireEvent.click(slots(container, { closed: false })[0]);

      expect(onOpenNewModal).toHaveBeenCalledTimes(1);
    });
  });

  describe("vista diaria", () => {
    it("pinta el día entero en gris y avisa de que el negocio no abre", () => {
      const { container } = renderView("day", SUNDAY);

      expect(screen.getByText(/Cerrado — el negocio no abre este día/i)).toBeInTheDocument();
      expect(container.querySelector('[aria-disabled="true"]')).not.toBeNull();
      expect(slots(container, { closed: false })).toHaveLength(0);
    });

    it("no abre el modal al pulsar una franja horaria del día cerrado", () => {
      const { container, onOpenNewModal } = renderView("day", SUNDAY);

      fireEvent.click(slots(container, { closed: true })[0]);

      expect(onOpenNewModal).not.toHaveBeenCalled();
    });

    it("deja operativo un día abierto", () => {
      const { container, onOpenNewModal } = renderView("day", WEDNESDAY);

      expect(screen.queryByText(/el negocio no abre este día/i)).not.toBeInTheDocument();
      fireEvent.click(slots(container, { closed: false })[0]);

      expect(onOpenNewModal).toHaveBeenCalledTimes(1);
    });
  });

  describe("vista mensual", () => {
    it("pinta en gris todos los domingos de la rejilla", () => {
      const { container } = renderView("month", WEDNESDAY);

      // La rejilla siempre dibuja 42 celdas: seis semanas, seis domingos.
      expect(monthCells(container, { closed: true })).toHaveLength(6);
      expect(monthCells(container, { closed: false })).toHaveLength(36);
    });

    it("no abre el modal al pulsar una celda cerrada", () => {
      const { container, onOpenNewModal } = renderView("month", WEDNESDAY);

      fireEvent.click(monthCells(container, { closed: true })[0]);

      expect(onOpenNewModal).not.toHaveBeenCalled();
    });

    it("sigue permitiendo crear cita en una celda abierta", () => {
      const { container, onOpenNewModal } = renderView("month", WEDNESDAY);

      fireEvent.click(monthCells(container, { closed: false })[0]);

      expect(onOpenNewModal).toHaveBeenCalledTimes(1);
    });
  });

  it("no bloquea ningún día cuando no se pasa isDayClosed", () => {
    const { container, onOpenNewModal } = renderView("week", WEDNESDAY, { closed: false });

    expect(container.querySelectorAll('[aria-disabled="true"]')).toHaveLength(0);
    expect(slots(container, { closed: true })).toHaveLength(0);

    fireEvent.click(slots(container, { closed: false })[0]);
    expect(onOpenNewModal).toHaveBeenCalledTimes(1);
  });

  it("descarta el reagendado al arrastrar una cita a un día cerrado", () => {
    vi.setSystemTime(WEDNESDAY);
    const onEventUpdate = vi.fn();
    const evento = {
      id: "evt-1",
      title: "Juan Herrera - Corte",
      startTime: new Date(2026, 7, 26, 12, 0, 0, 0),
      endTime: new Date(2026, 7, 26, 12, 30, 0, 0),
      category: "Corte",
      color: "TEAL",
      tags: [] as string[],
    };

    const { container } = render(
      <EventManager
        events={[evento]}
        defaultView="week"
        isDayClosed={isSundayClosed}
        onEventUpdate={onEventUpdate}
      />
    );

    const card = screen.getAllByText(/Juan Herrera/i)[0];
    fireEvent.dragStart(card.closest('[draggable="true"]') ?? card);
    fireEvent.drop(slots(container, { closed: true })[0]);

    expect(onEventUpdate).not.toHaveBeenCalled();
  });

  it("permite reagendar arrastrando a un día abierto", () => {
    vi.setSystemTime(WEDNESDAY);
    const onEventUpdate = vi.fn();
    const evento = {
      id: "evt-1",
      title: "Juan Herrera - Corte",
      startTime: new Date(2026, 7, 26, 12, 0, 0, 0),
      endTime: new Date(2026, 7, 26, 12, 30, 0, 0),
      category: "Corte",
      color: "TEAL",
      tags: [] as string[],
    };

    const { container } = render(
      <EventManager
        events={[evento]}
        defaultView="week"
        isDayClosed={isSundayClosed}
        onEventUpdate={onEventUpdate}
      />
    );

    const card = screen.getAllByText(/Juan Herrera/i)[0];
    fireEvent.dragStart(card.closest('[draggable="true"]') ?? card);
    fireEvent.drop(slots(container, { closed: false })[0]);

    expect(onEventUpdate).toHaveBeenCalledTimes(1);
  });
});
