import { render, screen, fireEvent } from "@testing-library/react";
import { describe, it, expect, vi } from "vitest";
import { Calendar } from "./calendar";

/**
 * react-day-picker v10 marca cada celda con `data-day="YYYY-MM-DD"`, que es la
 * forma estable de localizar un día concreto: el nombre accesible del botón es
 * la fecha larga completa ("domingo, 15 de marzo de 2026"), no el número.
 */
const dayCell = (container: HTMLElement, isoDay: string) =>
  container.querySelector<HTMLTableCellElement>(`td[data-day="${isoDay}"]`);

const dayButton = (container: HTMLElement, isoDay: string) =>
  dayCell(container, isoDay)?.querySelector("button") ?? null;

const MARCH_2026 = new Date(2026, 2, 1);

describe("Calendar", () => {
  it("renders the month caption in Spanish", () => {
    render(<Calendar mode="single" defaultMonth={MARCH_2026} />);
    expect(screen.getByText(/marzo 2026/i)).toBeInTheDocument();
  });

  it("starts the week on Monday", () => {
    const { container } = render(<Calendar mode="single" defaultMonth={MARCH_2026} />);
    // La fila de cabeceras va con aria-hidden, así que se consulta por etiqueta.
    const weekdays = Array.from(container.querySelectorAll("thead th")).map((th) =>
      th.getAttribute("aria-label")
    );
    expect(weekdays[0]).toBe("lunes");
    expect(weekdays[6]).toBe("domingo");
  });

  it("marks the selected day and applies the primary token to it", () => {
    const { container } = render(
      <Calendar mode="single" selected={new Date(2026, 2, 15)} defaultMonth={MARCH_2026} />
    );

    const cell = dayCell(container, "2026-03-15");
    expect(cell).toHaveAttribute("aria-selected", "true");
    expect(cell?.className).toContain("[&>button]:bg-primary");
  });

  it("keeps the number readable when today is also the selected day", () => {
    // Regresión: a esa celda se le aplican `today` y `selected` a la vez. Si
    // `today` deja su `text-primary`, el número queda del mismo verde que el
    // fondo `bg-primary` y no se ve.
    const today = new Date();
    const { container } = render(
      <Calendar mode="single" selected={today} defaultMonth={today} />
    );

    const iso = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(
      today.getDate()
    ).padStart(2, "0")}`;
    const cell = dayCell(container, iso);

    expect(cell).toHaveAttribute("data-selected", "true");
    expect(cell).toHaveAttribute("data-today", "true");
    // El color de hoy queda condicionado a que NO esté seleccionado...
    expect(cell?.className).toContain("[&:not([data-selected=true])>button]:text-primary");
    // ...y el día seleccionado pinta el número con el token oscuro.
    expect(cell?.className).toContain("[&>button]:text-on-surface");
    expect(cell?.className).not.toContain("[&>button]:text-primary");
  });

  it("reports the clicked day to onSelect", () => {
    const onSelect = vi.fn();
    const { container } = render(
      <Calendar mode="single" defaultMonth={MARCH_2026} onSelect={onSelect} />
    );

    fireEvent.click(dayButton(container, "2026-03-20")!);

    expect(onSelect).toHaveBeenCalledTimes(1);
    const picked = onSelect.mock.calls[0][0] as Date;
    expect(picked.getFullYear()).toBe(2026);
    expect(picked.getMonth()).toBe(2);
    expect(picked.getDate()).toBe(20);
  });

  it("hands back a date that keeps its day when formatted with local getters", () => {
    // El modal guarda la fecha como "YYYY-MM-DD" local. Formatearla con
    // toISOString() restaría un día en husos positivos (España, UTC+1/+2);
    // este test fija el formateo local que evita ese desfase.
    const onSelect = vi.fn();
    const { container } = render(
      <Calendar mode="single" defaultMonth={MARCH_2026} onSelect={onSelect} />
    );

    fireEvent.click(dayButton(container, "2026-03-01")!);

    const picked = onSelect.mock.calls[0][0] as Date;
    const local = `${picked.getFullYear()}-${String(picked.getMonth() + 1).padStart(
      2,
      "0"
    )}-${String(picked.getDate()).padStart(2, "0")}`;
    expect(local).toBe("2026-03-01");
  });
});
