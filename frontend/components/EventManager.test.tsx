import { render, screen, fireEvent, within } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { EventManager } from "./EventManager";

vi.mock("next-auth/react", () => ({
  useSession: () => ({
    data: { user: { id: "user-1", name: "Test", email: "t@volta.com", businessId: "biz-1" } },
    update: vi.fn(),
  }),
}));

const START = new Date(2026, 7, 28, 12, 0, 0, 0); // vie 28 ago 2026, 12:00
const END = new Date(2026, 7, 28, 12, 30, 0, 0); // 30 min de duración

const baseEvent = {
  id: "evt-1",
  title: "Juan Herrera - Corte de Cabello",
  startTime: START,
  endTime: END,
  category: "Corte de Cabello",
  color: "TEAL",
  description: "Servicio: Corte de Cabello",
  tags: [] as string[],
};

/** Abre el modal de edición pulsando la tarjeta de la cita. */
const openEditModal = () => {
  const card = screen.getAllByText(/Juan Herrera/i)[0];
  fireEvent.click(card);
};

/**
 * El botón de fecha se nombra con `aria-labelledby` apuntando a su etiqueta y a
 * sí mismo, así que su nombre accesible es "Fecha <fecha elegida>".
 */
const dateTrigger = () => screen.getByRole("button", { name: /^Fecha/ });

const renderManager = (onEventUpdate = vi.fn()) => {
  const utils = render(
    <EventManager events={[baseEvent]} defaultView="week" onEventUpdate={onEventUpdate} />
  );
  return { ...utils, onEventUpdate };
};

const renderManagerWithDelete = (onEventDelete = vi.fn()) => {
  const utils = render(
    <EventManager events={[baseEvent]} defaultView="week" onEventDelete={onEventDelete} />
  );
  return { ...utils, onEventDelete };
};

const confirmDialog = () => screen.queryByRole("alertdialog");

describe("EventManager — campos Fecha y Hora del modal de cita", () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] });
    vi.setSystemTime(START);
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("replaces the start/end datetime inputs with a Fecha field and an Hora field", () => {
    renderManager();
    openEditModal();

    expect(dateTrigger()).toBeInTheDocument();
    expect(screen.getByLabelText("Hora")).toBeInTheDocument();
    expect(screen.getByLabelText("Minutos")).toBeInTheDocument();
    // Los campos antiguos ya no existen.
    expect(screen.queryByText("Hora Inicio")).not.toBeInTheDocument();
    expect(screen.queryByText("Hora Fin")).not.toBeInTheDocument();
  });

  it("shows the appointment date on the trigger and its time in the hour/minute boxes", () => {
    renderManager();
    openEditModal();

    expect(dateTrigger()).toHaveAccessibleName(/28 de agosto de 2026/i);
    expect(screen.getByLabelText("Hora")).toHaveValue("12");
    expect(screen.getByLabelText("Minutos")).toHaveValue("00");
  });

  it("lets the user type a new time with the keyboard", () => {
    renderManager();
    openEditModal();

    fireEvent.change(screen.getByLabelText("Hora"), { target: { value: "9" } });
    fireEvent.change(screen.getByLabelText("Minutos"), { target: { value: "45" } });

    // Mientras se teclea se respeta el borrador sin normalizar a "09".
    expect(screen.getByLabelText("Hora")).toHaveValue("9");

    fireEvent.blur(screen.getByLabelText("Hora"));
    fireEvent.blur(screen.getByLabelText("Minutos"));

    // Al salir, la fecha manda y se muestra ya con dos dígitos.
    expect(screen.getByLabelText("Hora")).toHaveValue("09");
    expect(screen.getByLabelText("Minutos")).toHaveValue("45");
  });

  it("clamps out-of-range hours and minutes instead of accepting them", () => {
    renderManager();
    openEditModal();

    fireEvent.change(screen.getByLabelText("Hora"), { target: { value: "99" } });
    expect(screen.getByLabelText("Hora")).toHaveValue("23");

    fireEvent.change(screen.getByLabelText("Minutos"), { target: { value: "77" } });
    expect(screen.getByLabelText("Minutos")).toHaveValue("59");
  });

  it("opens the shadcn calendar and changes only the date, keeping the time", () => {
    renderManager();
    openEditModal();

    fireEvent.click(dateTrigger());

    const popover = screen.getByRole("dialog", { name: "Seleccionar fecha" });
    const day10 = popover.querySelector<HTMLElement>('td[data-day="2026-08-10"] button');
    expect(day10).not.toBeNull();

    fireEvent.click(day10!);

    // La fecha cambia...
    expect(dateTrigger()).toHaveAccessibleName(/10 de agosto de 2026/i);
    // ...y la hora original se conserva.
    expect(screen.getByLabelText("Hora")).toHaveValue("12");
    expect(screen.getByLabelText("Minutos")).toHaveValue("00");
  });

  it("keeps the 30-minute duration when the start time changes", () => {
    const onEventUpdate = vi.fn();
    renderManager(onEventUpdate);
    openEditModal();

    fireEvent.change(screen.getByLabelText("Hora"), { target: { value: "16" } });
    fireEvent.blur(screen.getByLabelText("Hora"));

    fireEvent.click(screen.getByRole("button", { name: /Guardar Cambios/i }));

    expect(onEventUpdate).toHaveBeenCalled();
    const saved = onEventUpdate.mock.calls.at(-1)![1] as { startTime: Date; endTime: Date };
    expect(saved.startTime.getHours()).toBe(16);
    expect(saved.startTime.getMinutes()).toBe(0);
    // La duración original (30 min) se arrastra en vez de perderse.
    expect(saved.endTime.getTime() - saved.startTime.getTime()).toBe(30 * 60000);
    expect(saved.endTime.getHours()).toBe(16);
    expect(saved.endTime.getMinutes()).toBe(30);
  });

  it("does not delete on the first click: it asks for confirmation", () => {
    const { onEventDelete } = renderManagerWithDelete();
    openEditModal();

    expect(confirmDialog()).not.toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: /^Eliminar$/i }));

    expect(confirmDialog()).toBeInTheDocument();
    expect(screen.getByText(/no se puede deshacer/i)).toBeInTheDocument();
    // Lo importante: todavía no se ha borrado nada.
    expect(onEventDelete).not.toHaveBeenCalled();
  });

  it("names the appointment being deleted in the confirmation", () => {
    renderManagerWithDelete();
    openEditModal();
    fireEvent.click(screen.getByRole("button", { name: /^Eliminar$/i }));

    expect(
      within(confirmDialog()!).getByText(/Juan Herrera - Corte de Cabello/)
    ).toBeInTheDocument();
  });

  it("cancelling the confirmation keeps the appointment and reopens nothing", () => {
    const { onEventDelete } = renderManagerWithDelete();
    openEditModal();
    fireEvent.click(screen.getByRole("button", { name: /^Eliminar$/i }));

    fireEvent.click(within(confirmDialog()!).getByRole("button", { name: /Cancelar/i }));

    expect(confirmDialog()).not.toBeInTheDocument();
    expect(onEventDelete).not.toHaveBeenCalled();
    // El modal de edición sigue abierto detrás.
    expect(screen.getByRole("button", { name: /Guardar Cambios/i })).toBeInTheDocument();
  });

  it("dismisses the confirmation with Escape without deleting", () => {
    const { onEventDelete } = renderManagerWithDelete();
    openEditModal();
    fireEvent.click(screen.getByRole("button", { name: /^Eliminar$/i }));

    fireEvent.keyDown(document, { key: "Escape" });

    expect(confirmDialog()).not.toBeInTheDocument();
    expect(onEventDelete).not.toHaveBeenCalled();
  });

  it("deletes only after confirming", () => {
    const { onEventDelete } = renderManagerWithDelete();
    openEditModal();
    fireEvent.click(screen.getByRole("button", { name: /^Eliminar$/i }));

    fireEvent.click(within(confirmDialog()!).getByRole("button", { name: /Eliminar cita/i }));

    expect(onEventDelete).toHaveBeenCalledTimes(1);
    expect(onEventDelete).toHaveBeenCalledWith("evt-1");
    // Y se cierra todo.
    expect(confirmDialog()).not.toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Guardar Cambios/i })).not.toBeInTheDocument();
  });

  it("keeps the duration when the date changes too", () => {
    const onEventUpdate = vi.fn();
    renderManager(onEventUpdate);
    openEditModal();

    fireEvent.click(dateTrigger());
    const popover = screen.getByRole("dialog", { name: "Seleccionar fecha" });
    fireEvent.click(popover.querySelector<HTMLElement>('td[data-day="2026-08-10"] button')!);

    fireEvent.click(screen.getByRole("button", { name: /Guardar Cambios/i }));

    const saved = onEventUpdate.mock.calls.at(-1)![1] as { startTime: Date; endTime: Date };
    expect(saved.startTime.getDate()).toBe(10);
    expect(saved.startTime.getHours()).toBe(12);
    expect(saved.endTime.getDate()).toBe(10);
    expect(saved.endTime.getTime() - saved.startTime.getTime()).toBe(30 * 60000);
  });
});
